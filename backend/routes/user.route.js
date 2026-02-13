const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController.js');
const { protect } = require('../middleware/auth.middleware.js');

router.get('/profile', protect, userController.getProfile);
router.put('/profile', protect, userController.updateProfile);
router.put('/password', protect, userController.updatePassword);
router.put('/avatar', protect, userController.updateAvatar);
router.get('/:id', protect, userController.getUserById);
router.get('/:id/achievements', protect, userController.getUserAchievements);
router.get('/:id/activity', protect, userController.getUserActivity);

module.exports = router;