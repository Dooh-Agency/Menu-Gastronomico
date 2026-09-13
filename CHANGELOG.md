# Registro de Cambios (Changelog)

Todos los cambios notables en este proyecto serán documentados en este archivo.
El formato se basa en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/).

---

## [Unreleased]

### 📚 Documentación & Configuración de Agentes
- **Checklists interactivos en el Roadmap (`docs/ROADMAP-DESARROLLO.md`):** Se convirtieron todos los ítems de alcance, validaciones y actividades a formato de checklist interactivo (`- [ ]`), marcando automáticamente las Etapas 0, 1, 2 y 3 como completadas (`- [x]`) y dejando las etapas 4 en adelante preparadas para seguimiento de progreso.
- **Actualización de decisiones de UX en `docs/DECISIONES-UX-MENU.md`:** Se documentó la transición hacia un feed continuo sin filtrado excluyente por categorías, navegación rápida por anclas con scroll suave, auto-centrado de tabs y Scrollspy vertical.
- **Estructura jerárquica de `AGENTS.md`:** Creación de `src/AGENTS.md` (frontend) y `supabase/AGENTS.md` (base de datos) complementando al `AGENTS.md` raíz.
- **Índice de documentación:** Creación de `docs/README.md` como punto central de la documentación técnica y funcional del equipo.
- **Compatibilidad multi-asistente:** Configuración de `CLAUDE.md`, `.cursorrules` y `.github/copilot-instructions.md` delegando a `AGENTS.md` y `docs/`.
- **Sincronización de Especificación y Roadmap:** Actualización de `SPEC.md` con el estado real de Etapas 0-3 y modelo conceptual, consolidación de la tabla de progreso en `docs/ROADMAP-DESARROLLO.md` y catálogo completo de migraciones en `supabase/README.md`.

### ✨ Nuevas Funcionalidades
- **Formateador inteligente de números de teléfono (`phone-formatter.ts`):** Formateo automático de teléfonos para Argentina (detecta código de área de 2 dígitos como Buenos Aires `11` -> `+54 11 xxxx-xxxx`, de 3 dígitos como Córdoba `351` -> `+54 351 xxx-xxxx`, o 4 dígitos) y números internacionales, generando enlaces `tel:` limpios y cliqueables.
- **Modal de Configuración y Reordenamiento de Categorías por Carta:** Nuevo diálogo interactivo (`MenuCategoriesConfigDialog`) accesible desde la barra de navegación de categorías de la carta activa. Permite organizar y reordenar las categorías pertenecientes a la carta en cuestión mediante Drag & Drop con persistencia instantánea (`reorderMenuCategories`) y botones accesibles de desplazamiento (▲/▼). Brinda administración individual (editar datos y formato de tarjetas, quitar de la carta conservando platos en el restaurante, o eliminar definitivamente).
- **Referencia concisa al tipo de UI de tarjetas:** Cada fila del modal muestra de forma limpia y directa el formato de presentación configurado mediante un badge sutil en la misma línea del nombre (*"Cuadrado grande"*, *"Scroll horizontal"*, *"Rectángulo"*), manteniendo la interfaz libre de sobrecargas visuales o leyendas redundantes.
- **Rediseño del footer de contacto (`RestaurantFooter`):** Componente de ancho completo (100% full-bleed width) con fondo del **color principal** (`--color-accent`) configurado por el administrador. Contiene tarjetas blancas elevadas con íconos vectoriales SVG (Teléfono, Email, Ubicación y Sitio Web), acentos con el color secundario y animaciones interactivas de hover.
- **Optimizaciones de formularios y espaciado de etiquetas (Admin & Configuración):** Corrección completa de las jerarquías de proximidad visual (*Law of Proximity*) y espaciados entre etiquetas (`label`), aclaraciones opcionales (`.field-optional`) y campos de entrada (`input`, `select`, `textarea`). Se corrigió el problema de salto de línea involuntario en textos de ayuda, se unificó la distancia vertical entre etiqueta y campo (7px), y se ampliaron las separaciones entre campos consecutivos (22px) con bordes e indicadores de enfoque suaves en color de acento.
- **Banner de carta interactivo con accesibilidad total:** La superficie del banner de la carta activa en el panel de administración ahora es completamente interactiva (`role="button"`, `tabIndex={0}`, eventos de teclado `Enter`/`Space`), con feedback visual de hover (zoom sutil en imagen, badge *"Modificar carta"* y elevación) y acción directa para modificar portada, nombre, horarios y disponibilidad.
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
- **Simplificación del navbar de administración (`AdminNav`):** Se removieron los enlaces de *"Categorías"* y *"Platos"* de la barra de navegación principal superior. Toda la gestión de cartas, categorías, platos y ordenamiento se realiza ahora de manera integrada y contextual dentro de la sección *"Menú"* (`/admin`), dejando el navbar limpio y enfocado exclusivamente en *"Menú"*, *"Configuración"* y *"Equipo"*.
- **Reorganización de controles en barra de categorías:** Se reubicó el botón circular de agregar categoría (`+`), trasladándolo desde el extremo derecho hacia el extremo izquierdo, y se agregó a su izquierda un nuevo botón circular de Configuración con icono de engranaje (`admin-category-settings-btn`), separados de las pestañas scrollables de categorías mediante un divisor visual sutil. De este modo, los accesos para configurar y sumar categorías permanecen anclados y visibles en todo momento.
- **Modificación de cartas centralizada exclusivamente en el banner:** En `admin-menu-view.tsx`, se unificó el punto de acceso para editar la carta en el propio banner. Se eliminó el botón *"Editar carta"* junto al título y el botón de lápiz en la barra lateral (`menus-sidebar.tsx`). Además, el selector de *"Horarios disponibles"* ahora es un indicador informativo de lectura (`admin-schedule-info-display`), garantizando que la modificación de la carta se realice únicamente haciendo clic en el banner interactivo.
- **Navegación continua por categorías con scroll suave y Scrollspy:** En `menu-publico.tsx`, las categorías ya no filtran ni ocultan el contenido de la carta. Todas las secciones se muestran en un feed vertical continuo. Al hacer clic o tap en una categoría, la página se desplaza suavemente hasta su sección (`scrollIntoView` con respeto a `prefers-reduced-motion`). Se incorporó un observador de scroll (*Scrollspy*) que destaca la categoría activa en la barra superior mientras se recorre la carta y auto-centra suavemente la tab activa en pantallas móviles.
- **Desactivación de auto-selección por scroll en barra de categorías:** Se eliminó el listener y debounce que activaba automáticamente la categoría centrada al finalizar el desplazamiento horizontal en la barra de navegación, permitiendo descubrir categorías libremente.
- **Nuevos componentes de tarjetas gastronómicas:**
  - `DishCardHero`: Tarjeta amplia con imagen de cabecera en alta resolución, badge de contador de fotos, precio destacado y tags dietéticos.
  - `DishCardCompact`: Tarjeta cuadrada compacta diseñada para navegación horizontal suave en carrusel.
- **Contenedores de menú público dinámicos:** Integración en `menu-publico.tsx` de `.menu-items-hero-grid`, `.menu-items-carousel-row` y `.menu-items-horizontal-list` con soporte de accesibilidad por teclado y `prefers-reduced-motion`.

### 🗄️ Backend & Base de Datos
- **Robustez en reordenamiento de categorías (`reorderMenuCategories`):** Operación `upsert` sobre `menu_category_menus` con conflicto sobre `(menu_id, category_id)` para asegurar persistencia confiable de `sort_order` en asignaciones existentes y migradas.
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
- **Prevención de bucle infinito en DishImagesUploader (`Maximum update depth exceeded`):** Se eliminó el ciclo de re-renderizados continuos ocasionado por referencias recreadas de `initialImages` y ejecuciones sincrónicas de `setState` dentro de `useEffect`. Se implementó serialización defensiva de imágenes iniciales, se unificó la estructura de imágenes preparadas (`stagedImages` con archivo y URL de objeto) y se desacopló la notificación de cambios hacia los manejadores de eventos directos.
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

