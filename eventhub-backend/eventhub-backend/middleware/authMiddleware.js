// middleware/authMiddleware.js
// ─────────────────────────────────────────────
//  Protects routes by verifying JWT tokens
// ─────────────────────────────────────────────

const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ── Verify JWT & attach user to request ───────
const protect = async (req, res, next) => {
  let token;

  // 1. Check Authorization header for Bearer token
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Access denied. No token provided.",
    });
  }

  try {
    // 2. Verify token signature and expiry
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Fetch user from DB (excludes password due to `select: false`)
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Token is valid but user no longer exists.",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account has been deactivated. Contact support.",
      });
    }

    // 4. Attach user to request object for downstream use
    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token has expired. Please log in again.",
      });
    }
    return res.status(401).json({
      success: false,
      message: "Invalid token. Please log in again.",
    });
  }
};

// ── Role-based access control ─────────────────
//  Usage: authorizeRoles("Admin", "Photographer")
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role(s): ${roles.join(", ")}. Your role: ${req.user.role}`,
      });
    }
    next();
  };
};

module.exports = { protect, authorizeRoles };
