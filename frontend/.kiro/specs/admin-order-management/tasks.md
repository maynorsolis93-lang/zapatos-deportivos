# Tasks — admin-order-management

## Task List

- [ ] 1. Crear tabla `historial_estados` y migración SQL
  - [ ] 1.1 Crear `admin/db/historial_estados.sql` con CREATE TABLE y ALTER TABLE para añadir 'pagado' al ENUM de pedidos
  - [ ] 1.2 Crear directorio `admin/logs/` con `.gitkeep`

- [ ] 2. Implementar `admin/actualizar_estado.php`
  - [ ] 2.1 Verificar sesión activa; retornar HTTP 401 si no hay sesión
  - [ ] 2.2 Rechazar métodos distintos de POST → HTTP 405
  - [ ] 2.3 Leer y decodificar JSON body; validar `pedido_id` (entero positivo) y `estado` contra whitelist
  - [ ] 2.4 Obtener `estado_anterior` del pedido con prepared statement
  - [ ] 2.5 Validar transición permitida según TRANSICIONES_PERMITIDAS
  - [ ] 2.6 UPDATE `pedidos` SET estado + INSERT en `historial_estados` con prepared statements
  - [ ] 2.7 Incluir `notificar_cliente.php` para envío de email
  - [ ] 2.8 Retornar JSON `{"success": true, "nuevo_estado": "..."}` o errores con códigos HTTP correctos

- [ ] 3. Implementar `admin/notificar_cliente.php`
  - [ ] 3.1 Recibir variables del scope del inclusor: `$pedido_id`, `$nuevo_estado`, `$cliente_email`, `$cliente_nombre`
  - [ ] 3.2 Construir mensaje personalizado según estado (tabla de mensajes del design)
  - [ ] 3.3 Enviar email HTML con `mail()` con remitente `noreply@stepstyle.com` y asunto correcto
  - [ ] 3.4 En caso de fallo, registrar en `admin/logs/email_errors.log` sin interrumpir el flujo

- [ ] 4. Implementar `admin/pedidos.php`
  - [ ] 4.1 Verificar sesión activa; redirigir a `login.html` si no existe
  - [ ] 4.2 Implementar query principal con JOIN usuarios, filtros por estado y búsqueda, paginación 20/página
  - [ ] 4.3 Renderizar tabla con columnas: ID, fecha, cliente, email, total, estado (badge con clase CSS)
  - [ ] 4.4 Implementar controles de filtro por estado (botones/selector) y campo de búsqueda
  - [ ] 4.5 Implementar controles de paginación con preservación de filtros en los enlaces
  - [ ] 4.6 Implementar exportación CSV: cuando `export=csv`, enviar headers y contenido CSV sin paginación
  - [ ] 4.7 Implementar exportación PDF via `window.print()` con `@media print` styles
  - [ ] 4.8 Aplicar estilos de `admin/css/admin.css`; responsive en 768px

- [ ] 5. Implementar `admin/detalle_pedido.php`
  - [ ] 5.1 Verificar sesión activa; redirigir a `login.html` si no existe
  - [ ] 5.2 Cargar datos del pedido, cliente, líneas de detalle e historial de estados con prepared statements
  - [ ] 5.3 Renderizar información del pedido: número, fecha, estado (badge), total
  - [ ] 5.4 Renderizar datos del cliente: nombre, email, teléfono, dirección
  - [ ] 5.5 Renderizar tabla de productos: imagen, nombre, talla, cantidad, precio unitario, subtotal
  - [ ] 5.6 Renderizar historial de estados en orden cronológico descendente
  - [ ] 5.7 Renderizar botones de cambio de estado según TRANSICIONES_PERMITIDAS[estado_actual]
  - [ ] 5.8 Agregar botón "Ver Factura / Boleta" que abre `factura_pedido.php?id=X` en nueva pestaña
  - [ ] 5.9 Aplicar estilos de `admin/css/admin.css`; responsive en 768px

- [ ] 6. Implementar lógica AJAX en `admin/js/admin.js`
  - [ ] 6.1 Implementar `showToast(message, type)` con posición inferior derecha, auto-dismiss 4s, click-dismiss, apilado
  - [ ] 6.2 Implementar `cambiarEstado(pedidoId, nuevoEstado)` con fetch POST a `actualizar_estado.php`
  - [ ] 6.3 En éxito: actualizar badge de estado en UI + mostrar toast success
  - [ ] 6.4 En error: mostrar toast error sin modificar UI

- [ ] 7. Implementar `admin/factura_pedido.php`
  - [ ] 7.1 Verificar sesión activa; redirigir a `login.html` si no existe
  - [ ] 7.2 Cargar datos del pedido con prepared statement; mostrar error si no existe
  - [ ] 7.3 Renderizar factura con: logo/nombre StepStyle, número de pedido, fecha, datos del cliente, tabla de productos, total, estado
  - [ ] 7.4 Incluir estilos inline + `@media print` y botón "Imprimir" que llama `window.print()`

- [ ] 8. Agregar estilos de pedidos a `admin/css/admin.css`
  - [ ] 8.1 Estilos para badges de estado: `.badge-pendiente`, `.badge-pagado`, `.badge-procesando`, `.badge-enviado`, `.badge-entregado`, `.badge-cancelado`
  - [ ] 8.2 Estilos para `.toast-container`, `.toast`, `.toast--success`, `.toast--error`, `.toast--info`
  - [ ] 8.3 Estilos para tabla de pedidos responsive, filtros de estado, controles de paginación
  - [ ] 8.4 Estilos para detalle de pedido: historial de estados, botones de transición, sección de factura

