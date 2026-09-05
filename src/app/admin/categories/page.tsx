import { CategoryManager } from "./category-manager";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function CategoriesPage() {
  const s = await createSupabaseServerClient();
  const { data: { user } } = await s.auth.getUser();
  const { data: p } = user
    ? await s.from("profiles").select("restaurant_id").eq("id", user.id).maybeSingle<{ restaurant_id: string | null }>()
    : { data: null };

  let rawCategories: Array<{
    id: string;
    menu_id: string | null;
    name: string;
    description: string | null;
    sort_order: number;
    is_active: boolean;
    card_layout?: "rectangle" | "hero" | "carousel";
    menu_category_translations?: Array<{ locale: string; name: string; description: string | null }>;
  }> = [];

  if (p?.restaurant_id) {
    const res = await s
      .from("menu_categories")
      .select("id,menu_id,name,description,sort_order,is_active,card_layout,menu_category_translations(locale,name,description)")
      .eq("restaurant_id", p.restaurant_id)
      .order("sort_order");
    if (res.error && res.error.code === "42703") {
      const fallback = await s
        .from("menu_categories")
        .select("id,menu_id,name,description,sort_order,is_active,menu_category_translations(locale,name,description)")
        .eq("restaurant_id", p.restaurant_id)
        .order("sort_order");
      rawCategories = (fallback.data ?? []) as typeof rawCategories;
    } else {
      rawCategories = (res.data ?? []) as typeof rawCategories;
    }
  }

  const [restaurantResult, menusResult, categoryMenusResult] = p?.restaurant_id
    ? await Promise.all([
        s.from("restaurants").select("supported_locales").eq("id", p.restaurant_id).maybeSingle<{ supported_locales: string[] }>(),
        s.from("menus").select("id,name").eq("restaurant_id", p.restaurant_id).order("sort_order"),
        s.from("menu_category_menus").select("menu_id,category_id"),
      ])
    : [{ data: null }, { data: [] }, { data: [] }];
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
        locales={restaurantResult.data?.supported_locales ?? ["es"]}
        menus={menus}
      />
    </main>
  );
}
