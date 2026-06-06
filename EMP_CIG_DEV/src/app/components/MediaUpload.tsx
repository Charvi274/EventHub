import { useState, useRef } from "react";
import { Upload, Image, Video, X, Check, ChevronDown, Tag, Camera, Film, AlertCircle } from "lucide-react";

const events = [
  "Annual Tech Fest 2025",
  "Cultural Night — Spring Edition",
  "Intercollege Sports Meet",
  "Freshers' Welcome 2025",
  "Robotics Workshop",
  "Photography Contest",
];

const suggestedTags = ["#TechFest", "#Cultural", "#Sports", "#Campus", "#Students", "#Memory", "#Event", "#College", "#2025"];

interface UploadFile {
  id: number;
  name: string;
  size: string;
  type: "image" | "video";
  progress: number;
  status: "uploading" | "done" | "error";
  preview: string;
}

const mockFiles: UploadFile[] = [
  { id: 1, name: "techfest_opening.jpg", size: "4.2 MB", type: "image", progress: 100, status: "done", preview: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=100&h=80&fit=crop&auto=format" },
  { id: 2, name: "cultural_dance.mp4", size: "84 MB", type: "video", progress: 72, status: "uploading", preview: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=100&h=80&fit=crop&auto=format" },
  { id: 3, name: "robotics_demo.jpg", size: "6.8 MB", type: "image", progress: 100, status: "done", preview: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=100&h=80&fit=crop&auto=format" },
];

export function MediaUpload() {
  const [dragOver, setDragOver] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState("Annual Tech Fest 2025");
  const [showEventMenu, setShowEventMenu] = useState(false);
  const [tags, setTags] = useState<string[]>(["#TechFest", "#2025"]);
  const [files, setFiles] = useState<UploadFile[]>(mockFiles);
  const fileRef = useRef<HTMLInputElement>(null);

  const removeTag = (tag: string) => setTags(tags.filter((t) => t !== tag));
  const addTag = (tag: string) => !tags.includes(tag) && setTags([...tags, tag]);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white mb-1" style={{ fontFamily: "'Outfit', sans-serif" }}>Upload Media</h2>
        <p className="text-sm" style={{ color: "#6b7fa3" }}>Share photos and videos from your events</p>
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
        onDrop={(e) => { e.preventDefault(); setDragOver(false); }}
        onClick={() => fileRef.current?.click()}
      >
        <input ref={fileRef} type="file" className="hidden" multiple accept="image/*,video/*" />

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
        {/* Event selection */}
        <div>
          <label className="block text-xs font-medium mb-2" style={{ color: "#6b7fa3" }}>Assign to Event</label>
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
                {selectedEvent}
              </div>
              <ChevronDown size={15} style={{ color: "#6b7fa3" }} />
            </button>
            {showEventMenu && (
              <div
                className="absolute top-full left-0 right-0 mt-1 rounded-xl overflow-hidden z-50"
                style={{ background: "#0d1628", border: "1px solid rgba(16,185,129,0.2)", boxShadow: "0 20px 40px rgba(0,0,0,0.5)" }}
              >
                {events.map((ev) => (
                  <button
                    key={ev}
                    className="w-full px-4 py-2.5 text-left text-sm hover:bg-white/5 transition-colors flex items-center gap-2"
                    style={{ color: selectedEvent === ev ? "#10b981" : "#c4cdd8" }}
                    onClick={() => { setSelectedEvent(ev); setShowEventMenu(false); }}
                  >
                    {selectedEvent === ev && <Check size={14} />}
                    {ev}
                  </button>
                ))}
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
          {suggestedTags.filter((t) => !tags.includes(t)).map((tag) => (
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
      <div>
        <p className="text-sm font-medium text-white mb-3">Uploading ({files.length} files)</p>
        <div className="space-y-3">
          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center gap-4 p-4 rounded-xl"
              style={{ background: "rgba(11,18,32,0.8)", border: "1px solid rgba(16,185,129,0.1)" }}
            >
              <div className="relative w-16 h-12 rounded-lg overflow-hidden flex-shrink-0" style={{ background: "#0b1220" }}>
                <img src={file.preview} alt={file.name} className="w-full h-full object-cover" />
                {file.type === "video" && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <Video size={14} color="white" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-white truncate">{file.name}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs" style={{ color: "#6b7fa3" }}>{file.size}</span>
                    {file.status === "done" && <Check size={14} color="#10b981" />}
                    {file.status === "error" && <AlertCircle size={14} color="#ef4444" />}
                    <button className="hover:text-red-400 transition-colors" style={{ color: "#6b7fa3" }}>
                      <X size={14} />
                    </button>
                  </div>
                </div>

                <div className="relative h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
                  <div
                    className="absolute left-0 top-0 h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${file.progress}%`,
                      background: file.status === "done"
                        ? "linear-gradient(90deg, #10b981, #059669)"
                        : file.status === "error"
                        ? "#ef4444"
                        : "linear-gradient(90deg, #3b82f6, #10b981)",
                    }}
                  />
                </div>

                <p className="text-xs mt-1" style={{ color: "#6b7fa3" }}>
                  {file.status === "done" ? "Uploaded successfully" : file.status === "error" ? "Upload failed" : `${file.progress}% uploaded`}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Submit */}
      <div className="flex gap-3 pt-2">
        <button
          className="flex-1 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:scale-[1.02]"
          style={{ background: "linear-gradient(135deg, #10b981, #059669)", boxShadow: "0 4px 20px rgba(16,185,129,0.3)" }}
        >
          Publish All Media
        </button>
        <button
          className="px-6 py-3 rounded-xl text-sm transition-all hover:bg-white/5"
          style={{ border: "1px solid rgba(16,185,129,0.2)", color: "#6b7fa3" }}
        >
          Save Draft
        </button>
      </div>
    </div>
  );
}
