const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController.js');
const { protect } = require('../middleware/auth.middleware.js');

router.get('/', protect, analyticsController.getMyAnalytics);
router.get('/quiz-performance', protect, analyticsController.getQuizPerformance);
router.get('/study-time', protect, analyticsController.getStudyTime);
router.get('/topic-mastery', protect, analyticsController.getTopicMastery);
router.post('/log-study-time', protect, analyticsController.logStudyTime);
router.get('/summary', protect, analyticsController.getSummary);

module.exports = router;
