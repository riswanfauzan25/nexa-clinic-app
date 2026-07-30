const db = require('../config/database');
const { successResponse, errorResponse } = require('../utils/response');

// ==========================================
// 1. MASTER POLYCLINICS (POLIKLINIK)
// ==========================================
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

// ==========================================
// 2. MASTER PROCEDURES (TINDAKAN MEDIS)
// ==========================================
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

// ==========================================
// 3. MASTER MEDICINES (OBAT-OBATAN)
// ==========================================
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
  getPolyclinics,
  createPolyclinic,
  updatePolyclinic,
  deletePolyclinic,
  getProcedures,
  createProcedure,
  updateProcedure,
  deleteProcedure,
  getMedicines,
  createMedicine,
  updateMedicine,
  deleteMedicine
};
