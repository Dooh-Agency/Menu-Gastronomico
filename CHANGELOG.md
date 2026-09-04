# Registro de Cambios (Changelog)

Todos los cambios notables en este proyecto serán documentados en este archivo.
El formato se basa en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/).

---

## [Unreleased]

### 📚 Documentación & Configuración de Agentes
- **Estructura jerárquica de `AGENTS.md`:** Creación de `src/AGENTS.md` (frontend) y `supabase/AGENTS.md` (base de datos) complementando al `AGENTS.md` raíz.
- **Índice de documentación:** Creación de `docs/README.md` como punto central de la documentación técnica y funcional del equipo.
- **Compatibilidad multi-asistente:** Configuración de `CLAUDE.md`, `.cursorrules` y `.github/copilot-instructions.md` delegando a `AGENTS.md` y `docs/`.
- **Sincronización de Especificación y Roadmap:** Actualización de `SPEC.md` con el estado real de Etapas 0-3 y modelo conceptual, consolidación de la tabla de progreso en `docs/ROADMAP-DESARROLLO.md` y catálogo completo de migraciones en `supabase/README.md`.

### ✨ Nuevas Funcionalidades
- **Soporte de múltiples imágenes por producto:** Migración de base de datos (`item_image_paths`) y soporte en panel de administración y componentes de menú para gestionar y visualizar múltiples imágenes por ítem.
- **Vista interactiva de administración:** Creación y mejoras en `admin-menu-view.tsx` y `actions.ts` para la gestión en tiempo real del menú gastronómico.

### 🎨 UI & Diseño
- **Carrusel en tarjeta de plato:** Implementación de soporte visual y navegación de imágenes en `dish-card-horizontal.tsx`.
- **Badges de contador de fotos:** Incorporación del indicador visual `📷 {total}` en las tarjetas de platos del panel de administración (`admin-menu-view.tsx`) y en las tarjetas verticales del menú público (`dish-card-vertical.tsx`) cuando un ítem posee 2 o más fotos.
- **Forzado dinámico de datos admin:** Inclusión de `export const dynamic = "force-dynamic"` en `/admin` y `/admin/items` para evitar respuestas cacheadas tras modificaciones de platos.

### 🐛 Correcciones
- **Subida de múltiples imágenes por plato:** Se corrigió la serialización de archivos en `FormData` en `DishImagesUploader`, asegurando la adjunción explícita de todos los archivos seleccionados hacia los Server Actions sin depender de `DataTransfer`.
- **Refresco de estado en panel de administración:** Se integró `startTransition` y `router.refresh()` en los modales de creación y edición de platos (`admin-menu-view.tsx` e `item-manager.tsx`) para actualizar la interfaz inmediatamente tras guardar múltiples fotos.
- **Prevención de desmontaje prematuro:** Se eliminó el `onSubmit` sincrónico en `item-manager.tsx` que destruía el DOM antes de que concluyera la subida.
- **Diagnóstico y feedback:** Se añadieron logs de depuración en `actions.ts` y estado de carga (`"Guardando..."` / `"Creando..."`) en los botones de envío.

### 🛠️ Base de Datos & Backend
- **Migración Supabase:** Archivo `supabase/migrations/20260901010000_item_image_paths.sql` para el array/columnas de imágenes de ítems.
