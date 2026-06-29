# 🚀 Guía Rápida: Sistema de Imágenes Automáticas

## ⚡ En 3 Pasos

### 1️⃣ Organiza tus Fotos
```
frontend/imagenes/productos/
├── 3.jpeg
├── 5.jpeg
├── 6.jpeg
├── 10.jpeg
└── ...
```

### 2️⃣ Ejecuta la Migración
```bash
cd backend
node scripts/update-product-images-from-sku.js
```

### 3️⃣ Listo! 
Ahora cuando crees productos, solo escribe el número:
- Escribes: `5`
- Sistema genera: `imagenes/productos/5.jpeg`

---

## 💡 Ejemplos Rápidos

### Crear Producto Nuevo

**Panel Admin → Productos → + Nuevo Producto**

```
Nombre: Zapato Nike Air Max
SKU: legacy-45
ID de Imagen: 45    ← Solo el número!
Categoría: Deportivos
Precio: 1500
```

Sistema guarda automáticamente: `imagenes/productos/45.jpeg`

---

### Formatos Aceptados

| Escribes | Sistema Genera |
|----------|----------------|
| `3` | `imagenes/productos/3.jpeg` |
| `45` | `imagenes/productos/45.jpeg` |
| `imagenes/productos/5.jpeg` | `imagenes/productos/5.jpeg` (sin cambios) |

---

### Auto-generación desde SKU

Si tienes:
- SKU: `legacy-80`
- Y NO escribes imagen

Sistema genera automáticamente: `imagenes/productos/80.jpeg`

---

## ✅ Checklist Rápido

- [ ] Fotos en `frontend/imagenes/productos/` con números (3.jpeg, 5.jpeg, etc)
- [ ] Ejecutar script: `node scripts/update-product-images-from-sku.js`
- [ ] Probar crear producto con solo el número
- [ ] Verificar que se ve la imagen

---

## 🎯 Resultado

**ANTES:**
```
URL de Imagen: imagenes/caballeros/deportivos/zapato-nike-air-max-modelo-2024-talla-42.jpeg
```

**AHORA:**
```
ID de Imagen: 45
```

¡Así de simple! 🎉
