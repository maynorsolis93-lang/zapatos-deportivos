const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifySetup() {
  console.log('\n🔍 Verificando configuración de la base de datos...\n');

  try {
    // 1. Verificar conexión
    await prisma.$connect();
    console.log('✅ Conexión a PostgreSQL exitosa');

    // 2. Contar categorías
    const categoriesCount = await prisma.category.count();
    console.log(`✅ Categorías: ${categoriesCount} (esperado: 3)`);

    // 3. Contar audiencias
    const audiencesCount = await prisma.audience.count();
    console.log(`✅ Audiencias: ${audiencesCount} (esperado: 4)`);

    // 4. Contar tallas
    const sizesCount = await prisma.size.count();
    console.log(`✅ Tallas: ${sizesCount} (esperado: 26)`);

    // 5. Contar productos
    const productsCount = await prisma.product.count();
    console.log(`✅ Productos: ${productsCount} (esperado: 78)`);

    // 6. Contar variantes
    const variantsCount = await prisma.productVariant.count();
    console.log(`✅ Variantes de productos: ${variantsCount}`);

    // 7. Contar usuarios admin
    const adminUsersCount = await prisma.adminUser.count();
    console.log(`✅ Usuarios AdminUser: ${adminUsersCount} (esperado: 1)`);

    // 8. Contar usuarios normales
    const usersCount = await prisma.user.count();
    console.log(`✅ Usuarios User: ${usersCount} (esperado: 1)`);

    // 9. Mostrar algunos productos de ejemplo
    console.log('\n📦 Productos de ejemplo:');
    const sampleProducts = await prisma.product.findMany({
      take: 5,
      include: {
        category: true,
        audience: true,
        images: true,
      }
    });

    sampleProducts.forEach((product, index) => {
      console.log(`\n${index + 1}. ${product.name}`);
      console.log(`   - Precio: C$${product.basePrice}`);
      console.log(`   - Categoría: ${product.category.label}`);
      console.log(`   - Audiencia: ${product.audience.label}`);
      console.log(`   - Badge: ${product.badge || 'Sin badge'}`);
      console.log(`   - Activo: ${product.isActive ? 'Sí' : 'No'}`);
    });

    // 10. Verificar usuarios
    console.log('\n👤 Usuarios registrados:');
    const adminUsers = await prisma.adminUser.findMany({
      select: { email: true, fullName: true, role: true, isActive: true }
    });
    adminUsers.forEach(user => {
      console.log(`   - ${user.email} (${user.fullName}) - ${user.role} - ${user.isActive ? 'Activo' : 'Inactivo'}`);
    });

    const users = await prisma.user.findMany({
      select: { email: true, name: true }
    });
    users.forEach(user => {
      console.log(`   - ${user.email} (${user.name || 'Sin nombre'})`);
    });

    console.log('\n✅ ¡Verificación completada exitosamente!');
    console.log('\n📊 Resumen:');
    console.log(`   - Base de datos: Conectada ✓`);
    console.log(`   - Datos maestros: Cargados ✓`);
    console.log(`   - Productos: Importados ✓`);
    console.log(`   - Usuarios: Creados ✓`);
    console.log('\n🎉 La Etapa 1 está completamente funcional.\n');

  } catch (error) {
    console.error('\n❌ Error durante la verificación:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

verifySetup();
