const express = require("express");
const router = express.Router();

const {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  uploadEventCover,
} = require("../controllers/eventController");

// upload is the multer-storage-cloudinary instance already used by mediaRoutes.js
// — confirmed from mediaController.js: const { deleteFromCloudinary } = require("../utils/uploadUtils")
//   and your note that mediaRoutes.js does: const { upload } = require("../utils/uploadUtils")
const { upload } = require("../utils/uploadUtils");

const { protect, authorizeRoles } = require("../middleware/authMiddleware");

// ─────────────────────────────────────────────
// Cover-image upload
// Declared BEFORE /:id so Express does not treat
// the literal string "cover-upload" as an :id value.
//
// POST /api/events/cover-upload
// Access: Admin, ClubMember  (same roles that can create events)
// ─────────────────────────────────────────────
router.post(
  "/cover-upload",
  protect,
  authorizeRoles("Admin", "ClubMember"),
  upload.single("file"), // field name "file" — matches FormData.append("file", ...) in CreateEvent.tsx
  uploadEventCover
);

// ─────────────────────────────────────────────
// Public-facing routes (still require JWT login)
// ─────────────────────────────────────────────
router.get("/", protect, getAllEvents);
router.get("/:id", protect, getEventById);

// ─────────────────────────────────────────────
// Protected routes — Admin & ClubMember only
// ─────────────────────────────────────────────
router.post("/", protect, authorizeRoles("Admin", "ClubMember"), createEvent);
router.put("/:id", protect, authorizeRoles("Admin", "ClubMember"), updateEvent);
router.delete("/:id", protect, authorizeRoles("Admin", "ClubMember"), deleteEvent);

module.exports = router;