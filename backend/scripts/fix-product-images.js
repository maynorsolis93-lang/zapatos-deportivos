/**
 * Script para corregir las rutas de imágenes de los productos
 * Las rutas actuales son incorrectas (imagenes/productos/X.jpeg)
 * Deben ser las rutas reales del store.json
 */

const path = require("node:path");
const fs = require("node:fs/promises");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const STORE_PATH = path.join(__dirname, "../store.json");

async function fixProductImages() {
  try {
    console.log('🔧 Corrigiendo rutas de imágenes...\n');
    
    // Leer el store.json original
    const content = await fs.readFile(STORE_PATH, "utf8");
    const parsed = JSON.parse(content);
    const products = Array.isArray(parsed.products) ? parsed.products : [];
    
    console.log(`📦 Productos encontrados en store.json: ${products.length}\n`);
    
    let updated = 0;
    let errors = 0;
    
    for (const storeProduct of products) {
      try {
        // Buscar el producto en la base de datos por SKU
        const sku = `legacy-${storeProduct.id}`;
        const dbProduct = await prisma.product.findUnique({
          where: { sku },
          include: { images: true }
        });
        
        if (!dbProduct) {
          console.log(`⚠️  Producto ${storeProduct.id} no encontrado en BD`);
          continue;
        }
        
        // Obtener la imagen correcta del store.json
        const correctImageUrl = storeProduct.img || '';
        
        if (!correctImageUrl) {
          console.log(`⚠️  Producto ${storeProduct.id} no tiene imagen en store.json`);
          continue;
        }
        
        // Actualizar la imagen
        if (dbProduct.images && dbProduct.images.length > 0) {
          // Actualizar la imagen existente
          await prisma.productImage.update({
            where: { id: dbProduct.images[0].id },
            data: {
              imageUrl: correctImageUrl,
              altText: dbProduct.name
            }
          });
          
          console.log(`✅ Actualizado: ${dbProduct.name}`);
          console.log(`   De: ${dbProduct.images[0].imageUrl}`);
          console.log(`   A:  ${correctImageUrl}\n`);
          updated++;
        } else {
          // Crear una nueva imagen si no existe
          await prisma.productImage.create({
            data: {
              productId: dbProduct.id,
              imageUrl: correctImageUrl,
              altText: dbProduct.name,
              sortOrder: 0
            }
          });
          
          console.log(`✅ Creada imagen para: ${dbProduct.name}`);
          console.log(`   Ruta: ${correctImageUrl}\n`);
          updated++;
        }
        
      } catch (error) {
        console.error(`❌ Error procesando producto ${storeProduct.id}:`, error.message);
        errors++;
      }
    }
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ Imágenes actualizadas: ${updated}`);
    console.log(`❌ Errores: ${errors}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
  } catch (error) {
    console.error('❌ Error fatal:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixProductImages();
