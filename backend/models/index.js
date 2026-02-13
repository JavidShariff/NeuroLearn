const User = require('./user.model.js');
const { Quiz } = require('./quizQuestion.model.js');
const { QuizAttempt } = require('./quizAttempt.model.js');
const StudyRoom = require('./studyRoom.model.js');
const ChatMessage = require('./chatMessage.model.js');
const { ForumPost } = require('./forumPost.model.js');
const ForumComment = require('./forumComments.model.js');
const { Notification } = require('./notification.model.js');
const Achievement = require('./achievements.model.js');
const { UserStreak } = require('./userStreaks.model.js');
const { UserAnalytics } = require('./userAnalytics.model.js');

module.exports = {
    User,
    Quiz,
    QuizAttempt,
    StudyRoom,
    ChatMessage,
    ForumPost,
    ForumComment,
    Notification,
    Achievement,
    UserStreak,
    UserAnalytics
};
