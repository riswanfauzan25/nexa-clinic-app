const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const {
  getMedicalRecords,
  getMedicalRecordDetail,
  getPatientsReadyForExam,
  createMedicalRecord,
  updateMedicalRecord,
  deleteMedicalRecord
} = require('../controllers/medicalRecordController');

// GET /api/medical-records/ready  - Daftar pasien siap diperiksa hari ini
router.get('/ready', verifyToken, getPatientsReadyForExam);

// GET /api/medical-records        - Semua rekam medis (dengan filter)
router.get('/', verifyToken, getMedicalRecords);

// GET /api/medical-records/:id    - Detail rekam medis + tindakan + resep
router.get('/:id', verifyToken, getMedicalRecordDetail);

// POST /api/medical-records       - Buat rekam medis baru (+ selesaikan antrean)
router.post('/', verifyToken, createMedicalRecord);

// PUT /api/medical-records/:id    - Update rekam medis
router.put('/:id', verifyToken, updateMedicalRecord);

// DELETE /api/medical-records/:id - Hapus rekam medis
router.delete('/:id', verifyToken, deleteMedicalRecord);

module.exports = router;
