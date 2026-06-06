import { useState } from "react";
import { Upload, Scan, Sparkles, Camera, Image, Heart, Download, Share2, X, CheckCircle } from "lucide-react";

const matchedPhotos = [
  { id: 1, src: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=300&h=200&fit=crop&auto=format", event: "Tech Fest 2025", date: "May 28", confidence: 97, likes: 124 },
  { id: 2, src: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=300&h=200&fit=crop&auto=format", event: "Cultural Night", date: "May 15", confidence: 94, likes: 89 },
  { id: 3, src: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=300&h=200&fit=crop&auto=format", event: "Annual Day", date: "Apr 20", confidence: 91, likes: 212 },
  { id: 4, src: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=300&h=200&fit=crop&auto=format", event: "Sports Meet", date: "May 10", confidence: 88, likes: 67 },
  { id: 5, src: "https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=300&h=200&fit=crop&auto=format", event: "Cultural Night", date: "May 15", confidence: 86, likes: 158 },
  { id: 6, src: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=300&h=200&fit=crop&auto=format", event: "Freshers Night", date: "Aug 10", confidence: 85, likes: 203 },
];

export function MyPhotos() {
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [selfieUploaded, setSelfieUploaded] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState<number[]>([]);

  const handleScan = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      setScanned(true);
    }, 2500);
  };

  const toggleSelect = (id: number) =>
    setSelectedPhotos((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white mb-1 flex items-center gap-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
          <Sparkles size={20} color="#f59e0b" /> My Photos
        </h2>
        <p className="text-sm" style={{ color: "#6b7fa3" }}>AI-powered facial recognition to find all your photos across events</p>
      </div>

      {/* Main upload/scan card */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: "rgba(11,18,32,0.8)", border: "1px solid rgba(16,185,129,0.15)" }}
      >
        {/* Header banner */}
        <div
          className="p-6 relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(59,130,246,0.08) 100%)", borderBottom: "1px solid rgba(16,185,129,0.1)" }}
        >
          <div
            className="absolute -right-8 -top-8 w-40 h-40 rounded-full opacity-10"
            style={{ background: "radial-gradient(circle, #10b981, transparent)" }}
          />

          <div className="relative z-10 flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)" }}
            >
              <Scan size={28} color="#10b981" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Facial Recognition Search</h3>
              <p className="text-sm" style={{ color: "#6b7fa3" }}>
                Upload a clear selfie and our AI will find all your photos from every event
              </p>
            </div>
          </div>

          {/* Steps */}
          <div className="relative z-10 flex gap-4 mt-5">
            {[
              { step: "1", label: "Upload Selfie", icon: Upload, done: selfieUploaded },
              { step: "2", label: "AI Scans Events", icon: Scan, done: scanned },
              { step: "3", label: "View Your Photos", icon: Image, done: scanned },
            ].map(({ step, label, icon: Icon, done }) => (
              <div key={step} className="flex items-center gap-2">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{
                    background: done ? "rgba(16,185,129,0.2)" : "rgba(255,255,255,0.08)",
                    border: `1px solid ${done ? "rgba(16,185,129,0.5)" : "rgba(255,255,255,0.1)"}`,
                    color: done ? "#10b981" : "#6b7fa3",
                  }}
                >
                  {done ? <CheckCircle size={14} /> : step}
                </div>
                <span className="text-xs" style={{ color: done ? "#10b981" : "#6b7fa3" }}>{label}</span>
                {step !== "3" && <div className="w-8 h-px" style={{ background: "rgba(255,255,255,0.1)" }} />}
              </div>
            ))}
          </div>
        </div>

        {/* Upload zone */}
        <div className="p-6 flex flex-col lg:flex-row gap-6 items-center">
          {/* Selfie upload area */}
          <div
            className="flex flex-col items-center justify-center p-6 rounded-2xl cursor-pointer transition-all w-full lg:w-64 flex-shrink-0"
            style={{
              border: `2px dashed ${selfieUploaded ? "rgba(16,185,129,0.5)" : "rgba(16,185,129,0.2)"}`,
              background: selfieUploaded ? "rgba(16,185,129,0.05)" : "transparent",
              minHeight: 180,
            }}
            onClick={() => setSelfieUploaded(!selfieUploaded)}
          >
            {selfieUploaded ? (
              <>
                <div
                  className="w-20 h-20 rounded-full mb-3 overflow-hidden relative"
                  style={{ border: "2px solid #10b981", boxShadow: "0 0 20px rgba(16,185,129,0.3)" }}
                >
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&auto=format"
                    alt="Selfie"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-black/40 transition-opacity">
                    <X size={16} color="white" />
                  </div>
                </div>
                <p className="text-sm font-medium" style={{ color: "#10b981" }}>Selfie uploaded!</p>
                <p className="text-xs mt-0.5" style={{ color: "#6b7fa3" }}>Click to change</p>
              </>
            ) : (
              <>
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-3"
                  style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)" }}
                >
                  <Camera size={28} color="#6b7fa3" />
                </div>
                <p className="text-sm font-medium text-white">Upload Your Selfie</p>
                <p className="text-xs text-center mt-1" style={{ color: "#6b7fa3" }}>
                  Clear, front-facing photo works best
                </p>
              </>
            )}
          </div>

          {/* Info + button */}
          <div className="flex-1 space-y-4">
            <div className="grid grid-cols-1 gap-3">
              {[
                { icon: Sparkles, color: "#f59e0b", title: "Smart Detection", desc: "AI analyzes facial features with 95%+ accuracy across all uploaded event photos" },
                { icon: Image, color: "#3b82f6", title: "All Events Covered", desc: "Searches through 180,000+ photos from 1,200+ events across your institution" },
                { icon: CheckCircle, color: "#10b981", title: "Privacy First", desc: "Your selfie is processed locally and never stored on our servers" },
              ].map(({ icon: Icon, color, title, desc }) => (
                <div key={title} className="flex gap-3 items-start p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.03)" }}>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${color}15` }}>
                    <Icon size={14} color={color} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white">{title}</p>
                    <p className="text-xs leading-snug mt-0.5" style={{ color: "#6b7fa3" }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleScan}
              disabled={!selfieUploaded || scanning}
              className="w-full py-3 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all"
              style={{
                background: selfieUploaded && !scanning
                  ? "linear-gradient(135deg, #10b981, #059669)"
                  : "rgba(255,255,255,0.05)",
                color: selfieUploaded && !scanning ? "white" : "#6b7fa3",
                cursor: selfieUploaded && !scanning ? "pointer" : "not-allowed",
                boxShadow: selfieUploaded && !scanning ? "0 4px 20px rgba(16,185,129,0.3)" : "none",
              }}
            >
              {scanning ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Scanning 48,932 photos...
                </>
              ) : (
                <>
                  <Scan size={16} /> Find My Photos
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      {scanned && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <CheckCircle size={16} color="#10b981" />
                Found {matchedPhotos.length} photos of you!
              </h3>
              <p className="text-xs mt-0.5" style={{ color: "#6b7fa3" }}>Across 4 events</p>
            </div>
            <div className="flex gap-2">
              {selectedPhotos.length > 0 && (
                <button
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs text-white transition-all hover:scale-105"
                  style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)", color: "#10b981" }}
                >
                  <Download size={13} /> Download ({selectedPhotos.length})
                </button>
              )}
              <button
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs transition-all hover:bg-white/5"
                style={{ border: "1px solid rgba(16,185,129,0.12)", color: "#6b7fa3" }}
              >
                <Share2 size={13} /> Share All
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {matchedPhotos.map((photo) => {
              const isSelected = selectedPhotos.includes(photo.id);
              return (
                <div
                  key={photo.id}
                  className="relative group rounded-xl overflow-hidden cursor-pointer transition-transform hover:scale-[1.01]"
                  style={{
                    background: "#0b1220",
                    outline: isSelected ? "2px solid #10b981" : "2px solid transparent",
                  }}
                  onClick={() => toggleSelect(photo.id)}
                >
                  <img src={photo.src} alt={photo.event} className="w-full object-cover" style={{ height: 180 }} />

                  {/* Confidence badge */}
                  <div className="absolute top-2 left-2">
                    <span
                      className="px-2 py-0.5 rounded-full text-xs font-semibold"
                      style={{
                        background: "rgba(16,185,129,0.2)",
                        backdropFilter: "blur(8px)",
                        color: "#10b981",
                        border: "1px solid rgba(16,185,129,0.4)",
                      }}
                    >
                      {photo.confidence}% match
                    </span>
                  </div>

                  {/* Checkbox */}
                  <div className="absolute top-2 right-2">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center transition-all"
                      style={{
                        background: isSelected ? "#10b981" : "rgba(0,0,0,0.5)",
                        border: `2px solid ${isSelected ? "#10b981" : "rgba(255,255,255,0.3)"}`,
                      }}
                    >
                      {isSelected && <span className="text-white text-xs">✓</span>}
                    </div>
                  </div>

                  {/* Bottom overlay */}
                  <div
                    className="absolute bottom-0 left-0 right-0 p-3"
                    style={{ background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)" }}
                  >
                    <p className="text-xs font-medium text-white">{photo.event}</p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs" style={{ color: "#6b7fa3" }}>{photo.date}</p>
                      <div className="flex items-center gap-1 text-xs" style={{ color: "#6b7fa3" }}>
                        <Heart size={10} /> {photo.likes}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
