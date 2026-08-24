import { createSupabaseServerClient } from "@/lib/supabase/server";

type Profile = { restaurant_id: string | null };
type Restaurant = { name: string; slug: string };
type Category = { id: string; name: string };
type MenuItem = { id: string; name: string; price_cents: number; currency_code: string; is_available: boolean };

function price(value: number, currency: string) {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency, maximumFractionDigits: 0 }).format(value / 100);
}

export default async function AdminHomePage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase.from("profiles").select("restaurant_id").eq("id", user.id).maybeSingle<Profile>();
  if (!profile?.restaurant_id) return <main className="admin-content"><h1>Sin restaurante asignado</h1></main>;

  const [restaurantResult, categoriesResult, itemsResult] = await Promise.all([
    supabase.from("restaurants").select("name, slug").eq("id", profile.restaurant_id).single<Restaurant>(),
    supabase.from("menu_categories").select("id, name").eq("restaurant_id", profile.restaurant_id).order("sort_order"),
    supabase.from("menu_items").select("id, name, price_cents, currency_code, is_available").eq("restaurant_id", profile.restaurant_id).order("sort_order"),
  ]);

  const restaurant = restaurantResult.data;
  const categories = (categoriesResult.data ?? []) as Category[];
  const items = (itemsResult.data ?? []) as MenuItem[];

  return (
    <main className="admin-content">
      <p className="eyebrow">Panel de {restaurant?.name ?? "restaurante"}</p>
      <h1>Menú</h1>
      <p className="admin-intro">Esta primera vista confirma tu acceso y muestra exclusivamente el contenido de tu restaurante.</p>
      <section className="admin-stats" aria-label="Resumen del menú">
        <div><strong>{categories.length}</strong><span>Categorías</span></div>
        <div><strong>{items.length}</strong><span>Platos</span></div>
        <div><strong>{items.filter((item) => item.is_available).length}</strong><span>Disponibles</span></div>
      </section>
      <section className="admin-section">
        <h2>Platos actuales</h2>
        {items.length ? <ul className="admin-list">
          {items.map((item) => <li key={item.id}><span>{item.name}{!item.is_available ? " · Agotado" : ""}</span><strong>{price(item.price_cents, item.currency_code)}</strong></li>)}
        </ul> : <p>No hay platos cargados todavía.</p>}
      </section>
    </main>
  );
}
