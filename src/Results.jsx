import { useState, useRef } from "react";
import { Download, Heart, GitBranch, Activity, TreePine } from "lucide-react";
import {
  PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";
import { useParams, useSearchParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { COLORS, Button, Navbar, Footer } from "./shared.jsx";
import { generateConsumerPDF } from "./reportPdf.js";
import { useApp } from "./AppContext.jsx";
import { apiFetch } from "./api.js";

// ─── Constants ───

const BREED_COLORS = ["#1B6B4A", "#F59E0B", "#3B82F6", "#EF4444", "#8B5CF6", "#EC4899", "#14B8A6", "#F97316"];

const SAMPLE_RESULTS = {
  breed_composition: [
    { species: "Golden Retriever", percentage: 42 },
    { species: "Labrador", percentage: 28 },
    { species: "Poodle", percentage: 15 },
    { species: "German Shepherd", percentage: 10 },
    { species: "Unknown / Mixed", percentage: 5 },
  ],
  health_markers: [
    { marker: "MDR1", status: "amber", description: "Drug Sensitivity — carrier. Discuss with your vet before administering certain medications." },
    { marker: "PRA-prcd", status: "green", description: "Progressive Retinal Atrophy — clear. No copies of the variant detected." },
    { marker: "DM (SOD1)", status: "green", description: "Degenerative Myelopathy — clear." },
    { marker: "vWD Type 1", status: "red", description: "Von Willebrand Disease — at risk. Two copies detected. Recommend veterinary consultation." },
    { marker: "EIC", status: "amber", description: "Exercise-Induced Collapse — carrier." },
  ],
  trait_scores: {
    Trainability: 92,
    "Energy Level": 85,
    Sociability: 88,
    "Prey Drive": 45,
    "Anxiety Tendency": 30,
    Aggression: 15,
  },
  lineage: {
    paternal_line: "German Shepherd (Northern European Working Line)",
    maternal_line: "Golden Retriever / Labrador Cross (UK Sporting Line)",
  },
};

const TAB_ORDER = ["breed", "health", "traits", "lineage"];

const TABS = [
  { id: "breed", label: "Breed", icon: GitBranch },
  { id: "health", label: "Health", icon: Heart },
  { id: "traits", label: "Traits", icon: Activity },
  { id: "lineage", label: "Lineage", icon: TreePine },
];

const HEALTH_CLASSES = {
  green: "bg-green-100 text-green-800",
  amber: "bg-amber-100 text-amber-800",
  red: "bg-red-100 text-red-800",
};

// ─── Tab Components ───

function BreedTab({ result_data }) {
  const breedData = (result_data.breed_composition ?? []).map(b => ({ name: b.species, value: b.percentage }));
  return (
    <div className="grid lg:grid-cols-2 gap-8">
      <div>
        <h4 className="text-lg font-bold text-gray-900 mb-4">Breed Composition</h4>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsPie>
              <Pie
                data={breedData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                innerRadius={50}
                dataKey="value"
                label={({ name, value }) => `${name} ${value}%`}
                labelLine={true}
                isAnimationActive={true}
                animationBegin={0}
                animationDuration={1200}
              >
                {breedData.map((_, i) => (
                  <Cell key={i} fill={BREED_COLORS[i % BREED_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </RechartsPie>
          </ResponsiveContainer>
        </div>
      </div>
      <div>
        <h4 className="text-lg font-bold text-gray-900 mb-4">Ancestry Breakdown</h4>
        <div className="space-y-4">
          {breedData.map((b, i) => (
            <div key={b.name}>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-gray-700">{b.name}</span>
                <span className="font-bold" style={{ color: BREED_COLORS[i % BREED_COLORS.length] }}>{b.value}%</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{ width: `${b.value}%`, backgroundColor: BREED_COLORS[i % BREED_COLORS.length] }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function HealthTab({ result_data }) {
  return (
    <div>
      <h4 className="text-lg font-bold text-gray-900 mb-6">Health Markers</h4>
      <div className="grid gap-3">
        {(result_data.health_markers ?? []).map((m) => (
          <div key={m.marker} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-gray-200 transition-all">
            <div className="flex-1">
              <p className="text-gray-800">{m.description}</p>
              <p className="text-xs text-gray-400 mt-1">Gene: {m.marker}</p>
            </div>
            <div className="ml-4 shrink-0">
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${HEALTH_CLASSES[m.status] ?? "bg-gray-100 text-gray-800"}`}>
                {String(m.status ?? "").charAt(0).toUpperCase() + String(m.status ?? "").slice(1)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TraitsTab({ result_data }) {
  const traitData = Object.entries(result_data.trait_scores ?? {}).map(([name, score]) => ({ name, score }));
  return (
    <div>
      <h4 className="text-lg font-bold text-gray-900 mb-4">Behavioral Trait Scores</h4>
      <ResponsiveContainer width="100%" height={Math.max(200, traitData.length * 48)}>
        <BarChart data={traitData} layout="vertical" margin={{ left: 20, right: 40, top: 8, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
          <YAxis type="category" dataKey="name" width={130} tick={{ fontSize: 12 }} />
          <Tooltip formatter={(v) => [`${v}/100`]} />
          <Bar dataKey="score" fill={COLORS.primary} radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function LineageTab({ result_data }) {
  const { paternal_line, maternal_line } = result_data.lineage ?? {};
  return (
    <div>
      <h4 className="text-lg font-bold text-gray-900 mb-6">Genetic Lineage</h4>
      <div className="grid sm:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl border border-gray-100 bg-blue-50">
          <p className="text-xs font-semibold text-blue-500 uppercase tracking-wider mb-2">Paternal Line</p>
          <p className="text-lg font-semibold text-gray-900">{paternal_line}</p>
        </div>
        <div className="p-6 rounded-2xl border border-gray-100 bg-purple-50">
          <p className="text-xs font-semibold text-purple-500 uppercase tracking-wider mb-2">Maternal Line</p>
          <p className="text-lg font-semibold text-gray-900">{maternal_line}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Results Dashboard ───

function ResultsDashboard({ result_data, orderId }) {
  const [activeTab, setActiveTab] = useState("breed");
  const touchStartX = useRef(null);

  const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    const currentIdx = TAB_ORDER.indexOf(activeTab);
    if (delta < -50 && currentIdx < TAB_ORDER.length - 1) setActiveTab(TAB_ORDER[currentIdx + 1]);
    else if (delta > 50 && currentIdx > 0) setActiveTab(TAB_ORDER[currentIdx - 1]);
    touchStartX.current = null;
  };

  return (
    <section className="py-24" style={{ backgroundColor: COLORS.bg }}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
          {/* Header */}
          <div className="p-6 sm:p-8" style={{ background: `linear-gradient(135deg, ${COLORS.gradientStart}, ${COLORS.gradientEnd})` }}>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-3xl">🐾</div>
                <div>
                  <h3 className="text-2xl font-bold text-white">
                    {orderId ? "Your Genomic Report" : "Sample Genomic Report"}
                  </h3>
                  {orderId && <p className="text-green-200 text-sm mt-1">Order ID: {orderId}</p>}
                  {!orderId && <p className="text-green-200 text-sm mt-1">Demo — order a kit to see your pet's results</p>}
                </div>
              </div>
              <Button size="sm" variant="secondary" onClick={() => generateConsumerPDF(result_data, orderId)}>
                <Download size={16} /> Download PDF Report
              </Button>
            </div>
          </div>

          {/* Tab Bar */}
          <div className="border-b border-gray-100 px-6 sm:px-8 overflow-x-auto">
            <div className="flex gap-1 min-w-max">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`flex items-center gap-2 px-4 py-4 text-sm font-medium border-b-2 transition-all cursor-pointer whitespace-nowrap min-h-[44px] ${
                    activeTab === t.id ? "border-green-600 text-green-700" : "border-transparent text-gray-400 hover:text-gray-600"
                  }`}
                >
                  <t.icon size={16} /> {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content — only active tab mounted in DOM (NFR8) */}
          <div className="p-6 sm:p-8" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
            {activeTab === "breed" && <BreedTab result_data={result_data} />}
            {activeTab === "health" && <HealthTab result_data={result_data} />}
            {activeTab === "traits" && <TraitsTab result_data={result_data} />}
            {activeTab === "lineage" && <LineageTab result_data={result_data} />}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Page ───

export default function ResultsPage() {
  const { user, logout } = useApp();
  const { orderId } = useParams();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const { data, isPending, isError, error } = useQuery({
    queryKey: ["results", orderId, token],
    queryFn: () => apiFetch(`/api/v1/orders/${orderId}/results${token ? `?token=${encodeURIComponent(token)}` : ""}`),
    enabled: !!orderId,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  return (
    <div className="min-h-screen" style={{ backgroundColor: COLORS.bg, color: COLORS.text }}>
      <Navbar currentPage="results" user={user} onLogout={logout} />
      <div className="pt-20">
        {/* Demo mode: no orderId in URL */}
        {!orderId && <ResultsDashboard result_data={SAMPLE_RESULTS} orderId={null} />}

        {/* API mode: orderId present */}
        {orderId && isPending && (
          <div className="flex items-center justify-center py-32">
            <div className="text-gray-400 text-sm">Loading your results…</div>
          </div>
        )}
        {orderId && isError && error?.status === 404 && (
          <div className="max-w-lg mx-auto px-6 py-32 text-center">
            <p className="text-xl font-semibold text-gray-800 mb-2">Your results are being processed.</p>
            <p className="text-gray-500 mb-6">Check back soon.</p>
            <a
              href={`/track/${orderId}${token ? `?token=${encodeURIComponent(token)}` : ""}`}
              className="text-green-700 underline text-sm hover:text-green-800"
            >
              ← Back to tracking page
            </a>
          </div>
        )}
        {orderId && isError && error?.status !== 404 && (
          <div className="max-w-lg mx-auto px-6 py-32 text-center">
            <p className="text-red-600 font-semibold">{error?.message ?? "An error occurred loading your results."}</p>
          </div>
        )}
        {orderId && !isPending && !isError && data?.result_data && (
          <ResultsDashboard result_data={data.result_data} orderId={orderId} />
        )}
      </div>
      <Footer />
    </div>
  );
}
