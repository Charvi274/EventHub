import { useState } from "react";
import { Camera, Edit3, Award, Image, Star, Calendar, Heart, Upload, ChevronRight } from "lucide-react";

const uploadedMedia = [
  "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=200&h=140&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=200&h=140&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=200&h=140&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=200&h=140&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=200&h=140&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=200&h=140&fit=crop&auto=format",
];

const favoriteMedia = [
  "https://images.unsplash.com/photo-1511578314322-379afb476865?w=200&h=140&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=200&h=140&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1550305080-4e029753abcf?w=200&h=140&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=200&h=140&fit=crop&auto=format",
];

const events = [
  { name: "Annual Tech Fest 2025", role: "Photographer", photos: 142, date: "May 28" },
  { name: "Cultural Night", role: "Attendee", photos: 23, date: "May 15" },
  { name: "Sports Meet", role: "Attendee", photos: 0, date: "May 10" },
  { name: "Robotics Workshop", role: "Organizer", photos: 67, date: "Jun 20" },
  { name: "Photography Contest", role: "Photographer", photos: 52, date: "Jun 25" },
];

interface ProfilePageProps {
  onNavigate?: (screen: string) => void;
}

export function Profile({ onNavigate }: ProfilePageProps) {
  const [activeTab, setActiveTab] = useState<"uploads" | "favorites" | "events">("uploads");

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Profile header card */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: "rgba(11,18,32,0.8)", border: "1px solid rgba(16,185,129,0.12)" }}
      >
        {/* Cover */}
        <div
          className="h-40 relative"
          style={{
            background: "linear-gradient(135deg, #06091a 0%, #0a1a12 50%, #041510 100%)",
          }}
        >
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: "radial-gradient(ellipse 80% 60% at 30% 50%, rgba(16,185,129,0.15) 0%, transparent 70%)",
            }}
          />
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: `linear-gradient(rgba(16,185,129,1) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,1) 1px, transparent 1px)`,
              backgroundSize: "30px 30px",
            }}
          />
          <button
            className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs text-white transition-all hover:bg-white/10"
            style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            <Edit3 size={12} /> Edit Cover
          </button>
        </div>

        {/* Avatar + info */}
        <div className="px-6 pb-6">
          <div className="flex items-end justify-between -mt-10 mb-5">
            <div className="relative">
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-black"
                style={{
                  background: "linear-gradient(135deg, #10b981, #3b82f6)",
                  color: "white",
                  border: "3px solid #06091a",
                  fontFamily: "'Outfit', sans-serif",
                }}
              >
                A
              </div>
              <button
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg flex items-center justify-center"
                style={{ background: "#10b981", border: "2px solid #06091a" }}
              >
                <Camera size={11} color="white" />
              </button>
            </div>
            <div className="flex gap-2 mb-1">
              <button
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-white transition-all hover:scale-105"
                style={{ background: "linear-gradient(135deg, #10b981, #059669)", boxShadow: "0 4px 15px rgba(16,185,129,0.3)" }}
                onClick={() => onNavigate?.("upload")}
              >
                <Upload size={14} /> Upload Media
              </button>
              <button
                onClick={() => onNavigate?.("settings")}
                className="px-4 py-2 rounded-xl text-sm transition-all hover:bg-white/5 flex items-center gap-1.5"
                style={{ border: "1px solid rgba(16,185,129,0.2)", color: "#6b7fa3" }}
              >
                <Edit3 size={14} /> Edit Profile
              </button>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>Arjun Mehta</h2>
            <p className="text-sm mb-3" style={{ color: "#6b7fa3" }}>2021CS0124 · arjun.mehta@university.edu</p>
            <div className="flex items-center gap-2 flex-wrap mb-3">
              <span
                className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
                style={{ background: "rgba(245,158,11,0.12)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.3)" }}
              >
                <Award size={11} /> Admin
              </span>
              <span
                className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs"
                style={{ background: "rgba(139,92,246,0.1)", color: "#a78bfa", border: "1px solid rgba(139,92,246,0.2)" }}
              >
                <Camera size={11} /> Photographer
              </span>
              <span className="text-xs" style={{ color: "#6b7fa3" }}>Computer Science · Year 4</span>
            </div>
            <p className="text-sm" style={{ color: "#c4cdd8", maxWidth: 500 }}>
              Passionate about capturing college memories. Head photographer for CSE Department events and official campus photojournalist.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-3 mt-5">
            {[
              { label: "Uploads", value: "284", icon: Image, color: "#10b981" },
              { label: "Events", value: "18", icon: Calendar, color: "#3b82f6" },
              { label: "Favorites", value: "1.2K", icon: Star, color: "#f59e0b" },
              { label: "Likes Received", value: "8.4K", icon: Heart, color: "#ec4899" },
            ].map(({ label, value, icon: Icon, color }) => (
              <div
                key={label}
                className="text-center p-3 rounded-xl transition-all hover:scale-[1.02]"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-2" style={{ background: `${color}15` }}>
                  <Icon size={15} color={color} />
                </div>
                <p className="text-base font-bold text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>{value}</p>
                <p className="text-xs" style={{ color: "#6b7fa3" }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div>
        <div className="flex gap-2 mb-5 p-1 rounded-xl w-fit" style={{ background: "rgba(11,18,32,0.8)", border: "1px solid rgba(16,185,129,0.1)" }}>
          {(["uploads", "favorites", "events"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="px-4 py-2 rounded-lg text-sm capitalize transition-all"
              style={{
                background: activeTab === tab ? "rgba(16,185,129,0.15)" : "transparent",
                color: activeTab === tab ? "#10b981" : "#6b7fa3",
                border: activeTab === tab ? "1px solid rgba(16,185,129,0.3)" : "1px solid transparent",
                fontWeight: activeTab === tab ? 600 : 400,
              }}
            >
              {tab === "uploads" ? "My Uploads (284)" : tab === "favorites" ? "Favorites (1.2K)" : "Events (18)"}
            </button>
          ))}
        </div>

        {activeTab === "uploads" && (
          <div className="grid grid-cols-3 lg:grid-cols-6 gap-2">
            {uploadedMedia.map((src, i) => (
              <div key={i} className="relative group rounded-xl overflow-hidden cursor-pointer" style={{ aspectRatio: "3/2", background: "#0b1220" }}>
                <img src={src} alt={`Upload ${i}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <Heart size={16} color="white" />
                </div>
              </div>
            ))}
            <div
              className="rounded-xl flex items-center justify-center cursor-pointer hover:bg-emerald-500/10 transition-colors"
              style={{ aspectRatio: "3/2", background: "rgba(11,18,32,0.6)", border: "1px dashed rgba(16,185,129,0.2)" }}
            >
              <span className="text-xs" style={{ color: "#6b7fa3" }}>+278 more</span>
            </div>
          </div>
        )}

        {activeTab === "favorites" && (
          <div className="grid grid-cols-3 lg:grid-cols-4 gap-2">
            {favoriteMedia.map((src, i) => (
              <div key={i} className="relative group rounded-xl overflow-hidden cursor-pointer" style={{ aspectRatio: "3/2", background: "#0b1220" }}>
                <img src={src} alt={`Fav ${i}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: "rgba(0,0,0,0.5)" }}>
                    <Star size={12} color="#f59e0b" fill="#f59e0b" />
                  </div>
                </div>
              </div>
            ))}
            <div
              className="rounded-xl flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-emerald-500/5 transition-colors"
              style={{ aspectRatio: "3/2", background: "rgba(11,18,32,0.6)", border: "1px dashed rgba(16,185,129,0.2)" }}
              onClick={() => onNavigate?.("favorites")}
            >
              <Star size={16} color="#6b7fa3" />
              <span className="text-xs" style={{ color: "#6b7fa3" }}>View all</span>
            </div>
          </div>
        )}

        {activeTab === "events" && (
          <div className="space-y-3">
            {events.map((event, i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all hover:scale-[1.005]"
                style={{ background: "rgba(11,18,32,0.8)", border: "1px solid rgba(16,185,129,0.1)" }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(16,185,129,0.1)" }}
                >
                  <Calendar size={18} color="#10b981" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white">{event.name}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-xs" style={{ color: "#6b7fa3" }}>{event.date}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(16,185,129,0.08)", color: "#10b981" }}>
                      {event.role}
                    </span>
                    {event.photos > 0 && (
                      <span className="text-xs flex items-center gap-1" style={{ color: "#6b7fa3" }}>
                        <Camera size={10} /> {event.photos} photos
                      </span>
                    )}
                  </div>
                </div>
                <ChevronRight size={16} style={{ color: "#6b7fa3" }} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
