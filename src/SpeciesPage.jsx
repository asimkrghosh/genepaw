import { useParams, useNavigate } from "react-router";
import { ArrowLeft, Dna, Activity, Globe2 } from "lucide-react";
import { COLORS, Navbar, Footer, Badge } from "./shared.jsx";
import { useApp } from "./AppContext.jsx";
import { SPECIES_DATA } from "./CustomerPortal.jsx";

const RISK_STYLE = {
  Low:    { pill: "bg-green-100 text-green-700" },
  Medium: { pill: "bg-amber-100 text-amber-700" },
  High:   { pill: "bg-red-100 text-red-700" },
};

export default function SpeciesPage() {
  const { speciesName } = useParams();
  const navigate = useNavigate();
  const { user, logout, categories } = useApp();

  const decoded = decodeURIComponent(speciesName);

  // Find matching species info for the header
  const speciesInfo = SPECIES_DATA.find((s) =>
    s.variants.some((v) => v.toLowerCase() === decoded.toLowerCase())
  );

  // Collect all markers that include this species (case-insensitive)
  const results = [];
  for (const cat of categories) {
    for (let idx = 0; idx < cat.markers.length; idx++) {
      const m = cat.markers[idx];
      const speciesList = m.species.split(",").map((s) => s.trim());
      if (speciesList.some((s) => s.toLowerCase() === decoded.toLowerCase())) {
        results.push({ cat, marker: m, idx });
      }
    }
  }

  // Group by category
  const grouped = categories
    .map((cat) => ({
      cat,
      markers: results.filter((r) => r.cat.id === cat.id),
    }))
    .filter((g) => g.markers.length > 0);

  return (
    <div className="min-h-screen" style={{ backgroundColor: COLORS.bg, color: COLORS.text }}>
      <Navbar user={user} onLogout={logout} />

      <div className="max-w-4xl mx-auto px-6 pt-28 pb-20">

        {/* Back */}
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-700 cursor-pointer mb-8 transition-colors">
          <ArrowLeft size={16} /> Back
        </button>

        {/* Header */}
        <div className="flex items-center gap-4 mb-3">
          {speciesInfo && (
            <span className="text-5xl">{speciesInfo.icon}</span>
          )}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: COLORS.primary }}>Affected Species</p>
            <h1 className="text-3xl font-bold text-gray-900 italic">{decoded}</h1>
            {speciesInfo && (
              <p className="text-sm text-gray-500 mt-1 not-italic">{speciesInfo.description}</p>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-6 mb-10 mt-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Dna size={16} style={{ color: COLORS.primary }} />
            <span><strong className="text-gray-900">{results.length}</strong> markers</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Globe2 size={16} style={{ color: COLORS.primary }} />
            <span><strong className="text-gray-900">{grouped.length}</strong> categories</span>
          </div>
        </div>

        {results.length === 0 ? (
          <div className="text-center py-20 text-gray-400 text-sm">No markers found for this species.</div>
        ) : (
          <div className="space-y-6">
            {grouped.map(({ cat, markers }) => (
              <div key={cat.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Category header */}
                <div className="flex items-center gap-3 px-6 py-4" style={{ backgroundColor: `${cat.color}12` }}>
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                  <h2 className="font-bold text-gray-900 flex-1">{cat.name}</h2>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full text-white" style={{ backgroundColor: cat.color }}>
                    {markers.length} marker{markers.length !== 1 ? "s" : ""}
                  </span>
                </div>

                {/* Marker rows */}
                <div className="divide-y divide-gray-50">
                  {markers.map(({ marker, idx }) => {
                    const rs = RISK_STYLE[marker.risk] ?? RISK_STYLE.Low;
                    return (
                      <button
                        key={idx}
                        onClick={() => navigate(`/markers/${cat.id}/${idx}`)}
                        className="w-full text-left px-6 py-4 hover:bg-gray-50 transition-colors group"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <span className="font-semibold text-gray-900 group-hover:text-green-700 transition-colors">{marker.name}</span>
                              <span className="text-xs font-mono text-gray-400">{marker.gene}</span>
                            </div>
                            {marker.description && (
                              <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{marker.description}</p>
                            )}
                          </div>
                          <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full shrink-0 ${rs.pill}`}>{marker.risk}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
