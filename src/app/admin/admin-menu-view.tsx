"use client";

import { type CSSProperties, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { AdminDialog } from "./admin-dialog";
import {
  createCategory,
  createMenuItem,
  deleteMenuItem,
  toggleMenuItemAvailability,
  updateCoverImage,
  updateMenuItem,
} from "./actions";
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

type MenuItem = {
  id: string;
  category_id: string;
  name: string;
  description: string | null;
  price_cents: number;
  currency_code: string;
  image_path: string | null;
  dietary_tags: string[];
  allergens: string[];
  is_available: boolean;
  sort_order: number;
  menu_item_translations?: Array<{ locale: string; name: string; description: string | null }>;
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
  items: MenuItem[];
};

function formatPrice(cents: number, currency: string, locale: string) {
  return new Intl.NumberFormat(locale.startsWith("en") ? "en-US" : "es-AR", {
    style: "currency",
    currency: currency || "ARS",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export function AdminMenuView({
  restaurant,
  settings,
  dayparts,
  categories,
  items,
}: AdminMenuViewProps) {
  const [selectedDaypartId, setSelectedDaypartId] = useState<string>(dayparts[0]?.id ?? "");
  const [selectedLocale, setSelectedLocale] = useState<string>(restaurant.default_locale || "es");
  const [selectedDietary, setSelectedDietary] = useState<string>("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");

  // Modals state
  const [isBannerDialogOpen, setIsBannerDialogOpen] = useState(false);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [createItemForCategoryId, setCreateItemForCategoryId] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [itemImagePreview, setItemImagePreview] = useState<string | null>(null);

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

  // Extract all dietary tags
  const allDietaryTags = Array.from(
    new Set(["Sin TACC / Celíaco", "Vegano", "Vegetariano", "Sin lactosa", ...items.flatMap((i) => i.dietary_tags)])
  ).filter(Boolean);

  // Filter categories by selected daypart if dayparts are enabled
  const visibleCategories = categories.filter((category) => {
    if (!settings.uses_dayparts || !selectedDaypartId) return true;
    const daypartIds = category.menu_category_dayparts?.map((d) => d.daypart_id) ?? [];
    return daypartIds.length === 0 || daypartIds.includes(selectedDaypartId);
  });

  // Filter categories to display based on selectedCategoryId
  const displayCategories =
    selectedCategoryId === "all"
      ? visibleCategories
      : visibleCategories.filter((c) => c.id === selectedCategoryId);

  const activeCategoryForNewItem = categories.find((c) => c.id === createItemForCategoryId);

  function handleBannerFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) setBannerPreview(URL.createObjectURL(file));
    else setBannerPreview(null);
  }

  function handleItemImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) setItemImagePreview(URL.createObjectURL(file));
    else setItemImagePreview(null);
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

  function handleToggleAvailability(item: MenuItem) {
    const formData = new FormData();
    formData.set("item_id", item.id);
    formData.set("is_available", String(item.is_available));
    startTransition(async () => {
      await toggleMenuItemAvailability(formData);
    });
  }

  function handleDeleteItem(item: MenuItem) {
    if (!confirm(`¿Eliminar el plato "${item.name}"?`)) return;
    const formData = new FormData();
    formData.set("item_id", item.id);
    startTransition(async () => {
      await deleteMenuItem(formData);
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
            <svg
              aria-hidden="true"
              fill="none"
              height="16"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              width="16"
            >
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
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
                <svg
                  aria-hidden="true"
                  fill="none"
                  height="15"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  width="15"
                >
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
                Cambiar banner
              </button>
              <button
                className="admin-cover-action-btn btn-danger"
                disabled={isPending}
                onClick={handleRemoveBanner}
                title="Quitar banner"
                type="button"
              >
                <svg
                  aria-hidden="true"
                  fill="none"
                  height="15"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  width="15"
                >
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
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
              <div className="admin-cover-placeholder-plus" aria-hidden="true">
                <svg
                  fill="none"
                  height="22"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  viewBox="0 0 24 24"
                  width="22"
                >
                  <line x1="12" x2="12" y1="5" y2="19" />
                  <line x1="5" x2="19" y1="12" y2="12" />
                </svg>
              </div>
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
            {allDietaryTags.map((tag) => (
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

      {/* 4. Sección de Categorías con botón circular + y botón Todo a la derecha */}
      <section className="admin-category-section" aria-label="Categorías del menú">
        <div className="admin-category-header">
          <div className="admin-category-tabs" role="tablist">
            {visibleCategories.map((category) => {
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
            })}

            {/* Botón circular con bordes alternados y + para agregar categorías */}
            <button
              aria-label="Agregar nueva categoría"
              className="admin-add-category-circle-btn"
              onClick={() => setIsCategoryDialogOpen(true)}
              title="Agregar nueva categoría"
              type="button"
            >
              <svg
                aria-hidden="true"
                fill="none"
                height="18"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
                width="18"
              >
                <line x1="12" x2="12" y1="5" y2="19" />
                <line x1="5" x2="19" y1="12" y2="12" />
              </svg>
            </button>

            {/* Botón Todo a la derecha para ver/scrollear por todas las categorías */}
            <button
              aria-selected={selectedCategoryId === "all"}
              className={`admin-category-tab admin-tab-all ${selectedCategoryId === "all" ? "is-active" : ""}`}
              onClick={() => setSelectedCategoryId("all")}
              role="tab"
              type="button"
            >
              Todo
            </button>
          </div>
        </div>
      </section>

      {/* 5. Secciones de Categorías con Grilla de Platos y Tarjeta Punteada para Agregar Plato */}
      <section className="admin-menu-content-area" aria-label="Platos por categoría">
        {displayCategories.length > 0 ? (
          displayCategories.map((category) => {
            const translation = category.menu_category_translations?.find(
              (t) => t.locale === selectedLocale
            );
            const displayName = (selectedLocale !== "es" && translation?.name) || category.name;
            const categoryDescription =
              (selectedLocale !== "es" && translation?.description) || category.description;

            // Dishes in this category (filtered by dietary if selected)
            const categoryItems = items.filter((item) => {
              const matchesCategory = item.category_id === category.id;
              const matchesDietary = !selectedDietary || item.dietary_tags.includes(selectedDietary);
              return matchesCategory && matchesDietary;
            });

            return (
              <section
                className="admin-category-block"
                id={`cat-${category.id}`}
                key={category.id}
              >
                <div className="admin-category-block-header">
                  <div>
                    <h2 className="admin-category-block-title">{displayName}</h2>
                    {categoryDescription ? (
                      <p className="admin-category-block-desc">{categoryDescription}</p>
                    ) : null}
                  </div>
                  <span className="admin-category-count-badge">
                    {categoryItems.length} {categoryItems.length === 1 ? "plato" : "platos"}
                  </span>
                </div>

                <div className="admin-dish-grid">
                  {/* Platos existentes en esta categoría */}
                  {categoryItems.map((item) => {
                    const itemTranslation = item.menu_item_translations?.find(
                      (t) => t.locale === selectedLocale
                    );
                    const itemDisplayName =
                      (selectedLocale !== "es" && itemTranslation?.name) || item.name;
                    const itemDisplayDesc =
                      (selectedLocale !== "es" && itemTranslation?.description) || item.description;

                    return (
                      <article
                        className={`admin-dish-card ${!item.is_available ? "is-unavailable" : ""}`}
                        key={item.id}
                      >
                        {item.image_path ? (
                          <div className="admin-dish-image-wrap">
                            <Image
                              alt=""
                              className="admin-dish-image"
                              height={360}
                              sizes="(max-width: 34rem) 100vw, 25vw"
                              src={menuImageUrl(item.image_path)}
                              width={640}
                            />
                          </div>
                        ) : null}

                        <div className="admin-dish-card-body">
                          <div className="admin-dish-card-header">
                            <h3 className="admin-dish-name">{itemDisplayName}</h3>
                            <strong className="admin-dish-price">
                              {formatPrice(item.price_cents, item.currency_code, selectedLocale)}
                            </strong>
                          </div>

                          {itemDisplayDesc ? (
                            <p className="admin-dish-desc">{itemDisplayDesc}</p>
                          ) : null}

                          {item.dietary_tags.length > 0 ? (
                            <ul className="admin-dish-tags">
                              {item.dietary_tags.map((tag) => (
                                <li key={tag}>{tag}</li>
                              ))}
                            </ul>
                          ) : null}

                          <div className="admin-dish-card-footer">
                            <button
                              className={`admin-availability-btn ${
                                item.is_available ? "is-available" : "is-sold-out"
                              }`}
                              disabled={isPending}
                              onClick={() => handleToggleAvailability(item)}
                              title={item.is_available ? "Marcar como agotado" : "Marcar como disponible"}
                              type="button"
                            >
                              <span className="status-dot" aria-hidden="true" />
                              {item.is_available ? "Disponible" : "Agotado"}
                            </button>

                            <div className="admin-dish-actions">
                              <button
                                aria-label={`Editar ${item.name}`}
                                className="icon-button"
                                onClick={() => {
                                  setItemImagePreview(null);
                                  setEditingItem(item);
                                }}
                                title="Editar plato"
                                type="button"
                              >
                                <svg
                                  fill="none"
                                  height="15"
                                  stroke="currentColor"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  viewBox="0 0 24 24"
                                  width="15"
                                >
                                  <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                                </svg>
                              </button>
                              <button
                                aria-label={`Eliminar ${item.name}`}
                                className="icon-button icon-button-danger"
                                disabled={isPending}
                                onClick={() => handleDeleteItem(item)}
                                title="Eliminar plato"
                                type="button"
                              >
                                <svg
                                  fill="none"
                                  height="15"
                                  stroke="currentColor"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  viewBox="0 0 24 24"
                                  width="15"
                                >
                                  <polyline points="3 6 5 6 21 6" />
                                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      </article>
                    );
                  })}

                  {/* Cuadrado con borde alternado (dashed) y + en el medio para agregar plato en esta categoría */}
                  <button
                    className="admin-add-item-card"
                    onClick={() => {
                      setItemImagePreview(null);
                      setCreateItemForCategoryId(category.id);
                    }}
                    type="button"
                  >
                    <div className="admin-add-item-plus-circle" aria-hidden="true">
                      <svg
                        fill="none"
                        height="24"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2.5"
                        viewBox="0 0 24 24"
                        width="24"
                      >
                        <line x1="12" x2="12" y1="5" y2="19" />
                        <line x1="5" x2="19" y1="12" y2="12" />
                      </svg>
                    </div>
                    <strong>Agregar plato</strong>
                    <span>en {displayName}</span>
                  </button>
                </div>
              </section>
            );
          })
        ) : (
          <div className="admin-empty-categories-card">
            <div className="placeholder-card-icon" aria-hidden="true">
              <svg
                fill="none"
                height="40"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.75"
                viewBox="0 0 24 24"
                width="40"
              >
                <path d="M18 2v6a3 3 0 0 1-3 3 3 3 0 0 1-3-3V2" />
                <path d="M15 2v18" />
                <path d="M6 2v6a3 3 0 0 0 3 3 3 3 0 0 0 3-3V2" />
                <path d="M9 2v18" />
              </svg>
            </div>
            <h3>Tu menú aún no tiene categorías</h3>
            <p>Hacé clic en el botón circular (+) de arriba para crear tu primera sección (ej: Entradas, Principales, Postres).</p>
            <button
              className="primary-link"
              onClick={() => setIsCategoryDialogOpen(true)}
              type="button"
            >
              + Crear primera categoría
            </button>
          </div>
        )}
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
                onChange={handleBannerFileChange}
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
              <input autoFocus name="name" placeholder="Ej: Entradas, Principales, Postres, Bebidas..." required />
            </label>

            <label>
              Descripción <span className="field-optional">Opcional</span>
              <input name="description" placeholder="Breve detalle de la sección..." />
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

      {/* Modal: Crear Nuevo Plato (directo en la categoría seleccionada) */}
      {createItemForCategoryId ? (
        <AdminDialog onClose={() => setCreateItemForCategoryId(null)}>
          <form
            action={async (formData) => {
              await createMenuItem(formData);
              setCreateItemForCategoryId(null);
            }}
            className="admin-modal-form"
          >
            <input name="category_id" type="hidden" value={createItemForCategoryId} />
            <div>
              <p className="eyebrow">
                {activeCategoryForNewItem ? `Categoría: ${activeCategoryForNewItem.name}` : "Menú"}
              </p>
              <h2>Agregar nuevo plato</h2>
              <p>
                Este plato se agregará automáticamente en la categoría{" "}
                <strong>{activeCategoryForNewItem?.name}</strong>.
              </p>
            </div>

            <label>
              Nombre del plato
              <input autoFocus name="name" placeholder="Ej: Hamburguesa Clásica, Ravioles..." required />
            </label>

            <label>
              Descripción <span className="field-optional">Opcional</span>
              <input name="description" placeholder="Ingredientes, preparación o detalles..." />
            </label>

            <div className="admin-modal-grid">
              <label>
                Precio (ARS)
                <input min="0" name="price" placeholder="Ej: 4500" required step=".01" type="number" />
              </label>

              <label className="checkbox-label" style={{ alignSelf: "center", marginTop: "1.25rem" }}>
                <input defaultChecked name="is_available" type="checkbox" />
                Disponible para comensales
              </label>
            </div>

            {itemImagePreview ? (
              <div className="banner-preview-box">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img alt="Vista previa del plato" className="banner-preview-img" src={itemImagePreview} />
              </div>
            ) : null}

            <label>
              Imagen del plato <span className="field-optional">JPG, PNG o WebP; máx 5 MB</span>
              <input
                accept="image/jpeg,image/png,image/webp"
                name="image"
                onChange={handleItemImageChange}
                type="file"
              />
            </label>

            <div className="admin-modal-grid">
              <label>
                Etiquetas dietéticas <span className="field-optional">Separadas por comas</span>
                <input name="dietary_tags" placeholder="Vegano, Sin TACC, Casero" />
              </label>

              <label>
                Alérgenos <span className="field-optional">Separados por comas</span>
                <input name="allergens" placeholder="Gluten, Lácteos, Maní" />
              </label>
            </div>

            <LocalizationFields locales={restaurant.supported_locales} translations={[]} />

            <div className="admin-modal-actions">
              <button
                className="secondary-link"
                onClick={() => setCreateItemForCategoryId(null)}
                type="button"
              >
                Cancelar
              </button>
              <button className="primary-link" type="submit">
                Crear y agregar plato
              </button>
            </div>
          </form>
        </AdminDialog>
      ) : null}

      {/* Modal: Editar Plato Existente */}
      {editingItem ? (
        <AdminDialog onClose={() => setEditingItem(null)}>
          <form
            action={async (formData) => {
              await updateMenuItem(formData);
              setEditingItem(null);
            }}
            className="admin-modal-form"
          >
            <input name="item_id" type="hidden" value={editingItem.id} />
            <input name="sort_order" type="hidden" value={editingItem.sort_order} />

            <div>
              <p className="eyebrow">Editar plato</p>
              <h2>{editingItem.name}</h2>
              <p>Modificá los datos del plato para actualizarlo en el menú público.</p>
            </div>

            <label>
              Nombre del plato
              <input autoFocus defaultValue={editingItem.name} name="name" required />
            </label>

            <label>
              Descripción <span className="field-optional">Opcional</span>
              <input defaultValue={editingItem.description ?? ""} name="description" />
            </label>

            <div className="admin-modal-grid">
              <label>
                Precio (ARS)
                <input
                  defaultValue={(editingItem.price_cents / 100).toFixed(2)}
                  min="0"
                  name="price"
                  required
                  step=".01"
                  type="number"
                />
              </label>

              <label>
                Categoría
                <select defaultValue={editingItem.category_id} name="category_id">
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {itemImagePreview ? (
              <div className="banner-preview-box">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img alt="Vista previa del plato" className="banner-preview-img" src={itemImagePreview} />
              </div>
            ) : editingItem.image_path ? (
              <div className="banner-preview-box">
                <Image
                  alt=""
                  className="banner-preview-img"
                  height={140}
                  src={menuImageUrl(editingItem.image_path)}
                  width={320}
                />
              </div>
            ) : null}

            <label>
              Reemplazar imagen <span className="field-optional">JPG, PNG o WebP; máx 5 MB</span>
              <input
                accept="image/jpeg,image/png,image/webp"
                name="image"
                onChange={handleItemImageChange}
                type="file"
              />
            </label>

            <div className="admin-modal-grid">
              <label>
                Etiquetas dietéticas <span className="field-optional">Separadas por comas</span>
                <input defaultValue={editingItem.dietary_tags.join(", ")} name="dietary_tags" />
              </label>

              <label>
                Alérgenos <span className="field-optional">Separados por comas</span>
                <input defaultValue={editingItem.allergens.join(", ")} name="allergens" />
              </label>
            </div>

            <LocalizationFields
              locales={restaurant.supported_locales}
              translations={editingItem.menu_item_translations ?? []}
            />

            <label className="checkbox-label">
              <input defaultChecked={editingItem.is_available} name="is_available" type="checkbox" />
              Disponible para comensales
            </label>

            <div className="admin-modal-actions">
              <button
                className="secondary-link"
                onClick={() => setEditingItem(null)}
                type="button"
              >
                Cancelar
              </button>
              <button className="primary-link" type="submit">
                Guardar cambios
              </button>
            </div>
          </form>
        </AdminDialog>
      ) : null}
    </div>
  );
}
