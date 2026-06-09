// models/User.js
// ─────────────────────────────────────────────
//  User Schema – supports 4 roles
// ─────────────────────────────────────────────

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// ─────────────────────────────────────────────
//  Watermark settings sub-schema
//  Stored per-user; read by downloadMedia on
//  every download request.
// ─────────────────────────────────────────────
const watermarkSettingsSchema = new mongoose.Schema(
  {
    enabled: {
      type: Boolean,
      default: true,
    },
    clubName: {
      type: String,
      default: "",
      maxlength: [100, "Club name cannot exceed 100 characters"],
      trim: true,
    },
    eventName: {
      type: String,
      default: "",
      maxlength: [100, "Event name cannot exceed 100 characters"],
      trim: true,
    },
    includeRole: {
      type: Boolean,
      default: true,
    },
    includeDate: {
      type: Boolean,
      default: true,
    },
    includeIcon: {
      type: Boolean,
      default: true,
    },
    position: {
      type: String,
      enum: {
        values: ["bottom-right", "bottom-left", "top-right", "center"],
        message: "{VALUE} is not a valid watermark position",
      },
      default: "bottom-right",
    },
    opacity: {
      type: Number,
      enum: {
        values: [15, 25, 40, 60, 80],
        message: "{VALUE} is not a valid opacity value",
      },
      default: 25,
    },
    applyAll: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false } // embedded sub-doc; no separate _id needed
);

const UserSchema = new mongoose.Schema(
  {
    // ── Basic Info ──────────────────────────────
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email address",
      ],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // Never return password in queries by default
    },

    // ── Role ────────────────────────────────────
    role: {
      type: String,
      enum: {
        values: ["Admin", "Photographer", "Club Member", "Viewer"],
        message: "{VALUE} is not a valid role",
      },
      default: "Viewer",
    },

    // ── Profile ─────────────────────────────────
    avatar: {
      type: String,
      default: "",
    },

    bio: {
      type: String,
      maxlength: [200, "Bio cannot exceed 200 characters"],
      default: "",
    },

    // ── Status ──────────────────────────────────
    isActive: {
      type: Boolean,
      default: true,
    },

    // ── Timestamps ──────────────────────────────
    lastLogin: {
      type: Date,
      default: null,
    },

    // ── Watermark ───────────────────────────────
    watermarkSettings: {
      type: watermarkSettingsSchema,
      default: () => ({}), // applies all sub-schema defaults on new users
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

// ─────────────────────────────────────────────
//  Pre-save Hook – Hash password before saving
// ─────────────────────────────────────────────
UserSchema.pre("save", async function (next) {
  // Only hash if password field was actually modified
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(12); // 12 rounds = strong & reasonably fast
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ─────────────────────────────────────────────
//  Instance Method – Compare entered password
// ─────────────────────────────────────────────
UserSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// ─────────────────────────────────────────────
//  Instance Method – Return safe user object
//  (strips sensitive fields before sending to client)
// ─────────────────────────────────────────────
UserSchema.methods.toSafeObject = function () {
  return {
    _id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    avatar: this.avatar,
    bio: this.bio,
    isActive: this.isActive,
    lastLogin: this.lastLogin,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
    watermarkSettings: this.watermarkSettings,
  };
};

module.exports = mongoose.model("User", UserSchema);