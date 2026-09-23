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
  established_year?: string;
};

export const restaurantFonts = {
  contemporary: {
    label: "Contemporánea",
    cssFamily: "'Inter', Arial, sans-serif",
    displayCssFamily: "'Inter', Arial, sans-serif",
  },
  editorial: {
    label: "Editorial",
    cssFamily: "'Inter', Arial, sans-serif",
    displayCssFamily: "'Playfair Display', Georgia, serif",
  },
} as const;

export type RestaurantFont = keyof typeof restaurantFonts;

const legacyRestaurantFonts: Record<string, RestaurantFont> = {
  inter: "contemporary",
  dm_sans: "contemporary",
  nunito_sans: "contemporary",
  lora: "editorial",
  playfair_display: "editorial",
};

export function isRestaurantFont(value: string): boolean {
  return value in restaurantFonts || value in legacyRestaurantFonts;
}

export function restaurantFontFor(value: unknown): RestaurantFont {
  if (typeof value !== "string") return "contemporary";
  if (value in restaurantFonts) return value as RestaurantFont;
  return legacyRestaurantFonts[value] ?? "contemporary";
}

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
  font_family: "contemporary",
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
    font_family: restaurantFontFor(candidate.font_family),
    radius: candidate.radius === "soft" || candidate.radius === "square" ? candidate.radius : defaultBranding.radius,
    logo_path: typeof candidate.logo_path === "string" ? candidate.logo_path : undefined,
    cover_image_path: typeof candidate.cover_image_path === "string" ? candidate.cover_image_path : undefined,
    established_year: typeof candidate.established_year === "string" ? candidate.established_year : undefined,
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
