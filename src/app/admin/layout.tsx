import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { signOut } from "./actions";
import { AdminNav } from "./admin-nav";

type Profile = { restaurant_id: string | null; role: "super_admin" | "restaurant_admin"; display_name: string | null };
type Restaurant = { name: string; slug: string };

export default async function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/admin");

  const { data: profile } = await supabase
    .from("profiles")
    .select("restaurant_id, role, display_name")
    .eq("id", user.id)
    .maybeSingle<Profile>();
  if (!profile?.restaurant_id && profile?.role !== "super_admin") redirect("/login");

  const { data: restaurant } = profile?.restaurant_id
    ? await supabase.from("restaurants").select("name, slug").eq("id", profile.restaurant_id).maybeSingle<Restaurant>()
    : { data: null };

  return (
    <div className="admin-shell">
      <header className="admin-header">
        <Link href="/admin" className="brand"><span className="brand-mark" aria-hidden="true" /> Administración</Link>
        <div className="admin-user">
          <span>{restaurant?.name ?? "Plataforma"}</span>
          <form action={signOut}><button className="text-button" type="submit">Salir</button></form>
        </div>
      </header>
      <AdminNav publicMenuHref={restaurant ? `/${restaurant.slug}` : undefined} />
      {children}
    </div>
  );
}
