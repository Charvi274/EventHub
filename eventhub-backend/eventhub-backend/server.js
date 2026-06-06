// server.js
// ─────────────────────────────────────────────
//  EventHub – Express Server Entry Point
// ─────────────────────────────────────────────

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const eventRoutes = require("./routes/eventRoutes");
const mediaRoutes = require("./routes/mediaRoutes");
// Load environment variables FIRST (before anything else)
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// ─────────────────────────────────────────────
//  Global Middleware
// ─────────────────────────────────────────────

// CORS – allow your React frontend to talk to this backend
app.use(
  cors({
    origin: [
      "http://localhost:3000", // React default port
      "http://localhost:5173", // Vite default port
    ],
    credentials: true,
  })
);

// Parse incoming JSON request bodies
app.use(express.json());

// Parse URL-encoded form data
app.use(express.urlencoded({ extended: true }));

// ─────────────────────────────────────────────
//  Routes
// ─────────────────────────────────────────────

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/events", eventRoutes);
app.use("/api/media", mediaRoutes);
// Root health check
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "EventHub API is running ✅",
    version: "1.0.0",
  });
});

// 404 handler – catches any unmatched routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found.`,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err.stack);
  res.status(500).json({
    success: false,
    message: "Internal server error.",
  });
});

// ─────────────────────────────────────────────
//  Start Server
// ─────────────────────────────────────────────

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 EventHub server running on http://localhost:${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || "development"}`);
});
