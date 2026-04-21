# Requirements Document

## Introduction

Sistema de gestión de pedidos para el panel de administración del e-commerce de calzado StepStyle. Permite a los administradores listar, filtrar, buscar y exportar pedidos; ver el detalle completo de cada pedido (cliente, productos con tallas, historial de estados); cambiar el estado de un pedido mediante AJAX sin recargar la página; y notificar automáticamente al cliente por email cuando su pedido cambia de estado. El módulo vive bajo `/admin` y reutiliza `admin/css/admin.css` y `admin/js/admin.js` del panel existente.

## Glossary

- **Order_Manager**: Módulo PHP que gestiona la lógica de negocio de pedidos en el panel admin.
- **Orders_List**: Página `admin/pedidos.php` que muestra el listado paginado de pedidos con filtros y búsqueda.
- **Order_Detail**: Página `admin/detalle_pedido.php` que muestra la información completa de un pedido individual.
- **Status_Updater**: Script `admin/actualizar_estado.php` que procesa solicitudes AJAX para cambiar el estado de un pedido.
- **Email_Notifier**: Script `admin/notificar_cliente.php` que envía un email al cliente cuando su pedido cambia de estado.
- **Order_Filter**: Componente de filtrado en Orders_List que permite filtrar por estado y buscar por número de pedido o nombre/email de cliente.
- **Status_History**: Registro cronológico de los cambios de estado de un pedido almacenado en la tabla `historial_estados`.
- **Invoice**: Documento HTML/PDF generado a partir de los datos de un pedido que sirve como factura o boleta.
- **Toast_Notification**: Mensaje emergente no bloqueante que aparece en la esquina de la pantalla para confirmar acciones.
- **CSV_Export**: Archivo de texto con valores separados por comas que contiene los datos de los pedidos filtrados.
- **PDF_Export**: Documento PDF generado con los datos de los pedidos filtrados.
- **Admin**: Usuario con `rol = 'admin'` autenticado mediante Session activa.
- **Session**: Sesión PHP activa que identifica al Admin autenticado.
- **Pedido**: Registro en la tabla `pedidos` con campos `id`, `usuario_id`, `total`, `estado`, `fecha_pedido`.
- **Detalle_Pedido**: Registro en la tabla `detalle_pedido` con campos `id`, `pedido_id`, `producto_id`, `talla`, `cantidad`, `precio_unitario`.
- **Estado**: Valor del campo `estado` en la tabla `pedidos`; puede ser: `pendiente`, `pagado`, `procesando`, `enviado`, `entregado`, `cancelado`.
- **Admin_CSS**: Hoja de estilos en `admin/css/admin.css`.
- **Admin_JS**: Script en `admin/js/admin.js`.

---

## Requirements

### Requirement 1: Listado de pedidos

**User Story:** As an admin, I want to see a paginated list of all orders with key information, so that I can get a quick overview of the store's orders.

#### Acceptance Criteria

1. THE Orders_List SHALL estar disponible en `admin/pedidos.php` y requerir una Session activa de Admin para acceder.
2. IF no existe una Session activa al cargar Orders_List, THEN THE Order_Manager SHALL redirigir al Admin a `admin/login.html`.
3. THE Orders_List SHALL mostrar una tabla con las columnas: número de pedido (`id`), fecha (`fecha_pedido`), nombre del cliente, email del cliente, total y estado.
4. THE Orders_List SHALL mostrar el estado de cada Pedido como un badge con color diferenciado: `pendiente` (amarillo), `pagado` (azul claro), `procesando` (azul), `enviado` (verde), `entregado` (verde oscuro), `cancelado` (rojo).
5. THE Orders_List SHALL paginar los resultados mostrando 20 pedidos por página.
6. THE Orders_List SHALL mostrar controles de paginación (anterior, siguiente, número de página actual y total de páginas).
7. WHEN el Admin hace clic en una fila de la tabla, THE Orders_List SHALL navegar a Order_Detail pasando el `id` del Pedido como parámetro GET.
8. THE Orders_List SHALL aplicar los estilos definidos en Admin_CSS y ser responsive con breakpoints en 768px.

---

### Requirement 2: Filtros y búsqueda de pedidos

**User Story:** As an admin, I want to filter orders by status and search by order number or customer, so that I can quickly find specific orders.

#### Acceptance Criteria

1. THE Order_Filter SHALL mostrar botones o un selector para filtrar por Estado: Todos, `pendiente`, `pagado`, `procesando`, `enviado`, `entregado`, `cancelado`.
2. WHEN el Admin selecciona un Estado en Order_Filter, THE Orders_List SHALL recargar mostrando únicamente los Pedidos con ese Estado.
3. THE Order_Filter SHALL mostrar un campo de búsqueda de texto libre.
4. WHEN el Admin ingresa texto en el campo de búsqueda, THE Orders_List SHALL filtrar los Pedidos cuyo `id` coincida exactamente o cuyo nombre o email de cliente contenga el texto ingresado (búsqueda parcial, case-insensitive).
5. WHEN se aplica un filtro de Estado y una búsqueda simultáneamente, THE Orders_List SHALL aplicar ambos criterios de forma combinada (AND lógico).
6. THE Order_Filter SHALL preservar los filtros activos al paginar (los parámetros de filtro se incluyen en los enlaces de paginación).
7. IF la búsqueda o filtro no retorna resultados, THE Orders_List SHALL mostrar un mensaje indicando que no se encontraron pedidos con los criterios aplicados.

---

### Requirement 3: Exportación de pedidos

**User Story:** As an admin, I want to export the current filtered list of orders to CSV and PDF, so that I can share or archive order data.

#### Acceptance Criteria

1. THE Orders_List SHALL mostrar un botón "Exportar CSV" y un botón "Exportar PDF" visibles en la interfaz.
2. WHEN el Admin hace clic en "Exportar CSV", THE Order_Manager SHALL generar un CSV_Export con los mismos pedidos del filtro activo (sin paginación) y descargarlo en el navegador con el nombre `pedidos_YYYY-MM-DD.csv`.
3. THE CSV_Export SHALL incluir las columnas: ID, Fecha, Cliente, Email, Total, Estado.
4. THE CSV_Export SHALL incluir una fila de encabezado con los nombres de columna.
5. WHEN el Admin hace clic en "Exportar PDF", THE Order_Manager SHALL generar un PDF_Export con los mismos pedidos del filtro activo y descargarlo con el nombre `pedidos_YYYY-MM-DD.pdf`.
6. THE PDF_Export SHALL incluir el logo o nombre de StepStyle, la fecha de generación, y una tabla con las columnas: ID, Fecha, Cliente, Total, Estado.
7. THE Order_Manager SHALL implementar la generación de PDF_Export usando una librería PHP compatible (TCPDF o FPDF) o mediante impresión HTML con `window.print()` como alternativa.

---

### Requirement 4: Detalle completo del pedido

**User Story:** As an admin, I want to see the full details of an order, so that I can review all information before taking action.

#### Acceptance Criteria

1. THE Order_Detail SHALL estar disponible en `admin/detalle_pedido.php` y requerir una Session activa de Admin para acceder.
2. IF no existe una Session activa al cargar Order_Detail, THEN THE Order_Manager SHALL redirigir al Admin a `admin/login.html`.
3. WHEN Order_Detail carga con un `id` de Pedido válido en el parámetro GET, THE Order_Manager SHALL consultar la DB y mostrar los datos completos del Pedido.
4. THE Order_Detail SHALL mostrar la información del Pedido: número de pedido, fecha, estado actual, total y subtotales.
5. THE Order_Detail SHALL mostrar los datos del cliente: nombre, email y, si están disponibles, dirección y teléfono.
6. THE Order_Detail SHALL mostrar la lista de productos comprados con las columnas: imagen del producto, nombre, talla, cantidad, precio unitario y subtotal por línea.
7. THE Order_Detail SHALL mostrar el Status_History del Pedido en orden cronológico descendente, indicando el estado anterior, el estado nuevo, la fecha/hora del cambio y el Admin que realizó el cambio.
8. IF el parámetro `id` en la URL no corresponde a un Pedido existente, THEN THE Order_Manager SHALL mostrar un mensaje de error y un enlace para volver a Orders_List.
9. THE Order_Detail SHALL aplicar los estilos definidos en Admin_CSS y ser responsive con breakpoints en 768px.

---

### Requirement 5: Cambio de estado del pedido (AJAX)

**User Story:** As an admin, I want to change the status of an order without reloading the page, so that I can manage orders efficiently.

#### Acceptance Criteria

1. THE Order_Detail SHALL mostrar botones de acción para cambiar el Estado del Pedido a los estados válidos siguientes según el flujo: `pendiente` → `pagado` → `procesando` → `enviado` → `entregado`; y `cancelado` disponible desde cualquier estado excepto `entregado`.
2. WHEN el Admin hace clic en un botón de cambio de Estado, THE Admin_JS SHALL enviar una solicitud AJAX (fetch) a Status_Updater con el `pedido_id` y el nuevo `estado`.
3. THE Status_Updater SHALL estar implementado en `admin/actualizar_estado.php` y procesar únicamente solicitudes POST con `Content-Type: application/json`.
4. WHEN Status_Updater recibe una solicitud válida, THE Order_Manager SHALL actualizar el campo `estado` en la tabla `pedidos` usando prepared statements.
5. WHEN Status_Updater recibe una solicitud válida, THE Order_Manager SHALL insertar un registro en la tabla `historial_estados` con: `pedido_id`, `estado_anterior`, `estado_nuevo`, `admin_id`, `fecha_cambio` (TIMESTAMP).
6. WHEN la actualización es exitosa, THE Status_Updater SHALL retornar una respuesta JSON con `{"success": true, "nuevo_estado": "..."}`.
7. IF la solicitud a Status_Updater no incluye `pedido_id` o `estado` válidos, THEN THE Status_Updater SHALL retornar `{"success": false, "error": "Datos inválidos"}` con HTTP 400.
8. IF el `estado` recibido no es uno de los valores permitidos del Enum, THEN THE Status_Updater SHALL retornar `{"success": false, "error": "Estado no válido"}` con HTTP 422.
9. WHEN la actualización es exitosa, THE Admin_JS SHALL actualizar el badge de estado en la UI sin recargar la página y mostrar una Toast_Notification de confirmación.
10. IF la solicitud AJAX falla, THEN THE Admin_JS SHALL mostrar una Toast_Notification de error sin modificar la UI.

---

### Requirement 6: Notificación por email al cliente

**User Story:** As an admin, I want the customer to be notified by email when their order status changes, so that they stay informed about their purchase.

#### Acceptance Criteria

1. THE Email_Notifier SHALL estar implementado en `admin/notificar_cliente.php` y ser invocado por Status_Updater tras cada cambio de estado exitoso.
2. WHEN Status_Updater actualiza el estado de un Pedido, THE Email_Notifier SHALL enviar un email al email del cliente asociado al Pedido.
3. THE Email_Notifier SHALL usar la función `mail()` de PHP o PHPMailer para el envío, con soporte para contenido HTML.
4. THE Email_Notifier SHALL incluir en el email: número de pedido, nuevo estado, fecha del cambio y un mensaje personalizado según el Estado (ej. "Tu pedido ha sido enviado y está en camino").
5. THE Email_Notifier SHALL usar el nombre del cliente en el saludo del email.
6. IF el envío del email falla, THEN THE Email_Notifier SHALL registrar el error en un archivo de log (`admin/logs/email_errors.log`) sin interrumpir la respuesta de Status_Updater al cliente.
7. THE Email_Notifier SHALL enviar el email con remitente `noreply@stepstyle.com` y asunto `"StepStyle - Actualización de tu pedido #[id]"`.

---

### Requirement 7: Historial de estados (tabla DB)

**User Story:** As a developer, I want a database table to track all order status changes, so that there is a complete audit trail of order history.

#### Acceptance Criteria

1. THE DB SHALL contener la tabla `historial_estados` con las columnas: `id` (PK autoincrement), `pedido_id` (FK → pedidos.id ON DELETE CASCADE), `estado_anterior` (ENUM de estados), `estado_nuevo` (ENUM de estados), `admin_id` (FK → usuarios.id), `fecha_cambio` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP).
2. WHEN se elimina un Pedido, THE DB SHALL eliminar en cascada los registros asociados en `historial_estados`.
3. THE Order_Manager SHALL usar prepared statements para todas las operaciones de INSERT y SELECT sobre `historial_estados`.
4. THE DB SHALL incluir el estado `pagado` en el ENUM de `pedidos.estado` y en los ENUMs de `historial_estados.estado_anterior` y `historial_estados.estado_nuevo`, además de los estados ya definidos: `pendiente`, `procesando`, `enviado`, `entregado`, `cancelado`.

---

### Requirement 8: Factura / Boleta del pedido

**User Story:** As an admin, I want to generate and print an invoice for an order, so that I can provide proof of purchase to the customer.

#### Acceptance Criteria

1. THE Order_Detail SHALL mostrar un botón "Ver Factura / Boleta" que abre la Invoice en una nueva pestaña o ventana del navegador.
2. THE Invoice SHALL estar disponible en `admin/factura_pedido.php?id=[pedido_id]` y requerir Session activa de Admin.
3. THE Invoice SHALL mostrar: logo o nombre de StepStyle, número de pedido, fecha, datos del cliente (nombre y email), tabla de productos (nombre, talla, cantidad, precio unitario, subtotal), total del pedido y estado actual.
4. THE Invoice SHALL incluir estilos CSS inline u hoja de estilos de impresión (`@media print`) para que se vea correctamente al imprimir o guardar como PDF desde el navegador.
5. IF el `id` de la Invoice no corresponde a un Pedido existente, THEN THE Order_Manager SHALL mostrar un mensaje de error en la página de Invoice.

---

### Requirement 9: Toast Notifications y UX en tiempo real

**User Story:** As an admin, I want visual feedback when I perform actions, so that I know whether operations succeeded or failed.

#### Acceptance Criteria

1. THE Admin_JS SHALL implementar una función `showToast(message, type)` donde `type` puede ser `success`, `error` o `info`.
2. WHEN se muestra una Toast_Notification, THE Admin_JS SHALL posicionarla en la esquina inferior derecha de la pantalla con animación de entrada y salida.
3. THE Toast_Notification SHALL desaparecer automáticamente después de 4 segundos sin interacción del usuario.
4. WHEN el usuario hace clic en una Toast_Notification, THE Admin_JS SHALL descartarla inmediatamente.
5. THE Admin_JS SHALL permitir mostrar múltiples Toast_Notification apiladas simultáneamente sin que se superpongan.
6. THE Toast_Notification SHALL aplicar colores diferenciados: verde para `success`, rojo para `error`, azul para `info`, usando las variables CSS de Admin_CSS.

---

### Requirement 10: Seguridad del módulo de pedidos

**User Story:** As a developer, I want all order management endpoints to be secure, so that only authenticated admins can access or modify order data.

#### Acceptance Criteria

1. THE Order_Manager SHALL verificar la existencia de una Session activa de Admin al inicio de cada script PHP del módulo (`pedidos.php`, `detalle_pedido.php`, `actualizar_estado.php`, `notificar_cliente.php`, `factura_pedido.php`).
2. THE Order_Manager SHALL usar prepared statements con parámetros enlazados en todas las consultas SQL que reciban datos externos (GET, POST, JSON body).
3. THE Order_Manager SHALL sanitizar todos los valores de salida HTML usando `htmlspecialchars()` para prevenir XSS.
4. THE Status_Updater SHALL validar que el `pedido_id` recibido sea un entero positivo antes de ejecutar cualquier consulta.
5. THE Status_Updater SHALL validar que el `estado` recibido pertenezca al conjunto de valores permitidos: `pendiente`, `pagado`, `procesando`, `enviado`, `entregado`, `cancelado`.
6. THE Order_Manager SHALL incluir el archivo `includes/conexion.php` del backend existente para reutilizar la conexión PDO.
