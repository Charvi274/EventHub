const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;

// ─────────────────────────────────────────────
// Cloudinary configuration
// Reads credentials from .env:
//   CLOUDINARY_CLOUD_NAME
//   CLOUDINARY_API_KEY
//   CLOUDINARY_API_SECRET
// ─────────────────────────────────────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ─────────────────────────────────────────────
// Cloudinary storage engine
// Images  → stored in "eventhub/images"  folder
// Videos  → stored in "eventhub/videos"  folder
// ─────────────────────────────────────────────
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const isVideo = file.mimetype.startsWith("video/");
    return {
      folder: isVideo ? "eventhub/videos" : "eventhub/images",
      resource_type: isVideo ? "video" : "image",
      allowed_formats: ["jpg", "jpeg", "png", "gif", "webp", "mp4", "mov", "avi", "mkv"],
      // Use original filename (sanitised) so URLs stay readable
      public_id: `${Date.now()}-${file.originalname.replace(/\s+/g, "_").replace(/\.[^/.]+$/, "")}`,
    };
  },
});

// ─────────────────────────────────────────────
// File filter — accept images & videos only
// ─────────────────────────────────────────────
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "video/mp4",
    "video/quicktime",
    "video/x-msvideo",
    "video/x-matroska",
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Unsupported file type. Only images (jpg, png, gif, webp) and videos (mp4, mov, avi, mkv) are allowed."
      ),
      false
    );
  }
};

// ─────────────────────────────────────────────
// Multer instance
// Max file size: 100 MB (videos can be large)
// ─────────────────────────────────────────────
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB
});

// ─────────────────────────────────────────────
// Helper: delete a file from Cloudinary by URL
// ─────────────────────────────────────────────
const deleteFromCloudinary = async (fileUrl, resourceType = "image") => {
  try {
    // Extract public_id from Cloudinary URL
    // URL format: https://res.cloudinary.com/<cloud>/image/upload/v.../folder/public_id.ext
    const urlParts = fileUrl.split("/");
    const uploadIndex = urlParts.indexOf("upload");
    if (uploadIndex === -1) return;

    // Everything after "upload/v<version>/" is the public_id (with extension)
    const publicIdWithExt = urlParts.slice(uploadIndex + 2).join("/");
    const publicId = publicIdWithExt.replace(/\.[^/.]+$/, ""); // strip extension

    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch (err) {
    console.error("Cloudinary delete error:", err.message);
  }
};

module.exports = { upload, cloudinary, deleteFromCloudinary };
