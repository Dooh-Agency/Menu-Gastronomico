"use client";

export type CardLayoutType = "rectangle" | "hero" | "carousel";

interface CardLayoutSelectorProps {
  value: CardLayoutType;
  onChange: (layout: CardLayoutType) => void;
  name?: string;
}

export function CardLayoutSelector({
  value,
  onChange,
  name = "card_layout",
}: CardLayoutSelectorProps) {
  const options: Array<{
    id: CardLayoutType;
    title: string;
    badge: string;
    description: string;
    preview: React.ReactNode;
  }> = [
    {
      id: "rectangle",
      title: "Rectángulo clásico",
      badge: "Estándar",
      description: "Lista vertical con fotos a la derecha. Ideal para cartas extensas y muchos platos.",
      preview: (
        <div className="mockup-rect-card">
          <div className="mockup-lines">
            <div className="mockup-line title" />
            <div className="mockup-line" style={{ width: "90%" }} />
            <div className="mockup-line price" />
          </div>
          <div className="mockup-rect-img" />
        </div>
      ),
    },
    {
      id: "hero",
      title: "Cuadrado grande",
      badge: "Plato del día",
      description: "Tarjeta amplia con foto protagonista. Ideal para destacar especialidades y platos estrella.",
      preview: (
        <div className="mockup-hero-card">
          <div className="mockup-hero-img" />
          <div className="mockup-hero-footer">
            <div className="mockup-line title" style={{ width: "55%" }} />
            <div className="mockup-line price" style={{ width: "30%" }} />
          </div>
        </div>
      ),
    },
    {
      id: "carousel",
      title: "Scroll horizontal",
      badge: "Compacto",
      description: "Fila deslizable de tarjetas cuadradas. Ideal para categorías breves, postres o entradas.",
      preview: (
        <div className="mockup-carousel-row">
          <div className="mockup-compact-card">
            <div className="mockup-compact-img" />
            <div className="mockup-line title" style={{ width: "80%" }} />
          </div>
          <div className="mockup-compact-card">
            <div className="mockup-compact-img" />
            <div className="mockup-line title" style={{ width: "80%" }} />
          </div>
          <div className="mockup-compact-card">
            <div className="mockup-compact-img" />
            <div className="mockup-line title" style={{ width: "80%" }} />
          </div>
          <div aria-hidden="true" className="mockup-carousel-arrow">
            →
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="card-layout-wizard-step">
      <input name={name} type="hidden" value={value} />
      <div
        aria-label="Seleccionar formato de tarjetas para esta categoría"
        className="card-layout-options-grid"
        role="radiogroup"
      >
        {options.map((opt) => {
          const isSelected = value === opt.id;
          return (
            <div
              aria-checked={isSelected}
              className={`card-layout-option-card ${isSelected ? "is-selected" : ""}`}
              key={opt.id}
              onClick={() => onChange(opt.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onChange(opt.id);
                }
              }}
              role="radio"
              tabIndex={0}
            >
              <div className="card-layout-preview-box">{opt.preview}</div>

              <div className="card-layout-option-info">
                <div className="card-layout-option-title-row">
                  <h4 className="card-layout-option-title">{opt.title}</h4>
                  <span className="card-layout-badge">{opt.badge}</span>
                </div>
                <p className="card-layout-option-desc">{opt.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
