import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { ArrowLeft, ArrowRight, Dna, AlertTriangle, BookOpen, Globe2, Activity, Tag, ExternalLink, Pencil, Check, X } from "lucide-react";
import { COLORS, Navbar, Footer } from "./shared.jsx";
import { RISK_LEVELS } from "./markerData.js";
import SpeciesSelect from "./SpeciesSelect.jsx";
import { useApp } from "./AppContext.jsx";

const RISK_STYLE = {
  Low:    { pill: "bg-green-100 text-green-700",  dot: "#22c55e", label: "Low Risk" },
  Medium: { pill: "bg-amber-100 text-amber-700",  dot: "#f59e0b", label: "Medium Risk" },
  High:   { pill: "bg-red-100 text-red-700",      dot: "#ef4444", label: "High Risk" },
};

const BLANK_MARKER = { name: "", gene: "", risk: "Low", species: "", significance: "", description: "" };

export default function MarkerArticle() {
  const { categoryId, markerIdx } = useParams();
  const navigate = useNavigate();
  const { user, logout, articles, updateArticle, categories, updateMarker } = useApp();

  const [editingArticle, setEditingArticle] = useState(false);
  const [articleDraft, setArticleDraft] = useState({ article: "", doi: "" });
  const [editingMarker, setEditingMarker] = useState(false);
  const [markerDraft, setMarkerDraft] = useState(BLANK_MARKER);
  const [saved, setSaved] = useState("");

  const category = categories.find((c) => c.id === categoryId);
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
  const ref = articles[marker.gene] ?? null;
  const isStaff = user?.role === "staff";

  const flash = (msg) => { setSaved(msg); setTimeout(() => setSaved(""), 2000); };

  const startEditArticle = () => {
    setArticleDraft({ article: ref?.article ?? "", doi: ref?.doi ?? "" });
    setEditingArticle(true);
  };
  const saveArticle = () => {
    updateArticle(marker.gene, { article: articleDraft.article.trim(), doi: articleDraft.doi.trim() });
    setEditingArticle(false);
    flash("Article saved.");
  };

  const startEditMarker = () => {
    setMarkerDraft({ name: marker.name, gene: marker.gene, risk: marker.risk, species: marker.species, significance: marker.significance, description: marker.description });
    setEditingMarker(true);
  };
  const saveMarker = () => {
    updateMarker(categoryId, idx, markerDraft);
    setEditingMarker(false);
    flash("Marker details saved.");
  };

  const inputClass = "w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100";
  const labelClass = "text-xs font-semibold text-gray-500 block mb-1";

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

        {/* Saved flash */}
        {saved && (
          <div className="mb-6 flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
            <Check size={16} /> {saved}
          </div>
        )}

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

        {/* Marker Details */}
        <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="flex items-center gap-2 text-base font-bold text-gray-900">
              <BookOpen size={18} style={{ color: COLORS.primary }} /> Marker Details
            </h2>
            {isStaff && !editingMarker && (
              <button onClick={startEditMarker} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-500 hover:text-green-700 hover:bg-green-50 cursor-pointer transition-colors">
                <Pencil size={13} /> Edit
              </button>
            )}
          </div>

          {editingMarker ? (
            <div className="space-y-3">
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Marker Name</label>
                  <input value={markerDraft.name} onChange={(e) => setMarkerDraft({ ...markerDraft, name: e.target.value })} className={inputClass} placeholder="Full marker name" autoFocus />
                </div>
                <div>
                  <label className={labelClass}>Gene Symbol</label>
                  <input value={markerDraft.gene} onChange={(e) => setMarkerDraft({ ...markerDraft, gene: e.target.value })} className={inputClass} placeholder="e.g. AVPR1A" />
                </div>
                <div>
                  <label className={labelClass}>Risk Level</label>
                  <select value={markerDraft.risk} onChange={(e) => setMarkerDraft({ ...markerDraft, risk: e.target.value })} className={inputClass}>
                    {RISK_LEVELS.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Affected Species</label>
                  <SpeciesSelect value={markerDraft.species} onChange={(v) => setMarkerDraft({ ...markerDraft, species: v })} />
                </div>
              </div>
              <div>
                <label className={labelClass}>Clinical Significance</label>
                <textarea value={markerDraft.significance} onChange={(e) => setMarkerDraft({ ...markerDraft, significance: e.target.value })} rows={3} className={inputClass + " resize-none"} placeholder="Clinical significance specific to this marker…" />
              </div>
              <div>
                <label className={labelClass}>Description</label>
                <textarea value={markerDraft.description} onChange={(e) => setMarkerDraft({ ...markerDraft, description: e.target.value })} rows={3} className={inputClass + " resize-none"} placeholder="Gene description" />
              </div>
              <div className="flex items-center gap-2 pt-1">
                <button onClick={saveMarker} className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-green-600 text-white text-xs font-semibold hover:bg-green-700 cursor-pointer transition-colors">
                  <Check size={13} /> Save
                </button>
                <button onClick={() => setEditingMarker(false)} className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-gray-100 text-gray-600 text-xs font-semibold hover:bg-gray-200 cursor-pointer transition-colors">
                  <X size={13} /> Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-[10px] uppercase font-semibold text-gray-400 mb-0.5">Gene Symbol</div>
                  <div className="font-mono text-gray-800">{marker.gene}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-semibold text-gray-400 mb-0.5">Risk Level</div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${rs.pill}`}>{marker.risk}</span>
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase font-semibold text-gray-400 mb-0.5">Clinical Significance</div>
                <p className="text-gray-600 text-sm leading-relaxed">{marker.significance}</p>
              </div>
              <div>
                <div className="text-[10px] uppercase font-semibold text-gray-400 mb-0.5">Description</div>
                <p className="text-gray-600 text-sm leading-relaxed">{marker.description}</p>
              </div>
            </div>
          )}
        </section>

        {/* Published Article */}
        <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-5">
          <h2 className="flex items-center gap-2 text-base font-bold text-gray-900 mb-3">
            <ExternalLink size={18} style={{ color: COLORS.primary }} /> Published Article
          </h2>
          {ref?.article ? (
            <div>
              <p className="text-gray-700 leading-relaxed text-sm mb-3">{ref.article}</p>
              {ref.doi && (
                <a href={`https://doi.org/${ref.doi}`} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors hover:bg-green-50"
                  style={{ color: COLORS.primary, borderColor: COLORS.primary + "40" }}>
                  <ExternalLink size={12} /> DOI: {ref.doi}
                </a>
              )}
            </div>
          ) : (
            <p className="text-gray-400 text-sm italic">No published article on record.</p>
          )}
        </section>

        {/* Affected species */}
        <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-10">
          <h2 className="flex items-center gap-2 text-base font-bold text-gray-900 mb-3">
            <Tag size={18} style={{ color: COLORS.primary }} /> Affected Species
          </h2>
          <div className="flex flex-wrap gap-2">
            {species.map((s, i) => (
              <button key={i} onClick={() => navigate(`/species/${encodeURIComponent(s)}`)}
                className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-600 font-medium italic hover:bg-green-100 hover:text-green-700 cursor-pointer transition-colors">
                {s}
              </button>
            ))}
          </div>
        </section>

        {/* Prev / next */}
        <div className="flex items-center justify-between border-t border-gray-200 pt-6">
          {prev ? (
            <button onClick={() => navigate(`/markers/${categoryId}/${prev.idx}`)} className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-800 cursor-pointer group">
              <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
              <div className="text-left">
                <div className="text-[10px] uppercase tracking-widest text-gray-400 mb-0.5">Previous</div>
                <div className="font-medium text-gray-700 max-w-[180px] truncate">{prev.marker.name}</div>
              </div>
            </button>
          ) : <div />}
          {next ? (
            <button onClick={() => navigate(`/markers/${categoryId}/${next.idx}`)} className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-800 cursor-pointer group text-right">
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
