import { useState } from "react";
import { ArrowLeft, Camera, Share2, Download, Clock, MapPin, User, Tag, Heart, MessageCircle, Filter, SortAsc, Play, ChevronDown } from "lucide-react";

interface EventDetailsProps {
  onBack: () => void;
  onNavigate: (screen: string) => void;
}

const photos = [
  "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=300&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=300&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=400&h=500&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=400&h=300&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=400&h=300&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1511578314322-379afb476865?w=400&h=400&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=400&h=300&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=400&h=350&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1550305080-4e029753abcf?w=400&h=300&fit=crop&auto=format",
];

const tags = ["#TechFest2025", "#Innovation", "#College", "#CSE", "#Robotics", "#Hackathon", "#Workshop"];

export function EventDetails({ onBack, onNavigate }: EventDetailsProps) {
  const [activeFilter, setActiveFilter] = useState("all");
  const [liked, setLiked] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);

  return (
    <div className="pb-8">
      {/* Banner */}
      <div className="relative h-72 overflow-hidden" style={{ background: "#0b1220" }}>
        <img
          src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&h=400&fit=crop&auto=format"
          alt="Event Banner"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(4,7,15,0.3) 0%, rgba(4,7,15,0.9) 100%)" }} />

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
              <span
                className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold mb-2"
                style={{ background: "rgba(59,130,246,0.25)", color: "#93c5fd", border: "1px solid rgba(59,130,246,0.4)" }}
              >
                Technical
              </span>
              <h1 className="text-3xl font-black text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>
                Annual Tech Fest 2025
              </h1>
            </div>
            <div className="flex gap-2">
              <button
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs text-white transition-all hover:scale-105"
                style={{ background: "rgba(16,185,129,0.2)", border: "1px solid rgba(16,185,129,0.4)", backdropFilter: "blur(8px)" }}
                onClick={() => onNavigate("upload")}
              >
                <Camera size={14} /> Upload
              </button>
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
        {/* Meta info */}
        <div
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-5 rounded-2xl"
          style={{ background: "rgba(11,18,32,0.8)", border: "1px solid rgba(16,185,129,0.1)" }}
        >
          {[
            { icon: Clock, label: "Date", value: "May 28–30, 2025" },
            { icon: MapPin, label: "Venue", value: "Main Campus Grounds" },
            { icon: User, label: "Organizer", value: "CSE Department" },
            { icon: Camera, label: "Media", value: "842 Photos · 34 Videos" },
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

        {/* Description */}
        <div>
          <p className="text-sm leading-relaxed" style={{ color: "#c4cdd8" }}>
            The Annual Tech Fest 2025 was a 3-day celebration of technology, innovation, and creativity hosted by the Computer Science & Engineering Department. The event featured over 40 workshops, 8 competitive hackathons, robotics demonstrations, AI showcases, and cultural performances, attracting more than 5,000 students from 30+ colleges.
          </p>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 rounded-full text-xs cursor-pointer transition-all hover:scale-105"
              style={{ background: "rgba(16,185,129,0.08)", color: "#10b981", border: "1px solid rgba(16,185,129,0.2)" }}
            >
              <Tag size={10} className="inline mr-1" />
              {tag}
            </span>
          ))}
        </div>

        {/* Filters */}
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

        {/* Gallery grid */}
        <div className="columns-2 lg:columns-3 gap-3 space-y-3">
          {photos.map((src, i) => (
            <div
              key={i}
              className="relative group rounded-xl overflow-hidden break-inside-avoid cursor-pointer"
              style={{ background: "#0b1220" }}
              onClick={() => onNavigate("photodetails")}
            >
              {i === 2 && (
                <div className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full flex items-center justify-center" style={{ background: "rgba(0,0,0,0.6)" }}>
                  <Play size={12} color="white" fill="white" />
                </div>
              )}
              <img src={src} alt={`Photo ${i + 1}`} className="w-full object-cover transition-transform duration-300 group-hover:scale-105" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-200">
                <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center gap-3">
                  <button
                    onClick={(e) => { e.stopPropagation(); setLiked(!liked); }}
                    className="flex items-center gap-1 text-xs text-white"
                  >
                    <Heart size={14} fill={liked ? "currentColor" : "none"} />
                    {liked ? "1.2K" : "1.1K"}
                  </button>
                  <button className="flex items-center gap-1 text-xs text-white">
                    <MessageCircle size={14} /> 48
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
