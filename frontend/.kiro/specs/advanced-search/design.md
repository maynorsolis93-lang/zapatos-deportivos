# Design Document — Advanced Search

## Overview

Sistema de búsqueda avanzada client-side para StepStyle. Consta de dos partes principales:

1. **Search Bar en el Header** — campo de texto con autocompletado (dropdown de hasta 5 sugerencias) inyectado vía JS en todas las páginas.
2. **Página de búsqueda `buscar.html`** — layout de dos columnas con `Filter_Sidebar` y `Results_Grid`, filtros combinables, ordenamiento, persistencia de estado en URL y carga incremental con IntersectionObserver.

Todo el procesamiento ocurre en el cliente usando el array `PRODUCTS` de `js/main.js`. No se añaden dependencias externas. El código JS se agrega como funciones nuevas al final de `js/main.js` y los estilos al final de `css/styles.css`.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  js/main.js (append)                                        │
│                                                             │
│  Utilities                                                  │
│  ├── debounce(fn, ms)          — función utilitaria 300ms   │
│  └── getProductBrand(p)        — deriva marca del nombre    │
│                                                             │
│  PRODUCTS (extended)                                        │
│  └── brand + colors añadidos a cada objeto                  │
│                                                             │
│  initSearchBar()               — Header search + dropdown   │
│  initSearchPage()              — buscar.html completo       │
│    ├── parseURLState()         — lee URLSearchParams        │
│    ├── applyFilters()          — filtra + ordena PRODUCTS   │
│    ├── renderResults(page)     — renderiza cards paginadas  │
│    ├── pushURLState()          — history.pushState          │
│    └── initInfiniteScroll()    — IntersectionObserver       │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  buscar.html                                                │
│  ├── Header (mismo que index.html)                          │
│  ├── <main>                                                 │
│  │   ├── .search-page__header  — título + conteo           │
│  │   ├── .search-page__layout                              │
│  │   │   ├── .filter-sidebar   — filtros                   │
│  │   │   └── .search-results   — sort control + grid       │
│  │   └── #scroll-sentinel      — IntersectionObserver      │
│  └── Footer (mismo que index.html)                          │
└─────────────────────────────────────────────────────────────┘
```

**Flujo de datos:**

```
URL params → parseURLState() → activeFilters state
                                      ↓
User interaction → updateFilter() → applyFilters(PRODUCTS)
                                      ↓
                              filteredProducts[]
                                      ↓
                         renderResults(page=1) → DOM
                                      ↓
                         pushURLState() → history
```

---

## Components and Interfaces

### 1. `debounce(fn, ms)`
Función utilitaria. Retorna una versión debounced de `fn` con delay `ms`.

```js
function debounce(fn, ms) {
  let timer;
  return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), ms); };
}
```

### 2. `initSearchBar()`
Inyecta el campo de búsqueda en `.header__actions` antes del botón del carrito.

**DOM generado:**
```html
<div class="search-bar" role="search">
  <input type="search" class="search-bar__input" placeholder="Buscar productos..."
         aria-label="Buscar productos" aria-autocomplete="list"
         aria-controls="search-autocomplete" autocomplete="off">
  <div class="search-autocomplete" id="search-autocomplete" role="listbox" hidden></div>
</div>
```

**Comportamiento:**
- `input` event → debounce 300ms → `getSuggestions(query)` → renderiza dropdown
- `keydown` ArrowUp/ArrowDown → navega sugerencias (aria-activedescendant)
- `keydown` Enter → navega a `buscar.html?q={query}`
- Click en sugerencia → navega a `buscar.html?q={nombre}`
- Click fuera / blur → cierra dropdown
- Input vacío → cierra dropdown

**`getSuggestions(query)`:** filtra `PRODUCTS` donde `name` o `category` incluye `query` (case-insensitive), retorna máximo 5.

### 3. `initSearchPage()`
Punto de entrada para `buscar.html`. Solo se ejecuta si existe `.search-page` en el DOM.

**Sub-funciones:**

| Función | Responsabilidad |
|---|---|
| `parseURLState()` | Lee `URLSearchParams` y retorna objeto `filters` |
| `applyFilters(filters)` | Filtra y ordena `PRODUCTS`, retorna array |
| `renderResults(products, page)` | Renderiza slice de 12 cards en `.results-grid` |
| `pushURLState(filters)` | Serializa `filters` → `history.pushState` |
| `initInfiniteScroll(getMore)` | `IntersectionObserver` sobre `#scroll-sentinel` |
| `buildFilterSidebar()` | Genera HTML del sidebar con valores dinámicos |
| `syncSidebarUI(filters)` | Refleja estado `filters` en controles del sidebar |

### 4. Price Range Slider (doble extremo)
Implementado con dos `<input type="range">` superpuestos. El thumb del mínimo tiene `z-index` mayor cuando está en la mitad superior; el del máximo cuando está en la inferior. Un `<div class="range-track__fill">` se actualiza vía JS con `left` y `width` en porcentaje.

```html
<div class="range-slider">
  <div class="range-track">
    <div class="range-track__fill" id="price-fill"></div>
  </div>
  <input type="range" id="price-min" class="range-input range-input--min">
  <input type="range" id="price-max" class="range-input range-input--max">
</div>
```

### 5. IntersectionObserver (infinite scroll)
Un elemento `<div id="scroll-sentinel">` se coloca al final del `.results-grid`. Cuando entra en el viewport, se carga la siguiente página de 12 resultados. Se desconecta cuando no quedan más productos.

---

## Data Models

### Extensión de PRODUCTS
Los campos `brand` y `colors` no existen en el array actual. Se añaden inline al array `PRODUCTS` existente (o se deriva `brand` del nombre del producto con una función helper). Para el diseño se opta por **añadir los campos directamente** a cada objeto del array, ya que es la solución más limpia y evita lógica de derivación frágil.

```js
// Campos añadidos a cada producto en PRODUCTS:
{
  brand: 'Nike' | 'Adidas' | 'Clarks' | 'Timberland' | ...,  // string
  colors: ['#1a1a2e', '#e94560', ...]                          // array de hex strings
}
```

**Mapa brand/colors por producto:**

| id | brand | colors |
|---|---|---|
| prod-001 | Nike | `['#1a1a2e','#e94560','#ffffff']` |
| prod-002 | Adidas | `['#f5a623','#1a1a2e']` |
| prod-003 | Clarks | `['#8B4513','#1a1a2e']` |
| prod-004 | Timberland | `['#8B4513','#2d5a27']` |
| prod-005 | Nike | `['#e94560','#1a1a2e','#ffffff']` |
| prod-006 | Clarks | `['#f5a623','#8B4513']` |

### Estado de filtros (`filters` object)

```js
const filters = {
  q:        '',          // string — texto de búsqueda
  cat:      [],          // string[] — categorías seleccionadas
  minPrice: 0,           // number
  maxPrice: Infinity,    // number
  sizes:    [],          // number[] — tallas seleccionadas (35-44)
  colors:   [],          // string[] — hex colors seleccionados
  brands:   [],          // string[] — marcas seleccionadas
  sort:     'relevance', // 'relevance'|'price-asc'|'price-desc'|'popularity'|'newest'
};
```

### URL params mapping

| Param | Tipo | Ejemplo |
|---|---|---|
| `q` | string | `q=runner` |
| `cat` | comma-separated | `cat=deportivos,casuales` |
| `minPrice` | number | `minPrice=50` |
| `maxPrice` | number | `maxPrice=150` |
| `sizes` | comma-separated | `sizes=38,39,40` |
| `colors` | comma-separated (encoded) | `colors=%231a1a2e` |
| `brands` | comma-separated | `brands=Nike,Clarks` |
| `sort` | string | `sort=price-asc` |

### Paginación

```js
const PAGE_SIZE = 12;
let currentPage = 1;
let filteredProducts = []; // resultado de applyFilters()
```

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property 1: Debounce fires once

*For any* function `fn` and delay `ms`, calling the debounced version N times in rapid succession (within `ms`) should invoke `fn` exactly once, after the delay has elapsed.

**Validates: Requirements 1.2, 7.2**

---

### Property 2: Suggestions match query and are bounded

*For any* query string of 2 or more characters, every suggestion returned by `getSuggestions(query)` should have its `name` or `category` contain the query (case-insensitive), and the total number of suggestions should be at most 5.

**Validates: Requirements 1.3**

---

### Property 3: Keyboard navigation moves focus sequentially

*For any* autocomplete dropdown with N visible suggestions, pressing ArrowDown from suggestion `i` should move focus to suggestion `i+1` (wrapping at N), and ArrowUp should move focus to `i-1` (wrapping at 0).

**Validates: Requirements 1.9**

---

### Property 4: Search page title reflects query and result count

*For any* query string `q`, after `initSearchPage()` runs with `?q=q` in the URL, the heading element should contain both the query text and the exact count of matching products from `PRODUCTS`.

**Validates: Requirements 2.2**

---

### Property 5: All displayed products satisfy active filters

*For any* combination of active filters (category, price range, sizes, colors, brands, text query), every product card rendered in the Results_Grid should satisfy all active filter criteria simultaneously.

**Validates: Requirements 2.5, 7.1, 7.3**

---

### Property 6: Price slider bounds equal PRODUCTS min/max

*For any* state of the `PRODUCTS` array, the minimum value of the price range slider should equal `Math.min(...PRODUCTS.map(p => p.price))` and the maximum should equal `Math.max(...PRODUCTS.map(p => p.price))`.

**Validates: Requirements 3.2**

---

### Property 7: Filter options reflect PRODUCTS data

*For any* state of the `PRODUCTS` array, the set of color swatches shown in the sidebar should equal the deduplicated union of all `product.colors` arrays, and the set of brand checkboxes should equal the deduplicated set of all `product.brand` values.

**Validates: Requirements 3.4, 3.5**

---

### Property 8: Clear filters resets to initial state

*For any* non-empty filter state, activating the "Limpiar filtros" button should produce a filter object where `cat`, `sizes`, `colors`, and `brands` are empty arrays, `minPrice` equals the global minimum, `maxPrice` equals the global maximum, and `sort` equals `'relevance'` (preserving `q`).

**Validates: Requirements 3.7, 5.4**

---

### Property 9: Active filter count is accurate

*For any* filter state, the count displayed next to "Limpiar filtros" should equal the total number of individually selected filter values (sum of selected categories + selected sizes + selected colors + selected brands + 1 if price range is non-default).

**Validates: Requirements 3.8**

---

### Property 10: Sort order is correct for each option

*For any* list of products and any sort option, the rendered order should satisfy:
- `price-asc`: each product's price ≤ the next product's price
- `price-desc`: each product's price ≥ the next product's price
- `popularity`: each product's `reviewCount` ≥ the next product's `reviewCount`
- `newest`: products with `badge === 'Nuevo'` appear before all others

**Validates: Requirements 4.1, 4.2**

---

### Property 11: URL state round-trip

*For any* filter state object `filters`, serializing it to URL params via `pushURLState(filters)` and then parsing those params back via `parseURLState()` should produce a filter object equivalent to the original `filters`.

**Validates: Requirements 5.1, 5.2, 5.3**

---

### Property 12: All rendered images have loading="lazy"

*For any* set of products rendered in the Results_Grid, every `<img>` element inside a product card should have the attribute `loading="lazy"`.

**Validates: Requirements 6.1**

---

### Property 13: Infinite scroll loads the next page

*For any* filtered product list with more than `PAGE_SIZE` (12) items, after the IntersectionObserver sentinel fires, the number of rendered cards should increase by `min(PAGE_SIZE, remaining)` where `remaining` is the count of products not yet displayed.

**Validates: Requirements 6.2, 6.3**

---

### Property 14: Text filter matches name and category case-insensitively

*For any* query string `q` and any product `p` in `PRODUCTS`, `applyFilters({ q })` should include `p` if and only if `p.name.toLowerCase()` or `p.category.toLowerCase()` contains `q.toLowerCase()`.

**Validates: Requirements 7.3, 7.4**

---

## Error Handling

| Escenario | Comportamiento |
|---|---|
| `PRODUCTS` vacío | `initSearchPage()` muestra "No encontramos productos" sin errores JS |
| URL con parámetros inválidos (e.g. `minPrice=abc`) | `parseURLState()` usa `parseFloat` con fallback al valor por defecto |
| `minPrice > maxPrice` en URL | Se intercambian los valores automáticamente |
| Query con caracteres especiales en URL | `encodeURIComponent` / `decodeURIComponent` en `pushURLState` / `parseURLState` |
| Imagen de producto no disponible | `onerror` ya existente en `productCardHTML` maneja el fallback |
| `IntersectionObserver` no soportado | Guard `if ('IntersectionObserver' in window)` — sin infinite scroll, todos los resultados se renderizan de una vez |
| Click en sugerencia con nombre que contiene caracteres especiales | `encodeURIComponent` al construir la URL de redirección |

---

## Testing Strategy

### Dual Testing Approach

Se usan dos tipos de tests complementarios:

- **Unit tests**: verifican ejemplos concretos, casos borde y condiciones de error.
- **Property tests**: verifican propiedades universales sobre rangos amplios de inputs generados.

### Property-Based Testing

**Librería:** [fast-check](https://github.com/dubzzz/fast-check) (JavaScript, sin dependencias de framework).

Cada property test debe ejecutarse con **mínimo 100 iteraciones** (`numRuns: 100`).

Cada test debe incluir un comentario de trazabilidad:
```js
// Feature: advanced-search, Property N: <property_text>
```

**Mapa de properties a tests:**

| Property | Test | Generadores |
|---|---|---|
| P1 — Debounce fires once | `fc.asyncProperty(fc.integer({min:2,max:20}), ...)` | número de llamadas rápidas |
| P2 — Suggestions match query | `fc.property(fc.string({minLength:2}), ...)` | query strings arbitrarios |
| P3 — Keyboard navigation | `fc.property(fc.integer({min:1,max:10}), fc.integer(), ...)` | N sugerencias, índice inicial |
| P4 — Title reflects query+count | `fc.property(fc.string({minLength:1}), ...)` | query strings |
| P5 — Displayed products satisfy filters | `fc.property(arbitraryFilters(), ...)` | combinaciones de filtros |
| P6 — Price slider bounds | `fc.property(fc.array(arbitraryProduct(), {minLength:1}), ...)` | arrays de productos |
| P7 — Filter options reflect PRODUCTS | `fc.property(fc.array(arbitraryProduct(), {minLength:1}), ...)` | arrays de productos |
| P8 — Clear filters resets state | `fc.property(arbitraryFilters(), ...)` | estados de filtro |
| P9 — Active filter count | `fc.property(arbitraryFilters(), ...)` | estados de filtro |
| P10 — Sort order | `fc.property(fc.array(arbitraryProduct()), fc.constantFrom('price-asc','price-desc','popularity','newest'), ...)` | productos + sort option |
| P11 — URL round-trip | `fc.property(arbitraryFilters(), ...)` | estados de filtro |
| P12 — Images have loading=lazy | `fc.property(fc.array(arbitraryProduct(), {minLength:1}), ...)` | arrays de productos |
| P13 — Infinite scroll loads next page | `fc.property(fc.array(arbitraryProduct(), {minLength:13}), ...)` | listas > PAGE_SIZE |
| P14 — Text filter case-insensitive | `fc.property(fc.string(), fc.array(arbitraryProduct()), ...)` | queries + productos |

### Unit Tests

Los unit tests cubren:
- Presencia de elementos DOM tras `initSearchBar()` (Req 1.1)
- Redirección al seleccionar sugerencia (Req 1.4, 1.5)
- Cierre del dropdown al hacer click fuera (Req 1.7)
- Mensaje "Sin resultados" cuando no hay sugerencias (Req 1.8)
- Existencia y estructura de `buscar.html` (Req 2.1)
- Presencia de checkboxes de categoría en sidebar (Req 3.1)
- Presencia de botones de talla 35-44 (Req 3.3)
- Presencia de opciones de ordenamiento (Req 4.1)
- URL solo contiene `q` tras limpiar filtros (Req 5.4)
- Máximo 12 cards en render inicial (Req 6.2)
- Mensaje "Has visto todos los resultados" al agotar lista (Req 6.4)
- Estado vacío muestra mensaje + botón limpiar (Req 2.6)
