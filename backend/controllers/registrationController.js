const db = require('../config/database');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * Get All Registrations (dengan Filter Search, Status, Tanggal, & Pagination)
 * Endpoint: GET /api/registrations
 */
const getRegistrations = async (req, res) => {
  try {
    const search = req.query.search || '';
    const status = req.query.status || '';
    const date = req.query.date || '';

    let whereClauses = [];
    let queryParams = [];

    if (search) {
      whereClauses.push('(p.name LIKE ? OR p.medical_record_number LIKE ? OR r.registration_number LIKE ?)');
      const pattern = `%${search}%`;
      queryParams.push(pattern, pattern, pattern);
    }

    if (status) {
      whereClauses.push('r.status = ?');
      queryParams.push(status);
    }

    if (date) {
      whereClauses.push('r.registration_date = ?');
      queryParams.push(date);
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const query = `
      SELECT 
        r.id,
        r.registration_number,
        r.patient_id,
        p.name AS patient_name,
        p.medical_record_number,
        p.nik,
        p.gender,
        p.birth_date,
        p.phone_number,
        r.polyclinic_id,
        poly.name AS polyclinic_name,
        r.doctor_id,
        doc.name AS doctor_name,
        r.registration_date,
        r.complaint,
        r.status,
        q.id AS queue_id,
        q.queue_number,
        q.status AS queue_status,
        r.created_at
      FROM registrations r
      JOIN patients p ON r.patient_id = p.id
      JOIN polyclinics poly ON r.polyclinic_id = poly.id
      JOIN users doc ON r.doctor_id = doc.id
      LEFT JOIN queues q ON q.registration_id = r.id
      ${whereSql}
      ORDER BY r.id DESC
    `;

    const [rows] = await db.query(query, queryParams);
    return successResponse(res, rows, 'Daftar pendaftaran kunjungan berhasil diambil.');
  } catch (error) {
    console.error('Error getRegistrations:', error);
    return errorResponse(res, 'Gagal mengambil data pendaftaran kunjungan.', error.message, 500);
  }
};

/**
 * Get Registration By ID
 * Endpoint: GET /api/registrations/:id
 */
const getRegistrationById = async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      SELECT 
        r.id,
        r.registration_number,
        r.patient_id,
        p.name AS patient_name,
        p.medical_record_number,
        p.nik,
        p.phone_number,
        r.polyclinic_id,
        poly.name AS polyclinic_name,
        r.doctor_id,
        doc.name AS doctor_name,
        r.registration_date,
        r.complaint,
        r.status,
        q.id AS queue_id,
        q.queue_number,
        q.status AS queue_status,
        r.created_at
      FROM registrations r
      JOIN patients p ON r.patient_id = p.id
      JOIN polyclinics poly ON r.polyclinic_id = poly.id
      JOIN users doc ON r.doctor_id = doc.id
      LEFT JOIN queues q ON q.registration_id = r.id
      WHERE r.id = ?
    `;

    const [rows] = await db.query(query, [id]);
    if (rows.length === 0) {
      return errorResponse(res, 'Data pendaftaran tidak ditemukan.', null, 404);
    }

    return successResponse(res, rows[0], 'Detail pendaftaran berhasil diambil.');
  } catch (error) {
    console.error('Error getRegistrationById:', error);
    return errorResponse(res, 'Gagal mengambil detail pendaftaran.', error.message, 500);
  }
};

/**
 * Create New Registration & Generate Queue Number
 * Endpoint: POST /api/registrations
 */
const createRegistration = async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const { patient_id, polyclinic_id, doctor_id, complaint } = req.body;

    if (!patient_id || !polyclinic_id || !doctor_id) {
      await connection.rollback();
      return errorResponse(res, 'Pasien, Poliklinik, dan Dokter wajib dipilih.', null, 400);
    }

    // 1. Generate Registration Number (Format: REG-YYYYMMDD-001)
    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const [lastReg] = await connection.query(
      "SELECT registration_number FROM registrations WHERE registration_number LIKE ? ORDER BY id DESC LIMIT 1",
      [`REG-${todayStr}-%`]
    );

    let nextNumber = 1;
    if (lastReg.length > 0) {
      const parts = lastReg[0].registration_number.split('-');
      if (parts.length === 3) {
        nextNumber = parseInt(parts[2], 10) + 1;
      }
    }
    const registrationNumber = `REG-${todayStr}-${String(nextNumber).padStart(3, '0')}`;
    const todayDate = new Date().toISOString().slice(0, 10);

    // 2. Insert into registrations table
    const [regResult] = await connection.query(
      `INSERT INTO registrations (registration_number, patient_id, polyclinic_id, doctor_id, registration_date, complaint, status)
       VALUES (?, ?, ?, ?, ?, ?, 'Waiting')`,
      [registrationNumber, patient_id, polyclinic_id, doctor_id, todayDate, complaint || '']
    );

    const registrationId = regResult.insertId;

    // 3. Generate Queue Number per Polyclinic (Format: A001, B001, dll)
    const polyPrefixes = { 1: 'A', 2: 'B', 3: 'C', 4: 'D', 5: 'E' };
    const prefix = polyPrefixes[polyclinic_id] || 'A';

    const [todayQueues] = await connection.query(
      `SELECT q.queue_number FROM queues q
       JOIN registrations r ON q.registration_id = r.id
       WHERE r.polyclinic_id = ? AND DATE(q.created_at) = CURDATE()
       ORDER BY q.id DESC LIMIT 1`,
      [polyclinic_id]
    );

    let queueSeq = 1;
    if (todayQueues.length > 0) {
      const numPart = todayQueues[0].queue_number.substring(1);
      queueSeq = parseInt(numPart, 10) + 1;
    }
    const queueNumber = `${prefix}${String(queueSeq).padStart(3, '0')}`;

    // 4. Insert into queues table
    const [queueResult] = await connection.query(
      `INSERT INTO queues (registration_id, queue_number, status) VALUES (?, ?, 'Waiting')`,
      [registrationId, queueNumber]
    );

    await connection.commit();

    // Fetch detail data pendaftaran yang baru dibuat
    const [createdData] = await db.query(
      `SELECT 
        r.id, r.registration_number, r.patient_id, p.name AS patient_name, p.medical_record_number,
        r.polyclinic_id, poly.name AS polyclinic_name, r.doctor_id, doc.name AS doctor_name,
        r.registration_date, r.complaint, r.status, q.id AS queue_id, q.queue_number, q.status AS queue_status
       FROM registrations r
       JOIN patients p ON r.patient_id = p.id
       JOIN polyclinics poly ON r.polyclinic_id = poly.id
       JOIN users doc ON r.doctor_id = doc.id
       LEFT JOIN queues q ON q.registration_id = r.id
       WHERE r.id = ?`,
      [registrationId]
    );

    return successResponse(res, createdData[0], 'Pendaftaran kunjungan pasien & nomor antrean berhasil dibuat.', 201);

  } catch (error) {
    await connection.rollback();
    console.error('Error createRegistration:', error);
    return errorResponse(res, 'Gagal memproses pendaftaran kunjungan.', error.message, 500);
  } finally {
    connection.release();
  }
};

/**
 * Update Registration Status (Waiting / In Examination / Completed / Cancelled)
 * Endpoint: PUT /api/registrations/:id/status
 */
const updateRegistrationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['Waiting', 'In Examination', 'Completed', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return errorResponse(res, 'Status pendaftaran tidak valid.', null, 400);
    }

    const [existing] = await db.query('SELECT id FROM registrations WHERE id = ?', [id]);
    if (existing.length === 0) {
      return errorResponse(res, 'Data pendaftaran tidak ditemukan.', null, 404);
    }

    await db.query('UPDATE registrations SET status = ? WHERE id = ?', [status, id]);

    // Jika dibatalkan atau selesai, update antrean juga
    if (status === 'Cancelled') {
      await db.query("UPDATE queues SET status = 'Skipped' WHERE registration_id = ?", [id]);
    } else if (status === 'Completed') {
      await db.query("UPDATE queues SET status = 'Completed', completed_at = NOW() WHERE registration_id = ?", [id]);
    }

    return successResponse(res, null, `Status pendaftaran berhasil diubah menjadi ${status}.`);

  } catch (error) {
    console.error('Error updateRegistrationStatus:', error);
    return errorResponse(res, 'Gagal mengupdate status pendaftaran.', error.message, 500);
  }
};

/**
 * Delete Registration
 * Endpoint: DELETE /api/registrations/:id
 */
const deleteRegistration = async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await db.query('SELECT id FROM registrations WHERE id = ?', [id]);
    if (existing.length === 0) {
      return errorResponse(res, 'Data pendaftaran tidak ditemukan.', null, 404);
    }

    await db.query('DELETE FROM registrations WHERE id = ?', [id]);
    return successResponse(res, null, 'Data pendaftaran kunjungan berhasil dihapus.');

  } catch (error) {
    console.error('Error deleteRegistration:', error);
    return errorResponse(res, 'Gagal menghapus data pendaftaran.', error.message, 500);
  }
};

module.exports = {
  getRegistrations,
  getRegistrationById,
  createRegistration,
  updateRegistrationStatus,
  deleteRegistration
};
