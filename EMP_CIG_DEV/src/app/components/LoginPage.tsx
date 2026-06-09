import { useState } from "react";
import { Eye, EyeOff, Camera, Image, Users, Calendar, Sparkles, ArrowRight, Loader2, ChevronDown } from "lucide-react";
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
interface LoginPageProps {
  onLogin: (role: string, token: string, user: Record<string, unknown>) => void;
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

// ─── Shared input style helpers ────────────────────────────────────────────────
const inputBase: React.CSSProperties = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(16,185,129,0.15)",
  color: "#e8edf5",
};
const inputFocus = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
  e.currentTarget.style.border = "1px solid rgba(16,185,129,0.5)";
  e.currentTarget.style.background = "rgba(16,185,129,0.05)";
};
const inputBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
  e.currentTarget.style.border = "1px solid rgba(16,185,129,0.15)";
  e.currentTarget.style.background = "rgba(255,255,255,0.04)";
};

export function LoginPage({ onLogin }: LoginPageProps) {
  // ── view: "login" | "signup" ───────────────────────────────────────────────
  const [view, setView] = useState<"login" | "signup">("login");

  // ── Login state ────────────────────────────────────────────────────────────
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState("viewer");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // ── Signup state ───────────────────────────────────────────────────────────
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupRole, setSignupRole] = useState("Viewer");
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [signupLoading, setSignupLoading] = useState(false);
  const [signupError, setSignupError] = useState("");

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

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleSignIn = async () => {
    setErrorMessage("");
    if (!identifier.trim() || !password.trim()) {
      setErrorMessage("Please enter your credentials.");
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: identifier.trim(), password }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        setErrorMessage(data.message || "Login failed. Please try again.");
        return;
      }
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      onLogin(data.user?.role ?? selectedRole, data.token, data.user);
    } catch {
      setErrorMessage("Unable to connect to the server. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async () => {
    setSignupError("");
    if (!signupName.trim() || !signupEmail.trim() || !signupPassword.trim()) {
      setSignupError("Please fill in all required fields.");
      return;
    }
    setSignupLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: signupName.trim(),
          email: signupEmail.trim(),
          password: signupPassword,
          role: signupRole,
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        setSignupError(data.message || "Signup failed. Please try again.");
        return;
      }
      // Auto-login after successful signup
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      onLogin(data.user?.role ?? signupRole, data.token, data.user);
    } catch {
      setSignupError("Unable to connect to the server. Please try again.");
    } finally {
      setSignupLoading(false);
    }
  };

  const switchToSignup = () => {
    setErrorMessage("");
    setView("signup");
  };

  const switchToLogin = () => {
    setSignupError("");
    setView("login");
  };

  // ── Left branding panel (shared) ───────────────────────────────────────────
  const leftPanel = (
    <div
      className="hidden lg:flex flex-col justify-between w-[52%] relative p-12 overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #04070f 0%, #080f1c 40%, #0a1f1a 100%)",
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 20% 30%, rgba(16,185,129,0.12) 0%, transparent 60%), radial-gradient(ellipse 60% 80% at 80% 70%, rgba(16,185,129,0.06) 0%, transparent 60%)",
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage: `linear-gradient(rgba(16,185,129,1) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,1) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />
      <FloatingParticle style={{ width: 200, height: 200, top: "10%", left: "5%", animationDuration: "4s" }} />
      <FloatingParticle style={{ width: 120, height: 120, top: "60%", right: "10%", animationDuration: "6s", animationDelay: "1s" }} />
      <FloatingParticle style={{ width: 80, height: 80, bottom: "20%", left: "30%", animationDuration: "5s", animationDelay: "2s" }} />

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}>
            <Camera size={20} color="white" />
          </div>
          <span className="text-2xl font-display font-bold text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>
            EventHub
          </span>
        </div>
        <p className="text-sm" style={{ color: "#6b7fa3" }}>By Institutions, For Institutions</p>
      </div>

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
        <div className="grid grid-cols-2 gap-3">
          {features.map(({ icon: Icon, label, desc }) => (
            <div
              key={label}
              className="p-4 rounded-xl transition-all duration-300 hover:scale-[1.02]"
              style={{ background: "rgba(11,18,32,0.6)", border: "1px solid rgba(16,185,129,0.12)", backdropFilter: "blur(12px)" }}
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2" style={{ background: "rgba(16,185,129,0.15)" }}>
                <Icon size={16} color="#10b981" />
              </div>
              <p className="text-sm font-semibold text-white mb-0.5">{label}</p>
              <p className="text-xs leading-snug" style={{ color: "#6b7fa3" }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ── Right panel wrapper ────────────────────────────────────────────────────
  const rightPanelWrapper = (children: React.ReactNode) => (
    <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative" style={{ background: "#06091a" }}>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 70% 50% at 50% 30%, rgba(16,185,129,0.05) 0%, transparent 70%)" }}
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
          {children}
        </div>
      </div>
    </div>
  );

  // ── LOGIN FORM ─────────────────────────────────────────────────────────────
  if (view === "login") {
    return (
      <div className="min-h-screen flex overflow-hidden" style={{ background: "#04070f" }}>
        {leftPanel}
        {rightPanelWrapper(
          <>
            <div className="mb-7">
              <h2 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
                Sign in to EventHub
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

            {/* Inputs */}
            <div className="space-y-4 mb-4">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "#6b7fa3" }}>
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="you@university.edu"
                  value={identifier}
                  onChange={(e) => { setIdentifier(e.target.value); setErrorMessage(""); }}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all duration-200"
                  style={inputBase}
                  onFocus={inputFocus}
                  onBlur={inputBlur}
                  onKeyDown={(e) => e.key === "Enter" && handleSignIn()}
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "#6b7fa3" }}>Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setErrorMessage(""); }}
                    className="w-full px-4 py-3 pr-11 rounded-xl text-sm outline-none transition-all duration-200"
                    style={inputBase}
                    onFocus={inputFocus}
                    onBlur={inputBlur}
                    onKeyDown={(e) => e.key === "Enter" && handleSignIn()}
                    disabled={isLoading}
                  />
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                    style={{ color: "#6b7fa3" }}
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Error */}
            {errorMessage && (
              <div
                className="mb-4 px-4 py-3 rounded-xl text-sm"
                style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "#f87171" }}
              >
                {errorMessage}
              </div>
            )}

            {/* Sign in button */}
            <button
              onClick={handleSignIn}
              disabled={isLoading}
              className="w-full py-3 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg mb-6"
              style={{
                background: "linear-gradient(135deg, #10b981, #059669)",
                boxShadow: "0 4px 20px rgba(16,185,129,0.3)",
                opacity: isLoading ? 0.8 : 1,
                cursor: isLoading ? "not-allowed" : "pointer",
              }}
            >
              {isLoading ? (
                <><Loader2 size={16} className="animate-spin" /> Signing in...</>
              ) : (
                <>Sign In <ArrowRight size={16} /></>
              )}
            </button>

            <div className="text-center text-xs" style={{ color: "#6b7fa3" }}>
              Don't have an account?{" "}
              <button
                onClick={switchToSignup}
                className="font-semibold transition-colors hover:text-emerald-300"
                style={{ color: "#10b981" }}
              >
                Create New Account
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  // ── SIGNUP FORM ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex overflow-hidden" style={{ background: "#04070f" }}>
      {leftPanel}
      {rightPanelWrapper(
        <>
          <div className="mb-7">
            <h2 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Create Account
            </h2>
            <p className="text-sm" style={{ color: "#6b7fa3" }}>Join EventHub — it only takes a moment</p>
          </div>

          <div className="space-y-4 mb-4">
            {/* Name */}
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "#6b7fa3" }}>Full Name</label>
              <input
                type="text"
                placeholder="e.g. Priya Sharma"
                value={signupName}
                onChange={(e) => { setSignupName(e.target.value); setSignupError(""); }}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all duration-200"
                style={inputBase}
                onFocus={inputFocus}
                onBlur={inputBlur}
                disabled={signupLoading}
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "#6b7fa3" }}>Email Address</label>
              <input
                type="email"
                placeholder="you@university.edu"
                value={signupEmail}
                onChange={(e) => { setSignupEmail(e.target.value); setSignupError(""); }}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all duration-200"
                style={inputBase}
                onFocus={inputFocus}
                onBlur={inputBlur}
                disabled={signupLoading}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "#6b7fa3" }}>Password</label>
              <div className="relative">
                <input
                  type={showSignupPassword ? "text" : "password"}
                  placeholder="Min. 6 characters"
                  value={signupPassword}
                  onChange={(e) => { setSignupPassword(e.target.value); setSignupError(""); }}
                  className="w-full px-4 py-3 pr-11 rounded-xl text-sm outline-none transition-all duration-200"
                  style={inputBase}
                  onFocus={inputFocus}
                  onBlur={inputBlur}
                  onKeyDown={(e) => e.key === "Enter" && handleSignup()}
                  disabled={signupLoading}
                />
                <button
                  onClick={() => setShowSignupPassword(!showSignupPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: "#6b7fa3" }}
                  disabled={signupLoading}
                >
                  {showSignupPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Role */}
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "#6b7fa3" }}>Role</label>
              <div className="relative">
                <select
                  value={signupRole}
                  onChange={(e) => setSignupRole(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all duration-200 appearance-none cursor-pointer"
                  style={{ ...inputBase, paddingRight: "2.5rem" }}
                  onFocus={inputFocus}
                  onBlur={inputBlur}
                  disabled={signupLoading}
                >
                  <option value="Viewer" style={{ background: "#06091a" }}>Viewer</option>
                  <option value="Club Member" style={{ background: "#06091a" }}>Club Member</option>
                  <option value="Photographer" style={{ background: "#06091a" }}>Photographer</option>
                  <option value="Admin" style={{ background: "#06091a" }}>Admin</option>
                </select>
                <ChevronDown
                  size={14}
                  className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: "#6b7fa3" }}
                />
              </div>
            </div>
          </div>

          {/* Error */}
          {signupError && (
            <div
              className="mb-4 px-4 py-3 rounded-xl text-sm"
              style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "#f87171" }}
            >
              {signupError}
            </div>
          )}

          {/* Create account button */}
          <button
            onClick={handleSignup}
            disabled={signupLoading}
            className="w-full py-3 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg mb-6"
            style={{
              background: "linear-gradient(135deg, #10b981, #059669)",
              boxShadow: "0 4px 20px rgba(16,185,129,0.3)",
              opacity: signupLoading ? 0.8 : 1,
              cursor: signupLoading ? "not-allowed" : "pointer",
            }}
          >
            {signupLoading ? (
              <><Loader2 size={16} className="animate-spin" /> Creating Account...</>
            ) : (
              <>Create Account <ArrowRight size={16} /></>
            )}
          </button>

          <div className="text-center text-xs" style={{ color: "#6b7fa3" }}>
            Already have an account?{" "}
            <button
              onClick={switchToLogin}
              className="font-semibold transition-colors hover:text-emerald-300"
              style={{ color: "#10b981" }}
            >
              Sign In
            </button>
          </div>
        </>
      )}
    </div>
  );
}