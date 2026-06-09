const express = require("express");
const router = express.Router();
const {
  signup,
  login,
  getMe,
  getUserCount,
  changePassword,
  getWatermarkSettings,
  updateWatermarkSettings,
  updateProfile
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

router.post("/signup", signup);
router.post("/login",  login);
router.get("/me", protect, getMe);
router.put("/update-profile", protect, updateProfile);
router.get("/users/count", protect, getUserCount);
router.put("/change-password",     protect, changePassword);
router.get("/watermark-settings",  protect, getWatermarkSettings);
router.put("/watermark-settings",  protect, updateWatermarkSettings);

module.exports = router;