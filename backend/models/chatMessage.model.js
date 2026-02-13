const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StudyRoom',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: true,
    maxlength: 2000
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'file', 'system'],
    default: 'text'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);


// Export all models
module.exports = ChatMessage