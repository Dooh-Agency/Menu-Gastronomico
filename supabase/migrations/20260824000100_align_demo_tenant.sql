begin;

-- Existing installations seeded before the Demo decision used this fixed tenant id.
-- Do not touch a future real MUUD tenant: it will have a different id.
update public.restaurants
set
  name = 'Demo',
  slug = 'demo',
  branding = '{"primaryColor":"#5C6B4F","font":"sans"}'::jsonb
where id = '10000000-0000-0000-0000-000000000001'
  and name = 'MUUD'
  and slug = 'muud';

commit;
