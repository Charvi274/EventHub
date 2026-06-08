import { useState, useEffect, useRef, useCallback } from "react";
import {
  Search, Filter, Heart, MessageCircle,
  Download, Share2, Bookmark, Sparkles,
  ChevronDown, Tag, Video,
} from "lucide-react";

// ── Backend shape ────────────────────────────────────────────────────────────
export interface BackendMedia {
  _id: string;
  title: string;
  fileUrl: string;
  fileType: "image" | "video";
  tags: string[];
  likes: { count: number; likedBy: string[] };
  downloads: number;
  eventId?: {
    _id: string;
    title: string;
    category?: string;
    startDate?: string;
  };
  uploadedBy?: { _id: string; name: string; email: string; role: string };
  createdAt: string;
}

// ── UI shape ─────────────────────────────────────────────────────────────────
interface GalleryPhoto {
  id: string;
  src: string;
  fileType: "image" | "video";
  likes: number;
  comments: number;
  tags: string[];
  event: string;
  category: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function mapMedia(m: BackendMedia): GalleryPhoto {
  return {
    id: m._id,
    src: m.fileUrl,
    fileType: m.fileType,
    likes: m.likes?.count ?? 0,
    comments: 0,                          // not tracked yet
    tags: m.tags ?? [],
    event: m.eventId?.title ?? "Unknown Event",
    category: m.eventId?.category ?? "Other",
  };
}

function getToken(): string {
  return localStorage.getItem("token") || sessionStorage.getItem("token") || "";
}
// AFTER getToken() definition — NEW helper
async function downloadFile(mediaId: string, fallbackUrl: string, fallbackName: string) {
  try {
    const res = await fetch(`/api/media/${mediaId}/download`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    if (!res.ok) throw new Error();
    const data = await res.json();

    const fileRes = await fetch(data.fileUrl);
    if (!fileRes.ok) throw new Error();
    const blob = await fileRes.blob();
    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = objectUrl;
    anchor.download = data.fileName ?? fallbackName;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    setTimeout(() => URL.revokeObjectURL(objectUrl), 10_000);
  } catch {
    window.open(fallbackUrl, "_blank");
  }
}
const LIMIT = 12;
const categories = ["All", "Technical", "Cultural", "Sports", "Academic", "Arts", "Workshop",
                    "Photography", "Music", "Technology", "Art", "Social", "Other"];

interface GalleryProps {
  onNavigate: (screen: string, media?: BackendMedia) => void;
}

// ── Component ────────────────────────────────────────────────────────────────
export function Gallery({ onNavigate }: GalleryProps) {
  const [photos, setPhotos]             = useState<GalleryPhoto[]>([]);
  const [rawPhotos, setRawPhotos]       = useState<BackendMedia[]>([]);
  const [page, setPage]                 = useState(1);
  const [totalPages, setTotalPages]     = useState(1);
  const [total, setTotal]               = useState(0);
  const [loading, setLoading]           = useState(true);
  const [loadingMore, setLoadingMore]   = useState(false);

  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery]       = useState("");
  const [searchInput, setSearchInput]       = useState("");
  const searchTimer                         = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [liked, setLiked]   = useState<string[]>([]);
  const [saved, setSaved]   = useState<string[]>([]);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchMedia = useCallback(async (pageNum: number, search: string, append: boolean) => {
    append ? setLoadingMore(true) : setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(pageNum),
        limit: String(LIMIT),
        fileType: "image",          // Gallery shows images; adjust if you want videos too
        ...(search ? { search } : {}),
      });

      const res = await fetch(`/api/media?${params}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      const raw: BackendMedia[] = Array.isArray(data)
        ? data
        : Array.isArray(data.data)
        ? data.data
        : [];

      const mapped = raw.map(mapMedia);
      setPhotos((prev) => (append ? [...prev, ...mapped] : mapped));
      setRawPhotos((prev) => (append ? [...prev, ...raw] : raw));
      setTotalPages(data.totalPages ?? 1);
      setTotal(data.total ?? raw.length);
    } catch {
      // silently degrade — photos stay as-is
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  // Initial load + re-fetch when search changes
  useEffect(() => {
    setPage(1);
    fetchMedia(1, searchQuery, false);
  }, [searchQuery, fetchMedia]);

  // Debounce search input → searchQuery
  const handleSearchChange = (val: string) => {
    setSearchInput(val);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => setSearchQuery(val), 400);
  };

  // Load more
  const handleLoadMore = () => {
    if (loadingMore || page >= totalPages) return;
    const next = page + 1;
    setPage(next);
    fetchMedia(next, searchQuery, true);
  };

  // ── Client-side category filter ────────────────────────────────────────────
  const displayed = activeCategory === "All"
    ? photos
    : photos.filter((p) => p.category === activeCategory);

  // ── Toggles ────────────────────────────────────────────────────────────────
  const toggleLike = (id: string) =>
    setLiked((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  const toggleSave = (id: string) =>
    setSaved((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));

  // ── Loading skeleton ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="p-6 flex flex-col items-center justify-center" style={{ minHeight: 320 }}>
        <div
          className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin mb-4"
          style={{ borderColor: "rgba(16,185,129,0.4)", borderTopColor: "transparent" }}
        />
        <p className="text-sm" style={{ color: "#6b7fa3" }}>Loading gallery…</p>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>
            Media Gallery
          </h2>
          <p className="text-sm" style={{ color: "#6b7fa3" }}>
            {total.toLocaleString()} item{total !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto">
          {/* Search */}
          <div className="relative flex-1 lg:w-72">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#6b7fa3" }} />
            <input
              value={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search photos, events, tags..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all"
              style={{
                background: "rgba(11,18,32,0.8)",
                border: "1px solid rgba(16,185,129,0.15)",
                color: "#e8edf5",
              }}
              onFocus={(e)  => { e.currentTarget.style.borderColor = "rgba(16,185,129,0.5)"; }}
              onBlur={(e)   => { e.currentTarget.style.borderColor = "rgba(16,185,129,0.15)"; }}
            />
          </div>

          {/* AI Search badge */}
          <button
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm flex-shrink-0 transition-all hover:scale-105"
            style={{
              background: "rgba(245,158,11,0.1)",
              border: "1px solid rgba(245,158,11,0.3)",
              color: "#f59e0b",
            }}
          >
            <Sparkles size={14} /> AI Search
          </button>

          <button
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm flex-shrink-0 transition-all hover:bg-white/5"
            style={{ border: "1px solid rgba(16,185,129,0.15)", color: "#6b7fa3" }}
          >
            <Filter size={14} /> Filter
          </button>
        </div>
      </div>

      {/* Category filters */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className="px-4 py-1.5 rounded-full text-sm flex-shrink-0 transition-all"
            style={{
              background: activeCategory === cat ? "rgba(16,185,129,0.15)" : "rgba(11,18,32,0.8)",
              border: `1px solid ${activeCategory === cat ? "rgba(16,185,129,0.4)" : "rgba(16,185,129,0.1)"}`,
              color: activeCategory === cat ? "#10b981" : "#6b7fa3",
              fontWeight: activeCategory === cat ? 600 : 400,
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* AI tag suggestions — static UI, unchanged */}
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-xl"
        style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.2)" }}
      >
        <Sparkles size={15} color="#f59e0b" className="flex-shrink-0" />
        <p className="text-sm flex-1" style={{ color: "#c4cdd8" }}>AI detected tags:</p>
        <div className="flex gap-2 flex-wrap">
          {["#Crowd", "#Nighttime", "#Celebration", "#Stage"].map((t) => (
            <span
              key={t}
              className="px-2 py-0.5 rounded-full text-xs"
              style={{ background: "rgba(245,158,11,0.12)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.25)" }}
            >
              <Tag size={9} className="inline mr-1" />{t}
            </span>
          ))}
        </div>
      </div>

      {/* Empty state */}
      {displayed.length === 0 && (
        <div className="text-center py-16">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.15)" }}
          >
            <Search size={24} color="#6b7fa3" />
          </div>
          <p className="text-base font-medium text-white mb-1">No media found</p>
          <p className="text-sm" style={{ color: "#6b7fa3" }}>
            {searchQuery ? "Try a different search term" : "Upload some photos to get started"}
          </p>
        </div>
      )}

      {/* Masonry grid */}
      {displayed.length > 0 && (
        <div className="columns-2 lg:columns-3 xl:columns-4 gap-3 space-y-3">
          {displayed.map((photo) => (
            <div
              key={photo.id}
              className="relative group rounded-xl overflow-hidden break-inside-avoid cursor-pointer transition-transform duration-200 hover:scale-[1.01]"
              style={{ background: "#0b1220" }}
              onClick={() => {
                const raw = rawPhotos.find((r) => r._id === photo.id);
                onNavigate("photodetails", raw);
              }}
            >
              {photo.fileType === "video" ? (
                /* Video thumbnail — show poster if available, else dark box */
                <div
                  className="w-full flex items-center justify-center"
                  style={{ minHeight: 160, background: "#0d1628" }}
                >
                  <Video size={32} color="#6b7fa3" />
                </div>
              ) : (
                <img
                  src={photo.src}
                  alt={photo.event}
                  className="w-full object-cover"
                  loading="lazy"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src =
                      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=260&fit=crop&auto=format";
                  }}
                />
              )}

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-all duration-200">
                {/* Bookmark */}
                <div className="absolute top-2 right-2 flex gap-1">
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleSave(photo.id); }}
                    className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                    style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
                  >
                    <Bookmark
                      size={13}
                      color={saved.includes(photo.id) ? "#f59e0b" : "white"}
                      fill={saved.includes(photo.id) ? "#f59e0b" : "none"}
                    />
                  </button>
                </div>

                {/* Bottom row */}
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p className="text-xs font-medium text-white mb-1.5 truncate">{photo.event}</p>

                  {/* Tags (first 2) */}
                  {photo.tags.length > 0 && (
                    <div className="flex gap-1 mb-1.5 flex-wrap">
                      {photo.tags.slice(0, 2).map((t) => (
                        <span
                          key={t}
                          className="px-1.5 py-0.5 rounded text-xs"
                          style={{ background: "rgba(16,185,129,0.2)", color: "#10b981" }}
                        >
                          {t.startsWith("#") ? t : `#${t}`}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleLike(photo.id); }}
                      className="flex items-center gap-1 text-xs text-white transition-all hover:scale-110"
                    >
                      <Heart
                        size={13}
                        fill={liked.includes(photo.id) ? "#ec4899" : "none"}
                        color={liked.includes(photo.id) ? "#ec4899" : "white"}
                      />
                      {liked.includes(photo.id) ? photo.likes + 1 : photo.likes}
                    </button>
                    <button className="flex items-center gap-1 text-xs text-white">
                      <MessageCircle size={13} /> {photo.comments}
                    </button>
                    <div className="flex gap-1 ml-auto">
                      <button
  onClick={(e) => { e.stopPropagation(); downloadFile(photo.id, photo.src, `${photo.event}.jpg`); }}
  className="w-6 h-6 rounded-md flex items-center justify-center"
  style={{ background: "rgba(0,0,0,0.4)" }}
>
  <Download size={11} color="white" />
</button>
<button
  onClick={(e) => { e.stopPropagation(); }}
  className="w-6 h-6 rounded-md flex items-center justify-center"
  style={{ background: "rgba(0,0,0,0.4)" }}
>
  <Share2 size={11} color="white" />
</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Load more */}
      {page < totalPages && (
        <div className="flex justify-center pt-4">
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            style={{
              background: "rgba(16,185,129,0.08)",
              border: "1px solid rgba(16,185,129,0.2)",
              color: "#10b981",
            }}
          >
            {loadingMore ? "Loading…" : "Load More"} <ChevronDown size={15} />
          </button>
        </div>
      )}
    </div>
  );
}