const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');

const prisma = new PrismaClient();

/**
 * Todas las rutas requieren autenticación
 */
router.use(authenticateToken);

/**
 * RUTA: GET /api/inventory/movements
 * Obtener historial de movimientos con filtros
 * Query params:
 * - productId: Filtrar por producto
 * - variantId: Filtrar por variante
 * - movementType: entrada | salida
 * - reason: compra | venta | ajuste | devolucion | merma | stock_inicial
 * - startDate: Fecha inicio (ISO)
 * - endDate: Fecha fin (ISO)
 * - page: Número de página (default: 1)
 * - limit: Items por página (default: 50)
 */
router.get('/movements', async (req, res) => {
  try {
    const {
      productId,
      variantId,
      movementType,
      reason,
      startDate,
      endDate,
      page = 1,
      limit = 50
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Construir filtros
    const where = {};

    if (variantId) {
      where.variantId = parseInt(variantId);
    } else if (productId) {
      // Si se filtra por producto, buscar todas sus variantes
      const variants = await prisma.productVariant.findMany({
        where: { productId: parseInt(productId) },
        select: { id: true }
      });
      where.variantId = { in: variants.map(v => v.id) };
    }

    if (movementType) {
      where.movementType = movementType;
    }

    if (reason) {
      where.reason = reason;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    // Obtener movimientos con paginación
    const [movements, total] = await Promise.all([
      prisma.inventoryMovement.findMany({
        where,
        include: {
          variant: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  sku: true
                }
              },
              size: {
                select: {
                  id: true,
                  code: true
                }
              }
            }
          },
          admin: {
            select: {
              id: true,
              fullName: true,
              email: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum
      }),
      prisma.inventoryMovement.count({ where })
    ]);

    res.json({
      movements,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    });

  } catch (error) {
    console.error('Error al obtener movimientos:', error);
    res.status(500).json({
      message: 'Error al obtener movimientos',
      error: error.message
    });
  }
});

/**
 * RUTA: GET /api/inventory/movements/summary
 * Obtener resumen de movimientos por período
 * Query params:
 * - startDate: Fecha inicio (ISO)
 * - endDate: Fecha fin (ISO)
 * - groupBy: day | week | month (default: day)
 */
router.get('/movements/summary', async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      groupBy = 'day'
    } = req.query;

    const where = {};
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    // Obtener todos los movimientos del período
    const movements = await prisma.inventoryMovement.findMany({
      where,
      select: {
        movementType: true,
        quantity: true,
        reason: true,
        createdAt: true
      },
      orderBy: { createdAt: 'asc' }
    });

    // Calcular totales por tipo
    const summary = {
      totalEntradas: 0,
      totalSalidas: 0,
      totalMovimientos: movements.length,
      porRazon: {},
      porTipo: {
        entrada: 0,
        salida: 0
      }
    };

    movements.forEach(mov => {
      if (mov.movementType === 'entrada') {
        summary.totalEntradas += mov.quantity;
        summary.porTipo.entrada += mov.quantity;
      } else {
        summary.totalSalidas += mov.quantity;
        summary.porTipo.salida += mov.quantity;
      }

      // Contar por razón
      if (!summary.porRazon[mov.reason]) {
        summary.porRazon[mov.reason] = {
          cantidad: 0,
          movimientos: 0
        };
      }
      summary.porRazon[mov.reason].cantidad += mov.quantity;
      summary.porRazon[mov.reason].movimientos += 1;
    });

    res.json({
      summary,
      period: {
        startDate: startDate || 'inicio',
        endDate: endDate || 'ahora'
      }
    });

  } catch (error) {
    console.error('Error al obtener resumen:', error);
    res.status(500).json({
      message: 'Error al obtener resumen',
      error: error.message
    });
  }
});

/**
 * RUTA: GET /api/inventory/low-stock
 * Obtener productos con stock bajo
 * Query params:
 * - threshold: Umbral de stock bajo (default: 5)
 * - categoryId: Filtrar por categoría
 * - audienceId: Filtrar por audiencia
 */
router.get('/low-stock', async (req, res) => {
  try {
    const {
      threshold = 5,
      categoryId,
      audienceId
    } = req.query;

    const thresholdNum = parseInt(threshold);

    // Construir filtros para productos
    const productWhere = {
      isActive: true
    };

    if (categoryId) {
      productWhere.categoryId = parseInt(categoryId);
    }

    if (audienceId) {
      productWhere.audienceId = parseInt(audienceId);
    }

    // Obtener variantes con stock bajo
    const lowStockVariants = await prisma.productVariant.findMany({
      where: {
        stockQty: {
          lte: thresholdNum,
          gte: 0
        },
        product: productWhere
      },
      include: {
        product: {
          include: {
            category: true,
            audience: true,
            images: {
              take: 1,
              orderBy: { sortOrder: 'asc' }
            }
          }
        },
        size: true
      },
      orderBy: [
        { stockQty: 'asc' },
        { product: { name: 'asc' } }
      ]
    });

    // Agrupar por producto
    const productMap = new Map();

    lowStockVariants.forEach(variant => {
      const productId = variant.product.id;
      
      if (!productMap.has(productId)) {
        productMap.set(productId, {
          product: {
            id: variant.product.id,
            name: variant.product.name,
            sku: variant.product.sku,
            category: variant.product.category,
            audience: variant.product.audience,
            image: variant.product.images[0]?.imageUrl || null
          },
          variants: []
        });
      }

      productMap.get(productId).variants.push({
        id: variant.id,
        size: variant.size.code,
        stockQty: variant.stockQty,
        reservedQty: variant.reservedQty,
        availableQty: variant.stockQty - variant.reservedQty
      });
    });

    const productsWithLowStock = Array.from(productMap.values());

    res.json({
      threshold: thresholdNum,
      totalProducts: productsWithLowStock.length,
      totalVariants: lowStockVariants.length,
      products: productsWithLowStock
    });

  } catch (error) {
    console.error('Error al obtener stock bajo:', error);
    res.status(500).json({
      message: 'Error al obtener stock bajo',
      error: error.message
    });
  }
});

/**
 * RUTA: GET /api/inventory/out-of-stock
 * Obtener productos sin stock (agotados)
 * Query params:
 * - categoryId: Filtrar por categoría
 * - audienceId: Filtrar por audiencia
 */
router.get('/out-of-stock', async (req, res) => {
  try {
    const {
      categoryId,
      audienceId
    } = req.query;

    // Construir filtros para productos
    const productWhere = {
      isActive: true
    };

    if (categoryId) {
      productWhere.categoryId = parseInt(categoryId);
    }

    if (audienceId) {
      productWhere.audienceId = parseInt(audienceId);
    }

    // Obtener variantes sin stock
    const outOfStockVariants = await prisma.productVariant.findMany({
      where: {
        stockQty: 0,
        product: productWhere
      },
      include: {
        product: {
          include: {
            category: true,
            audience: true,
            images: {
              take: 1,
              orderBy: { sortOrder: 'asc' }
            }
          }
        },
        size: true
      },
      orderBy: [
        { product: { name: 'asc' } }
      ]
    });

    // Agrupar por producto
    const productMap = new Map();

    outOfStockVariants.forEach(variant => {
      const productId = variant.product.id;
      
      if (!productMap.has(productId)) {
        productMap.set(productId, {
          product: {
            id: variant.product.id,
            name: variant.product.name,
            sku: variant.product.sku,
            category: variant.product.category,
            audience: variant.product.audience,
            image: variant.product.images[0]?.imageUrl || null
          },
          variants: []
        });
      }

      productMap.get(productId).variants.push({
        id: variant.id,
        size: variant.size.code,
        stockQty: 0
      });
    });

    const productsOutOfStock = Array.from(productMap.values());

    res.json({
      totalProducts: productsOutOfStock.length,
      totalVariants: outOfStockVariants.length,
      products: productsOutOfStock
    });

  } catch (error) {
    console.error('Error al obtener productos agotados:', error);
    res.status(500).json({
      message: 'Error al obtener productos agotados',
      error: error.message
    });
  }
});

/**
 * RUTA: GET /api/inventory/stock-report
 * Reporte completo de inventario
 * Query params:
 * - categoryId: Filtrar por categoría
 * - audienceId: Filtrar por audiencia
 */
router.get('/stock-report', async (req, res) => {
  try {
    const {
      categoryId,
      audienceId
    } = req.query;

    // Construir filtros
    const where = {
      isActive: true
    };

    if (categoryId) {
      where.categoryId = parseInt(categoryId);
    }

    if (audienceId) {
      where.audienceId = parseInt(audienceId);
    }

    // Obtener todos los productos con sus variantes
    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
        audience: true,
        variants: {
          include: {
            size: true
          },
          orderBy: {
            size: { sortOrder: 'asc' }
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    // Calcular estadísticas
    let totalProducts = products.length;
    let totalVariants = 0;
    let totalStock = 0;
    let totalReserved = 0;
    let productsWithStock = 0;
    let productsOutOfStock = 0;
    let variantsWithLowStock = 0;

    const lowStockThreshold = 5;

    products.forEach(product => {
      let productHasStock = false;

      product.variants.forEach(variant => {
        totalVariants++;
        totalStock += variant.stockQty;
        totalReserved += variant.reservedQty;

        if (variant.stockQty > 0) {
          productHasStock = true;
        }

        if (variant.stockQty > 0 && variant.stockQty <= lowStockThreshold) {
          variantsWithLowStock++;
        }
      });

      if (productHasStock) {
        productsWithStock++;
      } else {
        productsOutOfStock++;
      }
    });

    res.json({
      summary: {
        totalProducts,
        totalVariants,
        totalStock,
        totalReserved,
        availableStock: totalStock - totalReserved,
        productsWithStock,
        productsOutOfStock,
        variantsWithLowStock
      },
      products: products.map(p => ({
        id: p.id,
        name: p.name,
        sku: p.sku,
        category: p.category.label,
        audience: p.audience.label,
        totalStock: p.variants.reduce((sum, v) => sum + v.stockQty, 0),
        totalReserved: p.variants.reduce((sum, v) => sum + v.reservedQty, 0),
        variants: p.variants.map(v => ({
          size: v.size.code,
          stock: v.stockQty,
          reserved: v.reservedQty,
          available: v.stockQty - v.reservedQty
        }))
      }))
    });

  } catch (error) {
    console.error('Error al generar reporte:', error);
    res.status(500).json({
      message: 'Error al generar reporte',
      error: error.message
    });
  }
});

/**
 * RUTA: GET /api/inventory/alerts
 * Obtener alertas de inventario (stock bajo + agotados)
 */
router.get('/alerts', async (req, res) => {
  try {
    const threshold = 5;

    // Obtener variantes con stock bajo (pero no agotadas)
    const lowStockVariants = await prisma.productVariant.findMany({
      where: {
        stockQty: {
          gt: 0,
          lte: threshold
        },
        product: {
          isActive: true
        }
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true
          }
        },
        size: {
          select: {
            code: true
          }
        }
      },
      orderBy: [
        { stockQty: 'asc' }
      ]
    });

    // Obtener variantes agotadas
    const outOfStockVariants = await prisma.productVariant.findMany({
      where: {
        stockQty: 0,
        product: {
          isActive: true
        }
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true
          }
        },
        size: {
          select: {
            code: true
          }
        }
      },
      orderBy: [
        { product: { name: 'asc' } }
      ]
    });

    const alerts = [
      ...lowStockVariants.map(v => ({
        type: 'low_stock',
        severity: 'warning',
        productId: v.product.id,
        productName: v.product.name,
        sku: v.product.sku,
        variantId: v.id,
        size: v.size.code,
        currentStock: v.stockQty,
        threshold,
        message: `Stock bajo: ${v.product.name} (Talla ${v.size.code}) - Solo quedan ${v.stockQty} unidades`
      })),
      ...outOfStockVariants.map(v => ({
        type: 'out_of_stock',
        severity: 'critical',
        productId: v.product.id,
        productName: v.product.name,
        sku: v.product.sku,
        variantId: v.id,
        size: v.size.code,
        currentStock: 0,
        message: `Agotado: ${v.product.name} (Talla ${v.size.code})`
      }))
    ];

    res.json({
      totalAlerts: alerts.length,
      lowStockCount: lowStockVariants.length,
      outOfStockCount: outOfStockVariants.length,
      threshold,
      alerts
    });

  } catch (error) {
    console.error('Error al obtener alertas:', error);
    res.status(500).json({
      message: 'Error al obtener alertas',
      error: error.message
    });
  }
});

module.exports = router;
