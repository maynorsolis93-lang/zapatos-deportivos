# Roadmap modulo privado de inventario

Este documento define la planeacion para transformar la landing de `kiro-shoes` en un sitio con modulo privado de inventario.

## 1) Diagnostico actual del proyecto

- Frontend estatico con `Vite` (`index.html`, `js/main.js`, `public/data/store.json`).
- Catalogo y pedido via WhatsApp sin persistencia real de pedidos.
- Sin login, sin API y sin base de datos.
- Catalogo grande administrado manualmente en JSON.

## 2) Objetivo funcional

Implementar un **panel privado** para administracion de inventario que permita:

- Iniciar sesion (solo admins autorizados).
- Gestionar productos (crear, editar, eliminar, activar/desactivar).
- Gestionar stock por talla.
- Ver movimientos de inventario (entradas, salidas, ajustes).
- Registrar pedidos y descontar inventario.
- Mantener la landing publica alimentada por datos reales desde la base de datos.

## 3) Stack recomendado (alineado a tu proyecto)

Como ya usas JavaScript con Vite, la ruta mas simple y mantenible es:

- **Frontend publico**: Vite (actual).
- **Backend API**: Node.js + Express.
- **Base de datos**: PostgreSQL (produccion) o SQLite (desarrollo rapido).
- **Auth admin**: JWT con refresh token o sesion HTTPOnly.
- **ORM**: Prisma.

Nota: si prefieres PHP (por specs previas), se puede adaptar. Este roadmap asume Node para reducir complejidad de integracion con tu frontend actual.

## 4) Fases de implementacion (paso a paso)

### Fase 0 - Definicion y preparacion (1 dia)

1. Confirmar stack final (Node + Express + PostgreSQL + Prisma).
2. Definir ambientes: local, staging y produccion.
3. Crear carpeta `backend/` y estructura base.
4. Definir variables de entorno (`.env.example`).

**Entregable:** proyecto backend inicializado y ejecutando endpoint `/health`.

### Fase 1 - Esquema de base de datos (1-2 dias)

1. Crear modelo relacional de usuarios admin, productos, tallas, inventario, pedidos y movimientos.
2. Definir llaves foraneas, indices y restricciones.
3. Crear migracion inicial.
4. Cargar seed inicial desde tu `store.json`.

**Entregable:** DB migrada + datos iniciales + script de seed.

### Fase 2 - Autenticacion y seguridad del modulo privado (1-2 dias)

1. Login de admin.
2. Middleware de autorizacion para rutas privadas.
3. Politicas basicas de seguridad (rate limit, CORS, validaciones, hash de password).
4. Auditoria minima (quien hizo cambios de inventario).

**Entregable:** acceso privado funcional y seguro.

### Fase 3 - CRUD de productos + tallas + stock (2-4 dias)

1. Endpoints para crear, editar, listar y desactivar productos.
2. Gestion de tallas por producto.
3. Ajuste de inventario por talla.
4. Subida y relacion de imagenes.

**Entregable:** inventario administrable desde panel privado.

### Fase 4 - Movimientos de inventario y trazabilidad (1-2 dias)

1. Registrar entradas, salidas y ajustes con motivo.
2. Historial de movimientos por producto/talla.
3. Reporte de stock bajo.

**Entregable:** control real y auditable del inventario.

### Fase 5 - Pedidos y descuento automatico de stock (2-3 dias)

1. Registrar pedidos desde formulario (en vez de solo WhatsApp).
2. Descontar inventario al confirmar pedido.
3. Gestion de estados de pedido (pendiente, confirmado, enviado, cancelado).
4. Revertir stock ante cancelaciones.

**Entregable:** flujo pedido-inventario integrado.

### Fase 6 - Integracion con landing publica (1-2 dias)

1. Reemplazar `store.json` por consumo de API publica de productos activos.
2. Mostrar disponibilidad real por talla o estado de stock.
3. Mantener compatibilidad visual actual.

**Entregable:** landing conectada a datos reales.

### Fase 7 - Pruebas, hardening y despliegue (1-2 dias)

1. Pruebas funcionales de login, inventario y pedidos.
2. Validar flujos de concurrencia (evitar stock negativo).
3. Configurar despliegue en Vercel (frontend) + backend/db (Railway/Render/Supabase).
4. Monitoreo y respaldos.

**Entregable:** modulo listo para operacion.

## 5) Criterios de exito

- Solo usuarios admin pueden entrar al panel.
- Todo cambio de stock queda registrado.
- No se permite stock negativo.
- Landing publica refleja catalogo real.
- Flujo de pedido actualizable sin editar JSON manualmente.

## 6) Riesgos y mitigacion

- **Riesgo:** mezcla de rutas publicas y admin en un solo frontend.
  - **Mitigacion:** separar claramente `admin/` y consumir API privada.
- **Riesgo:** errores de inventario por concurrencia.
  - **Mitigacion:** transacciones y validaciones atomicas en DB.
- **Riesgo:** crecimiento de imagenes y peso del repo.
  - **Mitigacion:** mover media a bucket (Cloudinary/S3) en fases posteriores.
