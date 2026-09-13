import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { signOut } from "./actions";
import { AdminHeader } from "./admin-header";
import { brandingFor, menuImageUrl } from "@/lib/restaurant-branding";

type Profile = { restaurant_id: string | null; role: "super_admin" | "restaurant_admin"; display_name: string | null };
type Restaurant = { name: string; slug: string; branding: Record<string, unknown> | null };

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
    ? await supabase.from("restaurants").select("name, slug, branding").eq("id", profile.restaurant_id).maybeSingle<Restaurant>()
    : { data: null };

  const branding = brandingFor(restaurant?.branding);
  const logoUrl = menuImageUrl(branding.logo_path);

  return (
    <div className="admin-shell">
      <AdminHeader
        restaurantName={restaurant?.name ?? "Plataforma"}
        publicMenuHref={restaurant ? `/${restaurant.slug}` : undefined}
        logoUrl={logoUrl}
        signOutAction={signOut}
      />
      {children}
    </div>
  );
}

