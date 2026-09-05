# Supabase

Las migraciones en `supabase/migrations/` son la fuente canónica de verdad del esquema de la base de datos. Deben aplicarse de forma secuencial y ordenada en el proyecto de Supabase (local o en la nube).

---

## 🚀 Puesta en marcha desde cero

1. Crear un proyecto en Supabase.
2. Copiar `.env.example` a `.env.local` y completar las variables de entorno:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (solo para servidor / Server Actions).
3. Aplicar las migraciones en orden (ver tabla de migraciones).
4. Ejecutar `seed-demo-menu.sql` (o `seed.sql`) para cargar el restaurante `Demo` y sus datos iniciales.
5. El bucket público `menu-images` se crea automáticamente con la migración. Las imágenes se almacenan organizadas bajo `{restaurant_id}/...`.

---

## 📜 Historial y Orden de Migraciones

| Archivo de Migración | Descripción |
| :--- | :--- |
| `20260824000000_initial_multi_tenant.sql` | Esquema base multi-tenant: `restaurants`, `users`, `categories`, `items`, `dayparts`, bucket `menu-images` y RLS. |
| `20260824000100_align_demo_tenant.sql` | Renombra de forma segura el tenant semilla inicial a `Demo`. |
| `20260824000200_fix_menu_tenant_integrity.sql` | Triggers e integridad referencial de `restaurant_id` en cascada. |
| `20260824000300_add_category_translations.sql` | Tabla `menu_category_translations` para soporte multi-idioma en categorías. |
| `20260824150000_category_dayparts.sql` | Tabla intermedia `category_dayparts` para vincular categorías a franjas horarias. |
| `20260826100000_align_demo_daypart_names.sql` | Normalización de nombres de franjas horarias ("Diurna", "Nocturna"). |
| `20260827000100_admin_profile_visibility.sql` | Políticas RLS para aislar el listado de perfiles de administradores por tenant. |
| `20260901000000_menus_system.sql` | Sistema de múltiples cartas (`menus`, `menu_categories_rel`) y configuración de menú activo. |
| `20260901010000_item_image_paths.sql` | Columna `item_image_paths` (array de strings) para soportar carrusel de múltiples imágenes por plato. |
| `20260905120000_reusable_menu_categories.sql` | Tabla intermedia `menu_category_menus` para permitir categorías reutilizables entre múltiples cartas sin duplicar platos. |
| `20260905140000_category_card_layout.sql` | Columna `card_layout` en `menu_categories` para configurar formatos de tarjetas por categoría (`rectangle`, `hero`, `carousel`). |

---

## 🔒 Seguridad y Buenas Prácticas

- `SUPABASE_SERVICE_ROLE_KEY` queda reservada exclusivamente para acciones de servidor, tareas administrativas y CI/CD; **nunca** se expone al cliente ni se importa con prefijo `NEXT_PUBLIC_`.
- Todas las tablas deben tener **Row Level Security (RLS)** habilitado con aislamiento estricto por `restaurant_id`.
