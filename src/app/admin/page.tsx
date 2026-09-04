import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AdminMenuView } from "./admin-menu-view";
import type { Category, Daypart, Menu, MenuItem, MenuSchedule } from "./types";

export const dynamic = "force-dynamic";

export default async function AdminHomePage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase
        .from("profiles")
        .select("restaurant_id")
        .eq("id", user.id)
        .maybeSingle<{ restaurant_id: string | null }>()
    : { data: null };

  if (!profile?.restaurant_id) {
    return (
      <main className="admin-content">
        <h1>Sin restaurante asignado</h1>
      </main>
    );
  }

  const [
    restaurantResult,
    settingsResult,
    daypartsResult,
    categoriesResult,
    itemsResult,
    menusResult,
    schedulesResult,
  ] = await Promise.all([
    supabase
      .from("restaurants")
      .select("id, name, slug, timezone, supported_locales, default_locale, branding")
      .eq("id", profile.restaurant_id)
      .maybeSingle(),
    supabase
      .from("restaurant_settings")
      .select("unavailable_item_behavior, uses_dayparts")
      .eq("restaurant_id", profile.restaurant_id)
      .maybeSingle(),
    supabase
      .from("dayparts")
      .select("id, name, starts_at, ends_at, sort_order")
      .eq("restaurant_id", profile.restaurant_id)
      .order("sort_order"),
    supabase
      .from("menu_categories")
      .select(
        "id, menu_id, name, description, sort_order, is_active, menu_category_translations(locale, name, description), menu_category_dayparts(daypart_id)"
      )
      .eq("restaurant_id", profile.restaurant_id)
      .order("sort_order"),
    supabase
      .from("menu_items")
      .select(
        "id, category_id, name, description, price_cents, currency_code, image_path, image_paths, dietary_tags, allergens, is_available, sort_order, menu_item_translations(locale, name, description)"
      )
      .eq("restaurant_id", profile.restaurant_id)
      .order("sort_order"),
    supabase
      .from("menus")
      .select("id, restaurant_id, name, description, banner_path, is_active, sort_order")
      .eq("restaurant_id", profile.restaurant_id)
      .order("sort_order"),
    supabase
      .from("menu_schedules")
      .select("id, menu_id, day_of_week, starts_at, ends_at, sort_order")
      .eq("restaurant_id", profile.restaurant_id)
      .order("sort_order"),
  ]);

  const restaurant = restaurantResult.data;
  if (!restaurant) {
    return (
      <main className="admin-content">
        <h1>Restaurante no encontrado</h1>
      </main>
    );
  }

  const settings = settingsResult.data ?? {
    unavailable_item_behavior: "show_sold_out" as const,
    uses_dayparts: false,
  };

  const dayparts = (daypartsResult.data ?? []) as Daypart[];
  const rawCategories = (categoriesResult.data ?? []) as Category[];
  const rawItems = (itemsResult.data ?? []) as MenuItem[];
  let itemsList = rawItems;
  if (itemsResult.error) {
    const fallback = await supabase
      .from("menu_items")
      .select(
        "id, category_id, name, description, price_cents, currency_code, image_path, dietary_tags, allergens, is_available, sort_order, menu_item_translations(locale, name, description)"
      )
      .eq("restaurant_id", profile.restaurant_id)
      .order("sort_order");
    itemsList = (fallback.data ?? []) as MenuItem[];
  }

  const items: MenuItem[] = itemsList.map((item) => {
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
    };
  });
  const schedules = (schedulesResult.data ?? []) as MenuSchedule[];

  // Prepare menus: if no menus exist yet (or migration pending), create a virtual default menu
  let menus = (menusResult.data ?? []) as Menu[];
  if (menus.length === 0) {
    const defaultMenuId = "default-main-menu";
    menus = [
      {
        id: defaultMenuId,
        restaurant_id: restaurant.id,
        name: "Carta Principal",
        description: "Nuestra selección de platos y especialidades de la casa.",
        banner_path: (restaurant.branding as Record<string, unknown>)?.cover_image_path as string | null ?? null,
        is_active: true,
        sort_order: 0,
      },
    ];
  }

  // Attach schedules to menus
  const menusWithSchedules = menus.map((menu) => ({
    ...menu,
    schedules: schedules.filter((s) => s.menu_id === menu.id),
  }));

  // Ensure all categories have a valid menu_id (fallback to first menu if null)
  const defaultMenuId = menus[0]?.id;
  const categories = rawCategories.map((c) => ({
    ...c,
    menu_id: c.menu_id || defaultMenuId,
  }));

  return (
    <main className="admin-content-full">
      <AdminMenuView
        categories={categories}
        dayparts={dayparts}
        items={items}
        menus={menusWithSchedules}
        restaurant={restaurant}
        settings={settings}
      />
    </main>
  );
}
