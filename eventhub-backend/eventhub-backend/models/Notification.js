// models/Notification.js
// ─────────────────────────────────────────────
//  Notification Schema
//  Covers: comment and like events on media.
//  Actor info is denormalized at write time so
//  reads are O(1) — no joins required.
// ─────────────────────────────────────────────

const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema(
  {
    // ── Who receives this notification ──────────
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,           // primary query axis — always filter by recipient
    },

    // ── Who triggered it ────────────────────────
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Denormalized — avoids a User join on every list fetch
    actorName: {
      type: String,
      required: true,
      trim: true,
    },

    // ── What happened ────────────────────────────
    type: {
      type: String,
      enum: {
        values: ["like", "comment"],
        message: "{VALUE} is not a valid notification type",
      },
      required: true,
    },

    // ── Which media it concerns ──────────────────
    mediaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Media",
      required: true,
    },

    // Denormalized — avoids a Media join on every list fetch
    mediaTitle: {
      type: String,
      default: "",
      trim: true,
    },

    // Thumbnail URL (Cloudinary) for display in the list
    mediaThumb: {
      type: String,
      default: "",
    },

    // ── Read state ───────────────────────────────
    read: {
      type: Boolean,
      default: false,
      index: true,           // used by unread-count query
    },
  },
  {
    timestamps: true,        // createdAt used for "X ago" display and sort
  }
);

// Compound index — most common query: unread notifications for a user
NotificationSchema.index({ recipientId: 1, read: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", NotificationSchema);
