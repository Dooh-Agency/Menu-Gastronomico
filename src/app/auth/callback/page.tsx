"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

function safeNext(value: string | null) {
  return value?.startsWith("/") ? value : "/admin";
}

export default function AuthCallbackPage() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function establishRecoverySession() {
      const supabase = createSupabaseBrowserClient();
      const locationUrl = new URL(window.location.href);
      const code = locationUrl.searchParams.get("code");
      const tokenHash = locationUrl.searchParams.get("token_hash");
      const type = locationUrl.searchParams.get("type");
      const hashParams = new URLSearchParams(locationUrl.hash.slice(1));
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");

      let error: Error | null = null;
      if (accessToken && refreshToken) {
        ({ error } = await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken }));
      } else if (code) {
        ({ error } = await supabase.auth.exchangeCodeForSession(code));
      } else if (tokenHash && type === "recovery") {
        ({ error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: "recovery" }));
      } else {
        const { data } = await supabase.auth.getSession();
        if (!data.session) error = new Error("No encontramos una sesión de recuperación en este enlace.");
      }

      if (error) {
        setErrorMessage("El enlace no es válido o ya venció. Solicitá uno nuevo desde el acceso.");
        return;
      }
      router.replace(safeNext(locationUrl.searchParams.get("next")));
      router.refresh();
    }

    void establishRecoverySession();
  }, [router]);

  return (
    <main className="auth-shell">
      <p className="eyebrow">Administración</p>
      <h1>Preparando tu acceso</h1>
      <p>{errorMessage ?? "Estamos validando el enlace de recuperación."}</p>
    </main>
  );
}
