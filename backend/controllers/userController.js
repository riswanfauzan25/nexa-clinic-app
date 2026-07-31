const bcrypt = require('bcryptjs');
const db = require('../config/database');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * Get All Users (Khusus Administrator)
 * Endpoint: GET /api/users
 */
const getUsers = async (req, res) => {
  try {
    const search = req.query.search || '';
    let queryWhere = '';
    let queryParams = [];

    if (search) {
      queryWhere = 'WHERE name LIKE ? OR username LIKE ? OR role LIKE ?';
      const pattern = `%${search}%`;
      queryParams = [pattern, pattern, pattern];
    }

    const [rows] = await db.query(
      `SELECT u.id, u.name, u.username, u.role, u.permissions, u.polyclinic_id, p.name AS polyclinic_name, u.created_at, u.updated_at 
       FROM users u LEFT JOIN polyclinics p ON u.polyclinic_id = p.id
       ${queryWhere} ORDER BY u.id DESC`,
      queryParams
    );

    const users = rows.map(u => {
      let parsedPermissions = null;
      if (u.permissions) {
        try {
          parsedPermissions = typeof u.permissions === 'string' ? JSON.parse(u.permissions) : u.permissions;
        } catch (e) {
          parsedPermissions = null;
        }
      }
      return { ...u, permissions: parsedPermissions };
    });

    return successResponse(res, users, 'Daftar pengguna berhasil diambil.');
  } catch (error) {
    console.error('Error getUsers:', error);
    return errorResponse(res, 'Gagal mengambil data pengguna.', error.message, 500);
  }
};

/**
 * Get User By ID
 * Endpoint: GET /api/users/:id
 */
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query(
      'SELECT id, name, username, role, permissions, created_at, updated_at FROM users WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      return errorResponse(res, 'Pengguna tidak ditemukan.', null, 404);
    }

    const u = rows[0];
    if (u.permissions) {
      try {
        u.permissions = typeof u.permissions === 'string' ? JSON.parse(u.permissions) : u.permissions;
      } catch (e) {
        u.permissions = null;
      }
    }

    return successResponse(res, u, 'Detail pengguna berhasil diambil.');
  } catch (error) {
    return errorResponse(res, 'Gagal mengambil detail pengguna.', error.message, 500);
  }
};

/**
 * Create New User (Administrator Only)
 * Endpoint: POST /api/users
 */
const createUser = async (req, res) => {
  try {
    const { name, username, password, role, permissions, polyclinic_id } = req.body;

    if (!name || !username || !password || !role) {
      return errorResponse(res, 'Nama, username, password, dan role wajib diisi.', null, 400);
    }

    const validRoles = ['Administrator', 'Dokter', 'Petugas Pendaftaran'];
    if (!validRoles.includes(role)) {
      return errorResponse(res, 'Role tidak valid. Pilih antara Administrator, Dokter, atau Petugas Pendaftaran.', null, 400);
    }

    // Validasi: role Dokter wajib memilih poliklinik
    if (role === 'Dokter' && !polyclinic_id) {
      return errorResponse(res, 'Dokter wajib memilih poliklinik tempat bertugas.', null, 400);
    }

    const [existing] = await db.query('SELECT id FROM users WHERE username = ?', [username]);
    if (existing.length > 0) {
      return errorResponse(res, 'Username sudah digunakan. Pilih username lain.', null, 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const permissionsJson = permissions ? JSON.stringify(permissions) : null;
    const doctorPolyclinicId = role === 'Dokter' ? (polyclinic_id || null) : null;

    const [result] = await db.query(
      'INSERT INTO users (name, username, password, role, permissions, polyclinic_id) VALUES (?, ?, ?, ?, ?, ?)',
      [name, username, hashedPassword, role, permissionsJson, doctorPolyclinicId]
    );

    const [newUser] = await db.query(
      `SELECT u.id, u.name, u.username, u.role, u.permissions, u.polyclinic_id, p.name AS polyclinic_name, u.created_at 
       FROM users u LEFT JOIN polyclinics p ON u.polyclinic_id = p.id WHERE u.id = ?`,
      [result.insertId]
    );

    if (newUser[0].permissions) {
      try { newUser[0].permissions = JSON.parse(newUser[0].permissions); } catch (e) {}
    }

    return successResponse(res, newUser[0], 'Akun pengguna berhasil dibuat.', 201);

  } catch (error) {
    console.error('Error createUser:', error);
    return errorResponse(res, 'Gagal membuat akun pengguna.', error.message, 500);
  }
};

/**
 * Update User (Administrator Only)
 * Endpoint: PUT /api/users/:id
 */
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, username, password, role, permissions, polyclinic_id } = req.body;

    const [existing] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
    if (existing.length === 0) {
      return errorResponse(res, 'Pengguna tidak ditemukan.', null, 404);
    }

    if (username && username !== existing[0].username) {
      const [duplicate] = await db.query('SELECT id FROM users WHERE username = ? AND id != ?', [username, id]);
      if (duplicate.length > 0) {
        return errorResponse(res, 'Username sudah digunakan oleh akun lain.', null, 400);
      }
    }

    let passwordHash = existing[0].password;
    if (password && password.trim() !== '') {
      passwordHash = await bcrypt.hash(password, 10);
    }

    const updatedRole = role || existing[0].role;
    const updatedName = name || existing[0].name;
    const updatedUsername = username || existing[0].username;
    const permissionsJson = permissions !== undefined ? JSON.stringify(permissions) : existing[0].permissions;
    // polyclinic_id hanya berlaku untuk Dokter; reset ke null jika role berubah dari Dokter
    const updatedPolyclinicId = updatedRole === 'Dokter'
      ? (polyclinic_id !== undefined ? (polyclinic_id || null) : existing[0].polyclinic_id)
      : null;

    await db.query(
      'UPDATE users SET name = ?, username = ?, password = ?, role = ?, permissions = ?, polyclinic_id = ? WHERE id = ?',
      [updatedName, updatedUsername, passwordHash, updatedRole, permissionsJson, updatedPolyclinicId, id]
    );

    const [updatedUser] = await db.query(
      `SELECT u.id, u.name, u.username, u.role, u.permissions, u.polyclinic_id, p.name AS polyclinic_name, u.created_at, u.updated_at 
       FROM users u LEFT JOIN polyclinics p ON u.polyclinic_id = p.id WHERE u.id = ?`,
      [id]
    );

    if (updatedUser[0].permissions) {
      try { updatedUser[0].permissions = JSON.parse(updatedUser[0].permissions); } catch (e) {}
    }

    return successResponse(res, updatedUser[0], 'Data pengguna berhasil diperbarui.');

  } catch (error) {
    console.error('Error updateUser:', error);
    return errorResponse(res, 'Gagal memperbarui pengguna.', error.message, 500);
  }
};

/**
 * Delete User (Administrator Only)
 * Endpoint: DELETE /api/users/:id
 */
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (parseInt(id, 10) === req.user.id) {
      return errorResponse(res, 'Anda tidak dapat menghapus akun Anda sendiri yang sedang aktif.', null, 400);
    }

    const [existing] = await db.query('SELECT id FROM users WHERE id = ?', [id]);
    if (existing.length === 0) {
      return errorResponse(res, 'Pengguna tidak ditemukan.', null, 404);
    }

    await db.query('DELETE FROM users WHERE id = ?', [id]);

    return successResponse(res, null, 'Akun pengguna berhasil dihapus.');
  } catch (error) {
    console.error('Error deleteUser:', error);
    return errorResponse(res, 'Gagal menghapus pengguna.', error.message, 500);
  }
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
};
