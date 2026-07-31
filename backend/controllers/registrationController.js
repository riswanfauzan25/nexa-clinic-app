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
    const polyclinic_id = req.query.polyclinic_id || '';

    let whereClauses = [];
    let queryParams = [];

    if (search) {
      whereClauses.push('(p.name LIKE ? OR p.medical_record_number LIKE ? OR CONCAT("REG-", r.id) LIKE ?)');
      const pattern = `%${search}%`;
      queryParams.push(pattern, pattern, pattern);
    }

    if (status) {
      whereClauses.push('r.status = ?');
      queryParams.push(status);
    }

    if (date) {
      whereClauses.push('r.visit_date = ?');
      queryParams.push(date);
    }

    if (polyclinic_id) {
      whereClauses.push('r.polyclinic_id = ?');
      queryParams.push(polyclinic_id);
    }

    // Proteksi Otomatis: Jika user adalah Dokter, HANYA tampilkan pendaftaran milik dokter tersebut
    if (req.user && req.user.role === 'Dokter') {
      whereClauses.push('r.doctor_id = ?');
      queryParams.push(req.user.id);
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const query = `
      SELECT 
        r.id,
        CONCAT('REG-', DATE_FORMAT(r.visit_date, '%Y%m%d'), '-', LPAD(r.id, 3, '0')) AS registration_number,
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
        r.visit_date AS registration_date,
        r.payment_method,
        r.chief_complaint AS complaint,
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
        CONCAT('REG-', DATE_FORMAT(r.visit_date, '%Y%m%d'), '-', LPAD(r.id, 3, '0')) AS registration_number,
        r.patient_id,
        p.name AS patient_name,
        p.medical_record_number,
        p.nik,
        p.phone_number,
        r.polyclinic_id,
        poly.name AS polyclinic_name,
        r.doctor_id,
        doc.name AS doctor_name,
        r.visit_date AS registration_date,
        r.payment_method,
        r.chief_complaint AS complaint,
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

    const { patient_id, polyclinic_id, doctor_id, complaint, payment_method } = req.body;

    if (!patient_id || !polyclinic_id || !doctor_id) {
      await connection.rollback();
      return errorResponse(res, 'Pasien, Poliklinik, dan Dokter wajib dipilih.', null, 400);
    }

    const todayDate = new Date().toISOString().slice(0, 10);
    const payMethod = payment_method || 'Umum';
    const chiefComplaint = complaint || '';

    // Pengecekan Cegah Pendaftaran Ganda Pasien di Poli & Hari yang Sama (Status Masih Aktif)
    const [existingActive] = await connection.query(
      `SELECT r.id, r.status, poly.name AS polyclinic_name 
       FROM registrations r
       JOIN polyclinics poly ON r.polyclinic_id = poly.id
       WHERE r.patient_id = ? AND r.polyclinic_id = ? 
         AND DATE(r.visit_date) = CURDATE()
         AND r.status IN ('Menunggu', 'Check In', 'Pemeriksaan', 'Sedang Diperiksa', 'Waiting', 'In Examination')`,
      [patient_id, polyclinic_id]
    );

    if (existingActive.length > 0) {
      await connection.rollback();
      return errorResponse(
        res,
        `Pasien ini sudah terdaftar di ${existingActive[0].polyclinic_name} hari ini dengan status [${existingActive[0].status}]. Pendaftaran ganda tidak diperbolehkan.`,
        null,
        400
      );
    }

    // 1. Insert into registrations table
    const [regResult] = await connection.query(
      `INSERT INTO registrations (patient_id, doctor_id, polyclinic_id, visit_date, payment_method, chief_complaint, status)
       VALUES (?, ?, ?, ?, ?, ?, 'Menunggu')`,
      [patient_id, doctor_id, polyclinic_id, todayDate, payMethod, chiefComplaint]
    );

    const registrationId = regResult.insertId;

    // 2. Generate Queue Number per Polyclinic (Format: A001, B001, dll)
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

    // 3. Insert into queues table
    await connection.query(
      `INSERT INTO queues (registration_id, queue_number, status) VALUES (?, ?, 'Menunggu')`,
      [registrationId, queueNumber]
    );

    await connection.commit();

    // Fetch detail data pendaftaran yang baru dibuat
    const [createdData] = await db.query(
      `SELECT 
        r.id,
        CONCAT('REG-', DATE_FORMAT(r.visit_date, '%Y%m%d'), '-', LPAD(r.id, 3, '0')) AS registration_number,
        r.patient_id, p.name AS patient_name, p.medical_record_number,
        r.polyclinic_id, poly.name AS polyclinic_name, r.doctor_id, doc.name AS doctor_name,
        r.visit_date AS registration_date, r.chief_complaint AS complaint, r.status,
        q.id AS queue_id, q.queue_number, q.status AS queue_status
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
 * Update Registration Status (Menunggu / Sedang Diperiksa / Selesai / Dibatalkan)
 * Endpoint: PUT /api/registrations/:id/status
 */
const updateRegistrationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['Menunggu', 'Check In', 'Pemeriksaan', 'Sedang Diperiksa', 'Selesai', 'Dibatalkan', 'Waiting', 'In Examination', 'Completed', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return errorResponse(res, 'Status pendaftaran tidak valid.', null, 400);
    }

    // Normalisasi status ke Bahasa Indonesia
    let dbStatus = status;
    if (status === 'Waiting') dbStatus = 'Menunggu';
    if (status === 'In Examination') dbStatus = 'Pemeriksaan';
    if (status === 'Completed') dbStatus = 'Selesai';
    if (status === 'Cancelled') dbStatus = 'Dibatalkan';

    const [existing] = await db.query('SELECT id FROM registrations WHERE id = ?', [id]);
    if (existing.length === 0) {
      return errorResponse(res, 'Data pendaftaran tidak ditemukan.', null, 404);
    }

    await db.query('UPDATE registrations SET status = ? WHERE id = ?', [dbStatus, id]);

    // Update antrean
    if (dbStatus === 'Dibatalkan') {
      await db.query("UPDATE queues SET status = 'Lewat' WHERE registration_id = ?", [id]);
    } else if (dbStatus === 'Selesai') {
      await db.query("UPDATE queues SET status = 'Selesai' WHERE registration_id = ?", [id]);
    } else if (dbStatus === 'Pemeriksaan' || dbStatus === 'Sedang Diperiksa') {
      await db.query("UPDATE queues SET status = 'Selesai' WHERE registration_id = ?", [id]);
    } else if (dbStatus === 'Check In') {
      await db.query("UPDATE queues SET status = 'Dipanggil' WHERE registration_id = ?", [id]);
    }

    return successResponse(res, null, `Status pendaftaran berhasil diubah menjadi ${dbStatus}.`);

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
