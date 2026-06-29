const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');
const { processImageInput, generateImagePathFromSKU } = require('../utils/imageHelper');

const prisma = new PrismaClient();

/**
 * Todas las rutas requieren autenticación
 */
router.use(authenticateToken);

/**
 * RUTA: POST /api/products
 * Crear un nuevo producto con sus variantes
 * NUEVA FUNCIONALIDAD: Genera automáticamente rutas de imágenes desde SKU o ID
 */
router.post('/', async (req, res) => {
  try {
    const {
      sku,
      name,
      description,
      basePrice,
      badge,
      categoryId,
      audienceId,
      images = [],
      imageId, // Nuevo: acepta ID numérico directo
      variants = []
    } = req.body;

    // Validaciones
    if (!name || !basePrice || !categoryId || !audienceId) {
      return res.status(400).json({
        message: 'Campos requeridos: name, basePrice, categoryId, audienceId'
      });
    }

    // Verificar que categoría y audiencia existan
    const [category, audience] = await Promise.all([
      prisma.category.findUnique({ where: { id: parseInt(categoryId) } }),
      prisma.audience.findUnique({ where: { id: parseInt(audienceId) } })
    ]);

    if (!category) {
      return res.status(404).json({ message: 'Categoría no encontrada' });
    }

    if (!audience) {
      return res.status(404).json({ message: 'Audiencia no encontrada' });
    }

    // Crear producto con imágenes y variantes en una transacción
    const product = await prisma.$transaction(async (tx) => {
      // 1. Crear producto
      const newProduct = await tx.product.create({
        data: {
          sku,
          name,
          description,
          basePrice: parseFloat(basePrice),
          badge,
          categoryId: parseInt(categoryId),
          audienceId: parseInt(audienceId),
          isActive: true
        }
      });

      // 2. Procesar y crear imágenes
      const imagesToCreate = [];
      
      // Si se proporcionó imageId (número directo), usarlo
      if (imageId) {
        const imagePath = processImageInput(imageId, sku);
        if (imagePath) {
          imagesToCreate.push({
            productId: newProduct.id,
            imageUrl: imagePath,
            altText: name,
            sortOrder: 0
          });
        }
      }
      
      // Si se proporcionaron imágenes en array, procesarlas
      if (images.length > 0) {
        images.forEach((img, index) => {
          const imagePath = processImageInput(img.imageUrl || img.url || img, sku);
          if (imagePath) {
            imagesToCreate.push({
              productId: newProduct.id,
              imageUrl: imagePath,
              altText: img.altText || name,
              sortOrder: img.sortOrder !== undefined ? img.sortOrder : index + (imageId ? 1 : 0)
            });
          }
        });
      }
      
      // Si no hay imágenes pero hay SKU, generar automáticamente desde SKU
      if (imagesToCreate.length === 0 && sku) {
        const autoImagePath = generateImagePathFromSKU(sku);
        if (autoImagePath) {
          imagesToCreate.push({
            productId: newProduct.id,
            imageUrl: autoImagePath,
            altText: name,
            sortOrder: 0
          });
        }
      }
      
      // Crear todas las imágenes
      if (imagesToCreate.length > 0) {
        await tx.productImage.createMany({
          data: imagesToCreate
        });
      }

      // 3. Crear variantes si existen
      if (variants.length > 0) {
        for (const variant of variants) {
          const size = await tx.size.findUnique({
            where: { id: parseInt(variant.sizeId) }
          });

          if (!size) {
            throw new Error(`Talla con ID ${variant.sizeId} no encontrada`);
          }

          const stockQty = parseInt(variant.stockQty) || 0;

          if (stockQty < 0) {
            throw new Error('El stock no puede ser negativo');
          }

          // Crear variante
          const newVariant = await tx.productVariant.create({
            data: {
              productId: newProduct.id,
              sizeId: parseInt(variant.sizeId),
              stockQty,
              reservedQty: 0
            }
          });

          // Registrar movimiento de inventario si hay stock inicial
          if (stockQty > 0) {
            await tx.inventoryMovement.create({
              data: {
                variantId: newVariant.id,
                movementType: 'entrada',
                quantity: stockQty,
                reason: 'stock_inicial',
                note: 'Stock inicial al crear producto',
                createdBy: req.user.id
              }
            });
          }
        }
      }

      // Retornar producto completo
      return await tx.product.findUnique({
        where: { id: newProduct.id },
        include: {
          category: true,
          audience: true,
          images: { orderBy: { sortOrder: 'asc' } },
          variants: {
            include: { size: true },
            orderBy: { size: { sortOrder: 'asc' } }
          }
        }
      });
    });

    res.status(201).json({
      message: 'Producto creado exitosamente',
      product
    });

  } catch (error) {
    console.error('Error al crear producto:', error);
    res.status(500).json({
      message: 'Error al crear producto',
      error: error.message
    });
  }
});

/**
 * RUTA: GET /api/products/:id
 * Obtener un producto específico con sus variantes
 */
router.get('/:id', async (req, res) => {
  try {
    const productId = parseInt(req.params.id);

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        category: true,
        audience: true,
        images: {
          orderBy: { sortOrder: 'asc' }
        },
        variants: {
          include: {
            size: true
          },
          orderBy: {
            size: {
              sortOrder: 'asc'
            }
          }
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
      message: 'Error al obtener producto',
      error: error.message
    });
  }
});

/**
 * RUTA: GET /api/products
 * Obtener todos los productos
 */
router.get('/', async (req, res) => {
  try {

    const products = await prisma.product.findMany({
      include: {
        category: true,
        audience: true,
        images: {
          orderBy: { sortOrder: 'asc' }
        },
        variants: {
          include: {
            size: true
          },
          orderBy: {
            size: {
              sortOrder: 'asc'
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({ products });

  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({
      message: 'Error al obtener productos',
      error: error.message
    });
  }
});

/**
 * RUTA: PUT /api/products/:id
 * Actualizar un producto existente
 */
router.put('/:id', async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const {
      sku,
      name,
      description,
      basePrice,
      badge,
      categoryId,
      audienceId,
      isActive,
      images,
      variants
    } = req.body;

    // Verificar que el producto existe
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        images: true,
        variants: true
      }
    });

    if (!existingProduct) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    // Actualizar en transacción
    const product = await prisma.$transaction(async (tx) => {
      // 1. Actualizar datos básicos del producto
      const updateData = {};
      if (sku !== undefined) updateData.sku = sku;
      if (name !== undefined) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (basePrice !== undefined) updateData.basePrice = parseFloat(basePrice);
      if (badge !== undefined) updateData.badge = badge;
      if (categoryId !== undefined) updateData.categoryId = parseInt(categoryId);
      if (audienceId !== undefined) updateData.audienceId = parseInt(audienceId);
      if (isActive !== undefined) updateData.isActive = isActive;

      const updatedProduct = await tx.product.update({
        where: { id: productId },
        data: updateData
      });

      // 2. Actualizar imágenes si se proporcionan
      if (images !== undefined) {
        // Eliminar imágenes existentes
        await tx.productImage.deleteMany({
          where: { productId }
        });

        // Crear nuevas imágenes
        if (images.length > 0) {
          await tx.productImage.createMany({
            data: images.map((img, index) => ({
              productId,
              imageUrl: img.imageUrl || img.url,
              altText: img.altText || name || existingProduct.name,
              sortOrder: img.sortOrder !== undefined ? img.sortOrder : index
            }))
          });
        }
      }

      // 3. Actualizar variantes si se proporcionan
      if (variants !== undefined) {
        // No eliminamos variantes existentes, solo actualizamos o creamos nuevas
        for (const variant of variants) {
          const sizeId = parseInt(variant.sizeId);
          const stockQty = parseInt(variant.stockQty) || 0;

          if (stockQty < 0) {
            throw new Error('El stock no puede ser negativo');
          }

          // Buscar si la variante ya existe
          const existingVariant = await tx.productVariant.findUnique({
            where: {
              productId_sizeId: {
                productId,
                sizeId
              }
            }
          });

          if (existingVariant) {
            // Actualizar variante existente
            const stockDiff = stockQty - existingVariant.stockQty;

            await tx.productVariant.update({
              where: { id: existingVariant.id },
              data: { stockQty }
            });

            // Registrar movimiento si hay cambio en stock
            if (stockDiff !== 0) {
              await tx.inventoryMovement.create({
                data: {
                  variantId: existingVariant.id,
                  movementType: stockDiff > 0 ? 'entrada' : 'salida',
                  quantity: Math.abs(stockDiff),
                  reason: 'ajuste',
                  note: `Ajuste manual al actualizar producto`,
                  createdBy: req.user.id
                }
              });
            }
          } else {
            // Crear nueva variante
            const newVariant = await tx.productVariant.create({
              data: {
                productId,
                sizeId,
                stockQty,
                reservedQty: 0
              }
            });

            // Registrar movimiento si hay stock inicial
            if (stockQty > 0) {
              await tx.inventoryMovement.create({
                data: {
                  variantId: newVariant.id,
                  movementType: 'entrada',
                  quantity: stockQty,
                  reason: 'stock_inicial',
                  note: 'Stock inicial al agregar variante',
                  createdBy: req.user.id
                }
              });
            }
          }
        }
      }

      // Retornar producto actualizado
      return await tx.product.findUnique({
        where: { id: productId },
        include: {
          category: true,
          audience: true,
          images: { orderBy: { sortOrder: 'asc' } },
          variants: {
            include: { size: true },
            orderBy: { size: { sortOrder: 'asc' } }
          }
        }
      });
    });

    res.json({
      message: 'Producto actualizado exitosamente',
      product
    });

  } catch (error) {
    console.error('Error al actualizar producto:', error);
    res.status(500).json({
      message: 'Error al actualizar producto',
      error: error.message
    });
  }
});

/**
 * RUTA: DELETE /api/products/:id
 * Eliminar (desactivar) un producto
 */
router.delete('/:id', async (req, res) => {
  try {
    const productId = parseInt(req.params.id);

    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    // Desactivar en lugar de eliminar (soft delete)
    await prisma.product.update({
      where: { id: productId },
      data: { isActive: false }
    });

    res.json({
      message: 'Producto desactivado exitosamente'
    });

  } catch (error) {
    console.error('Error al eliminar producto:', error);
    res.status(500).json({
      message: 'Error al eliminar producto',
      error: error.message
    });
  }
});

/**
 * RUTA: POST /api/products/:id/variants/:variantId/stock
 * Ajustar stock de una variante específica
 */
router.post('/:id/variants/:variantId/stock', async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const variantId = parseInt(req.params.variantId);
    const { quantity, reason, note } = req.body;

    if (!quantity || quantity === 0) {
      return res.status(400).json({
        message: 'La cantidad debe ser diferente de cero'
      });
    }

    if (!reason) {
      return res.status(400).json({
        message: 'El motivo es requerido'
      });
    }

    // Verificar que la variante existe y pertenece al producto
    const variant = await prisma.productVariant.findFirst({
      where: {
        id: variantId,
        productId
      },
      include: {
        product: true,
        size: true
      }
    });

    if (!variant) {
      return res.status(404).json({
        message: 'Variante no encontrada'
      });
    }

    // Calcular nuevo stock
    const newStock = variant.stockQty + quantity;

    if (newStock < 0) {
      return res.status(400).json({
        message: 'El stock resultante no puede ser negativo',
        currentStock: variant.stockQty,
        requestedChange: quantity,
        resultingStock: newStock
      });
    }

    // Actualizar stock y registrar movimiento en transacción
    const result = await prisma.$transaction(async (tx) => {
      // Actualizar stock
      const updatedVariant = await tx.productVariant.update({
        where: { id: variantId },
        data: { stockQty: newStock }
      });

      // Registrar movimiento
      const movement = await tx.inventoryMovement.create({
        data: {
          variantId,
          movementType: quantity > 0 ? 'entrada' : 'salida',
          quantity: Math.abs(quantity),
          reason,
          note,
          createdBy: req.user.id
        }
      });

      return { updatedVariant, movement };
    });

    res.json({
      message: 'Stock actualizado exitosamente',
      variant: {
        ...result.updatedVariant,
        product: variant.product,
        size: variant.size
      },
      movement: result.movement,
      previousStock: variant.stockQty,
      newStock
    });

  } catch (error) {
    console.error('Error al ajustar stock:', error);
    res.status(500).json({
      message: 'Error al ajustar stock',
      error: error.message
    });
  }
});

/**
 * RUTA: GET /api/products/:id/variants/:variantId/movements
 * Obtener historial de movimientos de una variante
 */
router.get('/:id/variants/:variantId/movements', async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const variantId = parseInt(req.params.variantId);

    // Verificar que la variante existe y pertenece al producto
    const variant = await prisma.productVariant.findFirst({
      where: {
        id: variantId,
        productId
      }
    });

    if (!variant) {
      return res.status(404).json({
        message: 'Variante no encontrada'
      });
    }

    // Obtener movimientos
    const movements = await prisma.inventoryMovement.findMany({
      where: { variantId },
      include: {
        admin: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      movements,
      total: movements.length
    });

  } catch (error) {
    console.error('Error al obtener movimientos:', error);
    res.status(500).json({
      message: 'Error al obtener movimientos',
      error: error.message
    });
  }
});

module.exports = router;
