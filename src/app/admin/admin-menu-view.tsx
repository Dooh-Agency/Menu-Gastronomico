"use client";

import { type CSSProperties, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AdminDialog } from "./admin-dialog";
import { MenusDashboard } from "./menus-dashboard";
import {
  EditMenuDialog,
  MenuBannerDialog,
  MenuSchedulesDialog,
} from "./menu-dialogs";
import {
  createCategory,
  createMenuItem,
  deleteCategory,
  deleteMenuItem,
  toggleMenuItemAvailability,
  updateCategory,
  updateLogoImage,
  updateMenuBanner,
  updateMenuItem,
} from "./actions";
import { LocalizationFields } from "./localization-fields";
import { brandingFor, menuImageUrl, restaurantFonts } from "@/lib/restaurant-branding";
import { DishImageCarousel } from "@/components/dish-image-carousel";
import type { Category, Daypart, Menu, MenuItem, RestaurantData, SettingsData } from "./types";

type AdminMenuViewProps = {
  restaurant: RestaurantData;
  settings: SettingsData;
  dayparts: Daypart[];
  categories: Category[];
  items: MenuItem[];
  menus: Menu[];
};

function formatPrice(cents: number, currency: string, locale: string) {
  return new Intl.NumberFormat(locale.startsWith("en") ? "en-US" : "es-AR", {
    style: "currency",
    currency: currency || "ARS",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function getScheduleSummaryText(menu: Menu) {
  if (!menu.schedules || menu.schedules.length === 0) {
    return "Disponible todo el día";
  }
  if (menu.schedules.length === 1) {
    const s = menu.schedules[0];
    const start = s.starts_at.slice(0, 5);
    const end = s.ends_at.slice(0, 5);
    if (start === "00:00" && (end === "23:59" || end === "00:00")) {
      return "Disponible todo el día";
    }
    const daysLabel =
      s.day_of_week === null
        ? "Todos los días"
        : s.day_of_week === 1
        ? "Lunes"
        : s.day_of_week === 2
        ? "Martes"
        : s.day_of_week === 3
        ? "Miércoles"
        : s.day_of_week === 4
        ? "Jueves"
        : s.day_of_week === 5
        ? "Viernes"
        : s.day_of_week === 6
        ? "Sábado"
        : "Domingo";
    return `${daysLabel} (${start} - ${end})`;
  }
  return `${menu.schedules.length} franjas configuradas`;
}

export function AdminMenuView({
  restaurant,
  settings,
  dayparts,
  categories,
  items,
  menus,
}: AdminMenuViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Navigation state: null = Cartas Dashboard; string = Editing specific menu
  const menuParam = searchParams.get("menu");
  const selectedMenuId = menuParam && menus.some((m) => m.id === menuParam) ? menuParam : null;

  function setSelectedMenuId(menuId: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (menuId) {
      params.set("menu", menuId);
    } else {
      params.delete("menu");
    }
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  const [selectedDaypartId, setSelectedDaypartId] = useState<string>(dayparts[0]?.id ?? "");
  const [selectedLocale, setSelectedLocale] = useState<string>(restaurant.default_locale || "es");
  const [selectedDietary, setSelectedDietary] = useState<string>("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");

  // Dialogs state
  const [isLogoDialogOpen, setIsLogoDialogOpen] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const [isMenuBannerDialogOpen, setIsMenuBannerDialogOpen] = useState(false);
  const [isMenuEditDialogOpen, setIsMenuEditDialogOpen] = useState(false);
  const [isMenuSchedulesDialogOpen, setIsMenuSchedulesDialogOpen] = useState(false);

  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [createItemForCategoryId, setCreateItemForCategoryId] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [itemImagePreview, setItemImagePreview] = useState<string | null>(null);
  const [previewItem, setPreviewItem] = useState<MenuItem | null>(null);

  const [isPending, startTransition] = useTransition();

  // If no menu is currently selected, show the MenusDashboard
  if (!selectedMenuId) {
    return (
      <MenusDashboard
        categories={categories}
        items={items}
        menus={menus}
        onSelectMenu={(menuId) => {
          setSelectedMenuId(menuId);
          setSelectedCategoryId("all");
        }}
        restaurant={restaurant}
      />
    );
  }

  const currentMenu =
    menus.find((m) => m.id === selectedMenuId) ||
    menus[0] || {
      id: "default",
      restaurant_id: restaurant.id,
      name: "Carta Principal",
      description: null,
      banner_path: null,
      is_active: true,
      sort_order: 0,
      schedules: [],
    };

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

  // Categories belonging to the active menu
  const menuCategories = categories.filter((c) => c.menu_id === currentMenu.id);
  const visibleCategories = menuCategories;

  // Filter categories to display based on selectedCategoryId
  const displayCategories =
    selectedCategoryId === "all"
      ? visibleCategories
      : visibleCategories.filter((c) => c.id === selectedCategoryId);

  const activeCategoryForNewItem = categories.find((c) => c.id === createItemForCategoryId);

  // Active banner: menu specific banner or fallback to restaurant cover image
  const activeBannerPath = currentMenu.banner_path || branding.cover_image_path;

  function handleLogoFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) setLogoPreview(URL.createObjectURL(file));
    else setLogoPreview(null);
  }

  function handleItemImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) setItemImagePreview(URL.createObjectURL(file));
    else setItemImagePreview(null);
  }

  function handleLogoSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      await updateLogoImage(formData);
      setIsLogoDialogOpen(false);
      setLogoPreview(null);
    });
  }

  function handleRemoveLogo() {
    if (!confirm("¿Deseas quitar la foto de perfil / logo?")) return;
    const formData = new FormData();
    formData.set("remove", "true");
    startTransition(async () => {
      await updateLogoImage(formData);
      setIsLogoDialogOpen(false);
      setLogoPreview(null);
    });
  }

  function handleRemoveMenuBanner() {
    if (!confirm(`¿Deseas quitar la foto de portada de la carta "${currentMenu.name}"?`)) return;
    const formData = new FormData();
    formData.set("menu_id", currentMenu.id);
    formData.set("remove", "true");
    startTransition(async () => {
      await updateMenuBanner(formData);
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

  function handleDeleteCategory(category: Category) {
    const count = items.filter((i) => i.category_id === category.id).length;
    const warningText =
      count > 0
        ? `¿Eliminar la categoría "${category.name}"? Contiene ${count} plato${count === 1 ? "" : "s"} que también se eliminarán.`
        : `¿Eliminar la categoría "${category.name}"?`;
    if (!confirm(warningText)) return;
    const formData = new FormData();
    formData.set("category_id", category.id);
    startTransition(async () => {
      await deleteCategory(formData);
      if (selectedCategoryId === category.id) {
        setSelectedCategoryId("all");
      }
    });
  }

  return (
    <div className="admin-menu-editor-layout">
      {/* Lienzo de la Carta */}
      <div className="admin-menu-view" style={brandStyle}>
        {/* 1. Header general del restaurante */}
        <header className="admin-menu-header">
          <div className="admin-menu-brand">
            {branding.logo_path ? (
              <button
                className="admin-logo-avatar-btn"
                onClick={() => {
                  setLogoPreview(null);
                  setIsLogoDialogOpen(true);
                }}
                title="Cambiar foto de perfil / logo"
                type="button"
              >
                <Image
                  alt=""
                  className="brand-logo"
                  height={52}
                  src={menuImageUrl(branding.logo_path)}
                  width={52}
                />
                <span className="avatar-edit-badge" aria-hidden="true">
                  <svg
                    fill="none"
                    height="12"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    width="12"
                  >
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                </span>
              </button>
            ) : (
              <button
                className="admin-logo-placeholder-btn"
                onClick={() => {
                  setLogoPreview(null);
                  setIsLogoDialogOpen(true);
                }}
                title="Agregar foto de perfil / logo"
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

        {/* 2. Banner de la Carta Activa */}
        <section className="admin-menu-cover-section" aria-label="Banner de portada de la carta">
          {activeBannerPath ? (
            <div className="admin-menu-cover">
              <Image
                alt={`Banner de ${currentMenu.name}`}
                className="admin-menu-cover-image"
                fill
                priority
                sizes="(max-width: 72rem) 100vw, 72rem"
                src={menuImageUrl(activeBannerPath)}
              />
              <div className="admin-cover-overlay">
                <button
                  className="admin-cover-action-btn"
                  onClick={() => setIsMenuBannerDialogOpen(true)}
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
                  Cambiar banner de la carta
                </button>
                {currentMenu.banner_path && (
                  <button
                    className="admin-cover-action-btn btn-danger"
                    disabled={isPending}
                    onClick={handleRemoveMenuBanner}
                    title="Quitar banner de la carta"
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
                )}
              </div>
            </div>
          ) : (
            <button
              className="admin-cover-placeholder"
              onClick={() => setIsMenuBannerDialogOpen(true)}
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
                <strong>Agregar banner para &quot;{currentMenu.name}&quot;</strong>
                <p>Hacé clic para cargar una foto de cabecera propia para esta carta (1200 × 400 px)</p>
              </div>
            </button>
          )}
        </section>

        {/* 3. Datos de la Carta (Nombre, Descripción, Botón Editar) */}
        <section className="admin-active-menu-info">
          <div className="admin-active-menu-meta">
            <div className="admin-active-menu-header-row">
              <h1 className="admin-active-menu-title">{currentMenu.name}</h1>
              {!currentMenu.is_active && (
                <span className="status-badge is-inactive">Carta Oculta / Inactiva</span>
              )}
              <button
                className="admin-menu-edit-btn"
                onClick={() => setIsMenuEditDialogOpen(true)}
                title="Editar nombre y descripción de la carta"
                type="button"
              >
                <svg
                  aria-hidden="true"
                  fill="none"
                  height="14"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  width="14"
                >
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
                Editar carta
              </button>
            </div>
            {currentMenu.description && (
              <p className="admin-active-menu-description">{currentMenu.description}</p>
            )}
          </div>
        </section>

        {/* 4. Controles: Horarios Disponibles de la Carta, Preferencias e Idioma */}
        <section className="admin-menu-controls" aria-label="Controles del menú">
          {/* Horarios disponibles de la carta */}
          <div className="admin-menu-control admin-schedule-control">
            <span>Horarios disponibles</span>
            <button
              className="admin-schedule-trigger-btn"
              onClick={() => setIsMenuSchedulesDialogOpen(true)}
              title="Configurar días y horarios de esta carta"
              type="button"
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
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <span className="admin-schedule-summary-text">
                {getScheduleSummaryText(currentMenu)}
              </span>
              <span className="admin-schedule-edit-badge">Modificar</span>
            </button>
          </div>

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

        {/* 5. Sección de Categorías de la Carta */}
        <section className="admin-category-section" aria-label="Categorías del menú">
          <div className="admin-category-header">
            <div className="admin-category-tabs" role="tablist">
              {/* Botón Todos */}
              <button
                aria-selected={selectedCategoryId === "all"}
                className={`admin-category-tab admin-tab-all ${selectedCategoryId === "all" ? "is-active" : ""}`}
                onClick={() => setSelectedCategoryId("all")}
                role="tab"
                type="button"
              >
                Todos
              </button>

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

              {/* Botón circular + para agregar categorías */}
              <button
                aria-label="Agregar nueva categoría a esta carta"
                className="admin-add-category-circle-btn"
                onClick={() => setIsCategoryDialogOpen(true)}
                title="Agregar nueva categoría a esta carta"
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
            </div>
          </div>
        </section>

        {/* 6. Grilla de Platos y Categorías de la Carta */}
        <section className="admin-menu-content-area" aria-label="Platos por categoría">
          {displayCategories.length > 0 ? (
            displayCategories.map((category) => {
              const translation = category.menu_category_translations?.find(
                (t) => t.locale === selectedLocale
              );
              const displayName = (selectedLocale !== "es" && translation?.name) || category.name;
              const categoryDescription =
                (selectedLocale !== "es" && translation?.description) || category.description;

              // Dishes in this category
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
                    <div className="admin-category-block-title-group">
                      <div className="admin-category-title-row">
                        <h2 className="admin-category-block-title">{displayName}</h2>
                        {!category.is_active ? (
                          <span className="status-badge is-inactive">Pausada</span>
                        ) : null}
                        <span className="admin-category-count-badge">
                          {categoryItems.length} {categoryItems.length === 1 ? "plato" : "platos"}
                        </span>
                      </div>
                      {categoryDescription ? (
                        <p className="admin-category-block-desc">{categoryDescription}</p>
                      ) : null}
                    </div>

                    <div className="admin-category-actions">
                      <button
                        aria-label={`Editar categoría ${category.name}`}
                        className="icon-button"
                        onClick={() => setEditingCategory(category)}
                        title="Editar categoría"
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
                        aria-label={`Eliminar categoría ${category.name}`}
                        className="icon-button icon-button-danger"
                        disabled={isPending}
                        onClick={() => handleDeleteCategory(category)}
                        title="Eliminar categoría"
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

                  <div className="admin-dish-grid">
                    {/* Platos existentes */}
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
                          aria-label={`Editar plato ${itemDisplayName}`}
                          className={`menu-card admin-dish-card${item.is_available ? "" : " is-unavailable"}`}
                          key={item.id}
                          onClick={() => {
                            setItemImagePreview(null);
                            setEditingItem(item);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              setItemImagePreview(null);
                              setEditingItem(item);
                            }
                          }}
                          role="button"
                          tabIndex={0}
                        >
                          {item.image_path ? (
                            <Image
                              alt=""
                              className="menu-image"
                              height={720}
                              sizes="(max-width: 34rem) 100vw, 33vw"
                              src={menuImageUrl(item.image_path)}
                              width={1280}
                            />
                          ) : null}

                          <div className="menu-card-content">
                            <div className="menu-card-heading">
                              <h3>{itemDisplayName}</h3>
                              <strong>
                                {formatPrice(item.price_cents, item.currency_code, selectedLocale)}
                              </strong>
                            </div>

                            {itemDisplayDesc ? (
                              <p>{itemDisplayDesc}</p>
                            ) : null}

                            {/* Tags dietéticos */}
                            {item.dietary_tags.length > 0 ? (
                              <ul className="tag-list" aria-label="Etiquetas dietéticas">
                                {item.dietary_tags.map((tag) => (
                                  <li key={tag}>{tag}</li>
                                ))}
                              </ul>
                            ) : null}

                            {/* Alérgenos */}
                            {item.allergens.length > 0 ? (
                              <details
                                className="menu-allergens-details"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <summary>Alérgenos</summary>
                                <p>
                                  <b>Alérgenos:</b> {item.allergens.join(", ")}
                                </p>
                              </details>
                            ) : null}

                            {!item.is_available ? (
                              <span className="sold-out">Agotado</span>
                            ) : null}

                            {/* Acciones del plato para el administrador */}
                            <div className="admin-dish-actions">
                              <button
                                className={`admin-availability-toggle ${item.is_available ? "is-available" : "is-paused"}`}
                                disabled={isPending}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleAvailability(item);
                                }}
                                title={item.is_available ? "Pausar plato" : "Reactivar plato"}
                                type="button"
                              >
                                <span className="toggle-dot" />
                                {item.is_available ? "Disponible" : "Agotado"}
                              </button>

                              <div className="admin-dish-btn-group">
                                <button
                                  aria-label={`Editar plato ${item.name}`}
                                  className="icon-button"
                                  onClick={(e) => {
                                    e.stopPropagation();
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
                                  aria-label={`Eliminar plato ${item.name}`}
                                  className="icon-button icon-button-danger"
                                  disabled={isPending}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteItem(item);
                                  }}
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

                    {/* Tarjeta punteada para agregar plato */}
                    <button
                      className="admin-add-dish-card"
                      onClick={() => {
                        setItemImagePreview(null);
                        setCreateItemForCategoryId(category.id);
                      }}
                      type="button"
                    >
                      <div className="admin-add-dish-card-content">
                        <div className="admin-add-dish-plus-icon" aria-hidden="true">
                          <svg
                            fill="none"
                            height="20"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2.5"
                            viewBox="0 0 24 24"
                            width="20"
                          >
                            <line x1="12" x2="12" y1="5" y2="19" />
                            <line x1="5" x2="19" y1="12" y2="12" />
                          </svg>
                        </div>
                        <strong className="admin-add-dish-label">Agregar plato</strong>
                        <span className="admin-add-dish-category-hint">a {displayName}</span>
                      </div>
                    </button>
                  </div>
                </section>
              );
            })
          ) : (
            <div className="admin-empty-menu-state">
              <div className="admin-empty-menu-icon">
                <svg
                  aria-hidden="true"
                  fill="none"
                  height="36"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                  width="36"
                >
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
              </div>
              <h3>Esta carta todavía no tiene categorías</h3>
              <p>
                Creá la primera categoría (ej: Entradas, Principales, Bebidas) para comenzar a
                agregar platos en <strong>&quot;{currentMenu.name}&quot;</strong>.
              </p>
              <button
                className="primary-button"
                onClick={() => setIsCategoryDialogOpen(true)}
                type="button"
              >
                + Crear primera categoría
              </button>
            </div>
          )}
        </section>
      </div>

      {/* =========================================================================
          MODALES
          ========================================================================= */}

      {/* Modal: Banner de la carta */}
      {isMenuBannerDialogOpen && (
        <MenuBannerDialog
          isOpen={isMenuBannerDialogOpen}
          menu={currentMenu}
          onClose={() => setIsMenuBannerDialogOpen(false)}
        />
      )}

      {/* Modal: Editar metadatos de la carta */}
      {isMenuEditDialogOpen && (
        <EditMenuDialog
          isOpen={isMenuEditDialogOpen}
          menu={currentMenu}
          onClose={() => setIsMenuEditDialogOpen(false)}
        />
      )}

      {/* Modal: Horarios de la carta */}
      {isMenuSchedulesDialogOpen && (
        <MenuSchedulesDialog
          isOpen={isMenuSchedulesDialogOpen}
          menu={currentMenu}
          onClose={() => setIsMenuSchedulesDialogOpen(false)}
          schedules={currentMenu.schedules || []}
        />
      )}

      {/* Modal: Logo / Foto de Perfil */}
      {isLogoDialogOpen ? (
        <AdminDialog onClose={() => setIsLogoDialogOpen(false)}>
          <form className="admin-modal-form" onSubmit={handleLogoSubmit}>
            <div>
              <p className="eyebrow">Personalización</p>
              <h2>Foto de perfil / Logo del restaurante</h2>
              <p>Esta imagen identifica a tu local en la cabecera del menú digital.</p>
            </div>

            {logoPreview ? (
              <div className="banner-preview-box" style={{ maxWidth: "160px" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img alt="Vista previa del logo" className="banner-preview-img" src={logoPreview} />
              </div>
            ) : branding.logo_path ? (
              <div className="banner-preview-box" style={{ maxWidth: "160px" }}>
                <Image
                  alt=""
                  className="banner-preview-img"
                  height={120}
                  src={menuImageUrl(branding.logo_path)}
                  width={120}
                />
              </div>
            ) : null}

            <label>
              Seleccionar archivo de imagen <span className="field-optional">JPG, PNG o WebP; máx 5 MB</span>
              <input
                accept="image/jpeg,image/png,image/webp"
                name="logo_image"
                onChange={handleLogoFileChange}
                required
                type="file"
              />
            </label>

            <div className="admin-modal-actions">
              {branding.logo_path ? (
                <button
                  className="secondary-link"
                  disabled={isPending}
                  onClick={handleRemoveLogo}
                  style={{ color: "#ef4444", marginRight: "auto" }}
                  type="button"
                >
                  Quitar logo
                </button>
              ) : null}
              <button
                className="secondary-link"
                onClick={() => setIsLogoDialogOpen(false)}
                type="button"
              >
                Cancelar
              </button>
              <button className="primary-link" disabled={isPending} type="submit">
                {isPending ? "Guardando..." : "Guardar logo"}
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
              formData.set("menu_id", currentMenu.id);
              await createCategory(formData);
              setIsCategoryDialogOpen(false);
            }}
            className="admin-modal-form"
          >
            <div>
              <p className="eyebrow">Nueva categoría para &quot;{currentMenu.name}&quot;</p>
              <h2>Crear categoría</h2>
              <p>Las categorías agrupan los platos dentro de esta carta.</p>
            </div>

            <label>
              Nombre de la categoría
              <input
                autoFocus
                name="name"
                placeholder="Ej: Entradas, Pastas, Postres, Vinos Tintos..."
                required
              />
            </label>

            <label>
              Descripción <span className="field-optional">Opcional</span>
              <input name="description" placeholder="Aclaraciones sobre esta sección..." />
            </label>

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

      {/* Modal: Editar Categoría Existente */}
      {editingCategory ? (
        <AdminDialog onClose={() => setEditingCategory(null)}>
          <form
            action={async (formData) => {
              formData.set("menu_id", currentMenu.id);
              await updateCategory(formData);
              setEditingCategory(null);
            }}
            className="admin-modal-form"
          >
            <input name="category_id" type="hidden" value={editingCategory.id} />
            <input name="sort_order" type="hidden" value={editingCategory.sort_order} />

            <div>
              <p className="eyebrow">Editar categoría</p>
              <h2>{editingCategory.name}</h2>
            </div>

            <label>
              Nombre de la categoría
              <input autoFocus defaultValue={editingCategory.name} name="name" required />
            </label>

            <label>
              Descripción <span className="field-optional">Opcional</span>
              <input defaultValue={editingCategory.description ?? ""} name="description" />
            </label>

            <LocalizationFields
              locales={restaurant.supported_locales}
              translations={editingCategory.menu_category_translations ?? []}
            />

            <label className="checkbox-label">
              <input defaultChecked={editingCategory.is_active} name="is_active" type="checkbox" />
              Categoría activa (visible para comensales)
            </label>

            <div className="admin-modal-actions">
              <button
                className="secondary-link"
                onClick={() => setEditingCategory(null)}
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

      {/* Modal: Crear Plato en Categoría */}
      {createItemForCategoryId && activeCategoryForNewItem ? (
        <AdminDialog onClose={() => setCreateItemForCategoryId(null)}>
          <form
            action={async (formData) => {
              await createMenuItem(formData);
              setCreateItemForCategoryId(null);
              setItemImagePreview(null);
            }}
            className="admin-modal-form"
          >
            <input name="category_id" type="hidden" value={createItemForCategoryId} />

            <div>
              <p className="eyebrow">Agregar plato en {activeCategoryForNewItem.name}</p>
              <h2>Nuevo plato</h2>
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
                  {menuCategories.map((cat) => (
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

      {/* Modal: Vista Previa de Detalle del Plato */}
      {previewItem ? (() => {
        const itemTranslation = previewItem.menu_item_translations?.find(
          (t) => t.locale === selectedLocale
        );
        const displayName = (selectedLocale !== "es" && itemTranslation?.name) || previewItem.name;
        const displayDesc = (selectedLocale !== "es" && itemTranslation?.description) || previewItem.description;

        return (
          <div
            aria-label={displayName}
            className="item-dialog-backdrop"
            onMouseDown={() => setPreviewItem(null)}
            role="presentation"
          >
            <section
              aria-modal="true"
              className="item-dialog"
              onKeyDown={(event) => {
                if (event.key === "Escape") setPreviewItem(null);
              }}
              onMouseDown={(event) => event.stopPropagation()}
              role="dialog"
            >
              <button
                aria-label="Cerrar"
                autoFocus
                className="item-dialog-close"
                onClick={() => setPreviewItem(null)}
                type="button"
              >
                ×
              </button>
              <DishImageCarousel
                alt={displayName}
                images={
                  previewItem.image_paths?.length
                    ? previewItem.image_paths
                    : previewItem.image_path
                    ? [previewItem.image_path]
                    : []
                }
              />
              <div className="item-dialog-content">
                <h2>{displayName}</h2>
                <strong>
                  {formatPrice(previewItem.price_cents, previewItem.currency_code, selectedLocale)}
                </strong>
                {displayDesc ? <p>{displayDesc}</p> : null}
                {previewItem.dietary_tags.length > 0 ? (
                  <p>
                    <b>Etiquetas dietéticas:</b> {previewItem.dietary_tags.join(", ")}
                  </p>
                ) : null}
                {previewItem.allergens.length > 0 ? (
                  <p>
                    <b>Alérgenos:</b> {previewItem.allergens.join(", ")}
                  </p>
                ) : null}
                {!previewItem.is_available ? <span className="sold-out">Agotado</span> : null}
              </div>
            </section>
          </div>
        );
      })() : null}
    </div>
  );
}
