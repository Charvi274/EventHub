import { useState, useEffect, useCallback } from "react";
import { Lock, Eye, EyeOff, Check, AlertCircle, Loader2, LogOut, User, Bell, Info } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000" || "http://localhost:5173";

function getToken() {
  return localStorage.getItem("token") || sessionStorage.getItem("token") || "";
}
function getStoredUser() {
  try {
    const raw = localStorage.getItem("user") || sessionStorage.getItem("user");
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

type Toast = { type: "success" | "error"; message: string } | null;

function ToastBar({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onDismiss, 4000);
    return () => clearTimeout(t);
  }, [toast, onDismiss]);
  if (!toast) return null;
  const ok = toast.type === "success";
  return (
    <div style={{
      position: "fixed", bottom: 24, right: 24, zIndex: 50,
      display: "flex", alignItems: "center", gap: 10,
      padding: "12px 16px", borderRadius: 12, fontSize: 14, fontWeight: 500,
      background: ok ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)",
      border: `1px solid ${ok ? "rgba(16,185,129,0.4)" : "rgba(239,68,68,0.4)"}`,
      color: ok ? "#10b981" : "#f87171", backdropFilter: "blur(8px)",
    }}>
      {ok ? <Check size={15} /> : <AlertCircle size={15} />}
      {toast.message}
    </div>
  );
}

function Toggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle} style={{
      width: 40, height: 22, borderRadius: 11, flexShrink: 0, border: "none",
      background: enabled ? "#10b981" : "rgba(255,255,255,0.12)",
      boxShadow: enabled ? "0 0 8px rgba(16,185,129,0.4)" : "none",
      position: "relative", transition: "all 0.2s", cursor: "pointer",
    }}>
      <div style={{
        position: "absolute", top: 2, width: 18, height: 18, borderRadius: 9,
        background: "white", left: enabled ? 20 : 2, transition: "all 0.2s",
        boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
      }} />
    </button>
  );
}

const card: React.CSSProperties = {
  background: "rgba(11,18,32,0.8)", border: "1px solid rgba(16,185,129,0.1)",
  borderRadius: 16, padding: 20,
};
const inputStyle: React.CSSProperties = {
  width: "100%", padding: "12px 16px", borderRadius: 12, fontSize: 14,
  outline: "none", background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(16,185,129,0.15)", color: "#e8edf5", boxSizing: "border-box",
};
const btnGreen: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 8, padding: "10px 16px",
  borderRadius: 12, fontSize: 14, fontWeight: 500, cursor: "pointer",
  background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)", color: "#10b981",
};
const btnRed: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 8, padding: "10px 16px",
  borderRadius: 12, fontSize: 14, fontWeight: 500, cursor: "pointer",
  background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "#f87171",
};

function SectionHead({ title, desc }: { title: string; desc?: string }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <h3 style={{ fontSize: 14, fontWeight: 600, color: "white", margin: 0 }}>{title}</h3>
      {desc && <p style={{ fontSize: 12, color: "#6b7fa3", marginTop: 2, margin: 0 }}>{desc}</p>}
    </div>
  );
}

export function SettingsPage({ onLogout }: { onLogout?: () => void }) {
  const [toast, setToast] = useState<Toast>(null);
  const fire = (type: "success" | "error", message: string) => setToast({ type, message });

  // ── Edit Profile ──────────────────────────────────────────
  const storedUser = getStoredUser();
  const [profile, setProfile] = useState({ name: storedUser.name || "", bio: storedUser.bio || "" });
  const [profileLoading, setProfileLoading] = useState(false);

  const saveProfile = async () => {
    if (!profile.name.trim() || profile.name.trim().length < 2)
      return fire("error", "Name must be at least 2 characters.");
    setProfileLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/update-profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ name: profile.name, bio: profile.bio }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      // Update stored user so other components reflect the change
      const key = localStorage.getItem("token") ? "user" : "user";
      const storage = localStorage.getItem("token") ? localStorage : sessionStorage;
      storage.setItem("user", JSON.stringify(data.user));
      fire("success", "Profile updated.");
    } catch (e: any) { fire("error", e.message); }
    finally { setProfileLoading(false); }
  };

  // ── Notifications ─────────────────────────────────────────
  const [unread, setUnread] = useState<number | null>(null);
  const [markingRead, setMarkingRead] = useState(false);

  const fetchUnread = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/notifications/unread-count`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (data.success) setUnread(data.count);
    } catch {}
  }, []);

  useEffect(() => { fetchUnread(); }, [fetchUnread]);

  const markAllRead = async () => {
    setMarkingRead(true);
    try {
      const res = await fetch(`${API_BASE}/notifications/read-all`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setUnread(0);
      fire("success", "All notifications marked as read.");
    } catch (e: any) { fire("error", e.message); }
    finally { setMarkingRead(false); }
  };

  // ── Change Password ───────────────────────────────────────
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [pw, setPw] = useState({ old: "", newPw: "", confirm: "" });
  const [pwLoading, setPwLoading] = useState(false);

  const changePassword = async () => {
    if (!pw.old || !pw.newPw || !pw.confirm) return fire("error", "Fill in all fields.");
    if (pw.newPw !== pw.confirm) return fire("error", "New passwords do not match.");
    if (pw.newPw.length < 6) return fire("error", "New password must be at least 6 characters.");
    setPwLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/change-password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ currentPassword: pw.old, newPassword: pw.newPw }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      fire("success", "Password updated.");
      setPw({ old: "", newPw: "", confirm: "" });
    } catch (e: any) { fire("error", e.message); }
    finally { setPwLoading(false); }
  };

  const strength = (() => {
    const p = pw.newPw; let s = 0;
    if (p.length >= 6) s++; if (p.length >= 10) s++;
    if (/[A-Z]/.test(p) && /[a-z]/.test(p)) s++;
    if (/\d/.test(p) && /[^a-zA-Z0-9]/.test(p)) s++;
    return s;
  })();

  // ── App Preferences (UI-only, harmless) ──────────────────
  const [prefs, setPrefs] = useState({
    compactView: false,
    showFileSizes: true,
  });

  return (
    <div style={{ padding: 24, maxWidth: 672, margin: "0 auto", display: "flex", flexDirection: "column", gap: 32 }}>
      <ToastBar toast={toast} onDismiss={() => setToast(null)} />

      <div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: "white", fontFamily: "'Outfit',sans-serif", margin: 0 }}>Settings</h2>
        <p style={{ fontSize: 14, color: "#6b7fa3", marginTop: 4 }}>Manage your account</p>
      </div>

      {/* ── Edit Profile ── */}
      <section>
        <SectionHead title="Edit Profile" desc="Update your display name and bio" />
        <div style={{ ...card, display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderRadius: 12, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <User size={18} color="#10b981" />
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, color: "white", margin: 0 }}>{storedUser.name || "—"}</p>
              <p style={{ fontSize: 12, color: "#6b7fa3", margin: 0 }}>{storedUser.email || ""} · {storedUser.role || ""}</p>
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#6b7fa3", marginBottom: 6 }}>Name</label>
            <input type="text" value={profile.name} maxLength={50}
              onChange={(e) => setProfile(p => ({ ...p, name: e.target.value }))}
              style={inputStyle}
              onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(16,185,129,0.5)"; }}
              onBlur={(e)  => { e.currentTarget.style.borderColor = "rgba(16,185,129,0.15)"; }}
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#6b7fa3", marginBottom: 6 }}>Bio</label>
            <textarea value={profile.bio} maxLength={200}
              onChange={(e) => setProfile(p => ({ ...p, bio: e.target.value }))}
              rows={3}
              style={{ ...inputStyle, resize: "vertical" }}
              onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(16,185,129,0.5)"; }}
              onBlur={(e)  => { e.currentTarget.style.borderColor = "rgba(16,185,129,0.15)"; }}
            />
            <p style={{ fontSize: 11, color: "#6b7fa3", marginTop: 4, textAlign: "right" }}>{profile.bio.length}/200</p>
          </div>
          <button onClick={saveProfile} disabled={profileLoading} style={{ ...btnGreen, opacity: profileLoading ? 0.6 : 1 }}>
            {profileLoading ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
            {profileLoading ? "Saving…" : "Save Profile"}
          </button>
        </div>
      </section>

      {/* ── Notifications ── */}
      <section>
        <SectionHead title="Notifications" desc="Your unread notification status" />
        <div style={{ ...card, display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderRadius: 12, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Bell size={16} color={unread ? "#10b981" : "#6b7fa3"} />
              <div>
                <p style={{ fontSize: 14, color: "white", margin: 0 }}>Unread Notifications</p>
                <p style={{ fontSize: 12, color: "#6b7fa3", margin: 0 }}>
                  {unread === null ? "Loading…" : unread === 0 ? "You're all caught up" : `${unread} unread`}
                </p>
              </div>
            </div>
            {unread !== null && unread > 0 && (
              <span style={{ fontSize: 12, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: "rgba(16,185,129,0.2)", color: "#10b981", border: "1px solid rgba(16,185,129,0.3)" }}>
                {unread}
              </span>
            )}
          </div>
          {unread !== null && unread > 0 && (
            <button onClick={markAllRead} disabled={markingRead} style={{ ...btnGreen, opacity: markingRead ? 0.6 : 1 }}>
              {markingRead ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
              {markingRead ? "Marking…" : "Mark All as Read"}
            </button>
          )}
          <div style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "10px 14px", borderRadius: 10, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
            <Info size={13} color="#6b7fa3" style={{ marginTop: 2, flexShrink: 0 }} />
            <p style={{ fontSize: 12, color: "#6b7fa3", margin: 0 }}>
              To view all notifications, visit the Notifications page from the sidebar.
            </p>
          </div>
        </div>
      </section>

      {/* ── Change Password ── */}
      <section>
        <SectionHead title="Change Password" desc="Update your account password" />
        <div style={{ ...card, display: "flex", flexDirection: "column", gap: 16 }}>
          {[
            { key: "old",     label: "Current Password", show: showOld, toggle: () => setShowOld(v => !v) },
            { key: "newPw",   label: "New Password",      show: showNew, toggle: () => setShowNew(v => !v) },
            { key: "confirm", label: "Confirm Password",  show: showNew, toggle: () => setShowNew(v => !v) },
          ].map(({ key, label, show, toggle }) => (
            <div key={key}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#6b7fa3", marginBottom: 6 }}>{label}</label>
              <div style={{ position: "relative" }}>
                <input type={show ? "text" : "password"} placeholder="••••••••"
                  value={pw[key as keyof typeof pw]}
                  onChange={(e) => setPw(p => ({ ...p, [key]: e.target.value }))}
                  style={{ ...inputStyle, paddingRight: 44 }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(16,185,129,0.5)"; }}
                  onBlur={(e)  => { e.currentTarget.style.borderColor = "rgba(16,185,129,0.15)"; }}
                />
                <button onClick={toggle} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "#6b7fa3", background: "none", border: "none", cursor: "pointer" }}>
                  {show ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
          ))}

          {pw.newPw && (
            <div>
              <p style={{ fontSize: 12, color: "#6b7fa3", marginBottom: 6 }}>Password strength</p>
              <div style={{ display: "flex", gap: 4 }}>
                {[1,2,3,4].map(i => (
                  <div key={i} style={{ flex: 1, height: 4, borderRadius: 4, transition: "background 0.3s",
                    background: i > strength ? "rgba(255,255,255,0.08)" : strength <= 1 ? "#ef4444" : strength <= 2 ? "#f59e0b" : "#10b981" }} />
                ))}
              </div>
            </div>
          )}

          {pw.confirm && pw.newPw !== pw.confirm && (
            <p style={{ fontSize: 12, color: "#f87171", display: "flex", alignItems: "center", gap: 6, margin: 0 }}>
              <AlertCircle size={12} /> Passwords do not match
            </p>
          )}

          <button onClick={changePassword} disabled={pwLoading} style={{ ...btnGreen, opacity: pwLoading ? 0.6 : 1 }}>
            {pwLoading ? <Loader2 size={15} className="animate-spin" /> : <Lock size={15} />}
            {pwLoading ? "Updating…" : "Update Password"}
          </button>
        </div>
      </section>

      {/* ── App Preferences (UI-only) ── */}
      <section>
        <SectionHead title="Display Preferences" desc="Visual options — saved in this browser" />
        <div style={{ ...card, display: "flex", flexDirection: "column", gap: 16 }}>
          {[
            { key: "compactView"    as const, label: "Compact View",      desc: "Reduce spacing in gallery and lists" },
            { key: "showFileSizes"  as const, label: "Show File Sizes",   desc: "Display file size under each photo" },
          ].map(({ key, label, desc }) => (
            <div key={key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <p style={{ fontSize: 14, color: "white", margin: 0 }}>{label}</p>
                <p style={{ fontSize: 12, color: "#6b7fa3", margin: 0 }}>{desc}</p>
              </div>
              <Toggle enabled={prefs[key]} onToggle={() => setPrefs(p => ({ ...p, [key]: !p[key] }))} />
            </div>
          ))}
        </div>
      </section>

      {/* ── Account ── */}
      <section>
        <SectionHead title="Account" />
        <div style={{ ...card }}>
          <button onClick={onLogout} style={btnRed}>
            <LogOut size={15} /> Sign Out
          </button>
        </div>
      </section>
    </div>
  );
}