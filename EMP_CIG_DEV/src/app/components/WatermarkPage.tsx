import { useState, useEffect } from "react";
import { Shield, Droplets, Check, AlertCircle } from "lucide-react";
import { API_BASE_URL } from '../config';
// ── Auth helper ───────────────────────────────────────────────────────────────
function getToken(): string {
  return localStorage.getItem("token") || sessionStorage.getItem("token") || "";
}

// ── Sub-components ────────────────────────────────────────────────────────────
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
  { id: "bottom-left",  label: "Bottom Left"  },
  { id: "top-right",    label: "Top Right"    },
  { id: "center",       label: "Center (Diagonal)" },
];

const opacityOptions = [15, 25, 40, 60, 80];

// ── Types ─────────────────────────────────────────────────────────────────────
interface WatermarkSettings {
  enabled:     boolean;
  clubName:    string;
  eventName:   string;
  includeRole: boolean;
  includeDate: boolean;
  position:    "bottom-right" | "bottom-left" | "top-right" | "center";
  opacity:     15 | 25 | 40 | 60 | 80;
}

const DEFAULTS: WatermarkSettings = {
  enabled:     true,
  clubName:    "CSE Department",
  eventName:   "Annual Tech Fest 2025",
  includeRole: true,
  includeDate: true,
  position:    "bottom-right",
  opacity:     25,
};

// ── Component ─────────────────────────────────────────────────────────────────
export function WatermarkPage() {
  const [enabled,     setEnabled]     = useState(DEFAULTS.enabled);
  const [clubName,    setClubName]    = useState(DEFAULTS.clubName);
  const [eventName,   setEventName]   = useState(DEFAULTS.eventName);
  const [includeRole, setIncludeRole] = useState(DEFAULTS.includeRole);
  const [includeDate, setIncludeDate] = useState(DEFAULTS.includeDate);
  const [position,    setPosition]    = useState<WatermarkSettings["position"]>(DEFAULTS.position);
  const [opacity,     setOpacity]     = useState<WatermarkSettings["opacity"]>(DEFAULTS.opacity);
  const [userRole,    setUserRole]    = useState<string>("Photographer");

  // ── Feedback state ──────────────────────────────────────────────────────────
  const [saved,    setSaved]    = useState(false);
  const [loading,  setLoading]  = useState(true);   // initial fetch
  const [saving,   setSaving]   = useState(false);  // PUT in progress
  const [saveError, setSaveError] = useState<string | null>(null);

  // ── Load settings from backend on mount ────────────────────────────────────
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/auth/watermark-settings`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then((r) => r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`)))
      .then((data) => {
        const s: WatermarkSettings = data.watermarkSettings;
        if (!s) return; // nothing stored yet; keep defaults

        // Only update fields that are explicitly present in the response
        // so we never overwrite a default with undefined.
        if (s.enabled     !== undefined) setEnabled(s.enabled);
        if (s.clubName    !== undefined) setClubName(s.clubName);
        if (s.eventName   !== undefined) setEventName(s.eventName);
        if (s.includeRole !== undefined) setIncludeRole(s.includeRole);
        if (s.includeDate !== undefined) setIncludeDate(s.includeDate);
        if (s.position    !== undefined) setPosition(s.position);
        if (s.opacity     !== undefined) setOpacity(s.opacity as WatermarkSettings["opacity"]);
      })
      .catch(() => {
        // Silently fall back to defaults — the user can still save manually
      })
      .finally(() => setLoading(false));

    // Fetch the logged-in user's actual role for the preview
    fetch(`${API_BASE_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then((data) => {
        const role = data?.user?.role ?? data?.role;
        if (role) setUserRole(role);
      })
      .catch(() => { /* keep default */ });
  }, []);

  // ── Derived watermark text (mirrors UI preview logic) ──────────────────────
  const watermarkText = [
    clubName,
    eventName || null,
    includeRole ? userRole : null,
    includeDate ? String(new Date().getFullYear()) : null,
  ].filter(Boolean).join(" - ");

  // ── Watermark overlay position style (for the preview image) ────────────────
  const getWatermarkOverlayStyle = (): React.CSSProperties => {
    const base: React.CSSProperties = {
      position: "absolute",
      fontSize: 11,
      fontWeight: 500,
      color: "white",
      whiteSpace: "nowrap",
      opacity: opacity / 100,
      textShadow: "0 1px 4px rgba(0,0,0,0.9)",
      letterSpacing: "0.03em",
      pointerEvents: "none",
    };
    if (position === "center") return base; // handled separately with transform
    const posMap: Record<string, React.CSSProperties> = {
      "bottom-right": { bottom: 12, right: 12 },
      "bottom-left":  { bottom: 12, left: 12 },
      "top-right":    { top: 12, right: 12 },
    };
    return { ...base, ...(posMap[position] ?? { bottom: 12, right: 12 }) };
  };

  // ── Save handler ───────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    setSaveError(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/watermark-settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          enabled,
          clubName,
          eventName,
          includeRole,
          includeDate,
          position,
          opacity,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `HTTP ${res.status}`);
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to save settings.";
      setSaveError(message);
    } finally {
      setSaving(false);
    }
  };

  // ── Test download handler ──────────────────────────────────────────────────
  // Opens the Unsplash preview image with current watermark settings applied
  // via a Cloudinary-style URL — useful for verifying position/opacity visually.
  // Since the preview image is not on the project's Cloudinary account, this
  // simply opens the raw preview URL in a new tab as a no-op placeholder.
  

  // ── Loading skeleton ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: 320 }}>
        <div
          className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: "rgba(16,185,129,0.4)", borderTopColor: "transparent" }}
        />
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────
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

      {/* Save error banner */}
      {saveError && (
        <div
          className="flex items-center gap-3 p-4 rounded-xl"
          style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)" }}
        >
          <AlertCircle size={16} color="#ef4444" />
          <p className="text-sm" style={{ color: "#c4cdd8" }}>{saveError}</p>
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
                onBlur={(e)  => { e.currentTarget.style.borderColor = "rgba(16,185,129,0.15)"; }}
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
                onBlur={(e)  => { e.currentTarget.style.borderColor = "rgba(16,185,129,0.15)"; }}
              />
            </div>

            {/* Toggles */}
            <div className="space-y-3">
              {[
                { label: "Include user role", desc: "e.g. Photographer, Admin", val: includeRole, set: () => setIncludeRole(!includeRole) },
                { label: "Include year",      desc: "Append the current year",   val: includeDate, set: () => setIncludeDate(!includeDate) },
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
                    onClick={() => setPosition(id as WatermarkSettings["position"])}
                    className="px-3 py-2 rounded-lg text-xs transition-all text-left"
                    style={{
                      background: position === id ? "rgba(16,185,129,0.12)" : "rgba(255,255,255,0.03)",
                      border: `1px solid ${position === id ? "rgba(16,185,129,0.4)" : "rgba(255,255,255,0.06)"}`,
                      color: position === id ? "#10b981" : "#6b7fa3",
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
                    onClick={() => setOpacity(op as WatermarkSettings["opacity"])}
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


          </div>
        </div>

        {/* Right: preview */}
        <div className="space-y-4">
          {/* Image watermark preview */}
          <div
            className="p-5 rounded-2xl space-y-3"
            style={{ background: "rgba(11,18,32,0.8)", border: "1px solid rgba(16,185,129,0.1)" }}
          >
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#6b7fa3" }}>Watermark Preview</p>

            {/* Sample image with live overlay */}
            <div
              className="relative rounded-xl overflow-hidden"
              style={{ height: 200, border: "1px solid rgba(16,185,129,0.15)" }}
            >
              <img
                src="https://thumbs.dreamstime.com/b/preview-torn-green-paper-revealing-word-78469923.jpg"
                alt="Watermark preview"
                className="w-full h-full object-cover"
              />

              {/* Dim overlay when watermark disabled */}
              {!enabled && (
                <div
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ background: "rgba(0,0,0,0.55)" }}
                >
                  <span className="text-xs font-medium" style={{ color: "#6b7fa3" }}>Watermarking disabled</span>
                </div>
              )}

              {/* Center: tiled diagonal */}
              {enabled && position === "center" && (
                <div className="absolute inset-0" style={{ pointerEvents: "none" }}>
                  {[-1, 0, 1].map((row) =>
                    [-1, 0, 1].map((col) => (
                      <div
                        key={`${row}-${col}`}
                        className="absolute text-white font-medium"
                        style={{
                          top: "50%",
                          left: "50%",
                          fontSize: 11,
                          opacity: opacity / 100,
                          transform: `translate(calc(-50% + ${col * 130}px), calc(-50% + ${row * 52}px)) rotate(-25deg)`,
                          whiteSpace: "nowrap",
                          textShadow: "0 1px 3px rgba(0,0,0,0.9)",
                          letterSpacing: "0.03em",
                        }}
                      >
                        {watermarkText || "—"}
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Edge positions */}
              {enabled && position !== "center" && (
                <div style={getWatermarkOverlayStyle()}>
                  {watermarkText || "—"}
                </div>
              )}

              {/* "Protected" badge */}
              {enabled && (
                <div
                  className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1"
                  style={{ background: "rgba(16,185,129,0.2)", color: "#10b981", backdropFilter: "blur(4px)", border: "1px solid rgba(16,185,129,0.4)" }}
                >
                  <Shield size={9} /> Protected
                </div>
              )}
            </div>

            {/* Text readout below image */}
            <div
              className="px-3 py-2 rounded-lg"
              style={{ background: "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.1)" }}
            >
              <p className="text-xs font-mono break-all" style={{ color: enabled ? "#10b981" : "#6b7fa3" }}>
                {enabled ? watermarkText || "No content configured" : "Watermarking disabled"}
              </p>
            </div>

            <p className="text-xs" style={{ color: "#6b7fa3" }}>
              Position: <span className="text-white">{positionOptions.find(p => p.id === position)?.label}</span>
              {" · "}Opacity: <span className="text-white">{opacity}%</span>
            </p>
          </div>

          {/* How it works */}
          <div
            className="p-5 rounded-2xl space-y-2"
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

      {/* Save row */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
          style={{
            background: saved ? "rgba(16,185,129,0.2)" : "linear-gradient(135deg, #10b981, #059669)",
            boxShadow: saved ? "none" : "0 4px 20px rgba(16,185,129,0.3)",
            border: saved ? "1px solid rgba(16,185,129,0.4)" : "none",
            color: saved ? "#10b981" : "white",
          }}
        >
          {saved   ? <><Check size={15} /> Saved!</>
         : saving  ? <><div className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" /> Saving…</>
         :           <><Shield size={15} /> Save Watermark Settings</>}
        </button>
        
      </div>
    </div>
  );
}