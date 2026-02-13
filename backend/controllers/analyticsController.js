// controllers/analyticsController.js
const { UserAnalytics, QuizAttempt, StudyRoom, UserStreak } = require('../models');

// Get my analytics
exports.getMyAnalytics = async (req, res) => {
  try {
    let analytics = await UserAnalytics.findOne({ user: req.user.id });
    
    if (!analytics) {
      analytics = await UserAnalytics.create({ user: req.user.id });
    }
    
    const streak = await UserStreak.findOne({ user: req.user.id });
    
    res.status(200).json({
      status: 'success',
      data: {
        analytics,
        streak: streak || { currentStreak: 0, longestStreak: 0 }
      }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Get quiz performance
exports.getQuizPerformance = async (req, res) => {
  try {
    const attempts = await QuizAttempt.find({ user: req.user.id })
      .populate('quiz', 'topic')
      .sort({ completedAt: -1 });
    
    // Group by topic
    const topicPerformance = {};
    attempts.forEach(attempt => {
      const topic = attempt.quiz?.topic || 'General';
      if (!topicPerformance[topic]) {
        topicPerformance[topic] = { total: 0, count: 0 };
      }
      topicPerformance[topic].total += attempt.percentage;
      topicPerformance[topic].count += 1;
    });
    
    const performance = Object.entries(topicPerformance).map(([topic, data]) => ({
      topic,
      averageScore: Math.round(data.total / data.count),
      attempts: data.count
    }));
    
    res.status(200).json({
      status: 'success',
      data: { performance }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Get study time
exports.getStudyTime = async (req, res) => {
  try {
    const analytics = await UserAnalytics.findOne({ user: req.user.id });
    
    // Get last 7 days
    const last7Days = analytics?.studyTime?.slice(-7) || [];
    
    res.status(200).json({
      status: 'success',
      data: {
        studyTime: last7Days,
        totalHours: analytics?.totalStudyHours || 0
      }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Get topic mastery
exports.getTopicMastery = async (req, res) => {
  try {
    const analytics = await UserAnalytics.findOne({ user: req.user.id });
    
    res.status(200).json({
      status: 'success',
      data: { topicMastery: analytics?.topicMastery || [] }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Log study time
exports.logStudyTime = async (req, res) => {
  try {
    const { hours, date } = req.body;
    
    const studyDate = date ? new Date(date) : new Date();
    studyDate.setHours(0, 0, 0, 0); // Normalize to midnight
    
    let analytics = await UserAnalytics.findOne({ user: req.user.id });
    if (!analytics) {
      analytics = await UserAnalytics.create({ user: req.user.id });
    }

    const todayEntry = analytics.studyTime.find(
      entry => new Date(entry.date).setHours(0,0,0,0) === studyDate.getTime()
    );

    if (todayEntry) {
      todayEntry.hours += hours;
    } else {
      analytics.studyTime.push({ date: studyDate, hours });
    }
    
    analytics.totalStudyHours = (analytics.totalStudyHours || 0) + hours;
    
    await analytics.save();
    
    res.status(200).json({
      status: 'success',
      message: 'Study time logged'
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Get summary
exports.getSummary = async (req, res) => {
  try {
    const analytics = await UserAnalytics.findOne({ user: req.user.id });
    const streak = await UserStreak.findOne({ user: req.user.id });
    const quizCount = await QuizAttempt.countDocuments({ user: req.user.id });
    const roomCount = await StudyRoom.countDocuments({ 'members.user': req.user.id });
    
    // Calculate average score
    const attempts = await QuizAttempt.find({ user: req.user.id });
    const avgScore = attempts.length > 0
      ? Math.round(attempts.reduce((sum, a) => sum + a.percentage, 0) / attempts.length)
      : 0;
    
    res.status(200).json({
      status: 'success',
      data: {
        totalQuizzes: quizCount,
        averageScore: avgScore,
        studyHours: analytics?.totalStudyHours || 0,
        peerInteractions: analytics?.peerInteractions || 0,
        currentStreak: streak?.currentStreak || 0,
        roomsJoined: roomCount
      }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
