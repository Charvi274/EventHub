import type { BackendMedia } from "./PhotoDetails";
import { useState, useEffect } from "react";
import { Edit3, Award, Image, Star, Calendar, Heart, Upload, Camera, ImageOff, Loader2, Play } from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────

const API_BASE = "http://localhost:5000";

// ─── Role badge colour map ─────────────────────────────────────────────────────
const roleBadge: Record<string, { bg: string; color: string; border: string }> = {
  Admin:         { bg: "rgba(245,158,11,0.12)",  color: "#f59e0b", border: "rgba(245,158,11,0.3)"  },
  Photographer:  { bg: "rgba(139,92,246,0.10)",  color: "#a78bfa", border: "rgba(139,92,246,0.2)"  },
  "Club Member": { bg: "rgba(59,130,246,0.10)",  color: "#60a5fa", border: "rgba(59,130,246,0.2)"  },
  Viewer:        { bg: "rgba(16,185,129,0.10)",  color: "#10b981", border: "rgba(16,185,129,0.2)"  },
};
const defaultBadge = { bg: "rgba(107,127,163,0.12)", color: "#6b7fa3", border: "rgba(107,127,163,0.2)" };

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function getToken(authToken?: string): string {
  return authToken || localStorage.getItem("token") || sessionStorage.getItem("token") || "";
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface SafeUser {
  _id?: string;
  name?: string;
  email?: string;
  role?: string;
  avatar?: string;
  bio?: string;
  isActive?: boolean;
  lastLogin?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

interface MediaItem {
  _id: string;
  title: string;
  fileUrl: string;
  fileType: "image" | "video";
  likes: { count: number };
  createdAt: string;
}

// getSavedMedia returns Media documents directly (not a separate favorites collection)
type FavoriteItem = MediaItem;

interface EventItem {
  _id: string;
  title: string;
  category: string;
  coverImage?: string;
  startDate: string;
  organizer: string;
  status?: string;
}

interface ProfilePageProps {
  onNavigate?: (screen: string, media?: BackendMedia, eventId?: string) => void;
  user?: { name?: string; email?: string; role?: string };
  authToken?: string;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function EmptyState({
  icon: Icon, message, action, onAction,
}: {
  icon: React.ElementType; message: string; action?: string; onAction?: () => void;
}) {
  return (
    <div
      className="flex flex-col items-center justify-center py-16 rounded-2xl"
      style={{ background: "rgba(11,18,32,0.4)", border: "1px dashed rgba(16,185,129,0.15)" }}
    >
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3" style={{ background: "rgba(16,185,129,0.06)" }}>
        <Icon size={22} color="#6b7fa3" />
      </div>
      <p className="text-sm" style={{ color: "#6b7fa3" }}>{message}</p>
      {action && onAction && (
        <button
          onClick={onAction}
          className="mt-3 text-xs px-3 py-1.5 rounded-xl transition-all hover:scale-105"
          style={{ border: "1px solid rgba(16,185,129,0.2)", color: "#10b981" }}
        >
          {action}
        </button>
      )}
    </div>
  );
}

function StatCard({ label, icon: Icon, color, value }: { label: string; icon: React.ElementType; color: string; value: number | string }) {
  return (
    <div className="text-center p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
      <div className="w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-2" style={{ background: `${color}15` }}>
        <Icon size={15} color={color} />
      </div>
      <p className="text-base font-bold" style={{ color: value === "—" ? "#6b7fa3" : "#e2e8f0", fontFamily: "'Outfit', sans-serif" }}>
        {value}
      </p>
      <p className="text-xs" style={{ color: "#6b7fa3" }}>{label}</p>
    </div>
  );
}

// Shared grid thumbnail used by uploads + favorites tabs
function MediaThumb({ url, type, title }: { url: string; type: "image" | "video"; title: string }) {
  return (
    <div className="relative group rounded-xl overflow-hidden aspect-square cursor-pointer" style={{ background: "#0b1220" }}>
      <img src={url} alt={title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
      {type === "video" && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "rgba(0,0,0,0.6)" }}>
            <Play size={14} color="white" fill="white" />
          </div>
        </div>
      )}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200" />
    </div>
  );
}

function TabLoader() {
  return (
    <div className="flex items-center justify-center py-16">
      <Loader2 size={22} className="animate-spin" style={{ color: "#10b981" }} />
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function Profile({ onNavigate, user: seedUser, authToken }: ProfilePageProps) {
  const [activeTab, setActiveTab] = useState<"uploads" | "favorites" | "events">("uploads");

  // ── User ─────────────────────────────────────────────────────────────────────
  const [user, setUser] = useState<SafeUser>({ name: seedUser?.name, email: seedUser?.email, role: seedUser?.role });
  const [loadingUser, setLoadingUser] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  // ── Stats ─────────────────────────────────────────────────────────────────────
  const [uploadCount,   setUploadCount]   = useState<number | "—">("—");
  const [favCount,      setFavCount]      = useState<number | "—">("—");
  const [likesReceived, setLikesReceived] = useState<number | "—">("—");

  // ── Tab data ──────────────────────────────────────────────────────────────────
  const [uploads,      setUploads]      = useState<MediaItem[]>([]);
  const [uploadsLoading, setUploadsLoading] = useState(false);
  const [uploadsFetched, setUploadsFetched] = useState(false);

  const [favorites,       setFavorites]       = useState<FavoriteItem[]>([]);
  const [favLoading,      setFavLoading]       = useState(false);
  const [favFetched,      setFavFetched]       = useState(false);

  const [events,         setEvents]         = useState<EventItem[]>([]);
  const [eventsLoading,  setEventsLoading]  = useState(false);
  const [eventsFetched,  setEventsFetched]  = useState(false);
  const [eventsCount,    setEventsCount]    = useState<number | "—">("—");

  const token = getToken(authToken);
  const headers = { Authorization: `Bearer ${token}` };

  // ── Fetch user + stats on mount ───────────────────────────────────────────────
  useEffect(() => {
    if (!token) { setLoadingUser(false); return; }
    let cancelled = false;

    const fetchAll = async () => {
      // 1. User profile
      try {
        const res = await fetch(`${API_BASE}/api/auth/me`, { headers });
        if (!res.ok) throw new Error();
        const data = await res.json();
        if (!cancelled && data.success && data.user) setUser(data.user as SafeUser);
      } catch {
        if (!cancelled) setFetchError(true);
      } finally {
        if (!cancelled) setLoadingUser(false);
      }

      // 2. My uploads — count + data (reused for stat card)
      try {
        const res = await fetch(`${API_BASE}/api/media/my-uploads?limit=100`, { headers });
        if (res.ok) {
          const data = await res.json();
          const items: MediaItem[] = Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : [];
          if (!cancelled) {
            setUploads(items);
            setUploadCount(items.length);
            setUploadsFetched(true);
            // Likes received = sum of all like counts across user's uploads
            const total = items.reduce((sum, m) => sum + (m.likes?.count ?? 0), 0);
            setLikesReceived(total);
          }
        }
      } catch { /* stat stays "—" */ }

      // 3. Favorites count
      try {
        const res = await fetch(`${API_BASE}/api/media/saved`, { headers });
        if (res.ok) {
          const data = await res.json();
          const items: FavoriteItem[] = Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : [];
          if (!cancelled) {
            setFavorites(items);
            setFavCount(items.length);
            setFavFetched(true);
          }
        }
      } catch { /* stat stays "—" */ }

      // 4. Events count
      try {
        const res = await fetch(`${API_BASE}/api/events?limit=100`, { headers });
        if (res.ok) {
          const data = await res.json();
          const items: EventItem[] = Array.isArray(data.data) ? data.data : [];
          if (!cancelled) {
            setEvents(items);
            setEventsCount(items.length);
            setEventsFetched(true);
          }
        }
      } catch { /* stat stays "—" */ }
    };

    fetchAll();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // ── Lazy-fetch tabs when first activated ──────────────────────────────────────
  useEffect(() => {
    if (activeTab === "uploads" && !uploadsFetched && !uploadsLoading) {
      setUploadsLoading(true);
      fetch(`${API_BASE}/api/media/my-uploads?limit=100`, { headers })
        .then(r => r.ok ? r.json() : Promise.reject())
        .then(data => {
          const items: MediaItem[] = Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : [];
          setUploads(items);
          setUploadCount(items.length);
          setUploadsFetched(true);
          setLikesReceived(items.reduce((s, m) => s + (m.likes?.count ?? 0), 0));
        })
        .catch(() => {})
        .finally(() => setUploadsLoading(false));
    }

    if (activeTab === "favorites" && !favFetched && !favLoading) {
      setFavLoading(true);
      fetch(`${API_BASE}/api/media/saved`, { headers })
        .then(r => r.ok ? r.json() : Promise.reject())
        .then(data => {
          const items: FavoriteItem[] = Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : [];
          setFavorites(items);
          setFavCount(items.length);
          setFavFetched(true);
        })
        .catch(() => {})
        .finally(() => setFavLoading(false));
    }

    if (activeTab === "events" && !eventsFetched && !eventsLoading) {
      setEventsLoading(true);
      fetch(`${API_BASE}/api/events?limit=100`, { headers })
        .then(r => r.ok ? r.json() : Promise.reject())
        .then(data => {
          const items: EventItem[] = Array.isArray(data.data) ? data.data : [];
          setEvents(items);
          setEventsFetched(true);
        })
        .catch(() => {})
        .finally(() => setEventsLoading(false));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // ── Derived display values ─────────────────────────────────────────────────────
  const displayName  = user?.name?.trim()  || "Unknown User";
  const displayEmail = user?.email?.trim() || "—";
  const displayRole  = user?.role?.trim()  || "Viewer";
  const displayBio   = user?.bio?.trim()   || "";
  const memberSince  = formatDate(user?.createdAt);
  const lastLogin    = formatDate(user?.lastLogin);
  const initials     = getInitials(displayName);
  const badge        = roleBadge[displayRole] ?? defaultBadge;

  const stats = [
    { label: "Uploads",        icon: Image,    color: "#10b981", value: uploadCount   },
    { label: "Events",         icon: Calendar, color: "#3b82f6", value: eventsCount       },
    { label: "Favorites",      icon: Star,     color: "#f59e0b", value: favCount       },
    { label: "Likes Received", icon: Heart,    color: "#ec4899", value: likesReceived  },
  ];

  const canUpload = ["Admin", "Photographer"].includes(displayRole);

  // ── Render ─────────────────────────────────────────────────────────────────────
  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Profile header card */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(11,18,32,0.8)", border: "1px solid rgba(16,185,129,0.12)" }}>
        {/* Cover */}
        <div className="h-40 relative" style={{ background: "linear-gradient(135deg, #06091a 0%, #0a1a12 50%, #041510 100%)" }}>
          <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(ellipse 80% 60% at 30% 50%, rgba(16,185,129,0.15) 0%, transparent 70%)" }} />
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: `linear-gradient(rgba(16,185,129,1) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,1) 1px, transparent 1px)`, backgroundSize: "30px 30px" }} />
        </div>

        {/* Avatar + info */}
        <div className="px-6 pb-6">
          <div className="flex items-end justify-between -mt-10 mb-5">
            <div className="relative">
              {user?.avatar ? (
                <img src={user.avatar} alt={displayName} className="w-20 h-20 rounded-2xl object-cover" style={{ border: "3px solid #06091a" }} onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
              ) : (
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-black" style={{ background: "linear-gradient(135deg, #10b981, #3b82f6)", color: "white", border: "3px solid #06091a", fontFamily: "'Outfit', sans-serif" }}>
                  {loadingUser ? <Loader2 size={22} className="animate-spin opacity-70" /> : initials}
                </div>
              )}
            </div>

            <div className="flex gap-2 mb-1">
              {canUpload && (
              <button
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-white transition-all hover:scale-105"
                style={{ background: "linear-gradient(135deg, #10b981, #059669)", boxShadow: "0 4px 15px rgba(16,185,129,0.3)" }}
                onClick={() => onNavigate?.("upload")}
              >
                <Upload size={14} /> Upload Media
              </button>
              )}
              <button
                onClick={() => onNavigate?.("settings")}
                className="px-4 py-2 rounded-xl text-sm transition-all hover:bg-white/5 flex items-center gap-1.5"
                style={{ border: "1px solid rgba(16,185,129,0.2)", color: "#6b7fa3" }}
              >
                <Edit3 size={14} /> Edit Profile
              </button>
            </div>
          </div>

          {loadingUser ? (
            <div className="space-y-2 mb-4">
              <div className="h-5 w-40 rounded-lg animate-pulse" style={{ background: "rgba(255,255,255,0.07)" }} />
              <div className="h-4 w-56 rounded-lg animate-pulse" style={{ background: "rgba(255,255,255,0.04)" }} />
            </div>
          ) : (
            <div>
              <h2 className="text-xl font-bold text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>{displayName}</h2>
              <p className="text-sm mb-3" style={{ color: "#6b7fa3" }}>{displayEmail}</p>
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: badge.bg, color: badge.color, border: `1px solid ${badge.border}` }}>
                  <Award size={11} /> {displayRole}
                </span>
                {memberSince !== "—" && (
                  <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs" style={{ background: "rgba(107,127,163,0.08)", color: "#6b7fa3", border: "1px solid rgba(107,127,163,0.15)" }}>
                    <Calendar size={10} /> Member since {memberSince}
                  </span>
                )}
                {lastLogin !== "—" && (
                  <span className="px-2.5 py-1 rounded-full text-xs" style={{ background: "rgba(107,127,163,0.06)", color: "#6b7fa3", border: "1px solid rgba(107,127,163,0.1)" }}>
                    Last active {lastLogin}
                  </span>
                )}
              </div>
              {displayBio && <p className="text-sm mt-2 leading-relaxed" style={{ color: "#94a3b8" }}>{displayBio}</p>}
              {fetchError && <p className="text-xs mt-1" style={{ color: "rgba(245,158,11,0.7)" }}>Could not refresh profile data.</p>}
            </div>
          )}

          {/* Stats row */}
          <div className="grid grid-cols-4 gap-3 mt-5">
            {stats.map((s) => <StatCard key={s.label} {...s} />)}
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
                color:      activeTab === tab ? "#10b981" : "#6b7fa3",
                border:     activeTab === tab ? "1px solid rgba(16,185,129,0.3)" : "1px solid transparent",
                fontWeight: activeTab === tab ? 600 : 400,
              }}
            >
              {tab === "uploads" ? "My Uploads" : tab === "favorites" ? "Favorites" : "Events"}
            </button>
          ))}
        </div>

        {/* ── Uploads tab ───────────────────────────────────────────────────── */}
        {activeTab === "uploads" && (
          uploadsLoading ? <TabLoader /> :
          uploads.length === 0 ? (
            <EmptyState icon={ImageOff} message="No uploads yet" action={canUpload ? "Upload your first photo" : undefined} onAction={canUpload ? () => onNavigate?.("upload") : undefined} />
          ) : (
            <div className="columns-2 lg:columns-3 xl:columns-4 gap-3 space-y-3">
              {uploads.map((item) => (
                <div key={item._id} className="break-inside-avoid">
                  <MediaThumb url={item.fileUrl} type={item.fileType} title={item.title} />
                </div>
              ))}
            </div>
          )
        )}

        {/* ── Favorites tab ─────────────────────────────────────────────────── */}
        {activeTab === "favorites" && (
          favLoading ? <TabLoader /> :
          favorites.length === 0 ? (
            <EmptyState icon={Star} message="No favorites yet" action="Browse the gallery" onAction={() => onNavigate?.("gallery")} />
          ) : (
            <div className="columns-2 lg:columns-3 xl:columns-4 gap-3 space-y-3">
              {favorites.map((fav) => (
                <div key={fav._id} className="break-inside-avoid">
                  <MediaThumb url={fav.fileUrl} type={fav.fileType} title={fav.title} />
                </div>
              ))}
            </div>
          )
        )}

        {/* ── Events tab ────────────────────────────────────────────────────── */}
        {activeTab === "events" && (
          eventsLoading ? <TabLoader /> :
          events.length === 0 ? (
            <EmptyState icon={Calendar} message="No events yet" action="Browse events" onAction={() => onNavigate?.("events")} />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {events.map((ev) => {
                const dateStr = ev.startDate
                  ? new Date(ev.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                  : "—";
                return (
                  <div
                    key={ev._id}
                    className="rounded-2xl overflow-hidden cursor-pointer group transition-all hover:scale-[1.01]"
                    style={{ background: "rgba(11,18,32,0.8)", border: "1px solid rgba(16,185,129,0.1)" }}
                    onClick={() => onNavigate?.("eventdetails", undefined, ev._id)}
                  >
                    <div className="relative h-36 overflow-hidden">
                      <img
                        src={ev.coverImage || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=500&h=280&fit=crop&auto=format"}
                        alt={ev.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 40%, rgba(11,18,32,0.85) 100%)" }} />
                      <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: "rgba(59,130,246,0.25)", color: "#93c5fd", border: "1px solid rgba(59,130,246,0.4)" }}>
                        {ev.category}
                      </span>
                    </div>
                    <div className="p-4">
                      <h3 className="text-sm font-semibold text-white mb-1 group-hover:text-emerald-400 transition-colors line-clamp-1">{ev.title}</h3>
                      <p className="text-xs" style={{ color: "#6b7fa3" }}>{ev.organizer} · {dateStr}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}
      </div>
    </div>
  );
}