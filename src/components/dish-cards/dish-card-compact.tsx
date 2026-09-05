"use client";

import Image from "next/image";
import { menuImageUrl } from "@/lib/restaurant-branding";
import { type DishCardProps, formatDishPrice, translateItem } from "./types";

export function DishCardCompact({
  item,
  locale,
  onSelect,
  className = "",
  labels,
}: DishCardProps) {
  const localized = translateItem(item, locale);
  const priceFormatted = formatDishPrice(item.price_cents, item.currency_code, locale);

  const defaultSoldOut = locale.startsWith("en") ? "Sold out" : "Agotado";
  const defaultFilters = locale.startsWith("en") ? "Filter by dietary preference" : "Filtrar por preferencias";

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
      className={`dish-card-compact ${!item.is_available ? "is-unavailable" : ""} ${className}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role={onSelect ? "button" : undefined}
      tabIndex={onSelect ? 0 : undefined}
    >
      {/* Imagen Cuadrada Compacta */}
      <div className="dish-card-compact-media">
        {thumbPath ? (
          <Image
            alt=""
            className="dish-card-compact-img"
            fill
            sizes="(max-width: 768px) 200px, 220px"
            src={menuImageUrl(thumbPath)}
          />
        ) : (
          <div className="dish-card-compact-placeholder">
            <svg
              fill="none"
              height="28"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              viewBox="0 0 24 24"
              width="28"
            >
              <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
              <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
              <line x1="6" x2="6" y1="1" y2="4" />
              <line x1="10" x2="10" y1="1" y2="4" />
              <line x1="14" x2="14" y1="1" y2="4" />
            </svg>
          </div>
        )}

        {totalPhotos > 1 && item.is_available ? (
          <div className="dish-card-compact-photos-badge" aria-label={`${totalPhotos} fotos`}>
            <svg
              aria-hidden="true"
              fill="none"
              height="10"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.2"
              viewBox="0 0 24 24"
              width="10"
            >
              <rect height="18" rx="2" ry="2" width="18" x="3" y="3" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            <span>{totalPhotos}</span>
          </div>
        ) : null}

        {!item.is_available && (
          <div className="dish-card-compact-media-overlay">
            <span>{soldOutLabel}</span>
          </div>
        )}
      </div>

      {/* Contenido / Información Compacta */}
      <div className="dish-card-compact-body">
        <h3 className="dish-card-compact-title">{localized.name}</h3>

        {localized.description ? (
          <p className="dish-card-compact-desc">{localized.description}</p>
        ) : null}

        <div className="dish-card-compact-footer">
          <strong className="dish-card-compact-price">{priceFormatted}</strong>

          {Array.isArray(item.dietary_tags) && item.dietary_tags.length > 0 && (
            <div className="dish-card-compact-tags" aria-label={filtersLabel}>
              <span className="dish-card-compact-tag">
                {item.dietary_tags[0]}
              </span>
              {item.dietary_tags.length > 1 && (
                <span className="dish-card-compact-tag is-more">
                  +{item.dietary_tags.length - 1}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
