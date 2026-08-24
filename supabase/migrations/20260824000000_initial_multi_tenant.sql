create extension if not exists "pgcrypto";

create type public.app_role as enum ('super_admin', 'restaurant_admin');
create type public.unavailable_item_behavior as enum ('hide', 'show_sold_out');

create table public.restaurants (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 120),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  timezone text not null default 'America/Argentina/Buenos_Aires',
  supported_locales text[] not null default array['es']::text[] check (cardinality(supported_locales) > 0),
  default_locale text not null default 'es',
  is_active boolean not null default true,
  branding jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (default_locale = any(supported_locales))
);

create table public.restaurant_settings (
  restaurant_id uuid primary key references public.restaurants(id) on delete cascade,
  unavailable_item_behavior public.unavailable_item_behavior not null default 'show_sold_out',
  uses_dayparts boolean not null default false,
  contact jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  restaurant_id uuid references public.restaurants(id) on delete set null,
  role public.app_role not null default 'restaurant_admin',
  display_name text,
  created_at timestamptz not null default now(),
  check ((role = 'super_admin' and restaurant_id is null) or (role = 'restaurant_admin' and restaurant_id is not null))
);

create table public.dayparts (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  name text not null,
  starts_at time not null,
  ends_at time not null,
  sort_order integer not null default 0 check (sort_order >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (restaurant_id, name),
  check (starts_at <> ends_at)
);

create table public.menu_categories (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  daypart_id uuid references public.dayparts(id) on delete set null,
  name text not null,
  description text,
  sort_order integer not null default 0 check (sort_order >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.menu_items (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  category_id uuid not null references public.menu_categories(id) on delete cascade,
  name text not null,
  description text,
  price_cents integer not null check (price_cents >= 0),
  currency_code char(3) not null default 'ARS',
  image_path text,
  dietary_tags text[] not null default '{}'::text[],
  allergens text[] not null default '{}'::text[],
  is_available boolean not null default true,
  is_active boolean not null default true,
  sort_order integer not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.menu_item_translations (
  menu_item_id uuid not null references public.menu_items(id) on delete cascade,
  locale text not null check (locale ~ '^[a-z]{2}(?:-[A-Z]{2})?$'),
  name text not null,
  description text,
  primary key (menu_item_id, locale)
);

create index menu_categories_restaurant_order_idx on public.menu_categories (restaurant_id, sort_order);
create index menu_items_restaurant_category_order_idx on public.menu_items (restaurant_id, category_id, sort_order);
create index dayparts_restaurant_order_idx on public.dayparts (restaurant_id, sort_order);

create function public.enforce_menu_tenant_integrity() returns trigger language plpgsql as $$
declare
  category_restaurant_id uuid;
  daypart_restaurant_id uuid;
begin
  if tg_table_name = 'menu_categories' then
    if new.daypart_id is not null then
      select restaurant_id into daypart_restaurant_id from public.dayparts where id = new.daypart_id;
      if daypart_restaurant_id is distinct from new.restaurant_id then
        raise exception 'A daypart must belong to the same restaurant as its category';
      end if;
    end if;
  end if;

  if tg_table_name = 'menu_items' then
    select restaurant_id into category_restaurant_id from public.menu_categories where id = new.category_id;
    if category_restaurant_id is distinct from new.restaurant_id then
      raise exception 'A category must belong to the same restaurant as its menu item';
    end if;
  end if;
  return new;
end;
$$;

create trigger menu_categories_enforce_tenant_integrity before insert or update on public.menu_categories for each row execute function public.enforce_menu_tenant_integrity();
create trigger menu_items_enforce_tenant_integrity before insert or update on public.menu_items for each row execute function public.enforce_menu_tenant_integrity();

create function public.set_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger restaurants_set_updated_at before update on public.restaurants for each row execute function public.set_updated_at();
create trigger restaurant_settings_set_updated_at before update on public.restaurant_settings for each row execute function public.set_updated_at();
create trigger menu_categories_set_updated_at before update on public.menu_categories for each row execute function public.set_updated_at();
create trigger menu_items_set_updated_at before update on public.menu_items for each row execute function public.set_updated_at();

create function public.current_user_restaurant_id() returns uuid
language sql stable security definer set search_path = public as $$
  select restaurant_id from public.profiles where id = auth.uid()
$$;

create function public.is_platform_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'super_admin')
$$;

create function public.can_manage_restaurant(target_restaurant_id uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select public.is_platform_admin() or public.current_user_restaurant_id() = target_restaurant_id
$$;

alter table public.restaurants enable row level security;
alter table public.restaurant_settings enable row level security;
alter table public.profiles enable row level security;
alter table public.dayparts enable row level security;
alter table public.menu_categories enable row level security;
alter table public.menu_items enable row level security;
alter table public.menu_item_translations enable row level security;

-- Public menu data is intentionally readable only for active restaurants.
create policy "public can read active restaurants" on public.restaurants for select using (is_active or public.is_platform_admin() or id = public.current_user_restaurant_id());
create policy "public can read menu settings" on public.restaurant_settings for select using (exists (select 1 from public.restaurants r where r.id = restaurant_id and r.is_active));
create policy "public can read active dayparts" on public.dayparts for select using (is_active and exists (select 1 from public.restaurants r where r.id = restaurant_id and r.is_active));
create policy "public can read active categories" on public.menu_categories for select using (is_active and exists (select 1 from public.restaurants r where r.id = restaurant_id and r.is_active));
create policy "public can read active menu items" on public.menu_items for select using (is_active and exists (select 1 from public.restaurants r where r.id = restaurant_id and r.is_active));
create policy "public can read translations of active items" on public.menu_item_translations for select using (exists (select 1 from public.menu_items i where i.id = menu_item_id and i.is_active));

create policy "users can read own profile" on public.profiles for select using (id = auth.uid() or public.is_platform_admin());
create policy "admins manage restaurants" on public.restaurants for all using (public.is_platform_admin() or id = public.current_user_restaurant_id()) with check (public.is_platform_admin() or id = public.current_user_restaurant_id());
create policy "admins manage settings" on public.restaurant_settings for all using (public.can_manage_restaurant(restaurant_id)) with check (public.can_manage_restaurant(restaurant_id));
create policy "admins manage dayparts" on public.dayparts for all using (public.can_manage_restaurant(restaurant_id)) with check (public.can_manage_restaurant(restaurant_id));
create policy "admins manage categories" on public.menu_categories for all using (public.can_manage_restaurant(restaurant_id)) with check (public.can_manage_restaurant(restaurant_id));
create policy "admins manage menu items" on public.menu_items for all using (public.can_manage_restaurant(restaurant_id)) with check (public.can_manage_restaurant(restaurant_id));
create policy "admins manage item translations" on public.menu_item_translations for all using (exists (select 1 from public.menu_items i where i.id = menu_item_id and public.can_manage_restaurant(i.restaurant_id))) with check (exists (select 1 from public.menu_items i where i.id = menu_item_id and public.can_manage_restaurant(i.restaurant_id)));

-- Public menu photography. Files are organized as {restaurant_id}/{filename}.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('menu-images', 'menu-images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy "public can read menu images" on storage.objects for select using (bucket_id = 'menu-images');
create policy "admins manage images from their restaurant" on storage.objects for all to authenticated
using (
  bucket_id = 'menu-images'
  and (public.is_platform_admin() or (storage.foldername(name))[1] = public.current_user_restaurant_id()::text)
)
with check (
  bucket_id = 'menu-images'
  and (public.is_platform_admin() or (storage.foldername(name))[1] = public.current_user_restaurant_id()::text)
);
