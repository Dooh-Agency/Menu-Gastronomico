alter table public.menu_categories drop constraint if exists menu_categories_card_layout_check;
alter table public.menu_categories add constraint menu_categories_card_layout_check check (card_layout in ('rectangle', 'hero', 'carousel', 'grid'));
