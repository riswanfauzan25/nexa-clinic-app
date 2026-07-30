const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * Controller Login User
 * Endpoint: POST /login
 */
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validasi input
    if (!username || !password) {
      return errorResponse(res, 'Username dan password wajib diisi.', null, 400);
    }

    // Cari user di database berdasarkan username
    const [rows] = await db.query('SELECT * FROM users WHERE username = ?', [username]);

    if (rows.length === 0) {
      return errorResponse(res, 'Username atau password salah.', null, 401);
    }

    const user = rows[0];

    // Cek kecocokan password dengan hash di database
    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return errorResponse(res, 'Username atau password salah.', null, 401);
    }

    // Buat JWT Payload & Token
    const payload = {
      id: user.id,
      name: user.name,
      username: user.username,
      role: user.role
    };

    const secretKey = process.env.JWT_SECRET || 'fallback_secret_key';
    const expiresIn = process.env.JWT_EXPIRES_IN || '1d';

    const token = jwt.sign(payload, secretKey, { expiresIn });

    // Kembalikan response sukses beserta token & data user (tanpa password)
    return successResponse(res, {
      token,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        role: user.role
      }
    }, 'Login berhasil!');

  } catch (error) {
    console.error('Error saat login:', error);
    return errorResponse(res, 'Terjadi kesalahan pada server saat login.', error.message, 500);
  }
};

/**
 * Controller Logout User
 * Endpoint: POST /logout
 */
const logout = async (req, res) => {
  return successResponse(res, null, 'Logout berhasil. Sesi telah diakhiri.');
};

/**
 * Controller Get Current Logged In User
 * Endpoint: GET /me
 */
const getMe = async (req, res) => {
  try {
    // req.user didapat dari middleware verifyToken
    const [rows] = await db.query(
      'SELECT id, name, username, role, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (rows.length === 0) {
      return errorResponse(res, 'User tidak ditemukan.', null, 404);
    }

    return successResponse(res, rows[0], 'Data profile pengguna berhasil diambil.');
  } catch (error) {
    return errorResponse(res, 'Terjadi kesalahan pada server.', error.message, 500);
  }
};

module.exports = {
  login,
  logout,
  getMe
};
