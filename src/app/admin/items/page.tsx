import { ItemManager } from "./item-manager";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function ItemsPage() {
  const s = await createSupabaseServerClient(); const { data: { user } } = await s.auth.getUser(); const { data: p } = user ? await s.from("profiles").select("restaurant_id").eq("id", user.id).maybeSingle<{restaurant_id:string|null}>() : {data:null};
  const [cr, ir, rr] = p?.restaurant_id ? await Promise.all([s.from("menu_categories").select("id,name").eq("restaurant_id",p.restaurant_id).order("sort_order"),s.from("menu_items").select("id,category_id,name,description,price_cents,is_available,sort_order,image_path,dietary_tags,allergens,menu_item_translations(locale,name,description)").eq("restaurant_id",p.restaurant_id).order("sort_order"),s.from("restaurants").select("supported_locales").eq("id",p.restaurant_id).maybeSingle<{supported_locales:string[]}>()]) : [{data:[]},{data:[]},{data:null}]; const categories=cr.data??[]; const items=ir.data??[];
  return <main className="admin-content"><ItemManager categories={categories} items={items} locales={rr.data?.supported_locales??["es"]}/></main>;
}
