import Link from "next/link";

export default function HomePage() {
  return (
    <main className="foundation-shell">
      <p className="eyebrow">Plataforma gastronómica</p>
      <h1>Menús digitales para cada restaurante</h1>
      <p>
        Consultá el menú público, con disponibilidad y franjas horarias propias de cada restaurante.
      </p>
      <div className="home-actions">
        <Link className="primary-link" href="/demo">Abrir menú Demo</Link>
        <Link className="secondary-link" href="/login">Administrar menú</Link>
      </div>
    </main>
  );
}
