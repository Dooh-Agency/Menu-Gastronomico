import Link from "next/link";

export default function HomePage() {
  return (
    <main className="foundation-shell product-home">
      <section aria-labelledby="product-home-title" className="product-home-intro">
        <p className="eyebrow product-home-eyebrow">Plataforma gastronómica</p>
        <h1 id="product-home-title">Menú digital para locales gastronómicos</h1>
        <p className="product-home-description">
          Consultá el menú público, con disponibilidad y franjas horarias propias de cada restaurante.
        </p>
        <div className="home-actions">
          <Link className="primary-link product-home-primary-link" href="/demo">Abrir menú demo</Link>
          <Link className="secondary-link product-home-secondary-link" href="/login">Administrar menú</Link>
        </div>
      </section>
    </main>
  );
}
