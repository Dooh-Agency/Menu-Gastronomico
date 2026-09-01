"use client";

import { type CSSProperties, type UIEvent, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import type { PublicMenu, PublicMenuSchedule } from "@/lib/supabase/public-menu";
import { brandingFor, menuImageUrl, restaurantFonts } from "@/lib/restaurant-branding";
import { DishCardHorizontal } from "@/components/dish-cards";

type MenuPublicoProps = {
  menu: PublicMenu;
  locale: string;
  currentDaypartId: string | null;
  initialMenuId?: string | null;
};

type MenuItem = PublicMenu["items"][number];

const labels = {
  es: {
    menu: "Menú",
    chooseMenu: "Nuestras cartas",
    chooseMenuTitle: "¿Qué te gustaría ver hoy?",
    chooseMenuSubtitle: "Seleccioná la carta que querés ver para descubrir nuestros platos",
    allMenus: "Ver todas las cartas",
    changeMenu: "Cambiar de carta",
    viewMenu: "Ver carta",
    availableNow: "Disponibles ahora",
    outsideHoursTitle: "Fuera de horario",
    outsideHoursBadge: "Fuera de horario",
    category: "categoría",
    categories: "categorías",
    dish: "plato",
    dishes: "platos",
    availableAllDay: "Disponible todo el día",
    filters: "Filtrar por preferencias",
    all: "Inicio",
    details: "Ver detalle",
    close: "Cerrar",
    qr: "Ver QR",
    allergens: "Alérgenos",
    soldOut: "Agotado",
    noItems: "No hay platos disponibles para esta selección.",
    outsideHours: "En este momento la carta no está disponible.",
    languages: "Idioma",
    menus: "Cartas",
    unavailableMenu: "Esta carta se ofrece de",
  },
  en: {
    menu: "Menu",
    chooseMenu: "Our menus",
    chooseMenuTitle: "What would you like to see today?",
    chooseMenuSubtitle: "Select a menu to explore our dishes and drinks",
    allMenus: "View all menus",
    changeMenu: "Change menu",
    viewMenu: "View menu",
    availableNow: "Available now",
    outsideHoursTitle: "Outside hours",
    outsideHoursBadge: "Outside hours",
    category: "category",
    categories: "categories",
    dish: "dish",
    dishes: "dishes",
    availableAllDay: "Available all day",
    filters: "Filter by dietary preference",
    all: "Home",
    details: "View details",
    close: "Close",
    qr: "View QR",
    allergens: "Allergens",
    soldOut: "Sold out",
    noItems: "There are no dishes available for this selection.",
    outsideHours: "The menu is not available at this time.",
    languages: "Language",
    menus: "Menus",
    unavailableMenu: "This menu is offered from",
  },
} as const;

function copyFor(locale: string) {
  return locale.startsWith("en") ? labels.en : labels.es;
}

function translated<T extends { translations: Array<{ locale: string; name: string; description: string | null }> }>(
  entity: T,
  locale: string,
) {
  return entity.translations.find((translation) => translation.locale === locale) ?? entity;
}

function formatPrice(cents: number, currency: string, locale: string) {
  return new Intl.NumberFormat(locale.startsWith("en") ? "en-US" : "es-AR", {
    style: "currency",
    currency: currency || "ARS",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function formatMenuSchedule(schedules: PublicMenuSchedule[], locale: string) {
  if (!schedules || schedules.length === 0) {
    return locale.startsWith("en") ? "Available all day" : "Disponible todo el día";
  }
  if (schedules.length === 1) {
    const s = schedules[0];
    const start = s.starts_at.slice(0, 5);
    const end = s.ends_at.slice(0, 5);
    if (start === "00:00" && (end === "23:59" || end === "00:00")) {
      return locale.startsWith("en") ? "Available all day" : "Disponible todo el día";
    }
    const daysEs = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
    const daysEn = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const daysLabel =
      s.day_of_week === null
        ? locale.startsWith("en") ? "Every day" : "Todos los días"
        : locale.startsWith("en")
        ? daysEn[s.day_of_week]
        : daysEs[s.day_of_week];
    return `${daysLabel} (${start} - ${end})`;
  }
  return locale.startsWith("en")
    ? `${schedules.length} configured time slots`
    : `${schedules.length} franjas horarias`;
}

function isMenuScheduleActive(schedules: PublicMenuSchedule[], timezone: string): boolean {
  if (!schedules || schedules.length === 0) return true;

  try {
    const date = new Date();
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone || "America/Argentina/Buenos_Aires",
      hour: "2-digit",
      minute: "2-digit",
      weekday: "short",
      hourCycle: "h23",
    }).formatToParts(date);

    const hour = Number(parts.find((part) => part.type === "hour")?.value ?? 0);
    const minute = Number(parts.find((part) => part.type === "minute")?.value ?? 0);
    const dayStr = parts.find((part) => part.type === "weekday")?.value?.toLowerCase() ?? "";

    const dayMap: Record<string, number> = {
      sun: 0,
      mon: 1,
      tue: 2,
      wed: 3,
      thu: 4,
      fri: 5,
      sat: 6,
    };
    const currentDay = dayMap[dayStr] ?? date.getDay();
    const currentMins = hour * 60 + minute;

    return schedules.some((s) => {
      if (s.day_of_week !== null && s.day_of_week !== currentDay) return false;

      const [startH, startM] = s.starts_at.slice(0, 5).split(":").map(Number);
      const [endH, endM] = s.ends_at.slice(0, 5).split(":").map(Number);
      const startMins = startH * 60 + startM;
      const endMins = endH * 60 + endM;

      if (startMins === 0 && (endMins === 1439 || endMins === 0 || (endH === 23 && endM === 59))) {
        return true;
      }

      return startMins < endMins
        ? currentMins >= startMins && currentMins <= endMins
        : currentMins >= startMins || currentMins <= endMins;
    });
  } catch {
    return true;
  }
}

export function MenuPublico({
  menu,
  locale,
  initialMenuId,
}: MenuPublicoProps) {
  const activeMenus = menu.menus.filter((m) => m.is_active);

  // If initialMenuId is explicitly provided (or if there's only 1 menu), select it; otherwise null
  const [selectedMenuId, setSelectedMenuId] = useState<string | null>(
    initialMenuId !== undefined
      ? initialMenuId
      : activeMenus.length === 1
      ? activeMenus[0]?.id ?? null
      : null
  );

  const [dietaryFilter, setDietaryFilter] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>("all");
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const categoryNav = useRef<HTMLElement>(null);
  const categoryScrollTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const copy = copyFor(locale);

  const branding = brandingFor(menu.restaurant.branding);
  const brandStyle = {
    "--color-accent": branding.primary_color,
    "--color-secondary": branding.secondary_color,
    "--color-paper": branding.surface_color,
    "--color-ink": branding.text_color,
    "--color-link": branding.accent_text_color,
    "--menu-font": restaurantFonts[branding.font_family ?? "inter"].cssFamily,
    "--radius-card": branding.radius === "soft" ? ".65rem" : branding.radius === "square" ? ".15rem" : "1rem",
  } as CSSProperties;

  function selectLocale(nextLocale: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (nextLocale === menu.restaurant.default_locale) params.delete("lang");
    else params.set("lang", nextLocale);
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  function handleSelectMenu(menuId: string | null) {
    setSelectedMenuId(menuId);
    setSelectedCategoryId("all");
    const params = new URLSearchParams(searchParams.toString());
    if (!menuId || (activeMenus.length <= 1 && menuId === activeMenus[0]?.id)) {
      params.delete("menu");
    } else {
      params.set("menu", menuId);
    }
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  useEffect(() => () => {
    if (categoryScrollTimeout.current) clearTimeout(categoryScrollTimeout.current);
  }, []);

  function selectCategory(categoryId: string) {
    setSelectedCategoryId(categoryId);
  }

  function selectCategoryFromNavScroll(event: UIEvent<HTMLElement>) {
    const nav = event.currentTarget;
    if (categoryScrollTimeout.current) clearTimeout(categoryScrollTimeout.current);
    categoryScrollTimeout.current = setTimeout(() => {
      const navCenter = nav.getBoundingClientRect().left + nav.clientWidth / 2;
      const closestTab = Array.from(nav.querySelectorAll<HTMLElement>("[data-category-id]")).reduce<HTMLElement | null>(
        (closest, tab) => !closest || Math.abs(tab.getBoundingClientRect().left + tab.offsetWidth / 2 - navCenter) < Math.abs(closest.getBoundingClientRect().left + closest.offsetWidth / 2 - navCenter) ? tab : closest,
        null,
      );
      const categoryId = closestTab?.dataset.categoryId;
      if (categoryId) setSelectedCategoryId(categoryId);
    }, 120);
  }

  // =========================================================================
  // VISTA 1: Selector de Cartas (Separadas en Disponibles y Fuera de horario)
  // =========================================================================
  if (!selectedMenuId) {
    const availableMenus = activeMenus.filter((m) =>
      isMenuScheduleActive(m.schedules, menu.restaurant.timezone)
    );
    const outsideHoursMenus = activeMenus.filter(
      (m) => !isMenuScheduleActive(m.schedules, menu.restaurant.timezone)
    );

    function renderMenuCard(m: PublicMenu["menus"][number], isAvailable: boolean) {
      const menuCats = menu.categories.filter((c) => c.menu_id === m.id);
      const menuCatIds = new Set(menuCats.map((c) => c.id));
      const menuDishCount = menu.items.filter((i) => menuCatIds.has(i.category_id)).length;
      const bannerPath = m.banner_path || branding.cover_image_path;
      const scheduleText = formatMenuSchedule(m.schedules, locale);

      return (
        <article
          className={`public-menu-card ${!isAvailable ? "is-outside-hours" : ""}`}
          key={m.id}
          onClick={() => handleSelectMenu(m.id)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleSelectMenu(m.id);
            }
          }}
          role="button"
          tabIndex={0}
        >
          <div className="public-menu-card-cover">
            {bannerPath ? (
              <Image
                alt={`Portada ${m.name}`}
                className="public-menu-card-image"
                fill
                sizes="(max-width: 40rem) 100vw, (max-width: 64rem) 50vw, 33vw"
                src={menuImageUrl(bannerPath)}
              />
            ) : (
              <div className="public-menu-card-placeholder-banner">
                <span className="public-menu-placeholder-mark" />
              </div>
            )}

            {!isAvailable ? (
              <div className="public-menu-outside-badge">
                <svg
                  aria-hidden="true"
                  fill="none"
                  height="13"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.3"
                  viewBox="0 0 24 24"
                  width="13"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <span>{copy.outsideHoursBadge}</span>
              </div>
            ) : null}

            <div className="public-menu-card-overlay">
              <span className="public-menu-card-enter-btn">{copy.viewMenu} →</span>
            </div>
          </div>

          <div className="public-menu-card-body">
            <div className="public-menu-card-info">
              <h2 className="public-menu-card-name">{m.name}</h2>
              {m.description ? (
                <p className="public-menu-card-desc">{m.description}</p>
              ) : null}
            </div>

            <div className="public-menu-card-meta-list">
              <div className="public-menu-card-meta-item">
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
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <span>{scheduleText}</span>
              </div>
              <div className="public-menu-card-meta-item">
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
                  <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
                  <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
                  <line x1="6" x2="6" y1="1" y2="4" />
                  <line x1="10" x2="10" y1="1" y2="4" />
                  <line x1="14" x2="14" y1="1" y2="4" />
                </svg>
                <span>
                  {menuCats.length} {menuCats.length === 1 ? copy.category : copy.categories} · {menuDishCount}{" "}
                  {menuDishCount === 1 ? copy.dish : copy.dishes}
                </span>
              </div>
            </div>

            <button
              className={`public-menu-card-cta-btn ${!isAvailable ? "is-outside-hours" : ""}`}
              onClick={(e) => {
                e.stopPropagation();
                handleSelectMenu(m.id);
              }}
              type="button"
            >
              {copy.viewMenu} →
            </button>
          </div>
        </article>
      );
    }

    return (
      <main className="menu-shell public-menus-landing" style={brandStyle}>
        {/* Header con marca y controles */}
        <header className="menu-header">
          <div className="brand" aria-label={`${menu.restaurant.name}, ${copy.menu}`}>
            {branding.logo_path ? (
              <Image
                alt=""
                className="brand-logo"
                height={72}
                src={menuImageUrl(branding.logo_path)}
                width={72}
              />
            ) : (
              <span className="brand-mark" aria-hidden="true" />
            )}
            {menu.restaurant.name}
          </div>

          <div className="menu-header-actions">
            {menu.restaurant.supported_locales.length > 1 ? (
              <label className="menu-control language-control" style={{ margin: 0 }}>
                <span className="visually-hidden">{copy.languages}</span>
                <select
                  aria-label={copy.languages}
                  onChange={(event) => selectLocale(event.target.value)}
                  value={locale}
                >
                  {menu.restaurant.supported_locales.map((supportedLocale) => (
                    <option key={supportedLocale} value={supportedLocale}>
                      {supportedLocale.toUpperCase()}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
          </div>
        </header>

        {/* Hero de Selección de Cartas */}
        <section className="public-menus-hero">
          <span className="public-menus-hero-badge">{copy.chooseMenu}</span>
          <h1 className="public-menus-hero-title">{copy.chooseMenuTitle}</h1>
          <p className="public-menus-hero-subtitle">{copy.chooseMenuSubtitle}</p>
        </section>

        {/* Secciones de Cartas: Disponibles y Fuera de Horario */}
        <section aria-label={copy.chooseMenu} className="public-menus-section">
          <div className="public-menus-groups">
            {/* Cartas Disponibles Ahora */}
            {availableMenus.length > 0 && (
              <div className="public-menus-group">
                {outsideHoursMenus.length > 0 && (
                  <div className="public-menus-group-header">
                    <div className="public-menus-group-status is-available">
                      <span className="status-dot" />
                      <h2>{copy.availableNow}</h2>
                    </div>
                    <span className="public-menus-group-count">{availableMenus.length}</span>
                  </div>
                )}
                <div className="public-menus-grid">
                  {availableMenus.map((m) => renderMenuCard(m, true))}
                </div>
              </div>
            )}

            {/* Cartas Fuera de Horario */}
            {outsideHoursMenus.length > 0 && (
              <div className="public-menus-group public-menus-group-closed">
                <div className="public-menus-group-header">
                  <div className="public-menus-group-status is-outside-hours">
                    <svg
                      aria-hidden="true"
                      fill="none"
                      height="18"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.2"
                      viewBox="0 0 24 24"
                      width="18"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    <h2>{copy.outsideHoursTitle}</h2>
                  </div>
                  <span className="public-menus-group-count">{outsideHoursMenus.length}</span>
                </div>
                <div className="public-menus-grid">
                  {outsideHoursMenus.map((m) => renderMenuCard(m, false))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Footer con información de contacto */}
        {menu.settings.contact.phone ||
        menu.settings.contact.email ||
        menu.settings.contact.address ||
        menu.settings.contact.website ? (
          <footer className="menu-contact" aria-label="Contacto">
            <h2>{menu.restaurant.name}</h2>
            {menu.settings.contact.address ? <p>{menu.settings.contact.address}</p> : null}
            {menu.settings.contact.phone ? (
              <a href={`tel:${menu.settings.contact.phone}`}>{menu.settings.contact.phone}</a>
            ) : null}
            {menu.settings.contact.email ? (
              <a href={`mailto:${menu.settings.contact.email}`}>{menu.settings.contact.email}</a>
            ) : null}
            {menu.settings.contact.website ? (
              <a href={menu.settings.contact.website} rel="noreferrer" target="_blank">
                Sitio web
              </a>
            ) : null}
          </footer>
        ) : null}
      </main>
    );
  }

  // =========================================================================
  // VISTA 2: Detalle de la Carta Seleccionada (Platos por categoría)
  // =========================================================================
  const currentMenu =
    activeMenus.find((m) => m.id === selectedMenuId) ||
    activeMenus[0] || {
      id: "default",
      restaurant_id: menu.restaurant.id,
      name: "Carta Principal",
      description: null,
      banner_path: null,
      is_active: true,
      sort_order: 0,
      schedules: [],
    };

  const activeBannerPath = currentMenu.banner_path || branding.cover_image_path;
  const isCurrentMenuInSchedule = isMenuScheduleActive(currentMenu.schedules, menu.restaurant.timezone);

  const dietaryTags = Array.from(new Set(menu.items.flatMap((item) => item.dietary_tags))).sort();

  // Categorías de la carta seleccionada
  const menuCategories = menu.categories.filter((c) => c.menu_id === currentMenu.id);
  const categories = menuCategories;

  const categoriesToRender =
    !selectedCategoryId || selectedCategoryId === "all"
      ? categories
      : categories.filter((c) => c.id === selectedCategoryId);

  return (
    <main className="menu-shell" style={brandStyle}>
      <header className="menu-header">
        <a className="brand" href="#menu-content" aria-label={`${menu.restaurant.name}, ${copy.menu}`}>
          {branding.logo_path ? (
            <Image
              alt=""
              className="brand-logo"
              height={72}
              src={menuImageUrl(branding.logo_path)}
              width={72}
            />
          ) : (
            <span className="brand-mark" aria-hidden="true" />
          )}
          {menu.restaurant.name}
        </a>

        <div className="menu-header-actions">
          {activeMenus.length > 1 ? (
            <button
              className="back-to-menus-header-btn"
              onClick={() => handleSelectMenu(null)}
              type="button"
            >
              <svg
                aria-hidden="true"
                fill="none"
                height="14"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
                width="14"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
              {copy.allMenus}
            </button>
          ) : null}
        </div>
      </header>

      {/* Banner de la Carta Activa */}
      {activeBannerPath ? (
        <div aria-hidden="true" className="menu-cover">
          <Image
            alt={`Banner ${currentMenu.name}`}
            className="menu-cover-image"
            fill
            priority
            sizes="(max-width: 72rem) 100vw, 72rem"
            src={menuImageUrl(activeBannerPath)}
          />
        </div>
      ) : null}

      {/* Título y descripción de la carta activa */}
      <div className="menu-info-header">
        <div className="menu-info-header-top">
          {activeMenus.length > 1 ? (
            <button
              className="back-to-menus-badge-btn"
              onClick={() => handleSelectMenu(null)}
              type="button"
            >
              ← {copy.allMenus}
            </button>
          ) : null}
          <h1 className="menu-active-title">{currentMenu.name}</h1>
        </div>
        {currentMenu.description && (
          <p className="menu-active-description">{currentMenu.description}</p>
        )}
      </div>

      {/* Alerta si la carta está fuera de horario actual */}
      {!isCurrentMenuInSchedule && (
        <div className="menu-outside-hours-banner">
          <svg
            aria-hidden="true"
            fill="none"
            height="18"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2.2"
            viewBox="0 0 24 24"
            width="18"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <div>
            <strong>{copy.outsideHoursBadge}:</strong>{" "}
            <span>{formatMenuSchedule(currentMenu.schedules, locale)}</span>
          </div>
        </div>
      )}

      {/* Controles: Preferencias e Idioma */}
      {dietaryTags.length > 0 || menu.restaurant.supported_locales.length > 1 ? (
        <section className="menu-controls" aria-label={copy.menu}>
          {dietaryTags.length ? (
            <label className="menu-control">
              <span>{copy.filters}</span>
              <select
                aria-label={copy.filters}
                onChange={(event) => setDietaryFilter(event.target.value || null)}
                value={dietaryFilter ?? ""}
              >
                <option value="">{copy.all}</option>
                {dietaryTags.map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          {menu.restaurant.supported_locales.length > 1 ? (
            <label className="menu-control language-control">
              <span>{copy.languages}</span>
              <select
                aria-label={copy.languages}
                onChange={(event) => selectLocale(event.target.value)}
                value={locale}
              >
                {menu.restaurant.supported_locales.map((supportedLocale) => (
                  <option key={supportedLocale} value={supportedLocale}>
                    {supportedLocale.toUpperCase()}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
        </section>
      ) : null}

      {categories.length > 0 ? (
        <nav
          className="category-nav"
          aria-label={copy.menu}
          onScroll={selectCategoryFromNavScroll}
          ref={categoryNav}
          role="tablist"
        >
          <button
            aria-selected={!selectedCategoryId || selectedCategoryId === "all"}
            className={!selectedCategoryId || selectedCategoryId === "all" ? "is-active" : ""}
            data-category-id="all"
            id="tab-all"
            onClick={() => selectCategory("all")}
            role="tab"
            type="button"
          >
            {copy.all}
          </button>
          {categories.map((category) => (
            <button
              aria-controls={`category-${category.id}`}
              aria-selected={selectedCategoryId === category.id}
              className={selectedCategoryId === category.id ? "is-active" : ""}
              data-category-id={category.id}
              id={`tab-${category.id}`}
              key={category.id}
              onClick={() => selectCategory(category.id)}
              role="tab"
              type="button"
            >
              {translated(category, locale).name}
            </button>
          ))}
        </nav>
      ) : null}

      <section className="menu-content" id="menu-content" aria-live="polite">
        {categoriesToRender.length > 0 ? (() => {
          let hasRenderedAnyItem = false;
          const renderedSections = categoriesToRender.map((category) => {
            const localizedCategory = translated(category, locale);
            const items = menu.items.filter((item) => {
              const matchesCategory = item.category_id === category.id;
              const matchesAvailability =
                menu.settings.unavailable_item_behavior === "show_sold_out" || item.is_available;
              const matchesFilter = !dietaryFilter || item.dietary_tags.includes(dietaryFilter);
              return matchesCategory && matchesAvailability && matchesFilter;
            });

            if (items.length > 0) {
              hasRenderedAnyItem = true;
            } else if (selectedCategoryId !== "all" && selectedCategoryId !== null) {
              return (
                <section
                  aria-labelledby={`tab-${category.id}`}
                  className="menu-section"
                  id={`category-${category.id}`}
                  key={category.id}
                  role="tabpanel"
                >
                  <div className="section-heading">
                    <h2>{localizedCategory.name}</h2>
                    {localizedCategory.description ? <p>{localizedCategory.description}</p> : null}
                  </div>
                  <p className="empty-state">{copy.noItems}</p>
                </section>
              );
            } else {
              return null;
            }

            return (
              <section
                aria-labelledby={`tab-${category.id}`}
                className="menu-section"
                id={`category-${category.id}`}
                key={category.id}
                role="tabpanel"
              >
                <div className="section-heading">
                  <h2>{localizedCategory.name}</h2>
                  {localizedCategory.description ? <p>{localizedCategory.description}</p> : null}
                </div>
                <div className="menu-items-horizontal-list">
                  {items.map((item) => (
                    <DishCardHorizontal
                      key={item.id}
                      item={item}
                      labels={{
                        allergens: copy.allergens,
                        details: copy.details,
                        filters: copy.filters,
                        soldOut: copy.soldOut,
                      }}
                      locale={locale}
                      onSelect={setSelectedItem}
                    />
                  ))}
                </div>
              </section>
            );
          });

          return hasRenderedAnyItem || (selectedCategoryId !== "all" && selectedCategoryId !== null)
            ? renderedSections
            : (
              <p className="empty-state">{copy.noItems}</p>
            );
        })() : (
          <p className="empty-state">{copy.noItems}</p>
        )}
      </section>

      {menu.settings.contact.phone ||
      menu.settings.contact.email ||
      menu.settings.contact.address ||
      menu.settings.contact.website ? (
        <footer className="menu-contact" aria-label="Contacto">
          <h2>{menu.restaurant.name}</h2>
          {menu.settings.contact.address ? <p>{menu.settings.contact.address}</p> : null}
          {menu.settings.contact.phone ? (
            <a href={`tel:${menu.settings.contact.phone}`}>{menu.settings.contact.phone}</a>
          ) : null}
          {menu.settings.contact.email ? (
            <a href={`mailto:${menu.settings.contact.email}`}>{menu.settings.contact.email}</a>
          ) : null}
          {menu.settings.contact.website ? (
            <a href={menu.settings.contact.website} rel="noreferrer" target="_blank">
              Sitio web
            </a>
          ) : null}
        </footer>
      ) : null}

      {selectedItem ? (() => {
        const localizedItem = translated(selectedItem, locale);
        return (
          <div
            aria-label={localizedItem.name}
            className="item-dialog-backdrop"
            onMouseDown={() => setSelectedItem(null)}
            role="presentation"
          >
            <section
              aria-modal="true"
              className="item-dialog"
              onKeyDown={(event) => {
                if (event.key === "Escape") setSelectedItem(null);
              }}
              onMouseDown={(event) => event.stopPropagation()}
              role="dialog"
            >
              <button
                aria-label={copy.close}
                autoFocus
                className="item-dialog-close"
                onClick={() => setSelectedItem(null)}
                type="button"
              >
                ×
              </button>
              {selectedItem.image_path ? (
                <Image
                  alt=""
                  className="item-dialog-image"
                  height={720}
                  src={menuImageUrl(selectedItem.image_path)}
                  width={1280}
                />
              ) : null}
              <div className="item-dialog-content">
                <h2>{localizedItem.name}</h2>
                <strong>
                  {formatPrice(selectedItem.price_cents, selectedItem.currency_code, locale)}
                </strong>
                {localizedItem.description ? <p>{localizedItem.description}</p> : null}
                {selectedItem.dietary_tags.length ? (
                  <p>
                    <b>{copy.filters}:</b> {selectedItem.dietary_tags.join(", ")}
                  </p>
                ) : null}
                {selectedItem.allergens.length ? (
                  <p>
                    <b>{copy.allergens}:</b> {selectedItem.allergens.join(", ")}
                  </p>
                ) : null}
                {!selectedItem.is_available ? <span className="sold-out">{copy.soldOut}</span> : null}
              </div>
            </section>
          </div>
        );
      })() : null}
    </main>
  );
}
