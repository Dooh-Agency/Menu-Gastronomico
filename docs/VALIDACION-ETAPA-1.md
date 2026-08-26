# Validación de la Etapa 1 — menú público

## Implementado en el repositorio

- Menú por slug de restaurante: `/{slug}`.
- Categorías, filtros dietéticos, alérgenos, disponibilidad, idiomas y cartas por franja horaria.
- Navegación horizontal de categorías documentada en `DECISIONES-UX-MENU.md`.
- Vista de detalle accesible para cada plato.
- QR de demostración en `/{slug}/qr`, con enlace a la carta.
- Manifiesto PWA e ícono de aplicación.
- Menú Demo con franjas **Diurna** (07:00–20:00) y **Nocturna** (20:00–23:00).

## Migración pendiente en Supabase

Aplicar `supabase/migrations/20260826100000_align_demo_daypart_names.sql` después de las migraciones anteriores. Corrige sólo las dos franjas del tenant Demo ya existente; no reejecuta el seed ni modifica otros restaurantes.

## Verificaciones realizadas localmente

- `tsc --noEmit`.
- `eslint .`.
- `next build --webpack`.
- Menú Demo, selector de idioma, selector de franja, tabs de categorías, QR y detalle de plato.

## Cierre antes de declarar terminada la etapa

1. Aplicar la migración de franjas en Supabase.
2. Comprobar la URL pública desplegada en Netlify con datos de Supabase.
3. Probar en teléfono real: QR de demostración, navegación horizontal, foco de teclado y reducción de movimiento.
4. Simular una conexión lenta desde las herramientas del navegador y revisar la carga de imágenes.
