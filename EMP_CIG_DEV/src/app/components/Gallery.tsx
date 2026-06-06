import { useState } from "react";
import { Search, Filter, Heart, MessageCircle, Download, Share2, Bookmark, Sparkles, ChevronDown, Tag } from "lucide-react";

const photos = [
  { id: 1, src: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=260&fit=crop&auto=format", likes: 342, comments: 24, tags: ["#TechFest", "#Opening"], event: "Tech Fest 2025" },
  { id: 2, src: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=400&fit=crop&auto=format", likes: 891, comments: 67, tags: ["#Cultural", "#Dance"], event: "Cultural Night" },
  { id: 3, src: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=400&h=300&fit=crop&auto=format", likes: 234, comments: 12, tags: ["#Graduation", "#Academic"], event: "Convocation 2025" },
  { id: 4, src: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=400&h=280&fit=crop&auto=format", likes: 567, comments: 43, tags: ["#Sports", "#Football"], event: "Sports Meet" },
  { id: 5, src: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&h=260&fit=crop&auto=format", likes: 189, comments: 8, tags: ["#Sports", "#Track"], event: "Sports Meet" },
  { id: 6, src: "https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=400&h=340&fit=crop&auto=format", likes: 723, comments: 56, tags: ["#Music", "#Concert"], event: "Cultural Night" },
  { id: 7, src: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=400&h=300&fit=crop&auto=format", likes: 445, comments: 31, tags: ["#Ceremony", "#Awards"], event: "Annual Day" },
  { id: 8, src: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=400&h=360&fit=crop&auto=format", likes: 312, comments: 22, tags: ["#Classroom", "#Learning"], event: "Tech Workshop" },
  { id: 9, src: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=400&h=250&fit=crop&auto=format", likes: 678, comments: 48, tags: ["#Party", "#Freshers"], event: "Freshers Night" },
  { id: 10, src: "https://images.unsplash.com/photo-1550305080-4e029753abcf?w=400&h=320&fit=crop&auto=format", likes: 198, comments: 15, tags: ["#Photography", "#Contest"], event: "Photo Contest" },
  { id: 11, src: "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=400&h=280&fit=crop&auto=format", likes: 834, comments: 72, tags: ["#Celebration", "#Fun"], event: "Freshers Night" },
  { id: 12, src: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=400&h=300&fit=crop&auto=format", likes: 521, comments: 39, tags: ["#Seminar", "#Talk"], event: "E-Summit" },
];

const categories = ["All", "Technical", "Cultural", "Sports", "Academic", "Arts", "Workshop"];

interface GalleryProps {
  onNavigate: (screen: string) => void;
}

export function Gallery({ onNavigate }: GalleryProps) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [liked, setLiked] = useState<number[]>([]);
  const [saved, setSaved] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const toggleLike = (id: number) =>
    setLiked((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  const toggleSave = (id: number) =>
    setSaved((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>Media Gallery</h2>
          <p className="text-sm" style={{ color: "#6b7fa3" }}>48,932 photos · 3,741 videos</p>
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto">
          {/* Search */}
          <div className="relative flex-1 lg:w-72">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#6b7fa3" }} />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search photos, events, tags..."
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

      {/* AI tag suggestions */}
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-xl"
        style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.2)" }}
      >
        <Sparkles size={15} color="#f59e0b" className="flex-shrink-0" />
        <p className="text-sm flex-1" style={{ color: "#c4cdd8" }}>
          AI detected tags:
        </p>
        <div className="flex gap-2 flex-wrap">
          {["#Crowd", "#Nighttime", "#Celebration", "#Stage"].map((t) => (
            <span
              key={t}
              className="px-2 py-0.5 rounded-full text-xs"
              style={{ background: "rgba(245,158,11,0.12)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.25)" }}
            >
              <Tag size={9} className="inline mr-1" />
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* Masonry grid */}
      <div className="columns-2 lg:columns-3 xl:columns-4 gap-3 space-y-3">
        {photos.map((photo) => (
          <div
            key={photo.id}
            className="relative group rounded-xl overflow-hidden break-inside-avoid cursor-pointer transition-transform duration-200 hover:scale-[1.01]"
            style={{ background: "#0b1220" }}
            onClick={() => onNavigate("photodetails")}
          >
            <img src={photo.src} alt={`Photo ${photo.id}`} className="w-full object-cover" />

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-all duration-200">
              {/* Top row */}
              <div className="absolute top-2 right-2 flex gap-1">
                <button
                  onClick={(e) => { e.stopPropagation(); toggleSave(photo.id); }}
                  className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                  style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
                >
                  <Bookmark size={13} color={saved.includes(photo.id) ? "#f59e0b" : "white"} fill={saved.includes(photo.id) ? "#f59e0b" : "none"} />
                </button>
              </div>

              {/* Bottom row */}
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <p className="text-xs font-medium text-white mb-1.5 truncate">{photo.event}</p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleLike(photo.id); }}
                    className="flex items-center gap-1 text-xs text-white transition-all hover:scale-110"
                  >
                    <Heart size={13} fill={liked.includes(photo.id) ? "#ec4899" : "none"} color={liked.includes(photo.id) ? "#ec4899" : "white"} />
                    {liked.includes(photo.id) ? photo.likes + 1 : photo.likes}
                  </button>
                  <button className="flex items-center gap-1 text-xs text-white">
                    <MessageCircle size={13} /> {photo.comments}
                  </button>
                  <div className="flex gap-1 ml-auto">
                    <button
                      onClick={(e) => { e.stopPropagation(); }}
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

      {/* Load more */}
      <div className="flex justify-center pt-4">
        <button
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm transition-all hover:scale-105"
          style={{
            background: "rgba(16,185,129,0.08)",
            border: "1px solid rgba(16,185,129,0.2)",
            color: "#10b981",
          }}
        >
          Load More <ChevronDown size={15} />
        </button>
      </div>
    </div>
  );
}
