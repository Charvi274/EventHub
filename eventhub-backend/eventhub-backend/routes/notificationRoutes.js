// routes/notificationRoutes.js
// ─────────────────────────────────────────────
//  Notification routes
//  All routes protected by the same JWT middleware
//  used throughout the rest of the project.
// ─────────────────────────────────────────────

const express = require("express");
const router  = express.Router();

const {
  getNotifications,
  getUnreadCount,
  markAllRead,
  markOneRead,
} = require("../controllers/notificationController");

const { protect } = require("../middleware/authMiddleware");

// ── Specific named routes first ──────────────────────────────
// (must come before /:id to avoid shadowing)

// GET    /api/notifications               → All notifications for current user
router.get("/", protect, getNotifications);

// GET    /api/notifications/unread-count  → Count of unread notifications
router.get("/unread-count", protect, getUnreadCount);

// PATCH  /api/notifications/read-all      → Mark all as read
router.patch("/read-all", protect, markAllRead);

// ── Dynamic :id route last ───────────────────────────────────

// PATCH  /api/notifications/:id/read      → Mark one as read
router.patch("/:id/read", protect, markOneRead);

module.exports = router;
