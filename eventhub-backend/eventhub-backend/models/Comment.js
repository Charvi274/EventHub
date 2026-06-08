const mongoose = require("mongoose");

// ─────────────────────────────────────────────
//  Comment Schema
//  One comment belongs to one Media document.
//  Author is a ref to User — populated on read
//  so the client always gets name + role.
// ─────────────────────────────────────────────

const commentSchema = new mongoose.Schema(
  {
    mediaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Media",
      required: [true, "mediaId is required"],
      index: true,          // fast lookup by media item
    },

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "author is required"],
      index: true,          // fast lookup of a user's own comments
    },

    text: {
      type: String,
      required: [true, "Comment text is required"],
      trim: true,
      minlength: [1,   "Comment cannot be empty"],
      maxlength: [500, "Comment cannot exceed 500 characters"],
    },
  },
  {
    timestamps: true,   // adds createdAt + updatedAt automatically
  }
);

// Compound index — fetch all comments for a media item newest-first
commentSchema.index({ mediaId: 1, createdAt: -1 });

const Comment = mongoose.model("Comment", commentSchema);

module.exports = Comment;
