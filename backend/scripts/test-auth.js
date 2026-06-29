/**
 * Script de prueba para autenticación y rutas protegidas
 * Ejecutar: node scripts/test-auth.js
 */

const API_URL = 'http://localhost:3000';

// Credenciales de prueba
const credentials = {
  email: 'maymesm@yahoo.com',
  password: 'Solislidia123'
};

let accessToken = '';
let refreshToken = '';

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
 * Test 1: Login
 */
async function testLogin() {
  console.log('\n🔐 Test 1: Login');
  console.log('================');
  
  const result = await request('POST', '/api/auth/login', credentials);
  
  if (result.ok) {
    accessToken = result.data.accessToken || '';
    refreshToken = result.data.refreshToken || '';
    console.log('✅ Login exitoso');
    console.log(`   Usuario: ${result.data.user?.fullName || 'N/A'}`);
    console.log(`   Email: ${result.data.user?.email || 'N/A'}`);
    console.log(`   Role: ${result.data.user?.role || 'N/A'}`);
    if (accessToken) {
      console.log(`   Access Token: ${accessToken.substring(0, 20)}...`);
    }
    if (refreshToken) {
      console.log(`   Refresh Token: ${refreshToken.substring(0, 20)}...`);
    }
    return true;
  } else {
    console.log('❌ Login fallido');
    console.log(`   Error: ${result.data?.message || 'Error desconocido'}`);
    console.log(`   Respuesta completa:`, JSON.stringify(result.data, null, 2));
    return false;
  }
}

/**
 * Test 2: Acceder a ruta protegida sin token
 */
async function testProtectedWithoutToken() {
  console.log('\n🚫 Test 2: Acceder a ruta protegida SIN token');
  console.log('==============================================');
  
  const result = await request('GET', '/api/admin/dashboard');
  
  if (!result.ok && result.status === 401) {
    console.log('✅ Correctamente bloqueado');
    console.log(`   Mensaje: ${result.data.message}`);
    return true;
  } else {
    console.log('❌ ERROR: Debería estar bloqueado');
    return false;
  }
}

/**
 * Test 3: Acceder a ruta protegida con token
 */
async function testProtectedWithToken() {
  console.log('\n✅ Test 3: Acceder a ruta protegida CON token');
  console.log('=============================================');
  
  const result = await request('GET', '/api/admin/dashboard', null, accessToken);
  
  if (result.ok) {
    console.log('✅ Acceso permitido');
    console.log(`   Total productos: ${result.data.stats.totalProducts}`);
    console.log(`   Productos activos: ${result.data.stats.activeProducts}`);
    console.log(`   Total pedidos: ${result.data.stats.totalOrders}`);
    console.log(`   Stock bajo: ${result.data.stats.lowStockProducts} variantes`);
    return true;
  } else {
    console.log('❌ Acceso denegado');
    console.log(`   Error: ${result.data.message}`);
    return false;
  }
}

/**
 * Test 4: Obtener información del usuario autenticado
 */
async function testGetMe() {
  console.log('\n👤 Test 4: Obtener información del usuario (/me)');
  console.log('================================================');
  
  const result = await request('GET', '/api/auth/me', null, accessToken);
  
  if (result.ok) {
    console.log('✅ Información obtenida');
    console.log(`   ID: ${result.data.user.id}`);
    console.log(`   Email: ${result.data.user.email}`);
    console.log(`   Nombre: ${result.data.user.fullName}`);
    console.log(`   Role: ${result.data.user.role}`);
    console.log(`   Activo: ${result.data.user.isActive}`);
    return true;
  } else {
    console.log('❌ Error al obtener información');
    console.log(`   Error: ${result.data.message}`);
    return false;
  }
}

/**
 * Test 5: Refresh token
 */
async function testRefreshToken() {
  console.log('\n🔄 Test 5: Renovar access token');
  console.log('================================');
  
  const result = await request('POST', '/api/auth/refresh', { refreshToken });
  
  if (result.ok) {
    const newAccessToken = result.data.accessToken;
    console.log('✅ Token renovado exitosamente');
    console.log(`   Nuevo Access Token: ${newAccessToken.substring(0, 20)}...`);
    console.log(`   Token diferente: ${newAccessToken !== accessToken ? 'Sí' : 'No'}`);
    accessToken = newAccessToken;
    return true;
  } else {
    console.log('❌ Error al renovar token');
    console.log(`   Error: ${result.data.message}`);
    return false;
  }
}

/**
 * Test 6: Listar productos (ruta protegida)
 */
async function testListProducts() {
  console.log('\n📦 Test 6: Listar productos');
  console.log('===========================');
  
  const result = await request('GET', '/api/admin/products?limit=5', null, accessToken);
  
  if (result.ok) {
    console.log('✅ Productos obtenidos');
    console.log(`   Total: ${result.data.pagination.total}`);
    console.log(`   Página: ${result.data.pagination.page}`);
    console.log(`   Mostrando: ${result.data.products.length} productos`);
    
    if (result.data.products.length > 0) {
      console.log('\n   Primeros productos:');
      result.data.products.slice(0, 3).forEach((p, i) => {
        console.log(`   ${i + 1}. ${p.name} - C$${p.basePrice}`);
      });
    }
    return true;
  } else {
    console.log('❌ Error al obtener productos');
    console.log(`   Error: ${result.data.message}`);
    return false;
  }
}

/**
 * Test 7: Stock bajo
 */
async function testLowStock() {
  console.log('\n⚠️  Test 7: Productos con stock bajo');
  console.log('====================================');
  
  const result = await request('GET', '/api/admin/inventory/low-stock?threshold=5', null, accessToken);
  
  if (result.ok) {
    console.log('✅ Stock bajo obtenido');
    console.log(`   Variantes con stock ≤ 5: ${result.data.lowStockVariants.length}`);
    
    if (result.data.lowStockVariants.length > 0) {
      console.log('\n   Primeras variantes:');
      result.data.lowStockVariants.slice(0, 3).forEach((v, i) => {
        console.log(`   ${i + 1}. ${v.product.name} - Talla ${v.size.code} - Stock: ${v.stockQty}`);
      });
    }
    return true;
  } else {
    console.log('❌ Error al obtener stock bajo');
    console.log(`   Error: ${result.data.message}`);
    return false;
  }
}

/**
 * Test 8: Logout
 */
async function testLogout() {
  console.log('\n🚪 Test 8: Logout');
  console.log('=================');
  
  const result = await request('POST', '/api/auth/logout', { refreshToken });
  
  if (result.ok) {
    console.log('✅ Logout exitoso');
    console.log(`   Mensaje: ${result.data.message}`);
    return true;
  } else {
    console.log('❌ Error en logout');
    console.log(`   Error: ${result.data.message}`);
    return false;
  }
}

/**
 * Test 9: Intentar usar refresh token después de logout
 */
async function testRefreshAfterLogout() {
  console.log('\n🔒 Test 9: Intentar refresh después de logout');
  console.log('==============================================');
  
  const result = await request('POST', '/api/auth/refresh', { refreshToken });
  
  if (!result.ok && result.status === 403) {
    console.log('✅ Correctamente bloqueado');
    console.log(`   Mensaje: ${result.data.message}`);
    return true;
  } else {
    console.log('❌ ERROR: Debería estar bloqueado');
    return false;
  }
}

/**
 * Ejecutar todos los tests
 */
async function runAllTests() {
  console.log('\n╔════════════════════════════════════════════════╗');
  console.log('║  PRUEBAS DE AUTENTICACIÓN Y RUTAS PROTEGIDAS  ║');
  console.log('╚════════════════════════════════════════════════╝');
  
  const tests = [
    testLogin,
    testProtectedWithoutToken,
    testProtectedWithToken,
    testGetMe,
    testRefreshToken,
    testListProducts,
    testLowStock,
    testLogout,
    testRefreshAfterLogout
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
