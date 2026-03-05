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

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
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
