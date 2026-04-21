# Requirements Document

## Introduction

CRUD completo de productos para el panel de administración del e-commerce de calzado StepStyle. Permite a los administradores listar, crear, editar y eliminar productos con sus tallas, colores e imágenes. Incluye editor WYSIWYG para descripciones, subida de imágenes con drag-and-drop, tabla dinámica de stock por talla y validación client-side y server-side. El módulo vive bajo `/admin` y reutiliza `admin/css/admin.css` y `admin/js/admin.js`.

## Glossary

- **Product_Manager**: Módulo PHP que gestiona la lógica CRUD de productos.
- **Products_List**: Página `admin/productos.php` con tabla paginada, filtros y búsqueda.
- **Product_Form**: Formulario compartido por `admin/agregar_producto.php` y `admin/editar_producto.php`.
- **WYSIWYG_Editor**: Editor de texto enriquecido (Quill.js via CDN) para la descripción del producto.
- **Image_Uploader**: Componente de subida de imágenes con drag-and-drop y preview.
- **Stock_Table**: Tabla dinámica de filas talla/stock con botones para agregar y eliminar filas.
- **Color_Picker**: Componente de selección de color con input type="color" y campo de nombre.
- **Admin_CSS**: Hoja de estilos en `admin/css/admin.css`.
- **Admin_JS**: Script en `admin/js/admin.js`.

---

## Requirements

### Requirement 1: Listado de productos

**User Story:** As an admin, I want to see a paginated list of all products, so that I can manage the catalog efficiently.

#### Acceptance Criteria

1. THE Products_List SHALL estar disponible en `admin/productos.php` y requerir sesión activa de Admin.
2. THE Products_List SHALL mostrar una tabla con columnas: imagen miniatura, nombre, categoría, precio, stock total y acciones (editar, eliminar).
3. THE Products_List SHALL paginar los resultados mostrando 20 productos por página con controles de paginación.
4. THE Products_List SHALL mostrar un campo de búsqueda que filtre productos por nombre en tiempo real (debounce 300ms, consulta AJAX).
5. THE Products_List SHALL mostrar filtros por categoría (deportivos, casuales, formales, botas, todos) y por estado (activo, inactivo).
6. WHEN el Admin hace clic en "Editar", THE Products_List SHALL navegar a `admin/editar_producto.php?id={id}`.
7. WHEN el Admin hace clic en "Eliminar", THE Products_List SHALL mostrar un diálogo de confirmación antes de proceder.
8. THE Products_List SHALL aplicar los estilos de Admin_CSS y ser responsive en viewports menores a 768px.

---

### Requirement 2: Formulario de creación de producto

**User Story:** As an admin, I want to add new products with all their details, so that customers can see them in the store.

#### Acceptance Criteria

1. THE Product_Form SHALL estar disponible en `admin/agregar_producto.php` y requerir sesión activa de Admin.
2. THE Product_Form SHALL incluir campos: nombre (texto), descripción (WYSIWYG_Editor), precio (número decimal), categoría (select).
3. THE WYSIWYG_Editor SHALL usar Quill.js cargado via CDN con opciones de formato básico (negrita, cursiva, listas, encabezados).
4. THE Product_Form SHALL incluir la Stock_Table con al menos una fila inicial y botones para agregar y eliminar filas dinámicamente.
5. THE Product_Form SHALL incluir el Color_Picker con botón para agregar múltiples colores y opción de eliminar cada uno.
6. THE Product_Form SHALL incluir el Image_Uploader con soporte para arrastrar y soltar múltiples imágenes y preview antes de subir.
7. WHEN el Admin envía el formulario con datos válidos, THE Product_Manager SHALL insertar el producto en la DB y redirigir a Products_List con mensaje de éxito.
8. THE Product_Form SHALL aplicar los estilos de Admin_CSS.

---

### Requirement 3: Validación del formulario de producto

**User Story:** As an admin, I want the product form to validate my input, so that I don't save incomplete or incorrect data.

#### Acceptance Criteria

1. IF el campo nombre está vacío al enviar, THEN THE Product_Form SHALL mostrar un mensaje de error indicando que el nombre es requerido.
2. IF el precio no es un número positivo, THEN THE Product_Form SHALL mostrar un mensaje de error de formato.
3. IF no se ha seleccionado categoría, THEN THE Product_Form SHALL mostrar un mensaje de error.
4. IF la Stock_Table no tiene ninguna fila con talla y stock válidos, THEN THE Product_Form SHALL mostrar un mensaje de error.
5. THE Product_Manager SHALL validar los mismos campos en el servidor y retornar errores si la validación client-side es eludida.
6. THE Product_Manager SHALL sanitizar todos los inputs con `htmlspecialchars()` antes de insertar en DB.

---

### Requirement 4: Subida de imágenes

**User Story:** As an admin, I want to upload multiple product images with drag-and-drop, so that I can showcase the product from different angles.

#### Acceptance Criteria

1. THE Image_Uploader SHALL aceptar archivos de tipo JPEG, PNG y WebP con tamaño máximo de 5MB por imagen.
2. WHEN el Admin arrastra imágenes al área de drop, THE Image_Uploader SHALL mostrar previews de las imágenes antes de subir.
3. THE Image_Uploader SHALL permitir eliminar imágenes del preview antes de enviar el formulario.
4. WHEN el formulario se envía, THE Product_Manager SHALL subir las imágenes a `uploads/productos/` en el servidor.
5. THE Product_Manager SHALL generar nombres de archivo únicos usando `uniqid()` para evitar colisiones.
6. IF un archivo no cumple los requisitos de tipo o tamaño, THEN THE Image_Uploader SHALL mostrar un mensaje de error y no incluir ese archivo en el envío.

---

### Requirement 5: Stock_Table dinámica

**User Story:** As an admin, I want to manage stock per size dynamically, so that I can set different quantities for each available size.

#### Acceptance Criteria

1. THE Stock_Table SHALL mostrar columnas: talla (select 35-44), stock (input numérico) y acción (eliminar fila).
2. WHEN el Admin hace clic en "Agregar talla", THE Stock_Table SHALL insertar una nueva fila vacía al final de la tabla.
3. WHEN el Admin hace clic en el botón de eliminar de una fila, THE Stock_Table SHALL remover esa fila del DOM.
4. THE Stock_Table SHALL prevenir la selección de la misma talla en dos filas distintas (validación client-side).
5. THE Product_Manager SHALL insertar un registro en la tabla `tallas` por cada fila de la Stock_Table al guardar el producto.

---

### Requirement 6: Formulario de edición de producto

**User Story:** As an admin, I want to edit existing products with their current data pre-loaded, so that I can update information without re-entering everything.

#### Acceptance Criteria

1. THE Product_Form en `admin/editar_producto.php` SHALL cargar los datos actuales del producto desde la DB usando el `id` del parámetro GET.
2. THE Product_Form SHALL pre-rellenar todos los campos: nombre, descripción (en WYSIWYG_Editor), precio, categoría, tallas/stock (en Stock_Table), colores (en Color_Picker) e imágenes existentes (en Image_Uploader).
3. WHEN el Admin envía el formulario de edición con datos válidos, THE Product_Manager SHALL actualizar el producto en la DB y redirigir a Products_List con mensaje de éxito.
4. THE Product_Manager SHALL actualizar los registros de `tallas`, `colores` e `imagenes_producto` eliminando los anteriores e insertando los nuevos.
5. IF el `id` en la URL no corresponde a un producto existente, THEN THE Product_Manager SHALL mostrar un mensaje de error y redirigir a Products_List.

---

### Requirement 7: Eliminación de producto

**User Story:** As an admin, I want to delete products with a confirmation step, so that I don't accidentally remove products from the catalog.

#### Acceptance Criteria

1. THE Products_List SHALL mostrar un diálogo de confirmación con el nombre del producto antes de eliminar.
2. WHEN el Admin confirma la eliminación, THE Products_List SHALL enviar una solicitud POST a `admin/eliminar_producto.php` con el `id` del producto.
3. THE Product_Manager en `admin/eliminar_producto.php` SHALL eliminar el producto y sus registros relacionados (tallas, colores, imágenes) de la DB usando DELETE con prepared statements.
4. WHEN la eliminación es exitosa, THE Product_Manager SHALL redirigir a Products_List con un mensaje de confirmación.
5. THE Product_Manager SHALL eliminar los archivos de imagen del servidor al eliminar el producto.

---

### Requirement 8: Seguridad del módulo CRUD

**User Story:** As a developer, I want all product management endpoints to be secure, so that only authenticated admins can modify the catalog.

#### Acceptance Criteria

1. THE Product_Manager SHALL verificar sesión activa de Admin al inicio de cada script PHP del módulo.
2. THE Product_Manager SHALL usar prepared statements con parámetros enlazados en todas las consultas SQL.
3. THE Product_Manager SHALL sanitizar todos los valores de salida HTML con `htmlspecialchars()` para prevenir XSS.
4. THE Product_Manager SHALL validar que el `id` recibido sea un entero positivo antes de ejecutar consultas.
5. THE Product_Manager SHALL incluir `includes/conexion.php` para reutilizar la conexión PDO existente.
