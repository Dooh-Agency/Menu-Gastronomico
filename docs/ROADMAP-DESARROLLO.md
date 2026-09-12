# Hoja de ruta de desarrollo

## 1. Propósito

Este documento organiza el desarrollo de la plataforma de gestión gastronómica desde la base técnica hasta el producto SaaS completo.

El objetivo inmediato no es construir toda la plataforma, sino desarrollar una demo interna funcional con datos semilla basados en MUUD. Después de validarla dentro de la agencia, se utilizará MUUD como primer cliente piloto para observar el uso real y realizar ajustes.

## 2. Principios del proyecto

- Construir por etapas pequeñas y demostrables.
- Mantener el alcance de cada etapa controlado.
- Diseñar como SaaS multi-tenant desde el inicio.
- Demo es el tenant de demostración interno; MUUD será el primer tenant piloto, no una aplicación hecha a medida.
- Las diferencias entre restaurantes deben resolverse mediante configuración, no mediante código especial.
- Priorizar primero el menú y la operación básica.
- Incorporar IA, promociones avanzadas, pagos y automatizaciones después de estabilizar los datos y los flujos principales.
- Mantener la propiedad de repositorio, infraestructura, dominios y datos bajo cuentas de la agencia.
- No exponer secretos ni claves de servicio en el cliente.

## 3. Alcance inicial confirmado

### Demo interna

La primera versión será utilizada dentro de la agencia para probar:

- [x] Menú digital.
- [x] Categorías y platos.
- [x] Precios y descripciones.
- [x] Fotografías.
- [x] Traducciones español/inglés.
- [x] Cartas por franja horaria.
- [x] Disponibilidad de productos.
- [x] Branding de MUUD.
- [x] Panel de administración.
- [x] Funcionamiento multi-tenant.

### Primer piloto

MUUD se ofreció como primer cliente de prueba. La implementación real se realizará después de validar la demo internamente. El piloto deberá servir para observar el comportamiento de comensales, personal y administración, y para priorizar ajustes.

---

## 4. Estado Actual del Desarrollo

| Etapa | Módulo | Estado | Documento de Validación |
| :--- | :--- | :--- | :--- |
| **Etapa 0** | Fundaciones técnicas y Supabase | ✅ **Completada** | `SPEC.md` / `supabase/README.md` |
| **Etapa 1** | Menú público digital | ✅ **Completada** | [`docs/VALIDACION-ETAPA-1.md`](./VALIDACION-ETAPA-1.md) |
| **Etapa 2** | Panel de administración del menú | ✅ **Completada** | [`docs/VALIDACION-ETAPA-2.md`](./VALIDACION-ETAPA-2.md) |
| **Etapa 3** | Branding y configuración por restaurante | ✅ **Completada** | [`docs/VALIDACION-ETAPA-3.md`](./VALIDACION-ETAPA-3.md) |
| **Etapa 4** | Validación interna y estabilización | 🔄 **En Curso** | — |
| **Etapa 5** | Mesas y códigos QR | ⏳ *Planificada* | — |
| **Etapas 6–21** | Pedidos, Comandas/KDS, Reservas, Pagos, IA, etc. | ⏳ *Planificadas* | — |

---

## 5. Roadmap detallado por etapas

### Etapa 0 — Fundaciones técnicas

#### Objetivo

Crear una base segura y extensible para todos los módulos posteriores.

#### Alcance

- [x] Crear repositorio y estructura del proyecto.
- [x] Configurar Next.js, React, TypeScript y Tailwind CSS.
- [x] Definir sistema de diseño y tokens visuales.
- [x] Definir estructura multi-tenant.
- [x] Crear modelo inicial de datos.
- [x] Configurar Supabase.
- [x] Configurar autenticación y roles.
- [x] Configurar almacenamiento de imágenes.
- [x] Configurar variables de entorno.
- [x] Crear políticas Row-Level Security.
- [x] Crear ambientes de desarrollo y producción.
- [x] Crear datos semilla para Demo, basados en material de referencia de MUUD.
- [x] Dejar preparado el despliegue en Netlify.

#### Criterio de salida

El proyecto inicia correctamente, puede conectarse a Supabase, tiene un tenant de demo y cuenta con una estructura de datos protegida.

---

### Etapa 1 — Menú público digital

#### Objetivo

Mostrar un menú atractivo, rápido y navegable usando datos semilla.

#### Alcance

- [x] Acceso por URL y QR simulado.
- [x] Identificación del restaurante por slug/tenant.
- [x] Categorías.
- [x] Platos con nombre, descripción, precio y foto.
- [x] Etiquetas dietéticas y alérgenos.
- [x] Disponibilidad de productos.
- [x] Vista de detalle del plato.
- [x] Navegación por categorías.
- [x] Filtros por etiquetas.
- [x] Español e inglés.
- [x] Selector manual de idioma.
- [x] Detección automática de idioma.
- [x] Carta única o cartas por franja horaria.
- [x] Cambio automático de carta según horario.
- [x] Diseño mobile-first.
- [x] PWA básica.
- [x] Carga optimizada para conexiones lentas.

#### Criterio de salida

Una persona puede abrir la demo interna, navegar el menú de Demo en español o inglés y visualizar la carta correcta según el horario configurado.

---

### Etapa 2 — Panel de administración del menú

#### Objetivo

Permitir administrar el contenido sin modificar código ni volver a desplegar la aplicación.

#### Alcance

- [x] Login de administradores.
- [x] ABM de categorías con personalización de formato de tarjetas (`rectangle`, `hero`, `carousel`) y modal wizard en 2 pasos con preview interactivo.
- [x] ABM de platos.
- [x] Ordenamiento de categorías y platos (incluyendo modal interactivo con Drag & Drop por carta y referencia visual a formatos de UI).
- [x] Edición de precios y descripciones.
- [x] Carga, reemplazo y gestión de múltiples imágenes por plato (hasta 6 fotos con uploader interactivo y carrusel accesible).
- [x] Gestión de traducciones.
- [x] Gestión de etiquetas y alérgenos.
- [x] Activación/desactivación de productos.
- [x] Vista previa del menú público.
- [x] Gestión de cartas y franjas horarias.
- [x] Gestión de usuarios y roles básicos.

#### Configuración de productos agotados

Cada restaurante podrá configurar el comportamiento general de sus productos no disponibles:

- [x] Ocultar el producto.
- [x] Mostrarlo como “agotado”.

Más adelante se podrá agregar una excepción por producto si el negocio lo necesita.

#### Criterio de salida

Un administrador puede modificar el menú de Demo desde el panel y los cambios aparecen en el menú público sin realizar un nuevo despliegue.

---

### Etapa 3 — Branding y configuración por restaurante

#### Objetivo

Convertir el menú en un producto white-label configurable.

#### Alcance

- [x] Logo.
- [x] Colores.
- [x] Tipografías.
- [x] Radios y estilo visual.
- [x] Imagen de portada.
- [x] Idiomas habilitados.
- [x] Franjas horarias y cartas múltiples con categorías reutilizables y formatos visuales de tarjetas personalizados.
- [x] Configuración de productos agotados.
- [x] Datos de contacto.
- [x] Preview del branding.
- [x] Carga de tokens visuales por tenant.

#### Criterio de salida

Un segundo restaurante de prueba puede tener una identidad visual y una configuración distinta sin duplicar el código.

---

### Etapa 4 — Validación interna de la demo

#### Objetivo

Probar el producto dentro de la agencia antes de llevarlo a MUUD.

#### Validaciones

- [ ] Navegación en celulares y escritorio.
- [ ] Cambio de idioma.
- [ ] Cambio de carta por horario.
- [ ] Edición de platos y precios.
- [ ] Carga y visualización de imágenes (incluyendo carrusel interactivo de múltiples fotos y badges de conteo).
- [ ] Productos agotados.
- [ ] Permisos de usuarios.
- [ ] Separación de datos entre tenants.
- [ ] Rendimiento con conexión lenta.
- [ ] Accesibilidad básica.
- [ ] Comportamiento en distintos tamaños de pantalla.

#### Criterio de salida

Existe una lista de ajustes priorizados y no quedan problemas críticos de navegación, seguridad o contenido antes de iniciar el piloto.

---

### Etapa 5 — Mesas y códigos QR

#### Objetivo

Preparar el sistema para identificar el origen físico de los pedidos.

#### Alcance

- [ ] Alta y edición de mesas.
- [ ] Identificador único por mesa.
- [ ] Generación de QR.
- [ ] Descarga o impresión de QR.
- [ ] Asociación de QR con restaurante y mesa.
- [ ] Regeneración de QR.
- [ ] Lectura de la mesa desde la URL.

#### Criterio de salida

Cada mesa puede abrir el menú correcto y el sistema reconoce a qué restaurante y mesa pertenece.

---

### Etapa 6 — Pedido en mesa

#### Objetivo

Permitir que el comensal arme y confirme un pedido.

#### Alcance

- [ ] Carrito.
- [ ] Cantidades.
- [ ] Modificadores y adicionales.
- [ ] Opciones únicas y múltiples.
- [ ] Indicaciones por plato.
- [ ] Nota general del pedido.
- [ ] Asociación automática a la mesa.
- [ ] Confirmación.
- [ ] Número de pedido.
- [ ] Estado del pedido.
- [ ] Prevención de duplicados.
- [ ] Reintentos ante errores breves de conexión.

#### Criterio de salida

Un comensal puede crear un pedido desde una mesa y el restaurante recibe toda la información necesaria para prepararlo.

---

### Etapa 7 — Comandas y KDS de cocina

#### Objetivo

Conectar los pedidos con la cocina en tiempo real.

#### Alcance

- [ ] Pantalla de cocina.
- [ ] Recepción en tiempo real.
- [ ] Mesa, hora, platos, cantidades, modificadores e indicaciones.
- [ ] Estados: recibido, en preparación, listo, entregado y cerrado.
- [ ] Timestamp de ingreso y de plato listo.
- [ ] Sonido y alerta visual.
- [ ] Aviso al mozo o comensal.
- [ ] Reintentos y cola local ante cortes breves.
- [ ] Filtros por estación de trabajo.
- [ ] Vistas según rol.
- [ ] Contador de antigüedad del pedido.

#### Criterio de salida

Una comanda confirmada aparece en cocina sin recargar la pantalla y puede avanzar por sus estados sin perder información.

---

### Etapa 8 — Herramientas de salón

#### Objetivo

Dar soporte al trabajo de mozos y personal de salón.

#### Alcance

- [ ] Vista de mesas.
- [ ] Pedidos abiertos.
- [ ] Pedidos en preparación y listos.
- [ ] Toma manual de pedidos.
- [ ] Edición previa a la confirmación.
- [ ] Llamar al mozo.
- [ ] Pedir la cuenta.
- [ ] Notificaciones internas.
- [ ] Cierre de mesa.
- [ ] Permisos específicos para mozos.

#### Criterio de salida

El personal del salón puede consultar y operar pedidos sin depender exclusivamente del dispositivo del comensal.

---

### Etapa 9 — Validación con MUUD

#### Objetivo

Probar el sistema en condiciones reales y priorizar mejoras.

#### Actividades

- [ ] Acordar condiciones del piloto.
- [ ] Cargar el menú real y validar traducciones.
- [ ] Instalar o distribuir los QRs.
- [ ] Observar el uso de los comensales.
- [ ] Observar el uso del personal.
- [ ] Registrar dudas, errores y puntos de fricción.
- [ ] Medir escaneos, platos vistos, pedidos y tiempos.
- [ ] Separar problemas de producto de pedidos específicos de MUUD.

#### Criterio de salida

Se cuenta con evidencia de uso real y un backlog priorizado para las siguientes etapas.

---

### Etapa 10 — Reservas

#### Objetivo

Administrar reservas desde la plataforma.

#### Alcance

- [ ] Calendario.
- [ ] Fecha, hora y cantidad de personas.
- [ ] Datos del cliente.
- [ ] Mesa asignada.
- [ ] Estados de reserva.
- [ ] Disponibilidad por franja.
- [ ] Capacidad máxima.
- [ ] Horarios bloqueados.
- [ ] Vista de reservas del día.
- [ ] Confirmaciones por email.
- [ ] Integración futura con WhatsApp.
- [ ] Reprogramación y cancelación.

---

### Etapa 11 — Pedido a distancia y take away

#### Objetivo

Crear un canal directo para clientes que no están sentados en el local.

#### Alcance

- [ ] Pedido para retiro.
- [ ] Horario de retiro.
- [ ] Datos de contacto.
- [ ] Pedido sin mesa.
- [ ] Estados de preparación y retiro.
- [ ] Notificaciones.
- [ ] Canal diferenciado de pedido.
- [ ] Posible delivery operado por el restaurante o terceros.

La plataforma no construirá una flota propia ni un marketplace de delivery.

---

### Etapa 12 — Consulta y asistencia con IA

#### Objetivo

Ayudar al comensal a descubrir platos usando información confiable del menú.

#### Alcance inicial

- [ ] Consultas sobre ingredientes y características.
- [ ] Recomendaciones según preferencias.
- [ ] Filtros conversacionales.
- [ ] Consultas sobre alérgenos y etiquetas.
- [ ] Respuestas en español e inglés.
- [ ] Respuestas basadas solamente en la información del restaurante.
- [ ] Advertencia cuando no hay datos suficientes.

#### Evolución

- [ ] Upselling.
- [ ] Sugerencias de combos.
- [ ] Concierge gastronómico.
- [ ] Asistente para el personal.
- [ ] Traducción asistida de platos.

No se incorpora antes de estabilizar el modelo de menú.

---

### Etapa 13 — Promociones dinámicas

#### Objetivo

Destacar productos y generar promociones basadas en reglas del negocio.

#### Condiciones

- [ ] Hora.
- [ ] Día.
- [ ] Fecha.
- [ ] Franja horaria.
- [ ] Stock.
- [ ] Fecha de elaboración.
- [ ] Nivel de disponibilidad.
- [ ] Objetivo comercial.

#### Acciones

- [ ] Descuento porcentual.
- [ ] Precio fijo.
- [ ] Combo.
- [ ] Badge de destacado.
- [ ] Reordenamiento del menú.
- [ ] Activación u ocultamiento de productos.
- [ ] Promociones programadas.
- [ ] Activación manual de emergencia.

---

### Etapa 14 — Stock y control anti-merma

#### Objetivo

Relacionar inventario, producción y promociones.

#### Alcance

- [ ] Stock disponible.
- [ ] Lotes de producción.
- [ ] Fecha de elaboración.
- [ ] Fecha estimada de vencimiento.
- [ ] Consumo por pedido.
- [ ] Alertas de stock bajo.
- [ ] Agotamiento automático.
- [ ] Productos próximos a vencer.
- [ ] Registro de merma.
- [ ] Registro de merma evitada.
- [ ] Sugerencias de salida rápida.

---

### Etapa 15 — Reportes y dashboard

#### Objetivo

Demostrar valor económico y operativo al restaurante.

#### Alcance

- [ ] Platos más vendidos.
- [ ] Platos más vistos.
- [ ] Conversión de vistas a pedidos.
- [ ] Ticket promedio.
- [ ] Ventas por horario y día.
- [ ] Ventas por categoría.
- [ ] Productos agotados.
- [ ] Tiempo promedio de preparación.
- [ ] Rendimiento por estación.
- [ ] Pedidos cancelados.
- [ ] Uso de promociones.
- [ ] Merma generada y evitada.
- [ ] Exportación de datos.

---

### Etapa 16 — Pagos digitales

#### Objetivo

Permitir pagos desde la experiencia digital.

#### Alcance

- [ ] Mercado Pago.
- [ ] Pago en mesa.
- [ ] Pago de take away.
- [ ] Estado del pago.
- [ ] Webhooks.
- [ ] Anulaciones y reembolsos.
- [ ] Propina.
- [ ] División de cuenta.
- [ ] Conciliación.
- [ ] Registro de costos de procesamiento.

La implementación debe revisarse con un contador antes de operar cobros de forma generalizada.

---

### Etapa 17 — Suscripciones y monetización SaaS

#### Objetivo

Permitir vender el sistema a nuevos restaurantes.

#### Alcance

- [ ] Plan Básico.
- [ ] Plan Pro.
- [ ] Plan Full.
- [ ] Funcionalidades por plan.
- [ ] Prueba gratuita.
- [ ] Suscripción mensual.
- [ ] Setup inicial.
- [ ] Branding como servicio adicional.
- [ ] White-label premium.
- [ ] Vencimientos y suspensión.
- [ ] Actualización de precios.

---

### Etapa 18 — Super-admin de la agencia

#### Objetivo

Operar la plataforma y sus clientes desde un panel central.

#### Alcance

- [ ] Alta y baja de restaurantes.
- [ ] Suspensión.
- [ ] Gestión de planes.
- [ ] Gestión de suscripciones.
- [ ] Configuración global.
- [ ] Soporte.
- [ ] Acceso controlado para diagnóstico.
- [ ] Auditoría.
- [ ] Métricas generales.
- [ ] Estado de servicios.

---

### Etapa 19 — Onboarding automatizado

#### Objetivo

Reducir el trabajo manual al incorporar nuevos restaurantes.

#### Alcance

- [ ] Carga de PDF o fotografías de menú.
- [ ] Extracción de categorías, platos y precios.
- [ ] Propuesta de alérgenos.
- [ ] Traducción inicial.
- [ ] Carga en modo borrador.
- [ ] Revisión humana.
- [ ] Publicación posterior a aprobación.

Se recomienda construirlo al pasar de MUUD al segundo o tercer cliente.

---

### Etapa 20 — IA interna y automatización avanzada

#### Posibles módulos

- [ ] Copiloto de promociones.
- [ ] Análisis de stock y vencimientos.
- [ ] Sugerencias de combos.
- [ ] Identificación de productos de bajo rendimiento.
- [ ] Recomendaciones de horarios y ventas.
- [ ] Borradores de respuestas a reseñas.
- [ ] Agente de WhatsApp para reservas.

La automatización del branding debe mantenerse bajo revisión humana, porque el diseño por restaurante es parte del diferencial y del servicio de setup.

---

### Etapa 21 — Cumplimiento, observabilidad y escala

#### Alcance

- [ ] Revisión fiscal y contable.
- [ ] Facturación AFIP, si corresponde.
- [ ] Términos y condiciones.
- [ ] Política de privacidad.
- [ ] Tratamiento de datos personales.
- [ ] Backups.
- [ ] Logs y auditoría.
- [ ] Monitoreo de errores.
- [ ] Alertas de disponibilidad.
- [ ] Pruebas de carga.
- [ ] Auditoría periódica de RLS.
- [ ] Plan de recuperación ante fallos.

---

## 6. Definición de la primera versión usable

La primera versión no incluirá pedidos, reservas, pagos, stock, promociones ni agentes de IA.

Se considerará usable cuando permita:

- [x] Mostrar el menú de Demo.
- [x] Cambiar entre español e inglés.
- [x] Mostrar una carta única o una carta según la franja horaria.
- [x] Gestionar categorías y platos desde el panel.
- [x] Editar precios, descripciones, fotos y traducciones.
- [x] Activar o desactivar productos.
- [x] Configurar si los agotados se ocultan o se muestran.
- [x] Aplicar branding por restaurante.
- [x] Probar un segundo tenant aislado.
- [x] Verificar seguridad, rendimiento y accesibilidad básica.

---

## 7. Criterios transversales para todas las etapas

- [x] TypeScript estricto.
- [x] Componentes pequeños y reutilizables.
- [x] Tokens visuales en lugar de valores hardcodeados.
- [x] Animaciones basadas principalmente en `transform` y `opacity`.
- [x] Respeto por `prefers-reduced-motion`.
- [x] Contraste WCAG AA.
- [x] Navegación por teclado.
- [x] Áreas táctiles de al menos 44 px.
- [x] Imágenes optimizadas.
- [x] RLS por tenant.
- [x] Roles y permisos mínimos.
- [x] Secretos solamente en variables de entorno.
- [x] Pruebas antes de cerrar cada etapa.
- [x] Commits pequeños y descriptivos.
- [x] No realizar migraciones destructivas sin confirmación.

---

## 8. Próximo paso

El siguiente trabajo concreto es avanzar con la Etapa 4 (Validación interna y estabilización) y preparar la Etapa 5 (Mesas y códigos QR):

- [x] Recibir el menú actualizado de MUUD.
- [x] Convertirlo en datos semilla estructurados.
- [x] Definir categorías, platos, horarios, traducciones y etiquetas.
- [x] Confirmar el sistema visual inicial.
- [x] Crear la estructura base del proyecto.
- [x] Implementar el primer menú público navegable.
- [x] Construir el panel administrativo y branding multi-tenant.
- [ ] Ejecutar el plan de validación interna y estabilización (Etapa 4).
- [ ] Preparar el módulo de mesas y códigos QR (Etapa 5).
