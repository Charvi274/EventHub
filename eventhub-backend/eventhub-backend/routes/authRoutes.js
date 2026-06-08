// routes/authRoutes.js
// ─────────────────────────────────────────────
//  Authentication Routes
// ─────────────────────────────────────────────

const express = require("express");
const router = express.Router();

const { signup, login, getMe, getUserCount } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

// Public routes
router.post("/signup", signup);
router.post("/login", login);

// Protected route (requires valid JWT)
router.get("/me", protect, getMe);
router.get("/users/count", protect, getUserCount);
module.exports = router;
