# ⚡ Comandos Rápidos - Backend Kiro Shoes

## 🚀 Inicio Rápido

### Iniciar servidor (desarrollo)
```bash
cd backend
npm run dev
```

### Iniciar servidor (producción)
```bash
cd backend
npm start
```

---

## 🔍 Verificación

### Verificar que todo funciona
```bash
cd backend
npm run db:verify
```

### Probar autenticación (Etapa 2)
```bash
cd backend
node scripts/test-auth.js
```

### Probar CRUD de productos (Etapa 3)
```bash
cd backend
node scripts/test-products-crud.js
```

### Probar inventario y alertas (Etapa 4)
```bash
cd backend
node scripts/test-inventory.js
```

### Probar pedidos (Etapa 5)
```bash
cd backend
node scripts/test-orders.js
```

### Probar catálogo público (Etapa 6)
```bash
cd backend
node scripts/test-catalog.js
```

### Probar endpoint de salud
```bash
curl http://localhost:3000/health
```

### Probar login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"maymesm@yahoo.com\",\"password\":\"Solislidia123\"}"
```

---

## 🗄️ Base de Datos

### Resetear base de datos (¡CUIDADO! Borra todo)
```bash
cd backend
npm run db:reset
```

### Ejecutar migraciones
```bash
cd backend
npm run db:migrate
```

### Ejecutar seed
```bash
cd backend
npm run db:seed
```

### Importar productos
```bash
cd backend
npm run db:import
```

### Setup completo (primera vez)
```bash
cd backend
npm run db:setup
```

---

## 👤 Usuarios

### Crear usuario admin con bcrypt
```bash
cd backend
node scripts/create-bcrypt-admin.js
```

### Ver usuarios en la base de datos
```bash
cd backend
node scripts/check-users.js
```

---

## 📦 Endpoints API

### Autenticación (Etapa 2)
```
POST /api/auth/login            - Login de administradores
POST /api/auth/refresh          - Renovar access token
POST /api/auth/logout           - Cerrar sesión
GET  /api/auth/me               - Información del usuario autenticado
```

### Dashboard Admin (Etapa 2)
```
GET  /api/admin/dashboard       - Dashboard con estadísticas
GET  /api/admin/products        - Listar productos (paginado)
GET  /api/admin/products/:id    - Obtener producto específico
GET  /api/admin/inventory/low-stock - Productos con stock bajo
GET  /api/admin/users           - Listar usuarios admin
```

### CRUD Productos (Etapa 3)
```
POST   /api/products                              - Crear producto
PUT    /api/products/:id                          - Actualizar producto
DELETE /api/products/:id                          - Desactivar producto
POST   /api/products/:id/variants/:variantId/stock - Ajustar stock
GET    /api/products/:id/variants/:variantId/movements - Historial de movimientos
```

### Inventario y Alertas (Etapa 4)
```
GET  /api/inventory/movements                     - Historial de movimientos (con filtros)
GET  /api/inventory/movements/summary             - Resumen de movimientos
GET  /api/inventory/low-stock                     - Productos con stock bajo
GET  /api/inventory/out-of-stock                  - Productos agotados
GET  /api/inventory/alerts                        - Todas las alertas
GET  /api/inventory/stock-report                  - Reporte completo de inventario
```

### Pedidos (Etapa 5)
```
POST /api/orders                                  - Crear pedido y reservar stock
GET  /api/orders                                  - Listar pedidos (con filtros)
GET  /api/orders/:id                              - Obtener detalles de pedido
POST /api/orders/:id/confirm                      - Confirmar pedido y descontar stock
POST /api/orders/:id/cancel                       - Cancelar pedido y liberar/devolver stock
POST /api/orders/:id/status                       - Cambiar estado (shipped, delivered)
GET  /api/orders/stats/summary                    - Estadísticas de pedidos
```

### Catálogo Público (Etapa 6) - SIN AUTENTICACIÓN
```
GET  /api/catalog/products                        - Catálogo público de productos
GET  /api/catalog/hero-slides                     - Slides de portada
GET  /api/catalog/categories                      - Categorías disponibles
GET  /api/catalog/audiences                       - Audiencias disponibles
```

### Salud
```
GET  /health                    - Estado del servidor
GET  /                          - Info de la API
```

---

## 🔧 PostgreSQL (psql)

### Conectar a la base de datos
```bash
psql -U postgres -d kiro_inventory
```

### Ver todas las tablas
```sql
\dt
```

### Contar productos
```sql
SELECT COUNT(*) FROM "Product";
```

### Ver productos activos
```sql
SELECT id, name, "basePrice", badge FROM "Product" WHERE "isActive" = true LIMIT 10;
```

### Ver usuarios admin
```sql
SELECT email, "fullName", role FROM "AdminUser";
```

### Ver categorías
```sql
SELECT * FROM "Category";
```

### Ver audiencias
```sql
SELECT * FROM "Audience";
```

### Ver tallas
```sql
SELECT code FROM "Size" ORDER BY "sortOrder";
```

### Ver stock por producto
```sql
SELECT 
  p.name, 
  s.code as talla, 
  pv."stockQty" as stock
FROM "ProductVariant" pv
JOIN "Product" p ON pv."productId" = p.id
JOIN "Size" s ON pv."sizeId" = s.id
WHERE p.id = 1;
```

### Ver movimientos de inventario
```sql
SELECT 
  p.name as producto,
  s.code as talla,
  im."movementType" as tipo,
  im.quantity as cantidad,
  im.reason as razon,
  im."createdAt" as fecha,
  au."fullName" as usuario
FROM "InventoryMovement" im
JOIN "ProductVariant" pv ON im."variantId" = pv.id
JOIN "Product" p ON pv."productId" = p.id
JOIN "Size" s ON pv."sizeId" = s.id
LEFT JOIN "AdminUser" au ON im."createdBy" = au.id
ORDER BY im."createdAt" DESC
LIMIT 20;
```

### Ver pedidos
```sql
SELECT 
  o.id,
  o.status,
  o.total,
  c."fullName" as cliente,
  c.phone,
  o."createdAt"
FROM "Order" o
JOIN "Customer" c ON o."customerId" = c.id
ORDER BY o."createdAt" DESC
LIMIT 20;
```

### Ver items de un pedido
```sql
SELECT 
  oi.quantity,
  oi."unitPrice",
  oi."lineTotal",
  p.name as producto,
  s.code as talla
FROM "OrderItem" oi
JOIN "Product" p ON oi."productId" = p.id
JOIN "ProductVariant" pv ON oi."variantId" = pv.id
JOIN "Size" s ON pv."sizeId" = s.id
WHERE oi."orderId" = 1;
```

### Ver historial de estados de un pedido
```sql
SELECT 
  osh."oldStatus",
  osh."newStatus",
  osh.note,
  osh."changedAt",
  au."fullName" as admin
FROM "OrderStatusHistory" osh
LEFT JOIN "AdminUser" au ON osh."changedBy" = au.id
WHERE osh."orderId" = 1
ORDER BY osh."changedAt" DESC;
```

---

## 📊 Consultas Útiles

### Productos más populares (con badge)
```sql
SELECT name, badge, "basePrice" 
FROM "Product" 
WHERE badge IS NOT NULL 
ORDER BY name;
```

### Productos por categoría
```sql
SELECT c.label as categoria, COUNT(p.id) as total
FROM "Product" p
JOIN "Category" c ON p."categoryId" = c.id
GROUP BY c.label;
```

### Productos por audiencia
```sql
SELECT a.label as audiencia, COUNT(p.id) as total
FROM "Product" p
JOIN "Audience" a ON p."audienceId" = a.id
GROUP BY a.label;
```

### Stock total por producto
```sql
SELECT 
  p.name,
  SUM(pv."stockQty") as stock_total
FROM "Product" p
LEFT JOIN "ProductVariant" pv ON p.id = pv."productId"
GROUP BY p.id, p.name
ORDER BY stock_total DESC
LIMIT 10;
```

### Productos con stock bajo
```sql
SELECT 
  p.name,
  s.code as talla,
  pv."stockQty" as stock
FROM "ProductVariant" pv
JOIN "Product" p ON pv."productId" = p.id
JOIN "Size" s ON pv."sizeId" = s.id
WHERE pv."stockQty" <= 5
ORDER BY pv."stockQty" ASC;
```

---

## 🛠️ Troubleshooting

### Error: "Cannot connect to database"
```bash
# Verificar que PostgreSQL esté corriendo
# Windows:
Get-Service postgresql*

# Si no está corriendo, iniciarlo:
Start-Service postgresql-x64-14  # Ajusta el nombre según tu versión
```

### Error: "Port 3000 already in use"
```bash
# Encontrar el proceso usando el puerto
netstat -ano | findstr :3000

# Matar el proceso (reemplaza PID con el número que aparece)
taskkill /PID <PID> /F
```

### Error: "Prisma Client not generated"
```bash
cd backend
npm run db:generate
```

### Resetear todo y empezar de cero
```bash
cd backend
npm run db:reset
npm run db:setup
node scripts/create-bcrypt-admin.js
```

---

## 📝 Notas

- **Puerto del servidor:** 3000
- **Puerto de PostgreSQL:** 5432
- **Base de datos:** kiro_inventory
- **Usuario PostgreSQL:** postgres

---

## 🔐 Credenciales

### Usuario Admin Principal (bcrypt)
- Email: `maymesm@yahoo.com`
- Password: `Solislidia123`

### Usuario Admin Temporal (SHA256)
- Email: `admin@kiroshoes.local`
- Password: `Admin12345`

---

## 📞 Ayuda

Si algo no funciona:
1. Verifica que PostgreSQL esté corriendo
2. Verifica que las credenciales en `.env` sean correctas
3. Ejecuta `npm run db:verify` para diagnosticar
4. Ejecuta los scripts de prueba para verificar funcionalidad
5. Revisa los logs del servidor en la terminal

---

## ✅ Etapas Completadas

- ✅ **Etapa 1:** Base de datos y migraciones
- ✅ **Etapa 2:** Autenticación y protección de rutas
- ✅ **Etapa 3:** CRUD de productos y stock por talla
- ✅ **Etapa 4:** Movimientos de inventario y alertas
- ✅ **Etapa 5:** Pedidos con descuento automático de inventario
- ✅ **Etapa 6:** Conectar landing pública a API de catálogo
- ⏳ **Etapa 7:** Pruebas finales, seguridad y despliegue productivo (próxima)
