const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Event title is required"],
      trim: true,
      maxlength: [150, "Title cannot exceed 150 characters"],
    },

    description: {
      type: String,
      required: [true, "Event description is required"],
      trim: true,
    },

    category: {
      type: String,
      required: [true, "Event category is required"],
      enum: [
        "Photography",
        "Music",
        "Sports",
        "Technology",
        "Art",
        "Cultural",
        "Academic",
        "Social",
        "Other",
      ],
      default: "Other",
    },

    organizer: {
      type: String,
      required: [true, "Organizer name is required"],
      trim: true,
    },

    location: {
      type: String,
      required: [true, "Event location is required"],
      trim: true,
    },

    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },

    endDate: {
      type: Date,
      required: [true, "End date is required"],
      validate: {
        validator: function (value) {
          return value >= this.startDate;
        },
        message: "End date must be on or after start date",
      },
    },

    coverImage: {
      type: String,
      default: "",
    },

    tags: {
      type: [String],
      default: [],
    },

    status: {
      type: String,
      enum: ["upcoming", "ongoing", "completed"],
      default: "upcoming",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-update status based on current date before find queries
eventSchema.pre(/^find/, function (next) {
  const now = new Date();
  this.where({}).setOptions({ lean: false });
  next();
});

// Instance method to compute and sync status
eventSchema.methods.syncStatus = function () {
  const now = new Date();
  if (now < this.startDate) {
    this.status = "upcoming";
  } else if (now >= this.startDate && now <= this.endDate) {
    this.status = "ongoing";
  } else {
    this.status = "completed";
  }
  return this;
};

// Index for faster querying
eventSchema.index({ status: 1 });
eventSchema.index({ category: 1 });
eventSchema.index({ startDate: 1 });
eventSchema.index({ createdBy: 1 });
eventSchema.index({ tags: 1 });

const Event = mongoose.model("Event", eventSchema);

module.exports = Event;
