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
- **Personalización de formato de tarjetas por categoría (`card_layout`):** Cada categoría ahora puede definir su propio estilo de presentación en el menú público entre 3 opciones:
  - **Rectángulo clásico (`rectangle`):** Lista vertical con imagen lateral derecha, ideal para cartas extensas y variadas.
  - **Cuadrado grande / Hero (`hero`):** Tarjeta destacada y amplia con foto protagonista, tipografía generosa y precio destacado, ideal para *"Plato del día"*, sugerencias del chef o cortes premium.
  - **Scroll horizontal (`carousel`):** Fila deslizable de tarjetas cuadradas compactas con soporte táctil (`scroll-snap`), ideal para categorías breves, postres, entradas o cafetería.
- **Modal de categorías multi-paso (Wizard en 2 pasos):**
  - **Paso 1:** Información básica (Nombre, descripción, cartas donde se muestra y traducciones).
  - **Paso 2:** Selector visual interactivo (`CardLayoutSelector`) con mini-mockups gráficos ilustrados y badges explicativos del formato seleccionado.
  - Disponible tanto en la gestión de categorías (`category-manager.tsx`) como en el editor de cartas (`admin-menu-view.tsx`).
- **Badges de formato en administración:** Indicadores visuales claros en las listas y bloques de categorías del panel de control que informan el diseño configurado (*"Cuadrado grande"*, *"Scroll horizontal"*, *"Rectángulo"*).

### 🎨 UI & Diseño
- **Nuevos componentes de tarjetas gastronómicas:**
  - `DishCardHero`: Tarjeta amplia con imagen de cabecera en alta resolución, badge de contador de fotos, precio destacado y tags dietéticos.
  - `DishCardCompact`: Tarjeta cuadrada compacta diseñada para navegación horizontal suave en carrusel.
- **Contenedores de menú público dinámicos:** Integración en `menu-publico.tsx` de `.menu-items-hero-grid`, `.menu-items-carousel-row` y `.menu-items-horizontal-list` con soporte de accesibilidad por teclado y `prefers-reduced-motion`.

### 🗄️ Backend & Base de Datos
- **Migración `20260905140000_category_card_layout.sql`:** Nueva columna `card_layout` con restricción CHECK en `public.menu_categories`.
- **Compatibilidad y fallback defensivo:** Soporte en `createCategory`, `updateCategory`, `getPublicMenu` y vistas de administración con fallback ante esquemas sin migrar (código 42703).

- **Estandarización de modales con estructura 1-2-3:** Implementación obligatoria de la jerarquía visual **1- Foto / Media**, **2- Título**, **3- Descripción** en los modales de administración.
- **Modal unificado de cartas (`MenuFormDialog`):** Unificación de creación y edición de cartas en un único modal en `menu-dialogs.tsx` con carga de portada, metadatos y configuración horaria integrada.
- **Franjas horarias avanzadas con días combinados:** Selector con checkboxes individuales para cada uno de los 7 días de la semana (Lun a Dom), presets rápidos (*"Todos"*, *"Lun a Vie"*, *"Sáb y Dom"*) y capacidad de agregar múltiples franjas horarias por carta.
- **Categorías como grupos de platos reutilizables entre cartas:** Las categorías ahora son entidades a nivel restaurante que pueden asignarse y reutilizarse en múltiples cartas mediante la tabla intermedia `public.menu_category_menus`. Se eliminó la duplicación de datos: cualquier modificación de un plato en una categoría se refleja instantáneamente en todas las cartas donde esté presente.
- **Acciones seguras de desvinculación y eliminación de categorías:** Se implementó *"Quitar de esta carta"* (`unlinkCategoryFromMenu`) para desasociar la categoría de la carta activa conservando sus platos y su presencia en otras cartas, junto con *"Eliminar definitivamente"* (`deleteCategory`) con advertencia si la categoría está en múltiples cartas.
- **Ordenamiento independiente por carta:** Cada carta define su propio orden de categorías (`sort_order`) sin afectar la disposición en otras cartas.
- **Badges de categorías compartidas:** Indicadores visuales en el panel de administración (`admin-menu-view.tsx` y `category-manager.tsx`) que señalan qué categorías están compartidas en varias cartas y cuáles no tienen carta asignada.
- **Selector múltiple de etiquetas y alérgenos (`TagMultiSelector`):** Componente interactivo de pills/chips para platos con 5 etiquetas dietéticas (*Vegano*, *Vegetariano*, *Sin TACC*, *Keto*, *Casero*) y 5 alérgenos iniciales (*Gluten*, *Lácteos*, *Huevos*, *Maní y frutos secos*, *Pescados y mariscos*).
- **Soporte de múltiples imágenes por producto:** Migración de base de datos (`item_image_paths`) y soporte en panel de administración y componentes de menú para gestionar y visualizar múltiples imágenes por ítem.
- **Vista interactiva de administración:** Creación y mejoras en `admin-menu-view.tsx` y `actions.ts` para la gestión en tiempo real del menú gastronómico.

### 🎨 UI & Diseño
- **Mejora de `AdminDialog`:** Botón de cierre "✕" accesible flotante en la esquina superior derecha, fondo con desenfoque de cristal (`backdrop-filter: blur(8px)`), animaciones suaves de entrada (`scale` y `opacity`) y esquinas redondeadas modernas.
- **Jerarquía visual en formularios de platos:** Uploader de fotos múltiples reubicado arriba de todo, seguido de título, descripción y campos estructurados.

### 🎨 UI & Diseño
- **Carrusel en tarjeta de plato:** Implementación de soporte visual y navegación de imágenes en `dish-card-horizontal.tsx`.
- **Badges de contador de fotos:** Incorporación del indicador visual `📷 {total}` en las tarjetas de platos del panel de administración (`admin-menu-view.tsx`) y en las tarjetas verticales del menú público (`dish-card-vertical.tsx`) cuando un ítem posee 2 o más fotos.
- **Forzado dinámico de datos admin:** Inclusión de `export const dynamic = "force-dynamic"` en `/admin` y `/admin/items` para evitar respuestas cacheadas tras modificaciones de platos.

### 🐛 Correcciones
- **Migración de selección de cartas en gestor de categorías (`/admin/categories`):** Se reemplazó el uso legacy de la tabla `dayparts` ("Diurna", "Nocturna", "Mostrador") por el listado de cartas reales (`menus`) en los modales de creación y edición de categorías (`category-manager.tsx`). Se implementó `syncCategoryMenus` en `actions.ts` para sincronizar las asignaciones en `menu_category_menus`.
- **Limpieza de franjas horarias residuales:** Migración `20260905130000_cleanup_legacy_dayparts.sql` para remover registros huérfanos de `dayparts` provenientes del seed inicial.
- **Subida de múltiples imágenes por plato:** Se corrigió la serialización de archivos en `FormData` en `DishImagesUploader`, asegurando la adjunción explícita de todos los archivos seleccionados hacia los Server Actions sin depender de `DataTransfer`.
- **Refresco de estado en panel de administración:** Se integró `startTransition` y `router.refresh()` en los modales de creación y edición de platos (`admin-menu-view.tsx` e `item-manager.tsx`) para actualizar la interfaz inmediatamente tras guardar múltiples fotos.
- **Prevención de desmontaje prematuro:** Se eliminó el `onSubmit` sincrónico en `item-manager.tsx` que destruía el DOM antes de que concluyera la subida.
- **Diagnóstico y feedback:** Se añadieron logs de depuración en `actions.ts` y estado de carga (`"Guardando..."` / `"Creando..."`) en los botones de envío.

### 🛠️ Base de Datos & Backend
- **Migración de categorías reutilizables:** Archivo `supabase/migrations/20260905120000_reusable_menu_categories.sql` que crea la tabla `public.menu_category_menus`, migra datos existentes, establece triggers de integridad multi-tenant y configura RLS.
- **Migración de limpieza de franjas obsoletas:** Archivo `supabase/migrations/20260905130000_cleanup_legacy_dayparts.sql` para purgar registros antiguos de `dayparts`.
- **Migración Supabase:** Archivo `supabase/migrations/20260901010000_item_image_paths.sql` para el array/columnas de imágenes de ítems.

