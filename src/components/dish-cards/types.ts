import type { PublicMenu } from "@/lib/supabase/public-menu";

export type MenuItem = PublicMenu["items"][number];

export interface DishCardProps {
  item: MenuItem;
  locale: string;
  onSelect?: (item: MenuItem) => void;
  className?: string;
  labels?: {
    details?: string;
    allergens?: string;
    soldOut?: string;
    filters?: string;
  };
}

export function translateItem(item: MenuItem, locale: string) {
  const found = Array.isArray(item?.translations)
    ? item.translations.find((t) => t.locale === locale)
    : null;
  return {
    name: found?.name || item?.name || "",
    description: found?.description !== undefined ? found.description : item?.description ?? null,
  };
}

export function formatDishPrice(cents: number, currency: string, locale: string) {
  return new Intl.NumberFormat(locale.startsWith("en") ? "en-US" : "es-AR", {
    style: "currency",
    currency: currency || "ARS",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}
