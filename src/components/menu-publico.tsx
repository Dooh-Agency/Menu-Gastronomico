"use client";

import { useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import type { PublicMenu } from "@/lib/supabase/public-menu";

type MenuPublicoProps = {
  menu: PublicMenu;
  locale: string;
  currentDaypartId: string | null;
};

const labels = {
  es: {
    menu: "Menú",
    filters: "Filtrar por preferencias",
    all: "Todo",
    details: "Ver detalle",
    allergens: "Alérgenos",
    soldOut: "Agotado",
    noItems: "No hay platos disponibles para esta selección.",
    outsideHours: "En este momento la carta no está disponible.",
    languages: "Idioma",
    menus: "Cartas",
    currentMenu: "Carta activa",
    unavailableMenu: "Esta carta se ofrece de",
  },
  en: {
    menu: "Menu",
    filters: "Filter by dietary preference",
    all: "All",
    details: "View details",
    allergens: "Allergens",
    soldOut: "Sold out",
    noItems: "There are no dishes available for this selection.",
    outsideHours: "The menu is not available at this time.",
    languages: "Language",
    menus: "Menus",
    currentMenu: "Current menu",
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

function menuImageUrl(imagePath: string) {
  if (imagePath.startsWith("/")) return imagePath;
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) return imagePath;
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!baseUrl) return imagePath;
  return `${baseUrl}/storage/v1/object/public/menu-images/${imagePath.split("/").map(encodeURIComponent).join("/")}`;
}

export function MenuPublico({ menu, locale, currentDaypartId }: MenuPublicoProps) {
  const [dietaryFilter, setDietaryFilter] = useState<string | null>(null);
  const [selectedDaypartId, setSelectedDaypartId] = useState(currentDaypartId ?? menu.dayparts[0]?.id ?? null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const copy = copyFor(locale);

  const dietaryTags = Array.from(new Set(menu.items.flatMap((item) => item.dietary_tags))).sort();
  const categories = menu.categories.filter((category) => {
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
  const selectedCategory = categories.find((category) => category.id === selectedCategoryId) ?? categories[0];
  const categoryIndex = selectedCategory ? categories.indexOf(selectedCategory) : -1;
  const isActiveMenu = selectedDaypartId === currentDaypartId;

  function switchCategory(nextIndex: number) {
    const next = categories[nextIndex];
    if (next) setSelectedCategoryId(next.id);
  }

  return (
    <main className="menu-shell">
      <header className="menu-header">
        <a className="brand" href="#menu-content" aria-label={`${menu.restaurant.name}, ${copy.menu}`}>
          <span className="brand-mark" aria-hidden="true" />
          {menu.restaurant.name}
        </a>
        {menu.restaurant.supported_locales.length > 1 ? (
          <label className="language-picker">
            <span className="sr-only">{copy.languages}</span>
            <select value={locale} onChange={(event) => selectLocale(event.target.value)}>
              {menu.restaurant.supported_locales.map((supportedLocale) => (
                <option key={supportedLocale} value={supportedLocale}>
                  {supportedLocale.toUpperCase()}
                </option>
              ))}
            </select>
          </label>
        ) : null}
      </header>

      <section className="menu-hero" aria-labelledby="menu-title">
        <p className="eyebrow">{copy.menu}</p>
        <h1 id="menu-title">{menu.restaurant.name}</h1>
        {menu.settings.uses_dayparts && activeDaypart ? <p className="daypart-status">{activeDaypart.name}</p> : null}
      </section>

      {menu.settings.uses_dayparts && menu.dayparts.length ? (
        <section className="daypart-switcher" aria-label={copy.menus}>
          <span>{copy.menus}</span>
          <div className="daypart-list" role="group">
            {menu.dayparts.map((daypart) => (
              <button
                aria-label={daypart.id === currentDaypartId ? `${daypart.name} (${copy.currentMenu})` : daypart.name}
                className={selectedDaypartId === daypart.id ? "is-selected" : ""}
                key={daypart.id}
                onClick={() => { setSelectedDaypartId(daypart.id); setSelectedCategoryId(null); }}
                type="button"
              >
                {daypart.name}
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {activeDaypart && !isActiveMenu ? <p className="menu-availability">{copy.unavailableMenu} {activeDaypart.starts_at.slice(0, 5)}–{activeDaypart.ends_at.slice(0, 5)}.</p> : null}

      {dietaryTags.length ? (
        <section className="menu-filters" aria-label={copy.filters}>
          <span>{copy.filters}</span>
          <div className="filter-list">
            <button className={!dietaryFilter ? "is-selected" : ""} onClick={() => setDietaryFilter(null)} type="button">
              {copy.all}
            </button>
            {dietaryTags.map((tag) => (
              <button
                className={dietaryFilter === tag ? "is-selected" : ""}
                key={tag}
                onClick={() => setDietaryFilter(dietaryFilter === tag ? null : tag)}
                type="button"
              >
                {tag}
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {categories.length > 1 ? (
        <nav className="category-nav" aria-label={copy.menu}>
          {categories.map((category) => (
            <a
              aria-current={selectedCategory?.id === category.id ? "true" : undefined}
              className={selectedCategory?.id === category.id ? "is-active" : ""}
              href="#menu-content"
              key={category.id}
              onClick={() => setSelectedCategoryId(category.id)}
            >
              {translated(category, locale).name}
            </a>
          ))}
        </nav>
      ) : null}

      <section className="menu-content" id="menu-content" aria-live="polite">
        {selectedCategory ? (() => {
          const category = selectedCategory;
          const localizedCategory = translated(category, locale);
          const items = menu.items.filter((item) => {
            const matchesCategory = item.category_id === category.id;
            const matchesAvailability = menu.settings.unavailable_item_behavior === "show_sold_out" || item.is_available;
            const matchesFilter = !dietaryFilter || item.dietary_tags.includes(dietaryFilter);
            return matchesCategory && matchesAvailability && matchesFilter;
          });

          if (!items.length) return null;

          return (
            <section className="menu-section" id={`category-${category.id}`} key={category.id} onTouchEnd={(event) => {
              const start = touchStart.current;
              if (!start) return;
              const dx = event.changedTouches[0].clientX - start.x;
              const dy = event.changedTouches[0].clientY - start.y;
              if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) switchCategory(categoryIndex + (dx < 0 ? 1 : -1));
              touchStart.current = null;
            }} onTouchStart={(event) => { touchStart.current = { x: event.touches[0].clientX, y: event.touches[0].clientY }; }}>
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
                        {!item.is_available ? <span className="sold-out">{copy.soldOut}</span> : null}
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          );
        })() : <p className="empty-state">{copy.noItems}</p>}
      </section>
    </main>
  );
}
