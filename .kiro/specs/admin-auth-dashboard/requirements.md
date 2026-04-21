# Requirements Document

## Introduction

Sistema de autenticación y panel de administración para el e-commerce de calzado StepStyle. Provee una interfaz segura de login para administradores, un dashboard con métricas clave del negocio (productos, pedidos, ventas, stock), visualización de ventas semanales con Chart.js y gestión rápida de pedidos y stock crítico. El módulo vive bajo la carpeta `/admin` con su propio CSS y JS, manteniendo la identidad visual de StepStyle (tema oscuro/claro profesional).

## Glossary

- **Admin**: Usuario registrado en la DB con `rol = 'admin'` que tiene acceso al panel de administración.
- **Auth_System**: Módulo PHP que valida credenciales, gestiona sesiones y controla el acceso al dashboard.
- **Login_Form**: Formulario HTML en `admin/login.html` que captura email y contraseña del Admin.
- **Dashboard**: Página `admin/dashboard.html` que muestra métricas, gráficas y resúmenes operativos.
- **Session**: Sesión PHP activa que identifica a un Admin autenticado.
- **Stats_Card**: Componente visual del Dashboard que muestra una métrica clave con ícono y valor numérico.
- **Sales_Chart**: Gráfica de líneas/barras renderizada con Chart.js que muestra ventas de los últimos 7 días.
- **Orders_Table**: Tabla resumen de los últimos pedidos con estado, cliente y total.
- **Critical_Stock_List**: Lista de productos cuyo stock total es menor o igual a 5 unidades.
- **Password_Recovery**: Flujo de recuperación de contraseña por email para el Admin.
- **Admin_CSS**: Hoja de estilos en `admin/css/admin.css` exclusiva del módulo de administración.
- **Admin_JS**: Script en `admin/js/admin.js` que gestiona interactividad del Dashboard.
- **Sidebar**: Panel de navegación lateral del Dashboard con enlaces a secciones del admin.

---

## Requirements

### Requirement 1: Página de login del administrador

**User Story:** As an admin, I want a secure login page, so that I can authenticate and access the dashboard.

#### Acceptance Criteria

1. THE Login_Form SHALL estar disponible en `admin/login.html` con campos de email y contraseña.
2. THE Login_Form SHALL incluir un enlace de recuperación de contraseña visible en la página.
3. WHEN el Admin envía el Login_Form con email y contraseña válidos, THE Auth_System SHALL iniciar una Session y redirigir al Dashboard.
4. WHEN el Admin envía el Login_Form con credenciales inválidas, THE Auth_System SHALL mostrar un mensaje de error genérico sin revelar si el email o la contraseña son incorrectos.
5. IF el campo de email está vacío al enviar el Login_Form, THEN THE Login_Form SHALL mostrar un mensaje de validación indicando que el email es requerido.
6. IF el campo de contraseña está vacío al enviar el Login_Form, THEN THE Login_Form SHALL mostrar un mensaje de validación indicando que la contraseña es requerida.
7. IF el email ingresado no tiene formato válido, THEN THE Login_Form SHALL mostrar un mensaje de validación de formato antes de enviar al servidor.
8. THE Login_Form SHALL aplicar los estilos definidos en Admin_CSS con el tema visual de StepStyle.

---

### Requirement 2: Autenticación PHP segura

**User Story:** As a developer, I want a secure PHP authentication backend, so that only valid admins can access the dashboard.

#### Acceptance Criteria

1. THE Auth_System SHALL estar implementado en `admin/validar_login.php` y procesar únicamente solicitudes POST.
2. WHEN se recibe una solicitud POST, THE Auth_System SHALL consultar la DB buscando un Usuario con el email recibido y `rol = 'admin'`.
3. THE Auth_System SHALL verificar la contraseña usando `password_verify()` contra el hash almacenado en la DB.
4. WHEN la autenticación es exitosa, THE Auth_System SHALL almacenar en Session el `id`, `nombre` y `email` del Admin.
5. WHEN la autenticación es exitosa, THE Auth_System SHALL redirigir al Admin a `dashboard.html` usando `header('Location: ...')`.
6. IF la autenticación falla, THEN THE Auth_System SHALL redirigir al Login_Form con un parámetro de error en la URL.
7. THE Auth_System SHALL usar consultas preparadas (prepared statements) para prevenir inyección SQL.
8. IF se recibe una solicitud GET a `validar_login.php`, THEN THE Auth_System SHALL redirigir al Login_Form sin procesar datos.

---

### Requirement 3: Protección de rutas del dashboard

**User Story:** As a developer, I want all admin pages to be protected, so that unauthenticated users cannot access the dashboard.

#### Acceptance Criteria

1. THE Dashboard SHALL verificar al inicio de cada carga que existe una Session activa con datos de Admin.
2. IF no existe una Session activa al cargar el Dashboard, THEN THE Auth_System SHALL redirigir al Login_Form inmediatamente.
3. THE Auth_System SHALL implementar `admin/cerrar_sesion.php` que destruya la Session activa y redirija al Login_Form.
4. WHEN el Admin activa el enlace de cerrar sesión en el Sidebar, THE Auth_System SHALL ejecutar `cerrar_sesion.php`.
5. THE Auth_System SHALL regenerar el ID de sesión tras una autenticación exitosa para prevenir session fixation.

---

### Requirement 4: Recuperación de contraseña

**User Story:** As an admin, I want to recover my password via email, so that I can regain access if I forget my credentials.

#### Acceptance Criteria

1. THE Password_Recovery SHALL mostrar un formulario con campo de email cuando el Admin activa el enlace de recuperación en el Login_Form.
2. WHEN el Admin envía el formulario de recuperación con un email registrado como admin, THE Password_Recovery SHALL enviar un correo con un enlace de restablecimiento de un solo uso.
3. WHEN el Admin envía el formulario de recuperación con un email no registrado, THE Password_Recovery SHALL mostrar el mismo mensaje de confirmación que para un email válido (sin revelar si existe).
4. THE Password_Recovery SHALL generar un token único usando `bin2hex(random_bytes(32))` y almacenarlo en la DB con una expiración de 1 hora.
5. IF el Admin accede al enlace de restablecimiento con un token expirado o inválido, THEN THE Password_Recovery SHALL mostrar un mensaje de error y ofrecer solicitar un nuevo enlace.
6. WHEN el Admin establece una nueva contraseña válida, THE Password_Recovery SHALL almacenarla como hash usando `password_hash()` con `PASSWORD_DEFAULT`.

---

### Requirement 5: Dashboard — Stats Cards

**User Story:** As an admin, I want to see key business metrics at a glance, so that I can monitor the store's performance quickly.

#### Acceptance Criteria

1. THE Dashboard SHALL mostrar 4 Stats_Card con las métricas: Total de productos en catálogo, Pedidos pendientes, Ventas del día (suma de totales de pedidos con `fecha_pedido` = hoy), Stock bajo (productos con al menos una Talla con stock ≤ 5).
2. WHEN el Dashboard carga, THE Stats_Card SHALL obtener sus valores desde el backend PHP mediante una consulta a la DB.
3. THE Stats_Card SHALL mostrar un ícono representativo, el valor numérico y una etiqueta descriptiva para cada métrica.
4. THE Stats_Card SHALL aplicar los estilos definidos en Admin_CSS con el tema visual de StepStyle.

---

### Requirement 6: Dashboard — Gráfica de ventas semanales

**User Story:** As an admin, I want to see a weekly sales chart, so that I can identify trends and patterns in revenue.

#### Acceptance Criteria

1. THE Sales_Chart SHALL renderizarse en el Dashboard usando Chart.js (versión CDN).
2. THE Sales_Chart SHALL mostrar los totales de ventas de los últimos 7 días, agrupados por día.
3. WHEN el Dashboard carga, THE Admin_JS SHALL obtener los datos de ventas desde un endpoint PHP y renderizar el Sales_Chart.
4. THE Sales_Chart SHALL usar los colores de la paleta de StepStyle (`--color-primary`, `--color-secondary`, `--color-accent`).
5. IF no existen ventas en algún día del período, THE Sales_Chart SHALL mostrar ese día con valor 0.

---

### Requirement 7: Dashboard — Tabla de últimos pedidos

**User Story:** As an admin, I want to see a summary of recent orders, so that I can quickly review and manage pending orders.

#### Acceptance Criteria

1. THE Orders_Table SHALL mostrar los últimos 10 pedidos con las columnas: ID de pedido, nombre del cliente, total, estado y fecha.
2. THE Orders_Table SHALL aplicar un color de badge diferente por estado: pendiente (amarillo), procesando (azul), enviado (verde), entregado (verde oscuro), cancelado (rojo).
3. WHEN el Dashboard carga, THE Orders_Table SHALL obtener los datos desde el backend PHP.
4. THE Orders_Table SHALL ser responsive y adaptarse a pantallas menores a 768px ocultando columnas secundarias.

---

### Requirement 8: Dashboard — Lista de stock crítico

**User Story:** As an admin, I want to see products with critical stock levels, so that I can restock before running out.

#### Acceptance Criteria

1. THE Critical_Stock_List SHALL mostrar los productos que tengan al menos una Talla con stock ≤ 5 unidades.
2. THE Critical_Stock_List SHALL mostrar para cada producto: nombre, talla afectada y cantidad de stock actual.
3. THE Critical_Stock_List SHALL ordenar los productos de menor a mayor stock.
4. IF no existen productos con stock crítico, THE Critical_Stock_List SHALL mostrar un mensaje indicando que todos los productos tienen stock suficiente.

---

### Requirement 9: Sidebar de navegación del dashboard

**User Story:** As an admin, I want a navigation sidebar, so that I can move between different sections of the admin panel.

#### Acceptance Criteria

1. THE Sidebar SHALL mostrar el nombre y email del Admin autenticado obtenidos desde la Session.
2. THE Sidebar SHALL incluir enlaces de navegación a las secciones: Dashboard (inicio), Productos, Pedidos, y Cerrar Sesión.
3. WHEN el viewport es menor a 768px, THE Sidebar SHALL colapsar y mostrar un botón de menú hamburguesa para expandirlo.
4. THE Sidebar SHALL resaltar visualmente el enlace de la sección activa.
5. THE Sidebar SHALL aplicar los estilos definidos en Admin_CSS con el tema oscuro de StepStyle.

---

### Requirement 10: Estilos CSS del módulo admin

**User Story:** As a developer, I want a dedicated CSS file for the admin module, so that admin styles are isolated from the public storefront.

#### Acceptance Criteria

1. THE Admin_CSS SHALL estar en `admin/css/admin.css` y NO importar ni depender de `css/styles.css` del Storefront.
2. THE Admin_CSS SHALL definir variables CSS propias: `--admin-bg`, `--admin-sidebar-bg`, `--admin-card-bg`, `--admin-text`, `--admin-accent` usando los colores de StepStyle como base.
3. THE Admin_CSS SHALL proveer un tema oscuro por defecto con opción de tema claro activable mediante una clase CSS en el elemento `<body>`.
4. THE Admin_CSS SHALL usar las mismas fuentes Google Fonts (Playfair Display + Inter) que el Storefront.
5. THE Admin_CSS SHALL aplicar estilos responsive con breakpoints en 768px y 1024px.

---

### Requirement 11: JavaScript del módulo admin

**User Story:** As a developer, I want a dedicated JS file for the admin module, so that admin logic is isolated and maintainable.

#### Acceptance Criteria

1. THE Admin_JS SHALL estar en `admin/js/admin.js` y gestionar la inicialización del Sales_Chart, el toggle del Sidebar y el toggle de tema claro/oscuro.
2. WHEN el DOM del Dashboard está listo, THE Admin_JS SHALL inicializar el Sales_Chart con los datos provistos por el backend.
3. THE Admin_JS SHALL implementar el toggle de tema claro/oscuro guardando la preferencia en `localStorage`.
4. WHEN el Admin recarga el Dashboard, THE Admin_JS SHALL restaurar el tema guardado en `localStorage`.
5. THE Admin_JS SHALL manejar errores de carga de datos mostrando un mensaje en la UI sin lanzar excepciones no capturadas.
