import { CategoryManager } from "./category-manager";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function CategoriesPage() {
  const s = await createSupabaseServerClient();
  const { data: { user } } = await s.auth.getUser();
  const { data: p } = user
    ? await s.from("profiles").select("restaurant_id").eq("id", user.id).maybeSingle<{ restaurant_id: string | null }>()
    : { data: null };

  const [categoryResult, daypartsResult, restaurantResult, menusResult, categoryMenusResult] = p?.restaurant_id
    ? await Promise.all([
        s.from("menu_categories").select("id,menu_id,name,description,sort_order,is_active,menu_category_translations(locale,name,description),menu_category_dayparts(daypart_id)").eq("restaurant_id", p.restaurant_id).order("sort_order"),
        s.from("dayparts").select("id,name").eq("restaurant_id", p.restaurant_id).order("sort_order"),
        s.from("restaurants").select("supported_locales").eq("id", p.restaurant_id).maybeSingle<{ supported_locales: string[] }>(),
        s.from("menus").select("id,name").eq("restaurant_id", p.restaurant_id).order("sort_order"),
        s.from("menu_category_menus").select("menu_id,category_id"),
      ])
    : [{ data: [] }, { data: [] }, { data: null }, { data: [] }, { data: [] }];

  const rawCategories = categoryResult.data ?? [];
  const menus = menusResult.data ?? [];
  const assignments = (!categoryMenusResult.error && categoryMenusResult.data ? categoryMenusResult.data : []) as Array<{ menu_id: string; category_id: string }>;

  const categories = rawCategories.map((c) => {
    const assigned = assignments.filter((a) => a.category_id === c.id).map((a) => a.menu_id);
    const menuIds = assigned.length > 0 ? assigned : c.menu_id ? [c.menu_id] : [];
    return {
      ...c,
      menu_ids: menuIds,
    };
  });

  return (
    <main className="admin-content">
      <CategoryManager
        categories={categories}
        dayparts={daypartsResult.data ?? []}
        locales={restaurantResult.data?.supported_locales ?? ["es"]}
        menus={menus}
      />
    </main>
  );
}
