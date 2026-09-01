-- Migración: Soporte para múltiples imágenes por plato en public.menu_items
alter table public.menu_items
  add column if not exists image_paths text[] not null default '{}'::text[];

-- Migrar datos previos desde image_path a image_paths si este último está vacío
update public.menu_items
set image_paths = array[image_path]
where image_path is not null
  and (image_paths is null or cardinality(image_paths) = 0);
