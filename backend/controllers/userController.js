// controllers/userController.js
const {
  User,
  Achievement,
  Notification,
  QuizAttempt,
  StudyRoom,
  ForumPost,
  ForumComment,
  UserStreak,
  UserAnalytics,
} = require("../models");

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const streak = await UserStreak.findOne({ user: req.user.id });

    // Merge user and streak data
    const userData = user.toObject();
    userData.streak = streak;

    res.status(200).json({
      status: "success",
      data: { user: userData },
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// Update profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, email, location, bio } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, email, location, bio },
      { new: true, runValidators: true },
    );

    res.status(200).json({
      status: "success",
      data: { user },
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// Update password
exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id).select("+password");

    if (!(await user.comparePassword(currentPassword))) {
      return res.status(401).json({
        status: "error",
        message: "Current password is incorrect",
      });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      status: "success",
      message: "Password updated successfully",
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// Update avatar
exports.updateAvatar = async (req, res) => {
  try {
    const { avatar } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { avatar },
      { new: true },
    );

    res.status(200).json({
      status: "success",
      data: { user },
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-email");

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: { user },
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// Get user achievements
exports.getUserAchievements = async (req, res) => {
  try {
    const achievements = await Achievement.find({ user: req.params.id });

    res.status(200).json({
      status: "success",
      data: { achievements },
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// Get user activity
exports.getUserActivity = async (req, res) => {
  try {
    const userId = req.params.id;

    // Get recent quiz attempts
    const quizAttempts = await QuizAttempt.find({ user: userId })
      .populate("quiz", "title topic")
      .sort({ completedAt: -1 })
      .limit(10);

    // Get rooms joined (sorted by join date)
    const allRooms = await StudyRoom.find({ "members.user": userId }).select(
      "name topic members",
    );

    const rooms = allRooms
      .map((r) => {
        const member = r.members.find(
          (m) => m.user.toString() === userId.toString(),
        );
        return {
          _id: r._id,
          name: r.name,
          topic: r.topic,
          joinedAt: member ? member.joinedAt : r.createdAt,
        };
      })
      .sort((a, b) => new Date(b.joinedAt) - new Date(a.joinedAt))
      .slice(0, 5);

    // Get study sessions
    const analytics = await UserAnalytics.findOne({ user: userId }).populate(
      "studySessions.room",
      "name topic",
    );

    const recentSessions = analytics
      ? analytics.studySessions
          .sort((a, b) => b.endTime - a.endTime)
          .slice(0, 5)
      : [];

    // Get forum posts
    const posts = await ForumPost.find({ author: userId })
      .select("title createdAt")
      .sort({ createdAt: -1 })
      .limit(5);

    // Get forum comments
    const comments = await ForumComment.find({ author: userId })
      .populate("post", "title")
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      status: "success",
      data: {
        activity: {
          recentQuizzes: quizAttempts,
          joinedRooms: rooms,
          studySessions: recentSessions,
          forumPosts: posts,
          forumComments: comments,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// Get notifications
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({
      status: "success",
      data: { notifications },
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// Mark notification as read
exports.markNotificationRead = async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });

    res.status(200).json({
      status: "success",
      message: "Notification marked as read",
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// Mark all notifications as read
exports.markAllNotificationsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user.id, isRead: false },
      { isRead: true },
    );

    res.status(200).json({
      status: "success",
      message: "All notifications marked as read",
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// Delete notification
exports.deleteNotification = async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);

    res.status(200).json({
      status: "success",
      message: "Notification deleted",
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};
