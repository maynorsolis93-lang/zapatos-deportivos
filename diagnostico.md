# 🔍 DIAGNÓSTICO - Error al cargar productos

## Problema Detectado
**Error:** "Error al cargar productos" en el panel admin

---

## ✅ PASOS PARA SOLUCIONAR

### 1️⃣ Verificar que el Backend está corriendo

Abre una terminal y ejecuta:

```bash
cd backend
npm run dev
```

**Deberías ver:**
```
🚀 Servidor corriendo en http://localhost:3000
📊 Dashboard admin: http://localhost:3000/api/admin/dashboard
🔐 Login: POST http://localhost:3000/api/auth/login
```

**Si no arranca:**
- Verifica que PostgreSQL esté corriendo
- Verifica que el archivo `.env` exista en `backend/`
- Verifica que las credenciales de la BD sean correctas

---

### 2️⃣ Probar el Backend manualmente

Abre tu navegador y ve a:

**http://localhost:3000/health**

**Deberías ver:**
```json
{
  "status": "Servidor funcionando correctamente",
  "timestamp": "2026-06-02..."
}
```

**Si NO carga:**
- El backend no está corriendo → Vuelve al paso 1
- Hay un error de puerto → Verifica que el puerto 3000 esté libre

---

### 3️⃣ Probar el endpoint de productos

En tu navegador, ve a:

**http://localhost:3000/api/admin/products**

**Deberías ver:**
- Un JSON con productos
- O un error de autenticación (401) - esto es normal

**Si ves error 500 o no carga:**
- Hay un problema con la base de datos
- Ejecuta: `cd backend && node scripts/verify-setup.js`

---

### 4️⃣ Verificar la Base de Datos

En una terminal:

```bash
cd backend
node scripts/verify-setup.js
```

**Deberías ver:**
```
✅ Base de datos conectada
✅ 78 productos encontrados
✅ 394 variantes encontradas
...
```

**Si hay errores:**
- Verifica que PostgreSQL esté corriendo
- Verifica que la base de datos `kiro_inventory` exista
- Ejecuta: `npm run db:setup` para reinstalar

---

### 5️⃣ Revisar la Consola del Navegador

En el panel admin:
1. Presiona **F12** para abrir las DevTools
2. Ve a la pestaña **"Console"**
3. Busca errores en rojo

**Errores comunes:**

**❌ "Failed to fetch"**
- El backend no está corriendo
- El puerto es incorrecto
- CORS bloqueado

**❌ "Network Error"**
- No hay conexión al backend
- Firewall bloqueando el puerto 3000

**❌ "401 Unauthorized"**
- Token expirado → Cierra sesión y vuelve a iniciar

---

## 🔧 SOLUCIONES RÁPIDAS

### Solución 1: Reiniciar todo

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev

# Ve a: http://localhost:5173/admin/
# Login con: maymesm@yahoo.com / Solislidia123
```

### Solución 2: Verificar puertos

```bash
# Windows - Ver si el puerto 3000 está en uso
netstat -ano | findstr :3000

# Si está en uso, matar el proceso:
taskkill /PID <PID> /F
```

### Solución 3: Reinstalar base de datos

```bash
cd backend
npm run db:reset
npm run db:setup
```

⚠️ **CUIDADO:** Esto borrará todos los datos y los volverá a crear

### Solución 4: Limpiar caché del navegador

1. Abre el panel admin
2. Presiona **Ctrl + Shift + Delete**
3. Selecciona "Cookies y caché"
4. Limpia
5. Cierra sesión y vuelve a iniciar

---

## 📊 CHECKLIST DE VERIFICACIÓN

Marca cada punto que funciona:

- [ ] PostgreSQL está corriendo
- [ ] Base de datos `kiro_inventory` existe
- [ ] Backend responde en http://localhost:3000/health
- [ ] Archivo `backend/.env` existe y está configurado
- [ ] Frontend carga en http://localhost:5173
- [ ] Panel admin carga en http://localhost:5173/admin/
- [ ] Puedo hacer login
- [ ] Console del navegador (F12) no muestra errores

---

## 🆘 SI NADA FUNCIONA

Ejecuta estos comandos en orden:

```bash
# 1. Verificar PostgreSQL
psql -U postgres
# Si funciona, escribe: \q para salir

# 2. Reinstalar backend
cd backend
rm -rf node_modules
npm install
npm run db:setup

# 3. Reinstalar frontend
cd ../frontend
rm -rf node_modules
npm install

# 4. Iniciar backend
cd ../backend
npm run dev

# 5. En otra terminal, iniciar frontend
cd frontend
npm run dev
```

---

## 📞 INFORMACIÓN DE DEBUG

Cuando pidas ayuda, proporciona:

1. **Versión de Node.js:** `node --version`
2. **Sistema Operativo:** Windows/Mac/Linux
3. **Error en consola del navegador** (F12 → Console)
4. **Error en terminal del backend**
5. **Resultado de:** `cd backend && node scripts/verify-setup.js`

---

**Sistema:** Kiro Shoes Inventory Management  
**Versión:** 2.0.0
