# Requirements Document

## Introduction

Sistema de búsqueda avanzada para el e-commerce de calzado StepStyle. Permite a los usuarios encontrar productos mediante una barra de búsqueda con autocompletado integrada en el Header, y una página dedicada (`buscar.html`) con filtros combinables por categoría, precio, talla, color y marca. Todo el procesamiento ocurre en el cliente usando el array `PRODUCTS` de `js/main.js`, sin recargas de página. Los filtros activos se persisten en la URL para permitir compartir búsquedas.

## Glossary

- **Search_Bar**: Componente de entrada de texto ubicado en el Header con soporte de autocompletado.
- **Autocomplete_Dropdown**: Lista desplegable que muestra sugerencias de productos mientras el usuario escribe.
- **Search_Page**: Página `buscar.html` que muestra resultados de búsqueda con filtros y ordenamiento.
- **Filter_Sidebar**: Panel lateral de `buscar.html` que contiene todos los controles de filtrado.
- **Results_Grid**: Cuadrícula de Product_Cards que muestra los productos que coinciden con la búsqueda y filtros activos.
- **Active_Filters**: Conjunto de criterios de filtrado actualmente aplicados (categoría, precio, tallas, colores, marcas).
- **Debounce**: Técnica que retrasa la ejecución de una función hasta que el usuario deja de escribir por un intervalo definido.
- **Lazy_Loading**: Técnica que carga imágenes solo cuando entran en el viewport del usuario.
- **URL_State**: Representación de los filtros activos como parámetros en la URL (`window.location.search`).
- **PRODUCTS**: Array de objetos de producto definido en `js/main.js` que actúa como fuente de datos del catálogo.
- **Product_Card**: Componente visual existente que muestra imagen, nombre, precio y botón de acción de un producto.
- **Header**: Sección superior existente con logo, navegación, hamburger y badge del carrito.


---

## Requirements

### Requirement 1: Barra de búsqueda con autocompletado en el Header

**User Story:** As a user, I want a search bar in the header, so that I can quickly find products from any page.

#### Acceptance Criteria

1. THE Header SHALL incluir un campo de texto de búsqueda visible en todas las páginas del Storefront.
2. WHEN el usuario escribe en la Search_Bar, THE Search_Bar SHALL aplicar un Debounce de 300ms antes de procesar la entrada.
3. WHEN el usuario ha escrito al menos 2 caracteres y el Debounce ha transcurrido, THE Autocomplete_Dropdown SHALL mostrarse con hasta 5 sugerencias de productos del array PRODUCTS cuyo nombre o categoría coincida con el texto ingresado (búsqueda insensible a mayúsculas/minúsculas).
4. WHEN el usuario selecciona una sugerencia del Autocomplete_Dropdown, THE Search_Bar SHALL redirigir al usuario a `buscar.html?q={término}`.
5. WHEN el usuario presiona la tecla Enter en la Search_Bar, THE Search_Bar SHALL redirigir al usuario a `buscar.html?q={término}`.
6. WHEN el usuario borra el contenido de la Search_Bar, THE Autocomplete_Dropdown SHALL ocultarse.
7. WHEN el usuario hace clic fuera de la Search_Bar o del Autocomplete_Dropdown, THE Autocomplete_Dropdown SHALL ocultarse.
8. IF la búsqueda no produce sugerencias, THEN THE Autocomplete_Dropdown SHALL mostrar el mensaje "Sin resultados para '{término}'".
9. THE Search_Bar SHALL ser accesible mediante teclado, permitiendo navegar las sugerencias con las teclas ArrowUp y ArrowDown y seleccionar con Enter.


---

### Requirement 2: Página de búsqueda (buscar.html)

**User Story:** As a user, I want a dedicated search results page, so that I can see all matching products and refine my search.

#### Acceptance Criteria

1. THE Search_Page SHALL existir como archivo `buscar.html` con el mismo Header y Footer que las demás páginas del Storefront.
2. WHEN la Search_Page carga con el parámetro `q` en la URL, THE Search_Page SHALL mostrar en el título de la sección el término buscado y el número de resultados encontrados.
3. THE Search_Page SHALL mostrar el Filter_Sidebar y el Results_Grid en un layout de dos columnas en viewports mayores a 768px.
4. WHEN el viewport es menor a 768px, THE Filter_Sidebar SHALL colapsarse y mostrarse como un panel deslizable activado por un botón "Filtros".
5. THE Results_Grid SHALL mostrar los Product_Cards de los productos que coincidan con los Active_Filters aplicados.
6. IF no hay productos que coincidan con los Active_Filters, THEN THE Results_Grid SHALL mostrar el mensaje "No encontramos productos con estos filtros" y un botón para limpiar todos los filtros.

---

### Requirement 3: Filtros en el Filter_Sidebar

**User Story:** As a user, I want to filter search results by multiple criteria, so that I can narrow down products to exactly what I need.

#### Acceptance Criteria

1. THE Filter_Sidebar SHALL incluir un filtro de Categoría con checkboxes para los valores: deportivos, casuales, formales, botas.
2. THE Filter_Sidebar SHALL incluir un filtro de Rango de Precios implementado como un slider de doble extremo con valores mínimo y máximo calculados dinámicamente desde el array PRODUCTS.
3. THE Filter_Sidebar SHALL incluir un filtro de Tallas implementado como una cuadrícula de botones para los valores del 35 al 44.
4. THE Filter_Sidebar SHALL incluir un filtro de Colores implementado como círculos de color seleccionables, con los colores disponibles derivados del campo `colors` de los productos en PRODUCTS.
5. THE Filter_Sidebar SHALL incluir un filtro de Marcas implementado como checkboxes, con las marcas derivadas del campo `brand` de los productos en PRODUCTS.
6. WHEN el usuario activa o desactiva cualquier control del Filter_Sidebar, THE Results_Grid SHALL actualizarse en menos de 100ms sin recargar la página.
7. THE Filter_Sidebar SHALL mostrar un botón "Limpiar filtros" que, al ser activado, restablezca todos los Active_Filters a su estado inicial.
8. WHEN hay Active_Filters aplicados, THE Filter_Sidebar SHALL mostrar el número de filtros activos junto al botón "Limpiar filtros".


---

### Requirement 4: Ordenamiento de resultados

**User Story:** As a user, I want to sort search results, so that I can find the most relevant products faster.

#### Acceptance Criteria

1. THE Search_Page SHALL mostrar un control de ordenamiento con las opciones: "Relevancia", "Precio: menor a mayor", "Precio: mayor a menor", "Popularidad" (por `reviewCount` descendente), "Novedades" (por `badge === 'Nuevo'` primero).
2. WHEN el usuario selecciona una opción de ordenamiento, THE Results_Grid SHALL reordenar los productos visibles sin recargar la página.
3. THE Search_Page SHALL persistir la opción de ordenamiento seleccionada en el URL_State como el parámetro `sort`.

---

### Requirement 5: Persistencia de filtros en URL

**User Story:** As a user, I want to share my search with filters applied, so that others can see the same results I'm viewing.

#### Acceptance Criteria

1. WHEN el usuario aplica o modifica cualquier Active_Filter, THE Search_Page SHALL actualizar la URL usando `history.pushState` con los parámetros correspondientes sin recargar la página.
2. THE Search_Page SHALL usar los siguientes parámetros de URL: `q` (texto de búsqueda), `cat` (categorías separadas por coma), `minPrice`, `maxPrice`, `sizes` (tallas separadas por coma), `colors` (colores separadas por coma), `brands` (marcas separadas por coma), `sort` (criterio de ordenamiento).
3. WHEN la Search_Page carga con parámetros de URL presentes, THE Search_Page SHALL restaurar el estado de todos los Active_Filters y el ordenamiento a partir de esos parámetros.
4. WHEN el usuario activa el botón "Limpiar filtros", THE Search_Page SHALL actualizar la URL eliminando todos los parámetros de filtro excepto `q`.

---

### Requirement 6: Lazy loading de imágenes en Results_Grid

**User Story:** As a user, I want the search results page to load fast, so that I don't wait for images that are not yet visible.

#### Acceptance Criteria

1. THE Results_Grid SHALL renderizar los Product_Cards con el atributo `loading="lazy"` en todas las etiquetas `<img>`.
2. THE Results_Grid SHALL mostrar inicialmente un máximo de 12 Product_Cards.
3. WHEN el usuario hace scroll hasta el final del Results_Grid y existen más productos que coincidan con los Active_Filters, THE Results_Grid SHALL cargar y mostrar los siguientes 12 Product_Cards sin recargar la página.
4. WHEN todos los productos coincidentes han sido mostrados, THE Results_Grid SHALL mostrar el mensaje "Has visto todos los resultados".


---

### Requirement 7: Búsqueda en tiempo real con Debounce

**User Story:** As a user, I want search results to update as I type, so that I get immediate feedback without waiting.

#### Acceptance Criteria

1. WHEN la Search_Page está activa y el usuario escribe en la Search_Bar del Header, THE Search_Page SHALL actualizar el Results_Grid aplicando el texto como filtro adicional sobre los Active_Filters existentes.
2. THE Search_Page SHALL aplicar un Debounce de 300ms a la entrada de texto antes de ejecutar el filtrado sobre PRODUCTS.
3. THE Search_Page SHALL buscar coincidencias del texto ingresado en los campos `name` y `category` de cada producto en PRODUCTS (búsqueda insensible a mayúsculas/minúsculas).
4. WHEN el campo de búsqueda está vacío, THE Search_Page SHALL mostrar todos los productos que coincidan con los demás Active_Filters sin filtro de texto.

---

### Requirement 8: Integración con js/main.js y css/styles.css

**User Story:** As a developer, I want all new code integrated into the existing files, so that the project maintains a single JS and CSS file structure.

#### Acceptance Criteria

1. THE Search_Page SHALL cargar únicamente `js/main.js` y `css/styles.css` como recursos de script y estilo, sin archivos adicionales.
2. THE Storefront SHALL agregar todo el JavaScript de la búsqueda avanzada como funciones nuevas dentro de `js/main.js`, sin modificar las funciones existentes.
3. THE Storefront SHALL agregar todos los estilos de la búsqueda avanzada al final de `css/styles.css` mediante append, sin modificar los estilos existentes.
4. THE Storefront SHALL invocar las nuevas funciones de búsqueda desde el bloque `DOMContentLoaded` existente en `js/main.js`.
5. THE Search_Page SHALL usar las variables CSS existentes `--color-primary`, `--color-secondary` y `--color-accent` para todos los estilos nuevos.
