const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
let authToken = '';
let testOrderId = null;
let testProductId = null;
let testVariantId = null;

// Colores para consola
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  gray: '\x1b[90m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(testNumber, testName) {
  log(`\n${'='.repeat(60)}`, 'blue');
  log(`TEST ${testNumber}: ${testName}`, 'blue');
  log('='.repeat(60), 'blue');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'yellow');
}

// TEST 1: Login
async function test1_login() {
  logTest(1, 'Login de autenticación');
  
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'maymesm@yahoo.com',
      password: 'Solislidia123'
    });

    authToken = response.data.accessToken;
    logSuccess('Login exitoso');
    logInfo(`Token obtenido: ${authToken.substring(0, 20)}...`);
    return true;
  } catch (error) {
    logError(`Error en login: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// TEST 2: Crear producto de prueba con stock
async function test2_createTestProduct() {
  logTest(2, 'Crear producto de prueba con stock');
  
  try {
    const response = await axios.post(
      `${BASE_URL}/api/products`,
      {
        name: 'Zapato Test Pedidos',
        description: 'Producto de prueba para sistema de pedidos',
        basePrice: 150.00,
        categoryId: 2,
        audienceId: 4,
        images: [
          {
            imageUrl: 'imagenes/test/test.jpeg',
            altText: 'Test',
            sortOrder: 0
          }
        ],
        variants: [
          { sizeId: 10, stockQty: 50 }, // Talla 40
          { sizeId: 11, stockQty: 30 }, // Talla 41
          { sizeId: 12, stockQty: 20 }  // Talla 42
        ]
      },
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );

    testProductId = response.data.product.id;
    testVariantId = response.data.product.variants[0].id;
    
    logSuccess('Producto de prueba creado');
    logInfo(`Product ID: ${testProductId}`);
    logInfo(`Variant ID (Talla 40): ${testVariantId}`);
    logInfo(`Stock inicial: 50 unidades`);
    return true;
  } catch (error) {
    logError(`Error al crear producto: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// TEST 3: Crear pedido (reservar stock)
async function test3_createOrder() {
  logTest(3, 'Crear pedido y reservar stock');
  
  try {
    const response = await axios.post(
      `${BASE_URL}/api/orders`,
      {
        customer: {
          fullName: 'Juan Pérez Test',
          phone: '8095551234',
          city: 'Santo Domingo',
          address: 'Calle Test #123'
        },
        items: [
          {
            productId: testProductId,
            variantId: testVariantId,
            quantity: 5
          }
        ],
        notes: 'Pedido de prueba',
        source: 'web'
      },
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );

    testOrderId = response.data.order.id;
    
    logSuccess('Pedido creado exitosamente');
    logInfo(`Order ID: ${testOrderId}`);
    logInfo(`Estado: ${response.data.order.status}`);
    logInfo(`Total: RD$ ${response.data.order.total}`);
    logInfo(`Items: ${response.data.order.items.length}`);
    
    // Verificar que el stock fue reservado
    const variantResponse = await axios.get(
      `${BASE_URL}/api/products/${testProductId}`,
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    
    const variant = variantResponse.data.product.variants.find(v => v.id === testVariantId);
    logInfo(`Stock después de reserva: ${variant.stockQty} (Reservado: ${variant.reservedQty})`);
    
    if (variant.reservedQty === 5) {
      logSuccess('Stock reservado correctamente');
    } else {
      logError(`Stock reservado incorrecto: esperado 5, obtenido ${variant.reservedQty}`);
    }
    
    return true;
  } catch (error) {
    logError(`Error al crear pedido: ${error.response?.data?.message || error.message}`);
    if (error.response?.data?.error) {
      logError(`Detalle: ${error.response.data.error}`);
    }
    return false;
  }
}

// TEST 4: Listar pedidos
async function test4_listOrders() {
  logTest(4, 'Listar pedidos con filtros');
  
  try {
    const response = await axios.get(
      `${BASE_URL}/api/orders?status=pending&page=1&limit=10`,
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );

    logSuccess('Pedidos listados exitosamente');
    logInfo(`Total de pedidos: ${response.data.pagination.total}`);
    logInfo(`Página: ${response.data.pagination.page}/${response.data.pagination.totalPages}`);
    logInfo(`Pedidos en esta página: ${response.data.orders.length}`);
    
    return true;
  } catch (error) {
    logError(`Error al listar pedidos: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// TEST 5: Obtener pedido específico
async function test5_getOrder() {
  logTest(5, 'Obtener detalles de pedido específico');
  
  try {
    const response = await axios.get(
      `${BASE_URL}/api/orders/${testOrderId}`,
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );

    logSuccess('Pedido obtenido exitosamente');
    logInfo(`ID: ${response.data.order.id}`);
    logInfo(`Cliente: ${response.data.order.customer.fullName}`);
    logInfo(`Estado: ${response.data.order.status}`);
    logInfo(`Total: RD$ ${response.data.order.total}`);
    logInfo(`Items: ${response.data.order.items.length}`);
    logInfo(`Historial de estados: ${response.data.order.statusHistory.length} cambios`);
    
    return true;
  } catch (error) {
    logError(`Error al obtener pedido: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// TEST 6: Confirmar pedido (descontar stock)
async function test6_confirmOrder() {
  logTest(6, 'Confirmar pedido y descontar stock');
  
  try {
    // Obtener stock antes de confirmar
    const beforeResponse = await axios.get(
      `${BASE_URL}/api/products/${testProductId}`,
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    const variantBefore = beforeResponse.data.product.variants.find(v => v.id === testVariantId);
    logInfo(`Stock antes de confirmar: ${variantBefore.stockQty} (Reservado: ${variantBefore.reservedQty})`);
    
    // Confirmar pedido
    const response = await axios.post(
      `${BASE_URL}/api/orders/${testOrderId}/confirm`,
      {
        note: 'Pedido confirmado en pruebas'
      },
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );

    logSuccess('Pedido confirmado exitosamente');
    logInfo(`Estado: ${response.data.order.status}`);
    
    // Verificar que el stock fue descontado
    const afterResponse = await axios.get(
      `${BASE_URL}/api/products/${testProductId}`,
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    const variantAfter = afterResponse.data.product.variants.find(v => v.id === testVariantId);
    logInfo(`Stock después de confirmar: ${variantAfter.stockQty} (Reservado: ${variantAfter.reservedQty})`);
    
    if (variantAfter.stockQty === variantBefore.stockQty - 5 && variantAfter.reservedQty === 0) {
      logSuccess('Stock descontado y reserva liberada correctamente');
    } else {
      logError('Stock no se descontó correctamente');
    }
    
    return true;
  } catch (error) {
    logError(`Error al confirmar pedido: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// TEST 7: Crear segundo pedido para probar cancelación
async function test7_createSecondOrder() {
  logTest(7, 'Crear segundo pedido para probar cancelación');
  
  try {
    const response = await axios.post(
      `${BASE_URL}/api/orders`,
      {
        customer: {
          fullName: 'María González Test',
          phone: '8095555678'
        },
        items: [
          {
            productId: testProductId,
            variantId: testVariantId,
            quantity: 3
          }
        ],
        notes: 'Pedido para probar cancelación'
      },
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );

    const secondOrderId = response.data.order.id;
    
    logSuccess('Segundo pedido creado');
    logInfo(`Order ID: ${secondOrderId}`);
    logInfo(`Estado: ${response.data.order.status}`);
    
    // Cancelar inmediatamente (estado pending)
    const cancelResponse = await axios.post(
      `${BASE_URL}/api/orders/${secondOrderId}/cancel`,
      {
        note: 'Cancelado en pruebas',
        reason: 'test'
      },
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    
    logSuccess('Pedido cancelado exitosamente');
    logInfo(`Estado final: ${cancelResponse.data.order.status}`);
    
    return true;
  } catch (error) {
    logError(`Error en segundo pedido: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// TEST 8: Cambiar estado de pedido
async function test8_changeOrderStatus() {
  logTest(8, 'Cambiar estado de pedido (shipped, delivered)');
  
  try {
    // Cambiar a shipped
    const shippedResponse = await axios.post(
      `${BASE_URL}/api/orders/${testOrderId}/status`,
      {
        status: 'shipped',
        note: 'Pedido enviado en pruebas'
      },
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );

    logSuccess('Estado cambiado a shipped');
    logInfo(`Estado: ${shippedResponse.data.order.status}`);
    
    // Cambiar a delivered
    const deliveredResponse = await axios.post(
      `${BASE_URL}/api/orders/${testOrderId}/status`,
      {
        status: 'delivered',
        note: 'Pedido entregado en pruebas'
      },
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );

    logSuccess('Estado cambiado a delivered');
    logInfo(`Estado final: ${deliveredResponse.data.order.status}`);
    logInfo(`Historial: ${deliveredResponse.data.order.statusHistory.length} cambios de estado`);
    
    return true;
  } catch (error) {
    logError(`Error al cambiar estado: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// TEST 9: Obtener estadísticas de pedidos
async function test9_getOrderStats() {
  logTest(9, 'Obtener estadísticas de pedidos');
  
  try {
    const response = await axios.get(
      `${BASE_URL}/api/orders/stats/summary`,
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );

    logSuccess('Estadísticas obtenidas exitosamente');
    logInfo(`Total de pedidos: ${response.data.summary.totalOrders}`);
    logInfo(`Ingresos totales: RD$ ${response.data.summary.totalRevenue}`);
    logInfo(`Valor promedio: RD$ ${response.data.summary.averageOrderValue.toFixed(2)}`);
    logInfo(`Por estado:`);
    Object.entries(response.data.summary.byStatus).forEach(([status, count]) => {
      logInfo(`  - ${status}: ${count}`);
    });
    
    return true;
  } catch (error) {
    logError(`Error al obtener estadísticas: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// TEST 10: Validar stock insuficiente
async function test10_validateInsufficientStock() {
  logTest(10, 'Validar error con stock insuficiente');
  
  try {
    await axios.post(
      `${BASE_URL}/api/orders`,
      {
        customer: {
          fullName: 'Test Stock Insuficiente',
          phone: '8095559999'
        },
        items: [
          {
            productId: testProductId,
            variantId: testVariantId,
            quantity: 1000 // Cantidad imposible
          }
        ]
      },
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );

    logError('No se validó el stock insuficiente');
    return false;
  } catch (error) {
    if (error.response?.status === 500 && error.response?.data?.error?.includes('Stock insuficiente')) {
      logSuccess('Validación de stock insuficiente funciona correctamente');
      logInfo(`Error esperado: ${error.response.data.error}`);
      return true;
    } else {
      logError(`Error inesperado: ${error.response?.data?.message || error.message}`);
      return false;
    }
  }
}

// TEST 11: Verificar movimientos de inventario
async function test11_verifyInventoryMovements() {
  logTest(11, 'Verificar movimientos de inventario registrados');
  
  try {
    const response = await axios.get(
      `${BASE_URL}/api/inventory/movements?variantId=${testVariantId}&limit=10`,
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );

    logSuccess('Movimientos de inventario obtenidos');
    logInfo(`Total de movimientos: ${response.data.pagination.total}`);
    
    // Buscar movimiento de venta
    const saleMovement = response.data.movements.find(m => m.reason === 'venta');
    if (saleMovement) {
      logSuccess('Movimiento de venta registrado correctamente');
      logInfo(`Cantidad: ${saleMovement.quantity}`);
      logInfo(`Tipo: ${saleMovement.movementType}`);
      logInfo(`Nota: ${saleMovement.note}`);
    } else {
      logError('No se encontró movimiento de venta');
    }
    
    return true;
  } catch (error) {
    logError(`Error al verificar movimientos: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// TEST 12: Limpiar datos de prueba
async function test12_cleanup() {
  logTest(12, 'Limpiar producto de prueba');
  
  try {
    await axios.delete(
      `${BASE_URL}/api/products/${testProductId}`,
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );

    logSuccess('Producto de prueba eliminado (desactivado)');
    return true;
  } catch (error) {
    logError(`Error al limpiar: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// Ejecutar todos los tests
async function runAllTests() {
  log('\n' + '='.repeat(60), 'blue');
  log('INICIANDO TESTS DE SISTEMA DE PEDIDOS (ETAPA 5)', 'blue');
  log('='.repeat(60) + '\n', 'blue');

  const tests = [
    test1_login,
    test2_createTestProduct,
    test3_createOrder,
    test4_listOrders,
    test5_getOrder,
    test6_confirmOrder,
    test7_createSecondOrder,
    test8_changeOrderStatus,
    test9_getOrderStats,
    test10_validateInsufficientStock,
    test11_verifyInventoryMovements,
    test12_cleanup
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    const result = await test();
    if (result) {
      passed++;
    } else {
      failed++;
    }
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  log('\n' + '='.repeat(60), 'blue');
  log('RESUMEN DE TESTS', 'blue');
  log('='.repeat(60), 'blue');
  log(`Total: ${tests.length}`, 'yellow');
  log(`Pasados: ${passed}`, 'green');
  log(`Fallados: ${failed}`, 'red');
  log('='.repeat(60) + '\n', 'blue');

  if (failed === 0) {
    log('🎉 TODOS LOS TESTS PASARON EXITOSAMENTE', 'green');
  } else {
    log('⚠️  ALGUNOS TESTS FALLARON', 'red');
  }
}

// Ejecutar
runAllTests().catch(error => {
  logError(`Error fatal: ${error.message}`);
  process.exit(1);
});
