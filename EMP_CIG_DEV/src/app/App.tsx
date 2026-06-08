import { useState, useEffect } from "react";
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
  // Check localStorage first (Remember Me), then sessionStorage (tab-only session)
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

  // Restore session on mount (handles page refresh)
  useEffect(() => {
    const session = restoreSession();
    if (session) {
      setAuthToken(session.token);
      setCurrentUser(session.user);
      setLoggedIn(true);
    }
  }, []);

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
  };

  const navigate = (screen: string, media?: BackendMedia) => {
  if (media) setSelectedMedia(media);

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
        return <CreateEvent onBack={goBack} onCreated={() => navigate("eventdetails")} user={currentUser as { name?: string; email?: string; role?: string }} />;
      case "eventdetails":
        return <EventDetails onBack={goBack} onNavigate={navigate} />;
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
        return <Profile onNavigate={navigate} user={currentUser as { name?: string; email?: string; role?: string }} />;
      case "settings":
        return <SettingsPage />;
      case "watermark":
        return <WatermarkPage />;
      case "notifications":
        return <NotificationsScreen />;
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
      />
      <div className="flex-1 ml-64">
        {!isFullWidth && (
          <Navbar
            title={screenTitles[currentScreen] || "EventHub"}
            darkMode={darkMode}
            onToggleDark={() => setDarkMode(!darkMode)}
            user={currentUser}
            onLogout={handleLogout}
          />
        )}
        <main className="min-h-screen" style={{ paddingTop: isFullWidth ? 0 : 64 }}>
          {renderScreen()}
        </main>
      </div>
    </div>
  );
}

function NotificationsScreen() {
  const notifications = [
    { id: 1, type: "like", user: "Priya Sharma", action: "liked your photo from Tech Fest 2025", time: "2m ago", avatar: "P", color: "#ec4899", read: false },
    { id: 2, type: "comment", user: "Rahul Gupta", action: "commented: 'Great shot! The lighting is perfect'", time: "15m ago", avatar: "R", color: "#3b82f6", read: false },
    { id: 3, type: "event", user: "EventHub", action: "New event 'Freshers Welcome 2025' has been added", time: "1h ago", avatar: "E", color: "#10b981", read: false },
    { id: 4, type: "upload", user: "Kartik Mehrotra", action: "uploaded 142 new photos to Tech Fest 2025", time: "3h ago", avatar: "K", color: "#8b5cf6", read: true },
    { id: 5, type: "tag", user: "Ananya Iyer", action: "tagged you in a photo from Cultural Night", time: "5h ago", avatar: "A", color: "#f59e0b", read: true },
    { id: 6, type: "follow", user: "Dev Patel", action: "started following you", time: "1d ago", avatar: "D", color: "#10b981", read: true },
    { id: 7, type: "upload", user: "Riya Nair", action: "uploaded new photos to Photography Contest", time: "2d ago", avatar: "R", color: "#06b6d4", read: true },
    { id: 8, type: "event", user: "Sports Committee", action: "Inter-House Cricket League results are live!", time: "3d ago", avatar: "S", color: "#f59e0b", read: true },
  ];

  const [items, setItems] = useState(notifications);
  const unread = items.filter((n) => !n.read).length;

  const markAllRead = () => setItems((i) => i.map((n) => ({ ...n, read: true })));

  const typeIcon: Record<string, string> = {
    like: "❤️", comment: "💬", event: "📅", upload: "📸", tag: "🏷️", follow: "👤"
  };

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

      {unread > 0 && (
        <div>
          <p className="text-xs font-medium mb-2 uppercase tracking-wider" style={{ color: "#6b7fa3" }}>New</p>
          <div className="space-y-2">
            {items.filter((n) => !n.read).map((n) => (
              <NotifItem key={n.id} n={n} typeIcon={typeIcon} />
            ))}
          </div>
        </div>
      )}

      {items.filter((n) => n.read).length > 0 && (
        <div>
          <p className="text-xs font-medium mb-2 uppercase tracking-wider" style={{ color: "#6b7fa3" }}>Earlier</p>
          <div className="space-y-2">
            {items.filter((n) => n.read).map((n) => (
              <NotifItem key={n.id} n={n} typeIcon={typeIcon} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function NotifItem({ n, typeIcon }: { n: { id: number; user: string; action: string; time: string; avatar: string; color: string; read: boolean; type: string }; typeIcon: Record<string, string> }) {
  return (
    <div
      className="flex items-start gap-4 p-4 rounded-xl transition-all hover:scale-[1.005] cursor-pointer"
      style={{
        background: n.read ? "rgba(11,18,32,0.6)" : "rgba(11,18,32,0.9)",
        border: `1px solid ${n.read ? "rgba(16,185,129,0.06)" : "rgba(16,185,129,0.2)"}`,
      }}
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
          {typeIcon[n.type]}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm leading-snug" style={{ color: n.read ? "#c4cdd8" : "white" }}>
          <span className="font-semibold">{n.user}</span>{" "}{n.action}
        </p>
        <p className="text-xs mt-1" style={{ color: "#6b7fa3" }}>{n.time}</p>
      </div>
      {!n.read && <div className="w-2 h-2 rounded-full flex-shrink-0 mt-2" style={{ background: "#10b981", boxShadow: "0 0 6px rgba(16,185,129,0.5)" }} />}
    </div>
  );
}