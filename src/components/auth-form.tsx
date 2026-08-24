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
    const { error } = await createSupabaseBrowserClient().auth.signInWithPassword({ email, password });
    if (error) {
      setMessage("No pudimos iniciar sesión. Revisá el correo y la contraseña.");
      setIsSubmitting(false);
      return;
    }
    router.push(next);
  }

  async function sendRecovery() {
    if (!email) {
      setMessage("Ingresá tu correo para recibir el enlace de acceso.");
      return;
    }
    setIsSubmitting(true);
    const origin = window.location.origin;
    const { error } = await createSupabaseBrowserClient().auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/auth/callback?next=/auth/set-password`,
    });
    setMessage(
      error
        ? `No fue posible enviar el correo: ${error.message}`
        : "Solicitud enviada. Revisá también Spam y Promociones; puede demorar unos minutos.",
    );
    setIsSubmitting(false);
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
