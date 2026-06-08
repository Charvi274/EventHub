// controllers/authController.js
// ─────────────────────────────────────────────
//  Signup, Login, Get Current User
// ─────────────────────────────────────────────

const User = require("../models/User");
const generateToken = require("../utils/generateToken");

// ─────────────────────────────────────────────
//  @route   POST /api/auth/signup
//  @desc    Register a new user
//  @access  Public
// ─────────────────────────────────────────────
const signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // 1. Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, email, and password.",
      });
    }

    // 2. Check if email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    // 3. Validate role (only allow specific roles on signup; Admin must be set manually)
    const allowedSignupRoles = ["Photographer", "Club Member", "Viewer", "Admin"];
    const assignedRole =
      role && allowedSignupRoles.includes(role) ? role : "Viewer";

    // 4. Create user (password hashing happens in pre-save hook in User model)
    const user = await User.create({
      name,
      email,
      password,
      role: assignedRole,
    });

    // 5. Generate JWT
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: "Account created successfully.",
      token,
      user: user.toSafeObject(),
    });
  } catch (error) {
    // Handle Mongoose validation errors
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({
        success: false,
        message: messages.join(". "),
      });
    }

    console.error("Signup Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during signup. Please try again.",
    });
  }
};

// ─────────────────────────────────────────────
//  @route   POST /api/auth/login
//  @desc    Login user & return JWT
//  @access  Public
// ─────────────────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password.",
      });
    }

    // 2. Find user by email — explicitly select password (hidden by default)
    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+password"
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // 3. Check if account is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account has been deactivated. Contact support.",
      });
    }

    // 4. Compare entered password with stored hash
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // 5. Update lastLogin timestamp
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    // 6. Generate JWT
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: "Logged in successfully.",
      token,
      user: user.toSafeObject(),
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during login. Please try again.",
    });
  }
};

// ─────────────────────────────────────────────
//  @route   GET /api/auth/me
//  @desc    Get currently logged-in user's profile
//  @access  Private (requires valid JWT)
// ─────────────────────────────────────────────
const getMe = async (req, res) => {
  try {
    // req.user is set by the protect middleware
    res.status(200).json({
      success: true,
      user: req.user.toSafeObject(),
    });
  } catch (error) {
    console.error("GetMe Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again.",
    });
  }
};
// @route   GET /api/users/count
// @access  Private
const getUserCount = async (req, res) => {
  try {
    const count = await User.countDocuments({ isActive: true });
    return res.status(200).json({ success: true, count });
  } catch (error) {
    console.error("getUserCount error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};
module.exports = { signup, login, getMe, getUserCount };
