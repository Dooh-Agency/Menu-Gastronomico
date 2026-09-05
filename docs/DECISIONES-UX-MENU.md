# Decisiones de UX — menú público

## Navegación horizontal entre categorías

**Fecha:** 2026-08-26  
**Alcance:** menú público, vista mobile-first y escritorio.

### Necesidad

La carta tiene muchas categorías. La barra de categorías debe poder desplazarse horizontalmente para descubrirlas y, al terminar el gesto, mostrar los platos de la categoría que quedó en foco. El click sobre una categoría debe conservar el mismo resultado inmediato.

### Problema detectado

Se probaron dos contenedores horizontales sincronizados: la barra de categorías y un carrusel con las secciones de platos. Cada `scroll` desplazaba el otro contenedor mediante animaciones. Esto generaba un ciclo de eventos y una navegación irregular: el arrastre podía sentirse forzado, con saltos o cambios antes de terminar el gesto.

El problema no era que las categorías fueran botones; los botones son el control correcto para la activación por click y teclado. El conflicto venía de que ambos contenedores intentaban controlar mutuamente el desplazamiento.

### Decisión

Usar el patrón de tabs como única fuente de navegación:

- La barra horizontal contiene tabs nativas (`role="tablist"` y `role="tab"`).
- El contenido muestra solamente el panel de la tab activa (`role="tabpanel"`).
- El desplazamiento horizontal ocurre únicamente en la barra de tabs.
- Luego de 120 ms sin nuevos eventos de desplazamiento, se identifica la tab más cercana al centro visible de la barra y se activa su panel.
- Un click activa la tab de inmediato, sin desplazar programáticamente otros contenedores.

### Comportamiento esperado

1. Deslizar la barra permite descubrir las categorías.
2. Al finalizar el gesto, cambia el listado por la categoría en foco.
3. Al tocar o hacer click en una tab visible, cambia su listado de inmediato.
4. Si un filtro deja una categoría sin platos, el panel informa que no hay platos disponibles en vez de desaparecer.

### Accesibilidad y rendimiento

- Se conservan los controles nativos `button`, útiles para teclado y lectores de pantalla.
- `aria-selected`, `aria-controls` y `aria-labelledby` relacionan cada tab con su panel.
- La barra usa `scroll-snap`, `touch-action: pan-x` y `overscroll-behavior-x: contain` para un gesto horizontal claro.
- No se usan listeners manuales de `touchstart`/`touchend` ni animaciones cruzadas entre elementos.

### Verificación realizada

- TypeScript: `tsc --noEmit`.
- Linter: `eslint .`.
- Validación en `http://localhost:3001/demo`: al activar `Pastelería y panadería`, queda seleccionada esa tab y se muestra únicamente su panel.

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

