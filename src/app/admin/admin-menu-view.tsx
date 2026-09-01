"use client";

import { type CSSProperties, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { AdminDialog } from "./admin-dialog";
import { createCategory, updateCoverImage } from "./actions";
import { LocalizationFields } from "./localization-fields";
import { brandingFor, menuImageUrl, restaurantFonts } from "@/lib/restaurant-branding";

type Daypart = {
  id: string;
  name: string;
  starts_at: string;
  ends_at: string;
  sort_order: number;
};

type Category = {
  id: string;
  name: string;
  description: string | null;
  sort_order: number;
  is_active: boolean;
  menu_category_dayparts?: Array<{ daypart_id: string }>;
  menu_category_translations?: Array<{ locale: string; name: string; description: string | null }>;
};

type RestaurantData = {
  id: string;
  name: string;
  slug: string;
  timezone: string;
  supported_locales: string[];
  default_locale: string;
  branding: Record<string, unknown>;
};

type SettingsData = {
  unavailable_item_behavior: "hide" | "show_sold_out";
  uses_dayparts: boolean;
};

type AdminMenuViewProps = {
  restaurant: RestaurantData;
  settings: SettingsData;
  dayparts: Daypart[];
  categories: Category[];
  dietaryTags?: string[];
};

export function AdminMenuView({
  restaurant,
  settings,
  dayparts,
  categories,
  dietaryTags = ["Sin TACC / Celíaco", "Vegano", "Vegetariano", "Sin lactosa"],
}: AdminMenuViewProps) {
  const [selectedDaypartId, setSelectedDaypartId] = useState<string>(dayparts[0]?.id ?? "");
  const [selectedLocale, setSelectedLocale] = useState<string>(restaurant.default_locale || "es");
  const [selectedDietary, setSelectedDietary] = useState<string>("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(categories[0]?.id ?? null);

  const [isBannerDialogOpen, setIsBannerDialogOpen] = useState(false);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const branding = brandingFor(restaurant.branding);
  const brandStyle = {
    "--color-accent": branding.primary_color,
    "--color-secondary": branding.secondary_color,
    "--color-paper": branding.surface_color,
    "--color-ink": branding.text_color,
    "--color-link": branding.accent_text_color,
    "--menu-font": restaurantFonts[branding.font_family ?? "inter"].cssFamily,
    "--radius-card": branding.radius === "soft" ? ".65rem" : branding.radius === "square" ? ".15rem" : "1rem",
  } as CSSProperties;

  // Filter categories by selected daypart if dayparts are enabled
  const visibleCategories = categories.filter((category) => {
    if (!settings.uses_dayparts || !selectedDaypartId) return true;
    const daypartIds = category.menu_category_dayparts?.map((d) => d.daypart_id) ?? [];
    return daypartIds.length === 0 || daypartIds.includes(selectedDaypartId);
  });

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setBannerPreview(url);
    } else {
      setBannerPreview(null);
    }
  }

  function handleBannerSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      await updateCoverImage(formData);
      setIsBannerDialogOpen(false);
      setBannerPreview(null);
    });
  }

  function handleRemoveBanner() {
    if (!confirm("¿Deseas quitar la imagen de portada?")) return;
    const formData = new FormData();
    formData.set("remove", "true");
    startTransition(async () => {
      await updateCoverImage(formData);
    });
  }

  return (
    <div className="admin-menu-view" style={brandStyle}>
      {/* 1. Header de la carta */}
      <header className="admin-menu-header">
        <div className="admin-menu-brand">
          {branding.logo_path ? (
            <Image
              alt=""
              className="brand-logo"
              height={48}
              src={menuImageUrl(branding.logo_path)}
              width={48}
            />
          ) : (
            <span className="brand-mark" aria-hidden="true" />
          )}
          <span className="admin-menu-title">{restaurant.name}</span>
        </div>
        <div className="admin-menu-header-actions">
          <Link
            className="secondary-link admin-preview-link"
            href={`/${restaurant.slug}`}
            rel="noreferrer"
            target="_blank"
          >
            <span className="material-symbols-outlined" aria-hidden="true">visibility</span>
            Ver menú comensal
          </Link>
        </div>
      </header>

      {/* 2. Banner / Portada */}
      <section className="admin-menu-cover-section" aria-label="Banner de portada">
        {branding.cover_image_path ? (
          <div className="admin-menu-cover">
            <Image
              alt="Banner de portada"
              className="admin-menu-cover-image"
              fill
              priority
              sizes="(max-width: 72rem) 100vw, 72rem"
              src={menuImageUrl(branding.cover_image_path)}
            />
            <div className="admin-cover-overlay">
              <button
                className="admin-cover-action-btn"
                onClick={() => {
                  setBannerPreview(null);
                  setIsBannerDialogOpen(true);
                }}
                type="button"
              >
                <span className="material-symbols-outlined" aria-hidden="true">photo_camera</span>
                Cambiar banner
              </button>
              <button
                className="admin-cover-action-btn btn-danger"
                disabled={isPending}
                onClick={handleRemoveBanner}
                title="Quitar banner"
                type="button"
              >
                <span className="material-symbols-outlined" aria-hidden="true">delete</span>
                Quitar
              </button>
            </div>
          </div>
        ) : (
          <button
            className="admin-cover-placeholder"
            onClick={() => {
              setBannerPreview(null);
              setIsBannerDialogOpen(true);
            }}
            type="button"
          >
            <div className="admin-cover-placeholder-content">
              <span className="material-symbols-outlined placeholder-icon" aria-hidden="true">
                add_photo_alternate
              </span>
              <strong>Agregar banner de portada</strong>
              <p>Hacé clic para cargar una foto de cabecera (Recomendado: 1200 × 400 px, máx 5 MB)</p>
            </div>
          </button>
        )}
      </section>

      {/* 3. Controles: Menú (Cartas), Preferencias e Idioma */}
      <section className="admin-menu-controls" aria-label="Controles del menú">
        {/* Selector de Carta / Turno */}
        <label className="admin-menu-control">
          <span>Menú / Carta</span>
          {settings.uses_dayparts && dayparts.length > 0 ? (
            <select
              aria-label="Seleccionar carta"
              onChange={(e) => setSelectedDaypartId(e.target.value)}
              value={selectedDaypartId}
            >
              {dayparts.map((dp) => (
                <option key={dp.id} value={dp.id}>
                  {dp.name} ({dp.starts_at.slice(0, 5)} - {dp.ends_at.slice(0, 5)})
                </option>
              ))}
            </select>
          ) : (
            <select aria-label="Carta única" disabled value="default">
              <option value="default">Carta principal (Todo el día)</option>
            </select>
          )}
        </label>

        {/* Selector de Preferencias / Filtros */}
        <label className="admin-menu-control">
          <span>Preferencias</span>
          <select
            aria-label="Filtrar por preferencia"
            onChange={(e) => setSelectedDietary(e.target.value)}
            value={selectedDietary}
          >
            <option value="">Todo el menú</option>
            {dietaryTags.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
        </label>

        {/* Selector de Idioma */}
        <label className="admin-menu-control admin-menu-control-lang">
          <span>Idioma</span>
          <select
            aria-label="Seleccionar idioma"
            onChange={(e) => setSelectedLocale(e.target.value)}
            value={selectedLocale}
          >
            {restaurant.supported_locales.map((loc) => (
              <option key={loc} value={loc}>
                {loc.toUpperCase()}
              </option>
            ))}
          </select>
        </label>
      </section>

      {/* 4. Sección de Categorías */}
      <section className="admin-category-section" aria-label="Categorías del menú">
        <div className="admin-category-header">
          <div className="admin-category-tabs">
            {visibleCategories.length > 0 ? (
              visibleCategories.map((category) => {
                const isActive = selectedCategoryId === category.id;
                const translation = category.menu_category_translations?.find(
                  (t) => t.locale === selectedLocale
                );
                const displayName = (selectedLocale !== "es" && translation?.name) || category.name;

                return (
                  <button
                    aria-selected={isActive}
                    className={`admin-category-tab ${isActive ? "is-active" : ""}`}
                    key={category.id}
                    onClick={() => setSelectedCategoryId(category.id)}
                    role="tab"
                    type="button"
                  >
                    {displayName}
                    {!category.is_active ? <span className="tab-paused-dot" title="Categoría pausada" /> : null}
                  </button>
                );
              })
            ) : (
              <span className="admin-no-categories-text">Aún no hay categorías creadas.</span>
            )}
          </div>

          <button
            className="admin-add-category-btn"
            onClick={() => setIsCategoryDialogOpen(true)}
            type="button"
          >
            <span className="material-symbols-outlined" aria-hidden="true">add</span>
            Nueva categoría
          </button>
        </div>
      </section>

      {/* 5. Placeholder para los Platos (Siguiente paso) */}
      <section className="admin-menu-body-placeholder">
        <div className="placeholder-card">
          <span className="material-symbols-outlined placeholder-card-icon" aria-hidden="true">
            restaurant_menu
          </span>
          <h3>Header y Categorías configurados</h3>
          <p>
            Esta es la vista base de tu carta digital. En el próximo paso integraremos los platos correspondientes a
            cada categoría con acciones rápidas de disponibilidad, precios y edición.
          </p>
        </div>
      </section>

      {/* Modal: Cargar / Cambiar Banner */}
      {isBannerDialogOpen ? (
        <AdminDialog onClose={() => setIsBannerDialogOpen(false)}>
          <form className="admin-modal-form" onSubmit={handleBannerSubmit}>
            <div>
              <p className="eyebrow">Personalización</p>
              <h2>{branding.cover_image_path ? "Cambiar banner de portada" : "Cargar banner de portada"}</h2>
              <p>Seleccioná una imagen en formato JPG, PNG o WebP de hasta 5 MB.</p>
            </div>

            {bannerPreview ? (
              <div className="banner-preview-box">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img alt="Vista previa del banner" className="banner-preview-img" src={bannerPreview} />
              </div>
            ) : branding.cover_image_path ? (
              <div className="banner-preview-box">
                <Image
                  alt="Banner actual"
                  className="banner-preview-img"
                  height={140}
                  src={menuImageUrl(branding.cover_image_path)}
                  width={420}
                />
              </div>
            ) : null}

            <label>
              Seleccionar archivo de imagen
              <input
                accept="image/jpeg,image/png,image/webp"
                autoFocus
                name="cover_image"
                onChange={handleFileChange}
                required
                type="file"
              />
            </label>

            <div className="admin-modal-actions">
              <button
                className="secondary-link"
                disabled={isPending}
                onClick={() => {
                  setIsBannerDialogOpen(false);
                  setBannerPreview(null);
                }}
                type="button"
              >
                Cancelar
              </button>
              <button className="primary-link" disabled={isPending} type="submit">
                {isPending ? "Guardando..." : "Guardar banner"}
              </button>
            </div>
          </form>
        </AdminDialog>
      ) : null}

      {/* Modal: Crear Nueva Categoría */}
      {isCategoryDialogOpen ? (
        <AdminDialog onClose={() => setIsCategoryDialogOpen(false)}>
          <form
            action={async (formData) => {
              await createCategory(formData);
              setIsCategoryDialogOpen(false);
            }}
            className="admin-modal-form"
          >
            <div>
              <p className="eyebrow">Menú</p>
              <h2>Nueva categoría</h2>
              <p>Creá una sección para organizar los platos de tu carta.</p>
            </div>

            <label>
              Nombre de la categoría
              <input autoFocus name="name" placeholder="Ej: Entradas, Principales, Bebidas..." required />
            </label>

            <label>
              Descripción <span className="field-optional">Opcional</span>
              <input name="description" placeholder="Breve detalle de la categoría..." />
            </label>

            {dayparts.length > 0 ? (
              <fieldset className="daypart-fields">
                <legend>Cartas donde se muestra</legend>
                <p>Si no seleccionás ninguna, se mostrará en todas las cartas.</p>
                {dayparts.map((daypart) => (
                  <label className="checkbox-label" key={daypart.id}>
                    <input name="daypart_ids" type="checkbox" value={daypart.id} />
                    {daypart.name}
                  </label>
                ))}
              </fieldset>
            ) : null}

            <LocalizationFields locales={restaurant.supported_locales} translations={[]} />

            <div className="admin-modal-actions">
              <button
                className="secondary-link"
                onClick={() => setIsCategoryDialogOpen(false)}
                type="button"
              >
                Cancelar
              </button>
              <button className="primary-link" type="submit">
                Crear categoría
              </button>
            </div>
          </form>
        </AdminDialog>
      ) : null}
    </div>
  );
}
