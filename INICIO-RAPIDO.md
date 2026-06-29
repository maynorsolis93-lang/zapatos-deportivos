# 🚀 INICIO RÁPIDO - Kiro Shoes

Guía para iniciar el sistema completo (Backend + Frontend)

---

## 📋 Requisitos Previos

Antes de iniciar, verifica que tengas instalado:

- ✅ **Node.js** (v18 o superior) - [Descargar](https://nodejs.org/)
- ✅ **PostgreSQL** (v14 o superior) - [Descargar](https://www.postgresql.org/download/)
- ✅ **Git** - [Descargar](https://git-scm.com/)

---

## ⚡ Inicio Rápido (Primera Vez)

### 1️⃣ Configurar Base de Datos

Abre una terminal y ejecuta:

```bash
# Abrir PostgreSQL
psql -U postgres

# Crear la base de datos
CREATE DATABASE kiro_inventory;

# Salir
\q
```

### 2️⃣ Configurar Backend

```bash
# Ir a la carpeta backend
cd backend

# Instalar dependencias
npm install

# Copiar archivo de variables de entorno
cp .env.example .env

# Editar .env con tus credenciales
# (Abre el archivo .env y configura DATABASE_URL con tu password de PostgreSQL)

# Ejecutar setup completo (migraciones + seed + importar productos)
npm run db:setup

# Iniciar el servidor
npm run dev
```

El backend estará corriendo en: **http://localhost:3000**

### 3️⃣ Configurar Frontend (En otra terminal)

```bash
# Ir a la carpeta frontend
cd frontend

# Instalar dependencias
npm install

# Iniciar el servidor de desarrollo
npm run dev
```

El frontend estará corriendo en: **http://localhost:5173**

---

## 🔄 Inicio Rápido (Después de Primera Vez)

### Opción A: Usando Scripts (Recomendado)

Abre **DOS terminales** desde la raíz del proyecto:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### Opción B: Usando un Solo Comando

Desde la raíz del proyecto, puedes crear un script para iniciar ambos:

**En Windows (PowerShell):**
```powershell
# Backend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm run dev"

# Frontend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"
```

**En Windows (CMD):**
```cmd
start cmd /k "cd backend && npm run dev"
start cmd /k "cd frontend && npm run dev"
```

---

## 🌐 Acceder al Sistema

Una vez que ambos servicios estén corriendo:

### Frontend Público
- **URL:** http://localhost:5173
- **Descripción:** Landing page con catálogo de productos
- **Uso:** Ver productos, filtrar, hacer pedidos por WhatsApp

### Panel Administrativo
- **URL:** http://localhost:5173/admin/
- **Credenciales:**
  - Email: `maymesm@yahoo.com`
  - Password: `Solislidia123`
- **Uso:** Gestionar productos, inventario, pedidos

### API Backend
- **URL:** http://localhost:3000
- **Health Check:** http://localhost:3000/health
- **Documentación:** http://localhost:3000 (muestra endpoints disponibles)

---

## ✅ Verificar que Todo Funciona

### 1. Verificar Backend

Abre http://localhost:3000/health en tu navegador, deberías ver:
```json
{
  "status": "Servidor funcionando correctamente",
  "timestamp": "2026-05-29T..."
}
```

O desde terminal:
```bash
cd backend
node scripts/verify-setup.js
```

### 2. Verificar Frontend

Abre http://localhost:5173, deberías ver:
- Hero con imagen de zapatos
- Catálogo de productos
- Filtros por audiencia y tipo

### 3. Verificar Panel Admin

Abre http://localhost:5173/admin/ e inicia sesión:
- Email: `maymesm@yahoo.com`
- Password: `Solislidia123`

Deberías ver el dashboard con estadísticas.

---

## 🛑 Detener los Servicios

Para detener los servicios:

1. Ve a cada terminal
2. Presiona `Ctrl + C`
3. Confirma con `Y` o `S` si te lo pregunta

---

## 🔧 Comandos Útiles

### Backend

```bash
cd backend

# Iniciar en modo desarrollo (con auto-reload)
npm run dev

# Iniciar en modo producción
npm start

# Reiniciar base de datos (¡CUIDADO! Borra todos los datos)
npm run db:reset

# Volver a importar productos
npm run db:import

# Verificar estado del sistema
node scripts/verify-setup.js

# Ejecutar tests
node scripts/test-auth.js
node scripts/test-products-crud.js
node scripts/test-inventory.js
node scripts/test-orders.js
node scripts/test-catalog.js

# Health check
node scripts/health-check.js
```

### Frontend

```bash
cd frontend

# Iniciar en modo desarrollo
npm run dev

# Construir para producción
npm run build

# Vista previa de producción
npm run preview
```

---

## 🐛 Solución de Problemas

### Error: "Cannot connect to database"

**Causa:** PostgreSQL no está corriendo o credenciales incorrectas

**Solución:**
1. Verifica que PostgreSQL esté corriendo
2. Revisa las credenciales en `backend/.env`
3. Verifica que la base de datos `kiro_inventory` exista

```bash
# Verificar si PostgreSQL está corriendo (Windows)
Get-Service postgresql*

# Iniciar PostgreSQL (Windows)
Start-Service postgresql-x64-14
```

### Error: "Port 3000 already in use"

**Causa:** Ya hay algo corriendo en el puerto 3000

**Solución:**
```bash
# Windows - Ver qué está usando el puerto
netstat -ano | findstr :3000

# Matar el proceso
taskkill /PID <PID> /F

# O cambiar el puerto en backend/.env
PORT=3001
```

### Error: "Port 5173 already in use"

**Causa:** Ya hay algo corriendo en el puerto 5173

**Solución:**
```bash
# Vite te ofrecerá automáticamente otro puerto (5174)
# O puedes matar el proceso como arriba
```

### Error: "Module not found"

**Causa:** Faltan dependencias

**Solución:**
```bash
# Backend
cd backend
rm -rf node_modules package-lock.json
npm install

# Frontend
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Error: "Prisma Client not generated"

**Causa:** No se generó el cliente de Prisma

**Solución:**
```bash
cd backend
npx prisma generate
```

### No aparecen productos en el frontend

**Causa:** No se importaron los productos

**Solución:**
```bash
cd backend
npm run db:import
```

---

## 📊 Estado del Sistema

Para verificar el estado completo del sistema:

```bash
cd backend
node scripts/verify-setup.js
```

Esto verificará:
- ✅ Conexión a base de datos
- ✅ Productos importados (78)
- ✅ Variantes creadas (394)
- ✅ Categorías (3)
- ✅ Audiencias (4)
- ✅ Tallas (26)
- ✅ Usuarios admin (2)

---

## 📞 Soporte

Si tienes problemas:

1. Revisa esta guía completa
2. Revisa los logs en la terminal
3. Consulta `backend/COMANDOS-RAPIDOS.md`
4. Consulta `backend/README.md`
5. Consulta `frontend/COMO-EMPEZAR.md`

---

## 🎯 Próximos Pasos

Una vez que todo esté funcionando:

1. ✅ Explora el catálogo público
2. ✅ Inicia sesión en el panel admin
3. ✅ Prueba crear un pedido
4. ✅ Prueba confirmar un pedido
5. ✅ Revisa el inventario
6. ✅ Revisa las alertas de stock

---

**Sistema:** Kiro Shoes Inventory Management  
**Versión:** 2.0.0  
**Fecha:** Mayo 2026

¡Disfruta usando el sistema! 🎉
