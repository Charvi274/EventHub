import { useState, useEffect } from "react";
import {
  ArrowLeft, Heart, MessageCircle, Download,
  Bookmark, Send, MoreHorizontal, Sparkles, Trash2,
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
// ── COMMENTS — backend shape returned by GET/POST /api/comments/media/:id ────
// ─────────────────────────────────────────────────────────────────────────────

interface BackendComment {
  _id: string;
  mediaId: string;
  author: {
    _id: string;
    name: string;
    role: string;
    avatar?: string;
  };
  text: string;
  createdAt: string;
  updatedAt: string;
}

// ── Deterministic avatar colour from a string ────────────────────────────────
// Same palette used by the stub data; keeps avatars visually consistent.
const AVATAR_COLORS = ["#ec4899", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#06b6d4"];
function avatarColor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

// ── Human-readable relative time ─────────────────────────────────────────────
function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60)   return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

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

  // ── COMMENTS state ──────────────────────────────────────────────────────────
  const [comments,        setComments]        = useState<BackendComment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentText,     setCommentText]     = useState("");
  const [commentPosting,  setCommentPosting]  = useState(false);
  const [commentError,    setCommentError]    = useState<string | null>(null);
  const [deletingComment, setDeletingComment] = useState<string | null>(null);

  // Keep liked/count in sync if a parent re-uses this component for a different item
  useEffect(() => {
    setLiked(alreadyLiked);
    setLikeCount(media.likes.count);
  }, [media._id]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Fetch comments whenever the viewed media item changes ───────────────────
  useEffect(() => {
    let cancelled = false;

    setComments([]);
    setCommentError(null);
    setCommentsLoading(true);

    fetch(`/api/comments/media/${media._id}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((data) => {
        if (!cancelled) {
          setComments(Array.isArray(data.data) ? data.data : []);
        }
      })
      .catch(() => {
        if (!cancelled) setCommentError("Could not load comments.");
      })
      .finally(() => {
        if (!cancelled) setCommentsLoading(false);
      });

    return () => { cancelled = true; };
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

  // ── POST a new comment ───────────────────────────────────────────────────────
  const handleCommentSubmit = async () => {
    const text = commentText.trim();
    if (!text || commentPosting) return;

    setCommentPosting(true);
    setCommentError(null);

    try {
      const res = await fetch(`/api/comments/media/${media._id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message ?? `HTTP ${res.status}`);
      }

      const data = await res.json();
      const newComment: BackendComment = data.data;

      // Prepend so the new comment appears at the top (list is newest-first)
      setComments((prev) => [newComment, ...prev]);
      setCommentText("");
    } catch (err: unknown) {
      setCommentError(err instanceof Error ? err.message : "Failed to post comment.");
    } finally {
      setCommentPosting(false);
    }
  };

  // ── DELETE a comment ─────────────────────────────────────────────────────────
  const handleCommentDelete = async (commentId: string) => {
    if (deletingComment) return;
    setDeletingComment(commentId);

    try {
      const res = await fetch(`/api/comments/${commentId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message ?? `HTTP ${res.status}`);
      }

      setComments((prev) => prev.filter((c) => c._id !== commentId));
    } catch (err: unknown) {
      setCommentError(err instanceof Error ? err.message : "Failed to delete comment.");
    } finally {
      setDeletingComment(null);
    }
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

          {/* Comments count — live */}
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:scale-105"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#c4cdd8" }}
          >
            <MessageCircle size={16} /> {comments.length} Comments
          </button>

          <div className="flex gap-2 ml-auto flex-wrap">
            
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

        {/* ── COMMENTS ───────────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">

          {/* Header */}
          <p className="text-sm font-semibold text-white">
            Comments ({commentsLoading ? "…" : comments.length})
          </p>

          {/* Error banner (fetch or post/delete failure) */}
          {commentError && (
            <div
              className="px-3 py-2 rounded-xl text-xs"
              style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444" }}
            >
              {commentError}
            </div>
          )}

          {/* Loading skeleton */}
          {commentsLoading && (
            <div className="space-y-3">
              {[1, 2, 3].map((n) => (
                <div key={n} className="flex gap-3 animate-pulse">
                  <div className="w-8 h-8 rounded-full flex-shrink-0" style={{ background: "rgba(255,255,255,0.06)" }} />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-2.5 rounded-full w-1/3" style={{ background: "rgba(255,255,255,0.06)" }} />
                    <div className="h-2 rounded-full w-full"  style={{ background: "rgba(255,255,255,0.04)" }} />
                    <div className="h-2 rounded-full w-2/3"  style={{ background: "rgba(255,255,255,0.04)" }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!commentsLoading && comments.length === 0 && !commentError && (
            <p className="text-xs text-center py-6" style={{ color: "#6b7fa3" }}>
              No comments yet. Be the first!
            </p>
          )}

          {/* Comment list */}
          {!commentsLoading && comments.map((comment) => {
            const color   = avatarColor(comment.author._id);
            const initial = comment.author.name.trim()[0]?.toUpperCase() ?? "?";
            const isOwn   = !!currentUser && comment.author._id === currentUser._id;
            const isAdmin = currentUser?.role === "Admin";
            const canDeleteComment = isOwn || isAdmin;

            return (
              <div key={comment._id} className="flex gap-3 group">
                {/* Avatar */}
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{
                    background: `${color}25`,
                    color,
                    border: `1px solid ${color}40`,
                  }}
                >
                  {initial}
                </div>

                <div className="flex-1">
                  {/* Name · role · time · delete */}
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-white">{comment.author.name}</span>
                    <span
                      className="text-xs px-1.5 py-0.5 rounded"
                      style={{ background: `${color}15`, color, fontSize: 10 }}
                    >
                      {comment.author.role}
                    </span>
                    <span className="text-xs ml-auto" style={{ color: "#6b7fa3" }}>
                      {timeAgo(comment.createdAt)}
                    </span>

                    {/* Delete — visible on hover for permitted users */}
                    {canDeleteComment && (
                      <button
                        onClick={() => handleCommentDelete(comment._id)}
                        disabled={deletingComment === comment._id}
                        title="Delete comment"
                        className="opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-40"
                        style={{ color: "#ef4444" }}
                      >
                        <Trash2 size={11} />
                      </button>
                    )}
                  </div>

                  {/* Text */}
                  <p className="text-xs leading-relaxed" style={{ color: "#c4cdd8" }}>
                    {comment.text}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Comment input */}
        <div className="p-4" style={{ borderTop: "1px solid rgba(16,185,129,0.08)" }}>
          <div className="flex gap-3 items-end">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #10b981, #3b82f6)", color: "white" }}
            >
              {currentUser ? uploaderInitial : "?"}
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
                disabled={!commentText.trim() || commentPosting}
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