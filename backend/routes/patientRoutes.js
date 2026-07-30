const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const { verifyToken, authorizeRoles } = require('../middleware/auth');

// Seluruh Endpoint Pasien Wajib Login (JWT Token)
router.use(verifyToken);

// GET All Patients & GET Single Patient (Boleh diakses Admin, Dokter, & Petugas Pendaftaran)
router.get('/', authorizeRoles('Administrator', 'Dokter', 'Petugas Pendaftaran'), patientController.getPatients);
router.get('/:id', authorizeRoles('Administrator', 'Dokter', 'Petugas Pendaftaran'), patientController.getPatientById);

// POST, PUT, DELETE Pasien (Hanya boleh diakses Administrator & Petugas Pendaftaran)
router.post('/', authorizeRoles('Administrator', 'Petugas Pendaftaran'), patientController.createPatient);
router.put('/:id', authorizeRoles('Administrator', 'Petugas Pendaftaran'), patientController.updatePatient);
router.delete('/:id', authorizeRoles('Administrator', 'Petugas Pendaftaran'), patientController.deletePatient);

module.exports = router;
