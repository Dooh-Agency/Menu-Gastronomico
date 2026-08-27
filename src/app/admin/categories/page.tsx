import { CategoryManager } from "./category-manager";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function CategoriesPage() {
  const s = await createSupabaseServerClient(); const { data: { user } } = await s.auth.getUser();
  const { data: p } = user ? await s.from("profiles").select("restaurant_id").eq("id", user.id).maybeSingle<{ restaurant_id: string | null }>() : { data: null };
  const categoryResult = p?.restaurant_id ? await s.from("menu_categories").select("id,name,description,sort_order,is_active").eq("restaurant_id", p.restaurant_id).order("sort_order") : { data: [] };
  const categories = categoryResult.data ?? [];
  return <main className="admin-content"><CategoryManager categories={categories}/></main>;
}
