"use client";

import { useEffect, useMemo, useState } from "react";
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
    allDay: "Todo el día",
    currentMenu: "Carta activa",
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
    allDay: "All day",
    currentMenu: "Current menu",
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
  const [selectedDaypartId, setSelectedDaypartId] = useState<string | null>(currentDaypartId);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const copy = copyFor(locale);

  const dietaryTags = useMemo(
    () => Array.from(new Set(menu.items.flatMap((item) => item.dietary_tags))).sort(),
    [menu.items],
  );
  const categories = useMemo(
    () =>
      menu.categories.filter(
        (category) => {
          if (!menu.settings.uses_dayparts) return true;
          const daypartIds = category.daypart_ids.length
            ? category.daypart_ids
            : category.daypart_id
              ? [category.daypart_id]
              : [];
          return daypartIds.length === 0 || daypartIds.includes(selectedDaypartId ?? "");
        },
      ),
    [menu.categories, menu.settings.uses_dayparts, selectedDaypartId],
  );

  useEffect(() => {
    const sections = categories
      .map((category) => document.getElementById(`category-${category.id}`))
      .filter((section): section is HTMLElement => section !== null);
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting);
        if (visible) setActiveCategoryId(visible.target.id.replace("category-", ""));
      },
      { rootMargin: "-20% 0px -65% 0px" },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [categories]);

  function selectLocale(nextLocale: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (nextLocale === menu.restaurant.default_locale) params.delete("lang");
    else params.set("lang", nextLocale);
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  const hasOpenDaypart = !menu.settings.uses_dayparts || selectedDaypartId !== null || menu.categories.some((category) => !category.daypart_id && category.daypart_ids.length === 0);
  const activeDaypart = menu.dayparts.find((daypart) => daypart.id === selectedDaypartId);
  const visibleActiveCategoryId = categories.some((category) => category.id === activeCategoryId)
    ? activeCategoryId
    : (categories[0]?.id ?? null);

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
        {menu.settings.uses_dayparts ? <p className="daypart-status">{activeDaypart?.name ?? copy.allDay}</p> : null}
      </section>

      {menu.settings.uses_dayparts && menu.dayparts.length ? (
        <section className="daypart-switcher" aria-label={copy.menus}>
          <span>{copy.menus}</span>
          <div className="daypart-list" role="group">
            <button className={selectedDaypartId === null ? "is-selected" : ""} onClick={() => setSelectedDaypartId(null)} type="button">
              {copy.allDay}
            </button>
            {menu.dayparts.map((daypart) => (
              <button
                aria-label={daypart.id === currentDaypartId ? `${daypart.name} (${copy.currentMenu})` : daypart.name}
                className={selectedDaypartId === daypart.id ? "is-selected" : ""}
                key={daypart.id}
                onClick={() => setSelectedDaypartId(daypart.id)}
                type="button"
              >
                {daypart.name}
              </button>
            ))}
          </div>
        </section>
      ) : null}

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

      {hasOpenDaypart && categories.length > 1 ? (
        <nav className="category-nav" aria-label={copy.menu}>
          {categories.map((category) => (
            <a
              aria-current={visibleActiveCategoryId === category.id ? "true" : undefined}
              className={visibleActiveCategoryId === category.id ? "is-active" : ""}
              href={`#category-${category.id}`}
              key={category.id}
              onClick={() => setActiveCategoryId(category.id)}
            >
              {translated(category, locale).name}
            </a>
          ))}
        </nav>
      ) : null}

      <section className="menu-content" id="menu-content" aria-live="polite">
        {!hasOpenDaypart ? <p className="empty-state">{copy.outsideHours}</p> : null}
        {hasOpenDaypart && categories.map((category) => {
          const localizedCategory = translated(category, locale);
          const items = menu.items.filter((item) => {
            const matchesCategory = item.category_id === category.id;
            const matchesAvailability = menu.settings.unavailable_item_behavior === "show_sold_out" || item.is_available;
            const matchesFilter = !dietaryFilter || item.dietary_tags.includes(dietaryFilter);
            return matchesCategory && matchesAvailability && matchesFilter;
          });

          if (!items.length) return null;

          return (
            <section className="menu-section" id={`category-${category.id}`} key={category.id}>
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
        })}
        {hasOpenDaypart && !categories.some((category) => menu.items.some((item) => item.category_id === category.id && (menu.settings.unavailable_item_behavior === "show_sold_out" || item.is_available) && (!dietaryFilter || item.dietary_tags.includes(dietaryFilter)))) ? <p className="empty-state">{copy.noItems}</p> : null}
      </section>
    </main>
  );
}
