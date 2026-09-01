"use client";

import { type CSSProperties, type UIEvent, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import type { PublicMenu } from "@/lib/supabase/public-menu";
import { brandingFor, menuImageUrl, restaurantFonts } from "@/lib/restaurant-branding";

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
    filters: "Filter by dietary preference",
    all: "Inicio",
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
    currency,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export function MenuPublico({
  menu,
  locale,
  currentDaypartId,
  initialMenuId,
}: MenuPublicoProps) {
  const [selectedMenuId, setSelectedMenuId] = useState<string>(
    initialMenuId || menu.menus[0]?.id || "default"
  );
  const [dietaryFilter, setDietaryFilter] = useState<string | null>(null);
  const [selectedDaypartId, setSelectedDaypartId] = useState(
    currentDaypartId ?? menu.dayparts[0]?.id ?? null
  );
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

  // Active menu object
  const currentMenu =
    menu.menus.find((m) => m.id === selectedMenuId) ||
    menu.menus[0] || {
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

  const dietaryTags = Array.from(new Set(menu.items.flatMap((item) => item.dietary_tags))).sort();

  // Filter categories by selected menu
  const menuCategories = menu.categories.filter((c) => c.menu_id === currentMenu.id);

  const categories = menuCategories.filter((category) => {
    if (!menu.settings.uses_dayparts) return true;
    const daypartIds = category.daypart_ids.length ? category.daypart_ids : category.daypart_id ? [category.daypart_id] : [];
    return daypartIds.length === 0 || daypartIds.includes(selectedDaypartId ?? "");
  });

  function selectLocale(nextLocale: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (nextLocale === menu.restaurant.default_locale) params.delete("lang");
    else params.set("lang", nextLocale);
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  const activeDaypart = menu.dayparts.find((daypart) => daypart.id === selectedDaypartId);
  const isActiveMenu = selectedDaypartId === currentDaypartId;

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

  const categoriesToRender = !selectedCategoryId || selectedCategoryId === "all"
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
        <a className="qr-link" href={`/${menu.restaurant.slug}/qr`}>{copy.qr}</a>
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

      {/* Título y descripción de la carta si hay múltiples cartas o si tiene descripción */}
      {(menu.menus.length > 1 || currentMenu.description) && (
        <div className="menu-info-header">
          <h1 className="menu-active-title">{currentMenu.name}</h1>
          {currentMenu.description && (
            <p className="menu-active-description">{currentMenu.description}</p>
          )}
        </div>
      )}

      {/* Selector de Cartas (si hay más de una) y Controles */}
      {(menu.menus.length > 1 || menu.settings.uses_dayparts || dietaryTags.length || menu.restaurant.supported_locales.length > 1) ? (
        <section className="menu-controls" aria-label={copy.menu}>
          {/* Selector de Carta si hay múltiples */}
          {menu.menus.length > 1 ? (
            <label className="menu-control">
              <span>{copy.menus}</span>
              <select
                aria-label={copy.menus}
                onChange={(event) => {
                  setSelectedMenuId(event.target.value);
                  setSelectedCategoryId("all");
                }}
                value={selectedMenuId}
              >
                {menu.menus.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          {menu.settings.uses_dayparts && menu.dayparts.length ? (
            <label className="menu-control">
              <span>{copy.menus}</span>
              <select
                aria-label={copy.menus}
                onChange={(event) => {
                  setSelectedDaypartId(event.target.value);
                  setSelectedCategoryId("all");
                }}
                value={selectedDaypartId ?? ""}
              >
                {menu.dayparts.map((daypart) => (
                  <option key={daypart.id} value={daypart.id}>
                    {daypart.name}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

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

      {activeDaypart && !isActiveMenu ? (
        <p className="menu-availability">
          {copy.unavailableMenu} {activeDaypart.starts_at.slice(0, 5)}–{activeDaypart.ends_at.slice(0, 5)}.
        </p>
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
              const matchesAvailability = menu.settings.unavailable_item_behavior === "show_sold_out" || item.is_available;
              const matchesFilter = !dietaryFilter || item.dietary_tags.includes(dietaryFilter);
              return matchesCategory && matchesAvailability && matchesFilter;
            });

            if (items.length > 0) {
              hasRenderedAnyItem = true;
            } else if (selectedCategoryId !== "all" && selectedCategoryId !== null) {
              return (
                <section aria-labelledby={`tab-${category.id}`} className="menu-section" id={`category-${category.id}`} key={category.id} role="tabpanel">
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
              <section aria-labelledby={`tab-${category.id}`} className="menu-section" id={`category-${category.id}`} key={category.id} role="tabpanel">
                <div className="section-heading">
                  <h2>{localizedCategory.name}</h2>
                  {localizedCategory.description ? <p>{localizedCategory.description}</p> : null}
                </div>
                <div className="menu-grid">
                  {items.map((item) => {
                    const localizedItem = translated(item, locale);
                    return (
                      <article className={`menu-card${item.is_available ? "" : " is-unavailable"}`} key={item.id}>
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
                            <h3>{localizedItem.name}</h3>
                            <strong>{formatPrice(item.price_cents, item.currency_code, locale)}</strong>
                          </div>
                          {localizedItem.description ? <p>{localizedItem.description}</p> : null}
                          {item.dietary_tags.length ? (
                            <ul className="tag-list" aria-label={copy.filters}>
                              {item.dietary_tags.map((tag) => <li key={tag}>{tag}</li>)}
                            </ul>
                          ) : null}
                          {item.allergens.length ? (
                            <details>
                              <summary>{copy.details}</summary>
                              <p><b>{copy.allergens}:</b> {item.allergens.join(", ")}</p>
                            </details>
                          ) : null}
                          <button className="item-detail-button" onClick={() => setSelectedItem(item)} type="button">{copy.details}</button>
                          {!item.is_available ? <span className="sold-out">{copy.soldOut}</span> : null}
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            );
          });

          return hasRenderedAnyItem || (selectedCategoryId !== "all" && selectedCategoryId !== null)
            ? renderedSections
            : <p className="empty-state">{copy.noItems}</p>;
        })() : <p className="empty-state">{copy.noItems}</p>}
      </section>

      {menu.settings.contact.phone || menu.settings.contact.email || menu.settings.contact.address || menu.settings.contact.website ? (
        <footer className="menu-contact" aria-label="Contacto">
          <h2>{menu.restaurant.name}</h2>
          {menu.settings.contact.address ? <p>{menu.settings.contact.address}</p> : null}
          {menu.settings.contact.phone ? <a href={`tel:${menu.settings.contact.phone}`}>{menu.settings.contact.phone}</a> : null}
          {menu.settings.contact.email ? <a href={`mailto:${menu.settings.contact.email}`}>{menu.settings.contact.email}</a> : null}
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
          <div aria-label={localizedItem.name} className="item-dialog-backdrop" onMouseDown={() => setSelectedItem(null)} role="presentation">
            <section aria-modal="true" className="item-dialog" onKeyDown={(event) => { if (event.key === "Escape") setSelectedItem(null); }} onMouseDown={(event) => event.stopPropagation()} role="dialog">
              <button aria-label={copy.close} autoFocus className="item-dialog-close" onClick={() => setSelectedItem(null)} type="button">×</button>
              {selectedItem.image_path ? <Image alt="" className="item-dialog-image" height={720} src={menuImageUrl(selectedItem.image_path)} width={1280} /> : null}
              <div className="item-dialog-content">
                <h2>{localizedItem.name}</h2>
                <strong>{formatPrice(selectedItem.price_cents, selectedItem.currency_code, locale)}</strong>
                {localizedItem.description ? <p>{localizedItem.description}</p> : null}
                {selectedItem.dietary_tags.length ? <p><b>{copy.filters}:</b> {selectedItem.dietary_tags.join(", ")}</p> : null}
                {selectedItem.allergens.length ? <p><b>{copy.allergens}:</b> {selectedItem.allergens.join(", ")}</p> : null}
                {!selectedItem.is_available ? <span className="sold-out">{copy.soldOut}</span> : null}
              </div>
            </section>
          </div>
        );
      })() : null}
    </main>
  );
}
