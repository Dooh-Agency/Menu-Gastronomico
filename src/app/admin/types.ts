export type MenuSchedule = {
  id: string;
  menu_id: string;
  day_of_week: number | null; // 0=Sunday, 1=Monday, ..., 6=Saturday. null=every day
  starts_at: string;
  ends_at: string;
  sort_order: number;
};

export type Menu = {
  id: string;
  restaurant_id: string;
  name: string;
  description: string | null;
  banner_path: string | null;
  is_active: boolean;
  sort_order: number;
  schedules?: MenuSchedule[];
};

export type Daypart = {
  id: string;
  name: string;
  starts_at: string;
  ends_at: string;
  sort_order: number;
};

export type MenuCategoryAssignment = {
  menu_id: string;
  category_id: string;
  sort_order: number;
};

export type Category = {
  id: string;
  menu_id?: string | null;
  menu_ids?: string[];
  menu_assignments?: Array<{ menu_id: string; sort_order: number }>;
  name: string;
  description: string | null;
  sort_order: number;
  is_active: boolean;
  menu_category_dayparts?: Array<{ daypart_id: string }>;
  menu_category_translations?: Array<{ locale: string; name: string; description: string | null }>;
};

export type MenuItem = {
  id: string;
  category_id: string;
  name: string;
  description: string | null;
  price_cents: number;
  currency_code: string;
  image_path: string | null;
  image_paths?: string[];
  dietary_tags: string[];
  allergens: string[];
  is_available: boolean;
  sort_order: number;
  menu_item_translations?: Array<{ locale: string; name: string; description: string | null }>;
};

export type RestaurantData = {
  id: string;
  name: string;
  slug: string;
  timezone: string;
  supported_locales: string[];
  default_locale: string;
  branding: Record<string, unknown>;
};

export type SettingsData = {
  unavailable_item_behavior: "hide" | "show_sold_out";
  uses_dayparts: boolean;
};
