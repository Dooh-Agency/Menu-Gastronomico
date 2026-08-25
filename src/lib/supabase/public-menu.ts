import { createClient } from "@supabase/supabase-js";

type RestaurantRow = {
  id: string;
  name: string;
  slug: string;
  timezone: string;
  supported_locales: string[];
  default_locale: string;
  branding: Record<string, unknown>;
};

type SettingsRow = {
  unavailable_item_behavior: "hide" | "show_sold_out";
  uses_dayparts: boolean;
};

type DaypartRow = {
  id: string;
  name: string;
  starts_at: string;
  ends_at: string;
  sort_order: number;
};

type CategoryRow = {
  id: string;
  daypart_id: string | null;
  daypart_ids: string[];
  name: string;
  description: string | null;
  sort_order: number;
};

type ItemRow = {
  id: string;
  category_id: string;
  name: string;
  description: string | null;
  price_cents: number;
  currency_code: string;
  image_path: string | null;
  dietary_tags: string[];
  allergens: string[];
  is_available: boolean;
  sort_order: number;
};

type TranslationRow = {
  menu_item_id: string;
  locale: string;
  name: string;
  description: string | null;
};

type CategoryTranslationRow = {
  menu_category_id: string;
  locale: string;
  name: string;
  description: string | null;
};

export type PublicMenu = {
  restaurant: RestaurantRow;
  settings: SettingsRow;
  dayparts: DaypartRow[];
  categories: Array<CategoryRow & { translations: CategoryTranslationRow[] }>;
  items: Array<ItemRow & { translations: TranslationRow[] }>;
};

function publicClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    throw new Error("Supabase public environment variables are not configured.");
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function getPublicMenu(slug: string): Promise<PublicMenu | null> {
  const supabase = publicClient();
  const { data: restaurant, error: restaurantError } = await supabase
    .from("restaurants")
    .select("id, name, slug, timezone, supported_locales, default_locale, branding")
    .eq("slug", slug)
    .maybeSingle<RestaurantRow>();

  if (restaurantError) throw restaurantError;
  if (!restaurant) return null;

  const [settingsResult, daypartsResult, categoriesResult, itemsResult] = await Promise.all([
    supabase
      .from("restaurant_settings")
      .select("unavailable_item_behavior, uses_dayparts")
      .eq("restaurant_id", restaurant.id)
      .maybeSingle<SettingsRow>(),
    supabase
      .from("dayparts")
      .select("id, name, starts_at, ends_at, sort_order")
      .eq("restaurant_id", restaurant.id)
      .order("sort_order"),
    supabase
      .from("menu_categories")
      .select("id, daypart_id, name, description, sort_order")
      .eq("restaurant_id", restaurant.id)
      .order("sort_order"),
    supabase
      .from("menu_items")
      .select("id, category_id, name, description, price_cents, currency_code, image_path, dietary_tags, allergens, is_available, sort_order")
      .eq("restaurant_id", restaurant.id)
      .order("sort_order"),
  ]);

  if (settingsResult.error) throw settingsResult.error;
  if (daypartsResult.error) throw daypartsResult.error;
  if (categoriesResult.error) throw categoriesResult.error;
  if (itemsResult.error) throw itemsResult.error;

  const categories = (categoriesResult.data ?? []) as CategoryRow[];
  const items = (itemsResult.data ?? []) as ItemRow[];
  const [itemTranslationsResult, categoryTranslationsResult, categoryDaypartsResult] = await Promise.all([
    items.length
      ? supabase
          .from("menu_item_translations")
          .select("menu_item_id, locale, name, description")
          .in("menu_item_id", items.map((item) => item.id))
      : Promise.resolve({ data: [], error: null }),
    categories.length
      ? supabase
          .from("menu_category_translations")
          .select("menu_category_id, locale, name, description")
          .in("menu_category_id", categories.map((category) => category.id))
      : Promise.resolve({ data: [], error: null }),
    categories.length
      ? supabase
          .from("menu_category_dayparts")
          .select("menu_category_id, daypart_id")
          .in("menu_category_id", categories.map((category) => category.id))
      : Promise.resolve({ data: [], error: null }),
  ]);

  // The table is introduced in the Stage 1 migration. This makes the page still
  // render its default-language categories during the short deploy/migration gap.
  const categoryTranslations = categoryTranslationsResult.error
    ? []
    : ((categoryTranslationsResult.data ?? []) as CategoryTranslationRow[]);
  if (itemTranslationsResult.error) throw itemTranslationsResult.error;

  // The category/daypart mapping was added after the original Stage 1 schema.
  // During the short migration window, legacy `daypart_id` keeps the menu usable.
  const categoryDayparts = categoryDaypartsResult.error
    ? []
    : ((categoryDaypartsResult.data ?? []) as Array<{ menu_category_id: string; daypart_id: string }>);

  return {
    restaurant,
    settings: settingsResult.data ?? { unavailable_item_behavior: "show_sold_out", uses_dayparts: false },
    dayparts: (daypartsResult.data ?? []) as DaypartRow[],
    categories: categories.map((category) => ({
      ...category,
      daypart_ids: categoryDayparts
        .filter((mapping) => mapping.menu_category_id === category.id)
        .map((mapping) => mapping.daypart_id),
      translations: categoryTranslations.filter((translation) => translation.menu_category_id === category.id),
    })),
    items: items.map((item) => ({
      ...item,
      translations: ((itemTranslationsResult.data ?? []) as TranslationRow[]).filter(
        (translation) => translation.menu_item_id === item.id,
      ),
    })),
  };
}
