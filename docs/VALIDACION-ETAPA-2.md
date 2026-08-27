# Validación de la Etapa 2 — panel de administración

## Implementado en el repositorio

- Acceso autenticado al panel de administración por restaurante.
- ABM de categorías y platos, con ordenamiento por arrastrar y soltar.
- Edición de nombres, descripciones, precios, disponibilidad y estado activo.
- Carga y reemplazo de imágenes de platos en el bucket `menu-images`, limitado a JPG, PNG o WebP de hasta 5 MB.
- Gestión de etiquetas dietéticas, alérgenos y traducciones para platos y categorías.
- Configuración de productos agotados: ocultarlos o mostrarlos como agotados.
- Gestión de franjas horarias y asignación de categorías a una o más cartas. La asignación se mantiene deliberadamente a nivel de categoría; los platos heredan las franjas de su categoría.
- Vista pública del menú desde el panel.
- Gestión básica de equipo: listado de administradores del mismo tenant e invitación por correo.

## Seguridad y aislamiento

- Cada Server Action obtiene el restaurante desde el perfil autenticado y vuelve a verificar la pertenencia de categorías, platos y franjas antes de modificar datos.
- Las imágenes se guardan bajo el prefijo `{restaurant_id}/` y las políticas de Storage limitan cada administrador a su tenant.
- El cliente administrativo de Supabase se crea exclusivamente en servidor y utiliza `SUPABASE_SERVICE_ROLE_KEY`; esa variable no se expone al navegador ni se versiona.
- La migración `supabase/migrations/20260827000100_admin_profile_visibility.sql` limita el listado de equipo al restaurante del administrador.

## Puesta en marcha pendiente

1. Aplicar `supabase/migrations/20260827000100_admin_profile_visibility.sql` mediante la integración de Supabase o CI. No reejecutar el seed.
2. Configurar `SUPABASE_SERVICE_ROLE_KEY` como secreto del entorno local y del despliegue para habilitar las invitaciones. Usar una Secret key de Supabase (`sb_secret_...`), no una variable con prefijo `NEXT_PUBLIC_`.
3. Verificar en un segundo tenant que el listado de equipo, las imágenes, las traducciones y las franjas no exponen ni modifican datos de Demo.

## Verificaciones realizadas localmente

- `tsc --noEmit`.
- `eslint .`.
- `git diff --check`.
- Recorrido autenticado de categorías, platos, cartas, equipo y menú público en `localhost:3001`.
- Revisión de avisos de React en formularios con Server Actions; se eliminaron los atributos `encType` y `name` incompatibles con `formAction`.

## Cierre de la etapa

El desarrollo de la Etapa 2 queda completo en el repositorio. El cierre operativo requiere aplicar la migración pendiente y realizar la verificación manual con dos tenants antes de iniciar la Etapa 3.
