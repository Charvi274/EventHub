import { useState } from "react";
import { ArrowLeft, Heart, MessageCircle, Share2, Download, Bookmark, UserPlus, Send, MoreHorizontal, Sparkles } from "lucide-react";

interface PhotoDetailsProps {
  onBack: () => void;
}

const comments = [
  { id: 1, user: "Priya Sharma", avatar: "P", role: "Photographer", time: "2h ago", text: "Absolutely stunning shot! The lighting here is perfect 📸", likes: 23, color: "#ec4899" },
  { id: 2, user: "Rahul Gupta", avatar: "R", role: "Member", time: "4h ago", text: "This was such an incredible moment! I was standing right there when this happened", likes: 15, color: "#3b82f6" },
  { id: 3, user: "Ananya Iyer", avatar: "A", role: "Admin", time: "6h ago", text: "Great capture Kartik! You really have an eye for these candid moments 🎯", likes: 8, color: "#10b981" },
  { id: 4, user: "Dev Patel", avatar: "D", role: "Viewer", time: "1d ago", text: "Miss these days... Tech Fest was absolutely fire 🔥", likes: 42, color: "#f59e0b" },
];

const suggestedPhotos = [
  "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=200&h=140&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=200&h=140&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=200&h=140&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=200&h=140&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1511578314322-379afb476865?w=200&h=140&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=200&h=140&fit=crop&auto=format",
];

export function PhotoDetails({ onBack }: PhotoDetailsProps) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [likedComments, setLikedComments] = useState<number[]>([]);

  const toggleCommentLike = (id: number) =>
    setLikedComments((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));

  return (
    <div className="flex flex-col xl:flex-row min-h-[calc(100vh-64px)]" style={{ background: "#04070f" }}>
      {/* Photo viewer */}
      <div className="xl:flex-1 relative flex flex-col" style={{ background: "#06091a" }}>
        {/* Back button */}
        <div className="flex items-center justify-between p-4" style={{ borderBottom: "1px solid rgba(16,185,129,0.08)" }}>
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm transition-all hover:opacity-70"
            style={{ color: "#c4cdd8" }}
          >
            <ArrowLeft size={18} /> Back to Gallery
          </button>
          <button className="p-2 rounded-xl hover:bg-white/5 transition-colors" style={{ color: "#6b7fa3" }}>
            <MoreHorizontal size={18} />
          </button>
        </div>

        {/* Image */}
        <div className="flex-1 flex items-center justify-center p-6" style={{ background: "#04070f" }}>
          <img
            src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=900&h=600&fit=crop&auto=format"
            alt="Event Photo"
            className="max-w-full max-h-[60vh] object-contain rounded-2xl"
            style={{ boxShadow: "0 32px 80px rgba(0,0,0,0.6)" }}
          />
        </div>

        {/* Actions bar */}
        <div className="px-6 py-4 flex items-center gap-4" style={{ borderTop: "1px solid rgba(16,185,129,0.08)" }}>
          <button
            onClick={() => setLiked(!liked)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:scale-105"
            style={{
              background: liked ? "rgba(236,72,153,0.15)" : "rgba(255,255,255,0.05)",
              border: `1px solid ${liked ? "rgba(236,72,153,0.4)" : "rgba(255,255,255,0.1)"}`,
              color: liked ? "#ec4899" : "#c4cdd8",
            }}
          >
            <Heart size={16} fill={liked ? "currentColor" : "none"} />
            {liked ? "1,243" : "1,242"} Likes
          </button>

          <button
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:scale-105"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#c4cdd8" }}
          >
            <MessageCircle size={16} /> 48 Comments
          </button>

          <div className="flex gap-2 ml-auto">
            {[
              { icon: Share2, label: "Share" },
              { icon: Download, label: "Download" },
              { icon: UserPlus, label: "Tag" },
            ].map(({ icon: Icon, label }) => (
              <button
                key={label}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs transition-all hover:bg-white/5"
                style={{ border: "1px solid rgba(255,255,255,0.08)", color: "#6b7fa3" }}
                title={label}
              >
                <Icon size={14} /> {label}
              </button>
            ))}
            <button
              onClick={() => setSaved(!saved)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs transition-all hover:scale-105"
              style={{
                background: saved ? "rgba(245,158,11,0.1)" : "transparent",
                border: `1px solid ${saved ? "rgba(245,158,11,0.4)" : "rgba(255,255,255,0.08)"}`,
                color: saved ? "#f59e0b" : "#6b7fa3",
              }}
            >
              <Bookmark size={14} fill={saved ? "currentColor" : "none"} /> Save
            </button>
          </div>
        </div>

        {/* Suggested photos */}
        <div className="px-6 pb-6">
          <p className="text-xs font-medium mb-3" style={{ color: "#6b7fa3" }}>More from this event</p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {suggestedPhotos.map((src, i) => (
              <div
                key={i}
                className="flex-shrink-0 rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-transform"
                style={{ width: 100, height: 70, background: "#0b1220" }}
              >
                <img src={src} alt={`Suggested ${i}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel: info + comments */}
      <div
        className="xl:w-96 flex flex-col"
        style={{ borderLeft: "1px solid rgba(16,185,129,0.08)", background: "#06091a" }}
      >
        {/* Photo info */}
        <div className="p-5 space-y-4" style={{ borderBottom: "1px solid rgba(16,185,129,0.08)" }}>
          {/* Photographer */}
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #8b5cf6, #3b82f6)", color: "white" }}
            >
              K
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-white">Kartik Mehrotra</p>
              <p className="text-xs" style={{ color: "#6b7fa3" }}>Photographer · Tech Fest 2025</p>
            </div>
            <button
              className="text-xs px-3 py-1.5 rounded-xl transition-all hover:scale-105"
              style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", color: "#10b981" }}
            >
              Follow
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs" style={{ color: "#6b7fa3" }}>
            <div className="p-3 rounded-xl" style={{ background: "rgba(11,18,32,0.8)", border: "1px solid rgba(16,185,129,0.08)" }}>
              <p className="mb-0.5" style={{ color: "#6b7fa3" }}>Event</p>
              <p className="text-white font-medium">Annual Tech Fest</p>
            </div>
            <div className="p-3 rounded-xl" style={{ background: "rgba(11,18,32,0.8)", border: "1px solid rgba(16,185,129,0.08)" }}>
              <p className="mb-0.5" style={{ color: "#6b7fa3" }}>Date</p>
              <p className="text-white font-medium">May 28, 2025</p>
            </div>
            <div className="p-3 rounded-xl" style={{ background: "rgba(11,18,32,0.8)", border: "1px solid rgba(16,185,129,0.08)" }}>
              <p className="mb-0.5" style={{ color: "#6b7fa3" }}>Resolution</p>
              <p className="text-white font-medium">4032 × 3024</p>
            </div>
            <div className="p-3 rounded-xl" style={{ background: "rgba(11,18,32,0.8)", border: "1px solid rgba(16,185,129,0.08)" }}>
              <p className="mb-0.5" style={{ color: "#6b7fa3" }}>Camera</p>
              <p className="text-white font-medium">Sony A7 IV</p>
            </div>
          </div>

          {/* AI tags */}
          <div
            className="flex items-start gap-2 p-3 rounded-xl"
            style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.15)" }}
          >
            <Sparkles size={13} color="#f59e0b" className="mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-medium mb-1.5" style={{ color: "#f59e0b" }}>AI Detected Tags</p>
              <div className="flex flex-wrap gap-1.5">
                {["Stage", "Crowd", "Nighttime", "Performance", "Lighting"].map((t) => (
                  <span key={t} className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(245,158,11,0.1)", color: "#f59e0b" }}>
                    #{t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Comments */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <p className="text-sm font-semibold text-white">Comments ({comments.length})</p>
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={{ background: `${comment.color}25`, color: comment.color, border: `1px solid ${comment.color}40` }}
              >
                {comment.avatar}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-white">{comment.user}</span>
                  <span
                    className="text-xs px-1.5 py-0.5 rounded"
                    style={{ background: `${comment.color}15`, color: comment.color, fontSize: 10 }}
                  >
                    {comment.role}
                  </span>
                  <span className="text-xs ml-auto" style={{ color: "#6b7fa3" }}>{comment.time}</span>
                </div>
                <p className="text-xs leading-relaxed mb-1.5" style={{ color: "#c4cdd8" }}>{comment.text}</p>
                <button
                  onClick={() => toggleCommentLike(comment.id)}
                  className="flex items-center gap-1 text-xs transition-colors"
                  style={{ color: likedComments.includes(comment.id) ? "#ec4899" : "#6b7fa3" }}
                >
                  <Heart size={11} fill={likedComments.includes(comment.id) ? "currentColor" : "none"} />
                  {likedComments.includes(comment.id) ? comment.likes + 1 : comment.likes}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Comment input */}
        <div className="p-4" style={{ borderTop: "1px solid rgba(16,185,129,0.08)" }}>
          <div className="flex gap-3 items-end">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #10b981, #3b82f6)", color: "white" }}
            >
              A
            </div>
            <div className="flex-1 relative">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                rows={1}
                className="w-full px-4 py-2.5 pr-10 rounded-xl text-sm outline-none resize-none transition-all"
                style={{
                  background: "rgba(11,18,32,0.8)",
                  border: "1px solid rgba(16,185,129,0.15)",
                  color: "#e8edf5",
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(16,185,129,0.5)"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(16,185,129,0.15)"; }}
              />
              <button
                className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                style={{ background: commentText ? "rgba(16,185,129,0.2)" : "transparent", color: commentText ? "#10b981" : "#6b7fa3" }}
              >
                <Send size={13} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
