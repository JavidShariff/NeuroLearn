const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const authRouter = require("./routes/auth.route.js");
const userRouter = require("./routes/user.route.js");
const roomRouter = require("./routes/studyRoom.route.js");
const quizRouter = require("./routes/quiz.route.js");
const forumRouter = require("./routes/forum.route.js");
const forumCommentRouter = require("./routes/forumComments.route.js");
const analyticsRouter = require("./routes/analytics.route.js");
const leaderboardRouter = require("./routes/leaderboard.route.js");
const notificationRouter = require("./routes/notification.route.js");
const chatRouter = require("./routes/chat.route.js");
const aiRouter = require("./routes/aiAssistant.route.js");

const app = express();

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }),
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 100 requests per windowMs
});
app.use("/api", limiter);

// Body parser
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// API Routes
app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/rooms", roomRouter);
app.use("/api/quizzes", quizRouter);
app.use("/api/forum", forumRouter);
app.use("/api/forum", forumCommentRouter);
app.use("/api/analytics", analyticsRouter);
app.use("/api/leaderboard", leaderboardRouter);
app.use("/api/notifications", notificationRouter);
app.use("/api", chatRouter); // Chat routes include /rooms/...
app.use("/api/ai", aiRouter);

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: `Route ${req.originalUrl} not found`,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    status: "error",
    message: err.message || "Internal server error",
  });
});

module.exports = app;