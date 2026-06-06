import { useState } from "react";
import { Bell, Shield, Palette, Chrome, Lock, Eye, EyeOff, Check, ChevronRight, Smartphone, Mail, Globe, Moon, Sun, Monitor } from "lucide-react";

function Toggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className="relative flex-shrink-0 transition-all duration-200"
      style={{
        width: 40,
        height: 22,
        borderRadius: 11,
        background: enabled ? "#10b981" : "rgba(255,255,255,0.12)",
        boxShadow: enabled ? "0 0 8px rgba(16,185,129,0.4)" : "none",
      }}
    >
      <div
        className="absolute top-0.5 transition-all duration-200"
        style={{
          width: 18,
          height: 18,
          borderRadius: 9,
          background: "white",
          left: enabled ? 20 : 2,
          boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
        }}
      />
    </button>
  );
}

function SectionHeader({ title, desc }: { title: string; desc?: string }) {
  return (
    <div className="mb-3">
      <h3 className="text-sm font-semibold text-white">{title}</h3>
      {desc && <p className="text-xs mt-0.5" style={{ color: "#6b7fa3" }}>{desc}</p>}
    </div>
  );
}

export function SettingsPage() {
  /* Notification prefs */
  const [notifs, setNotifs] = useState({
    likesComments: true,
    eventUpdates: true,
    newUploads: false,
    weeklyDigest: true,
    smsAlerts: false,
    emailAlerts: true,
    pushNotifs: true,
  });

  /* Theme */
  const [theme, setTheme] = useState<"dark" | "light" | "system">("dark");

  /* Privacy */
  const [privacy, setPrivacy] = useState({
    profilePublic: true,
    showActivity: false,
    allowTagging: true,
    faceRecognition: true,
    downloadProtection: false,
  });

  /* Password */
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [passwords, setPasswords] = useState({ old: "", newPw: "", confirm: "" });
  const [pwSaved, setPwSaved] = useState(false);

  /* Google */
  const [googleConnected, setGoogleConnected] = useState(true);

  const toggleNotif = (key: keyof typeof notifs) => setNotifs((n) => ({ ...n, [key]: !n[key] }));
  const togglePrivacy = (key: keyof typeof privacy) => setPrivacy((p) => ({ ...p, [key]: !p[key] }));

  const handleSavePw = () => {
    if (passwords.newPw && passwords.newPw === passwords.confirm) {
      setPwSaved(true);
      setTimeout(() => { setPwSaved(false); setPasswords({ old: "", newPw: "", confirm: "" }); }, 2000);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-8">
      <div>
        <h2 className="text-xl font-bold text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>Settings</h2>
        <p className="text-sm" style={{ color: "#6b7fa3" }}>Manage your account preferences, privacy, and integrations</p>
      </div>

      {/* ─── Theme ─── */}
      <section>
        <SectionHeader title="Appearance" desc="Choose how EventHub looks on your device" />
        <div
          className="p-5 rounded-2xl space-y-4"
          style={{ background: "rgba(11,18,32,0.8)", border: "1px solid rgba(16,185,129,0.1)" }}
        >
          <div>
            <p className="text-xs font-medium mb-3" style={{ color: "#6b7fa3" }}>Theme</p>
            <div className="grid grid-cols-3 gap-3">
              {([
                { id: "dark", label: "Dark", icon: Moon, desc: "Deep navy, always" },
                { id: "light", label: "Light", icon: Sun, desc: "Bright mode" },
                { id: "system", label: "System", icon: Monitor, desc: "Follow device" },
              ] as const).map(({ id, label, icon: Icon, desc }) => (
                <button
                  key={id}
                  onClick={() => setTheme(id)}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl transition-all"
                  style={{
                    background: theme === id ? "rgba(16,185,129,0.1)" : "rgba(255,255,255,0.03)",
                    border: `1px solid ${theme === id ? "rgba(16,185,129,0.4)" : "rgba(255,255,255,0.06)"}`,
                  }}
                >
                  <Icon size={20} color={theme === id ? "#10b981" : "#6b7fa3"} />
                  <span className="text-sm font-medium" style={{ color: theme === id ? "#10b981" : "white" }}>{label}</span>
                  <span className="text-xs text-center" style={{ color: "#6b7fa3" }}>{desc}</span>
                  {theme === id && <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#10b981" }} />}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between py-2" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
            <div>
              <p className="text-sm text-white">Reduce motion</p>
              <p className="text-xs mt-0.5" style={{ color: "#6b7fa3" }}>Minimize animations across the interface</p>
            </div>
            <Toggle enabled={false} onToggle={() => {}} />
          </div>
        </div>
      </section>

      {/* ─── Notifications ─── */}
      <section>
        <SectionHeader title="Notification Preferences" desc="Control when and how you receive alerts" />
        <div
          className="p-5 rounded-2xl space-y-4"
          style={{ background: "rgba(11,18,32,0.8)", border: "1px solid rgba(16,185,129,0.1)" }}
        >
          <p className="text-xs font-medium mb-1" style={{ color: "#6b7fa3" }}>
            <Bell size={11} className="inline mr-1" />Activity
          </p>
          {[
            { key: "likesComments" as const, label: "Likes & Comments", desc: "When someone interacts with your photos" },
            { key: "eventUpdates" as const, label: "Event Updates", desc: "New events, date changes, cancellations" },
            { key: "newUploads" as const, label: "New Photo Uploads", desc: "When photographers upload to events you attended" },
            { key: "weeklyDigest" as const, label: "Weekly Digest", desc: "A summary of your activity every Monday" },
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white">{label}</p>
                <p className="text-xs mt-0.5" style={{ color: "#6b7fa3" }}>{desc}</p>
              </div>
              <Toggle enabled={notifs[key]} onToggle={() => toggleNotif(key)} />
            </div>
          ))}

          <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 16 }}>
            <p className="text-xs font-medium mb-3" style={{ color: "#6b7fa3" }}>Channels</p>
            {[
              { key: "pushNotifs" as const, label: "Push Notifications", icon: Smartphone, desc: "Browser & mobile push" },
              { key: "emailAlerts" as const, label: "Email Alerts", icon: Mail, desc: "Sent to arjun.mehta@university.edu" },
              { key: "smsAlerts" as const, label: "SMS Alerts", icon: Smartphone, desc: "Critical alerts only" },
            ].map(({ key, label, icon: Icon, desc }) => (
              <div key={key} className="flex items-center justify-between mb-3 last:mb-0">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(255,255,255,0.04)" }}>
                    <Icon size={14} color="#6b7fa3" />
                  </div>
                  <div>
                    <p className="text-sm text-white">{label}</p>
                    <p className="text-xs" style={{ color: "#6b7fa3" }}>{desc}</p>
                  </div>
                </div>
                <Toggle enabled={notifs[key]} onToggle={() => toggleNotif(key)} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Password ─── */}
      <section>
        <SectionHeader title="Password & Security" desc="Update your credentials and secure your account" />
        <div
          className="p-5 rounded-2xl space-y-4"
          style={{ background: "rgba(11,18,32,0.8)", border: "1px solid rgba(16,185,129,0.1)" }}
        >
          {[
            { key: "old", label: "Current Password", show: showOld, toggle: () => setShowOld(!showOld) },
            { key: "newPw", label: "New Password", show: showNew, toggle: () => setShowNew(!showNew) },
            { key: "confirm", label: "Confirm New Password", show: showNew, toggle: () => setShowNew(!showNew) },
          ].map(({ key, label, show, toggle }) => (
            <div key={key}>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "#6b7fa3" }}>{label}</label>
              <div className="relative">
                <input
                  type={show ? "text" : "password"}
                  placeholder="••••••••"
                  value={passwords[key as keyof typeof passwords]}
                  onChange={(e) => setPasswords((p) => ({ ...p, [key]: e.target.value }))}
                  className="w-full px-4 py-3 pr-11 rounded-xl text-sm outline-none transition-all"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(16,185,129,0.15)",
                    color: "#e8edf5",
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(16,185,129,0.5)"; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(16,185,129,0.15)"; }}
                />
                <button
                  onClick={toggle}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: "#6b7fa3" }}
                >
                  {show ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
          ))}

          {/* Password strength */}
          {passwords.newPw && (
            <div>
              <p className="text-xs mb-1.5" style={{ color: "#6b7fa3" }}>Password strength</p>
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="flex-1 h-1 rounded-full"
                    style={{
                      background: passwords.newPw.length >= i * 3
                        ? i < 3 ? "#f59e0b" : "#10b981"
                        : "rgba(255,255,255,0.08)",
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          <button
            onClick={handleSavePw}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-all hover:scale-105"
            style={{
              background: pwSaved ? "rgba(16,185,129,0.2)" : "rgba(16,185,129,0.15)",
              border: "1px solid rgba(16,185,129,0.3)",
              color: "#10b981",
            }}
          >
            {pwSaved ? <><Check size={15} /> Password Updated!</> : <><Lock size={15} /> Update Password</>}
          </button>
        </div>
      </section>

      {/* ─── Privacy ─── */}
      <section>
        <SectionHeader title="Privacy Controls" desc="Manage who can see your profile and interact with your content" />
        <div
          className="p-5 rounded-2xl space-y-4"
          style={{ background: "rgba(11,18,32,0.8)", border: "1px solid rgba(16,185,129,0.1)" }}
        >
          {[
            { key: "profilePublic" as const, label: "Public Profile", desc: "Allow anyone to view your profile and uploads" },
            { key: "showActivity" as const, label: "Show Activity Status", desc: "Let others see when you were last active" },
            { key: "allowTagging" as const, label: "Allow Photo Tagging", desc: "Let others tag you in photos" },
            { key: "faceRecognition" as const, label: "Facial Recognition", desc: "Allow AI to identify your face in event photos" },
            { key: "downloadProtection" as const, label: "Download Protection", desc: "Add watermark to all downloaded copies of your uploads" },
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between">
              <div className="flex items-start gap-3">
                <Shield size={15} color="#6b7fa3" className="mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-white">{label}</p>
                  <p className="text-xs mt-0.5" style={{ color: "#6b7fa3" }}>{desc}</p>
                </div>
              </div>
              <Toggle enabled={privacy[key]} onToggle={() => togglePrivacy(key)} />
            </div>
          ))}
        </div>
      </section>

      {/* ─── Connected accounts ─── */}
      <section>
        <SectionHeader title="Connected Accounts" desc="Manage external integrations" />
        <div
          className="p-5 rounded-2xl space-y-3"
          style={{ background: "rgba(11,18,32,0.8)", border: "1px solid rgba(16,185,129,0.1)" }}
        >
          <div className="flex items-center gap-4 p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.03)" }}>
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(255,255,255,0.06)" }}
            >
              <Chrome size={20} color="#6b7fa3" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-white">Google Account</p>
              <p className="text-xs" style={{ color: googleConnected ? "#10b981" : "#6b7fa3" }}>
                {googleConnected ? "Connected · arjun.mehta@gmail.com" : "Not connected"}
              </p>
            </div>
            <button
              onClick={() => setGoogleConnected(!googleConnected)}
              className="px-3 py-1.5 rounded-xl text-xs font-medium transition-all hover:scale-105"
              style={googleConnected
                ? { background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171" }
                : { background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", color: "#10b981" }
              }
            >
              {googleConnected ? "Disconnect" : "Connect"}
            </button>
          </div>

          {[
            { name: "Institution SSO", detail: "Single sign-on via university portal", connected: true, icon: Globe },
            { name: "Cloud Storage", detail: "Google Drive integration", connected: false, icon: Globe },
          ].map(({ name, detail, connected, icon: Icon }) => (
            <div key={name} className="flex items-center gap-4 p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.03)" }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(255,255,255,0.06)" }}>
                <Icon size={20} color="#6b7fa3" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">{name}</p>
                <p className="text-xs" style={{ color: connected ? "#10b981" : "#6b7fa3" }}>{detail}</p>
              </div>
              <div className="flex items-center gap-2">
                {connected && <span className="w-2 h-2 rounded-full" style={{ background: "#10b981" }} />}
                <ChevronRight size={15} color="#6b7fa3" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Danger zone */}
      <section>
        <div
          className="p-5 rounded-2xl"
          style={{ background: "rgba(239,68,68,0.04)", border: "1px solid rgba(239,68,68,0.15)" }}
        >
          <p className="text-sm font-semibold mb-1" style={{ color: "#f87171" }}>Danger Zone</p>
          <p className="text-xs mb-4" style={{ color: "#6b7fa3" }}>These actions are irreversible. Proceed with caution.</p>
          <div className="flex gap-3">
            <button
              className="px-4 py-2 rounded-xl text-sm transition-all hover:scale-105"
              style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", color: "#f87171" }}
            >
              Deactivate Account
            </button>
            <button
              className="px-4 py-2 rounded-xl text-sm transition-all hover:scale-105"
              style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.4)", color: "#f87171" }}
            >
              Delete Account
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
