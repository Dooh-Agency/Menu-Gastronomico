# Supabase

Las migraciones son la fuente de verdad del esquema. Aplicarlas primero en un proyecto local y luego mediante CI o la integración de Supabase; no editar producción desde el panel.

## Puesta en marcha

1. Crear un proyecto Supabase gratuito para la demo.
2. Copiar `.env.example` a `.env.local` y completar solo las dos variables `NEXT_PUBLIC_*`.
3. Aplicar `migrations/20260824000000_initial_multi_tenant.sql` y luego `seed.sql` con un rol administrativo.
4. Crear usuarios administradores en Supabase Auth y sus perfiles con `restaurant_id` y rol correspondiente desde una operación de servidor segura. El tenant semilla es `Demo`; MUUD se crea como tenant separado al iniciar el piloto.
5. El bucket público `menu-images` se crea con la migración. Las imágenes deben guardarse como `{restaurant_id}/{archivo}`; las políticas impiden que un administrador cargue archivos en el prefijo de otro restaurante.

## Si ya aplicaste la primera migración y el seed

No ejecutes `seed.sql` otra vez. Aplicá solamente `migrations/20260824000100_align_demo_tenant.sql`: renombra de forma segura el tenant semilla anterior de `MUUD` a `Demo`. No afecta a un futuro tenant real de MUUD.

Si la migración inicial se aplicó antes de la corrección del trigger multi-tenant, aplicá también `migrations/20260824000200_fix_menu_tenant_integrity.sql` antes del seed.

`SUPABASE_SERVICE_ROLE_KEY` queda reservada para acciones de servidor o CI; nunca se importa desde `src/app` ni se publica en el navegador.
