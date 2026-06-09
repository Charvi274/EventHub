import { Search, Bell, ChevronDown, LogOut, Calendar, Image, X } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";

interface NavbarProps {
  title: string;
  user: Record<string, unknown>;
  onLogout: () => void;
  onNavigate: (screen: string) => void;
  authToken?: string;
  unreadCount?: number;
}

interface SearchResult {
  id: string;
  type: "event" | "photo";
  title: string;
  sub: string;
}

export function Navbar({ title, user, onLogout, onNavigate, authToken, unreadCount = 0 }: NavbarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // ── Search state ──────────────────────────────────────────────────────────
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const name = typeof user?.name === "string" ? user.name : "User";
  const role = typeof user?.role === "string" ? user.role : "";
  const initials = name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("");

  // Close avatar dropdown on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setDropdownOpen(false);
    }
    if (dropdownOpen) document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [dropdownOpen]);

  // Close search results on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); setSearchOpen(false); return; }
    setSearching(true);
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (authToken) headers["Authorization"] = `Bearer ${authToken}`;
    try {
      const [evRes, mediaRes] = await Promise.allSettled([
        fetch(`/api/events?search=${encodeURIComponent(q)}&limit=4`, { headers }),
        fetch(`/api/media?search=${encodeURIComponent(q)}&limit=4`, { headers }),
      ]);
      const out: SearchResult[] = [];
      if (evRes.status === "fulfilled" && evRes.value.ok) {
        const d = await evRes.value.json();
        const arr = Array.isArray(d) ? d : (d.events ?? d.data ?? []);
        arr.slice(0, 4).forEach((e: { _id: string; title: string; category?: string; startDate?: string }) =>
          out.push({ id: e._id, type: "event", title: e.title, sub: e.category ?? "" })
        );
      }
      if (mediaRes.status === "fulfilled" && mediaRes.value.ok) {
        const d = await mediaRes.value.json();
        const arr = Array.isArray(d) ? d : (d.media ?? d.data ?? []);
        arr.slice(0, 4).forEach((m: { _id: string; title?: string; eventId?: { title?: string } }) =>
          out.push({ id: m._id, type: "photo", title: m.title || "Untitled Photo", sub: m.eventId?.title ?? "" })
        );
      }
      setResults(out);
      setSearchOpen(true);
    } catch { setResults([]); }
    finally { setSearching(false); }
  }, [authToken]);

  const handleInput = (val: string) => {
    setQuery(val);
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!val.trim()) { setResults([]); setSearchOpen(false); return; }
    timerRef.current = setTimeout(() => doSearch(val), 350);
  };

  const handleSelect = (r: SearchResult) => {
    setQuery(""); setResults([]); setSearchOpen(false);
    onNavigate(r.type === "event" ? "events" : "gallery");
  };

  return (
    <header
      className="fixed top-0 right-0 left-64 h-16 flex items-center justify-between px-6 z-30"
      style={{ background: "rgba(4,7,15,0.85)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(16,185,129,0.1)" }}
    >
      <div>
        <h1 className="text-lg font-semibold text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>{title}</h1>
      </div>

      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative hidden md:flex items-center" style={{ width: 280 }} ref={searchRef}>
          <Search size={15} className="absolute left-3 z-10" style={{ color: "#6b7fa3" }} />
          <input
            value={query}
            onChange={(e) => handleInput(e.target.value)}
            placeholder="Search events, photos..."
            className="w-full pl-9 pr-8 py-2 rounded-xl text-sm outline-none transition-all"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(16,185,129,0.12)", color: "#e8edf5" }}
            onFocus={(e) => { e.currentTarget.style.border = "1px solid rgba(16,185,129,0.4)"; if (results.length) setSearchOpen(true); }}
            onBlur={(e) => { e.currentTarget.style.border = "1px solid rgba(16,185,129,0.12)"; }}
          />
          {query && (
            <button className="absolute right-3" onClick={() => { setQuery(""); setResults([]); setSearchOpen(false); }}>
              <X size={13} style={{ color: "#6b7fa3" }} />
            </button>
          )}
          {searching && (
            <div className="absolute right-3 w-3 h-3 rounded-full border border-t-transparent animate-spin" style={{ borderColor: "#10b981", borderTopColor: "transparent" }} />
          )}

          {/* Results dropdown */}
          {searchOpen && results.length > 0 && (
            <div
              className="absolute top-full mt-2 w-full rounded-xl overflow-hidden"
              style={{ background: "rgba(11,18,32,0.98)", border: "1px solid rgba(16,185,129,0.15)", backdropFilter: "blur(20px)", boxShadow: "0 16px 40px rgba(0,0,0,0.5)", zIndex: 200 }}
            >
              {(["event", "photo"] as const).map((type) => {
                const group = results.filter((r) => r.type === type);
                if (!group.length) return null;
                return (
                  <div key={type}>
                    <p className="px-4 pt-3 pb-1 text-xs font-semibold uppercase tracking-wider" style={{ color: "#6b7fa3" }}>
                      {type === "event" ? "Events" : "Photos"}
                    </p>
                    {group.map((r) => (
                      <button
                        key={r.id}
                        onClick={() => handleSelect(r)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all hover:bg-white/5"
                      >
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ background: type === "event" ? "rgba(59,130,246,0.15)" : "rgba(16,185,129,0.15)" }}>
                          {type === "event"
                            ? <Calendar size={13} style={{ color: "#3b82f6" }} />
                            : <Image size={13} style={{ color: "#10b981" }} />}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm text-white truncate">{r.title}</p>
                          {r.sub && <p className="text-xs truncate" style={{ color: "#6b7fa3" }}>{r.sub}</p>}
                        </div>
                      </button>
                    ))}
                  </div>
                );
              })}
              <div className="px-4 py-2.5" style={{ borderTop: "1px solid rgba(16,185,129,0.08)" }}>
                <button
                  onClick={() => { setSearchOpen(false); onNavigate("events"); }}
                  className="text-xs transition-colors hover:text-emerald-300"
                  style={{ color: "#10b981" }}
                >
                  View all results in Events →
                </button>
              </div>
            </div>
          )}

          {/* No results */}
          {searchOpen && query.trim() && !searching && results.length === 0 && (
            <div
              className="absolute top-full mt-2 w-full rounded-xl px-4 py-4 text-center"
              style={{ background: "rgba(11,18,32,0.98)", border: "1px solid rgba(16,185,129,0.15)", backdropFilter: "blur(20px)", zIndex: 200 }}
            >
              <p className="text-sm" style={{ color: "#6b7fa3" }}>No results for "{query}"</p>
            </div>
          )}
        </div>

        {/* Notifications bell */}
        <button
          onClick={() => onNavigate("notifications")}
          className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:bg-white/5"
          style={{ border: "1px solid rgba(16,185,129,0.12)" }}
        >
          <Bell size={17} style={{ color: "#c4cdd8" }} />
          {unreadCount > 0 && (
            <span
              className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full flex items-center justify-center text-white px-1"
              style={{ background: "#10b981", boxShadow: "0 0 6px rgba(16,185,129,0.6)", fontSize: 10, fontWeight: 700, lineHeight: 1 }}
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>

        {/* Avatar + dropdown */}
        <div className="relative" ref={dropdownRef}>
          <div className="flex items-center gap-2 cursor-pointer group" onClick={() => setDropdownOpen((o) => !o)}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold"
              style={{ background: "linear-gradient(135deg, #10b981, #3b82f6)", color: "white" }}>
              {initials || "U"}
            </div>
            <ChevronDown size={14} style={{ color: "#6b7fa3", transform: dropdownOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }} />
          </div>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-52 rounded-xl overflow-hidden"
              style={{ background: "rgba(11,18,32,0.98)", border: "1px solid rgba(16,185,129,0.15)", backdropFilter: "blur(20px)", boxShadow: "0 16px 40px rgba(0,0,0,0.5)", zIndex: 100 }}
            >
              <div className="px-4 py-3" style={{ borderBottom: "1px solid rgba(16,185,129,0.08)" }}>
                <p className="text-sm font-semibold text-white truncate">{name}</p>
                {role && <p className="text-xs truncate" style={{ color: "#6b7fa3" }}>{role}</p>}
              </div>
              <button
                onClick={() => { setDropdownOpen(false); onLogout(); }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm transition-all hover:bg-white/5"
                style={{ color: "#f87171" }}
              >
                <LogOut size={15} />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}