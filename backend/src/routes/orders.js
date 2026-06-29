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
 * RUTA: POST /api/orders
 * Crear un nuevo pedido y descontar stock automáticamente
 */
router.post('/', async (req, res) => {
  try {
    const {
      customer,
      items,
      notes,
      source = 'web'
    } = req.body;

    // Validaciones
    if (!customer || !customer.fullName || !customer.phone) {
      return res.status(400).json({
        message: 'Datos del cliente requeridos: fullName, phone'
      });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: 'Debe incluir al menos un item en el pedido'
      });
    }

    // Validar que todos los items tengan los campos requeridos
    for (const item of items) {
      if (!item.productId || !item.variantId || !item.quantity) {
        return res.status(400).json({
          message: 'Cada item debe tener: productId, variantId, quantity'
        });
      }

      if (item.quantity <= 0) {
        return res.status(400).json({
          message: 'La cantidad debe ser mayor a 0'
        });
      }
    }

    // Crear pedido en transacción
    const order = await prisma.$transaction(async (tx) => {
      // 1. Buscar o crear cliente
      let existingCustomer = await tx.customer.findFirst({
        where: {
          phone: customer.phone
        }
      });

      if (!existingCustomer) {
        existingCustomer = await tx.customer.create({
          data: {
            fullName: customer.fullName,
            phone: customer.phone,
            city: customer.city || null,
            address: customer.address || null
          }
        });
      } else {
        // Actualizar datos del cliente si han cambiado
        existingCustomer = await tx.customer.update({
          where: { id: existingCustomer.id },
          data: {
            fullName: customer.fullName,
            city: customer.city || existingCustomer.city,
            address: customer.address || existingCustomer.address
          }
        });
      }

      // 2. Validar disponibilidad de stock para todos los items
      const itemsData = [];
      let subtotal = 0;

      for (const item of items) {
        // Obtener variante con producto
        const variant = await tx.productVariant.findUnique({
          where: { id: parseInt(item.variantId) },
          include: {
            product: true,
            size: true
          }
        });

        if (!variant) {
          throw new Error(`Variante con ID ${item.variantId} no encontrada`);
        }

        if (variant.productId !== parseInt(item.productId)) {
          throw new Error(`La variante ${item.variantId} no pertenece al producto ${item.productId}`);
        }

        if (!variant.product.isActive) {
          throw new Error(`El producto ${variant.product.name} no está activo`);
        }

        // Verificar stock disponible
        const availableStock = variant.stockQty - variant.reservedQty;
        if (availableStock < item.quantity) {
          throw new Error(
            `Stock insuficiente para ${variant.product.name} (Talla ${variant.size.code}). ` +
            `Disponible: ${availableStock}, Solicitado: ${item.quantity}`
          );
        }

        const unitPrice = parseFloat(variant.product.basePrice);
        const lineTotal = unitPrice * item.quantity;
        subtotal += lineTotal;

        itemsData.push({
          variant,
          quantity: item.quantity,
          unitPrice,
          lineTotal
        });
      }

      // 3. Crear el pedido
      const newOrder = await tx.order.create({
        data: {
          customerId: existingCustomer.id,
          status: 'pending',
          source,
          subtotal,
          discount: 0,
          total: subtotal,
          notes
        }
      });

      // 4. Crear items del pedido y reservar stock
      for (const itemData of itemsData) {
        // Crear item del pedido
        await tx.orderItem.create({
          data: {
            orderId: newOrder.id,
            productId: itemData.variant.productId,
            variantId: itemData.variant.id,
            quantity: itemData.quantity,
            unitPrice: itemData.unitPrice,
            lineTotal: itemData.lineTotal
          }
        });

        // Reservar stock (no descontar aún, solo reservar)
        await tx.productVariant.update({
          where: { id: itemData.variant.id },
          data: {
            reservedQty: {
              increment: itemData.quantity
            }
          }
        });
      }

      // 5. Registrar cambio de estado inicial
      await tx.orderStatusHistory.create({
        data: {
          orderId: newOrder.id,
          oldStatus: null,
          newStatus: 'pending',
          note: 'Pedido creado',
          changedBy: req.user.id
        }
      });

      // Retornar pedido completo
      return await tx.order.findUnique({
        where: { id: newOrder.id },
        include: {
          customer: true,
          items: {
            include: {
              product: {
                include: {
                  images: {
                    take: 1,
                    orderBy: { sortOrder: 'asc' }
                  }
                }
              },
              variant: {
                include: {
                  size: true
                }
              }
            }
          },
          statusHistory: {
            include: {
              admin: {
                select: {
                  id: true,
                  fullName: true,
                  email: true
                }
              }
            },
            orderBy: { changedAt: 'desc' }
          }
        }
      });
    });

    res.status(201).json({
      message: 'Pedido creado exitosamente',
      order
    });

  } catch (error) {
    console.error('Error al crear pedido:', error);
    res.status(500).json({
      message: 'Error al crear pedido',
      error: error.message
    });
  }
});

/**
 * RUTA: GET /api/orders/stats/summary
 * Obtener estadísticas de pedidos
 * IMPORTANTE: Esta ruta debe estar ANTES de /api/orders/:id
 */
router.get('/stats/summary', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

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

    // Obtener estadísticas
    const [
      totalOrders,
      ordersByStatus,
      totalRevenue,
      averageOrderValue
    ] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.groupBy({
        by: ['status'],
        where,
        _count: true
      }),
      prisma.order.aggregate({
        where,
        _sum: {
          total: true
        }
      }),
      prisma.order.aggregate({
        where,
        _avg: {
          total: true
        }
      })
    ]);

    // Formatear estadísticas por estado
    const statusStats = {};
    ordersByStatus.forEach(stat => {
      statusStats[stat.status] = stat._count;
    });

    // Convertir Decimal a número
    const avgValue = averageOrderValue._avg.total ? parseFloat(averageOrderValue._avg.total) : 0;
    const totalRev = totalRevenue._sum.total ? parseFloat(totalRevenue._sum.total) : 0;

    res.json({
      summary: {
        totalOrders,
        totalRevenue: totalRev,
        averageOrderValue: avgValue,
        byStatus: statusStats
      },
      period: {
        startDate: startDate || 'inicio',
        endDate: endDate || 'ahora'
      }
    });

  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({
      message: 'Error al obtener estadísticas',
      error: error.message
    });
  }
});

/**
 * RUTA: GET /api/orders
 * Listar pedidos con filtros
 */
router.get('/', async (req, res) => {
  try {
    const {
      status,
      customerId,
      startDate,
      endDate,
      page = 1,
      limit = 20
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Construir filtros
    const where = {};

    if (status) {
      where.status = status;
    }

    if (customerId) {
      where.customerId = parseInt(customerId);
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

    // Obtener pedidos con paginación
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          customer: true,
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  sku: true
                }
              },
              variant: {
                include: {
                  size: true
                }
              }
            }
          },
          _count: {
            select: {
              items: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum
      }),
      prisma.order.count({ where })
    ]);

    res.json({
      orders,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    });

  } catch (error) {
    console.error('Error al listar pedidos:', error);
    res.status(500).json({
      message: 'Error al listar pedidos',
      error: error.message
    });
  }
});

/**
 * RUTA: GET /api/orders/:id
 * Obtener un pedido específico
 */
router.get('/:id', async (req, res) => {
  try {
    const orderId = parseInt(req.params.id);

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        customer: true,
        items: {
          include: {
            product: {
              include: {
                images: {
                  take: 1,
                  orderBy: { sortOrder: 'asc' }
                }
              }
            },
            variant: {
              include: {
                size: true
              }
            }
          }
        },
        statusHistory: {
          include: {
            admin: {
              select: {
                id: true,
                fullName: true,
                email: true
              }
            }
          },
          orderBy: { changedAt: 'desc' }
        }
      }
    });

    if (!order) {
      return res.status(404).json({
        message: 'Pedido no encontrado'
      });
    }

    res.json({ order });

  } catch (error) {
    console.error('Error al obtener pedido:', error);
    res.status(500).json({
      message: 'Error al obtener pedido',
      error: error.message
    });
  }
});

/**
 * RUTA: POST /api/orders/:id/confirm
 * Confirmar pedido y descontar stock definitivamente
 */
router.post('/:id/confirm', async (req, res) => {
  try {
    const orderId = parseInt(req.params.id);
    const { note } = req.body;

    const result = await prisma.$transaction(async (tx) => {
      // 1. Obtener pedido con items
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: {
          items: {
            include: {
              variant: {
                include: {
                  product: true,
                  size: true
                }
              }
            }
          }
        }
      });

      if (!order) {
        throw new Error('Pedido no encontrado');
      }

      if (order.status !== 'pending') {
        throw new Error(`No se puede confirmar un pedido en estado ${order.status}`);
      }

      // 2. Descontar stock y liberar reserva para cada item
      for (const item of order.items) {
        const variant = item.variant;

        // Verificar que el stock reservado sea suficiente
        if (variant.reservedQty < item.quantity) {
          throw new Error(
            `Stock reservado insuficiente para ${variant.product.name} (Talla ${variant.size.code})`
          );
        }

        // Descontar stock y liberar reserva
        await tx.productVariant.update({
          where: { id: variant.id },
          data: {
            stockQty: {
              decrement: item.quantity
            },
            reservedQty: {
              decrement: item.quantity
            }
          }
        });

        // Registrar movimiento de inventario
        await tx.inventoryMovement.create({
          data: {
            variantId: variant.id,
            movementType: 'salida',
            quantity: item.quantity,
            reason: 'venta',
            referenceType: 'order',
            referenceId: orderId,
            note: `Venta - Pedido #${orderId}`,
            createdBy: req.user.id
          }
        });
      }

      // 3. Actualizar estado del pedido
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          status: 'confirmed'
        }
      });

      // 4. Registrar cambio de estado
      await tx.orderStatusHistory.create({
        data: {
          orderId,
          oldStatus: 'pending',
          newStatus: 'confirmed',
          note: note || 'Pedido confirmado y stock descontado',
          changedBy: req.user.id
        }
      });

      return updatedOrder;
    });

    // Obtener pedido actualizado con relaciones
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        customer: true,
        items: {
          include: {
            product: true,
            variant: {
              include: {
                size: true
              }
            }
          }
        },
        statusHistory: {
          include: {
            admin: {
              select: {
                id: true,
                fullName: true,
                email: true
              }
            }
          },
          orderBy: { changedAt: 'desc' }
        }
      }
    });

    res.json({
      message: 'Pedido confirmado y stock descontado exitosamente',
      order
    });

  } catch (error) {
    console.error('Error al confirmar pedido:', error);
    res.status(500).json({
      message: 'Error al confirmar pedido',
      error: error.message
    });
  }
});

/**
 * RUTA: POST /api/orders/:id/cancel
 * Cancelar pedido y liberar stock reservado
 */
router.post('/:id/cancel', async (req, res) => {
  try {
    const orderId = parseInt(req.params.id);
    const { note, reason = 'cancelled_by_admin' } = req.body;

    const result = await prisma.$transaction(async (tx) => {
      // 1. Obtener pedido con items
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: {
          items: {
            include: {
              variant: {
                include: {
                  product: true,
                  size: true
                }
              }
            }
          }
        }
      });

      if (!order) {
        throw new Error('Pedido no encontrado');
      }

      if (order.status === 'cancelled') {
        throw new Error('El pedido ya está cancelado');
      }

      if (order.status === 'delivered') {
        throw new Error('No se puede cancelar un pedido ya entregado');
      }

      const oldStatus = order.status;

      // 2. Liberar stock según el estado del pedido
      for (const item of order.items) {
        const variant = item.variant;

        if (oldStatus === 'pending') {
          // Si está pendiente, solo liberar reserva
          await tx.productVariant.update({
            where: { id: variant.id },
            data: {
              reservedQty: {
                decrement: item.quantity
              }
            }
          });
        } else if (oldStatus === 'confirmed' || oldStatus === 'shipped') {
          // Si ya fue confirmado/enviado, devolver stock
          await tx.productVariant.update({
            where: { id: variant.id },
            data: {
              stockQty: {
                increment: item.quantity
              }
            }
          });

          // Registrar movimiento de devolución
          await tx.inventoryMovement.create({
            data: {
              variantId: variant.id,
              movementType: 'entrada',
              quantity: item.quantity,
              reason: 'devolucion',
              referenceType: 'order',
              referenceId: orderId,
              note: `Devolución por cancelación - Pedido #${orderId}`,
              createdBy: req.user.id
            }
          });
        }
      }

      // 3. Actualizar estado del pedido
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          status: 'cancelled'
        }
      });

      // 4. Registrar cambio de estado
      await tx.orderStatusHistory.create({
        data: {
          orderId,
          oldStatus,
          newStatus: 'cancelled',
          note: note || `Pedido cancelado - Razón: ${reason}`,
          changedBy: req.user.id
        }
      });

      return updatedOrder;
    });

    // Obtener pedido actualizado con relaciones
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        customer: true,
        items: {
          include: {
            product: true,
            variant: {
              include: {
                size: true
              }
            }
          }
        },
        statusHistory: {
          include: {
            admin: {
              select: {
                id: true,
                fullName: true,
                email: true
              }
            }
          },
          orderBy: { changedAt: 'desc' }
        }
      }
    });

    res.json({
      message: 'Pedido cancelado y stock liberado exitosamente',
      order
    });

  } catch (error) {
    console.error('Error al cancelar pedido:', error);
    res.status(500).json({
      message: 'Error al cancelar pedido',
      error: error.message
    });
  }
});

/**
 * RUTA: POST /api/orders/:id/status
 * Cambiar estado del pedido (shipped, delivered)
 */
router.post('/:id/status', async (req, res) => {
  try {
    const orderId = parseInt(req.params.id);
    const { status, note } = req.body;

    const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: `Estado inválido. Debe ser uno de: ${validStatuses.join(', ')}`
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      // Obtener pedido actual
      const order = await tx.order.findUnique({
        where: { id: orderId }
      });

      if (!order) {
        throw new Error('Pedido no encontrado');
      }

      if (order.status === status) {
        throw new Error(`El pedido ya está en estado ${status}`);
      }

      // Validar transiciones de estado
      const validTransitions = {
        'pending': ['confirmed', 'cancelled'],
        'confirmed': ['shipped', 'cancelled'],
        'shipped': ['delivered', 'cancelled'],
        'delivered': [],
        'cancelled': []
      };

      if (!validTransitions[order.status].includes(status)) {
        throw new Error(
          `No se puede cambiar de ${order.status} a ${status}. ` +
          `Transiciones válidas: ${validTransitions[order.status].join(', ')}`
        );
      }

      const oldStatus = order.status;

      // Actualizar estado
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: { status }
      });

      // Registrar cambio de estado
      await tx.orderStatusHistory.create({
        data: {
          orderId,
          oldStatus,
          newStatus: status,
          note: note || `Estado cambiado a ${status}`,
          changedBy: req.user.id
        }
      });

      return updatedOrder;
    });

    // Obtener pedido actualizado con relaciones
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        customer: true,
        items: {
          include: {
            product: true,
            variant: {
              include: {
                size: true
              }
            }
          }
        },
        statusHistory: {
          include: {
            admin: {
              select: {
                id: true,
                fullName: true,
                email: true
              }
            }
          },
          orderBy: { changedAt: 'desc' }
        }
      }
    });

    res.json({
      message: 'Estado del pedido actualizado exitosamente',
      order
    });

  } catch (error) {
    console.error('Error al cambiar estado:', error);
    res.status(500).json({
      message: 'Error al cambiar estado',
      error: error.message
    });
  }
});

module.exports = router;
