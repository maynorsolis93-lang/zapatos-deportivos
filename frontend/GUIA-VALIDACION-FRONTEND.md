# 🧪 Guía de Validación Frontend - Etapas 1-4

Esta guía te muestra cómo validar todas las funcionalidades del backend desde el frontend usando diferentes métodos.

---

## 📋 Tabla de Contenidos

1. [Método 1: Interfaz HTML Interactiva](#método-1-interfaz-html-interactiva)
2. [Método 2: Consola del Navegador](#método-2-consola-del-navegador)
3. [Método 3: Postman / Thunder Client](#método-3-postman--thunder-client)
4. [Método 4: cURL desde Terminal](#método-4-curl-desde-terminal)

---

## Método 1: Interfaz HTML Interactiva

### ✅ La forma más fácil y visual

**Paso 1:** Asegúrate de que el servidor backend esté corriendo:
```bash
cd backend
npm run dev
```

**Paso 2:** Abre el archivo de pruebas en tu navegador:
```
Abre: test-api-frontend.html
```

**Paso 3:** Sigue este orden de pruebas:

1. **Etapa 1 - Base de Datos:**
   - Haz clic en "Etapa 1" para expandir
   - Prueba "Health Check" → Debe mostrar `status: "Servidor funcionando correctamente"`
   - Prueba "Info de la API" → Debe mostrar todos los endpoints disponibles

2. **Etapa 2 - Autenticación:**
   - Haz clic en "Etapa 2" para expandir
   - Haz clic en "🔓 Hacer Login" → Debe mostrar el token de acceso
   - Los demás botones se habilitarán automáticamente
   - Prueba "Obtener Mi Información" → Debe mostrar tus datos de usuario
   - Prueba "Dashboard con Estadísticas" → Debe mostrar estadísticas del sistema
   - Prueba "Listar Productos" → Debe mostrar los primeros 10 productos

3. **Etapa 3 - CRUD Productos:**
   - Haz clic en "Etapa 3" para expandir
   - Prueba "Crear Producto" → Crea un producto de prueba
   - Para "Ajustar Stock":
     - Ingresa el ID de un producto (ej: 1)
     - Ingresa el ID de una variante (ej: 1)
     - Ingresa una cantidad (ej: 5 para entrada, -3 para salida)
     - Selecciona una razón
     - Haz clic en "Ajustar Stock"

4. **Etapa 4 - Inventario y Alertas:**
   - Haz clic en "Etapa 4" para expandir
   - Prueba "🔔 Ver Alertas" → Muestra productos con stock bajo y agotados
   - Prueba "Ver Stock Bajo" → Lista productos con stock menor al umbral
   - Prueba "Ver Agotados" → Lista productos sin stock
   - Prueba "Ver Movimientos" → Muestra historial de movimientos
   - Prueba "Ver Resumen" → Muestra estadísticas de movimientos
   - Prueba "📊 Generar Reporte" → Genera reporte completo de inventario

---

## Método 2: Consola del Navegador

### 🔧 Para desarrolladores que prefieren código

**Paso 1:** Abre tu navegador y presiona `F12` para abrir las DevTools

**Paso 2:** Ve a la pestaña "Console"

**Paso 3:** Copia y pega estos scripts:

### Script 1: Configuración Inicial
```javascript
const API_URL = 'http://localhost:3000';
let token = '';

async function api(method, endpoint, body = null) {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' }
  };
  
  if (token) {
    options.headers['Authorization'] = `Bearer ${token}`;
  }
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  const response = await fetch(`${API_URL}${endpoint}`, options);
  const data = await response.json();
  console.log(`${method} ${endpoint}:`, data);
  return data;
}

console.log('✅ Funciones de API configuradas. Usa: api("GET", "/health")');
```

### Script 2: Hacer Login
```javascript
// Login
const loginData = await api('POST', '/api/auth/login', {
  email: 'maymesm@yahoo.com',
  password: 'Solislidia123'
});

token = loginData.accessToken;
console.log('✅ Token guardado:', token.substring(0, 30) + '...');
```

### Script 3: Probar Endpoints

```javascript
// ETAPA 1: Health Check
await api('GET', '/health');

// ETAPA 2: Dashboard
await api('GET', '/api/admin/dashboard');

// ETAPA 2: Mis datos
await api('GET', '/api/auth/me');

// ETAPA 3: Listar productos
await api('GET', '/api/admin/products?page=1&limit=5');

// ETAPA 3: Crear producto
await api('POST', '/api/products', {
  name: 'Zapato Test Console',
  description: 'Producto de prueba',
  basePrice: 1500,
  categoryId: 1,
  audienceId: 4,
  variants: [
    { sizeId: 16, stockQty: 10 }
  ]
});

// ETAPA 4: Ver alertas
await api('GET', '/api/inventory/alerts');

// ETAPA 4: Stock bajo
await api('GET', '/api/inventory/low-stock?threshold=5');

// ETAPA 4: Movimientos
await api('GET', '/api/inventory/movements?limit=10');

// ETAPA 4: Reporte de inventario
await api('GET', '/api/inventory/stock-report');
```

---

## Método 3: Postman / Thunder Client

### 📮 Para pruebas más estructuradas

**Opción A: Postman (Aplicación de escritorio)**

1. Descarga Postman: https://www.postman.com/downloads/
2. Crea una nueva colección llamada "Kiro Shoes API"
3. Importa estos requests:

**Opción B: Thunder Client (Extensión de VS Code)**

1. Instala la extensión "Thunder Client" en VS Code
2. Crea una nueva colección
3. Agrega estos requests:

### Requests a Crear:

#### 1. Login (POST)
```
URL: http://localhost:3000/api/auth/login
Method: POST
Headers: Content-Type: application/json
Body (JSON):
{
  "email": "maymesm@yahoo.com",
  "password": "Solislidia123"
}
```

**Importante:** Copia el `accessToken` de la respuesta para usarlo en los siguientes requests.

#### 2. Dashboard (GET)
```
URL: http://localhost:3000/api/admin/dashboard
Method: GET
Headers: 
  Content-Type: application/json
  Authorization: Bearer TU_TOKEN_AQUI
```

#### 3. Alertas (GET)
```
URL: http://localhost:3000/api/inventory/alerts
Method: GET
Headers: 
  Content-Type: application/json
  Authorization: Bearer TU_TOKEN_AQUI
```

#### 4. Stock Bajo (GET)
```
URL: http://localhost:3000/api/inventory/low-stock?threshold=5
Method: GET
Headers: 
  Content-Type: application/json
  Authorization: Bearer TU_TOKEN_AQUI
```

#### 5. Crear Producto (POST)
```
URL: http://localhost:3000/api/products
Method: POST
Headers: 
  Content-Type: application/json
  Authorization: Bearer TU_TOKEN_AQUI
Body (JSON):
{
  "name": "Zapato Test Postman",
  "description": "Producto de prueba",
  "basePrice": 1200,
  "categoryId": 1,
  "audienceId": 4,
  "variants": [
    { "sizeId": 16, "stockQty": 10 },
    { "sizeId": 17, "stockQty": 5 }
  ]
}
```

#### 6. Ajustar Stock (POST)
```
URL: http://localhost:3000/api/products/1/variants/1/stock
Method: POST
Headers: 
  Content-Type: application/json
  Authorization: Bearer TU_TOKEN_AQUI
Body (JSON):
{
  "quantity": 5,
  "reason": "compra",
  "note": "Entrada de prueba"
}
```

#### 7. Movimientos (GET)
```
URL: http://localhost:3000/api/inventory/movements?limit=20
Method: GET
Headers: 
  Content-Type: application/json
  Authorization: Bearer TU_TOKEN_AQUI
```

#### 8. Reporte de Inventario (GET)
```
URL: http://localhost:3000/api/inventory/stock-report
Method: GET
Headers: 
  Content-Type: application/json
  Authorization: Bearer TU_TOKEN_AQUI
```

---

## Método 4: cURL desde Terminal

### 💻 Para usuarios avanzados de terminal

### Paso 1: Login y guardar token
```bash
# Windows PowerShell
$response = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method POST -ContentType "application/json" -Body '{"email":"maymesm@yahoo.com","password":"Solislidia123"}'
$token = $response.accessToken
Write-Host "Token: $token"
```

### Paso 2: Usar el token en requests

```bash
# Health Check
Invoke-RestMethod -Uri "http://localhost:3000/health" -Method GET

# Dashboard
Invoke-RestMethod -Uri "http://localhost:3000/api/admin/dashboard" -Method GET -Headers @{"Authorization"="Bearer $token"}

# Alertas
Invoke-RestMethod -Uri "http://localhost:3000/api/inventory/alerts" -Method GET -Headers @{"Authorization"="Bearer $token"}

# Stock Bajo
Invoke-RestMethod -Uri "http://localhost:3000/api/inventory/low-stock?threshold=5" -Method GET -Headers @{"Authorization"="Bearer $token"}

# Movimientos
Invoke-RestMethod -Uri "http://localhost:3000/api/inventory/movements?limit=10" -Method GET -Headers @{"Authorization"="Bearer $token"}

# Reporte
Invoke-RestMethod -Uri "http://localhost:3000/api/inventory/stock-report" -Method GET -Headers @{"Authorization"="Bearer $token"}
```

---

## 📊 Checklist de Validación

Marca cada item cuando lo hayas probado exitosamente:

### Etapa 1: Base de Datos
- [ ] Health check responde correctamente
- [ ] API info muestra todos los endpoints
- [ ] Servidor responde en menos de 1 segundo

### Etapa 2: Autenticación
- [ ] Login exitoso con credenciales correctas
- [ ] Login falla con credenciales incorrectas
- [ ] Token se recibe correctamente
- [ ] Endpoint /me retorna información del usuario
- [ ] Dashboard muestra estadísticas
- [ ] Listar productos funciona con paginación

### Etapa 3: CRUD Productos
- [ ] Crear producto funciona correctamente
- [ ] Producto se crea con variantes
- [ ] Ajustar stock (entrada) funciona
- [ ] Ajustar stock (salida) funciona
- [ ] No permite stock negativo
- [ ] Movimientos se registran automáticamente

### Etapa 4: Inventario y Alertas
- [ ] Alertas muestra productos con stock bajo
- [ ] Alertas muestra productos agotados
- [ ] Stock bajo filtra correctamente por threshold
- [ ] Productos agotados lista solo stock = 0
- [ ] Movimientos muestra historial completo
- [ ] Movimientos se pueden filtrar por producto
- [ ] Resumen de movimientos calcula totales correctamente
- [ ] Reporte de inventario muestra estadísticas generales

---

## 🐛 Troubleshooting

### Error: "Failed to fetch" o "Network Error"
**Solución:** Verifica que el servidor backend esté corriendo:
```bash
cd backend
npm run dev
```

### Error: "Token inválido" o "401 Unauthorized"
**Solución:** Haz login nuevamente para obtener un token fresco.

### Error: "CORS policy"
**Solución:** El servidor ya tiene CORS habilitado. Si persiste, verifica que estés usando `http://localhost:3000` y no otra URL.

### Error: "Cannot connect to database"
**Solución:** Verifica que PostgreSQL esté corriendo:
```bash
# Windows
Get-Service postgresql*
```

---

## 📞 Ayuda Adicional

Si tienes problemas:

1. **Revisa los logs del servidor** en la terminal donde ejecutaste `npm run dev`
2. **Revisa la consola del navegador** (F12 → Console) para ver errores
3. **Verifica las credenciales** en el archivo `.env` del backend
4. **Ejecuta los tests automatizados:**
   ```bash
   cd backend
   node scripts/test-inventory.js
   ```

---

## ✅ Resultado Esperado

Si todo funciona correctamente, deberías ver:

- ✅ Servidor respondiendo en menos de 1 segundo
- ✅ Login exitoso con token válido
- ✅ Dashboard mostrando estadísticas reales
- ✅ Productos listándose correctamente
- ✅ Alertas detectando stock bajo y agotados
- ✅ Movimientos registrándose automáticamente
- ✅ Reportes generándose con datos actualizados

---

**¡Listo!** Ahora puedes validar todas las funcionalidades del backend desde el frontend de forma visual e interactiva.

