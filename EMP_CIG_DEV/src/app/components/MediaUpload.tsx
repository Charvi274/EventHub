import { useState, useRef, useEffect } from "react";
import {
  Upload, Image, Video, X, Check, ChevronDown,
  Tag, Camera, Film, AlertCircle,
} from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────────

interface BackendEvent {
  _id: string;
  title: string;
  category?: string;
}

interface UploadFile {
  /** stable key generated when the file is selected */
  uid: string;
  file: File;
  name: string;
  size: string;
  type: "image" | "video";
  progress: number;
  status: "pending" | "uploading" | "done" | "error";
  errorMsg?: string;
  preview: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Strip extension → use as media title on the backend */
function fileTitle(name: string): string {
  return name.replace(/\.[^/.]+$/, "").replace(/[_-]+/g, " ");
}

function uid(): string {
  return Math.random().toString(36).slice(2) + Date.now();
}

const FALLBACK_PREVIEW = "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=100&h=80&fit=crop&auto=format";

const suggestedTags = [
  "#TechFest", "#Cultural", "#Sports", "#Campus",
  "#Students", "#Memory", "#Event", "#College", "#2025",
];

// ── Component ────────────────────────────────────────────────────────────────

export function MediaUpload() {
  // ── State ──────────────────────────────────────────────────────────────────
  const [dragOver, setDragOver]           = useState(false);
  const [events, setEvents]               = useState<BackendEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [showEventMenu, setShowEventMenu] = useState(false);
  const [tags, setTags]                   = useState<string[]>(["#2025"]);
  const [files, setFiles]                 = useState<UploadFile[]>([]);
  const [uploading, setUploading]         = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // ── Fetch events ───────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const token =
          localStorage.getItem("token") ||
          sessionStorage.getItem("token") ||
          "";

        const res = await fetch("/api/events", {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        const raw: BackendEvent[] = Array.isArray(data)
          ? data
          : Array.isArray(data.data)
          ? data.data
          : Array.isArray(data.events)
          ? data.events
          : [];
        setEvents(raw);
        if (raw.length) setSelectedEventId(raw[0]._id);
      } catch {
        // events stay empty — user sees "No events found"
      } finally {
        setEventsLoading(false);
      }
    };
    load();
  }, []);

  // ── Tag helpers ────────────────────────────────────────────────────────────
  const removeTag = (tag: string) => setTags((t) => t.filter((x) => x !== tag));
  const addTag    = (tag: string) => setTags((t) => (t.includes(tag) ? t : [...t, tag]));

  // ── File selection ─────────────────────────────────────────────────────────
  const addFiles = (incoming: FileList | null) => {
    if (!incoming) return;
    const next: UploadFile[] = Array.from(incoming).map((f) => ({
      uid: uid(),
      file: f,
      name: f.name,
      size: formatBytes(f.size),
      type: f.type.startsWith("video/") ? "video" : "image",
      progress: 0,
      status: "pending",
      preview: f.type.startsWith("image/") ? URL.createObjectURL(f) : FALLBACK_PREVIEW,
    }));
    setFiles((prev) => [...prev, ...next]);
  };

  const removeFile = (fileUid: string) => {
    setFiles((prev) => {
      const f = prev.find((x) => x.uid === fileUid);
      if (f?.preview.startsWith("blob:")) URL.revokeObjectURL(f.preview);
      return prev.filter((x) => x.uid !== fileUid);
    });
  };

  const updateFile = (fileUid: string, patch: Partial<UploadFile>) =>
    setFiles((prev) => prev.map((f) => (f.uid === fileUid ? { ...f, ...patch } : f)));

  // ── Upload single file via XHR (for real progress) ─────────────────────────
  const uploadOne = (uf: UploadFile, eventId: string, token: string): Promise<void> =>
    new Promise((resolve) => {
      const formData = new FormData();
      formData.append("file", uf.file);
      formData.append("title", fileTitle(uf.name));
      formData.append("eventId", eventId);
      if (tags.length) formData.append("tags", tags.join(","));

      const xhr = new XMLHttpRequest();

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const pct = Math.round((e.loaded / e.total) * 100);
          updateFile(uf.uid, { progress: pct, status: "uploading" });
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          updateFile(uf.uid, { progress: 100, status: "done" });
        } else {
          let msg = "Upload failed";
          try { msg = JSON.parse(xhr.responseText)?.message || msg; } catch { /* noop */ }
          updateFile(uf.uid, { status: "error", errorMsg: msg });
        }
        resolve();
      };

      xhr.onerror = () => {
        updateFile(uf.uid, { status: "error", errorMsg: "Network error" });
        resolve();
      };

      xhr.open("POST", "/api/media/upload");
      if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);
      // Do NOT set Content-Type — browser sets multipart boundary automatically

      updateFile(uf.uid, { status: "uploading", progress: 0 });
      xhr.send(formData);
    });

  // ── Publish all ────────────────────────────────────────────────────────────
  const handlePublish = async () => {
    if (!selectedEventId) {
      alert("Please select an event before uploading.");
      return;
    }
    const pending = files.filter((f) => f.status === "pending" || f.status === "error");
    if (!pending.length) {
      alert("No files to upload. Add files first.");
      return;
    }

    setUploading(true);
    const token =
      localStorage.getItem("token") ||
      sessionStorage.getItem("token") ||
      "";

    // Upload all files in parallel
    await Promise.all(pending.map((f) => uploadOne(f, selectedEventId, token)));
    setUploading(false);
  };

  // ── Derived ────────────────────────────────────────────────────────────────
  const selectedEvent = events.find((e) => e._id === selectedEventId);
  const pendingCount  = files.filter((f) => f.status === "pending" || f.status === "error").length;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white mb-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
          Upload Media
        </h2>
        <p className="text-sm" style={{ color: "#6b7fa3" }}>
          Share photos and videos from your events
        </p>
      </div>

      {/* Drop zone */}
      <div
        className="relative rounded-2xl transition-all duration-300 cursor-pointer"
        style={{
          border: `2px dashed ${dragOver ? "#10b981" : "rgba(16,185,129,0.25)"}`,
          background: dragOver ? "rgba(16,185,129,0.05)" : "rgba(11,18,32,0.6)",
          minHeight: 220,
        }}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}
        onClick={() => fileRef.current?.click()}
      >
        <input
          ref={fileRef}
          type="file"
          className="hidden"
          multiple
          accept="image/*,video/*"
          onChange={(e) => addFiles(e.target.files)}
        />

        <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300"
            style={{
              background: dragOver ? "rgba(16,185,129,0.2)" : "rgba(16,185,129,0.08)",
              border: `1px solid ${dragOver ? "#10b981" : "rgba(16,185,129,0.2)"}`,
            }}
          >
            <Upload size={28} color={dragOver ? "#10b981" : "#6b7fa3"} />
          </div>
          <p className="text-base font-semibold text-white mb-1">
            {dragOver ? "Drop files here" : "Drag & drop or click to upload"}
          </p>
          <p className="text-sm mb-4" style={{ color: "#6b7fa3" }}>
            Supports JPG, PNG, GIF, MP4, MOV — up to 500MB per file
          </p>
          <div className="flex gap-3">
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white transition-all hover:scale-105"
              style={{ background: "linear-gradient(135deg, #10b981, #059669)", boxShadow: "0 4px 15px rgba(16,185,129,0.3)" }}
              onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }}
            >
              <Image size={16} /> Upload Photos
            </button>
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:scale-105"
              style={{ background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.3)", color: "#a78bfa" }}
              onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }}
            >
              <Film size={16} /> Upload Videos
            </button>
          </div>
          <p className="text-xs mt-3" style={{ color: "#6b7fa3" }}>
            <span style={{ color: "#10b981" }}>Tip:</span> Select multiple files at once for bulk upload
          </p>
        </div>
      </div>

      {/* Settings row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Event selection — driven by API */}
        <div>
          <label className="block text-xs font-medium mb-2" style={{ color: "#6b7fa3" }}>
            Assign to Event
          </label>
          <div className="relative">
            <button
              onClick={() => setShowEventMenu(!showEventMenu)}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm text-left transition-all"
              style={{
                background: "rgba(11,18,32,0.8)",
                border: "1px solid rgba(16,185,129,0.15)",
                color: "#e8edf5",
              }}
            >
              <div className="flex items-center gap-2">
                <Camera size={15} color="#10b981" />
                {eventsLoading
                  ? "Loading events…"
                  : selectedEvent
                  ? selectedEvent.title
                  : "No events available"}
              </div>
              <ChevronDown size={15} style={{ color: "#6b7fa3" }} />
            </button>

            {showEventMenu && !eventsLoading && (
              <div
                className="absolute top-full left-0 right-0 mt-1 rounded-xl overflow-hidden z-50 max-h-56 overflow-y-auto"
                style={{
                  background: "#0d1628",
                  border: "1px solid rgba(16,185,129,0.2)",
                  boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
                }}
              >
                {events.length === 0 ? (
                  <p className="px-4 py-3 text-sm" style={{ color: "#6b7fa3" }}>
                    No events found.
                  </p>
                ) : (
                  events.map((ev) => (
                    <button
                      key={ev._id}
                      className="w-full px-4 py-2.5 text-left text-sm hover:bg-white/5 transition-colors flex items-center gap-2"
                      style={{ color: selectedEventId === ev._id ? "#10b981" : "#c4cdd8" }}
                      onClick={() => { setSelectedEventId(ev._id); setShowEventMenu(false); }}
                    >
                      {selectedEventId === ev._id && <Check size={14} />}
                      {ev.title}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-xs font-medium mb-2" style={{ color: "#6b7fa3" }}>Tags</label>
          <div
            className="flex flex-wrap gap-2 px-3 py-2 rounded-xl min-h-[46px]"
            style={{ background: "rgba(11,18,32,0.8)", border: "1px solid rgba(16,185,129,0.15)" }}
          >
            {tags.map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs"
                style={{ background: "rgba(16,185,129,0.12)", color: "#10b981", border: "1px solid rgba(16,185,129,0.25)" }}
              >
                {tag}
                <button onClick={() => removeTag(tag)} className="hover:text-red-400 transition-colors">
                  <X size={10} />
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Suggested tags */}
      <div>
        <p className="text-xs mb-2" style={{ color: "#6b7fa3" }}>
          <Tag size={11} className="inline mr-1" />Suggested tags
        </p>
        <div className="flex flex-wrap gap-2">
          {suggestedTags
            .filter((t) => !tags.includes(t))
            .map((tag) => (
              <button
                key={tag}
                onClick={() => addTag(tag)}
                className="px-3 py-1 rounded-full text-xs transition-all hover:scale-105"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#6b7fa3" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(16,185,129,0.08)"; e.currentTarget.style.borderColor = "rgba(16,185,129,0.3)"; e.currentTarget.style.color = "#10b981"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "#6b7fa3"; }}
              >
                + {tag}
              </button>
            ))}
        </div>
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div>
          <p className="text-sm font-medium text-white mb-3">
            {files.length} file{files.length !== 1 ? "s" : ""} selected
            {pendingCount > 0 && (
              <span className="ml-2 text-xs" style={{ color: "#6b7fa3" }}>
                ({pendingCount} pending)
              </span>
            )}
          </p>
          <div className="space-y-3">
            {files.map((file) => (
              <div
                key={file.uid}
                className="flex items-center gap-4 p-4 rounded-xl"
                style={{ background: "rgba(11,18,32,0.8)", border: "1px solid rgba(16,185,129,0.1)" }}
              >
                {/* Thumbnail */}
                <div className="relative w-16 h-12 rounded-lg overflow-hidden flex-shrink-0" style={{ background: "#0b1220" }}>
                  <img
                    src={file.preview}
                    alt={file.name}
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).src = FALLBACK_PREVIEW; }}
                  />
                  {file.type === "video" && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                      <Video size={14} color="white" />
                    </div>
                  )}
                </div>

                {/* Info + progress */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-white truncate">{file.name}</p>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                      <span className="text-xs" style={{ color: "#6b7fa3" }}>{file.size}</span>
                      {file.status === "done"     && <Check        size={14} color="#10b981" />}
                      {file.status === "error"    && <AlertCircle  size={14} color="#ef4444" />}
                      {file.status !== "uploading" && (
                        <button
                          onClick={() => removeFile(file.uid)}
                          className="hover:text-red-400 transition-colors"
                          style={{ color: "#6b7fa3" }}
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div
                    className="relative h-1.5 rounded-full overflow-hidden"
                    style={{ background: "rgba(255,255,255,0.08)" }}
                  >
                    <div
                      className="absolute left-0 top-0 h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${file.progress}%`,
                        background:
                          file.status === "done"
                            ? "linear-gradient(90deg, #10b981, #059669)"
                            : file.status === "error"
                            ? "#ef4444"
                            : "linear-gradient(90deg, #3b82f6, #10b981)",
                      }}
                    />
                  </div>

                  <p className="text-xs mt-1" style={{ color: "#6b7fa3" }}>
                    {file.status === "done"
                      ? "Uploaded successfully"
                      : file.status === "error"
                      ? file.errorMsg || "Upload failed"
                      : file.status === "uploading"
                      ? `${file.progress}% uploaded`
                      : "Ready to upload"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Submit */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={handlePublish}
          disabled={uploading || files.length === 0 || !selectedEventId}
          className="flex-1 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          style={{ background: "linear-gradient(135deg, #10b981, #059669)", boxShadow: "0 4px 20px rgba(16,185,129,0.3)" }}
        >
          {uploading ? "Uploading…" : `Publish ${pendingCount > 0 ? `${pendingCount} File${pendingCount !== 1 ? "s" : ""}` : "All Media"}`}
        </button>
        <button
          className="px-6 py-3 rounded-xl text-sm transition-all hover:bg-white/5"
          style={{ border: "1px solid rgba(16,185,129,0.2)", color: "#6b7fa3" }}
          onClick={() => setFiles([])}
        >
          Clear All
        </button>
      </div>
    </div>
  );
}