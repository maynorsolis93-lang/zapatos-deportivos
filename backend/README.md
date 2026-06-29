# Backend - Kiro Shoes Inventory System

Sistema de gestión de inventario para Calzados Hermanos Solis.

## ✅ Estado: Etapa 1 COMPLETADA

- ✅ Base de datos PostgreSQL configurada
- ✅ 78 productos importados
- ✅ Datos maestros cargados (categorías, audiencias, tallas)
- ✅ Usuarios administradores creados
- ✅ Servidor backend funcionando

Ver detalles completos en: [ETAPA-1-COMPLETADA.md](./ETAPA-1-COMPLETADA.md)

---

## 📋 Requisitos

- Node.js 18+
- PostgreSQL 12+ (corriendo en `localhost:5432`)

---

## 🚀 Inicio rápido

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar variables de entorno
Edita el archivo `.env` con tus credenciales de PostgreSQL:
```env
DATABASE_URL="postgresql://postgres:TU_PASSWORD@localhost:5432/kiro_inventory?schema=public"
PORT=3000
JWT_SECRET="tu_secreto_jwt_aqui"
```

### 3. Ejecutar setup completo (solo primera vez)
```bash
npm run db:setup
```
Este comando ejecuta:
- Migraciones de base de datos
- Seed de datos maestros
- Importación de productos
- Generación del cliente Prisma

### 4. Iniciar servidor
```bash
# Desarrollo (con auto-reload)
npm run dev

# Producción
npm start
```

El servidor estará disponible en: `http://localhost:3000`

---

## 📜 Scripts disponibles

### Base de datos
- `npm run db:migrate` - Crear/aplicar migraciones
- `npm run db:generate` - Generar cliente de Prisma
- `npm run db:seed` - Ejecutar seed de datos maestros
- `npm run db:import` - Importar productos desde `store.json`
- `npm run db:setup` - Ejecutar todo el setup completo

### Servidor
- `npm start` - Iniciar servidor en producción
- `npm run dev` - Iniciar servidor en desarrollo (con nodemon)

### Utilidades
- `node scripts/verify-setup.js` - Verificar que todo esté configurado correctamente
- `node scripts/create-admin.js` - Crear usuario administrador adicional

---

## 🔐 Credenciales de acceso

### Usuario Admin Principal
- **Email:** `maymesm@yahoo.com`
- **Password:** `Solislidia123`
- **Tipo:** Usuario con bcrypt (seguro)

### Usuario Admin Temporal
- **Email:** `admin@kiroshoes.local`
- **Password:** `Admin12345`
- **Tipo:** Usuario con SHA256 (temporal, se actualizará en Etapa 2)

---

## 🧪 Probar la API

### Endpoint de salud
```bash
curl http://localhost:3000/health
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"maymesm@yahoo.com","password":"Solislidia123"}'
```

### Verificar setup
```bash
node scripts/verify-setup.js
```

---

## 📊 Estructura de la base de datos

### Tablas principales
- `AdminUser` - Usuarios administradores
- `Category` - Categorías (deportivos, casuales, formales)
- `Audience` - Audiencias (niños, adolescentes, damas, caballeros)
- `Product` - Productos del catálogo
- `ProductImage` - Imágenes de productos
- `Size` - Tallas disponibles (20-45)
- `ProductVariant` - Variantes de productos por talla con stock
- `InventoryMovement` - Movimientos de inventario
- `Customer` - Clientes
- `Order` - Pedidos
- `OrderItem` - Items de pedidos
- `OrderStatusHistory` - Historial de estados

---

## 📁 Estructura de carpetas

```
backend/
├── prisma/
│   ├── migrations/        # Migraciones de base de datos
│   ├── schema.prisma      # Esquema de Prisma
│   └── seed.js           # Script de seed
├── scripts/
│   ├── create-admin.js   # Crear usuario admin
│   ├── import-store-json.js  # Importar productos
│   └── verify-setup.js   # Verificar configuración
├── src/
│   └── routes/
│       └── auth.js       # Rutas de autenticación
├── .env                  # Variables de entorno
├── index.js             # Servidor Express
└── package.json         # Dependencias
```

---

## 🎯 Próximos pasos

La Etapa 1 está completada. Para continuar:

```
"Desarrolla la Etapa 2: autenticacion admin y proteccion de rutas privadas"
```

---

## ⚠️ Notas importantes

1. **Seguridad:** Cambia las credenciales por defecto antes de desplegar a producción.

2. **Base de datos:** Actualmente usa PostgreSQL local. Para producción, configura una base de datos en la nube.

3. **Backup:** Haz backup de la base de datos antes de ejecutar migraciones en producción.

4. **Scripts sensibles:** El archivo `scripts/create-admin.js` contiene credenciales. Protégelo o elimínalo después de usarlo.

---

## 📞 Soporte

Para problemas o preguntas sobre el backend, consulta la documentación en:
- [Roadmap completo](../documentacion/00-roadmap-modulo-privado.md)
- [Plan de ejecución](../documentacion/02-plan-ejecucion-por-etapas.md)
- [Etapa 1 completada](./ETAPA-1-COMPLETADA.md)
