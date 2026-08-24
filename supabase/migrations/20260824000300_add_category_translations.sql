create table public.menu_category_translations (
  menu_category_id uuid not null references public.menu_categories(id) on delete cascade,
  locale text not null check (locale ~ '^[a-z]{2}(?:-[A-Z]{2})?$'),
  name text not null,
  description text,
  primary key (menu_category_id, locale)
);

alter table public.menu_category_translations enable row level security;

create policy "public can read translations of active categories"
on public.menu_category_translations for select
using (
  exists (
    select 1 from public.menu_categories category
    where category.id = menu_category_id and category.is_active
  )
);

create policy "admins manage category translations"
on public.menu_category_translations for all
using (
  exists (
    select 1 from public.menu_categories category
    where category.id = menu_category_id and public.can_manage_restaurant(category.restaurant_id)
  )
)
with check (
  exists (
    select 1 from public.menu_categories category
    where category.id = menu_category_id and public.can_manage_restaurant(category.restaurant_id)
  )
);
