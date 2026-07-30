const jwt = require('jsonwebtoken');
const { errorResponse } = require('../utils/response');

/**
 * Middleware untuk verifikasi JWT Token
 */
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  
  // Format header: "Bearer <TOKEN>"
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return errorResponse(res, 'Akses ditolak. Token autentikasi tidak ditemukan.', null, 401);
  }

  try {
    const secretKey = process.env.JWT_SECRET;
    const decoded = jwt.verify(token, secretKey);
    
    // Menyimpan data payload user ke request objek
    req.user = decoded;
    next();
  } catch (error) {
    return errorResponse(res, 'Token tidak valid atau telah kadaluwarsa.', null, 403);
  }
};

/**
 * Middleware untuk membatasi akses berdasarkan Role User (RBAC)
 * @param  {...String} allowedRoles - Daftar role yang diizinkan (contoh: 'Administrator', 'Dokter')
 */
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return errorResponse(
        res, 
        `Akses ditolak. Peran '${req.user ? req.user.role : 'Guest'}' tidak memiliki izin untuk mengakses resource ini.`, 
        null, 
        403
      );
    }
    next();
  };
};

module.exports = {
  verifyToken,
  authorizeRoles
};
