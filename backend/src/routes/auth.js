const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'llave_secreta_temporal';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh_secret_temporal';

// Almacenamiento temporal de refresh tokens (en producción usar Redis o DB)
const refreshTokens = new Set();

/**
 * Generar tokens de acceso y refresh
 */
function generateTokens(user) {
  const accessToken = jwt.sign(
    { 
      userId: user.id, 
      email: user.email,
      role: user.role 
    },
    JWT_SECRET,
    { expiresIn: '1h' } // Token de acceso válido por 1 hora
  );

  const refreshToken = jwt.sign(
    { 
      userId: user.id,
      tokenId: crypto.randomBytes(16).toString('hex')
    },
    JWT_REFRESH_SECRET,
    { expiresIn: '7d' } // Refresh token válido por 7 días
  );

  return { accessToken, refreshToken };
}

/**
 * RUTA: POST /api/auth/login
 * Login de administradores
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('[DEBUG] Login attempt for:', email);

    // Validación de entrada
    if (!email || !password) {
      return res.status(400).json({ 
        message: 'Email y contraseña son requeridos' 
      });
    }

    // 1. Buscar al usuario admin
    console.log('[DEBUG] Searching in AdminUser table...');
    const user = await prisma.adminUser.findUnique({
      where: { email }
    });

    console.log('[DEBUG] User found:', user ? 'YES' : 'NO');

    if (!user) {
      return res.status(401).json({ 
        message: 'Credenciales incorrectas' 
      });
    }

    // 2. Verificar que el usuario esté activo
    if (!user.isActive) {
      return res.status(403).json({ 
        message: 'Usuario inactivo. Contacta al administrador.' 
      });
    }

    // 3. Verificar contraseña
    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      return res.status(401).json({ 
        message: 'Credenciales incorrectas' 
      });
    }

    // 4. Generar tokens
    const { accessToken, refreshToken } = generateTokens(user);
    refreshTokens.add(refreshToken);

    console.log('[DEBUG] Tokens generated, sending response...');

    // 5. Actualizar último login
    await prisma.adminUser.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });

    // 6. Responder
    res.json({
      message: 'Login exitoso',
      accessToken,
      refreshToken,
      user: { 
        id: user.id, 
        email: user.email, 
        fullName: user.fullName,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor' 
    });
  }
});

/**
 * RUTA: POST /api/auth/refresh
 * Renovar access token usando refresh token
 */
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ 
        message: 'Refresh token requerido' 
      });
    }

    // Verificar que el refresh token esté en la lista
    if (!refreshTokens.has(refreshToken)) {
      return res.status(403).json({ 
        message: 'Refresh token inválido o revocado' 
      });
    }

    // Verificar el refresh token
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);

    // Buscar usuario
    const user = await prisma.adminUser.findUnique({
      where: { id: decoded.userId }
    });

    if (!user || !user.isActive) {
      refreshTokens.delete(refreshToken);
      return res.status(403).json({ 
        message: 'Usuario no encontrado o inactivo' 
      });
    }

    // Generar nuevo access token
    const accessToken = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      message: 'Token renovado exitosamente',
      accessToken
    });

  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: 'Refresh token expirado. Por favor inicia sesión nuevamente.' 
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        message: 'Refresh token inválido' 
      });
    }

    console.error('Error en refresh:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor' 
    });
  }
});

/**
 * RUTA: POST /api/auth/logout
 * Cerrar sesión (revocar refresh token)
 */
router.post('/logout', (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      refreshTokens.delete(refreshToken);
    }

    res.json({ 
      message: 'Sesión cerrada exitosamente' 
    });

  } catch (error) {
    console.error('Error en logout:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor' 
    });
  }
});

/**
 * RUTA: GET /api/auth/me
 * Obtener información del usuario autenticado
 */
const { authenticateToken } = require('../middleware/auth');

router.get('/me', authenticateToken, async (req, res) => {
  try {
    res.json({
      user: req.user
    });
  } catch (error) {
    console.error('Error en /me:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor' 
    });
  }
});

module.exports = router;
