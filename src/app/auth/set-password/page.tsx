import { SetPasswordForm } from "@/components/set-password-form";

export default function SetPasswordPage() {
  return (
    <main className="auth-shell">
      <p className="eyebrow">Administración</p>
      <h1>Definí tu contraseña</h1>
      <p>Elegí una contraseña segura de al menos ocho caracteres.</p>
      <SetPasswordForm />
    </main>
  );
}
