const db = require('../config/database');
const { successResponse, errorResponse } = require('../utils/response');

const getPolyclinics = async (req, res) => {
  try {
    const { search = '' } = req.query;
    let query = 'SELECT * FROM polyclinics';
    let params = [];

    if (search) {
      query += ' WHERE name LIKE ? OR description LIKE ?';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY id DESC';
    const [rows] = await db.query(query, params);
    return successResponse(res, rows, 'Data poliklinik berhasil diambil.');
  } catch (error) {
    return errorResponse(res, 'Gagal mengambil data poliklinik.', error.message, 500);
  }
};

const createPolyclinic = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      return errorResponse(res, 'Nama Poliklinik wajib diisi.', null, 400);
    }

    const [existing] = await db.query('SELECT id FROM polyclinics WHERE name = ?', [name]);
    if (existing.length > 0) {
      return errorResponse(res, 'Nama Poliklinik sudah terdaftar.', null, 400);
    }

    const [result] = await db.query(
      'INSERT INTO polyclinics (name, description) VALUES (?, ?)',
      [name, description || '']
    );

    return successResponse(res, { id: result.insertId, name, description }, 'Poliklinik baru berhasil ditambahkan.', 201);
  } catch (error) {
    return errorResponse(res, 'Gagal menambahkan poliklinik.', error.message, 500);
  }
};

const updatePolyclinic = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    if (!name) {
      return errorResponse(res, 'Nama Poliklinik wajib diisi.', null, 400);
    }

    const [existing] = await db.query('SELECT id FROM polyclinics WHERE name = ? AND id != ?', [name, id]);
    if (existing.length > 0) {
      return errorResponse(res, 'Nama Poliklinik sudah digunakan oleh poli lain.', null, 400);
    }

    await db.query(
      'UPDATE polyclinics SET name = ?, description = ? WHERE id = ?',
      [name, description || '', id]
    );

    return successResponse(res, { id: Number(id), name, description }, 'Data poliklinik berhasil diperbarui.');
  } catch (error) {
    return errorResponse(res, 'Gagal memperbarui poliklinik.', error.message, 500);
  }
};

const deletePolyclinic = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM polyclinics WHERE id = ?', [id]);
    return successResponse(res, null, 'Poliklinik berhasil dihapus.');
  } catch (error) {
    return errorResponse(res, 'Gagal menghapus poliklinik.', error.message, 500);
  }
};

module.exports = {
  getPolyclinics,
  createPolyclinic,
  updatePolyclinic,
  deletePolyclinic
};
