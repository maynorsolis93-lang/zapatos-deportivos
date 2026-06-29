const { PrismaClient } = require('@prisma/client');
const { generateImagePathFromSKU } = require('../src/utils/imageHelper');

const prisma = new PrismaClient();

/**
 * Script para actualizar las rutas de imágenes de productos existentes
 * Genera automáticamente las rutas desde el SKU
 * 
 * Uso: node scripts/update-product-images-from-sku.js
 */

async function updateProductImages() {
  try {
    console.log('🔄 Iniciando actualización de imágenes de productos...\n');

    // Obtener todos los productos con sus imágenes
    const products = await prisma.product.findMany({
      include: {
        images: true
      }
    });

    console.log(`📦 Encontrados ${products.length} productos\n`);

    let updatedCount = 0;
    let createdCount = 0;
    let skippedCount = 0;

    for (const product of products) {
      console.log(`\n📝 Procesando: ${product.name} (SKU: ${product.sku || 'Sin SKU'})`);

      // Si el producto no tiene SKU, saltar
      if (!product.sku) {
        console.log('  ⚠️  Sin SKU - Saltando');
        skippedCount++;
        continue;
      }

      // Generar ruta de imagen automática desde SKU
      const autoImagePath = generateImagePathFromSKU(product.sku);

      if (!autoImagePath) {
        console.log('  ⚠️  No se pudo generar ruta de imagen desde SKU');
        skippedCount++;
        continue;
      }

      console.log(`  🎯 Ruta generada: ${autoImagePath}`);

      // Si el producto ya tiene imágenes, actualizar la primera
      if (product.images.length > 0) {
        const existingImage = product.images[0];
        
        // Solo actualizar si la ruta es diferente
        if (existingImage.imageUrl !== autoImagePath) {
          await prisma.productImage.update({
            where: { id: existingImage.id },
            data: {
              imageUrl: autoImagePath,
              altText: product.name
            }
          });
          console.log(`  ✅ Imagen actualizada: ${existingImage.imageUrl} → ${autoImagePath}`);
          updatedCount++;
        } else {
          console.log(`  ℹ️  Imagen ya correcta, saltando`);
          skippedCount++;
        }
      } 
      // Si no tiene imágenes, crear una nueva
      else {
        await prisma.productImage.create({
          data: {
            productId: product.id,
            imageUrl: autoImagePath,
            altText: product.name,
            sortOrder: 0
          }
        });
        console.log(`  ✅ Imagen creada: ${autoImagePath}`);
        createdCount++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMEN DE LA MIGRACIÓN');
    console.log('='.repeat(60));
    console.log(`✅ Imágenes actualizadas: ${updatedCount}`);
    console.log(`➕ Imágenes creadas: ${createdCount}`);
    console.log(`⏭️  Productos saltados: ${skippedCount}`);
    console.log(`📦 Total procesados: ${products.length}`);
    console.log('='.repeat(60));
    console.log('\n✅ Migración completada exitosamente!\n');

  } catch (error) {
    console.error('\n❌ Error durante la migración:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar con confirmación
console.log('╔═══════════════════════════════════════════════════════════╗');
console.log('║   ACTUALIZACIÓN AUTOMÁTICA DE IMÁGENES DESDE SKU          ║');
console.log('╚═══════════════════════════════════════════════════════════╝\n');
console.log('Este script actualizará las rutas de imágenes de todos los productos');
console.log('basándose en su SKU (ej: legacy-3 → imagenes/productos/3.jpeg)\n');

// Esperar 2 segundos antes de ejecutar
setTimeout(async () => {
  await updateProductImages();
}, 2000);
