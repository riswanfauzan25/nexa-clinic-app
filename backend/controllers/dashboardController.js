const db = require('../config/database');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * Controller Get Dashboard Summary Statistics & Dynamic Clinic Info
 * Endpoint: GET /api/dashboard/summary
 */
const getDashboardSummary = async (req, res) => {
  try {
    // 1. Total Pasien Terdaftar
    const [patientRows] = await db.query('SELECT COUNT(*) as totalPatients FROM patients');
    const totalPatients = patientRows[0].totalPatients;

    // 2. Total Pasien Hari Ini (Kunjungan Hari Ini)
    const [todayRegRows] = await db.query(
      'SELECT COUNT(*) as todayPatients FROM registrations WHERE visit_date = CURDATE()'
    );
    const todayPatients = todayRegRows[0].todayPatients;

    // 3. Total Antrean Hari Ini
    const [todayQueueRows] = await db.query(
      'SELECT COUNT(*) as todayQueues FROM queues WHERE DATE(created_at) = CURDATE()'
    );
    const todayQueues = todayQueueRows[0].todayQueues;

    // 4. Total Pasien Menunggu (Hari Ini)
    const [waitingRows] = await db.query(
      "SELECT COUNT(*) as waitingPatients FROM registrations WHERE status = 'Menunggu' AND visit_date = CURDATE()"
    );
    const waitingPatients = waitingRows[0].waitingPatients;

    // 5. Total Pasien Selesai Dilayani (Hari Ini)
    const [completedRows] = await db.query(
      "SELECT COUNT(*) as completedPatients FROM registrations WHERE status = 'Selesai' AND visit_date = CURDATE()"
    );
    const completedPatients = completedRows[0].completedPatients;

    // 6. Data Dokter Terdaftar (Dinamis dari Tabel Users)
    const [doctors] = await db.query(
      "SELECT id, name, username FROM users WHERE role = 'Dokter' ORDER BY name ASC"
    );

    // 7. Data Master Poliklinik (Dinamis dari Tabel Polyclinics)
    const [polyclinics] = await db.query(
      "SELECT id, name, description FROM polyclinics ORDER BY id ASC"
    );

    return successResponse(res, {
      totalPatients,
      todayPatients,
      todayQueues,
      waitingPatients,
      completedPatients,
      doctors,
      polyclinics
    }, 'Data ringkasan dashboard berhasil diambil.');

  } catch (error) {
    console.error('Error getDashboardSummary:', error);
    return errorResponse(res, 'Gagal mengambil data ringkasan dashboard.', error.message, 500);
  }
};

module.exports = {
  getDashboardSummary
};
