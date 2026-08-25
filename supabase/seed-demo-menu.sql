-- Demo content derived from the supplied reference menu.
-- Prices and image assets are intentionally illustrative placeholders.

insert into public.menu_categories (id, restaurant_id, daypart_id, name, description, sort_order)
values
  ('12000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000001', null, 'Entradas', 'Para compartir.', 3),
  ('12000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000001', null, 'Ensaladas', 'Platos frescos y completos.', 4),
  ('12000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000001', null, 'Quiches', 'Con ensalada de la casa.', 5),
  ('12000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000001', null, 'Principales', 'Cocina de mediodía y noche.', 6),
  ('12000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000001', null, 'Jugos y bebidas', 'Licuados, gaseosas, aguas y limonadas.', 7),
  ('12000000-0000-0000-0000-000000000009', '10000000-0000-0000-0000-000000000001', null, 'Cocktails y vinos', 'Selección para acompañar la mesa.', 8)
on conflict (id) do update set name = excluded.name, description = excluded.description, sort_order = excluded.sort_order;

insert into public.menu_category_dayparts (menu_category_id, daypart_id)
values
  ('12000000-0000-0000-0000-000000000001', '11000000-0000-0000-0000-000000000001'),
  ('12000000-0000-0000-0000-000000000002', '11000000-0000-0000-0000-000000000001'),
  ('12000000-0000-0000-0000-000000000003', '11000000-0000-0000-0000-000000000001'),
  ('12000000-0000-0000-0000-000000000004', '11000000-0000-0000-0000-000000000001'), ('12000000-0000-0000-0000-000000000004', '11000000-0000-0000-0000-000000000002'),
  ('12000000-0000-0000-0000-000000000005', '11000000-0000-0000-0000-000000000001'), ('12000000-0000-0000-0000-000000000005', '11000000-0000-0000-0000-000000000002'),
  ('12000000-0000-0000-0000-000000000006', '11000000-0000-0000-0000-000000000001'), ('12000000-0000-0000-0000-000000000006', '11000000-0000-0000-0000-000000000002'),
  ('12000000-0000-0000-0000-000000000007', '11000000-0000-0000-0000-000000000001'), ('12000000-0000-0000-0000-000000000007', '11000000-0000-0000-0000-000000000002')
  ,('12000000-0000-0000-0000-000000000008', '11000000-0000-0000-0000-000000000001')
  ,('12000000-0000-0000-0000-000000000009', '11000000-0000-0000-0000-000000000002')
on conflict do nothing;

with content(category_id, name, description, price_cents, image_path, sort_order) as (
  values
    -- Cafetería
    ('12000000-0000-0000-0000-000000000001'::uuid, 'Macchiato', 'Espresso con una nube de leche.', 360000, '/images/demo/cafeteria-y-pasteleria.png', 2),
    ('12000000-0000-0000-0000-000000000001'::uuid, 'Café en jarrito', 'Café suave servido en jarrito.', 390000, '/images/demo/cafeteria-y-pasteleria.png', 3),
    ('12000000-0000-0000-0000-000000000001'::uuid, 'Café doble con leche', 'Doble espresso y leche vaporizada.', 450000, '/images/demo/cafeteria-y-pasteleria.png', 4),
    ('12000000-0000-0000-0000-000000000001'::uuid, 'Submarino', 'Chocolate para fundir en leche caliente.', 460000, '/images/demo/cafeteria-y-pasteleria.png', 5),
    ('12000000-0000-0000-0000-000000000001'::uuid, 'Latte', 'Con opción de caramelo o avellanas.', 480000, '/images/demo/cafeteria-y-pasteleria.png', 6),
    ('12000000-0000-0000-0000-000000000001'::uuid, 'Iced coffee', 'Café frío con leche y hielo.', 520000, '/images/demo/cafeteria-y-pasteleria.png', 7),
    ('12000000-0000-0000-0000-000000000001'::uuid, 'Coffee tonic', 'Espresso, tónica y cítricos.', 540000, '/images/demo/cafeteria-y-pasteleria.png', 8),
    ('12000000-0000-0000-0000-000000000001'::uuid, 'Capuccino', 'Café, leche cremosa y cacao.', 490000, '/images/demo/cafeteria-y-pasteleria.png', 9),
    ('12000000-0000-0000-0000-000000000001'::uuid, 'Té en hebras', 'Selección de hebras para una persona.', 380000, '/images/demo/cafeteria-y-pasteleria.png', 10),
    ('12000000-0000-0000-0000-000000000001'::uuid, 'Frappé de frutos rojos', 'Bebida helada de frutos rojos.', 560000, '/images/demo/cafeteria-y-pasteleria.png', 11),
    ('12000000-0000-0000-0000-000000000001'::uuid, 'Irlands', 'Café, whisky, crema y cacao.', 680000, '/images/demo/cafeteria-y-pasteleria.png', 12),
    ('12000000-0000-0000-0000-000000000001'::uuid, 'Té en hebras para tres', 'Tetera con selección de hebras.', 780000, '/images/demo/cafeteria-y-pasteleria.png', 13),
    ('12000000-0000-0000-0000-000000000001'::uuid, 'Frappé de durazno y maracuyá', 'Bebida helada frutal.', 560000, '/images/demo/cafeteria-y-pasteleria.png', 14),
    ('12000000-0000-0000-0000-000000000001'::uuid, 'Frappé de vainilla', 'Café, vainilla y hielo.', 590000, '/images/demo/cafeteria-y-pasteleria.png', 15),
    ('12000000-0000-0000-0000-000000000001'::uuid, 'Frappé de caramelo', 'Café, caramelo y hielo.', 590000, '/images/demo/cafeteria-y-pasteleria.png', 16),
    ('12000000-0000-0000-0000-000000000001'::uuid, 'Frappé de chocolate y avellanas', 'Café, chocolate, avellanas y hielo.', 620000, '/images/demo/cafeteria-y-pasteleria.png', 17),
    -- Pastelería
    ('12000000-0000-0000-0000-000000000002'::uuid, 'Cookie de chocolate', 'Cookie artesanal con chips de chocolate.', 320000, '/images/demo/cafeteria-y-pasteleria.png', 0),
    ('12000000-0000-0000-0000-000000000002'::uuid, 'Cookie de limón', 'Cookie de limón con glaseado.', 320000, '/images/demo/cafeteria-y-pasteleria.png', 1),
    ('12000000-0000-0000-0000-000000000002'::uuid, 'Cookie de maní', 'Cookie artesanal de maní.', 320000, '/images/demo/cafeteria-y-pasteleria.png', 2),
    ('12000000-0000-0000-0000-000000000002'::uuid, 'Choux de frutos del bosque', 'Masa choux, crema y frutas.', 590000, '/images/demo/cafeteria-y-pasteleria.png', 2),
    ('12000000-0000-0000-0000-000000000002'::uuid, 'Crumble de manzanas y peras', 'Fruta de estación, crumble y crema.', 620000, '/images/demo/cafeteria-y-pasteleria.png', 3),
    ('12000000-0000-0000-0000-000000000002'::uuid, 'Cheesecake de frutos rojos', 'Queso crema y salsa de frutos rojos.', 680000, '/images/demo/cafeteria-y-pasteleria.png', 4),
    ('12000000-0000-0000-0000-000000000002'::uuid, 'Ópera de pistacho y café', 'Bizcocho de almendras, café y crema de pistacho.', 720000, '/images/demo/cafeteria-y-pasteleria.png', 5),
    ('12000000-0000-0000-0000-000000000002'::uuid, 'Lingote de mango y naranja', 'Mousse de mango, cremoso de naranja y crocante.', 690000, '/images/demo/cafeteria-y-pasteleria.png', 6),
    ('12000000-0000-0000-0000-000000000002'::uuid, 'Devil’s cake', 'Bizcocho de chocolate, dulce de leche y mousse.', 730000, '/images/demo/cafeteria-y-pasteleria.png', 6),
    ('12000000-0000-0000-0000-000000000002'::uuid, 'Éclair de pistacho', 'Pasta choux y crema de pistacho.', 650000, '/images/demo/cafeteria-y-pasteleria.png', 7),
    ('12000000-0000-0000-0000-000000000002'::uuid, 'Éclair de chocolate', 'Pasta choux, crema y ganache.', 650000, '/images/demo/cafeteria-y-pasteleria.png', 8),
    ('12000000-0000-0000-0000-000000000002'::uuid, 'Éclair diplomata y frutos rojos', 'Pasta choux, crema diplomata y frutas.', 650000, '/images/demo/cafeteria-y-pasteleria.png', 9),
    ('12000000-0000-0000-0000-000000000002'::uuid, 'Moka', 'Bizcocho de cacao, crema de café y chocolate.', 690000, '/images/demo/cafeteria-y-pasteleria.png', 8),
    ('12000000-0000-0000-0000-000000000002'::uuid, 'Chajá', 'Merengue, crema, duraznos y bizcochuelo.', 690000, '/images/demo/cafeteria-y-pasteleria.png', 9),
    ('12000000-0000-0000-0000-000000000002'::uuid, 'Torta de chocolate y mousse de cacao', 'Bizcocho húmedo, ganache y mousse.', 720000, '/images/demo/cafeteria-y-pasteleria.png', 10),
    ('12000000-0000-0000-0000-000000000002'::uuid, 'Rogel', 'Capas crocantes, dulce de leche y merengue.', 680000, '/images/demo/cafeteria-y-pasteleria.png', 11),
    ('12000000-0000-0000-0000-000000000002'::uuid, 'Brownie con nuez', 'Chocolate intenso y nueces.', 520000, '/images/demo/cafeteria-y-pasteleria.png', 12),
    ('12000000-0000-0000-0000-000000000002'::uuid, 'Budín de limón y amapolas', 'Budín húmedo de limón y semillas.', 490000, '/images/demo/cafeteria-y-pasteleria.png', 13),
    ('12000000-0000-0000-0000-000000000002'::uuid, 'Scon salado de queso', 'Scon de queso y hierbas.', 360000, '/images/demo/cafeteria-y-pasteleria.png', 14),
    ('12000000-0000-0000-0000-000000000002'::uuid, 'Medialuna argentina', 'Medialuna de manteca.', 230000, '/images/demo/cafeteria-y-pasteleria.png', 13),
    ('12000000-0000-0000-0000-000000000002'::uuid, 'Croissant clásico', 'Laminado de manteca.', 350000, '/images/demo/cafeteria-y-pasteleria.png', 14),
    ('12000000-0000-0000-0000-000000000002'::uuid, 'Pain au chocolat', 'Croissant relleno de chocolate.', 420000, '/images/demo/cafeteria-y-pasteleria.png', 15),
    ('12000000-0000-0000-0000-000000000002'::uuid, 'Roll de canela', 'Masa laminada, canela y glaseado.', 460000, '/images/demo/cafeteria-y-pasteleria.png', 16),
    ('12000000-0000-0000-0000-000000000002'::uuid, 'Pain suisse', 'Laminado con lomito, hierbas y blend de quesos.', 620000, '/images/demo/cafeteria-y-pasteleria.png', 17),
    -- Todo el día
    ('12000000-0000-0000-0000-000000000003'::uuid, 'Tostón clásico', 'Pan de masa madre, manteca, huevo revuelto y tomates.', 890000, '/images/demo/brunch-y-sandwiches.png', 0),
    ('12000000-0000-0000-0000-000000000003'::uuid, 'Avocado toast', 'Pan de masa madre, palta, huevo poché y semillas.', 980000, '/images/demo/brunch-y-sandwiches.png', 1),
    ('12000000-0000-0000-0000-000000000003'::uuid, 'Huevos rotos', 'Papas rústicas, huevos, jamón crudo y hierbas.', 1050000, '/images/demo/brunch-y-sandwiches.png', 2),
    ('12000000-0000-0000-0000-000000000003'::uuid, 'Tostón especial', 'Hummus de remolacha, palta, tomate y semillas.', 960000, '/images/demo/brunch-y-sandwiches.png', 3),
    ('12000000-0000-0000-0000-000000000003'::uuid, 'Bowl saludable', 'Base de granos, verduras, huevo y aderezo a elección.', 990000, '/images/demo/brunch-y-sandwiches.png', 4),
    ('12000000-0000-0000-0000-000000000003'::uuid, 'Tostado clásico', 'Jamón cocido, queso y pan de molde.', 760000, '/images/demo/brunch-y-sandwiches.png', 5),
    ('12000000-0000-0000-0000-000000000003'::uuid, 'Croque Madame', 'Pan brioche, jamón, queso, bechamel y huevo.', 1120000, '/images/demo/brunch-y-sandwiches.png', 6),
    ('12000000-0000-0000-0000-000000000003'::uuid, 'Alemán', 'Salchicha, chucrut, queso y mostaza en pan.', 980000, '/images/demo/brunch-y-sandwiches.png', 7),
    ('12000000-0000-0000-0000-000000000003'::uuid, 'Uruguayo', 'Bondiola, muzzarella, tomate y huevo.', 1080000, '/images/demo/brunch-y-sandwiches.png', 8),
    ('12000000-0000-0000-0000-000000000003'::uuid, 'Mediterráneo', 'Vegetales asados, queso, rúcula y pesto.', 990000, '/images/demo/brunch-y-sandwiches.png', 9),
    ('12000000-0000-0000-0000-000000000003'::uuid, 'Bagel NY', 'Salmón gravlax, queso crema, pepino y alcaparras.', 1260000, '/images/demo/brunch-y-sandwiches.png', 10),
    ('12000000-0000-0000-0000-000000000003'::uuid, 'Degustación dulce para dos', 'Selección de pastelería para compartir.', 1420000, '/images/demo/brunch-y-sandwiches.png', 11),
    ('12000000-0000-0000-0000-000000000003'::uuid, 'Degustación mixta para dos', 'Selección salada y dulce para compartir.', 1680000, '/images/demo/brunch-y-sandwiches.png', 12),
    ('12000000-0000-0000-0000-000000000003'::uuid, 'Degustación mixta para cuatro', 'Selección salada y dulce para cuatro personas.', 2980000, '/images/demo/brunch-y-sandwiches.png', 13),
    -- Almuerzo y cena
    ('12000000-0000-0000-0000-000000000004'::uuid, 'Trilogía de bruschettas', 'Tomate y albahaca, hongos y queso, y hummus de remolacha.', 980000, '/images/demo/algo-para-comer-y-beber.png', 0),
    ('12000000-0000-0000-0000-000000000004'::uuid, 'Empanadas de ternera', 'Dos empanadas de ternera cortada a cuchillo.', 720000, '/images/demo/algo-para-comer-y-beber.png', 1),
    ('12000000-0000-0000-0000-000000000005'::uuid, 'César con gravlax', 'Mix verde, gravlax, croutons, huevo y aderezo César.', 1420000, '/images/demo/algo-para-comer-y-beber.png', 0),
    ('12000000-0000-0000-0000-000000000005'::uuid, 'Saludable', 'Hojas verdes, palta, calabaza, granos y semillas.', 1180000, '/images/demo/algo-para-comer-y-beber.png', 1),
    ('12000000-0000-0000-0000-000000000005'::uuid, 'Mediterránea', 'Tomates, queso, aceitunas, pepino y albahaca.', 1210000, '/images/demo/algo-para-comer-y-beber.png', 2),
    ('12000000-0000-0000-0000-000000000005'::uuid, 'Taco party', 'Pollo grillado, maíz, hojas verdes y nachos.', 1350000, '/images/demo/algo-para-comer-y-beber.png', 3),
    ('12000000-0000-0000-0000-000000000006'::uuid, 'Quiche Lorraine', 'Panceta, cebolla, queso y ensalada.', 1080000, '/images/demo/algo-para-comer-y-beber.png', 0),
    ('12000000-0000-0000-0000-000000000006'::uuid, 'Quiche ratatouille', 'Vegetales asados, queso y ensalada.', 1040000, '/images/demo/algo-para-comer-y-beber.png', 1),
    ('12000000-0000-0000-0000-000000000006'::uuid, 'Quiche de jamón y queso', 'Jamón cocido, queso y ensalada.', 1040000, '/images/demo/algo-para-comer-y-beber.png', 2),
    ('12000000-0000-0000-0000-000000000007'::uuid, 'Berenjena ahumada', 'Berenjena, labneh, granada y pan pita.', 1380000, '/images/demo/algo-para-comer-y-beber.png', 0),
    ('12000000-0000-0000-0000-000000000007'::uuid, 'Milanesa con papas', 'Milanesa de ternera, papas fritas y ensalada.', 1580000, '/images/demo/algo-para-comer-y-beber.png', 1),
    ('12000000-0000-0000-0000-000000000007'::uuid, 'Pulled pork BBQ', 'Cerdo desmechado, salsa BBQ, coleslaw y papas.', 1640000, '/images/demo/algo-para-comer-y-beber.png', 2),
    ('12000000-0000-0000-0000-000000000007'::uuid, 'Focaccia César', 'Pollo, queso, hojas verdes y aderezo César.', 1450000, '/images/demo/algo-para-comer-y-beber.png', 3),
    ('12000000-0000-0000-0000-000000000007'::uuid, 'Ñoquis de papa', 'Ñoquis caseros con salsa de tomates y albahaca.', 1360000, '/images/demo/algo-para-comer-y-beber.png', 4),
    ('12000000-0000-0000-0000-000000000007'::uuid, 'Fetuccini', 'Pasta fresca, crema de hongos y parmesano.', 1420000, '/images/demo/algo-para-comer-y-beber.png', 5),
    -- Bebidas
    ('12000000-0000-0000-0000-000000000008'::uuid, 'Limonada clásica', 'Limonada fresca.', 480000, '/images/demo/algo-para-comer-y-beber.png', 0),
    ('12000000-0000-0000-0000-000000000008'::uuid, 'Limonada frozen', 'Limonada granizada.', 520000, '/images/demo/algo-para-comer-y-beber.png', 1),
    ('12000000-0000-0000-0000-000000000008'::uuid, 'Limonada menta y jengibre', 'Limonada fresca con menta y jengibre.', 540000, '/images/demo/algo-para-comer-y-beber.png', 2),
    ('12000000-0000-0000-0000-000000000008'::uuid, 'Jugo de naranja', 'Jugo exprimido.', 450000, '/images/demo/algo-para-comer-y-beber.png', 3),
    ('12000000-0000-0000-0000-000000000008'::uuid, 'Licuado de estación', 'Fruta de estación y leche.', 530000, '/images/demo/algo-para-comer-y-beber.png', 4),
    ('12000000-0000-0000-0000-000000000008'::uuid, 'Green mix', 'Manzana verde, apio, pepino y limón.', 560000, '/images/demo/algo-para-comer-y-beber.png', 5),
    ('12000000-0000-0000-0000-000000000008'::uuid, 'Gaseosa', 'Línea clásica, consultar sabores.', 380000, '/images/demo/algo-para-comer-y-beber.png', 6),
    ('12000000-0000-0000-0000-000000000008'::uuid, 'Agua mineral', 'Con o sin gas.', 320000, '/images/demo/algo-para-comer-y-beber.png', 7),
    ('12000000-0000-0000-0000-000000000009'::uuid, 'Branca & Cola', 'Fernet y cola.', 720000, '/images/demo/algo-para-comer-y-beber.png', 0),
    ('12000000-0000-0000-0000-000000000009'::uuid, 'Orange Campari', 'Campari, naranja y soda.', 740000, '/images/demo/algo-para-comer-y-beber.png', 1),
    ('12000000-0000-0000-0000-000000000009'::uuid, 'Carpano', 'Vermut rosso, soda y cítricos.', 700000, '/images/demo/algo-para-comer-y-beber.png', 2),
    ('12000000-0000-0000-0000-000000000009'::uuid, 'Negroni', 'Gin, Campari y vermut rosso.', 820000, '/images/demo/algo-para-comer-y-beber.png', 3),
    ('12000000-0000-0000-0000-000000000009'::uuid, 'Gin tonic', 'Gin, tónica y botánicos.', 790000, '/images/demo/algo-para-comer-y-beber.png', 4),
    ('12000000-0000-0000-0000-000000000009'::uuid, 'Pinot Noir', 'Copa de vino tinto.', 760000, '/images/demo/algo-para-comer-y-beber.png', 5),
    ('12000000-0000-0000-0000-000000000009'::uuid, 'Malbec Reserva', 'Copa de vino tinto.', 820000, '/images/demo/algo-para-comer-y-beber.png', 6),
    ('12000000-0000-0000-0000-000000000009'::uuid, 'Albariño', 'Copa de vino blanco.', 780000, '/images/demo/algo-para-comer-y-beber.png', 7),
    ('12000000-0000-0000-0000-000000000009'::uuid, 'Extra Brut', 'Copa de espumante.', 860000, '/images/demo/algo-para-comer-y-beber.png', 8)
), prepared as (
  select (
    substr(md5('demo-menu:' || category_id::text || ':' || name), 1, 8) || '-' ||
    substr(md5('demo-menu:' || category_id::text || ':' || name), 9, 4) || '-' ||
    substr(md5('demo-menu:' || category_id::text || ':' || name), 13, 4) || '-' ||
    substr(md5('demo-menu:' || category_id::text || ':' || name), 17, 4) || '-' ||
    substr(md5('demo-menu:' || category_id::text || ':' || name), 21, 12)
  )::uuid as id, * from content
)
insert into public.menu_items (id, restaurant_id, category_id, name, description, price_cents, image_path, is_available, sort_order)
select id, '10000000-0000-0000-0000-000000000001', category_id, name, description, price_cents, image_path, true, sort_order from prepared
on conflict (id) do update set category_id = excluded.category_id, name = excluded.name, description = excluded.description, price_cents = excluded.price_cents, image_path = excluded.image_path, is_available = excluded.is_available, sort_order = excluded.sort_order;

insert into public.menu_category_translations (menu_category_id, locale, name, description)
values
  ('12000000-0000-0000-0000-000000000004', 'en', 'Starters', 'For sharing.'),
  ('12000000-0000-0000-0000-000000000005', 'en', 'Salads', 'Fresh and complete dishes.'),
  ('12000000-0000-0000-0000-000000000006', 'en', 'Quiches', 'With house salad.'),
  ('12000000-0000-0000-0000-000000000007', 'en', 'Mains', 'Lunch and dinner cooking.'),
  ('12000000-0000-0000-0000-000000000008', 'en', 'Juices and drinks', 'Smoothies, soft drinks, water and lemonade.'),
  ('12000000-0000-0000-0000-000000000009', 'en', 'Cocktails and wine', 'A selection to pair with your meal.')
on conflict (menu_category_id, locale) do update set name = excluded.name, description = excluded.description;
