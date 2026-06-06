import { Camera, Calendar, Image, Video, Users, TrendingUp, Plus, Eye, Heart, Sparkles, Clock, MapPin, ArrowRight } from "lucide-react";

interface DashboardProps {
  onNavigate: (screen: string) => void;
}

const stats = [
  { label: "Total Events", value: "1,284", change: "+12%", icon: Calendar, color: "#3b82f6" },
  { label: "Total Photos", value: "48,932", change: "+8%", icon: Image, color: "#10b981" },
  { label: "Total Videos", value: "3,741", change: "+24%", icon: Video, color: "#8b5cf6" },
  { label: "Total Users", value: "12,480", change: "+5%", icon: Users, color: "#f59e0b" },
];

const recentEvents = [
  {
    id: 1,
    name: "Annual Tech Fest 2025",
    category: "Technical",
    date: "May 28, 2025",
    photos: 842,
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=220&fit=crop&auto=format",
    organizer: "CSE Department",
  },
  {
    id: 2,
    name: "Cultural Night — Spring Edition",
    category: "Cultural",
    date: "May 15, 2025",
    photos: 1204,
    image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=220&fit=crop&auto=format",
    organizer: "Cultural Club",
  },
  {
    id: 3,
    name: "Intercollege Sports Meet",
    category: "Sports",
    date: "May 10, 2025",
    photos: 567,
    image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&h=220&fit=crop&auto=format",
    organizer: "Sports Committee",
  },
];

const upcomingEvents = [
  { name: "Freshers' Welcome 2025", date: "Jun 15, 2025", time: "4:00 PM", venue: "Main Auditorium", category: "Cultural" },
  { name: "Robotics Workshop", date: "Jun 20, 2025", time: "10:00 AM", venue: "Lab Complex", category: "Technical" },
  { name: "Photography Contest", date: "Jun 25, 2025", time: "2:00 PM", venue: "Gallery Hall", category: "Arts" },
  { name: "Entrepreneurship Summit", date: "Jul 1, 2025", time: "9:00 AM", venue: "Conference Center", category: "Academic" },
];

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
};

export function Dashboard({ onNavigate }: DashboardProps) {
  return (
    <div className="p-6 space-y-6">
      {/* Quick actions */}
      <div>
        <p className="text-xs font-medium uppercase tracking-wider mb-3" style={{ color: "#6b7fa3" }}>Quick Actions</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "Create Event", icon: Plus, color: "#10b981", screen: "createevent" },
            { label: "Upload Media", icon: Camera, color: "#3b82f6", screen: "upload" },
            { label: "View Gallery", icon: Image, color: "#8b5cf6", screen: "gallery" },
            { label: "AI Search", icon: Sparkles, color: "#f59e0b", screen: "myphotos" },
          ].map(({ label, icon: Icon, color, screen }) => (
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

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        {stats.map(({ label, value, change, icon: Icon, color }) => (
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
            {recentEvents.map((event) => (
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
            ))}
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
            {upcomingEvents.map((event, i) => (
              <div
                key={i}
                className="p-3.5 rounded-xl cursor-pointer transition-all duration-200 hover:scale-[1.01]"
                style={{
                  background: "rgba(11,18,32,0.8)",
                  border: "1px solid rgba(16,185,129,0.1)",
                }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex flex-col items-center justify-center flex-shrink-0 text-xs font-bold"
                    style={{ background: `${categoryColors[event.category] || "#10b981"}15`, color: categoryColors[event.category] || "#10b981" }}
                  >
                    <span>{event.date.split(" ")[1].replace(",", "")}</span>
                    <span style={{ fontSize: 9 }}>{event.date.split(" ")[0]}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white leading-snug">{event.name}</p>
                    <p className="text-xs mt-0.5 flex items-center gap-1" style={{ color: "#6b7fa3" }}>
                      <Clock size={10} /> {event.time}
                    </p>
                    <p className="text-xs flex items-center gap-1 mt-0.5" style={{ color: "#6b7fa3" }}>
                      <MapPin size={10} /> {event.venue}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Trending media */}
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
