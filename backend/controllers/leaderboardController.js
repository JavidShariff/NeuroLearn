// controllers/leaderboardController.js
const { UserStreak, User } = require('../models');

// Get leaderboard
exports.getLeaderboard = async (req, res) => {
  try {
    const { sort = 'score', page = 1, limit = 50 } = req.query;
    
    let sortOption = { totalScore: -1 };
    if (sort === 'streak') sortOption = { currentStreak: -1 };
    if (sort === 'quizzes') sortOption = { totalQuizzesTaken: -1 };
    
    const streaks = await UserStreak.find()
      .populate('user', 'name avatar')
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(limit);
    
    const leaderboard = streaks.map((streak, index) => {
      const rank = (page - 1) * limit + index + 1;
      let badge = '⭐';
      if (rank === 1) badge = '🏆';
      if (rank === 2) badge = '🥈';
      if (rank === 3) badge = '🥉';
      
      return {
        rank,
        name: streak.user?.name || 'Unknown',
        avatar: streak.user?.avatar || '',
        userId: streak.user?._id,
        score: streak.totalScore || 0,
        streak: streak.currentStreak || 0,
        quizzesTaken: streak.totalQuizzesTaken || 0,
        badge,
        isCurrentUser: streak.user?._id.toString() === req.user.id
      };
    });
    
    const total = await UserStreak.countDocuments();
    
    res.status(200).json({
      status: 'success',
      data: {
        leaderboard,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Get top N users
exports.getTopUsers = async (req, res) => {
  try {
    const count = parseInt(req.params.count) || 10;
    
    const streaks = await UserStreak.find()
      .populate('user', 'name avatar')
      .sort({ totalScore: -1 })
      .limit(count);
    
    const topUsers = streaks.map((streak, index) => ({
      rank: index + 1,
      name: streak.user?.name,
      avatar: streak.user?.avatar,
      score: streak.totalScore,
      streak: streak.currentStreak,
      quizzesTaken: streak.totalQuizzesTaken
    }));
    
    res.status(200).json({
      status: 'success',
      data: { topUsers }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Get my streak
exports.getMyStreak = async (req, res) => {
  try {
    let streak = await UserStreak.findOne({ user: req.user.id });
    
    if (!streak) {
      streak = await UserStreak.create({ user: req.user.id });
    }
    
    // Get user's rank
    const higherRanked = await UserStreak.countDocuments({
      totalScore: { $gt: streak.totalScore }
    });
    const rank = higherRanked + 1;
    
    res.status(200).json({
      status: 'success',
      data: {
        currentStreak: streak.currentStreak,
        longestStreak: streak.longestStreak,
        lastQuizDate: streak.lastQuizDate,
        totalQuizzesTaken: streak.totalQuizzesTaken,
        totalScore: streak.totalScore,
        rank
      }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Get streak history
exports.getStreakHistory = async (req, res) => {
  try {
    const streak = await UserStreak.findOne({ user: req.user.id });
    
    res.status(200).json({
      status: 'success',
      data: {
        history: streak?.streakHistory || []
      }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Check streak status (for daily reminders)
exports.checkStreakStatus = async (req, res) => {
  try {
    const streak = await UserStreak.findOne({ user: req.user.id });
    
    if (!streak) {
      return res.status(200).json({
        status: 'success',
        data: {
          hasCompletedToday: false,
          streakAtRisk: false,
          currentStreak: 0
        }
      });
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const lastQuiz = streak.lastQuizDate ? new Date(streak.lastQuizDate) : null;
    const hasCompletedToday = lastQuiz && lastQuiz.toDateString() === today.toDateString();
    
    // Check if streak is at risk (quiz not taken today and it's late in the day)
    const currentHour = new Date().getHours();
    const streakAtRisk = !hasCompletedToday && currentHour >= 18 && streak.currentStreak > 0;
    
    res.status(200).json({
      status: 'success',
      data: {
        hasCompletedToday,
        streakAtRisk,
        currentStreak: streak.currentStreak,
        message: hasCompletedToday 
          ? "Great job! You've completed your daily quiz." 
          : streakAtRisk 
            ? "Don't forget to take a quiz today to keep your streak!" 
            : "Take a quiz to continue your streak!"
      }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
