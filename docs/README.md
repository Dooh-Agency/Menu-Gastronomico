# Documentación del Proyecto - Menú Gastronómico

Índice central de documentación técnica, funcional y de arquitectura para el equipo y agentes de IA.

---

## 📚 Estructura de Documentación

| Documento | Descripción |
| :--- | :--- |
| **[SPEC.md](../SPEC.md)** | Especificación técnica y funcional vigente del SaaS multi-tenant. |
| **[CHANGELOG.md](../CHANGELOG.md)** | Historial acumulativo de cambios, nuevas funciones, correcciones y diseño. |
| **[ROADMAP-DESARROLLO.md](./ROADMAP-DESARROLLO.md)** | Etapas de desarrollo, módulos, alcance actual y criterios de salida. |
| **[DECISIONES-UX-MENU.md](./DECISIONES-UX-MENU.md)** | Decisiones de arquitectura de interacción, tabs y navegación del menú público. |
| **[VALIDACION-ETAPA-1.md](./VALIDACION-ETAPA-1.md)** | Protocolo y checklist de validación para la Etapa 1. |
| **[VALIDACION-ETAPA-2.md](./VALIDACION-ETAPA-2.md)** | Protocolo y checklist de validación para la Etapa 2. |
| **[VALIDACION-ETAPA-3.md](./VALIDACION-ETAPA-3.md)** | Protocolo y checklist de validación para la Etapa 3. |

---

## 🤖 Guía de Agentes de IA e Instrucciones

El estándar unificado de instrucciones para agentes es **`AGENTS.md`**:
- **Root [`AGENTS.md`](../AGENTS.md)**: Reglas globales, guardrails, flujo de commits y mantenimiento de documentación.
- **Frontend [`src/AGENTS.md`](../src/AGENTS.md)**: Convenciones de Next.js App Router, componentes, diseño y accesibilidad.
- **Base de Datos [`supabase/AGENTS.md`](../supabase/AGENTS.md)**: Migraciones, políticas RLS, multi-tenant y seguridad.

Todos los archivos de configuración específicos de IDEs o herramientas (`CLAUDE.md`, `.cursorrules`, `.github/copilot-instructions.md`) delegan a `AGENTS.md` y a esta carpeta `docs/`.
