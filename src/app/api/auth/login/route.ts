import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({ email: "", password: "" }));
  if (typeof body.email !== "string" || !emailPattern.test(body.email) || typeof body.password !== "string" || body.password.length < 8) {
    return NextResponse.json({ message: "Revisá el correo y la contraseña." }, { status: 400 });
  }

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
    const { error } = await supabase.auth.signInWithPassword({ email: body.email, password: body.password });
    if (error) return NextResponse.json({ message: "Correo o contraseña incorrectos." }, { status: 401 });
    return response;
  } catch {
    return NextResponse.json(
      { message: "Supabase demoró demasiado en responder. Intentá nuevamente." },
      { status: 504 },
    );
  }
}
