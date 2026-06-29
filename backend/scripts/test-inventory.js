/**
 * Script de pruebas para Etapa 4: Movimientos de inventario y alertas
 * 
 * Ejecutar: node backend/scripts/test-inventory.js
 */

const BASE_URL = 'http://localhost:3000';
let accessToken = '';
let testProductId = null;
let testVariantId = null;

// Colores para consola
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(testName) {
  console.log(`\n${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  log(`TEST: ${testName}`, 'blue');
  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
}

async function makeRequest(method, endpoint, body = null, token = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json'
    }
  };

  if (token) {
    options.headers['Authorization'] = `Bearer ${token}`;
  }

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, options);
  const data = await response.json();
  
  return { status: response.status, data };
}

async function test1_Login() {
  logTest('1. Login de autenticación');
  
  const { status, data } = await makeRequest('POST', '/api/auth/login', {
    email: 'maymesm@yahoo.com',
    password: 'Solislidia123'
  });

  if (status === 200 && data.accessToken) {
    accessToken = data.accessToken;
    log('✓ Login exitoso', 'green');
    log(`  Token obtenido: ${accessToken.substring(0, 20)}...`, 'cyan');
    return true;
  } else {
    log('✗ Error en login', 'red');
    console.log(data);
    return false;
  }
}

async function test2_CreateTestProduct() {
  logTest('2. Crear producto de prueba con stock bajo');
  
  const { status, data } = await makeRequest('POST', '/api/products', {
    name: 'Zapato Test Stock Bajo',
    description: 'Producto para probar alertas de stock bajo',
    basePrice: 1000,
    badge: 'TEST',
    categoryId: 1,
    audienceId: 4,
    variants: [
      { sizeId: 16, stockQty: 3 },  // Stock bajo
      { sizeId: 17, stockQty: 0 },  // Agotado
      { sizeId: 18, stockQty: 10 }  // Stock normal
    ]
  }, accessToken);

  if (status === 201 && data.product) {
    testProductId = data.product.id;
    testVariantId = data.product.variants[0].id;
    log('✓ Producto creado exitosamente', 'green');
    log(`  ID: ${testProductId}`, 'cyan');
    log(`  Variantes creadas: ${data.product.variants.length}`, 'cyan');
    return true;
  } else {
    log('✗ Error al crear producto', 'red');
    console.log(data);
    return false;
  }
}

async function test3_GetLowStock() {
  logTest('3. Obtener productos con stock bajo');
  
  const { status, data } = await makeRequest('GET', '/api/inventory/low-stock?threshold=5', null, accessToken);

  if (status === 200) {
    log('✓ Stock bajo obtenido exitosamente', 'green');
    log(`  Threshold: ${data.threshold}`, 'cyan');
    log(`  Total productos: ${data.totalProducts}`, 'cyan');
    log(`  Total variantes: ${data.totalVariants}`, 'cyan');
    
    if (data.products.length > 0) {
      log(`\n  Primeros productos con stock bajo:`, 'yellow');
      data.products.slice(0, 3).forEach(p => {
        log(`    - ${p.product.name}`, 'yellow');
        p.variants.forEach(v => {
          log(`      Talla ${v.size}: ${v.stockQty} unidades`, 'yellow');
        });
      });
    }
    return true;
  } else {
    log('✗ Error al obtener stock bajo', 'red');
    console.log(data);
    return false;
  }
}

async function test4_GetOutOfStock() {
  logTest('4. Obtener productos agotados');
  
  const { status, data } = await makeRequest('GET', '/api/inventory/out-of-stock', null, accessToken);

  if (status === 200) {
    log('✓ Productos agotados obtenidos exitosamente', 'green');
    log(`  Total productos: ${data.totalProducts}`, 'cyan');
    log(`  Total variantes: ${data.totalVariants}`, 'cyan');
    
    if (data.products.length > 0) {
      log(`\n  Primeros productos agotados:`, 'yellow');
      data.products.slice(0, 3).forEach(p => {
        log(`    - ${p.product.name}`, 'yellow');
        p.variants.forEach(v => {
          log(`      Talla ${v.size}: AGOTADO`, 'yellow');
        });
      });
    }
    return true;
  } else {
    log('✗ Error al obtener productos agotados', 'red');
    console.log(data);
    return false;
  }
}

async function test5_GetAlerts() {
  logTest('5. Obtener alertas de inventario');
  
  const { status, data } = await makeRequest('GET', '/api/inventory/alerts', null, accessToken);

  if (status === 200) {
    log('✓ Alertas obtenidas exitosamente', 'green');
    log(`  Total alertas: ${data.totalAlerts}`, 'cyan');
    log(`  Stock bajo: ${data.lowStockCount}`, 'yellow');
    log(`  Agotados: ${data.outOfStockCount}`, 'red');
    log(`  Threshold: ${data.threshold}`, 'cyan');
    
    if (data.alerts.length > 0) {
      log(`\n  Primeras alertas:`, 'yellow');
      data.alerts.slice(0, 5).forEach(alert => {
        const color = alert.severity === 'critical' ? 'red' : 'yellow';
        log(`    [${alert.severity.toUpperCase()}] ${alert.message}`, color);
      });
    }
    return true;
  } else {
    log('✗ Error al obtener alertas', 'red');
    console.log(data);
    return false;
  }
}

async function test6_GetMovements() {
  logTest('6. Obtener historial de movimientos');
  
  const { status, data } = await makeRequest('GET', '/api/inventory/movements?limit=10', null, accessToken);

  if (status === 200) {
    log('✓ Movimientos obtenidos exitosamente', 'green');
    log(`  Total movimientos: ${data.pagination.total}`, 'cyan');
    log(`  Página: ${data.pagination.page}/${data.pagination.totalPages}`, 'cyan');
    
    if (data.movements.length > 0) {
      log(`\n  Últimos movimientos:`, 'yellow');
      data.movements.slice(0, 5).forEach(mov => {
        const tipo = mov.movementType === 'entrada' ? '↑' : '↓';
        log(`    ${tipo} ${mov.variant.product.name} (Talla ${mov.variant.size.code})`, 'yellow');
        log(`      Cantidad: ${mov.quantity} | Razón: ${mov.reason}`, 'yellow');
        log(`      Por: ${mov.admin?.fullName || 'Sistema'}`, 'yellow');
      });
    }
    return true;
  } else {
    log('✗ Error al obtener movimientos', 'red');
    console.log(data);
    return false;
  }
}

async function test7_GetMovementsByProduct() {
  logTest('7. Obtener movimientos filtrados por producto');
  
  if (!testProductId) {
    log('⊘ Test omitido (no hay producto de prueba)', 'yellow');
    return true;
  }

  const { status, data } = await makeRequest('GET', `/api/inventory/movements?productId=${testProductId}`, null, accessToken);

  if (status === 200) {
    log('✓ Movimientos por producto obtenidos exitosamente', 'green');
    log(`  Total movimientos del producto: ${data.pagination.total}`, 'cyan');
    
    if (data.movements.length > 0) {
      log(`\n  Movimientos del producto de prueba:`, 'yellow');
      data.movements.forEach(mov => {
        const tipo = mov.movementType === 'entrada' ? '↑' : '↓';
        log(`    ${tipo} Talla ${mov.variant.size.code}: ${mov.quantity} unidades (${mov.reason})`, 'yellow');
      });
    }
    return true;
  } else {
    log('✗ Error al obtener movimientos por producto', 'red');
    console.log(data);
    return false;
  }
}

async function test8_GetMovementsSummary() {
  logTest('8. Obtener resumen de movimientos');
  
  const today = new Date();
  const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  const { status, data } = await makeRequest(
    'GET', 
    `/api/inventory/movements/summary?startDate=${lastMonth.toISOString()}&endDate=${today.toISOString()}`,
    null,
    accessToken
  );

  if (status === 200) {
    log('✓ Resumen obtenido exitosamente', 'green');
    log(`  Total movimientos: ${data.summary.totalMovimientos}`, 'cyan');
    log(`  Total entradas: ${data.summary.totalEntradas} unidades`, 'green');
    log(`  Total salidas: ${data.summary.totalSalidas} unidades`, 'red');
    
    log(`\n  Por razón:`, 'yellow');
    Object.entries(data.summary.porRazon).forEach(([razon, stats]) => {
      log(`    ${razon}: ${stats.cantidad} unidades (${stats.movimientos} movimientos)`, 'yellow');
    });
    return true;
  } else {
    log('✗ Error al obtener resumen', 'red');
    console.log(data);
    return false;
  }
}

async function test9_GetStockReport() {
  logTest('9. Obtener reporte completo de inventario');
  
  const { status, data } = await makeRequest('GET', '/api/inventory/stock-report', null, accessToken);

  if (status === 200) {
    log('✓ Reporte obtenido exitosamente', 'green');
    log(`\n  Resumen general:`, 'cyan');
    log(`    Total productos: ${data.summary.totalProducts}`, 'cyan');
    log(`    Total variantes: ${data.summary.totalVariants}`, 'cyan');
    log(`    Stock total: ${data.summary.totalStock} unidades`, 'cyan');
    log(`    Stock reservado: ${data.summary.totalReserved} unidades`, 'yellow');
    log(`    Stock disponible: ${data.summary.availableStock} unidades`, 'green');
    log(`    Productos con stock: ${data.summary.productsWithStock}`, 'green');
    log(`    Productos agotados: ${data.summary.productsOutOfStock}`, 'red');
    log(`    Variantes con stock bajo: ${data.summary.variantsWithLowStock}`, 'yellow');
    return true;
  } else {
    log('✗ Error al obtener reporte', 'red');
    console.log(data);
    return false;
  }
}

async function test10_AdjustStockAndVerify() {
  logTest('10. Ajustar stock y verificar movimiento');
  
  if (!testProductId || !testVariantId) {
    log('⊘ Test omitido (no hay producto de prueba)', 'yellow');
    return true;
  }

  // Ajustar stock
  const { status: adjustStatus, data: adjustData } = await makeRequest(
    'POST',
    `/api/products/${testProductId}/variants/${testVariantId}/stock`,
    {
      quantity: 5,
      reason: 'compra',
      note: 'Entrada de prueba para Etapa 4'
    },
    accessToken
  );

  if (adjustStatus !== 200) {
    log('✗ Error al ajustar stock', 'red');
    console.log(adjustData);
    return false;
  }

  log('✓ Stock ajustado exitosamente', 'green');
  log(`  Stock anterior: ${adjustData.previousStock}`, 'cyan');
  log(`  Stock nuevo: ${adjustData.newStock}`, 'cyan');

  // Verificar que el movimiento se registró
  const { status: movStatus, data: movData } = await makeRequest(
    'GET',
    `/api/products/${testProductId}/variants/${testVariantId}/movements`,
    null,
    accessToken
  );

  if (movStatus === 200 && movData.movements.length > 0) {
    log('✓ Movimiento registrado correctamente', 'green');
    const lastMovement = movData.movements[0];
    log(`  Tipo: ${lastMovement.movementType}`, 'cyan');
    log(`  Cantidad: ${lastMovement.quantity}`, 'cyan');
    log(`  Razón: ${lastMovement.reason}`, 'cyan');
    log(`  Nota: ${lastMovement.note}`, 'cyan');
    return true;
  } else {
    log('✗ Error al verificar movimiento', 'red');
    return false;
  }
}

async function test11_CleanupTestProduct() {
  logTest('11. Limpiar producto de prueba');
  
  if (!testProductId) {
    log('⊘ Test omitido (no hay producto de prueba)', 'yellow');
    return true;
  }

  const { status, data } = await makeRequest(
    'DELETE',
    `/api/products/${testProductId}`,
    null,
    accessToken
  );

  if (status === 200) {
    log('✓ Producto de prueba desactivado exitosamente', 'green');
    return true;
  } else {
    log('✗ Error al desactivar producto de prueba', 'red');
    console.log(data);
    return false;
  }
}

async function runTests() {
  console.log('\n');
  log('═══════════════════════════════════════════════════════════', 'cyan');
  log('  PRUEBAS ETAPA 4: MOVIMIENTOS DE INVENTARIO Y ALERTAS', 'cyan');
  log('═══════════════════════════════════════════════════════════', 'cyan');
  console.log('\n');

  const tests = [
    test1_Login,
    test2_CreateTestProduct,
    test3_GetLowStock,
    test4_GetOutOfStock,
    test5_GetAlerts,
    test6_GetMovements,
    test7_GetMovementsByProduct,
    test8_GetMovementsSummary,
    test9_GetStockReport,
    test10_AdjustStockAndVerify,
    test11_CleanupTestProduct
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      const result = await test();
      if (result) {
        passed++;
      } else {
        failed++;
      }
    } catch (error) {
      log(`✗ Error en test: ${error.message}`, 'red');
      console.error(error);
      failed++;
    }
  }

  console.log('\n');
  log('═══════════════════════════════════════════════════════════', 'cyan');
  log('  RESUMEN DE PRUEBAS', 'cyan');
  log('═══════════════════════════════════════════════════════════', 'cyan');
  log(`\n  Total tests: ${tests.length}`, 'blue');
  log(`  ✓ Pasados: ${passed}`, 'green');
  log(`  ✗ Fallidos: ${failed}`, failed > 0 ? 'red' : 'green');
  log(`\n  Estado: ${failed === 0 ? '✓ TODOS LOS TESTS PASARON' : '✗ ALGUNOS TESTS FALLARON'}`, failed === 0 ? 'green' : 'red');
  console.log('\n');
}

// Ejecutar tests
runTests().catch(error => {
  console.error('Error fatal:', error);
  process.exit(1);
});
