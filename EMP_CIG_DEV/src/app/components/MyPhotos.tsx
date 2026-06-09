import { useState, useRef } from "react";
import * as faceapi from "face-api.js";
import {
  Scan, Sparkles, Camera, Image, Heart, Download, X, CheckCircle,
} from "lucide-react";
import { API_BASE_URL } from '../config';
const MODEL_URL = "/models";
const MATCH_THRESHOLD = 0.5; // lower = stricter

function getToken() {
  return localStorage.getItem("token") || sessionStorage.getItem("token") || "";
}

let modelsLoaded = false;
async function loadModels() {
  if (modelsLoaded) return;
  await Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
  ]);
  modelsLoaded = true;
}

async function getDescriptor(imgEl: HTMLImageElement): Promise<Float32Array | null> {
  const detection = await faceapi
    .detectSingleFace(imgEl, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks()
    .withFaceDescriptor();
  return detection ? detection.descriptor : null;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    // Add Cloudinary fl_attachment=false to avoid CORS issues
    img.src = src.includes("res.cloudinary.com")
      ? src.replace("/upload/", "/upload/fl_attachment:false/")
      : src;
  });
}

interface MediaItem {
  _id: string;
  fileUrl: string;
  title?: string;
  event?: { _id: string; title: string };
  createdAt?: string;
  likes?: number | { length: number };
}

interface MatchedPhoto {
  _id: string;
  src: string;
  event: string;
  date: string;
  confidence: number;
  likes: number;
}

export function MyPhotos() {
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [matchedPhotos, setMatchedPhotos] = useState<MatchedPhoto[]>([]);
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSelfieChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelfieFile(file);
    setSelfiePreview(URL.createObjectURL(file));
    setScanned(false);
    setMatchedPhotos([]);
    setError(null);
  };

  const handleScan = async () => {
    if (!selfieFile) return;
    setScanning(true);
    setError(null);
    setMatchedPhotos([]);

    try {
      await loadModels();

      // 1. Get selfie descriptor
      const selfieImg = await loadImage(URL.createObjectURL(selfieFile));
      const selfieDescriptor = await getDescriptor(selfieImg);
      if (!selfieDescriptor) {
        setError("No face detected in your selfie. Please upload a clearer photo.");
        setScanning(false);
        return;
      }

      // 2. Fetch all media from backend
      const res = await fetch(`${API_BASE_URL}/api/media?limit=500`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      const allMedia: MediaItem[] = Array.isArray(data) ? data : data.media ?? data.data ?? [];

      setProgress({ current: 0, total: allMedia.length });

      const matches: MatchedPhoto[] = [];
      const faceMatcher = new faceapi.FaceMatcher(
        [new faceapi.LabeledFaceDescriptors("user", [selfieDescriptor])],
        MATCH_THRESHOLD
      );

      // 3. Compare each photo
      for (let i = 0; i < allMedia.length; i++) {
        const item = allMedia[i];
        setProgress({ current: i + 1, total: allMedia.length });

        try {
          const img = await loadImage(item.fileUrl);
          const detections = await faceapi
            .detectAllFaces(img, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .withFaceDescriptors();

          for (const det of detections) {
            const match = faceMatcher.findBestMatch(det.descriptor);
            if (match.label === "user") {
              const confidence = Math.round((1 - match.distance) * 100);
              const likesRaw = item.likes;
              const likesCount =
                typeof likesRaw === "number"
                  ? likesRaw
                  : Array.isArray(likesRaw)
                  ? (likesRaw as unknown[]).length
                  : 0;

              matches.push({
                _id: item._id,
                src: item.fileUrl,
                event: item.event?.title ?? "Unknown Event",
                date: item.createdAt
                  ? new Date(item.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })
                  : "",
                confidence,
                likes: likesCount,
              });
              break; // one match per photo is enough
            }
          }
        } catch {
          // skip photos that fail to load
        }
      }

      matches.sort((a, b) => b.confidence - a.confidence);
      setMatchedPhotos(matches);
      setScanned(true);
    } catch (err) {
      setError("Something went wrong. Please try again.");
      console.error(err);
    } finally {
      setScanning(false);
    }
  };

  const toggleSelect = (id: string) =>
    setSelectedPhotos((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );

  const handleDownloadSelected = async () => {
    for (const id of selectedPhotos) {
      const photo = matchedPhotos.find((p) => p._id === id);
      if (!photo) continue;
      try {
        const res = await fetch(`${API_BASE_URL}/api/media/${id}/download`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        const d = await res.json();
        const fileRes = await fetch(d.fileUrl);
        const blob = await fileRes.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `photo_${id}.jpg`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 10000);
      } catch {
        window.open(photo.src, "_blank");
      }
    }
  };

  const uniqueEvents = [...new Set(matchedPhotos.map((p) => p.event))].length;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white mb-1 flex items-center gap-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
          <Sparkles size={20} color="#f59e0b" /> My Photos
        </h2>
        <p className="text-sm" style={{ color: "#6b7fa3" }}>AI-powered facial recognition to find all your photos across events</p>
      </div>

      {/* Main card */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(11,18,32,0.8)", border: "1px solid rgba(16,185,129,0.15)" }}>
        {/* Header */}
        <div className="p-6 relative overflow-hidden" style={{ background: "linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(59,130,246,0.08) 100%)", borderBottom: "1px solid rgba(16,185,129,0.1)" }}>
          <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #10b981, transparent)" }} />
          <div className="relative z-10 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)" }}>
              <Scan size={28} color="#10b981" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Facial Recognition Search</h3>
              <p className="text-sm" style={{ color: "#6b7fa3" }}>Upload a clear selfie and our AI will find all your photos from every event</p>
            </div>
          </div>
          {/* Steps */}
          <div className="relative z-10 flex gap-4 mt-5">
            {[
              { step: "1", label: "Upload Selfie", done: !!selfieFile },
              { step: "2", label: "AI Scans Events", done: scanned },
              { step: "3", label: "View Your Photos", done: scanned },
            ].map(({ step, label, done }) => (
              <div key={step} className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{ background: done ? "rgba(16,185,129,0.2)" : "rgba(255,255,255,0.08)", border: `1px solid ${done ? "rgba(16,185,129,0.5)" : "rgba(255,255,255,0.1)"}`, color: done ? "#10b981" : "#6b7fa3" }}>
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
          {/* Selfie area */}
          <div
            className="flex flex-col items-center justify-center p-6 rounded-2xl cursor-pointer transition-all w-full lg:w-64 flex-shrink-0"
            style={{ border: `2px dashed ${selfieFile ? "rgba(16,185,129,0.5)" : "rgba(16,185,129,0.2)"}`, background: selfieFile ? "rgba(16,185,129,0.05)" : "transparent", minHeight: 180 }}
            onClick={() => fileInputRef.current?.click()}
          >
            <input ref={fileInputRef} type="file" accept="image/*" capture="user" className="hidden" onChange={handleSelfieChange} />
            {selfiePreview ? (
              <>
                <div className="w-20 h-20 rounded-full mb-3 overflow-hidden relative" style={{ border: "2px solid #10b981", boxShadow: "0 0 20px rgba(16,185,129,0.3)" }}>
                  <img src={selfiePreview} alt="Selfie" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-black/40 transition-opacity"
                    onClick={(e) => { e.stopPropagation(); setSelfieFile(null); setSelfiePreview(null); setScanned(false); }}>
                    <X size={16} color="white" />
                  </div>
                </div>
                <p className="text-sm font-medium" style={{ color: "#10b981" }}>Selfie ready!</p>
                <p className="text-xs mt-0.5" style={{ color: "#6b7fa3" }}>Click to change</p>
              </>
            ) : (
              <>
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-3" style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)" }}>
                  <Camera size={28} color="#6b7fa3" />
                </div>
                <p className="text-sm font-medium text-white">Upload Your Selfie</p>
                <p className="text-xs text-center mt-1" style={{ color: "#6b7fa3" }}>Clear, front-facing photo works best</p>
              </>
            )}
          </div>

          {/* Right side */}
          <div className="flex-1 space-y-4">
            {[
              { color: "#f59e0b", title: "Smart Detection", desc: "AI analyzes facial features with high accuracy across all uploaded event photos" },
              { color: "#3b82f6", title: "All Events Covered", desc: "Searches through every photo uploaded to EventHub across all events" },
              { color: "#10b981", title: "Privacy First", desc: "Your selfie is processed locally in your browser and never stored on servers" },
            ].map(({ color, title, desc }) => (
              <div key={title} className="flex gap-3 items-start p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.03)" }}>
                <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: color }} />
                <div>
                  <p className="text-xs font-semibold text-white">{title}</p>
                  <p className="text-xs leading-snug mt-0.5" style={{ color: "#6b7fa3" }}>{desc}</p>
                </div>
              </div>
            ))}

            {error && <p className="text-xs text-red-400 px-1">{error}</p>}

            {scanning && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs" style={{ color: "#6b7fa3" }}>
                  <span>Scanning photos...</span>
                  <span>{progress.current} / {progress.total}</span>
                </div>
                <div className="w-full h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.05)" }}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${progress.total ? (progress.current / progress.total) * 100 : 0}%`, background: "linear-gradient(90deg, #10b981, #059669)" }} />
                </div>
              </div>
            )}

            <button
              onClick={handleScan}
              disabled={!selfieFile || scanning}
              className="w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all"
              style={{
                background: selfieFile && !scanning ? "linear-gradient(135deg, #10b981, #059669)" : "rgba(255,255,255,0.05)",
                color: selfieFile && !scanning ? "white" : "#6b7fa3",
                cursor: selfieFile && !scanning ? "pointer" : "not-allowed",
                boxShadow: selfieFile && !scanning ? "0 4px 20px rgba(16,185,129,0.3)" : "none",
              }}
            >
              {scanning ? (
                <><div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Scanning...</>
              ) : (
                <><Scan size={16} /> Find My Photos</>
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
                {matchedPhotos.length > 0 ? `Found ${matchedPhotos.length} photos of you!` : "No matching photos found"}
              </h3>
              {matchedPhotos.length > 0 && (
                <p className="text-xs mt-0.5" style={{ color: "#6b7fa3" }}>Across {uniqueEvents} event{uniqueEvents !== 1 ? "s" : ""}</p>
              )}
            </div>
            {selectedPhotos.length > 0 && (
              <button
                onClick={handleDownloadSelected}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs transition-all hover:scale-105"
                style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)", color: "#10b981" }}
              >
                <Download size={13} /> Download ({selectedPhotos.length})
              </button>
            )}
          </div>

          {matchedPhotos.length === 0 ? (
            <div className="text-center py-12" style={{ color: "#6b7fa3" }}>
              <Image size={40} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">Try with a clearer selfie or check if photos have been uploaded for your events.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              {matchedPhotos.map((photo) => {
                const isSelected = selectedPhotos.includes(photo._id);
                return (
                  <div
                    key={photo._id}
                    className="relative rounded-xl overflow-hidden cursor-pointer transition-transform hover:scale-[1.01]"
                    style={{ background: "#0b1220", outline: isSelected ? "2px solid #10b981" : "2px solid transparent" }}
                    onClick={() => toggleSelect(photo._id)}
                  >
                    <img src={photo.src} alt={photo.event} className="w-full object-cover" style={{ height: 180 }} />
                    <div className="absolute top-2 left-2">
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: "rgba(16,185,129,0.2)", backdropFilter: "blur(8px)", color: "#10b981", border: "1px solid rgba(16,185,129,0.4)" }}>
                        {photo.confidence}% match
                      </span>
                    </div>
                    <div className="absolute top-2 right-2">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center transition-all" style={{ background: isSelected ? "#10b981" : "rgba(0,0,0,0.5)", border: `2px solid ${isSelected ? "#10b981" : "rgba(255,255,255,0.3)"}` }}>
                        {isSelected && <span className="text-white text-xs">✓</span>}
                      </div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-3" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)" }}>
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
          )}
        </div>
      )}
    </div>
  );
}