"use client";

import Image from "next/image";
import { menuImageUrl } from "@/lib/restaurant-branding";
import { type DishCardProps, formatDishPrice, translateItem } from "./types";

export function DishCardGrid({ item, locale, onSelect, className = "", labels }: DishCardProps) {
  const localized = translateItem(item, locale);
  const priceFormatted = formatDishPrice(item.price_cents, item.currency_code, locale);
  const thumbPath = item.image_paths?.[0] || item.image_path;
  const soldOutLabel = labels?.soldOut || (locale.startsWith("en") ? "Sold out" : "Agotado");

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
        <h3>{localized.name}</h3>
        {localized.description ? <p>{localized.description}</p> : null}
        <strong>{priceFormatted}</strong>
      </div>
    </article>
  );
}
