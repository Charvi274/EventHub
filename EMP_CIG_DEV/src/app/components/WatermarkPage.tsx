import { useState } from "react";
import { Shield, Droplets, Check, Eye, Download, AlertCircle, ChevronRight } from "lucide-react";

function Toggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className="relative flex-shrink-0 transition-all duration-200"
      style={{
        width: 44,
        height: 24,
        borderRadius: 12,
        background: enabled ? "#10b981" : "rgba(255,255,255,0.12)",
        boxShadow: enabled ? "0 0 10px rgba(16,185,129,0.4)" : "none",
      }}
    >
      <div
        className="absolute top-1 transition-all duration-200"
        style={{
          width: 16,
          height: 16,
          borderRadius: 8,
          background: "white",
          left: enabled ? 24 : 4,
          boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
        }}
      />
    </button>
  );
}

const positionOptions = [
  { id: "bottom-right", label: "Bottom Right" },
  { id: "bottom-left", label: "Bottom Left" },
  { id: "top-right", label: "Top Right" },
  { id: "center", label: "Center (Diagonal)" },
];

const opacityOptions = [15, 25, 40, 60, 80];

export function WatermarkPage() {
  const [enabled, setEnabled] = useState(true);
  const [clubName, setClubName] = useState("CSE Department");
  const [eventName, setEventName] = useState("Annual Tech Fest 2025");
  const [includeRole, setIncludeRole] = useState(true);
  const [includeDate, setIncludeDate] = useState(true);
  const [includeIcon, setIncludeIcon] = useState(true);
  const [position, setPosition] = useState("bottom-right");
  const [opacity, setOpacity] = useState(25);
  const [applyAll, setApplyAll] = useState(false);
  const [saved, setSaved] = useState(false);

  const watermarkText = [
    includeIcon ? "📸 " : "",
    clubName,
    eventName ? ` · ${eventName}` : "",
    includeRole ? " · Photographer" : "",
    includeDate ? ` · ${new Date().getFullYear()}` : "",
  ].join("");

  const getWatermarkStyle = () => {
    const posMap: Record<string, React.CSSProperties> = {
      "bottom-right": { bottom: 16, right: 16 },
      "bottom-left": { bottom: 16, left: 16 },
      "top-right": { top: 16, right: 16 },
      "center": { top: "50%", left: "50%", transform: "translate(-50%, -50%) rotate(-25deg)" },
    };
    return posMap[position] || { bottom: 16, right: 16 };
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
            <Droplets size={20} color="#10b981" /> Watermark Settings
          </h2>
          <p className="text-sm mt-0.5" style={{ color: "#6b7fa3" }}>
            Protect your event photos with automatic watermarking on download
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm" style={{ color: "#6b7fa3" }}>{enabled ? "Enabled" : "Disabled"}</span>
          <Toggle enabled={enabled} onToggle={() => setEnabled(!enabled)} />
        </div>
      </div>

      {/* Disabled banner */}
      {!enabled && (
        <div
          className="flex items-center gap-3 p-4 rounded-xl"
          style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.2)" }}
        >
          <AlertCircle size={16} color="#f59e0b" />
          <p className="text-sm" style={{ color: "#c4cdd8" }}>
            Watermarking is disabled. Photos downloaded by users will have no attribution. Enable to protect your media.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Left: settings */}
        <div className="space-y-5">
          {/* Text settings */}
          <div
            className="p-5 rounded-2xl space-y-4"
            style={{
              background: "rgba(11,18,32,0.8)",
              border: "1px solid rgba(16,185,129,0.1)",
              opacity: enabled ? 1 : 0.5,
              pointerEvents: enabled ? "auto" : "none",
            }}
          >
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#6b7fa3" }}>Watermark Content</p>

            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "#6b7fa3" }}>Club / Organization Name</label>
              <input
                type="text"
                value={clubName}
                onChange={(e) => setClubName(e.target.value)}
                placeholder="e.g. CSE Department"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(16,185,129,0.15)",
                  color: "#e8edf5",
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(16,185,129,0.5)"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(16,185,129,0.15)"; }}
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "#6b7fa3" }}>Event Name</label>
              <input
                type="text"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                placeholder="e.g. Annual Tech Fest 2025"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(16,185,129,0.15)",
                  color: "#e8edf5",
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(16,185,129,0.5)"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(16,185,129,0.15)"; }}
              />
            </div>

            {/* Toggles */}
            <div className="space-y-3">
              {[
                { label: "Include user role", desc: "e.g. Photographer, Admin", val: includeRole, set: () => setIncludeRole(!includeRole) },
                { label: "Include year", desc: "Append the current year", val: includeDate, set: () => setIncludeDate(!includeDate) },
                { label: "Include camera icon", desc: "Adds 📸 prefix", val: includeIcon, set: () => setIncludeIcon(!includeIcon) },
              ].map(({ label, desc, val, set }) => (
                <div key={label} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white">{label}</p>
                    <p className="text-xs" style={{ color: "#6b7fa3" }}>{desc}</p>
                  </div>
                  <Toggle enabled={val} onToggle={set} />
                </div>
              ))}
            </div>
          </div>

          {/* Position & Opacity */}
          <div
            className="p-5 rounded-2xl space-y-4"
            style={{
              background: "rgba(11,18,32,0.8)",
              border: "1px solid rgba(16,185,129,0.1)",
              opacity: enabled ? 1 : 0.5,
              pointerEvents: enabled ? "auto" : "none",
            }}
          >
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#6b7fa3" }}>Position & Visibility</p>

            <div>
              <p className="text-xs font-medium mb-2" style={{ color: "#6b7fa3" }}>Position</p>
              <div className="grid grid-cols-2 gap-2">
                {positionOptions.map(({ id, label }) => (
                  <button
                    key={id}
                    onClick={() => setPosition(id)}
                    className="py-2 rounded-xl text-xs transition-all"
                    style={{
                      background: position === id ? "rgba(16,185,129,0.12)" : "rgba(255,255,255,0.03)",
                      border: `1px solid ${position === id ? "rgba(16,185,129,0.4)" : "rgba(255,255,255,0.06)"}`,
                      color: position === id ? "#10b981" : "#6b7fa3",
                      fontWeight: position === id ? 600 : 400,
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium" style={{ color: "#6b7fa3" }}>Opacity</p>
                <span className="text-xs font-medium" style={{ color: "#10b981" }}>{opacity}%</span>
              </div>
              <div className="flex gap-2">
                {opacityOptions.map((op) => (
                  <button
                    key={op}
                    onClick={() => setOpacity(op)}
                    className="flex-1 py-1.5 rounded-lg text-xs transition-all"
                    style={{
                      background: opacity === op ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.03)",
                      border: `1px solid ${opacity === op ? "rgba(16,185,129,0.4)" : "rgba(255,255,255,0.06)"}`,
                      color: opacity === op ? "#10b981" : "#6b7fa3",
                    }}
                  >
                    {op}%
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div>
                <p className="text-sm text-white">Apply to all future downloads</p>
                <p className="text-xs" style={{ color: "#6b7fa3" }}>Auto-apply watermark globally across all events</p>
              </div>
              <Toggle enabled={applyAll} onToggle={() => setApplyAll(!applyAll)} />
            </div>
          </div>
        </div>

        {/* Right: preview */}
        <div className="space-y-4">
          {/* Before */}
          <div>
            <p className="text-xs font-medium mb-2 flex items-center gap-2" style={{ color: "#6b7fa3" }}>
              <Eye size={12} /> Original Photo (no watermark)
            </p>
            <div
              className="relative rounded-2xl overflow-hidden"
              style={{ border: "1px solid rgba(255,255,255,0.06)", height: 220 }}
            >
              <img
                src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&h=400&fit=crop&auto=format"
                alt="Before watermark"
                className="w-full h-full object-cover"
              />
              <div
                className="absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-medium"
                style={{ background: "rgba(0,0,0,0.6)", color: "#6b7fa3", backdropFilter: "blur(4px)" }}
              >
                Before Download
              </div>
            </div>
          </div>

          {/* After */}
          <div>
            <p className="text-xs font-medium mb-2 flex items-center gap-2" style={{ color: "#6b7fa3" }}>
              <Droplets size={12} color="#10b981" />
              <span style={{ color: "#10b981" }}>After Download</span> — watermark applied
            </p>
            <div
              className="relative rounded-2xl overflow-hidden"
              style={{ border: "1px solid rgba(16,185,129,0.2)", height: 220 }}
            >
              <img
                src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&h=400&fit=crop&auto=format"
                alt="After watermark"
                className="w-full h-full object-cover"
              />

              {/* Diagonal tiled pattern for center */}
              {position === "center" && enabled && (
                <div
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ pointerEvents: "none" }}
                >
                  {[-1, 0, 1].map((row) =>
                    [-1, 0, 1].map((col) => (
                      <div
                        key={`${row}-${col}`}
                        className="absolute text-white font-medium"
                        style={{
                          fontSize: 11,
                          opacity: opacity / 100,
                          transform: `translate(${col * 140}px, ${row * 60}px) rotate(-25deg)`,
                          whiteSpace: "nowrap",
                          textShadow: "0 1px 3px rgba(0,0,0,0.8)",
                          letterSpacing: "0.02em",
                        }}
                      >
                        {watermarkText}
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Single position watermark */}
              {position !== "center" && enabled && (
                <div
                  className="absolute text-white font-medium"
                  style={{
                    ...getWatermarkStyle(),
                    fontSize: 11,
                    opacity: opacity / 100,
                    whiteSpace: "nowrap",
                    textShadow: "0 1px 4px rgba(0,0,0,0.9)",
                    background: "rgba(0,0,0,0.35)",
                    padding: "4px 8px",
                    borderRadius: 6,
                    backdropFilter: "blur(4px)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    letterSpacing: "0.02em",
                  }}
                >
                  {watermarkText}
                </div>
              )}

              <div
                className="absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1"
                style={{ background: "rgba(16,185,129,0.2)", color: "#10b981", backdropFilter: "blur(4px)", border: "1px solid rgba(16,185,129,0.4)" }}
              >
                <Shield size={10} /> Protected
              </div>
            </div>
          </div>

          {/* Watermark text preview */}
          <div
            className="p-4 rounded-xl"
            style={{ background: "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.15)" }}
          >
            <p className="text-xs font-medium mb-1" style={{ color: "#6b7fa3" }}>Watermark text preview</p>
            <p className="text-sm font-medium" style={{ color: enabled ? "#10b981" : "#6b7fa3" }}>
              {enabled ? watermarkText || "No content configured" : "Watermarking disabled"}
            </p>
          </div>

          {/* How it works */}
          <div
            className="p-4 rounded-xl space-y-2"
            style={{ background: "rgba(11,18,32,0.8)", border: "1px solid rgba(16,185,129,0.08)" }}
          >
            <p className="text-xs font-semibold text-white">How it works</p>
            {[
              "User clicks Download on any photo",
              "Server applies watermark layer before delivery",
              "Watermarked file downloads to the user's device",
              "Original file stays unmodified in cloud storage",
            ].map((step, i) => (
              <div key={i} className="flex items-center gap-2.5 text-xs" style={{ color: "#6b7fa3" }}>
                <div
                  className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 text-xs"
                  style={{ background: "rgba(16,185,129,0.12)", color: "#10b981", fontSize: 9 }}
                >
                  {i + 1}
                </div>
                {step}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Save */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:scale-105"
          style={{
            background: saved ? "rgba(16,185,129,0.2)" : "linear-gradient(135deg, #10b981, #059669)",
            boxShadow: saved ? "none" : "0 4px 20px rgba(16,185,129,0.3)",
            border: saved ? "1px solid rgba(16,185,129,0.4)" : "none",
            color: saved ? "#10b981" : "white",
          }}
        >
          {saved ? <><Check size={15} /> Saved!</> : <><Shield size={15} /> Save Watermark Settings</>}
        </button>
        <button
          className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm transition-all hover:bg-white/5"
          style={{ border: "1px solid rgba(16,185,129,0.15)", color: "#6b7fa3" }}
        >
          <Download size={15} /> Test Download
        </button>
      </div>
    </div>
  );
}
