import { useState, useEffect } from "react";
import { Dna, Menu, X, LogOut, Mail, Phone, MapPin, Globe } from "lucide-react";
import { useNavigate, useLocation } from "react-router";

// ─── Color Palette ───
export const COLORS = {
  primary: "#1B6B4A",
  primaryLight: "#2D9D6F",
  primaryDark: "#0F4A32",
  accent: "#F59E0B",
  accentLight: "#FCD34D",
  danger: "#EF4444",
  info: "#3B82F6",
  bg: "#F8FAF9",
  card: "#FFFFFF",
  text: "#1F2937",
  textLight: "#6B7280",
  border: "#E5E7EB",
  gradientStart: "#0F4A32",
  gradientEnd: "#2D9D6F",
};

// ─── India States & UTs ───
export const INDIA_STATES = [
  "Andaman and Nicobar Islands",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu and Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Ladakh",
  "Lakshadweep",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];

// ─── Utilities ───
export const formatINR = (amount) => {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
};

// ─── Reusable Components ───
export function Button({ children, variant = "primary", size = "md", onClick, className = "", disabled = false }) {
  const base = "font-semibold rounded-xl transition-all duration-200 inline-flex items-center justify-center gap-2 cursor-pointer";
  const variants = {
    primary: `bg-gradient-to-r from-[${COLORS.gradientStart}] to-[${COLORS.gradientEnd}] text-white hover:shadow-lg hover:shadow-green-900/25 hover:-translate-y-0.5`,
    secondary: "bg-white text-gray-800 border-2 border-gray-200 hover:border-green-600 hover:text-green-700",
    accent: "bg-amber-500 text-white hover:bg-amber-600 hover:shadow-lg hover:shadow-amber-500/25",
    ghost: "bg-transparent text-green-700 hover:bg-green-50",
    danger: "bg-red-500 text-white hover:bg-red-600",
  };
  const sizes = { sm: "px-4 py-2 text-sm", md: "px-6 py-3 text-base", lg: "px-8 py-4 text-lg" };
  return (
    <button onClick={onClick} disabled={disabled} className={`${base} ${variants[variant]} ${sizes[size]} ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`} style={variant === "primary" ? { background: `linear-gradient(135deg, ${COLORS.gradientStart}, ${COLORS.gradientEnd})` } : {}}>
      {children}
    </button>
  );
}

export function SectionTitle({ subtitle, title, description, light = false }) {
  return (
    <div className="text-center max-w-3xl mx-auto mb-16">
      {subtitle && <span className={`text-sm font-bold tracking-widest uppercase ${light ? "text-green-300" : "text-green-600"}`}>{subtitle}</span>}
      <h2 className={`text-4xl font-bold mt-2 mb-4 ${light ? "text-white" : "text-gray-900"}`}>{title}</h2>
      {description && <p className={`text-lg ${light ? "text-green-100" : "text-gray-500"}`}>{description}</p>}
    </div>
  );
}

export function Badge({ children, color = COLORS.primary }) {
  return (
    <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ backgroundColor: color + "15", color: color }}>
      {children}
    </span>
  );
}

// ─── Navigation ───
export function Navbar({ currentPage, user, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const isAdmin = user?.role === "staff";

  const navTo = (id) => {
    if (id === "home" || id === "species" || id === "how" || id === "pricing" || id === "faq") {
      navigate("/");
    } else if (id === "results") {
      navigate("/results");
    } else if (id === "tracking") {
      navigate("/track");
    } else if (id === "order") {
      navigate("/order-kit");
    } else if (["upload-report", "update-tracker", "markers"].includes(id)) {
      navigate("/admin");
    }
    setOpen(false);
  };

  const activePath = location.pathname;

  const allLinks = [
    { id: "home", label: "Home", path: "/" },
    { id: "results", label: "Sample Results", path: "/results" },
    { id: "tracking", label: "Track Kit", path: "/track" },
    { id: "upload-report", label: "Upload Report", adminOnly: true, path: "/admin" },
    { id: "update-tracker", label: "Update Tracker", adminOnly: true, path: "/admin" },
    { id: "markers", label: "Markers", adminOnly: true, path: "/admin" },
    { id: "pricing", label: "Pricing", path: "/" },
    { id: "faq", label: "FAQ", hideForAdmin: true, path: "/" },
  ];

  const links = isAdmin ? allLinks.filter((l) => !l.hideForAdmin) : allLinks.filter((l) => !l.adminOnly);

  const hasDarkHero = activePath === "/";
  const useLight = hasDarkHero && !scrolled;

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${useLight ? "bg-transparent" : "bg-white/95 backdrop-blur-md shadow-lg"}`}>
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <button onClick={() => navigate("/")} className="flex items-center gap-2 cursor-pointer mr-6">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg" style={{ background: `linear-gradient(135deg, ${COLORS.gradientStart}, ${COLORS.gradientEnd})` }}>
            <Dna size={22} />
          </div>
          <span className={`text-xl font-bold ${useLight ? "text-white" : "text-gray-900"}`}>GenePaw</span>
        </button>

        <div className="hidden lg:flex items-center gap-1">
          {links.map((l) => (
            <button key={l.id} onClick={() => navTo(l.id)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${activePath === l.path ? "bg-green-100 text-green-800" : useLight ? "text-white/80 hover:text-white hover:bg-white/10" : "text-gray-600 hover:text-green-700 hover:bg-green-50"}`}>
              {l.label}
            </button>
          ))}
        </div>

        <div className="hidden lg:flex items-center gap-3">
          {user ? (
            <>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50 border border-green-200">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: `linear-gradient(135deg, ${COLORS.primaryDark}, ${COLORS.primary})` }}>
                  {user.avatar}
                </div>
                <Badge color={COLORS.primary}>Staff</Badge>
              </div>
              <Button variant="ghost" size="sm" onClick={() => { onLogout(); navigate("/"); }}><LogOut size={16} /> Logout</Button>
            </>
          ) : (
            <Button size="sm" onClick={() => navigate("/order-kit")}>Order Kit</Button>
          )}
        </div>

        <div className="lg:hidden flex items-center gap-2">
          {user && (
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: `linear-gradient(135deg, ${COLORS.primaryDark}, ${COLORS.primary})` }}>
              {user.avatar}
            </div>
          )}
          <button onClick={() => setOpen(!open)} className="p-2 rounded-lg cursor-pointer bg-gray-100/80 backdrop-blur-sm border border-gray-200/50 shadow-sm" style={{ color: COLORS.text }}>
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden bg-white shadow-xl border-t p-4 space-y-1">
          {user && (
            <div className="flex items-center gap-3 px-4 py-3 mb-2 bg-green-50 rounded-xl border border-green-100">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white" style={{ background: `linear-gradient(135deg, ${COLORS.primaryDark}, ${COLORS.primary})` }}>
                {user.avatar}
              </div>
              <div>
                <div className="text-xs text-green-600 font-medium">Staff Account</div>
              </div>
            </div>
          )}
          {links.map((l) => (
            <button key={l.id} onClick={() => navTo(l.id)} className="block w-full text-left px-4 py-3 rounded-lg text-gray-700 hover:bg-green-50 hover:text-green-700 font-medium cursor-pointer">
              {l.label}
            </button>
          ))}
          <div className="pt-3 border-t mt-3 space-y-2">
            {user ? (
              <Button variant="ghost" className="w-full" onClick={() => { onLogout(); navigate("/"); setOpen(false); }}><LogOut size={16} /> Logout</Button>
            ) : (
              <Button className="w-full" onClick={() => { navigate("/order-kit"); setOpen(false); }}>Order Kit</Button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

// ─── Footer ───
export function Footer() {
  const navigate = useNavigate();
  return (
    <footer className="bg-gray-900 text-white pt-20 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ background: `linear-gradient(135deg, ${COLORS.gradientStart}, ${COLORS.gradientEnd})` }}>
                <Dna size={20} />
              </div>
              <span className="text-xl font-bold">GenePaw</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">Unlocking the genetic blueprint of every animal. Advanced multi-species genomics made accessible.</p>
          </div>
          <div>
            <h4 className="font-bold mb-4">Services</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="hover:text-green-400 cursor-pointer" onClick={() => navigate("/")}>Breed Identification</li>
              <li className="hover:text-green-400 cursor-pointer" onClick={() => navigate("/results")}>Health Screening</li>
              <li className="hover:text-green-400 cursor-pointer" onClick={() => navigate("/results")}>Behavior Analysis</li>
              <li className="hover:text-green-400 cursor-pointer" onClick={() => navigate("/results")}>Nutrition Profiling</li>
              <li className="hover:text-green-400 cursor-pointer" onClick={() => navigate("/results")}>Relative Finder</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="hover:text-green-400 cursor-pointer">About Us</li>
              <li className="hover:text-green-400 cursor-pointer">Our Science</li>
              <li className="hover:text-green-400 cursor-pointer" onClick={() => navigate("/vet-program")}>For Veterinarians</li>
              <li className="hover:text-green-400 cursor-pointer">For Breeders</li>
              <li className="hover:text-green-400 cursor-pointer">Careers</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Contact</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex items-center gap-2"><Mail size={16} /> support@genepaw.com</li>
              <li className="flex items-center gap-2"><Phone size={16} /> +91 80 4567 8900</li>
              <li className="flex items-start gap-2 break-words"><MapPin size={16} className="mt-0.5 shrink-0" /> GenePaw Genomics Pvt. Ltd., Koramangala, Bangalore – 560034, Karnataka, India</li>
              <li className="flex items-center gap-2"><Globe size={16} /> www.genepaw.com</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-8 flex flex-wrap items-center justify-between gap-4">
          <div className="text-sm text-gray-500">&copy; 2026 GenePaw Genomics Pvt. Ltd. All rights reserved.</div>
          <div className="flex flex-wrap gap-6 text-sm text-gray-500">
            <span className="hover:text-gray-300 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-gray-300 cursor-pointer">Terms of Service</span>
            <span className="hover:text-gray-300 cursor-pointer">Cookie Policy</span>
            <button type="button" className="hover:text-gray-300 cursor-pointer bg-transparent border-0 p-0 text-sm text-gray-500" onClick={() => navigate("/vet-program")}>For Veterinarians</button>
            <button type="button" className="text-gray-600 hover:text-gray-400 cursor-pointer bg-transparent border-0 p-0 text-sm" onClick={() => navigate("/staff-login")}>Staff Login</button>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── Default Pricing Plans ───
export const DEFAULT_PRICING = [
  { name: "Breed ID", price: 7999, features: ["Breed composition analysis", "Ancestry visualization", "Breed-specific traits", "Digital certificate"], color: "#3B82F6" },
  { name: "Health + Breed", price: 15999, features: ["Everything in Breed ID", "200+ health markers", "Carrier status", "Vet report PDF", "Nutrition profile"], color: "#1B6B4A", popular: true },
  { name: "Complete Genome", price: 27999, features: ["Everything in Health + Breed", "Behavior gene analysis", "Relative finder access", "Raw data download", "Lifetime updates"], color: "#F59E0B" },
];
