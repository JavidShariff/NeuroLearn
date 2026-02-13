const express = require('express');
const router = express.Router();
const leaderboardController = require('../controllers/leaderboardController.js');
const { protect } = require('../middleware/auth.middleware.js');

router.get('/', protect, leaderboardController.getLeaderboard);
router.get('/top/:count', protect, leaderboardController.getTopUsers);
router.get('/streak', protect, leaderboardController.getMyStreak);
router.get('/streak/history', protect, leaderboardController.getStreakHistory);
router.get('/streak/check', protect, leaderboardController.checkStreakStatus);

module.exports = router;