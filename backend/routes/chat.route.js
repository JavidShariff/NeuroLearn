const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController.js');
const { protect } = require('../middleware/auth.middleware.js');

router.get('/rooms/:roomId/messages', protect, roomController.getMessages);
router.post('/rooms/:roomId/messages', protect, roomController.sendMessage);
router.delete('/rooms/:roomId/messages/:messageId', protect, roomController.deleteMessage);

module.exports = router;