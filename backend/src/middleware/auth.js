const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'llave_secreta_temporal';

/**
 * Middleware de autenticación JWT
 * Verifica que el token sea válido y que el usuario exista
 */
async function authenticateToken(req, res, next) {
  try {
    // 1. Obtener token del header Authorization
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        message: 'Acceso denegado. Token no proporcionado.' 
      });
    }

    // 2. Verificar token
    const decoded = jwt.verify(token, JWT_SECRET);

    // 3. Verificar que el usuario existe y está activo
    const user = await prisma.adminUser.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        isActive: true
      }
    });

    if (!user) {
      return res.status(401).json({ 
        message: 'Usuario no encontrado.' 
      });
    }

    if (!user.isActive) {
      return res.status(403).json({ 
        message: 'Usuario inactivo. Contacta al administrador.' 
      });
    }

    // 4. Agregar usuario al request para uso posterior
    req.user = user;
    next();

  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: 'Token expirado. Por favor inicia sesión nuevamente.' 
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        message: 'Token inválido.' 
      });
    }

    console.error('Error en autenticación:', error);
    return res.status(500).json({ 
      message: 'Error interno del servidor.' 
    });
  }
}

/**
 * Middleware para verificar roles específicos
 * Uso: requireRole('admin', 'superadmin')
 */
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        message: 'No autenticado.' 
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'No tienes permisos para acceder a este recurso.' 
      });
    }

    next();
  };
}

/**
 * Middleware opcional de autenticación
 * No falla si no hay token, solo agrega el usuario si existe
 */
async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      req.user = null;
      return next();
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await prisma.adminUser.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        isActive: true
      }
    });

    req.user = user && user.isActive ? user : null;
    next();

  } catch (error) {
    req.user = null;
    next();
  }
}

module.exports = {
  authenticateToken,
  requireRole,
  optionalAuth
};
