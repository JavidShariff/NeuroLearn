const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiAssistantController.js');
const { protect } = require('../middleware/auth.middleware.js');

router.post('/chat', protect, aiController.aiChat);
router.post('/summarize', protect, aiController.summarizePost);

module.exports = router;