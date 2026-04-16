const { GoogleGenerativeAI } = require("@google/generative-ai");
const { ForumPost } = require("../models");

// Initialize Gemini
const genAI = new GoogleGenerativeAI(
  process.env.GOOGLE_API_KEY,
);

exports.aiChat = async (req, res) => {
  try {
    const { message, roomTopic } = req.body;

    // For safety, if no API key is present, return a mock response or error
    if (!process.env.GOOGLE_API_KEY) {
      return res.status(200).json({
        status: "success",
        data: {
          message:
            "I'm sorry, I cannot process your request right now because my API key is missing. Please ask the administrator to configure it.",
        },
      });
    }
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
      You are a helpful study assistant in a study room about "${roomTopic || "General Studies"}".
      User says: "${message}"
      Provide a helpful, concise, and encouraging response relevant to the study topic.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.status(200).json({
      status: "success",
      data: { message: text },
    });
  } catch (error) {
    console.error("AI Chat Error:", error);
    res
      .status(500)
      .json({ status: "error", message: "Failed to generate AI response" });
  }
};

exports.summarizePost = async (req, res) => {
  try {
    const { postId } = req.body;
    const post = await ForumPost.findById(postId);

    if (!post) {
      return res
        .status(404)
        .json({ status: "error", message: "Post not found" });
    }

    if (!process.env.GOOGLE_API_KEY) {
      return res.status(200).json({
        status: "success",
        data: { summary: "AI summarization is unavailable (Missing API Key)." },
      });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `
      Summarize the following forum post content in 2-3 sentences:
      Title: ${post.title}
      Content: ${post.content}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.status(200).json({
      status: "success",
      data: { summary: text },
    });
  } catch (error) {
    console.error("AI Summarize Error:", error);
    res
      .status(500)
      .json({ status: "error", message: "Failed to summarize post" });
  }
};

exports.generateAdaptiveMCQ = async (req, res) => {
  try {
    const { roomTopic, currentLevel, recentHistory, masteryPercentage } =
      req.body;

    if (!roomTopic || !currentLevel) {
      return res.status(400).json({
        status: "error",
        message: "roomTopic and currentLevel are required",
      });
    }

    if (!process.env.GOOGLE_API_KEY) {
      return res.status(200).json({
        status: "success",
        data: {
          message: "AI MCQ generation is unavailable (Missing API Key).",
        },
      });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json" },
    });

    const prompt = `
      Role: You are an expert, encouraging tutor for a student studying "${roomTopic}".
  
      Student Progress Data:
      - Current Level: ${currentLevel} (Beginner, Intermediate, or Advanced)
      - Last 3 Results: ${recentHistory || "New Student"} (e.g., "Correct, Correct, Incorrect")
      - Topic Mastery: ${masteryPercentage || 0}%

      Instruction:
      1. Evaluate the progress: If the student got the last few questions correct, increase the difficulty. If they missed the last one, stay at the same level or simplify the concept.
      2. Language Style: Use very simple, clear language. Avoid complex terms unless explaining them.
      3. Generate ONE multiple-choice question.

      Output strictly in JSON format:
      {
        "newDifficulty": "Calculated difficulty level (Beginner, Intermediate, or Advanced)",
        "question": "The question text",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correctAnswer": "The exact string of the correct option",
        "explanation": "A 1-sentence simple explanation of the answer",
        "encouragement": "A short, friendly message based on their progress (e.g., 'You're getting the hang of this!')"
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const parsedResponse = JSON.parse(text);

    res.status(200).json({
      status: "success",
      data: parsedResponse,
    });
  } catch (error) {
    console.error("AI Adaptive MCQ Error:", error);
    res
      .status(500)
      .json({ status: "error", message: "Failed to generate adaptive MCQ" });
  }
};
