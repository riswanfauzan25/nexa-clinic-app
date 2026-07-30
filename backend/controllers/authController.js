const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * Controller Login User
 * Endpoint: POST /api/login
 */
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return errorResponse(res, 'Username dan password wajib diisi.', null, 400);
    }

    const [rows] = await db.query('SELECT * FROM users WHERE username = ?', [username]);

    if (rows.length === 0) {
      return errorResponse(res, 'Username atau password salah.', null, 401);
    }

    const user = rows[0];

    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return errorResponse(res, 'Username atau password salah.', null, 401);
    }

    // Parse permissions jika ada
    let permissions = null;
    if (user.permissions) {
      try {
        permissions = typeof user.permissions === 'string' ? JSON.parse(user.permissions) : user.permissions;
      } catch (e) {
        permissions = null;
      }
    }

    const payload = {
      id: user.id,
      name: user.name,
      username: user.username,
      role: user.role,
      permissions
    };

    const secretKey = process.env.JWT_SECRET;
    const expiresIn = process.env.JWT_EXPIRES_IN || '1d';

    const token = jwt.sign(payload, secretKey, { expiresIn });

    return successResponse(res, {
      token,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        role: user.role,
        permissions
      }
    }, 'Login berhasil.');

  } catch (error) {
    console.error('Error login:', error);
    return errorResponse(res, 'Terjadi kesalahan pada server saat login.', error.message, 500);
  }
};

/**
 * Controller Logout User
 * Endpoint: POST /api/logout
 */
const logout = async (req, res) => {
  try {
    return successResponse(res, null, 'Logout berhasil.');
  } catch (error) {
    return errorResponse(res, 'Gagal logout.', error.message, 500);
  }
};

/**
 * Controller Get Current User Profile (Me)
 * Endpoint: GET /api/me
 */
const getMe = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, name, username, role, permissions, created_at FROM users WHERE id = ?', [req.user.id]);

    if (rows.length === 0) {
      return errorResponse(res, 'Pengguna tidak ditemukan.', null, 404);
    }

    const user = rows[0];
    if (user.permissions) {
      try {
        user.permissions = typeof user.permissions === 'string' ? JSON.parse(user.permissions) : user.permissions;
      } catch (e) {
        user.permissions = null;
      }
    }

    return successResponse(res, user, 'Data profil pengguna berhasil diambil.');
  } catch (error) {
    return errorResponse(res, 'Gagal mengambil data pengguna.', error.message, 500);
  }
};

module.exports = {
  login,
  logout,
  getMe
};
