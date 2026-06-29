const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:3000';

async function healthCheck() {
  console.log('🔍 Iniciando health check...\n');
  
  try {
    // Check health endpoint
    console.log('1️⃣ Verificando endpoint de salud...');
    const healthResponse = await axios.get(`${API_URL}/health`);
    console.log('✅ Health check:', healthResponse.data.status);

    // Check database connection
    console.log('\n2️⃣ Verificando conexión a base de datos...');
    const catalogResponse = await axios.get(`${API_URL}/api/catalog/products?limit=1`);
    console.log('✅ Database connection: OK');
    console.log(`   Productos encontrados: ${catalogResponse.data.products.length}`);

    // Check response time
    console.log('\n3️⃣ Midiendo tiempo de respuesta...');
    const start = Date.now();
    await axios.get(`${API_URL}/health`);
    const responseTime = Date.now() - start;
    console.log(`✅ Response time: ${responseTime}ms`);

    if (responseTime > 1000) {
      console.warn('⚠️  Response time is slow (>1s)');
    } else if (responseTime > 500) {
      console.warn('⚠️  Response time is acceptable but could be better (>500ms)');
    }

    // Check API version
    console.log('\n4️⃣ Verificando versión de la API...');
    const rootResponse = await axios.get(`${API_URL}/`);
    console.log('✅ API Version:', rootResponse.data.version);

    console.log('\n✅ ¡Todos los checks pasaron exitosamente!\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Health check failed:');
    console.error('   Error:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
    console.log('\n');
    process.exit(1);
  }
}

// Ejecutar health check
healthCheck();
