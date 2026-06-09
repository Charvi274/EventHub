import { useState, useEffect } from "react";
import { ArrowLeft, Camera, Share2, Download, Clock, MapPin, User, Tag, Heart, MessageCircle, Filter, SortAsc, Play, ChevronDown } from "lucide-react";
import type { BackendMedia } from "./PhotoDetails";

// ─── Types ────────────────────────────────────────────────────────────────────

interface EventData {
  _id: string;
  title: string;
  description: string;
  category: string;
  organizer: string;
  location: string;
  startDate: string;
  endDate: string;
  coverImage: string;
  tags: string[];
  status: string;
}

interface MediaItem {
  _id: string;
  fileUrl: string;
  fileType: "image" | "video";
  title: string;
  likes: { count: number };
}

interface EventDetailsProps {
  eventId: string;           // real MongoDB _id  ← NEW (required)
  onBack: () => void;
  // Second arg is the media item to open (matches App.navigate signature)
  onNavigate: (screen: string, media?: BackendMedia) => void;
  user?: { name?: string; email?: string; role?: string };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const API_BASE = "/api"; // adjust if your base URL differs

function getToken(): string {
  return localStorage.getItem("token") || sessionStorage.getItem("token") || "";
}

/** Format "May 28 – May 30, 2025" from two ISO date strings */
function formatDateRange(start: string, end: string): string {
  const s = new Date(start);
  const e = new Date(end);
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  const startStr = s.toLocaleDateString("en-US", opts);
  const endStr =
    s.getMonth() === e.getMonth()
      ? e.toLocaleDateString("en-US", { day: "numeric", year: "numeric" })
      : e.toLocaleDateString("en-US", { ...opts, year: "numeric" });
  return `${startStr} – ${endStr}`;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function EventDetails({ eventId, onBack, onNavigate, user }: EventDetailsProps) {
  const canUpload = ["Admin", "Photographer"].includes(user?.role ?? "");
  const [activeFilter, setActiveFilter] = useState("all");
  const [liked, setLiked] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);

  // ── API state
  const [event, setEvent] = useState<EventData | null>(null);
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [photoCount, setPhotoCount] = useState(0);
  const [videoCount, setVideoCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Fetch event + all media on mount
  useEffect(() => {
    console.log("eventId", eventId);
    if (!eventId) return;

    const fetchAll = async () => {
      setLoading(true);
      setError(null);
      try {
        const headers = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        };

        // 1. Event details  →  GET /api/events/:id
        const eventRes = await fetch(`${API_BASE}/events/${eventId}`, { headers });
        if (!eventRes.ok) throw new Error("Failed to fetch event");
        const eventJson = await eventRes.json();
        setEvent(eventJson.data);

        // 2. All media for this event  →  GET /api/media/event/:eventId?limit=100
        //    One request gives us gallery items + counts; no extra endpoints needed.
        const mediaRes = await fetch(
          `${API_BASE}/media/event/${eventId}?limit=100`,
          { headers }
        );
        if (!mediaRes.ok) throw new Error("Failed to fetch media");
        const mediaJson = await mediaRes.json();
        const items: MediaItem[] = mediaJson.data ?? [];
        setMediaList(items);
        setPhotoCount(items.filter((m) => m.fileType === "image").length);
        setVideoCount(items.filter((m) => m.fileType === "video").length);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [eventId]);

  // ── Derived gallery items based on active filter
  const filteredMedia = mediaList.filter((m) => {
    if (activeFilter === "photos") return m.fileType === "image";
    if (activeFilter === "videos") return m.fileType === "video";
    return true;
  });

  // ── Loading / error screens (keep same dark palette)
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64" style={{ color: "#6b7fa3" }}>
        Loading…
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3" style={{ color: "#f87171" }}>
        <p>{error ?? "Event not found"}</p>
        <button onClick={onBack} className="text-sm underline" style={{ color: "#6b7fa3" }}>
          Go back
        </button>
      </div>
    );
  }

  // ── Resolved values (replacing every hardcoded string)
  const coverSrc = event.coverImage || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&h=400&fit=crop&auto=format";
  const dateRange = formatDateRange(event.startDate, event.endDate);
  const mediaCountLabel = `${photoCount} Photo${photoCount !== 1 ? "s" : ""} · ${videoCount} Video${videoCount !== 1 ? "s" : ""}`;

  return (
    <div className="pb-8">
      {/* ── Banner ── */}
      <div className="relative h-72 overflow-hidden" style={{ background: "#0b1220" }}>
        <img
          src={coverSrc}
          alt="Event Banner"
          className="w-full h-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to bottom, rgba(4,7,15,0.3) 0%, rgba(4,7,15,0.9) 100%)" }}
        />

        <button
          onClick={onBack}
          className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm text-white transition-all hover:bg-white/10"
          style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.15)" }}
        >
          <ArrowLeft size={16} /> Back
        </button>

        <div className="absolute bottom-6 left-6 right-6">
          <div className="flex items-end justify-between">
            <div>
              {/* ✅ category — was hardcoded "Technical" */}
              <span
                className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold mb-2"
                style={{ background: "rgba(59,130,246,0.25)", color: "#93c5fd", border: "1px solid rgba(59,130,246,0.4)" }}
              >
                {event.category}
              </span>
              {/* ✅ title — was hardcoded "Annual Tech Fest 2025" */}
              <h1 className="text-3xl font-black text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>
                {event.title}
              </h1>
            </div>
            <div className="flex gap-2">
              {canUpload && (
              <button
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs text-white transition-all hover:scale-105"
                style={{ background: "rgba(16,185,129,0.2)", border: "1px solid rgba(16,185,129,0.4)", backdropFilter: "blur(8px)" }}
                onClick={() => onNavigate("upload")}
              >
                <Camera size={14} /> Upload
              </button>
              )}
              <button
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs text-white transition-all hover:scale-105"
                style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", backdropFilter: "blur(8px)" }}
              >
                <Share2 size={14} /> Share
              </button>
              <button
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs text-white transition-all hover:scale-105"
                style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", backdropFilter: "blur(8px)" }}
              >
                <Download size={14} /> Album
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 mt-6 space-y-6">
        {/* ── Meta info ── */}
        <div
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-5 rounded-2xl"
          style={{ background: "rgba(11,18,32,0.8)", border: "1px solid rgba(16,185,129,0.1)" }}
        >
          {[
            { icon: Clock,   label: "Date",      value: dateRange },          // ✅ was "May 28–30, 2025"
            { icon: MapPin,  label: "Venue",     value: event.location },     // ✅ was "Main Campus Grounds"
            { icon: User,    label: "Organizer", value: event.organizer },    // ✅ was "CSE Department"
            { icon: Camera,  label: "Media",     value: mediaCountLabel },    // ✅ was "842 Photos · 34 Videos"
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(16,185,129,0.1)" }}>
                <Icon size={15} color="#10b981" />
              </div>
              <div>
                <p className="text-xs" style={{ color: "#6b7fa3" }}>{label}</p>
                <p className="text-sm font-medium text-white">{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Description ── */}
        {/* ✅ was hardcoded paragraph */}
        <div>
          <p className="text-sm leading-relaxed" style={{ color: "#c4cdd8" }}>
            {event.description}
          </p>
        </div>

        {/* ── Tags ── */}
        {/* ✅ was hardcoded array */}
        <div className="flex flex-wrap gap-2">
          {event.tags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 rounded-full text-xs cursor-pointer transition-all hover:scale-105"
              style={{ background: "rgba(16,185,129,0.08)", color: "#10b981", border: "1px solid rgba(16,185,129,0.2)" }}
            >
              <Tag size={10} className="inline mr-1" />
              #{tag.replace(/^#/, "")}
            </span>
          ))}
        </div>

        {/* ── Filters ── */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex gap-2 p-1 rounded-xl" style={{ background: "rgba(11,18,32,0.8)", border: "1px solid rgba(16,185,129,0.1)" }}>
            {["all", "photos", "videos"].map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className="px-4 py-1.5 rounded-lg text-sm capitalize transition-all"
                style={{
                  background: activeFilter === f ? "rgba(16,185,129,0.15)" : "transparent",
                  color: activeFilter === f ? "#10b981" : "#6b7fa3",
                  border: activeFilter === f ? "1px solid rgba(16,185,129,0.3)" : "1px solid transparent",
                  fontWeight: activeFilter === f ? 600 : 400,
                }}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="flex gap-2 ml-auto">
            <button
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs transition-all hover:bg-white/5"
              style={{ border: "1px solid rgba(16,185,129,0.12)", color: "#6b7fa3" }}
            >
              <Filter size={13} /> Filter
            </button>
            <div className="relative">
              <button
                onClick={() => setShowSortMenu(!showSortMenu)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs transition-all hover:bg-white/5"
                style={{ border: "1px solid rgba(16,185,129,0.12)", color: "#6b7fa3" }}
              >
                <SortAsc size={13} /> Sort <ChevronDown size={12} />
              </button>
              {showSortMenu && (
                <div
                  className="absolute right-0 top-full mt-1 w-44 rounded-xl overflow-hidden z-50"
                  style={{ background: "#0d1628", border: "1px solid rgba(16,185,129,0.2)", boxShadow: "0 20px 40px rgba(0,0,0,0.5)" }}
                >
                  {["Sort by Date", "Sort by Event Name", "Sort by Category"].map((s) => (
                    <button
                      key={s}
                      className="w-full px-4 py-2.5 text-left text-xs hover:bg-white/5 transition-colors"
                      style={{ color: "#c4cdd8" }}
                      onClick={() => setShowSortMenu(false)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Gallery grid ── */}
        {/* ✅ was hardcoded photos[] + static Unsplash URLs */}
        <div className="columns-2 lg:columns-3 gap-3 space-y-3">
          {filteredMedia.length === 0 && (
            <p className="col-span-full text-center text-sm py-8" style={{ color: "#6b7fa3" }}>
              No {activeFilter === "all" ? "media" : activeFilter} yet.
            </p>
          )}
          {filteredMedia.map((item) => (
            <div
              key={item._id}
              className="relative group rounded-xl overflow-hidden break-inside-avoid cursor-pointer"
              style={{ background: "#0b1220" }}
              onClick={() => onNavigate("photodetails", { _id: item._id, title: item.title, fileUrl: item.fileUrl, fileType: item.fileType, tags: [], likes: { count: item.likes.count, likedBy: [] }, downloads: 0, createdAt: "" })}
            >
              {item.fileType === "video" && (
                <div className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full flex items-center justify-center" style={{ background: "rgba(0,0,0,0.6)" }}>
                  <Play size={12} color="white" fill="white" />
                </div>
              )}
              <img
                src={item.fileUrl}
                alt={item.title}
                className="w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-200">
                <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center gap-3">
                  <button
                    onClick={(e) => { e.stopPropagation(); setLiked(!liked); }}
                    className="flex items-center gap-1 text-xs text-white"
                  >
                    <Heart size={14} fill={liked ? "currentColor" : "none"} />
                    {item.likes.count}
                  </button>
                  <button className="flex items-center gap-1 text-xs text-white">
                    <MessageCircle size={14} /> 0
                  </button>
                  <button className="ml-auto text-white hover:text-emerald-400 transition-colors">
                    <Download size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}