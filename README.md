# Plataforma de Gestión Gastronómica

Producto SaaS multi-tenant para restaurantes: menú digital, pedidos, comandas, reservas, promociones y herramientas de gestión.

## Punto de partida

El desarrollo comienza con un restaurante interno llamado Demo, utilizando datos semilla basados en el menú de MUUD. MUUD será posteriormente un tenant separado y el primer restaurante piloto para validar el producto en condiciones reales.

## Documentación

- [Hoja de ruta de desarrollo](docs/ROADMAP-DESARROLLO.md)
- [Esquema y puesta en marcha de Supabase](supabase/README.md)

## Desarrollo local

1. Copiar `.env.example` como `.env.local` y configurar las credenciales públicas del proyecto Supabase.
2. Instalar dependencias con `pnpm install`.
3. Iniciar la aplicación con `pnpm dev`.

Las migraciones SQL y los datos semilla se encuentran en `supabase/`. Demo es el tenant configurado por datos semilla; no hay rutas ni lógica dedicadas para MUUD.

La regla de trabajo es construir por etapas. Cada etapa debe ser usable, demostrable y validada antes de avanzar a la siguiente.
