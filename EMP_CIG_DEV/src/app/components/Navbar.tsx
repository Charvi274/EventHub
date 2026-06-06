import { Search, Bell, Sun, Moon, ChevronDown } from "lucide-react";

interface NavbarProps {
  title: string;
  darkMode: boolean;
  onToggleDark: () => void;
}

export function Navbar({ title, darkMode, onToggleDark }: NavbarProps) {
  return (
    <header
      className="fixed top-0 right-0 left-64 h-16 flex items-center justify-between px-6 z-30"
      style={{
        background: "rgba(4,7,15,0.85)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(16,185,129,0.1)",
      }}
    >
      <div>
        <h1 className="text-lg font-semibold text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>{title}</h1>
      </div>

      <div className="flex items-center gap-3">
        {/* Search */}
        <div
          className="relative hidden md:flex items-center"
          style={{ width: 280 }}
        >
          <Search size={15} className="absolute left-3" style={{ color: "#6b7fa3" }} />
          <input
            placeholder="Search events, photos..."
            className="w-full pl-9 pr-4 py-2 rounded-xl text-sm outline-none transition-all"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(16,185,129,0.12)",
              color: "#e8edf5",
            }}
            onFocus={(e) => { e.currentTarget.style.border = "1px solid rgba(16,185,129,0.4)"; }}
            onBlur={(e) => { e.currentTarget.style.border = "1px solid rgba(16,185,129,0.12)"; }}
          />
        </div>

        {/* Notifications */}
        <button
          className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:bg-white/5"
          style={{ border: "1px solid rgba(16,185,129,0.12)" }}
        >
          <Bell size={17} style={{ color: "#c4cdd8" }} />
          <span
            className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
            style={{ background: "#10b981", boxShadow: "0 0 6px rgba(16,185,129,0.6)" }}
          />
        </button>

        {/* Theme toggle */}
        <button
          onClick={onToggleDark}
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:bg-white/5"
          style={{ border: "1px solid rgba(16,185,129,0.12)" }}
        >
          {darkMode ? <Sun size={17} style={{ color: "#f59e0b" }} /> : <Moon size={17} style={{ color: "#c4cdd8" }} />}
        </button>

        {/* Avatar */}
        <div className="flex items-center gap-2 cursor-pointer group">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold"
            style={{ background: "linear-gradient(135deg, #10b981, #3b82f6)", color: "white" }}
          >
            A
          </div>
          <ChevronDown size={14} style={{ color: "#6b7fa3" }} />
        </div>
      </div>
    </header>
  );
}
