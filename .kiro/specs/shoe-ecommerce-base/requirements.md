# Requirements Document

## Introduction

Estructura base para un e-commerce de calzado desarrollado con tecnologías web estándar (HTML5, CSS3, JavaScript vanilla). El sistema provee páginas principales para navegación de productos, detalle de producto, carrito de compras y panel de administración, con diseño responsive mobile-first y estética moderna y elegante.

## Glossary

- **Storefront**: La interfaz pública del e-commerce visible para los clientes.
- **Product_Card**: Componente visual que muestra imagen, nombre, precio y botón de acción de un producto.
- **Cart**: Módulo que gestiona los productos seleccionados por el usuario antes de la compra.
- **Admin_Dashboard**: Panel de administración accesible solo para gestión interna del catálogo.
- **Header**: Sección superior de cada página con logo, navegación y acceso al carrito.
- **Footer**: Sección inferior de cada página con enlaces secundarios e información de contacto.
- **Featured_Section**: Sección de la página principal que muestra productos destacados.
- **Breakpoint**: Punto de quiebre de ancho de pantalla usado en diseño responsive.

---

## Requirements

### Requirement 1: Estructura de archivos y carpetas

**User Story:** As a developer, I want a well-organized folder structure, so that I can maintain and extend the codebase easily.

#### Acceptance Criteria

1. THE Storefront SHALL organize los archivos estáticos en las carpetas `/css`, `/js`, `/images`, `/includes` y `/admin`.
2. THE Storefront SHALL proveer los archivos principales `index.html`, `product.html`, `cart.html` y `admin/dashboard.html`.
3. THE Storefront SHALL referenciar hojas de estilo desde `/css` y scripts desde `/js` en todos los archivos HTML.

---

### Requirement 2: Diseño responsive mobile-first

**User Story:** As a user, I want the site to display correctly on any device, so that I can browse and shop from my phone, tablet or desktop.

#### Acceptance Criteria

1. THE Storefront SHALL aplicar estilos base orientados a pantallas móviles (ancho mínimo de referencia: 320px).
2. WHEN el viewport supera 768px, THE Storefront SHALL adaptar el layout a una vista de tablet con al menos 2 columnas de productos.
3. WHEN el viewport supera 1024px, THE Storefront SHALL adaptar el layout a una vista de escritorio con al menos 3 columnas de productos.
4. THE Storefront SHALL usar unidades relativas (`rem`, `%`, `vw`) en lugar de píxeles fijos para tipografía y espaciado.
5. THE Header SHALL colapsar el menú de navegación en un menú tipo hamburguesa WHEN el viewport sea menor a 768px.

---

### Requirement 3: Header global

**User Story:** As a user, I want a consistent header on every page, so that I can navigate the site and access my cart from anywhere.

#### Acceptance Criteria

1. THE Header SHALL mostrar el logotipo de la tienda en todas las páginas.
2. THE Header SHALL incluir enlaces de navegación a: Inicio, Productos, Carrito y Contacto.
3. THE Header SHALL mostrar un ícono de carrito con el contador de ítems actuales del Cart.
4. WHEN el contador del Cart es 0, THE Header SHALL mostrar el ícono sin badge numérico.
5. WHEN el contador del Cart es mayor a 0, THE Header SHALL mostrar el número de ítems sobre el ícono del carrito.

---

### Requirement 4: Footer global

**User Story:** As a user, I want a footer with useful links and contact info, so that I can find additional information about the store.

#### Acceptance Criteria

1. THE Footer SHALL mostrar enlaces a páginas secundarias: Sobre Nosotros, Política de Devoluciones, Términos y Condiciones.
2. THE Footer SHALL mostrar información de contacto con un correo electrónico de referencia.
3. THE Footer SHALL mostrar íconos de redes sociales con enlaces externos.
4. THE Footer SHALL mostrar el año de copyright actualizado dinámicamente por JavaScript.

---

### Requirement 5: Página principal (index.html) con productos destacados

**User Story:** As a user, I want to see featured products on the homepage, so that I can quickly discover popular items.

#### Acceptance Criteria

1. THE Storefront SHALL mostrar en `index.html` una sección hero con imagen de fondo, título principal y llamada a la acción.
2. THE Featured_Section SHALL mostrar un mínimo de 4 Product_Card con datos de ejemplo (nombre, imagen, precio, categoría).
3. THE Product_Card SHALL incluir un botón "Agregar al carrito" que al ser activado añada el producto al Cart.
4. WHEN el usuario activa el botón "Agregar al carrito", THE Cart SHALL incrementar el contador del Header en 1.
5. THE Featured_Section SHALL mostrar los productos en una cuadrícula responsive conforme a los breakpoints definidos en Requirement 2.

---

### Requirement 6: Página de detalle de producto (product.html)

**User Story:** As a user, I want to view detailed information about a product, so that I can make an informed purchase decision.

#### Acceptance Criteria

1. THE Storefront SHALL mostrar en `product.html` la imagen principal del producto, nombre, precio, descripción y tallas disponibles.
2. WHEN el usuario selecciona una talla, THE Storefront SHALL marcar visualmente la talla seleccionada.
3. IF el usuario intenta agregar al carrito sin seleccionar talla, THEN THE Storefront SHALL mostrar un mensaje de validación indicando que debe seleccionar una talla.
4. WHEN el usuario activa "Agregar al carrito" con una talla seleccionada, THE Cart SHALL registrar el producto con la talla elegida.

---

### Requirement 7: Página de carrito (cart.html)

**User Story:** As a user, I want to review my cart before purchasing, so that I can confirm my selection and see the total.

#### Acceptance Criteria

1. THE Cart SHALL mostrar en `cart.html` la lista de productos agregados con nombre, talla, precio unitario y cantidad.
2. THE Cart SHALL mostrar el precio total calculado como la suma de (precio unitario × cantidad) de todos los ítems.
3. WHEN el usuario modifica la cantidad de un ítem, THE Cart SHALL recalcular y mostrar el nuevo precio total.
4. WHEN el usuario elimina un ítem, THE Cart SHALL remover el producto de la lista y actualizar el total y el contador del Header.
5. IF el Cart no contiene ítems, THEN THE Cart SHALL mostrar un mensaje indicando que el carrito está vacío y un enlace para continuar comprando.
6. THE Cart SHALL persistir los ítems usando `localStorage` para que sobrevivan a recargas de página.

---

### Requirement 8: Panel de administración (admin/dashboard.html)

**User Story:** As an admin, I want a dashboard to manage the product catalog, so that I can add, edit or remove products.

#### Acceptance Criteria

1. THE Admin_Dashboard SHALL mostrar una tabla con los productos existentes incluyendo nombre, precio, categoría y acciones.
2. THE Admin_Dashboard SHALL proveer un formulario para agregar nuevos productos con campos: nombre, precio, categoría, descripción e imagen URL.
3. WHEN el administrador envía el formulario con datos válidos, THE Admin_Dashboard SHALL agregar el producto a la tabla sin recargar la página.
4. IF el administrador envía el formulario con campos obligatorios vacíos, THEN THE Admin_Dashboard SHALL mostrar mensajes de validación por campo.
5. WHEN el administrador activa la acción "Eliminar" en un producto, THE Admin_Dashboard SHALL solicitar confirmación antes de remover el registro.

---

### Requirement 9: Tema visual moderno y elegante

**User Story:** As a store owner, I want a modern and elegant visual theme, so that the brand conveys quality and style.

#### Acceptance Criteria

1. THE Storefront SHALL usar una paleta de colores con máximo 3 colores principales definidos como variables CSS (`--color-primary`, `--color-secondary`, `--color-accent`).
2. THE Storefront SHALL usar tipografías sans-serif de Google Fonts para títulos y cuerpo de texto.
3. THE Product_Card SHALL aplicar una transición visual suave (máximo 300ms) WHEN el usuario hace hover sobre la tarjeta.
4. THE Storefront SHALL mantener un espaciado consistente usando una escala de espaciado definida en variables CSS.
