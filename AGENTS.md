# Instrucciones Globales para Agentes de IA

Este archivo es la fuente canónica de verdad para cualquier agente de IA o asistente de código (Claude Code, Antigravity, Cursor, Codex, Copilot, etc.).

---

## 📚 Documentación del Proyecto (Single Source of Truth)

Toda la documentación técnica, funcional y de diseño reside en la carpeta [`/docs`](./docs/README.md):

- **[`SPEC.md`](./SPEC.md)**: Especificación funcional y técnica general.
- **[`CHANGELOG.md`](./CHANGELOG.md)**: Registro acumulativo de cambios, features, correcciones y UI.
- **[`docs/ROADMAP-DESARROLLO.md`](./docs/ROADMAP-DESARROLLO.md)**: Etapas de desarrollo, módulos y criterios de salida.
- **[`docs/DECISIONES-UX-MENU.md`](./docs/DECISIONES-UX-MENU.md)**: Decisiones de interacción y navegación del menú público.
- **[`docs/README.md`](./docs/README.md)**: Índice completo de documentación.

---

## 📂 Jerarquía de Reglas Anidadas (`AGENTS.md`)

Este repositorio implementa la convención jerárquica de `AGENTS.md`:
- **Global / Raíz [`/AGENTS.md`](./AGENTS.md)**: Reglas transversales, guardrails y protocolo de entrega.
- **Frontend [`/src/AGENTS.md`](./src/AGENTS.md)**: Reglas de Next.js App Router, componentes, UI, tokens y accesibilidad.
- **Base de Datos [`/supabase/AGENTS.md`](./supabase/AGENTS.md)**: Migraciones, políticas RLS, multi-tenant y seguridad.

*Nota:* Las reglas anidadas complementan y especifican las reglas globales sin contradecirlas.

---

## 🎯 Alcance Actual y Guardrails

1. **Alcance:** Demo interna de menú digital multi-tenant. Enfoque en menú público, administración, multi-idioma, franjas horarias y branding.
2. **Multi-tenant:** Separación estricta entre restaurantes. `MUUD` es únicamente un conjunto de datos semilla, no lógica hardcodeada.
3. **No adelantar módulos:** No construir pagos, pedidos, reservas, KDS, stock, promociones o IA sin habilitación explícita en el roadmap.
4. **Seguridad:** Nunca exponer claves secretas (`SUPABASE_SERVICE_ROLE_KEY`) al navegador.
5. **Calidad:** TypeScript estricto, accesibilidad (`prefers-reduced-motion`, foco visible, teclado) y optimización móvil.
6. **Testing Web:** No realizar pruebas interactivas en el navegador simulando usuario (abrir navegador o clics web) a menos que el usuario lo solicite explícitamente.

---

## 🔄 Mantenimiento de Contexto y Documentación

- Si se altera un modelo de datos, arquitectura o alcance: **actualizar [`SPEC.md`](./SPEC.md)**.
- Si se completa una etapa o hito: **actualizar [`docs/ROADMAP-DESARROLLO.md`](./docs/ROADMAP-DESARROLLO.md)**.
- Si se establece una nueva convención técnica o regla: **actualizar [`AGENTS.md`](./AGENTS.md)** o su respectivo archivo anidado.

---

## 🚀 Protocolo de Finalización de Tarea

Al finalizar cada tarea, el agente debe:

1. **Actualizar [`CHANGELOG.md`](./CHANGELOG.md)** bajo la sección `[Unreleased]` clasificando los cambios (Nuevas Funcionalidades, UI/Diseño, Correcciones, Backend/DB).
2. **Actualizar la documentación relevante** (`SPEC.md`, `ROADMAP-DESARROLLO.md` o `AGENTS.md`) si hubo cambios arquitectónicos o de estado.
3. **Realizar commit de los cambios** con un mensaje claro y descriptivo (o dejarlos listos y validados).
4. **Informar en la respuesta del chat**:
   - Qué se implementó.
   - Qué archivos y documentación se actualizaron.
   - Qué pruebas se ejecutaron.
   - Qué queda pendiente.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
