"use client";

import Image from "next/image";
import { menuImageUrl } from "@/lib/restaurant-branding";
import { type DishCardProps, formatDishPrice, translateItem } from "./types";

export function DishCardHero({
  item,
  locale,
  onSelect,
  className = "",
  labels,
}: DishCardProps) {
  const localized = translateItem(item, locale);
  const priceFormatted = formatDishPrice(item.price_cents, item.currency_code, locale);

  const defaultDetails = locale.startsWith("en") ? "View details" : "Ver detalle";
  const defaultSoldOut = locale.startsWith("en") ? "Agotado" : "Agotado";
  const defaultFilters = locale.startsWith("en") ? "Filter by dietary preference" : "Filtrar por preferencias";

  const detailsLabel = labels?.details || defaultDetails;
  const soldOutLabel = labels?.soldOut || defaultSoldOut;
  const filtersLabel = labels?.filters || defaultFilters;

  function handleClick() {
    if (onSelect) {
      onSelect(item);
    }
  }

  function handleKeyDown(event: React.KeyboardEvent) {
    if (onSelect && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      onSelect(item);
    }
  }

  const thumbPath = item.image_paths?.[0] || item.image_path;
  const totalPhotos = item.image_paths?.length ?? (item.image_path ? 1 : 0);

  return (
    <article
      aria-label={`${localized.name}, ${priceFormatted}`}
      className={`dish-card-hero ${!item.is_available ? "is-unavailable" : ""} ${className}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role={onSelect ? "button" : undefined}
      tabIndex={onSelect ? 0 : undefined}
    >
      {/* Imagen Grande / Cuadrada */}
      {thumbPath ? (
        <div className="dish-card-hero-media">
          <Image
            alt=""
            className="dish-card-hero-img"
            fill
            sizes="(max-width: 768px) 100vw, 600px"
            src={menuImageUrl(thumbPath)}
          />
          {totalPhotos > 1 && item.is_available ? (
            <div className="dish-card-hero-photos-badge" aria-label={`${totalPhotos} fotos`}>
              <svg
                aria-hidden="true"
                fill="none"
                height="12"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.2"
                viewBox="0 0 24 24"
                width="12"
              >
                <rect height="18" rx="2" ry="2" width="18" x="3" y="3" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              <span>{totalPhotos}</span>
            </div>
          ) : null}

          {!item.is_available && (
            <div className="dish-card-hero-media-overlay">
              <span>{soldOutLabel}</span>
            </div>
          )}
        </div>
      ) : null}

      {/* Contenido / Información */}
      <div className="dish-card-hero-body">
        <div className="dish-card-hero-header">
          <h3 className="dish-card-hero-title">{localized.name}</h3>
          <strong className="dish-card-hero-price">{priceFormatted}</strong>
        </div>

        {localized.description ? (
          <p className="dish-card-hero-desc">{localized.description}</p>
        ) : null}

        <div className="dish-card-hero-footer">
          {Array.isArray(item.dietary_tags) && item.dietary_tags.length > 0 && (
            <div className="dish-card-hero-tags" aria-label={filtersLabel}>
              {item.dietary_tags.map((tag) => (
                <span className="dish-card-hero-tag" key={tag}>
                  {tag}
                </span>
              ))}
            </div>
          )}

          {!item.is_available && (
            <span className="dish-card-hero-soldout">{soldOutLabel}</span>
          )}
        </div>
      </div>
    </article>
  );
}
