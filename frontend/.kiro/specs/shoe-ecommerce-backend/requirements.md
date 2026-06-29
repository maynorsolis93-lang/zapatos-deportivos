@# Requirements Document

## Introduction

Backend para un e-commerce de calzado desarrollado con PHP y MySQL. El sistema provee la capa de datos y lógica de negocio para gestionar usuarios, catálogo de productos (con tallas, colores e imágenes), pedidos y detalle de pedidos. Es un proyecto independiente del frontend `shoe-ecommerce-base`, diseñado para ser consumido por cualquier cliente web o móvil.

## Glossary

- **Backend**: Capa de servidor que gestiona la base de datos, lógica de negocio y exposición de datos.
- **DB**: Base de datos MySQL que almacena toda la información del sistema.
- **Connection**: Objeto PDO que representa la conexión activa a la DB.
- **Usuario**: Persona registrada en el sistema con rol de cliente o administrador.
- **Producto**: Artículo de calzado disponible en el catálogo con sus atributos.
- **Talla**: Variante de tamaño de un Producto con su propio stock.
- **Color**: Variante de color de un Producto con su propio stock.
- **Imagen_Producto**: Recurso visual asociado a un Producto con un orden de presentación.
- **Pedido**: Orden de compra generada por un Usuario con un estado y total.
- **Detalle_Pedido**: Línea individual dentro de un Pedido que referencia un Producto, talla, cantidad y precio unitario.
- **Categoria**: Clasificación del Producto (deportivo, casual, formal).
- **Stock**: Cantidad de unidades disponibles para una Talla o Color específico.

---

## Requirements

### Requirement 1: Esquema de base de datos

**User Story:** As a developer, I want a well-defined database schema, so that all entities and their relationships are consistently stored.

#### Acceptance Criteria

1. THE DB SHALL contener la tabla `usuarios` con las columnas: `id` (PK autoincrement), `nombre` (VARCHAR 100 NOT NULL), `email` (VARCHAR 150 UNIQUE NOT NULL), `password` (VARCHAR 255 NOT NULL), `rol` (ENUM 'cliente','admin' DEFAULT 'cliente'), `fecha_registro` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP).
2. THE DB SHALL contener la tabla `productos` con las columnas: `id` (PK autoincrement), `nombre` (VARCHAR 150 NOT NULL), `descripcion` (TEXT), `precio` (DECIMAL 10,2 NOT NULL), `categoria` (ENUM 'deportivo','casual','formal' NOT NULL), `imagen_principal` (VARCHAR 255), `fecha_creacion` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP).
3. THE DB SHALL contener la tabla `tallas` con las columnas: `id` (PK autoincrement), `producto_id` (FK → productos.id ON DELETE CASCADE), `talla` (VARCHAR 10 NOT NULL), `stock` (INT DEFAULT 0).
4. THE DB SHALL contener la tabla `colores` con las columnas: `id` (PK autoincrement), `producto_id` (FK → productos.id ON DELETE CASCADE), `color` (VARCHAR 50 NOT NULL), `stock` (INT DEFAULT 0).
5. THE DB SHALL contener la tabla `imagenes_producto` con las columnas: `id` (PK autoincrement), `producto_id` (FK → productos.id ON DELETE CASCADE), `url_imagen` (VARCHAR 255 NOT NULL), `orden` (INT DEFAULT 0).
6. THE DB SHALL contener la tabla `pedidos` con las columnas: `id` (PK autoincrement), `usuario_id` (FK → usuarios.id), `total` (DECIMAL 10,2 NOT NULL), `estado` (ENUM 'pendiente','procesando','enviado','entregado','cancelado' DEFAULT 'pendiente'), `fecha_pedido` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP).
7. THE DB SHALL contener la tabla `detalle_pedido` con las columnas: `id` (PK autoincrement), `pedido_id` (FK → pedidos.id ON DELETE CASCADE), `producto_id` (FK → productos.id), `talla` (VARCHAR 10 NOT NULL), `cantidad` (INT NOT NULL), `precio_unitario` (DECIMAL 10,2 NOT NULL).
8. WHEN se elimina un Producto, THE DB SHALL eliminar en cascada sus registros asociados en `tallas`, `colores` e `imagenes_producto`.
9. THE DB SHALL incluir datos de ejemplo con un mínimo de 5 Productos de calzado distribuidos entre las categorías deportivo, casual y formal, cada uno con al menos 2 Tallas, 2 Colores y 2 Imágenes.

---

### Requirement 2: Conexión PDO a la base de datos

**User Story:** As a developer, I want a reusable PDO connection class, so that all database operations use a single, consistent connection.

#### Acceptance Criteria

1. THE Connection SHALL estar implementada en `includes/conexion.php` como una clase PHP con un método estático o singleton que retorne una instancia PDO.
2. THE Connection SHALL configurar PDO con el charset `utf8mb4` y el modo de error `PDO::ERRMODE_EXCEPTION`.
3. THE Connection SHALL leer los parámetros de conexión (host, nombre de DB, usuario, contraseña) desde constantes o variables de configuración definidas en el mismo archivo.
4. IF la conexión a la DB falla, THEN THE Connection SHALL lanzar una excepción con un mensaje descriptivo sin exponer credenciales en la salida.
5. THE Connection SHALL establecer el atributo `PDO::ATTR_DEFAULT_FETCH_MODE` en `PDO::FETCH_ASSOC` para que todas las consultas retornen arrays asociativos por defecto.

---

### Requirement 3: Función obtenerProductos()

**User Story:** As a developer, I want a function to retrieve all products, so that the frontend can display the full catalog.

#### Acceptance Criteria

1. THE Backend SHALL exponer la función `obtenerProductos()` en `includes/funciones.php` que retorne un array con todos los Productos de la DB.
2. WHEN se invoca `obtenerProductos()`, THE Backend SHALL retornar para cada Producto los campos: `id`, `nombre`, `descripcion`, `precio`, `categoria`, `imagen_principal`, `fecha_creacion`.
3. THE Backend SHALL retornar los Productos ordenados por `fecha_creacion` descendente por defecto.
4. IF no existen Productos en la DB, THEN `obtenerProductos()` SHALL retornar un array vacío sin lanzar error.

---

### Requirement 4: Función obtenerProductoPorId()

**User Story:** As a developer, I want a function to retrieve a single product by ID, so that the frontend can display the product detail page.

#### Acceptance Criteria

1. THE Backend SHALL exponer la función `obtenerProductoPorId(int $id)` en `includes/funciones.php` que retorne los datos completos de un Producto.
2. WHEN se invoca `obtenerProductoPorId($id)`, THE Backend SHALL retornar los campos del Producto junto con sus Tallas, Colores e Imágenes asociadas.
3. THE Backend SHALL usar consultas preparadas (prepared statements) con parámetros enlazados para prevenir inyección SQL.
4. IF el Producto con el `$id` indicado no existe, THEN `obtenerProductoPorId()` SHALL retornar `null`.

---

### Requirement 5: Función actualizarStock()

**User Story:** As a developer, I want a function to update stock for a product size, so that inventory is kept accurate after a purchase.

#### Acceptance Criteria

1. THE Backend SHALL exponer la función `actualizarStock(int $producto_id, string $talla, int $cantidad)` en `includes/funciones.php`.
2. WHEN se invoca `actualizarStock()`, THE Backend SHALL decrementar el `stock` de la Talla correspondiente al `$producto_id` y `$talla` indicados en `$cantidad` unidades.
3. THE Backend SHALL usar consultas preparadas para prevenir inyección SQL en `actualizarStock()`.
4. IF el Stock resultante sería negativo, THEN `actualizarStock()` SHALL retornar `false` sin modificar la DB.
5. WHEN la actualización es exitosa, `actualizarStock()` SHALL retornar `true`.
6. IF la Talla indicada no existe para el Producto dado, THEN `actualizarStock()` SHALL retornar `false`.

---

### Requirement 6: Datos de ejemplo (seed data)

**User Story:** As a developer, I want sample data pre-loaded in the database, so that I can test the frontend and backend integration immediately.

#### Acceptance Criteria

1. THE DB SHALL incluir exactamente 5 Productos de ejemplo: al menos 2 deportivos, 1 casual y 1 formal (el quinto puede ser de cualquier categoría).
2. WHEN se ejecuta el script SQL, THE DB SHALL insertar para cada Producto un mínimo de 3 Tallas con stock mayor a 0.
3. WHEN se ejecuta el script SQL, THE DB SHALL insertar para cada Producto un mínimo de 2 Colores con stock mayor a 0.
4. WHEN se ejecuta el script SQL, THE DB SHALL insertar para cada Producto un mínimo de 2 URLs de imágenes de ejemplo en `imagenes_producto`.
5. THE DB SHALL incluir al menos 1 Usuario de ejemplo con rol `admin` y al menos 1 con rol `cliente`, con contraseñas almacenadas como hash (no en texto plano).
6. THE DB SHALL incluir al menos 1 Pedido de ejemplo con su correspondiente Detalle_Pedido para verificar la integridad referencial.
