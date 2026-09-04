import { ItemManager } from "./item-manager";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function ItemsPage({
  searchParams,
}: {
  searchParams?: Promise<{ category?: string }>;
}) {
  const resolvedParams = searchParams ? await searchParams : {};
  const initialCategoryId = typeof resolvedParams.category === "string" ? resolvedParams.category : "all";

  const s = await createSupabaseServerClient();
  const { data: { user } } = await s.auth.getUser();
  const { data: p } = user
    ? await s.from("profiles").select("restaurant_id").eq("id", user.id).maybeSingle<{ restaurant_id: string | null }>()
    : { data: null };

  const [cr, ir, rr] = p?.restaurant_id
    ? await Promise.all([
        s.from("menu_categories").select("id,name").eq("restaurant_id", p.restaurant_id).order("sort_order"),
        s.from("menu_items").select("id,category_id,name,description,price_cents,is_available,sort_order,image_path,image_paths,dietary_tags,allergens,menu_item_translations(locale,name,description)").eq("restaurant_id", p.restaurant_id).order("sort_order"),
        s.from("restaurants").select("supported_locales").eq("id", p.restaurant_id).maybeSingle<{ supported_locales: string[] }>(),
      ])
    : [{ data: [] }, { data: [] }, { data: null }];

  const categories = cr.data ?? [];
  let rawItems = ir.data ?? [];
  if (ir.error && ir.error.code === "42703" && p?.restaurant_id) {
    const fallback = await s
      .from("menu_items")
      .select("id,category_id,name,description,price_cents,is_available,sort_order,image_path,dietary_tags,allergens,menu_item_translations(locale,name,description)")
      .eq("restaurant_id", p.restaurant_id)
      .order("sort_order");
    rawItems = (fallback.data ?? []) as typeof rawItems;
  }

  const items = rawItems.map((item) => ({
    ...item,
    image_paths: (item as { image_paths?: string[] }).image_paths,
  }));

  return (
    <main className="admin-content">
      <ItemManager
        categories={categories}
        initialCategoryId={initialCategoryId}
        items={items}
        locales={rr.data?.supported_locales ?? ["es"]}
      />
    </main>
  );
}

