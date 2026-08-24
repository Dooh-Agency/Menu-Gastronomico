# Instrucciones para agentes de IA

## Documentos de referencia

- `SPEC.md`: especificación funcional y técnica vigente.
- `docs/ROADMAP-DESARROLLO.md`: etapas, módulos y criterios de salida.
- `README.md`: punto de entrada general del repositorio.

## Alcance actual

El proyecto comienza con una demo interna del menú digital usando datos semilla de MUUD. La primera versión debe concentrarse en menú público, configuración multi-tenant, administración, idiomas, franjas horarias, disponibilidad y branding.

## Guardrails

- Implementar por etapas y no construir funcionalidades futuras antes de tiempo.
- Mantener separación estricta entre restaurantes.
- No crear código específico de MUUD si puede resolverse mediante configuración.
- No incorporar pagos, pedidos, reservas, KDS, stock, promociones o IA sin habilitación explícita.
- No exponer secretos.
- No borrar ni sobrescribir datos sin confirmación.
- Mantener accesibilidad, rendimiento móvil y soporte para `prefers-reduced-motion`.
- No agregar dependencias innecesarias.
- Verificar los cambios antes de entregarlos.

## Entrega de cada tarea

Cada tarea debe informar:

1. Qué se implementó.
2. Qué archivos se modificaron.
3. Qué pruebas se ejecutaron.
4. Qué queda pendiente.


<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
