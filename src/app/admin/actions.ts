"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { brandingFor, contactFor, restaurantFonts, type RestaurantFont } from "@/lib/restaurant-branding";

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

function textList(formData: FormData, field: string) {
  const value = formData.get(field);
  if (typeof value !== "string") return [];
  return [...new Set(value.split(",").map((item) => item.trim()).filter(Boolean))].slice(0, 20);
}

function translations(formData: FormData) {
  const locales = textList(formData, "translation_locales");
  return locales.map((locale) => ({
    locale,
    name: typeof formData.get(`translation_${locale}_name`) === "string" ? String(formData.get(`translation_${locale}_name`)).trim() : "",
    description: typeof formData.get(`translation_${locale}_description`) === "string" ? String(formData.get(`translation_${locale}_description`)).trim() : "",
  }));
}

async function replaceTranslations(table: "menu_item_translations" | "menu_category_translations", key: "menu_item_id" | "menu_category_id", id: string, formData: FormData, supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>) {
  for (const translation of translations(formData)) {
    const match = { [key]: id, locale: translation.locale };
    if (!translation.name) {
      const { error } = await supabase.from(table).delete().match(match);
      if (error) throw error;
    } else {
      const { error } = await supabase.from(table).upsert({ ...match, name: translation.name, description: translation.description || null });
      if (error) throw error;
    }
  }
}

async function replaceCategoryDayparts(categoryId: string, formData: FormData, restaurantId: string, supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>) {
  const daypartIds = formData.getAll("daypart_ids").filter((id): id is string => typeof id === "string" && id.length > 0);
  if (daypartIds.length) {
    const { data, error } = await supabase.from("dayparts").select("id").eq("restaurant_id", restaurantId).in("id", daypartIds);
    if (error) throw error;
    if ((data?.length ?? 0) !== daypartIds.length) throw new Error("Franja horaria no válida.");
  }
  const { error: deleteError } = await supabase.from("menu_category_dayparts").delete().eq("menu_category_id", categoryId);
  if (deleteError) throw deleteError;
  if (daypartIds.length) {
    const { error } = await supabase.from("menu_category_dayparts").insert(daypartIds.map((daypart_id) => ({ menu_category_id: categoryId, daypart_id })));
    if (error) throw error;
  }
}

async function uploadItemImage(itemId: string, restaurantId: string, image: File | null, previousPath: string | null, supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>) {
  if (!image || image.size === 0) return previousPath;
  if (image.size > 5 * 1024 * 1024 || !["image/jpeg", "image/png", "image/webp"].includes(image.type)) throw new Error("La imagen debe ser JPG, PNG o WebP y pesar hasta 5 MB.");
  const extension = image.type === "image/png" ? "png" : image.type === "image/webp" ? "webp" : "jpg";
  const path = `${restaurantId}/${itemId}-${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from("menu-images").upload(path, image, { contentType: image.type, upsert: false });
  if (error) throw error;
  if (previousPath?.startsWith(`${restaurantId}/`)) await supabase.storage.from("menu-images").remove([previousPath]);
  return path;
}

function invalidate(slug: string) { revalidatePath("/admin"); revalidatePath("/admin/categories"); revalidatePath("/admin/items"); revalidatePath("/admin/settings"); revalidatePath("/admin/users"); revalidatePath(`/${slug}`); }

function hexColor(formData: FormData, field: string) {
  const value = required(formData, field);
  if (!/^#[0-9a-fA-F]{6}$/.test(value)) throw new Error(`${field} debe ser un color hexadecimal.`);
  return value.toLowerCase();
}

function optionalText(formData: FormData, field: string, maxLength: number) {
  const value = formData.get(field);
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, maxLength) : undefined;
}

async function uploadBrandImage(kind: "logo" | "cover", restaurantId: string, image: File | null, previousPath: string | undefined, supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>) {
  if (!image || image.size === 0) return previousPath;
  if (image.size > 5 * 1024 * 1024 || !["image/jpeg", "image/png", "image/webp"].includes(image.type)) throw new Error("La imagen debe ser JPG, PNG o WebP y pesar hasta 5 MB.");
  const extension = image.type === "image/png" ? "png" : image.type === "image/webp" ? "webp" : "jpg";
  const path = `${restaurantId}/branding/${kind}-${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from("menu-images").upload(path, image, { contentType: image.type, upsert: false });
  if (error) throw error;
  if (previousPath?.startsWith(`${restaurantId}/branding/`)) await supabase.storage.from("menu-images").remove([previousPath]);
  return path;
}

export async function createCategory(formData: FormData) {
  const { supabase, restaurantId, slug } = await context();
  const { data: last } = await supabase.from("menu_categories").select("sort_order").eq("restaurant_id", restaurantId).order("sort_order", { ascending: false }).limit(1).maybeSingle<{ sort_order: number }>();
  const { data, error } = await supabase.from("menu_categories").insert({ restaurant_id: restaurantId, name: required(formData, "name"), description: (formData.get("description") as string | null)?.trim() || null, sort_order: (last?.sort_order ?? -1) + 1 }).select("id").single();
  if (error || !data) throw error ?? new Error("No se pudo crear la categoría.");
  await replaceTranslations("menu_category_translations", "menu_category_id", data.id, formData, supabase);
  await replaceCategoryDayparts(data.id, formData, restaurantId, supabase);
  invalidate(slug);
}

export async function createMenuItem(formData: FormData) {
  const { supabase, restaurantId, slug } = await context();
  const categoryId = required(formData, "category_id");
  const { data: category } = await supabase.from("menu_categories").select("id").eq("id", categoryId).eq("restaurant_id", restaurantId).maybeSingle();
  if (!category) throw new Error("Categoría no válida.");
  const { data: last } = await supabase.from("menu_items").select("sort_order").eq("category_id", categoryId).eq("restaurant_id", restaurantId).order("sort_order", { ascending: false }).limit(1).maybeSingle<{ sort_order: number }>();
  const { data, error } = await supabase.from("menu_items").insert({ restaurant_id: restaurantId, category_id: categoryId, name: required(formData, "name"), description: (formData.get("description") as string | null)?.trim() || null, price_cents: cents(formData), currency_code: "ARS", dietary_tags: textList(formData, "dietary_tags"), allergens: textList(formData, "allergens"), is_available: formData.get("is_available") === "on", sort_order: (last?.sort_order ?? -1) + 1 }).select("id").single();
  if (error || !data) throw error ?? new Error("No se pudo crear el plato.");
  const image = formData.get("image");
  const imagePath = await uploadItemImage(data.id, restaurantId, image instanceof File ? image : null, null, supabase);
  if (imagePath) { const { error: imageError } = await supabase.from("menu_items").update({ image_path: imagePath }).eq("id", data.id).eq("restaurant_id", restaurantId); if (imageError) throw imageError; }
  await replaceTranslations("menu_item_translations", "menu_item_id", data.id, formData, supabase);
  invalidate(slug);
}

export async function updateCategory(formData: FormData) {
  const { supabase, restaurantId, slug } = await context();
  const categoryId = required(formData, "category_id");
  const { error } = await supabase.from("menu_categories").update({ name: required(formData, "name"), description: (formData.get("description") as string | null)?.trim() || null, sort_order: order(formData), is_active: formData.get("is_active") === "on" }).eq("id", categoryId).eq("restaurant_id", restaurantId);
  if (error) throw error;
  await replaceTranslations("menu_category_translations", "menu_category_id", categoryId, formData, supabase);
  await replaceCategoryDayparts(categoryId, formData, restaurantId, supabase);
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
  const { data: item } = await supabase.from("menu_items").select("image_path").eq("id", itemId).eq("restaurant_id", restaurantId).maybeSingle<{ image_path: string | null }>();
  if (!item) throw new Error("Plato no válido.");
  const image = formData.get("image");
  const imagePath = await uploadItemImage(itemId, restaurantId, image instanceof File ? image : null, item.image_path, supabase);
  const { error } = await supabase.from("menu_items").update({
    category_id: categoryId,
    name: required(formData, "name"),
    description: (formData.get("description") as string | null)?.trim() || null,
    price_cents: cents(formData),
    dietary_tags: textList(formData, "dietary_tags"),
    allergens: textList(formData, "allergens"),
    image_path: imagePath,
    is_available: formData.get("is_available") === "on",
    sort_order: order(formData),
  }).eq("id", itemId).eq("restaurant_id", restaurantId);
  if (error) throw error;
  await replaceTranslations("menu_item_translations", "menu_item_id", itemId, formData, supabase);
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

export async function updateRestaurantSettings(formData: FormData) {
  const { supabase, restaurantId, slug } = await context();
  const unavailable_item_behavior = required(formData, "unavailable_item_behavior");
  if (unavailable_item_behavior !== "hide" && unavailable_item_behavior !== "show_sold_out") throw new Error("Configuración de agotados inválida.");
  const { error } = await supabase.from("restaurant_settings").upsert({ restaurant_id: restaurantId, unavailable_item_behavior, uses_dayparts: formData.get("uses_dayparts") === "on" });
  if (error) throw error;
  invalidate(slug);
}

export async function updateRestaurantConfiguration(formData: FormData) {
  const { supabase, restaurantId, slug } = await context();
  const { data: restaurant } = await supabase.from("restaurants").select("name, timezone, supported_locales, default_locale, branding").eq("id", restaurantId).maybeSingle<{ name: string; timezone: string; supported_locales: string[]; default_locale: string; branding: Record<string, unknown> }>();
  if (!restaurant) throw new Error("Restaurante no encontrado.");
  const supported_locales = formData.getAll("supported_locales").filter((locale): locale is string => locale === "es" || locale === "en");
  if (!supported_locales.length) throw new Error("Seleccioná al menos un idioma.");
  const default_locale = required(formData, "default_locale");
  if (!supported_locales.includes(default_locale)) throw new Error("El idioma predeterminado debe estar habilitado.");
  const timezone = required(formData, "timezone");
  try { Intl.DateTimeFormat(undefined, { timeZone: timezone }); } catch { throw new Error("Zona horaria inválida."); }
  const font_family = required(formData, "font_family");
  const radius = required(formData, "radius");
  if (!(font_family in restaurantFonts) || !["soft", "rounded", "square"].includes(radius)) throw new Error("Estilo visual inválido.");
  const oldBranding = brandingFor(restaurant.branding);
  const branding = {
    primary_color: hexColor(formData, "primary_color"), secondary_color: hexColor(formData, "secondary_color"), surface_color: hexColor(formData, "surface_color"), text_color: hexColor(formData, "text_color"), accent_text_color: hexColor(formData, "accent_text_color"),
    font_family: font_family as RestaurantFont, radius: radius as "soft" | "rounded" | "square",
    logo_path: await uploadBrandImage("logo", restaurantId, formData.get("logo") instanceof File ? formData.get("logo") as File : null, oldBranding.logo_path, supabase),
    cover_image_path: await uploadBrandImage("cover", restaurantId, formData.get("cover_image") instanceof File ? formData.get("cover_image") as File : null, oldBranding.cover_image_path, supabase),
  };
  const contact = contactFor({ phone: optionalText(formData, "phone", 60), email: optionalText(formData, "email", 254), address: optionalText(formData, "address", 240), website: optionalText(formData, "website", 240) });
  if (contact.email && !/^\S+@\S+\.\S+$/.test(contact.email)) throw new Error("Email de contacto inválido.");
  if (contact.website) { try { const url = new URL(contact.website); if (!/^https?:$/.test(url.protocol)) throw new Error(); } catch { throw new Error("Sitio web inválido."); } }
  const [{ error: restaurantError }, { error: settingsError }] = await Promise.all([
    supabase.from("restaurants").update({ name: required(formData, "name"), timezone, supported_locales, default_locale, branding }).eq("id", restaurantId),
    supabase.from("restaurant_settings").update({ contact }).eq("restaurant_id", restaurantId),
  ]);
  if (restaurantError) throw restaurantError;
  if (settingsError) throw settingsError;
  invalidate(slug);
}

export async function saveDaypart(formData: FormData) {
  const { supabase, restaurantId, slug } = await context();
  const starts_at = required(formData, "starts_at"); const ends_at = required(formData, "ends_at");
  if (starts_at === ends_at) throw new Error("La franja debe tener una duración.");
  const id = formData.get("daypart_id");
  const payload = { name: required(formData, "name"), starts_at, ends_at, is_active: formData.get("is_active") === "on" };
  const { data: last } = await supabase.from("dayparts").select("sort_order").eq("restaurant_id", restaurantId).order("sort_order", { ascending: false }).limit(1).maybeSingle<{ sort_order: number }>();
  const query = typeof id === "string" && id ? supabase.from("dayparts").update(payload).eq("id", id).eq("restaurant_id", restaurantId) : supabase.from("dayparts").insert({ ...payload, restaurant_id: restaurantId, sort_order: (last?.sort_order ?? -1) + 1 });
  const { error } = await query; if (error) throw error; invalidate(slug);
}

export async function deleteDaypart(formData: FormData) {
  const { supabase, restaurantId, slug } = await context();
  const { error } = await supabase.from("dayparts").delete().eq("id", required(formData, "daypart_id")).eq("restaurant_id", restaurantId);
  if (error) throw error; invalidate(slug);
}

export async function inviteRestaurantAdmin(formData: FormData) {
  const { supabase, restaurantId } = await context();
  const email = required(formData, "email").toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(email)) throw new Error("Email inválido.");
  const { data: caller } = await supabase.auth.getUser();
  if (!caller.user) throw new Error("No autorizado.");
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin.auth.admin.inviteUserByEmail(email, { data: { restaurant_id: restaurantId, role: "restaurant_admin" } });
  if (error || !data.user) throw error ?? new Error("No se pudo invitar a la persona.");
  const { error: profileError } = await admin.from("profiles").upsert({ id: data.user.id, restaurant_id: restaurantId, role: "restaurant_admin", display_name: (formData.get("display_name") as string | null)?.trim() || null });
  if (profileError) throw profileError;
  revalidatePath("/admin/users");
}

export async function signOut() { const supabase = await createSupabaseServerClient(); await supabase.auth.signOut(); redirect("/login"); }
