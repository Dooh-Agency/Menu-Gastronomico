"use client";

import Image from "next/image";
import { menuImageUrl } from "@/lib/restaurant-branding";
import { type DishCardProps, formatDishPrice, translateItem } from "./types";

export function DishCardHorizontal({
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

  return (
    <article
      aria-label={`${localized.name}, ${priceFormatted}`}
      className={`dish-card-horizontal ${!item.is_available ? "is-unavailable" : ""} ${className}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role={onSelect ? "button" : undefined}
      tabIndex={onSelect ? 0 : undefined}
    >
      {/* Contenido principal del plato (Izquierda) */}
      <div className="dish-card-horizontal-main">
        <div className="dish-card-horizontal-header">
          <h3 className="dish-card-horizontal-title">{localized.name}</h3>
        </div>

        {localized.description ? (
          <p className="dish-card-horizontal-desc">{localized.description}</p>
        ) : null}

        <div className="dish-card-horizontal-footer">
          <div className="dish-card-horizontal-price-wrap">
            <strong className="dish-card-horizontal-price">{priceFormatted}</strong>
          </div>

          <div className="dish-card-horizontal-meta">
            {item.dietary_tags.length > 0 && (
              <div className="dish-card-horizontal-tags" aria-label={filtersLabel}>
                {item.dietary_tags.slice(0, 3).map((tag) => (
                  <span className="dish-card-horizontal-tag" key={tag}>
                    {tag}
                  </span>
                ))}
                {item.dietary_tags.length > 3 && (
                  <span className="dish-card-horizontal-tag is-more">
                    +{item.dietary_tags.length - 3}
                  </span>
                )}
              </div>
            )}

            {!item.is_available && (
              <span className="dish-card-horizontal-soldout">{soldOutLabel}</span>
            )}
          </div>
        </div>
      </div>

      {/* Miniatura del plato (Derecha) */}
      {item.image_path ? (
        <div className="dish-card-horizontal-media">
          <Image
            alt=""
            className="dish-card-horizontal-img"
            fill
            sizes="90px"
            src={menuImageUrl(item.image_path)}
          />
          {!item.is_available && (
            <div className="dish-card-horizontal-media-overlay">
              <span>{soldOutLabel}</span>
            </div>
          )}
        </div>
      ) : null}
    </article>
  );
}
