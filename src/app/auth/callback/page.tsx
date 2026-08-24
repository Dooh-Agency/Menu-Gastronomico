"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

function safeNext(value: string | null) {
  return value?.startsWith("/") ? value : "/admin";
}

export default function AuthCallbackPage() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function establishRecoverySession() {
      const locationUrl = new URL(window.location.href);
      const tokenHash = locationUrl.searchParams.get("token_hash");
      const type = locationUrl.searchParams.get("type");
      const hashParams = new URLSearchParams(locationUrl.hash.slice(1));
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");
      try {
        const response = await fetch("/api/auth/callback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accessToken, refreshToken, tokenHash, type }),
        });
        const result = await response.json() as { message?: string; ok?: boolean };
        if (!response.ok || !result.ok) {
          setErrorMessage(result.message ?? "El enlace no es válido o ya venció. Solicitá uno nuevo desde el acceso.");
          return;
        }
        router.replace(safeNext(locationUrl.searchParams.get("next")));
        router.refresh();
      } catch {
        setErrorMessage("No se pudo validar el enlace. Intentá nuevamente.");
      }
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
