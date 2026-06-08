import { useState, useEffect } from "react";
import { Camera, Calendar, Image, Video, Users, TrendingUp, Plus, Eye, Heart, Sparkles, Clock, MapPin, ArrowRight } from "lucide-react";

interface DashboardProps {
  onNavigate: (screen: string) => void;
  user?: {
    name?: string;
    email?: string;
    role?: string;
  };
}

// ── Backend shape ────────────────────────────────────────────────────────────
interface BackendEvent {
  _id: string;
  title: string;
  category: string;
  organizer: string;
  startDate: string;   // ISO string
  location?: string;
  coverImage?: string;
}

// ── UI shapes ────────────────────────────────────────────────────────────────
interface RecentEvent {
  id: string;
  name: string;
  category: string;
  date: string;        // "May 28, 2025"
  photos: number;
  image: string;
  organizer: string;
}

interface UpcomingEvent {
  id: string;
  name: string;
  date: string;        // "Jun 15, 2025"
  category: string;
  venue: string;
}

// ── Constants ────────────────────────────────────────────────────────────────
const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=220&fit=crop&auto=format";

const trendingPhotos = [
  "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=300&h=200&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=300&h=200&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=300&h=200&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1511578314322-379afb476865?w=300&h=200&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=300&h=200&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=300&h=200&fit=crop&auto=format",
];

const categoryColors: Record<string, string> = {
  Technical: "#3b82f6",
  Cultural: "#ec4899",
  Sports: "#f59e0b",
  Arts: "#8b5cf6",
  Academic: "#10b981",
  Photography: "#f97316",
  Music: "#a855f7",
  Technology: "#3b82f6",
  Art: "#8b5cf6",
  Social: "#ec4899",
  Other: "#6b7fa3",
};

// ── Helpers ──────────────────────────────────────────────────────────────────

/** "2025-05-28T00:00:00.000Z" → "May 28, 2025" */
function formatDisplayDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** "2025-05-28T..." → "2025-05-28" */
function toDateOnly(iso: string): string {
  return iso.split("T")[0];
}

// ── Component ────────────────────────────────────────────────────────────────
export function Dashboard({ onNavigate, user }: DashboardProps) {
  const role = user?.role?.trim() || "Viewer";

  // fetched data
  const [allEvents, setAllEvents]     = useState<BackendEvent[]>([]);
  const [loading, setLoading]         = useState(true);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchEvents = async () => {
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

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();

        const raw: BackendEvent[] = Array.isArray(data)
          ? data
          : Array.isArray(data.data)
          ? data.data
          : Array.isArray(data.events)
          ? data.events
          : [];

        setAllEvents(raw);
      } catch {
        // silently fall through — UI renders with empty state
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // ── Derived data ───────────────────────────────────────────────────────────
  const today = new Date().toISOString().split("T")[0];

  const upcomingRaw = allEvents
    .filter((e) => toDateOnly(e.startDate) > today)
    .sort((a, b) => a.startDate.localeCompare(b.startDate));

  const pastRaw = allEvents.filter((e) => toDateOnly(e.startDate) <= today);

  // Stats: Total Events / Upcoming / Past / (Photos placeholder until media API)
  const statsData = [
    {
      label: "Total Events",
      value: allEvents.length.toLocaleString(),
      change: `${allEvents.length} total`,
      icon: Calendar,
      color: "#3b82f6",
    },
    {
      label: "Upcoming Events",
      value: upcomingRaw.length.toLocaleString(),
      change: `${upcomingRaw.length} ahead`,
      icon: Image,
      color: "#10b981",
    },
    {
      label: "Past Events",
      value: pastRaw.length.toLocaleString(),
      change: `${pastRaw.length} done`,
      icon: Video,
      color: "#8b5cf6",
    },
    {
      label: "Total Users",
      value: "—",
      change: "coming soon",
      icon: Users,
      color: "#f59e0b",
    },
  ];

  // Recent Events: last 3 by startDate (desc)
  const recentEvents: RecentEvent[] = [...allEvents]
    .sort((a, b) => b.startDate.localeCompare(a.startDate))
    .slice(0, 3)
    .map((e) => ({
      id: e._id,
      name: e.title,
      category: e.category,
      date: formatDisplayDate(e.startDate),
      photos: 0,   // media not tracked yet
      image: e.coverImage?.trim() ? e.coverImage : FALLBACK_IMAGE,
      organizer: e.organizer,
    }));

  // Upcoming: next 4 future events
  const upcomingEvents: UpcomingEvent[] = upcomingRaw.slice(0, 4).map((e) => ({
    id: e._id,
    name: e.title,
    date: formatDisplayDate(e.startDate),
    category: e.category,
    venue: e.location || "Venue TBD",
  }));

  // ── Quick actions (unchanged) ──────────────────────────────────────────────
  const allActions = [
    { label: "Create Event", icon: Plus,     color: "#10b981", screen: "createevent", roles: ["Admin"] },
    { label: "Upload Media", icon: Camera,   color: "#3b82f6", screen: "upload",      roles: ["Admin", "Photographer"] },
    { label: "View Gallery", icon: Image,    color: "#8b5cf6", screen: "gallery",     roles: ["Admin", "Photographer", "Club Member", "Viewer"] },
    { label: "AI Search",    icon: Sparkles, color: "#f59e0b", screen: "myphotos",    roles: ["Admin", "Photographer", "Club Member", "Viewer"] },
  ];
  const visibleActions = allActions.filter((a) => a.roles.includes(role));

  // ── Skeleton shown while loading ───────────────────────────────────────────
  if (loading) {
    return (
      <div className="p-6 flex flex-col items-center justify-center" style={{ minHeight: 320 }}>
        <div
          className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin mb-4"
          style={{ borderColor: "rgba(16,185,129,0.4)", borderTopColor: "transparent" }}
        />
        <p className="text-sm" style={{ color: "#6b7fa3" }}>Loading dashboard…</p>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="p-6 space-y-6">
      {/* Quick actions — untouched */}
      <div>
        <p className="text-xs font-medium uppercase tracking-wider mb-3" style={{ color: "#6b7fa3" }}>Quick Actions</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {visibleActions.map(({ label, icon: Icon, color, screen }) => (
            <button
              key={label}
              onClick={() => onNavigate(screen)}
              className="flex items-center gap-3 p-4 rounded-xl transition-all duration-200 hover:scale-[1.02] group"
              style={{
                background: "rgba(11,18,32,0.8)",
                border: "1px solid rgba(16,185,129,0.12)",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${color}40`; e.currentTarget.style.background = `${color}08`; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(16,185,129,0.12)"; e.currentTarget.style.background = "rgba(11,18,32,0.8)"; }}
            >
              <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${color}18` }}>
                <Icon size={18} color={color} />
              </div>
              <span className="text-sm font-medium text-white">{label}</span>
              <ArrowRight size={14} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" style={{ color }} />
            </button>
          ))}
        </div>
      </div>

      {/* Stats — driven by fetched data */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        {statsData.map(({ label, value, change, icon: Icon, color }) => (
          <div
            key={label}
            className="p-5 rounded-xl"
            style={{
              background: "rgba(11,18,32,0.8)",
              border: "1px solid rgba(16,185,129,0.1)",
            }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}15` }}>
                <Icon size={20} color={color} />
              </div>
              <span
                className="text-xs px-2 py-0.5 rounded-full flex items-center gap-1"
                style={{ background: "rgba(16,185,129,0.1)", color: "#10b981" }}
              >
                <TrendingUp size={10} />
                {change}
              </span>
            </div>
            <p className="text-2xl font-bold text-white mb-0.5" style={{ fontFamily: "'Outfit', sans-serif" }}>{value}</p>
            <p className="text-xs" style={{ color: "#6b7fa3" }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Recent events + upcoming */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent events */}
        <div className="xl:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-white">Recent Events</h2>
            <button
              onClick={() => onNavigate("events")}
              className="text-xs flex items-center gap-1 hover:opacity-80 transition-opacity"
              style={{ color: "#10b981" }}
            >
              View All <ArrowRight size={12} />
            </button>
          </div>
          <div className="space-y-3">
            {recentEvents.length === 0 ? (
              <p className="text-sm" style={{ color: "#6b7fa3" }}>No events yet.</p>
            ) : (
              recentEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex gap-4 p-4 rounded-xl cursor-pointer transition-all duration-200 hover:scale-[1.01]"
                  style={{
                    background: "rgba(11,18,32,0.8)",
                    border: "1px solid rgba(16,185,129,0.1)",
                  }}
                  onClick={() => onNavigate("eventdetails")}
                >
                  <img
                    src={event.image}
                    alt={event.name}
                    className="w-20 h-14 rounded-lg object-cover flex-shrink-0"
                    style={{ background: "#0b1220" }}
                    onError={(e) => { (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE; }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-semibold text-white leading-snug">{event.name}</h3>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
                        style={{
                          background: `${categoryColors[event.category] || "#10b981"}18`,
                          color: categoryColors[event.category] || "#10b981",
                          border: `1px solid ${categoryColors[event.category] || "#10b981"}30`,
                        }}
                      >
                        {event.category}
                      </span>
                    </div>
                    <p className="text-xs mt-1" style={{ color: "#6b7fa3" }}>{event.organizer}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="flex items-center gap-1 text-xs" style={{ color: "#6b7fa3" }}>
                        <Clock size={11} /> {event.date}
                      </span>
                      <span className="flex items-center gap-1 text-xs" style={{ color: "#6b7fa3" }}>
                        <Camera size={11} /> {event.photos.toLocaleString()} photos
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Upcoming events */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-white">Upcoming</h2>
            <button
              onClick={() => onNavigate("events")}
              className="text-xs flex items-center gap-1 hover:opacity-80 transition-opacity"
              style={{ color: "#10b981" }}
            >
              View All <ArrowRight size={12} />
            </button>
          </div>
          <div className="space-y-2.5">
            {upcomingEvents.length === 0 ? (
              <p className="text-sm" style={{ color: "#6b7fa3" }}>No upcoming events.</p>
            ) : (
              upcomingEvents.map((event) => (
                <div
                  key={event.id}
                  className="p-3.5 rounded-xl cursor-pointer transition-all duration-200 hover:scale-[1.01]"
                  style={{
                    background: "rgba(11,18,32,0.8)",
                    border: "1px solid rgba(16,185,129,0.1)",
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex flex-col items-center justify-center flex-shrink-0 text-xs font-bold"
                      style={{
                        background: `${categoryColors[event.category] || "#10b981"}15`,
                        color: categoryColors[event.category] || "#10b981",
                      }}
                    >
                      {/* "Jun 15, 2025" → day + month */}
                      <span>{event.date.split(" ")[1].replace(",", "")}</span>
                      <span style={{ fontSize: 9 }}>{event.date.split(" ")[0]}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white leading-snug">{event.name}</p>
                      <p className="text-xs flex items-center gap-1 mt-0.5" style={{ color: "#6b7fa3" }}>
                        <MapPin size={10} /> {event.venue}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Trending media — hardcoded, unchanged */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <TrendingUp size={16} style={{ color: "#10b981" }} /> Trending Media
          </h2>
          <button className="text-xs flex items-center gap-1" style={{ color: "#10b981" }} onClick={() => onNavigate("gallery")}>
            Open Gallery <ArrowRight size={12} />
          </button>
        </div>
        <div className="grid grid-cols-3 lg:grid-cols-6 gap-2">
          {trendingPhotos.map((src, i) => (
            <div
              key={i}
              className="relative group rounded-xl overflow-hidden cursor-pointer"
              style={{ aspectRatio: "3/2", background: "#0b1220" }}
              onClick={() => onNavigate("photodetails")}
            >
              <img src={src} alt={`Trending ${i + 1}`} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                <Heart size={18} color="white" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}