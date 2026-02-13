const mongoose = require('mongoose');

const quizQuestionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true
  },
  options: [{
    type: String,
    required: true
  }],
  correctIndex: {
    type: Number,
    required: true
  },
  explanation: {
    type: String
  }
});

const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Quiz title is required'],
    trim: true
  },
  description: {
    type: String
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sourceNotes: {
    type: String,
    required: true
  },
  questions: [quizQuestionSchema],
  topic: {
    type: String
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  timesAttempted: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

const Quiz = mongoose.model('Quiz', quizSchema);

// Export all models
module.exports = {
  Quiz,
};