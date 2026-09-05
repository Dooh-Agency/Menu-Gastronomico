-- Migration: Reusable categories across menus via menu_category_menus junction table

-- 1. Create junction table menu_category_menus
create table if not exists public.menu_category_menus (
  menu_id uuid not null references public.menus(id) on delete cascade,
  category_id uuid not null references public.menu_categories(id) on delete cascade,
  sort_order integer not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default now(),
  primary key (menu_id, category_id)
);

-- 2. Indices for fast lookup
create index if not exists menu_category_menus_category_idx on public.menu_category_menus (category_id);
create index if not exists menu_category_menus_menu_order_idx on public.menu_category_menus (menu_id, sort_order);

-- 3. Populate junction table with existing menu_categories data
insert into public.menu_category_menus (menu_id, category_id, sort_order)
select menu_id, id, sort_order
from public.menu_categories
where menu_id is not null
on conflict (menu_id, category_id) do nothing;

-- 4. Fix foreign key constraint on menu_categories.menu_id so deleting a menu does not cascade-delete reusable categories
do $$
declare
  fk_name text;
begin
  select constraint_name into fk_name
  from information_schema.table_constraints
  where table_schema = 'public'
    and table_name = 'menu_categories'
    and constraint_type = 'FOREIGN KEY'
    and constraint_name like '%menu_id%';

  if fk_name is not null then
    execute 'alter table public.menu_categories drop constraint ' || quote_ident(fk_name);
    alter table public.menu_categories add constraint menu_categories_menu_id_fkey
      foreign key (menu_id) references public.menus(id) on delete set null;
  end if;
end $$;

-- 5. Tenant integrity trigger for menu_category_menus
create or replace function public.enforce_category_menu_tenant_integrity() returns trigger language plpgsql as $$
declare
  category_restaurant_id uuid;
  menu_restaurant_id uuid;
begin
  select restaurant_id into category_restaurant_id from public.menu_categories where id = new.category_id;
  select restaurant_id into menu_restaurant_id from public.menus where id = new.menu_id;

  if category_restaurant_id is distinct from menu_restaurant_id then
    raise exception 'A category and its menu must belong to the same restaurant';
  end if;

  return new;
end;
$$;

drop trigger if exists menu_category_menus_enforce_tenant_integrity on public.menu_category_menus;
create trigger menu_category_menus_enforce_tenant_integrity
before insert or update on public.menu_category_menus
for each row execute function public.enforce_category_menu_tenant_integrity();

-- 6. Row Level Security (RLS)
alter table public.menu_category_menus enable row level security;

-- Public can read active category menus
drop policy if exists "public can read active category menus" on public.menu_category_menus;
create policy "public can read active category menus"
on public.menu_category_menus for select
using (
  exists (
    select 1
    from public.menus m
    join public.menu_categories c on c.id = menu_category_menus.category_id
    join public.restaurants r on r.id = m.restaurant_id
    where m.id = menu_category_menus.menu_id
      and m.is_active
      and c.is_active
      and r.is_active
  )
);

-- Admins manage category menus
drop policy if exists "admins manage category menus" on public.menu_category_menus;
create policy "admins manage category menus"
on public.menu_category_menus for all
using (
  exists (
    select 1
    from public.menus m
    where m.id = menu_category_menus.menu_id
      and public.can_manage_restaurant(m.restaurant_id)
  )
)
with check (
  exists (
    select 1
    from public.menus m
    where m.id = menu_category_menus.menu_id
      and public.can_manage_restaurant(m.restaurant_id)
  )
);

notify pgrst, 'reload schema';
