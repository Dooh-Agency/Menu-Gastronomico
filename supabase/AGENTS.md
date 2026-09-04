# Instrucciones para Agentes - Base de Datos & Supabase (`/supabase`)

Este archivo complementa a [`/AGENTS.md`](../AGENTS.md) con reglas específicas para la capa de persistencia y migraciones.
Para documentación general del proyecto, consultar [`/docs`](../docs/README.md).

---

## 🔒 Seguridad y Multi-Tenant

1. **Aislamiento de Tenants:**
   - Toda tabla asociada a un restaurante debe incluir `tenant_id` (o `restaurant_id`).
   - Toda consulta o mutación debe aplicar filtros estrictos por tenant.
2. **Políticas RLS (Row Level Security):**
   - Habilitar RLS en todas las tablas creadas.
   - Definir políticas claras de lectura pública (para menús activos) y escritura restringida (para administradores del tenant).
3. **Secretos y Credenciales:**
   - **NUNCA** exponer `SUPABASE_SERVICE_ROLE_KEY` ni secrets en el cliente/frontend.
   - Las operaciones privilegiadas se ejecutan exclusivamente en Server Actions o rutas de servidor.

---

## 📦 Migraciones y Datos Semilla

1. **Migraciones:**
   - Crear archivos numerados y descriptivos en `supabase/migrations/` (ej. `YYYYMMDDHHMMSS_descripcion.sql`).
   - Evitar cambios destructivos (`DROP TABLE`, `DROP COLUMN`) sin confirmación explícita.
   - Tras agregar o modificar columnas (ej. `ALTER TABLE ... ADD COLUMN ...`), ejecutar o incluir `NOTIFY pgrst, 'reload schema';` para recargar la caché de PostgREST inmediatamente.
   - Para colecciones de cadenas como fotos de platos, usar tipos nativos (`text[] NOT NULL DEFAULT '{}'::text[]`).
2. **Datos Semilla (MUUD):**
   - `MUUD` es únicamente un restaurante de demostración con datos semilla (`seed-demo-menu.sql`).
   - No escribir lógica acoplada a MUUD en el código de la aplicación.
