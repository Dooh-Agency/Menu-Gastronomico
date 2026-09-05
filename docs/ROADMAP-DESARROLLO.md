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

- Menú digital.
- Categorías y platos.
- Precios y descripciones.
- Fotografías.
- Traducciones español/inglés.
- Cartas por franja horaria.
- Disponibilidad de productos.
- Branding de MUUD.
- Panel de administración.
- Funcionamiento multi-tenant.

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
| **Etapas 6–20** | Pedidos, Comandas/KDS, Reservas, Pagos, IA, etc. | ⏳ *Planificadas* | — |

---

## 5. Roadmap detallado por etapas

### Etapa 0 — Fundaciones técnicas

#### Objetivo

Crear una base segura y extensible para todos los módulos posteriores.

#### Alcance

- Crear repositorio y estructura del proyecto.
- Configurar Next.js, React, TypeScript y Tailwind CSS.
- Definir sistema de diseño y tokens visuales.
- Definir estructura multi-tenant.
- Crear modelo inicial de datos.
- Configurar Supabase.
- Configurar autenticación y roles.
- Configurar almacenamiento de imágenes.
- Configurar variables de entorno.
- Crear políticas Row-Level Security.
- Crear ambientes de desarrollo y producción.
- Crear datos semilla para Demo, basados en material de referencia de MUUD.
- Dejar preparado el despliegue en Netlify.

#### Criterio de salida

El proyecto inicia correctamente, puede conectarse a Supabase, tiene un tenant de demo y cuenta con una estructura de datos protegida.

---

### Etapa 1 — Menú público digital

#### Objetivo

Mostrar un menú atractivo, rápido y navegable usando datos semilla.

#### Alcance

- Acceso por URL y QR simulado.
- Identificación del restaurante por slug/tenant.
- Categorías.
- Platos con nombre, descripción, precio y foto.
- Etiquetas dietéticas y alérgenos.
- Disponibilidad de productos.
- Vista de detalle del plato.
- Navegación por categorías.
- Filtros por etiquetas.
- Español e inglés.
- Selector manual de idioma.
- Detección automática de idioma.
- Carta única o cartas por franja horaria.
- Cambio automático de carta según horario.
- Diseño mobile-first.
- PWA básica.
- Carga optimizada para conexiones lentas.

#### Criterio de salida

Una persona puede abrir la demo interna, navegar el menú de Demo en español o inglés y visualizar la carta correcta según el horario configurado.

---

### Etapa 2 — Panel de administración del menú

#### Objetivo

Permitir administrar el contenido sin modificar código ni volver a desplegar la aplicación.

#### Alcance

- Login de administradores.
- ABM de categorías con personalización de formato de tarjetas (`rectangle`, `hero`, `carousel`) y modal wizard en 2 pasos con preview interactivo.
- ABM de platos.
- Ordenamiento de categorías y platos.
- Edición de precios y descripciones.
- Carga, reemplazo y gestión de múltiples imágenes por plato (hasta 6 fotos con uploader interactivo y carrusel accesible).
- Gestión de traducciones.
- Gestión de etiquetas y alérgenos.
- Activación/desactivación de productos.
- Vista previa del menú público.
- Gestión de cartas y franjas horarias.
- Gestión de usuarios y roles básicos.

#### Configuración de productos agotados

Cada restaurante podrá configurar el comportamiento general de sus productos no disponibles:

- Ocultar el producto.
- Mostrarlo como “agotado”.

Más adelante se podrá agregar una excepción por producto si el negocio lo necesita.

#### Criterio de salida

Un administrador puede modificar el menú de Demo desde el panel y los cambios aparecen en el menú público sin realizar un nuevo despliegue.

---

### Etapa 3 — Branding y configuración por restaurante

#### Objetivo

Convertir el menú en un producto white-label configurable.

#### Alcance

- Logo.
- Colores.
- Tipografías.
- Radios y estilo visual.
- Imagen de portada.
- Idiomas habilitados.
- Franjas horarias y cartas múltiples con categorías reutilizables y formatos visuales de tarjetas personalizados.
- Configuración de productos agotados.
- Datos de contacto.
- Preview del branding.
- Carga de tokens visuales por tenant.

#### Criterio de salida

Un segundo restaurante de prueba puede tener una identidad visual y una configuración distinta sin duplicar el código.

---

### Etapa 4 — Validación interna de la demo

#### Objetivo

Probar el producto dentro de la agencia antes de llevarlo a MUUD.

#### Validaciones

- Navegación en celulares y escritorio.
- Cambio de idioma.
- Cambio de carta por horario.
- Edición de platos y precios.
- Carga y visualización de imágenes (incluyendo carrusel interactivo de múltiples fotos y badges de conteo).
- Productos agotados.
- Permisos de usuarios.
- Separación de datos entre tenants.
- Rendimiento con conexión lenta.
- Accesibilidad básica.
- Comportamiento en distintos tamaños de pantalla.

#### Criterio de salida

Existe una lista de ajustes priorizados y no quedan problemas críticos de navegación, seguridad o contenido antes de iniciar el piloto.

---

### Etapa 5 — Mesas y códigos QR

#### Objetivo

Preparar el sistema para identificar el origen físico de los pedidos.

#### Alcance

- Alta y edición de mesas.
- Identificador único por mesa.
- Generación de QR.
- Descarga o impresión de QR.
- Asociación de QR con restaurante y mesa.
- Regeneración de QR.
- Lectura de la mesa desde la URL.

#### Criterio de salida

Cada mesa puede abrir el menú correcto y el sistema reconoce a qué restaurante y mesa pertenece.

---

### Etapa 6 — Pedido en mesa

#### Objetivo

Permitir que el comensal arme y confirme un pedido.

#### Alcance

- Carrito.
- Cantidades.
- Modificadores y adicionales.
- Opciones únicas y múltiples.
- Indicaciones por plato.
- Nota general del pedido.
- Asociación automática a la mesa.
- Confirmación.
- Número de pedido.
- Estado del pedido.
- Prevención de duplicados.
- Reintentos ante errores breves de conexión.

#### Criterio de salida

Un comensal puede crear un pedido desde una mesa y el restaurante recibe toda la información necesaria para prepararlo.

---

### Etapa 7 — Comandas y KDS de cocina

#### Objetivo

Conectar los pedidos con la cocina en tiempo real.

#### Alcance

- Pantalla de cocina.
- Recepción en tiempo real.
- Mesa, hora, platos, cantidades, modificadores e indicaciones.
- Estados: recibido, en preparación, listo, entregado y cerrado.
- Timestamp de ingreso y de plato listo.
- Sonido y alerta visual.
- Aviso al mozo o comensal.
- Reintentos y cola local ante cortes breves.
- Filtros por estación de trabajo.
- Vistas según rol.
- Contador de antigüedad del pedido.

#### Criterio de salida

Una comanda confirmada aparece en cocina sin recargar la pantalla y puede avanzar por sus estados sin perder información.

---

### Etapa 8 — Herramientas de salón

#### Objetivo

Dar soporte al trabajo de mozos y personal de salón.

#### Alcance

- Vista de mesas.
- Pedidos abiertos.
- Pedidos en preparación y listos.
- Toma manual de pedidos.
- Edición previa a la confirmación.
- Llamar al mozo.
- Pedir la cuenta.
- Notificaciones internas.
- Cierre de mesa.
- Permisos específicos para mozos.

#### Criterio de salida

El personal del salón puede consultar y operar pedidos sin depender exclusivamente del dispositivo del comensal.

---

### Etapa 9 — Validación con MUUD

#### Objetivo

Probar el sistema en condiciones reales y priorizar mejoras.

#### Actividades

- Acordar condiciones del piloto.
- Cargar el menú real y validar traducciones.
- Instalar o distribuir los QRs.
- Observar el uso de los comensales.
- Observar el uso del personal.
- Registrar dudas, errores y puntos de fricción.
- Medir escaneos, platos vistos, pedidos y tiempos.
- Separar problemas de producto de pedidos específicos de MUUD.

#### Criterio de salida

Se cuenta con evidencia de uso real y un backlog priorizado para las siguientes etapas.

---

### Etapa 10 — Reservas

#### Objetivo

Administrar reservas desde la plataforma.

#### Alcance

- Calendario.
- Fecha, hora y cantidad de personas.
- Datos del cliente.
- Mesa asignada.
- Estados de reserva.
- Disponibilidad por franja.
- Capacidad máxima.
- Horarios bloqueados.
- Vista de reservas del día.
- Confirmaciones por email.
- Integración futura con WhatsApp.
- Reprogramación y cancelación.

---

### Etapa 11 — Pedido a distancia y take away

#### Objetivo

Crear un canal directo para clientes que no están sentados en el local.

#### Alcance

- Pedido para retiro.
- Horario de retiro.
- Datos de contacto.
- Pedido sin mesa.
- Estados de preparación y retiro.
- Notificaciones.
- Canal diferenciado de pedido.
- Posible delivery operado por el restaurante o terceros.

La plataforma no construirá una flota propia ni un marketplace de delivery.

---

### Etapa 12 — Consulta y asistencia con IA

#### Objetivo

Ayudar al comensal a descubrir platos usando información confiable del menú.

#### Alcance inicial

- Consultas sobre ingredientes y características.
- Recomendaciones según preferencias.
- Filtros conversacionales.
- Consultas sobre alérgenos y etiquetas.
- Respuestas en español e inglés.
- Respuestas basadas solamente en la información del restaurante.
- Advertencia cuando no hay datos suficientes.

#### Evolución

- Upselling.
- Sugerencias de combos.
- Concierge gastronómico.
- Asistente para el personal.
- Traducción asistida de platos.

No se incorpora antes de estabilizar el modelo de menú.

---

### Etapa 13 — Promociones dinámicas

#### Objetivo

Destacar productos y generar promociones basadas en reglas del negocio.

#### Condiciones

- Hora.
- Día.
- Fecha.
- Franja horaria.
- Stock.
- Fecha de elaboración.
- Nivel de disponibilidad.
- Objetivo comercial.

#### Acciones

- Descuento porcentual.
- Precio fijo.
- Combo.
- Badge de destacado.
- Reordenamiento del menú.
- Activación u ocultamiento de productos.
- Promociones programadas.
- Activación manual de emergencia.

---

### Etapa 14 — Stock y control anti-merma

#### Objetivo

Relacionar inventario, producción y promociones.

#### Alcance

- Stock disponible.
- Lotes de producción.
- Fecha de elaboración.
- Fecha estimada de vencimiento.
- Consumo por pedido.
- Alertas de stock bajo.
- Agotamiento automático.
- Productos próximos a vencer.
- Registro de merma.
- Registro de merma evitada.
- Sugerencias de salida rápida.

---

### Etapa 15 — Reportes y dashboard

#### Objetivo

Demostrar valor económico y operativo al restaurante.

#### Alcance

- Platos más vendidos.
- Platos más vistos.
- Conversión de vistas a pedidos.
- Ticket promedio.
- Ventas por horario y día.
- Ventas por categoría.
- Productos agotados.
- Tiempo promedio de preparación.
- Rendimiento por estación.
- Pedidos cancelados.
- Uso de promociones.
- Merma generada y evitada.
- Exportación de datos.

---

### Etapa 16 — Pagos digitales

#### Objetivo

Permitir pagos desde la experiencia digital.

#### Alcance

- Mercado Pago.
- Pago en mesa.
- Pago de take away.
- Estado del pago.
- Webhooks.
- Anulaciones y reembolsos.
- Propina.
- División de cuenta.
- Conciliación.
- Registro de costos de procesamiento.

La implementación debe revisarse con un contador antes de operar cobros de forma generalizada.

---

### Etapa 17 — Suscripciones y monetización SaaS

#### Objetivo

Permitir vender el sistema a nuevos restaurantes.

#### Alcance

- Plan Básico.
- Plan Pro.
- Plan Full.
- Funcionalidades por plan.
- Prueba gratuita.
- Suscripción mensual.
- Setup inicial.
- Branding como servicio adicional.
- White-label premium.
- Vencimientos y suspensión.
- Actualización de precios.

---

### Etapa 18 — Super-admin de la agencia

#### Objetivo

Operar la plataforma y sus clientes desde un panel central.

#### Alcance

- Alta y baja de restaurantes.
- Suspensión.
- Gestión de planes.
- Gestión de suscripciones.
- Configuración global.
- Soporte.
- Acceso controlado para diagnóstico.
- Auditoría.
- Métricas generales.
- Estado de servicios.

---

### Etapa 19 — Onboarding automatizado

#### Objetivo

Reducir el trabajo manual al incorporar nuevos restaurantes.

#### Alcance

- Carga de PDF o fotografías de menú.
- Extracción de categorías, platos y precios.
- Propuesta de alérgenos.
- Traducción inicial.
- Carga en modo borrador.
- Revisión humana.
- Publicación posterior a aprobación.

Se recomienda construirlo al pasar de MUUD al segundo o tercer cliente.

---

### Etapa 20 — IA interna y automatización avanzada

#### Posibles módulos

- Copiloto de promociones.
- Análisis de stock y vencimientos.
- Sugerencias de combos.
- Identificación de productos de bajo rendimiento.
- Recomendaciones de horarios y ventas.
- Borradores de respuestas a reseñas.
- Agente de WhatsApp para reservas.

La automatización del branding debe mantenerse bajo revisión humana, porque el diseño por restaurante es parte del diferencial y del servicio de setup.

---

### Etapa 21 — Cumplimiento, observabilidad y escala

#### Alcance

- Revisión fiscal y contable.
- Facturación AFIP, si corresponde.
- Términos y condiciones.
- Política de privacidad.
- Tratamiento de datos personales.
- Backups.
- Logs y auditoría.
- Monitoreo de errores.
- Alertas de disponibilidad.
- Pruebas de carga.
- Auditoría periódica de RLS.
- Plan de recuperación ante fallos.

## 5. Orden de implementación recomendado

El orden operativo será:

1. Fundaciones técnicas.
2. Menú público de Demo con datos semilla de referencia.
3. Panel de administración.
4. Branding y configuración por restaurante.
5. Validación interna en la agencia.
6. Mesas y QRs.
7. Pedido en mesa.
8. KDS y comandas.
9. Herramientas de salón.
10. Validación con MUUD.
11. Reservas.
12. Take away.
13. Consulta de menú con IA.
14. Promociones dinámicas.
15. Stock y anti-merma.
16. Reportes.
17. Pagos.
18. Suscripciones.
19. Super-admin.
20. Onboarding automatizado.
21. Escala, cumplimiento y observabilidad avanzada.

## 6. Definición de la primera versión usable

La primera versión no incluirá pedidos, reservas, pagos, stock, promociones ni agentes de IA.

Se considerará usable cuando permita:

- Mostrar el menú de Demo.
- Cambiar entre español e inglés.
- Mostrar una carta única o una carta según la franja horaria.
- Gestionar categorías y platos desde el panel.
- Editar precios, descripciones, fotos y traducciones.
- Activar o desactivar productos.
- Configurar si los agotados se ocultan o se muestran.
- Aplicar branding por restaurante.
- Probar un segundo tenant aislado.
- Verificar seguridad, rendimiento y accesibilidad básica.

## 7. Criterios transversales para todas las etapas

- TypeScript estricto.
- Componentes pequeños y reutilizables.
- Tokens visuales en lugar de valores hardcodeados.
- Animaciones basadas principalmente en `transform` y `opacity`.
- Respeto por `prefers-reduced-motion`.
- Contraste WCAG AA.
- Navegación por teclado.
- Áreas táctiles de al menos 44 px.
- Imágenes optimizadas.
- RLS por tenant.
- Roles y permisos mínimos.
- Secretos solamente en variables de entorno.
- Pruebas antes de cerrar cada etapa.
- Commits pequeños y descriptivos.
- No realizar migraciones destructivas sin confirmación.

## 8. Próximo paso

El siguiente trabajo concreto es preparar la Etapa 0 y la Etapa 1:

1. Recibir el menú actualizado de MUUD.
2. Convertirlo en datos semilla estructurados.
3. Definir categorías, platos, horarios, traducciones y etiquetas.
4. Confirmar el sistema visual inicial.
5. Crear la estructura base del proyecto.
6. Implementar el primer menú público navegable.

No se avanzará al panel administrativo hasta validar primero la experiencia básica del menú público.
