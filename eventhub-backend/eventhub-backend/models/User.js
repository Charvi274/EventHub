// models/User.js
// ─────────────────────────────────────────────
//  User Schema – supports 4 roles
// ─────────────────────────────────────────────

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

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
  };
};

module.exports = mongoose.model("User", UserSchema);
