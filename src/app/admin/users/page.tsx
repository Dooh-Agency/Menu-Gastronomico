import { inviteRestaurantAdmin } from "../actions";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type Profile = { id: string; display_name: string | null; role: "restaurant_admin" | "super_admin"; created_at: string };

export default async function UsersPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: current } = user ? await supabase.from("profiles").select("restaurant_id").eq("id", user.id).maybeSingle<{ restaurant_id: string | null }>() : { data: null };
  const { data: profiles } = current?.restaurant_id ? await supabase.from("profiles").select("id,display_name,role,created_at").eq("restaurant_id", current.restaurant_id).order("created_at") : { data: [] };
  return <main className="admin-content"><div className="admin-page-heading"><div><p className="eyebrow">Equipo</p><h1>Usuarios y roles</h1><p className="admin-intro">Invitá administradores para este restaurante. Todos tienen acceso únicamente a este tenant.</p></div></div>
    <section className="admin-section"><form action={inviteRestaurantAdmin} className="invite-form"><label>Nombre <span className="field-optional">Opcional</span><input name="display_name" /></label><label>Email<input name="email" required type="email" /></label><button className="primary-link" type="submit">Enviar invitación</button></form></section>
    <section className="admin-section"><h2>Administradores actuales</h2><div className="admin-editor-list" role="list">{((profiles ?? []) as Profile[]).map((profile) => <div className="user-row" key={profile.id} role="listitem"><strong>{profile.display_name || "Sin nombre"}</strong><span>{profile.role === "restaurant_admin" ? "Administrador del restaurante" : "Super-admin"}</span></div>)}{!profiles?.length ? <p className="empty-state">Todavía no hay administradores asignados.</p> : null}</div></section>
  </main>;
}
