const db = require('../config/database');
const { successResponse, errorResponse } = require('../utils/response');

const getMedicines = async (req, res) => {
  try {
    const { search = '' } = req.query;
    let query = 'SELECT * FROM medicines';
    let params = [];

    if (search) {
      query += ' WHERE code LIKE ? OR name LIKE ? OR unit LIKE ?';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY id DESC';
    const [rows] = await db.query(query, params);
    return successResponse(res, rows, 'Data obat-obatan berhasil diambil.');
  } catch (error) {
    return errorResponse(res, 'Gagal mengambil data obat-obatan.', error.message, 500);
  }
};

const createMedicine = async (req, res) => {
  try {
    const { code, name, unit } = req.body;
    if (!code || !name || !unit) {
      return errorResponse(res, 'Kode, Nama, dan Satuan Obat wajib diisi.', null, 400);
    }

    const [existing] = await db.query('SELECT id FROM medicines WHERE code = ?', [code]);
    if (existing.length > 0) {
      return errorResponse(res, 'Kode Obat sudah terdaftar.', null, 400);
    }

    const [result] = await db.query(
      'INSERT INTO medicines (code, name, unit) VALUES (?, ?, ?)',
      [code, name, unit]
    );

    return successResponse(res, { id: result.insertId, code, name, unit }, 'Obat baru berhasil ditambahkan.', 201);
  } catch (error) {
    return errorResponse(res, 'Gagal menambahkan obat.', error.message, 500);
  }
};

const updateMedicine = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, name, unit } = req.body;

    if (!code || !name || !unit) {
      return errorResponse(res, 'Kode, Nama, dan Satuan Obat wajib diisi.', null, 400);
    }

    const [existing] = await db.query('SELECT id FROM medicines WHERE code = ? AND id != ?', [code, id]);
    if (existing.length > 0) {
      return errorResponse(res, 'Kode Obat sudah digunakan.', null, 400);
    }

    await db.query(
      'UPDATE medicines SET code = ?, name = ?, unit = ? WHERE id = ?',
      [code, name, unit, id]
    );

    return successResponse(res, { id: Number(id), code, name, unit }, 'Data obat berhasil diperbarui.');
  } catch (error) {
    return errorResponse(res, 'Gagal memperbarui data obat.', error.message, 500);
  }
};

const deleteMedicine = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM medicines WHERE id = ?', [id]);
    return successResponse(res, null, 'Data obat berhasil dihapus.');
  } catch (error) {
    return errorResponse(res, 'Gagal menghapus data obat.', error.message, 500);
  }
};

module.exports = {
  getMedicines,
  createMedicine,
  updateMedicine,
  deleteMedicine
};
