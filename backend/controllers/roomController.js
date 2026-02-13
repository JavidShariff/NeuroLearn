// controllers/roomController.js
const { StudyRoom, ChatMessage, User, UserAnalytics } = require("../models");

// Get all rooms
exports.getAllRooms = async (req, res) => {
  try {
    const { topic, search, page = 1, limit = 20 } = req.query;

    const query = { isPrivate: false };
    if (topic) query.topic = topic;
    if (search) query.name = { $regex: search, $options: "i" };

    const rooms = await StudyRoom.find(query)
      .populate("creator", "name avatar")
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await StudyRoom.countDocuments(query);

    res.status(200).json({
      status: "success",
      data: {
        rooms: rooms.map((room) => ({
          ...room.toObject(),
          memberCount: room.members.length,
        })),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// Get my rooms
exports.getMyRooms = async (req, res) => {
  try {
    const rooms = await StudyRoom.find({
      "members.user": req.user.id,
    }).populate("creator", "name avatar");

    res.status(200).json({
      status: "success",
      data: { rooms },
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// Get room by ID
exports.getRoomById = async (req, res) => {
  try {
    const room = await StudyRoom.findById(req.params.id)
      .populate("creator", "name avatar")
      .populate("members.user", "name avatar");

    if (!room) {
      return res.status(404).json({
        status: "error",
        message: "Room not found",
      });
    }

    // Auto-add user as member if not already a member
    const isMember = room.members.some(
      (m) => m.user._id.toString() === req.user.id,
    );

    if (!isMember && room.members.length < room.maxMembers) {
      room.members.push({ user: req.user.id });
      await room.save();

      // Re-fetch with populated data
      const updatedRoom = await StudyRoom.findById(req.params.id)
        .populate("creator", "name avatar")
        .populate("members.user", "name avatar");

      return res.status(200).json({
        status: "success",
        data: { room: updatedRoom },
      });
    }

    res.status(200).json({
      status: "success",
      data: { room },
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// Create room
exports.createRoom = async (req, res) => {
  try {
    const { name, topic, description, isPrivate, maxMembers } = req.body;

    const code = await StudyRoom.generateCode();

    const room = await StudyRoom.create({
      name,
      topic,
      description,
      isPrivate,
      maxMembers,
      code,
      creator: req.user.id,
      members: [{ user: req.user.id, role: "admin" }],
    });

    // Update user analytics
    await UserAnalytics.findOneAndUpdate(
      { user: req.user.id },
      { $push: { roomsJoined: room._id } },
    );

    res.status(201).json({
      status: "success",
      data: { room },
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// Update room
exports.updateRoom = async (req, res) => {
  try {
    const { name, topic, description, isActive } = req.body;

    const room = await StudyRoom.findOneAndUpdate(
      { _id: req.params.id, creator: req.user.id },
      { name, topic, description, isActive },
      { new: true },
    );

    if (!room) {
      return res.status(404).json({
        status: "error",
        message: "Room not found or not authorized",
      });
    }

    res.status(200).json({
      status: "success",
      data: { room },
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// Delete room
exports.deleteRoom = async (req, res) => {
  try {
    const room = await StudyRoom.findOneAndDelete({
      _id: req.params.id,
      creator: req.user.id,
    });

    if (!room) {
      return res.status(404).json({
        status: "error",
        message: "Room not found or not authorized",
      });
    }

    // Delete all messages in the room
    await ChatMessage.deleteMany({ room: room._id });

    res.status(200).json({
      status: "success",
      message: "Room deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// Join room by code
exports.joinRoomByCode = async (req, res) => {
  try {
    const { code } = req.body;

    const room = await StudyRoom.findOne({ code: code.toUpperCase() });

    if (!room) {
      return res.status(404).json({
        status: "error",
        message: "Room not found",
      });
    }

    // Check if already a member
    const isMember = room.members.some(
      (m) => m.user.toString() === req.user.id,
    );

    if (isMember) {
      return res.status(400).json({
        status: "error",
        message: "Already a member of this room",
      });
    }

    // Check max members
    if (room.members.length >= room.maxMembers) {
      return res.status(400).json({
        status: "error",
        message: "Room is full",
      });
    }

    room.members.push({ user: req.user.id });
    await room.save();

    // Update analytics
    await UserAnalytics.findOneAndUpdate(
      { user: req.user.id },
      {
        $push: { roomsJoined: room._id },
        $inc: { peerInteractions: 1 },
      },
    );

    res.status(200).json({
      status: "success",
      data: { room },
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// Join room by ID
exports.joinRoom = async (req, res) => {
  try {
    const room = await StudyRoom.findById(req.params.id);

    if (!room) {
      return res.status(404).json({
        status: "error",
        message: "Room not found",
      });
    }

    const isMember = room.members.some(
      (m) => m.user.toString() === req.user.id,
    );

    if (isMember) {
      return res.status(400).json({
        status: "error",
        message: "Already a member",
      });
    }

    room.members.push({ user: req.user.id });
    await room.save();

    res.status(200).json({
      status: "success",
      data: { room },
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// Leave room
exports.leaveRoom = async (req, res) => {
  try {
    const { timeSpent } = req.body; // timeSpent in minutes
    const room = await StudyRoom.findById(req.params.id);

    if (!room) {
      return res.status(404).json({
        status: "error",
        message: "Room not found",
      });
    }

    room.members = room.members.filter(
      (m) => m.user.toString() !== req.user.id,
    );
    await room.save();

    // Log study time if provided
    if (timeSpent && timeSpent > 0) {
      const hours = timeSpent / 60;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      let analytics = await UserAnalytics.findOne({ user: req.user.id });
      if (!analytics) {
        analytics = await UserAnalytics.create({ user: req.user.id });
      }

      const todayEntry = analytics.studyTime.find(
        (entry) =>
          new Date(entry.date).setHours(0, 0, 0, 0) === today.getTime(),
      );

      if (todayEntry) {
        todayEntry.hours += hours;
      } else {
        analytics.studyTime.push({ date: today, hours });
      }

      // Log session
      analytics.studySessions.push({
        room: room._id,
        endTime: new Date(),
        startTime: new Date(Date.now() - timeSpent * 60 * 1000),
        durationMinutes: timeSpent,
      });

      analytics.totalStudyHours = (analytics.totalStudyHours || 0) + hours;
      await analytics.save();
    }

    res.status(200).json({
      status: "success",
      message: "Left room successfully",
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// Get room members
exports.getRoomMembers = async (req, res) => {
  try {
    const room = await StudyRoom.findById(req.params.id).populate(
      "members.user",
      "name avatar email",
    );

    if (!room) {
      return res.status(404).json({
        status: "error",
        message: "Room not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: { members: room.members },
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// Update shared notes
exports.updateSharedNotes = async (req, res) => {
  try {
    const { notes } = req.body;

    const room = await StudyRoom.findByIdAndUpdate(
      req.params.id,
      { sharedNotes: notes },
      { new: true },
    );

    res.status(200).json({
      status: "success",
      data: { sharedNotes: room.sharedNotes },
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// Get shared notes
exports.getSharedNotes = async (req, res) => {
  try {
    const room = await StudyRoom.findById(req.params.id).select("sharedNotes");

    res.status(200).json({
      status: "success",
      data: { sharedNotes: room.sharedNotes },
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// Get messages
exports.getMessages = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;

    const messages = await ChatMessage.find({ room: req.params.roomId })
      .populate("sender", "name avatar")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      status: "success",
      data: { messages: messages.reverse() },
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// Send message
exports.sendMessage = async (req, res) => {
  try {
    const { message, messageType } = req.body;

    const chatMessage = await ChatMessage.create({
      room: req.params.roomId,
      sender: req.user.id,
      message,
      messageType: messageType || "text",
    });

    await chatMessage.populate("sender", "name avatar");

    // Update peer interactions
    await UserAnalytics.findOneAndUpdate(
      { user: req.user.id },
      { $inc: { peerInteractions: 1 } },
    );

    res.status(201).json({
      status: "success",
      data: { message: chatMessage },
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// Delete message
exports.deleteMessage = async (req, res) => {
  try {
    await ChatMessage.findOneAndDelete({
      _id: req.params.messageId,
      sender: req.user.id,
    });

    res.status(200).json({
      status: "success",
      message: "Message deleted",
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};
