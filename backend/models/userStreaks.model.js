const mongoose = require('mongoose');

const userStreakSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  currentStreak: {
    type: Number,
    default: 0
  },
  longestStreak: {
    type: Number,
    default: 0
  },
  lastQuizDate: {
    type: Date,
    default: null
  },
  streakHistory: [{
    date: {
      type: Date,
      required: true
    },
    completed: {
      type: Boolean,
      default: false
    },
    quizzesTaken: {
      type: Number,
      default: 0
    }
  }],
  totalQuizzesTaken: {
    type: Number,
    default: 0
  },
  totalScore: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

// Method to update streak after quiz completion
userStreakSchema.methods.updateStreak = async function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const lastQuiz = this.lastQuizDate ? new Date(this.lastQuizDate) : null;
  if (lastQuiz) {
    lastQuiz.setHours(0, 0, 0, 0);
  }
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (!lastQuiz || lastQuiz.getTime() < yesterday.getTime()) {
    // Streak broken - reset to 1
    this.currentStreak = 1;
  } else if (lastQuiz.getTime() === yesterday.getTime()) {
    // Consecutive day - increment streak
    this.currentStreak += 1;
  }
  // Same day - streak stays the same
  
  // Update longest streak if current is higher
  if (this.currentStreak > this.longestStreak) {
    this.longestStreak = this.currentStreak;
  }
  
  this.lastQuizDate = new Date();
  
  // Update streak history
  const existingEntry = this.streakHistory.find(
    entry => entry.date.toDateString() === today.toDateString()
  );
  
  if (existingEntry) {
    existingEntry.quizzesTaken += 1;
    existingEntry.completed = true;
  } else {
    this.streakHistory.push({
      date: today,
      completed: true,
      quizzesTaken: 1
    });
  }
  
  // Keep only last 30 days of history
  if (this.streakHistory.length > 30) {
    this.streakHistory = this.streakHistory.slice(-30);
  }
  
  await this.save();
};

const UserStreak = mongoose.model('UserStreak', userStreakSchema);


// Export all models
module.exports = {
  UserStreak
};
