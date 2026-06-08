import { Camera, LayoutDashboard, Calendar, Image, Upload, Star, Bell, User, Settings, LogOut, ChevronRight, Droplets } from "lucide-react";

interface SidebarProps {
  currentScreen: string;
  onNavigate: (screen: string) => void;
  onLogout: () => void;
  user: Record<string, unknown>;
}

const navItems = [
  { id: "dashboard",     label: "Dashboard",    icon: LayoutDashboard, roles: ["Admin", "Photographer", "Club Member", "Viewer"] },
  { id: "events",        label: "Events",        icon: Calendar,        roles: ["Admin", "Photographer", "Club Member", "Viewer"] },
  { id: "gallery",       label: "Gallery",       icon: Image,           roles: ["Admin", "Photographer", "Club Member", "Viewer"] },
  { id: "upload",        label: "Upload Media",  icon: Upload,          roles: ["Admin", "Photographer"] },
  { id: "myphotos",      label: "My Photos",     icon: Camera,          roles: ["Admin", "Photographer", "Club Member", "Viewer"] },
  { id: "favorites",     label: "Favorites",     icon: Star,            roles: ["Admin", "Photographer", "Club Member", "Viewer"] },
  { id: "notifications", label: "Notifications", icon: Bell, badge: 5,  roles: ["Admin", "Photographer", "Club Member", "Viewer"] },
];

const bottomNav = [
  { id: "watermark", label: "Watermark", icon: Droplets, roles: ["Admin"] },
  { id: "profile",   label: "Profile",   icon: User,     roles: ["Admin", "Photographer", "Club Member", "Viewer"] },
  { id: "settings",  label: "Settings",  icon: Settings, roles: ["Admin", "Photographer", "Club Member", "Viewer"] },
];

function NavItem({ id, label, icon: Icon, badge, currentScreen, onNavigate }: {
  id: string; label: string; icon: React.ElementType; badge?: number;
  currentScreen: string; onNavigate: (s: string) => void;
}) {
  const active = currentScreen === id;
  return (
    <button
      onClick={() => onNavigate(id)}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 relative"
      style={{
        background: active ? "rgba(16,185,129,0.12)" : "transparent",
        color: active ? "#10b981" : "#6b7fa3",
        fontWeight: active ? 600 : 400,
        border: active ? "1px solid rgba(16,185,129,0.2)" : "1px solid transparent",
      }}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.background = "rgba(255,255,255,0.04)";
          e.currentTarget.style.color = "#c4cdd8";
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.color = "#6b7fa3";
        }
      }}
    >
      {active && (
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full"
          style={{ background: "#10b981" }}
        />
      )}
      <Icon size={17} />
      <span className="flex-1 text-left">{label}</span>
      {badge && (
        <span
          className="text-xs px-1.5 py-0.5 rounded-full"
          style={{ background: "rgba(16,185,129,0.2)", color: "#10b981" }}
        >
          {badge}
        </span>
      )}
      {active && <ChevronRight size={14} />}
    </button>
  );
}

export function Sidebar({ currentScreen, onNavigate, onLogout, user }: SidebarProps) {
  const role = typeof user?.role === "string" ? user.role : "Viewer";
  const visibleNav    = navItems.filter((item) => item.roles.includes(role));
  const visibleBottom = bottomNav.filter((item) => item.roles.includes(role));
  const name = typeof user?.name === "string" ? user.name : "User";
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");

  return (
    <aside
      className="fixed left-0 top-0 h-screen w-64 flex flex-col z-40"
      style={{
        background: "linear-gradient(180deg, #06091a 0%, #04070f 100%)",
        borderRight: "1px solid rgba(16,185,129,0.1)",
      }}
    >
      {/* Logo */}
      <div className="p-5 pb-4 flex items-center gap-3" style={{ borderBottom: "1px solid rgba(16,185,129,0.08)" }}>
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #10b981, #059669)", boxShadow: "0 4px 12px rgba(16,185,129,0.3)" }}
        >
          <Camera size={18} color="white" />
        </div>
        <div>
          <p className="text-base font-bold text-white leading-none" style={{ fontFamily: "'Outfit', sans-serif" }}>EventHub</p>
          <p className="text-xs" style={{ color: "#6b7fa3" }}>Media Platform</p>
        </div>
      </div>

      {/* Main nav */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {visibleNav.map((item) => (
          <NavItem key={item.id} {...item} currentScreen={currentScreen} onNavigate={onNavigate} />
        ))}

        {/* Divider */}
        <div className="my-3" style={{ borderTop: "1px solid rgba(16,185,129,0.06)" }} />

        {/* Bottom nav items */}
        {visibleBottom.map((item) => (
          <NavItem key={item.id} {...item} currentScreen={currentScreen} onNavigate={onNavigate} />
        ))}
      </nav>

      {/* User profile bottom */}
      <div className="p-3" style={{ borderTop: "1px solid rgba(16,185,129,0.08)" }}>
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 hover:bg-white/5">
          {/* Clicking the name/avatar navigates to profile */}
          <div
            className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
            onClick={() => onNavigate("profile")}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #10b981, #3b82f6)", color: "white" }}
            >
              {initials || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{name}</p>
              {role && (
                <p className="text-xs truncate" style={{ color: "#6b7fa3" }}>{role}</p>
              )}
            </div>
          </div>

          {/* Logout icon — wired to onLogout */}
          <button
            onClick={onLogout}
            className="flex-shrink-0 transition-colors hover:text-red-400 p-1 rounded-lg hover:bg-white/5"
            style={{ color: "#6b7fa3" }}
            title="Sign out"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  );
}