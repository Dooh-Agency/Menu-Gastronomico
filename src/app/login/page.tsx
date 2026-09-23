import { AuthForm } from "@/components/auth-form";

type LoginPageProps = { searchParams: Promise<{ next?: string }> };

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { next } = await searchParams;
  const safeNext = next?.startsWith("/") ? next : "/admin";
  return (
    <main className="auth-shell">
      <section aria-labelledby="login-title" className="auth-intro">
        <p className="eyebrow auth-eyebrow">Administración</p>
        <h1 id="login-title">Administrá tu carta digital</h1>
        <p className="auth-description">Gestioná platos, horarios y diseño desde un solo lugar.</p>
        <AuthForm next={safeNext} />
      </section>
    </main>
  );
}
