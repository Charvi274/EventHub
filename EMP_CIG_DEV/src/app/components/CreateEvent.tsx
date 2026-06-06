import { useState, useRef } from "react";
import { ArrowLeft, Upload, Calendar, Tag, Globe, Lock, ImagePlus, X, Check } from "lucide-react";

interface CreateEventProps {
  onBack: () => void;
  onCreated: () => void;
}

const categories = ["Technical", "Cultural", "Sports", "Academic", "Arts", "Workshop", "Social", "Other"];

export function CreateEvent({ onBack, onCreated }: CreateEventProps) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    date: "",
    time: "",
    venue: "",
    category: "",
    visibility: "public" as "public" | "private",
  });
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleSet = (key: string, val: string) => setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = () => {
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      setTimeout(onCreated, 1200);
    }, 1600);
  };

  const isValid = form.name && form.date && form.category;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm transition-all hover:opacity-70"
          style={{ color: "#6b7fa3" }}
        >
          <ArrowLeft size={16} /> Back
        </button>
        <div>
          <h2 className="text-xl font-bold text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>Create New Event</h2>
          <p className="text-sm" style={{ color: "#6b7fa3" }}>Fill in the details to publish your event</p>
        </div>
      </div>

      {/* Success state */}
      {submitted && (
        <div
          className="flex items-center gap-3 p-4 rounded-xl"
          style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)" }}
        >
          <Check size={18} color="#10b981" />
          <p className="text-sm font-medium" style={{ color: "#10b981" }}>Event created! Redirecting to event page…</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: main fields */}
        <div className="lg:col-span-2 space-y-5">
          {/* Cover image */}
          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: "#6b7fa3" }}>Cover Image</label>
            <div
              className="relative rounded-2xl overflow-hidden cursor-pointer transition-all"
              style={{
                border: `2px dashed ${dragOver ? "#10b981" : "rgba(16,185,129,0.2)"}`,
                background: dragOver ? "rgba(16,185,129,0.04)" : "rgba(11,18,32,0.6)",
                minHeight: 180,
              }}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                const file = e.dataTransfer.files[0];
                if (file) setCoverPreview(URL.createObjectURL(file));
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
                  if (file) setCoverPreview(URL.createObjectURL(file));
                }}
              />
              {coverPreview ? (
                <>
                  <img src={coverPreview} alt="Cover" className="w-full h-48 object-cover" />
                  <button
                    className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center transition-all"
                    style={{ background: "rgba(0,0,0,0.6)" }}
                    onClick={(e) => { e.stopPropagation(); setCoverPreview(null); }}
                  >
                    <X size={14} color="white" />
                  </button>
                  <div
                    className="absolute bottom-2 left-2 px-2 py-1 rounded-lg text-xs"
                    style={{ background: "rgba(0,0,0,0.6)", color: "white", backdropFilter: "blur(4px)" }}
                  >
                    Click to change
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)" }}
                  >
                    <ImagePlus size={22} color="#6b7fa3" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-white">Upload cover image</p>
                    <p className="text-xs mt-0.5" style={{ color: "#6b7fa3" }}>Drag & drop or click · JPG, PNG, WebP</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Event name */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "#6b7fa3" }}>Event Name *</label>
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
              onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(16,185,129,0.5)"; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(16,185,129,0.15)"; }}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "#6b7fa3" }}>Event Description</label>
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
              onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(16,185,129,0.5)"; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(16,185,129,0.15)"; }}
            />
          </div>

          {/* Date + Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "#6b7fa3" }}>
                <Calendar size={11} className="inline mr-1" />Event Date *
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
                onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(16,185,129,0.5)"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(16,185,129,0.15)"; }}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "#6b7fa3" }}>Start Time</label>
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
                onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(16,185,129,0.5)"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(16,185,129,0.15)"; }}
              />
            </div>
          </div>

          {/* Venue */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "#6b7fa3" }}>Venue / Location</label>
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
              onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(16,185,129,0.5)"; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(16,185,129,0.15)"; }}
            />
          </div>
        </div>

        {/* Right: category + visibility + summary */}
        <div className="space-y-5">
          {/* Category */}
          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: "#6b7fa3" }}>
              <Tag size={11} className="inline mr-1" />Category *
            </label>
            <div className="grid grid-cols-2 gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleSet("category", cat)}
                  className="py-2 rounded-xl text-xs transition-all"
                  style={{
                    background: form.category === cat ? "rgba(16,185,129,0.15)" : "rgba(11,18,32,0.8)",
                    border: `1px solid ${form.category === cat ? "rgba(16,185,129,0.5)" : "rgba(16,185,129,0.1)"}`,
                    color: form.category === cat ? "#10b981" : "#6b7fa3",
                    fontWeight: form.category === cat ? 600 : 400,
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Visibility */}
          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: "#6b7fa3" }}>Visibility</label>
            <div className="flex gap-2">
              {([
                { id: "public", label: "Public", icon: Globe, desc: "Visible to all members" },
                { id: "private", label: "Private", icon: Lock, desc: "Invite only" },
              ] as const).map(({ id, label, icon: Icon, desc }) => (
                <button
                  key={id}
                  onClick={() => handleSet("visibility", id)}
                  className="flex-1 flex flex-col items-center gap-1 p-3 rounded-xl transition-all"
                  style={{
                    background: form.visibility === id ? "rgba(16,185,129,0.1)" : "rgba(11,18,32,0.8)",
                    border: `1px solid ${form.visibility === id ? "rgba(16,185,129,0.4)" : "rgba(16,185,129,0.1)"}`,
                  }}
                >
                  <Icon size={16} color={form.visibility === id ? "#10b981" : "#6b7fa3"} />
                  <span className="text-xs font-medium" style={{ color: form.visibility === id ? "#10b981" : "white" }}>{label}</span>
                  <span className="text-xs text-center leading-tight" style={{ color: "#6b7fa3", fontSize: 10 }}>{desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Organizer info box */}
          <div
            className="p-4 rounded-xl space-y-2"
            style={{ background: "rgba(11,18,32,0.8)", border: "1px solid rgba(16,185,129,0.1)" }}
          >
            <p className="text-xs font-medium text-white">Organizer</p>
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ background: "linear-gradient(135deg, #10b981, #3b82f6)", color: "white" }}
              >
                A
              </div>
              <div>
                <p className="text-xs font-medium text-white">Arjun Mehta</p>
                <p className="text-xs" style={{ color: "#6b7fa3" }}>Admin</p>
              </div>
            </div>
            <div className="flex gap-1 flex-wrap mt-2">
              {["Photographer Access", "Public Upload"].map((perm) => (
                <span
                  key={perm}
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{ background: "rgba(16,185,129,0.08)", color: "#10b981", border: "1px solid rgba(16,185,129,0.2)" }}
                >
                  {perm}
                </span>
              ))}
            </div>
          </div>

          {/* Preview summary */}
          {form.name && (
            <div
              className="p-4 rounded-xl space-y-2"
              style={{ background: "rgba(16,185,129,0.04)", border: "1px solid rgba(16,185,129,0.15)" }}
            >
              <p className="text-xs font-medium" style={{ color: "#10b981" }}>Preview</p>
              <p className="text-sm font-semibold text-white">{form.name}</p>
              {form.category && (
                <span
                  className="inline-block text-xs px-2 py-0.5 rounded-full"
                  style={{ background: "rgba(59,130,246,0.15)", color: "#93c5fd" }}
                >
                  {form.category}
                </span>
              )}
              {form.date && <p className="text-xs" style={{ color: "#6b7fa3" }}>{form.date}{form.time ? ` · ${form.time}` : ""}</p>}
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
            background: isValid && !submitting && !submitted
              ? "linear-gradient(135deg, #10b981, #059669)"
              : "rgba(255,255,255,0.08)",
            color: isValid && !submitting && !submitted ? "white" : "#6b7fa3",
            boxShadow: isValid && !submitting && !submitted ? "0 4px 20px rgba(16,185,129,0.3)" : "none",
            cursor: isValid && !submitting && !submitted ? "pointer" : "not-allowed",
          }}
        >
          {submitting ? (
            <>
              <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              Creating Event…
            </>
          ) : submitted ? (
            <><Check size={16} /> Created!</>
          ) : (
            <><Upload size={16} /> Create Event</>
          )}
        </button>
        <button
          onClick={onBack}
          className="px-6 py-3 rounded-xl text-sm transition-all hover:bg-white/5"
          style={{ border: "1px solid rgba(16,185,129,0.2)", color: "#6b7fa3" }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
