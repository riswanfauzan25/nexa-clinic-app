const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const db = require('../config/database');
const { successResponse, errorResponse } = require('../utils/response');

router.use(verifyToken);

// GET /api/doctors (Mendapatkan daftar seluruh dokter aktif & poliklinik tugasnya)
router.get('/', async (req, res) => {
  try {
    const [doctors] = await db.query(
      `SELECT u.id, u.name, u.username, u.polyclinic_id, p.name AS polyclinic_name 
       FROM users u LEFT JOIN polyclinics p ON u.polyclinic_id = p.id 
       WHERE u.role = 'Dokter' ORDER BY u.name ASC`
    );
    return successResponse(res, doctors, 'Daftar dokter berhasil diambil.');
  } catch (error) {
    return errorResponse(res, 'Gagal mengambil daftar dokter.', error.message, 500);
  }
});

module.exports = router;
