const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRoles } = require('../middleware/auth');
const {
  getMedicines,
  getMedicineById,
  createMedicine,
  updateMedicine,
  deleteMedicine
} = require('../controllers/masterController');

router.use(verifyToken);

router.get('/', getMedicines);
router.get('/:id', getMedicineById);
router.post('/', authorizeRoles('Administrator'), createMedicine);
router.put('/:id', authorizeRoles('Administrator'), updateMedicine);
router.delete('/:id', authorizeRoles('Administrator'), deleteMedicine);

module.exports = router;
