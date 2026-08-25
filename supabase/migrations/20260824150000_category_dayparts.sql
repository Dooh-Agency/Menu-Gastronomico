-- A category can be offered in more than one service window (for example,
-- the same lunch and dinner menu) without duplicating its menu items.
create table if not exists public.menu_category_dayparts (
  menu_category_id uuid not null references public.menu_categories(id) on delete cascade,
  daypart_id uuid not null references public.dayparts(id) on delete cascade,
  primary key (menu_category_id, daypart_id)
);

create index if not exists menu_category_dayparts_daypart_idx
  on public.menu_category_dayparts (daypart_id);

create function public.enforce_category_daypart_tenant_integrity() returns trigger
language plpgsql as $$
declare
  category_restaurant_id uuid;
  daypart_restaurant_id uuid;
begin
  select restaurant_id into category_restaurant_id
  from public.menu_categories
  where id = new.menu_category_id;

  select restaurant_id into daypart_restaurant_id
  from public.dayparts
  where id = new.daypart_id;

  if category_restaurant_id is distinct from daypart_restaurant_id then
    raise exception 'A category and its daypart must belong to the same restaurant';
  end if;

  return new;
end;
$$;

drop trigger if exists menu_category_dayparts_enforce_tenant_integrity on public.menu_category_dayparts;
create trigger menu_category_dayparts_enforce_tenant_integrity
before insert or update on public.menu_category_dayparts
for each row execute function public.enforce_category_daypart_tenant_integrity();

alter table public.menu_category_dayparts enable row level security;

create policy "public can read active category dayparts"
on public.menu_category_dayparts for select
using (
  exists (
    select 1
    from public.menu_categories category
    join public.dayparts daypart on daypart.id = menu_category_dayparts.daypart_id
    join public.restaurants restaurant on restaurant.id = category.restaurant_id
    where category.id = menu_category_dayparts.menu_category_id
      and category.is_active
      and daypart.is_active
      and restaurant.is_active
  )
);

create policy "admins manage category dayparts"
on public.menu_category_dayparts for all
using (
  exists (
    select 1
    from public.menu_categories category
    where category.id = menu_category_dayparts.menu_category_id
      and public.can_manage_restaurant(category.restaurant_id)
  )
)
with check (
  exists (
    select 1
    from public.menu_categories category
    where category.id = menu_category_dayparts.menu_category_id
      and public.can_manage_restaurant(category.restaurant_id)
  )
);
