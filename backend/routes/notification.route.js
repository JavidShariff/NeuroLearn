const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController.js');
const { protect } = require('../middleware/auth.middleware.js');

router.get('/', protect, userController.getNotifications);
router.put('/:id/read', protect, userController.markNotificationRead);
router.put('/read-all', protect, userController.markAllNotificationsRead);
router.delete('/:id', protect, userController.deleteNotification);

module.exports = router;