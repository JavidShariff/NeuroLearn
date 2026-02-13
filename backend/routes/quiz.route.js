const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController.js');
const { protect } = require('../middleware/auth.middleware.js');

router.get('/', protect, quizController.getAllQuizzes);
router.get('/my-quizzes', protect, quizController.getMyQuizzes);
router.get('/:id', protect, quizController.getQuizById);
router.post('/generate', protect, quizController.generateQuizFromNotes);
router.post('/', protect, quizController.createQuiz);
router.put('/:id', protect, quizController.updateQuiz);
router.delete('/:id', protect, quizController.deleteQuiz);
router.post('/:id/attempt', protect, quizController.submitQuizAttempt);
router.get('/:id/attempts', protect, quizController.getQuizAttempts);
router.get('/attempts/my-attempts', protect, quizController.getMyAttempts);

module.exports = router;