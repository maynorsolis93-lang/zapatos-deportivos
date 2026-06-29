# ✅ ETAPA 5 COMPLETADA - Pedidos con Descuento Automático de Inventario

**Fecha de completación:** 26 de mayo de 2026

---

## 🎯 Objetivo Cumplido

Sistema completo de gestión de pedidos con:
- Creación de pedidos con reserva automática de stock
- Confirmación de pedidos con descuento definitivo de inventario
- Cancelación de pedidos con liberación/devolución de stock
- Gestión de estados del pedido (pending → confirmed → shipped → delivered)
- Historial completo de cambios de estado
- Estadísticas y reportes de pedidos
- Integración total con sistema de inventario

---

## 📦 Endpoints Implementados

### **Gestión de Pedidos**

#### 1. **POST /api/orders**
Crear un nuevo pedido y reservar stock automáticamente.

**Request Body:**
```json
{
  "customer": {
    "fullName": "Juan Pérez",
    "phone": "8095551234",
    "city": "Santo Domingo",
    "address": "Calle Principal #123"
  },
  "items": [
    {
      "productId": 1,
      "variantId": 5,
      "quantity": 2
    }
  ],
  "notes": "Entrega urgente",
  "source": "web"
}
```

**Response:**
```json
{
  "message": "Pedido creado exitosamente",
  "order": {
    "id": 1,
    "status": "pending",
    "subtotal": "300.00",
    "discount": "0.00",
    "total": "300.00",
    "customer": {
      "id": 1,
      "fullName": "Juan Pérez",
      "phone": "8095551234"
    },
    "items": [
      {
        "id": 1,
        "quantity": 2,
        "unitPrice": "150.00",
        "lineTotal": "300.00",
        "product": {
          "id": 1,
          "name": "Zapato Casual",
          "sku": "ZC001"
        },
        "variant": {
          "id": 5,
          "size": {
            "code": "40"
          }
        }
      }
    ],
    "statusHistory": [
      {
        "id": 1,
        "oldStatus": null,
        "newStatus": "pending",
        "note": "Pedido creado",
        "changedAt": "2026-05-26T10:00:00.000Z"
      }
    ]
  }
}
```

**Características:**
- Crea o actualiza cliente automáticamente por teléfono
- Valida disponibilidad de stock antes de crear el pedido
- Reserva stock (incrementa `reservedQty`) sin descontarlo aún
- Calcula subtotal y total automáticamente
- Registra estado inicial en historial
- Transacción atómica (todo o nada)

**Validaciones:**
- Cliente debe tener `fullName` y `phone`
- Debe incluir al menos un item
- Cada item debe tener `productId`, `variantId`, `quantity`
- Cantidad debe ser mayor a 0
- Stock disponible debe ser suficiente (stockQty - reservedQty >= quantity)
- Producto debe estar activo

---

#### 2. **GET /api/orders**
Listar pedidos con filtros y paginación.

**Query Params:**
- `status` - pending | confirmed | shipped | delivered | cancelled
- `customerId` - ID del cliente
- `startDate` - Fecha inicio (ISO 8601)
- `endDate` - Fecha fin (ISO 8601)
- `page` - Número de página (default: 1)
- `limit` - Items por página (default: 20)

**Response:**
```json
{
  "orders": [
    {
      "id": 1,
      "status": "pending",
      "total": "300.00",
      "createdAt": "2026-05-26T10:00:00.000Z",
      "customer": {
        "id": 1,
        "fullName": "Juan Pérez",
        "phone": "8095551234"
      },
      "items": [
        {
          "quantity": 2,
          "product": {
            "id": 1,
            "name": "Zapato Casual",
            "sku": "ZC001"
          },
          "variant": {
            "size": {
              "code": "40"
            }
          }
        }
      ],
      "_count": {
        "items": 1
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "totalPages": 3
  }
}
```

**Características:**
- Filtros combinables
- Paginación automática
- Ordenado por fecha descendente (más recientes primero)
- Incluye conteo de items por pedido

---

#### 3. **GET /api/orders/:id**
Obtener detalles completos de un pedido específico.

**Response:**
```json
{
  "order": {
    "id": 1,
    "status": "confirmed",
    "subtotal": "300.00",
    "discount": "0.00",
    "total": "300.00",
    "notes": "Entrega urgente",
    "createdAt": "2026-05-26T10:00:00.000Z",
    "customer": {
      "id": 1,
      "fullName": "Juan Pérez",
      "phone": "8095551234",
      "city": "Santo Domingo",
      "address": "Calle Principal #123"
    },
    "items": [
      {
        "id": 1,
        "quantity": 2,
        "unitPrice": "150.00",
        "lineTotal": "300.00",
        "product": {
          "id": 1,
          "name": "Zapato Casual",
          "images": [
            {
              "imageUrl": "imagenes/casuales/1.jpeg"
            }
          ]
        },
        "variant": {
          "id": 5,
          "size": {
            "code": "40"
          }
        }
      }
    ],
    "statusHistory": [
      {
        "id": 2,
        "oldStatus": "pending",
        "newStatus": "confirmed",
        "note": "Pedido confirmado",
        "changedAt": "2026-05-26T11:00:00.000Z",
        "admin": {
          "id": 2,
          "fullName": "Admin Solís",
          "email": "maymesm@yahoo.com"
        }
      },
      {
        "id": 1,
        "oldStatus": null,
        "newStatus": "pending",
        "note": "Pedido creado",
        "changedAt": "2026-05-26T10:00:00.000Z"
      }
    ]
  }
}
```

**Características:**
- Información completa del pedido
- Datos del cliente
- Items con productos e imágenes
- Historial completo de cambios de estado
- Información del admin que realizó cada cambio

---

### **Operaciones de Pedidos**

#### 4. **POST /api/orders/:id/confirm**
Confirmar pedido y descontar stock definitivamente.

**Request Body:**
```json
{
  "note": "Pedido confirmado - Pago recibido"
}
```

**Response:**
```json
{
  "message": "Pedido confirmado y stock descontado exitosamente",
  "order": {
    "id": 1,
    "status": "confirmed",
    "...": "..."
  }
}
```

**Proceso:**
1. Valida que el pedido esté en estado `pending`
2. Verifica que el stock reservado sea suficiente
3. Descuenta stock (`stockQty -= quantity`)
4. Libera reserva (`reservedQty -= quantity`)
5. Registra movimiento de inventario (tipo: salida, razón: venta)
6. Cambia estado a `confirmed`
7. Registra cambio en historial

**Validaciones:**
- Pedido debe existir
- Pedido debe estar en estado `pending`
- Stock reservado debe ser suficiente

---

#### 5. **POST /api/orders/:id/cancel**
Cancelar pedido y liberar/devolver stock.

**Request Body:**
```json
{
  "note": "Cliente canceló el pedido",
  "reason": "cancelled_by_customer"
}
```

**Response:**
```json
{
  "message": "Pedido cancelado y stock liberado exitosamente",
  "order": {
    "id": 1,
    "status": "cancelled",
    "...": "..."
  }
}
```

**Proceso según estado:**

**Si está en `pending`:**
- Solo libera reserva (`reservedQty -= quantity`)
- No modifica stock real

**Si está en `confirmed` o `shipped`:**
- Devuelve stock (`stockQty += quantity`)
- Registra movimiento de inventario (tipo: entrada, razón: devolucion)

**Si está en `delivered`:**
- No se puede cancelar (error)

**Validaciones:**
- Pedido debe existir
- Pedido no debe estar ya cancelado
- Pedido no debe estar entregado

---

#### 6. **POST /api/orders/:id/status**
Cambiar estado del pedido (shipped, delivered).

**Request Body:**
```json
{
  "status": "shipped",
  "note": "Pedido enviado con courier XYZ"
}
```

**Response:**
```json
{
  "message": "Estado del pedido actualizado exitosamente",
  "order": {
    "id": 1,
    "status": "shipped",
    "...": "..."
  }
}
```

**Transiciones válidas:**
- `pending` → `confirmed`, `cancelled`
- `confirmed` → `shipped`, `cancelled`
- `shipped` → `delivered`, `cancelled`
- `delivered` → (ninguna)
- `cancelled` → (ninguna)

**Validaciones:**
- Pedido debe existir
- Estado debe ser válido
- Transición debe ser permitida
- No se puede cambiar a un estado ya establecido

---

### **Estadísticas y Reportes**

#### 7. **GET /api/orders/stats/summary**
Obtener estadísticas de pedidos.

**Query Params:**
- `startDate` - Fecha inicio (ISO 8601)
- `endDate` - Fecha fin (ISO 8601)

**Response:**
```json
{
  "summary": {
    "totalOrders": 150,
    "totalRevenue": 45000.00,
    "averageOrderValue": 300.00,
    "byStatus": {
      "pending": 20,
      "confirmed": 30,
      "shipped": 40,
      "delivered": 50,
      "cancelled": 10
    }
  },
  "period": {
    "startDate": "2026-05-01T00:00:00.000Z",
    "endDate": "2026-05-26T23:59:59.999Z"
  }
}
```

**Características:**
- Total de pedidos
- Ingresos totales
- Valor promedio por pedido
- Distribución por estado
- Filtrable por período

---

## 🔄 Flujo de Estados del Pedido

```
┌─────────┐
│ pending │ ← Pedido creado, stock reservado
└────┬────┘
     │
     ├─→ confirm ─→ ┌───────────┐
     │              │ confirmed │ ← Stock descontado, reserva liberada
     │              └─────┬─────┘
     │                    │
     │                    ├─→ ship ─→ ┌─────────┐
     │                    │            │ shipped │
     │                    │            └────┬────┘
     │                    │                 │
     │                    │                 └─→ deliver ─→ ┌───────────┐
     │                    │                                 │ delivered │ (final)
     │                    │                                 └───────────┘
     │                    │
     └─→ cancel ─────────┴─→ cancel ─→ ┌───────────┐
                                        │ cancelled │ (final)
                                        └───────────┘
```

---

## 💾 Integración con Inventario

### **Reserva de Stock (Crear Pedido)**
```sql
-- Al crear pedido
UPDATE ProductVariant
SET reservedQty = reservedQty + quantity
WHERE id = variantId;

-- Stock disponible = stockQty - reservedQty
```

### **Descuento de Stock (Confirmar Pedido)**
```sql
-- Al confirmar pedido
UPDATE ProductVariant
SET 
  stockQty = stockQty - quantity,
  reservedQty = reservedQty - quantity
WHERE id = variantId;

-- Registrar movimiento
INSERT INTO InventoryMovement (
  variantId, movementType, quantity, reason, referenceType, referenceId
) VALUES (
  variantId, 'salida', quantity, 'venta', 'order', orderId
);
```

### **Liberación de Stock (Cancelar Pedido Pending)**
```sql
-- Si pedido está pending
UPDATE ProductVariant
SET reservedQty = reservedQty - quantity
WHERE id = variantId;
```

### **Devolución de Stock (Cancelar Pedido Confirmed/Shipped)**
```sql
-- Si pedido está confirmed o shipped
UPDATE ProductVariant
SET stockQty = stockQty + quantity
WHERE id = variantId;

-- Registrar movimiento
INSERT INTO InventoryMovement (
  variantId, movementType, quantity, reason, referenceType, referenceId
) VALUES (
  variantId, 'entrada', quantity, 'devolucion', 'order', orderId
);
```

---

## 🧪 Pruebas Realizadas

Se ejecutaron **12 tests** exitosamente:

1. ✅ Login de autenticación
2. ✅ Crear producto de prueba con stock
3. ✅ Crear pedido y reservar stock
4. ✅ Listar pedidos con filtros
5. ✅ Obtener detalles de pedido específico
6. ✅ Confirmar pedido y descontar stock
7. ✅ Crear segundo pedido para probar cancelación
8. ✅ Cambiar estado de pedido (shipped, delivered)
9. ✅ Obtener estadísticas de pedidos
10. ✅ Validar error con stock insuficiente
11. ✅ Verificar movimientos de inventario registrados
12. ✅ Limpiar producto de prueba

**Resultado:** 12/12 tests pasaron ✅

---

## 📁 Archivos Creados/Modificados

### **Nuevos archivos:**
- `backend/src/routes/orders.js` - Rutas de pedidos (~850 líneas)
- `backend/scripts/test-orders.js` - Script de pruebas (~600 líneas)
- `backend/ETAPA-5-COMPLETADA.md` - Este documento

### **Archivos modificados:**
- `backend/index.js` - Agregadas rutas de pedidos
- `backend/src/routes/products.js` - Agregada ruta GET /api/products/:id
- `backend/package.json` - Agregada dependencia axios

---

## 🚀 Cómo Usar

### **Crear un pedido:**
```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "customer": {
      "fullName": "Juan Pérez",
      "phone": "8095551234",
      "city": "Santo Domingo",
      "address": "Calle Principal #123"
    },
    "items": [
      {
        "productId": 1,
        "variantId": 5,
        "quantity": 2
      }
    ],
    "notes": "Entrega urgente"
  }'
```

### **Confirmar pedido:**
```bash
curl -X POST http://localhost:3000/api/orders/1/confirm \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "note": "Pago recibido"
  }'
```

### **Cambiar estado a enviado:**
```bash
curl -X POST http://localhost:3000/api/orders/1/status \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "shipped",
    "note": "Enviado con courier XYZ"
  }'
```

### **Cancelar pedido:**
```bash
curl -X POST http://localhost:3000/api/orders/1/cancel \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "note": "Cliente canceló",
    "reason": "cancelled_by_customer"
  }'
```

### **Listar pedidos:**
```bash
curl -X GET "http://localhost:3000/api/orders?status=pending&page=1&limit=20" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### **Obtener estadísticas:**
```bash
curl -X GET http://localhost:3000/api/orders/stats/summary \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📊 Casos de Uso

### **1. Flujo Normal de Pedido**
```bash
# 1. Crear pedido (reserva stock)
POST /api/orders

# 2. Confirmar pedido (descuenta stock)
POST /api/orders/1/confirm

# 3. Marcar como enviado
POST /api/orders/1/status { "status": "shipped" }

# 4. Marcar como entregado
POST /api/orders/1/status { "status": "delivered" }
```

### **2. Cancelación de Pedido Pendiente**
```bash
# 1. Crear pedido (reserva stock)
POST /api/orders

# 2. Cancelar antes de confirmar (libera reserva)
POST /api/orders/1/cancel
```

### **3. Cancelación de Pedido Confirmado**
```bash
# 1. Crear pedido (reserva stock)
POST /api/orders

# 2. Confirmar pedido (descuenta stock)
POST /api/orders/1/confirm

# 3. Cancelar después de confirmar (devuelve stock)
POST /api/orders/1/cancel
```

### **4. Dashboard de Pedidos**
```bash
# Ver pedidos pendientes
GET /api/orders?status=pending

# Ver estadísticas del mes
GET /api/orders/stats/summary?startDate=2026-05-01&endDate=2026-05-31

# Ver detalles de un pedido
GET /api/orders/1
```

---

## 📝 Notas Técnicas

### **Transacciones**
- Todas las operaciones que modifican stock usan transacciones de Prisma
- Si cualquier paso falla, se revierte toda la operación
- Garantiza consistencia de datos

### **Gestión de Clientes**
- Los clientes se identifican por teléfono
- Si el cliente existe, se actualizan sus datos
- Si no existe, se crea automáticamente

### **Cálculo de Totales**
- `subtotal` = suma de (unitPrice × quantity) de todos los items
- `discount` = descuentos aplicados (actualmente 0)
- `total` = subtotal - discount

### **Historial de Estados**
- Cada cambio de estado se registra en `OrderStatusHistory`
- Incluye estado anterior, nuevo estado, nota y admin que lo realizó
- Permite auditoría completa del pedido

### **Movimientos de Inventario**
- Solo se registran movimientos al confirmar o cancelar pedidos confirmados
- Tipo `salida` con razón `venta` al confirmar
- Tipo `entrada` con razón `devolucion` al cancelar
- Incluye referencia al pedido (`referenceType: 'order'`, `referenceId: orderId`)

---

## 🔧 Troubleshooting

### **Error: "Stock insuficiente"**
- Verificar que el producto tenga stock disponible
- Stock disponible = stockQty - reservedQty
- Considerar pedidos pendientes que tienen stock reservado

### **Error: "No se puede confirmar un pedido en estado X"**
- Solo se pueden confirmar pedidos en estado `pending`
- Verificar el estado actual del pedido con GET /api/orders/:id

### **Error: "No se puede cambiar de X a Y"**
- Verificar las transiciones válidas de estado
- Usar el endpoint correcto (confirm, cancel, status)

### **Pedido no aparece en listado**
- Verificar filtros aplicados (status, dates)
- Verificar paginación (page, limit)
- Usar GET /api/orders/:id para verificar que existe

---

## ✅ Estado: COMPLETADO

Todos los objetivos de la Etapa 5 fueron cumplidos exitosamente:
- ✅ Creación de pedidos con reserva automática de stock
- ✅ Confirmación de pedidos con descuento definitivo de inventario
- ✅ Cancelación de pedidos con liberación/devolución de stock
- ✅ Gestión completa de estados del pedido
- ✅ Historial de cambios de estado con auditoría
- ✅ Estadísticas y reportes de pedidos
- ✅ Integración total con sistema de inventario
- ✅ Validaciones de negocio completas
- ✅ Tests automatizados pasando (12/12)

---

## 🎉 Próximos Pasos

La **Etapa 6** incluirá:
- Endpoint público de catálogo (sin autenticación)
- Reemplazar carga de `store.json` en frontend por API
- Mantener misma experiencia visual en landing
- Fallback de errores para no romper la página
- Optimización de consultas para catálogo público

**Comando para continuar:**
```
"Desarrolla la Etapa 6: conectar landing publica a API de catalogo"
```

---

**Fecha:** 26 de mayo de 2026  
**Sistema:** Kiro Shoes Inventory Management  
**Versión:** 1.5.0
