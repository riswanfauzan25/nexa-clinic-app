const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRoles } = require('../middleware/auth');
const {
  getProcedures,
  createProcedure,
  updateProcedure,
  deleteProcedure
} = require('../controllers/procedureController');

router.use(verifyToken);

router.get('/', getProcedures);
router.post('/', authorizeRoles('Administrator'), createProcedure);
router.put('/:id', authorizeRoles('Administrator'), updateProcedure);
router.delete('/:id', authorizeRoles('Administrator'), deleteProcedure);

module.exports = router;
