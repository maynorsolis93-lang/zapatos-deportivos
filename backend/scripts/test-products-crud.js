/**
 * Script de prueba para CRUD de productos
 * Ejecutar: node scripts/test-products-crud.js
 */

const API_URL = 'http://localhost:3000';

// Credenciales de prueba
const credentials = {
  email: 'maymesm@yahoo.com',
  password: 'Solislidia123'
};

let accessToken = '';
let testProductId = null;
let testVariantId = null;

/**
 * Hacer petición HTTP
 */
async function request(method, endpoint, data = null, token = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json'
    }
  };

  if (token) {
    options.headers['Authorization'] = `Bearer ${token}`;
  }

  if (data) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, options);
    const result = await response.json();
    
    return {
      status: response.status,
      ok: response.ok,
      data: result
    };
  } catch (error) {
    return {
      status: 0,
      ok: false,
      error: error.message
    };
  }
}

/**
 * Test 0: Login
 */
async function testLogin() {
  console.log('\n🔐 Test 0: Login');
  console.log('================');
  
  const result = await request('POST', '/api/auth/login', credentials);
  
  if (result.ok) {
    accessToken = result.data.accessToken;
    console.log('✅ Login exitoso');
    console.log(`   Token: ${accessToken.substring(0, 20)}...`);
    return true;
  } else {
    console.log('❌ Login fallido');
    console.log(`   Error: ${result.data?.message}`);
    return false;
  }
}

/**
 * Test 1: Crear producto nuevo
 */
async function testCreateProduct() {
  console.log('\n📦 Test 1: Crear producto nuevo');
  console.log('================================');
  
  const newProduct = {
    name: 'Zapato Deportivo Test',
    description: 'Producto de prueba para testing',
    basePrice: 1500,
    badge: 'NUEVO',
    categoryId: 1, // Deportivos
    audienceId: 4, // Caballeros
    images: [
      {
        imageUrl: 'https://example.com/test-shoe.jpg',
        altText: 'Zapato deportivo test',
        sortOrder: 0
      }
    ],
    variants: [
      { sizeId: 16, stockQty: 10 }, // Talla 35
      { sizeId: 17, stockQty: 15 }, // Talla 36
      { sizeId: 18, stockQty: 20 }  // Talla 37
    ]
  };
  
  const result = await request('POST', '/api/products', newProduct, accessToken);
  
  if (result.ok) {
    testProductId = result.data.product.id;
    testVariantId = result.data.product.variants[0].id;
    console.log('✅ Producto creado exitosamente');
    console.log(`   ID: ${result.data.product.id}`);
    console.log(`   Nombre: ${result.data.product.name}`);
    console.log(`   Precio: C$${result.data.product.basePrice}`);
    console.log(`   Categoría: ${result.data.product.category.label}`);
    console.log(`   Audiencia: ${result.data.product.audience.label}`);
    console.log(`   Imágenes: ${result.data.product.images.length}`);
    console.log(`   Variantes: ${result.data.product.variants.length}`);
    result.data.product.variants.forEach(v => {
      console.log(`      - Talla ${v.size.code}: ${v.stockQty} unidades`);
    });
    return true;
  } else {
    console.log('❌ Error al crear producto');
    console.log(`   Error: ${result.data?.message}`);
    return false;
  }
}

/**
 * Test 2: Obtener producto por ID
 */
async function testGetProduct() {
  console.log('\n🔍 Test 2: Obtener producto por ID');
  console.log('===================================');
  
  const result = await request('GET', `/api/admin/products/${testProductId}`, null, accessToken);
  
  if (result.ok) {
    console.log('✅ Producto obtenido');
    console.log(`   ID: ${result.data.product.id}`);
    console.log(`   Nombre: ${result.data.product.name}`);
    console.log(`   Stock total: ${result.data.product.variants.reduce((sum, v) => sum + v.stockQty, 0)} unidades`);
    return true;
  } else {
    console.log('❌ Error al obtener producto');
    console.log(`   Error: ${result.data?.message}`);
    return false;
  }
}

/**
 * Test 3: Actualizar producto
 */
async function testUpdateProduct() {
  console.log('\n✏️  Test 3: Actualizar producto');
  console.log('===============================');
  
  const updates = {
    name: 'Zapato Deportivo Test (Actualizado)',
    basePrice: 1650,
    badge: 'OFERTA',
    description: 'Producto actualizado con nuevo precio'
  };
  
  const result = await request('PUT', `/api/products/${testProductId}`, updates, accessToken);
  
  if (result.ok) {
    console.log('✅ Producto actualizado');
    console.log(`   Nuevo nombre: ${result.data.product.name}`);
    console.log(`   Nuevo precio: C$${result.data.product.basePrice}`);
    console.log(`   Nuevo badge: ${result.data.product.badge}`);
    return true;
  } else {
    console.log('❌ Error al actualizar producto');
    console.log(`   Error: ${result.data?.message}`);
    return false;
  }
}

/**
 * Test 4: Ajustar stock (entrada)
 */
async function testStockIncrease() {
  console.log('\n📈 Test 4: Ajustar stock (entrada)');
  console.log('===================================');
  
  const adjustment = {
    quantity: 5,
    reason: 'compra',
    note: 'Entrada de mercancía - prueba'
  };
  
  const result = await request(
    'POST',
    `/api/products/${testProductId}/variants/${testVariantId}/stock`,
    adjustment,
    accessToken
  );
  
  if (result.ok) {
    console.log('✅ Stock aumentado');
    console.log(`   Stock anterior: ${result.data.previousStock}`);
    console.log(`   Cambio: +${adjustment.quantity}`);
    console.log(`   Stock nuevo: ${result.data.newStock}`);
    console.log(`   Movimiento ID: ${result.data.movement.id}`);
    return true;
  } else {
    console.log('❌ Error al ajustar stock');
    console.log(`   Error: ${result.data?.message}`);
    return false;
  }
}

/**
 * Test 5: Ajustar stock (salida)
 */
async function testStockDecrease() {
  console.log('\n📉 Test 5: Ajustar stock (salida)');
  console.log('==================================');
  
  const adjustment = {
    quantity: -3,
    reason: 'venta',
    note: 'Venta directa - prueba'
  };
  
  const result = await request(
    'POST',
    `/api/products/${testProductId}/variants/${testVariantId}/stock`,
    adjustment,
    accessToken
  );
  
  if (result.ok) {
    console.log('✅ Stock disminuido');
    console.log(`   Stock anterior: ${result.data.previousStock}`);
    console.log(`   Cambio: ${adjustment.quantity}`);
    console.log(`   Stock nuevo: ${result.data.newStock}`);
    return true;
  } else {
    console.log('❌ Error al ajustar stock');
    console.log(`   Error: ${result.data?.message}`);
    return false;
  }
}

/**
 * Test 6: Intentar stock negativo (debe fallar)
 */
async function testNegativeStock() {
  console.log('\n🚫 Test 6: Intentar stock negativo (debe fallar)');
  console.log('=================================================');
  
  const adjustment = {
    quantity: -1000,
    reason: 'ajuste',
    note: 'Intento de stock negativo'
  };
  
  const result = await request(
    'POST',
    `/api/products/${testProductId}/variants/${testVariantId}/stock`,
    adjustment,
    accessToken
  );
  
  if (!result.ok && result.status === 400) {
    console.log('✅ Correctamente bloqueado');
    console.log(`   Mensaje: ${result.data.message}`);
    console.log(`   Stock actual: ${result.data.currentStock}`);
    console.log(`   Stock resultante: ${result.data.resultingStock}`);
    return true;
  } else {
    console.log('❌ ERROR: Debería estar bloqueado');
    return false;
  }
}

/**
 * Test 7: Obtener historial de movimientos
 */
async function testGetMovements() {
  console.log('\n📋 Test 7: Obtener historial de movimientos');
  console.log('============================================');
  
  const result = await request(
    'GET',
    `/api/products/${testProductId}/variants/${testVariantId}/movements`,
    null,
    accessToken
  );
  
  if (result.ok) {
    console.log('✅ Movimientos obtenidos');
    console.log(`   Total movimientos: ${result.data.total}`);
    
    if (result.data.movements.length > 0) {
      console.log('\n   Últimos movimientos:');
      result.data.movements.slice(0, 5).forEach((m, i) => {
        const sign = m.movementType === 'entrada' ? '+' : '-';
        console.log(`   ${i + 1}. ${m.movementType.toUpperCase()} ${sign}${m.quantity} - ${m.reason}`);
        console.log(`      Por: ${m.admin?.fullName || 'Sistema'}`);
        console.log(`      Fecha: ${new Date(m.createdAt).toLocaleString('es-NI')}`);
      });
    }
    return true;
  } else {
    console.log('❌ Error al obtener movimientos');
    console.log(`   Error: ${result.data?.message}`);
    return false;
  }
}

/**
 * Test 8: Agregar nueva variante a producto existente
 */
async function testAddVariant() {
  console.log('\n➕ Test 8: Agregar nueva variante');
  console.log('==================================');
  
  const updates = {
    variants: [
      { sizeId: 19, stockQty: 8 } // Talla 38
    ]
  };
  
  const result = await request('PUT', `/api/products/${testProductId}`, updates, accessToken);
  
  if (result.ok) {
    console.log('✅ Variante agregada');
    console.log(`   Total variantes: ${result.data.product.variants.length}`);
    const newVariant = result.data.product.variants.find(v => v.sizeId === 19);
    if (newVariant) {
      console.log(`   Nueva talla: ${newVariant.size.code}`);
      console.log(`   Stock: ${newVariant.stockQty}`);
    }
    return true;
  } else {
    console.log('❌ Error al agregar variante');
    console.log(`   Error: ${result.data?.message}`);
    return false;
  }
}

/**
 * Test 9: Desactivar producto
 */
async function testDeleteProduct() {
  console.log('\n🗑️  Test 9: Desactivar producto');
  console.log('================================');
  
  const result = await request('DELETE', `/api/products/${testProductId}`, null, accessToken);
  
  if (result.ok) {
    console.log('✅ Producto desactivado');
    console.log(`   Mensaje: ${result.data.message}`);
    return true;
  } else {
    console.log('❌ Error al desactivar producto');
    console.log(`   Error: ${result.data?.message}`);
    return false;
  }
}

/**
 * Test 10: Verificar que producto está desactivado
 */
async function testVerifyInactive() {
  console.log('\n✔️  Test 10: Verificar producto desactivado');
  console.log('===========================================');
  
  const result = await request('GET', `/api/admin/products/${testProductId}`, null, accessToken);
  
  if (result.ok && result.data.product.isActive === false) {
    console.log('✅ Producto correctamente desactivado');
    console.log(`   isActive: ${result.data.product.isActive}`);
    return true;
  } else {
    console.log('❌ El producto debería estar desactivado');
    return false;
  }
}

/**
 * Ejecutar todos los tests
 */
async function runAllTests() {
  console.log('\n╔════════════════════════════════════════════════╗');
  console.log('║       PRUEBAS DE CRUD DE PRODUCTOS             ║');
  console.log('╚════════════════════════════════════════════════╝');
  
  const tests = [
    testLogin,
    testCreateProduct,
    testGetProduct,
    testUpdateProduct,
    testStockIncrease,
    testStockDecrease,
    testNegativeStock,
    testGetMovements,
    testAddVariant,
    testDeleteProduct,
    testVerifyInactive
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    const result = await test();
    if (result) {
      passed++;
    } else {
      failed++;
      // Si falla el login, no continuar
      if (test === testLogin) {
        console.log('\n❌ No se puede continuar sin autenticación');
        break;
      }
    }
    
    // Pequeña pausa entre tests
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n╔════════════════════════════════════════════════╗');
  console.log('║              RESUMEN DE PRUEBAS                ║');
  console.log('╚════════════════════════════════════════════════╝');
  console.log(`\n✅ Tests exitosos: ${passed}`);
  console.log(`❌ Tests fallidos: ${failed}`);
  console.log(`📊 Total: ${tests.length}`);
  
  if (failed === 0) {
    console.log('\n🎉 ¡Todas las pruebas pasaron exitosamente!');
  } else {
    console.log('\n⚠️  Algunas pruebas fallaron. Revisa los errores arriba.');
  }
}

// Ejecutar tests
runAllTests().catch(error => {
  console.error('\n❌ Error crítico:', error);
  process.exit(1);
});
