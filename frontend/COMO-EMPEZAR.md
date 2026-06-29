# 🚀 CÓMO EMPEZAR - Guía Visual

Guía paso a paso con capturas de pantalla conceptuales para empezar a usar el sistema.

---

## 📋 Requisitos Previos

Antes de empezar, asegúrate de tener instalado:

- ✅ **Node.js** (v18 o superior)
- ✅ **PostgreSQL** (v14 o superior)
- ✅ **Git**
- ✅ **Editor de código** (VS Code recomendado)

---

## 🎯 Paso 1: Clonar el Repositorio

```bash
git clone <tu-repositorio>
cd kiro-shoes
```

**Resultado esperado:**
```
Cloning into 'kiro-shoes'...
remote: Counting objects: 100% (xxx/xxx), done.
remote: Compressing objects: 100% (xxx/xxx), done.
Receiving objects: 100% (xxx/xxx), done.
```

---

## 🗄️ Paso 2: Configurar Base de Datos

### 2.1 Crear Base de Datos en PostgreSQL

```bash
# Abrir psql
psql -U postgres

# Crear base de datos
CREATE DATABASE kiro_inventory;

# Salir
\q
```

### 2.2 Configurar Variables de Entorno

```bash
cd backend
cp .env.example .env
```

**Editar `.env`:**
```env
DATABASE_URL="postgresql://postgres:tu_password@localhost:5432/kiro_inventory"
JWT_SECRET="tu-secreto-super-seguro-aqui"
JWT_REFRESH_SECRET="otro-secreto-diferente-aqui"
NODE_ENV="development"
PORT=3000
```

---

## 📦 Paso 3: Instalar Dependencias

### 3.1 Backend

```bash
cd backend
npm install
```

**Resultado esperado:**
```
added 150 packages in 15s
```

### 3.2 Frontend

```bash
cd ..
npm install
```

**Resultado esperado:**
```
added 50 packages in 5s
```

---

## 🔧 Paso 4: Setup de Base de Datos

```bash
cd backend
npm run db:setup
```

**Resultado esperado:**
```
✅ Migraciones aplicadas
✅ Cliente Prisma generado
✅ Seeds cargados (categorías, audiencias, tallas)
✅ Productos importados (78 productos, 394 variantes)
✅ Usuario admin creado
```

---

## 🚀 Paso 5: Iniciar Servicios

### 5.1 Iniciar Backend (Terminal 1)

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

### 5.2 Iniciar Frontend (Terminal 2)

```bash
npm run dev
```

**Resultado esperado:**
```
VITE v5.x.x  ready in 500 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
➜  press h to show help
```

---

## 🌐 Paso 6: Acceder a las Aplicaciones

### 6.1 Frontend Público

**URL:** `http://localhost:5173`

**Lo que verás:**
```
┌─────────────────────────────────────────┐
│  🏠 Calzados Hermanos Solis             │
│  ─────────────────────────────────────  │
│                                         │
│  [Hero con imagen de zapatos]          │
│                                         │
│  Tu Mejor Estilo Para Toda la Familia  │
│                                         │
│  [Ver colección] [Hacer pedido]        │
│                                         │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  📦 Productos Disponibles               │
│  ─────────────────────────────────────  │
│                                         │
│  [Todos] [Niños] [Adolescentes]        │
│  [Damas] [Caballeros]                  │
│                                         │
│  [Todos] [Deportivos] [Casuales]       │
│                                         │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐  │
│  │ 👟   │ │ 👟   │ │ 👟   │ │ 👟   │  │
│  │ $1200│ │ $1500│ │ $1800│ │ $2000│  │
│  └──────┘ └──────┘ └──────┘ └──────┘  │
└─────────────────────────────────────────┘
```

### 6.2 Panel Administrativo

**URL:** `http://localhost:5173/admin/`

**Lo que verás:**
```
┌─────────────────────────────────────────┐
│  🔐 Panel Administrativo                │
│  ─────────────────────────────────────  │
│                                         │
│  [Logo]                                 │
│                                         │
│  Calzados Hermanos Solis               │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ Correo electrónico              │   │
│  │ [maymesm@yahoo.com]             │   │
│  │                                 │   │
│  │ Contraseña                      │   │
│  │ [••••••••••••]                  │   │
│  │                                 │   │
│  │ [Iniciar Sesión]                │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

---

## 🔑 Paso 7: Iniciar Sesión en el Panel Admin

**Credenciales:**
- **Email:** `maymesm@yahoo.com`
- **Contraseña:** `Solislidia123`

**Después del login verás:**
```
┌──────────────┬──────────────────────────────────────┐
│ 📊 Dashboard │  Dashboard                      🔄 👤│
│ 👟 Productos │  ────────────────────────────────────│
│ 📦 Inventario│                                      │
│ 🛒 Pedidos   │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐│
│ ⚠️ Alertas   │  │ 👟   │ │ 📦   │ │ 🛒   │ │ ⚠️   ││
│ 🌐 Catálogo  │  │  78  │ │ 1500 │ │  12  │ │   5  ││
│              │  │Produc│ │Stock │ │Pedido│ │Alerta││
│ ────────────│  └──────┘ └──────┘ └──────┘ └──────┘│
│ 👤 Admin     │                                      │
│ [Cerrar]     │  📉 Productos con Stock Bajo         │
│              │  ┌────────────────────────────────┐  │
└──────────────┤  │ Tenis Deportivo - 3 unidades  │  │
               │  │ Zapato Casual - 2 unidades    │  │
               │  └────────────────────────────────┘  │
               │                                      │
               │  🛒 Pedidos Recientes                │
               │  ┌────────────────────────────────┐  │
               │  │ Juan Pérez - C$1200 - Pendiente│  │
               │  │ María López - C$1500 - Confirmado│
               │  └────────────────────────────────┘  │
               └──────────────────────────────────────┘
```

---

## 🎯 Paso 8: Explorar las Vistas

### 8.1 Dashboard
- Ver estadísticas generales
- Revisar productos con stock bajo
- Ver pedidos recientes

### 8.2 Productos
- Ver todos los productos
- Buscar por nombre
- Ver stock disponible

### 8.3 Inventario
- Ver historial de movimientos
- Filtrar por tipo (entrada, salida, ajuste)
- Ver usuario responsable

### 8.4 Pedidos
- Ver todos los pedidos
- Filtrar por estado
- Confirmar o cancelar pedidos

### 8.5 Alertas
- Ver productos con stock bajo (≤ 5)
- Ver productos sin stock (0)
- Badge de notificaciones en el menú

### 8.6 Catálogo
- Vista previa del catálogo público
- Filtrar por audiencia y tipo
- Verificar datos públicos

---

## 🧪 Paso 9: Probar Funcionalidades

### 9.1 Hacer un Pedido (Frontend Público)

1. Ir a `http://localhost:5173`
2. Scroll hasta "Hacer un Pedido"
3. Llenar el formulario:
   - Nombre: Tu nombre
   - Teléfono: +505 8888-0000
   - Modelo: Seleccionar un producto
   - Talla: Seleccionar talla
   - Ciudad: Managua
   - Cantidad: 1
4. Click en "Enviar pedido por WhatsApp"
5. Se abre WhatsApp con el mensaje pre-llenado

### 9.2 Confirmar un Pedido (Panel Admin)

1. Ir a `http://localhost:5173/admin/`
2. Login con credenciales
3. Ir a "Pedidos"
4. Click en "Ver" en un pedido pendiente
5. Revisar detalles
6. Click en "Confirmar Pedido"
7. El stock se descuenta automáticamente

### 9.3 Ver Alertas de Stock

1. En el panel admin
2. Ir a "Alertas"
3. Ver productos con stock bajo
4. Ver productos sin stock
5. El badge en el menú muestra el total

---

## 📊 Paso 10: Verificar que Todo Funciona

### 10.1 Verificar Backend

```bash
cd backend
node scripts/verify-setup.js
```

**Resultado esperado:**
```
✅ Base de datos conectada
✅ 78 productos encontrados
✅ 394 variantes encontradas
✅ 3 categorías encontradas
✅ 4 audiencias encontradas
✅ 26 tallas encontradas
✅ 2 usuarios admin encontrados
```

### 10.2 Ejecutar Tests

```bash
cd backend

# Test autenticación
node scripts/test-auth.js
# ✅ 9/9 tests pasados

# Test productos
node scripts/test-products-crud.js
# ✅ 11/11 tests pasados

# Test inventario
node scripts/test-inventory.js
# ✅ 11/11 tests pasados

# Test pedidos
node scripts/test-orders.js
# ✅ 12/12 tests pasados

# Test catálogo
node scripts/test-catalog.js
# ✅ 7/7 tests pasados
```

---

## 🎉 ¡Listo!

Ahora tienes el sistema completo funcionando:

- ✅ Frontend público en `http://localhost:5173`
- ✅ Panel admin en `http://localhost:5173/admin/`
- ✅ API backend en `http://localhost:3000`
- ✅ Base de datos PostgreSQL configurada
- ✅ 78 productos importados
- ✅ Usuario admin creado
- ✅ Todos los tests pasando

---

## 🔧 Comandos Útiles

### Desarrollo
```bash
# Iniciar backend
cd backend && npm run dev

# Iniciar frontend
npm run dev

# Ver logs del backend
cd backend && npm run dev
```

### Base de Datos
```bash
cd backend

# Resetear BD (¡cuidado!)
npm run db:reset

# Setup completo
npm run db:setup

# Verificar estado
npm run db:verify
```

### Testing
```bash
cd backend

# Todos los tests
node scripts/test-auth.js
node scripts/test-products-crud.js
node scripts/test-inventory.js
node scripts/test-orders.js
node scripts/test-catalog.js
```

---

## 🐛 Solución de Problemas

### Error: "Cannot connect to database"

**Solución:**
1. Verificar que PostgreSQL esté corriendo
2. Verificar credenciales en `.env`
3. Verificar que la base de datos exista

```bash
psql -U postgres
\l  # Listar bases de datos
```

### Error: "Port 3000 already in use"

**Solución:**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```

### Error: "Module not found"

**Solución:**
```bash
# Reinstalar dependencias
cd backend
rm -rf node_modules package-lock.json
npm install

cd ..
rm -rf node_modules package-lock.json
npm install
```

---

## 📞 Ayuda Adicional

**Documentación:**
- `README.md` - Documentación principal
- `admin/README.md` - Guía del panel admin
- `INICIO-RAPIDO-ADMIN.md` - Inicio rápido
- `PANEL-ADMIN-COMPLETADO.md` - Documentación completa

**Comandos Rápidos:**
- `backend/COMANDOS-RAPIDOS.md`

**Troubleshooting:**
- `RESUMEN-FINAL-COMPLETO.md`

---

## 🎯 Próximos Pasos

1. **Explorar el Frontend Público**
   - Ver catálogo de productos
   - Probar filtros
   - Hacer un pedido de prueba

2. **Explorar el Panel Admin**
   - Ver dashboard
   - Gestionar productos
   - Confirmar pedidos
   - Revisar alertas

3. **Personalizar**
   - Cambiar colores en CSS
   - Agregar más productos
   - Configurar WhatsApp Business

4. **Desplegar a Producción**
   - Vercel para frontend
   - Railway para backend
   - Configurar dominio

---

**¡Disfruta usando Kiro Shoes Inventory Management!** 🎉

**Sistema:** Kiro Shoes Inventory Management  
**Versión:** 1.0.0  
**Fecha:** 26 de mayo de 2026
