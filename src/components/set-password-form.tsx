"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function SetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function savePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    const { error } = await createSupabaseBrowserClient().auth.updateUser({ password });
    if (error) {
      setMessage("El enlace no es válido o venció. Solicitá uno nuevo desde el acceso.");
      setIsSubmitting(false);
      return;
    }
    router.push("/admin");
  }

  return (
    <form className="auth-card" onSubmit={savePassword}>
      <label>
        Nueva contraseña
        <input autoComplete="new-password" minLength={8} onChange={(event) => setPassword(event.target.value)} required type="password" value={password} />
      </label>
      {message ? <p className="form-message" role="status">{message}</p> : null}
      <button className="primary-link" disabled={isSubmitting} type="submit">Guardar contraseña</button>
    </form>
  );
}
