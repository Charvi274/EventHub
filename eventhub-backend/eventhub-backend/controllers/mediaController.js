// controllers/mediaController.js
const Media = require("../models/Media");
const User  = require("../models/User");
const Event = require("../models/Event");
const { deleteFromCloudinary } = require("../utils/uploadUtils");
const { createNotification }   = require("../utils/notificationUtils");

// ─────────────────────────────────────────────
// Cloudinary watermark URL builder
//
// Takes a raw Cloudinary delivery URL and injects
// a text-overlay transformation before the public ID
// segment so the original asset is never modified.
//
// Cloudinary URL structure:
//   https://res.cloudinary.com/<cloud>/image/upload/<public_id>
//                                                  ↑ inject here
//
// Transformation reference used:
//   l_text:<font>_<size>:<encoded_text>   — text layer
//   co_white                               — white colour
//   o_<0-100>                              — opacity
//   g_<gravity>                            — anchor position
//   x_16,y_16                              — pixel offset from edge
//   fl_layer_apply                         — commit the layer
//
// For "center" position we tile the watermark with a 3×3
// grid via Cloudinary's "tiled" flag and rotate 335 degrees
// (i.e. -25°, matching the UI preview).
// ─────────────────────────────────────────────
function buildWatermarkUrl(fileUrl, settings, userRole) {
  // Guard: only process Cloudinary-hosted URLs
  if (!fileUrl || !fileUrl.includes("res.cloudinary.com")) {
    return fileUrl;
  }

  // ── 1. Build the watermark text ─────────────────────────────────────────
  // FIX: Cloudinary text overlays accept ASCII only.
  // - Strip all emoji and non-ASCII characters before encoding.
  // - Use a plain ASCII bullet " - " instead of the Unicode middle-dot " · ".
  const sanitize = (str) =>
    str
      // Remove emoji / non-BMP characters (Unicode > U+FFFF)
      .replace(/[\u{1F000}-\u{1FFFF}]/gu, "")
      // Remove any remaining non-ASCII characters
      .replace(/[^\x20-\x7E]/g, "")
      .trim();

  const parts = [];
  // FIX: includeIcon previously pushed the 📸 emoji — replaced with plain text "Photo"
  if (settings.includeIcon)                parts.push("Photo");
  if (settings.clubName)                   parts.push(sanitize(settings.clubName));
  if (settings.eventName)                  parts.push(sanitize(settings.eventName));
  if (settings.includeRole && userRole)    parts.push(sanitize(userRole));
  if (settings.includeDate)                parts.push(String(new Date().getFullYear()));

  // Use ASCII separator " - " (the Unicode middle-dot is not ASCII-safe)
  const rawText = parts.filter(Boolean).join(" - ");
  if (!rawText.trim()) return fileUrl; // nothing to stamp

  // Cloudinary requires the text to be URL-encoded.
  // Commas and slashes inside the text layer value must be
  // double-percent-encoded so they are not mistaken for
  // Cloudinary transformation separators.
  const encodedText = encodeURIComponent(rawText)
    .replace(/%2C/g, "%252C") // re-encode commas
    .replace(/%2F/g, "%252F"); // re-encode slashes

  // ── 2. Map position → Cloudinary gravity ────────────────────────────────
  const gravityMap = {
    "bottom-right": "south_east",
    "bottom-left":  "south_west",
    "top-right":    "north_east",
    "center":       "center",
  };
  const gravity = gravityMap[settings.position] || "south_east";

  // ── 3. Opacity (Cloudinary accepts 0-100) ───────────────────────────────
  const opacity = Math.round(settings.opacity); // already a number 15-80

  // ── 4. Build the transformation string ──────────────────────────────────
  //
  // Font: Arial, size 16 — readable at typical photo resolutions.
  //
  // Each transformation "step" is separated by a slash in the URL.
  // A chained (grouped) set of parameters within one layer is separated
  // by commas and must all appear BEFORE fl_layer_apply.
  //
  let transformation;

  if (settings.position === "center") {
    // FIX: fl_tiled and a_ (rotation) are layer parameters — they must come
    // BEFORE fl_layer_apply, not after it. Placing them after fl_layer_apply
    // was the direct cause of Cloudinary returning HTTP 400.
    transformation = [
      `l_text:Arial_16:${encodedText}`,
      `co_white`,
      `o_${opacity}`,
      `g_center`,
      `a_335`,         // -25° rotation (360 - 25 = 335) — layer param, before fl_layer_apply
      `fl_tiled`,      // tile across image — layer param, before fl_layer_apply
      `fl_layer_apply`,
    ].join(",");
  } else {
    // Single-position watermark.
    // FIX: Removed pa_6x12, bo_0px_solid_black, r_6 — these are not valid
    // Cloudinary text-layer parameters and caused the request to be rejected.
    // A simple semi-transparent text overlay is used instead.
    transformation = [
      `l_text:Arial_16:${encodedText}`,
      `co_white`,
      `o_${opacity}`,
      `g_${gravity}`,
      `x_16`,
      `y_16`,
      `fl_layer_apply`,
    ].join(",");
  }

  // ── 5. Inject transformation into the URL ───────────────────────────────
  // Split at "/upload/" and insert the transformation string
  // between the upload token and the public ID.
  //
  // Before: https://res.cloudinary.com/demo/image/upload/sample.jpg
  // After:  https://res.cloudinary.com/demo/image/upload/<transform>/sample.jpg
  //
  const uploadMarker = "/upload/";
  const splitIdx = fileUrl.indexOf(uploadMarker);

  if (splitIdx === -1) {
    // Unexpected URL format — return original rather than corrupt the link
    return fileUrl;
  }

  const base       = fileUrl.slice(0, splitIdx + uploadMarker.length);
  const publicPart = fileUrl.slice(splitIdx + uploadMarker.length);

  return `${base}${transformation}/${publicPart}`;
}

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
    if (fileType)   filter.fileType   = fileType;
    if (tag)        filter.tags       = { $in: [tag] };
    if (uploadedBy) filter.uploadedBy = uploadedBy;
    if (search)     filter.title      = { $regex: search, $options: "i" };

    const pageNum  = Math.max(parseInt(page),  1);
    const limitNum = Math.min(parseInt(limit), 50);
    const skip     = (pageNum - 1) * limitNum;
    const sortOrder = order === "asc" ? 1 : -1;

    const [mediaList, total] = await Promise.all([
      Media.find(filter)
        .populate("uploadedBy", "name email role")
        .populate("eventId", "title category startDate")
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limitNum)
        .lean(),
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
// @desc    Get media by event
// @route   GET /api/media/event/:eventId
// @access  All authenticated users
// ─────────────────────────────────────────────
const getMediaByEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { page = 1, limit = 12 } = req.query;

    const event = await Event.findById(eventId).select("title category");
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found." });
    }

    const pageNum  = Math.max(parseInt(page),  1);
    const limitNum = Math.min(parseInt(limit), 50);
    const skip     = (pageNum - 1) * limitNum;

    const [mediaList, total] = await Promise.all([
      Media.find({ eventId })
        .populate("uploadedBy", "name email role")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Media.countDocuments({ eventId }),
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
    // Select uploadedBy, title, fileUrl so we can notify the owner
    // and denormalize without an extra query.
    const media = await Media.findById(req.params.id).select(
      "likes uploadedBy title fileUrl"
    );

    if (!media) {
      return res.status(404).json({ success: false, message: "Media not found." });
    }

    const userId = req.user._id.toString();
    const alreadyLiked = media.likes.likedBy.some((id) => id.toString() === userId);

    if (alreadyLiked) {
      // Unlike — no notification on unlike
      media.likes.likedBy = media.likes.likedBy.filter((id) => id.toString() !== userId);
      media.likes.count = Math.max(media.likes.count - 1, 0);
    } else {
      // Like
      media.likes.likedBy.push(req.user._id);
      media.likes.count += 1;

      // ── Notify media owner (fire-and-forget) ─
      await createNotification({
        recipientId: media.uploadedBy,
        actorId:     req.user._id,
        actorName:   req.user.name,
        type:        "like",
        mediaId:     media._id,
        mediaTitle:  media.title,
        mediaThumb:  media.fileUrl,
      });
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
//          Applies Cloudinary watermark overlay
//          based on the requesting user's saved
//          watermark settings. The original asset
//          is never modified.
// @route   GET /api/media/:id/download
// @access  All authenticated users
// ─────────────────────────────────────────────
const downloadMedia = async (req, res) => {
  try {
    // Fetch media and the requesting user's watermark settings in parallel
    const [media, user] = await Promise.all([
      Media.findById(req.params.id),
      User.findById(req.user._id).select("watermarkSettings role"),
    ]);

    if (!media) {
      return res.status(404).json({ success: false, message: "Media not found." });
    }

    // Increment download counter atomically
    await Media.findByIdAndUpdate(req.params.id, { $inc: { downloads: 1 } });

    // ── Apply watermark if enabled ───────────────────────────────────────
    // Videos are excluded from watermarking: Cloudinary text overlays on
    // video require a paid plan transformation and async rendering.
    // Image watermarking is synchronous and free on all plans.
    const settings = user?.watermarkSettings;
    const shouldWatermark =
      media.fileType === "image" &&
      settings?.enabled === true;

    const deliveryUrl = shouldWatermark
      ? buildWatermarkUrl(media.fileUrl, settings, user.role)
      : media.fileUrl;

    const ext      = media.fileType === "video" ? "mp4" : "jpg";
    const fileName = `${media.title.replace(/\s+/g, "_")}.${ext}`;

    return res.status(200).json({
      success: true,
      message: "Download URL ready.",
      fileUrl: deliveryUrl,
      fileName,
      watermarked: shouldWatermark,
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

const getMyUploads = async (req, res) => {
  try {
    const { page = 1, limit = 100 } = req.query;
    const pageNum  = Math.max(parseInt(page), 1);
    const limitNum = Math.min(parseInt(limit), 100);
    const skip     = (pageNum - 1) * limitNum;

    const [mediaList, total] = await Promise.all([
      Media.find({ uploadedBy: req.user._id })
        .populate("eventId", "title category startDate")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Media.countDocuments({ uploadedBy: req.user._id }),
    ]);

    return res.status(200).json({
      success: true,
      total,
      count: mediaList.length,
      data: mediaList,
    });
  } catch (error) {
    console.error("getMyUploads error:", error);
    return res.status(500).json({ success: false, message: "Server error while fetching uploads." });
  }
};

module.exports = {
  uploadMedia,
  getAllMedia,
  getMediaByEvent,
  getMyUploads,
  deleteMedia,
  likeMedia,
  downloadMedia,
  saveMedia,
  getSavedMedia,
};