import { useState } from "react";
import { Heart, Bookmark, Download, Share2, X, Clock, Camera, Star, Image, Video } from "lucide-react";

interface FavoriteItem {
  id: number;
  src: string;
  type: "photo" | "video";
  event: string;
  date: string;
  likes: number;
  savedAt: string;
}

const favorites: FavoriteItem[] = [
  { id: 1, src: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=280&fit=crop&auto=format", type: "photo", event: "Tech Fest 2025", date: "May 28", likes: 342, savedAt: "2 hours ago" },
  { id: 2, src: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=360&fit=crop&auto=format", type: "photo", event: "Cultural Night", date: "May 15", likes: 891, savedAt: "5 hours ago" },
  { id: 3, src: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=400&h=280&fit=crop&auto=format", type: "video", event: "Sports Meet", date: "May 10", likes: 567, savedAt: "Yesterday" },
  { id: 4, src: "https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=400&h=300&fit=crop&auto=format", type: "photo", event: "Cultural Night", date: "May 15", likes: 723, savedAt: "Yesterday" },
  { id: 5, src: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=400&h=280&fit=crop&auto=format", type: "photo", event: "Convocation 2025", date: "Apr 20", likes: 234, savedAt: "2 days ago" },
  { id: 6, src: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=400&h=340&fit=crop&auto=format", type: "photo", event: "Annual Day", date: "Apr 10", likes: 445, savedAt: "3 days ago" },
  { id: 7, src: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=400&h=260&fit=crop&auto=format", type: "video", event: "Tech Workshop", date: "Mar 25", likes: 312, savedAt: "1 week ago" },
  { id: 8, src: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=400&h=300&fit=crop&auto=format", type: "photo", event: "Freshers Night", date: "Aug 10", likes: 678, savedAt: "1 week ago" },
];

export function FavoritesPage() {
  const [items, setItems] = useState(favorites);
  const [activeTab, setActiveTab] = useState<"all" | "photos" | "videos">("all");
  const [removingId, setRemovingId] = useState<number | null>(null);

  const handleRemove = (id: number) => {
    setRemovingId(id);
    setTimeout(() => {
      setItems((prev) => prev.filter((i) => i.id !== id));
      setRemovingId(null);
    }, 300);
  };

  const displayed = items.filter((i) => activeTab === "all" || i.type === activeTab.slice(0, -1) as "photo" | "video");

  const photoCount = items.filter((i) => i.type === "photo").length;
  const videoCount = items.filter((i) => i.type === "video").length;

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
            <Star size={20} color="#f59e0b" /> Favorites
          </h2>
          <p className="text-sm" style={{ color: "#6b7fa3" }}>
            {photoCount} photos · {videoCount} videos saved
          </p>
        </div>
        {items.length > 0 && (
          <div className="flex gap-2">
            <button
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all hover:bg-white/5"
              style={{ border: "1px solid rgba(16,185,129,0.15)", color: "#6b7fa3" }}
            >
              <Download size={14} /> Download All
            </button>
            <button
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all hover:bg-white/5"
              style={{ border: "1px solid rgba(16,185,129,0.15)", color: "#6b7fa3" }}
            >
              <Share2 size={14} /> Share Collection
            </button>
          </div>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: Heart, label: "Total Saved", value: items.length, color: "#ec4899" },
          { icon: Image, label: "Photos", value: photoCount, color: "#10b981" },
          { icon: Video, label: "Videos", value: videoCount, color: "#8b5cf6" },
        ].map(({ icon: Icon, label, value, color }) => (
          <div
            key={label}
            className="flex items-center gap-3 p-4 rounded-xl"
            style={{ background: "rgba(11,18,32,0.8)", border: "1px solid rgba(16,185,129,0.08)" }}
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}15` }}>
              <Icon size={17} color={color} />
            </div>
            <div>
              <p className="text-lg font-bold text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>{value}</p>
              <p className="text-xs" style={{ color: "#6b7fa3" }}>{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 rounded-xl w-fit" style={{ background: "rgba(11,18,32,0.8)", border: "1px solid rgba(16,185,129,0.1)" }}>
        {(["all", "photos", "videos"] as const).map((tab) => (
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
            {tab === "all" ? `All (${items.length})` : tab === "photos" ? `Photos (${photoCount})` : `Videos (${videoCount})`}
          </button>
        ))}
      </div>

      {/* Section: Recently favorited */}
      {activeTab === "all" && (
        <div
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl"
          style={{ background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.15)" }}
        >
          <Clock size={14} color="#f59e0b" />
          <p className="text-xs" style={{ color: "#c4cdd8" }}>
            <span style={{ color: "#f59e0b" }}>Recently saved:</span> {items[0]?.event} — {items[0]?.savedAt}
          </p>
        </div>
      )}

      {/* Grid */}
      {displayed.length > 0 ? (
        <div className="columns-2 lg:columns-3 xl:columns-4 gap-3 space-y-3">
          {displayed.map((item) => (
            <div
              key={item.id}
              className="relative group rounded-xl overflow-hidden break-inside-avoid transition-all duration-300"
              style={{
                opacity: removingId === item.id ? 0 : 1,
                transform: removingId === item.id ? "scale(0.95)" : "scale(1)",
                background: "#0b1220",
              }}
            >
              {/* Video badge */}
              {item.type === "video" && (
                <div
                  className="absolute top-2 left-2 z-10 flex items-center gap-1 px-2 py-0.5 rounded-full text-xs"
                  style={{ background: "rgba(139,92,246,0.3)", color: "#a78bfa", border: "1px solid rgba(139,92,246,0.4)", backdropFilter: "blur(4px)" }}
                >
                  <Video size={10} /> Video
                </div>
              )}

              <img src={item.src} alt={item.event} className="w-full object-cover" />

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/30 opacity-0 group-hover:opacity-100 transition-all duration-200">
                {/* Remove button */}
                <button
                  onClick={() => handleRemove(item.id)}
                  className="absolute top-2 right-2 w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                  style={{ background: "rgba(239,68,68,0.2)", border: "1px solid rgba(239,68,68,0.4)", backdropFilter: "blur(4px)" }}
                  title="Remove from favorites"
                >
                  <X size={13} color="#f87171" />
                </button>

                {/* Saved indicator */}
                <div className="absolute top-2 left-2 w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(245,158,11,0.2)", backdropFilter: "blur(4px)" }}>
                  <Bookmark size={13} color="#f59e0b" fill="#f59e0b" />
                </div>

                {/* Bottom info */}
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p className="text-xs font-medium text-white mb-1 truncate">{item.event}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs" style={{ color: "#c4cdd8" }}>
                      <span className="flex items-center gap-1"><Heart size={11} /> {item.likes}</span>
                      <span className="flex items-center gap-1"><Camera size={11} /> {item.date}</span>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={(e) => e.stopPropagation()}
                        className="w-6 h-6 rounded-md flex items-center justify-center"
                        style={{ background: "rgba(0,0,0,0.4)" }}
                      >
                        <Download size={11} color="white" />
                      </button>
                      <button
                        onClick={(e) => e.stopPropagation()}
                        className="w-6 h-6 rounded-md flex items-center justify-center"
                        style={{ background: "rgba(0,0,0,0.4)" }}
                      >
                        <Share2 size={11} color="white" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs mt-1" style={{ color: "#6b7fa3" }}>Saved {item.savedAt}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)" }}
          >
            <Star size={32} color="#f59e0b" />
          </div>
          <p className="text-base font-semibold text-white mb-2">No favorites yet</p>
          <p className="text-sm" style={{ color: "#6b7fa3" }}>
            Browse the gallery and tap the bookmark icon to save photos and videos here.
          </p>
        </div>
      )}
    </div>
  );
}
