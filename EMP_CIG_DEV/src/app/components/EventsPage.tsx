import { useState, useEffect } from "react";
import { Search, Filter, Plus, Clock, Camera, ChevronDown, ArrowUpDown, Calendar } from "lucide-react";
import { API_BASE_URL } from '../config';
interface EventsPageProps {
  onNavigate: (screen: string) => void;
  user?: { name?: string; email?: string; role?: string };
}

// Shape returned by GET /api/events
interface BackendEvent {
  _id: string;
  title: string;
  category: string;
  organizer: string;
  startDate: string;
  coverImage?: string;
  status?: string;
}

// Shape used internally by the UI (matches original hardcoded structure)
interface UIEvent {
  id: string;
  name: string;
  category: string;
  date: string;        // "YYYY-MM-DD"
  photos: number;
  videos: number;
  organizer: string;
  image: string;
}

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=500&h=280&fit=crop&auto=format";

/** Map a backend event to the UI shape the existing components expect */
function mapEvent(e: BackendEvent): UIEvent {
  return {
    id: e._id,
    name: e.title,
    category: e.category,
    date: e.startDate ? e.startDate.split("T")[0] : "",
    photos: 0,   // not yet tracked on backend
    videos: 0,   // not yet tracked on backend
    organizer: e.organizer,
    image: e.coverImage && e.coverImage.trim() !== "" ? e.coverImage : FALLBACK_IMAGE,
  };
}

const categories = ["All", "Technical", "Cultural", "Sports", "Academic", "Arts", "Workshop", "Photography", "Music", "Technology", "Art", "Social", "Other"];

const categoryColors: Record<string, string> = {
  Technical: "#3b82f6",
  Cultural: "#ec4899",
  Sports: "#f59e0b",
  Academic: "#10b981",
  Arts: "#8b5cf6",
  Workshop: "#06b6d4",
  Photography: "#f97316",
  Music: "#a855f7",
  Technology: "#3b82f6",
  Art: "#8b5cf6",
  Social: "#ec4899",
  Other: "#6b7fa3",
};

const sortOptions = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "az", label: "A → Z" },
  { value: "za", label: "Z → A" },
];

export function EventsPage({ onNavigate, user }: EventsPageProps) {
  const [events, setEvents] = useState<UIEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [showSort, setShowSort] = useState(false);
  const [dateFilter, setDateFilter] = useState("");

  const isAdmin = user?.role === "admin" || user?.role === "Admin";

  // ── Fetch events from backend ──────────────────────────────────────────────
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError("");

        const token =
          localStorage.getItem("token") ||
          sessionStorage.getItem("token") ||
          "";

        const res = await fetch(`${API_BASE_URL}/api/events`, {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (!res.ok) {
          throw new Error(`Failed to fetch events (${res.status})`);
        }

        const data = await res.json();

        // Support plain array, { data: [...] }, and { events: [...] } responses
        const raw: BackendEvent[] = Array.isArray(data)
          ? data
          : Array.isArray(data.data)
          ? data.data
          : Array.isArray(data.events)
          ? data.events
          : [];

        setEvents(raw.map(mapEvent));
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // ── Filter + sort ──────────────────────────────────────────────────────────
  const filtered = events
    .filter((e) => {
      const matchSearch =
        e.name.toLowerCase().includes(search.toLowerCase()) ||
        e.organizer.toLowerCase().includes(search.toLowerCase());
      const matchCat = activeCategory === "All" || e.category === activeCategory;
      const matchDate = !dateFilter || e.date >= dateFilter;
      return matchSearch && matchCat && matchDate;
    })
    .sort((a, b) => {
      if (sortBy === "newest") return b.date.localeCompare(a.date);
      if (sortBy === "oldest") return a.date.localeCompare(b.date);
      if (sortBy === "az") return a.name.localeCompare(b.name);
      if (sortBy === "za") return b.name.localeCompare(a.name);
      return 0;
    });

  const today = new Date().toISOString().split("T")[0];
  const upcoming = filtered.filter((e) => e.date > today);
  const past = filtered.filter((e) => e.date <= today);

  const totalPhotos = events.reduce((s, e) => s + e.photos, 0);

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="p-6 flex flex-col items-center justify-center" style={{ minHeight: 320 }}>
        <div
          className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin mb-4"
          style={{ borderColor: "rgba(16,185,129,0.4)", borderTopColor: "transparent" }}
        />
        <p className="text-sm" style={{ color: "#6b7fa3" }}>Loading events…</p>
      </div>
    );
  }

  // ── Error state ────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="p-6 flex flex-col items-center justify-center" style={{ minHeight: 320 }}>
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}
        >
          <Search size={24} color="#ef4444" />
        </div>
        <p className="text-base font-medium text-white mb-1">Could not load events</p>
        <p className="text-sm" style={{ color: "#6b7fa3" }}>{error}</p>
      </div>
    );
  }

  // ── Main render ────────────────────────────────────────────────────────────
  return (
    <div className="p-6 space-y-5">
      {/* Page header */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>All Events</h2>
          <p className="text-sm" style={{ color: "#6b7fa3" }}>
            {events.length} events · {totalPhotos.toLocaleString()} photos
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => onNavigate("createevent")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:scale-105 flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #10b981, #059669)", boxShadow: "0 4px 16px rgba(16,185,129,0.3)" }}
          >
            <Plus size={16} /> Create Event
          </button>
        )}
      </div>

      {/* Controls */}
      <div className="flex flex-col lg:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#6b7fa3" }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search events, organizers..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all"
            style={{
              background: "rgba(11,18,32,0.8)",
              border: "1px solid rgba(16,185,129,0.15)",
              color: "#e8edf5",
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(16,185,129,0.5)"; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(16,185,129,0.15)"; }}
          />
        </div>

        {/* Date filter */}
        <div className="relative flex items-center">
          <Calendar size={14} className="absolute left-3" style={{ color: "#6b7fa3" }} />
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all"
            style={{
              background: "rgba(11,18,32,0.8)",
              border: "1px solid rgba(16,185,129,0.15)",
              color: dateFilter ? "#e8edf5" : "#6b7fa3",
              colorScheme: "dark",
              width: 160,
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(16,185,129,0.5)"; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(16,185,129,0.15)"; }}
          />
        </div>

        {/* Sort */}
        <div className="relative">
          <button
            onClick={() => setShowSort(!showSort)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm transition-all hover:bg-white/5"
            style={{ border: "1px solid rgba(16,185,129,0.15)", color: "#c4cdd8", minWidth: 150 }}
          >
            <ArrowUpDown size={14} />
            {sortOptions.find((s) => s.value === sortBy)?.label}
            <ChevronDown size={13} className="ml-auto" />
          </button>
          {showSort && (
            <div
              className="absolute right-0 top-full mt-1 w-44 rounded-xl overflow-hidden z-50"
              style={{ background: "#0d1628", border: "1px solid rgba(16,185,129,0.2)", boxShadow: "0 20px 40px rgba(0,0,0,0.5)" }}
            >
              {sortOptions.map((opt) => (
                <button
                  key={opt.value}
                  className="w-full px-4 py-2.5 text-left text-sm hover:bg-white/5 transition-colors flex items-center justify-between"
                  style={{ color: sortBy === opt.value ? "#10b981" : "#c4cdd8" }}
                  onClick={() => { setSortBy(opt.value); setShowSort(false); }}
                >
                  {opt.label}
                  {sortBy === opt.value && <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#10b981" }} />}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm transition-all hover:bg-white/5"
          style={{ border: "1px solid rgba(16,185,129,0.15)", color: "#6b7fa3" }}
        >
          <Filter size={14} /> Filter
        </button>
      </div>

      {/* Category pills */}
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

      {/* Upcoming events */}
      {upcoming.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: "#6b7fa3" }}>
            <Clock size={14} color="#10b981" />
            <span className="text-white">Upcoming Events</span>
            <span
              className="px-2 py-0.5 rounded-full text-xs"
              style={{ background: "rgba(16,185,129,0.1)", color: "#10b981" }}
            >
              {upcoming.length}
            </span>
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {upcoming.map((event) => (
              <EventCard key={event.id} event={event} onNavigate={onNavigate} upcoming />
            ))}
          </div>
        </section>
      )}

      {/* Past events */}
      {past.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: "#6b7fa3" }}>
            <span className="text-white">Past Events</span>
            <span
              className="px-2 py-0.5 rounded-full text-xs"
              style={{ background: "rgba(255,255,255,0.05)", color: "#6b7fa3" }}
            >
              {past.length}
            </span>
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {past.map((event) => (
              <EventCard key={event.id} event={event} onNavigate={onNavigate} />
            ))}
          </div>
        </section>
      )}

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="text-center py-16">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.15)" }}
          >
            <Search size={24} color="#6b7fa3" />
          </div>
          <p className="text-base font-medium text-white mb-1">No events found</p>
          <p className="text-sm" style={{ color: "#6b7fa3" }}>Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
}

// ── EventCard (unchanged UI, updated prop type) ──────────────────────────────
function EventCard({
  event,
  onNavigate,
  upcoming = false,
}: {
  event: UIEvent;
  onNavigate: (s: string, media?: undefined, eventId?: string) => void;
  upcoming?: boolean;
}) {
  const color = categoryColors[event.category] || "#10b981";
  const dateFormatted = new Date(event.date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div
      className="rounded-2xl overflow-hidden cursor-pointer group transition-all duration-200 hover:scale-[1.01] hover:shadow-xl"
      style={{
        background: "rgba(11,18,32,0.8)",
        border: `1px solid ${upcoming ? "rgba(16,185,129,0.2)" : "rgba(16,185,129,0.08)"}`,
        boxShadow: upcoming ? "0 0 0 1px rgba(16,185,129,0.05)" : "none",
      }}
      onClick={() => onNavigate("eventdetails", undefined, event.id)}
    >
      {/* Image */}
      <div className="relative overflow-hidden" style={{ height: 160 }}>
        <img
          src={event.image}
          alt={event.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => { (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE; }}
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 40%, rgba(11,18,32,0.8) 100%)" }} />

        {/* Category badge */}
        <div className="absolute top-3 left-3">
          <span
            className="px-2.5 py-1 rounded-full text-xs font-semibold"
            style={{ background: `${color}25`, color, border: `1px solid ${color}50`, backdropFilter: "blur(8px)" }}
          >
            {event.category}
          </span>
        </div>

        {/* Upcoming pill */}
        {upcoming && (
          <div className="absolute top-3 right-3">
            <span
              className="px-2 py-0.5 rounded-full text-xs font-medium"
              style={{ background: "rgba(16,185,129,0.25)", color: "#10b981", backdropFilter: "blur(8px)", border: "1px solid rgba(16,185,129,0.5)" }}
            >
              Upcoming
            </span>
          </div>
        )}

        {/* Media count */}
        {event.photos > 0 && (
          <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full text-xs" style={{ background: "rgba(0,0,0,0.6)", color: "white", backdropFilter: "blur(4px)" }}>
            <Camera size={11} /> {event.photos.toLocaleString()}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-sm font-semibold text-white leading-snug mb-1 group-hover:text-emerald-400 transition-colors line-clamp-1">
          {event.name}
        </h3>
        <p className="text-xs mb-3" style={{ color: "#6b7fa3" }}>{event.organizer}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs" style={{ color: "#6b7fa3" }}>
            <Clock size={11} /> {dateFormatted}
          </div>
          {event.photos > 0 && (
  <span className="text-xs" style={{ color: "#6b7fa3" }}>
    {event.photos.toLocaleString()} photos · {event.videos} videos
  </span>
)}
        </div>
      </div>
    </div>
  );
}