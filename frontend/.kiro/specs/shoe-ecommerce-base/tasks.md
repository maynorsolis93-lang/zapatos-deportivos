# Implementation Plan: product.html — Detalle de Producto

## Overview

Implementar `product.html` con galería de imágenes, selectores de talla/color/cantidad, pestañas informativas, productos relacionados y lógica JS integrada con el módulo Cart existente en `js/main.js`.

## Tasks

- [x] 1. Crear product.html con estructura base y galería de imágenes
  - Crear `product.html` con header/footer idénticos a `index.html`
  - Sección `.product-detail` con imagen principal `.gallery__main` y miniaturas `.gallery__thumbs`
  - _Requirements: 1.2, 1.3, 3.1, 3.2, 6.1_

  - [x] 1.1 Implementar sección de información del producto
    - Nombre, precio, disponibilidad, selector de tallas (35–44), selector de colores, input de cantidad
    - Botones "Comprar ahora" y "Agregar al carrito"
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

  - [ ]* 1.2 Escribir test de propiedad para selección de talla exclusiva
    - **Property 7: Selección de talla marca visualmente la talla elegida**
    - **Validates: Requirements 6.2**

- [x] 2. Implementar pestañas informativas
  - Cuatro pestañas: Descripción, Guía de tallas, Política de cambios, Reseñas
  - Tabla comparativa de tallas en pestaña "Guía de tallas"
  - Reseñas de clientes con estrellas en pestaña "Reseñas"
  - _Requirements: 6.1_

- [x] 3. Implementar sección de productos relacionados
  - Grid de 4 tarjetas usando `productCardHTML()` existente
  - _Requirements: 5.2, 5.5_

- [x] 4. Extender js/main.js con lógica de product.html
  - [x] 4.1 Función `initProductPage()`: leer `?id=` de URL, cargar datos del producto
    - Cambio de imagen principal al click en miniaturas
    - Validación de stock por talla (indicador visual)
    - Cálculo de precio total según cantidad
    - _Requirements: 6.1, 6.2_

  - [x] 4.2 Lógica de "Agregar al carrito" con validación de talla
    - Validar talla seleccionada antes de agregar
    - Registrar producto con talla, color y cantidad en Cart
    - _Requirements: 6.3, 6.4_

  - [ ]* 4.3 Escribir test de propiedad: agregar sin talla muestra error
    - **Property 8: Agregar sin talla muestra error de validación**
    - **Validates: Requirements 6.3**

  - [ ]* 4.4 Escribir test de propiedad: talla almacenada correctamente
    - **Property 9: Agregar con talla almacena la talla elegida**
    - **Validates: Requirements 6.4**

- [x] 5. Extender css/styles.css con estilos de product.html
  - Estilos para `.product-detail`, `.gallery`, `.size-selector`, `.color-selector`
  - Estilos para `.tabs`, `.tabs__content`, `.related-products`
  - _Requirements: 2.1, 2.2, 2.3, 9.3, 9.4_

- [x] 6. Checkpoint — Verificar integración completa
  - Asegurar que todos los tests pasan, preguntar al usuario si hay dudas.

## Notes

- Tasks marcadas con `*` son opcionales y pueden omitirse para un MVP rápido
- Cada task referencia requisitos específicos para trazabilidad
- La lógica JS se agrega a `js/main.js` para mantener un único archivo de scripts
