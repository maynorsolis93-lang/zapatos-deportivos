# Solución: Múltiples Modales Abiertos

## Problema
Cuando se hace clic en "Editar" aparecen múltiples modales simultáneamente (Nuevo Producto, Detalles del Pedido, Editar Producto).

## Causa
Las funciones `showModal()` y `closeModal()` no estaban cerrando todos los modales antes de abrir uno nuevo.

## Solución Aplicada

### 1. Actualización de `showModal()`
Ahora cierra todos los modales abiertos antes de abrir el nuevo:
```javascript
function showModal(modalId) {
  // Primero cerrar todos los modales abiertos
  const allModals = document.querySelectorAll('.modal');
  allModals.forEach(modal => {
    modal.style.display = 'none';
  });
  
  // Ahora abrir el modal solicitado
  document.getElementById('modal-overlay').style.display = 'flex';
  document.getElementById(modalId).style.display = 'block';
}
```

### 2. Actualización de `closeModal()`
Ahora cierra todos los modales por seguridad:
```javascript
function closeModal(modalId) {
  document.getElementById('modal-overlay').style.display = 'none';
  if (modalId) {
    document.getElementById(modalId).style.display = 'none';
  }
  // Cerrar todos los modales por si acaso
  const allModals = document.querySelectorAll('.modal');
  allModals.forEach(modal => {
    modal.style.display = 'none';
  });
}
```

### 3. Actualización del evento click en overlay
Cierra todos los modales al hacer clic en el fondo:
```javascript
document.getElementById('modal-overlay')?.addEventListener('click', (e) => {
  if (e.target.id === 'modal-overlay') {
    document.getElementById('modal-overlay').style.display = 'none';
    // Cerrar todos los modales
    const allModals = document.querySelectorAll('.modal');
    allModals.forEach(modal => {
      modal.style.display = 'none';
    });
  }
});
```

## Cómo Probar

1. **Recarga la página** con `Ctrl+Shift+R`
2. **Cierra sesión y vuelve a iniciar sesión** (para refrescar el token)
3. Ve a la sección "Productos"
4. Haz clic en "Editar" de cualquier producto
5. **Ahora debe aparecer SOLO el modal "Editar Producto"**
6. Realiza cambios y guarda

## Archivo Modificado
- `frontend/admin/js/admin.js`
