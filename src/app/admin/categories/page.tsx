import { CategoryManager } from "./category-manager";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function CategoriesPage() {
  const s = await createSupabaseServerClient(); const { data: { user } } = await s.auth.getUser();
  const { data: p } = user ? await s.from("profiles").select("restaurant_id").eq("id", user.id).maybeSingle<{ restaurant_id: string | null }>() : { data: null };
  const [categoryResult, daypartsResult, restaurantResult] = p?.restaurant_id ? await Promise.all([
    s.from("menu_categories").select("id,name,description,sort_order,is_active,menu_category_translations(locale,name,description),menu_category_dayparts(daypart_id)").eq("restaurant_id", p.restaurant_id).order("sort_order"),
    s.from("dayparts").select("id,name").eq("restaurant_id", p.restaurant_id).order("sort_order"),
    s.from("restaurants").select("supported_locales").eq("id", p.restaurant_id).maybeSingle<{ supported_locales: string[] }>(),
  ]) : [{ data: [] }, { data: [] }, { data: null }];
  const categories = categoryResult.data ?? [];
  return <main className="admin-content"><CategoryManager categories={categories} dayparts={daypartsResult.data ?? []} locales={restaurantResult.data?.supported_locales ?? ["es"]}/></main>;
}
