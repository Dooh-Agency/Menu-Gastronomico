import { createSupabaseServerClient } from "@/lib/supabase/server";
import { brandingFor, contactFor } from "@/lib/restaurant-branding";
import { SettingsView } from "./settings-view";

type Settings = { unavailable_item_behavior: "hide" | "show_sold_out"; contact: Record<string, unknown> };
type Restaurant = {
  name: string;
  timezone: string;
  supported_locales: string[];
  default_locale: string;
  branding: Record<string, unknown>;
};

export default async function SettingsPage() {
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

  const restaurantId = profile?.restaurant_id;

  const [restaurantResult, settingsResult] = restaurantId
    ? await Promise.all([
        supabase
          .from("restaurants")
          .select("name,timezone,supported_locales,default_locale,branding")
          .eq("id", restaurantId)
          .maybeSingle<Restaurant>(),
        supabase
          .from("restaurant_settings")
          .select("unavailable_item_behavior,contact")
          .eq("restaurant_id", restaurantId)
          .maybeSingle<Settings>(),
      ])
    : [{ data: null }, { data: null }];

  if (!restaurantResult.data) {
    return (
      <main className="admin-content">
        <h1>Restaurante no encontrado</h1>
      </main>
    );
  }

  const restaurant = restaurantResult.data;
  const settings = settingsResult.data ?? { unavailable_item_behavior: "show_sold_out", contact: {} };
  const branding = brandingFor(restaurant.branding);
  const contact = contactFor(settings.contact);

  return (
    <main className="admin-content">
      <div className="admin-page-heading">
        <div>
          <p className="eyebrow">Configuración</p>
          <h1>Identidad y operación</h1>
          <p className="admin-intro">Personalizá la experiencia del restaurante sin cambiar código.</p>
        </div>
      </div>

      <SettingsView
        restaurant={{
          name: restaurant.name,
          timezone: restaurant.timezone,
          supported_locales: restaurant.supported_locales,
          default_locale: restaurant.default_locale,
          branding,
        }}
        settings={{
          unavailable_item_behavior: settings.unavailable_item_behavior,
          contact,
        }}
      />
    </main>
  );
}
