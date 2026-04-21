# Implementation Plan: Advanced Search

## Overview

Implementación client-side del sistema de búsqueda avanzada para StepStyle. Todo el código JS se agrega como funciones nuevas al final de `js/main.js` y los estilos al final de `css/styles.css`. Se crea `buscar.html` con el mismo Header/Footer que las demás páginas.

## Tasks

- [-] 1. Extender PRODUCTS y agregar utilidades base
  - [ ] 1.1 Añadir campos `brand` y `colors` a cada objeto del array `PRODUCTS` en `js/main.js` según el mapa definido en el design (prod-001→Nike, prod-002→Adidas, etc.)
    - _Requirements: 3.4, 3.5_
  - [ ] 1.2 Agregar la función `debounce(fn, ms)` al final de `js/main.js`
    - _Requirements: 1.2, 7.2_
  - [ ]* 1.3 Escribir property test para `debounce` (Property 1)
    - **Property 1: Debounce fires once**
    - **Validates: Requirements 1.2, 7.2**

- [ ] 2. Implementar `initSearchBar()` — barra de búsqueda con autocompletado en el Header
  - [ ] 2.1 Crear la función `initSearchBar()` en `js/main.js` que inyecte el DOM de la barra de búsqueda (`.search-bar` con `input[type=search]` y `#search-autocomplete`) dentro de `.header__actions` antes del botón del carrito
    - _Requirements: 1.1_
  - [ ] 2.2 Implementar `getSuggestions(query)` dentro de `initSearchBar()`: filtra `PRODUCTS` por `name` o `category` (case-insensitive), retorna máximo 5 resultados
    - _Requirements: 1.3_
  - [ ]* 2.3 Escribir property test para `getSuggestions` (Property 2)
    - **Property 2: Suggestions match query and are bounded**
    - **Validates: Requirements 1.3**
  - [ ] 2.4 Implementar el renderizado del dropdown con debounce de 300ms, cierre al hacer click fuera o al borrar el input, y mensaje "Sin resultados para '{término}'" cuando no hay sugerencias
    - _Requirements: 1.2, 1.6, 1.7, 1.8_
  - [ ] 2.5 Implementar navegación por teclado (ArrowUp/ArrowDown/Enter) con `aria-activedescendant`, y redirección a `buscar.html?q={término}` al presionar Enter o seleccionar sugerencia
    - _Requirements: 1.4, 1.5, 1.9_
  - [ ]* 2.6 Escribir property test para navegación por teclado (Property 3)
    - **Property 3: Keyboard navigation moves focus sequentially**
    - **Validates: Requirements 1.9**
  - [ ] 2.7 Agregar los estilos de `.search-bar`, `.search-bar__input` y `.search-autocomplete` al final de `css/styles.css`
    - _Requirements: 8.3, 8.5_
  - [ ] 2.8 Invocar `initSearchBar()` desde el bloque `DOMContentLoaded` existente en `js/main.js`
    - _Requirements: 8.4_

- [ ] 3. Checkpoint — Verificar barra de búsqueda
  - Asegurarse de que el dropdown aparece en todas las páginas, la navegación por teclado funciona y la redirección a `buscar.html` es correcta. Preguntar al usuario si hay dudas.

- [ ] 4. Crear `buscar.html` con estructura base
  - [ ] 4.1 Crear el archivo `buscar.html` con el mismo Header y Footer que `index.html`, incluyendo la clase `.search-page` en `<main>`, la estructura `.search-page__header`, `.search-page__layout` (con `.filter-sidebar` y `.search-results`), y el elemento `#scroll-sentinel`
    - _Requirements: 2.1, 2.3_
  - [ ] 4.2 Agregar los estilos de layout de `buscar.html` al final de `css/styles.css`: `.search-page__header`, `.search-page__layout` (dos columnas ≥768px), `.filter-sidebar` (panel deslizable en móvil con botón "Filtros"), `.search-results`, `.results-grid`
    - _Requirements: 2.3, 2.4, 8.3, 8.5_

- [ ] 5. Implementar `parseURLState()` y `pushURLState()`
  - [ ] 5.1 Implementar `parseURLState()` dentro de `initSearchPage()`: lee `URLSearchParams` y retorna el objeto `filters` con los campos `q`, `cat`, `minPrice`, `maxPrice`, `sizes`, `colors`, `brands`, `sort`; con fallbacks para valores inválidos e intercambio automático si `minPrice > maxPrice`
    - _Requirements: 5.2, 5.3_
  - [ ] 5.2 Implementar `pushURLState(filters)`: serializa el objeto `filters` a `URLSearchParams` usando `history.pushState`, con `encodeURIComponent` para valores especiales
    - _Requirements: 5.1, 5.2_
  - [ ]* 5.3 Escribir property test para el round-trip URL (Property 11)
    - **Property 11: URL state round-trip**
    - **Validates: Requirements 5.1, 5.2, 5.3**

- [ ] 6. Implementar `applyFilters(filters)` y `renderResults(products, page)`
  - [ ] 6.1 Implementar `applyFilters(filters)`: filtra `PRODUCTS` por `q` (name/category, case-insensitive), `cat`, rango de precio, `sizes`, `colors`, `brands`; luego ordena según `sort` (`price-asc`, `price-desc`, `popularity`, `newest`, `relevance`)
    - _Requirements: 2.5, 3.6, 4.1, 4.2, 7.1, 7.3, 7.4_
  - [ ]* 6.2 Escribir property test para filtrado (Property 5)
    - **Property 5: All displayed products satisfy active filters**
    - **Validates: Requirements 2.5, 7.1, 7.3**
  - [ ]* 6.3 Escribir property test para ordenamiento (Property 10)
    - **Property 10: Sort order is correct for each option**
    - **Validates: Requirements 4.1, 4.2**
  - [ ]* 6.4 Escribir property test para filtro de texto case-insensitive (Property 14)
    - **Property 14: Text filter matches name and category case-insensitively**
    - **Validates: Requirements 7.3, 7.4**
  - [ ] 6.5 Implementar `renderResults(products, page)`: renderiza el slice de `PAGE_SIZE` (12) cards en `.results-grid` usando `productCardHTML`, con `loading="lazy"` en todas las imágenes; muestra "No encontramos productos con estos filtros" + botón limpiar si no hay resultados; muestra "Has visto todos los resultados" al agotar la lista
    - _Requirements: 2.5, 2.6, 6.1, 6.2, 6.4_
  - [ ]* 6.6 Escribir property test para `loading="lazy"` (Property 12)
    - **Property 12: All rendered images have loading="lazy"**
    - **Validates: Requirements 6.1**

- [ ] 7. Checkpoint — Verificar filtrado y renderizado
  - Asegurarse de que `applyFilters` retorna los productos correctos para distintas combinaciones de filtros y que `renderResults` muestra máximo 12 cards. Preguntar al usuario si hay dudas.

- [ ] 8. Implementar `buildFilterSidebar()` y `syncSidebarUI(filters)`
  - [ ] 8.1 Implementar `buildFilterSidebar()`: genera el HTML del sidebar con checkboxes de categoría (deportivos, casuales, formales, botas), slider de doble extremo para precio (min/max calculados desde `PRODUCTS`), cuadrícula de botones de talla (35-44), círculos de color (derivados de `product.colors`), checkboxes de marca (derivados de `product.brand`), y botón "Limpiar filtros" con contador de filtros activos
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.7, 3.8_
  - [ ]* 8.2 Escribir property test para bounds del slider de precio (Property 6)
    - **Property 6: Price slider bounds equal PRODUCTS min/max**
    - **Validates: Requirements 3.2**
  - [ ]* 8.3 Escribir property test para opciones de filtro derivadas de PRODUCTS (Property 7)
    - **Property 7: Filter options reflect PRODUCTS data**
    - **Validates: Requirements 3.4, 3.5**
  - [ ] 8.4 Implementar `syncSidebarUI(filters)`: refleja el estado del objeto `filters` en los controles del sidebar (checkboxes marcados, slider posicionado, botones de talla/color/marca activos)
    - _Requirements: 5.3_
  - [ ] 8.5 Implementar el event listener del botón "Limpiar filtros": resetea `cat`, `sizes`, `colors`, `brands` a arrays vacíos, `minPrice`/`maxPrice` a los valores globales, `sort` a `'relevance'`, preserva `q`; actualiza URL y re-renderiza
    - _Requirements: 3.7, 5.4_
  - [ ]* 8.6 Escribir property test para "Limpiar filtros" (Property 8)
    - **Property 8: Clear filters resets to initial state**
    - **Validates: Requirements 3.7, 5.4**
  - [ ]* 8.7 Escribir property test para contador de filtros activos (Property 9)
    - **Property 9: Active filter count is accurate**
    - **Validates: Requirements 3.8**
  - [ ] 8.8 Agregar los estilos del sidebar al final de `css/styles.css`: `.filter-sidebar`, checkboxes, `.range-slider` con `.range-track__fill`, botones de talla, círculos de color, contador de filtros activos
    - _Requirements: 8.3, 8.5_

- [ ] 9. Implementar control de ordenamiento y actualización reactiva
  - [ ] 9.1 Agregar el control `<select>` de ordenamiento en `.search-results` con las opciones: Relevancia, Precio: menor a mayor, Precio: mayor a menor, Popularidad, Novedades; conectar su evento `change` a `applyFilters` + `renderResults` + `pushURLState`
    - _Requirements: 4.1, 4.2, 4.3_
  - [ ] 9.2 Conectar todos los controles del sidebar (checkboxes, sliders, botones) a `updateFilter()` → `applyFilters()` → `renderResults()` → `pushURLState()`, asegurando que la actualización ocurra en menos de 100ms
    - _Requirements: 3.6, 5.1_
  - [ ] 9.3 Actualizar el título de la sección `.search-page__header` con el término buscado y el número de resultados tras cada `applyFilters()`
    - _Requirements: 2.2_
  - [ ]* 9.4 Escribir property test para el título de la página (Property 4)
    - **Property 4: Search page title reflects query and result count**
    - **Validates: Requirements 2.2**

- [ ] 10. Implementar infinite scroll con IntersectionObserver
  - [ ] 10.1 Implementar `initInfiniteScroll(getMore)`: crea un `IntersectionObserver` sobre `#scroll-sentinel`; al dispararse, llama `getMore()` para cargar los siguientes 12 productos; se desconecta cuando no quedan más; incluye guard `if ('IntersectionObserver' in window)` con fallback de renderizado completo
    - _Requirements: 6.2, 6.3, 6.4_
  - [ ]* 10.2 Escribir property test para infinite scroll (Property 13)
    - **Property 13: Infinite scroll loads the next page**
    - **Validates: Requirements 6.2, 6.3**

- [ ] 11. Implementar `initSearchPage()` y conectar todo
  - [ ] 11.1 Implementar `initSearchPage()` como punto de entrada para `buscar.html`: verifica que `.search-page` existe en el DOM, llama `parseURLState()`, `buildFilterSidebar()`, `syncSidebarUI()`, `applyFilters()`, `renderResults(page=1)` e `initInfiniteScroll()`
    - _Requirements: 2.1, 5.3_
  - [ ] 11.2 Invocar `initSearchPage()` desde el bloque `DOMContentLoaded` existente en `js/main.js`
    - _Requirements: 8.4_
  - [ ] 11.3 Agregar el listener de `input` en la Search_Bar del Header cuando la página activa es `buscar.html`: aplica debounce de 300ms, actualiza `filters.q`, llama `applyFilters()` + `renderResults()` + `pushURLState()`
    - _Requirements: 7.1, 7.2_

- [ ] 12. Checkpoint final — Verificar integración completa
  - Asegurarse de que todos los tests pasan, que `buscar.html` carga correctamente con parámetros de URL, que los filtros persisten al compartir la URL, y que el infinite scroll funciona. Preguntar al usuario si hay dudas.

## Notes

- Las tareas marcadas con `*` son opcionales y pueden omitirse para un MVP más rápido
- Cada tarea referencia requisitos específicos para trazabilidad
- Los property tests usan fast-check con mínimo 100 iteraciones (`numRuns: 100`)
- Todo el código nuevo va al final de `js/main.js` y `css/styles.css` sin modificar el código existente
- Los estilos nuevos deben usar las variables CSS existentes `--color-primary`, `--color-secondary` y `--color-accent`
