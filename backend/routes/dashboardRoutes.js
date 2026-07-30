const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { verifyToken, authorizeRoles } = require('../middleware/auth');

// Endpoint Dashboard Wajib Login & Bisa Diakses Semua Role (Administrator, Dokter, Petugas Pendaftaran)
router.get(
  '/summary', 
  verifyToken, 
  authorizeRoles('Administrator', 'Dokter', 'Petugas Pendaftaran'), 
  dashboardController.getDashboardSummary
);

module.exports = router;
