import { useState, useEffect, useCallback } from "react";
import { LoginPage } from "./components/LoginPage";
import { Sidebar } from "./components/Sidebar";
import { Navbar } from "./components/Navbar";
import { Dashboard } from "./components/Dashboard";
import { EventsPage } from "./components/EventsPage";
import { CreateEvent } from "./components/CreateEvent";
import { EventDetails } from "./components/EventDetails";
import { MediaUpload } from "./components/MediaUpload";
import { Gallery } from "./components/Gallery";
import type { BackendMedia } from "./components/Gallery";
import { PhotoDetails } from "./components/PhotoDetails";
import { MyPhotos } from "./components/MyPhotos";
import { FavoritesPage } from "./components/FavoritesPage";
import { Profile } from "./components/Profile";
import { SettingsPage } from "./components/SettingsPage";
import { WatermarkPage } from "./components/WatermarkPage";

/* MARKER-MAKE-KIT-INVOKED */

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000" || "http://localhost:5173"; // Fallback for code references that haven't been updated yet

type Screen =
  | "dashboard"
  | "events"
  | "createevent"
  | "eventdetails"
  | "gallery"
  | "upload"
  | "myphotos"
  | "favorites"
  | "notifications"
  | "profile"
  | "settings"
  | "photodetails"
  | "watermark";

const screenTitles: Record<Screen, string> = {
  dashboard: "Dashboard",
  events: "Events",
  createevent: "Create Event",
  eventdetails: "Event Details",
  gallery: "Media Gallery",
  upload: "Upload Media",
  myphotos: "My Photos",
  favorites: "Favorites",
  notifications: "Notifications",
  profile: "My Profile",
  settings: "Settings",
  photodetails: "Photo",
  watermark: "Watermark Settings",
};

// ─── Session helpers ───────────────────────────────────────────────────────────

function restoreSession(): { token: string; user: Record<string, unknown> } | null {
  for (const storage of [localStorage, sessionStorage]) {
    try {
      const token = storage.getItem("token");
      const userRaw = storage.getItem("user");
      if (token && userRaw) {
        return { token, user: JSON.parse(userRaw) };
      }
    } catch {
      storage.removeItem("token");
      storage.removeItem("user");
    }
  }
  return null;
}

function clearSession() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("user");
}

// ──────────────────────────────────────────────────────────────────────────────

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [authToken, setAuthToken] = useState<string>("");
  const [currentUser, setCurrentUser] = useState<Record<string, unknown>>({});
  const [currentScreen, setCurrentScreen] = useState<Screen>("dashboard");
  const [darkMode, setDarkMode] = useState(true);
  const [history, setHistory] = useState<Screen[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<BackendMedia | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string>("");

  // ── Unread notification count ──────────────────────────────────────────────
  const [unreadCount, setUnreadCount] = useState(0);

  // Restore session on mount
  useEffect(() => {
    const session = restoreSession();
    if (session) {
      setAuthToken(session.token);
      setCurrentUser(session.user);
      setLoggedIn(true);
    }
  }, []);

  // Fetch unread count — called on mount, on screen change, and on a 30s interval.
  // useCallback so the interval cleanup is stable across renders.
  const fetchUnreadCount = useCallback(async (token: string) => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/api/notifications/unread-count`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data.success) setUnreadCount(data.count);
    } catch {
      // Non-fatal — badge stays at last known value
    }
  }, []);

  // Poll every 30 seconds while logged in
  useEffect(() => {
    if (!loggedIn || !authToken) return;

    fetchUnreadCount(authToken);

    const interval = setInterval(() => fetchUnreadCount(authToken), 30_000);
    return () => clearInterval(interval);
  }, [loggedIn, authToken, fetchUnreadCount]);

  // Refresh count when user navigates away from the notifications screen
  // (they may have marked items read)
  useEffect(() => {
    if (loggedIn && authToken) {
      fetchUnreadCount(authToken);
    }
  }, [currentScreen, loggedIn, authToken, fetchUnreadCount]);

  const handleLogin = (_role: string, token: string, user: Record<string, unknown>) => {
    setAuthToken(token);
    setCurrentUser(user);
    setLoggedIn(true);
  };

  const handleLogout = () => {
    clearSession();
    setAuthToken("");
    setCurrentUser({});
    setLoggedIn(false);
    setCurrentScreen("dashboard");
    setHistory([]);
    setUnreadCount(0);
  };

  const navigate = (screen: string, media?: BackendMedia, eventId?: string) => {
    if (media) setSelectedMedia(media);
    if (eventId) setSelectedEventId(eventId);
    setHistory((h) => [...h, currentScreen]);
    setCurrentScreen(screen as Screen);
  };

  const goBack = () => {
    const prev = history[history.length - 1];
    if (prev) {
      setHistory((h) => h.slice(0, -1));
      setCurrentScreen(prev);
    } else {
      setCurrentScreen("dashboard");
    }
  };

  if (!loggedIn) return <LoginPage onLogin={handleLogin} />;

  const isFullWidth = currentScreen === "photodetails";

  const renderScreen = () => {
    switch (currentScreen) {
      case "dashboard":
        return <Dashboard onNavigate={navigate} user={currentUser as { name?: string; email?: string; role?: string }} />;
      case "events":
        return <EventsPage onNavigate={navigate} user={currentUser as { name?: string; email?: string; role?: string }} />;
      case "createevent":
        return <CreateEvent onBack={goBack} onCreated={(eventId) => navigate("eventdetails", undefined, eventId)} user={currentUser as { name?: string; email?: string; role?: string }} />;
      case "eventdetails":
        return <EventDetails eventId={selectedEventId} onBack={goBack} onNavigate={navigate} user={currentUser as { name?: string; email?: string; role?: string }} />;
      case "gallery":
        return <Gallery onNavigate={navigate} />;
      case "upload":
        return <MediaUpload />;
      case "myphotos":
        return <MyPhotos />;
      case "favorites":
        return <FavoritesPage onNavigate={navigate} />;
      case "photodetails":
        return selectedMedia ? (
          <PhotoDetails
            media={selectedMedia}
            onBack={goBack}
            onDeleted={goBack}
          />
        ) : null;
      case "profile":
      return <Profile onNavigate={navigate} user={currentUser as { name?: string; email?: string; role?: string }} authToken={authToken} />;
      case "settings":
  return <SettingsPage onLogout={handleLogout} />;
      case "watermark":
        return <WatermarkPage />;
      case "notifications":
        return (
          <NotificationsScreen
            authToken={authToken}
            onAllRead={() => setUnreadCount(0)}
          />
        );
      default:
        return <Dashboard onNavigate={navigate} user={currentUser as { name?: string; email?: string; role?: string }} />;
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: "#04070f" }}>
      <Sidebar
        currentScreen={currentScreen}
        onNavigate={navigate}
        onLogout={handleLogout}
        user={currentUser}
        unreadCount={unreadCount}
      />
      <div className="flex-1 ml-64">
        {!isFullWidth && (
  <Navbar
  title={screenTitles[currentScreen] || "EventHub"}
  user={currentUser}
  onLogout={handleLogout}
  onNavigate={navigate}
  authToken={authToken}
  unreadCount={unreadCount}
/>
        )}
        <main className="min-h-screen" style={{ paddingTop: isFullWidth ? 0 : 64 }}>
          {renderScreen()}
        </main>
      </div>
    </div>
  );
}

// ─── Notifications screen ──────────────────────────────────────────────────────

interface ApiNotification {
  _id: string;
  actorName: string;
  type: "like" | "comment";
  mediaTitle: string;
  mediaThumb: string;
  read: boolean;
  createdAt: string;
}

// Map backend notification to the shape NotifItem already expects
interface DisplayNotification {
  id: string;
  type: string;
  user: string;
  action: string;
  time: string;
  avatar: string;
  color: string;
  read: boolean;
}

const typeColor: Record<string, string> = {
  like:    "#ec4899",
  comment: "#3b82f6",
};

const typeAction: Record<string, string> = {
  like:    "liked your photo",
  comment: "commented on your photo",
};

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60)   return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function mapNotification(n: ApiNotification): DisplayNotification {
  const title = n.mediaTitle ? `"${n.mediaTitle}"` : "your photo";
  return {
    id:     n._id,
    type:   n.type,
    user:   n.actorName,
    action: `${typeAction[n.type] ?? "interacted with"} ${title}`,
    time:   timeAgo(n.createdAt),
    avatar: n.actorName?.[0]?.toUpperCase() ?? "?",
    color:  typeColor[n.type] ?? "#10b981",
    read:   n.read,
  };
}

function NotificationsScreen({
  authToken,
  onAllRead,
}: {
  authToken: string;
  onAllRead: () => void;
}) {
  const [items, setItems] = useState<DisplayNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const headers = { Authorization: `Bearer ${authToken}` };
  const apiBase = API_BASE;
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${apiBase}/api/notifications`, { headers });
        const data = await res.json();
        if (data.success) {
          setItems((data.data as ApiNotification[]).map(mapNotification));
        }
      } catch {
        // leave empty — UI handles zero state gracefully
      } finally {
        setLoading(false);
      }
    };
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const unread = items.filter((n) => !n.read).length;

  const markAllRead = async () => {
    try {
      const res = await fetch(`${apiBase}/api/notifications/read-all`, {
        method: "PATCH",
        headers,
      });
      const data = await res.json();
      if (data.success) {
        setItems((prev) => prev.map((n) => ({ ...n, read: true })));
        onAllRead();
      }
    } catch {
      // silent — user can retry
    }
  };

  const markOneRead = async (id: string) => {
    // Optimistic update
    setItems((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    try {
      await fetch(`${apiBase}/api/notifications/${id}/read`, {
        method: "PATCH",
        headers,
      });
    } catch {
      // revert optimistic update on failure
      setItems((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: false } : n))
      );
    }
  };

  const typeIcon: Record<string, string> = {
    like: "❤️",
    comment: "💬",
  };

  if (loading) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="flex items-center justify-center py-16">
          <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "#10b981", borderTopColor: "transparent" }} />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>Notifications</h2>
          <p className="text-sm" style={{ color: "#6b7fa3" }}>
            {unread > 0 ? `${unread} unread notification${unread > 1 ? "s" : ""}` : "All caught up!"}
          </p>
        </div>
        {unread > 0 && (
          <button
            onClick={markAllRead}
            className="text-xs px-3 py-1.5 rounded-xl transition-all hover:scale-105"
            style={{ border: "1px solid rgba(16,185,129,0.2)", color: "#10b981" }}
          >
            Mark all read
          </button>
        )}
      </div>

      {items.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl" style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.12)" }}>
            🔔
          </div>
          <p className="text-sm" style={{ color: "#6b7fa3" }}>No notifications yet</p>
        </div>
      )}

      {unread > 0 && (
        <div>
          <p className="text-xs font-medium mb-2 uppercase tracking-wider" style={{ color: "#6b7fa3" }}>New</p>
          <div className="space-y-2">
            {items.filter((n) => !n.read).map((n) => (
              <NotifItem key={n.id} n={n} typeIcon={typeIcon} onRead={markOneRead} />
            ))}
          </div>
        </div>
      )}

      {items.filter((n) => n.read).length > 0 && (
        <div>
          <p className="text-xs font-medium mb-2 uppercase tracking-wider" style={{ color: "#6b7fa3" }}>Earlier</p>
          <div className="space-y-2">
            {items.filter((n) => n.read).map((n) => (
              <NotifItem key={n.id} n={n} typeIcon={typeIcon} onRead={markOneRead} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function NotifItem({
  n,
  typeIcon,
  onRead,
}: {
  n: DisplayNotification;
  typeIcon: Record<string, string>;
  onRead: (id: string) => void;
}) {
  return (
    <div
      className="flex items-start gap-4 p-4 rounded-xl transition-all hover:scale-[1.005] cursor-pointer"
      style={{
        background: n.read ? "rgba(11,18,32,0.6)" : "rgba(11,18,32,0.9)",
        border: `1px solid ${n.read ? "rgba(16,185,129,0.06)" : "rgba(16,185,129,0.2)"}`,
      }}
      onClick={() => !n.read && onRead(n.id)}
    >
      <div className="relative flex-shrink-0">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm"
          style={{ background: `${n.color}20`, color: n.color, border: `1px solid ${n.color}40` }}
        >
          {n.avatar}
        </div>
        <div
          className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full flex items-center justify-center text-xs"
          style={{ background: "#06091a", border: "1px solid rgba(16,185,129,0.1)", fontSize: 10 }}
        >
          {typeIcon[n.type] ?? "🔔"}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm leading-snug" style={{ color: n.read ? "#c4cdd8" : "white" }}>
          <span className="font-semibold">{n.user}</span>{" "}{n.action}
        </p>
        <p className="text-xs mt-1" style={{ color: "#6b7fa3" }}>{n.time}</p>
      </div>
      {!n.read && (
        <div
          className="w-2 h-2 rounded-full flex-shrink-0 mt-2"
          style={{ background: "#10b981", boxShadow: "0 0 6px rgba(16,185,129,0.5)" }}
        />
      )}
    </div>
  );
}