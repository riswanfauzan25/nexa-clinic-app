const db = require('../config/database');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * Helper untuk Auto Generate Nomor Rekam Medis (Format: RM-YYYYMMDD-XXX)
 */
const generateMedicalRecordNumber = async () => {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
  const prefix = `RM-${dateStr}-`;

  // Cari nomor urut terakhir hari ini
  const [rows] = await db.query(
    "SELECT medical_record_number FROM patients WHERE medical_record_number LIKE ? ORDER BY id DESC LIMIT 1",
    [`${prefix}%`]
  );

  let nextNumber = 1;
  if (rows.length > 0) {
    const lastNo = rows[0].medical_record_number;
    const parts = lastNo.split('-');
    if (parts.length === 3) {
      nextNumber = parseInt(parts[2], 10) + 1;
    }
  }

  const paddedNum = String(nextNumber).padStart(3, '0');
  return `${prefix}${paddedNum}`;
};

/**
 * Get All Patients (dengan Pencarian & Pagination)
 * Endpoint: GET /api/patients
 */
const getPatients = async (req, res) => {
  try {
    const search = req.query.search || '';
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    let queryWhere = '';
    let queryParams = [];

    if (search) {
      queryWhere = 'WHERE name LIKE ? OR nik LIKE ? OR medical_record_number LIKE ?';
      const searchPattern = `%${search}%`;
      queryParams = [searchPattern, searchPattern, searchPattern];
    }

    const countSql = `SELECT COUNT(*) as total FROM patients ${queryWhere}`;
    const [countRows] = await db.query(countSql, queryParams);
    const totalRecords = countRows[0].total;

    const dataSql = `
      SELECT * FROM patients 
      ${queryWhere} 
      ORDER BY id DESC 
      LIMIT ? OFFSET ?
    `;
    const [patients] = await db.query(dataSql, [...queryParams, limit, offset]);

    const totalPages = Math.ceil(totalRecords / limit) || 1;

    return successResponse(res, {
      patients,
      pagination: {
        totalRecords,
        totalPages,
        currentPage: page,
        limit
      }
    }, 'Daftar pasien berhasil diambil.');

  } catch (error) {
    console.error('Error getPatients:', error);
    return errorResponse(res, 'Gagal mengambil data pasien.', error.message, 500);
  }
};

/**
 * Get Single Patient Detail
 * Endpoint: GET /api/patients/:id
 */
const getPatientById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query('SELECT * FROM patients WHERE id = ?', [id]);

    if (rows.length === 0) {
      return errorResponse(res, 'Data pasien tidak ditemukan.', null, 404);
    }

    return successResponse(res, rows[0], 'Detail pasien berhasil diambil.');
  } catch (error) {
    return errorResponse(res, 'Gagal mengambil detail pasien.', error.message, 500);
  }
};

/**
 * Create New Patient
 * Endpoint: POST /api/patients
 */
const createPatient = async (req, res) => {
  try {
    const { nik, name, gender, birth_date, phone, phone_number, address } = req.body;
    const finalPhone = phone_number || phone || null;

    if (!nik || !name || !gender || !birth_date) {
      return errorResponse(res, 'NIK, Nama, Jenis Kelamin, dan Tanggal Lahir wajib diisi.', null, 400);
    }

    const [existingNik] = await db.query('SELECT id FROM patients WHERE nik = ?', [nik]);
    if (existingNik.length > 0) {
      return errorResponse(res, 'NIK sudah terdaftar. NIK tidak boleh duplikat.', null, 400);
    }

    const medicalRecordNumber = await generateMedicalRecordNumber();

    const sql = `
      INSERT INTO patients (medical_record_number, nik, name, gender, birth_date, phone_number, address)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await db.query(sql, [
      medicalRecordNumber,
      nik,
      name,
      gender,
      birth_date,
      finalPhone,
      address || null
    ]);

    const [newPatient] = await db.query('SELECT * FROM patients WHERE id = ?', [result.insertId]);

    return successResponse(res, newPatient[0], 'Data pasien berhasil ditambahkan.', 201);

  } catch (error) {
    console.error('Error createPatient:', error);
    return errorResponse(res, 'Gagal menambahkan pasien.', error.message, 500);
  }
};

/**
 * Update Patient
 * Endpoint: PUT /api/patients/:id
 */
const updatePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const { nik, name, gender, birth_date, phone, phone_number, address } = req.body;
    const finalPhone = phone_number !== undefined ? phone_number : (phone !== undefined ? phone : undefined);

    const [existing] = await db.query('SELECT * FROM patients WHERE id = ?', [id]);
    if (existing.length === 0) {
      return errorResponse(res, 'Data pasien tidak ditemukan.', null, 404);
    }

    if (nik && nik !== existing[0].nik) {
      const [existingNik] = await db.query('SELECT id FROM patients WHERE nik = ? AND id != ?', [nik, id]);
      if (existingNik.length > 0) {
        return errorResponse(res, 'NIK sudah terdaftar oleh pasien lain.', null, 400);
      }
    }

    const sql = `
      UPDATE patients 
      SET nik = ?, name = ?, gender = ?, birth_date = ?, phone_number = ?, address = ?
      WHERE id = ?
    `;

    await db.query(sql, [
      nik || existing[0].nik,
      name || existing[0].name,
      gender || existing[0].gender,
      birth_date || existing[0].birth_date,
      finalPhone !== undefined ? finalPhone : existing[0].phone_number,
      address !== undefined ? address : existing[0].address,
      id
    ]);

    const [updatedPatient] = await db.query('SELECT * FROM patients WHERE id = ?', [id]);

    return successResponse(res, updatedPatient[0], 'Data pasien berhasil diperbarui.');

  } catch (error) {
    console.error('Error updatePatient:', error);
    return errorResponse(res, 'Gagal memperbarui data pasien.', error.message, 500);
  }
};

/**
 * Delete Patient
 * Endpoint: DELETE /api/patients/:id
 */
const deletePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const [existing] = await db.query('SELECT id FROM patients WHERE id = ?', [id]);

    if (existing.length === 0) {
      return errorResponse(res, 'Data pasien tidak ditemukan.', null, 404);
    }

    await db.query('DELETE FROM patients WHERE id = ?', [id]);

    return successResponse(res, null, 'Data pasien berhasil dihapus.');
  } catch (error) {
    return errorResponse(res, 'Gagal menghapus data pasien.', error.message, 500);
  }
};

module.exports = {
  getPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient
};
