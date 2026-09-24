# Instrucciones para Agentes - Frontend & Aplicación (`/src`)

Este archivo complementa a [`/AGENTS.md`](../AGENTS.md) con reglas específicas para la capa de frontend y Next.js.
Para documentación general del proyecto, consultar [`/docs`](../docs/README.md).

---

## 🎨 Convenciones de UI y Componentes

1. **Tokens y Diseño:**
   - Derivar colores, tipografías, espaciados y sombras de variables CSS y tokens centralizados.
   - Respetar [`/docs/DECISIONES-UX-MENU.md`](../docs/DECISIONES-UX-MENU.md) para la interacción del menú público (tabs, scroll y activación).
   - Mantener separados los dos lenguajes visuales del producto: la vista pública del comensal puede expresar de forma sutil el branding configurable del restaurante en su contenido y acentos; la administración es una herramienta de gestión monocroma, neutral y consistente entre tenants. Nunca trasladar colores, fondos, tipografías ni ornamentos del restaurante a las superficies, controles o navegación del admin.
   - La administración utiliza una interfaz monocroma y neutral: `--ui-canvas`, `--ui-surface`, `--ui-text`, `--ui-text-secondary` y `--ui-border`. El branding de un restaurante se limita a contenido contextual (logo, fotos y vistas previas), no a los fondos, controles o tipografía del admin.
   - En administración, las acciones primarias de confirmación usan texto; las acciones de navegación o edición puntual usan texto + icono de 16 px; los controles icono-solo se reservan para acciones frecuentes e inequívocas y requieren `aria-label` o `title`. Los colores semánticos se restringen a feedback persistente o confirmaciones explícitas de riesgo.
   - La tipografía se limita a cinco roles compartidos: `--type-caption` (12 px), `--type-label` (14 px), `--type-body` (16 px), `--type-body-large` (18 px) y `--type-title` (títulos fluidos). No incorporar tamaños locales si uno de estos roles resuelve la jerarquía: auxiliar/eyebrow, etiqueta, contenido editable, subtítulo y título.
   - El ritmo vertical usa exclusivamente la escala de 8 px: 8 px entre título y descripción o etiqueta y control; 16 px entre campos relacionados; 24–32 px entre grupos funcionales; 48–64 px entre secciones de página. Los títulos usan interlineado compacto y los textos de lectura 1.5; los márgenes deben expresar relación semántica, no compensar tamaños arbitrarios.
   - Los formularios de más de un concepto se organizan por bloques semánticos visibles, no por una secuencia continua de labels. Cada bloque tiene un título breve, una ayuda opcional de una línea y sus campos relacionados; los estados operativos se expresan con controles compactos y ayuda secundaria, no con frases largas que compitan con los campos.
   - Las aclaraciones de un campo, como “Opcional”, se ubican en la misma línea de su etiqueta principal, con `--ui-text-secondary`, itálica y peso regular. Se agrupan dentro de `.field-label`; nunca deben desplazar el control a la misma línea ni quedar aisladas en un renglón propio.
   - Las traducciones siguen la jerarquía de bloque del formulario: con un único idioma adicional, el código de idioma acompaña el título “Traducciones” y no se repite antes de los campos; con más de un idioma, cada grupo conserva su código visible. El lector de pantalla debe anunciar cada código una sola vez.
   - Los selectores compuestos por opciones autocontenidas (por ejemplo, tarjetas con preview) no agregan una segunda superficie, color o borde envolvente si las opciones ya expresan agrupación. El título y una ayuda breve se separan mediante el ritmo vertical; se reserva una superficie de bloque para configuraciones con campos o estados adicionales.
   - Las tarjetas de platos del admin priorizan escaneo y operación: foto contextual contenida, nombre y precio en primer nivel, descripción y etiquetas en segundo, y una sola franja final de acciones. La disponibilidad se comunica únicamente en su control de estado —sin repetir “Agotado” dentro del contenido ni reducir el contraste de toda la tarjeta— y las etiquetas dietéticas conservan tonos neutrales.
   - El editor de platos inicia con el título y los datos editables, sin rótulos redundantes de bloque. En escritorio, la portada cuadrada se presenta en paralelo a nombre, descripción, precio y categoría; hasta tres miniaturas cuadradas seleccionables ocupan la columna lateral derecha y las restantes se pueden recorrer. El badge “Portada” acompaña únicamente a la vista principal cuando muestra la primera foto, nunca a una miniatura. El diálogo debe dar ancho suficiente a ambas columnas y apilarse en móvil. Disponibilidad, información alimentaria y traducciones se mantienen como bloques posteriores. Los selectores de chips llevan su ayuda junto a la etiqueta, nunca en una columna que compita con las opciones; la disponibilidad se expresa con un switch y texto explícito.
2. **Accesibilidad y Rendimiento:**
   - Respetar soporte para `prefers-reduced-motion`.
   - Garantizar accesibilidad por teclado (`role="tab"`, `aria-selected`, navegación accesible) y foco visible.
   - Optimizar imágenes y rendimiento en dispositivos móviles.

---

## ⚡ Next.js y React

1. **Separación Servidor / Cliente:**
   - Mantener componentes de servidor (RSC) para fetch de datos y renderizado inicial.
   - Usar `'use client'` únicamente cuando se requiera estado interactivo, hooks o event listeners.
   - Usar Server Actions tipadas para mutaciones (ej. `src/app/admin/actions.ts`).
2. **TypeScript Estricto:**
   - Evitar `any`. Tipar props, estados y respuestas de actions.
   - Mantener componentes pequeños, modulares y con una única responsabilidad.
3. **Gestión de Imágenes y Multimedia:**
   - Soportar siempre `image_paths: string[]` (carrusel de múltiples fotos, máx. 6) junto al fallback retrocompatible `image_path: string | null`.
   - En formularios de subida, serializar explícitamente los archivos (`formData.append("images", file)`) y rutas preservadas (`formData.append("kept_image_paths", path)`).
   - En páginas administrativas que consulten datos mutables de Supabase, declarar `export const dynamic = "force-dynamic"` para garantizar datos frescos post-mutación.
4. **Estandarización de Modales en el Admin:**
   - Todo modal del panel de control debe seguir estrictamente la jerarquía:
     1. **Foto / Media:** (Uploader de fotos o banner con preview arriba de todo).
     2. **Título:** (Encabezado principal `modal-title` y `eyebrow`).
     3. **Descripción:** (`modal-description` contextual y explicativa).
     4. **Campos y Acciones.**
   - Utilizar siempre `AdminDialog` como contenedor base (incluye botón de cierre "✕", backdrop con `blur(8px)` y animaciones de entrada).
   - En platos, alérgenos y etiquetas dietéticas deben emplear `TagMultiSelector` como chips/pills interactivas.
   - En cartas, usar el modal unificado `MenuFormDialog` con checkboxes para cada día de la semana (Lun a Dom) y turnos múltiples.
5. **Categorías Reutilizables entre Cartas:**
   - Las categorías son grupos de platos pertenecientes al restaurante, reutilizables en múltiples cartas mediante la tabla intermedia `public.menu_category_menus`.
   - **No clonar platos ni categorías** para compartirlos entre cartas: utilizar `assignCategoryToMenu` para vincular y `unlinkCategoryFromMenu` para desvincular sin destruir los platos.
   - Soportar `menu_ids: string[]` y `menu_assignments: Array<{ menu_id: string; sort_order: number }>` con ordenamiento específico por carta y fallback retrocompatible a `menu_id`.
6. **Personalización de Tarjetas por Categoría y Modales Wizard:**
   - Cada categoría define su formato de tarjetas mediante `card_layout: 'rectangle' | 'hero' | 'carousel'`.
   - **Menú público:** Renderizar la tarjeta y contenedor correspondiente según `category.card_layout`:
     - `'hero'` ➔ `<div className="menu-items-hero-grid">` con `DishCardHero` (cuadrado grande destacado para plato del día o sugerencias).
     - `'carousel'` ➔ `<div className="menu-items-carousel-row">` con `DishCardCompact` (scroll horizontal táctil para categorías breves o postres).
     - `'rectangle'` ➔ `<div className="menu-items-horizontal-list">` con `DishCardHorizontal` (formato estándar en lista).
   - **Modales de categoría:** Emplear el componente `CardLayoutSelector` y un flujo multi-paso (Wizard) o pestañas:
     - **Paso 1:** Información básica (Nombre, descripción, cartas donde se muestra y traducciones).
     - **Paso 2:** Selección visual de formato de tarjetas con mini-mockups gráficos interactivos y explicaciones de uso.
     - Disponible en `CategoryManager` (`category-manager.tsx`) y en el editor de cartas (`admin-menu-view.tsx`).
7. **Gestión y Configuración de Categorías en Edición de Cartas (`AdminMenuView`):**
   - **Barra de navegación de categorías:** Controles de acción ubicados a la izquierda: botón circular de Configuración (`admin-category-settings-btn`) con icono de engranaje y botón de Agregar (`admin-add-category-circle-btn`) con icono `+`, separados de las pestañas scrollables por `.admin-category-tabs-divider`. El botón de agregar no debe ubicarse al final a la derecha del scroll.
   - **Modal de configuración (`MenuCategoriesConfigDialog`):**
     - Muestra las categorías de la carta activa en su orden de presentación actual.
     - Soporta reordenamiento mediante Drag & Drop con persistencia instantánea (`reorderMenuCategories` vía `upsert` en `menu_category_menus`) y controles accesibles de subir/bajar (▲/▼).
     - **Referencia al formato de UI:** Cada categoría exhibe un badge conciso con su formato `card_layout` (*"Cuadrado grande"*, *"Scroll horizontal"*, *"Rectángulo"*) de forma directa e integrada, sin sobrecargar la interfaz con leyendas redundantes.
     - Gestión individual por fila: Editar (datos y formato visual), Quitar de esta carta (`unlinkCategoryFromMenu`), y Eliminar definitivamente (`deleteCategory`).
8. **Estructura del Navbar de Administración (`AdminNav`):**
   - **Enlaces canónicos:** `Menú` (`/admin`), `Configuración` (`/admin/settings`), `Equipo` (`/admin/users`) y el acceso directo `Ver menú público`.
   - La foto de perfil o logo es un dato del restaurante, no de una carta. Su edición se abre desde el desplegable del perfil del header global; el editor de carta no repite ese acceso ni reserva espacio para él.
   - No exponer pestañas separadas de `Categorías` ni `Platos` en el navbar superior; toda la creación, edición, reordenamiento y configuración de cartas, categorías y platos se gestiona de forma centralizada y contextual en `/admin`.
9. **Reutilización y Unificación del Header Flotante (`menu-hero-pill-nav`):**
   - Toda vista pública del menú debe utilizar la función o componente auxiliar unificado `renderPublicHeader`.
   - **En el selector de cartas (`!selectedMenuId`):** El slot izquierdo exhibe la foto de perfil/logo del restaurante.
   - **Al ingresar a una carta (`selectedMenuId`):** La foto de perfil se retira automáticamente y el slot izquierdo muestra la flecha circular de retorno (`<`).
   - **Nombre de marca:** Centrado sin el punto (`•`) ni caracteres decorativos extra.
   - **Slot derecho:** Mantiene el selector de idiomas cápsula (`ES`, `EN`, etc.).
