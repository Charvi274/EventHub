const Comment = require("../models/Comment");
const Media   = require("../models/Media");

// ─────────────────────────────────────────────
// @desc    Get all comments for a media item
// @route   GET /api/comments/media/:mediaId
// @access  All authenticated users
// ─────────────────────────────────────────────
const getCommentsByMedia = async (req, res) => {
  try {
    const { mediaId } = req.params;

    // Verify the parent media item exists
    const media = await Media.findById(mediaId).select("_id");
    if (!media) {
      return res.status(404).json({
        success: false,
        message: "Media not found.",
      });
    }

    const comments = await Comment.find({ mediaId })
      .populate("author", "name role avatar")   // only safe, public fields
      .sort({ createdAt: -1 })                  // newest first — mirrors media sort
      .lean();                                  // plain JS objects, faster for reads

    return res.status(200).json({
      success: true,
      message: "Comments fetched successfully.",
      total: comments.length,
      data: comments,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid media ID format.",
      });
    }
    console.error("getCommentsByMedia error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching comments.",
    });
  }
};

// ─────────────────────────────────────────────
// @desc    Add a comment to a media item
// @route   POST /api/comments/media/:mediaId
// @access  All authenticated users
// ─────────────────────────────────────────────
const addComment = async (req, res) => {
  try {
    const { mediaId } = req.params;
    const { text } = req.body;

    // ── Input validation ─────────────────────
    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: "Comment text is required.",
      });
    }

    if (text.trim().length > 500) {
      return res.status(400).json({
        success: false,
        message: "Comment cannot exceed 500 characters.",
      });
    }

    // ── Verify parent media exists ───────────
    const media = await Media.findById(mediaId).select("_id");
    if (!media) {
      return res.status(404).json({
        success: false,
        message: "Media not found.",
      });
    }

    // ── Create & populate in one round-trip ──
    const comment = await Comment.create({
      mediaId,
      author: req.user._id,
      text: text.trim(),
    });

    // Populate author so the frontend gets name + role immediately —
    // no extra fetch required after posting.
    const populated = await comment.populate("author", "name role avatar");

    return res.status(201).json({
      success: true,
      message: "Comment added successfully.",
      data: populated,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({
        success: false,
        message: "Validation failed.",
        errors: messages,
      });
    }
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid media ID format.",
      });
    }
    console.error("addComment error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while adding comment.",
    });
  }
};

// ─────────────────────────────────────────────
// @desc    Delete a comment
// @route   DELETE /api/comments/:id
// @access  Admin (any) | Author (own only)
//          Mirrors the same ownership pattern
//          used by deleteMedia in mediaController.
// ─────────────────────────────────────────────
const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found.",
      });
    }

    // Non-admin users may only delete their own comments
    if (
      req.user.role !== "Admin" &&
      comment.author.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this comment.",
      });
    }

    await comment.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Comment deleted successfully.",
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid comment ID format.",
      });
    }
    console.error("deleteComment error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while deleting comment.",
    });
  }
};

module.exports = {
  getCommentsByMedia,
  addComment,
  deleteComment,
};
