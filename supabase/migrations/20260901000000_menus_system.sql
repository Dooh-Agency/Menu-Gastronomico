-- Migration: Create menus and menu_schedules tables, add menu_id to menu_categories

-- 1. Create menus table
create table if not exists public.menus (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 120),
  description text,
  banner_path text,
  is_active boolean not null default true,
  sort_order integer not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Create menu_schedules table
create table if not exists public.menu_schedules (
  id uuid primary key default gen_random_uuid(),
  menu_id uuid not null references public.menus(id) on delete cascade,
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  day_of_week smallint check (day_of_week between 0 and 6), -- 0=Sunday, 1=Monday, ..., 6=Saturday. NULL means every day.
  starts_at time not null,
  ends_at time not null,
  sort_order integer not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default now()
);

-- 3. Add menu_id to menu_categories if it does not exist
do $$
begin
  if not exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' and table_name = 'menu_categories' and column_name = 'menu_id'
  ) then
    alter table public.menu_categories add column menu_id uuid references public.menus(id) on delete cascade;
  end if;
end $$;

-- 4. Indices
create index if not exists menus_restaurant_order_idx on public.menus (restaurant_id, sort_order);
create index if not exists menu_schedules_menu_idx on public.menu_schedules (menu_id, sort_order);
create index if not exists menu_categories_menu_order_idx on public.menu_categories (menu_id, sort_order);

-- 5. Seed default menus for existing restaurants if they don't have one
do $$
declare
  r record;
  m_id uuid;
begin
  for r in select id, branding from public.restaurants loop
    if not exists (select 1 from public.menus where restaurant_id = r.id) then
      insert into public.menus (restaurant_id, name, description, banner_path, sort_order, is_active)
      values (
        r.id, 
        'Carta Principal', 
        'Nuestra selección de platos y especialidades de la casa.',
        r.branding->>'cover_image_path',
        0, 
        true
      )
      returning id into m_id;

      -- Assign existing categories of this restaurant to the new default menu
      update public.menu_categories 
      set menu_id = m_id 
      where restaurant_id = r.id and menu_id is null;

      -- Create default 24h schedule for the main menu
      insert into public.menu_schedules (menu_id, restaurant_id, starts_at, ends_at)
      values (m_id, r.id, '00:00'::time, '23:59:59'::time);
    else
      -- If menu exists, link any orphan categories to the first menu
      select id into m_id from public.menus where restaurant_id = r.id order by sort_order limit 1;
      update public.menu_categories 
      set menu_id = m_id 
      where restaurant_id = r.id and menu_id is null;
    end if;
  end loop;
end $$;

-- 6. Trigger for updated_at
drop trigger if exists menus_set_updated_at on public.menus;
create trigger menus_set_updated_at 
before update on public.menus 
for each row execute function public.set_updated_at();

-- 7. Update tenant integrity function
create or replace function public.enforce_menu_tenant_integrity() returns trigger language plpgsql as $$
declare
  category_restaurant_id uuid;
  menu_restaurant_id uuid;
  daypart_restaurant_id uuid;
begin
  if tg_table_name = 'menu_schedules' then
    select restaurant_id into menu_restaurant_id from public.menus where id = new.menu_id;
    if menu_restaurant_id is distinct from new.restaurant_id then
      raise exception 'A schedule must belong to the same restaurant as its menu';
    end if;
  end if;

  if tg_table_name = 'menu_categories' then
    if new.menu_id is not null then
      select restaurant_id into menu_restaurant_id from public.menus where id = new.menu_id;
      if menu_restaurant_id is distinct from new.restaurant_id then
        raise exception 'A category must belong to the same restaurant as its menu';
      end if;
    end if;
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

drop trigger if exists menu_schedules_enforce_tenant_integrity on public.menu_schedules;
create trigger menu_schedules_enforce_tenant_integrity 
before insert or update on public.menu_schedules 
for each row execute function public.enforce_menu_tenant_integrity();

-- 8. Row Level Security (RLS)
alter table public.menus enable row level security;
alter table public.menu_schedules enable row level security;

-- Public read policies
drop policy if exists "public can read active menus" on public.menus;
create policy "public can read active menus" 
on public.menus for select 
using (
  is_active and exists (
    select 1 from public.restaurants r 
    where r.id = menus.restaurant_id and r.is_active
  )
);

drop policy if exists "public can read active menu schedules" on public.menu_schedules;
create policy "public can read active menu schedules" 
on public.menu_schedules for select 
using (
  exists (
    select 1 from public.menus m
    join public.restaurants r on r.id = m.restaurant_id
    where m.id = menu_schedules.menu_id and m.is_active and r.is_active
  )
);

-- Admin policies
drop policy if exists "admins manage menus" on public.menus;
create policy "admins manage menus" 
on public.menus for all 
using (public.can_manage_restaurant(restaurant_id)) 
with check (public.can_manage_restaurant(restaurant_id));

drop policy if exists "admins manage menu schedules" on public.menu_schedules;
create policy "admins manage menu schedules" 
on public.menu_schedules for all 
using (public.can_manage_restaurant(restaurant_id)) 
with check (public.can_manage_restaurant(restaurant_id));
