"use client";

import { type CSSProperties, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { PublicMenu, PublicMenuSchedule } from "@/lib/supabase/public-menu";
import { brandingFor, menuImageUrl, restaurantFonts } from "@/lib/restaurant-branding";
import { DishCardHero, DishCardCompact, DishCardGrid } from "@/components/dish-cards";
import { DishImageCarousel } from "@/components/dish-image-carousel";
import { RestaurantFooter } from "@/components/restaurant-footer";

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
    all: "Todos",
    details: "Ver detalle",
    close: "Cerrar",
    qr: "Ver QR",
    allergens: "Alérgenos",
    soldOut: "Agotado",
    noItems: "No hay platos disponibles para esta selección.",
    outsideHours: "En este momento la carta no está disponible.",
    languages: "Idioma",
    openFilters: "Abrir filtros",
    filterTitle: "Filtros",
    filterDescription: "Elegí las opciones para mostrar solo comidas acordes a tus preferencias.",
    clearFilters: "Limpiar filtros",
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
    all: "All",
    details: "View details",
    close: "Close",
    qr: "View QR",
    allergens: "Allergens",
    soldOut: "Sold out",
    noItems: "There are no dishes available for this selection.",
    outsideHours: "The menu is not available at this time.",
    languages: "Language",
    openFilters: "Open filters",
    filterTitle: "Filters",
    filterDescription: "Choose the options to show only dishes that match your preferences.",
    clearFilters: "Clear filters",
    menus: "Menus",
    unavailableMenu: "This menu is offered from",
  },
} as const;

function copyFor(locale: string) {
  return locale.startsWith("en") ? labels.en : labels.es;
}

function translated<T extends { name: string; description?: string | null; translations?: Array<{ locale: string; name: string; description: string | null }> }>(
  entity: T,
  locale: string,
) {
  if (!entity) return { name: "", description: null };
  const found = Array.isArray(entity.translations)
    ? entity.translations.find((translation) => translation.locale === locale)
    : null;
  return found ?? entity;
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
  const activeMenus = useMemo(() => menu.menus.filter((m) => m.is_active), [menu.menus]);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const menuQueryParam = searchParams.get("menu");

  const [selectedMenuId, setSelectedMenuId] = useState<string | null>(() => {
    if (activeMenus.length === 1) return activeMenus[0]?.id ?? null;
    if (menuQueryParam) {
      const found = activeMenus.find((m) => m.id === menuQueryParam);
      if (found) return found.id;
    }
    return initialMenuId ?? null;
  });

  const [landingTab, setLandingTab] = useState<"available" | "outside" | "all">("available");

  useEffect(() => {
    if (activeMenus.length === 1) {
      setSelectedMenuId(activeMenus[0]?.id ?? null);
    } else if (menuQueryParam) {
      const found = activeMenus.find((m) => m.id === menuQueryParam);
      setSelectedMenuId(found ? found.id : null);
    } else {
      setSelectedMenuId(null);
    }
  }, [menuQueryParam, activeMenus]);

  const [dietaryFilter, setDietaryFilter] = useState<string | null>(null);
  const [allergenFilter, setAllergenFilter] = useState<string | null>(null);
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>("all");
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const isManualScrollRef = useRef(false);
  const manualScrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const categoryNavRef = useRef<HTMLElement>(null);
  const copy = copyFor(locale);

  useEffect(() => {
    if (!isFilterDialogOpen) return;
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") setIsFilterDialogOpen(false); };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isFilterDialogOpen]);

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

  const currentMenu = useMemo(
    () =>
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
      },
    [activeMenus, selectedMenuId, menu.restaurant.id]
  );

  const categories = useMemo(() => {
    return menu.categories
      .filter((c) => c.menu_ids?.includes(currentMenu.id) || c.menu_id === currentMenu.id)
      .sort((a, b) => {
        const orderA = a.menu_assignments?.find((m) => m.menu_id === currentMenu.id)?.sort_order ?? a.sort_order;
        const orderB = b.menu_assignments?.find((m) => m.menu_id === currentMenu.id)?.sort_order ?? b.sort_order;
        return orderA - orderB;
      });
  }, [menu.categories, currentMenu]);

  const dietaryTags = useMemo(
    () => Array.from(new Set(menu.items.flatMap((item) => item.dietary_tags || []))).sort(),
    [menu.items]
  );
  const allAllergens = useMemo(
    () => Array.from(new Set(menu.items.flatMap((item) => item.allergens || []))).sort(),
    [menu.items]
  );

  // Scrollspy: detecta la categoría visible al hacer scroll vertical en la página
  useEffect(() => {
    if (!selectedMenuId) return;

    const handleScroll = () => {
      if (isManualScrollRef.current) return;

      const contentEl = document.getElementById("menu-content");
      if (!contentEl) return;

      const contentRect = contentEl.getBoundingClientRect();
      if (contentRect.top > 80) {
        setSelectedCategoryId("all");
        return;
      }

      const isAtBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 40;

      const sections = categories
        .map((c) => document.getElementById(`category-${c.id}`))
        .filter((el): el is HTMLElement => el !== null);

      if (sections.length === 0) return;

      if (isAtBottom) {
        setSelectedCategoryId(sections[sections.length - 1].id.replace("category-", ""));
        return;
      }

      const threshold = 90;
      let currentId = sections[0].id.replace("category-", "");

      for (const section of sections) {
        const rect = section.getBoundingClientRect();
        if (rect.top <= threshold) {
          currentId = section.id.replace("category-", "");
        } else {
          break;
        }
      }

      setSelectedCategoryId(currentId);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (manualScrollTimeoutRef.current) clearTimeout(manualScrollTimeoutRef.current);
    };
  }, [selectedMenuId, categories]);

  // Mantiene visible la tab activa dentro de la barra de categorías horizontal
  useEffect(() => {
    if (!selectedCategoryId || !categoryNavRef.current) return;
    const tabId = selectedCategoryId === "all" ? "tab-all" : `tab-${selectedCategoryId}`;
    const tabEl = document.getElementById(tabId);
    const nav = categoryNavRef.current;
    if (!tabEl || !nav) return;

    const navRect = nav.getBoundingClientRect();
    const tabRect = tabEl.getBoundingClientRect();

    if (tabRect.left < navRect.left) {
      nav.scrollTo({
        left: nav.scrollLeft + (tabRect.left - navRect.left) - 20,
        behavior: "smooth",
      });
    } else if (tabRect.right > navRect.right) {
      nav.scrollTo({
        left: nav.scrollLeft + (tabRect.right - navRect.right) + 20,
        behavior: "smooth",
      });
    }
  }, [selectedCategoryId]);

  function selectLocale(nextLocale: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (nextLocale === menu.restaurant.default_locale) params.delete("lang");
    else params.set("lang", nextLocale);
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  function handleSelectMenu(menuId: string | null) {
    setSelectedCategoryId("all");
    setDietaryFilter(null);
    setAllergenFilter(null);
    setSelectedMenuId(menuId);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "instant" });
    }
    const params = new URLSearchParams(searchParams.toString());
    if (!menuId || (activeMenus.length <= 1 && menuId === activeMenus[0]?.id)) {
      params.delete("menu");
    } else {
      params.set("menu", menuId);
    }
    const query = params.toString();
    const nextUrl = query ? `${pathname}?${query}` : pathname;
    router.push(nextUrl);
  }

  function selectCategory(categoryId: string) {
    setSelectedCategoryId(categoryId);
    isManualScrollRef.current = true;
    if (manualScrollTimeoutRef.current) clearTimeout(manualScrollTimeoutRef.current);
    manualScrollTimeoutRef.current = setTimeout(() => {
      isManualScrollRef.current = false;
    }, 800);

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const behavior = prefersReducedMotion ? "instant" : "smooth";

    if (categoryId === "all") {
      const content = document.getElementById("menu-content");
      if (content) {
        content.scrollIntoView({ behavior, block: "start" });
      } else {
        window.scrollTo({ top: 0, behavior });
      }
      return;
    }

    const target = document.getElementById(`category-${categoryId}`);
    if (target) {
      target.scrollIntoView({ behavior, block: "start" });
    }
  }

  function renderPublicHeader(isInsideMenu: boolean) {
    return (
      <header className="menu-hero-pill-nav" style={!isInsideMenu ? { marginBottom: "1.75rem" } : undefined}>
        {/* Extremo Izquierdo: Flecha si está dentro de la carta, Foto de Perfil si está en el selector */}
        <div className="menu-hero-pill-left">
          {isInsideMenu ? (
            <button
              aria-label={copy.allMenus}
              className="menu-pill-back-btn"
              onClick={() => handleSelectMenu(null)}
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
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
          ) : branding.logo_path ? (
            <Image
              alt={`Logo ${menu.restaurant.name}`}
              className="menu-pill-logo"
              height={40}
              src={menuImageUrl(branding.logo_path)}
              width={40}
            />
          ) : (
            <span
              style={{
                width: "2.1rem",
                height: "2.1rem",
                borderRadius: "50%",
                backgroundColor: "#3D144C",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                fontSize: "1rem",
              }}
            >
              {menu.restaurant.name.charAt(0)}
            </span>
          )}
        </div>

        {/* Centro: Únicamente el nombre del restaurante (sin foto en el centro, sin punto) */}
        <a className="menu-pill-brand" href={isInsideMenu ? "#menu-content" : "#landing-content"} aria-label={`${menu.restaurant.name}, ${copy.menu}`}>
          <span className="menu-pill-brand-text">
            {menu.restaurant.name}
          </span>
        </a>

        {/* Extremo Derecho: Filtros */}
        <div className="menu-hero-pill-right">
          <button aria-label={copy.openFilters} className="menu-pill-filter-btn" onClick={() => setIsFilterDialogOpen(true)} type="button">
            <svg aria-hidden="true" fill="none" height="16" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="16">
              <path d="M4 6h16M7 12h10M10 18h4" />
            </svg>
          </button>
          {false && menu.restaurant.supported_locales.length > 1 ? (
            <div className="menu-pill-lang-wrapper">
              <span className="menu-pill-lang-icon" aria-hidden="true">
                <svg
                  fill="none"
                  height="15"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.8"
                  viewBox="0 0 24 24"
                  width="15"
                >
                  <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z" />
                  <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10z" />
                </svg>
              </span>
              <span className="menu-pill-lang-label">{locale.toUpperCase()}</span>
              <svg
                className="menu-pill-lang-chevron"
                fill="none"
                height="12"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                width="12"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
              <select
                aria-label={copy.languages}
                className="menu-pill-lang-select"
                onChange={(event) => selectLocale(event.target.value)}
                value={locale}
              >
                {menu.restaurant.supported_locales.map((supportedLocale) => (
                  <option key={supportedLocale} value={supportedLocale}>
                    {supportedLocale.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
        </div>
      </header>
    );
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
      const menuCats = menu.categories.filter((c) => c.menu_ids?.includes(m.id) || c.menu_id === m.id);
      const menuCatIds = new Set(menuCats.map((c) => c.id));
      const menuDishCount = menu.items.filter((i) => menuCatIds.has(i.category_id)).length;
      const bannerPath = m.banner_path || branding.cover_image_path;
      const scheduleText = formatMenuSchedule(m.schedules, locale);

      const params = new URLSearchParams(searchParams.toString());
      params.set("menu", m.id);
      const menuHref = `${pathname}?${params.toString()}`;

      const tagline = isAvailable
        ? (m.description ? "Despertá tus sentidos" : "Experiencia Gastronómica")
        : "Cenas & Experiencia Gourmet";

      return (
        <Link
          aria-label={`Ver carta ${m.name}`}
          className="public-menu-card-v2"
          href={menuHref}
          key={m.id}
          onClick={(e) => {
            e.preventDefault();
            handleSelectMenu(m.id);
          }}
        >
          {/* Cover Box con Imagen y Gradient Overlay */}
          <div className="public-menu-card-v2-cover">
            {bannerPath ? (
              <Image
                alt={`Portada ${m.name}`}
                className="public-menu-card-v2-image"
                fill
                sizes="(max-width: 40rem) 100vw, (max-width: 64rem) 50vw, 33vw"
                src={menuImageUrl(bannerPath)}
              />
            ) : (
              <div className="public-menu-card-placeholder-banner">
                <span className="public-menu-placeholder-mark" />
              </div>
            )}
            <div className="public-menu-card-v2-overlay" />

            {/* Badges Overlay Superior */}
            <div className="public-menu-card-badge-left">
              <span
                style={{
                  width: "0.5rem",
                  height: "0.5rem",
                  borderRadius: "50%",
                  backgroundColor: isAvailable ? "#10B981" : "#F59E0B",
                  display: "inline-block",
                }}
              />
              <span>{isAvailable ? "Servicio Actual" : "Servicio Nocturno"}</span>
            </div>

            {!isAvailable && (
              <div className="public-menu-card-badge-right is-schedule">
                {m.schedules?.[0] ? `Desde ${m.schedules[0].starts_at.slice(0, 5)} hs` : "Próximamente"}
              </div>
            )}
          </div>

          {/* Cuerpo de la Tarjeta */}
          <div className="public-menu-card-v2-body">
            <h2 className="public-menu-card-v2-title">{m.name}</h2>

            {m.description && (
              <p className="public-menu-card-v2-desc">{m.description}</p>
            )}

            {/* Filas de Meta Información */}
            <div className="public-menu-card-v2-meta">
              <div className="public-menu-card-v2-meta-row">
                <div className="public-menu-card-v2-meta-left">
                  <svg
                    aria-hidden="true"
                    fill="none"
                    height="15"
                    stroke="#8C7F77"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    width="15"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  <span>{scheduleText}</span>
                </div>
                <span className={`public-menu-card-status-badge ${isAvailable ? "is-active" : "is-pending"}`}>
                  {isAvailable ? "Activo" : "Fuera de horario"}
                </span>
              </div>

              <div className="public-menu-card-v2-meta-row">
                <div className="public-menu-card-v2-meta-left">
                  <svg
                    aria-hidden="true"
                    fill="none"
                    height="15"
                    stroke="#8C7F77"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    width="15"
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
            </div>

            {/* Botón de Acción Cápsula */}
            {isAvailable ? (
              <span className="public-menu-card-btn-primary">
                {copy.viewMenu} →
              </span>
            ) : (
              <span className="public-menu-card-btn-secondary">
                Explorar detalles de carta ›
              </span>
            )}
          </div>
        </Link>
      );
    }

  return (
    <main className="menu-shell public-menus-landing" style={brandStyle}>
      {/* 1. Header Flotante Reutilizado (Foto a la izquierda, Nombre al centro, Idioma a la derecha) */}
      {renderPublicHeader(false)}

        {/* 2. Hero de Selección Simplificado */}
        <section className="public-menus-hero" style={{ textAlign: "center", marginBottom: "1.75rem", marginTop: "0.5rem" }}>
          <h1 className="public-menus-hero-title-v2">
            ¿Qué te gustaría <span className="public-menus-hero-title-italic" style={{ display: "inline" }}>disfrutar hoy?</span>
          </h1>
        </section>

        {/* 3. Pestañas de Filtrado Fijas por Horario (Tab Bar 50%/50%) */}
        <div className="public-menus-tabs-bar" role="tablist">
          <button
            className={`public-menus-tab-btn ${landingTab === "available" ? "is-active" : ""}`}
            onClick={() => setLandingTab("available")}
            role="tab"
            type="button"
          >
            <span style={{ color: "#10B981" }}>●</span>
            <span>{copy.availableNow}</span>
            <span className="public-menus-tab-count">{availableMenus.length}</span>
          </button>

          <button
            className={`public-menus-tab-btn ${landingTab === "outside" ? "is-active" : ""}`}
            onClick={() => setLandingTab("outside")}
            role="tab"
            type="button"
          >
            <span>⏰</span>
            <span>{copy.outsideHoursTitle}</span>
            <span className="public-menus-tab-count">{outsideHoursMenus.length}</span>
          </button>
        </div>

        {/* 4. Grilla de Cartas Disponibles / Filtradas */}
        <section aria-label={copy.chooseMenu} className="public-menus-section" id="landing-content">
          <div className="public-menus-grid" style={{ display: "grid", gap: "1.5rem", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 20rem), 1fr))" }}>
            {landingTab === "available" && availableMenus.map((m) => renderMenuCard(m, true))}
            {landingTab === "outside" && outsideHoursMenus.map((m) => renderMenuCard(m, false))}
          </div>
        </section>

        {/* 5. Footer de la Landing con Puntos & Datos */}
        <footer className="public-menus-landing-footer">
          <div className="landing-footer-brand">
            <span className="landing-footer-brand-dot">•</span>
            <span>{menu.restaurant.name}</span>
            <span className="landing-footer-brand-dot">•</span>
          </div>
          <p className="landing-footer-sub">Precios expresados en moneda local • IVA incluido</p>
          <p className="landing-footer-domain">
            {menu.settings.contact.website || `${menu.restaurant.slug}.menu.com`}
          </p>
        </footer>
      </main>
    );
  }

  const activeBannerPath = currentMenu.banner_path || branding.cover_image_path;
  const categoriesToRender = categories;

  return (
    <main className="menu-shell" style={brandStyle}>
      {/* Hero Header de la Carta (Diseño Estilo Cápsula & Editorial) */}
      <section className="menu-hero-card">
        {/* Banner de Fondo con Gradient Overlay */}
        {activeBannerPath ? (
          <Image
            alt={`Banner ${currentMenu.name}`}
            className="menu-hero-bg-image"
            fill
            priority
            sizes="(max-width: 72rem) 100vw, 72rem"
            src={menuImageUrl(activeBannerPath)}
          />
        ) : (
          <div className="menu-hero-bg-fallback" />
        )}
        <div className="menu-hero-overlay" />

        {/* 1. Header Flotante Reutilizado (Flecha de volver a la izquierda, Nombre al centro, Idioma a la derecha) */}
        {renderPublicHeader(true)}

        {/* 2. Contenido Inferior Overlay (Título Editorial y Descripción) */}
        <div className="menu-hero-content">

          <h1 className="menu-hero-title">{currentMenu.name}</h1>
          {currentMenu.description && (
            <p className="menu-hero-subtitle">{currentMenu.description}</p>
          )}
        </div>
      </section>

      {isFilterDialogOpen ? (
        <div className="menu-filter-dialog-backdrop" onClick={(event) => { if (event.target === event.currentTarget) setIsFilterDialogOpen(false); }} role="presentation">
          <section aria-labelledby="menu-filter-title" aria-modal="true" className="menu-filter-dialog" role="dialog">
            <div className="menu-filter-dialog-header"><h2 id="menu-filter-title">{copy.filterTitle}</h2><button aria-label={copy.close} className="menu-filter-dialog-close" onClick={() => setIsFilterDialogOpen(false)} type="button">×</button></div>
            <p>{copy.filterDescription}</p>
            {dietaryTags.length > 0 ? <label className="menu-filter-field"><span>{copy.filters}</span><select aria-label={copy.filters} onChange={(event) => setDietaryFilter(event.target.value || null)} value={dietaryFilter ?? ""}><option value="">{copy.all}</option>{dietaryTags.map((tag) => <option key={tag} value={tag}>{tag}</option>)}</select></label> : null}
            {allAllergens.length > 0 ? <label className="menu-filter-field"><span>{copy.allergens}</span><select aria-label={copy.allergens} onChange={(event) => setAllergenFilter(event.target.value || null)} value={allergenFilter ?? ""}><option value="">{copy.all}</option>{allAllergens.map((allergen) => <option key={allergen} value={allergen}>{locale.startsWith("en") ? `Free of ${allergen}` : `Sin ${allergen}`}</option>)}</select></label> : null}
            {menu.restaurant.supported_locales.length > 1 ? <label className="menu-filter-field"><span>{copy.languages}</span><select aria-label={copy.languages} onChange={(event) => selectLocale(event.target.value)} value={locale}>{menu.restaurant.supported_locales.map((supportedLocale) => <option key={supportedLocale} value={supportedLocale}>{supportedLocale.toUpperCase()}</option>)}</select></label> : null}
            <button className="menu-filter-clear" onClick={() => { setDietaryFilter(null); setAllergenFilter(null); }} type="button">{copy.clearFilters}</button>
          </section>
        </div>
      ) : null}

      {/* Controles: Preferencias y Alérgenos uno al lado del otro */}
      {dietaryTags.length > 0 || allAllergens.length > 0 ? (
        <section className="menu-controls menu-controls-legacy" aria-label={copy.menu}>
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

          <label className="menu-control">
            <span>{copy.allergens}</span>
            <select
              aria-label={copy.allergens}
              onChange={(event) => setAllergenFilter(event.target.value || null)}
              value={allergenFilter ?? ""}
            >
              <option value="">{copy.all}</option>
              {allAllergens.map((allergen) => (
                <option key={allergen} value={allergen}>
                  {locale.startsWith("en") ? `Free of ${allergen}` : `Sin ${allergen}`}
                </option>
              ))}
            </select>
          </label>
        </section>
      ) : null}

      {categories.length > 0 ? (
        <nav
          className="category-nav"
          aria-label={copy.menu}
          ref={categoryNavRef}
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
              const matchesFilter = !dietaryFilter || (item.dietary_tags && item.dietary_tags.includes(dietaryFilter));
              const matchesAllergen = !allergenFilter || !(item.allergens && item.allergens.includes(allergenFilter));
              return matchesCategory && matchesAvailability && matchesFilter && matchesAllergen;
            });

            if (items.length > 0) {
              hasRenderedAnyItem = true;
            } else {
              return null;
            }

            return (
              <section
                aria-labelledby={`tab-${category.id}`}
                className="menu-section"
                id={`category-${category.id}`}
                key={category.id}
              >
                <div className="section-heading">
                  <h2>{localizedCategory.name}</h2>
                  {localizedCategory.description ? <p>{localizedCategory.description}</p> : null}
                </div>

                {category.card_layout === "grid" ? (
                  <div className="menu-items-grid">
                    {items.map((item) => <DishCardGrid key={item.id} item={item} locale={locale} onSelect={setSelectedItem} labels={{ soldOut: copy.soldOut }} />)}
                  </div>
                ) : category.card_layout === "hero" ? (
                  <div className="menu-items-hero-grid">
                    {items.map((item) => (
                      <DishCardHero
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
                ) : category.card_layout === "carousel" ? (
                  <div
                    aria-label={localizedCategory.name}
                    className="menu-items-carousel-row"
                    role="region"
                    tabIndex={0}
                  >
                    {items.map((item) => (
                      <DishCardCompact
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
                ) : (
                  <div className="menu-items-grid">
                    {items.map((item) => (
                      <DishCardGrid
                        key={item.id}
                        item={item}
                        labels={{ soldOut: copy.soldOut }}
                        locale={locale}
                        onSelect={setSelectedItem}
                      />
                    ))}
                  </div>
                )}
              </section>
            );
          });

          return hasRenderedAnyItem
            ? renderedSections
            : (
              <p className="empty-state">{copy.noItems}</p>
            );
        })() : (
          <p className="empty-state">{copy.noItems}</p>
        )}
      </section>

      <RestaurantFooter restaurantName={menu.restaurant.name} contact={menu.settings.contact} />

      {selectedItem ? (() => {
        const localizedItem = translated(selectedItem, locale);
        const images = Array.isArray(selectedItem.image_paths) && selectedItem.image_paths.length > 0
          ? selectedItem.image_paths
          : selectedItem.image_path
          ? [selectedItem.image_path]
          : [];
        const dietaryTags = Array.isArray(selectedItem.dietary_tags) ? selectedItem.dietary_tags : [];
        const allergens = Array.isArray(selectedItem.allergens) ? selectedItem.allergens : [];
        const formattedPrice = formatPrice(selectedItem.price_cents ?? 0, selectedItem.currency_code ?? "ARS", locale);

        return (
          <div
            aria-label={localizedItem.name}
            className="item-dialog-backdrop"
            onClick={(e) => {
              if (e.target === e.currentTarget) setSelectedItem(null);
            }}
            role="presentation"
          >
            <section
              aria-modal="true"
              className="item-dialog"
              onClick={(event) => event.stopPropagation()}
              onKeyDown={(event) => {
                if (event.key === "Escape") setSelectedItem(null);
              }}
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
              <DishImageCarousel
                alt={localizedItem.name}
                images={images}
              />
              <div className="item-dialog-content">
                <h2>{localizedItem.name}</h2>
                <strong>{formattedPrice}</strong>
                {localizedItem.description ? <p>{localizedItem.description}</p> : null}
                {dietaryTags.length > 0 ? (
                  <p>
                    <b>{copy.filters}:</b> {dietaryTags.join(", ")}
                  </p>
                ) : null}
                {allergens.length > 0 ? (
                  <p>
                    <b>{copy.allergens}:</b> {allergens.join(", ")}
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
