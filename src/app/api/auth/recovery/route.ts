import { createClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  const { email } = await request.json().catch(() => ({ email: "" }));
  if (typeof email !== "string" || !emailPattern.test(email)) {
    return NextResponse.json({ message: "Ingresá un correo válido." }, { status: 400 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    return NextResponse.json({ message: "El acceso no está configurado." }, { status: 503 });
  }

  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => fetch(input, { ...init, signal: AbortSignal.timeout(12_000) }),
    },
  });
  const callbackUrl = new URL("/auth/callback?next=/auth/set-password", request.url).toString();

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: callbackUrl });
    if (error) return NextResponse.json({ message: error.message }, { status: 400 });
    return NextResponse.json({ message: "Solicitud enviada. Revisá Spam y Promociones; puede demorar unos minutos." });
  } catch {
    return NextResponse.json(
      { message: "Supabase demoró demasiado en responder. Esperá un minuto y reintentá." },
      { status: 504 },
    );
  }
}
