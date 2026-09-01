import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AdminMenuView } from "./admin-menu-view";

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

  const [restaurantResult, settingsResult, daypartsResult, categoriesResult, itemsResult] = await Promise.all([
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
        "id, name, description, sort_order, is_active, menu_category_translations(locale, name, description), menu_category_dayparts(daypart_id)"
      )
      .eq("restaurant_id", profile.restaurant_id)
      .order("sort_order"),
    supabase
      .from("menu_items")
      .select(
        "id, category_id, name, description, price_cents, currency_code, image_path, dietary_tags, allergens, is_available, sort_order, menu_item_translations(locale, name, description)"
      )
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

  const dayparts = daypartsResult.data ?? [];
  const categories = categoriesResult.data ?? [];
  const items = itemsResult.data ?? [];

  return (
    <main className="admin-content-full">
      <AdminMenuView
        categories={categories}
        dayparts={dayparts}
        items={items}
        restaurant={restaurant}
        settings={settings}
      />
    </main>
  );
}

