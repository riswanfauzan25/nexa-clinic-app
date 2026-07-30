const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRoles } = require('../middleware/auth');
const {
  getPolyclinics,
  createPolyclinic,
  updatePolyclinic,
  deletePolyclinic,
  getProcedures,
  createProcedure,
  updateProcedure,
  deleteProcedure,
  getMedicines,
  createMedicine,
  updateMedicine,
  deleteMedicine
} = require('../controllers/masterController');

// All master data routes require valid JWT Token
router.use(verifyToken);

// ==========================================
// POLYCLINICS ROUTES
// ==========================================
router.get('/polyclinics', getPolyclinics);
router.post('/polyclinics', authorizeRoles('Administrator'), createPolyclinic);
router.put('/polyclinics/:id', authorizeRoles('Administrator'), updatePolyclinic);
router.delete('/polyclinics/:id', authorizeRoles('Administrator'), deletePolyclinic);

// ==========================================
// PROCEDURES ROUTES
// ==========================================
router.get('/procedures', getProcedures);
router.post('/procedures', authorizeRoles('Administrator'), createProcedure);
router.put('/procedures/:id', authorizeRoles('Administrator'), updateProcedure);
router.delete('/procedures/:id', authorizeRoles('Administrator'), deleteProcedure);

// ==========================================
// MEDICINES ROUTES
// ==========================================
router.get('/medicines', getMedicines);
router.post('/medicines', authorizeRoles('Administrator'), createMedicine);
router.put('/medicines/:id', authorizeRoles('Administrator'), updateMedicine);
router.delete('/medicines/:id', authorizeRoles('Administrator'), deleteMedicine);

module.exports = router;
