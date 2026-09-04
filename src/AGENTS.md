# Instrucciones para Agentes - Frontend & Aplicación (`/src`)

Este archivo complementa a [`/AGENTS.md`](../AGENTS.md) con reglas específicas para la capa de frontend y Next.js.
Para documentación general del proyecto, consultar [`/docs`](../docs/README.md).

---

## 🎨 Convenciones de UI y Componentes

1. **Tokens y Diseño:**
   - Derivar colores, tipografías, espaciados y sombras de variables CSS y tokens centralizados.
   - Respetar [`/docs/DECISIONES-UX-MENU.md`](../docs/DECISIONES-UX-MENU.md) para la interacción del menú público (tabs, scroll y activación).
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

