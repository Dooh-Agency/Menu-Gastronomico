"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function SetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function savePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage(null);
    try {
      const response = await fetch("/api/auth/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const result = await response.json() as { message?: string; ok?: boolean };
      if (!response.ok || !result.ok) {
        setMessage(result.message ?? "No fue posible guardar la contraseña.");
        return;
      }
      router.replace("/admin");
      router.refresh();
    } catch {
      setMessage("No se pudo conectar para guardar la contraseña. Intentá nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
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
