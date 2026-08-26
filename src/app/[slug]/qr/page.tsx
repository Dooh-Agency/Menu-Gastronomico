import { notFound } from "next/navigation";
import { getPublicMenu } from "@/lib/supabase/public-menu";

type PageProps = { params: Promise<{ slug: string }> };

export default async function QrPage({ params }: PageProps) {
  const { slug } = await params;
  const menu = await getPublicMenu(slug);
  if (!menu) notFound();

  return (
    <main className="qr-page">
      <p className="eyebrow">Menú digital</p>
      <h1>{menu.restaurant.name}</h1>
      <div aria-label={`Código QR simulado para ${menu.restaurant.name}`} className="qr-simulation" role="img" />
      <p>Esta vista representa el código QR que se colocaría en una mesa. En la demo, el acceso al menú se realiza desde el enlace siguiente.</p>
      <a className="primary-link" href={`/${menu.restaurant.slug}`}>Abrir menú</a>
    </main>
  );
}
