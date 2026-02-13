const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  icon: {
    type: String,
    default: '🏆'
  },
  category: {
    type: String,
    enum: ['streak', 'quiz', 'room', 'forum', 'special'],
    default: 'special'
  },
  unlockedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

const Achievement = mongoose.model('Achievement', achievementSchema);


module.exports = Achievement;

