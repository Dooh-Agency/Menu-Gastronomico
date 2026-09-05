-- Migration: Add card_layout column to menu_categories
alter table public.menu_categories
add column if not exists card_layout text not null default 'rectangle';

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'menu_categories_card_layout_check'
  ) then
    alter table public.menu_categories
    add constraint menu_categories_card_layout_check
    check (card_layout in ('rectangle', 'hero', 'carousel'));
  end if;
end $$;

-- Recargar caché de PostgREST para exponer la columna inmediatamente
notify pgrst, 'reload schema';

