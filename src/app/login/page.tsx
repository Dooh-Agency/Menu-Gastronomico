import { AuthForm } from "@/components/auth-form";

type LoginPageProps = { searchParams: Promise<{ next?: string }> };

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { next } = await searchParams;
  const safeNext = next?.startsWith("/") ? next : "/admin";
  return (
    <main className="auth-shell">
      <p className="eyebrow">Administración</p>
      <h1>Ingresar al menú</h1>
      <p>Acceso exclusivo para las personas administradoras del restaurante.</p>
      <AuthForm next={safeNext} />
    </main>
  );
}
