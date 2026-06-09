const User = require("../models/User");
const generateToken = require("../utils/generateToken");

const signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ success: false, message: "Please provide name, email, and password." });
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser)
      return res.status(409).json({ success: false, message: "An account with this email already exists." });
    const allowedSignupRoles = ["Photographer", "Club Member", "Viewer", "Admin"];
    const assignedRole = role && allowedSignupRoles.includes(role) ? role : "Viewer";
    const user = await User.create({ name, email, password, role: assignedRole });
    const token = generateToken(user._id);
    res.status(201).json({ success: true, message: "Account created successfully.", token, user: user.toSafeObject() });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(". ") });
    }
    console.error("Signup Error:", error);
    res.status(500).json({ success: false, message: "Server error during signup. Please try again." });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: "Please provide email and password." });
    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
    if (!user)
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    if (!user.isActive)
      return res.status(403).json({ success: false, message: "Your account has been deactivated. Contact support." });
    const isMatch = await user.comparePassword(password);
    if (!isMatch)
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });
    const token = generateToken(user._id);
    res.status(200).json({ success: true, message: "Logged in successfully.", token, user: user.toSafeObject() });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ success: false, message: "Server error during login. Please try again." });
  }
};

const getMe = async (req, res) => {
  try {
    res.status(200).json({ success: true, user: req.user.toSafeObject() });
  } catch (error) {
    console.error("GetMe Error:", error);
    res.status(500).json({ success: false, message: "Server error. Please try again." });
  }
};

const getUserCount = async (req, res) => {
  try {
    const count = await User.countDocuments({ isActive: true });
    return res.status(200).json({ success: true, count });
  } catch (error) {
    console.error("getUserCount error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// PUT /api/auth/change-password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword)
      return res.status(400).json({ success: false, message: "Please provide your current password and a new password." });
    if (newPassword.length < 6)
      return res.status(400).json({ success: false, message: "New password must be at least 6 characters." });
    const user = await User.findById(req.user._id).select("+password");
    if (!user)
      return res.status(404).json({ success: false, message: "User not found." });
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch)
      return res.status(401).json({ success: false, message: "Current password is incorrect." });
    user.password = newPassword;
    await user.save(); // pre-save hook hashes it
    return res.status(200).json({ success: true, message: "Password updated successfully." });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(". ") });
    }
    console.error("changePassword error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

const getWatermarkSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("watermarkSettings");
    if (!user) return res.status(404).json({ success: false, message: "User not found." });
    return res.status(200).json({ success: true, watermarkSettings: user.watermarkSettings });
  } catch (error) {
    console.error("getWatermarkSettings error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

const updateWatermarkSettings = async (req, res) => {
  try {
    const { enabled, clubName, eventName, includeRole, includeDate, includeIcon, position, opacity, applyAll } = req.body;
    const update = {};
    if (enabled     !== undefined) update["watermarkSettings.enabled"]     = enabled;
    if (clubName    !== undefined) update["watermarkSettings.clubName"]    = clubName;
    if (eventName   !== undefined) update["watermarkSettings.eventName"]   = eventName;
    if (includeRole !== undefined) update["watermarkSettings.includeRole"] = includeRole;
    if (includeDate !== undefined) update["watermarkSettings.includeDate"] = includeDate;
    if (includeIcon !== undefined) update["watermarkSettings.includeIcon"] = includeIcon;
    if (position    !== undefined) update["watermarkSettings.position"]    = position;
    if (opacity     !== undefined) update["watermarkSettings.opacity"]     = opacity;
    if (applyAll    !== undefined) update["watermarkSettings.applyAll"]    = applyAll;
    const user = await User.findByIdAndUpdate(req.user._id, { $set: update }, { new: true, runValidators: true, select: "watermarkSettings" });
    if (!user) return res.status(404).json({ success: false, message: "User not found." });
    return res.status(200).json({ success: true, message: "Watermark settings saved.", watermarkSettings: user.watermarkSettings });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(". ") });
    }
    console.error("updateWatermarkSettings error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};
const updateProfile = async (req, res) => {
  try {
    const { name, bio } = req.body;
    if (!name || name.trim().length < 2)
      return res.status(400).json({ success: false, message: "Name must be at least 2 characters." });
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { name: name.trim(), bio: bio?.trim() ?? "" } },
      { new: true, runValidators: true }
    );
    // Update stored user in any active session (client handles this)
    return res.status(200).json({ success: true, message: "Profile updated.", user: user.toSafeObject() });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(". ") });
    }
    console.error("updateProfile error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};
module.exports = { signup, login, getMe, getUserCount, changePassword, getWatermarkSettings, updateWatermarkSettings, updateProfile };