# Plataforma de Gestión Gastronómica

Producto SaaS multi-tenant para restaurantes: menú digital interactivo, cartas múltiples, branding configurable, administración en tiempo real y arquitectura lista para escalar (pedidos, comandas, reservas y pagos).

---

## 📍 Punto de partida

El desarrollo comienza con un restaurante interno de demostración llamado **`Demo`**, utilizando datos semilla de referencia. **`MUUD`** será el primer restaurante piloto para validar el producto en condiciones reales en un tenant aislado.

---

## 📚 Documentación del Proyecto

Toda la documentación técnica y de arquitectura está centralizada en [`/docs`](docs/README.md):

- **[`SPEC.md`](SPEC.md)**: Especificación funcional, modelo conceptual y roles.
- **[`docs/README.md`](docs/README.md)**: Índice completo de documentación del equipo.
- **[`docs/ROADMAP-DESARROLLO.md`](docs/ROADMAP-DESARROLLO.md)**: Hoja de ruta de desarrollo y módulos por etapa.
- **[`CHANGELOG.md`](CHANGELOG.md)**: Registro acumulativo de cambios y entregas.
- **[`AGENTS.md`](AGENTS.md)**: Instrucciones globales y reglas para agentes de IA.
- **[`supabase/README.md`](supabase/README.md)**: Esquema de base de datos, RLS y migraciones.

---

## 🚀 Desarrollo local

1. Clonar el repositorio.
2. Copiar `.env.example` como `.env.local` y configurar las credenciales de Supabase.
3. Instalar dependencias:
   ```bash
   pnpm install
   ```
4. Iniciar el servidor de desarrollo:
   ```bash
   pnpm dev
   ```
5. Abrir `http://localhost:3000/demo` para ver el menú público o `http://localhost:3000/admin` para el panel de gestión.
