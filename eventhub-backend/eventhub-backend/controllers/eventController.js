const Event = require("../models/Event");

// ─────────────────────────────────────────────
// @desc    Create a new event
// @route   POST /api/events
// @access  Admin, ClubMember
// ─────────────────────────────────────────────
const createEvent = async (req, res) => {
  try {
    
    const {
      title,
      description,
      category,
      organizer,
      location,
      startDate,
      endDate,
      coverImage,
      tags,
      status,
    } = req.body;

    const event = await Event.create({
      title,
      description,
      category,
      organizer,
      location,
      startDate,
      endDate,
      coverImage,
      tags,
      status,
      createdBy: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: "Event created successfully",
      data: event,
    });
  } catch (error) {
    // Mongoose validation error
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: messages,
      });
    }

    console.error("createEvent error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while creating event",
    });
  }
};

// ─────────────────────────────────────────────
// @desc    Get all events (with optional filters)
// @route   GET /api/events
// @access  All authenticated users
// ─────────────────────────────────────────────
const getAllEvents = async (req, res) => {
  try {
    const {
      status,
      category,
      tag,
      search,
      page = 1,
      limit = 10,
      sortBy = "startDate",
      order = "asc",
    } = req.query;

    // Build filter object
    const filter = {};

    if (status) filter.status = status;
    if (category) filter.category = category;
    if (tag) filter.tags = { $in: [tag] };

    // Search by title or description
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Pagination
    const pageNum = Math.max(parseInt(page), 1);
    const limitNum = Math.min(parseInt(limit), 100); // cap at 100
    const skip = (pageNum - 1) * limitNum;

    // Sort
    const sortOrder = order === "desc" ? -1 : 1;
    const sortOptions = { [sortBy]: sortOrder };

    const [events, total] = await Promise.all([
      Event.find(filter)
        .populate("createdBy", "name email role")
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum),
      Event.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      message: "Events fetched successfully",
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      count: events.length,
      data: events,
    });
  } catch (error) {
    console.error("getAllEvents error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching events",
    });
  }
};

// ─────────────────────────────────────────────
// @desc    Get a single event by ID
// @route   GET /api/events/:id
// @access  All authenticated users
// ─────────────────────────────────────────────
const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate(
      "createdBy",
      "name email role"
    );

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Event fetched successfully",
      data: event,
    });
  } catch (error) {
    // Invalid ObjectId format
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID format",
      });
    }

    console.error("getEventById error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching event",
    });
  }
};

// ─────────────────────────────────────────────
// @desc    Update an event
// @route   PUT /api/events/:id
// @access  Admin (any event) | ClubMember (own events only)
// ─────────────────────────────────────────────
const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // ClubMember can only update events they created
    if (
      req.user.role === "ClubMember" &&
      event.createdBy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this event",
      });
    }

    const allowedFields = [
      "title",
      "description",
      "category",
      "organizer",
      "location",
      "startDate",
      "endDate",
      "coverImage",
      "tags",
      "status",
    ];

    // Apply only allowed fields from body
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        event[field] = req.body[field];
      }
    });

    const updatedEvent = await event.save();

    return res.status(200).json({
      success: true,
      message: "Event updated successfully",
      data: updatedEvent,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: messages,
      });
    }

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID format",
      });
    }

    console.error("updateEvent error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating event",
    });
  }
};

// ─────────────────────────────────────────────
// @desc    Delete an event
// @route   DELETE /api/events/:id
// @access  Admin (any event) | ClubMember (own events only)
// ─────────────────────────────────────────────
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // ClubMember can only delete events they created
    if (
      req.user.role === "ClubMember" &&
      event.createdBy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this event",
      });
    }

    await event.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Event deleted successfully",
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID format",
      });
    }

    console.error("deleteEvent error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while deleting event",
    });
  }
};


const uploadEventCover = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded. Please attach an image.",
      });
    }
 
    // multer-storage-cloudinary writes the public Cloudinary URL to req.file.path
    // — confirmed from mediaController.js line: fileUrl: req.file.path
    const fileUrl = req.file.path;
 
    if (!fileUrl) {
      return res.status(500).json({
        success: false,
        message: "Upload succeeded but Cloudinary returned no URL.",
      });
    }
 
    return res.status(200).json({
      success: true,
      message: "Cover image uploaded successfully.",
      fileUrl, // CreateEvent.tsx reads data.fileUrl
    });
  } catch (error) {
    console.error("uploadEventCover error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during cover image upload.",
    });
  }
};

module.exports = {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  uploadEventCover,
};
