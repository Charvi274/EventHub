// controllers/notificationController.js
// ─────────────────────────────────────────────
//  Notification endpoints
//  All routes require the `protect` middleware —
//  req.user is guaranteed to be populated.
// ─────────────────────────────────────────────

const Notification = require("../models/Notification");

// ─────────────────────────────────────────────
// @desc    Get all notifications for current user
// @route   GET /api/notifications
// @access  All authenticated users
// ─────────────────────────────────────────────
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipientId: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      total: notifications.length,
      data: notifications,
    });
  } catch (error) {
    console.error("getNotifications error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching notifications.",
    });
  }
};

// ─────────────────────────────────────────────
// @desc    Get unread notification count
// @route   GET /api/notifications/unread-count
// @access  All authenticated users
// ─────────────────────────────────────────────
const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      recipientId: req.user._id,
      read: false,
    });

    return res.status(200).json({
      success: true,
      count,
    });
  } catch (error) {
    console.error("getUnreadCount error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching unread count.",
    });
  }
};

// ─────────────────────────────────────────────
// @desc    Mark all notifications as read
// @route   PATCH /api/notifications/read-all
// @access  All authenticated users
// ─────────────────────────────────────────────
const markAllRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipientId: req.user._id, read: false },
      { $set: { read: true } }
    );

    return res.status(200).json({
      success: true,
      message: "All notifications marked as read.",
    });
  } catch (error) {
    console.error("markAllRead error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while marking notifications as read.",
    });
  }
};

// ─────────────────────────────────────────────
// @desc    Mark a single notification as read
// @route   PATCH /api/notifications/:id/read
// @access  All authenticated users (own only)
// ─────────────────────────────────────────────
const markOneRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found.",
      });
    }

    // Users may only mark their own notifications
    if (notification.recipientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this notification.",
      });
    }

    notification.read = true;
    await notification.save();

    return res.status(200).json({
      success: true,
      message: "Notification marked as read.",
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid notification ID format.",
      });
    }
    console.error("markOneRead error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating notification.",
    });
  }
};

module.exports = {
  getNotifications,
  getUnreadCount,
  markAllRead,
  markOneRead,
};
