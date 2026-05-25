import { useParams, useNavigate } from "react-router";
import { ArrowLeft, ArrowRight, Dna, AlertTriangle, BookOpen, Globe2, Activity, Tag } from "lucide-react";
import { COLORS, Navbar, Footer } from "./shared.jsx";
import { MARKER_CATEGORIES } from "./AdminPortal.jsx";
import { useApp } from "./AppContext.jsx";

const RISK_STYLE = {
  Low:    { pill: "bg-green-100 text-green-700",  dot: "#22c55e", label: "Low Risk" },
  Medium: { pill: "bg-amber-100 text-amber-700",  dot: "#f59e0b", label: "Medium Risk" },
  High:   { pill: "bg-red-100 text-red-700",      dot: "#ef4444", label: "High Risk" },
};

export default function MarkerArticle() {
  const { categoryId, markerIdx } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useApp();

  const category = MARKER_CATEGORIES.find((c) => c.id === categoryId);
  const idx = parseInt(markerIdx, 10);
  const marker = category?.markers[idx];

  if (!category || !marker || isNaN(idx)) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: COLORS.bg }}>
        <div className="text-center">
          <div className="text-4xl font-bold text-gray-300 mb-2">404</div>
          <div className="text-gray-500 text-sm mb-4">Marker not found.</div>
          <button onClick={() => navigate(-1)} className="text-sm underline cursor-pointer" style={{ color: COLORS.primary }}>Go back</button>
        </div>
      </div>
    );
  }

  const rs = RISK_STYLE[marker.risk] ?? RISK_STYLE.Low;
  const species = marker.species.split(",").map((s) => s.trim()).filter(Boolean);
  const prev = idx > 0 ? { marker: category.markers[idx - 1], idx: idx - 1 } : null;
  const next = idx < category.markers.length - 1 ? { marker: category.markers[idx + 1], idx: idx + 1 } : null;

  return (
    <div className="min-h-screen" style={{ backgroundColor: COLORS.bg, color: COLORS.text }}>
      <Navbar user={user} onLogout={logout} />

      <div className="max-w-3xl mx-auto px-6 pt-28 pb-20">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm text-gray-400 mb-8 flex-wrap">
          <button onClick={() => navigate("/")} className="hover:text-gray-600 cursor-pointer transition-colors">Home</button>
          <span>/</span>
          <button onClick={() => navigate("/admin", { state: { tab: "markers" } })} className="hover:text-gray-600 cursor-pointer transition-colors">Markers</button>
          <span>/</span>
          <span className="font-semibold" style={{ color: category.color }}>{category.name}</span>
          <span>/</span>
          <span className="text-gray-600 font-medium">{marker.name}</span>
        </nav>

        {/* Header */}
        <header className="mb-10">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="text-xs font-bold px-2.5 py-1 rounded-full text-white" style={{ backgroundColor: category.color }}>
              {category.name}
            </span>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${rs.pill}`}>
              {rs.label}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2 leading-tight">{marker.name}</h1>
          <p className="text-lg font-mono text-gray-400 tracking-wide">{marker.gene}</p>
        </header>

        {/* At a glance */}
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Dna size={15} style={{ color: COLORS.primary }} />
              <span className="text-[10px] uppercase font-semibold tracking-widest text-gray-400">Gene Symbol</span>
            </div>
            <div className="font-mono font-bold text-gray-900 text-sm">{marker.gene}</div>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Activity size={15} style={{ color: COLORS.primary }} />
              <span className="text-[10px] uppercase font-semibold tracking-widest text-gray-400">Risk Level</span>
            </div>
            <div className={`font-bold text-sm ${rs.pill.split(" ")[1]}`}>{marker.risk}</div>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Globe2 size={15} style={{ color: COLORS.primary }} />
              <span className="text-[10px] uppercase font-semibold tracking-widest text-gray-400">Species</span>
            </div>
            <div className="font-bold text-gray-900 text-sm">{species.length} species</div>
          </div>
        </div>

        {/* About this gene */}
        <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-5">
          <h2 className="flex items-center gap-2 text-base font-bold text-gray-900 mb-3">
            <BookOpen size={18} style={{ color: COLORS.primary }} /> About this Gene
          </h2>
          <p className="text-gray-600 leading-relaxed text-sm">{marker.description}</p>
        </section>

        {/* Clinical significance */}
        <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-5">
          <h2 className="flex items-center gap-2 text-base font-bold text-gray-900 mb-3">
            <AlertTriangle size={18} style={{ color: rs.dot }} /> Clinical Significance
          </h2>
          <p className="text-gray-600 leading-relaxed text-sm">{marker.significance}</p>
        </section>

        {/* Affected species */}
        <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-10">
          <h2 className="flex items-center gap-2 text-base font-bold text-gray-900 mb-3">
            <Tag size={18} style={{ color: COLORS.primary }} /> Affected Species
          </h2>
          <div className="flex flex-wrap gap-2">
            {species.map((s, i) => (
              <span key={i} className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-600 font-medium italic">{s}</span>
            ))}
          </div>
        </section>

        {/* Prev / next */}
        <div className="flex items-center justify-between border-t border-gray-200 pt-6">
          {prev ? (
            <button
              onClick={() => navigate(`/markers/${categoryId}/${prev.idx}`)}
              className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-800 cursor-pointer group"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
              <div className="text-left">
                <div className="text-[10px] uppercase tracking-widest text-gray-400 mb-0.5">Previous</div>
                <div className="font-medium text-gray-700 max-w-[180px] truncate">{prev.marker.name}</div>
              </div>
            </button>
          ) : <div />}
          {next ? (
            <button
              onClick={() => navigate(`/markers/${categoryId}/${next.idx}`)}
              className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-800 cursor-pointer group text-right"
            >
              <div>
                <div className="text-[10px] uppercase tracking-widest text-gray-400 mb-0.5">Next</div>
                <div className="font-medium text-gray-700 max-w-[180px] truncate">{next.marker.name}</div>
              </div>
              <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          ) : <div />}
        </div>

      </div>
      <Footer />
    </div>
  );
}
