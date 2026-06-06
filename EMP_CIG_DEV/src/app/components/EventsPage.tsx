import { useState } from "react";
import { Search, Filter, Plus, Clock, Camera, ChevronDown, ArrowUpDown, Calendar } from "lucide-react";

interface EventsPageProps {
  onNavigate: (screen: string) => void;
}

const allEvents = [
  { id: 1, name: "Annual Tech Fest 2025", category: "Technical", date: "2025-05-28", photos: 842, videos: 34, organizer: "CSE Department", image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=500&h=280&fit=crop&auto=format" },
  { id: 2, name: "Cultural Night — Spring Edition", category: "Cultural", date: "2025-05-15", photos: 1204, videos: 67, organizer: "Cultural Club", image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=500&h=280&fit=crop&auto=format" },
  { id: 3, name: "Intercollege Sports Meet", category: "Sports", date: "2025-05-10", photos: 567, videos: 22, organizer: "Sports Committee", image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=500&h=280&fit=crop&auto=format" },
  { id: 4, name: "Freshers' Welcome 2025", category: "Cultural", date: "2025-06-15", photos: 0, videos: 0, organizer: "Student Council", image: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=500&h=280&fit=crop&auto=format" },
  { id: 5, name: "Robotics Workshop", category: "Workshop", date: "2025-06-20", photos: 0, videos: 0, organizer: "Robotics Club", image: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=500&h=280&fit=crop&auto=format" },
  { id: 6, name: "Photography Contest", category: "Arts", date: "2025-06-25", photos: 0, videos: 0, organizer: "Photography Society", image: "https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=500&h=280&fit=crop&auto=format" },
  { id: 7, name: "Entrepreneurship Summit", category: "Academic", date: "2025-07-01", photos: 0, videos: 0, organizer: "E-Cell", image: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=500&h=280&fit=crop&auto=format" },
  { id: 8, name: "Annual Convocation 2025", category: "Academic", date: "2025-04-20", photos: 2341, videos: 12, organizer: "Administration", image: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=500&h=280&fit=crop&auto=format" },
  { id: 9, name: "Music & Arts Festival", category: "Cultural", date: "2025-04-05", photos: 934, videos: 41, organizer: "Arts Council", image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=500&h=280&fit=crop&auto=format" },
  { id: 10, name: "Hackathon 24H", category: "Technical", date: "2025-03-18", photos: 312, videos: 8, organizer: "CSE Department", image: "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=500&h=280&fit=crop&auto=format" },
  { id: 11, name: "Inter-House Cricket League", category: "Sports", date: "2025-03-05", photos: 456, videos: 18, organizer: "Sports Committee", image: "https://images.unsplash.com/photo-1550305080-4e029753abcf?w=500&h=280&fit=crop&auto=format" },
  { id: 12, name: "AI & ML Symposium", category: "Academic", date: "2025-02-22", photos: 287, videos: 6, organizer: "AI Research Club", image: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=500&h=280&fit=crop&auto=format" },
];

const categories = ["All", "Technical", "Cultural", "Sports", "Academic", "Arts", "Workshop"];

const categoryColors: Record<string, string> = {
  Technical: "#3b82f6",
  Cultural: "#ec4899",
  Sports: "#f59e0b",
  Academic: "#10b981",
  Arts: "#8b5cf6",
  Workshop: "#06b6d4",
};

const sortOptions = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "az", label: "A → Z" },
  { value: "za", label: "Z → A" },
];

export function EventsPage({ onNavigate }: EventsPageProps) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [showSort, setShowSort] = useState(false);
  const [dateFilter, setDateFilter] = useState("");

  const filtered = allEvents
    .filter((e) => {
      const matchSearch = e.name.toLowerCase().includes(search.toLowerCase()) || e.organizer.toLowerCase().includes(search.toLowerCase());
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

  const upcoming = filtered.filter((e) => e.date > new Date().toISOString().split("T")[0]);
  const past = filtered.filter((e) => e.date <= new Date().toISOString().split("T")[0]);

  return (
    <div className="p-6 space-y-5">
      {/* Page header */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>All Events</h2>
          <p className="text-sm" style={{ color: "#6b7fa3" }}>{allEvents.length} events · {allEvents.reduce((s, e) => s + e.photos, 0).toLocaleString()} photos</p>
        </div>
        <button
          onClick={() => onNavigate("createevent")}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:scale-105 flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #10b981, #059669)", boxShadow: "0 4px 16px rgba(16,185,129,0.3)" }}
        >
          <Plus size={16} /> Create Event
        </button>
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

function EventCard({ event, onNavigate, upcoming = false }: { event: typeof allEvents[0]; onNavigate: (s: string) => void; upcoming?: boolean }) {
  const color = categoryColors[event.category] || "#10b981";
  const dateFormatted = new Date(event.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <div
      className="rounded-2xl overflow-hidden cursor-pointer group transition-all duration-200 hover:scale-[1.01] hover:shadow-xl"
      style={{
        background: "rgba(11,18,32,0.8)",
        border: `1px solid ${upcoming ? "rgba(16,185,129,0.2)" : "rgba(16,185,129,0.08)"}`,
        boxShadow: upcoming ? "0 0 0 1px rgba(16,185,129,0.05)" : "none",
      }}
      onClick={() => onNavigate("eventdetails")}
    >
      {/* Image */}
      <div className="relative overflow-hidden" style={{ height: 160 }}>
        <img
          src={event.image}
          alt={event.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
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

        {/* Media count at bottom */}
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
          {event.photos > 0 ? (
            <span className="text-xs" style={{ color: "#6b7fa3" }}>
              {event.photos.toLocaleString()} photos · {event.videos} videos
            </span>
          ) : (
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(245,158,11,0.1)", color: "#f59e0b" }}>
              No media yet
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
