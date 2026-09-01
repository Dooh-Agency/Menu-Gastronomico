export type RestaurantBranding = {
  primary_color?: string;
  secondary_color?: string;
  surface_color?: string;
  text_color?: string;
  accent_text_color?: string;
  font_family?: RestaurantFont;
  radius?: "soft" | "rounded" | "square";
  logo_path?: string;
  cover_image_path?: string;
};

export const restaurantFonts = {
  inter: { label: "Inter", cssFamily: "'Inter', Arial, sans-serif" },
  dm_sans: { label: "DM Sans", cssFamily: "'DM Sans', Arial, sans-serif" },
  nunito_sans: { label: "Nunito Sans", cssFamily: "'Nunito Sans', Arial, sans-serif" },
  lora: { label: "Lora", cssFamily: "'Lora', Georgia, serif" },
  playfair_display: { label: "Playfair Display", cssFamily: "'Playfair Display', Georgia, serif" },
} as const;

export type RestaurantFont = keyof typeof restaurantFonts;

export type RestaurantContact = {
  phone?: string;
  email?: string;
  address?: string;
  website?: string;
};

export const defaultBranding: Required<Pick<RestaurantBranding, "primary_color" | "secondary_color" | "surface_color" | "text_color" | "accent_text_color" | "font_family" | "radius">> = {
  primary_color: "#ae4c2c",
  secondary_color: "#f3e5df",
  surface_color: "#fffdf8",
  text_color: "#1f2937",
  accent_text_color: "#ae4c2c",
  font_family: "inter",
  radius: "rounded",
};

export function brandingFor(value: Record<string, unknown> | null | undefined): RestaurantBranding {
  const candidate = value ?? {};
  return {
    primary_color: typeof candidate.primary_color === "string" ? candidate.primary_color : defaultBranding.primary_color,
    secondary_color: typeof candidate.secondary_color === "string" ? candidate.secondary_color : defaultBranding.secondary_color,
    surface_color: typeof candidate.surface_color === "string" ? candidate.surface_color : defaultBranding.surface_color,
    text_color: typeof candidate.text_color === "string" ? candidate.text_color : defaultBranding.text_color,
    accent_text_color: typeof candidate.accent_text_color === "string" ? candidate.accent_text_color : defaultBranding.accent_text_color,
    font_family: typeof candidate.font_family === "string" && candidate.font_family in restaurantFonts ? candidate.font_family as RestaurantFont : defaultBranding.font_family,
    radius: candidate.radius === "soft" || candidate.radius === "square" ? candidate.radius : defaultBranding.radius,
    logo_path: typeof candidate.logo_path === "string" ? candidate.logo_path : undefined,
    cover_image_path: typeof candidate.cover_image_path === "string" ? candidate.cover_image_path : undefined,
  };
}

export function contactFor(value: Record<string, unknown> | null | undefined): RestaurantContact {
  const candidate = value ?? {};
  return Object.fromEntries(
    ["phone", "email", "address", "website"].flatMap((key) => typeof candidate[key] === "string" ? [[key, candidate[key]]] : []),
  ) as RestaurantContact;
}

export function menuImageUrl(imagePath?: string | null): string {
  if (!imagePath) return "";
  if (imagePath.startsWith("/")) return imagePath;
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) return imagePath;
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!baseUrl) return imagePath;
  return `${baseUrl}/storage/v1/object/public/menu-images/${imagePath.split("/").map(encodeURIComponent).join("/")}`;
}

