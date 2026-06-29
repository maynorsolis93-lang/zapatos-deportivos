const axios = require('axios');

console.log('🔍 Diagnóstico de Conexión - Kiro Shoes\n');

async function testConnection() {
  const tests = [
    {
      name: 'Health Check',
      url: 'http://localhost:3000/health',
      description: 'Verificar que el servidor esté corriendo'
    },
    {
      name: 'Productos Públicos',
      url: 'http://localhost:3000/api/catalog/products?limit=1',
      description: 'Verificar acceso público a productos'
    },
    {
      name: 'Dashboard Admin (sin auth)',
      url: 'http://localhost:3000/api/admin/dashboard',
      description: 'Verificar ruta protegida (debería dar 401)',
      expectError: true
    }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      console.log(`\n📍 Test: ${test.name}`);
      console.log(`   ${test.description}`);
      console.log(`   URL: ${test.url}`);
      
      const response = await axios.get(test.url, { 
        timeout: 5000,
        validateStatus: () => true // No lanzar error en cualquier status
      });
      
      if (test.expectError && response.status === 401) {
        console.log(`   ✅ PASS - Recibió 401 como se esperaba`);
        passed++;
      } else if (!test.expectError && response.status === 200) {
        console.log(`   ✅ PASS - Status: ${response.status}`);
        console.log(`   Datos recibidos:`, JSON.stringify(response.data).substring(0, 100) + '...');
        passed++;
      } else {
        console.log(`   ⚠️  WARN - Status: ${response.status}`);
        if (response.data) {
          console.log(`   Response:`, response.data);
        }
        failed++;
      }
    } catch (error) {
      console.log(`   ❌ FAIL - ${error.message}`);
      if (error.code === 'ECONNREFUSED') {
        console.log(`   💡 El backend NO está corriendo en el puerto 3000`);
        console.log(`   💡 Ejecuta: cd backend && npm run dev`);
      }
      failed++;
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log(`📊 Resultado: ${passed}/${tests.length} tests pasaron`);
  
  if (failed > 0) {
    console.log('\n🔧 RECOMENDACIONES:');
    console.log('   1. Verifica que el backend esté corriendo');
    console.log('   2. Ejecuta: cd backend && npm run dev');
    console.log('   3. Verifica el puerto 3000 esté libre');
    console.log('   4. Revisa los logs del backend para errores');
  } else {
    console.log('\n✅ ¡Todo está funcionando correctamente!');
    console.log('   El backend está respondiendo bien.');
    console.log('   Si el frontend tiene problemas, revisa la consola del navegador (F12)');
  }
  
  console.log('\n');
}

testConnection().catch(error => {
  console.error('❌ Error crítico:', error.message);
  process.exit(1);
});
