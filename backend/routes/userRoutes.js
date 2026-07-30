const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken, authorizeRoles } = require('../middleware/auth');

// Seluruh Endpoint Pengelolaan User Wajib Login & HANYA Bisa Diakses Administrator
router.use(verifyToken);
router.use(authorizeRoles('Administrator'));

router.get('/', userController.getUsers);
router.get('/:id', userController.getUserById);
router.post('/', userController.createUser);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

module.exports = router;
