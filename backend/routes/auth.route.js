const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller.js');
const { protect } = require('../middleware/auth.middleware.js');


router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password/:token', authController.resetPassword);
router.get('/me', protect, authController.getMe);
router.post('/refresh-token', authController.refreshToken);

 
module.exports = router;