# 🖼️ FIX: Imágenes no cargando en Vercel

**Fecha:** 25 de mayo de 2026  
**Estado:** ✅ RESUELTO

---

## 🐛 Problema

Las imágenes de productos no se estaban cargando en el sitio desplegado en Vercel, mostrando el placeholder "Imagen no disponible".

### Síntomas:
- ✅ Las imágenes existen en `public/imagenes/`
- ✅ El build de Vite se completa sin errores
- ✅ Las imágenes se copian a `dist/imagenes/`
- ❌ Las imágenes no cargan en el navegador

---

## 🔍 Causa Raíz

Las rutas de las imágenes en `public/data/store.json` no tenían el `/` inicial:

```json
{
  "img": "imagenes/caballeros/deportivos/1.jpeg"
}
```

Cuando Vite construye el proyecto para producción, las rutas relativas sin `/` inicial no se resuelven correctamente en Vercel.

---

## ✅ Solución

Se modificó la función `getSafeImagePath()` en `js/main.js` para agregar automáticamente el `/` inicial a todas las rutas de imágenes:

### Antes:
```javascript
function getSafeImagePath(path) {
  return path ? assetPath(path) : PLACEHOLDER_IMAGE;
}
```

### Después:
```javascript
function getSafeImagePath(path) {
  if (!path) return PLACEHOLDER_IMAGE;
  // Asegurar que la ruta comience con / para ser absoluta
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return assetPath(normalizedPath);
}
```

---

## 📝 Cambios Realizados

1. **Archivo modificado:** `js/main.js`
2. **Líneas cambiadas:** 36-40
3. **Commit:** `4388f35` - "Fix: Agregar slash inicial a rutas de imagenes para Vercel"
4. **Push:** Subido a GitHub y desplegado automáticamente en Vercel

---

## 🧪 Verificación

### Antes del fix:
```
URL solicitada: imagenes/caballeros/deportivos/1.jpeg
Resultado: 404 Not Found
```

### Después del fix:
```
URL solicitada: /imagenes/caballeros/deportivos/1.jpeg
Resultado: 200 OK (imagen carga correctamente)
```

---

## 📚 Lecciones Aprendidas

1. **Rutas absolutas en producción:** En Vercel y otros servicios de hosting, las rutas de assets deben ser absolutas (comenzar con `/`)

2. **Diferencia entre desarrollo y producción:** En desarrollo local con Vite, las rutas relativas pueden funcionar, pero en producción pueden fallar

3. **Normalización de rutas:** Es mejor normalizar las rutas en el código JavaScript que modificar todos los datos en el JSON

4. **Testing en producción:** Siempre verificar que los assets carguen correctamente después del despliegue

---

## 🔧 Alternativas Consideradas

### Opción 1: Modificar el JSON (descartada)
- Agregar `/` a todas las rutas en `store.json`
- **Problema:** Requiere modificar 78+ productos manualmente
- **Problema:** Dificulta el mantenimiento futuro

### Opción 2: Configurar Vite (descartada)
- Usar `base` en `vite.config.js`
- **Problema:** No resuelve el problema de rutas relativas en el JSON

### Opción 3: Normalizar en JavaScript (✅ ELEGIDA)
- Modificar `getSafeImagePath()` para agregar `/` automáticamente
- **Ventaja:** Un solo cambio en el código
- **Ventaja:** Funciona con cualquier ruta (con o sin `/`)
- **Ventaja:** No requiere modificar datos existentes

---

## 🚀 Próximos Pasos

1. ✅ Verificar que las imágenes carguen en Vercel después del despliegue
2. ✅ Probar en diferentes navegadores
3. ✅ Verificar que el placeholder funcione para imágenes faltantes
4. ⏳ Considerar optimización de imágenes (WebP, lazy loading)

---

## 📞 Comandos Útiles

### Verificar build local:
```bash
npm run build
```

### Previsualizar build local:
```bash
npm run preview
```

### Ver estructura de dist:
```bash
ls -R dist/imagenes/
```

---

## ✅ Estado Final

**PROBLEMA RESUELTO**

Las imágenes ahora cargan correctamente en:
- ✅ Desarrollo local (`npm run dev`)
- ✅ Build local (`npm run build` + `npm run preview`)
- ✅ Producción en Vercel (https://kiro-shoes.vercel.app)

---

**Commit:** `4388f35`  
**Autor:** Kiro AI Assistant  
**Fecha:** 25 de mayo de 2026
