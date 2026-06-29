const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * RUTA PÚBLICA: GET /api/catalog/products
 * Obtener catálogo público de productos activos
 * NO requiere autenticación
 */
router.get('/products', async (req, res) => {
  try {
    const {
      persona,
      tipo,
      categoryId,
      audienceId,
      page = 1,
      limit = 100
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Construir filtros
    const where = {
      isActive: true // Solo productos activos
    };

    if (categoryId) {
      where.categoryId = parseInt(categoryId);
    }

    if (audienceId) {
      where.audienceId = parseInt(audienceId);
    }

    // Obtener productos con sus variantes
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: {
            select: {
              id: true,
              code: true,
              label: true
            }
          },
          audience: {
            select: {
              id: true,
              code: true,
              label: true
            }
          },
          images: {
            orderBy: { sortOrder: 'asc' },
            take: 1 // Solo la primera imagen para el catálogo
          },
          variants: {
            include: {
              size: {
                select: {
                  code: true,
                  sortOrder: true
                }
              }
            },
            orderBy: {
              size: {
                sortOrder: 'asc'
              }
            }
          }
        },
        orderBy: [
          { createdAt: 'desc' },
          { id: 'asc' }
        ],
        skip,
        take: limitNum
      }),
      prisma.product.count({ where })
    ]);

    // Transformar datos al formato esperado por el frontend
    const transformedProducts = products.map(product => {
      // Calcular stock disponible total
      const totalStock = product.variants.reduce((sum, v) => {
        const available = v.stockQty - v.reservedQty;
        return sum + (available > 0 ? available : 0);
      }, 0);

      // Obtener tallas disponibles (con stock > 0)
      const availableSizes = product.variants
        .filter(v => (v.stockQty - v.reservedQty) > 0)
        .map(v => v.size.code)
        .join(', ');

      // Determinar badge
      let badge = product.badge;
      if (totalStock === 0) {
        badge = 'No disponible';
      }

      return {
        id: product.id,
        name: product.name,
        desc: product.description || '',
        price: product.basePrice ? `C$${parseFloat(product.basePrice).toFixed(0)}` : '',
        sizes: availableSizes || 'Consultar',
        persona: product.audience.code,
        tipo: product.category.code,
        badge: badge,
        img: product.images[0]?.imageUrl || '',
        stockAvailable: totalStock > 0
      };
    });

    // Filtrar por persona y tipo si se especifican (para compatibilidad con frontend)
    let filteredProducts = transformedProducts;
    
    if (persona && persona !== 'todos') {
      filteredProducts = filteredProducts.filter(p => p.persona === persona);
    }

    if (tipo && tipo !== 'todos-tipo') {
      filteredProducts = filteredProducts.filter(p => p.tipo === tipo);
    }

    res.json({
      products: filteredProducts,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: filteredProducts.length,
        totalPages: Math.ceil(filteredProducts.length / limitNum)
      }
    });

  } catch (error) {
    console.error('Error al obtener catálogo:', error);
    res.status(500).json({
      message: 'Error al obtener catálogo',
      error: error.message
    });
  }
});

/**
 * RUTA PÚBLICA: GET /api/catalog/hero-slides
 * Obtener slides del hero (portada)
 * NO requiere autenticación
 */
router.get('/hero-slides', async (req, res) => {
  try {
    // Por ahora, devolver slides estáticos
    // En el futuro, estos podrían venir de la base de datos
    const heroSlides = [
      {
        img: "imagenes/caballeros/deportivos/1.jpeg",
        eyebrow: "Calzados Hermanos Solis",
        title: "Tu Mejor Estilo<br><em>Para Toda la Familia</em>",
        subtitle: "Calzado de calidad para niños, jóvenes, damas y caballeros en Masaya, Nicaragua.",
        cta: "Ver colección"
      },
      {
        img: "imagenes/caballeros/deportivos/2.jpeg",
        eyebrow: "Colección Deportiva",
        title: "Comodidad<br><em>en Cada Paso</em>",
        subtitle: "Tenis y calzado deportivo para toda la familia.",
        cta: "Ver deportivos"
      },
      {
        img: "imagenes/caballeros/casuales/6.jpeg",
        eyebrow: "Colección Casual",
        title: "Estilo<br><em>para el Día a Día</em>",
        subtitle: "Calzado casual elegante y resistente para caballeros.",
        cta: "Ver casuales"
      }
    ];

    res.json({
      heroSlides
    });

  } catch (error) {
    console.error('Error al obtener hero slides:', error);
    res.status(500).json({
      message: 'Error al obtener hero slides',
      error: error.message
    });
  }
});

/**
 * RUTA PÚBLICA: GET /api/catalog/categories
 * Obtener categorías disponibles
 * NO requiere autenticación
 */
router.get('/categories', async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { label: 'asc' }
    });

    res.json({
      categories
    });

  } catch (error) {
    console.error('Error al obtener categorías:', error);
    res.status(500).json({
      message: 'Error al obtener categorías',
      error: error.message
    });
  }
});

/**
 * RUTA PÚBLICA: GET /api/catalog/audiences
 * Obtener audiencias disponibles
 * NO requiere autenticación
 */
router.get('/audiences', async (req, res) => {
  try {
    const audiences = await prisma.audience.findMany({
      orderBy: { label: 'asc' }
    });

    res.json({
      audiences
    });

  } catch (error) {
    console.error('Error al obtener audiencias:', error);
    res.status(500).json({
      message: 'Error al obtener audiencias',
      error: error.message
    });
  }
});

module.exports = router;
