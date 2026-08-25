-- Base seed data. Run after the schema migrations.
insert into public.restaurants (id, name, slug, supported_locales, default_locale, branding)
values
  ('10000000-0000-0000-0000-000000000001', 'Demo', 'demo', array['es', 'en'], 'es', '{"primaryColor":"#5C6B4F","font":"sans"}'),
  ('20000000-0000-0000-0000-000000000002', 'Bistró Demo', 'bistro-demo', array['es', 'en'], 'es', '{"primaryColor":"#28536B","font":"serif"}')
on conflict (id) do update set name = excluded.name, slug = excluded.slug, supported_locales = excluded.supported_locales, default_locale = excluded.default_locale, branding = excluded.branding;

insert into public.restaurant_settings (restaurant_id, unavailable_item_behavior, uses_dayparts)
values
  ('10000000-0000-0000-0000-000000000001', 'show_sold_out', true),
  ('20000000-0000-0000-0000-000000000002', 'hide', false)
on conflict (restaurant_id) do update set unavailable_item_behavior = excluded.unavailable_item_behavior, uses_dayparts = excluded.uses_dayparts;

insert into public.dayparts (id, restaurant_id, name, starts_at, ends_at, sort_order)
values
  ('11000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Almuerzo', '11:00', '15:00', 0),
  ('11000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'Cena', '20:00', '23:00', 1)
on conflict (id) do update set name = excluded.name, starts_at = excluded.starts_at, ends_at = excluded.ends_at, sort_order = excluded.sort_order;

insert into public.menu_categories (id, restaurant_id, daypart_id, name, description, sort_order)
values
  ('12000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', null, 'Cafetería', 'Café de especialidad, infusiones y bebidas frías.', 0),
  ('12000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', null, 'Pastelería y panadería', 'Elaboraciones dulces, clásicos y laminados.', 1),
  ('12000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', null, 'Tostones y entre panes', 'Opciones para cualquier momento del día.', 2),
  ('22000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', null, 'Cafetería', 'Selección de la casa.', 0)
on conflict (id) do update set daypart_id = excluded.daypart_id, name = excluded.name, description = excluded.description, sort_order = excluded.sort_order;

insert into public.menu_items (id, restaurant_id, category_id, name, description, price_cents, image_path, dietary_tags, allergens, is_available, sort_order)
values
  ('13000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '12000000-0000-0000-0000-000000000001', 'Espresso', 'Café corto e intenso.', 320000, '/images/demo/cafeteria-y-pasteleria.png', array['vegetariano'], array[]::text[], true, 0),
  ('13000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', '12000000-0000-0000-0000-000000000001', 'Americano', 'Espresso alargado con agua caliente.', 340000, '/images/demo/cafeteria-y-pasteleria.png', array['vegetariano'], array[]::text[], true, 1),
  ('23000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', '22000000-0000-0000-0000-000000000001', 'Café con leche', 'Café de especialidad y leche vaporizada.', 420000, null, array['vegetariano'], array['lácteos'], true, 0)
on conflict (id) do update set category_id = excluded.category_id, name = excluded.name, description = excluded.description, price_cents = excluded.price_cents, image_path = excluded.image_path, dietary_tags = excluded.dietary_tags, allergens = excluded.allergens, is_available = excluded.is_available, sort_order = excluded.sort_order;

insert into public.menu_category_translations (menu_category_id, locale, name, description)
values
  ('12000000-0000-0000-0000-000000000001', 'en', 'Coffee', 'Specialty coffee, tea and cold drinks.'),
  ('12000000-0000-0000-0000-000000000002', 'en', 'Pastry and bakery', 'Sweet creations, classics and viennoiserie.'),
  ('12000000-0000-0000-0000-000000000003', 'en', 'Toasts and sandwiches', 'Options for any time of day.'),
  ('22000000-0000-0000-0000-000000000001', 'en', 'Coffee', 'House selection.')
on conflict (menu_category_id, locale) do update set name = excluded.name, description = excluded.description;

insert into public.menu_item_translations (menu_item_id, locale, name, description)
values
  ('23000000-0000-0000-0000-000000000001', 'en', 'Coffee with milk', 'Specialty coffee and steamed milk.')
on conflict (menu_item_id, locale) do update set name = excluded.name, description = excluded.description;
