const db = require('../config/database');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * Get All Queues Today (ter-filter per Poliklinik & Status)
 * Endpoint: GET /api/queues
 */
const getTodayQueues = async (req, res) => {
  try {
    const { polyclinic_id = '', status = '', date = '' } = req.query;

    let whereClauses = [];
    let queryParams = [];

    if (date) {
      whereClauses.push('DATE(r.visit_date) = ?');
      queryParams.push(date);
    } else {
      whereClauses.push('(DATE(r.visit_date) = CURDATE() OR DATE(q.created_at) = CURDATE())');
    }

    if (polyclinic_id) {
      whereClauses.push('r.polyclinic_id = ?');
      queryParams.push(polyclinic_id);
    }

    if (status) {
      whereClauses.push('q.status = ?');
      queryParams.push(status);
    }

    // Proteksi Otomatis: Jika user adalah Dokter, HANYA tampilkan antrean milik dokter tersebut
    if (req.user && req.user.role === 'Dokter') {
      whereClauses.push('r.doctor_id = ?');
      queryParams.push(req.user.id);
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const query = `
      SELECT 
        q.id AS queue_id,
        q.registration_id,
        q.queue_number,
        q.status AS queue_status,
        q.created_at AS queue_time,
        CONCAT('REG-', DATE_FORMAT(r.visit_date, '%Y%m%d'), '-', LPAD(r.id, 3, '0')) AS registration_number,
        r.visit_date,
        r.payment_method,
        r.chief_complaint AS complaint,
        r.status AS registration_status,
        p.id AS patient_id,
        p.name AS patient_name,
        p.medical_record_number,
        p.nik,
        poly.id AS polyclinic_id,
        poly.name AS polyclinic_name,
        doc.id AS doctor_id,
        doc.name AS doctor_name
      FROM queues q
      JOIN registrations r ON q.registration_id = r.id
      JOIN patients p ON r.patient_id = p.id
      JOIN polyclinics poly ON r.polyclinic_id = poly.id
      JOIN users doc ON r.doctor_id = doc.id
      ${whereSql}
      ORDER BY q.id ASC
    `;

    const [rows] = await db.query(query, queryParams);
    return successResponse(res, rows, 'Daftar antrean hari ini berhasil diambil.');
  } catch (error) {
    console.error('Error getTodayQueues:', error);
    return errorResponse(res, 'Gagal mengambil data antrean.', error.message, 500);
  }
};

/**
 * Call Queue (Ubah status antrean -> Dipanggil & Registrasi -> Check In)
 * Endpoint: PUT /api/queues/:id/call
 */
const callQueue = async (req, res) => {
  try {
    const { id } = req.params;

    const [queueRows] = await db.query('SELECT registration_id, queue_number FROM queues WHERE id = ?', [id]);
    if (queueRows.length === 0) {
      return errorResponse(res, 'Data antrean tidak ditemukan.', null, 404);
    }

    const regId = queueRows[0].registration_id;

    // Update status antrean -> Dipanggil
    await db.query("UPDATE queues SET status = 'Dipanggil' WHERE id = ?", [id]);
    // Update status registrasi -> Check In
    await db.query("UPDATE registrations SET status = 'Check In' WHERE id = ?", [regId]);

    return successResponse(res, null, `Antrean ${queueRows[0].queue_number} berhasil dipanggil.`);
  } catch (error) {
    console.error('Error callQueue:', error);
    return errorResponse(res, 'Gagal memanggil antrean.', error.message, 500);
  }
};

/**
 * Skip Queue (Ubah status antrean -> Lewat & Registrasi -> Dibatalkan/Lewat)
 * Endpoint: PUT /api/queues/:id/skip
 */
const skipQueue = async (req, res) => {
  try {
    const { id } = req.params;

    const [queueRows] = await db.query('SELECT registration_id, queue_number FROM queues WHERE id = ?', [id]);
    if (queueRows.length === 0) {
      return errorResponse(res, 'Data antrean tidak ditemukan.', null, 404);
    }

    const regId = queueRows[0].registration_id;

    // Update status antrean -> Lewat
    await db.query("UPDATE queues SET status = 'Lewat' WHERE id = ?", [id]);
    // Update status registrasi -> Dibatalkan
    await db.query("UPDATE registrations SET status = 'Dibatalkan' WHERE id = ?", [regId]);

    return successResponse(res, null, `Antrean ${queueRows[0].queue_number} dilewati.`);
  } catch (error) {
    console.error('Error skipQueue:', error);
    return errorResponse(res, 'Gagal melewati antrean.', error.message, 500);
  }
};

/**
 * Serve Queue (Ubah status antrean -> Selesai / Melayani & Registrasi -> Pemeriksaan)
 * Endpoint: PUT /api/queues/:id/serve
 */
const serveQueue = async (req, res) => {
  try {
    const { id } = req.params;

    const [queueRows] = await db.query('SELECT registration_id, queue_number FROM queues WHERE id = ?', [id]);
    if (queueRows.length === 0) {
      return errorResponse(res, 'Data antrean tidak ditemukan.', null, 404);
    }

    const regId = queueRows[0].registration_id;

    // Update status antrean -> Melayani
    await db.query("UPDATE queues SET status = 'Melayani' WHERE id = ?", [id]);
    // Update status registrasi -> Pemeriksaan
    await db.query("UPDATE registrations SET status = 'Pemeriksaan' WHERE id = ?", [regId]);

    return successResponse(res, null, `Antrean ${queueRows[0].queue_number} sedang diperiksa oleh dokter.`);
  } catch (error) {
    console.error('Error serveQueue:', error);
    return errorResponse(res, 'Gagal memperbarui status pelayanan antrean.', error.message, 500);
  }
};

module.exports = {
  getTodayQueues,
  callQueue,
  skipQueue,
  serveQueue
};
