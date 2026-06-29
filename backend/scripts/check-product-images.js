/**
 * Script para verificar las imágenes de los productos
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkProductImages() {
  try {
    console.log('🔍 Verificando imágenes de productos...\n');
    
    const products = await prisma.product.findMany({
      take: 5,
      include: {
        images: true,
        category: true,
        audience: true
      },
      orderBy: { id: 'asc' }
    });
    
    console.log(`📦 Total de productos encontrados: ${products.length}\n`);
    
    products.forEach(product => {
      console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`ID: ${product.id}`);
      console.log(`Nombre: ${product.name}`);
      console.log(`Categoría: ${product.category?.label || 'N/A'}`);
      console.log(`Audiencia: ${product.audience?.label || 'N/A'}`);
      console.log(`\nImágenes:`);
      
      if (product.images && product.images.length > 0) {
        product.images.forEach((img, idx) => {
          console.log(`  ${idx + 1}. ${img.imageUrl}`);
        });
      } else {
        console.log(`  ❌ Sin imágenes`);
      }
    });
    
    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
    
    // Verificar si las imágenes existen físicamente
    const fs = require('fs');
    const path = require('path');
    
    console.log('\n🔍 Verificando si los archivos de imagen existen...\n');
    
    const firstProduct = products[0];
    if (firstProduct && firstProduct.images && firstProduct.images.length > 0) {
      const imageUrl = firstProduct.images[0].imageUrl;
      const imagePath = path.join(__dirname, '../../frontend', imageUrl);
      
      console.log(`Ruta completa: ${imagePath}`);
      
      if (fs.existsSync(imagePath)) {
        console.log(`✅ El archivo SÍ existe`);
      } else {
        console.log(`❌ El archivo NO existe`);
        
        // Intentar buscar con ../
        const altPath = path.join(__dirname, '../../frontend/admin', imageUrl);
        console.log(`\nIntentando ruta alternativa: ${altPath}`);
        
        if (fs.existsSync(altPath)) {
          console.log(`✅ El archivo SÍ existe en ruta alternativa`);
        } else {
          console.log(`❌ El archivo NO existe en ruta alternativa`);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkProductImages();
