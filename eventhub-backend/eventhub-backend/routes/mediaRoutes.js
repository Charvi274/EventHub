const express = require("express");
const router = express.Router();

const {
  uploadMedia,
  getAllMedia,
  getMediaByEvent,
  deleteMedia,
  likeMedia,
  downloadMedia,
  saveMedia,       
  getSavedMedia,   
} = require("../controllers/mediaController");

// ─────────────────────────────────────────────
// Existing JWT auth middleware
// Adjust path/export name to match your project
// ─────────────────────────────────────────────
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

// ─────────────────────────────────────────────
// Multer upload middleware (Cloudinary)
// ─────────────────────────────────────────────
const { upload } = require("../utils/uploadUtils");

// ─────────────────────────────────────────────
// Multer error handler — catches file-size &
// file-type rejections from multer/Cloudinary
// ─────────────────────────────────────────────
const handleUploadError = (err, req, res, next) => {
  if (err) {
    console.error("UPLOAD ERROR:", err);
    return res.status(400).json({
      success: false,
      message: err.message || "File upload error.",
    });
  }
  next();
};

// ────────────────────────────────────────────────────────────
// ROUTES
// ────────────────────────────────────────────────────────────

// POST   /api/media/upload           → Upload media
// Roles: Admin, Photographer, ClubMember
router.post(
  "/upload",
  protect,
  authorizeRoles("Admin", "Photographer", "ClubMember"),
  upload.single("file"),        // field name in form-data must be "file"
  handleUploadError,
  uploadMedia
);

// GET    /api/media                  → Get all media
// GET    /api/media/event/:eventId   → Get media by event
// All authenticated roles
router.get("/", protect, getAllMedia);
router.get("/event/:eventId", protect, getMediaByEvent);

// PUT    /api/media/:id/like         → Like / Unlike toggle
// All authenticated roles
router.put("/:id/like", protect, likeMedia);

// GET    /api/media/:id/download     → Track download & return URL
// All authenticated roles
router.get("/:id/download", protect, downloadMedia);

// DELETE /api/media/:id              → Delete media
// Admin (any) | Photographer & ClubMember (own only)
router.get("/saved", protect, getSavedMedia);
router.delete(
  "/:id",
  protect,
  authorizeRoles("Admin", "Photographer", "ClubMember"),
  deleteMedia
);

router.put("/:id/save", protect, saveMedia);
module.exports = router;
