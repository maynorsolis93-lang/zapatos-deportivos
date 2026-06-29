# 🎛️ Panel Administrativo - Calzados Hermanos Solis

Panel de administración completo para gestionar el inventario, productos, pedidos y catálogo de la tienda.

---

## 📋 Tabla de Contenidos

- [Características](#características)
- [Vistas Disponibles](#vistas-disponibles)
- [Instalación](#instalación)
- [Uso](#uso)
- [APIs Consumidas](#apis-consumidas)
- [Credenciales de Acceso](#credenciales-de-acceso)
- [Estructura de Archivos](#estructura-de-archivos)

---

## ✨ Características

### 🔐 Autenticación
- Login seguro con JWT
- Sesión persistente (localStorage)
- Cierre de sesión
- Protección de rutas

### 📊 Dashboard
- Estadísticas en tiempo real
- Total de productos
- Stock total disponible
- Pedidos pendientes
- Alertas de stock bajo
- Lista de productos con stock bajo
- Pedidos recientes

### 👟 Gestión de Productos
- Listado completo de productos
- Búsqueda de productos
- Ver detalles de producto
- Editar productos
- Ver stock por talla
- Estado activo/inactivo

### 📦 Inventario
- Historial de movimientos
- Filtros por tipo (entrada, salida, ajuste)
- Exportar datos
- Trazabilidad completa
- Usuario que realizó el movimiento

### 🛒 Gestión de Pedidos
- Listado de pedidos
- Filtros por estado
- Ver detalles completos
- Confirmar pedidos (descuenta stock)
- Cancelar pedidos (libera stock)
- Historial de estados

### ⚠️ Alertas de Stock
- Productos con stock bajo (≤ 5 unidades)
- Productos sin stock
- Alertas en tiempo real
- Badge de notificaciones

### 🌐 Catálogo Público
- Vista previa del catálogo
- Filtros por audiencia y tipo
- Misma vista que los clientes
- Verificación de datos públicos

---

## 🖥️ Vistas Disponibles

### 1. Dashboard
**Ruta:** `#dashboard`

Muestra estadísticas generales y resúmenes:
- 4 tarjetas de estadísticas principales
- Lista de productos con stock bajo
- Pedidos recientes

### 2. Productos
**Ruta:** `#products`

Gestión completa de productos:
- Tabla con todos los productos
- Búsqueda por nombre
- Ver imagen, categoría, audiencia, precio
- Stock total por producto
- Estado activo/inactivo
- Acciones: Ver, Editar

### 3. Inventario
**Ruta:** `#inventory`

Historial de movimientos:
- Tabla de movimientos
- Filtro por tipo (entrada, salida, ajuste)
- Fecha, producto, talla, cantidad
- Razón del movimiento
- Usuario responsable
- Exportar datos

### 4. Pedidos
**Ruta:** `#orders`

Gestión de pedidos:
- Tabla de pedidos
- Filtro por estado
- Cliente, teléfono, total
- Estado con badge de color
- Fecha de creación
- Acciones: Ver, Confirmar

**Modal de Detalles:**
- Información del cliente
- Lista de productos
- Cantidades y precios
- Total del pedido
- Botones de acción (Confirmar/Cancelar)

### 5. Alertas
**Ruta:** `#alerts`

Alertas de inventario:
- **Stock Bajo:** Productos con ≤ 5 unidades
- **Sin Stock:** Productos con 0 unidades
- Nombre del producto
- Stock disponible
- Badge de alerta

### 6. Catálogo Público
**Ruta:** `#catalog`

Vista previa del catálogo:
- Grid de productos
- Filtros por audiencia y tipo
- Imagen, nombre, categoría
- Precio y tallas disponibles
- Badge (Nuevo, Oferta, etc.)

---

## 🚀 Instalación

### Requisitos Previos
- Backend corriendo en `http://localhost:3000`
- Base de datos PostgreSQL configurada
- Usuario administrador creado

### Pasos

1. **Clonar el repositorio** (si aún no lo has hecho):
```bash
git clone <tu-repositorio>
cd kiro-shoes
```

2. **Abrir el panel admin:**
```bash
# Opción 1: Servidor local (recomendado)
# Usar Live Server de VS Code o cualquier servidor local

# Opción 2: Abrir directamente
# Navegar a: file:///ruta/a/kiro-shoes/admin/index.html
```

3. **Configurar la URL de la API:**

Editar `admin/js/admin.js` línea 10:
```javascript
const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3000/api'
  : 'https://tu-backend-produccion.vercel.app/api';
```

---

## 📖 Uso

### 1. Iniciar Sesión

**URL:** `http://localhost:5173/admin/` (o tu servidor local)

**Credenciales por defecto:**
- Email: `maymesm@yahoo.com`
- Contraseña: `Solislidia123`

### 2. Navegar por las Vistas

Usar el menú lateral para cambiar entre vistas:
- 📊 Dashboard
- 👟 Productos
- 📦 Inventario
- 🛒 Pedidos
- ⚠️ Alertas
- 🌐 Catálogo Público

### 3. Gestionar Pedidos

**Ver Pedido:**
1. Ir a "Pedidos"
2. Click en "Ver" en cualquier pedido
3. Se abre modal con detalles completos

**Confirmar Pedido:**
1. Abrir detalles del pedido
2. Click en "Confirmar Pedido"
3. Confirmar la acción
4. El stock se descuenta permanentemente

**Cancelar Pedido:**
1. Abrir detalles del pedido
2. Click en "Cancelar Pedido"
3. Confirmar la acción
4. El stock reservado se libera

### 4. Monitorear Alertas

**Ver Alertas:**
1. Ir a "Alertas"
2. Ver productos con stock bajo
3. Ver productos sin stock
4. Badge en el menú muestra cantidad de alertas

### 5. Verificar Catálogo Público

**Vista Previa:**
1. Ir a "Catálogo Público"
2. Aplicar filtros (audiencia, tipo)
3. Ver cómo se muestran los productos a los clientes

---

## 🔌 APIs Consumidas

### Autenticación
- `POST /api/auth/login` - Iniciar sesión

### Dashboard
- `GET /api/admin/dashboard` - Estadísticas generales
- `GET /api/inventory/low-stock?threshold=5` - Stock bajo
- `GET /api/orders?status=pending&limit=5` - Pedidos recientes

### Productos
- `GET /api/products` - Listar productos
- `GET /api/products/:id` - Ver producto
- `PUT /api/products/:id` - Editar producto

### Inventario
- `GET /api/inventory/movements` - Historial de movimientos
- `GET /api/inventory/movements?type=entry` - Filtrar por tipo
- `GET /api/inventory/low-stock` - Productos con stock bajo
- `GET /api/inventory/out-of-stock` - Productos sin stock

### Pedidos
- `GET /api/orders` - Listar pedidos
- `GET /api/orders?status=pending` - Filtrar por estado
- `GET /api/orders/:id` - Ver pedido
- `POST /api/orders/:id/confirm` - Confirmar pedido
- `POST /api/orders/:id/cancel` - Cancelar pedido

### Catálogo Público
- `GET /api/catalog/products` - Catálogo público
- `GET /api/catalog/products?persona=caballeros` - Filtrar por audiencia
- `GET /api/catalog/products?tipo=deportivos` - Filtrar por tipo
- `GET /api/catalog/categories` - Categorías
- `GET /api/catalog/audiences` - Audiencias

---

## 🔑 Credenciales de Acceso

### Usuario Administrador

**Email:** `maymesm@yahoo.com`  
**Contraseña:** `Solislidia123`

**Permisos:**
- Acceso completo al panel
- Ver todos los productos
- Gestionar inventario
- Confirmar/cancelar pedidos
- Ver alertas
- Acceso a todas las vistas

### Crear Nuevo Usuario Admin

```bash
cd backend
node scripts/create-bcrypt-admin.js
```

Seguir las instrucciones en pantalla.

---

## 📁 Estructura de Archivos

```
admin/
├── index.html          # Página principal del panel
├── css/
│   └── admin.css      # Estilos del panel (variables, componentes, responsive)
├── js/
│   └── admin.js       # Lógica principal (API, vistas, eventos)
└── README.md          # Esta documentación
```

### Archivos Principales

#### `index.html`
- Estructura HTML del panel
- Login screen
- Dashboard layout
- Sidebar navigation
- Todas las vistas (dashboard, productos, inventario, etc.)
- Modals (producto, pedido)

#### `css/admin.css`
- Variables CSS (colores, espaciado, sombras)
- Login screen styles
- Dashboard layout (sidebar, main content)
- Componentes (cards, tables, forms, buttons)
- Modals y overlays
- Responsive design
- Utilities

#### `js/admin.js`
- Configuración de API
- State management
- Funciones de autenticación
- Gestión de vistas
- Carga de datos (dashboard, productos, inventario, pedidos, alertas, catálogo)
- Renderizado de tablas y listas
- Event listeners
- Utilidades (loading, errors, success)

---

## 🎨 Diseño

### Paleta de Colores

```css
--primary: #1a1a2e      /* Negro principal */
--secondary: #e94560    /* Rojo acento */
--accent: #c8a96e       /* Dorado */
--success: #10b981      /* Verde éxito */
--warning: #f59e0b      /* Amarillo advertencia */
--danger: #ef4444       /* Rojo peligro */
--info: #3b82f6         /* Azul información */
```

### Tipografía

- **Fuente:** Inter (Google Fonts)
- **Pesos:** 400, 500, 600, 700, 800

### Componentes

- **Cards:** Contenedores con sombra y borde
- **Tables:** Tablas responsivas con hover
- **Buttons:** Primario, secundario, éxito, peligro, ghost
- **Badges:** Estados con colores (success, warning, danger, info)
- **Modals:** Overlays con animación
- **Forms:** Inputs, selects, textareas con focus states

---

## 📱 Responsive

El panel es completamente responsive:

- **Desktop (>1024px):** Sidebar fijo, contenido amplio
- **Tablet (768-1024px):** Sidebar colapsable, grid adaptativo
- **Mobile (<768px):** Sidebar oculto, tablas con scroll horizontal

---

## 🔧 Configuración Avanzada

### Cambiar URL de la API

Editar `admin/js/admin.js`:

```javascript
const API_BASE_URL = 'https://tu-api.com/api';
```

### Cambiar Threshold de Stock Bajo

Editar `admin/js/admin.js` línea 150:

```javascript
apiRequest('/inventory/low-stock?threshold=10') // Cambiar de 5 a 10
```

### Personalizar Colores

Editar `admin/css/admin.css` variables:

```css
:root {
  --primary: #tu-color;
  --accent: #tu-color;
  /* ... */
}
```

---

## 🐛 Troubleshooting

### Error: "Error al iniciar sesión"

**Causa:** Backend no está corriendo o credenciales incorrectas

**Solución:**
1. Verificar que el backend esté corriendo: `http://localhost:3000`
2. Verificar credenciales en la base de datos
3. Revisar consola del navegador para más detalles

### Error: "Error al cargar datos"

**Causa:** Token expirado o API no responde

**Solución:**
1. Cerrar sesión y volver a iniciar
2. Verificar que el backend esté corriendo
3. Revisar consola del navegador

### Productos no se muestran

**Causa:** No hay productos en la base de datos

**Solución:**
```bash
cd backend
npm run db:import  # Importar productos desde store.json
```

### Alertas no aparecen

**Causa:** Todos los productos tienen stock suficiente

**Solución:**
- Esto es normal si no hay productos con stock bajo
- Puedes ajustar el threshold en el código

---

## 📊 Métricas y Estadísticas

El dashboard muestra:

- **Total Productos:** Cantidad total de productos activos
- **Stock Total:** Suma de todas las unidades disponibles
- **Pedidos Pendientes:** Pedidos en estado "pending"
- **Alertas:** Productos con stock ≤ 5 unidades

---

## 🔒 Seguridad

### Autenticación
- JWT tokens con expiración
- Tokens almacenados en localStorage
- Verificación en cada request

### Autorización
- Solo usuarios admin pueden acceder
- Rutas protegidas con middleware
- Validación de permisos en backend

### Buenas Prácticas
- No exponer credenciales en el código
- Usar HTTPS en producción
- Tokens con tiempo de expiración corto
- Logout al cerrar sesión

---

## 🚀 Despliegue

### Opción 1: Vercel (Recomendado)

```bash
# Instalar Vercel CLI
npm i -g vercel

# Desplegar
cd admin
vercel
```

### Opción 2: Netlify

```bash
# Instalar Netlify CLI
npm i -g netlify-cli

# Desplegar
cd admin
netlify deploy
```

### Opción 3: GitHub Pages

1. Crear branch `gh-pages`
2. Copiar archivos de `admin/` a la raíz
3. Push a GitHub
4. Habilitar GitHub Pages en settings

---

## 📝 Notas Importantes

1. **Backend Requerido:** El panel necesita el backend corriendo
2. **CORS:** Asegúrate de que el backend tenga CORS habilitado
3. **Credenciales:** Cambia las credenciales por defecto en producción
4. **HTTPS:** Usa HTTPS en producción para seguridad
5. **Tokens:** Los tokens expiran después de 1 hora

---

## 🎯 Próximas Mejoras

- [ ] Crear/editar productos desde el panel
- [ ] Subir imágenes de productos
- [ ] Gestión de variantes (tallas)
- [ ] Reportes y gráficas
- [ ] Exportar datos a Excel/CSV
- [ ] Notificaciones en tiempo real
- [ ] Gestión de usuarios admin
- [ ] Configuración de la tienda
- [ ] Temas claro/oscuro

---

## 📞 Soporte

**Sistema:** Kiro Shoes Inventory Management  
**Versión:** 1.0.0  
**Fecha:** 26 de mayo de 2026

Para soporte técnico, contactar al equipo de desarrollo.

---

## 📄 Licencia

© 2026 Calzados Hermanos Solis. Todos los derechos reservados.
