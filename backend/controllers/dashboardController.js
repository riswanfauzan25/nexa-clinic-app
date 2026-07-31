const db = require('../config/database');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * Controller Get Dashboard Summary Statistics & Dynamic Clinic Info
 * Endpoint: GET /api/dashboard/summary?month=MM&year=YYYY
 */
const getDashboardSummary = async (req, res) => {
  try {
    const isDoctor = req.user && req.user.role === 'Dokter';
    const doctorId = req.user ? req.user.id : null;

    const now = new Date();
    const month = parseInt(req.query.month) || (now.getMonth() + 1);
    const year = parseInt(req.query.year) || now.getFullYear();

    // 1. Dynamic Available Years in Database
    const [yearRows] = await db.query(`
      SELECT DISTINCT YEAR(visit_date) AS yr FROM registrations 
      UNION 
      SELECT YEAR(CURDATE()) AS yr 
      ORDER BY yr DESC
    `);
    const availableYears = yearRows.map(r => r.yr);

    // 2. Total Pasien Master Terdaftar (Keseluruhan)
    const [patientRows] = await db.query('SELECT COUNT(*) as totalPatients FROM patients');
    const totalPatients = patientRows[0].totalPatients;

    // 3. Total Kunjungan Pasien Hari Ini (Spesifik Hari Ini CURDATE())
    let todayParams = [];
    let todayQuery = 'SELECT COUNT(*) as count FROM registrations WHERE visit_date = CURDATE()';
    if (isDoctor) {
      todayQuery += ' AND doctor_id = ?';
      todayParams.push(doctorId);
    }
    const [todayRegRows] = await db.query(todayQuery, todayParams);
    const todayPatients = todayRegRows[0].count;

    // 4. Total Kunjungan Pasien Periode (Bulan & Tahun Terpilih)
    let periodParams = [month, year];
    let periodQuery = 'SELECT COUNT(*) as count FROM registrations WHERE MONTH(visit_date) = ? AND YEAR(visit_date) = ?';
    if (isDoctor) {
      periodQuery += ' AND doctor_id = ?';
      periodParams.push(doctorId);
    }
    const [periodRegRows] = await db.query(periodQuery, periodParams);
    const periodPatients = periodRegRows[0].count;

    // 5. Total Antrean Terbit Periode
    let queueParams = [month, year];
    let queueQuery = 'SELECT COUNT(*) as count FROM queues q JOIN registrations r ON q.registration_id = r.id WHERE MONTH(q.created_at) = ? AND YEAR(q.created_at) = ?';
    if (isDoctor) {
      queueQuery += ' AND r.doctor_id = ?';
      queueParams.push(doctorId);
    }
    const [periodQueueRows] = await db.query(queueQuery, queueParams);
    const periodQueues = periodQueueRows[0].count;

    // 6. Total Pasien Menunggu Periode
    let waitingParams = [month, year];
    let waitingQuery = "SELECT COUNT(*) as count FROM registrations WHERE status = 'Menunggu' AND MONTH(visit_date) = ? AND YEAR(visit_date) = ?";
    if (isDoctor) {
      waitingQuery += ' AND doctor_id = ?';
      waitingParams.push(doctorId);
    }
    const [waitingRows] = await db.query(waitingQuery, waitingParams);
    const waitingPatients = waitingRows[0].count;

    // 7. Total Pasien Selesai Dilayani Periode
    let completedParams = [month, year];
    let completedQuery = "SELECT COUNT(*) as count FROM registrations WHERE status = 'Selesai' AND MONTH(visit_date) = ? AND YEAR(visit_date) = ?";
    if (isDoctor) {
      completedQuery += ' AND doctor_id = ?';
      completedParams.push(doctorId);
    }
    const [completedRows] = await db.query(completedQuery, completedParams);
    const completedPatients = completedRows[0].count;

    // 8. Breakdown Kunjungan per Poliklinik (Bulan & Tahun Terpilih)
    let polyStatParams = [month, year];
    let polyStatQuery = `
      SELECT poly.id, poly.name AS polyclinic_name, COUNT(r.id) AS total_visits
      FROM polyclinics poly
      LEFT JOIN registrations r ON poly.id = r.polyclinic_id 
        AND MONTH(r.visit_date) = ? AND YEAR(r.visit_date) = ?
        ${isDoctor ? 'AND r.doctor_id = ?' : ''}
      GROUP BY poly.id, poly.name
      ORDER BY poly.id ASC
    `;
    if (isDoctor) {
      polyStatParams.push(doctorId);
    }
    const [polyclinicStats] = await db.query(polyStatQuery, polyStatParams);

    // 9. Data Dokter Terdaftar
    const [doctors] = await db.query(
      "SELECT id, name, username FROM users WHERE role = 'Dokter' ORDER BY name ASC"
    );

    // 10. Data Master Poliklinik
    const [polyclinics] = await db.query(
      "SELECT id, name, description FROM polyclinics ORDER BY id ASC"
    );

    // 11. Data Role & Permissions Terkini
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
      selectedMonth: month,
      selectedYear: year,
      availableYears,
      totalPatients,
      todayPatients,
      periodPatients,
      periodQueues,
      waitingPatients,
      completedPatients,
      polyclinicStats,
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
