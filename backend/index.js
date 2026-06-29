const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./src/routes/auth');
const adminRoutes = require('./src/routes/admin');
const productsRoutes = require('./src/routes/products');
const inventoryRoutes = require('./src/routes/inventory');
const ordersRoutes = require('./src/routes/orders');
const catalogRoutes = require('./src/routes/catalog');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Ruta raíz
app.get('/', (req, res) => {
  res.json({ 
    message: 'API Kiro Shoes - Sistema de Inventario',
    version: '1.6.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      admin: '/api/admin',
      products: '/api/products',
      inventory: '/api/inventory',
      orders: '/api/orders',
      catalog: '/api/catalog (público)'
    }
  });
});

// RUTAS
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/catalog', catalogRoutes); // Ruta pública

// Ruta de salud
app.get('/health', (req, res) => {
  res.json({ 
    status: 'Servidor funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ 
    message: 'Ruta no encontrada',
    path: req.path
  });
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error('Error no manejado:', err);
  res.status(500).json({ 
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📊 Dashboard admin: http://localhost:${PORT}/api/admin/dashboard`);
  console.log(`🔐 Login: POST http://localhost:${PORT}/api/auth/login`);
});