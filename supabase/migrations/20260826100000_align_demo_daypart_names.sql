-- Aligns an already-seeded Demo tenant with the agreed service windows.
-- Safe to apply after prior seeds; only the fixed Demo daypart identifiers are changed.
update public.dayparts
set name = 'Diurna', starts_at = '07:00', ends_at = '20:00', sort_order = 0
where id = '11000000-0000-0000-0000-000000000001'
  and restaurant_id = '10000000-0000-0000-0000-000000000001';

update public.dayparts
set name = 'Nocturna', starts_at = '20:00', ends_at = '23:00', sort_order = 1
where id = '11000000-0000-0000-0000-000000000002'
  and restaurant_id = '10000000-0000-0000-0000-000000000001';
