# Especificación de producto

## Plataforma de Gestión Gastronómica

### Estado del documento

- Estado: desarrollo activo y estabilización de demo.
- Primer objetivo: demo interna con datos semilla de referencia en el tenant `Demo`.
- Primer piloto previsto: MUUD (tenant separado en producción).
- Alcance completado: Etapa 0 (Fundaciones), Etapa 1 (Menú Público), Etapa 2 (Panel Admin) y Etapa 3 (Branding y Cartas).
- Alcance actual: Etapa 4 (Validación interna y pulido) y preparación de Etapa 5 (Mesas y QR).

## 1. Visión

La plataforma es un SaaS multi-tenant para restaurantes, cafés y bistrós. Ofrece un menú digital configurable por local y, progresivamente, pedidos, comandas, reservas, promociones, stock y reportes.

El producto debe permitir que varios restaurantes utilicen la misma aplicación, manteniendo sus datos, usuarios, menú y configuración aislados.

Demo será el tenant de demostración interno. MUUD será posteriormente un tenant separado y el primer cliente piloto. No se debe implementar lógica específica de MUUD que no pueda resolverse mediante configuración.

## 2. Objetivo inmediato

Construir una demo interna que permita:

- Mostrar el menú de Demo con datos semilla de referencia.
- Navegar categorías y platos con soporte de múltiples imágenes (carrusel).
- Mostrar nombres, descripciones, precios, fotos y etiquetas.
- Cambiar entre español e inglés de forma fluida.
- Usar una carta única o varias cartas por franja horaria / estacionales.
- Activar y desactivar productos en tiempo real.
- Aplicar branding configurable por restaurante (colores, fuentes, logos, portadas).
- Administrar el contenido completo desde el panel de gestión.
- Verificar aislamiento estricto entre tenants con RLS.

La demo se validará primero dentro de la agencia. Después podrá desplegarse para MUUD como piloto controlado.

## 3. Alcance de la primera versión usable

### Incluido (Etapas 0 a 3)

- Menú público mobile-first con navegación horizontal y vista accesible.
- URL por restaurante mediante slug (`/{slug}`) o dominio configurado.
- Categorías y platos con ordenamiento drag-and-drop.
- Precios, descripciones, fotos individuales o carrusel de múltiples fotos (`item_image_paths`).
- Etiquetas dietéticas y alérgenos.
- Soporte multi-idioma (Español / Inglés) con traducciones dinámicas.
- Sistema de cartas múltiples (`menus`) con categorías como grupos de platos reutilizables (`menu_category_menus`) y cartas por franja horaria (`dayparts`).
- Horarios y zona horaria configurables por restaurante.
- Disponibilidad de productos en tiempo real.
- Configuración de productos agotados: ocultar o mostrar como agotados.
- Panel de administración interactivo con Server Actions y validación de tenant.
- Branding configurable por tenant (paleta de color, tipografía, radios, logo, portada y redes).
- Datos semilla del tenant interno Demo.
- Segundo tenant de prueba para validar aislamiento multi-tenant.

### No incluido todavía (Etapas posteriores)

- Pedidos en mesa / Carrito.
- Mesas y QR dinámicos con sesión de comensal.
- Comandas y KDS en cocina.
- Reservas.
- Take away.
- Pagos integrados.
- Stock y control de merma.
- Promociones dinámicas.
- Reportes avanzados.
- Asistente de IA para comensales.
- Facturación fiscal.

## 4. Roadmap de módulos

El desarrollo completo está documentado en [docs/ROADMAP-DESARROLLO.md](docs/ROADMAP-DESARROLLO.md). El orden resumido es:

1. Fundaciones técnicas. *(Completado)*
2. Menú público. *(Completado)*
3. Panel de administración. *(Completado)*
4. Branding y configuración por restaurante. *(Completado)*
5. Validación interna y estabilización. *(En curso)*
6. Mesas y códigos QR.
7. Pedido en mesa.
8. Comandas y KDS.
9. Herramientas de salón.
10. Validación con MUUD.
11. Reservas.
12. Take away.
13. Consulta del menú con IA.
14. Promociones dinámicas.
15. Stock y anti-merma.
16. Reportes.
17. Pagos.
18. Suscripciones.
19. Super-admin.
20. Onboarding automatizado.
21. Cumplimiento, observabilidad y escala.

## 5. Roles iniciales

| Rol | Acceso | Responsabilidad |
|---|---|---|
| Comensal | Público, sin login | Navegar el menú y consultar detalles. |
| Admin del restaurante | Login autenticado | Gestionar menú, cartas, horarios y branding del local. |
| Super-admin | Login autenticado | Administrar tenants y la plataforma global. |
| Mozo | Futuro | Operar mesas y pedidos. |
| Cocina | Futuro | Operar el KDS. |

## 6. Modelo conceptual

Las entidades principales implementadas son:

- `restaurants`: tenant, slug, branding (colores, logo, portada, tipografía), idiomas y configuración.
- `users` / `profiles`: usuarios autenticados, roles y vinculación estricta a un `restaurant_id`.
- `menus`: cartas o menús independientes del restaurante (ej. Carta Principal, Menú Ejecutivo).
- `menu_categories`: categorías de platos y orden dentro del menú.
- `menu_category_translations`: traducciones de categorías por idioma.
- `menu_items`: platos, precios, orden, disponibilidad, estado activo, imagen principal (`image_path`) y array de múltiples imágenes (`image_paths text[]`, hasta 6 imágenes con carrusel interactivo y badges de conteo).
- `menu_item_translations`: traducciones de nombres y descripciones por idioma.
- `dayparts`: franjas horarias configurables por tenant.
- `category_dayparts`: relación entre categorías y franjas horarias.
- `restaurant_settings`: comportamiento de productos agotados, preferencias y redes de contacto.

Entidades planificadas para etapas siguientes:

- `modifiers` y `modifier_groups`.
- `tables` y `table_sessions`.
- `orders` y `order_items`.
- `reservations`.
- `promotions` y `discount_rules`.
- `stock_items` y `stock_batches`.
- `payments` e `invoices`.
- `subscriptions` y `tenant_plans`.

Toda entidad dependiente de un restaurante debe aislarse mediante `restaurant_id` con políticas RLS de Supabase.

## 7. Reglas de configuración multi-tenant

Las siguientes propiedades son configurables por restaurante:

- Nombre y slug.
- Logo y branding.
- Colores y tipografías.
- Idiomas habilitados.
- Zona horaria.
- Carta única o múltiples cartas.
- Franjas horarias.
- Comportamiento de productos agotados.
- Categorías y orden del menú.
- Productos, precios, fotos y traducciones.

No duplicar la aplicación por restaurante.

## 8. Criterios de aceptación de la primera versión

- Un usuario puede abrir el menú de Demo desde una URL.
- El menú muestra categorías y platos reales de los datos semilla.
- El idioma puede cambiar entre español e inglés sin perder el contexto de navegación.
- El restaurante puede usar una carta única o cartas por horario.
- El cambio de franja horaria se calcula según la configuración del restaurante.
- Un administrador puede editar un plato sin redeploy.
- Un administrador puede activar o desactivar un plato.
- El comportamiento de un producto agotado puede configurarse.
- Un segundo tenant de prueba no puede ver datos de Demo.
- El branding se carga mediante configuración, no mediante código específico.
- La aplicación funciona en pantallas móviles.
- La interfaz respeta navegación por teclado, foco visible y `prefers-reduced-motion`.

## 9. Requisitos técnicos transversales

- TypeScript estricto.
- Componentes pequeños y reutilizables.
- Tokens visuales centralizados.
- Animaciones principalmente con `transform` y `opacity`.
- Imágenes optimizadas y cargadas progresivamente.
- Secretos en variables de entorno.
- Nunca exponer claves de servicio al cliente.
- RLS y permisos mínimos.
- Pruebas para flujos críticos.
- Commits pequeños y descriptivos.
- No ejecutar migraciones destructivas sin confirmación.

## 10. Decisiones pendientes

- Dominio o subdominio para la demo.
- Proveedor definitivo de hosting, manteniendo Netlify como opción inicial.
- Modelo final de autenticación y administración de usuarios.
- Menú actualizado y fotos de MUUD.
- Traducciones definitivas.
- Definición visual final del tema MUUD.
- Esquema SQL validado antes de usar datos reales.
