const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const {
  getTodayQueues,
  callQueue,
  skipQueue,
  serveQueue
} = require('../controllers/queueController');

router.use(verifyToken);

router.get('/', getTodayQueues);
router.put('/:id/call', callQueue);
router.put('/:id/skip', skipQueue);
router.put('/:id/serve', serveQueue);

module.exports = router;
