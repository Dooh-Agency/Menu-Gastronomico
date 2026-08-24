import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

type CallbackBody = {
  accessToken?: string;
  refreshToken?: string;
  tokenHash?: string;
  type?: string;
};

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({} as CallbackBody));
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return NextResponse.json({ message: "El acceso no está configurado." }, { status: 503 });

  const response = NextResponse.json({ ok: true });
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
    global: {
      fetch: (input, init) => fetch(input, { ...init, signal: AbortSignal.timeout(12_000) }),
    },
  });

  try {
    const result = body.accessToken && body.refreshToken
      ? await supabase.auth.setSession({ access_token: body.accessToken, refresh_token: body.refreshToken })
      : body.tokenHash && body.type === "recovery"
        ? await supabase.auth.verifyOtp({ token_hash: body.tokenHash, type: "recovery" })
        : { error: new Error("No encontramos un token de recuperación válido.") };
    if (result.error) return NextResponse.json({ message: "El enlace no es válido o ya venció." }, { status: 401 });
    return response;
  } catch {
    return NextResponse.json(
      { message: "Supabase demoró demasiado en responder. Intentá nuevamente." },
      { status: 504 },
    );
  }
}
