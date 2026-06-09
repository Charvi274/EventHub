// utils/notificationUtils.js
// ─────────────────────────────────────────────
//  Thin helper that creates a notification
//  document.  Kept separate so controllers stay
//  clean and the logic is easy to unit-test.
//
//  Failure is intentionally swallowed — a broken
//  notification must never roll back the primary
//  action (like, comment) that triggered it.
// ─────────────────────────────────────────────

const Notification = require("../models/Notification");

/**
 * createNotification
 *
 * @param {Object} opts
 * @param {ObjectId|string} opts.recipientId  - media owner
 * @param {ObjectId|string} opts.actorId      - user who acted
 * @param {string}          opts.actorName    - actor's display name
 * @param {"like"|"comment"} opts.type
 * @param {ObjectId|string} opts.mediaId
 * @param {string}          opts.mediaTitle   - denormalized
 * @param {string}          opts.mediaThumb   - Cloudinary URL
 *
 * @returns {Promise<void>}  Resolves silently; never rejects to caller.
 */
async function createNotification({
  recipientId,
  actorId,
  actorName,
  type,
  mediaId,
  mediaTitle = "",
  mediaThumb = "",
}) {
  try {
    // Guard: never notify someone about their own action
    if (recipientId.toString() === actorId.toString()) return;

    await Notification.create({
      recipientId,
      actorId,
      actorName,
      type,
      mediaId,
      mediaTitle,
      mediaThumb,
    });
  } catch (err) {
    // Log but do not propagate — notification failure is non-fatal
    console.error("createNotification error:", err);
  }
}

module.exports = { createNotification };
