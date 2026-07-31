const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRoles } = require('../middleware/auth');
const {
  getMedicines,
  createMedicine,
  updateMedicine,
  deleteMedicine
} = require('../controllers/medicineController');

router.use(verifyToken);

router.get('/', getMedicines);
router.post('/', authorizeRoles('Administrator'), createMedicine);
router.put('/:id', authorizeRoles('Administrator'), updateMedicine);
router.delete('/:id', authorizeRoles('Administrator'), deleteMedicine);

module.exports = router;
