const { GoogleGenerativeAI } = require("@google/generative-ai");
const { ForumPost } = require("../models");

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

const LOW_TRAFFIC_MODELS = [
  "gemini-3.1-flash-lite-preview",
  "gemini-2.0-flash-lite-001",
  "gemini-1.5-flash"
];

// 2. Updated aiChat with the same resilience
exports.aiChat = async (req, res) => {
  const { message, roomTopic } = req.body;
  if (!process.env.GOOGLE_API_KEY) return handleMissingKey(res);

  const prompt = `Study assistant for "${roomTopic}". User: "${message}". Concise & encouraging.`;

  for (const modelName of LOW_TRAFFIC_MODELS) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      return res.status(200).json({
        status: "success",
        data: { message: result.response.text() }
      });
    } catch (err) {
      if (err.status === 503 || err.status === 429) continue;
      break;
    }
  }
  res.status(503).json({ status: "error", message: "AI Chat is currently busy." });
};

// 3. Updated summarizePost 
exports.summarizePost = async (req, res) => {
  const { postId } = req.body;
  const post = await ForumPost.findById(postId);
  if (!post) return res.status(404).json({ error: "Post not found" });

  const prompt = `Summarize in 2 sentences: ${post.title} - ${post.content}`;

  for (const modelName of LOW_TRAFFIC_MODELS) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      return res.status(200).json({
        status: "success",
        data: { summary: result.response.text() }
      });
    } catch (err) {
      if (err.status === 503 || err.status === 429) continue;
      break;
    }
  }
  res.status(503).json({ status: "error", message: "Summarizer is busy." });
};

exports.generateAdaptiveMCQ = async (req, res) => {
  try {
    const { roomTopic, recentHistory, masteryPercentage, askedQuestions } =
      req.body;

    // 1. Validation
    if (!roomTopic) {
      return res
        .status(400)
        .json({ status: "error", message: "roomTopic is required" });
    }

    if (!process.env.GOOGLE_API_KEY) {
      return res.status(200).json({
        status: "success",
        data: {
          message: "AI MCQ generation is unavailable (Missing API Key).",
        },
      });
    }

    // 2. Resilience Configuration
    const modelsToTry = [
      "gemini-3.1-flash-lite-preview", // Target Model
      "gemini-2.0-flash-lite-001", // Modern Fallback
      "gemini-2.0-flash", // High-Availability Fallback
    ];

    const prompt = `
  You are building an "Antigravity" question generation mode for an adaptive quiz app.
  TOPIC: "${roomTopic}"
  MASTERY: ${masteryPercentage || 0}%
  BANNED QUESTIONS: ${JSON.stringify(askedQuestions || [])}

  GOAL: Generate 5 questions (1 Beginner, 2 Intermediate, 2 Advanced).
  
  CRITICAL: You MUST return a JSON object with a "questions" array. 
  Each question object MUST have exactly these keys:
  - "question": (string) The reasoning-based question.
  - "options": (array of 4 strings) Four distinct possible answers.
  - "correctAnswer": (string) The exact string from the options array that is correct.
  - "level": (string) "Beginner", "Intermediate", or "Advanced".
  - "reasoning": (string) Why the correct answer is correct.
  - "encouragement": (string) A short positive message for the user.

  RULES: Reasoning only, no definitions. 
  FORMAT: High-order "What if X changed?" or "Debug this logic" formats.
  OUTPUT: Strict JSON only.
`;

    // 3. The Execution Logic (Fallback + Backoff)
    let lastError;

    for (const modelName of modelsToTry) {
      let attempts = 0;
      const maxRetries = 2; // Try each model up to 3 times (1 initial + 2 retries)

      while (attempts <= maxRetries) {
        try {
          const model = genAI.getGenerativeModel({
            model: modelName,
            generationConfig: { responseMimeType: "application/json" },
          });

          const result = await model.generateContent(prompt);
          const parsedResponse = JSON.parse(result.response.text());

          const questions = Array.isArray(parsedResponse)
            ? parsedResponse
            : parsedResponse.questions || [];

          return res.status(200).json({
            status: "success",
            data: { questions }, // ✅ always consistent shape
          });
        } catch (err) {
          lastError = err;
          const status = err.status || 500;

          // If it's a 503 (Busy) or 429 (Limit), we wait and retry
          if (status === 503 || status === 429) {
            attempts++;
            if (attempts <= maxRetries) {
              const waitTime = Math.pow(2, attempts) * 1000; // 2s, 4s backoff
              console.warn(
                `[${modelName}] Busy. Retry ${attempts} in ${waitTime}ms...`,
              );
              await new Promise((r) => setTimeout(r, waitTime));
              continue;
            }
          }
          // If retries failed for this model, break and try the NEXT model in modelsToTry
          break;
        }
      }
    }

    // 4. Final Failure Response
    console.error("AI Adaptive MCQ Final Failure:", lastError);
    res.status(503).json({
      status: "error",
      message:
        "The AI service is currently very busy. We tried several times, but it couldn't respond. Please wait a few seconds and try again.",
    });
  } catch (error) {
    console.error("Critical Controller Error:", error);
    res
      .status(500)
      .json({ status: "error", message: "Failed to generate adaptive MCQ" });
  }
};
