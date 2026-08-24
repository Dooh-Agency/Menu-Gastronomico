# Especificación de producto

## Plataforma de Gestión Gastronómica

### Estado del documento

- Estado: definición inicial.
- Primer objetivo: demo interna con datos semilla de referencia en un tenant llamado Demo.
- Primer piloto previsto: MUUD.
- Alcance actual: Etapa 0 y Etapa 1 del [roadmap](docs/ROADMAP-DESARROLLO.md).

## 1. Visión

La plataforma es un SaaS multi-tenant para restaurantes, cafés y bistrós. Ofrece un menú digital configurable por local y, progresivamente, pedidos, comandas, reservas, promociones, stock y reportes.

El producto debe permitir que varios restaurantes utilicen la misma aplicación, manteniendo sus datos, usuarios, menú y configuración aislados.

Demo será el tenant de demostración interno. MUUD será posteriormente un tenant separado y el primer cliente piloto. No se debe implementar lógica específica de MUUD que no pueda resolverse mediante configuración.

## 2. Objetivo inmediato

Construir una demo interna que permita:

- Mostrar el menú de Demo con datos semilla de referencia.
- Navegar categorías y platos.
- Mostrar nombres, descripciones, precios, fotos y etiquetas.
- Cambiar entre español e inglés.
- Usar una carta única o varias cartas por franja horaria.
- Activar y desactivar productos.
- Aplicar branding por restaurante.
- Administrar el contenido desde un panel.
- Verificar aislamiento entre tenants.

La demo se validará primero dentro de la agencia. Después podrá desplegarse para MUUD como piloto controlado.

## 3. Alcance de la primera versión usable

### Incluido

- Menú público mobile-first.
- URL por restaurante mediante slug o dominio configurado.
- Categorías y platos.
- Precios, descripciones, fotos y etiquetas dietéticas.
- Alérgenos.
- Español e inglés.
- Selector manual de idioma y detección inicial del idioma.
- Carta única o cartas por franja horaria.
- Horarios configurables por restaurante.
- Disponibilidad de productos.
- Configuración de productos agotados: ocultar o mostrar como agotados.
- Panel de administración del menú.
- Branding configurable por tenant.
- Datos semilla del tenant interno Demo.
- Segundo tenant de prueba para validar aislamiento.

### No incluido todavía

- Pedidos.
- Carrito.
- Mesas y QR funcionales.
- Comandas y KDS.
- Reservas.
- Take away.
- Pagos.
- Stock.
- Promociones dinámicas.
- Reportes avanzados.
- Agentes o chatbot de IA.
- Facturación fiscal.

## 4. Roadmap de módulos

El desarrollo completo está documentado en [docs/ROADMAP-DESARROLLO.md](docs/ROADMAP-DESARROLLO.md). El orden resumido es:

1. Fundaciones técnicas.
2. Menú público.
3. Panel de administración.
4. Branding y configuración por restaurante.
5. Validación interna.
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
| Comensal | Público, sin login | Navegar el menú. |
| Admin del restaurante | Login | Gestionar menú y configuración del local. |
| Super-admin | Login | Administrar tenants y la plataforma. |
| Mozo | Futuro | Operar mesas y pedidos. |
| Cocina | Futuro | Operar el KDS. |

## 6. Modelo conceptual inicial

Las entidades principales son:

- `restaurants`: tenant, slug, branding, idiomas y configuración.
- `users`: usuarios, roles y restaurante asociado.
- `menu_categories`: categorías y orden.
- `menu_items`: platos, precios, fotos, disponibilidad y etiquetas.
- `menu_item_translations`: traducciones por idioma.
- `dayparts`: franjas horarias configurables.
- `restaurant_settings`: comportamiento de agotados, idioma y preferencias.

Entidades posteriores:

- `modifiers`.
- `tables`.
- `orders`.
- `order_items`.
- `reservations`.
- `promotions` y `rules`.
- `stock_batches`.
- `payments`.
- `subscriptions`.

Toda entidad dependiente de un restaurante debe poder aislarse mediante `restaurant_id` o una relación segura con el tenant correspondiente.

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
