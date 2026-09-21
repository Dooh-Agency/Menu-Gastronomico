# Decisiones de UX — menú público

## Navegación entre categorías: feed continuo con scroll suave y Scrollspy

**Fecha:** 2026-08-26 (Actualizado: 2026-09-06)  
**Alcance:** Menú público, vista mobile-first y escritorio.

### Necesidad

La carta tiene muchas categorías. Para ofrecer una experiencia gastronómica fluida y moderna:
- Las categorías **no deben filtrar ni ocultar el resto de la carta**: el comensal debe poder recorrer toda la oferta en un flujo continuo vertical.
- La barra de categorías superior debe funcionar como un índice de acceso rápido: al pulsar una categoría, la página se desplaza suavemente (*smooth scroll*) hasta dicha sección.
- El desplazamiento horizontal en la barra de categorías debe ser libre para descubrir opciones sin provocar saltos indeseados ni cambios automáticos.
- El estado activo de la barra debe sincronizarse con el scroll vertical de la página (*Scrollspy*), informando en qué sección se encuentra el comensal en cada momento.

### Problemas previos detectados

1. **Sincronización bidireccional forzada:** Se probaron contenedores horizontales sincronizados (categorías y carrusel de platos). Generaba conflictos de eventos y tirones al arrastrar.
2. **Auto-activación por desplazamiento en la barra:** Al dejar de scrollear la barra horizontalmente, se activaba la categoría centrada por debounce, provocando cambios involuntarios de sección cuando el usuario sólo quería explorar las tabs.
3. **Filtrado excluyente de categorías:** Anteriormente, seleccionar una categoría ocultaba todas las demás (patrón tabpanel). Esto obligaba al usuario a alternar constantemente entre "Todos" y categorías individuales, interrumpiendo la lectura continuada de la carta.

### Decisión de UX e Implementación

Adoptar el patrón de **feed continuo con navegación por anclas y Scrollspy**:

- **Contenido continuo:** Todas las categorías y sus platos se renderizan de forma vertical en `#menu-content`. No se ocultan categorías al interactuar con la barra.
- **Navegación por scroll suave:** Al pulsar un botón de categoría en la barra:
  - Se desplaza la ventana hacia el contenedor correspondiente (`#category-${id}`) mediante `scrollIntoView({ behavior: 'smooth', block: 'start' })`.
  - Si el usuario tiene activo `prefers-reduced-motion: reduce`, el desplazamiento se realiza de manera instantánea (`behavior: 'instant'`).
  - La opción *"Todos"* desplaza al comensal a la cabecera del menú (`#menu-content` o tope de página).
- **Compensación de barra fija (`scroll-margin-top`):** Cada sección `.menu-section` posee `scroll-margin-top: 4.75rem`, garantizando que el título de la categoría quede perfectamente visible debajo de la barra sticky sin quedar tapado.
- **Scrollspy vertical no bloqueante:** Un listener optimizado detecta qué sección está actualmente bajo la barra de navegación:
  - Si el usuario está al tope de la carta (por encima de las secciones), se activa la opción *"Todos"*.
  - A medida que se desplaza hacia abajo, se destaca la categoría en foco visual.
  - Al pulsar una categoría, se bloquea temporalmente la sobreescritura del Scrollspy durante la animación (800 ms) para evitar parpadeos intermedios.
- **Auto-centrado suave en la barra horizontal:** Cuando la categoría activa cambia (por scroll vertical o clic), la barra horizontal desliza suavemente (`scrollTo`) para asegurar que la tab activa permanezca visible dentro del viewport, sin disparar eventos extra.

### Accesibilidad y rendimiento

- Controles accesibles `button` nativos con soporte de teclado y foco visible.
- Atributos `aria-selected` y `aria-controls` para navegación asistida clara.
- Respeto estricto de `prefers-reduced-motion` para usuarios con sensibilidad al movimiento.
- Rendimiento optimizado: no se usan librerías pesadas externas, recurriendo a APIs nativas del navegador (`getBoundingClientRect`, `scrollIntoView`, `scrollTo`).

### Verificación realizada

- TypeScript: `tsc --noEmit`.
- Linter: `eslint .`.
- Menú público: al hacer clic en cualquier categoría, la página scrollea suavemente hasta su sección, manteniendo todas las categorías visibles en el documento.

---

## Formatos de presentación de tarjetas por categoría

**Fecha:** 2026-09-05  
**Alcance:** Menú público y panel de administración.

### Necesidad

No todas las categorías comunican de la misma forma:
- Un *"Plato del día"* o un corte especial requiere máxima jerarquía visual con fotos grandes y protagonismo inmediato.
- Secciones complementarias o breves (postres, entradas, cafetería) se benefician de una navegación horizontal ágil y compacta que no consuma demasiado scroll vertical.
- Las categorías centrales de la carta necesitan una lista clara y densa para comparar precios y descripciones cómodamente.

### Decisión de UX

Permitir que el administrador configure el formato de tarjeta de cada categoría entre tres alternativas estandarizadas:

1. **Rectángulo clásico (`rectangle`):**
   - Formato en lista vertical con foto pequeña a la derecha (110px).
   - Optimizado para escaneo rápido de ingredientes y precios en cartas extensas.
2. **Cuadrado grande / Hero (`hero`):**
   - Tarjeta destacada a ancho completo (o 2 columnas en pantallas amplias) con foto en alta resolución (16:11), precio de alto contraste y descripción completa.
   - Diseñado para platos estrella, plato del día y recomendaciones del chef.
3. **Scroll horizontal / Carrusel (`carousel`):**
   - Fila de desplazamiento horizontal con tarjetas cuadradas compactas (aspecto 1:1, ancho fijo de ~180–210px).
   - Utiliza `scroll-snap-type: x mandatory`, `touch-action: pan-x pan-y` y scrollbar oculta para una experiencia fluida en móviles.

### Experiencia en Administración (Wizard en 2 Pasos)

Para evitar sobrecargar los formularios y facilitar la comprensión visual de los formatos:
- El modal de creación/edición de categorías se divide en:
  - **Paso 1: Información básica:** Nombre, descripción, cartas donde se muestra y traducciones.
  - **Paso 2: Formato visual:** Selector interactivo con mini-mockups gráficos (`CardLayoutSelector`) que muestran el comportamiento y estética de cada opción antes de guardar.

---

## Header flotante unificado y Selector de Cartas (Landing View)

**Fecha:** 2026-09-14  
**Alcance:** Menú público, selector de cartas y vista de carta activa.

### Necesidad

Para ofrecer una navegación coherente y fluida sin discontinuidades de interfaz entre la pantalla de selección de cartas y el contenido de cada menú:
- El header cápsula flotante (`menu-hero-pill-nav`) debe **reutilizarse con la misma estructura y estética glassmorphism** en ambas pantallas.
- El nombre del restaurante debe ser nítido y libre de marcas o puntos ornamentales redundantes (`Muud`).
- En la vista del **Selector de Cartas (Landing)**, la zona izquierda del header exhibe la foto de perfil o logo del local, comunicando marca e identidad desde el primer impacto.
- Al **entrar a una carta específica**, la foto de perfil se oculta para dar paso al botón circular con la flechita de volver atrás (`<`), facilitando el retorno sin recargar ni perder la sesión.
- El selector de idiomas (`ES`, `EN`, etc.) se posiciona fijamente en el extremo derecho del header cápsula en ambas vistas.

### Portadas de Cartas y Pestañas Fijas de Horario

1. **Portadas de Tarjetas Limpias (`public-menu-card-v2`):**
   - Se eliminaron las cajas de texto, títulos superpuestos y marcas de agua sobre las fotos de portada de las tarjetas, dejando ver la fotografía gastronómica completa.
   - Omitidos los badges de texto no funcionales (como *"FAVORITO"*), conservando únicamente los indicadores de estado de servicio (`● Servicio Actual` o `Desde 19:30 hs`).
2. **Pestañas Fijas de Estado (50% / 50%):**
   - La barra de pestañas del selector (`public-menus-tabs-bar`) se fijó a una distribución exacta del 50% de ancho para cada opción (`● Disponibles ahora [N]` y `⏰ Más tarde [N]`), eliminando barras de scroll horizontal innecesarias.


