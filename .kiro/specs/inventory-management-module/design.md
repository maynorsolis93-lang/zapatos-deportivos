# Design Document - Inventory Management Module

## Overview

Este documento describe el diseño técnico del módulo de gestión de inventario React para Kiro Shoes. El backend CRUD ya está implementado en `backend/src/routes/products.js`, por lo que este diseño se enfoca EXCLUSIVAMENTE en la arquitectura frontend React.

## System Architecture

### Frontend Stack
- **Framework**: React 18+
- **HTTP Client**: fetch API (nativa)
- **Styling**: CSS modules siguiendo paleta existente de Kiro Shoes
- **State Management**: React useState/useReducer (no se requiere Redux para este módulo)
- **Routing**: Integración con sistema de routing existente

### Component Architecture

```
InventoryView (Página principal)
├── StatsPanel (Panel de estadísticas)
│   └── StatCard (x4: Total, Valor, Stock Bajo, Sin Stock)
├── SearchAndFilters (Barra de búsqueda y filtros)
│   ├── SearchInput (con debounce)
│   └── FilterControls (categoria, marca, rango precios)
├── ProductTable (Tabla de productos)
│   ├── ProductTableRow (x N filas)
│   │   ├── ProductThumbnail
│   │   ├── StockBadge (indicador visual de stock)
│   │   └── ActionButtons (editar, historial, eliminar)
│   └── Pagination
└── Modales
    ├── ProductFormModal (crear/editar)
    ├── MovementHistoryModal (historial de movimientos)
    └── StockAdjustmentModal (ajuste rápido de stock)
```

## Component Design

### 1. InventoryView (Página Principal)

**Responsabilidad**: Componente raíz que orquesta toda la vista de inventario

**State**:
```javascript
{
  products: Product[],      // Lista de productos
  loading: boolean,          // Estado de carga
  error: string | null,      // Mensajes de error
  filters: FilterState,      // Estado de filtros activos
  pagination: PaginationState,
  stats: StatsData | null    // Estadísticas del inventario
}
```

**Props**: Ninguna (es la página raíz)

**Hooks utilizados**:
- `useState` para state local
- `useEffect` para cargar datos iniciales
- `useCallback` para funciones memoizadas

**API Calls**:
- `GET /api/products` - Cargar lista de productos
- `GET /api/inventory/stats` - Cargar estadísticas

### 2. StatsPanel

**Responsabilidad**: Mostrar métricas clave del inventario en tarjetas visuales

**Props**:
```typescript
interface StatsPanelProps {
  stats: {
    totalProducts: number,
    totalValue: number,
    lowStockCount: number,
    outOfStockCount: number
  } | null,
  loading: boolean
}
```

**Sub-components**:
- `StatCard`: Tarjeta individual con icono, valor y etiqueta

**Skeleton Loading**: Muestra 4 cards con animación pulsante mientras `loading === true`

### 3. SearchAndFilters

**Responsabilidad**: Controles de búsqueda y filtrado

**Props**:
```typescript
interface SearchAndFiltersProps {
  onSearch: (term: string) => void,
  onFilterChange: (filters: FilterState) => void,
  categories: Category[],
  brands: string[]
}
```

**State interno**:
```javascript
{
  searchTerm: string,
  selectedCategory: number | null,
  selectedBrand: string | null,
  minPrice: number | null,
  maxPrice: number | null,
  lowStockOnly: boolean
}
```

**Debounce**: Implementa debounce de 300ms en el input de búsqueda usando `useCallback` y `setTimeout`

### 4. ProductTable

**Responsabilidad**: Renderizar tabla responsiva de productos

**Props**:
```typescript
interface ProductTableProps {
  products: Product[],
  loading: boolean,
  onEdit: (product: Product) => void,
  onDelete: (productId: number) => void,
  onViewHistory: (product: Product) => void
}
```

**Columns**:
1. Imagen thumbnail (50x50px)
2. SKU
3. Nombre
4. Marca
5. Tallas (badges con tooltips)
6. Precio Venta
7. Stock Total (con indicador de color)
8. Acciones (botones icono)

**Stock Color Indicators**:
```javascript
const getStockColor = (totalStock) => {
  if (totalStock === 0) return 'red';    // Sin stock
  if (totalStock <= 10) return 'yellow'; // Stock bajo
  return 'green';                         // Stock normal
}
```

**Responsive**: En pantallas < 768px se renderiza como cards verticales en lugar de tabla

### 5. ProductFormModal

**Responsabilidad**: Formulario para crear/editar productos

**Props**:
```typescript
interface ProductFormModalProps {
  isOpen: boolean,
  mode: 'create' | 'edit',
  product?: Product | null,
  categories: Category[],
  audiences: Audience[],
  sizes: Size[],
  onClose: () => void,
  onSave: (productData: ProductFormData) => Promise<void>
}
```

**Form State**:
```javascript
{
  name: string,
  sku: string,
  brand: string,
  categoryId: number,
  audienceId: number,
  basePrice: number,
  purchasePrice: number,
  colors: string[],
  supplier: string,
  warehouseLocation: string,
  description: string,
  isActive: boolean,
  variants: VariantFormData[] // { sizeId, stockQty }[]
}
```

**Validation Rules**:
- `name`: required, min 3 chars
- `basePrice`: required, > 0
- `purchasePrice`: optional, >= 0
- `categoryId`: required
- `audienceId`: required
- `variants[].stockQty`: >= 0

**Dynamic Variants Section**:
- Botón "+ Agregar Talla"
- Cada fila: select de talla + input de stock + botón eliminar
- Previene duplicados de talla

**API Calls**:
- `POST /api/products` (modo create)
- `PUT /api/products/:id` (modo edit)

### 6. MovementHistoryModal

**Responsabilidad**: Mostrar historial de movimientos de stock

**Props**:
```typescript
interface MovementHistoryModalProps {
  isOpen: boolean,
  product: Product,
  onClose: () => void
}
```

**State**:
```javascript
{
  selectedVariantId: number | null,
  movements: InventoryMovement[],
  loading: boolean
}
```

**Table Columns**:
- Fecha/Hora (formato: DD/MM/YYYY HH:mm)
- Tipo (badge "Entrada" verde / "Salida" rojo)
- Cantidad
- Razón
- Nota
- Usuario

**API Call**: `GET /api/products/:id/variants/:variantId/movements`

## Service Layer Design

### inventoryService.js

Servicio centralizado para todas las llamadas HTTP al backend.

```javascript
const API_BASE = 'http://localhost:3000/api';

const inventoryService = {
  // Productos
  async getProducts() {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/products`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Error al cargar productos');
    return response.json();
  },

  async getProductById(id) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/products/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Producto no encontrado');
    return response.json();
  },

  async createProduct(productData) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(productData)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al crear producto');
    }
    return response.json();
  },

  async updateProduct(id, productData) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/products/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(productData)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al actualizar producto');
    }
    return response.json();
  },

  async deleteProduct(id) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/products/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Error al eliminar producto');
    return response.json();
  },

  // Stock
  async adjustStock(productId, variantId, adjustmentData) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/products/${productId}/variants/${variantId}/stock`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(adjustmentData)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al ajustar stock');
    }
    return response.json();
  },

  // Movimientos
  async getMovements(productId, variantId) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/products/${productId}/variants/${variantId}/movements`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Error al cargar movimientos');
    return response.json();
  },

  // Estadísticas (placeholder - endpoint a crear)
  async getStats() {
    const token = localStorage.getItem('token');
    // Por ahora calculamos del lado del cliente
    const { products } = await this.getProducts();
    
    const totalProducts = products.filter(p => p.isActive).length;
    const lowStockCount = products.filter(p => 
      p.variants.some(v => v.stockQty > 0 && v.stockQty <= 3)
    ).length;
    const outOfStockCount = products.filter(p =>
      p.variants.every(v => v.stockQty === 0)
    ).length;
    
    return {
      stats: {
        totalProducts,
        totalValue: 0, // No tenemos purchasePrice aún
        lowStockCount,
        outOfStockCount
      }
    };
  }
};

export default inventoryService;
```

## Data Flow

### Flujo: Cargar Vista de Inventario

1. Usuario navega a `/admin/inventory`
2. `InventoryView` monta y ejecuta `useEffect`
3. Llamadas paralelas:
   - `inventoryService.getProducts()` → actualiza `state.products`
   - `inventoryService.getStats()` → actualiza `state.stats`
4. `ProductTable` y `StatsPanel` se renderizan con datos

### Flujo: Crear Producto

1. Usuario hace clic en "Agregar Producto"
2. `InventoryView` actualiza `modalState` → `ProductFormModal` se abre
3. Usuario llena formulario y hace clic en "Guardar"
4. `ProductFormModal` valida datos localmente
5. Si válido: `onSave(formData)` → `inventoryService.createProduct(formData)`
6. Si éxito: cerrar modal, refrescar tabla, mostrar toast de éxito
7. Si error: mostrar mensaje de error en modal

### Flujo: Editar Producto

1. Usuario hace clic en botón "Editar" (✏️) en fila
2. `InventoryView` carga producto completo: `inventoryService.getProductById(id)`
3. Abre `ProductFormModal` en modo `edit` con datos precargados
4. Usuario modifica campos y guarda
5. `inventoryService.updateProduct(id, formData)`
6. Refrescar tabla y cerrar modal

### Flujo: Ver Historial

1. Usuario hace clic en botón "Historial" (📜)
2. Abre `MovementHistoryModal` con producto seleccionado
3. Usuario selecciona una talla del dropdown
4. `inventoryService.getMovements(productId, variantId)`
5. Tabla se renderiza con movimientos

## Styling Design

### Paleta de Colores (Reutilizar del Sistema)

```css
:root {
  --color-primary: #1a1a2e;
  --color-secondary: #e94560;
  --color-gold: #c8a96e;
  --color-whatsapp: #25d366;
  
  --color-bg: #f9f7f4;
  --color-surface: #ffffff;
  --color-text: #2d2d2d;
  --color-muted: #888888;
  --color-border: #e8e4de;
  
  --color-success: #4caf50;
  --color-warning: #ff9800;
  --color-danger: #f44336;
}
```

### Layout Classes

```css
.inventory-view {
  padding: var(--space-6);
  max-width: 1400px;
  margin: 0 auto;
}

.stats-panel {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--space-4);
  margin-bottom: var(--space-6);
}

.stat-card {
  background: var(--color-surface);
  padding: var(--space-5);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.product-table {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-md);
}

.product-table table {
  width: 100%;
  border-collapse: collapse;
}

.product-table th {
  background: var(--color-primary);
  color: #fff;
  padding: var(--space-3);
  text-align: left;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.85rem;
  letter-spacing: 0.05em;
}

.product-table td {
  padding: var(--space-3);
  border-bottom: 1px solid var(--color-border);
}

.stock-badge {
  display: inline-block;
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  font-size: 0.8rem;
  font-weight: 700;
}

.stock-badge--high {
  background: #e8f5e9;
  color: #2e7d32;
}

.stock-badge--low {
  background: #fff3e0;
  color: #e65100;
}

.stock-badge--out {
  background: #ffebee;
  color: #c62828;
}
```

### Modal Styles

```css
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: var(--color-surface);
  border-radius: var(--radius-xl);
  max-width: 800px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: var(--shadow-lg);
  padding: var(--space-6);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-5);
}

.modal-title {
  font-family: var(--font-heading);
  font-size: 1.8rem;
  color: var(--color-primary);
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: var(--color-muted);
  cursor: pointer;
  transition: color var(--transition);
}

.modal-close:hover {
  color: var(--color-secondary);
}
```

## File Structure

```
frontend/
├── admin/
│   ├── inventory/
│   │   ├── index.html              # Página HTML principal
│   │   ├── css/
│   │   │   └── inventory.css       # Estilos específicos
│   │   └── js/
│   │       ├── inventory.js        # Componente principal
│   │       ├── components/
│   │       │   ├── StatsPanel.js
│   │       │   ├── ProductTable.js
│   │       │   ├── SearchAndFilters.js
│   │       │   ├── ProductFormModal.js
│   │       │   └── MovementHistoryModal.js
│   │       ├── services/
│   │       │   └── inventoryService.js
│   │       └── utils/
│   │           ├── formatters.js   # Formatear fechas, monedas
│   │           └── validators.js   # Validaciones de formulario
│   └── ...
```

## Error Handling Strategy

### Error Types

1. **Network Errors** (fetch failed)
   - Mostrar: "Error de conexión. Verifica tu internet."
   - Action: Botón "Reintentar"

2. **401 Unauthorized**
   - Mostrar: "Sesión expirada"
   - Action: Redirigir a `/admin/login`

3. **400 Validation Errors**
   - Mostrar: Mensajes específicos junto a cada campo
   - Ejemplo: "El nombre debe tener al menos 3 caracteres"

4. **500 Server Errors**
   - Mostrar: "Error del servidor. Intenta de nuevo más tarde."
   - Action: Cerrar modal, mantener datos en formulario

### Toast Notifications

```javascript
const showToast = (message, type = 'info') => {
  // type: 'success' | 'error' | 'warning' | 'info'
  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.classList.add('toast--show');
  }, 100);
  
  setTimeout(() => {
    toast.classList.remove('toast--show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
};
```

## Performance Optimization

1. **Debounce en búsqueda**: 300ms delay antes de filtrar
2. **Paginación**: Máximo 50 productos por página
3. **Lazy loading**: Cargar imágenes con `loading="lazy"`
4. **Memoization**: Usar `useMemo` para cálculos costosos (ej: filtrar productos)
5. **Skeleton loaders**: Mostrar placeholders mientras carga

## Accessibility

1. **ARIA labels**: Todos los botones de iconos tienen `aria-label`
2. **Keyboard navigation**: Tab, Enter, Escape funcionan en modales
3. **Focus management**: Al abrir modal, focus va al primer input
4. **Color contrast**: Todos los textos cumplen WCAG AA (4.5:1)
5. **Screen reader support**: `role="dialog"`, `aria-modal="true"` en modales

## Testing Strategy (Not PBT)

### Unit Tests
- Funciones de validación en `validators.js`
- Funciones de formateo en `formatters.js`
- Lógica de cálculo de stock

### Component Tests
- Renderizado correcto de `StatsPanel` con datos
- Formulario `ProductFormModal` muestra errores de validación
- `ProductTable` aplica colores correctos según stock

### Integration Tests
- Flujo completo: crear producto → aparece en tabla
- Editar producto → cambios se reflejan
- Filtros y búsqueda funcionan correctamente

## Notes

- **NO usaremos Property-Based Testing** porque este es un módulo de UI/UX con componentes visuales y llamadas HTTP
- Los tests se enfocarán en comportamiento esperado, renderizado y flujos de usuario
- La validación de datos se hace con unit tests tradicionales
