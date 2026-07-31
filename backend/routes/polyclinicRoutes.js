const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRoles } = require('../middleware/auth');
const {
  getPolyclinics,
  getPolyclinicById,
  createPolyclinic,
  updatePolyclinic,
  deletePolyclinic
} = require('../controllers/masterController');

router.use(verifyToken);

router.get('/', getPolyclinics);
router.get('/:id', getPolyclinicById);
router.post('/', authorizeRoles('Administrator'), createPolyclinic);
router.put('/:id', authorizeRoles('Administrator'), updatePolyclinic);
router.delete('/:id', authorizeRoles('Administrator'), deletePolyclinic);

module.exports = router;
