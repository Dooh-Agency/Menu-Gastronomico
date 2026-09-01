"use client";

import Image from "next/image";
import { menuImageUrl } from "@/lib/restaurant-branding";
import { type DishCardProps, formatDishPrice, translateItem } from "./types";

export function DishCardVertical({
  item,
  locale,
  onSelect,
  className = "",
  labels,
}: DishCardProps) {
  const localized = translateItem(item, locale);
  const priceFormatted = formatDishPrice(item.price_cents, item.currency_code, locale);

  const defaultDetails = locale.startsWith("en") ? "View details" : "Ver detalle";
  const defaultAllergens = locale.startsWith("en") ? "Allergens" : "Alérgenos";
  const defaultSoldOut = locale.startsWith("en") ? "Sold out" : "Agotado";
  const defaultFilters = locale.startsWith("en") ? "Filter by dietary preference" : "Filtrar por preferencias";

  const detailsLabel = labels?.details || defaultDetails;
  const allergensLabel = labels?.allergens || defaultAllergens;
  const soldOutLabel = labels?.soldOut || defaultSoldOut;
  const filtersLabel = labels?.filters || defaultFilters;

  return (
    <article
      className={`menu-card ${!item.is_available ? "is-unavailable" : ""} ${className}`}
      key={item.id}
    >
      {item.image_path || (item.image_paths && item.image_paths.length > 0) ? (() => {
        const thumbPath = item.image_paths?.[0] || item.image_path;
        if (!thumbPath) return null;
        return (
          <Image
            alt=""
            className="menu-image"
            height={720}
            sizes="(max-width: 34rem) 100vw, 33vw"
            src={menuImageUrl(thumbPath)}
            width={1280}
          />
        );
      })() : null}
      <div className="menu-card-content">
        <div className="menu-card-heading">
          <h3>{localized.name}</h3>
          <strong>{priceFormatted}</strong>
        </div>
        {localized.description ? <p>{localized.description}</p> : null}
        {item.dietary_tags.length ? (
          <ul className="tag-list" aria-label={filtersLabel}>
            {item.dietary_tags.map((tag) => (
              <li key={tag}>{tag}</li>
            ))}
          </ul>
        ) : null}
        {item.allergens.length ? (
          <details className="menu-allergens-details">
            <summary>{allergensLabel}</summary>
            <p>
              <b>{allergensLabel}:</b> {item.allergens.join(", ")}
            </p>
          </details>
        ) : null}
        {onSelect ? (
          <button
            className="item-detail-button"
            onClick={() => onSelect(item)}
            type="button"
          >
            {detailsLabel}
          </button>
        ) : null}
        {!item.is_available ? <span className="sold-out">{soldOutLabel}</span> : null}
      </div>
    </article>
  );
}
