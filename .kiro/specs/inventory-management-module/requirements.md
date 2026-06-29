# Requirements Document - Inventory Management Module

## Introduction

El módulo de gestión de inventario de Kiro Shoes necesita una interfaz visual completa en React para administrar productos de calzado. El backend ya cuenta con un CRUD completo de productos implementado en `backend/src/routes/products.js` con todos los endpoints necesarios.

**ALCANCE:** Este spec se enfoca EXCLUSIVAMENTE en crear la interfaz React (frontend) desde cero. No se modificará el backend existente excepto para agregar campos menores al modelo de datos si es necesario (brand, colors, purchasePrice, supplier, warehouseLocation).

**BACKEND EXISTENTE (YA IMPLEMENTADO):**
- ✅ POST /api/products - Crear producto con variantes
- ✅ GET /api/products - Listar todos los productos
- ✅ GET /api/products/:id - Detalle de producto
- ✅ PUT /api/products/:id - Actualizar producto
- ✅ DELETE /api/products/:id - Soft delete
- ✅ POST /api/products/:id/variants/:variantId/stock - Ajustar stock
- ✅ GET /api/products/:id/variants/:variantId/movements - Historial
- ✅ GET /api/inventory/low-stock - Stock bajo (implementado)
- ✅ GET /api/inventory/movements - Movimientos con filtros

**LO QUE CREAREMOS:**
- 🎨 Interfaz React completa de inventario
- 📊 Panel de estadísticas visuales
- 📋 Tabla responsiva con filtros y búsqueda
- ➕ Modales para crear/editar productos
- 📜 Modal de historial de movimientos
- 📤 Exportación a CSV desde frontend

## Glossary

- **System**: El módulo completo de gestión de inventario (backend + frontend)
- **Backend_API**: La API REST construida con Node.js + Express + Prisma
- **Frontend_UI**: La interfaz de usuario construida con React
- **Product**: Un modelo de calzado con atributos base (nombre, SKU, categoría, marca, precio)
- **Product_Variant**: Una variante específica de un producto por talla con stock independiente
- **Inventory_Movement**: Un registro de cambio en el stock (entrada/salida) con razón y usuario
- **Admin_User**: Usuario autenticado con permisos para gestionar el inventario
- **Stock_Alert**: Notificación de stock bajo o agotado basada en umbrales configurables
- **SKU**: Stock Keeping Unit - código único de identificación del producto
- **Low_Stock_Threshold**: Umbral de unidades (default: 3) por debajo del cual se genera alerta
- **Available_Stock**: Stock disponible calculado como stockQty - reservedQty
- **Database**: PostgreSQL con esquema Prisma existente
- **CSV_Export**: Formato de exportación de datos de inventario

## Requirements

### Requirement 1: Extensión del Modelo de Datos para Productos

**User Story:** Como administrador, quiero que el sistema almacene información completa de productos de calzado (marca, colores, precio de compra, proveedor, ubicación), para que pueda gestionar el inventario de forma detallada.

#### Acceptance Criteria

1. THE Database SHALL extender el modelo Product con los campos: brand (String, nullable), colors (String array, nullable), purchasePrice (Decimal(12,2), nullable), supplier (String, nullable), warehouseLocation (String, nullable)
2. WHEN se crea o actualiza un Product, THE Backend_API SHALL validar que purchasePrice sea mayor o igual a cero si está presente
3. WHEN se crea o actualiza un Product, THE Backend_API SHALL validar que basePrice sea mayor que cero
4. THE Backend_API SHALL mantener los campos existentes sin modificar: id, sku, name, description, basePrice, badge, isActive, categoryId, audienceId, createdAt, updatedAt
5. THE Database SHALL preservar las relaciones existentes: Product → Category, Product → Audience, Product → ProductImage, Product → ProductVariant

### Requirement 2: Validación de SKU Único

**User Story:** Como administrador, quiero que cada producto tenga un SKU único, para que no haya duplicados en el inventario.

#### Acceptance Criteria

1. WHEN se crea un nuevo Product, THE Backend_API SHALL verificar que el SKU no exista previamente
2. IF el SKU ya existe, THEN THE Backend_API SHALL retornar error HTTP 409 con mensaje "SKU already exists"
3. WHEN se actualiza un Product, THE Backend_API SHALL verificar que el nuevo SKU no esté en uso por otro producto
4. THE Backend_API SHALL permitir SKU nulo (null) pero asegurar unicidad cuando está presente
5. THE Backend_API SHALL realizar validación case-insensitive del SKU

### Requirement 3: Endpoint de Listado de Productos con Filtros

**User Story:** Como administrador, quiero listar productos con paginación, búsqueda y filtros (categoría, marca, rango de precios, stock bajo), para que pueda encontrar productos específicos rápidamente.

#### Acceptance Criteria

1. THE Backend_API SHALL exponer endpoint GET /api/inventory con respuesta paginada
2. WHEN se solicita GET /api/inventory, THE Backend_API SHALL aceptar query params: page (default: 1), limit (default: 10), search (String), categoryId (Int), brand (String), minPrice (Decimal), maxPrice (Decimal), lowStock (Boolean), isActive (Boolean)
3. WHEN search está presente, THE Backend_API SHALL filtrar productos donde name, sku o brand contengan el texto (case-insensitive)
4. WHEN lowStock es true, THE Backend_API SHALL filtrar productos donde al menos una variante tenga stockQty menor o igual a Low_Stock_Threshold
5. THE Backend_API SHALL incluir en la respuesta: products (array), pagination (page, limit, total, totalPages)
6. THE Backend_API SHALL incluir para cada producto: id, sku, name, brand, basePrice, purchasePrice, isActive, category (label), audience (label), mainImage (imageUrl), totalStock (suma de stockQty de todas las variantes), variants (array con size y stock por talla)

### Requirement 4: Endpoint de Detalle de Producto

**User Story:** Como administrador, quiero ver el detalle completo de un producto incluyendo todas sus tallas y stock, para que pueda revisar su información completa.

#### Acceptance Criteria

1. THE Backend_API SHALL exponer endpoint GET /api/inventory/:id
2. WHEN el producto existe, THE Backend_API SHALL retornar HTTP 200 con todos los campos del producto
3. THE Backend_API SHALL incluir en la respuesta: category (objeto completo), audience (objeto completo), images (array de todas las imágenes), variants (array con size, stockQty, reservedQty, availableStock calculado)
4. IF el producto no existe, THEN THE Backend_API SHALL retornar HTTP 404 con mensaje "Product not found"

### Requirement 5: Endpoint de Creación de Producto

**User Story:** Como administrador, quiero crear nuevos productos con sus tallas iniciales, para que pueda agregar calzado al inventario.

#### Acceptance Criteria

1. THE Backend_API SHALL exponer endpoint POST /api/inventory con autenticación requerida
2. WHEN se recibe una solicitud válida, THE Backend_API SHALL crear el Product y sus ProductVariant asociados en una transacción atómica
3. THE Backend_API SHALL validar campos requeridos: name (String, min 3 chars), categoryId (Int existente), audienceId (Int existente), basePrice (Decimal > 0)
4. THE Backend_API SHALL validar campos opcionales: sku (String único), brand (String), colors (Array), purchasePrice (Decimal >= 0), supplier (String), warehouseLocation (String), description (String), badge (String)
5. WHEN variants están presentes en el body, THE Backend_API SHALL crear ProductVariant para cada talla con sizeId y stockQty inicial
6. WHEN se crea stock inicial (stockQty > 0), THE Backend_API SHALL registrar un InventoryMovement con movementType "entrada", reason "stock_inicial", y createdBy del usuario autenticado
7. IF la validación falla, THEN THE Backend_API SHALL retornar HTTP 400 con detalles de los errores
8. WHEN la creación es exitosa, THE Backend_API SHALL retornar HTTP 201 con el producto creado incluyendo sus variantes

### Requirement 6: Endpoint de Actualización de Producto

**User Story:** Como administrador, quiero actualizar la información de un producto existente, para que pueda mantener los datos actualizados.

#### Acceptance Criteria

1. THE Backend_API SHALL exponer endpoint PUT /api/inventory/:id con autenticación requerida
2. THE Backend_API SHALL validar que el producto existe antes de actualizar
3. THE Backend_API SHALL permitir actualización de campos: name, description, brand, colors, basePrice, purchasePrice, supplier, warehouseLocation, badge, isActive, categoryId, audienceId
4. WHEN se actualiza el SKU, THE Backend_API SHALL validar unicidad excluyendo el producto actual
5. THE Backend_API SHALL actualizar el campo updatedAt automáticamente
6. THE Backend_API SHALL retornar HTTP 200 con el producto actualizado
7. IF el producto no existe, THEN THE Backend_API SHALL retornar HTTP 404
8. IF la validación falla, THEN THE Backend_API SHALL retornar HTTP 400 con detalles de errores

### Requirement 7: Endpoint de Actualización de Stock por Talla

**User Story:** Como administrador, quiero actualizar el stock de una talla específica de un producto, para que pueda registrar entradas o salidas de inventario.

#### Acceptance Criteria

1. THE Backend_API SHALL exponer endpoint PATCH /api/inventory/:id/stock con autenticación requerida
2. THE Backend_API SHALL aceptar en el body: variantId (Int requerido), quantity (Int requerido, puede ser negativo), reason (String requerido), note (String opcional)
3. THE Backend_API SHALL validar que variantId pertenece al producto especificado
4. THE Backend_API SHALL calcular nuevo stockQty como: stockQty actual + quantity
5. THE Backend_API SHALL validar que el nuevo stockQty sea mayor o igual a cero
6. IF el nuevo stockQty sería negativo, THEN THE Backend_API SHALL retornar HTTP 400 con mensaje "Insufficient stock"
7. WHEN la actualización es válida, THE Backend_API SHALL actualizar stockQty y crear InventoryMovement con movementType ("entrada" si quantity > 0, "salida" si quantity < 0), quantity (valor absoluto), reason, note, createdBy del usuario autenticado
8. THE Backend_API SHALL ejecutar la actualización en una transacción atómica
9. THE Backend_API SHALL retornar HTTP 200 con la variante actualizada y el stockQty nuevo

### Requirement 8: Endpoint de Eliminación de Producto

**User Story:** Como administrador, quiero eliminar o desactivar productos, para que pueda gestionar productos descontinuados o eliminar errores.

#### Acceptance Criteria

1. THE Backend_API SHALL exponer endpoint DELETE /api/inventory/:id con autenticación requerida
2. THE Backend_API SHALL implementar soft delete por defecto (actualizar isActive a false)
3. WHEN query param hardDelete=true está presente, THE Backend_API SHALL verificar que el producto no tiene OrderItem asociados
4. IF el producto tiene OrderItem asociados, THEN THE Backend_API SHALL retornar HTTP 400 con mensaje "Cannot delete product with associated orders"
5. WHEN hardDelete es true y no hay órdenes, THE Backend_API SHALL eliminar en orden: ProductImage, InventoryMovement de variantes, ProductVariant, Product usando una transacción
6. WHEN hardDelete es false o ausente, THE Backend_API SHALL actualizar isActive a false
7. THE Backend_API SHALL retornar HTTP 200 con confirmación de operación

### Requirement 9: Endpoint de Reporte de Stock Bajo

**User Story:** Como administrador, quiero ver un reporte de productos con stock bajo (menos de 3 unidades por talla), para que pueda hacer pedidos a proveedores.

#### Acceptance Criteria

1. THE Backend_API SHALL exponer endpoint GET /api/inventory/low-stock
2. THE Backend_API SHALL aceptar query param threshold (Int, default: 3) para configurar el umbral
3. THE Backend_API SHALL filtrar ProductVariant donde stockQty <= threshold y stockQty > 0
4. THE Backend_API SHALL incluir solo productos con isActive = true
5. THE Backend_API SHALL agrupar resultados por producto con array de variantes afectadas
6. THE Backend_API SHALL retornar: threshold usado, totalProducts, totalVariants, products (array con id, name, sku, brand, category, audience, mainImage, variants con size, stockQty, reservedQty, availableQty)
7. THE Backend_API SHALL ordenar por stockQty ascendente

### Requirement 10: Endpoint de Listado de Categorías y Marcas

**User Story:** Como administrador, quiero obtener listas de categorías y marcas únicas, para que pueda usarlas en filtros y formularios.

#### Acceptance Criteria

1. THE Backend_API SHALL exponer endpoint GET /api/inventory/categories
2. THE Backend_API SHALL retornar array de todas las categorías con id, code, label
3. THE Backend_API SHALL exponer endpoint GET /api/inventory/brands
4. THE Backend_API SHALL retornar array de marcas únicas (valores distintos de campo brand donde no es null), ordenado alfabéticamente

### Requirement 11: Endpoint de Estadísticas de Inventario

**User Story:** Como administrador, quiero ver estadísticas del inventario (total productos, valor total, productos más vendidos), para que pueda tener una visión general del negocio.

#### Acceptance Criteria

1. THE Backend_API SHALL exponer endpoint GET /api/inventory/stats con autenticación requerida
2. THE Backend_API SHALL calcular y retornar: totalProducts (count activos), totalValue (suma de stockQty × purchasePrice de todas las variantes donde purchasePrice no es null), lowStockCount (variantes con stockQty <= 3), outOfStockCount (variantes con stockQty = 0)
3. THE Backend_API SHALL incluir topSellingProducts (simulado por ahora: top 5 productos por createdAt descendente con imagen, nombre, categoría)
4. THE Backend_API SHALL retornar estadísticas agrupadas en objeto stats

### Requirement 12: Endpoint de Historial de Movimientos por Variante

**User Story:** Como administrador, quiero ver el historial completo de movimientos de stock de una talla específica, para que pueda auditar cambios y rastrear operaciones.

#### Acceptance Criteria

1. THE Backend_API SHALL exponer endpoint GET /api/inventory/movements/:variantId
2. THE Backend_API SHALL retornar array de InventoryMovement filtrados por variantId, ordenados por createdAt descendente
3. THE Backend_API SHALL incluir para cada movimiento: id, movementType, quantity, reason, note, createdAt, admin (fullName, email si existe)
4. THE Backend_API SHALL aceptar query params page y limit para paginación
5. IF no hay movimientos, THEN THE Backend_API SHALL retornar array vacío

### Requirement 13: Endpoint de Registro Manual de Movimiento

**User Story:** Como administrador, quiero registrar manualmente movimientos de stock (ajustes, mermas, devoluciones), para que pueda corregir discrepancias de inventario.

#### Acceptance Criteria

1. THE Backend_API SHALL exponer endpoint POST /api/inventory/movements con autenticación requerida
2. THE Backend_API SHALL aceptar en el body: variantId (Int requerido), movementType (enum: "entrada" | "salida"), quantity (Int positivo requerido), reason (String requerido), note (String opcional)
3. THE Backend_API SHALL validar que quantity sea mayor que cero
4. WHEN movementType es "salida", THE Backend_API SHALL verificar que stockQty actual >= quantity
5. IF stock insuficiente, THEN THE Backend_API SHALL retornar HTTP 400 con mensaje "Insufficient stock for withdrawal"
6. THE Backend_API SHALL actualizar stockQty de la variante según movementType (sumar si entrada, restar si salida)
7. THE Backend_API SHALL crear registro InventoryMovement con todos los campos y createdBy del usuario autenticado
8. THE Backend_API SHALL ejecutar en transacción atómica
9. THE Backend_API SHALL retornar HTTP 201 con el movimiento creado y stockQty actualizado

### Requirement 14: Endpoint de Exportación a CSV

**User Story:** Como administrador, quiero exportar el inventario actual a formato CSV, para que pueda analizarlo en Excel o compartirlo con proveedores.

#### Acceptance Criteria

1. THE Backend_API SHALL exponer endpoint GET /api/inventory/export con autenticación requerida
2. THE Backend_API SHALL aceptar los mismos filtros que GET /api/inventory (categoryId, brand, lowStock, search)
3. THE Backend_API SHALL generar archivo CSV con headers: SKU, Nombre, Marca, Categoría, Audiencia, Talla, Stock, Reservado, Disponible, Precio_Compra, Precio_Venta, Ubicación
4. THE Backend_API SHALL incluir una fila por cada ProductVariant de los productos filtrados
5. THE Backend_API SHALL retornar respuesta con Content-Type "text/csv" y header Content-Disposition "attachment; filename=inventory-[timestamp].csv"
6. THE Backend_API SHALL usar formato CSV estándar con comas como delimitador y comillas para campos con texto

### Requirement 15: Vista Principal de Inventario en React

**User Story:** Como administrador, quiero una interfaz visual para listar productos con tabla, búsqueda, filtros y paginación, para que pueda gestionar el inventario de forma intuitiva.

#### Acceptance Criteria

1. THE Frontend_UI SHALL renderizar componente InventoryListView con tabla responsiva
2. THE Frontend_UI SHALL mostrar columnas: imagen thumbnail, SKU, nombre, marca, tallas (badge/tooltip con stock por talla), precio de venta, stock total, acciones (editar, ver historial, eliminar)
3. THE Frontend_UI SHALL implementar barra de búsqueda que filtre por nombre, SKU o marca con debounce de 300ms
4. THE Frontend_UI SHALL implementar filtros desplegables: categoría (select), marca (select), rango de precios (min/max inputs), stock bajo (checkbox)
5. THE Frontend_UI SHALL implementar paginación con selector de límite (10, 25, 50 elementos)
6. THE Frontend_UI SHALL mostrar botón "Agregar Producto" que abre modal de formulario
7. THE Frontend_UI SHALL aplicar indicadores visuales: color rojo para stock = 0, amarillo para stock <= 3, verde para stock > 3
8. WHEN se aplican filtros o búsqueda, THE Frontend_UI SHALL actualizar la tabla llamando al endpoint GET /api/inventory con los parámetros correspondientes

### Requirement 16: Panel de Estadísticas en React

**User Story:** Como administrador, quiero ver un resumen visual de estadísticas clave (total productos, valor inventario, stock bajo), para que pueda monitorear el estado general del inventario.

#### Acceptance Criteria

1. THE Frontend_UI SHALL renderizar componente StatsPanel encima de la tabla de inventario
2. THE Frontend_UI SHALL mostrar 4 tarjetas (cards) con: Total Productos Activos, Valor Total del Inventario (con formato de moneda), Productos con Stock Bajo (número), Productos sin Stock (número)
3. THE Frontend_UI SHALL consumir endpoint GET /api/inventory/stats para obtener datos
4. THE Frontend_UI SHALL actualizar estadísticas cuando se carga la vista
5. THE Frontend_UI SHALL mostrar skeleton loaders mientras se cargan datos

### Requirement 17: Modal de Formulario para Crear/Editar Producto

**User Story:** Como administrador, quiero un formulario modal para crear y editar productos con validación, para que pueda gestionar datos sin salir de la vista principal.

#### Acceptance Criteria

1. THE Frontend_UI SHALL renderizar componente ProductFormModal como dialog/modal
2. THE Frontend_UI SHALL mostrar campos: nombre (requerido), SKU (opcional), marca (opcional), categoría (select requerido), audiencia (select requerido), precio de compra (opcional), precio de venta (requerido), colores (input de array), proveedor (opcional), ubicación (opcional), descripción (textarea), estado activo (checkbox)
3. THE Frontend_UI SHALL mostrar sección dinámica de tallas donde se pueden agregar/eliminar filas con: talla (select), stock inicial (number >= 0)
4. THE Frontend_UI SHALL implementar validación en tiempo real: nombre mínimo 3 caracteres, precio de venta > 0, precio de compra >= 0 si presente, stock >= 0
5. WHEN el modal está en modo crear, THE Frontend_UI SHALL llamar POST /api/inventory al guardar
6. WHEN el modal está en modo editar, THE Frontend_UI SHALL llamar PUT /api/inventory/:id al guardar
7. THE Frontend_UI SHALL mostrar mensajes de error de validación junto a los campos correspondientes
8. THE Frontend_UI SHALL cerrar el modal y refrescar la tabla después de guardar exitosamente
9. THE Frontend_UI SHALL mostrar botón "Cancelar" que cierra el modal sin guardar

### Requirement 18: Modal de Historial de Movimientos

**User Story:** Como administrador, quiero ver el historial de cambios de stock de una talla específica, para que pueda auditar operaciones pasadas.

#### Acceptance Criteria

1. THE Frontend_UI SHALL renderizar componente MovementHistoryModal como dialog/modal
2. WHEN se abre el modal con un variantId, THE Frontend_UI SHALL llamar GET /api/inventory/movements/:variantId
3. THE Frontend_UI SHALL mostrar tabla con columnas: fecha/hora, tipo (entrada/salida con badge), cantidad, razón, nota, usuario
4. THE Frontend_UI SHALL ordenar movimientos por fecha descendente (más reciente primero)
5. THE Frontend_UI SHALL mostrar mensaje "No hay movimientos registrados" si el array está vacío
6. THE Frontend_UI SHALL implementar paginación si hay más de 20 movimientos

### Requirement 19: Funcionalidad de Exportación a CSV en Frontend

**User Story:** Como administrador, quiero exportar la vista actual de inventario a CSV, para que pueda descargar los datos filtrados.

#### Acceptance Criteria

1. THE Frontend_UI SHALL mostrar botón "Exportar a CSV" en la vista de inventario
2. WHEN se hace clic en exportar, THE Frontend_UI SHALL llamar GET /api/inventory/export con los filtros actualmente aplicados
3. THE Frontend_UI SHALL iniciar descarga automática del archivo CSV con nombre "inventory-[timestamp].csv"
4. THE Frontend_UI SHALL mostrar indicador de carga durante la generación del CSV
5. IF la exportación falla, THEN THE Frontend_UI SHALL mostrar mensaje de error al usuario

### Requirement 20: Diseño Responsivo y Accesibilidad

**User Story:** Como administrador, quiero que la interfaz sea usable en diferentes dispositivos y accesible, para que pueda gestionar el inventario desde cualquier lugar.

#### Acceptance Criteria

1. THE Frontend_UI SHALL implementar diseño responsivo que funcione en pantallas >= 320px de ancho
2. WHEN la pantalla es menor a 768px, THE Frontend_UI SHALL mostrar tabla en modo card/list en lugar de tabla tradicional
3. THE Frontend_UI SHALL usar contraste de colores que cumplan WCAG AA (mínimo 4.5:1 para texto)
4. THE Frontend_UI SHALL implementar navegación por teclado en formularios y modales
5. THE Frontend_UI SHALL incluir atributos ARIA apropiados en componentes interactivos (aria-label, aria-describedby)
6. THE Frontend_UI SHALL mostrar focus visible en elementos interactivos

### Requirement 21: Manejo de Errores y Estados de Carga

**User Story:** Como administrador, quiero ver indicadores claros de carga y mensajes de error comprensibles, para que entienda el estado del sistema.

#### Acceptance Criteria

1. WHEN se realizan llamadas a la API, THE Frontend_UI SHALL mostrar spinners o skeleton loaders
2. IF una llamada a la API falla, THEN THE Frontend_UI SHALL mostrar mensaje de error legible al usuario
3. THE Frontend_UI SHALL distinguir entre errores de red, errores de validación (400), errores de permisos (401/403) y errores de servidor (500)
4. THE Frontend_UI SHALL mostrar mensajes de confirmación después de operaciones exitosas (crear, actualizar, eliminar)
5. THE Frontend_UI SHALL implementar timeout de 30 segundos para requests y mostrar mensaje si se excede

### Requirement 22: Autenticación y Protección de Rutas

**User Story:** Como sistema, quiero que solo usuarios autenticados accedan al módulo de inventario, para que los datos estén protegidos.

#### Acceptance Criteria

1. THE Frontend_UI SHALL verificar la presencia de token JWT antes de renderizar InventoryListView
2. IF el token no existe o está expirado, THEN THE Frontend_UI SHALL redirigir al usuario a la página de login
3. THE Frontend_UI SHALL incluir el token JWT en el header Authorization de todas las llamadas a endpoints protegidos
4. THE Backend_API SHALL validar el token en todos los endpoints de /api/inventory excepto los endpoints públicos de catálogo
5. IF el token es inválido, THEN THE Backend_API SHALL retornar HTTP 401 con mensaje "Unauthorized"

### Requirement 23: Parsing y Pretty Printing de Datos CSV

**User Story:** Como desarrollador, quiero parsear y generar archivos CSV correctamente, para que la exportación e importación funcionen sin errores.

#### Acceptance Criteria

1. THE Backend_API SHALL implementar CSV_Parser que convierta filas CSV a objetos JavaScript
2. WHEN un campo CSV contiene comas o saltos de línea, THE CSV_Parser SHALL manejar correctamente los campos entre comillas
3. THE Backend_API SHALL implementar CSV_Pretty_Printer que convierta objetos JavaScript a formato CSV válido
4. WHEN un valor contiene comillas, THE CSV_Pretty_Printer SHALL escapar comillas dobles como ""
5. FOR ALL objetos válidos de inventario, parsear el CSV generado y luego pretty-print SHALL producir un CSV equivalente (round-trip property)
6. THE CSV_Parser SHALL manejar correctamente headers y retornar error si faltan columnas requeridas

## Notes

- **Campos extendidos del modelo Product**: brand, colors, purchasePrice, supplier, warehouseLocation se agregan al esquema Prisma existente
- **Relaciones existentes**: Se preservan todas las relaciones actuales (Category, Audience, ProductImage, ProductVariant, InventoryMovement)
- **Autenticación**: Se utiliza el middleware authenticateToken existente en backend/src/middleware/auth.js
- **Frontend stack**: React (se asume setup con Vite o Create React App), llamadas HTTP con fetch o axios
- **Ruta base frontend**: Los componentes React se integrarán en la estructura existente de frontend/
- **Prisma migrations**: Requerirá crear una nueva migración para agregar los campos extendidos al modelo Product
