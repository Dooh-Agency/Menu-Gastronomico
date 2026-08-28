# Validación de la Etapa 3 — branding y configuración por restaurante

## Implementado en el repositorio

- Configuración por restaurante de nombre, colores principal/fondo/texto, tipografía y radios.
- Logo e imagen de portada opcionales, almacenados en `menu-images` bajo `{restaurant_id}/branding/`.
- Idiomas habilitados, idioma predeterminado y zona horaria editables desde Administración.
- Datos de contacto opcionales visibles al final del menú público.
- Los tokens visuales se aplican al menú público mediante variables CSS por tenant; no existe código dedicado a MUUD.
- La configuración de agotados, cartas y franjas horarias de la Etapa 2 permanece disponible en la misma sección de Configuración.

## Seguridad y aislamiento

- La Server Action obtiene el `restaurant_id` desde el perfil autenticado; no acepta un tenant desde el formulario.
- Las imágenes de branding se cargan únicamente bajo el prefijo del restaurante autenticado.
- Al reemplazar una imagen se elimina solo la versión anterior dentro de `branding/` de ese mismo tenant.
- La acción valida formatos y tamaño de imágenes, valores de color, idiomas, zona horaria y URL de contacto antes de persistirlos.

## Verificaciones realizadas localmente

- `tsc --noEmit`.
- `eslint .`.
- `git diff --check`.

La compilación de producción con `next build` no pudo completarse en este entorno: Turbopack falla al intentar crear un proceso que abre un puerto local durante el procesamiento de CSS (`Operation not permitted`). No se reportaron errores de TypeScript ni ESLint.

## Pendiente para cerrar la etapa

1. Aplicar las migraciones pendientes de la Etapa 2 si todavía no están aplicadas en Supabase.
2. Crear o usar un segundo tenant de prueba y configurar colores, portada, idiomas y contacto distintos.
3. Verificar manualmente que ese tenant no pueda editar ni servir assets/configuración del tenant Demo.
4. Hacer un recorrido visual en móvil y escritorio con logo y portada cargados.
