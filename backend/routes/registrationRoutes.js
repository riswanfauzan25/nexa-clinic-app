const express = require('express');
const router = express.Router();
const registrationController = require('../controllers/registrationController');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);

router.get('/', registrationController.getRegistrations);
router.get('/:id', registrationController.getRegistrationById);
router.post('/', registrationController.createRegistration);
router.put('/:id/status', registrationController.updateRegistrationStatus);
router.delete('/:id', registrationController.deleteRegistration);

module.exports = router;
