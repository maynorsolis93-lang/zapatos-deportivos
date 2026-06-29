# Calzados Hermanos Solis - Sistema de Inventario y Tienda Online

Sistema completo de gestión de inventario con tienda online y panel administrativo.
Incluye frontend público para clientes, backend con API REST, y panel de administración completo.

## 🎯 Descripción del Proyecto

### Frontend Público (Clientes)
La tienda permite:
- Mostrar un hero dinámico con promociones destacadas
- Cargar productos en tiempo real desde la API
- Filtrar por tipo de cliente (niños, adolescentes, damas, caballeros) y categoría
- Ver detalle de cada producto en modal
- Enviar pedidos por WhatsApp mediante formulario
- Catálogo actualizado automáticamente con el inventario

### Backend (API REST)
Sistema de inventario completo:
- Autenticación con JWT
- CRUD de productos con variantes por talla
- Gestión de inventario con trazabilidad
- Sistema de pedidos con descuento automático de stock
- Alertas de stock bajo
- API pública para el catálogo

### Panel Administrativo
Interfaz completa para administradores:
- Dashboard con estadísticas en tiempo real
- Gestión de productos e inventario
- Gestión de pedidos (confirmar/cancelar)
- Alertas de stock bajo y sin stock
- Vista previa del catálogo público
- Historial de movimientos de inventario

## 🛠️ Tecnologías Usadas

### Frontend
- **HTML5** - Estructura semántica
- **CSS3** - Estilos y responsive design
- **JavaScript ES6+** - Lógica de UI y render dinámico
- **Vite** - Entorno de desarrollo y build
- **Vercel** - Despliegue a producción

### Backend
- **Node.js** - Runtime de JavaScript
- **Express** - Framework web
- **Prisma** - ORM para PostgreSQL
- **PostgreSQL** - Base de datos relacional
- **JWT** - Autenticación
- **bcrypt** - Hash de contraseñas

### Panel Admin
- **HTML5/CSS3/JavaScript** - Interfaz administrativa
- **Fetch API** - Consumo de APIs
- **LocalStorage** - Persistencia de sesión

## 📁 Estructura Principal

```text
.
├── admin/                      # Panel administrativo
│   ├── index.html             # Interfaz del panel
│   ├── css/
│   │   └── admin.css         # Estilos del panel
│   ├── js/
│   │   └── admin.js          # Lógica del panel
│   └── README.md             # Documentación del panel
├── backend/                    # API REST y base de datos
│   ├── index.js              # Servidor Express
│   ├── prisma/
│   │   ├── schema.prisma     # Esquema de base de datos
│   │   └── seed.js           # Datos iniciales
│   ├── src/
│   │   ├── middleware/       # Autenticación
│   │   └── routes/           # Endpoints de la API
│   └── scripts/              # Scripts de utilidad
├── css/
│   └── styles.css            # Estilos del frontend público
├── js/
│   └── main.js               # Lógica del frontend público
├── imagenes/                  # Imágenes de productos
├── public/
│   └── data/
│       └── store.json        # Fallback de datos
├── documentacion/            # Documentación del proyecto
├── index.html                # Landing page pública
├── package.json
├── vite.config.js
└── vercel.json
```

## 🚀 Ejecución Local

### 1. Configurar Base de Datos

```bash
cd backend
cp .env.example .env
# Editar .env con tus credenciales de PostgreSQL
```

### 2. Instalar Dependencias

```bash
# Backend
cd backend
npm install

# Frontend
cd ..
npm install
```

### 3. Configurar Base de Datos

```bash
cd backend
npm run db:setup
# Esto ejecuta: migrate + generate + seed + import
```

### 4. Iniciar Servicios

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
# Servidor en http://localhost:3000
```

**Terminal 2 - Frontend:**
```bash
npm run dev
# Servidor en http://localhost:5173
```

### 5. Acceder a las Aplicaciones

- **Frontend Público:** `http://localhost:5173`
- **Panel Admin:** `http://localhost:5173/admin/`
- **API Backend:** `http://localhost:3000`

### 6. Credenciales de Admin

- **Email:** `maymesm@yahoo.com`
- **Contraseña:** `Solislidia123`

## 📜 Scripts Disponibles

### Frontend
- `npm run dev` - Inicia servidor de desarrollo con recarga en caliente
- `npm run build` - Genera build optimizada en la carpeta `dist/`
- `npm run preview` - Previsualiza la build de producción en local

### Backend
- `npm run dev` - Inicia servidor con nodemon (auto-reload)
- `npm run start` - Inicia servidor en producción
- `npm run db:migrate` - Ejecuta migraciones de base de datos
- `npm run db:generate` - Genera cliente de Prisma
- `npm run db:seed` - Carga datos iniciales (categorías, audiencias, tallas)
- `npm run db:import` - Importa productos desde store.json
- `npm run db:setup` - Ejecuta todo el setup (migrate + generate + seed + import)
- `npm run db:reset` - Resetea la base de datos (¡cuidado en producción!)
- `npm run db:verify` - Verifica el estado de la base de datos

## 🌐 Despliegue en Vercel

### Frontend
Este proyecto ya está preparado para Vercel.

1. Ejecutar build local: `npm run build`
2. Conectar repositorio en Vercel
3. Configurar:
   - Build command: `npm run build`
   - Output directory: `dist`

### Backend
El backend puede desplegarse en:
- **Vercel** (serverless)
- **Railway** (recomendado para PostgreSQL)
- **Heroku**
- **DigitalOcean**

**Variables de entorno requeridas:**
```
DATABASE_URL=postgresql://...
JWT_SECRET=tu-secreto-seguro
JWT_REFRESH_SECRET=otro-secreto-seguro
NODE_ENV=production
```

## 📊 Características Implementadas

### ✅ Etapa 1: Base de Datos y Migraciones
- Esquema completo en PostgreSQL
- 13 tablas relacionales
- Migraciones con Prisma
- Seed de datos maestros
- Importador desde JSON

### ✅ Etapa 2: Autenticación
- Login con JWT
- Tokens de acceso y refresh
- Middleware de autenticación
- Hash de contraseñas con bcrypt
- Protección de rutas privadas

### ✅ Etapa 3: CRUD de Productos
- Crear, leer, actualizar, eliminar productos
- Gestión de variantes por talla
- Ajuste de stock con validaciones
- Registro de movimientos de inventario
- Soft delete (isActive)

### ✅ Etapa 4: Inventario y Alertas
- Historial de movimientos
- Filtros avanzados
- Alertas de stock bajo
- Productos sin stock
- Reportes de inventario

### ✅ Etapa 5: Pedidos
- Crear pedidos con reserva de stock
- Confirmar pedidos (descuenta stock)
- Cancelar pedidos (libera stock)
- Estados de pedido
- Historial de cambios

### ✅ Etapa 6: Catálogo Público
- API pública sin autenticación
- Filtros por audiencia y tipo
- Stock en tiempo real
- Integración con frontend
- Fallback a JSON

### ✅ Panel Administrativo
- Dashboard con estadísticas
- Gestión de productos
- Gestión de inventario
- Gestión de pedidos
- Alertas de stock
- Vista previa del catálogo

## 📚 Documentación

- **Panel Admin:** `admin/README.md`
- **Inicio Rápido:** `INICIO-RAPIDO-ADMIN.md`
- **Panel Completado:** `PANEL-ADMIN-COMPLETADO.md`
- **Etapas Completadas:** `backend/ETAPA-X-COMPLETADA.md`
- **Resúmenes:** `RESUMEN-ETAPA-X.md`
- **Plan de Ejecución:** `documentacion/02-plan-ejecucion-por-etapas.md`

## 🔧 Comandos Rápidos

### Desarrollo
```bash
# Iniciar todo
npm run dev          # Terminal 1: Frontend
cd backend && npm run dev  # Terminal 2: Backend

# Acceder
http://localhost:5173        # Frontend público
http://localhost:5173/admin/ # Panel admin
http://localhost:3000        # API backend
```

### Base de Datos
```bash
cd backend
npm run db:setup     # Setup completo
npm run db:verify    # Verificar estado
npm run db:reset     # Resetear (¡cuidado!)
```

### Testing
```bash
cd backend
node scripts/test-auth.js       # Test autenticación
node scripts/test-products-crud.js  # Test productos
node scripts/test-inventory.js  # Test inventario
node scripts/test-orders.js     # Test pedidos
node scripts/test-catalog.js    # Test catálogo
```

## Estado actual

- Proyecto frontend funcional para demo y evaluacion universitaria.
- Datos de catalogo desacoplados en `public/data/store.json`.
- Sin backend ni persistencia transaccional en esta version.
#   t i e n d a - z a p a t o s - s o l i s 
 
 

## 🎯 Estado Actual

### ✅ Completado
- ✅ Frontend público funcional con catálogo en tiempo real
- ✅ Backend con API REST completa
- ✅ Base de datos PostgreSQL con 13 tablas
- ✅ Sistema de autenticación con JWT
- ✅ CRUD completo de productos
- ✅ Gestión de inventario con trazabilidad
- ✅ Sistema de pedidos con descuento automático de stock
- ✅ Alertas de stock bajo y sin stock
- ✅ API pública para catálogo
- ✅ Panel administrativo completo
- ✅ 6 vistas administrativas funcionales
- ✅ Integración completa frontend-backend

### 🚀 Próximas Mejoras
- [ ] Crear/editar productos desde el panel admin
- [ ] Subir imágenes de productos
- [ ] Reportes y gráficas
- [ ] Exportar datos a Excel/CSV
- [ ] Notificaciones en tiempo real
- [ ] Gestión de usuarios admin
- [ ] Integración con pasarelas de pago
- [ ] App móvil (React Native)

## 🔐 Seguridad

- ✅ Autenticación con JWT
- ✅ Hash de contraseñas con bcrypt
- ✅ Protección de rutas privadas
- ✅ Validación de datos
- ✅ CORS configurado
- ✅ Variables de entorno
- ✅ Tokens con expiración

## 📞 Soporte

**Sistema:** Kiro Shoes Inventory Management  
**Versión:** 1.0.0  
**Fecha:** 26 de mayo de 2026

Para soporte técnico, consultar la documentación en:
- `admin/README.md` - Panel administrativo
- `INICIO-RAPIDO-ADMIN.md` - Guía de inicio rápido
- `PANEL-ADMIN-COMPLETADO.md` - Documentación completa

## 📄 Licencia

© 2026 Calzados Hermanos Solis. Todos los derechos reservados.
