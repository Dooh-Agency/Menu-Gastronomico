import { deleteDaypart, saveDaypart, updateRestaurantSettings } from "../actions";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type Settings = { unavailable_item_behavior: "hide" | "show_sold_out"; uses_dayparts: boolean };
type Daypart = { id: string; name: string; starts_at: string; ends_at: string; is_active: boolean };

export default async function SettingsPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = user ? await supabase.from("profiles").select("restaurant_id").eq("id", user.id).maybeSingle<{ restaurant_id: string | null }>() : { data: null };
  const restaurantId = profile?.restaurant_id;
  const [settingsResult, daypartsResult] = restaurantId ? await Promise.all([
    supabase.from("restaurant_settings").select("unavailable_item_behavior,uses_dayparts").eq("restaurant_id", restaurantId).maybeSingle<Settings>(),
    supabase.from("dayparts").select("id,name,starts_at,ends_at,is_active").eq("restaurant_id", restaurantId).order("sort_order"),
  ]) : [{ data: null }, { data: [] }];
  const settings = settingsResult.data ?? { unavailable_item_behavior: "show_sold_out", uses_dayparts: false };
  const dayparts = (daypartsResult.data ?? []) as Daypart[];

  return <main className="admin-content"><div className="admin-page-heading"><div><p className="eyebrow">Configuración</p><h1>Cartas y disponibilidad</h1><p className="admin-intro">Definí cuándo se muestra cada carta y cómo se ven los productos agotados.</p></div></div>
    <section className="admin-section"><form action={updateRestaurantSettings} className="settings-form"><fieldset><legend>Productos no disponibles</legend><label><input defaultChecked={settings.unavailable_item_behavior === "show_sold_out"} name="unavailable_item_behavior" type="radio" value="show_sold_out" /> Mostrar como agotados</label><label><input defaultChecked={settings.unavailable_item_behavior === "hide"} name="unavailable_item_behavior" type="radio" value="hide" /> Ocultar del menú público</label></fieldset><label className="checkbox-label"><input defaultChecked={settings.uses_dayparts} name="uses_dayparts" type="checkbox" />Usar cartas por franja horaria</label><button className="primary-link" type="submit">Guardar configuración</button></form></section>
    <section className="admin-section"><h2>Franjas horarias</h2><p className="admin-intro">Después podés asignar cada categoría a una o varias franjas desde Categorías.</p><div className="daypart-list-admin">{dayparts.map((daypart) => <form action={saveDaypart} className="daypart-form" key={daypart.id}><input name="daypart_id" type="hidden" value={daypart.id} /><label>Nombre<input defaultValue={daypart.name} name="name" required /></label><label>Desde<input defaultValue={daypart.starts_at.slice(0, 5)} name="starts_at" required type="time" /></label><label>Hasta<input defaultValue={daypart.ends_at.slice(0, 5)} name="ends_at" required type="time" /></label><label className="checkbox-label"><input defaultChecked={daypart.is_active} name="is_active" type="checkbox" />Activa</label><button className="secondary-link" type="submit">Guardar</button><button className="text-button danger-text" formAction={deleteDaypart} type="submit">Eliminar</button></form>)}</div>
      <form action={saveDaypart} className="daypart-form new-daypart"><label>Nombre<input name="name" required /></label><label>Desde<input name="starts_at" required type="time" /></label><label>Hasta<input name="ends_at" required type="time" /></label><input name="is_active" type="hidden" value="on" /><button className="primary-link" type="submit">Agregar franja</button></form>
    </section>
  </main>;
}
