"use client";

import Image from "next/image";
import { menuImageUrl } from "@/lib/restaurant-branding";
import { type DishCardProps, formatDishPrice, translateItem } from "./types";

export function DishCardGrid({ item, locale, onSelect, className = "", labels }: DishCardProps) {
  const localized = translateItem(item, locale);
  const priceFormatted = formatDishPrice(item.price_cents, item.currency_code, locale);
  const thumbPath = item.image_paths?.[0] || item.image_path;
  const soldOutLabel = labels?.soldOut || (locale.startsWith("en") ? "Sold out" : "Agotado");
  const filtersLabel = labels?.filters || (locale.startsWith("en") ? "Dietary preferences" : "Preferencias dietarias");
  const allergensLabel = labels?.allergens || (locale.startsWith("en") ? "Contains" : "Contiene");
  const dietaryTags = Array.isArray(item.dietary_tags) ? item.dietary_tags : [];
  const allergens = Array.isArray(item.allergens) ? item.allergens : [];

  return (
    <article
      aria-label={`${localized.name}, ${priceFormatted}`}
      className={`dish-card-grid ${!item.is_available ? "is-unavailable" : ""} ${className}`}
      onClick={onSelect ? () => onSelect(item) : undefined}
      onKeyDown={onSelect ? (event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); onSelect(item); } } : undefined}
      role={onSelect ? "button" : undefined}
      tabIndex={onSelect ? 0 : undefined}
    >
      <div className="dish-card-grid-media">
        {thumbPath ? <Image alt="" className="dish-card-grid-img" fill sizes="(max-width: 640px) 50vw, 240px" src={menuImageUrl(thumbPath)} /> : null}
        {!item.is_available ? <span className="dish-card-grid-soldout">{soldOutLabel}</span> : null}
      </div>
      <div className="dish-card-grid-body">
        <div className="dish-card-grid-heading">
          <h3>{localized.name}</h3>
          <strong>{priceFormatted}</strong>
        </div>
        {localized.description ? <p>{localized.description}</p> : null}
        {(dietaryTags.length > 0 || allergens.length > 0) && (
          <div className="dish-card-grid-meta">
            {dietaryTags.length > 0 && (
              <div className="dish-card-grid-tags" aria-label={filtersLabel}>
                <span className="dish-card-grid-tag">{dietaryTags[0]}</span>
                {dietaryTags.length > 1 && <span className="dish-card-grid-tag is-more">+{dietaryTags.length - 1}</span>}
              </div>
            )}
            {allergens.length > 0 && (
              <div className="dish-card-grid-tags" aria-label={labels?.allergens || (locale.startsWith("en") ? "Allergens" : "Alérgenos")}>
                <span className="dish-card-grid-tag is-allergen">{allergensLabel} {allergens[0]}</span>
                {allergens.length > 1 && <span className="dish-card-grid-tag is-more">+{allergens.length - 1}</span>}
              </div>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
