"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type Profile = { restaurant_id: string | null; role: "super_admin" | "restaurant_admin" };

async function context() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autorizado.");
  const { data: profile } = await supabase.from("profiles").select("restaurant_id, role").eq("id", user.id).maybeSingle<Profile>();
  if (!profile?.restaurant_id || profile.role !== "restaurant_admin") throw new Error("No tenés un restaurante asignado.");
  const { data: restaurant } = await supabase.from("restaurants").select("slug").eq("id", profile.restaurant_id).maybeSingle<{ slug: string }>();
  if (!restaurant) throw new Error("Restaurante no encontrado.");
  return { supabase, restaurantId: profile.restaurant_id, slug: restaurant.slug };
}

function required(formData: FormData, field: string) {
  const value = formData.get(field);
  if (typeof value !== "string" || !value.trim()) throw new Error(`${field} es obligatorio.`);
  return value.trim();
}

function cents(formData: FormData) {
  const value = Number(required(formData, "price").replace(",", "."));
  if (!Number.isFinite(value) || value < 0) throw new Error("Precio inválido.");
  return Math.round(value * 100);
}

function order(formData: FormData) {
  const value = Number(required(formData, "sort_order"));
  if (!Number.isInteger(value) || value < 0) throw new Error("Orden inválido.");
  return value;
}

function invalidate(slug: string) { revalidatePath("/admin"); revalidatePath("/admin/categories"); revalidatePath("/admin/items"); revalidatePath(`/${slug}`); }

export async function createCategory(formData: FormData) {
  const { supabase, restaurantId, slug } = await context();
  const { data: last } = await supabase.from("menu_categories").select("sort_order").eq("restaurant_id", restaurantId).order("sort_order", { ascending: false }).limit(1).maybeSingle<{ sort_order: number }>();
  const { error } = await supabase.from("menu_categories").insert({ restaurant_id: restaurantId, name: required(formData, "name"), description: (formData.get("description") as string | null)?.trim() || null, sort_order: (last?.sort_order ?? -1) + 1 });
  if (error) throw error;
  invalidate(slug);
}

export async function createMenuItem(formData: FormData) {
  const { supabase, restaurantId, slug } = await context();
  const categoryId = required(formData, "category_id");
  const { data: category } = await supabase.from("menu_categories").select("id").eq("id", categoryId).eq("restaurant_id", restaurantId).maybeSingle();
  if (!category) throw new Error("Categoría no válida.");
  const { data: last } = await supabase.from("menu_items").select("sort_order").eq("category_id", categoryId).eq("restaurant_id", restaurantId).order("sort_order", { ascending: false }).limit(1).maybeSingle<{ sort_order: number }>();
  const { error } = await supabase.from("menu_items").insert({ restaurant_id: restaurantId, category_id: categoryId, name: required(formData, "name"), description: (formData.get("description") as string | null)?.trim() || null, price_cents: cents(formData), currency_code: "ARS", is_available: formData.get("is_available") === "on", sort_order: (last?.sort_order ?? -1) + 1 });
  if (error) throw error;
  invalidate(slug);
}

export async function updateCategory(formData: FormData) {
  const { supabase, restaurantId, slug } = await context();
  const categoryId = required(formData, "category_id");
  const { error } = await supabase.from("menu_categories").update({ name: required(formData, "name"), description: (formData.get("description") as string | null)?.trim() || null, sort_order: order(formData), is_active: formData.get("is_active") === "on" }).eq("id", categoryId).eq("restaurant_id", restaurantId);
  if (error) throw error;
  invalidate(slug);
}

export async function deleteCategory(formData: FormData) {
  const { supabase, restaurantId, slug } = await context();
  const { error } = await supabase.from("menu_categories").delete().eq("id", required(formData, "category_id")).eq("restaurant_id", restaurantId);
  if (error) throw error;
  invalidate(slug);
}

export async function reorderCategories(formData: FormData) {
  const { supabase, restaurantId, slug } = await context();
  const ids = required(formData, "category_ids").split(",");
  for (const [sort_order, id] of ids.entries()) { const { error } = await supabase.from("menu_categories").update({ sort_order }).eq("id", id).eq("restaurant_id", restaurantId); if (error) throw error; }
  invalidate(slug);
}

export async function updateMenuItem(formData: FormData) {
  const { supabase, restaurantId, slug } = await context();
  const itemId = required(formData, "item_id");
  const categoryId = required(formData, "category_id");
  const { data: category } = await supabase.from("menu_categories").select("id").eq("id", categoryId).eq("restaurant_id", restaurantId).maybeSingle();
  if (!category) throw new Error("Categoría no válida.");
  const { error } = await supabase.from("menu_items").update({
    category_id: categoryId,
    name: required(formData, "name"),
    description: (formData.get("description") as string | null)?.trim() || null,
    price_cents: cents(formData),
    is_available: formData.get("is_available") === "on",
    sort_order: order(formData),
  }).eq("id", itemId).eq("restaurant_id", restaurantId);
  if (error) throw error;
  invalidate(slug);
}

export async function deleteMenuItem(formData: FormData) {
  const { supabase, restaurantId, slug } = await context();
  const { error } = await supabase.from("menu_items").delete().eq("id", required(formData, "item_id")).eq("restaurant_id", restaurantId);
  if (error) throw error;
  invalidate(slug);
}

export async function reorderMenuItems(formData: FormData) {
  const { supabase, restaurantId, slug } = await context();
  const categoryId = required(formData, "category_id");
  const itemIds = required(formData, "item_ids").split(",");
  const { data: category } = await supabase.from("menu_categories").select("id").eq("id", categoryId).eq("restaurant_id", restaurantId).maybeSingle();
  if (!category) throw new Error("Categoría no válida.");
  const { data: items, error: itemsError } = await supabase.from("menu_items").select("id").eq("restaurant_id", restaurantId).eq("category_id", categoryId).in("id", itemIds);
  if (itemsError) throw itemsError;
  if (items?.length !== itemIds.length) throw new Error("Platos no válidos para esta categoría.");
  for (const [sort_order, id] of itemIds.entries()) {
    const { error } = await supabase.from("menu_items").update({ sort_order }).eq("id", id).eq("restaurant_id", restaurantId).eq("category_id", categoryId);
    if (error) throw error;
  }
  invalidate(slug);
}

export async function signOut() { const supabase = await createSupabaseServerClient(); await supabase.auth.signOut(); redirect("/login"); }
