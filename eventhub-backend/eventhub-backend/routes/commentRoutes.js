const express = require("express");
const router  = express.Router();

const {
  getCommentsByMedia,
  addComment,
  deleteComment,
} = require("../controllers/commentController");

// Reuse the same JWT auth middleware as every other route in this project
const { protect } = require("../middleware/authMiddleware");

// ────────────────────────────────────────────────────────────
// ROUTES
// ────────────────────────────────────────────────────────────

// ── Specific routes first — avoids shadowing by /:id below ──

// GET    /api/comments/media/:mediaId   → Fetch all comments for a media item
// All authenticated users
router.get("/media/:mediaId", protect, getCommentsByMedia);

// POST   /api/comments/media/:mediaId   → Add a comment to a media item
// All authenticated users
router.post("/media/:mediaId", protect, addComment);

// ── Dynamic :id route last ───────────────────────────────────

// DELETE /api/comments/:id              → Delete a comment
// Admin (any) | Author (own only) — ownership enforced inside controller
router.delete("/:id", protect, deleteComment);

module.exports = router;
