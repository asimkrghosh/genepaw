import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { ShieldCheck, Eye, EyeOff, AlertTriangle } from "lucide-react";
import { COLORS, Navbar, Footer } from "./shared.jsx";
import { useApp } from "./AppContext.jsx";
import { apiFetch } from "./api.js";

export default function StaffLogin() {
  const { user, logout, login } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) navigate("/admin");
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { access_token } = await apiFetch("/api/v1/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      const payload = JSON.parse(atob(access_token.split(".")[1]));
      if (payload.role !== "staff") {
        setError("Invalid credentials or insufficient permissions.");
        return;
      }
      localStorage.setItem("genepaw_token", access_token);
      login({ id: payload.sub, email, role: payload.role, avatar: (email[0] || "S").toUpperCase() });
      navigate("/admin");
    } catch {
      setError("Invalid credentials or insufficient permissions.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: COLORS.bg, color: COLORS.text }}>
      <Navbar user={user} onLogout={logout} />
      <div className="min-h-screen pt-28 pb-20 flex items-center justify-center">
        <div className="w-full max-w-md mx-auto px-6">
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
            <div className="p-6 pb-4 text-center" style={{ background: `linear-gradient(135deg, ${COLORS.primaryDark}, ${COLORS.primary})` }}>
              <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-3">
                <ShieldCheck size={32} className="text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">Staff Portal</h1>
              <p className="text-green-200 text-sm mt-1">Authorized personnel only</p>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-red-50 text-red-600 text-sm flex items-start gap-2">
                  <AlertTriangle size={16} className="mt-0.5 shrink-0" /> {error}
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full font-semibold rounded-xl px-6 py-3 text-white cursor-pointer transition-all hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: `linear-gradient(135deg, ${COLORS.primaryDark}, ${COLORS.primary})` }}
              >
                {loading ? "Signing in…" : "Sign In"}
              </button>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
