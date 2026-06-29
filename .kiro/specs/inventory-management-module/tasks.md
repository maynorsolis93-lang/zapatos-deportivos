# Plan de Implementación: Módulo de Inventario React

## Visión General

Este plan cubre la implementación completa de la interfaz React para el módulo de gestión de inventario de Kiro Shoes. El backend CRUD ya está implementado y funcionando, por lo que nos enfocamos exclusivamente en crear la experiencia visual del usuario con React 18+, componentes modulares, y una arquitectura limpia de servicios.

## Tareas

- [ ] 1. Configurar React en el proyecto
  - Instalar React, ReactDOM y dependencias necesarias
  - Configurar Vite para trabajar con React (actualizar vite.config.js)
  - Crear estructura de directorios para componentes React
  - Crear punto de entrada React en `frontend/admin/inventory/`
  - _Requisitos: 15, 20_

- [ ] 2. Implementar capa de servicios HTTP
  - [ ] 2.1 Crear `inventoryService.js` con métodos para productos
    - Implementar getProducts(), getProductById(), createProduct(), updateProduct(), deleteProduct()
    - Incluir manejo de token JWT desde localStorage
    - Configurar URL base del API desde variable de entorno
    - _Requisitos: 3, 4, 5, 6, 8, 22_
  
  - [ ] 2.2 Agregar métodos de stock y movimientos
    - Implementar adjustStock(), getMovements(), getStats()
    - Implementar getLowStock(), getCategories(), getBrands()
    - Manejar errores HTTP (401, 400, 500) con mensajes claros
    - _Requisitos: 7, 9, 10, 11, 12_
  
  - [ ] 2.3 Crear método de exportación CSV
    - Implementar exportToCSV() que descarga archivo
    - Incluir filtros en la llamada
    - Generar nombre de archivo con timestamp
    - _Requisitos: 14, 19_

- [ ] 3. Crear utilidades auxiliares
  - [ ] 3.1 Implementar funciones de formateo en `formatters.js`
    - Crear formatCurrency() para precios en córdobas
    - Crear formatDate() y formatDateTime() para fechas
    - Crear formatStockBadge() que retorna clase CSS según nivel de stock
    - _Requisitos: 15, 18_
  
  - [ ] 3.2 Implementar validadores de formulario en `validators.js`
    - Crear validateProductForm() con reglas de negocio
    - Validar: name (min 3 chars), basePrice (> 0), purchasePrice (>= 0)
    - Validar SKU único (llamada al backend)
    - Validar variantes (stockQty >= 0, sin duplicados de talla)
    - _Requisitos: 5, 6, 17_

- [ ] 4. Implementar componente StatsPanel
  - Crear componente funcional con props: stats, loading
  - Renderizar 4 tarjetas: Total Productos, Valor Total, Stock Bajo, Sin Stock
  - Implementar skeleton loaders para estado de carga
  - Aplicar estilos con colores de la paleta Kiro Shoes
  - Crear subcomponente StatCard reutilizable
  - _Requisitos: 16, 21_

- [ ] 5. Implementar SearchAndFilters
  - [ ] 5.1 Crear componente de búsqueda con debounce
    - Input de búsqueda con icono
    - Implementar debounce de 300ms usando useCallback + setTimeout
    - Emitir evento onSearch al componente padre
    - _Requisitos: 15_
  
  - [ ] 5.2 Crear controles de filtrado
    - Select de categorías (cargar de API)
    - Select de marcas (cargar de API)
    - Inputs de rango de precio (min/max)
    - Checkbox "Solo stock bajo"
    - Botón "Limpiar filtros"
    - Emitir evento onFilterChange con objeto de filtros
    - _Requisitos: 3, 15_

- [ ] 6. Implementar ProductTable
  - [ ] 6.1 Crear tabla responsiva con columnas definidas
    - Columnas: Imagen, SKU, Nombre, Marca, Tallas, Precio Venta, Stock Total, Acciones
    - Renderizar ProductTableRow por cada producto
    - Implementar skeleton rows para estado de carga
    - _Requisitos: 15_
  
  - [ ] 6.2 Implementar indicadores visuales de stock
    - Crear StockBadge con colores según nivel: rojo (0), amarillo (≤3), verde (>3)
    - Mostrar tooltips con stock detallado por talla
    - _Requisitos: 15_
  
  - [ ] 6.3 Agregar botones de acción por fila
    - Botón Editar (✏️) con aria-label
    - Botón Historial (📜) con aria-label
    - Botón Eliminar (🗑️) con confirmación
    - _Requisitos: 15, 20_
  
  - [ ] 6.4 Implementar paginación
    - Controles anterior/siguiente
    - Select de límite por página (10, 25, 50)
    - Mostrar "Mostrando X-Y de Z resultados"
    - _Requisitos: 3, 15_
  
  - [ ] 6.5 Implementar vista responsiva para móviles
    - Detectar ancho de pantalla < 768px
    - Renderizar como cards verticales en lugar de tabla
    - Mantener toda la funcionalidad en ambas vistas
    - _Requisitos: 20_

- [ ] 7. Implementar ProductFormModal
  - [ ] 7.1 Crear estructura base del modal
    - Componente modal con overlay y backdrop blur
    - Props: isOpen, mode ('create' | 'edit'), product, onClose, onSave
    - Manejar tecla Escape para cerrar
    - Focus en primer input al abrir
    - _Requisitos: 17, 20_
  
  - [ ] 7.2 Crear formulario con campos básicos
    - Inputs: name, sku, brand, description
    - Selects: categoryId, audienceId (cargar opciones de API)
    - Inputs numéricos: basePrice, purchasePrice
    - Textarea: description
    - Checkbox: isActive
    - _Requisitos: 5, 6, 17_
  
  - [ ] 7.3 Implementar sección de colores
    - Input que permita agregar múltiples colores
    - Mostrar chips con botón eliminar por color
    - _Requisitos: 1, 17_
  
  - [ ] 7.4 Implementar sección de campos adicionales
    - Input: supplier, warehouseLocation
    - _Requisitos: 1, 17_
  
  - [ ] 7.5 Implementar sección dinámica de variantes (tallas)
    - Botón "+ Agregar Talla"
    - Cada fila: select de talla + input de stock + botón eliminar
    - Validar que no haya tallas duplicadas
    - Validar stockQty >= 0
    - _Requisitos: 5, 17_
  
  - [ ] 7.6 Implementar validación y manejo de errores
    - Validar en tiempo real con validators.js
    - Mostrar mensajes de error bajo cada campo
    - Deshabilitar botón Guardar si hay errores
    - Manejar errores de API (mostrar en modal)
    - _Requisitos: 17, 21_
  
  - [ ] 7.7 Implementar lógica de guardar
    - Modo create: llamar POST /api/products
    - Modo edit: llamar PUT /api/products/:id
    - Mostrar spinner en botón durante guardado
    - Cerrar modal y refrescar tabla al éxito
    - Mostrar toast de confirmación
    - _Requisitos: 5, 6, 17, 21_

- [ ] 8. Implementar MovementHistoryModal
  - [ ] 8.1 Crear estructura del modal
    - Modal con título dinámico (nombre del producto)
    - Props: isOpen, product, onClose
    - Select para elegir variante/talla
    - _Requisitos: 18_
  
  - [ ] 8.2 Implementar tabla de movimientos
    - Cargar movimientos al seleccionar talla (GET /api/products/:id/variants/:variantId/movements)
    - Columnas: Fecha/Hora, Tipo, Cantidad, Razón, Nota, Usuario
    - Formatear fechas con formatDateTime()
    - Badges para tipo: verde (entrada), rojo (salida)
    - _Requisitos: 12, 18_
  
  - [ ] 8.3 Manejar estado vacío y errores
    - Mostrar mensaje "No hay movimientos registrados" si array vacío
    - Mostrar skeleton mientras carga
    - Manejar errores de API
    - _Requisitos: 18, 21_

- [ ] 9. Implementar componente principal InventoryView
  - [ ] 9.1 Crear estructura y state management
    - State: products, loading, error, filters, pagination, stats, modalState
    - useEffect para cargar datos iniciales (productos + stats)
    - Llamadas paralelas con Promise.all
    - _Requisitos: 15, 16_
  
  - [ ] 9.2 Implementar handlers de eventos
    - handleSearch: actualizar filtros y recargar productos
    - handleFilterChange: actualizar state y recargar
    - handlePageChange: actualizar pagination y recargar
    - handleAddProduct: abrir modal en modo create
    - handleEditProduct: cargar producto completo y abrir modal en modo edit
    - handleDeleteProduct: mostrar confirmación y llamar DELETE
    - handleViewHistory: abrir MovementHistoryModal
    - handleExportCSV: llamar inventoryService.exportToCSV()
    - _Requisitos: 3, 8, 15, 19_
  
  - [ ] 9.3 Integrar subcomponentes
    - Renderizar StatsPanel con props stats y loading
    - Renderizar SearchAndFilters con callbacks
    - Renderizar ProductTable con productos y handlers
    - Renderizar ProductFormModal controlado por modalState
    - Renderizar MovementHistoryModal controlado por modalState
    - _Requisitos: 15, 16, 17, 18_
  
  - [ ] 9.4 Implementar botón "Agregar Producto"
    - Botón flotante o en header con icono +
    - Llamar handleAddProduct al hacer clic
    - _Requisitos: 15_
  
  - [ ] 9.5 Implementar botón "Exportar a CSV"
    - Botón con icono de descarga
    - Mostrar spinner durante exportación
    - Llamar handleExportCSV con filtros actuales
    - _Requisitos: 14, 19_

- [ ] 10. Crear estilos CSS para el módulo
  - [ ] 10.1 Crear `inventory.css` con variables CSS
    - Importar variables de color de la paleta Kiro Shoes
    - Definir espaciado, sombras, border-radius
    - _Requisitos: 20_
  
  - [ ] 10.2 Estilos para componentes principales
    - `.inventory-view`: layout de página
    - `.stats-panel`: grid de tarjetas
    - `.stat-card`: diseño de tarjeta con icono
    - `.product-table`: tabla responsiva
    - _Requisitos: 15, 16_
  
  - [ ] 10.3 Estilos para modales
    - `.modal-overlay`: fondo con blur
    - `.modal-content`: contenedor con sombra
    - `.modal-header`, `.modal-body`, `.modal-footer`
    - Animaciones de entrada/salida
    - _Requisitos: 17, 18_
  
  - [ ] 10.4 Estilos para badges y botones
    - `.stock-badge`: variantes de color (high, low, out)
    - `.movement-badge`: entrada/salida
    - Botones de acción con hover states
    - _Requisitos: 15, 18_
  
  - [ ] 10.5 Estilos responsivos con media queries
    - Breakpoint 768px para cambiar tabla a cards
    - Ajustar espaciado en móviles
    - Modales a pantalla completa en móviles
    - _Requisitos: 20_

- [ ] 11. Implementar protección de rutas y autenticación
  - [ ] 11.1 Crear componente ProtectedRoute
    - Verificar existencia de token JWT en localStorage
    - Redirigir a /admin/login si no hay token
    - Renderizar children si token existe
    - _Requisitos: 22_
  
  - [ ] 11.2 Manejar expiración de token
    - Interceptar respuestas 401 del API
    - Limpiar localStorage y redirigir a login
    - Mostrar mensaje "Sesión expirada"
    - _Requisitos: 21, 22_

- [ ] 12. Implementar sistema de notificaciones toast
  - Crear componente Toast con variantes: success, error, warning, info
  - Crear hook useToast para mostrar notificaciones
  - Integrar en InventoryView para operaciones CRUD
  - Auto-desaparecer después de 3 segundos
  - _Requisitos: 21_

- [ ] 13. Checkpoint - Pruebas de integración y ajustes finales
  - Probar flujo completo: login → listar productos → crear → editar → eliminar
  - Probar filtros y búsqueda con diferentes combinaciones
  - Probar exportación a CSV con filtros aplicados
  - Verificar historial de movimientos
  - Verificar responsividad en diferentes dispositivos
  - Ajustar estilos según feedback visual
  - Verificar accesibilidad (navegación por teclado, ARIA labels)
  - Ensure all tests pass, ask the user if questions arise
  - _Requisitos: 15-22_

## Notas de Implementación

- **Stack tecnológico**: React 18+, fetch API nativa, CSS modules
- **Backend ya implementado**: Solo consumimos los endpoints, no modificamos backend
- **Autenticación**: Token JWT almacenado en localStorage
- **No usaremos Redux**: useState/useReducer son suficientes para este módulo
- **Testing**: No incluimos Property-Based Testing ya que esto es UI/UX con componentes visuales
- **Responsividad**: Mobile-first, breakpoint principal en 768px
- **Accesibilidad**: WCAG AA compliance, navegación por teclado, ARIA labels

## Requisitos Cubiertos por Tarea

| Tarea | Requisitos |
|-------|-----------|
| 1 | 15, 20 |
| 2.1 | 3, 4, 5, 6, 8, 22 |
| 2.2 | 7, 9, 10, 11, 12 |
| 2.3 | 14, 19 |
| 3.1 | 15, 18 |
| 3.2 | 5, 6, 17 |
| 4 | 16, 21 |
| 5.1 | 15 |
| 5.2 | 3, 15 |
| 6.1-6.5 | 3, 15, 20 |
| 7.1-7.7 | 1, 5, 6, 17, 21 |
| 8.1-8.3 | 12, 18, 21 |
| 9.1-9.5 | 3, 8, 14, 15, 16, 17, 18, 19 |
| 10.1-10.5 | 15, 16, 17, 18, 20 |
| 11.1-11.2 | 21, 22 |
| 12 | 21 |
| 13 | 15-22 |
