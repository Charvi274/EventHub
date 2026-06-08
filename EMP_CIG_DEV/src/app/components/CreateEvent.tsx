import { useState, useRef } from "react";
import {
  ArrowLeft,
  Upload,
  Calendar,
  Tag,
  Lock,
  ImagePlus,
  X,
  Check,
  AlertCircle,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
interface CreateEventProps {
  onBack: () => void;
  onCreated: () => void;
  user?: {
    name?: string;
    email?: string;
    role?: string;
  };
}

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────
function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Combines a date string (YYYY-MM-DD) and a time string (HH:MM)
 * into a full ISO datetime string the backend can parse as a Date.
 * Falls back to midnight if no time is provided.
 */
function toISODateTime(date: string, time: string): string {
  return `${date}T${time || "00:00"}:00`;
}

// ─────────────────────────────────────────────────────────────
// Category list — aligned with backend enum values:
// "Photography" | "Music" | "Sports" | "Technology" | "Art" |
// "Cultural"    | "Academic" | "Social" | "Other"
// ─────────────────────────────────────────────────────────────
const categories = [
  "Photography",
  "Music",
  "Sports",
  "Technology",
  "Art",
  "Cultural",
  "Academic",
  "Social",
  "Other",
];

// ─────────────────────────────────────────────────────────────
// API helpers
// ─────────────────────────────────────────────────────────────

/**
 * Reads the JWT from storage.
 * authMiddleware.js reads ONLY the Authorization header ("Bearer <token>"),
 * so cookies / credentials:include are irrelevant and must NOT be used.
 * localStorage is checked first; sessionStorage is the fallback so that
 * both "remember me" (localStorage) and tab-scoped (sessionStorage) logins work.
 */
function getAuthToken(): string {
  const token =
    localStorage.getItem("token") ?? sessionStorage.getItem("token");
  if (!token) throw new Error("Not authenticated. Please log in again.");
  return token;
}

/**
 * Step 1 — Upload cover image to Cloudinary via the dedicated cover endpoint.
 * Uses  POST /api/events/cover-upload  (multer field "file").
 * Returns the Cloudinary URL; no Media document is created.
 *
 * Auth: Authorization: Bearer <token>
 * NOTE: Do NOT set Content-Type manually — the browser sets it with the
 * multipart boundary automatically when a FormData body is used.
 */
async function uploadCoverImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file); // multer expects exactly the field name "file"

  const res = await fetch("/api/events/cover-upload", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getAuthToken()}`,
      // Content-Type intentionally omitted — browser sets multipart/form-data + boundary
    },
    body: formData,
  });

  const data = await res.json();

  if (!res.ok || !data.success) {
    throw new Error(data.message || "Cover image upload failed.");
  }

  // The cover-upload endpoint returns the Cloudinary URL as data.fileUrl
  const url: string = data.fileUrl ?? "";
  if (!url) throw new Error("Upload succeeded but no URL was returned.");
  return url;
}

/**
 * Step 2 — Create the event record in MongoDB.
 * Uses  POST /api/events  (eventController → createEvent).
 *
 * Auth: Authorization: Bearer <token>
 */
async function createEventAPI(payload: object): Promise<void> {
  const res = await fetch("/api/events", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getAuthToken()}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || "Failed to create event.");
  }
}

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────
export function CreateEvent({ onBack, onCreated, user }: CreateEventProps) {
  // ── Role guard (unchanged) ───────────────────────────────
  const isAdmin = user?.role?.toLowerCase() === "admin";

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto"
            style={{
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.2)",
            }}
          >
            <Lock size={28} color="#ef4444" />
          </div>
          <div>
            <h2
              className="text-xl font-bold text-white"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              Access Denied
            </h2>
            <p className="text-sm mt-1" style={{ color: "#6b7fa3" }}>
              Only administrators can create events.
            </p>
          </div>
          <button
            onClick={onBack}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:scale-105"
            style={{
              background: "linear-gradient(135deg, #10b981, #059669)",
              boxShadow: "0 4px 16px rgba(16,185,129,0.3)",
            }}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // ── Derived display values ────────────────────────────────
  const displayName = user?.name?.trim() || "Unknown User";
  const displayRole = user?.role?.trim() || "Viewer";
  const initials = getInitials(displayName);

  // ── Form state ────────────────────────────────────────────
  // Added: endDate, endTime, tags  (required or useful for the backend schema)
  // Kept:  name, description, date (startDate), time (startTime), venue, category
  // Removed: visibility (no matching backend field — kept UI-only if you want it)
  const [form, setForm] = useState({
    name: "",
    description: "",
    date: "",        // startDate date part (YYYY-MM-DD)
    time: "",        // startDate time part (HH:MM)
    endDate: "",     // endDate date part — NEW (required by schema)
    endTime: "",     // endDate time part — NEW
    venue: "",       // → location
    category: "",
    tags: "",        // comma-separated raw input → string[]
  });

  // Cover image — store both the File (for upload) and a blob preview URL
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Async state
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string>("");

  // ── Helpers ───────────────────────────────────────────────
  const handleSet = (key: string, val: string) =>
    setForm((f) => ({ ...f, [key]: val }));

  const handleFileSelect = (file: File) => {
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const clearCover = () => {
    setCoverFile(null);
    setCoverPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  // ── Validation ────────────────────────────────────────────
  // Backend requires: title, description, category, organizer, location, startDate, endDate
  const isValid =
    form.name.trim() &&
    form.description.trim() &&
    form.category &&
    form.date &&
    form.endDate &&
    form.venue.trim();

  // ── Submit ────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!isValid || submitting || submitted) return;
    setSubmitting(true);
    setError(null);

    try {
      // ── Step 1: upload cover image (optional) ─────────────
      let coverImageUrl = "";
      if (coverFile) {
        setStatusMsg("Uploading cover image…");
        coverImageUrl = await uploadCoverImage(coverFile);
      }

      // ── Step 2: build event payload ───────────────────────
      setStatusMsg("Creating event…");

      // Parse tags: "tag1, tag2, tag3" → ["tag1", "tag2", "tag3"]
      const tags = form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const payload = {
        title: form.name.trim(),
        description: form.description.trim(),
        category: form.category,
        organizer: displayName,                           // logged-in user's name
        location: form.venue.trim(),
        startDate: toISODateTime(form.date, form.time),
        endDate: toISODateTime(form.endDate, form.endTime),
        coverImage: coverImageUrl,
        tags,
        // status defaults to "upcoming" in the schema; omit unless you want to override
      };

      // ── Step 3: create event via REST API ─────────────────
      await createEventAPI(payload);

      setSubmitting(false);
      setSubmitted(true);
      setStatusMsg("Event created!");

      // Redirect after brief confirmation
      setTimeout(onCreated, 1200);
    } catch (err: unknown) {
      setSubmitting(false);
      setStatusMsg("");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  };

  // ─────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────
  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      {/* Header — unchanged */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm transition-all hover:opacity-70"
          style={{ color: "#6b7fa3" }}
        >
          <ArrowLeft size={16} /> Back
        </button>
        <div>
          <h2
            className="text-xl font-bold text-white"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            Create New Event
          </h2>
          <p className="text-sm" style={{ color: "#6b7fa3" }}>
            Fill in the details to publish your event
          </p>
        </div>
      </div>

      {/* Success banner */}
      {submitted && (
        <div
          className="flex items-center gap-3 p-4 rounded-xl"
          style={{
            background: "rgba(16,185,129,0.1)",
            border: "1px solid rgba(16,185,129,0.3)",
          }}
        >
          <Check size={18} color="#10b981" />
          <p className="text-sm font-medium" style={{ color: "#10b981" }}>
            Event created! Redirecting…
          </p>
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div
          className="flex items-start gap-3 p-4 rounded-xl"
          style={{
            background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.25)",
          }}
        >
          <AlertCircle size={18} color="#ef4444" className="mt-0.5 shrink-0" />
          <p className="text-sm" style={{ color: "#f87171" }}>
            {error}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left column: main fields ── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Cover image — same UI, but now stores the File object */}
          <div>
            <label
              className="block text-xs font-medium mb-2"
              style={{ color: "#6b7fa3" }}
            >
              Cover Image
            </label>
            <div
              className="relative rounded-2xl overflow-hidden cursor-pointer transition-all"
              style={{
                border: `2px dashed ${dragOver ? "#10b981" : "rgba(16,185,129,0.2)"}`,
                background: dragOver
                  ? "rgba(16,185,129,0.04)"
                  : "rgba(11,18,32,0.6)",
                minHeight: 180,
              }}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                const file = e.dataTransfer.files[0];
                if (file) handleFileSelect(file);
              }}
              onClick={() => fileRef.current?.click()}
            >
              <input
                ref={fileRef}
                type="file"
                className="hidden"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileSelect(file);
                }}
              />
              {coverPreview ? (
                <>
                  <img
                    src={coverPreview}
                    alt="Cover"
                    className="w-full h-48 object-cover"
                  />
                  <button
                    className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center transition-all"
                    style={{ background: "rgba(0,0,0,0.6)" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      clearCover();
                    }}
                  >
                    <X size={14} color="white" />
                  </button>
                  <div
                    className="absolute bottom-2 left-2 px-2 py-1 rounded-lg text-xs"
                    style={{
                      background: "rgba(0,0,0,0.6)",
                      color: "white",
                      backdropFilter: "blur(4px)",
                    }}
                  >
                    Click to change
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{
                      background: "rgba(16,185,129,0.1)",
                      border: "1px solid rgba(16,185,129,0.2)",
                    }}
                  >
                    <ImagePlus size={22} color="#6b7fa3" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-white">
                      Upload cover image
                    </p>
                    <p
                      className="text-xs mt-0.5"
                      style={{ color: "#6b7fa3" }}
                    >
                      Drag & drop or click · JPG, PNG, WebP
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Event name → title */}
          <div>
            <label
              className="block text-xs font-medium mb-1.5"
              style={{ color: "#6b7fa3" }}
            >
              Event Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Annual Tech Fest 2025"
              value={form.name}
              onChange={(e) => handleSet("name", e.target.value)}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
              style={{
                background: "rgba(11,18,32,0.8)",
                border: "1px solid rgba(16,185,129,0.15)",
                color: "#e8edf5",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "rgba(16,185,129,0.5)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "rgba(16,185,129,0.15)";
              }}
            />
          </div>

          {/* Description */}
          <div>
            <label
              className="block text-xs font-medium mb-1.5"
              style={{ color: "#6b7fa3" }}
            >
              Event Description *
            </label>
            <textarea
              placeholder="Describe your event — what to expect, who should attend, highlights..."
              value={form.description}
              onChange={(e) => handleSet("description", e.target.value)}
              rows={4}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none transition-all"
              style={{
                background: "rgba(11,18,32,0.8)",
                border: "1px solid rgba(16,185,129,0.15)",
                color: "#e8edf5",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "rgba(16,185,129,0.5)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "rgba(16,185,129,0.15)";
              }}
            />
          </div>

          {/* Start Date + Start Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                className="block text-xs font-medium mb-1.5"
                style={{ color: "#6b7fa3" }}
              >
                <Calendar size={11} className="inline mr-1" />
                Start Date *
              </label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => handleSet("date", e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{
                  background: "rgba(11,18,32,0.8)",
                  border: "1px solid rgba(16,185,129,0.15)",
                  color: "#e8edf5",
                  colorScheme: "dark",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "rgba(16,185,129,0.5)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "rgba(16,185,129,0.15)";
                }}
              />
            </div>
            <div>
              <label
                className="block text-xs font-medium mb-1.5"
                style={{ color: "#6b7fa3" }}
              >
                Start Time
              </label>
              <input
                type="time"
                value={form.time}
                onChange={(e) => handleSet("time", e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{
                  background: "rgba(11,18,32,0.8)",
                  border: "1px solid rgba(16,185,129,0.15)",
                  color: "#e8edf5",
                  colorScheme: "dark",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "rgba(16,185,129,0.5)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "rgba(16,185,129,0.15)";
                }}
              />
            </div>
          </div>

          {/* End Date + End Time — NEW (required by schema) */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                className="block text-xs font-medium mb-1.5"
                style={{ color: "#6b7fa3" }}
              >
                <Calendar size={11} className="inline mr-1" />
                End Date *
              </label>
              <input
                type="date"
                value={form.endDate}
                min={form.date || undefined}   // prevent end before start in the picker
                onChange={(e) => handleSet("endDate", e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{
                  background: "rgba(11,18,32,0.8)",
                  border: "1px solid rgba(16,185,129,0.15)",
                  color: "#e8edf5",
                  colorScheme: "dark",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "rgba(16,185,129,0.5)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "rgba(16,185,129,0.15)";
                }}
              />
            </div>
            <div>
              <label
                className="block text-xs font-medium mb-1.5"
                style={{ color: "#6b7fa3" }}
              >
                End Time
              </label>
              <input
                type="time"
                value={form.endTime}
                onChange={(e) => handleSet("endTime", e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{
                  background: "rgba(11,18,32,0.8)",
                  border: "1px solid rgba(16,185,129,0.15)",
                  color: "#e8edf5",
                  colorScheme: "dark",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "rgba(16,185,129,0.5)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "rgba(16,185,129,0.15)";
                }}
              />
            </div>
          </div>

          {/* Venue → location */}
          <div>
            <label
              className="block text-xs font-medium mb-1.5"
              style={{ color: "#6b7fa3" }}
            >
              Venue / Location *
            </label>
            <input
              type="text"
              placeholder="e.g. Main Auditorium, Campus Grounds"
              value={form.venue}
              onChange={(e) => handleSet("venue", e.target.value)}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
              style={{
                background: "rgba(11,18,32,0.8)",
                border: "1px solid rgba(16,185,129,0.15)",
                color: "#e8edf5",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "rgba(16,185,129,0.5)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "rgba(16,185,129,0.15)";
              }}
            />
          </div>

          {/* Tags — NEW (optional, comma-separated) */}
          <div>
            <label
              className="block text-xs font-medium mb-1.5"
              style={{ color: "#6b7fa3" }}
            >
              Tags{" "}
              <span style={{ color: "#4b5a73", fontWeight: 400 }}>
                (optional · comma-separated)
              </span>
            </label>
            <input
              type="text"
              placeholder="e.g. photography, annual, campus"
              value={form.tags}
              onChange={(e) => handleSet("tags", e.target.value)}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
              style={{
                background: "rgba(11,18,32,0.8)",
                border: "1px solid rgba(16,185,129,0.15)",
                color: "#e8edf5",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "rgba(16,185,129,0.5)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "rgba(16,185,129,0.15)";
              }}
            />
          </div>
        </div>

        {/* ── Right column: category + organizer + preview ── */}
        <div className="space-y-5">
          {/* Category — grid aligned to backend enum */}
          <div>
            <label
              className="block text-xs font-medium mb-2"
              style={{ color: "#6b7fa3" }}
            >
              <Tag size={11} className="inline mr-1" />
              Category *
            </label>
            <div className="grid grid-cols-2 gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleSet("category", cat)}
                  className="py-2 rounded-xl text-xs transition-all"
                  style={{
                    background:
                      form.category === cat
                        ? "rgba(16,185,129,0.15)"
                        : "rgba(11,18,32,0.8)",
                    border: `1px solid ${
                      form.category === cat
                        ? "rgba(16,185,129,0.5)"
                        : "rgba(16,185,129,0.1)"
                    }`,
                    color: form.category === cat ? "#10b981" : "#6b7fa3",
                    fontWeight: form.category === cat ? 600 : 400,
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Organizer info box — unchanged */}
          <div
            className="p-4 rounded-xl space-y-2"
            style={{
              background: "rgba(11,18,32,0.8)",
              border: "1px solid rgba(16,185,129,0.1)",
            }}
          >
            <p className="text-xs font-medium text-white">Organizer</p>
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                style={{
                  background: "linear-gradient(135deg, #10b981, #3b82f6)",
                  color: "white",
                }}
              >
                {initials}
              </div>
              <div>
                <p className="text-xs font-medium text-white">{displayName}</p>
                <p className="text-xs" style={{ color: "#6b7fa3" }}>
                  {displayRole}
                </p>
              </div>
            </div>
          </div>

          {/* Preview summary — unchanged */}
          {form.name && (
            <div
              className="p-4 rounded-xl space-y-2"
              style={{
                background: "rgba(16,185,129,0.04)",
                border: "1px solid rgba(16,185,129,0.15)",
              }}
            >
              <p
                className="text-xs font-medium"
                style={{ color: "#10b981" }}
              >
                Preview
              </p>
              <p className="text-sm font-semibold text-white">{form.name}</p>
              {form.category && (
                <span
                  className="inline-block text-xs px-2 py-0.5 rounded-full"
                  style={{
                    background: "rgba(59,130,246,0.15)",
                    color: "#93c5fd",
                  }}
                >
                  {form.category}
                </span>
              )}
              {form.date && (
                <p className="text-xs" style={{ color: "#6b7fa3" }}>
                  {form.date}
                  {form.time ? ` · ${form.time}` : ""}
                  {form.endDate ? ` → ${form.endDate}` : ""}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={handleSubmit}
          disabled={!isValid || submitting || submitted}
          className="flex-1 py-3 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all"
          style={{
            background:
              isValid && !submitting && !submitted
                ? "linear-gradient(135deg, #10b981, #059669)"
                : "rgba(255,255,255,0.08)",
            color:
              isValid && !submitting && !submitted ? "white" : "#6b7fa3",
            boxShadow:
              isValid && !submitting && !submitted
                ? "0 4px 20px rgba(16,185,129,0.3)"
                : "none",
            cursor:
              isValid && !submitting && !submitted
                ? "pointer"
                : "not-allowed",
          }}
        >
          {submitting ? (
            <>
              <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              {statusMsg || "Creating Event…"}
            </>
          ) : submitted ? (
            <>
              <Check size={16} /> Created!
            </>
          ) : (
            <>
              <Upload size={16} /> Create Event
            </>
          )}
        </button>
        <button
          onClick={onBack}
          className="px-6 py-3 rounded-xl text-sm transition-all hover:bg-white/5"
          style={{
            border: "1px solid rgba(16,185,129,0.2)",
            color: "#6b7fa3",
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}