const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

// Colores para consola
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m'
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

// TEST 1: Obtener productos del catálogo
async function test1_getProducts() {
  logTest(1, 'Obtener productos del catálogo público');
  
  try {
    const response = await axios.get(`${BASE_URL}/api/catalog/products`);

    logSuccess('Productos obtenidos exitosamente');
    logInfo(`Total de productos: ${response.data.products.length}`);
    logInfo(`Paginación: página ${response.data.pagination.page} de ${response.data.pagination.totalPages}`);
    
    if (response.data.products.length > 0) {
      const firstProduct = response.data.products[0];
      logInfo(`Primer producto: ${firstProduct.name}`);
      logInfo(`Precio: ${firstProduct.price}`);
      logInfo(`Tallas: ${firstProduct.sizes}`);
      logInfo(`Persona: ${firstProduct.persona}`);
      logInfo(`Tipo: ${firstProduct.tipo}`);
    }
    
    return true;
  } catch (error) {
    logError(`Error al obtener productos: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// TEST 2: Filtrar productos por persona
async function test2_filterByPersona() {
  logTest(2, 'Filtrar productos por persona (caballeros)');
  
  try {
    const response = await axios.get(`${BASE_URL}/api/catalog/products?persona=caballeros`);

    logSuccess('Productos filtrados exitosamente');
    logInfo(`Productos de caballeros: ${response.data.products.length}`);
    
    // Verificar que todos sean de caballeros
    const allCaballeros = response.data.products.every(p => p.persona === 'caballeros');
    if (allCaballeros) {
      logSuccess('Todos los productos son de caballeros');
    } else {
      logError('Algunos productos no son de caballeros');
    }
    
    return true;
  } catch (error) {
    logError(`Error al filtrar productos: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// TEST 3: Filtrar productos por tipo
async function test3_filterByTipo() {
  logTest(3, 'Filtrar productos por tipo (deportivos)');
  
  try {
    const response = await axios.get(`${BASE_URL}/api/catalog/products?tipo=deportivos`);

    logSuccess('Productos filtrados exitosamente');
    logInfo(`Productos deportivos: ${response.data.products.length}`);
    
    // Verificar que todos sean deportivos
    const allDeportivos = response.data.products.every(p => p.tipo === 'deportivos');
    if (allDeportivos) {
      logSuccess('Todos los productos son deportivos');
    } else {
      logError('Algunos productos no son deportivos');
    }
    
    return true;
  } catch (error) {
    logError(`Error al filtrar productos: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// TEST 4: Obtener hero slides
async function test4_getHeroSlides() {
  logTest(4, 'Obtener hero slides');
  
  try {
    const response = await axios.get(`${BASE_URL}/api/catalog/hero-slides`);

    logSuccess('Hero slides obtenidos exitosamente');
    logInfo(`Total de slides: ${response.data.heroSlides.length}`);
    
    if (response.data.heroSlides.length > 0) {
      const firstSlide = response.data.heroSlides[0];
      logInfo(`Primer slide: ${firstSlide.title.replace(/<[^>]*>/g, '')}`);
      logInfo(`Eyebrow: ${firstSlide.eyebrow}`);
    }
    
    return true;
  } catch (error) {
    logError(`Error al obtener hero slides: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// TEST 5: Obtener categorías
async function test5_getCategories() {
  logTest(5, 'Obtener categorías');
  
  try {
    const response = await axios.get(`${BASE_URL}/api/catalog/categories`);

    logSuccess('Categorías obtenidas exitosamente');
    logInfo(`Total de categorías: ${response.data.categories.length}`);
    
    response.data.categories.forEach(cat => {
      logInfo(`  - ${cat.label} (${cat.code})`);
    });
    
    return true;
  } catch (error) {
    logError(`Error al obtener categorías: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// TEST 6: Obtener audiencias
async function test6_getAudiences() {
  logTest(6, 'Obtener audiencias');
  
  try {
    const response = await axios.get(`${BASE_URL}/api/catalog/audiences`);

    logSuccess('Audiencias obtenidas exitosamente');
    logInfo(`Total de audiencias: ${response.data.audiences.length}`);
    
    response.data.audiences.forEach(aud => {
      logInfo(`  - ${aud.label} (${aud.code})`);
    });
    
    return true;
  } catch (error) {
    logError(`Error al obtener audiencias: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// TEST 7: Verificar que no requiere autenticación
async function test7_noAuthRequired() {
  logTest(7, 'Verificar que NO requiere autenticación');
  
  try {
    // Intentar sin token
    const response = await axios.get(`${BASE_URL}/api/catalog/products`);

    logSuccess('Endpoint público funciona sin autenticación');
    logInfo(`Productos obtenidos: ${response.data.products.length}`);
    
    return true;
  } catch (error) {
    if (error.response?.status === 401) {
      logError('El endpoint requiere autenticación (debería ser público)');
      return false;
    }
    logError(`Error inesperado: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// Ejecutar todos los tests
async function runAllTests() {
  log('\n' + '='.repeat(60), 'blue');
  log('INICIANDO TESTS DE CATÁLOGO PÚBLICO (ETAPA 6)', 'blue');
  log('='.repeat(60) + '\n', 'blue');

  const tests = [
    test1_getProducts,
    test2_filterByPersona,
    test3_filterByTipo,
    test4_getHeroSlides,
    test5_getCategories,
    test6_getAudiences,
    test7_noAuthRequired
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
    await new Promise(resolve => setTimeout(resolve, 300));
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
