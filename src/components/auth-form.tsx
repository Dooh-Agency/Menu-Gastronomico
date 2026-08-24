"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type AuthFormProps = { next: string };

export function AuthForm({ next }: AuthFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
        <input autoComplete="current-password" minLength={8} onChange={(event) => setPassword(event.target.value)} required type="password" value={password} />
      </label>
      {message ? <p className="form-message" role="status">{message}</p> : null}
      <button className="primary-link" disabled={isSubmitting} type="submit">Ingresar</button>
      <button className="text-button" disabled={isSubmitting} onClick={sendRecovery} type="button">Definir o restablecer contraseña</button>
    </form>
  );
}
