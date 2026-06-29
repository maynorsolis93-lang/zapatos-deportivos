# 🚀 Inicio Rápido - Panel Administrativo

Guía rápida para empezar a usar el panel administrativo en 5 minutos.

---

## ⚡ Pasos Rápidos

### 1. Iniciar el Backend (Terminal 1)

```bash
cd backend
npm run dev
```

**Resultado esperado:**
```
🚀 Servidor corriendo en http://localhost:3000
📊 Dashboard admin: http://localhost:3000/api/admin/dashboard
🔐 Login: POST http://localhost:3000/api/auth/login
```

---

### 2. Iniciar el Frontend (Terminal 2)

```bash
npm run dev
```

**Resultado esperado:**
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

---

### 3. Abrir el Panel Admin

**Opción A: Navegador**
```
http://localhost:5173/admin/
```

**Opción B: Live Server (VS Code)**
1. Click derecho en `admin/index.html`
2. Seleccionar "Open with Live Server"

---

### 4. Iniciar Sesión

**Credenciales:**
- **Email:** `maymesm@yahoo.com`
- **Contraseña:** `Solislidia123`

---

### 5. Explorar las Vistas

Usar el menú lateral para navegar:

1. **📊 Dashboard** - Estadísticas generales
2. **👟 Productos** - Gestión de productos
3. **📦 Inventario** - Historial de movimientos
4. **🛒 Pedidos** - Gestión de pedidos
5. **⚠️ Alertas** - Stock bajo y sin stock
6. **🌐 Catálogo** - Vista previa pública

---

## 🎯 Acciones Rápidas

### Ver Estadísticas
1. Ir a **Dashboard**
2. Ver las 4 tarjetas de estadísticas
3. Revisar productos con stock bajo
4. Ver pedidos recientes

### Gestionar un Pedido
1. Ir a **Pedidos**
2. Click en "Ver" en cualquier pedido
3. Revisar detalles del cliente y productos
4. Click en "Confirmar Pedido" o "Cancelar Pedido"

### Revisar Alertas
1. Ir a **Alertas**
2. Ver productos con stock bajo (≤ 5 unidades)
3. Ver productos sin stock (0 unidades)
4. El badge en el menú muestra el total de alertas

### Ver Catálogo Público
1. Ir a **Catálogo Público**
2. Aplicar filtros (audiencia, tipo)
3. Ver cómo se muestran los productos a los clientes

---

## 🔧 Configuración Inicial

### Si no hay productos en la base de datos:

```bash
cd backend
npm run db:import
```

### Si no hay usuario admin:

```bash
cd backend
node scripts/create-bcrypt-admin.js
```

Seguir las instrucciones en pantalla.

---

## 📊 URLs Importantes

| Servicio | URL | Descripción |
|----------|-----|-------------|
| **Backend API** | `http://localhost:3000` | API REST |
| **Frontend Público** | `http://localhost:5173` | Landing page |
| **Panel Admin** | `http://localhost:5173/admin/` | Panel administrativo |
| **Dashboard API** | `http://localhost:3000/api/admin/dashboard` | Estadísticas |

---

## 🐛 Solución Rápida de Problemas

### ❌ Error: "Error al iniciar sesión"

**Causa:** Backend no está corriendo

**Solución:**
```bash
cd backend
npm run dev
```

---

### ❌ Error: "Cannot GET /admin/"

**Causa:** Frontend no está corriendo

**Solución:**
```bash
npm run dev
```

Luego abrir: `http://localhost:5173/admin/`

---

### ❌ No hay productos

**Causa:** Base de datos vacía

**Solución:**
```bash
cd backend
npm run db:import
```

---

### ❌ Token expirado

**Causa:** Sesión expirada (1 hora)

**Solución:**
1. Click en "Cerrar Sesión"
2. Volver a iniciar sesión

---

## 📱 Atajos de Teclado

| Atajo | Acción |
|-------|--------|
| `Esc` | Cerrar modal |
| `F5` | Actualizar página |
| `Ctrl + R` | Recargar datos |

---

## 🎨 Vistas Principales

### Dashboard
- **Estadísticas:** Total productos, stock, pedidos, alertas
- **Listas:** Stock bajo, pedidos recientes
- **Acciones:** Refresh manual

### Productos
- **Tabla:** ID, imagen, nombre, categoría, audiencia, precio, stock, estado
- **Búsqueda:** Por nombre
- **Acciones:** Ver, Editar

### Inventario
- **Tabla:** Fecha, producto, talla, tipo, cantidad, razón, usuario
- **Filtros:** Por tipo (entrada, salida, ajuste)
- **Acciones:** Exportar (preparado)

### Pedidos
- **Tabla:** ID, cliente, teléfono, total, estado, fecha
- **Filtros:** Por estado
- **Acciones:** Ver, Confirmar, Cancelar

### Alertas
- **Secciones:** Stock bajo, sin stock
- **Badge:** Contador en el menú
- **Actualización:** Automática

### Catálogo
- **Grid:** Productos públicos
- **Filtros:** Audiencia, tipo
- **Vista:** Previa del catálogo público

---

## 💡 Tips Útiles

### 1. Actualizar Datos
Click en el botón 🔄 en la esquina superior derecha

### 2. Ver Detalles de Pedido
Click en "Ver" en la tabla de pedidos

### 3. Confirmar Pedido
1. Abrir detalles del pedido
2. Click en "Confirmar Pedido"
3. El stock se descuenta automáticamente

### 4. Cancelar Pedido
1. Abrir detalles del pedido
2. Click en "Cancelar Pedido"
3. El stock se libera automáticamente

### 5. Filtrar Datos
Usar los selectores en la parte superior de cada vista

---

## 📞 Comandos de Mantenimiento

### Reiniciar Base de Datos
```bash
cd backend
npm run db:reset
npm run db:setup
```

### Ver Logs del Backend
```bash
cd backend
npm run dev
# Los logs aparecen en la terminal
```

### Verificar Estado del Sistema
```bash
cd backend
node scripts/verify-setup.js
```

---

## 🎯 Flujo de Trabajo Típico

### Gestión Diaria

1. **Iniciar Sesión**
   - Abrir panel admin
   - Ingresar credenciales

2. **Revisar Dashboard**
   - Ver estadísticas del día
   - Revisar alertas de stock
   - Ver pedidos pendientes

3. **Gestionar Pedidos**
   - Ir a "Pedidos"
   - Filtrar por "Pendiente"
   - Confirmar pedidos listos
   - Cancelar pedidos problemáticos

4. **Revisar Inventario**
   - Ir a "Inventario"
   - Ver movimientos del día
   - Verificar ajustes

5. **Monitorear Alertas**
   - Ir a "Alertas"
   - Revisar productos con stock bajo
   - Planificar reabastecimiento

6. **Cerrar Sesión**
   - Click en "Cerrar Sesión"

---

## 📊 Métricas Importantes

### Dashboard
- **Total Productos:** Cantidad de productos activos
- **Stock Total:** Suma de unidades disponibles
- **Pedidos Pendientes:** Pedidos sin confirmar
- **Alertas:** Productos con stock ≤ 5

### Alertas
- **Stock Bajo:** ≤ 5 unidades
- **Sin Stock:** 0 unidades

---

## 🔐 Seguridad

### Buenas Prácticas
1. ✅ Cerrar sesión al terminar
2. ✅ No compartir credenciales
3. ✅ Cambiar contraseña regularmente
4. ✅ Usar HTTPS en producción
5. ✅ No dejar sesión abierta en computadoras públicas

---

## 📝 Checklist de Inicio

- [ ] Backend corriendo en `http://localhost:3000`
- [ ] Frontend corriendo en `http://localhost:5173`
- [ ] Base de datos con productos importados
- [ ] Usuario admin creado
- [ ] Panel admin accesible en `http://localhost:5173/admin/`
- [ ] Login exitoso con credenciales
- [ ] Dashboard mostrando estadísticas
- [ ] Todas las vistas funcionando

---

## 🎉 ¡Listo!

Ahora puedes gestionar tu inventario, productos y pedidos desde el panel administrativo.

**Próximos pasos:**
1. Explorar todas las vistas
2. Gestionar algunos pedidos de prueba
3. Revisar las alertas de stock
4. Familiarizarte con la interfaz

---

## 📞 Soporte

**Documentación completa:** `admin/README.md`  
**Troubleshooting:** `PANEL-ADMIN-COMPLETADO.md`

---

**Sistema:** Kiro Shoes Inventory Management  
**Versión:** 1.0.0  
**Fecha:** 26 de mayo de 2026
