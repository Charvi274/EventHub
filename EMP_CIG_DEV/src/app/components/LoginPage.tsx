import { useState } from "react";
import { Eye, EyeOff, Camera, Image, Users, Calendar, Sparkles, ArrowRight, Chrome } from "lucide-react";

interface LoginPageProps {
  onLogin: (role: string) => void;
}

const FloatingParticle = ({ style }: { style: React.CSSProperties }) => (
  <div
    className="absolute rounded-full opacity-20 animate-pulse"
    style={{
      background: "radial-gradient(circle, #10b981, transparent)",
      ...style,
    }}
  />
);

export function LoginPage({ onLogin }: LoginPageProps) {
  const [activeTab, setActiveTab] = useState<"enrollment" | "email">("enrollment");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [selectedRole, setSelectedRole] = useState("viewer");

  const roles = [
    { id: "admin", label: "Admin", color: "#f59e0b" },
    { id: "photographer", label: "Photographer", color: "#8b5cf6" },
    { id: "member", label: "Club Member", color: "#3b82f6" },
    { id: "viewer", label: "Viewer", color: "#10b981" },
  ];

  const features = [
    { icon: Calendar, label: "Manage Events", desc: "Create and organize college events seamlessly" },
    { icon: Image, label: "Media Gallery", desc: "Browse thousands of event photos and videos" },
    { icon: Camera, label: "AI Photo Finder", desc: "Find your photos using facial recognition" },
    { icon: Users, label: "Collaborate", desc: "Connect clubs, societies and organizations" },
  ];

  return (
    <div className="min-h-screen flex overflow-hidden" style={{ background: "#04070f" }}>
      {/* Left branding panel */}
      <div
        className="hidden lg:flex flex-col justify-between w-[52%] relative p-12 overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #04070f 0%, #080f1c 40%, #0a1f1a 100%)",
        }}
      >
        {/* Mesh gradient background */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 20% 30%, rgba(16,185,129,0.12) 0%, transparent 60%), radial-gradient(ellipse 60% 80% at 80% 70%, rgba(16,185,129,0.06) 0%, transparent 60%)",
          }}
        />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(rgba(16,185,129,1) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,1) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />

        {/* Particles */}
        <FloatingParticle style={{ width: 200, height: 200, top: "10%", left: "5%", animationDuration: "4s" }} />
        <FloatingParticle style={{ width: 120, height: 120, top: "60%", right: "10%", animationDuration: "6s", animationDelay: "1s" }} />
        <FloatingParticle style={{ width: 80, height: 80, bottom: "20%", left: "30%", animationDuration: "5s", animationDelay: "2s" }} />

        {/* Top logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}
            >
              <Camera size={20} color="white" />
            </div>
            <span className="text-2xl font-display font-bold text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>
              EventHub
            </span>
          </div>
          <p className="text-sm" style={{ color: "#6b7fa3" }}>
            By Institutions, For Institutions
          </p>
        </div>

        {/* Hero section */}
        <div className="relative z-10 flex-1 flex flex-col justify-center py-12">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs mb-6 w-fit"
            style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", color: "#10b981" }}
          >
            <Sparkles size={12} />
            AI-Powered Platform
          </div>

          <h1
            className="text-5xl xl:text-6xl font-black leading-tight mb-4"
            style={{
              fontFamily: "'Outfit', sans-serif",
              background: "linear-gradient(135deg, #ffffff 0%, #a7f3d0 60%, #10b981 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Organize,<br />Discover &<br />Relive Every<br />Event
          </h1>

          <p className="text-base leading-relaxed mb-10" style={{ color: "#7d93b5", maxWidth: 380 }}>
            The ultimate event and media management platform for colleges, universities, clubs, and societies.
          </p>

          {/* Feature cards */}
          <div className="grid grid-cols-2 gap-3">
            {features.map(({ icon: Icon, label, desc }) => (
              <div
                key={label}
                className="p-4 rounded-xl transition-all duration-300 hover:scale-[1.02]"
                style={{
                  background: "rgba(11,18,32,0.6)",
                  border: "1px solid rgba(16,185,129,0.12)",
                  backdropFilter: "blur(12px)",
                }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center mb-2"
                  style={{ background: "rgba(16,185,129,0.15)" }}
                >
                  <Icon size={16} color="#10b981" />
                </div>
                <p className="text-sm font-semibold text-white mb-0.5">{label}</p>
                <p className="text-xs leading-snug" style={{ color: "#6b7fa3" }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom stats */}
        <div className="relative z-10 flex gap-8">
          {[["12K+", "Events"], ["180K+", "Photos"], ["3K+", "Clubs"]].map(([num, label]) => (
            <div key={label}>
              <p className="text-2xl font-bold" style={{ color: "#10b981", fontFamily: "'Outfit', sans-serif" }}>{num}</p>
              <p className="text-xs" style={{ color: "#6b7fa3" }}>{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right auth panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative" style={{ background: "#06091a" }}>
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse 70% 50% at 50% 30%, rgba(16,185,129,0.05) 0%, transparent 70%)",
          }}
        />

        <div className="w-full max-w-md relative z-10">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}>
              <Camera size={18} color="white" />
            </div>
            <span className="text-xl font-bold text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>EventHub</span>
          </div>

          <div
            className="rounded-2xl p-8"
            style={{
              background: "rgba(11,18,32,0.8)",
              border: "1px solid rgba(16,185,129,0.15)",
              backdropFilter: "blur(20px)",
              boxShadow: "0 24px 64px rgba(0,0,0,0.5), 0 0 0 1px rgba(16,185,129,0.05)",
            }}
          >
            <div className="mb-7">
              <h2 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
                Welcome back
              </h2>
              <p className="text-sm" style={{ color: "#6b7fa3" }}>Sign in to your EventHub account</p>
            </div>

            {/* Role selector */}
            <div className="flex gap-2 mb-6 flex-wrap">
              {roles.map((role) => (
                <button
                  key={role.id}
                  onClick={() => setSelectedRole(role.id)}
                  className="px-3 py-1 rounded-full text-xs transition-all duration-200"
                  style={{
                    background: selectedRole === role.id ? `${role.color}20` : "rgba(255,255,255,0.04)",
                    border: `1px solid ${selectedRole === role.id ? role.color + "50" : "rgba(255,255,255,0.08)"}`,
                    color: selectedRole === role.id ? role.color : "#6b7fa3",
                    fontWeight: selectedRole === role.id ? 600 : 400,
                  }}
                >
                  {role.label}
                </button>
              ))}
            </div>

            {/* Tab switcher */}
            <div className="flex rounded-lg mb-6 p-1" style={{ background: "rgba(255,255,255,0.04)" }}>
              {(["enrollment", "email"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className="flex-1 py-2 rounded-md text-sm transition-all duration-200"
                  style={{
                    background: activeTab === tab ? "rgba(16,185,129,0.15)" : "transparent",
                    color: activeTab === tab ? "#10b981" : "#6b7fa3",
                    fontWeight: activeTab === tab ? 600 : 400,
                    border: activeTab === tab ? "1px solid rgba(16,185,129,0.3)" : "1px solid transparent",
                  }}
                >
                  {tab === "enrollment" ? "Enrollment No." : "Email"}
                </button>
              ))}
            </div>

            {/* Input fields */}
            <div className="space-y-4 mb-4">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "#6b7fa3" }}>
                  {activeTab === "enrollment" ? "Enrollment Number" : "Email Address"}
                </label>
                <input
                  type={activeTab === "enrollment" ? "text" : "email"}
                  placeholder={activeTab === "enrollment" ? "e.g. 2023CS0142" : "you@university.edu"}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all duration-200"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(16,185,129,0.15)",
                    color: "#e8edf5",
                  }}
                  onFocus={(e) => { e.currentTarget.style.border = "1px solid rgba(16,185,129,0.5)"; e.currentTarget.style.background = "rgba(16,185,129,0.05)"; }}
                  onBlur={(e) => { e.currentTarget.style.border = "1px solid rgba(16,185,129,0.15)"; e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "#6b7fa3" }}>Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="w-full px-4 py-3 pr-11 rounded-xl text-sm outline-none transition-all duration-200"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(16,185,129,0.15)",
                      color: "#e8edf5",
                    }}
                    onFocus={(e) => { e.currentTarget.style.border = "1px solid rgba(16,185,129,0.5)"; e.currentTarget.style.background = "rgba(16,185,129,0.05)"; }}
                    onBlur={(e) => { e.currentTarget.style.border = "1px solid rgba(16,185,129,0.15)"; e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
                  />
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                    style={{ color: "#6b7fa3" }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Remember + forgot */}
            <div className="flex items-center justify-between mb-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <div
                  onClick={() => setRememberMe(!rememberMe)}
                  className="w-4 h-4 rounded flex items-center justify-center cursor-pointer transition-all"
                  style={{
                    background: rememberMe ? "#10b981" : "transparent",
                    border: `1.5px solid ${rememberMe ? "#10b981" : "rgba(255,255,255,0.2)"}`,
                  }}
                >
                  {rememberMe && <span className="text-white text-xs">✓</span>}
                </div>
                <span className="text-xs" style={{ color: "#6b7fa3" }}>Remember me</span>
              </label>
              <button className="text-xs transition-colors hover:text-emerald-400" style={{ color: "#10b981" }}>
                Forgot Password?
              </button>
            </div>

            {/* Login button */}
            <button
              onClick={() => onLogin(selectedRole)}
              className="w-full py-3 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg mb-3"
              style={{
                background: "linear-gradient(135deg, #10b981, #059669)",
                boxShadow: "0 4px 20px rgba(16,185,129,0.3)",
              }}
            >
              Sign In <ArrowRight size={16} />
            </button>

            {/* Google */}
            <button
              className="w-full py-3 rounded-xl text-sm flex items-center justify-center gap-2 transition-all duration-200 hover:scale-[1.01] mb-3"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#c4cdd8",
              }}
            >
              <Chrome size={16} /> Continue with Google
            </button>

            {/* Guest */}
            <button
              onClick={() => onLogin("guest")}
              className="w-full py-3 rounded-xl text-sm transition-all duration-200 hover:scale-[1.01] mb-6"
              style={{
                background: "transparent",
                border: "1px solid rgba(16,185,129,0.2)",
                color: "#10b981",
              }}
            >
              Explore as Guest
            </button>

            <div className="text-center text-xs" style={{ color: "#6b7fa3" }}>
              Don't have an account?{" "}
              <button className="font-semibold transition-colors" style={{ color: "#10b981" }}>
                Create New Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
