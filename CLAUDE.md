# Instrucciones para Claude Code

## Contexto

Este repositorio contiene una plataforma SaaS multi-tenant de gestión gastronómica. La especificación principal está en `SPEC.md` y la hoja de ruta completa en `docs/ROADMAP-DESARROLLO.md`.

## Reglas de trabajo

1. Leer `SPEC.md` y el roadmap antes de modificar el proyecto.
2. Trabajar una etapa por vez. No adelantar módulos del roadmap.
3. Mantener MUUD como datos semilla y tenant de demo, no como código especial.
4. No implementar pedidos, reservas, pagos, stock, promociones o IA hasta que estén explícitamente habilitados en la etapa correspondiente.
5. Antes de crear tablas o migraciones, proponer el modelo y las políticas RLS.
6. Toda entidad asociada a un restaurante debe quedar aislada por tenant.
7. Nunca exponer `SUPABASE_SERVICE_ROLE_KEY` ni otros secretos al navegador.
8. Usar TypeScript estricto y componentes pequeños.
9. Derivar colores, tipografías, espaciados y duraciones de tokens centralizados.
10. Respetar accesibilidad, teclado, foco visible y `prefers-reduced-motion`.
11. Optimizar imágenes y rendimiento móvil.
12. No hacer cambios destructivos sin pedir confirmación.
13. Mantener commits pequeños, descriptivos y verificables.
14. Antes de cerrar una etapa, ejecutar las verificaciones disponibles y documentar lo que se probó.

## Formato de trabajo esperado

Antes de implementar:

- Resumir el objetivo.
- Indicar qué archivos se modificarán.
- Señalar supuestos y riesgos.
- Confirmar que el trabajo está dentro de la etapa actual.

Después de implementar:

- Resumir los cambios.
- Informar pruebas ejecutadas y resultado.
- Informar pendientes o decisiones requeridas.
