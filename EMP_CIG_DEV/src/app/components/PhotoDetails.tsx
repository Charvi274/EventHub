import { useState, useEffect } from "react";
import {
  ArrowLeft, Heart, MessageCircle, Share2, Download,
  Bookmark, UserPlus, Send, MoreHorizontal, Sparkles, Trash2,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

/** Full backend shape — matches Gallery.tsx's BackendMedia + _id on uploadedBy */
export interface BackendMedia {
  _id: string;
  title: string;
  fileUrl: string;
  fileType: "image" | "video";
  tags: string[];
  likes: { count: number; likedBy: string[] };
  downloads: number;
  createdAt: string;
  eventId?: {
    _id: string;
    title: string;
    category?: string;
    startDate?: string;
  };
  uploadedBy?: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
}

interface PhotoDetailsProps {
  media: BackendMedia;
  onBack: () => void;
  onDeleted?: () => void;
  onSelect?: (media: BackendMedia) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Auth helpers  (same strategy as Gallery.tsx)
// ─────────────────────────────────────────────────────────────────────────────

function getToken(): string {
  return localStorage.getItem("token") || sessionStorage.getItem("token") || "";
}

/**
 * Decode the JWT payload without a library.
 * Returns null if the token is absent or malformed.
 */
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(payload);
  } catch {
    return null;
  }
}

function getCurrentUser(): { _id: string; role: string } | null {
  const token = getToken();
  if (!token) return null;
  const payload = decodeJwtPayload(token);
  if (!payload) return null;
  const id = (payload._id ?? payload.id ?? payload.sub ?? "") as string;
  const role = (payload.role ?? "") as string;
  if (!id) return null;
  return { _id: id, role };
}

// ─────────────────────────────────────────────────────────────────────────────
// Suggested photos strip  (static Unsplash fallback — no backend yet)
// ─────────────────────────────────────────────────────────────────────────────


// ─────────────────────────────────────────────────────────────────────────────
// ── COMMENTS  (no backend yet — isolated for future integration) ──────────────
// When the comments API is ready:
//   GET  /api/media/:id/comments   → fetch comment list
//   POST /api/media/:id/comments   → post new comment
//   PUT  /api/comments/:id/like    → toggle comment like
// Replace the STUB_COMMENTS constant and the three handler stubs below.
// ─────────────────────────────────────────────────────────────────────────────

interface Comment {
  id: number;
  user: string;
  avatar: string;
  role: string;
  time: string;
  text: string;
  likes: number;
  color: string;
}

const STUB_COMMENTS: Comment[] = [
  { id: 1, user: "Priya Sharma",  avatar: "P", role: "Photographer", time: "2h ago",  text: "Absolutely stunning shot! The lighting here is perfect 📸",                              likes: 23, color: "#ec4899" },
  { id: 2, user: "Rahul Gupta",   avatar: "R", role: "Member",       time: "4h ago",  text: "This was such an incredible moment! I was standing right there when this happened",    likes: 15, color: "#3b82f6" },
  { id: 3, user: "Ananya Iyer",   avatar: "A", role: "Admin",        time: "6h ago",  text: "Great capture! You really have an eye for these candid moments 🎯",                    likes: 8,  color: "#10b981" },
  { id: 4, user: "Dev Patel",     avatar: "D", role: "Viewer",       time: "1d ago",  text: "Miss these days... Tech Fest was absolutely fire 🔥",                                   likes: 42, color: "#f59e0b" },
];

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function PhotoDetails({
  media,
  onBack,
  onDeleted,
  onSelect,
}: PhotoDetailsProps) {

  // ── Derived values ──────────────────────────────────────────────────────────
  const currentUser = getCurrentUser();

  const uploaderName    = media.uploadedBy?.name  ?? "Unknown";
  const uploaderRole    = media.uploadedBy?.role  ?? "";
  const uploaderInitial = uploaderName.trim()[0]?.toUpperCase() ?? "?";
  const eventTitle      = media.eventId?.title    ?? "Unknown Event";
  const eventDate       = media.eventId?.startDate
    ? new Date(media.eventId.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : new Date(media.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const uploadedAt      = new Date(media.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  /**
   * Delete is shown when:
   *   • current user is Admin  (any media)
   *   • current user is the uploader
   * Mirrors the exact permission check in mediaController.js deleteMedia().
   */
  const canDelete = !!currentUser && (
    currentUser.role === "Admin" ||
    (!!media.uploadedBy?._id && currentUser._id === media.uploadedBy._id)
  );

  /** Whether the current user has already liked this media */
  const alreadyLiked = !!currentUser && media.likes.likedBy.some((id) => id === currentUser._id);

  // ── UI state ────────────────────────────────────────────────────────────────
  const [liked,       setLiked]       = useState(alreadyLiked);
  const [suggested, setSuggested] = useState<BackendMedia[]>([]);
  const [likeCount,   setLikeCount]   = useState(media.likes.count);
  const [likeLoading, setLikeLoading] = useState(false);

  const [saved, setSaved] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  const [deleteLoading,  setDeleteLoading]  = useState(false);
  const [deleteError,    setDeleteError]    = useState<string | null>(null);
  const [downloadLoading, setDownloadLoading] = useState(false);

  // ── COMMENTS state (no backend yet) ────────────────────────────────────────
  const [commentText,    setCommentText]    = useState("");
  const [likedComments,  setLikedComments]  = useState<number[]>([]);

  // Keep liked/count in sync if a parent re-uses this component for a different item
  useEffect(() => {
    setLiked(alreadyLiked);
    setLikeCount(media.likes.count);
  }, [media._id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
  const eventId = media.eventId?._id;
  if (!eventId) return;

  setSuggested([]);

  fetch(`/api/media/event/${eventId}?limit=7`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  })
    .then((r) => (r.ok ? r.json() : Promise.reject()))
    .then((data) => {
      const list: BackendMedia[] = Array.isArray(data.data)
        ? data.data
        : [];

      setSuggested(
        list
          .filter((m) => m._id !== media._id)
          .slice(0, 6)
      );
    })
    .catch(() => {});
}, [media._id, media.eventId?._id]);
  // ── Like handler ────────────────────────────────────────────────────────────
  const handleLike = async () => {
    if (likeLoading) return;

    // Optimistic update
    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikeCount((c) => (wasLiked ? Math.max(c - 1, 0) : c + 1));
    setLikeLoading(true);

    try {
      const res = await fetch(`/api/media/${media._id}/like`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      // Reconcile with server truth
      setLiked(data.liked);
      setLikeCount(data.likes);
    } catch {
      // Roll back on failure
      setLiked(wasLiked);
      setLikeCount((c) => (wasLiked ? c + 1 : Math.max(c - 1, 0)));
    } finally {
      setLikeLoading(false);
    }
  };

  // ── Download handler ──────────────────────────────────────────────────────── 
  const handleDownload = async () => {
  if (downloadLoading) return;
  setDownloadLoading(true);
  try {
    // 1. Tell backend to increment download count and get the URL
    const res = await fetch(`/api/media/${media._id}/download`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    // 2. Fetch the actual file as a blob to force Save-As behaviour
    //    (cross-origin URLs ignore the <a download> attribute)
    const fileRes = await fetch(data.fileUrl);
    const blob = await fileRes.blob();
    const objectUrl = URL.createObjectURL(blob);

    const anchor = document.createElement("a");
    anchor.href = objectUrl;
    anchor.download = data.fileName ?? `${media.title}.jpg`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(objectUrl);
  } catch {
    // Fallback: open in new tab if blob fetch fails
    window.open(media.fileUrl, "_blank");
  } finally {
    setDownloadLoading(false);
  }
};

// NEW — wire Save button to backend
const handleSave = async () => {
  if (saveLoading) return;
  setSaveLoading(true);
  const wasSaved = saved;
  setSaved(!wasSaved); // optimistic
  try {
    const res = await fetch(`/api/media/${media._id}/save`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    setSaved(data.saved);
  } catch {
    setSaved(wasSaved); // rollback
  } finally {
    setSaveLoading(false);
  }
};
  // ── Delete handler ──────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (deleteLoading) return;
    if (!window.confirm("Delete this media? This cannot be undone.")) return;

    setDeleteLoading(true);
    setDeleteError(null);
    try {
      const res = await fetch(`/api/media/${media._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message ?? `HTTP ${res.status}`);
      }
      onDeleted?.();
      onBack();
    } catch (err: unknown) {
      setDeleteError(err instanceof Error ? err.message : "Delete failed. Please try again.");
      setDeleteLoading(false);
    }
  };

  // ── COMMENTS stubs (no backend yet) ────────────────────────────────────────
  const handleCommentLikeToggle = (id: number) =>
    setLikedComments((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );

  const handleCommentSubmit = () => {
    // TODO: POST /api/media/:id/comments  when backend is ready
    // For now: clear input only
    setCommentText("");
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col xl:flex-row min-h-[calc(100vh-64px)]" style={{ background: "#04070f" }}>

      {/* ── Left: photo viewer ───────────────────────────────────────────────── */}
      <div className="xl:flex-1 relative flex flex-col" style={{ background: "#06091a" }}>

        {/* Top bar */}
        <div
          className="flex items-center justify-between p-4"
          style={{ borderBottom: "1px solid rgba(16,185,129,0.08)" }}
        >
<button
  onClick={handleSave}
  disabled={saveLoading}
  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs transition-all hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed"
  style={{
    background: saved ? "rgba(245,158,11,0.1)" : "transparent",
    border: `1px solid ${saved ? "rgba(245,158,11,0.4)" : "rgba(255,255,255,0.08)"}`,
    color: saved ? "#f59e0b" : "#6b7fa3",
  }}
>
  <Bookmark size={14} fill={saved ? "currentColor" : "none"} />
  {saveLoading ? "…" : "Save"}
</button>

          <div className="flex items-center gap-2">
            {/* Delete — only visible when permitted */}
            {canDelete && (
              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                title="Delete media"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: "rgba(239,68,68,0.1)",
                  border: "1px solid rgba(239,68,68,0.3)",
                  color: "#ef4444",
                }}
              >
                <Trash2 size={13} />
                {deleteLoading ? "Deleting…" : "Delete"}
              </button>
            )}
            <button
              className="p-2 rounded-xl hover:bg-white/5 transition-colors"
              style={{ color: "#6b7fa3" }}
            >
              <MoreHorizontal size={18} />
            </button>
          </div>
        </div>

        {/* Delete error banner */}
        {deleteError && (
          <div
            className="mx-6 mt-3 px-4 py-2.5 rounded-xl text-sm"
            style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444" }}
          >
            {deleteError}
          </div>
        )}

        {/* Image */}
        <div className="flex-1 flex items-center justify-center p-6" style={{ background: "#04070f" }}>
          <img
            src={media.fileUrl}
            alt={media.title}
            className="max-w-full max-h-[60vh] object-contain rounded-2xl"
            style={{ boxShadow: "0 32px 80px rgba(0,0,0,0.6)" }}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src =
                "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=900&h=600&fit=crop&auto=format";
            }}
          />
        </div>

        {/* Actions bar */}
        <div
          className="px-6 py-4 flex items-center gap-4 flex-wrap"
          style={{ borderTop: "1px solid rgba(16,185,129,0.08)" }}
        >
          {/* Like */}
          <button
            onClick={handleLike}
            disabled={likeLoading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed"
            style={{
              background: liked ? "rgba(236,72,153,0.15)" : "rgba(255,255,255,0.05)",
              border: `1px solid ${liked ? "rgba(236,72,153,0.4)" : "rgba(255,255,255,0.1)"}`,
              color: liked ? "#ec4899" : "#c4cdd8",
            }}
          >
            <Heart size={16} fill={liked ? "currentColor" : "none"} />
            {likeCount.toLocaleString()} Likes
          </button>

          {/* Comments count — static (no backend yet) */}
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:scale-105"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#c4cdd8" }}
          >
            <MessageCircle size={16} /> {STUB_COMMENTS.length} Comments
          </button>

          <div className="flex gap-2 ml-auto flex-wrap">
            {/* Share — UI only */}
            <button
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs transition-all hover:bg-white/5"
              style={{ border: "1px solid rgba(255,255,255,0.08)", color: "#6b7fa3" }}
              title="Share"
            >
              <Share2 size={14} /> Share
            </button>

            {/* Download */}
            <button
              onClick={handleDownload}
              disabled={downloadLoading}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs transition-all hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ border: "1px solid rgba(255,255,255,0.08)", color: "#6b7fa3" }}
              title="Download"
            >
              <Download size={14} /> {downloadLoading ? "…" : "Download"}
            </button>

            {/* Tag — UI only */}
            <button
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs transition-all hover:bg-white/5"
              style={{ border: "1px solid rgba(255,255,255,0.08)", color: "#6b7fa3" }}
              title="Tag"
            >
              <UserPlus size={14} /> Tag
            </button>

            {/* Save / Bookmark — local state only (no backend yet) */}
            
          </div>
        </div>

        {/* Suggested photos — static fallback (no "same-event" API yet) */}
        {suggested.length > 0 && (
  <div className="px-6 pb-6">
    <p
      className="text-xs font-medium mb-3"
      style={{ color: "#6b7fa3" }}
    >
      More from this event
    </p>

    <div className="flex gap-2 overflow-x-auto pb-1">
      {suggested.map((item) => (
        <div
          key={item._id}
          onClick={() => onSelect?.(item)}
          className="flex-shrink-0 rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-transform"
          style={{
            width: 100,
            height: 70,
            background: "#0b1220",
          }}
        >
          <img
            src={item.fileUrl}
            alt={item.title}
            className="w-full h-full object-cover"
          />
        </div>
      ))}
    </div>
  </div>
)}
      </div>

      {/* ── Right panel: info + comments ─────────────────────────────────────── */}
      <div
        className="xl:w-96 flex flex-col"
        style={{ borderLeft: "1px solid rgba(16,185,129,0.08)", background: "#06091a" }}
      >

        {/* Photo info */}
        <div className="p-5 space-y-4" style={{ borderBottom: "1px solid rgba(16,185,129,0.08)" }}>

          {/* Uploader */}
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #8b5cf6, #3b82f6)", color: "white" }}
            >
              {uploaderInitial}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{uploaderName}</p>
              <p className="text-xs truncate" style={{ color: "#6b7fa3" }}>
                {uploaderRole} · {eventTitle}
              </p>
            </div>
            <button
              className="text-xs px-3 py-1.5 rounded-xl transition-all hover:scale-105 flex-shrink-0"
              style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", color: "#10b981" }}
            >
              Follow
            </button>
          </div>

          {/* Meta grid */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            {[
              { label: "Event",     value: eventTitle  },
              { label: "Date",      value: eventDate   },
              { label: "Type",      value: media.fileType === "video" ? "Video" : "Image" },
              { label: "Uploaded",  value: uploadedAt  },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="p-3 rounded-xl"
                style={{ background: "rgba(11,18,32,0.8)", border: "1px solid rgba(16,185,129,0.08)" }}
              >
                <p className="mb-0.5" style={{ color: "#6b7fa3" }}>{label}</p>
                <p className="text-white font-medium truncate" title={value}>{value}</p>
              </div>
            ))}
          </div>

          {/* AI / real tags */}
          {media.tags.length > 0 && (
            <div
              className="flex items-start gap-2 p-3 rounded-xl"
              style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.15)" }}
            >
              <Sparkles size={13} color="#f59e0b" className="mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-medium mb-1.5" style={{ color: "#f59e0b" }}>Tags</p>
                <div className="flex flex-wrap gap-1.5">
                  {media.tags.map((t) => (
                    <span
                      key={t}
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{ background: "rgba(245,158,11,0.1)", color: "#f59e0b" }}
                    >
                      {t.startsWith("#") ? t : `#${t}`}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── COMMENTS (no backend yet) ──────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <p className="text-sm font-semibold text-white">
            Comments ({STUB_COMMENTS.length})
          </p>
          {STUB_COMMENTS.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={{
                  background: `${comment.color}25`,
                  color: comment.color,
                  border: `1px solid ${comment.color}40`,
                }}
              >
                {comment.avatar}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-white">{comment.user}</span>
                  <span
                    className="text-xs px-1.5 py-0.5 rounded"
                    style={{ background: `${comment.color}15`, color: comment.color, fontSize: 10 }}
                  >
                    {comment.role}
                  </span>
                  <span className="text-xs ml-auto" style={{ color: "#6b7fa3" }}>{comment.time}</span>
                </div>
                <p className="text-xs leading-relaxed mb-1.5" style={{ color: "#c4cdd8" }}>
                  {comment.text}
                </p>
                <button
                  onClick={() => handleCommentLikeToggle(comment.id)}
                  className="flex items-center gap-1 text-xs transition-colors"
                  style={{ color: likedComments.includes(comment.id) ? "#ec4899" : "#6b7fa3" }}
                >
                  <Heart
                    size={11}
                    fill={likedComments.includes(comment.id) ? "currentColor" : "none"}
                  />
                  {likedComments.includes(comment.id) ? comment.likes + 1 : comment.likes}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Comment input */}
        <div className="p-4" style={{ borderTop: "1px solid rgba(16,185,129,0.08)" }}>
          <div className="flex gap-3 items-end">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #10b981, #3b82f6)", color: "white" }}
            >
              {getCurrentUser()?._id ? (uploaderInitial) : "?"}
            </div>
            <div className="flex-1 relative">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey && commentText.trim()) {
                    e.preventDefault();
                    handleCommentSubmit();
                  }
                }}
                placeholder="Add a comment…"
                rows={1}
                className="w-full px-4 py-2.5 pr-10 rounded-xl text-sm outline-none resize-none transition-all"
                style={{
                  background: "rgba(11,18,32,0.8)",
                  border: "1px solid rgba(16,185,129,0.15)",
                  color: "#e8edf5",
                }}
                onFocus={(e)  => { e.currentTarget.style.borderColor = "rgba(16,185,129,0.5)"; }}
                onBlur={(e)   => { e.currentTarget.style.borderColor = "rgba(16,185,129,0.15)"; }}
              />
              <button
                onClick={handleCommentSubmit}
                disabled={!commentText.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:scale-110 disabled:cursor-not-allowed"
                style={{
                  background: commentText.trim() ? "rgba(16,185,129,0.2)" : "transparent",
                  color: commentText.trim() ? "#10b981" : "#6b7fa3",
                }}
              >
                <Send size={13} />
              </button>
            </div>
          </div>
        </div>
        {/* ── end COMMENTS ──────────────────────────────────────────────────── */}

      </div>
    </div>
  );
}