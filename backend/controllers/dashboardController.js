const db = require('../config/database');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * Controller Get Dashboard Summary Statistics & Dynamic Clinic Info
 * Endpoint: GET /api/dashboard/summary
 */
const getDashboardSummary = async (req, res) => {
  try {
    const isDoctor = req.user && req.user.role === 'Dokter';
    const doctorId = req.user ? req.user.id : null;

    // 1. Total Pasien Terdaftar
    const [patientRows] = await db.query('SELECT COUNT(*) as totalPatients FROM patients');
    const totalPatients = patientRows[0].totalPatients;

    // 2. Total Pasien Hari Ini (Kunjungan Hari Ini)
    const todayQuery = isDoctor 
      ? 'SELECT COUNT(*) as todayPatients FROM registrations WHERE visit_date = CURDATE() AND doctor_id = ?'
      : 'SELECT COUNT(*) as todayPatients FROM registrations WHERE visit_date = CURDATE()';
    const [todayRegRows] = await db.query(todayQuery, isDoctor ? [doctorId] : []);
    const todayPatients = todayRegRows[0].todayPatients;

    // 3. Total Antrean Hari Ini
    const queueQuery = isDoctor
      ? 'SELECT COUNT(*) as todayQueues FROM queues q JOIN registrations r ON q.registration_id = r.id WHERE DATE(q.created_at) = CURDATE() AND r.doctor_id = ?'
      : 'SELECT COUNT(*) as todayQueues FROM queues WHERE DATE(created_at) = CURDATE()';
    const [todayQueueRows] = await db.query(queueQuery, isDoctor ? [doctorId] : []);
    const todayQueues = todayQueueRows[0].todayQueues;

    // 4. Total Pasien Menunggu (Hari Ini)
    const waitingQuery = isDoctor
      ? "SELECT COUNT(*) as waitingPatients FROM registrations WHERE status = 'Menunggu' AND visit_date = CURDATE() AND doctor_id = ?"
      : "SELECT COUNT(*) as waitingPatients FROM registrations WHERE status = 'Menunggu' AND visit_date = CURDATE()";
    const [waitingRows] = await db.query(waitingQuery, isDoctor ? [doctorId] : []);
    const waitingPatients = waitingRows[0].waitingPatients;

    // 5. Total Pasien Selesai Dilayani (Hari Ini)
    const completedQuery = isDoctor
      ? "SELECT COUNT(*) as completedPatients FROM registrations WHERE status = 'Selesai' AND visit_date = CURDATE() AND doctor_id = ?"
      : "SELECT COUNT(*) as completedPatients FROM registrations WHERE status = 'Selesai' AND visit_date = CURDATE()";
    const [completedRows] = await db.query(completedQuery, isDoctor ? [doctorId] : []);
    const completedPatients = completedRows[0].completedPatients;

    // 6. Data Dokter Terdaftar (Dinamis dari Tabel Users)
    const [doctors] = await db.query(
      "SELECT id, name, username FROM users WHERE role = 'Dokter' ORDER BY name ASC"
    );

    // 7. Data Master Poliklinik (Dinamis dari Tabel Polyclinics)
    const [polyclinics] = await db.query(
      "SELECT id, name, description FROM polyclinics ORDER BY id ASC"
    );

    // 8. Data Role & Permissions Terkini untuk Matriks RBAC
    const [roleUsers] = await db.query(
      "SELECT id, name, username, role, permissions FROM users"
    );
    const parsedRoleUsers = roleUsers.map(u => {
      let p = u.permissions;
      if (typeof p === 'string') {
        try { p = JSON.parse(p); } catch (e) { p = null; }
      }
      return { ...u, permissions: p };
    });

    return successResponse(res, {
      totalPatients,
      todayPatients,
      todayQueues,
      waitingPatients,
      completedPatients,
      doctors,
      polyclinics,
      roleUsers: parsedRoleUsers
    }, 'Data ringkasan dashboard berhasil diambil.');

  } catch (error) {
    console.error('Error getDashboardSummary:', error);
    return errorResponse(res, 'Gagal mengambil data ringkasan dashboard.', error.message, 500);
  }
};

module.exports = {
  getDashboardSummary
};
