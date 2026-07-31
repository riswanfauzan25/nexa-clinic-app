const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRoles } = require('../middleware/auth');
const {
  getProcedures,
  getProcedureById,
  createProcedure,
  updateProcedure,
  deleteProcedure
} = require('../controllers/masterController');

router.use(verifyToken);

router.get('/', getProcedures);
router.get('/:id', getProcedureById);
router.post('/', authorizeRoles('Administrator'), createProcedure);
router.put('/:id', authorizeRoles('Administrator'), updateProcedure);
router.delete('/:id', authorizeRoles('Administrator'), deleteProcedure);

module.exports = router;
