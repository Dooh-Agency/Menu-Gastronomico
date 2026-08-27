import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function AdminHomePage() {
  const s = await createSupabaseServerClient(); const { data: { user } } = await s.auth.getUser();
  const { data: p } = user ? await s.from("profiles").select("restaurant_id").eq("id", user.id).maybeSingle<{ restaurant_id: string | null }>() : { data: null };
  if (!p?.restaurant_id) return <main className="admin-content"><h1>Sin restaurante asignado</h1></main>;
  const [c, i] = await Promise.all([s.from("menu_categories").select("id", { count: "exact", head: true }).eq("restaurant_id", p.restaurant_id), s.from("menu_items").select("is_available").eq("restaurant_id", p.restaurant_id)]);
  const items = i.data ?? [];
  return <main className="admin-content"><p className="eyebrow">Administración</p><h1>Tu menú</h1><p className="admin-intro">Usá la navegación superior para gestionar categorías y platos.</p><section className="admin-stats"><div><strong>{c.count ?? 0}</strong><span>Categorías</span></div><div><strong>{items.length}</strong><span>Platos</span></div><div><strong>{items.filter(x => x.is_available).length}</strong><span>Disponibles</span></div></section></main>;
}
