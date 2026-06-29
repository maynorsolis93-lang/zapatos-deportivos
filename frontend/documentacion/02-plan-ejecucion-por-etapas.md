# Plan de ejecucion por etapas

Usa este documento para pedirme la siguiente etapa de forma ordenada.  
Cada etapa incluye objetivo, tareas, entregables y el texto sugerido para solicitarla.

## Etapa 1 - Base de datos y migraciones

**Objetivo**
- Implementar el esquema del archivo `01-esquema-base-datos.sql` en el stack elegido.

**Tareas**
- Configurar ORM (Prisma recomendado).
- Crear migracion inicial.
- Crear seed de tablas maestras (categorias, audiencias, tallas).
- Importar productos actuales desde `public/data/store.json`.

**Entregables**
- Carpeta de migraciones.
- Script de seed.
- Script de importacion desde JSON.

**Como pedirmelo**
- "Desarrolla la Etapa 1: configura DB + migracion + seed + importador desde store.json".

---

## Etapa 2 - Autenticacion y modulo privado base

**Objetivo**
- Habilitar acceso privado para administradores.

**Tareas**
- Endpoints de login/logout/refresh.
- Proteccion de rutas privadas con middleware.
- Password hashing (bcrypt/argon2).
- Pantalla inicial de login admin.

**Entregables**
- API auth funcional.
- Vista admin login.
- Primer usuario admin (seed o script CLI).

**Como pedirmelo**
- "Desarrolla la Etapa 2: autenticacion admin y proteccion de rutas privadas".

---

## Etapa 3 - CRUD de productos y stock por talla

**Objetivo**
- Administrar catalogo y stock real desde panel privado.

**Tareas**
- CRUD de productos.
- Gestion de imagenes (URL o upload).
- Gestion de variantes por talla.
- Validaciones de negocio (no stock negativo).

**Entregables**
- Endpoints + UI admin productos.
- Registro de cambios de stock.

**Como pedirmelo**
- "Desarrolla la Etapa 3: CRUD de productos con stock por talla".

---

## Etapa 4 - Movimientos de inventario y alertas

**Objetivo**
- Tener trazabilidad completa de inventario.

**Tareas**
- Registrar entradas, salidas, ajustes.
- Vista historial por producto y por fecha.
- Alertas de stock bajo.

**Entregables**
- Modulo de movimientos.
- Reporte de bajo inventario.

**Como pedirmelo**
- "Desarrolla la Etapa 4: movimientos de inventario y alertas de stock bajo".

---

## Etapa 5 - Pedidos integrados e impacto en inventario

**Objetivo**
- Conectar pedidos con descuento automatico de stock.

**Tareas**
- Guardar pedidos del formulario en DB.
- Confirmar pedido y descontar stock en transaccion.
- Estados de pedido y reversa de stock al cancelar.

**Entregables**
- API de pedidos.
- Actualizacion de formulario frontend.
- Historial de estados.

**Como pedirmelo**
- "Desarrolla la Etapa 5: pedidos con descuento automatico de inventario".

---

## Etapa 6 - Integrar landing publica con API

**Objetivo**
- Eliminar dependencia directa de `store.json`.

**Tareas**
- Endpoint publico de catalogo.
- Reemplazar carga JSON en `js/main.js` por API.
- Mantener misma experiencia visual.

**Entregables**
- Landing leyendo productos reales.
- Fallback de errores para no romper la pagina.

**Como pedirmelo**
- "Desarrolla la Etapa 6: conectar landing publica a API de catalogo".

---

## Etapa 7 - Pruebas, despliegue y operacion

**Objetivo**
- Dejar el sistema listo para uso diario.

**Tareas**
- Pruebas funcionales de punta a punta.
- Endurecimiento de seguridad.
- Configurar despliegue y variables.
- Checklist operativo (backup y monitoreo).

**Entregables**
- Sistema desplegado.
- Guia de operacion para administradores.

**Como pedirmelo**
- "Desarrolla la Etapa 7: pruebas finales, seguridad y despliegue productivo".

---

## Recomendacion de orden de trabajo

1. Etapa 1  
2. Etapa 2  
3. Etapa 3  
4. Etapa 4  
5. Etapa 5  
6. Etapa 6  
7. Etapa 7
