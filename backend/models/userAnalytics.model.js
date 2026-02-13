const mongoose = require('mongoose');

const userAnalyticsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  quizPerformance: [{
    topic: String,
    totalAttempts: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
    lastAttempt: Date
  }],
  studyTime: [{
    date: Date,
    hours: { type: Number, default: 0 }
  }],
  studySessions: [{
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StudyRoom'
    },
    startTime: Date,
    endTime: Date,
    durationMinutes: Number
  }],
  topicMastery: [{
    subject: String,
    masteryLevel: { type: Number, default: 0 }, // 0-100
    quizzesTaken: { type: Number, default: 0 }
  }],
  totalStudyHours: {
    type: Number,
    default: 0
  },
  peerInteractions: {
    type: Number,
    default: 0
  },
  roomsJoined: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StudyRoom'
  }]
}, { timestamps: true });

const UserAnalytics = mongoose.model('UserAnalytics', userAnalyticsSchema);


// Export all models
module.exports = {
  UserAnalytics
};