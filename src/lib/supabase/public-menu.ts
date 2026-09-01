import { createClient } from "@supabase/supabase-js";
import type { RestaurantContact } from "@/lib/restaurant-branding";

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
  contact: RestaurantContact;
};

type DaypartRow = {
  id: string;
  name: string;
  starts_at: string;
  ends_at: string;
  sort_order: number;
};

export type PublicMenuSchedule = {
  id: string;
  menu_id: string;
  day_of_week: number | null;
  starts_at: string;
  ends_at: string;
  sort_order: number;
};

export type PublicMenuRecord = {
  id: string;
  restaurant_id: string;
  name: string;
  description: string | null;
  banner_path: string | null;
  is_active: boolean;
  sort_order: number;
  schedules: PublicMenuSchedule[];
};

type CategoryRow = {
  id: string;
  menu_id: string | null;
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
  image_paths?: string[] | null;
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
  menus: PublicMenuRecord[];
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

  const [
    settingsResult,
    daypartsResult,
    categoriesResult,
    itemsResult,
    menusResult,
    schedulesResult,
  ] = await Promise.all([
    supabase
      .from("restaurant_settings")
      .select("unavailable_item_behavior, uses_dayparts, contact")
      .eq("restaurant_id", restaurant.id)
      .maybeSingle<SettingsRow>(),
    supabase
      .from("dayparts")
      .select("id, name, starts_at, ends_at, sort_order")
      .eq("restaurant_id", restaurant.id)
      .order("sort_order"),
    supabase
      .from("menu_categories")
      .select("id, menu_id, daypart_id, name, description, sort_order")
      .eq("restaurant_id", restaurant.id)
      .order("sort_order"),
    supabase
      .from("menu_items")
      .select(
        "id, category_id, name, description, price_cents, currency_code, image_path, image_paths, dietary_tags, allergens, is_available, sort_order"
      )
      .eq("restaurant_id", restaurant.id)
      .order("sort_order"),
    supabase
      .from("menus")
      .select("id, restaurant_id, name, description, banner_path, is_active, sort_order")
      .eq("restaurant_id", restaurant.id)
      .order("sort_order"),
    supabase
      .from("menu_schedules")
      .select("id, menu_id, day_of_week, starts_at, ends_at, sort_order")
      .eq("restaurant_id", restaurant.id)
      .order("sort_order"),
  ]);

  if (settingsResult.error) throw settingsResult.error;
  if (daypartsResult.error) throw daypartsResult.error;
  if (categoriesResult.error) throw categoriesResult.error;

  let items: ItemRow[] = [];
  if (itemsResult.error) {
    if (itemsResult.error.code === "42703") {
      const fallbackResult = await supabase
        .from("menu_items")
        .select(
          "id, category_id, name, description, price_cents, currency_code, image_path, dietary_tags, allergens, is_available, sort_order"
        )
        .eq("restaurant_id", restaurant.id)
        .order("sort_order");
      if (fallbackResult.error) throw fallbackResult.error;
      items = (fallbackResult.data ?? []) as ItemRow[];
    } else {
      throw itemsResult.error;
    }
  } else {
    items = (itemsResult.data ?? []) as ItemRow[];
  }

  const categories = (categoriesResult.data ?? []) as CategoryRow[];
  const rawMenus = (menusResult.data ?? []) as PublicMenuRecord[];
  const rawSchedules = (schedulesResult.data ?? []) as PublicMenuSchedule[];

  const [itemTranslationsResult, categoryTranslationsResult, categoryDaypartsResult] =
    await Promise.all([
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

  if (itemTranslationsResult.error) throw itemTranslationsResult.error;
  if (categoryTranslationsResult.error) throw categoryTranslationsResult.error;
  if (categoryDaypartsResult.error) throw categoryDaypartsResult.error;

  const categoryTranslations = (categoryTranslationsResult.data ??
    []) as CategoryTranslationRow[];
  const categoryDayparts = (categoryDaypartsResult.data ?? []) as Array<{
    menu_category_id: string;
    daypart_id: string;
  }>;

  let menus = rawMenus;
  if (menus.length === 0) {
    menus = [
      {
        id: "default-main-menu",
        restaurant_id: restaurant.id,
        name: "Carta Principal",
        description: null,
        banner_path: (restaurant.branding as Record<string, unknown>)?.cover_image_path as string | null ?? null,
        is_active: true,
        sort_order: 0,
        schedules: [
          {
            id: "default-schedule",
            menu_id: "default-main-menu",
            day_of_week: null,
            starts_at: "00:00:00",
            ends_at: "23:59:59",
            sort_order: 0,
          },
        ],
      },
    ];
  } else {
    menus = menus.map((m) => ({
      ...m,
      schedules: rawSchedules.filter((s) => s.menu_id === m.id),
    }));
  }

  const defaultMenuId = menus[0]?.id;

  return {
    restaurant,
    settings: settingsResult.data ?? {
      unavailable_item_behavior: "show_sold_out",
      uses_dayparts: false,
      contact: {},
    },
    dayparts: (daypartsResult.data ?? []) as DaypartRow[],
    menus,
    categories: categories.map((category) => ({
      ...category,
      menu_id: category.menu_id || defaultMenuId,
      daypart_ids: categoryDayparts
        .filter((mapping) => mapping.menu_category_id === category.id)
        .map((mapping) => mapping.daypart_id),
      translations: categoryTranslations.filter(
        (translation) => translation.menu_category_id === category.id
      ),
    })),
    items: items.map((item) => {
      const itemImages =
        item.image_paths && Array.isArray(item.image_paths) && item.image_paths.length > 0
          ? item.image_paths
          : item.image_path
          ? [item.image_path]
          : [];

      return {
        ...item,
        image_path: itemImages[0] ?? item.image_path ?? null,
        image_paths: itemImages,
        translations: ((itemTranslationsResult.data ?? []) as TranslationRow[]).filter(
          (translation) => translation.menu_item_id === item.id
        ),
      };
    }),
  };
}
