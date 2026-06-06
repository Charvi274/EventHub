const express = require("express");
const router = express.Router();

const {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
} = require("../controllers/eventController");

// ─────────────────────────────────────────────
// Import your existing JWT auth middleware.
// Adjust the path if your file is named differently
// (e.g., authMiddleware.js, auth.js, protect.js)
// ─────────────────────────────────────────────
// const { protect } = require("../middleware/authMiddleware");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
// const { authorizeRoles } = require("../middleware/roleMiddleware");

// ─────────────────────────────────────────────
// Public-facing routes (still require JWT login)
// ─────────────────────────────────────────────

// GET /api/events        → All roles can view
// GET /api/events/:id    → All roles can view
router.get("/", protect, getAllEvents);
router.get("/:id", protect, getEventById);

// ─────────────────────────────────────────────
// Protected routes — Admin & ClubMember only
// ─────────────────────────────────────────────

// POST   /api/events        → Create
// PUT    /api/events/:id    → Update
// DELETE /api/events/:id    → Delete
router.post("/", protect, authorizeRoles("Admin", "ClubMember"), createEvent);
router.put("/:id", protect, authorizeRoles("Admin", "ClubMember"), updateEvent);
router.delete("/:id", protect, authorizeRoles("Admin", "ClubMember"), deleteEvent);

module.exports = router;
