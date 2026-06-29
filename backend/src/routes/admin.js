const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, requireRole } = require('../middleware/auth');

const prisma = new PrismaClient();

/**
 * Todas las rutas en este archivo requieren autenticación
 */
router.use(authenticateToken);

/**
 * RUTA: GET /api/admin/dashboard
 * Obtener estadísticas del dashboard
 */
router.get('/dashboard', async (req, res) => {
  try {
    const [
      totalProducts,
      activeProducts,
      totalOrders,
      totalCustomers,
      lowStockProducts
    ] = await Promise.all([
      prisma.product.count(),
      prisma.product.count({ where: { isActive: true } }),
      prisma.order.count(),
      prisma.customer.count(),
      prisma.productVariant.count({ where: { stockQty: { lte: 5 } } })
    ]);

    // Productos más vendidos (simulado por ahora)
    const topProducts = await prisma.product.findMany({
      take: 5,
      where: { isActive: true },
      include: {
        category: true,
        audience: true,
        images: { take: 1 }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Pedidos recientes
    const recentOrders = await prisma.order.findMany({
      take: 10,
      include: {
        customer: true,
        items: {
          include: {
            product: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      stats: {
        totalProducts,
        activeProducts,
        totalOrders,
        totalCustomers,
        lowStockProducts
      },
      topProducts,
      recentOrders
    });

  } catch (error) {
    console.error('Error en dashboard:', error);
    res.status(500).json({ 
      message: 'Error al obtener datos del dashboard' 
    });
  }
});

/**
 * RUTA: GET /api/admin/products
 * Listar todos los productos (con paginación)
 */
router.get('/products', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        skip,
        take: limit,
        include: {
          category: true,
          audience: true,
          images: { take: 1 },
          variants: {
            include: { size: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.product.count()
    ]);

    res.json({
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error al listar productos:', error);
    res.status(500).json({ 
      message: 'Error al obtener productos' 
    });
  }
});

/**
 * RUTA: GET /api/admin/products/:id
 * Obtener un producto específico
 */
router.get('/products/:id', async (req, res) => {
  try {
    const productId = parseInt(req.params.id);

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        category: true,
        audience: true,
        images: true,
        variants: {
          include: { size: true }
        }
      }
    });

    if (!product) {
      return res.status(404).json({ 
        message: 'Producto no encontrado' 
      });
    }

    res.json({ product });

  } catch (error) {
    console.error('Error al obtener producto:', error);
    res.status(500).json({ 
      message: 'Error al obtener producto' 
    });
  }
});

/**
 * RUTA: GET /api/admin/inventory/low-stock
 * Obtener productos con stock bajo
 */
router.get('/inventory/low-stock', async (req, res) => {
  try {
    const threshold = parseInt(req.query.threshold) || 5;

    const lowStockVariants = await prisma.productVariant.findMany({
      where: {
        stockQty: { lte: threshold }
      },
      include: {
        product: {
          include: {
            category: true,
            audience: true,
            images: { take: 1 }
          }
        },
        size: true
      },
      orderBy: { stockQty: 'asc' }
    });

    res.json({
      lowStockVariants,
      threshold
    });

  } catch (error) {
    console.error('Error al obtener stock bajo:', error);
    res.status(500).json({ 
      message: 'Error al obtener productos con stock bajo' 
    });
  }
});

/**
 * RUTA: GET /api/admin/users
 * Listar usuarios admin (solo para superadmin)
 */
router.get('/users', requireRole('admin'), async (req, res) => {
  try {
    const users = await prisma.adminUser.findMany({
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ users });

  } catch (error) {
    console.error('Error al listar usuarios:', error);
    res.status(500).json({ 
      message: 'Error al obtener usuarios' 
    });
  }
});

module.exports = router;

/**
 * RUTA: DELETE /api/admin/products/:id
 * Eliminar un producto (soft delete o hard delete)
 */
router.delete('/products/:id', async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const { hardDelete } = req.query; // ?hardDelete=true para eliminar permanentemente

    // Verificar que el producto existe
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        variants: true,
        images: true,
        orderItems: true
      }
    });

    if (!product) {
      return res.status(404).json({ 
        message: 'Producto no encontrado' 
      });
    }

    // Verificar si el producto tiene pedidos asociados
    if (product.orderItems && product.orderItems.length > 0) {
      return res.status(400).json({ 
        message: 'No se puede eliminar un producto que tiene pedidos asociados. Considera desactivarlo en su lugar.',
        hasOrders: true
      });
    }

    if (hardDelete === 'true') {
      // HARD DELETE: Eliminar permanentemente
      // Eliminar en orden: imágenes, variantes, producto
      await prisma.$transaction(async (tx) => {
        // Eliminar imágenes
        await tx.productImage.deleteMany({
          where: { productId: productId }
        });

        // Eliminar variantes
        await tx.productVariant.deleteMany({
          where: { productId: productId }
        });

        // Eliminar movimientos de inventario relacionados
        await tx.inventoryMovement.deleteMany({
          where: {
            variant: {
              productId: productId
            }
          }
        });

        // Eliminar producto
        await tx.product.delete({
          where: { id: productId }
        });
      });

      res.json({ 
        message: 'Producto eliminado permanentemente',
        deleted: true,
        productId
      });

    } else {
      // SOFT DELETE: Solo desactivar
      await prisma.product.update({
        where: { id: productId },
        data: { isActive: false }
      });

      res.json({ 
        message: 'Producto desactivado exitosamente',
        deactivated: true,
        productId
      });
    }

  } catch (error) {
    console.error('Error al eliminar producto:', error);
    res.status(500).json({ 
      message: 'Error al eliminar producto',
      error: error.message
    });
  }
});
