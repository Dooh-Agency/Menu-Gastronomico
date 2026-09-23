"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type AuthFormProps = { next: string };

export function AuthForm({ next }: AuthFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage(null);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const result = await response.json() as { message?: string; ok?: boolean };
      if (!response.ok || !result.ok) {
        setMessage(result.message ?? "No pudimos iniciar sesión.");
        return;
      }
      router.replace(next);
      router.refresh();
    } catch {
      setMessage("No se pudo conectar para iniciar sesión. Intentá nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function sendRecovery() {
    if (!email) {
      setMessage("Ingresá tu correo para recibir el enlace de acceso.");
      return;
    }
    setIsSubmitting(true);
    setMessage(null);
    try {
      const response = await fetch("/api/auth/recovery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const result = await response.json() as { message?: string };
      setMessage(result.message ?? "No fue posible procesar la solicitud.");
    } catch {
      setMessage("No se pudo conectar para enviar el correo. Intentá nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="auth-card" onSubmit={signIn}>
      <label>
        Correo
        <input autoComplete="email" onChange={(event) => setEmail(event.target.value)} required type="email" value={email} />
      </label>
      <label>
        Contraseña
        <span className="password-input-wrap">
          <input autoComplete="current-password" minLength={8} onChange={(event) => setPassword(event.target.value)} required type={isPasswordVisible ? "text" : "password"} value={password} />
          <button
            aria-label={isPasswordVisible ? "Ocultar contraseña" : "Mostrar contraseña"}
            aria-pressed={isPasswordVisible}
            className="password-visibility-toggle"
            onClick={() => setIsPasswordVisible((visible) => !visible)}
            type="button"
          >
            <svg aria-hidden="true" fill="none" height="18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24" width="18">
              {isPasswordVisible ? (
                <>
                  <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
                  <circle cx="12" cy="12" r="2.75" />
                </>
              ) : (
                <>
                  <path d="m3 3 18 18" />
                  <path d="M10.6 5.3A10.9 10.9 0 0 1 12 5.2c6.5 0 10 6.8 10 6.8a18.8 18.8 0 0 1-3.2 3.9M6.1 6.1A18.8 18.8 0 0 0 2 12s3.5 6.8 10 6.8c1.3 0 2.5-.3 3.5-.7" />
                  <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
                </>
              )}
            </svg>
          </button>
        </span>
      </label>
      {message ? <p className="form-message" role="status">{message}</p> : null}
      <button className="primary-link" disabled={isSubmitting} type="submit">Ingresar</button>
      <button className="text-button" disabled={isSubmitting} onClick={sendRecovery} type="button">Definir o restablecer contraseña</button>
    </form>
  );
}
