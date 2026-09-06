# Decisiones de UX — menú público

## Navegación horizontal entre categorías

**Fecha:** 2026-08-26 (Actualizado: 2026-09-06)  
**Alcance:** Menú público, vista mobile-first y escritorio.

### Necesidad

La carta tiene muchas categorías. La barra de categorías debe poder desplazarse horizontalmente para descubrirlas libremente. La activación de una categoría debe ser deliberada mediante acción del usuario (clic, tap o teclado), conservando un resultado inmediato y evitando cambios involuntarios de sección al desplazarse por la barra.

### Problema detectado

1. En una primera iteración se probaron dos contenedores sincronizados (categorías y carrusel de platos). Generaba ciclos de eventos y saltos forzados.
2. Posteriormente se implementó un mecanismo de auto-activación por desplazamiento: al dejar de scrollear la barra de categorías (tras 120 ms de debounce), se seleccionaba automáticamente la categoría que quedaba centrada. Esto generaba fricción al navegar: los usuarios que sólo querían deslizar la barra para explorar qué otras categorías existían (ej. buscando postres o bebidas) sufrían el cambio automático e indeseado del listado de platos sin haber hecho clic en ninguna opción.

### Decisión

Usar el patrón de tabs con desplazamiento libre y activación deliberada:

- La barra horizontal contiene tabs nativas (`role="tablist"` y `role="tab"`).
- El contenido muestra solamente el panel de la tab activa (`role="tabpanel"`).
- El desplazamiento horizontal en la barra de tabs es completamente libre e independiente; no dispara cambios de categoría automáticos.
- La activación de una categoría es una acción deliberada: ocurre únicamente al hacer clic o tap sobre la tab deseada (o mediante foco por teclado).
- Un clic activa la tab de inmediato y actualiza su panel, sin desplazar programáticamente otros contenedores.
- Se eliminan timers y listeners de `scroll` en la barra de navegación, simplificando la lógica y mejorando el rendimiento en dispositivos móviles.

### Comportamiento esperado

1. Deslizar la barra horizontalmente permite descubrir y explorar las categorías libremente sin alterar la categoría actualmente seleccionada ni el listado de platos visible.
2. Al tocar o hacer clic en una tab visible, se activa y cambia su listado de platos de inmediato.
3. Si un filtro deja una categoría sin platos, el panel informa que no hay platos disponibles en vez de desaparecer.

### Accesibilidad y rendimiento

- Se conservan los controles nativos `button`, óptimos para teclado y lectores de pantalla.
- `aria-selected`, `aria-controls` y `aria-labelledby` relacionan cada tab con su panel.
- La barra usa `scroll-snap`, `touch-action: pan-x` y `overscroll-behavior-x: contain` para un gesto horizontal claro y fluido.
- No se usan listeners de `scroll`, `touchstart`/`touchend` ni animaciones cruzadas entre elementos.

### Verificación realizada

- TypeScript: `tsc --noEmit`.
- Linter: `eslint .`.
- Menú público: al deslizar horizontalmente la barra de categorías, la categoría activa se mantiene fija hasta que el usuario hace clic o tap explícito en otra categoría.

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

