/**
 * Helper para generar rutas de imágenes automáticas basadas en SKU
 * Convierte SKU "legacy-3" → "/imagenes/productos/3.jpeg"
 */

/**
 * Extrae el número del SKU y genera la ruta de imagen
 * @param {string} sku - SKU del producto (ej: "legacy-3", "CAB-001", "3")
 * @returns {string} - Ruta de imagen (ej: "/imagenes/productos/3.jpeg")
 */
function generateImagePathFromSKU(sku) {
  if (!sku) return null;
  
  // Extraer números del SKU
  // Soporta formatos: "legacy-3", "CAB-001", "3", "producto-45"
  const numberMatch = sku.match(/(\d+)/);
  
  if (!numberMatch) {
    console.warn(`No se pudo extraer número del SKU: ${sku}`);
    return null;
  }
  
  const imageNumber = numberMatch[1];
  return `imagenes/productos/${imageNumber}.jpeg`;
}

/**
 * Genera ruta de imagen desde un ID numérico directo
 * @param {string|number} imageId - ID o número de la imagen
 * @returns {string} - Ruta de imagen
 */
function generateImagePathFromId(imageId) {
  if (!imageId) return null;
  return `imagenes/productos/${imageId}.jpeg`;
}

/**
 * Valida si una ruta de imagen existe (verificación básica de formato)
 * @param {string} imagePath - Ruta de imagen
 * @returns {boolean}
 */
function isValidImagePath(imagePath) {
  if (!imagePath) return false;
  return /^imagenes\/productos\/\d+\.jpeg$/i.test(imagePath);
}

/**
 * Extrae el número de imagen de una ruta completa
 * @param {string} imagePath - Ruta completa (ej: "imagenes/productos/3.jpeg")
 * @returns {string|null} - Número extraído o null
 */
function extractImageNumber(imagePath) {
  if (!imagePath) return null;
  const match = imagePath.match(/\/(\d+)\.jpeg$/i);
  return match ? match[1] : null;
}

/**
 * Procesa la entrada de imagen del usuario y genera la ruta correcta
 * Acepta: número directo, ruta completa, o SKU
 * @param {string|number} input - Entrada del usuario
 * @param {string} sku - SKU del producto (opcional, para fallback)
 * @returns {string|null} - Ruta de imagen generada
 */
function processImageInput(input, sku = null) {
  if (!input && !sku) return null;
  
  // Si el input es solo un número
  if (/^\d+$/.test(String(input))) {
    return generateImagePathFromId(input);
  }
  
  // Si ya es una ruta válida, devolverla tal cual
  if (isValidImagePath(input)) {
    return input;
  }
  
  // Si parece una ruta pero con formato diferente, extraer número
  if (input.includes('/') && input.includes('.jpeg')) {
    const number = extractImageNumber(input);
    if (number) {
      return generateImagePathFromId(number);
    }
  }
  
  // Fallback: usar el SKU si está disponible
  if (sku) {
    return generateImagePathFromSKU(sku);
  }
  
  // Si no se pudo procesar, devolver el input original
  return input;
}

module.exports = {
  generateImagePathFromSKU,
  generateImagePathFromId,
  isValidImagePath,
  extractImageNumber,
  processImageInput
};
