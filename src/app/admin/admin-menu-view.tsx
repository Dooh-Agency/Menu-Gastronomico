"use client";

import { type CSSProperties, useEffect, useState, useTransition } from "react";
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
  assignCategoryToMenu,
  createCategory,
  createMenuItem,
  deleteCategory,
  deleteMenuItem,
  duplicateCategoryToMenu,
  reorderMenuCategories,
  toggleMenuItemAvailability,
  unlinkCategoryFromMenu,
  updateCategory,
  updateLogoImage,
  updateMenuBanner,
  updateMenuItem,
} from "./actions";
import { LocalizationFields } from "./localization-fields";
import { DishImagesUploader } from "./dish-images-uploader";
import {
  DEFAULT_ALLERGENS,
  DEFAULT_DIETARY_TAGS,
  TagMultiSelector,
} from "./tag-multi-selector";
import { brandingFor, menuImageUrl, restaurantFonts } from "@/lib/restaurant-branding";
import { DishImageCarousel } from "@/components/dish-image-carousel";
import { CardLayoutSelector, type CardLayoutType } from "./categories/card-layout-selector";
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
  const [selectedMenuId, setSelectedMenuIdState] = useState<string | null>(() => {
    return menuParam && menus.some((m) => m.id === menuParam) ? menuParam : null;
  });

  useEffect(() => {
    if (menuParam && menus.some((m) => m.id === menuParam)) {
      setSelectedMenuIdState(menuParam);
    } else {
      setSelectedMenuIdState(null);
    }
  }, [menuParam, menus]);

  function setSelectedMenuId(menuId: string | null) {
    setSelectedMenuIdState(menuId);
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
  const [categoryMode, setCategoryMode] = useState<"new" | "reuse">("new");
  const [selectedSourceCatId, setSelectedSourceCatId] = useState<string>("");
  const [menuCatCreateLayout, setMenuCatCreateLayout] = useState<CardLayoutType>("rectangle");
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [menuCatEditLayout, setMenuCatEditLayout] = useState<CardLayoutType>("rectangle");
  const [createItemForCategoryId, setCreateItemForCategoryId] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [itemImagePreview, setItemImagePreview] = useState<string | null>(null);
  const [previewItem, setPreviewItem] = useState<MenuItem | null>(null);

  // Staged and kept images state for item dialogs to ensure 100% reliable upload
  const [createStagedFiles, setCreateStagedFiles] = useState<File[]>([]);
  const [createKeptImages, setCreateKeptImages] = useState<string[]>([]);
  const [editStagedFiles, setEditStagedFiles] = useState<File[]>([]);
  const [editKeptImages, setEditKeptImages] = useState<string[]>([]);

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

  // Categories belonging to the active menu (sorted by menu-specific order)
  const menuCategories = categories
    .filter((c) => c.menu_ids?.includes(currentMenu.id) || c.menu_id === currentMenu.id)
    .sort((a, b) => {
      const orderA = a.menu_assignments?.find((m) => m.menu_id === currentMenu.id)?.sort_order ?? a.sort_order;
      const orderB = b.menu_assignments?.find((m) => m.menu_id === currentMenu.id)?.sort_order ?? b.sort_order;
      return orderA - orderB;
    });
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

  function handleUnlinkCategory(category: Category) {
    const isShared = (category.menu_ids?.length ?? 1) > 1;
    const confirmMsg = isShared
      ? `¿Quitar la categoría "${category.name}" de "${currentMenu.name}"?\n\nSeguirá disponible en las demás cartas y sus platos no se borrarán.`
      : `¿Quitar la categoría "${category.name}" de esta carta?\n\nSus platos se conservarán en tu catálogo de categorías para volver a usarla cuando quieras.`;

    if (!confirm(confirmMsg)) return;

    const formData = new FormData();
    formData.set("category_id", category.id);
    formData.set("menu_id", currentMenu.id);
    startTransition(async () => {
      await unlinkCategoryFromMenu(formData);
      if (selectedCategoryId === category.id) {
        setSelectedCategoryId("all");
      }
      router.refresh();
    });
  }

  function handleDeleteCategory(category: Category) {
    const isShared = (category.menu_ids?.length ?? 1) > 1;
    const count = items.filter((i) => i.category_id === category.id).length;
    const warningText = isShared
      ? `¡ATENCIÓN! La categoría "${category.name}" está asignada en ${category.menu_ids?.length} cartas.\n\nSi la eliminas definitivamente, se borrará de TODAS las cartas y se eliminarán sus ${count} plato${count === 1 ? "" : "s"}.\n\nSi solo querés sacarla de "${currentMenu.name}", usá "Quitar de esta carta".\n\n¿Eliminarla definitivamente?`
      : count > 0
      ? `¿Eliminar definitivamente la categoría "${category.name}"? Contiene ${count} plato${count === 1 ? "" : "s"} que también se eliminarán.`
      : `¿Eliminar definitivamente la categoría "${category.name}"?`;

    if (!confirm(warningText)) return;
    const formData = new FormData();
    formData.set("category_id", category.id);
    startTransition(async () => {
      await deleteCategory(formData);
      if (selectedCategoryId === category.id) {
        setSelectedCategoryId("all");
      }
      router.refresh();
    });
  }

  return (
    <div className="admin-menu-editor-layout">
      {/* Barra superior de navegación de vuelta a Mis Cartas */}
      <div className="admin-editor-top-nav">
        <button
          className="admin-back-to-menus-btn"
          onClick={() => setSelectedMenuId(null)}
          type="button"
        >
          <svg
            aria-hidden="true"
            fill="none"
            height="16"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2.5"
            viewBox="0 0 24 24"
            width="16"
          >
            <line x1="19" x2="5" y1="12" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Volver a Mis Cartas
        </button>
      </div>

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
                        <span
                          style={{
                            fontSize: "0.72rem",
                            fontWeight: 600,
                            padding: "0.15rem 0.5rem",
                            borderRadius: "999px",
                            background:
                              category.card_layout === "hero"
                                ? "#fef3c7"
                                : category.card_layout === "carousel"
                                ? "#e0e7ff"
                                : "#f3f4f6",
                            color:
                              category.card_layout === "hero"
                                ? "#92400e"
                                : category.card_layout === "carousel"
                                ? "#3730a3"
                                : "#4b5563",
                          }}
                        >
                          {category.card_layout === "hero"
                            ? "Cuadrado grande"
                            : category.card_layout === "carousel"
                            ? "Scroll horizontal"
                            : "Rectángulo"}
                        </span>
                        {category.menu_ids && category.menu_ids.length > 1 ? (
                          <span
                            className="admin-category-shared-badge"
                            style={{
                              fontSize: "0.72rem",
                              fontWeight: 600,
                              padding: "0.2rem 0.55rem",
                              borderRadius: "999px",
                              background: "rgba(59, 130, 246, 0.12)",
                              color: "#2563eb",
                              border: "1px solid rgba(59, 130, 246, 0.25)",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "0.25rem",
                            }}
                            title={`Esta categoría está presente en ${category.menu_ids.length} cartas`}
                          >
                            <svg fill="none" height="11" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="11">
                              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                            </svg>
                            Compartida ({category.menu_ids.length} cartas)
                          </span>
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
                        onClick={() => {
                          setEditingCategory(category);
                          setMenuCatEditLayout(category.card_layout || "rectangle");
                        }}
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
                        aria-label={`Quitar categoría ${category.name} de esta carta`}
                        className="icon-button"
                        disabled={isPending}
                        onClick={() => handleUnlinkCategory(category)}
                        title="Quitar de esta carta (conservar platos)"
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
                          <line x1="18" x2="6" y1="6" y2="18" />
                          <line x1="6" x2="18" y1="6" y2="18" />
                        </svg>
                      </button>
                      <button
                        aria-label={`Eliminar categoría ${category.name} definitivamente`}
                        className="icon-button icon-button-danger"
                        disabled={isPending}
                        onClick={() => handleDeleteCategory(category)}
                        title="Eliminar definitivamente del restaurante"
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
                          aria-label={`Ver vista previa de ${itemDisplayName}`}
                          className={`menu-card admin-dish-card${item.is_available ? "" : " is-unavailable"}`}
                          key={item.id}
                          onClick={() => {
                            setPreviewItem(item);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              setPreviewItem(item);
                            }
                          }}
                          role="button"
                          tabIndex={0}
                        >
                          {item.image_path || (item.image_paths && item.image_paths.length > 0) ? (() => {
                            const thumbPath = item.image_paths?.[0] || item.image_path;
                            if (!thumbPath) return null;
                            const totalPhotos = item.image_paths?.length || 1;
                            return (
                              <div style={{ position: "relative" }}>
                                <Image
                                  alt=""
                                  className="menu-image"
                                  height={720}
                                  sizes="(max-width: 34rem) 100vw, 33vw"
                                  src={menuImageUrl(thumbPath)}
                                  width={1280}
                                />
                                {totalPhotos > 1 ? (
                                  <div
                                    aria-label={`${totalPhotos} fotos`}
                                    className="dish-card-horizontal-photos-badge"
                                    style={{ bottom: "0.5rem", right: "0.5rem" }}
                                  >
                                    <svg
                                      aria-hidden="true"
                                      fill="none"
                                      height="11"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2.2"
                                      viewBox="0 0 24 24"
                                      width="11"
                                    >
                                      <rect height="18" rx="2" ry="2" width="18" x="3" y="3" />
                                      <circle cx="8.5" cy="8.5" r="1.5" />
                                      <polyline points="21 15 16 10 5 21" />
                                    </svg>
                                    <span>{totalPhotos}</span>
                                  </div>
                                ) : null}
                              </div>
                            );
                          })() : null}

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
            {/* 1- FOTO */}
            <div className="modal-hero-photo-section" style={{ display: "flex", justifyContent: "center" }}>
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
              ) : (
                <div
                  className="modal-banner-placeholder"
                  style={{
                    width: "120px",
                    height: "120px",
                    borderRadius: "50%",
                    background: "#f4eee9",
                    border: "2px dashed #cfc7bd",
                  }}
                >
                  <svg
                    fill="none"
                    height="32"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    viewBox="0 0 24 24"
                    width="32"
                  >
                    <circle cx="12" cy="7" r="4" />
                    <path d="M5.5 21a8.5 8.5 0 0 1 13 0" />
                  </svg>
                  <span style={{ fontSize: "0.75rem" }}>Sin logo</span>
                </div>
              )}
            </div>

            {/* 2- TÍTULO y 3- DESCRIPCIÓN */}
            <div className="modal-header-section" style={{ textAlign: "center", paddingRight: 0 }}>
              <p className="eyebrow">Personalización</p>
              <h2 className="modal-title">Foto de perfil / Logo</h2>
              <p className="modal-description">
                Esta imagen identifica a tu restaurante en la cabecera del menú digital.
              </p>
            </div>

            <label>
              Seleccionar nueva imagen <span className="field-optional">JPG, PNG o WebP; máx 5 MB</span>
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
      {isCategoryDialogOpen ? (() => {
        const reusableCategories = categories.filter(
          (c) => !(c.menu_ids?.includes(currentMenu?.id) || c.menu_id === currentMenu?.id)
        );

        return (
          <AdminDialog onClose={() => {
            setIsCategoryDialogOpen(false);
            setCategoryMode("new");
            setSelectedSourceCatId("");
          }}>
            <form
              action={async (formData) => {
                if (categoryMode === "reuse" && selectedSourceCatId) {
                  const linkFormData = new FormData();
                  linkFormData.set("category_id", selectedSourceCatId);
                  linkFormData.set("menu_id", currentMenu.id);
                  startTransition(async () => {
                    await assignCategoryToMenu(linkFormData);
                    setIsCategoryDialogOpen(false);
                    setCategoryMode("new");
                    setSelectedSourceCatId("");
                    router.refresh();
                  });
                } else {
                  formData.set("menu_id", currentMenu.id);
                  startTransition(async () => {
                    await createCategory(formData);
                    setIsCategoryDialogOpen(false);
                    setCategoryMode("new");
                    setSelectedSourceCatId("");
                    router.refresh();
                  });
                }
              }}
              className="admin-modal-form"
            >
              {/* 1- FOTO / HEADER VISUAL */}
              <div className="modal-hero-photo-section">
                <div
                  style={{
                    background: "linear-gradient(135deg, #823718 0%, #b85d3b 100%)",
                    borderRadius: "0.75rem",
                    padding: "1.2rem 1.4rem",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem",
                  }}
                >
                  <div
                    style={{
                      background: "rgba(255,255,255,0.22)",
                      borderRadius: "50%",
                      padding: "0.6rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <svg
                      fill="none"
                      height="24"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      width="24"
                    >
                      <path d="M4 6h16M4 12h16M4 18h7" />
                    </svg>
                  </div>
                  <div>
                    <span style={{ fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.05em", opacity: 0.85 }}>
                      Sección de la carta
                    </span>
                    <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 700 }}>Categoría de platos</h3>
                  </div>
                </div>
              </div>

              {/* 2- TÍTULO y 3- DESCRIPCIÓN */}
              <div className="modal-header-section">
                <p className="eyebrow">Nueva categoría para &quot;{currentMenu.name}&quot;</p>
                <h2 className="modal-title">
                  {categoryMode === "reuse" ? "Vincular categoría existente" : "Crear categoría"}
                </h2>
                <p className="modal-description">
                  {categoryMode === "reuse"
                    ? "Vincular una categoría existente a esta carta para compartir sus platos en tiempo real."
                    : "Las categorías agrupan los platos dentro de esta carta."}
                </p>
              </div>

              {/* Selector de Modo (Nueva vs Reutilizar de otra carta) */}
              {reusableCategories.length > 0 && (
                <div className="category-mode-nav">
                  <button
                    className={`category-mode-tab ${categoryMode === "new" ? "is-active" : ""}`}
                    onClick={() => setCategoryMode("new")}
                    type="button"
                  >
                    Nueva desde cero
                  </button>
                  <button
                    className={`category-mode-tab ${categoryMode === "reuse" ? "is-active" : ""}`}
                    onClick={() => setCategoryMode("reuse")}
                    type="button"
                  >
                    Reutilizar existente ({reusableCategories.length})
                  </button>
                </div>
              )}

              {categoryMode === "reuse" ? (
                <div className="category-reuse-box">
                  <p className="category-reuse-info">
                    Seleccioná una categoría ya existente en tu restaurante. Se vinculará a &quot;{currentMenu.name}&quot; manteniendo todos sus platos, fotos y precios compartidos en tiempo real. Cualquier cambio que hagas en sus platos se reflejará en todas las cartas donde esté asignada.
                  </p>
                  <label>
                    Categoría a reutilizar
                    <select
                      onChange={(e) => setSelectedSourceCatId(e.target.value)}
                      required
                      value={selectedSourceCatId}
                    >
                      <option value="">Seleccionar una categoría...</option>
                      {reusableCategories.map((rc) => {
                        const assignedMenus = menus
                          .filter((m) => rc.menu_ids?.includes(m.id) || rc.menu_id === m.id)
                          .map((m) => m.name);
                        const whereText = assignedMenus.length > 0 ? `En: ${assignedMenus.join(", ")}` : "Sin carta";
                        const dishCount = items.filter((i) => i.category_id === rc.id).length;
                        return (
                          <option key={rc.id} value={rc.id}>
                            {rc.name} ({whereText}) — {dishCount} {dishCount === 1 ? "plato" : "platos"}
                          </option>
                        );
                      })}
                    </select>
                  </label>
                </div>
              ) : (
                <>
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

                  <div>
                    <label style={{ display: "block", marginBottom: "0.25rem" }}>
                      Formato de tarjetas
                    </label>
                    <CardLayoutSelector
                      name="card_layout"
                      onChange={setMenuCatCreateLayout}
                      value={menuCatCreateLayout}
                    />
                  </div>
                </>
              )}

              <div className="admin-modal-actions">
                <button
                  className="secondary-link"
                  onClick={() => {
                    setIsCategoryDialogOpen(false);
                    setCategoryMode("new");
                    setSelectedSourceCatId("");
                  }}
                  type="button"
                >
                  Cancelar
                </button>
                <button className="primary-link" disabled={isPending} type="submit">
                  {isPending
                    ? "Procesando..."
                    : categoryMode === "reuse"
                    ? "Vincular a esta carta"
                    : "Crear categoría"}
                </button>
              </div>
            </form>
          </AdminDialog>
        );
      })() : null}

      {/* Modal: Editar Categoría Existente */}
      {editingCategory ? (
        <AdminDialog onClose={() => setEditingCategory(null)}>
          <form
            action={async (formData) => {
              formData.set("menu_id", currentMenu.id);
              startTransition(async () => {
                await updateCategory(formData);
                setEditingCategory(null);
                router.refresh();
              });
            }}
            className="admin-modal-form"
          >
            <input name="category_id" type="hidden" value={editingCategory.id} />
            <input name="sort_order" type="hidden" value={editingCategory.sort_order} />

            {/* 1- FOTO / HEADER VISUAL */}
            <div className="modal-hero-photo-section">
              <div
                style={{
                  background: "linear-gradient(135deg, #823718 0%, #b85d3b 100%)",
                  borderRadius: "0.75rem",
                  padding: "1.2rem 1.4rem",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                }}
              >
                <div
                  style={{
                    background: "rgba(255,255,255,0.22)",
                    borderRadius: "50%",
                    padding: "0.6rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <svg
                    fill="none"
                    height="24"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    width="24"
                  >
                    <path d="M4 6h16M4 12h16M4 18h7" />
                  </svg>
                </div>
                <div>
                  <span style={{ fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.05em", opacity: 0.85 }}>
                    Sección de la carta
                  </span>
                  <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 700 }}>Editar categoría</h3>
                </div>
              </div>
            </div>

            {/* 2- TÍTULO y 3- DESCRIPCIÓN */}
            <div className="modal-header-section">
              <p className="eyebrow">Editar categoría</p>
              <h2 className="modal-title">{editingCategory.name}</h2>
              <p className="modal-description">
                Modificá los datos, visibilidad y traducciones de esta categoría.
              </p>
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

            <div>
              <label style={{ display: "block", marginBottom: "0.25rem" }}>
                Formato de tarjetas
              </label>
              <CardLayoutSelector
                name="card_layout"
                onChange={setMenuCatEditLayout}
                value={menuCatEditLayout}
              />
            </div>

            <label className="checkbox-label">
              <input defaultChecked={editingCategory.is_active} name="is_active" type="checkbox" />
              <span>
                <strong>Categoría activa</strong> (visible para los comensales)
              </span>
            </label>

            <div className="admin-modal-actions">
              <button
                className="secondary-link"
                onClick={() => setEditingCategory(null)}
                type="button"
              >
                Cancelar
              </button>
              <button className="primary-link" disabled={isPending} type="submit">
                {isPending ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>
          </form>
        </AdminDialog>
      ) : null}

      {/* Modal: Crear Plato en Categoría */}
      {createItemForCategoryId && activeCategoryForNewItem ? (
        <AdminDialog
          maxWidth="46rem"
          onClose={() => {
            setCreateItemForCategoryId(null);
            setCreateStagedFiles([]);
            setCreateKeptImages([]);
          }}
        >
          <form
            action={async (formData) => {
              formData.delete("images");
              createStagedFiles.forEach((file) => formData.append("images", file));
              formData.delete("kept_image_paths");
              createKeptImages.forEach((path) => formData.append("kept_image_paths", path));
              formData.set("has_image_manager", "true");

              startTransition(async () => {
                await createMenuItem(formData);
                setCreateItemForCategoryId(null);
                setCreateStagedFiles([]);
                setCreateKeptImages([]);
                setItemImagePreview(null);
                router.refresh();
              });
            }}
            className="admin-modal-form"
          >
            <input name="category_id" type="hidden" value={createItemForCategoryId} />

            {/* 1- FOTO (Uploader de fotos múltiples arriba de todo) */}
            <div className="modal-hero-photo-section">
              <DishImagesUploader
                onFilesChange={setCreateStagedFiles}
                onKeptImagesChange={setCreateKeptImages}
              />
            </div>

            {/* 2- TÍTULO y 3- DESCRIPCIÓN */}
            <div className="modal-header-section">
              <p className="eyebrow">Agregar plato en {activeCategoryForNewItem.name}</p>
              <h2 className="modal-title">Nuevo plato</h2>
              <p className="modal-description">
                Completá los datos del plato para mostrarlo en el menú público.
              </p>
            </div>

            <label>
              Nombre del plato
              <input autoFocus name="name" placeholder="Ej: Hamburguesa Clásica, Ravioles..." required />
            </label>

            <label>
              Descripción <span className="field-optional">Opcional</span>
              <textarea
                name="description"
                placeholder="Ingredientes, preparación o detalles..."
                rows={2}
              />
            </label>

            <div className="admin-modal-grid">
              <label>
                Precio (ARS)
                <input min="0" name="price" placeholder="Ej: 4500" required step=".01" type="number" />
              </label>

              <label className="checkbox-label" style={{ alignSelf: "center", marginTop: "1.25rem" }}>
                <input defaultChecked name="is_available" type="checkbox" />
                <span>Disponible para comensales</span>
              </label>
            </div>

            {/* SELECTOR MÚLTIPLE DE ETIQUETAS DIETÉTICAS (5 opciones) */}
            <TagMultiSelector
              helpText="Seleccioná las etiquetas que aplican a este plato"
              label="Etiquetas dietéticas"
              name="dietary_tags"
              options={DEFAULT_DIETARY_TAGS}
            />

            {/* SELECTOR MÚLTIPLE DE ALÉRGENOS (5 opciones) */}
            <TagMultiSelector
              helpText="Indicá los alérgenos presentes para informar a los clientes"
              label="Alérgenos"
              name="allergens"
              options={DEFAULT_ALLERGENS}
            />

            <LocalizationFields locales={restaurant.supported_locales} translations={[]} />

            <div className="admin-modal-actions">
              <button
                className="secondary-link"
                disabled={isPending}
                onClick={() => {
                  setCreateItemForCategoryId(null);
                  setCreateStagedFiles([]);
                  setCreateKeptImages([]);
                }}
                type="button"
              >
                Cancelar
              </button>
              <button className="primary-link" disabled={isPending} type="submit">
                {isPending ? "Creando..." : "Crear y agregar plato"}
              </button>
            </div>
          </form>
        </AdminDialog>
      ) : null}

      {/* Modal: Editar Plato Existente */}
      {editingItem ? (
        <AdminDialog
          maxWidth="46rem"
          onClose={() => {
            setEditingItem(null);
            setEditStagedFiles([]);
            setEditKeptImages([]);
          }}
        >
          <form
            action={async (formData) => {
              formData.delete("images");
              editStagedFiles.forEach((file) => formData.append("images", file));
              formData.delete("kept_image_paths");
              editKeptImages.forEach((path) => formData.append("kept_image_paths", path));
              formData.set("has_image_manager", "true");

              startTransition(async () => {
                await updateMenuItem(formData);
                setEditingItem(null);
                setEditStagedFiles([]);
                setEditKeptImages([]);
                router.refresh();
              });
            }}
            className="admin-modal-form"
          >
            <input name="item_id" type="hidden" value={editingItem.id} />
            <input name="sort_order" type="hidden" value={editingItem.sort_order} />

            {/* 1- FOTO (Uploader de fotos múltiples arriba de todo) */}
            <div className="modal-hero-photo-section">
              <DishImagesUploader
                initialImages={
                  editingItem.image_paths?.length
                    ? editingItem.image_paths
                    : editingItem.image_path
                    ? [editingItem.image_path]
                    : []
                }
                onFilesChange={setEditStagedFiles}
                onKeptImagesChange={setEditKeptImages}
              />
            </div>

            {/* 2- TÍTULO y 3- DESCRIPCIÓN */}
            <div className="modal-header-section">
              <p className="eyebrow">Editar plato</p>
              <h2 className="modal-title">{editingItem.name}</h2>
              <p className="modal-description">
                Modificá los datos del plato para actualizarlo en el menú público.
              </p>
            </div>

            <label>
              Nombre del plato
              <input autoFocus defaultValue={editingItem.name} name="name" required />
            </label>

            <label>
              Descripción <span className="field-optional">Opcional</span>
              <textarea
                defaultValue={editingItem.description ?? ""}
                name="description"
                rows={2}
              />
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

            {/* SELECTOR MÚLTIPLE DE ETIQUETAS DIETÉTICAS (5 opciones) */}
            <TagMultiSelector
              helpText="Seleccioná las etiquetas que aplican a este plato"
              initialValues={editingItem.dietary_tags}
              label="Etiquetas dietéticas"
              name="dietary_tags"
              options={DEFAULT_DIETARY_TAGS}
            />

            {/* SELECTOR MÚLTIPLE DE ALÉRGENOS (5 opciones) */}
            <TagMultiSelector
              helpText="Indicá los alérgenos presentes para informar a los clientes"
              initialValues={editingItem.allergens}
              label="Alérgenos"
              name="allergens"
              options={DEFAULT_ALLERGENS}
            />

            <LocalizationFields
              locales={restaurant.supported_locales}
              translations={editingItem.menu_item_translations ?? []}
            />

            <label className="checkbox-label">
              <input defaultChecked={editingItem.is_available} name="is_available" type="checkbox" />
              <span>Disponible para comensales</span>
            </label>

            <div className="admin-modal-actions">
              <button
                className="secondary-link"
                disabled={isPending}
                onClick={() => {
                  setEditingItem(null);
                  setEditStagedFiles([]);
                  setEditKeptImages([]);
                }}
                type="button"
              >
                Cancelar
              </button>
              <button className="primary-link" disabled={isPending} type="submit">
                {isPending ? "Guardando..." : "Guardar cambios"}
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
            onClick={(e) => {
              if (e.target === e.currentTarget) setPreviewItem(null);
            }}
            role="presentation"
          >
            <section
              aria-modal="true"
              className="item-dialog"
              onClick={(event) => event.stopPropagation()}
              onKeyDown={(event) => {
                if (event.key === "Escape") setPreviewItem(null);
              }}
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
