# Implementation Plan: admin-auth-dashboard

## Overview

Implementación incremental del módulo de autenticación y panel de administración para StepStyle. Se construye de abajo hacia arriba: estructura base → auth backend → dashboard PHP → assets CSS/JS → recuperación de contraseña.

## Tasks

- [ ] 1. Crear estructura de carpetas y tabla `password_resets`
  - Crear directorios `admin/`, `admin/api/`, `admin/css/`, `admin/js/`
  - Crear el script SQL `admin/db/password_resets.sql` con la definición de la tabla `password_resets`
  - _Requirements: 4.4_

- [ ] 2. Implementar autenticación PHP
  - [ ] 2.1 Crear `admin/validar_login.php`
    - Rechazar GET → redirect `login.html`
    - Consulta preparada: `SELECT * FROM usuarios WHERE email = ? AND rol = 'admin'`
    - `password_verify()` contra hash almacenado
    - En éxito: `session_regenerate_id(true)`, guardar `admin_id`, `admin_nombre`, `admin_email` en `$_SESSION`, redirect `dashboard.html`
    - En fallo: redirect `login.html?error=1`
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 3.5_

  - [ ]* 2.2 Escribir property test para autenticación exitosa
    - **Property 2: Autenticación exitosa crea sesión completa**
    - **Validates: Requirements 1.3, 2.2, 2.3, 2.4, 2.5**
    - PHPUnit DataProvider con admins aleatorios; verificar que `$_SESSION` contiene `admin_id`, `admin_nombre`, `admin_email` correctos

  - [ ]* 2.3 Escribir property test para credenciales inválidas
    - **Property 3: Credenciales inválidas no revelan información**
    - **Validates: Requirements 1.4, 2.6**
    - PHPUnit DataProvider con emails inexistentes, passwords incorrectos y usuarios con `rol = 'cliente'`; verificar redirect siempre a `?error=1`

  - [ ] 2.4 Crear `admin/cerrar_sesion.php`
    - `session_start()`, `session_destroy()`, redirect `login.html`
    - _Requirements: 3.3, 3.4_

- [ ] 3. Crear `admin/login.html` con validación client-side
  - Campos `email` (type="email") y `password`, acción POST a `validar_login.php`
  - Enlace de recuperación de contraseña visible
  - Validación JS: email requerido + formato, password requerido; mensajes de error inline
  - Mostrar mensaje de error si URL contiene `?error=1`
  - Aplicar clases de `admin.css` (se enlazará en tarea 7)
  - _Requirements: 1.1, 1.2, 1.4, 1.5, 1.6, 1.7, 1.8_

  - [ ]* 3.1 Escribir property test para validación de formato de email
    - **Property 1: Validación de formato de email**
    - **Validates: Requirements 1.7**
    - fast-check: generar strings sin formato email válido, verificar que la función de validación JS los rechaza antes de submit

- [ ] 4. Implementar flujo de recuperación de contraseña
  - [ ] 4.1 Crear `admin/recuperar_password.html` y `admin/recuperar_password.php`
    - HTML: formulario con campo email
    - PHP POST: buscar usuario con email y `rol = 'admin'`; si existe, generar token `bin2hex(random_bytes(32))`, insertar en `password_resets` con `expires_at = NOW() + INTERVAL 1 HOUR`, enviar email con link
    - Siempre mostrar el mismo mensaje de confirmación
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [ ] 4.2 Crear `admin/restablecer_password.html` y `admin/restablecer_password.php`
    - GET: validar token en DB y que `expires_at > NOW()`; si válido mostrar formulario nueva contraseña; si inválido/expirado mostrar error con enlace para solicitar nuevo
    - POST: validar token nuevamente, `password_hash($nueva, PASSWORD_DEFAULT)`, actualizar `usuarios`, eliminar token de `password_resets`
    - _Requirements: 4.5, 4.6_

  - [ ]* 4.3 Escribir property test para respuesta uniforme de recuperación
    - **Property 5: Recuperación de contraseña — respuesta uniforme**
    - **Validates: Requirements 4.3**
    - PHPUnit DataProvider con emails registrados y no registrados; verificar que el mensaje de respuesta es idéntico en ambos casos

  - [ ]* 4.4 Escribir property test para formato y expiración del token
    - **Property 6: Token de recuperación — formato y expiración**
    - **Validates: Requirements 4.4**
    - PHPUnit: generar N solicitudes de recuperación con emails de admin válidos; verificar que cada token tiene exactamente 64 caracteres hex y `expires_at` está entre NOW()+3595s y NOW()+3605s

  - [ ]* 4.5 Escribir property test para round-trip de contraseña
    - **Property 7: Round-trip de contraseña**
    - **Validates: Requirements 4.6**
    - PHPUnit DataProvider con passwords aleatorias; verificar `password_verify($pass, password_hash($pass, PASSWORD_DEFAULT)) === true`

- [ ] 5. Checkpoint — Verificar autenticación y recuperación
  - Asegurarse de que todos los tests de las tareas 2 y 4 pasan. Consultar al usuario si hay dudas antes de continuar.

- [ ] 6. Implementar `admin/dashboard.html` con PHP inline
  - [ ] 6.1 Agregar session guard al inicio del archivo
    - `session_start()` + verificar `$_SESSION['admin_id']`; si no existe, redirect `login.html`
    - _Requirements: 3.1, 3.2_

  - [ ]* 6.2 Escribir property test para protección de rutas
    - **Property 4: Protección de rutas sin sesión**
    - **Validates: Requirements 3.1, 3.2**
    - PHPUnit: simular requests sin sesión activa; verificar redirect a `login.html` sin contenido renderizado

  - [ ] 6.3 Implementar Sidebar con datos de sesión y navegación
    - `<aside class="sidebar">` con nombre y email del admin desde `$_SESSION`
    - Enlaces a Dashboard, Productos, Pedidos y Cerrar Sesión (`cerrar_sesion.php`)
    - Botón hamburguesa para viewport < 768px (toggle gestionado en admin.js)
    - Resaltar enlace activo con clase CSS
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

  - [ ]* 6.4 Escribir property test para datos del sidebar
    - **Property 13: Sidebar muestra datos del admin autenticado**
    - **Validates: Requirements 9.1**
    - PHPUnit: generar admins con nombre y email aleatorios en sesión; verificar que el HTML renderizado contiene exactamente esos valores

  - [ ] 6.5 Implementar Stats Cards con consultas PHP
    - Cuatro consultas PDO preparadas para: total productos, pedidos pendientes, ventas del día, stock bajo
    - Renderizar `<section class="stats-grid">` con 4 `Stats_Card` (ícono + valor + etiqueta)
    - En error de DB mostrar "—" en lugar del valor
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [ ]* 6.6 Escribir property test para Stats Cards
    - **Property 8: Stats Cards reflejan estado real de la DB**
    - **Validates: Requirements 5.2**
    - PHPUnit: insertar estados de DB aleatorios (N productos, M pedidos, K tallas con stock ≤ 5); verificar que los valores renderizados coinciden con las queries ejecutadas en el mismo instante

  - [ ] 6.7 Implementar Orders Table con PHP
    - Query JOIN `pedidos` + `usuarios`, ORDER BY `fecha_pedido DESC`, LIMIT 10
    - Renderizar `<section class="tables">` con tabla responsive; columnas: ID, cliente, total, estado, fecha
    - Aplicar clase CSS de badge según estado: `.badge-pendiente`, `.badge-procesando`, `.badge-enviado`, `.badge-entregado`, `.badge-cancelado`
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

  - [ ]* 6.8 Escribir property test para Orders Table
    - **Property 10: Orders Table — últimos 10 pedidos ordenados**
    - **Validates: Requirements 7.1, 7.3**
    - PHPUnit DataProvider con N pedidos (0 ≤ N ≤ 50); verificar que se muestran `min(N, 10)` pedidos ordenados por `fecha_pedido DESC`

  - [ ]* 6.9 Escribir property test para badge de estado
    - **Property 11: Badge de estado correcto**
    - **Validates: Requirements 7.2**
    - PHPUnit DataProvider con todos los estados válidos; verificar que el HTML contiene exactamente la clase CSS correspondiente

  - [ ] 6.10 Implementar Critical Stock List con PHP
    - Query JOIN `tallas` + `productos` WHERE `stock <= 5` ORDER BY `stock ASC`
    - Renderizar lista con nombre, talla y stock por cada registro
    - Si no hay registros, mostrar mensaje "Todos los productos tienen stock suficiente"
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

  - [ ]* 6.11 Escribir property test para Critical Stock List
    - **Property 12: Critical Stock List — filtro, datos y orden**
    - **Validates: Requirements 8.1, 8.2, 8.3**
    - PHPUnit: generar tallas con stocks aleatorios; verificar que solo aparecen las de stock ≤ 5, con nombre/talla/stock correctos, ordenadas ASC

  - [ ] 6.12 Agregar `<canvas id="salesChart">` y script de inicialización
    - Incluir Chart.js via CDN
    - Pasar labels y data desde PHP (via `json_encode`) a `admin.js` como variables JS inline
    - _Requirements: 6.1, 6.3_

- [ ] 7. Crear `admin/api/ventas_semanales.php`
  - Endpoint GET que retorna `Content-Type: application/json`
  - Query: ventas agrupadas por día de los últimos 7 días
  - Rellenar con 0 los días sin ventas antes de devolver el JSON
  - Formato: `{"labels": [...], "data": [...]}`
  - _Requirements: 6.1, 6.2, 6.5_

  - [ ]* 7.1 Escribir property test para endpoint de ventas semanales
    - **Property 9: Endpoint de ventas semanales — completitud de 7 días**
    - **Validates: Requirements 6.2, 6.5**
    - PHPUnit: insertar pedidos en fechas aleatorias dentro y fuera del período; verificar que el JSON retorna exactamente 7 entradas con valores correctos y 0 para días sin ventas

- [ ] 8. Crear `admin/css/admin.css`
  - Variables CSS en `:root` para tema oscuro: `--admin-bg`, `--admin-sidebar-bg`, `--admin-card-bg`, `--admin-text`, `--admin-accent`, `--admin-accent-2`
  - Override de variables en `body.light-theme` para tema claro
  - Estilos para: sidebar, topbar, stats-grid, stats-card, sales chart container, orders table, badges de estado, critical stock list
  - Fuentes Google Fonts: Playfair Display + Inter (sin importar `css/styles.css`)
  - Breakpoints responsive: `@media (max-width: 768px)` y `@media (max-width: 1024px)`
  - Sidebar colapsable en mobile; tabla responsive ocultando columnas secundarias en < 768px
  - _Requirements: 9.3, 9.5, 10.1, 10.2, 10.3, 10.4, 10.5, 7.4_

- [ ] 9. Crear `admin/js/admin.js`
  - [ ] 9.1 Implementar `initChart(labels, data)`, `toggleSidebar()`, `toggleTheme()`, `restoreTheme()`, `handleChartError(err)`
    - `initChart`: inicializar Chart.js con colores `--color-primary`, `--color-secondary`, `--color-accent`; envolver en try/catch llamando a `handleChartError`
    - `toggleSidebar`: toggle clase `.sidebar-open` en `<body>`
    - `toggleTheme`: toggle clase `.light-theme` en `<body>` + `localStorage.setItem('admin-theme', ...)`
    - `restoreTheme`: leer `localStorage` al cargar y aplicar clase si corresponde
    - `handleChartError`: mostrar mensaje de error en el contenedor del chart sin re-throw
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 6.4_

  - [ ]* 9.2 Escribir property test para round-trip de tema
    - **Property 14: Round-trip de tema claro/oscuro**
    - **Validates: Requirements 11.3, 11.4**
    - fast-check: generar preferencias `'light'` y `'dark'` aleatoriamente; simular `toggleTheme()` + `restoreTheme()`; verificar que la clase `light-theme` en `<body>` coincide con la preferencia guardada

  - [ ]* 9.3 Escribir property test para manejo de errores del chart
    - **Property 15: Manejo de errores sin excepciones no capturadas**
    - **Validates: Requirements 11.5**
    - fast-check: generar respuestas inválidas (JSON malformado, red caída, null); verificar que `handleChartError` muestra mensaje en UI y no lanza excepciones a `window.onerror`

- [ ] 10. Checkpoint final — Asegurar integración completa
  - Verificar que `login.html` → `validar_login.php` → `dashboard.html` funciona end-to-end con tests automatizados
  - Verificar que el sidebar muestra datos de sesión correctos y el enlace de cerrar sesión funciona
  - Asegurarse de que todos los tests pasan. Consultar al usuario si hay dudas antes de cerrar.

## Notes

- Las tareas marcadas con `*` son opcionales y pueden omitirse para un MVP más rápido
- Backend PHP: PHPUnit con DB de test (SQLite in-memory o MySQL test DB) + eris o DataProviders para property tests
- Frontend JS: Jest + fast-check para propiedades de `admin.js`
- Cada property test debe incluir el comentario: `// Feature: admin-auth-dashboard, Property N: <texto>`
- Todas las consultas DB deben usar PDO con prepared statements (nunca concatenación de strings)
- El módulo admin NO debe importar ni depender de `css/styles.css` del storefront
