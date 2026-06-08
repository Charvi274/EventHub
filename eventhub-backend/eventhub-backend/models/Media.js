const mongoose = require("mongoose");

const mediaSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Media title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },

    fileUrl: {
      type: String,
      required: [true, "File URL is required"],
      trim: true,
    },

    fileType: {
      type: String,
      required: [true, "File type is required"],
      enum: {
        values: ["image", "video"],
        message: "fileType must be either 'image' or 'video'",
      },
    },

    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Uploader reference is required"],
    },

    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: [true, "Associated event is required"],
    },

    tags: {
      type: [String],
      default: [],
    },

    likes: {
      count: {
        type: Number,
        default: 0,
        min: 0,
      },
      
      likedBy: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "User",
        default: [],
      },
    },
savedBy: {
  type: [mongoose.Schema.Types.ObjectId],
  ref: "User",
  default: [],
},
    downloads: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for common queries
mediaSchema.index({ eventId: 1 });
mediaSchema.index({ uploadedBy: 1 });
mediaSchema.index({ fileType: 1 });
mediaSchema.index({ tags: 1 });
mediaSchema.index({ createdAt: -1 });
mediaSchema.index({ savedBy: 1 });
const Media = mongoose.model("Media", mediaSchema);

module.exports = Media;
