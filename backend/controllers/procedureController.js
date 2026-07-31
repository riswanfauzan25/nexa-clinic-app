const db = require('../config/database');
const { successResponse, errorResponse } = require('../utils/response');

const getProcedures = async (req, res) => {
  try {
    const { search = '' } = req.query;
    let query = 'SELECT * FROM procedures';
    let params = [];

    if (search) {
      query += ' WHERE code LIKE ? OR name LIKE ?';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY id DESC';
    const [rows] = await db.query(query, params);
    return successResponse(res, rows, 'Data tindakan medis berhasil diambil.');
  } catch (error) {
    return errorResponse(res, 'Gagal mengambil data tindakan medis.', error.message, 500);
  }
};

const createProcedure = async (req, res) => {
  try {
    const { code, name } = req.body;
    if (!code || !name) {
      return errorResponse(res, 'Kode dan Nama Tindakan Medis wajib diisi.', null, 400);
    }

    const [existing] = await db.query('SELECT id FROM procedures WHERE code = ?', [code]);
    if (existing.length > 0) {
      return errorResponse(res, 'Kode Tindakan Medis sudah terdaftar.', null, 400);
    }

    const [result] = await db.query(
      'INSERT INTO procedures (code, name) VALUES (?, ?)',
      [code, name]
    );

    return successResponse(res, { id: result.insertId, code, name }, 'Tindakan medis baru berhasil ditambahkan.', 201);
  } catch (error) {
    return errorResponse(res, 'Gagal menambahkan tindakan medis.', error.message, 500);
  }
};

const updateProcedure = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, name } = req.body;

    if (!code || !name) {
      return errorResponse(res, 'Kode dan Nama Tindakan Medis wajib diisi.', null, 400);
    }

    const [existing] = await db.query('SELECT id FROM procedures WHERE code = ? AND id != ?', [code, id]);
    if (existing.length > 0) {
      return errorResponse(res, 'Kode Tindakan Medis sudah digunakan.', null, 400);
    }

    await db.query(
      'UPDATE procedures SET code = ?, name = ? WHERE id = ?',
      [code, name, id]
    );

    return successResponse(res, { id: Number(id), code, name }, 'Data tindakan medis berhasil diperbarui.');
  } catch (error) {
    return errorResponse(res, 'Gagal memperbarui tindakan medis.', error.message, 500);
  }
};

const deleteProcedure = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM procedures WHERE id = ?', [id]);
    return successResponse(res, null, 'Tindakan medis berhasil dihapus.');
  } catch (error) {
    return errorResponse(res, 'Gagal menghapus tindakan medis.', error.message, 500);
  }
};

module.exports = {
  getProcedures,
  createProcedure,
  updateProcedure,
  deleteProcedure
};
