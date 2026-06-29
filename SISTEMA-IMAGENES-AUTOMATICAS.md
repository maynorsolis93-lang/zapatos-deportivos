# 🖼️ Sistema Automático de Rutas de Imágenes

## 🎯 Problema Resuelto

**ANTES:** Tenías que renombrar manualmente cada foto o escribir rutas completas.

**AHORA:** Solo escribes el número (ej: `3`) y el sistema genera automáticamente `imagenes/productos/3.jpeg`

---

## ✨ Funcionalidades Implementadas

### 1. **Generación Automática desde SKU**

Si tu producto tiene SKU `legacy-3`, el sistema automáticamente asigna la imagen:
```
imagenes/productos/3.jpeg
```

### 2. **Input Simplificado en Admin Panel**

Al crear un producto, solo escribes el número:
- Escribes: `3`
- Sistema genera: `imagenes/productos/3.jpeg`

### 3. **Múltiples Formatos Aceptados**

El sistema acepta:
- ✅ Número directo: `3` → `imagenes/productos/3.jpeg`
- ✅ Ruta completa: `imagenes/productos/3.jpeg` → Sin cambios
- ✅ SKU: `legacy-5` → `imagenes/productos/5.jpeg`
- ✅ Cualquier SKU con número: `CAB-010` → `imagenes/productos/10.jpeg`

---

## 📁 Estructura de Archivos

```
proyecto/
├── backend/
│   ├── src/
│   │   ├── utils/
│   │   │   └── imageHelper.js         ← Helper de rutas automáticas
│   │   └── routes/
│   │       └── products.js            ← Actualizado para usar helper
│   └── scripts/
│       └── update-product-images-from-sku.js  ← Script de migración
└── frontend/
    ├── imagenes/
    │   └── productos/
    │       ├── 3.jpeg    ← Tus fotos con números
    │       ├── 5.jpeg
    │       ├── 6.jpeg
    │       └── ...
    └── admin/
        ├── index.html    ← Modal actualizado
        └── js/
            └── admin.js  ← Frontend actualizado
```

---

## 🚀 Cómo Usar

### Paso 1: Organiza tus Fotos

Coloca todas tus fotos en:
```
frontend/imagenes/productos/
```

Mantén los nombres actuales con números:
```
3.jpeg
5.jpeg
6.jpeg
10.jpeg
45.jpeg
```

### Paso 2: Ejecuta el Script de Migración

Para actualizar productos existentes:

```bash
cd backend
node scripts/update-product-images-from-sku.js
```

Este script:
- ✅ Lee todos los productos
- ✅ Extrae el número del SKU
- ✅ Genera la ruta automáticamente
- ✅ Actualiza o crea la imagen

**Ejemplo de salida:**
```
📦 Encontrados 83 productos

📝 Procesando: Zapato Test Pedidos (SKU: legacy-3)
  🎯 Ruta generada: imagenes/productos/3.jpeg
  ✅ Imagen actualizada

📝 Procesando: Zapato Test Stock Bajo (SKU: legacy-80)
  🎯 Ruta generada: imagenes/productos/80.jpeg
  ✅ Imagen creada

📊 RESUMEN
✅ Imágenes actualizadas: 45
➕ Imágenes creadas: 38
⏭️  Productos saltados: 0
```

### Paso 3: Crear Nuevos Productos

En el Panel de Administración:

1. Haz clic en **"+ Nuevo Producto"**
2. Llena el formulario
3. En **"ID de Imagen"**, escribe solo el número:
   - Ejemplo: `5`
4. Guarda

El sistema automáticamente generará: `imagenes/productos/5.jpeg`

---

## 🔧 Funciones del Helper

### `generateImagePathFromSKU(sku)`
Extrae el número del SKU y genera la ruta.

```javascript
generateImagePathFromSKU('legacy-3')
// → 'imagenes/productos/3.jpeg'

generateImagePathFromSKU('CAB-010')
// → 'imagenes/productos/10.jpeg'
```

### `processImageInput(input, sku)`
Procesa cualquier entrada del usuario.

```javascript
processImageInput('3')
// → 'imagenes/productos/3.jpeg'

processImageInput('imagenes/productos/5.jpeg')
// → 'imagenes/productos/5.jpeg'

processImageInput('/productos/10.jpeg')
// → 'imagenes/productos/10.jpeg'
```

### `isValidImagePath(path)`
Valida si una ruta es correcta.

```javascript
isValidImagePath('imagenes/productos/3.jpeg')
// → true

isValidImagePath('otra/ruta/foto.png')
// → false
```

---

## 📝 Ejemplos de Uso

### Ejemplo 1: Crear Producto con Número

**Request al API:**
```json
{
  "name": "Zapato Deportivo Nike",
  "sku": "legacy-45",
  "imageId": "45",
  "categoryId": 2,
  "audienceId": 4,
  "basePrice": 1500
}
```

**Resultado:**
- Imagen guardada: `imagenes/productos/45.jpeg`

### Ejemplo 2: Crear Producto sin Imagen (Auto desde SKU)

**Request al API:**
```json
{
  "name": "Zapato Casual Adidas",
  "sku": "legacy-12",
  "categoryId": 1,
  "audienceId": 4,
  "basePrice": 1200
}
```

**Resultado:**
- Imagen generada automáticamente: `imagenes/productos/12.jpeg`

### Ejemplo 3: Actualizar Productos Existentes

**Comando:**
```bash
node scripts/update-product-images-from-sku.js
```

**Procesamiento:**
```
Producto: "Tenis Nike Air"
SKU: legacy-80
Imagen antigua: /imagenes/caballeros/deportivos/1.jpeg
Imagen nueva: imagenes/productos/80.jpeg
✅ Actualizado
```

---

## 🎨 Interfaz Actualizada

### Modal de Crear Producto

El campo de imagen ahora muestra:

```
┌─────────────────────────────────────────┐
│ ID de Imagen o Ruta                     │
│ ┌─────────────────────────────────────┐ │
│ │ 3                                   │ │
│ └─────────────────────────────────────┘ │
│ 💡 Solo escribe el número de tu foto   │
│    (ej: 3) y el sistema generará       │
│    automáticamente:                     │
│    imagenes/productos/3.jpeg            │
└─────────────────────────────────────────┘
```

---

## ✅ Checklist de Implementación

- [x] Helper `imageHelper.js` creado
- [x] Ruta POST `/api/products` actualizada
- [x] Ruta PUT `/api/products/:id` compatible
- [x] Script de migración creado
- [x] Frontend admin actualizado
- [x] Modal HTML actualizado con hint
- [x] Validación de rutas implementada
- [x] Soporte para múltiples formatos
- [x] Documentación completa

---

## 🧪 Testing

### Probar Creación de Producto

```bash
# Terminal 1: Backend
cd backend
npm start

# Terminal 2: Frontend
cd frontend
npm run dev
```

1. Abre `http://localhost:5173/admin`
2. Inicia sesión
3. Ve a "Productos"
4. Clic en "+ Nuevo Producto"
5. Llena:
   - Nombre: "Zapato Test"
   - SKU: "legacy-99"
   - ID Imagen: `99`
   - Categoría: Casuales
   - Audiencia: Caballeros
   - Precio: 1000
6. Guarda
7. Verifica que la imagen sea: `imagenes/productos/99.jpeg`

### Probar Migración

```bash
cd backend
node scripts/update-product-images-from-sku.js
```

Verifica la salida del script y revisa la base de datos.

---

## 🔍 Troubleshooting

### Problema: "No se pudo generar ruta de imagen"

**Causa:** El SKU no contiene números.

**Solución:** Asegúrate de que el SKU tenga formato: `legacy-X` o similar con números.

### Problema: Imagen no se muestra en el frontend

**Causa:** El archivo físico no existe.

**Solución:** 
1. Verifica que el archivo existe en `frontend/imagenes/productos/`
2. Revisa el nombre (debe ser exactamente `3.jpeg`, no `3.jpg`)

### Problema: Script no actualiza imágenes

**Causa:** Productos sin SKU.

**Solución:** El script solo procesa productos con SKU. Asigna SKUs a todos los productos.

---

## 📊 Ventajas de Este Sistema

✅ **Sin Renombrar Archivos**
- Mantén tus fotos con números simples

✅ **Generación Automática**
- El sistema crea las rutas por ti

✅ **Flexibilidad**
- Acepta números, rutas completas, o SKUs

✅ **Migración Fácil**
- Un solo comando actualiza todos los productos

✅ **Menos Errores**
- No más errores de tipeo en rutas

✅ **Organización Simple**
- Todo en una carpeta: `imagenes/productos/`

---

## 🚀 Próximos Pasos

1. **Ejecuta la migración** para actualizar productos existentes
2. **Coloca tus fotos** en `frontend/imagenes/productos/`
3. **Prueba crear un producto** nuevo con solo el número
4. **Verifica** que las imágenes se muestran correctamente

---

## 📞 Soporte

Si tienes problemas:
1. Revisa los logs del backend
2. Verifica que las fotos existen físicamente
3. Ejecuta el script de migración nuevamente
4. Revisa la consola del navegador (F12)

