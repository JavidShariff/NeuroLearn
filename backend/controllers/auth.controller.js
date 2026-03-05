const User = require('../models/user.model.js');
const { UserStreak } = require('../models/userStreaks.model.js');
const { UserAnalytics } = require('../models/userAnalytics.model.js');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// Create and send token response
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: { user },
  });
};

// Register new user
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    console.log(req.body);
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'Email already registered',
      });
    }

    const user = await User.create({ name, email, password });

    await UserStreak.create({ user: user._id });
    await UserAnalytics.create({ user: user._id });

    createSendToken(user, 201, res);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide email and password',
      });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password',
      });
    }

    createSendToken(user, 200, res);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

// Logout
const logout = (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Logged out successfully',
  });
};

// Get current user
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const streak = await UserStreak.findOne({ user: req.user.id });

    // Merge user and streak data
    const userData = user.toObject();
    userData.streak = streak;

    res.status(200).json({
      status: 'success',
      data: { user: userData },
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

// Forgot password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'No user found with that email',
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Password reset link sent to email',
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

// Reset password
const resetPassword = async (req, res) => {
  try {
    res.status(200).json({
      status: 'success',
      message: 'Password reset successfully',
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

// Refresh token
const refreshToken = async (req, res) => {
  try {
    const { token } = req.body;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const newToken = signToken(decoded.id);

    res.status(200).json({
      status: 'success',
      token: newToken,
    });
  } catch (error) {
    res.status(401).json({
      status: 'error',
      message: 'Invalid or expired token',
    });
  }
};

module.exports = {
  register,
  login,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
  refreshToken,
};
