const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Script para agregar imágenes a productos existentes
 */

async function addProductImages() {
  try {
    console.log('🖼️  Agregando imágenes a productos...\n');

    // Obtener todos los productos sin imágenes
    const products = await prisma.product.findMany({
      include: {
        images: true,
        category: true,
        audience: true
      }
    });

    let updatedCount = 0;

    for (const product of products) {
      // Si el producto ya tiene imágenes, saltar
      if (product.images.length > 0) {
        console.log(`✅ ${product.name} ya tiene imágenes`);
        continue;
      }

      // Determinar la ruta de la imagen según categoría y audiencia
      let imagePath = '';
      
      const categorySlug = product.category.slug || 'casuales';
      const audienceSlug = product.audience.slug || 'caballeros';
      
      // Mapeo de rutas de imágenes
      const imageMap = {
        'ninos-casuales': 'imagenes/ninos/casuales/1.jpeg',
        'ninos-deportivos': 'imagenes/ninos/deportivos/1.jpg',
        'adolescentes-casuales': 'imagenes/adolescentes/casuales/1.jpeg',
        'adolescentes-deportivos': 'imagenes/adolescentes/deportivos/1.jpg',
        'damas-casuales': 'imagenes/damas/casuales/1.jpeg',
        'damas-deportivos': 'imagenes/damas/deportivos/1.jpg',
        'damas-formales': 'imagenes/damas/formales/1.jpeg',
        'caballeros-casuales': 'imagenes/caballeros/casuales/3.jpeg',
        'caballeros-deportivos': 'imagenes/caballeros/deportivos/1.jpeg',
        'caballeros-formales': 'imagenes/caballeros/formales/1.jpeg'
      };

      const key = `${audienceSlug}-${categorySlug}`;
      imagePath = imageMap[key] || 'imagenes/placeholder.svg';

      // Crear imagen para el producto
      await prisma.productImage.create({
        data: {
          productId: product.id,
          imageUrl: imagePath,
          altText: product.name,
          sortOrder: 0
        }
      });

      console.log(`✅ Agregada imagen a: ${product.name} -> ${imagePath}`);
      updatedCount++;
    }

    console.log(`\n✅ Proceso completado. ${updatedCount} productos actualizados con imágenes.`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addProductImages();
