// controllers/quizController.js
const {
  Quiz,
  QuizAttempt,
  UserStreak,
  UserAnalytics,
  Achievement,
  Notification,
} = require("../models");
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
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
  const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
];
  try {
    const { notes, title, topic, difficulty, questionCount = 5 } = req.body;

    // 1. Basic Validation
    if (!notes || notes.trim().length < 50) {
      return res.status(400).json({
        status: "error",
        message: "Please provide a bit more detail (at least 50 characters) so I can create a good quiz!",
      });
    }

    if (!process.env.GOOGLE_API_KEY) {
      return res.status(500).json({ status: "error", message: "AI service not configured" });
    }

    // 2. Adaptive Logic (Keep your existing UserAnalytics lookup here)
    let performanceContext = "";
    let targetDifficulty = difficulty || "medium";
    // ... [Analytics logic remains exactly the same] ...

    // 3. Robust Resilience Configuration
    const modelsToTry = [
      "gemini-3.1-flash-lite-preview", // Target Model
      "gemini-2.0-flash-lite-001", // Modern Fallback
      "gemini-2.0-flash",   // High availability fallback
    ];

    const prompt = `
      Task: Generate exactly ${questionCount} MCQs from these notes: "${notes}".
      Target Difficulty: ${targetDifficulty}.
      
      CRITICAL: Return ONLY a JSON object with this exact structure:
      {
        "questions": [
          {
            "question": "string",
            "options": ["string", "string", "string", "string"],
            "correctIndex": number (0-3),
            "explanation": "string"
          }
        ]
      }
    `;

    // 4. Execution Loop with Backoff
    let lastError;
for (const modelName of modelsToTry) {
  try {
    const model = genAI.getGenerativeModel({ 
      model: modelName,
      safetySettings, // Add this!
      generationConfig: { responseMimeType: "application/json" }
    });

    // Shorten the prompt to reduce token "noise"
    const prompt = `Generate a JSON object containing a "questions" array with ${questionCount} MCQs based on these notes: "${notes}". 
    Difficulty: ${targetDifficulty}.
    Format: {"questions": [{"question": "", "options": ["", "", "", ""], "correctIndex": 0, "explanation": ""}]}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    if (!text) {
      console.warn(`[${modelName}] Empty response. Checking safety...`);
      continue;
    }

    const cleanJson = text.replace(/```json|```/gi, "").trim();
    const parsed = JSON.parse(cleanJson);
    const questions = Array.isArray(parsed) ? parsed : (parsed.questions || []);

    if (questions.length > 0) {
      const quiz = await Quiz.create({
        title: title || "AI Generated Quiz",
        topic: topic || "Custom",
        difficulty: targetDifficulty,
        questions: questions.slice(0, questionCount),
        creator: req.user.id,
        sourceNotes: notes,
        isPublic: false,
      });

      return res.status(201).json({ status: "success", data: { quiz } });
    }
  } catch (err) {
    console.error(`Error with ${modelName}:`, err.message);
    // If it's a 429 or 503, the loop will naturally move to the next model
  }
}
    throw new Error("AI is currently overloaded. Please try again in a few seconds.");

  } catch (error) {
    console.error("Quiz Gen Error:", error);
    res.status(503).json({
      status: "error",
      message: "I'm having trouble reading these notes right now. Try a shorter version or try again in a moment!",
    });
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
