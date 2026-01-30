// server.js - Express Server for NeuroLearn
const mongoose = require("mongoose");
require("dotenv").config();
const { DB_NAME } = require("./constants.js");
const app = require("./app.js")



// Database connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      `${process.env.MONGODB_URL}/${DB_NAME}`,
    );
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  }
};

// Start server
connectDB().then(async () => {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
});

