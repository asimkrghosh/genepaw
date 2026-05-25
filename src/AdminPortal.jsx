import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { Search, ChevronDown, Plus, Check, ArrowRight, ArrowLeft, Clock, Truck, FlaskConical, BarChart3, Heart, Dna, Brain, Apple, Users, Microscope, Activity, AlertTriangle, Dog, GitBranch, Eye, Pencil, Upload, Trash2, ClipboardList, FileUp, Save, ToggleLeft, ToggleRight, X, PackageCheck, RefreshCw, BookOpen, ExternalLink } from "lucide-react";
import { COLORS, SectionTitle, Badge, Navbar, Footer, DEFAULT_PRICING } from "./shared.jsx";
import { SPECIES_DATA, STEP_TEMPLATES } from "./CustomerPortal.jsx";
import { useApp } from "./AppContext.jsx";
import { RISK_LEVELS, SIGNIFICANCE_OPTIONS } from "./markerData.js";
import SpeciesSelect from "./SpeciesSelect.jsx";
export { makeMarker, MARKER_CATEGORIES } from "./markerData.js";

const SPECIES_ICONS = Object.fromEntries(SPECIES_DATA.map(s => [s.name, s.icon]));

function UploadReport() {
  const { kits, uploadReport } = useApp();
  const [kitId, setKitId] = useState("");
  const [petName, setPetName] = useState("");
  const [species, setSpecies] = useState("Dog");
  const [plan, setPlan] = useState("Health + Breed");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [activeSection, setActiveSection] = useState("info");

  // Breed composition entries
  const [breeds, setBreeds] = useState([{ name: "", value: "" }]);
  // Health markers
  const [healthMarkers, setHealthMarkers] = useState([{ gene: "", condition: "", status: "clear", risk: "low" }]);
  // Behavior traits
  const [behaviorTraits, setBehaviorTraits] = useState([{ trait: "", score: "", avg: "" }]);
  // Nutrition profile
  const [nutrition, setNutrition] = useState({ calories: "", protein: "", fat: "", fiber: "", supplements: "", avoid: "", sensitivities: "" });
  // Relatives
  const [relatives, setRelatives] = useState([{ name: "", relation: "", match: "", location: "", owner: "" }]);

  const sections = [
    { id: "info", label: "Kit Info", icon: ClipboardList },
    { id: "breed", label: "Breed Composition", icon: GitBranch },
    { id: "health", label: "Health Markers", icon: Heart },
    { id: "behavior", label: "Behavior Traits", icon: Brain },
    { id: "nutrition", label: "Nutrition Profile", icon: Apple },
    { id: "relatives", label: "Relatives", icon: Users },
  ];

  const addBreed = () => setBreeds([...breeds, { name: "", value: "" }]);
  const removeBreed = (i) => setBreeds(breeds.filter((_, idx) => idx !== i));
  const updateBreed = (i, field, val) => setBreeds(breeds.map((b, idx) => idx === i ? { ...b, [field]: val } : b));

  const addHealth = () => setHealthMarkers([...healthMarkers, { gene: "", condition: "", status: "clear", risk: "low" }]);
  const removeHealth = (i) => setHealthMarkers(healthMarkers.filter((_, idx) => idx !== i));
  const updateHealth = (i, field, val) => setHealthMarkers(healthMarkers.map((h, idx) => idx === i ? { ...h, [field]: val } : h));

  const addBehavior = () => setBehaviorTraits([...behaviorTraits, { trait: "", score: "", avg: "" }]);
  const removeBehavior = (i) => setBehaviorTraits(behaviorTraits.filter((_, idx) => idx !== i));
  const updateBehavior = (i, field, val) => setBehaviorTraits(behaviorTraits.map((b, idx) => idx === i ? { ...b, [field]: val } : b));

  const addRelative = () => setRelatives([...relatives, { name: "", relation: "", match: "", location: "", owner: "" }]);
  const removeRelative = (i) => setRelatives(relatives.filter((_, idx) => idx !== i));
  const updateRelative = (i, field, val) => setRelatives(relatives.map((r, idx) => idx === i ? { ...r, [field]: val } : r));

  const handleSubmit = () => {
    setError("");
    if (!kitId.trim()) { setError("Kit Tracking ID is required."); setActiveSection("info"); return; }
    if (!petName.trim()) { setError("Pet name is required."); setActiveSection("info"); return; }
    const validBreeds = breeds.filter(b => b.name && b.value);
    if (validBreeds.length === 0) { setError("At least one breed entry is required."); setActiveSection("breed"); return; }
    const breedTotal = validBreeds.reduce((sum, b) => sum + Number(b.value), 0);
    if (breedTotal !== 100) { setError(`Breed percentages must total 100% (currently ${breedTotal}%).`); setActiveSection("breed"); return; }

    const today = new Date();
    const formatDate = (d) => d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    const orderDate = new Date(today); orderDate.setDate(orderDate.getDate() - 21);
    const shipDate = new Date(orderDate); shipDate.setDate(shipDate.getDate() + 1);
    const receiveDate = new Date(shipDate); receiveDate.setDate(shipDate.getDate() + 5);
    const seqDate = new Date(receiveDate); seqDate.setDate(receiveDate.getDate() + 5);
    const analysisDate = new Date(seqDate); analysisDate.setDate(seqDate.getDate() + 5);
    const resultsDate = formatDate(today);

    const reportData = {
      petName: petName.trim(),
      icon: SPECIES_ICONS[species] || "🧬",
      species,
      plan,
      orderDate: formatDate(orderDate),
      status: "completed",
      steps: [
        { id: 1, label: "Kit Ordered", icon: PackageCheck, date: formatDate(orderDate), done: true },
        { id: 2, label: "Kit Shipped", icon: Truck, date: formatDate(shipDate), done: true },
        { id: 3, label: "Sample Received", icon: FlaskConical, date: formatDate(receiveDate), done: true },
        { id: 4, label: "Sequencing", icon: Dna, date: formatDate(seqDate), done: true },
        { id: 5, label: "Analysis", icon: Microscope, date: formatDate(analysisDate), done: true },
        { id: 6, label: "Results Ready", icon: BarChart3, date: resultsDate, done: true },
      ],
      progress: 100,
      results: {
        breedComposition: validBreeds.map(b => ({ name: b.name, value: Number(b.value) })),
        healthMarkers: healthMarkers.filter(h => h.gene && h.condition).map(h => ({ gene: h.gene, condition: h.condition, status: h.status, risk: h.risk })),
        behaviorTraits: behaviorTraits.filter(b => b.trait && b.score).map(b => ({ trait: b.trait, score: Number(b.score), avg: Number(b.avg) || 50 })),
        nutritionProfile: {
          calories: nutrition.calories || "Not specified",
          protein: nutrition.protein || "Not specified",
          fat: nutrition.fat || "Not specified",
          fiber: nutrition.fiber || "Not specified",
          supplements: nutrition.supplements ? nutrition.supplements.split(",").map(s => s.trim()) : [],
          avoid: nutrition.avoid ? nutrition.avoid.split(",").map(s => s.trim()) : [],
          sensitivities: nutrition.sensitivities ? nutrition.sensitivities.split(",").map(s => s.trim()) : [],
        },
        relatives: relatives.filter(r => r.name && r.relation).map(r => ({ name: r.name, relation: r.relation, match: Number(r.match) || 0, location: r.location, owner: r.owner })),
      },
    };

    uploadReport(kitId.trim(), reportData);
    setSubmitted(true);
  };

  const inputClass = "w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100";
  const labelClass = "text-xs font-semibold text-gray-600 block mb-1";

  if (submitted) {
    return (
      <section className="py-24 bg-white">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: "#8B5CF615" }}>
            <Check size={40} style={{ color: "#8B5CF6" }} />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Report Uploaded Successfully!</h2>
          <p className="text-gray-500 mb-2">Kit ID: <span className="font-mono font-bold text-purple-600">{kitId}</span></p>
          <p className="text-gray-500 mb-8">The customer can now view their report by tracking this ID.</p>
          <div className="flex gap-3 justify-center">
            <Button variant="secondary" onClick={() => { setSubmitted(false); setKitId(""); setPetName(""); setBreeds([{ name: "", value: "" }]); setHealthMarkers([{ gene: "", condition: "", status: "clear", risk: "low" }]); setBehaviorTraits([{ trait: "", score: "", avg: "" }]); setNutrition({ calories: "", protein: "", fat: "", fiber: "", supplements: "", avoid: "", sensitivities: "" }); setRelatives([{ name: "", relation: "", match: "", location: "", owner: "" }]); setActiveSection("info"); }}>
              <FileUp size={18} /> Upload Another Report
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 bg-white">
      <div className="max-w-5xl mx-auto px-6">
        <SectionTitle subtitle="Admin Panel" title="Upload Genomic Report" description="Enter analysis results for a customer's kit. The report will be immediately available via their tracking ID." />

        {error && (
          <div className="max-w-3xl mx-auto mb-6 p-4 rounded-xl bg-red-50 text-red-600 text-sm flex items-start gap-2">
            <AlertTriangle size={18} className="mt-0.5 shrink-0" /> {error}
          </div>
        )}

        {/* Section tabs */}
        <div className="max-w-3xl mx-auto mb-8">
          <div className="flex flex-wrap gap-2 justify-center">
            {sections.map((s) => {
              const Icon = s.icon;
              return (
                <button key={s.id} onClick={() => setActiveSection(s.id)} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium cursor-pointer transition-all ${activeSection === s.id ? "bg-purple-100 text-purple-800 shadow-sm" : "bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-700"}`}>
                  <Icon size={16} /> {s.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="max-w-3xl mx-auto">
          {/* Kit Info */}
          {activeSection === "info" && (
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2"><ClipboardList size={20} style={{ color: "#8B5CF6" }} /> Kit Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Kit Tracking ID *</label>
                  <input value={kitId} onChange={(e) => setKitId(e.target.value)} placeholder="GP-2026-XXXXXXX" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Pet Name *</label>
                  <input value={petName} onChange={(e) => setPetName(e.target.value)} placeholder="e.g., Bella" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Species</label>
                  <select value={species} onChange={(e) => setSpecies(e.target.value)} className={inputClass}>
                    {Object.keys(SPECIES_ICONS).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Plan</label>
                  <select value={plan} onChange={(e) => setPlan(e.target.value)} className={inputClass}>
                    {DEFAULT_PRICING.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
                  </select>
                </div>
              </div>
              {kitId && kits[kitId.trim()] && (
                <div className="p-3 rounded-xl bg-amber-50 text-amber-700 text-sm flex items-start gap-2">
                  <AlertTriangle size={16} className="mt-0.5 shrink-0" /> A kit with this ID already exists. Uploading will overwrite the existing report.
                </div>
              )}
            </div>
          )}

          {/* Breed Composition */}
          {activeSection === "breed" && (
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2"><GitBranch size={20} style={{ color: "#8B5CF6" }} /> Breed Composition</h3>
              <p className="text-sm text-gray-500">Percentages must total 100%.</p>
              {breeds.map((b, i) => (
                <div key={i} className="flex gap-3 items-end">
                  <div className="flex-1">
                    {i === 0 && <label className={labelClass}>Breed Name</label>}
                    <input value={b.name} onChange={(e) => updateBreed(i, "name", e.target.value)} placeholder="e.g., Golden Retriever" className={inputClass} />
                  </div>
                  <div className="w-24">
                    {i === 0 && <label className={labelClass}>%</label>}
                    <input type="number" min="0" max="100" value={b.value} onChange={(e) => updateBreed(i, "value", e.target.value)} placeholder="%" className={inputClass} />
                  </div>
                  {breeds.length > 1 && (
                    <button onClick={() => removeBreed(i)} className="p-2.5 rounded-xl text-red-400 hover:bg-red-50 hover:text-red-600 cursor-pointer transition-all"><Trash2 size={18} /></button>
                  )}
                </div>
              ))}
              <button onClick={addBreed} className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-800 font-medium cursor-pointer"><Plus size={16} /> Add Breed</button>
              <div className="text-xs text-gray-400">Total: {breeds.reduce((s, b) => s + (Number(b.value) || 0), 0)}%</div>
            </div>
          )}

          {/* Health Markers */}
          {activeSection === "health" && (
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2"><Heart size={20} style={{ color: "#8B5CF6" }} /> Health Markers</h3>
              {healthMarkers.map((h, i) => (
                <div key={i} className="flex flex-wrap gap-3 items-end p-3 rounded-xl bg-gray-50">
                  <div className="flex-1 min-w-[140px]">
                    {i === 0 && <label className={labelClass}>Gene</label>}
                    <input value={h.gene} onChange={(e) => updateHealth(i, "gene", e.target.value)} placeholder="e.g., MDR1" className={inputClass} />
                  </div>
                  <div className="flex-1 min-w-[180px]">
                    {i === 0 && <label className={labelClass}>Condition</label>}
                    <input value={h.condition} onChange={(e) => updateHealth(i, "condition", e.target.value)} placeholder="e.g., Drug Sensitivity" className={inputClass} />
                  </div>
                  <div className="w-28">
                    {i === 0 && <label className={labelClass}>Status</label>}
                    <select value={h.status} onChange={(e) => updateHealth(i, "status", e.target.value)} className={inputClass}>
                      <option value="clear">Clear</option>
                      <option value="carrier">Carrier</option>
                      <option value="at_risk">At Risk</option>
                    </select>
                  </div>
                  <div className="w-24">
                    {i === 0 && <label className={labelClass}>Risk</label>}
                    <select value={h.risk} onChange={(e) => updateHealth(i, "risk", e.target.value)} className={inputClass}>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  {healthMarkers.length > 1 && (
                    <button onClick={() => removeHealth(i)} className="p-2.5 rounded-xl text-red-400 hover:bg-red-50 hover:text-red-600 cursor-pointer transition-all"><Trash2 size={18} /></button>
                  )}
                </div>
              ))}
              <button onClick={addHealth} className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-800 font-medium cursor-pointer"><Plus size={16} /> Add Health Marker</button>
            </div>
          )}

          {/* Behavior Traits */}
          {activeSection === "behavior" && (
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2"><Brain size={20} style={{ color: "#8B5CF6" }} /> Behavior Traits</h3>
              <p className="text-sm text-gray-500">Score and average should be 0-100.</p>
              {behaviorTraits.map((b, i) => (
                <div key={i} className="flex gap-3 items-end">
                  <div className="flex-1">
                    {i === 0 && <label className={labelClass}>Trait</label>}
                    <input value={b.trait} onChange={(e) => updateBehavior(i, "trait", e.target.value)} placeholder="e.g., Trainability" className={inputClass} />
                  </div>
                  <div className="w-24">
                    {i === 0 && <label className={labelClass}>Score</label>}
                    <input type="number" min="0" max="100" value={b.score} onChange={(e) => updateBehavior(i, "score", e.target.value)} placeholder="0-100" className={inputClass} />
                  </div>
                  <div className="w-24">
                    {i === 0 && <label className={labelClass}>Average</label>}
                    <input type="number" min="0" max="100" value={b.avg} onChange={(e) => updateBehavior(i, "avg", e.target.value)} placeholder="0-100" className={inputClass} />
                  </div>
                  {behaviorTraits.length > 1 && (
                    <button onClick={() => removeBehavior(i)} className="p-2.5 rounded-xl text-red-400 hover:bg-red-50 hover:text-red-600 cursor-pointer transition-all"><Trash2 size={18} /></button>
                  )}
                </div>
              ))}
              <button onClick={addBehavior} className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-800 font-medium cursor-pointer"><Plus size={16} /> Add Behavior Trait</button>
            </div>
          )}

          {/* Nutrition Profile */}
          {activeSection === "nutrition" && (
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2"><Apple size={20} style={{ color: "#8B5CF6" }} /> Nutrition Profile</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Daily Calories</label>
                  <input value={nutrition.calories} onChange={(e) => setNutrition({ ...nutrition, calories: e.target.value })} placeholder="e.g., 1200-1500 kcal/day" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Protein</label>
                  <input value={nutrition.protein} onChange={(e) => setNutrition({ ...nutrition, protein: e.target.value })} placeholder="e.g., 25-30%" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Fat</label>
                  <input value={nutrition.fat} onChange={(e) => setNutrition({ ...nutrition, fat: e.target.value })} placeholder="e.g., 12-15%" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Fiber</label>
                  <input value={nutrition.fiber} onChange={(e) => setNutrition({ ...nutrition, fiber: e.target.value })} placeholder="e.g., 3-5%" className={inputClass} />
                </div>
              </div>
              <div>
                <label className={labelClass}>Recommended Supplements (comma separated)</label>
                <input value={nutrition.supplements} onChange={(e) => setNutrition({ ...nutrition, supplements: e.target.value })} placeholder="e.g., Omega-3 Fatty Acids, Glucosamine, Vitamin E" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Foods to Avoid (comma separated)</label>
                <input value={nutrition.avoid} onChange={(e) => setNutrition({ ...nutrition, avoid: e.target.value })} placeholder="e.g., Grapes, Onions, Xylitol" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Sensitivities (comma separated)</label>
                <input value={nutrition.sensitivities} onChange={(e) => setNutrition({ ...nutrition, sensitivities: e.target.value })} placeholder="e.g., Moderate grain sensitivity, Possible dairy intolerance" className={inputClass} />
              </div>
            </div>
          )}

          {/* Relatives */}
          {activeSection === "relatives" && (
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2"><Users size={20} style={{ color: "#8B5CF6" }} /> Genetic Relatives</h3>
              {relatives.map((r, i) => (
                <div key={i} className="flex flex-wrap gap-3 items-end p-3 rounded-xl bg-gray-50">
                  <div className="flex-1 min-w-[120px]">
                    {i === 0 && <label className={labelClass}>Name</label>}
                    <input value={r.name} onChange={(e) => updateRelative(i, "name", e.target.value)} placeholder="e.g., Buddy" className={inputClass} />
                  </div>
                  <div className="flex-1 min-w-[140px]">
                    {i === 0 && <label className={labelClass}>Relation</label>}
                    <input value={r.relation} onChange={(e) => updateRelative(i, "relation", e.target.value)} placeholder="e.g., Likely Sibling" className={inputClass} />
                  </div>
                  <div className="w-20">
                    {i === 0 && <label className={labelClass}>Match %</label>}
                    <input type="number" min="0" max="100" value={r.match} onChange={(e) => updateRelative(i, "match", e.target.value)} placeholder="%" className={inputClass} />
                  </div>
                  <div className="flex-1 min-w-[120px]">
                    {i === 0 && <label className={labelClass}>Location</label>}
                    <input value={r.location} onChange={(e) => updateRelative(i, "location", e.target.value)} placeholder="e.g., Austin, TX" className={inputClass} />
                  </div>
                  <div className="flex-1 min-w-[100px]">
                    {i === 0 && <label className={labelClass}>Owner</label>}
                    <input value={r.owner} onChange={(e) => updateRelative(i, "owner", e.target.value)} placeholder="e.g., Sarah M." className={inputClass} />
                  </div>
                  {relatives.length > 1 && (
                    <button onClick={() => removeRelative(i)} className="p-2.5 rounded-xl text-red-400 hover:bg-red-50 hover:text-red-600 cursor-pointer transition-all"><Trash2 size={18} /></button>
                  )}
                </div>
              ))}
              <button onClick={addRelative} className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-800 font-medium cursor-pointer"><Plus size={16} /> Add Relative</button>
            </div>
          )}

          {/* Navigation & Submit */}
          <div className="flex justify-between items-center mt-8">
            <button onClick={() => { const idx = sections.findIndex(s => s.id === activeSection); if (idx > 0) setActiveSection(sections[idx - 1].id); }} disabled={activeSection === "info"} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium cursor-pointer transition-all ${activeSection === "info" ? "text-gray-300 cursor-not-allowed" : "text-gray-600 hover:bg-gray-100"}`}>
              <ArrowLeft size={16} /> Previous
            </button>

            {activeSection === "relatives" ? (
              <button onClick={handleSubmit} className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white cursor-pointer transition-all hover:shadow-lg" style={{ background: "linear-gradient(135deg, #4C1D95, #7C3AED)" }}>
                <Upload size={18} /> Upload Report
              </button>
            ) : (
              <button onClick={() => { const idx = sections.findIndex(s => s.id === activeSection); if (idx < sections.length - 1) setActiveSection(sections[idx + 1].id); }} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-purple-700 hover:bg-purple-50 cursor-pointer transition-all">
                Next <ArrowRight size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// â"€â"€â"€ Admin Update Tracker â"€â"€â"€
function UpdateTracker() {
  const { kits, updateKit } = useApp();
  const [searchId, setSearchId] = useState("");
  const [selectedKitId, setSelectedKitId] = useState(null);
  const [searchError, setSearchError] = useState("");
  const [saved, setSaved] = useState(false);

  // Editable kit fields
  const [petName, setPetName] = useState("");
  const [species, setSpecies] = useState("");
  const [plan, setPlan] = useState("");
  const [kitStatus, setKitStatus] = useState("in_progress");
  const [steps, setSteps] = useState([]);
  const [progress, setProgress] = useState(0);
  const [statusTitle, setStatusTitle] = useState("");
  const [statusDetail, setStatusDetail] = useState("");

  const loadKit = (kitId) => {
    const kit = kits[kitId];
    if (!kit) { setSearchError("No kit found with this ID."); setSelectedKitId(null); return; }
    setSearchError("");
    setSelectedKitId(kitId);
    setPetName(kit.petName || "");
    setSpecies(kit.species || "");
    setPlan(kit.plan || "");
    setKitStatus(kit.status || "in_progress");
    setProgress(kit.progress || 0);
    setStatusTitle(kit.statusMessage?.title || "");
    setStatusDetail(kit.statusMessage?.detail || "");
    // Map steps with dates, preserving icon from template
    setSteps(
      STEP_TEMPLATES.map((tmpl) => {
        const existing = kit.steps?.find((s) => s.id === tmpl.id);
        return {
          ...tmpl,
          date: existing?.date || "",
          done: existing?.done || false,
          active: existing?.active || false,
        };
      })
    );
    setSaved(false);
  };

  const handleSearch = () => {
    const id = searchId.trim();
    if (!id) return;
    loadKit(id);
  };

  const autoUpdateFromSteps = (stepsList) => {
    const doneCount = stepsList.filter((s) => s.done).length;
    const total = stepsList.length;
    const newProgress = Math.round((doneCount / total) * 100);
    setProgress(newProgress);

    // Auto-update status and message based on timeline
    if (doneCount === total) {
      setKitStatus("completed");
      setStatusTitle("");
      setStatusDetail("");
    } else {
      setKitStatus("in_progress");
      const activeStep = stepsList.find((s) => s.active);
      const firstUndone = stepsList.find((s) => !s.done);
      const currentStep = activeStep || firstUndone;
      if (currentStep) {
        setStatusTitle(`Currently: ${currentStep.label}`);
        setStatusDetail(
          petName
            ? `${petName}'s sample is at the "${currentStep.label}" stage. Estimated progress: ${newProgress}%.`
            : `Sample is at the "${currentStep.label}" stage. Estimated progress: ${newProgress}%.`
        );
      }
    }
  };

  const toggleStepDone = (stepId) => {
    setSteps((prev) => {
      const target = prev.find((s) => s.id === stepId);
      const markingDone = !target.done;
      const updated = prev.map((s) => {
        if (markingDone) {
          // Marking done: all previous steps (id <= stepId) become done, active cleared
          return s.id <= stepId ? { ...s, done: true, active: false } : s;
        } else {
          // Marking undone: this step and all later steps (id >= stepId) become undone
          return s.id >= stepId ? { ...s, done: false, active: false } : s;
        }
      });
      autoUpdateFromSteps(updated);
      return updated;
    });
  };

  const toggleStepActive = (stepId) => {
    setSteps((prev) => {
      const wasActive = prev.find((s) => s.id === stepId)?.active;
      const updated = prev.map((s) => {
        if (wasActive) {
          // Deactivating: just remove active flag
          return { ...s, active: false };
        }
        // Setting active: all before it are done, it becomes active + not done, all after are undone
        if (s.id < stepId) return { ...s, done: true, active: false };
        if (s.id === stepId) return { ...s, done: false, active: true };
        return { ...s, done: false, active: false };
      });
      autoUpdateFromSteps(updated);
      return updated;
    });
  };

  const updateStepDate = (stepId, date) => {
    setSteps((prev) => prev.map((s) => (s.id === stepId ? { ...s, date } : s)));
  };

  const handleSave = () => {
    if (!selectedKitId) return;
    const existingKit = kits[selectedKitId];
    const updatedKit = {
      ...existingKit,
      petName,
      species,
      icon: SPECIES_ICONS[species] || existingKit.icon || "🧬",
      plan,
      status: kitStatus,
      progress,
      steps: steps.map((s) => ({
        id: s.id,
        label: s.label,
        icon: s.icon,
        date: s.date,
        done: s.done,
        ...(s.active ? { active: true } : {}),
      })),
      ...(kitStatus === "in_progress"
        ? { statusMessage: { title: statusTitle, detail: statusDetail } }
        : {}),
    };
    updateKit(selectedKitId, updatedKit);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const inputClass = "w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100";
  const labelClass = "text-xs font-semibold text-gray-600 block mb-1";

  // List all existing kit IDs for quick selection
  const kitIds = Object.keys(kits);

  return (
    <section className="py-24 bg-white">
      <div className="max-w-5xl mx-auto px-6">
        <SectionTitle subtitle="Admin Panel" title="Update Kit Tracker" description="Search for a kit by tracking ID to update its status, timeline, and progress details." />

        {/* Search */}
        <div className="max-w-lg mx-auto mb-4">
          <div className="flex gap-3">
            <input value={searchId} onChange={(e) => setSearchId(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSearch()} placeholder="Enter Kit ID (e.g., GP-2026-XXXXXXX)" className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100" />
            <button onClick={handleSearch} className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-white cursor-pointer transition-all hover:shadow-lg" style={{ background: "linear-gradient(135deg, #4C1D95, #7C3AED)" }}>
              <Search size={18} /> Find
            </button>
          </div>
        </div>

        {/* Quick select existing kits */}
        {kitIds.length > 0 && !selectedKitId && (
          <div className="max-w-lg mx-auto mb-10">
            <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-gray-400">
              <span>Existing kits:</span>
              {kitIds.map((id) => (
                <button key={id} onClick={() => { setSearchId(id); loadKit(id); }} className={`px-2.5 py-1 rounded-lg font-mono cursor-pointer transition-all ${kits[id].status === "completed" ? "bg-green-50 hover:bg-green-100 text-green-700" : "bg-amber-50 hover:bg-amber-100 text-amber-700"}`}>
                  {id} <span className="text-[10px] opacity-60">({kits[id].petName})</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {searchError && (
          <div className="max-w-lg mx-auto mb-8 p-4 rounded-xl bg-red-50 text-red-600 text-sm flex items-start gap-2">
            <AlertTriangle size={18} className="mt-0.5 shrink-0" /> {searchError}
          </div>
        )}

        {/* Edit Form */}
        {selectedKitId && (
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Kit header */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-purple-50 border border-purple-100">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{SPECIES_ICONS[species] || "🧬"}</span>
                <div>
                  <p className="font-bold text-gray-900">{petName || "Unnamed"}</p>
                  <p className="text-xs font-mono text-purple-600">{selectedKitId}</p>
                </div>
              </div>
              <Badge color={kitStatus === "completed" ? "#22C55E" : "#F59E0B"}>
                {kitStatus === "completed" ? "Completed" : "In Progress"}
              </Badge>
            </div>

            {/* Basic Info */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2"><ClipboardList size={20} style={{ color: "#8B5CF6" }} /> Kit Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={labelClass}>Pet Name</label>
                  <input value={petName} onChange={(e) => setPetName(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Species</label>
                  <select value={species} onChange={(e) => setSpecies(e.target.value)} className={inputClass}>
                    {Object.keys(SPECIES_ICONS).map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Plan</label>
                  <select value={plan} onChange={(e) => setPlan(e.target.value)} className={inputClass}>
                    {DEFAULT_PRICING.map((p) => <option key={p.name} value={p.name}>{p.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Kit Status</label>
                  <select value={kitStatus} onChange={(e) => setKitStatus(e.target.value)} className={inputClass}>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Overall Progress ({progress}%) <span className="font-normal text-gray-400">— auto-calculated from timeline</span></label>
                  <div className="w-full h-2.5 bg-gray-100 rounded-full mt-2 overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progress}%`, background: progress === 100 ? "#22C55E" : "linear-gradient(90deg, #4C1D95, #7C3AED)" }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Tracking Steps Timeline */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2"><Clock size={20} style={{ color: "#8B5CF6" }} /> Tracking Timeline</h3>
              <p className="text-sm text-gray-500">Toggle steps as done, set one as active (current), and update dates.</p>
              <div className="space-y-3">
                {steps.map((step) => {
                  const Icon = step.icon;
                  return (
                    <div key={step.id} className={`flex items-center gap-4 p-3 rounded-xl transition-all ${step.active ? "bg-purple-50 border border-purple-200" : step.done ? "bg-green-50/50 border border-green-100" : "bg-gray-50 border border-gray-100"}`}>
                      {/* Step number & icon */}
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${step.done ? "bg-green-500 text-white" : step.active ? "bg-purple-500 text-white" : "bg-gray-200 text-gray-500"}`}>
                        {step.done ? <Check size={18} /> : <Icon size={18} />}
                      </div>

                      {/* Label */}
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold ${step.done ? "text-green-800" : step.active ? "text-purple-800" : "text-gray-600"}`}>{step.label}</p>
                      </div>

                      {/* Date input */}
                      <div className="w-44">
                        <input value={step.date} onChange={(e) => updateStepDate(step.id, e.target.value)} placeholder="e.g., Mar 15, 2026" className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100" />
                      </div>

                      {/* Done toggle */}
                      <button onClick={() => toggleStepDone(step.id)} title={step.done ? "Mark undone" : "Mark done"} className={`p-1.5 rounded-lg cursor-pointer transition-all ${step.done ? "text-green-600 hover:bg-green-100" : "text-gray-400 hover:bg-gray-100"}`}>
                        {step.done ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                      </button>

                      {/* Active toggle */}
                      <button onClick={() => toggleStepActive(step.id)} title={step.active ? "Remove active" : "Set as current step"} className={`px-2 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${step.active ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-500 hover:bg-purple-100 hover:text-purple-700"}`}>
                        {step.active ? "ACTIVE" : "Set Active"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Status Message (only for in-progress kits) */}
            {kitStatus === "in_progress" && (
              <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2"><Activity size={20} style={{ color: "#8B5CF6" }} /> Status Message</h3>
                <p className="text-sm text-gray-500">Auto-generated from the timeline. You can edit it manually if needed.</p>
                <div>
                  <label className={labelClass}>Title</label>
                  <input value={statusTitle} onChange={(e) => setStatusTitle(e.target.value)} placeholder="e.g., Currently: Bioinformatics Analysis" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Detail</label>
                  <textarea value={statusDetail} onChange={(e) => setStatusDetail(e.target.value)} placeholder="e.g., Our AI pipeline is analyzing 2.8 million genetic markers..." rows={3} className={inputClass + " resize-none"} />
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="flex justify-end items-center gap-4">
              {saved && (
                <div className="flex items-center gap-2 text-sm text-green-600 font-medium animate-pulse">
                  <Check size={16} /> Changes saved successfully!
                </div>
              )}
              <button onClick={handleSave} className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white cursor-pointer transition-all hover:shadow-lg" style={{ background: "linear-gradient(135deg, #4C1D95, #7C3AED)" }}>
                <Save size={18} /> Save Changes
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

// â"€â"€â"€ Admin Markers â"€â"€â"€




const transformApiCategories = (items) =>
  items.map((cat) => ({
    id: cat.slug,
    name: cat.name,
    color: cat.color,
    markers: cat.markers.map((m) => ({
      name: m.full_name,
      gene: m.gene_code,
      risk: m.risk,
      species: m.species_groups || "",
      significance: m.recommendation || "",
      description: m.description || "",
    })),
  }));

function MarkersAdmin() {
  const navigate = useNavigate();
  const { articles, updateArticle, categories, setCategories, updateMarker, addMarker: ctxAddMarker, deleteMarker: ctxDeleteMarker } = useApp();
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingMarker, setEditingMarker] = useState(null);
  const [editMarkerValue, setEditMarkerValue] = useState({ name: "", gene: "", risk: "Low", species: "", significance: SIGNIFICANCE_OPTIONS[0], description: "", article: "", doi: "" });
  const [newMarker, setNewMarker] = useState({ catId: null, name: "", gene: "", risk: "", species: "", significance: "", description: "", article: "", doi: "" });
  const [viewingMarker, setViewingMarker] = useState(null);
  const [expandedCats, setExpandedCats] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    fetch("/api/v1/markers/categories")
      .then((r) => r.json())
      .then((data) => { setCategories(transformApiCategories(data.items)); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const flash = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  const startMarkerEdit = (catId, idx) => {
    const marker = categories.find((c) => c.id === catId).markers[idx];
    setEditingMarker(`${catId}-${idx}`);
    setEditMarkerValue({ ...marker, article: articles[marker.gene]?.article ?? "", doi: articles[marker.gene]?.doi ?? "" });
  };
  const saveMarkerEdit = (catId, idx) => {
    updateMarker(catId, idx, editMarkerValue);
    if (editMarkerValue.gene.trim() && (editMarkerValue.article.trim() || editMarkerValue.doi.trim())) {
      updateArticle(editMarkerValue.gene.trim(), { article: editMarkerValue.article.trim(), doi: editMarkerValue.doi.trim() });
    }
    setEditingMarker(null);
    setEditMarkerValue({ name: "", gene: "", risk: "Low", species: "", significance: SIGNIFICANCE_OPTIONS[0], description: "", article: "", doi: "" });
    flash();
  };
  const deleteMarker = (catId, idx) => { ctxDeleteMarker(catId, idx); flash(); };
  const addMarker = (catId) => {
    if (!newMarker.name.trim()) return;
    ctxAddMarker(catId, { name: newMarker.name.trim(), gene: newMarker.gene.trim(), risk: newMarker.risk, species: newMarker.species.trim(), significance: newMarker.significance, description: newMarker.description.trim() });
    if (newMarker.gene.trim() && (newMarker.article.trim() || newMarker.doi.trim())) {
      updateArticle(newMarker.gene.trim(), { article: newMarker.article.trim(), doi: newMarker.doi.trim() });
    }
    setNewMarker({ catId: null, name: "", gene: "", risk: "", species: "", significance: "", description: "", article: "", doi: "" });
    flash();
  };

  return (
    <section className="min-h-screen pt-28 pb-20" style={{ backgroundColor: COLORS.bg }}>
      <div className="max-w-5xl mx-auto px-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ background: `linear-gradient(135deg, ${COLORS.gradientStart}, ${COLORS.gradientEnd})` }}>
            <Microscope size={20} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Markers Management</h1>
        </div>
        <p className="text-gray-500 mb-6 ml-[52px]">View and manage markers by category.</p>

        {loading && (
          <div className="flex items-center gap-3 py-12 justify-center text-gray-400">
            <RefreshCw size={20} className="animate-spin" />
            <span className="text-sm">Loading markers from database…</span>
          </div>
        )}

        {!loading && (
        <>


        {saved && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-2 text-green-700">
            <Check size={18} /> Changes saved successfully.
          </div>
        )}

        <div className="space-y-4">
            {categories.map((cat) => (
              <div key={cat.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div
                  onClick={() => setExpandedCats((prev) => prev.includes(cat.id) ? prev.filter((id) => id !== cat.id) : [...prev, cat.id])}
                  className="flex items-center gap-3 px-6 py-4 cursor-pointer hover:bg-gray-50 transition-colors" style={{ backgroundColor: `${cat.color}10` }}
                >
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                  <h3 className="font-bold text-gray-900 flex-1">{cat.name}</h3>
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: cat.color }}>{cat.markers.length} markers</span>
                  <ChevronDown size={18} className={`text-gray-400 transition-transform ${expandedCats.includes(cat.id) ? "rotate-180" : ""}`} />
                </div>
                {expandedCats.includes(cat.id) && <div className="px-6 py-3 border-t border-gray-100">
                  {cat.markers.map((marker, idx) => (
                    <div key={idx}>
                      <div className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                        {editingMarker === `${cat.id}-${idx}` ? (
                          <div className="flex-1 mr-3 space-y-2 py-2">
                            <div className="grid sm:grid-cols-2 gap-2">
                              <input value={editMarkerValue.name} onChange={(e) => setEditMarkerValue({ ...editMarkerValue, name: e.target.value })} placeholder="Marker Name" className="px-3 py-1.5 rounded-lg border border-green-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-100" autoFocus />
                              <input value={editMarkerValue.gene} onChange={(e) => setEditMarkerValue({ ...editMarkerValue, gene: e.target.value })} placeholder="Associated Gene" className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-100" />
                              <select value={editMarkerValue.risk} onChange={(e) => setEditMarkerValue({ ...editMarkerValue, risk: e.target.value })} className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm focus:outline-none">
                                <option value="" disabled>— Risk Level —</option>
                                {RISK_LEVELS.map((r) => <option key={r} value={r}>{r}</option>)}
                              </select>
                              <SpeciesSelect value={editMarkerValue.species} onChange={(v) => setEditMarkerValue({ ...editMarkerValue, species: v })} />
                            </div>
                            <select value={editMarkerValue.significance} onChange={(e) => setEditMarkerValue({ ...editMarkerValue, significance: e.target.value })} className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-sm focus:outline-none">
                              <option value="" disabled>— Clinical Significance —</option>
                              {SIGNIFICANCE_OPTIONS.map((sig) => <option key={sig} value={sig}>{sig}</option>)}
                            </select>
                            <textarea value={editMarkerValue.description} onChange={(e) => setEditMarkerValue({ ...editMarkerValue, description: e.target.value })} placeholder="Description" rows={2} className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-sm focus:outline-none resize-none focus:ring-2 focus:ring-green-100" />
                            <div className="pt-2 border-t border-gray-100 space-y-2">
                              <p className="text-[10px] uppercase font-semibold text-gray-400 flex items-center gap-1"><BookOpen size={10} /> Published Article <span className="font-normal normal-case text-gray-300">(optional)</span></p>
                              <textarea value={editMarkerValue.article} onChange={(e) => setEditMarkerValue({ ...editMarkerValue, article: e.target.value })} placeholder="Author(s) (Year) Title. Journal Volume:Pages" rows={2} className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-sm focus:outline-none resize-none focus:ring-2 focus:ring-green-100" />
                              <input value={editMarkerValue.doi} onChange={(e) => setEditMarkerValue({ ...editMarkerValue, doi: e.target.value })} placeholder="DOI e.g. 10.1038/23475" className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-100" />
                            </div>
                            <div className="flex items-center gap-2">
                              <button onClick={() => saveMarkerEdit(cat.id, idx)} className="px-3 py-1 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 cursor-pointer text-xs font-medium flex items-center gap-1"><Check size={14} /> Save</button>
                              <button onClick={() => setEditingMarker(null)} className="px-3 py-1 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 cursor-pointer text-xs font-medium flex items-center gap-1"><X size={14} /> Cancel</button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 flex-1">
                            <span className="text-sm text-gray-700 font-medium">{marker.name}</span>
                            <span className="text-xs text-gray-400 font-mono">{marker.gene}</span>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${marker.risk === "Low" ? "bg-green-100 text-green-700" : marker.risk === "Medium" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>{marker.risk}</span>
                          </div>
                        )}
                        {editingMarker !== `${cat.id}-${idx}` && (
                          <div className="flex items-center gap-1">
                            <button onClick={() => setViewingMarker(viewingMarker === `${cat.id}-${idx}` ? null : `${cat.id}-${idx}`)} className={`p-1 rounded-lg cursor-pointer ${viewingMarker === `${cat.id}-${idx}` ? "bg-blue-100 text-blue-600" : "text-gray-400 hover:bg-blue-50 hover:text-blue-500"}`} title="View"><Eye size={14} /></button>
                            <button onClick={() => navigate(`/markers/${cat.id}/${idx}`)} className="p-1 rounded-lg text-gray-400 hover:bg-purple-50 hover:text-purple-500 cursor-pointer" title="View published article"><BookOpen size={14} /></button>
                            <button onClick={() => startMarkerEdit(cat.id, idx)} className="p-1 rounded-lg text-gray-400 hover:bg-green-50 hover:text-green-600 cursor-pointer"><Pencil size={14} /></button>
                            <button onClick={() => setConfirmDelete({ catId: cat.id, idx, name: marker.name })} className="p-1 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 cursor-pointer"><Trash2 size={14} /></button>
                          </div>
                        )}
                      </div>
                      {/* Marker detail card */}
                      {viewingMarker === `${cat.id}-${idx}` && (
                        <div className="my-2 p-4 rounded-xl border border-blue-100 bg-blue-50/50">
                          <div className="grid sm:grid-cols-2 gap-3">
                            <div>
                              <div className="text-[10px] uppercase font-semibold text-gray-400 mb-0.5">Marker Name</div>
                              <div className="text-sm font-bold text-gray-900">{marker.name}</div>
                            </div>
                            <div>
                              <div className="text-[10px] uppercase font-semibold text-gray-400 mb-0.5">Category</div>
                              <div className="text-sm text-gray-700 flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                                {cat.name}
                              </div>
                            </div>
                            <div>
                              <div className="text-[10px] uppercase font-semibold text-gray-400 mb-0.5">Associated Gene</div>
                              <div className="text-sm text-gray-700 font-mono">{marker.gene}</div>
                            </div>
                            <div>
                              <div className="text-[10px] uppercase font-semibold text-gray-400 mb-0.5">Affected Species</div>
                              <div className="text-sm text-gray-700">{marker.species}</div>
                            </div>
                            <div>
                              <div className="text-[10px] uppercase font-semibold text-gray-400 mb-0.5">Risk Level</div>
                              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${marker.risk === "Low" ? "bg-green-100 text-green-700" : marker.risk === "Medium" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>
                                {marker.risk}
                              </span>
                            </div>
                            <div>
                              <div className="text-[10px] uppercase font-semibold text-gray-400 mb-0.5">Clinical Significance</div>
                              <div className="text-xs text-gray-600">{marker.significance}</div>
                            </div>
                          </div>
                          <div className="mt-3 pt-3 border-t border-blue-100">
                            <div className="text-[10px] uppercase font-semibold text-gray-400 mb-0.5">Description</div>
                            <div className="text-xs text-gray-600">{marker.description}</div>
                          </div>
                          {/* Published Article inline */}
                          <div className="mt-3 pt-3 border-t border-blue-100">
                            <div className="text-[10px] uppercase font-semibold text-gray-400 mb-2">Published Article</div>
                            {articles[marker.gene]?.article ? (
                              <div>
                                <p className="text-xs text-gray-600 leading-relaxed mb-1">{articles[marker.gene].article}</p>
                                {articles[marker.gene].doi && (
                                  <a href={`https://doi.org/${articles[marker.gene].doi}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[10px] font-mono text-blue-500 hover:text-blue-700 hover:underline">
                                    <ExternalLink size={9} /> DOI: {articles[marker.gene].doi}
                                  </a>
                                )}
                              </div>
                            ) : (
                              <p className="text-xs text-gray-400 italic">No article on record.</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  {/* Add new marker */}
                  {newMarker.catId === cat.id ? (
                    <div className="mt-2 pt-3 border-t border-gray-100 space-y-2">
                      <div className="grid sm:grid-cols-2 gap-2">
                        <input value={newMarker.name} onChange={(e) => setNewMarker({ ...newMarker, name: e.target.value })} placeholder="Marker Name *" className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100" autoFocus />
                        <input value={newMarker.gene} onChange={(e) => setNewMarker({ ...newMarker, gene: e.target.value })} placeholder="Associated Gene" className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100" />
                        <select value={newMarker.risk} onChange={(e) => setNewMarker({ ...newMarker, risk: e.target.value })} className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm focus:outline-none">
                          <option value="" disabled>— Risk Level —</option>
                          {RISK_LEVELS.map((r) => <option key={r} value={r}>{r}</option>)}
                        </select>
                        <SpeciesSelect value={newMarker.species} onChange={(v) => setNewMarker({ ...newMarker, species: v })} />
                      </div>
                      <select value={newMarker.significance} onChange={(e) => setNewMarker({ ...newMarker, significance: e.target.value })} className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-sm focus:outline-none">
                        <option value="" disabled>— Clinical Significance —</option>
                        {SIGNIFICANCE_OPTIONS.map((sig) => <option key={sig} value={sig}>{sig}</option>)}
                      </select>
                      <textarea value={newMarker.description} onChange={(e) => setNewMarker({ ...newMarker, description: e.target.value })} placeholder="Description" rows={2} className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-sm focus:outline-none resize-none focus:border-green-400 focus:ring-2 focus:ring-green-100" />
                      <div className="pt-2 border-t border-gray-100 space-y-2">
                        <p className="text-[10px] uppercase font-semibold text-gray-400 flex items-center gap-1"><BookOpen size={10} /> Published Article <span className="font-normal normal-case text-gray-300">(optional)</span></p>
                        <textarea value={newMarker.article} onChange={(e) => setNewMarker({ ...newMarker, article: e.target.value })} placeholder="Author(s) (Year) Title. Journal Volume:Pages" rows={2} className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-sm focus:outline-none resize-none focus:border-green-400 focus:ring-2 focus:ring-green-100" />
                        <input value={newMarker.doi} onChange={(e) => setNewMarker({ ...newMarker, doi: e.target.value })} placeholder="DOI e.g. 10.1038/23475" className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100" />
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => addMarker(cat.id)} className="px-3 py-1 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 cursor-pointer text-xs font-medium flex items-center gap-1"><Check size={14} /> Add</button>
                        <button onClick={() => setNewMarker({ catId: null, name: "", gene: "", risk: "", species: "", significance: "", description: "", article: "", doi: "" })} className="px-3 py-1 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 cursor-pointer text-xs font-medium flex items-center gap-1"><X size={14} /> Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => setNewMarker({ catId: cat.id, name: "", gene: "", risk: "", species: "", significance: "", description: "" })} className="flex items-center gap-1 mt-2 pt-2 border-t border-gray-100 text-xs text-green-600 hover:text-green-700 font-medium cursor-pointer">
                      <Plus size={14} /> Add Marker
                    </button>
                  )}
                </div>}
              </div>
            ))}
          </div>

        <p className="text-xs text-gray-400 mt-6 text-center">Changes are saved in the current session. Health marker counts are displayed on species cards and the Order Kit page.</p>

        {/* Delete confirmation modal */}
        {confirmDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                  <Trash2 size={18} className="text-red-500" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base">Delete Marker</h3>
                  <p className="text-sm text-gray-500">This action cannot be undone.</p>
                </div>
              </div>
              <p className="text-sm text-gray-700 mb-6">
                Are you sure you want to delete <span className="font-semibold text-gray-900">"{confirmDelete.name}"</span>?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="flex-1 px-4 py-2 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => { deleteMarker(confirmDelete.catId, confirmDelete.idx); setConfirmDelete(null); }}
                  className="flex-1 px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
        </>
        )}
      </div>
    </section>
  );
}

export default function AdminPortalPage() {
  const { user, logout } = useApp();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.state?.tab ?? "upload");

  useEffect(() => {
    if (location.state?.tab) setActiveTab(location.state.tab);
  }, [location.state?.tab]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: COLORS.bg, color: COLORS.text }}>
      <Navbar currentPage="admin" user={user} onLogout={logout} />
      <div className="pt-20">
        {activeTab === "upload" && <UploadReport />}
        {activeTab === "tracker" && <UpdateTracker />}
        {activeTab === "markers" && <MarkersAdmin />}
      </div>
      <Footer />
    </div>
  );
}
