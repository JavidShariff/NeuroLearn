// controllers/quizController.js
const {
  Quiz,
  QuizAttempt,
  UserStreak,
  UserAnalytics,
  Achievement,
  Notification,
} = require("../models");

// Get all public quizzes
exports.getAllQuizzes = async (req, res) => {
  try {
    const { topic, difficulty, page = 1, limit = 20 } = req.query;

    const query = { isPublic: true };
    if (topic) query.topic = topic;
    if (difficulty) query.difficulty = difficulty;

    const quizzes = await Quiz.find(query)
      .populate("creator", "name avatar")
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: "success",
      data: { quizzes },
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// Get my quizzes
exports.getMyQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find({ creator: req.user.id }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      status: "success",
      data: { quizzes },
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// Get quiz by ID
exports.getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id).populate(
      "creator",
      "name avatar",
    );

    if (!quiz) {
      return res.status(404).json({
        status: "error",
        message: "Quiz not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: { quiz },
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// Generate quiz from notes (AI integration)
exports.generateQuizFromNotes = async (req, res) => {
  try {
    const { notes, title, topic, difficulty, questionCount = 5 } = req.body;

    if (!notes || notes.trim().length < 50) {
      return res.status(400).json({
        status: "error",
        message: "Please provide at least 50 characters of notes",
      });
    }

    // Use Gemini AI to generate quiz
    const { GoogleGenerativeAI } = require("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

    if (!process.env.GOOGLE_API_KEY) {
      return res.status(500).json({
        status: "error",
        message: "AI service not configured",
      });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `Generate exactly ${questionCount} multiple-choice questions from the following study notes. 
    
Study Notes:
${notes}

Return ONLY a valid JSON array (no markdown, no code blocks) in this EXACT format:
[
  {
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctIndex": 0,
    "explanation": "Brief explanation why this is correct"
  }
]

Requirements:
- Exactly ${questionCount} questions
- Each question must have exactly 4 options
- correctIndex must be 0, 1, 2, or 3
- Questions should test understanding, not just memorization
- Return ONLY the JSON array, nothing else`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text().trim();

    // Clean up response - remove code blocks if present
    text = text
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    let questions;
    try {
      questions = JSON.parse(text);
    } catch (parseError) {
      console.error("Failed to parse AI response:", text);
      return res.status(500).json({
        status: "error",
        message: "Failed to generate valid quiz format",
      });
    }

    // Validate questions
    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(500).json({
        status: "error",
        message: "Invalid quiz format generated",
      });
    }

    // Create and save the quiz to the database
    const quiz = await Quiz.create({
      title: title || "AI Generated Quiz",
      topic: topic || "Custom",
      difficulty: difficulty || "medium",
      questions: questions.slice(0, questionCount),
      creator: req.user.id,
      sourceNotes: notes,
      isPublic: false, // Generated quizzes are private by default
    });

    res.status(201).json({
      status: "success",
      data: { quiz },
    });
  } catch (error) {
    console.error("Quiz generation error:", error);
    res.status(500).json({ status: "error", message: error.message });
  }
};

// Create quiz manually
exports.createQuiz = async (req, res) => {
  try {
    const {
      title,
      description,
      topic,
      difficulty,
      questions,
      isPublic,
      sourceNotes,
    } = req.body;

    const quiz = await Quiz.create({
      title,
      description,
      topic,
      difficulty,
      questions,
      isPublic,
      sourceNotes: sourceNotes || "",
      creator: req.user.id,
    });

    res.status(201).json({
      status: "success",
      data: { quiz },
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// Update quiz
exports.updateQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findOneAndUpdate(
      { _id: req.params.id, creator: req.user.id },
      req.body,
      { new: true },
    );

    if (!quiz) {
      return res.status(404).json({
        status: "error",
        message: "Quiz not found or not authorized",
      });
    }

    res.status(200).json({
      status: "success",
      data: { quiz },
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// Delete quiz
exports.deleteQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findOneAndDelete({
      _id: req.params.id,
      creator: req.user.id,
    });

    if (!quiz) {
      return res.status(404).json({
        status: "error",
        message: "Quiz not found or not authorized",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Quiz deleted",
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// Submit quiz attempt
exports.submitQuizAttempt = async (req, res) => {
  try {
    const { answers, timeTaken } = req.body;

    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({
        status: "error",
        message: "Quiz not found",
      });
    }

    // Calculate score
    let correctCount = 0;
    const processedAnswers = answers.map((answer, index) => {
      const isCorrect =
        quiz.questions[index].correctIndex === answer.selectedOption;
      if (isCorrect) correctCount++;
      return {
        questionIndex: index,
        selectedOption: answer.selectedOption,
        isCorrect,
      };
    });

    const percentage = Math.round((correctCount / quiz.questions.length) * 100);

    // Create attempt record
    const attempt = await QuizAttempt.create({
      user: req.user.id,
      quiz: quiz._id,
      answers: processedAnswers,
      score: correctCount,
      totalQuestions: quiz.questions.length,
      percentage,
      timeTaken,
    });

    // Update quiz stats
    quiz.timesAttempted += 1;
    await quiz.save();

    // Calculate points based on score (align with frontend logic: 10 pts per correct answer + 20 bonus for 100%)
    const pointsEarned = correctCount * 10 + (percentage === 100 ? 20 : 0);

    // Update User Streak & Points
    let streak = await UserStreak.findOne({ user: req.user.id });
    if (!streak) {
      streak = await UserStreak.create({ user: req.user.id });
    }
    await streak.updateStreak(new Date());
    streak.totalScore += pointsEarned;
    streak.totalQuizzesTaken += 1;
    await streak.save();

    // Update User Analytics (Study Time & Topic Mastery)
    let analytics = await UserAnalytics.findOne({ user: req.user.id });
    if (!analytics) {
      analytics = await UserAnalytics.create({ user: req.user.id });
    }

    // 1. Log Study Time
    const hours = timeTaken ? timeTaken / 60 : 0; // Convert minutes to hours
    if (hours > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todayEntry = analytics.studyTime.find(
        (entry) =>
          new Date(entry.date).setHours(0, 0, 0, 0) === today.getTime(),
      );

      if (todayEntry) {
        todayEntry.hours += hours;
      } else {
        analytics.studyTime.push({ date: today, hours });
      }
      analytics.totalStudyHours = (analytics.totalStudyHours || 0) + hours;
    }

    // 2. Update Topic Mastery (and Quiz Performance)
    // Update Quiz Performance (existing logic improved)
    const topicEntry = analytics.quizPerformance.find(
      (p) => p.topic === quiz.topic,
    );
    if (topicEntry) {
      // Weighted average: (old_avg * old_attempts + new_score) / (old_attempts + 1)
      const currentTotalScore =
        topicEntry.averageScore * topicEntry.totalAttempts;
      topicEntry.totalAttempts += 1;
      topicEntry.averageScore = Math.round(
        (currentTotalScore + percentage) / topicEntry.totalAttempts,
      );
      topicEntry.lastAttempt = new Date();
    } else {
      analytics.quizPerformance.push({
        topic: quiz.topic,
        totalAttempts: 1,
        averageScore: percentage,
        lastAttempt: new Date(),
      });
    }

    // Update Topic Mastery (sync with quizPerformance for now, or use specific logic)
    // Here we define Mastery as average score on the topic
    const masteryEntry = analytics.topicMastery.find(
      (m) => m.subject === quiz.topic,
    );
    if (masteryEntry) {
      masteryEntry.masteryLevel = topicEntry
        ? topicEntry.averageScore
        : percentage;
      masteryEntry.quizzesTaken += 1;
    } else {
      analytics.topicMastery.push({
        subject: quiz.topic,
        masteryLevel: percentage,
        quizzesTaken: 1,
      });
    }

    await analytics.save();

    res.status(200).json({
      status: "success",
      data: {
        attempt,
        pointsEarned,
        streak: {
          currentStreak: streak.currentStreak,
          totalScore: streak.totalScore,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// Helper function for achievements
async function checkAndAwardAchievements(userId, streak) {
  const achievements = [];

  // Streak achievements
  if (streak.currentStreak === 7) {
    achievements.push({
      user: userId,
      title: "Week Warrior",
      description: "7-day quiz streak!",
      icon: "🔥",
      category: "streak",
    });
  }

  if (streak.currentStreak === 30) {
    achievements.push({
      user: userId,
      title: "Streak Master",
      description: "30-day quiz streak!",
      icon: "🏆",
      category: "streak",
    });
  }

  if (streak.totalQuizzesTaken === 20) {
    achievements.push({
      user: userId,
      title: "Quiz Master",
      description: "Completed 20 quizzes",
      icon: "🎯",
      category: "quiz",
    });
  }

  for (const achievement of achievements) {
    // Check if already earned
    const existing = await Achievement.findOne({
      user: userId,
      title: achievement.title,
    });

    if (!existing) {
      await Achievement.create(achievement);

      // Send notification
      await Notification.create({
        user: userId,
        type: "achievement",
        title: "New Achievement!",
        message: `You earned: ${achievement.title}`,
        link: "/profile",
      });
    }
  }
}

// Get quiz attempts
exports.getQuizAttempts = async (req, res) => {
  try {
    const attempts = await QuizAttempt.find({ quiz: req.params.id })
      .populate("user", "name avatar")
      .sort({ completedAt: -1 });

    res.status(200).json({
      status: "success",
      data: { attempts },
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// Get my attempts
exports.getMyAttempts = async (req, res) => {
  try {
    const attempts = await QuizAttempt.find({ user: req.user.id })
      .populate("quiz", "title topic")
      .sort({ completedAt: -1 });

    res.status(200).json({
      status: "success",
      data: { attempts },
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// AI Chat (for room AI assistant)
exports.aiChat = async (req, res) => {
  try {
    const { message, roomTopic } = req.body;

    // TODO: Integrate with AI API
    // For now, return mock response
    const mockResponse = `I can help you understand ${roomTopic}. What specific topic would you like to explore?`;

    res.status(200).json({
      status: "success",
      data: { response: mockResponse },
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};
