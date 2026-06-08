const Media = require("../models/Media");
const Event = require("../models/Event");
const { deleteFromCloudinary } = require("../utils/uploadUtils");

// ─────────────────────────────────────────────
// @desc    Upload media (single file)
// @route   POST /api/media/upload
// @access  Admin, Photographer, ClubMember
// ─────────────────────────────────────────────
const uploadMedia = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded. Please attach a file.",
      });
    }

    const { title, eventId, tags } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: "Title is required." });
    }

    if (!eventId) {
      return res.status(400).json({ success: false, message: "eventId is required." });
    }

    // Verify the referenced event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: "Associated event not found." });
    }

    // Determine fileType from mimetype
    const fileType = req.file.mimetype.startsWith("video/") ? "video" : "image";

    // Parse tags — accept comma-separated string or JSON array
    let parsedTags = [];
    if (tags) {
      parsedTags = Array.isArray(tags)
        ? tags
        : tags.split(",").map((t) => t.trim()).filter(Boolean);
    }

    const media = await Media.create({
      title,
      fileUrl: req.file.path,        // Cloudinary returns the URL in req.file.path
      fileType,
      uploadedBy: req.user._id,
      eventId,
      tags: parsedTags,
    });

    const populated = await media.populate([
      { path: "uploadedBy", select: "name email role" },
      { path: "eventId", select: "title category" },
    ]);

    return res.status(201).json({
      success: true,
      message: "Media uploaded successfully",
      data: populated,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: "Validation failed", errors: messages });
    }
    if (error.name === "CastError") {
      return res.status(400).json({ success: false, message: "Invalid eventId format." });
    }
    console.error("uploadMedia error:", error);
    return res.status(500).json({ success: false, message: "Server error during upload." });
  }
};

// ─────────────────────────────────────────────
// @desc    Get all media (with optional filters)
// @route   GET /api/media
// @access  All authenticated users
// ─────────────────────────────────────────────
const getAllMedia = async (req, res) => {
  try {
    const {
      fileType,
      tag,
      uploadedBy,
      search,
      page = 1,
      limit = 12,
      sortBy = "createdAt",
      order = "desc",
    } = req.query;

    const filter = {};
    if (fileType) filter.fileType = fileType;
    if (tag) filter.tags = { $in: [tag] };
    if (uploadedBy) filter.uploadedBy = uploadedBy;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { tags: { $regex: search, $options: "i" } },
      ];
    }

    const pageNum = Math.max(parseInt(page), 1);
    const limitNum = Math.min(parseInt(limit), 100);
    const skip = (pageNum - 1) * limitNum;
    const sortOrder = order === "asc" ? 1 : -1;

    const [mediaList, total] = await Promise.all([
      Media.find(filter)
        .populate("uploadedBy", "name email role")
        .populate("eventId", "title category startDate")
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limitNum),
      Media.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      message: "Media fetched successfully",
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      count: mediaList.length,
      data: mediaList,
    });
  } catch (error) {
    console.error("getAllMedia error:", error);
    return res.status(500).json({ success: false, message: "Server error while fetching media." });
  }
};

// ─────────────────────────────────────────────
// @desc    Get all media for a specific event
// @route   GET /api/media/event/:eventId
// @access  All authenticated users
// ─────────────────────────────────────────────
const getMediaByEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { fileType, page = 1, limit = 12 } = req.query;

    // Verify event exists
    const event = await Event.findById(eventId).select("title category");
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found." });
    }

    const filter = { eventId };
    if (fileType) filter.fileType = fileType;

    const pageNum = Math.max(parseInt(page), 1);
    const limitNum = Math.min(parseInt(limit), 100);
    const skip = (pageNum - 1) * limitNum;

    const [mediaList, total] = await Promise.all([
      Media.find(filter)
        .populate("uploadedBy", "name email role")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Media.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      message: `Media for event '${event.title}' fetched successfully`,
      event,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      count: mediaList.length,
      data: mediaList,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ success: false, message: "Invalid event ID format." });
    }
    console.error("getMediaByEvent error:", error);
    return res.status(500).json({ success: false, message: "Server error while fetching media." });
  }
};

// ─────────────────────────────────────────────
// @desc    Delete media
// @route   DELETE /api/media/:id
// @access  Admin (any) | Photographer & ClubMember (own only)
// ─────────────────────────────────────────────
const deleteMedia = async (req, res) => {
  try {
    const media = await Media.findById(req.params.id);

    if (!media) {
      return res.status(404).json({ success: false, message: "Media not found." });
    }

    // Non-admin users can only delete their own uploads
    if (
      req.user.role !== "Admin" &&
      media.uploadedBy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this media.",
      });
    }

    // Remove file from Cloudinary
    const resourceType = media.fileType === "video" ? "video" : "image";
    await deleteFromCloudinary(media.fileUrl, resourceType);

    await media.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Media deleted successfully.",
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ success: false, message: "Invalid media ID format." });
    }
    console.error("deleteMedia error:", error);
    return res.status(500).json({ success: false, message: "Server error while deleting media." });
  }
};

// ─────────────────────────────────────────────
// @desc    Like / Unlike media (toggle)
// @route   PUT /api/media/:id/like
// @access  All authenticated users
// ─────────────────────────────────────────────
const likeMedia = async (req, res) => {
  try {
    const media = await Media.findById(req.params.id);

    if (!media) {
      return res.status(404).json({ success: false, message: "Media not found." });
    }

    const userId = req.user._id.toString();
    const alreadyLiked = media.likes.likedBy.some((id) => id.toString() === userId);

    if (alreadyLiked) {
      // Unlike
      media.likes.likedBy = media.likes.likedBy.filter((id) => id.toString() !== userId);
      media.likes.count = Math.max(media.likes.count - 1, 0);
    } else {
      // Like
      media.likes.likedBy.push(req.user._id);
      media.likes.count += 1;
    }

    await media.save();

    return res.status(200).json({
      success: true,
      message: alreadyLiked ? "Media unliked." : "Media liked.",
      likes: media.likes.count,
      liked: !alreadyLiked,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ success: false, message: "Invalid media ID format." });
    }
    console.error("likeMedia error:", error);
    return res.status(500).json({ success: false, message: "Server error while liking media." });
  }
};

// ─────────────────────────────────────────────
// @desc    Track a download & return fileUrl
// @route   GET /api/media/:id/download
// @access  All authenticated users
// ─────────────────────────────────────────────
const downloadMedia = async (req, res) => {
  try {
    const media = await Media.findById(req.params.id);

    if (!media) {
      return res.status(404).json({ success: false, message: "Media not found." });
    }

    // Increment download counter atomically
    await Media.findByIdAndUpdate(req.params.id, { $inc: { downloads: 1 } });

    // Return the Cloudinary URL — client handles the actual download
    return res.status(200).json({
      success: true,
      message: "Download URL ready.",
      fileUrl: media.fileUrl,
      fileName: `${media.title.replace(/\s+/g, "_")}.${media.fileType === "video" ? "mp4" : "jpg"}`,
      downloads: media.downloads + 1,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ success: false, message: "Invalid media ID format." });
    }
    console.error("downloadMedia error:", error);
    return res.status(500).json({ success: false, message: "Server error during download." });
  }
};
// ─────────────────────────────────────────────
// @desc    Save / Unsave media (toggle)
// @route   PUT /api/media/:id/save
// @access  All authenticated users
// ─────────────────────────────────────────────
const saveMedia = async (req, res) => {
  try {
    const media = await Media.findById(req.params.id);
    if (!media) {
      return res.status(404).json({ success: false, message: "Media not found." });
    }

    const userId = req.user._id.toString();
    const alreadySaved = media.savedBy.some((id) => id.toString() === userId);

    if (alreadySaved) {
      media.savedBy = media.savedBy.filter((id) => id.toString() !== userId);
    } else {
      media.savedBy.push(req.user._id);
    }

    await media.save();

    return res.status(200).json({
      success: true,
      message: alreadySaved ? "Removed from favorites." : "Added to favorites.",
      saved: !alreadySaved,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ success: false, message: "Invalid media ID format." });
    }
    console.error("saveMedia error:", error);
    return res.status(500).json({ success: false, message: "Server error while saving media." });
  }
};

// ─────────────────────────────────────────────
// @desc    Get all media saved by current user
// @route   GET /api/media/saved
// @access  All authenticated users
// ─────────────────────────────────────────────
const getSavedMedia = async (req, res) => {
  try {
    const mediaList = await Media.find({ savedBy: req.user._id })
      .populate("uploadedBy", "name email role")
      .populate("eventId", "title category startDate")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      total: mediaList.length,
      data: mediaList,
    });
  } catch (error) {
    console.error("getSavedMedia error:", error);
    return res.status(500).json({ success: false, message: "Server error while fetching saved media." });
  }
};
module.exports = {
  uploadMedia,
  getAllMedia,
  getMediaByEvent,
  deleteMedia,
  likeMedia,
  downloadMedia,
  saveMedia,       
  getSavedMedia,   
};
