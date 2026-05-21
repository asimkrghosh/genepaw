import { useState } from "react";
import { Search, ChevronDown, Plus, Check, ArrowRight, ArrowLeft, Clock, Truck, FlaskConical, BarChart3, Heart, Dna, Brain, Apple, Users, Microscope, Activity, AlertTriangle, Dog, GitBranch, Eye, Pencil, Upload, Trash2, ClipboardList, FileUp, Save, ToggleLeft, ToggleRight, X, PackageCheck, RefreshCw } from "lucide-react";
import { COLORS, SectionTitle, Badge, Navbar, Footer, DEFAULT_PRICING } from "./shared.jsx";
import { SPECIES_DATA, STEP_TEMPLATES } from "./CustomerPortal.jsx";
import { useApp } from "./AppContext.jsx";

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

// â”€â”€â”€ Admin Update Tracker â”€â”€â”€
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
                  <label className={labelClass}>Overall Progress ({progress}%) <span className="font-normal text-gray-400">â€” auto-calculated from timeline</span></label>
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

// â”€â”€â”€ Admin Markers â”€â”€â”€
const RISK_LEVELS = ["Low", "Medium", "High"];
const SIGNIFICANCE_OPTIONS = [
  "Informational â€” no immediate clinical action required. Monitor during routine check-ups.",
  "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.",
  "Significant â€” predisposition detected. Recommend veterinary consultation and targeted screening.",
];
const makeMarker = (name, gene, risk, species, significance, description) => ({ name, gene, risk, species, significance, description });
const MARKER_CATEGORIES = [
  { id: "behaviour", name: "Behaviour", color: "#F59E0B", markers: [
    makeMarker("Arginine Vasopressin Receptor 1A", "AVPR1A (VT3R)", "Medium", "Homo sapiens, Microtus ochrogaster, Canis lupus familiaris, Mus musculus, Gallus gallus, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes the vasopressin V1a receptor, a GPCR mediating the central effects of vasopressin/vasotocin on social behavior, pair bonding, aggression, and stress responses."),
    makeMarker("Dopamine Receptor D1", "DRD1", "Medium", "Homo sapiens, Canis lupus familiaris, Mus musculus, Rattus norvegicus, Danio rerio", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes the dopamine D1 receptor, the most abundant dopamine receptor in the brain. A stimulatory GPCR that activates adenylyl cyclase and mediates reward, motivation, and motor behavior."),
    makeMarker("Dopamine Receptor D2", "DRD2", "Medium", "Homo sapiens, Canis lupus familiaris, Mus musculus, Rattus norvegicus, Gallus gallus, Danio rerio", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes the dopamine D2 receptor, an inhibitory GPCR that reduces cAMP production. Exists as long (D2L) and short (D2S) splice variants with distinct functions in postsynaptic signaling and autorecept"),
    makeMarker("General Transcription Factor IIi", "GTF2I", "Medium", "Homo sapiens, Canis lupus familiaris, Mus musculus, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes a multifunctional transcription factor involved in signal-induced gene expression. Located in the Williams-Beuren syndrome critical region."),
    makeMarker("GTF2I Repeat Domain Containing 1", "GTF2IRD1", "Medium", "Homo sapiens, Canis lupus familiaris, Mus musculus, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes a transcription factor in the Williams-Beuren syndrome critical region that regulates craniofacial and muscular development and behavioral traits."),
    makeMarker("5-Hydroxytryptamine Receptor 1A", "HTR1A", "Medium", "Homo sapiens, Canis lupus familiaris, Mus musculus, Rattus norvegicus, Danio rerio", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes the serotonin 5-HT1A receptor, an inhibitory G protein-coupled receptor in the brain that modulates anxiety, mood, and behavioral responses."),
    makeMarker("5-Hydroxytryptamine Receptor 1B", "HTR1B", "Medium", "Homo sapiens, Canis lupus familiaris, Mus musculus, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes the serotonin 5-HT1B receptor, a presynaptic autoreceptor that inhibits serotonin release and modulates aggression and impulsivity."),
    makeMarker("5-Hydroxytryptamine Receptor 2A", "HTR2A", "Medium", "Homo sapiens, Canis lupus familiaris, Mus musculus, Rattus norvegicus, Danio rerio", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes the serotonin 5-HT2A receptor, a Gq-coupled receptor mediating excitatory serotonergic signaling involved in mood, cognition, and perception."),
    makeMarker("Monoamine Oxidase B", "MAOB", "Medium", "Homo sapiens, Canis lupus familiaris, Mus musculus, Rattus norvegicus, Danio rerio", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes monoamine oxidase B, a mitochondrial enzyme that catalyzes the oxidative deamination of biogenic and xenobiotic amines including dopamine and phenylethylamine."),
    makeMarker("Neuropeptide Y", "NPY", "Medium", "Homo sapiens, Mus musculus, Gallus gallus, Sus scrofa, Bos taurus, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "A 36-amino acid neuropeptide widely distributed in the central and peripheral nervous system, regulating appetite, stress response, and anxiety. It is one of the most potent orexigenic factors in the "),
    makeMarker("Oxytocin/Neurophysin I Prepropeptide", "OXT", "Medium", "Homo sapiens, Canis lupus familiaris, Mus musculus, Bos taurus, Ovis aries, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes the precursor of oxytocin, a neuropeptide hormone critical for social bonding, parturition, lactation, and maternal behavior. Also functions as a neurotransmitter modulating trust and social c"),
    makeMarker("Oxytocin Receptor (Mesotocin Receptor in Birds)", "OXTR (Mesotocin receptor)", "Medium", "Homo sapiens, Canis lupus familiaris, Mus musculus, Gallus gallus, Taeniopygia guttata, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes the receptor for oxytocin (or mesotocin in birds), a G protein-coupled receptor mediating the behavioral and physiological effects of oxytocin signaling including pair bonding and social recog"),
    makeMarker("Serotonin Transporter (Solute Carrier Family 6 Member 4)", "SERT (SLC6A4)", "Medium", "Homo sapiens, Canis lupus familiaris, Mus musculus, Macaca mulatta, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes the serotonin transporter that mediates reuptake of serotonin from the synaptic cleft into presynaptic neurons. Primary target of SSRI antidepressants and central to serotonergic neurotransmis"),
    makeMarker("Solute Carrier Family 6 Member 3 (Dopamine Transporter, DAT)", "SLC6A3", "Medium", "Homo sapiens, Canis lupus familiaris, Mus musculus, Rattus norvegicus, Danio rerio", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes the dopamine transporter responsible for reuptake of dopamine from the synaptic cleft. Key regulator of dopaminergic neurotransmission and target of psychostimulants."),
    makeMarker("Tryptophan Hydroxylase 2", "TPH2", "Medium", "Homo sapiens, Canis lupus familiaris, Mus musculus, Rattus norvegicus, Danio rerio", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes the brain-specific isoform of tryptophan hydroxylase, the rate-limiting enzyme in serotonin biosynthesis in the central nervous system. Distinct from TPH1 which functions in peripheral tissues"),
    makeMarker("Williams-Beuren Syndrome Chromosome Region 17 (GALNT17)", "WBSCR17", "Medium", "Homo sapiens, Canis lupus familiaris, Mus musculus, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes a polypeptide N-acetylgalactosaminyltransferase (GALNT17) located in the Williams-Beuren syndrome critical region. Involved in O-linked glycosylation of proteins."),
    makeMarker("Forkhead Box Protein P2", "FOXP2", "Medium", "Homo sapiens, Taeniopygia guttata (Zebra Finch), Mus musculus, Rattus norvegicus, Xenopus laevis, Xenopus tropicalis, Caenorhabditis elegans, Danio rerio, Drosophila melanogaster", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Transcription factor critical for speech and language development; regulates synaptic plasticity and motor learning circuits"),
    makeMarker("Monoamine Oxidase A", "MAOA", "Medium", "Homo sapiens, Mus musculus, Rattus norvegicus, Saccharomyces cerevisiae, Xenopus laevis, Xenopus tropicalis, Caenorhabditis elegans, Danio rerio, Drosophila melanogaster", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Mitochondrial enzyme that degrades serotonin, norepinephrine, and dopamine; key regulator of monoaminergic neurotransmission"),
    makeMarker("Solute Carrier Family 6 Member 4 (Serotonin Transporter)", "SLC6A4", "Medium", "Homo sapiens, Macaca mulatta (Rhesus Macaque), Mus musculus, Rattus norvegicus, Xenopus laevis, Danio rerio, Xenopus tropicalis, Caenorhabditis elegans, Drosophila melanogaster", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Serotonin reuptake transporter (5-HTT/SERT); primary mechanism for clearing serotonin from the synaptic cleft"),
    makeMarker("Dopamine Receptor D4", "DRD4", "Medium", "Homo sapiens, Parus major (Great Tit), Mus musculus, Rattus norvegicus, Xenopus tropicalis, Danio rerio, Xenopus laevis, Caenorhabditis elegans, Drosophila melanogaster", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "G protein-coupled receptor for dopamine; modulates attention, reward processing, and exploratory behaviour"),
    makeMarker("5-Hydroxytryptamine Receptor 2C", "HTR2C", "Medium", "Homo sapiens, Mus musculus, Rattus norvegicus, Danio rerio, Xenopus tropicalis, Xenopus laevis, Caenorhabditis elegans, Drosophila melanogaster", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Serotonin receptor subtype involved in appetite regulation, anxiety, and impulsive behaviour"),
    makeMarker("Early Growth Response 1", "ZENK/EGR1", "Medium", "Taeniopygia guttata (Zebra Finch), Serinus canaria (Canary), Mus musculus, Rattus norvegicus, Xenopus tropicalis, Xenopus laevis, Drosophila melanogaster, Homo sapiens, Caenorhabditis elegans, Danio rerio", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Immediate early gene (transcription factor) rapidly induced by neural activity; marker of song-driven neuronal activation in songbirds"),
    makeMarker("Adenylate Cyclase Activating Polypeptide 1 (PACAP)", "ADCYAP1", "Medium", "Sylvia atricapilla (Eurasian Blackcap), Junco hyemalis (Dark-eyed Junco), Danio rerio, Xenopus laevis, Homo sapiens, Mus musculus, Rattus norvegicus, Xenopus tropicalis, Caenorhabditis elegans", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Neuropeptide involved in stress response, neural development, and migratory restlessness (Zugunruhe) in birds"),
    makeMarker("Vestigial Like Family Member 3", "VGLL3", "Medium", "Salmo salar (Atlantic Salmon), Xenopus laevis, Danio rerio, Drosophila melanogaster, Homo sapiens, Mus musculus, Rattus norvegicus, Xenopus tropicalis", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Transcription co-factor influencing age at maturity in Atlantic salmon; large-effect locus for life history strategy (early vs. late maturity)"),
    makeMarker("Tyrosinase Related Protein 1", "TYRP1", "Medium", "Columba livia (Rock Pigeon), Ovis aries (Sheep), Mus musculus, Rattus norvegicus, Xenopus tropicalis, Caenorhabditis elegans, Danio rerio, Xenopus laevis, Homo sapiens", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Melanin biosynthesis enzyme also functioning as a pleiotropic gene affecting plumage color and behavioral traits in birds"),
  ]},
  { id: "cancer", name: "Cancer / Cell Cycle", color: "#EF4444", markers: [
    makeMarker("B-Raf Proto-Oncogene, Serine/Threonine Kinase", "BRAF", "High", "Homo sapiens, Canis lupus familiaris, Mus musculus, Felis catus, Danio rerio, Rattus norvegicus", "Significant â€” predisposition detected. Recommend veterinary consultation and targeted screening.", "Encodes a serine/threonine kinase in the RAS-MAPK signaling pathway that transduces growth signals from cell surface receptors to the nucleus. A key oncogene in multiple cancer types."),
    makeMarker("BRCA2 DNA Repair Associated", "BRCA2", "High", "Homo sapiens, Canis lupus familiaris, Mus musculus, Felis catus, Gallus gallus, Danio rerio, Rattus norvegicus", "Significant â€” predisposition detected. Recommend veterinary consultation and targeted screening.", "Encodes a key protein in homologous recombination DNA repair that interacts with RAD51 to facilitate repair of double-strand breaks. A critical tumor suppressor whose loss leads to genomic instability"),
    makeMarker("F-Box And WD Repeat Domain Containing 7", "FBXW7", "High", "Homo sapiens, Canis lupus familiaris, Mus musculus, Caenorhabditis elegans, Danio rerio, Drosophila melanogaster, Rattus norvegicus", "Significant â€” predisposition detected. Recommend veterinary consultation and targeted screening.", "Encodes a substrate recognition component of the SCF ubiquitin ligase complex that targets oncoproteins like cyclin E, c-Myc, Notch, and mTOR for proteasomal degradation."),
    makeMarker("MutY DNA Glycosylase", "MUTYH", "High", "Homo sapiens, Canis lupus familiaris, Mus musculus, Danio rerio, Rattus norvegicus", "Significant â€” predisposition detected. Recommend veterinary consultation and targeted screening.", "Encodes a base excision repair enzyme that removes adenine mispaired with 8-oxoguanine, preventing G:C to T:A transversion mutations caused by oxidative DNA damage."),
    makeMarker("Platelet Derived Growth Factor Receptor Alpha", "PDGFRA", "High", "Homo sapiens, Canis lupus familiaris, Mus musculus, Felis catus, Danio rerio, Rattus norvegicus", "Significant â€” predisposition detected. Recommend veterinary consultation and targeted screening.", "Encodes a receptor tyrosine kinase that binds PDGF ligands and activates signaling cascades controlling cell proliferation, differentiation, and survival. Important in mesenchymal cell development."),
    makeMarker("Phosphatase and Tensin Homolog", "PTEN", "High", "Homo sapiens, Canis lupus familiaris, Felis catus, Mus musculus, Danio rerio, Rattus norvegicus", "Significant â€” predisposition detected. Recommend veterinary consultation and targeted screening.", "Encodes a dual-specificity phosphatase that antagonizes PI3K/AKT signaling, functioning as a major tumor suppressor. Regulates cell growth, survival, and genomic stability."),
    makeMarker("Ribosomal Protein S15a", "RPS15A", "High", "Homo sapiens, Mus musculus, Caenorhabditis elegans, Danio rerio, Drosophila melanogaster, Rattus norvegicus, Saccharomyces cerevisiae", "Significant â€” predisposition detected. Recommend veterinary consultation and targeted screening.", "Encodes a component of the 40S ribosomal subunit involved in translation initiation. Overexpression has been linked to cell proliferation and tumor progression."),
    makeMarker("THO Complex 1", "THOC1", "High", "Homo sapiens, Mus musculus, Danio rerio, Rattus norvegicus", "Significant â€” predisposition detected. Recommend veterinary consultation and targeted screening.", "Encodes a component of the THO/TREX complex involved in mRNA export from the nucleus to the cytoplasm. Also functions in transcription elongation and genome stability."),
    makeMarker("Tumor Protein P53", "TP53", "High", "Homo sapiens, Xenopus laevis, Xenopus tropicalis, Rattus norvegicus, Mus musculus, Danio rerio, Drosophila melanogaster, Caenorhabditis elegans, Saccharomyces cerevisiae", "Significant â€” predisposition detected. Recommend veterinary consultation and targeted screening.", "Transcription factor and tumor suppressor ('guardian of the genome'); regulates cell cycle arrest, apoptosis, and DNA repair in response to genotoxic stress"),
    makeMarker("BRCA1 DNA Repair Associated", "BRCA1", "High", "Homo sapiens, Mus musculus, Rattus norvegicus, Xenopus laevis, Xenopus tropicalis, Danio rerio, Caenorhabditis elegans, Saccharomyces cerevisiae", "Significant â€” predisposition detected. Recommend veterinary consultation and targeted screening.", "E3 ubiquitin ligase involved in homologous recombination DNA repair; maintains genomic stability and functions as a tumor suppressor"),
    makeMarker("MYC Proto-Oncogene, bHLH Transcription Factor", "MYC", "High", "Homo sapiens, Gallus gallus (Chicken, viral origin), Mus musculus, Rattus norvegicus, Danio rerio, Drosophila melanogaster, Xenopus tropicalis, Xenopus laevis, Caenorhabditis elegans", "Significant â€” predisposition detected. Recommend veterinary consultation and targeted screening.", "Transcription factor regulating cell proliferation, growth, apoptosis, and metabolism; one of the most frequently deregulated oncogenes"),
    makeMarker("RB Transcriptional Corepressor 1", "RB1", "High", "Homo sapiens, Mus musculus, Rattus norvegicus, Xenopus tropicalis, Drosophila melanogaster, Xenopus laevis, Caenorhabditis elegans, Danio rerio", "Significant â€” predisposition detected. Recommend veterinary consultation and targeted screening.", "Tumor suppressor protein regulating G1/S cell cycle transition; binds and inhibits E2F transcription factors controlling S-phase gene expression"),
    makeMarker("KRAS Proto-Oncogene, GTPase", "KRAS", "High", "Homo sapiens, Mus musculus, Rattus norvegicus, Xenopus laevis, Danio rerio, Drosophila melanogaster, Xenopus tropicalis, Caenorhabditis elegans", "Significant â€” predisposition detected. Recommend veterinary consultation and targeted screening.", "Small GTPase acting as a molecular switch in RAS/MAPK signaling cascade; regulates cell growth, differentiation, and survival"),
  ]},
  { id: "cardiovascular", name: "Cardiovascular", color: "#DC2626", markers: [
    makeMarker("Apolipoprotein B", "APOB", "High", "Homo sapiens, Equus caballus, Mus musculus, Canis lupus familiaris, Danio rerio, Rattus norvegicus", "Significant â€” predisposition detected. Recommend veterinary consultation and targeted screening.", "Encodes the primary structural protein of LDL and VLDL particles, essential for lipoprotein assembly, cholesterol transport, and receptor-mediated lipid uptake. Exists as two isoforms: apoB-100 (liver"),
    makeMarker("ATPase Plasma Membrane Ca2+ Transporting 1", "ATP2B1 (PMCA1)", "High", "Homo sapiens, Mus musculus, Gallus gallus, Rattus norvegicus, Caenorhabditis elegans, Danio rerio, Drosophila melanogaster, Saccharomyces cerevisiae", "Significant â€” predisposition detected. Recommend veterinary consultation and targeted screening.", "Encodes a ubiquitous plasma membrane calcium ATPase pump responsible for maintaining low intracellular calcium concentration. Essential for calcium homeostasis in all cell types including cardiomyocyt"),
    makeMarker("Calcium Voltage-Gated Channel Subunit Alpha1 C", "CACNA1C", "High", "Homo sapiens, Mus musculus, Rattus norvegicus, Canis lupus familiaris, Danio rerio", "Significant â€” predisposition detected. Recommend veterinary consultation and targeted screening.", "Encodes the pore-forming alpha-1C subunit of L-type voltage-gated calcium channels (Cav1.2). Critical for cardiac excitation-contraction coupling, vascular smooth muscle tone, and neuronal calcium sig"),
    makeMarker("Potassium Inwardly Rectifying Channel Subfamily J Member 2", "KCNJ2", "High", "Homo sapiens, Equus caballus, Mus musculus, Danio rerio, Rattus norvegicus", "Significant â€” predisposition detected. Recommend veterinary consultation and targeted screening.", "Encodes the Kir2.1 inward rectifier potassium channel, essential for maintaining resting membrane potential in cardiac, skeletal muscle, and neural cells."),
    makeMarker("Myosin Binding Protein C3, Cardiac", "MYBPC3", "High", "Homo sapiens, Felis catus, Canis lupus familiaris, Mus musculus, Danio rerio, Rattus norvegicus", "Significant â€” predisposition detected. Recommend veterinary consultation and targeted screening.", "Encodes cardiac myosin-binding protein C, a thick filament protein essential for cardiac sarcomere structure and contractile regulation."),
    makeMarker("Myosin Heavy Chain 7", "MYH7", "High", "Homo sapiens, Equus caballus, Mus musculus, Sus scrofa, Danio rerio, Rattus norvegicus", "Significant â€” predisposition detected. Recommend veterinary consultation and targeted screening.", "Encodes beta-myosin heavy chain, the predominant myosin in cardiac ventricles and slow-twitch skeletal muscle fibers, essential for cardiac contraction."),
    makeMarker("Sodium Voltage-Gated Channel Alpha Subunit 5", "SCN5A", "High", "Homo sapiens, Canis lupus familiaris, Mus musculus, Danio rerio, Rattus norvegicus", "Significant â€” predisposition detected. Recommend veterinary consultation and targeted screening.", "Encodes the alpha subunit of the cardiac voltage-gated sodium channel Nav1.5, responsible for the rapid upstroke of the cardiac action potential. Essential for normal cardiac conduction."),
    makeMarker("Striatin", "STRN", "High", "Homo sapiens, Canis lupus familiaris, Mus musculus, Danio rerio, Rattus norvegicus", "Significant â€” predisposition detected. Recommend veterinary consultation and targeted screening.", "Encodes striatin, a calmodulin-binding scaffolding protein involved in cell signaling, endocytosis, and cell adhesion at the intercalated discs of cardiomyocytes."),
    makeMarker("Titin", "TTN", "High", "Homo sapiens, Canis lupus familiaris, Mus musculus, Equus caballus, Danio rerio, Rattus norvegicus", "Significant â€” predisposition detected. Recommend veterinary consultation and targeted screening.", "Encodes titin, the largest known protein, spanning half the sarcomere from Z-disc to M-band in striated muscle. Functions as a molecular spring providing passive elasticity and serves as a scaffold fo"),
  ]},
  { id: "circadian", name: "Circadian Rhythm", color: "#8B5CF6", markers: [
    makeMarker("Aralkylamine N-Acetyltransferase", "AANAT", "Low", "Homo sapiens, Mus musculus, Ovis aries, Gallus gallus, Danio rerio, Rattus norvegicus", "Informational â€” no immediate clinical action required. Monitor during routine check-ups.", "Encodes the penultimate enzyme in melatonin biosynthesis, catalyzing the N-acetylation of serotonin to N-acetylserotonin. Critical for circadian regulation of melatonin production in the pineal gland."),
    makeMarker("Opsin 4 (Melanopsin)", "OPN4 (Melanopsin)", "Low", "Homo sapiens, Mus musculus, Gallus gallus, Columba livia, Danio rerio, Rattus norvegicus", "Informational â€” no immediate clinical action required. Monitor during routine check-ups.", "Encodes melanopsin, a photopigment expressed in intrinsically photosensitive retinal ganglion cells (ipRGCs) that mediates non-visual light responses including circadian photoentrainment and the pupil"),
    makeMarker("Clock Circadian Regulator", "CLOCK", "Low", "Homo sapiens, Mus musculus, Drosophila melanogaster (dClock), Rattus norvegicus, Rattus norvegicus, Xenopus tropicalis, Xenopus laevis, Danio rerio, Caenorhabditis elegans", "Informational â€” no immediate clinical action required. Monitor during routine check-ups.", "bHLH-PAS transcription factor; core component of the molecular circadian clock; heterodimerizes with BMAL1 to drive circadian gene expression"),
    makeMarker("Period Circadian Regulator 2", "PER2", "Low", "Homo sapiens, Mus musculus, Danio rerio, Rattus norvegicus, Xenopus tropicalis, Xenopus laevis, Caenorhabditis elegans, Drosophila melanogaster", "Informational â€” no immediate clinical action required. Monitor during routine check-ups.", "Core circadian clock protein; negative regulator of CLOCK/BMAL1-mediated transcription; essential for ~24h oscillation of circadian rhythms"),
    makeMarker("Aryl Hydrocarbon Receptor Nuclear Translocator Like (Brain and Muscle ARNT-Like 1)", "ARNTL/BMAL1", "Low", "Homo sapiens, Mus musculus, Rattus norvegicus, Xenopus tropicalis, Xenopus laevis, Danio rerio, Drosophila melanogaster, Caenorhabditis elegans", "Informational â€” no immediate clinical action required. Monitor during routine check-ups.", "Core circadian clock transcription factor; heterodimerizes with CLOCK to drive expression of Period and Cryptochrome genes"),
  ]},
  { id: "dermatology", name: "Dermatology", color: "#EC4899", markers: [
    makeMarker("Fermitin Family Member 1", "FERMT1", "Medium", "Homo sapiens, Canis lupus familiaris, Mus musculus, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes kindlin-1, a focal adhesion protein essential for integrin activation and keratinocyte adhesion to the basement membrane of the skin."),
    makeMarker("Keratin 71", "KRT71", "Medium", "Homo sapiens, Felis catus, Canis lupus familiaris, Mus musculus, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes keratin type II cytoskeletal 71, expressed in the inner root sheath of hair follicles and controlling hair texture and curl pattern."),
    makeMarker("Laminin Subunit Alpha 3", "LAMA3", "Medium", "Homo sapiens, Equus caballus, Canis lupus familiaris, Mus musculus, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes the alpha-3 chain of laminin-332 (formerly laminin-5), a major component of the basement membrane anchoring filaments in skin and mucous membranes."),
    makeMarker("Laminin Subunit Gamma 2", "LAMC2", "Medium", "Homo sapiens, Equus caballus, Canis lupus familiaris, Mus musculus, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes the gamma-2 chain of laminin-332, essential for epithelial cell adhesion to the basement membrane through hemidesmosomal anchoring."),
  ]},
  { id: "development", name: "Development", color: "#10B981", markers: [
    makeMarker("Cadherin 2 (N-Cadherin)", "CDH2", "Medium", "Homo sapiens, Canis lupus familiaris, Mus musculus, Danio rerio, Gallus gallus, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes N-cadherin, a calcium-dependent cell adhesion molecule critical for neural crest migration, cardiac development, and synaptic structure. Essential for embryonic development and tissue morphoge"),
    makeMarker("Indian Hedgehog Signaling Molecule", "IHH", "Medium", "Homo sapiens, Equus caballus, Gallus gallus, Mus musculus, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes Indian hedgehog, a signaling molecule critical for chondrocyte differentiation, bone formation, and endochondral ossification during skeletal development."),
    makeMarker("Limb And CNS Expressed 1", "LIX1", "Medium", "Homo sapiens, Gallus gallus, Mus musculus, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes a protein expressed during limb and central nervous system development, involved in gastrointestinal mesenchymal progenitor cell maintenance."),
    makeMarker("LLP Homolog, Long-Term Synaptic Facilitation Factor", "LLPH", "Medium", "Homo sapiens, Bos taurus, Mus musculus, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes a protein implicated in long-term synaptic facilitation and chromatin remodeling, with roles in development and neuroplasticity."),
    makeMarker("Regulatory Factor X8", "RFX8", "Medium", "Homo sapiens, Mus musculus, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes a member of the RFX transcription factor family involved in ciliogenesis and developmental gene regulation. RFX8 is less characterized than other RFX family members."),
    makeMarker("Semaphorin 3D", "SEMA3D", "Medium", "Homo sapiens, Mus musculus, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes a secreted semaphorin that functions as a guidance cue for axons and migrating cells during development. Also involved in cardiovascular development and neural crest cell migration."),
    makeMarker("SPARC Like 1 (Hevin)", "SPARCL1", "Medium", "Homo sapiens, Mus musculus, Rattus norvegicus, Danio rerio", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes hevin, a matricellular glycoprotein that modulates cell adhesion and is involved in synaptogenesis. An anti-adhesive protein structurally related to SPARC/osteonectin."),
    makeMarker("Sonic Hedgehog Signaling Molecule", "SHH", "Medium", "Homo sapiens, Mus musculus, Gallus gallus (Chicken), Caenorhabditis elegans, Danio rerio, Drosophila melanogaster, Rattus norvegicus, Xenopus tropicalis, Saccharomyces cerevisiae, Xenopus laevis", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Morphogen essential for embryonic patterning including neural tube, limb, and digit formation; ventral midline signaling"),
    makeMarker("Paired Box 6", "PAX6", "Medium", "Homo sapiens, Mus musculus, Drosophila melanogaster, Xenopus laevis, Danio rerio, Xenopus tropicalis, Caenorhabditis elegans, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Master control gene for eye development; transcription factor regulating lens, cornea, retina, and brain patterning"),
    makeMarker("Bone Morphogenetic Protein 4", "BMP4", "Medium", "Geospiza fortis (Medium Ground Finch), Geospiza magnirostris (Large Ground Finch), Homo sapiens, Mus musculus, Rattus norvegicus, Xenopus tropicalis, Xenopus laevis, Caenorhabditis elegans, Danio rerio, Drosophila melanogaster", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "TGF-beta superfamily signaling molecule regulating bone, cartilage, and craniofacial morphogenesis"),
    makeMarker("Homeobox A13", "HOXA13", "Medium", "Homo sapiens, Mus musculus, Rattus norvegicus, Xenopus tropicalis, Danio rerio, Xenopus laevis", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Transcription factor specifying distal limb and digit identity; regulates appendage patterning in vertebrates"),
    makeMarker("Wnt Family Member 3A", "WNT3A", "Medium", "Homo sapiens, Mus musculus, Xenopus laevis, Caenorhabditis elegans, Danio rerio, Mus musculus, Rattus norvegicus, Xenopus tropicalis", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Secreted signaling molecule in the canonical Wnt pathway; essential for posterior body axis formation and somitogenesis"),
    makeMarker("Fibroblast Growth Factor 8", "FGF8", "Medium", "Homo sapiens, Mus musculus, Gallus gallus (Chicken), Rattus norvegicus, Xenopus tropicalis, Danio rerio, Xenopus laevis, Caenorhabditis elegans", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Signaling molecule critical for limb bud outgrowth, brain patterning (midbrain-hindbrain boundary), and craniofacial development"),
    makeMarker("Notch Receptor 1", "NOTCH1", "Medium", "Drosophila melanogaster, Homo sapiens, Mus musculus, Danio rerio, Caenorhabditis elegans, Xenopus laevis, Rattus norvegicus, Xenopus tropicalis", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Transmembrane receptor mediating lateral inhibition during cell fate decisions; Notch signaling is fundamental to neurogenesis, somitogenesis, and angiogenesis"),
    makeMarker("Delta Like Canonical Notch Ligand 3", "DLL3", "Medium", "Homo sapiens, Mus musculus, Rattus norvegicus, Python molurus (Burmese Python), Xenopus laevis, Danio rerio, Xenopus tropicalis, Caenorhabditis elegans", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Notch pathway ligand involved in somite segmentation; essential for proper vertebral column patterning"),
    makeMarker("Paired Like Homeodomain 2", "PITX2", "Medium", "Homo sapiens, Mus musculus, Lottia gigantea (Owl Limpet), Lymnaea stagnalis (Pond Snail), Xenopus laevis, Caenorhabditis elegans, Danio rerio, Drosophila melanogaster, Rattus norvegicus, Saccharomyces cerevisiae, Xenopus tropicalis", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Transcription factor essential for left-right body asymmetry; specifies left-sided organ identity during embryogenesis"),
  ]},
  { id: "endocrine", name: "Endocrine", color: "#F97316", markers: [
    makeMarker("Calcium Sensing Receptor", "CASR", "Medium", "Homo sapiens, Canis lupus familiaris, Felis catus, Mus musculus, Bos taurus, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes the calcium-sensing receptor, a GPCR on parathyroid and renal cells that detects extracellular calcium levels and regulates PTH secretion and renal calcium reabsorption. Master regulator of ca"),
    makeMarker("Cytochrome P450 Family 27 Subfamily B Member 1", "CYP27B1", "Medium", "Homo sapiens, Mus musculus, Sus scrofa, Gallus gallus, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes 25-hydroxyvitamin D 1-alpha-hydroxylase, the mitochondrial enzyme that produces the active hormone 1,25-dihydroxyvitamin D3 (calcitriol) in the kidney. The rate-limiting step in vitamin D acti"),
    makeMarker("Cytochrome P450 Family 2 Subfamily R Member 1", "CYP2R1", "Medium", "Homo sapiens, Mus musculus, Rattus norvegicus, Danio rerio", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes vitamin D 25-hydroxylase, the major hepatic enzyme that converts vitamin D3 (cholecalciferol) to 25-hydroxyvitamin D3, the main circulating form of vitamin D used for clinical assessment."),
    makeMarker("Iodothyronine Deiodinase 2", "DIO2", "Medium", "Homo sapiens, Gallus gallus, Coturnix japonica, Mus musculus, Canis lupus familiaris, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes type 2 deiodinase, a selenoenzyme that converts the prohormone T4 (thyroxine) to the active thyroid hormone T3 (triiodothyronine) by outer ring deiodination. Critical for local thyroid hormone"),
    makeMarker("Fibroblast Growth Factor 23", "FGF23", "Medium", "Homo sapiens, Felis catus, Canis lupus familiaris, Mus musculus, Caenorhabditis elegans, Danio rerio, Drosophila melanogaster, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes a bone-derived phosphaturic hormone that regulates phosphate homeostasis and vitamin D metabolism by acting on the kidney."),
    makeMarker("Growth Hormone 1", "GH", "Medium", "Homo sapiens, Bos taurus, Sus scrofa, Gallus gallus, Canis lupus familiaris, Mus musculus, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes growth hormone (somatotropin), a pituitary peptide hormone that stimulates growth, cell reproduction, and IGF-1 production."),
    makeMarker("Insulin-Like Growth Factor 1", "IGF-1", "Medium", "Homo sapiens, Canis lupus familiaris, Bos taurus, Sus scrofa, Equus caballus, Mus musculus, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes insulin-like growth factor 1 (alternative notation). Same gene as IGF1; this notation is commonly used in veterinary and livestock genomics literature."),
    makeMarker("Insulin-Like Growth Factor 1", "IGF1", "Medium", "Homo sapiens, Canis lupus familiaris, Bos taurus, Sus scrofa, Mus musculus, Equus caballus, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes insulin-like growth factor 1, a major mediator of growth hormone effects that promotes cell growth, differentiation, and survival through the IGF1R signaling pathway."),
    makeMarker("Insulin-Like Growth Factor 1 Receptor", "IGF1R", "Medium", "Homo sapiens, Canis lupus familiaris, Mus musculus, Bos taurus, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes the IGF-1 receptor, a receptor tyrosine kinase that mediates IGF-1 and IGF-2 signaling to promote growth, proliferation, and survival."),
    makeMarker("Immunoglobulin Superfamily Member 1", "IGSF1", "Medium", "Homo sapiens, Canis lupus familiaris, Mus musculus, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes a membrane glycoprotein of the immunoglobulin superfamily expressed in the pituitary and testis, involved in regulating thyroid-stimulating hormone and testosterone secretion."),
    makeMarker("Melanocortin 2 Receptor", "MC2R", "Medium", "Homo sapiens, Canis lupus familiaris, Felis catus, Bos taurus, Mus musculus, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes the ACTH receptor (melanocortin-2 receptor), expressed primarily in the adrenal cortex where it mediates ACTH-stimulated cortisol production."),
    makeMarker("Nuclear Receptor Subfamily 3 Group C Member 2 (Mineralocorticoid Receptor)", "NR3C2 (MR)", "Medium", "Homo sapiens, Mus musculus, Rattus norvegicus, Danio rerio", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes the mineralocorticoid receptor that binds aldosterone and cortisol, regulating sodium and potassium balance in the kidney. Also expressed in hippocampus where it modulates stress responses."),
    makeMarker("Proopiomelanocortin", "POMC", "Medium", "Homo sapiens, Canis lupus familiaris, Mus musculus, Equus caballus, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes a polypeptide precursor that is cleaved into multiple bioactive peptides including ACTH, alpha-MSH, beta-endorphin, and beta-lipotropin. Central regulator of the stress response, appetite, and"),
    makeMarker("Parathyroid Hormone", "PTH", "Medium", "Homo sapiens, Canis lupus familiaris, Felis catus, Gallus gallus, Mus musculus, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes parathyroid hormone, the principal regulator of calcium and phosphorus homeostasis. PTH mobilizes calcium from bone, enhances renal calcium reabsorption, and stimulates renal 1,25-dihydroxyvit"),
    makeMarker("Vitamin D Receptor", "VDR", "Medium", "Homo sapiens, Gallus gallus, Bos taurus, Mus musculus, Canis lupus familiaris, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes the nuclear receptor for 1,25-dihydroxyvitamin D3 (calcitriol), mediating the genomic actions of vitamin D on calcium homeostasis, bone metabolism, immune function, and cell differentiation."),
  ]},
  { id: "epigenetics", name: "Epigenetics", color: "#6366F1", markers: [
    makeMarker("Necdin", "NDN", "Low", "Homo sapiens, Mus musculus, Caenorhabditis elegans, Danio rerio, Drosophila melanogaster, Rattus norvegicus, Saccharomyces cerevisiae", "Informational â€” no immediate clinical action required. Monitor during routine check-ups.", "Encodes necdin, a maternally imprinted, paternally expressed gene in the Prader-Willi syndrome critical region that functions as a growth suppressor in postmitotic neurons."),
    makeMarker("DNA Methyltransferase 3 Alpha", "DNMT3A", "Low", "Homo sapiens, Mus musculus, Rattus norvegicus, Danio rerio, Xenopus tropicalis, Xenopus laevis", "Informational â€” no immediate clinical action required. Monitor during routine check-ups.", "De novo DNA methyltransferase establishing new CpG methylation patterns during development; essential for genomic imprinting"),
    makeMarker("Tet Methylcytosine Dioxygenase 2", "TET2", "Low", "Homo sapiens, Mus musculus, Rattus norvegicus, Danio rerio, Xenopus tropicalis, Xenopus laevis, Drosophila melanogaster", "Informational â€” no immediate clinical action required. Monitor during routine check-ups.", "Enzyme catalyzing oxidation of 5-methylcytosine to 5-hydroxymethylcytosine; key mediator of active DNA demethylation"),
  ]},
  { id: "hematology", name: "Hematology", color: "#B91C1C", markers: [
    makeMarker("Ankyrin 1", "ANK1", "High", "Homo sapiens, Canis lupus familiaris, Mus musculus, Danio rerio, Rattus norvegicus", "Significant â€” predisposition detected. Recommend veterinary consultation and targeted screening.", "Encodes ankyrin-1, a structural protein that links the red blood cell membrane skeleton to integral membrane proteins (band 3, Rh complex). Essential for erythrocyte shape and deformability."),
    makeMarker("Solute Carrier Family 11 Member 2 (Divalent Metal Transporter 1)", "DMT1 (SLC11A2)", "High", "Homo sapiens, Mus musculus, Rattus norvegicus, Gallus gallus, Danio rerio", "Significant â€” predisposition detected. Recommend veterinary consultation and targeted screening.", "Encodes the primary intestinal iron transporter that mediates uptake of ferrous iron (Fe2+) from the gut lumen into enterocytes. Also transports iron from endosomes to cytoplasm after transferrin rece"),
    makeMarker("Coagulation Factor XII", "F12", "High", "Homo sapiens, Felis catus, Mus musculus, Danio rerio, Rattus norvegicus", "Significant â€” predisposition detected. Recommend veterinary consultation and targeted screening.", "Encodes Hageman factor, a serine protease involved in the initiation of the intrinsic coagulation pathway and the kallikrein-kinin system."),
    makeMarker("Coagulation Factor VIII", "F8", "High", "Homo sapiens, Canis lupus familiaris, Felis catus, Equus caballus, Mus musculus, Danio rerio, Rattus norvegicus", "Significant â€” predisposition detected. Recommend veterinary consultation and targeted screening.", "Encodes coagulation factor VIII, a cofactor for factor IXa in the intrinsic coagulation cascade. Deficiency causes hemophilia A."),
    makeMarker("Coagulation Factor IX", "F9", "High", "Homo sapiens, Canis lupus familiaris, Felis catus, Mus musculus, Danio rerio, Rattus norvegicus", "Significant â€” predisposition detected. Recommend veterinary consultation and targeted screening.", "Encodes coagulation factor IX (Christmas factor), a vitamin K-dependent serine protease essential for blood coagulation. Deficiency causes hemophilia B."),
    makeMarker("Pyruvate Kinase L/R", "PKLR", "High", "Homo sapiens, Canis lupus familiaris, Felis catus, Mus musculus, Danio rerio, Rattus norvegicus", "Significant â€” predisposition detected. Recommend veterinary consultation and targeted screening.", "Encodes the liver and red blood cell isoforms of pyruvate kinase, a glycolytic enzyme catalyzing the conversion of phosphoenolpyruvate to pyruvate. The R isoform is the sole glycolytic pathway in matu"),
    makeMarker("Solute Carrier Family 40 Member 1 (Ferroportin)", "SLC40A1", "High", "Homo sapiens, Mus musculus, Danio rerio, Canis lupus familiaris, Rattus norvegicus", "Significant â€” predisposition detected. Recommend veterinary consultation and targeted screening.", "Encodes ferroportin, the only known cellular iron exporter in mammals. Expressed on enterocytes, macrophages, and hepatocytes, it is essential for iron release into plasma and is regulated by hepcidin"),
    makeMarker("Solute Carrier Family 4 Member 1 (Band 3/Anion Exchanger 1)", "SLC4A1", "High", "Homo sapiens, Bos taurus, Mus musculus, Danio rerio, Rattus norvegicus", "Significant â€” predisposition detected. Recommend veterinary consultation and targeted screening.", "Encodes Band 3 protein, the major integral membrane protein of erythrocytes mediating chloride-bicarbonate exchange. Also important for CO2 transport and erythrocyte structural integrity."),
    makeMarker("Transferrin", "TF", "High", "Homo sapiens, Bos taurus, Equus caballus, Gallus gallus, Mus musculus, Danio rerio, Rattus norvegicus", "Significant â€” predisposition detected. Recommend veterinary consultation and targeted screening.", "Encodes serum transferrin, the primary iron transport protein in blood that binds ferric iron and delivers it to cells via transferrin receptor-mediated endocytosis. Essential for systemic iron distri"),
    makeMarker("Von Willebrand Factor", "VWF", "High", "Homo sapiens, Canis lupus familiaris, Sus scrofa, Mus musculus, Danio rerio, Rattus norvegicus", "Significant â€” predisposition detected. Recommend veterinary consultation and targeted screening.", "Encodes von Willebrand factor, a large multimeric glycoprotein essential for platelet adhesion to damaged endothelium and as a carrier protein for coagulation factor VIII in plasma."),
  ]},
  { id: "hepatic", name: "Hepatic", color: "#059669", markers: [
    makeMarker("ATPase Copper Transporting Beta", "ATP7B", "Medium", "Homo sapiens, Canis lupus familiaris, Rattus norvegicus, Mus musculus, Caenorhabditis elegans, Danio rerio, Drosophila melanogaster, Saccharomyces cerevisiae", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes a copper-transporting ATPase expressed primarily in the liver that incorporates copper into ceruloplasmin and mediates biliary copper excretion. Essential for copper homeostasis."),
    makeMarker("Bile Acid-CoA:Amino Acid N-Acyltransferase", "BAAT", "Medium", "Homo sapiens, Felis catus, Canis lupus familiaris, Mus musculus, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes the enzyme that conjugates bile acids with glycine or taurine in the liver, forming bile salts essential for fat digestion and absorption. Species differ in conjugation patterns."),
    makeMarker("Copper Metabolism Domain Containing 1", "COMMD1", "Medium", "Homo sapiens, Canis lupus familiaris, Mus musculus, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes COMMD1 (formerly MURR1), a protein that regulates copper homeostasis by promoting biliary copper excretion and interacting with ATP7B. Also involved in NF-kB signaling and sodium channel traff"),
    makeMarker("Cytochrome P450 Family 7 Subfamily A Member 1", "CYP7A1", "Medium", "Homo sapiens, Mus musculus, Rattus norvegicus, Felis catus, Canis lupus familiaris, Danio rerio", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes cholesterol 7-alpha-hydroxylase, the rate-limiting enzyme in the classic bile acid synthesis pathway. Controls the conversion of cholesterol to bile acids in the liver."),
  ]},
  { id: "immune", name: "Immune System", color: "#3B82F6", markers: [
    makeMarker("BF/BL Region Class IV Gene 21 (Chicken MHC)", "BFIV21", "Medium", "Gallus gallus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "A gene within the chicken MHC (B locus) BF/BL region encoding a class IV lectin-like receptor. Part of the highly compact avian MHC that controls immune responses in poultry."),
    makeMarker("Blood Group Antigen BG1 (Chicken)", "BG1", "Medium", "Gallus gallus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes a butyrophilin-like protein in the chicken MHC B locus blood group region. BG antigens are erythrocyte surface markers in poultry that serve as immunological markers linked to the MHC."),
    makeMarker("TNF Receptor Superfamily Member 4 (OX40/TNFRSF4)", "CD134", "Medium", "Homo sapiens, Felis catus, Mus musculus, Canis lupus familiaris, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes OX40 (CD134), a costimulatory receptor on activated T cells that promotes T cell survival, expansion, and cytokine production. Important in adaptive immune responses and immune regulation."),
    makeMarker("Cytidine Monophosphate-N-Acetylneuraminic Acid Hydroxylase", "CMAH", "Medium", "Homo sapiens, Felis catus, Canis lupus familiaris, Mus musculus, Sus scrofa, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes the enzyme that converts Neu5Ac (N-acetylneuraminic acid) to Neu5Gc (N-glycolylneuraminic acid) on cell surfaces. Inactivated in humans but functional in most other mammals."),
    makeMarker("Cytotoxic T-Lymphocyte Associated Protein 4", "CTLA4", "Medium", "Homo sapiens, Canis lupus familiaris, Mus musculus, Felis catus, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes a coinhibitory receptor on T cells that competes with CD28 for B7 ligand binding, delivering inhibitory signals that dampen T cell activation. A critical immune checkpoint molecule."),
    makeMarker("C-X-C Motif Chemokine Receptor 4", "CXCR4", "Medium", "Homo sapiens, Felis catus, Canis lupus familiaris, Mus musculus, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes a chemokine receptor for CXCL12 (SDF-1) that plays essential roles in hematopoietic stem cell homing, immune cell trafficking, organogenesis, and angiogenesis. Also serves as a coreceptor for "),
    makeMarker("Dog Leukocyte Antigen Class I (DLA-88)", "DLA-88", "Medium", "Canis lupus familiaris, Homo sapiens, Mus musculus, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes the major classical MHC class I molecule in dogs, responsible for presenting intracellular peptide antigens to CD8+ cytotoxic T cells. Highly polymorphic with over 50 known alleles."),
    makeMarker("Dog Leukocyte Antigen Class II DQ Beta 1", "DLA-DQB1", "Medium", "Canis lupus familiaris, Homo sapiens, Mus musculus, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes the beta chain of the DLA-DQ class II MHC molecule in dogs, which presents extracellular peptide antigens to CD4+ helper T cells. Highly polymorphic and critical for immune response specificit"),
    makeMarker("Dog Leukocyte Antigen Class II DR Beta 1", "DLA-DRB1", "Medium", "Canis lupus familiaris, Canis lupus, Homo sapiens, Mus musculus, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes the beta chain of the DLA-DR class II MHC molecule, the most polymorphic of the canine MHC class II genes. Central to adaptive immune responses and disease susceptibility in dogs."),
    makeMarker("Equine Leukocyte Antigen Class II DR Alpha", "ELA-DRA", "Medium", "Equus caballus, Homo sapiens, Mus musculus, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes the alpha chain of the MHC class II DR molecule in horses, responsible for presenting extracellular peptide antigens to CD4+ T helper cells. Part of the equine MHC (ELA) complex."),
    makeMarker("Feline Leukocyte Antigen DRB", "FLA-DRB", "Medium", "Felis catus, Homo sapiens, Mus musculus, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes the beta chain of the feline MHC class II DR molecule, critical for antigen presentation to CD4+ T helper cells in the adaptive immune response."),
    makeMarker("Feline Leukocyte Antigen E", "FLA-E", "Medium", "Felis catus, Homo sapiens, Mus musculus, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes a non-classical MHC class I molecule in cats that presents peptides to NK cells via CD94/NKG2 receptors, regulating innate immune responses."),
    makeMarker("Forkhead Box N1", "FOXN1", "Medium", "Homo sapiens, Mus musculus, Rattus norvegicus, Felis catus, Danio rerio", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes a transcription factor essential for thymic epithelial cell development and hair follicle differentiation. Loss of function causes the nude phenotype."),
    makeMarker("Interferon Alpha", "IFNA", "Medium", "Homo sapiens, Felis catus, Canis lupus familiaris, Mus musculus, Bos taurus, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes type I interferon alpha, a family of cytokines with antiviral, antiproliferative, and immunomodulatory properties secreted by leukocytes in response to viral infection."),
    makeMarker("Interleukin 1 Beta", "IL-1Î²", "Medium", "Homo sapiens, Canis lupus familiaris, Gallus gallus, Bos taurus, Felis catus, Mus musculus, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes interleukin-1 beta, a potent pro-inflammatory cytokine produced by activated macrophages that mediates fever, acute-phase responses, and inflammatory signaling."),
    makeMarker("Interleukin 6", "IL-6", "Medium", "Homo sapiens, Canis lupus familiaris, Felis catus, Bos taurus, Mus musculus, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Alternative notation for IL6. Encodes a central mediator of the acute-phase inflammatory response with roles in infection, autoimmunity, and metabolic regulation."),
    makeMarker("Interleukin 8 (CXCL8)", "IL-8", "Medium", "Homo sapiens, Bos taurus, Canis lupus familiaris, Equus caballus, Gallus gallus, Danio rerio, Mus musculus, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes interleukin-8 (CXCL8), a CXC chemokine that is a potent chemoattractant for neutrophils and plays a central role in innate immune responses and inflammation."),
    makeMarker("Interleukin 12B", "IL12B", "Medium", "Homo sapiens, Canis lupus familiaris, Felis catus, Bos taurus, Mus musculus, Caenorhabditis elegans, Danio rerio, Drosophila melanogaster, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes the p40 subunit shared by IL-12 and IL-23, key cytokines that bridge innate and adaptive immunity by promoting Th1 cell differentiation and IFN-gamma production."),
    makeMarker("Interleukin 17A", "IL17A", "Medium", "Homo sapiens, Canis lupus familiaris, Bos taurus, Felis catus, Mus musculus, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes interleukin-17A, a pro-inflammatory cytokine produced by Th17 cells that plays a critical role in mucosal immunity, neutrophil recruitment, and defense against extracellular pathogens."),
    makeMarker("Interleukin 4 Receptor Subunit Alpha", "IL4RA", "Medium", "Homo sapiens, Canis lupus familiaris, Mus musculus, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes the alpha chain of the IL-4 receptor, which also serves as a component of the IL-13 receptor. Critical for Th2 immune responses, IgE class switching, and allergic inflammation."),
    makeMarker("Interleukin 6", "IL6", "Medium", "Homo sapiens, Canis lupus familiaris, Felis catus, Bos taurus, Mus musculus, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes interleukin-6, a pleiotropic cytokine with both pro-inflammatory and anti-inflammatory properties, involved in acute-phase response, B-cell maturation, and fever induction."),
    makeMarker("Major Histocompatibility Complex", "MHC", "Medium", "Homo sapiens, Canis lupus familiaris, Felis catus, Bos taurus, Gallus gallus, Equus caballus, Danio rerio, Mus musculus, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes the major histocompatibility complex, a highly polymorphic gene region containing class I and class II genes essential for adaptive immunity and antigen presentation."),
    makeMarker("Protein Kinase, DNA-Activated, Catalytic Subunit", "PRKDC", "Medium", "Homo sapiens, Equus caballus, Canis lupus familiaris, Mus musculus, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes the catalytic subunit of DNA-dependent protein kinase (DNA-PKcs), essential for non-homologous end joining (NHEJ) DNA double-strand break repair and V(D)J recombination in immune cells."),
    makeMarker("Transferrin (Ovotransferrin/Conalbumin in Birds)", "TF (Ovotransferrin)", "Medium", "Gallus gallus, Meleagris gallopavo, Anas platyrhynchos, Danio rerio, Homo sapiens, Mus musculus, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes ovotransferrin (conalbumin) in birds, a multifunctional iron-binding glycoprotein found abundantly in egg white and serum. Functions in iron transport, innate immunity, and antimicrobial defen"),
    makeMarker("Toll-Like Receptor 3", "TLR3", "Medium", "Homo sapiens, Canis lupus familiaris, Equus caballus, Gallus gallus, Mus musculus, Caenorhabditis elegans, Danio rerio, Drosophila melanogaster, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes a pattern recognition receptor that detects double-stranded RNA from viruses, triggering innate immune responses via TRIF-dependent signaling and type I interferon production."),
    makeMarker("Toll-Like Receptor 7", "TLR7", "Medium", "Homo sapiens, Canis lupus familiaris, Gallus gallus, Mus musculus, Equus caballus, Caenorhabditis elegans, Danio rerio, Drosophila melanogaster, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes an endosomal pattern recognition receptor that detects single-stranded RNA from viruses, activating MyD88-dependent signaling to produce type I interferons and proinflammatory cytokines."),
    makeMarker("Tumor Necrosis Factor", "TNF", "Medium", "Homo sapiens, Canis lupus familiaris, Felis catus, Bos taurus, Mus musculus, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes TNF-alpha, a pleiotropic proinflammatory cytokine produced primarily by macrophages. Central mediator of systemic inflammation, immune regulation, apoptosis, and cachexia."),
    makeMarker("Toll-Like Receptor 4", "TLR4", "Medium", "Homo sapiens, Mus musculus, Drosophila melanogaster (Toll), Danio rerio, Caenorhabditis elegans, Rattus norvegicus, Xenopus laevis, Xenopus tropicalis", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Pattern recognition receptor detecting bacterial lipopolysaccharide (LPS); initiates innate immune response via NF-ÎºB signaling"),
    makeMarker("Major Histocompatibility Complex Class I B", "MHC-B", "Medium", "Gallus gallus (Chicken), Homo sapiens (HLA-B), Mus musculus (H-2), Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Cell surface glycoprotein presenting intracellular peptides to CD8+ T cells; central to adaptive immune recognition and transplant compatibility"),
    makeMarker("Interferon Gamma", "IFNG", "Medium", "Homo sapiens, Mus musculus, Danio rerio, Xenopus laevis, Xenopus tropicalis, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Pro-inflammatory cytokine produced by T cells and NK cells; activates macrophages and promotes Th1 immunity"),
    makeMarker("CRISPR Associated Protein 9", "CRISPR-CAS9", "Medium", "Streptococcus pyogenes, Streptococcus thermophilus, Escherichia coli, N/A", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Adaptive immune endonuclease in bacteria and archaea; provides sequence-specific defense against bacteriophages and plasmids"),
    makeMarker("Recombination Activating Gene 1", "RAG1", "Medium", "Homo sapiens, Mus musculus, Danio rerio (Zebrafish), Xenopus laevis, Rattus norvegicus, Saccharomyces cerevisiae, Xenopus tropicalis", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Endonuclease essential for V(D)J recombination of immunoglobulin and T-cell receptor genes; generates antibody diversity"),
    makeMarker("MX Dynamin Like GTPase 1", "MX1", "Medium", "Gallus gallus (Chicken), Homo sapiens, Mus musculus, Danio rerio, Rattus norvegicus, Saccharomyces cerevisiae, Xenopus laevis, Xenopus tropicalis", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Interferon-induced GTPase with antiviral activity against influenza and other RNA viruses; important in avian innate immunity"),
    makeMarker("Down Syndrome Cell Adhesion Molecule", "DSCAM", "Medium", "Drosophila melanogaster, Anopheles gambiae (Malaria Mosquito), Xenopus laevis, Xenopus tropicalis, Homo sapiens, Danio rerio, Mus musculus, Rattus norvegicus, Caenorhabditis elegans", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Cell adhesion molecule with extraordinary alternative splicing generating >38,000 isoforms in Drosophila; mediates self-recognition and immune defense in arthropods"),
  ]},
  { id: "longevity", name: "Longevity / Aging", color: "#A855F7", markers: [
    makeMarker("Reactive Oxygen Species Modulator 1", "ROMO1", "Low", "Homo sapiens, Mus musculus, Danio rerio, Rattus norvegicus", "Informational â€” no immediate clinical action required. Monitor during routine check-ups.", "Encodes a mitochondrial membrane protein that modulates reactive oxygen species (ROS) production. Involved in mitochondrial morphology, cell proliferation, and redox signaling."),
    makeMarker("Telomerase Reverse Transcriptase", "TERT", "Low", "Homo sapiens, Mus musculus, Heterocephalus glaber (Naked Mole-Rat), Caenorhabditis elegans, Danio rerio, Rattus norvegicus, Saccharomyces cerevisiae, Xenopus laevis, Xenopus tropicalis", "Informational â€” no immediate clinical action required. Monitor during routine check-ups.", "Catalytic subunit of telomerase; maintains telomere length by adding TTAGGG repeats to chromosome ends; prevents replicative senescence"),
    makeMarker("Sirtuin 1", "SIRT1", "Low", "Homo sapiens, Mus musculus, Rattus norvegicus, Saccharomyces cerevisiae (Sir2), Xenopus laevis, Xenopus tropicalis, Caenorhabditis elegans (sir-2.1), Danio rerio, Drosophila melanogaster", "Informational â€” no immediate clinical action required. Monitor during routine check-ups.", "NAD-dependent protein deacetylase regulating metabolism, stress resistance, and aging; key mediator of caloric restriction benefits"),
    makeMarker("Abnormal DAuer Formation 2 (Insulin/IGF-1 Receptor)", "DAF-2", "Low", "Caenorhabditis elegans, (IGF1R in Homo sapiens and Mus musculus), Danio rerio, Rattus norvegicus, Xenopus tropicalis, Drosophila melanogaster, N/A", "Informational â€” no immediate clinical action required. Monitor during routine check-ups.", "Insulin/IGF-1 receptor ortholog; master regulator of lifespan, dauer formation, and stress resistance in C. elegans"),
  ]},
  { id: "metabolism", name: "Metabolism", color: "#14B8A6", markers: [
    makeMarker("Acetyl-CoA Carboxylase Alpha", "ACACA (ACC)", "Medium", "Homo sapiens, Bos taurus, Gallus gallus, Mus musculus, Sus scrofa, Caenorhabditis elegans, Danio rerio, Drosophila melanogaster, Rattus norvegicus, Saccharomyces cerevisiae", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes the rate-limiting enzyme in de novo fatty acid synthesis, catalyzing the carboxylation of acetyl-CoA to malonyl-CoA. Plays a central role in lipogenesis regulation across species."),
    makeMarker("Aminocarboxymuconate Semialdehyde Decarboxylase", "ACMSD", "Medium", "Homo sapiens, Felis catus, Mus musculus, Rattus norvegicus, Caenorhabditis elegans, Danio rerio, Drosophila melanogaster, Saccharomyces cerevisiae", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes an enzyme in the tryptophan-kynurenine pathway that diverts tryptophan catabolism away from NAD+ synthesis toward complete oxidation. Regulates the balance between NAD+ biosynthesis and picoli"),
    makeMarker("Adiponectin, C1Q and Collagen Domain Containing", "ADIPOQ", "Medium", "Homo sapiens, Equus caballus, Felis catus, Canis lupus familiaris, Mus musculus, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes adiponectin, a hormone secreted exclusively by adipocytes that enhances insulin sensitivity, promotes fatty acid oxidation, and has anti-inflammatory properties."),
    makeMarker("ALMS1 Centrosome and Basal Body Associated Protein", "ALMS1", "Medium", "Homo sapiens, Mus musculus, Rattus norvegicus, Danio rerio", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes a large centrosomal protein involved in intracellular trafficking, ciliary function, and cell cycle regulation. Plays roles in energy homeostasis and metabolic regulation."),
    makeMarker("Argininosuccinate Synthase 1", "ASS1", "Medium", "Homo sapiens, Bos taurus, Mus musculus, Felis catus, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes argininosuccinate synthase, the rate-limiting enzyme of the urea cycle that catalyzes the condensation of citrulline and aspartate to form argininosuccinate. Essential for nitrogen waste detox"),
    makeMarker("ATPase Copper Transporting Alpha", "ATP7A", "Medium", "Homo sapiens, Mus musculus, Canis lupus familiaris, Ovis aries, Caenorhabditis elegans, Danio rerio, Drosophila melanogaster, Rattus norvegicus, Saccharomyces cerevisiae", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes a copper-transporting P-type ATPase essential for copper absorption from the intestine and delivery to copper-dependent enzymes in the secretory pathway."),
    makeMarker("Agouti-Related Protein", "AgRP", "Medium", "Homo sapiens, Mus musculus, Gallus gallus, Rattus norvegicus, Sus scrofa, Danio rerio", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes a neuropeptide expressed in the hypothalamic arcuate nucleus that acts as an inverse agonist at melanocortin receptors MC3R/MC4R. A potent orexigenic factor that stimulates food intake and red"),
    makeMarker("Cystathionine Beta-Synthase", "CBS", "Medium", "Homo sapiens, Mus musculus, Felis catus, Rattus norvegicus, Danio rerio", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes cystathionine beta-synthase, a pyridoxal phosphate-dependent enzyme that catalyzes the first step in the transsulfuration pathway, converting homocysteine to cystathionine."),
    makeMarker("CD36 Molecule (Thrombospondin Receptor)", "CD36", "Medium", "Homo sapiens, Mus musculus, Bos taurus, Sus scrofa, Gallus gallus, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes a scavenger receptor/fatty acid translocase on the cell surface that mediates uptake of long-chain fatty acids, oxidized LDL, and thrombospondin. Expressed in adipocytes, muscle, macrophages, "),
    makeMarker("Cysteine Dioxygenase Type 1", "CDO1", "Medium", "Homo sapiens, Felis catus, Mus musculus, Rattus norvegicus, Danio rerio", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes cysteine dioxygenase, the rate-limiting enzyme in cysteine catabolism that oxidizes cysteine to cysteine sulfinic acid. Regulates the balance between cysteine, taurine, and sulfate production."),
    makeMarker("CCAAT Enhancer Binding Protein Alpha", "CEBPA", "Medium", "Homo sapiens, Mus musculus, Gallus gallus, Sus scrofa, Bos taurus, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes C/EBP-alpha, a leucine zipper transcription factor essential for adipocyte differentiation, hepatocyte function, and granulocyte development. A master regulator of adipogenesis."),
    makeMarker("Cytochrome c Oxidase Subunit I (Mitochondrial)", "COI", "Medium", "All metazoans (universal barcoding gene)", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes the largest subunit of cytochrome c oxidase (Complex IV) in the mitochondrial genome. The terminal enzyme of the electron transport chain, catalyzing the transfer of electrons to molecular oxy"),
    makeMarker("Cysteine Sulfinic Acid Decarboxylase", "CSAD", "Medium", "Homo sapiens, Felis catus, Mus musculus, Rattus norvegicus, Danio rerio", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes cysteine sulfinic acid decarboxylase, the rate-limiting enzyme in the taurine biosynthesis pathway that decarboxylates cysteine sulfinic acid to hypotaurine."),
    makeMarker("ELOVL Fatty Acid Elongase 2", "ELOVL2", "Medium", "Homo sapiens, Felis catus, Mus musculus, Rattus norvegicus, Danio rerio", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes a fatty acid elongase that catalyzes the elongation of C20 and C22 polyunsaturated fatty acids (PUFAs), particularly in the DHA (docosahexaenoic acid) biosynthesis pathway."),
    makeMarker("ELOVL Fatty Acid Elongase 5", "ELOVL5", "Medium", "Homo sapiens, Felis catus, Mus musculus, Canis lupus familiaris, Gallus gallus, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes a fatty acid elongase that elongates C18-C20 polyunsaturated fatty acids, a critical step in the biosynthesis of arachidonic acid (AA) and eicosapentaenoic acid (EPA) from dietary precursors."),
    makeMarker("Fatty Acid Binding Protein 4", "FABP4 (A-FABP)", "Medium", "Homo sapiens, Bos taurus, Sus scrofa, Gallus gallus, Mus musculus, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes adipocyte fatty acid binding protein, which binds long-chain fatty acids and is involved in lipid metabolism and adipocyte differentiation."),
    makeMarker("Fatty Acid Desaturase 1", "FADS1", "Medium", "Homo sapiens, Felis catus, Canis lupus familiaris, Bos taurus, Mus musculus, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes delta-5-desaturase, a rate-limiting enzyme in the biosynthesis of long-chain polyunsaturated fatty acids (LC-PUFAs) from essential fatty acid precursors."),
    makeMarker("Fatty Acid Desaturase 2", "FADS2", "Medium", "Homo sapiens, Felis catus, Salmo salar, Mus musculus, Bos taurus, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes delta-6-desaturase, catalyzing the first and rate-limiting step in the conversion of linoleic and alpha-linolenic acids to longer-chain polyunsaturated fatty acids."),
    makeMarker("Fatty Acid Synthase", "FASN", "Medium", "Homo sapiens, Bos taurus, Gallus gallus, Sus scrofa, Mus musculus, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes the central enzyme of de novo lipogenesis, catalyzing the synthesis of long-chain fatty acids from acetyl-CoA and malonyl-CoA precursors."),
    makeMarker("Fibroblast Growth Factor 21", "FGF21", "Medium", "Homo sapiens, Mus musculus, Felis catus, Bos taurus, Caenorhabditis elegans, Danio rerio, Drosophila melanogaster, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes a hepatokine that regulates glucose and lipid metabolism, energy homeostasis, and insulin sensitivity. Acts as a metabolic hormone with endocrine functions."),
    makeMarker("Ferritin Heavy Chain 1", "FTH1", "Medium", "Homo sapiens, Equus caballus, Canis lupus familiaris, Mus musculus, Gallus gallus, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes the heavy subunit of ferritin with ferroxidase activity, essential for intracellular iron storage and protection against iron-mediated oxidative damage."),
    makeMarker("1,4-Alpha-Glucan Branching Enzyme 1", "GBE1", "Medium", "Homo sapiens, Felis catus, Equus caballus, Mus musculus, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes glycogen branching enzyme, essential for proper glycogen structure by creating branch points in the glycogen polymer."),
    makeMarker("GTP Cyclohydrolase 1", "GCH1", "Medium", "Homo sapiens, Mus musculus, Rattus norvegicus, Danio rerio", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes the rate-limiting enzyme in tetrahydrobiopterin (BH4) biosynthesis, a cofactor required for nitric oxide synthesis and aromatic amino acid hydroxylases."),
    makeMarker("Glucokinase", "GCK", "Medium", "Homo sapiens, Felis catus, Mus musculus, Rattus norvegicus, Danio rerio", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes hexokinase IV (glucokinase), a glucose sensor in pancreatic beta cells and hepatocytes that plays a central role in glucose homeostasis and insulin secretion."),
    makeMarker("Glucokinase Regulator", "GCKR", "Medium", "Homo sapiens, Mus musculus, Rattus norvegicus, Danio rerio", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes glucokinase regulatory protein, which inhibits glucokinase activity in the liver and regulates hepatic glucose metabolism in response to fructose-6-phosphate."),
    makeMarker("Ghrelin And Obestatin Prepropeptide", "GHRL", "Medium", "Homo sapiens, Canis lupus familiaris, Felis catus, Bos taurus, Mus musculus, Gallus gallus, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes the precursor of ghrelin (the 'hunger hormone') and obestatin. Ghrelin stimulates appetite, growth hormone release, and energy homeostasis."),
    makeMarker("Growth Hormone Secretagogue Receptor", "GHSR", "Medium", "Homo sapiens, Bos taurus, Sus scrofa, Canis lupus familiaris, Mus musculus, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes the ghrelin receptor (GHS-R1a), a G protein-coupled receptor that mediates ghrelin signaling to regulate appetite, energy homeostasis, and growth hormone secretion."),
    makeMarker("Galactosidase Beta 1", "GLB1", "Medium", "Homo sapiens, Felis catus, Canis lupus familiaris, Ovis aries, Mus musculus, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes beta-galactosidase, a lysosomal enzyme that cleaves terminal galactose residues from glycoconjugates. Deficiency causes GM1 gangliosidosis."),
    makeMarker("Glucagon-Like Peptide 1 Receptor", "GLP1R", "Medium", "Homo sapiens, Felis catus, Canis lupus familiaris, Mus musculus, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes the receptor for GLP-1, an incretin hormone that stimulates insulin secretion, inhibits glucagon release, and promotes beta-cell survival."),
    makeMarker("Solute Carrier Family 2 Member 1", "GLUT1 (SLC2A1)", "Medium", "Homo sapiens, Mus musculus, Gallus gallus, Rattus norvegicus, Danio rerio", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes glucose transporter type 1, the principal glucose transporter at the blood-brain barrier and in erythrocytes, mediating facilitated glucose uptake."),
    makeMarker("Solute Carrier Family 2 Member 12", "GLUT12 (SLC2A12)", "Medium", "Homo sapiens, Gallus gallus, Mus musculus, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes glucose transporter type 12, an insulin-responsive glucose transporter expressed in skeletal muscle, heart, and adipose tissue."),
    makeMarker("Solute Carrier Family 2 Member 2", "GLUT2 (SLC2A2)", "Medium", "Homo sapiens, Felis catus, Canis lupus familiaris, Mus musculus, Rattus norvegicus, Danio rerio", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes glucose transporter type 2, a low-affinity, high-capacity transporter in hepatocytes, pancreatic beta cells, and intestinal epithelium. Functions as a glucose sensor."),
    makeMarker("Solute Carrier Family 2 Member 4", "GLUT4 (SLC2A4)", "Medium", "Homo sapiens, Mus musculus, Rattus norvegicus, Bos taurus, Sus scrofa, Danio rerio", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes the insulin-responsive glucose transporter in adipose tissue and skeletal muscle. Insulin stimulates GLUT4 translocation to the plasma membrane to facilitate glucose uptake."),
    makeMarker("Glucuronidase Beta", "GUSB", "Medium", "Homo sapiens, Canis lupus familiaris, Felis catus, Mus musculus, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes beta-glucuronidase, a lysosomal enzyme that degrades glycosaminoglycans. Deficiency causes mucopolysaccharidosis type VII (MPS VII, Sly syndrome)."),
    makeMarker("Glycogen Synthase 1", "GYS1", "Medium", "Homo sapiens, Equus caballus, Mus musculus, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes the muscle isoform of glycogen synthase, the rate-limiting enzyme in glycogen biosynthesis in skeletal and cardiac muscle."),
    makeMarker("Hepcidin Antimicrobial Peptide", "HAMP", "Medium", "Homo sapiens, Canis lupus familiaris, Felis catus, Salmo salar, Mus musculus, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes hepcidin, the master regulator of systemic iron homeostasis. Hepcidin inhibits ferroportin-mediated iron export from enterocytes, macrophages, and hepatocytes."),
    makeMarker("Alpha-L-Iduronidase", "IDUA", "Medium", "Homo sapiens, Felis catus, Canis lupus familiaris, Mus musculus, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes alpha-L-iduronidase, a lysosomal enzyme required for degradation of heparan sulfate and dermatan sulfate glycosaminoglycans. Deficiency causes MPS I (Hurler/Scheie syndrome)."),
    makeMarker("Insulin Receptor", "INSR", "Medium", "Homo sapiens, Felis catus, Equus caballus, Canis lupus familiaris, Mus musculus, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes the insulin receptor, a receptor tyrosine kinase that mediates insulin signaling for glucose uptake, lipid metabolism, and cell growth."),
    makeMarker("Ketohexokinase", "KHK", "Medium", "Homo sapiens, Felis catus, Mus musculus, Rattus norvegicus, Danio rerio", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes ketohexokinase (fructokinase), the enzyme responsible for the first step of fructose metabolism, phosphorylating fructose to fructose-1-phosphate in the liver."),
    makeMarker("Leptin Receptor", "LEPR", "Medium", "Homo sapiens, Canis lupus familiaris, Mus musculus, Bos taurus, Sus scrofa, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes the receptor for leptin, a hormone produced by adipocytes that regulates energy balance, body weight, appetite, and neuroendocrine function through hypothalamic signaling."),
    makeMarker("Lipoprotein Lipase", "LPL", "Medium", "Homo sapiens, Felis catus, Bos taurus, Gallus gallus, Mus musculus, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes lipoprotein lipase, a key enzyme in triglyceride metabolism that hydrolyzes triglycerides in circulating lipoproteins, releasing fatty acids for tissue uptake."),
    makeMarker("Metallothionein (family)", "MT", "Medium", "Homo sapiens, Ovis aries, Bos taurus, Equus caballus, Mus musculus, Gallus gallus, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Refers to the metallothionein gene family encoding small, cysteine-rich proteins that bind zinc, copper, and other heavy metals, providing metal homeostasis and detoxification."),
    makeMarker("NPC Intracellular Cholesterol Transporter 1", "NPC1", "Medium", "Homo sapiens, Mus musculus, Felis catus, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Mediates intracellular cholesterol trafficking from late endosomes/lysosomes. Mutations cause Niemann-Pick type C disease, a fatal lysosomal storage disorder."),
    makeMarker("Nuclear Receptor Subfamily 4 Group A Member 3", "NR4A3", "Medium", "Homo sapiens, Mus musculus, Equus caballus, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "An orphan nuclear receptor functioning as a transcription factor involved in energy metabolism, glucose homeostasis, and skeletal muscle adaptation to exercise."),
    makeMarker("N-Terminal Asparagine Amidase 1", "NTAN1", "Medium", "Homo sapiens, Mus musculus, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes an amidase that deamidates N-terminal asparagine residues as part of the N-end rule protein degradation pathway, converting asparagine to aspartate for ubiquitin-dependent proteolysis."),
    makeMarker("Ornithine Decarboxylase Antizyme 1", "OAZ1", "Medium", "Homo sapiens, Mus musculus, Gallus gallus, Sus scrofa, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes a regulatory protein that inhibits ornithine decarboxylase (ODC), the rate-limiting enzyme in polyamine biosynthesis. OAZ1 expression is induced by polyamines via a programmed ribosomal frames"),
    makeMarker("Ornithine Transcarbamylase", "OTC", "Medium", "Homo sapiens, Mus musculus, Felis catus, Gallus gallus, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes a mitochondrial matrix enzyme catalyzing the second step of the urea cycle, converting ornithine and carbamoyl phosphate to citrulline. Essential for nitrogen waste detoxification."),
    makeMarker("Phenylalanine Hydroxylase", "PAH", "Medium", "Homo sapiens, Mus musculus, Felis catus, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes the enzyme that catalyzes the hydroxylation of phenylalanine to tyrosine, the rate-limiting step in phenylalanine catabolism. Requires tetrahydrobiopterin as a cofactor."),
    makeMarker("Phosphoenolpyruvate Carboxykinase 1 (Cytosolic)", "PCK1 (PEPCK)", "Medium", "Homo sapiens, Mus musculus, Bos taurus, Gallus gallus, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes the cytosolic form of PEPCK, a key regulatory enzyme in gluconeogenesis that catalyzes the conversion of oxaloacetate to phosphoenolpyruvate. A major control point for hepatic glucose output."),
    makeMarker("Pyruvate Dehydrogenase Kinase 4", "PDK4", "Medium", "Homo sapiens, Mus musculus, Felis catus, Equus caballus, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes a mitochondrial kinase that phosphorylates and inactivates pyruvate dehydrogenase, shifting fuel metabolism from glucose oxidation to fatty acid oxidation. Key metabolic switch during fasting."),
    makeMarker("Phospholipid Transfer Protein", "PLTP", "Medium", "Homo sapiens, Mus musculus, Gallus gallus, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes a lipid transfer protein that facilitates transfer of phospholipids between lipoproteins, playing a role in HDL metabolism and reverse cholesterol transport."),
    makeMarker("Peroxisome Proliferator Activated Receptor Gamma", "PPARG", "Medium", "Homo sapiens, Bos taurus, Sus scrofa, Mus musculus, Gallus gallus, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes a nuclear receptor transcription factor that is the master regulator of adipogenesis and a key insulin sensitizer. Target of thiazolidinedione antidiabetic drugs."),
    makeMarker("PPARG Coactivator 1 Alpha (PGC-1alpha)", "PPARGC1A", "Medium", "Homo sapiens, Equus caballus, Mus musculus, Canis lupus familiaris, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes a transcriptional coactivator that is a master regulator of mitochondrial biogenesis, oxidative metabolism, and adaptive thermogenesis. Coordinates gene expression programs for energy metaboli"),
    makeMarker("Stearoyl-CoA Desaturase", "SCD", "Medium", "Homo sapiens, Bos taurus, Sus scrofa, Mus musculus, Gallus gallus, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes the rate-limiting enzyme that catalyzes the synthesis of monounsaturated fatty acids (primarily oleic acid) from saturated fatty acids by introducing a cis double bond at the delta-9 position."),
    makeMarker("Solute Carrier Family 2 Member 2 (GLUT2)", "SLC2A2", "Medium", "Homo sapiens, Felis catus, Mus musculus, Rattus norvegicus, Danio rerio", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes the low-affinity, high-capacity facilitative glucose transporter GLUT2, expressed in hepatocytes, pancreatic beta cells, intestinal absorptive cells, and renal tubular cells. Functions as a gl"),
    makeMarker("Solute Carrier Family 2 Member 4 (GLUT4)", "SLC2A4", "Medium", "Homo sapiens, Felis catus, Equus caballus, Mus musculus, Rattus norvegicus, Danio rerio", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes the insulin-responsive glucose transporter GLUT4, which translocates from intracellular vesicles to the plasma membrane upon insulin stimulation in adipose tissue and skeletal muscle."),
    makeMarker("Sterol Regulatory Element Binding Transcription Factor 1", "SREBF1 (SREBP1)", "Medium", "Homo sapiens, Bos taurus, Gallus gallus, Mus musculus, Sus scrofa, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes SREBP-1, a master transcription factor regulating genes involved in fatty acid and cholesterol synthesis. Activated by low sterol levels and insulin signaling."),
    makeMarker("Tryptophan 2,3-Dioxygenase", "TDO2", "Medium", "Homo sapiens, Mus musculus, Gallus gallus, Rattus norvegicus, Danio rerio", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes the hepatic enzyme catalyzing the first and rate-limiting step of tryptophan catabolism through the kynurenine pathway. Regulates systemic tryptophan levels and serotonin precursor availabilit"),
    makeMarker("Leptin", "LEP", "Medium", "Homo sapiens, Mus musculus, Danio rerio, Xenopus laevis, Drosophila melanogaster, Rattus norvegicus, Xenopus tropicalis, Caenorhabditis elegans, Saccharomyces cerevisiae", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Adipocyte-derived hormone regulating energy balance by inhibiting hunger; signals fat energy stores to the hypothalamus"),
    makeMarker("Melanocortin 4 Receptor", "MC4R", "Medium", "Homo sapiens, Mus musculus, Xenopus laevis, Danio rerio, Rattus norvegicus, Xenopus tropicalis", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "G protein-coupled receptor in hypothalamus regulating appetite and energy homeostasis; target of alpha-MSH anorexigenic signaling"),
    makeMarker("Fat Mass and Obesity Associated", "FTO", "Medium", "Homo sapiens, Mus musculus, Danio rerio, Rattus norvegicus, Xenopus laevis, Xenopus tropicalis", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "RNA demethylase (N6-methyladenosine); regulates mRNA processing and energy homeostasis via effects on adipogenesis"),
    makeMarker("Insulin", "INS", "Medium", "Homo sapiens, Mus musculus, Rattus norvegicus, Caenorhabditis elegans, Danio rerio, Xenopus laevis, Drosophila melanogaster, Xenopus tropicalis, Saccharomyces cerevisiae", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Peptide hormone produced by pancreatic beta cells; regulates glucose uptake, glycogen synthesis, and lipid metabolism"),
  ]},
  { id: "musculoskeletal", name: "Musculoskeletal", color: "#78716C", markers: [
    makeMarker("Bone Gamma-Carboxyglutamic Acid Protein (Osteocalcin)", "BGLAP", "Medium", "Homo sapiens, Mus musculus, Canis lupus familiaris, Equus caballus, Bos taurus, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes osteocalcin, the most abundant non-collagenous protein in bone matrix. Secreted by osteoblasts, it regulates bone mineralization and acts as a hormone affecting glucose metabolism and male fer"),
    makeMarker("Creatine Kinase, M-Type", "CKM", "Medium", "Homo sapiens, Equus caballus, Canis lupus familiaris, Mus musculus, Gallus gallus, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes the muscle isoform of creatine kinase, catalyzing the reversible transfer of phosphate between ATP and creatine phosphate. Essential for rapid energy buffering in skeletal and cardiac muscle."),
    makeMarker("Collagen Type VI Alpha 1 Chain", "COL6A1", "Medium", "Homo sapiens, Canis lupus familiaris, Mus musculus, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes the alpha-1 chain of type VI collagen, a beaded filament collagen that forms a microfibrillar network in the extracellular matrix of muscle, skin, and connective tissues."),
    makeMarker("Myostatin", "MSTN", "Medium", "Homo sapiens, Bos taurus, Canis lupus familiaris, Ovis aries, Equus caballus, Mus musculus, Gallus gallus, Caenorhabditis elegans, Danio rerio, Drosophila melanogaster, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes myostatin (GDF-8), a negative regulator of skeletal muscle growth belonging to the TGF-beta superfamily. Loss of function causes the double-muscling phenotype."),
    makeMarker("Glycogen Phosphorylase, Muscle Associated", "PYGM", "Medium", "Homo sapiens, Bos taurus, Ovis aries, Mus musculus, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes muscle glycogen phosphorylase, the enzyme that catalyzes the rate-limiting step in glycogenolysis, releasing glucose-1-phosphate from glycogen for energy during muscle contraction."),
    makeMarker("Ryanodine Receptor 1", "RYR1", "Medium", "Homo sapiens, Sus scrofa, Canis lupus familiaris, Equus caballus, Mus musculus, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes the skeletal muscle ryanodine receptor, a massive calcium release channel in the sarcoplasmic reticulum essential for excitation-contraction coupling in skeletal muscle."),
    makeMarker("Sodium Voltage-Gated Channel Alpha Subunit 4", "SCN4A", "Medium", "Homo sapiens, Equus caballus, Mus musculus, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes the alpha subunit of the skeletal muscle voltage-gated sodium channel Nav1.4, essential for the initiation and propagation of action potentials in skeletal muscle fibers."),
  ]},
  { id: "neuroscience", name: "Neuroscience", color: "#7C3AED", markers: [
    makeMarker("Adhesion G Protein-Coupled Receptor L2", "ADGRL2", "Medium", "Homo sapiens, Canis lupus familiaris, Mus musculus, Rattus norvegicus, Danio rerio", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes latrophilin-2, a member of the adhesion GPCR family involved in synaptic function and cell adhesion. Plays roles in neuronal migration and brain development."),
    makeMarker("Activity Regulated Cytoskeleton Associated Protein", "ARC", "Medium", "Homo sapiens, Mus musculus, Rattus norvegicus, Drosophila melanogaster, Caenorhabditis elegans, Danio rerio", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes an immediate early gene product that regulates synaptic plasticity by mediating AMPA receptor endocytosis. Critical for long-term memory consolidation and synaptic scaling."),
    makeMarker("Acid Sensing Ion Channel Subunit 2", "ASIC2", "Medium", "Homo sapiens, Mus musculus, Rattus norvegicus, Danio rerio", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes a member of the degenerin/epithelial sodium channel family that is activated by extracellular protons. Expressed in sensory neurons and the brain, mediating acid-evoked pain and mechanosensati"),
    makeMarker("Ataxin 1", "ATXN1", "Medium", "Homo sapiens, Mus musculus, Rattus norvegicus, Danio rerio", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes ataxin-1, a chromatin-binding factor involved in transcriptional regulation and RNA metabolism. Contains a polyglutamine tract whose expansion causes neurodegeneration."),
    makeMarker("Calcium Voltage-Gated Channel Subunit Alpha1 D", "CACNA1D", "Medium", "Homo sapiens, Mus musculus, Rattus norvegicus, Danio rerio", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes the alpha-1D subunit of L-type calcium channels (Cav1.3), important for cardiac pacemaker activity, auditory transduction in inner hair cells, and catecholamine release from adrenal chromaffin"),
    makeMarker("Cocaine and Amphetamine Regulated Transcript Prepropeptide", "CART", "Medium", "Homo sapiens, Mus musculus, Rattus norvegicus, Gallus gallus, Sus scrofa, Danio rerio", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes CART peptides, neuropeptides widely expressed in the hypothalamus and reward circuits that regulate feeding behavior, energy homeostasis, stress responses, and reward."),
    makeMarker("Cell Adhesion Molecule L1 Like (Close Homolog of L1)", "CHL1", "Medium", "Homo sapiens, Canis lupus familiaris, Mus musculus, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes a neural cell adhesion molecule of the L1 family involved in neurite outgrowth, axon guidance, and neuronal migration during brain development."),
    makeMarker("CLN5 Intracellular Trafficking Protein", "CLN5", "Medium", "Homo sapiens, Canis lupus familiaris, Mus musculus, Ovis aries, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes a soluble lysosomal glycoprotein involved in intracellular protein sorting and sphingolipid metabolism. Mutations cause neuronal ceroid lipofuscinosis (NCL), a lysosomal storage disease."),
    makeMarker("cAMP Responsive Element Binding Protein 1", "CREB1", "Medium", "Homo sapiens, Mus musculus, Rattus norvegicus, Drosophila melanogaster, Aplysia californica, Caenorhabditis elegans, Danio rerio", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes CREB, a transcription factor activated by phosphorylation in response to cAMP signaling. A master regulator of memory consolidation, neuroplasticity, and activity-dependent gene expression."),
    makeMarker("Catenin Alpha 2", "CTNNA2", "Medium", "Homo sapiens, Canis lupus familiaris, Mus musculus, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes alpha-N-catenin, a neuronal cell adhesion molecule that links cadherins to the actin cytoskeleton at synapses. Important for synaptic stability, dendritic spine morphology, and brain developme"),
    makeMarker("Cathepsin D", "CTSD", "Medium", "Homo sapiens, Ovis aries, Mus musculus, Canis lupus familiaris, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes cathepsin D, a major lysosomal aspartyl protease responsible for intracellular protein degradation, antigen processing, and apoptosis. Essential for neuronal homeostasis and lysosomal function"),
    makeMarker("Dopamine Beta-Hydroxylase", "DBH", "Medium", "Homo sapiens, Canis lupus familiaris, Mus musculus, Rattus norvegicus, Danio rerio", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes the enzyme that converts dopamine to norepinephrine in synaptic vesicles of noradrenergic neurons and chromaffin cells. The rate-limiting step in norepinephrine biosynthesis."),
    makeMarker("Early Growth Response 1", "EGR1 (ZENK)", "Medium", "Homo sapiens, Taeniopygia guttata, Serinus canaria, Mus musculus, Gallus gallus, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes a zinc finger transcription factor that is rapidly induced by neuronal activity, growth factors, and stress. In birds, known as ZENK, it is a widely used marker for neuronal activation during "),
    makeMarker("GABA Type A Receptor Associated Protein", "GABARAP", "Medium", "Homo sapiens, Mus musculus, Rattus norvegicus, Danio rerio", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes a protein involved in GABA(A) receptor trafficking and autophagy. It facilitates the intracellular transport of GABA(A) receptors to the plasma membrane."),
    makeMarker("Glutamate Ionotropic Receptor AMPA Type Subunit 1", "GRIA1", "Medium", "Homo sapiens, Mus musculus, Rattus norvegicus, Danio rerio", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes the GluA1 subunit of AMPA-type glutamate receptors, mediating fast excitatory synaptic transmission and synaptic plasticity in the brain."),
    makeMarker("Glutamate Ionotropic Receptor NMDA Type Subunit 2B", "GRIN2B", "Medium", "Homo sapiens, Mus musculus, Canis lupus familiaris, Rattus norvegicus, Danio rerio", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes the GluN2B subunit of NMDA-type glutamate receptors, critical for synaptic plasticity, learning, memory formation, and neural development."),
    makeMarker("Glutamate Metabotropic Receptor 7", "GRM7", "Medium", "Homo sapiens, Canis lupus familiaris, Mus musculus, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes metabotropic glutamate receptor 7, a presynaptic autoreceptor that inhibits glutamate release and modulates excitatory neurotransmission."),
    makeMarker("Hexosaminidase Subunit Beta", "HEXB", "Medium", "Homo sapiens, Felis catus, Canis lupus familiaris, Mus musculus, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes the beta subunit of beta-hexosaminidase, a lysosomal enzyme that degrades GM2 ganglioside. Deficiency causes Sandhoff disease."),
    makeMarker("Heterogeneous Nuclear Ribonucleoprotein H1", "HNRNPH1", "Medium", "Homo sapiens, Mus musculus, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes an RNA-binding protein involved in pre-mRNA processing, alternative splicing, and mRNA stability regulation in the nervous system."),
    makeMarker("KIdney/BRAin Protein (WWC1)", "KIBRA", "Medium", "Homo sapiens, Mus musculus, Rattus norvegicus, Danio rerio", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes KIBRA (WWC1), a scaffold protein involved in Hippo signaling, memory consolidation, and synaptic plasticity. Highly expressed in brain and kidney."),
    makeMarker("N-Myc Downstream Regulated 1", "NDRG1", "Medium", "Homo sapiens, Canis lupus familiaris, Mus musculus, Caenorhabditis elegans, Danio rerio, Drosophila melanogaster, Rattus norvegicus, Saccharomyces cerevisiae", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes a cytoplasmic protein involved in cell differentiation, stress response, and myelination of peripheral nerves. Deficiency causes demyelinating neuropathy."),
    makeMarker("N-Methyl-D-Aspartate Receptor (GRIN1/GRIN2B subunits)", "NMDAR (GRIN1/GRIN2B)", "Medium", "Homo sapiens, Canis lupus familiaris, Felis catus, Mus musculus, Rattus norvegicus, Danio rerio", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Refers to the NMDA receptor complex, a ligand-gated ion channel composed of GRIN1 and GRIN2B subunits that mediates excitatory synaptic transmission, synaptic plasticity, and memory formation."),
    makeMarker("Opioid Receptor Mu 1", "OPRM1", "Medium", "Homo sapiens, Mus musculus, Canis lupus familiaris, Felis catus, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes the mu-opioid receptor, the primary target of endogenous endorphins and exogenous opioid analgesics. Mediates pain modulation, reward, and addictive behaviors."),
    makeMarker("Receptor For Activated C Kinase 1", "RACK1", "Medium", "Homo sapiens, Mus musculus, Rattus norvegicus, Gallus gallus, Danio rerio", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes a scaffold protein (WD40 repeat family) that anchors protein kinase C and other signaling molecules. Functions as a ribosomal protein and is involved in numerous signaling pathways."),
    makeMarker("Solute Carrier Family 1 Member 1 (EAAT3)", "SLC1A1", "Medium", "Homo sapiens, Gallus gallus, Mus musculus, Rattus norvegicus, Danio rerio", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes excitatory amino acid transporter 3 (EAAT3), the major neuronal glutamate transporter. Also transports cysteine for glutathione synthesis and is involved in renal amino acid reabsorption."),
    makeMarker("Solute Carrier Family 6 Member 1 (GAT-1)", "SLC6A1", "Medium", "Homo sapiens, Mus musculus, Rattus norvegicus, Canis lupus familiaris, Danio rerio", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes the major GABA transporter GAT-1, responsible for reuptake of gamma-aminobutyric acid from the synaptic cleft into presynaptic neurons and surrounding glia. Primary mechanism for terminating G"),
    makeMarker("SLIT-ROBO Rho GTPase Activating Protein 3", "SRGAP3", "Medium", "Homo sapiens, Mus musculus, Canis lupus familiaris, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes a Rho GTPase-activating protein that mediates SLIT-ROBO signaling for axon guidance and neuronal migration. Important in brain development and dendritic spine morphogenesis."),
    makeMarker("Synaptic Ras GTPase Activating Protein 1", "SYNGAP1", "Medium", "Homo sapiens, Mus musculus, Rattus norvegicus, Danio rerio", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes a major component of the postsynaptic density that negatively regulates Ras-MAPK signaling downstream of NMDA receptors. Critical for synaptic plasticity, learning, and memory."),
    makeMarker("Trace Amine Associated Receptor 1", "TAAR1", "Medium", "Homo sapiens, Mus musculus, Rattus norvegicus, Danio rerio", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes a G protein-coupled receptor activated by trace amines (tyramine, phenylethylamine, octopamine) and thyronamines. Modulates monoaminergic neurotransmission in the brain."),
    makeMarker("Tachykinin Precursor 1 (Substance P / Neurokinin A)", "TAC1", "Medium", "Homo sapiens, Canis lupus familiaris, Felis catus, Mus musculus, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes the precursor of substance P and neurokinin A, neuropeptides involved in pain transmission, inflammation, and mood regulation. Substance P is a key mediator in nociceptive pathways."),
    makeMarker("Tyrosine Hydroxylase", "TH", "Medium", "Homo sapiens, Mus musculus, Rattus norvegicus, Canis lupus familiaris, Danio rerio", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes the rate-limiting enzyme in catecholamine biosynthesis, catalyzing the conversion of tyrosine to L-DOPA. Essential for production of dopamine, norepinephrine, and epinephrine."),
    makeMarker("Vesicle Associated Membrane Protein 2 (Synaptobrevin-2)", "VAMP2", "Medium", "Homo sapiens, Mus musculus, Rattus norvegicus, Danio rerio", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes synaptobrevin-2, a v-SNARE protein essential for synaptic vesicle fusion with the presynaptic membrane during neurotransmitter release. A core component of the SNARE complex."),
    makeMarker("Vasoactive Intestinal Peptide", "VIP", "Medium", "Homo sapiens, Gallus gallus, Meleagris gallopavo, Mus musculus, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes vasoactive intestinal peptide, a neuropeptide with broad functions including vasodilation, smooth muscle relaxation, exocrine secretion stimulation, and immunomodulation. Also functions as a c"),
    makeMarker("Brain-Derived Neurotrophic Factor", "BDNF", "Medium", "Homo sapiens, Mus musculus, Rattus norvegicus, Xenopus laevis, Danio rerio, Xenopus tropicalis", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Neurotrophin supporting survival, growth, and differentiation of neurons; critical for synaptic plasticity and long-term memory"),
    makeMarker("Catechol-O-Methyltransferase", "COMT", "Medium", "Homo sapiens, Mus musculus, Caenorhabditis elegans, Xenopus tropicalis, Danio rerio, Rattus norvegicus, Xenopus laevis, Drosophila melanogaster, Saccharomyces cerevisiae", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Enzyme catalyzing degradation of catecholamine neurotransmitters (dopamine, epinephrine, norepinephrine) in prefrontal cortex"),
    makeMarker("Disrupted In Schizophrenia 1", "DISC1", "Medium", "Homo sapiens, Mus musculus, Rattus norvegicus, Danio rerio", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Scaffolding protein regulating neurodevelopment, neuronal migration, synaptogenesis, and cAMP signaling"),
    makeMarker("Apolipoprotein E", "APOE", "Medium", "Homo sapiens, Mus musculus, Danio rerio, Xenopus laevis, Mus musculus, Rattus norvegicus, Xenopus tropicalis", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Lipid transport protein in the CNS; mediates cholesterol delivery to neurons; role in synaptic repair and amyloid-beta clearance"),
    makeMarker("Neurexin 1", "NRXN1", "Medium", "Homo sapiens, Mus musculus, Caenorhabditis elegans, Danio rerio, Xenopus laevis, Drosophila melanogaster, Rattus norvegicus, Xenopus tropicalis, Saccharomyces cerevisiae", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Presynaptic cell adhesion molecule essential for synapse formation and neurotransmitter release; binds neuroligins"),
  ]},
  { id: "nutrition", name: "Nutrition / Digestion", color: "#22C55E", markers: [
    makeMarker("Amylase Alpha 1A", "AMY1A", "Medium", "Homo sapiens, Pan troglodytes, Danio rerio, Mus musculus, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes salivary alpha-amylase, which initiates starch digestion in the oral cavity by hydrolyzing alpha-1,4-glucosidic bonds. Copy number variation of AMY1A correlates with salivary amylase levels."),
    makeMarker("Amylase Alpha 2A", "AMY2A", "Medium", "Homo sapiens, Mus musculus, Sus scrofa, Bos taurus, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes pancreatic alpha-amylase responsible for starch digestion in the small intestine. The major enzyme for luminal hydrolysis of dietary starch in mammals."),
    makeMarker("Amylase Alpha 2B", "AMY2B", "Medium", "Canis lupus familiaris, Canis lupus, Homo sapiens, Danio rerio, Mus musculus, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes pancreatic alpha-amylase 2B involved in starch digestion. Copy number expansion of this gene is a hallmark of dog domestication and adaptation to a starch-rich diet."),
    makeMarker("Solute Carrier Family 6 Member 19", "B0AT1 (SLC6A19)", "Medium", "Homo sapiens, Mus musculus, Rattus norvegicus, Danio rerio", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes the major apical neutral amino acid transporter in the intestine and kidney proximal tubule. Responsible for absorption of tryptophan, phenylalanine, leucine, and other neutral amino acids."),
    makeMarker("Beta-Carotene Oxygenase 1", "BCMO1 (BCO1)", "Medium", "Homo sapiens, Bos taurus, Gallus gallus, Felis catus, Mus musculus, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes the central cleavage enzyme that converts beta-carotene into two molecules of retinal (vitamin A aldehyde). The primary enzyme for provitamin A bioconversion across vertebrates."),
    makeMarker("Beta-Carotene Oxygenase 1", "BCO1", "Medium", "Homo sapiens, Bos taurus, Gallus gallus, Felis catus, Mus musculus, Ovis aries, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes beta-carotene 15,15'-oxygenase, the key enzyme for symmetric cleavage of beta-carotene to retinal. Essential for vitamin A production from dietary carotenoids."),
    makeMarker("Calbindin 1", "CALB1 (Calbindin-D28K)", "Medium", "Homo sapiens, Gallus gallus, Mus musculus, Rattus norvegicus, Danio rerio", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes calbindin-D28K, a vitamin D-dependent calcium-binding protein highly expressed in the brain, kidney, and intestine. Facilitates intracellular calcium transport and buffering."),
    makeMarker("Calbindin 1 (S100G, Calbindin-D9K isoform context)", "CALB1 (Calbindin-D9K)", "Medium", "Homo sapiens, Mus musculus, Rattus norvegicus, Sus scrofa, Bos taurus, Danio rerio", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Refers to S100G/calbindin-D9K, a small vitamin D-responsive calcium-binding protein in the intestine and placenta. Facilitates transcellular calcium absorption in the duodenum. Often studied alongside"),
    makeMarker("Cholecystokinin", "CCK", "Medium", "Homo sapiens, Mus musculus, Rattus norvegicus, Canis lupus familiaris, Gallus gallus, Danio rerio", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes cholecystokinin, a peptide hormone and neuropeptide that stimulates gallbladder contraction, pancreatic enzyme secretion, and acts as a satiety signal. Produced by I-cells in the duodenum and "),
    makeMarker("Chymotrypsin Like Elastase Family Member 2A", "CELA2A", "Medium", "Homo sapiens, Canis lupus familiaris, Mus musculus, Sus scrofa, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes pancreatic elastase 2A, a serine protease secreted by the exocrine pancreas that degrades elastin and other proteins in the small intestine during protein digestion."),
    makeMarker("Cubilin", "CUBN", "Medium", "Homo sapiens, Canis lupus familiaris, Mus musculus, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes cubilin, a multiligand endocytic receptor in the intestine and kidney proximal tubule that mediates absorption of intrinsic factor-vitamin B12 complex, albumin, and other ligands."),
    makeMarker("Excitatory Amino Acid Transporter 3 (Solute Carrier Family 1 Member 1)", "EAAT3 (SLC1A1)", "Medium", "Homo sapiens, Gallus gallus, Mus musculus, Rattus norvegicus, Danio rerio", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes a high-affinity glutamate/aspartate/cysteine transporter expressed in neurons and intestinal/renal epithelium. Important for glutamate clearance at synapses and intestinal amino acid absorptio"),
    makeMarker("GC Vitamin D Binding Protein", "GC (DBP)", "Medium", "Homo sapiens, Bos taurus, Canis lupus familiaris, Mus musculus, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes the major vitamin D transport protein in plasma, responsible for binding and transporting vitamin D metabolites to target tissues."),
    makeMarker("Solute Carrier Family 7 Member 5", "LAT1 (SLC7A5)", "Medium", "Homo sapiens, Gallus gallus, Mus musculus, Rattus norvegicus, Danio rerio", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes the large neutral amino acid transporter 1, which mediates the sodium-independent transport of large neutral amino acids including leucine, isoleucine, and valine across cell membranes."),
    makeMarker("Lactase", "LCT", "Medium", "Homo sapiens, Bos taurus, Felis catus, Canis lupus familiaris, Mus musculus, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes lactase-phlorizin hydrolase, a brush-border enzyme that hydrolyzes lactose into glucose and galactose in the small intestine."),
    makeMarker("Maltase-Glucoamylase", "MGAM", "Medium", "Homo sapiens, Felis catus, Canis lupus familiaris, Gallus gallus, Mus musculus, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes maltase-glucoamylase, a brush-border enzyme that hydrolyzes alpha-1,4-linked glucose residues from maltose and starch oligosaccharides during carbohydrate digestion."),
    makeMarker("Mucin 2, Oligomeric Mucus/Gel-Forming", "MUC2", "Medium", "Homo sapiens, Canis lupus familiaris, Felis catus, Gallus gallus, Mus musculus, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes mucin 2, the major gel-forming mucin secreted by intestinal goblet cells, forming the protective mucus layer of the gastrointestinal tract."),
    makeMarker("Peptide Transporter 1 (Solute Carrier Family 15 Member 1)", "PEPT1 (SLC15A1)", "Medium", "Homo sapiens, Gallus gallus, Sus scrofa, Mus musculus, Bos taurus, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes an intestinal proton-coupled peptide transporter responsible for absorption of di- and tripeptides from dietary protein digestion. Major route for peptide-bound amino acid uptake."),
    makeMarker("Plasma Glutamate Carboxypeptidase", "PGCP", "Medium", "Homo sapiens, Mus musculus, Rattus norvegicus, Danio rerio", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes a secreted carboxypeptidase that cleaves C-terminal glutamate residues from substrates including folate. Involved in folate metabolism and potentially in extracellular peptide processing."),
    makeMarker("Phospholipase B1", "PLB1", "Medium", "Homo sapiens, Mus musculus, Rattus norvegicus, Danio rerio", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes a phospholipase that hydrolyzes fatty acyl chains from phospholipids, functioning in lipid digestion and membrane phospholipid remodeling in the intestinal brush border."),
    makeMarker("Pancreatic Lipase", "PNLIP", "Medium", "Homo sapiens, Canis lupus familiaris, Felis catus, Sus scrofa, Mus musculus, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes the classical pancreatic triacylglycerol lipase secreted into the duodenum to hydrolyze dietary triglycerides into 2-monoacylglycerol and free fatty acids for intestinal absorption."),
    makeMarker("Serine Protease 1 (Cationic Trypsinogen)", "PRSS1", "Medium", "Homo sapiens, Canis lupus familiaris, Felis catus, Mus musculus, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes cationic trypsinogen, the precursor of trypsin, the key serine protease secreted by the exocrine pancreas. Trypsin activates other pancreatic zymogens and is central to protein digestion."),
    makeMarker("Retinol Binding Protein 4", "RBP4", "Medium", "Homo sapiens, Felis catus, Canis lupus familiaris, Mus musculus, Bos taurus, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes the principal transport protein for retinol (vitamin A) in the blood, delivering retinol from hepatic stores to target tissues. Also functions as an adipokine linked to insulin resistance."),
    makeMarker("Selenoprotein P", "SELENOP", "Medium", "Homo sapiens, Bos taurus, Ovis aries, Mus musculus, Gallus gallus, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes the major selenium transport protein in plasma, containing up to 10 selenocysteine residues. Delivers selenium from the liver to peripheral tissues including brain and testes."),
    makeMarker("Selenoprotein P (SelP)", "SELENOP (SelP)", "Medium", "Homo sapiens, Mus musculus, Gallus gallus, Bos taurus, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes selenoprotein P, the principal selenium transporter in plasma containing multiple selenocysteine residues. Functions both in selenium delivery and as an antioxidant enzyme."),
    makeMarker("Sodium-Glucose Linked Transporter 1 (Solute Carrier Family 5 Member 1)", "SGLT1 (SLC5A1)", "Medium", "Homo sapiens, Gallus gallus, Bos taurus, Sus scrofa, Mus musculus, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes the sodium-dependent glucose/galactose cotransporter located on the apical membrane of intestinal enterocytes. The primary active transporter for dietary glucose absorption."),
    makeMarker("Sucrase-Isomaltase", "SI", "Medium", "Homo sapiens, Canis lupus familiaris, Felis catus, Mus musculus, Gallus gallus, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes a brush border disaccharidase that cleaves sucrose into glucose and fructose, and isomaltose into glucose units. A key enzyme for carbohydrate digestion in the small intestine."),
    makeMarker("Sucrase-Isomaltase", "SI (Sucrase-Isomaltase)", "Medium", "Homo sapiens, Mus musculus, Rattus norvegicus, Sus scrofa, Danio rerio", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes the intestinal brush border enzyme complex that hydrolyzes sucrose and isomaltose. The SI enzyme complex is a type II transmembrane glycoprotein that is proteolytically cleaved into sucrase an"),
    makeMarker("Solute Carrier Family 19 Member 3 (Thiamine Transporter 2)", "SLC19A3 (THTR2)", "Medium", "Homo sapiens, Canis lupus familiaris, Mus musculus, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes a high-affinity thiamine (vitamin B1) transporter expressed in the intestine, kidney, and brain. Essential for cellular thiamine uptake and CNS thiamine homeostasis."),
    makeMarker("Solute Carrier Family 38 Member 2 (Sodium-Coupled Neutral Amino Acid Transporter 2)", "SLC38A2 (SNAT2)", "Medium", "Homo sapiens, Gallus gallus, Sus scrofa, Mus musculus, Bos taurus, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes the System A amino acid transporter SNAT2, a sodium-dependent transporter for small neutral amino acids (alanine, serine, glutamine). Ubiquitously expressed and upregulated by amino acid depri"),
    makeMarker("Solute Carrier Family 39 Member 4 (Zinc Transporter ZIP4)", "SLC39A4 (ZIP4)", "Medium", "Homo sapiens, Bos taurus, Mus musculus, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes the primary intestinal zinc uptake transporter ZIP4, located on the apical membrane of enterocytes. Regulated by zinc status through post-translational endocytosis and degradation."),
    makeMarker("Large Neutral Amino Acid Transporter (LAT1 Complex)", "SLC3A2/SLC7A5 (LAT1)", "Medium", "Homo sapiens, Bos taurus, Mus musculus, Gallus gallus, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes the heterodimeric large neutral amino acid transporter consisting of heavy chain SLC3A2 (4F2hc/CD98) and light chain SLC7A5 (LAT1). Transports large neutral amino acids including leucine, isol"),
    makeMarker("Transient Receptor Potential Cation Channel Subfamily V Member 6", "TRPV6", "Medium", "Homo sapiens, Gallus gallus, Mus musculus, Rattus norvegicus, Danio rerio", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes a highly calcium-selective ion channel on the apical membrane of intestinal and renal epithelial cells. The primary gateway for transcellular calcium absorption in the intestine."),
    makeMarker("Alpha Tocopherol Transfer Protein", "TTPA", "Medium", "Homo sapiens, Mus musculus, Equus caballus, Bos taurus, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes the hepatic alpha-tocopherol transfer protein that selectively binds alpha-tocopherol (vitamin E) and facilitates its secretion into plasma via VLDL. Determines whole-body vitamin E status."),
  ]},
  { id: "pharmacogenomics", name: "Pharmacogenomics", color: "#E11D48", markers: [
    makeMarker("ATP Binding Cassette Subfamily B Member 1", "ABCB1", "High", "Homo sapiens, Canis lupus familiaris, Mus musculus, Felis catus, Danio rerio, Rattus norvegicus", "Significant â€” predisposition detected. Recommend veterinary consultation and targeted screening.", "Encodes P-glycoprotein (MDR1), an ATP-dependent efflux pump that transports drugs and toxins across cell membranes. Essential for the blood-brain barrier and drug disposition in veterinary and human m"),
    makeMarker("Cytochrome P450 Family 1 Subfamily A", "CYP1A", "High", "Homo sapiens, Danio rerio, Oncorhynchus mykiss, Gallus gallus, Mus musculus, Rattus norvegicus", "Significant â€” predisposition detected. Recommend veterinary consultation and targeted screening.", "Refers to the CYP1A subfamily (CYP1A1/CYP1A2) of phase I drug-metabolizing enzymes induced by aryl hydrocarbons (dioxins, PAHs). Critical for xenobiotic metabolism and bioactivation of procarcinogens."),
    makeMarker("Cytochrome P450 Family 1 Subfamily A Member 2", "CYP1A2", "High", "Homo sapiens, Canis lupus familiaris, Felis catus, Mus musculus, Rattus norvegicus, Danio rerio", "Significant â€” predisposition detected. Recommend veterinary consultation and targeted screening.", "Encodes a major hepatic drug-metabolizing enzyme responsible for metabolism of caffeine, theophylline, and many pharmaceutical compounds. Shows marked species differences in activity and inducibility."),
    makeMarker("Cytochrome P450 Family 2 Subfamily D Member 15 (Canine)", "CYP2D15", "High", "Canis lupus familiaris, Homo sapiens, Mus musculus, Rattus norvegicus", "Significant â€” predisposition detected. Recommend veterinary consultation and targeted screening.", "Encodes the canine ortholog of human CYP2D6, a cytochrome P450 enzyme responsible for phase I metabolism of numerous drugs including analgesics, antidepressants, and beta-blockers."),
    makeMarker("N-Acetyltransferase 2", "NAT2", "High", "Homo sapiens, Felis catus, Canis lupus familiaris, Mus musculus, Danio rerio, Rattus norvegicus", "Significant â€” predisposition detected. Recommend veterinary consultation and targeted screening.", "Encodes arylamine N-acetyltransferase 2, a phase II drug-metabolizing enzyme responsible for the acetylation of aromatic amines and hydrazine drugs."),
    makeMarker("UDP Glucuronosyltransferase Family 1 Member A6", "UGT1A6", "High", "Homo sapiens, Felis catus, Canis lupus familiaris, Mus musculus, Rattus norvegicus", "Significant â€” predisposition detected. Recommend veterinary consultation and targeted screening.", "Encodes a phase II drug-metabolizing enzyme that catalyzes glucuronidation of small planar phenols, including acetaminophen and other xenobiotics, for biliary and renal excretion."),
  ]},
  { id: "pigmentation", name: "Pigmentation", color: "#D946EF", markers: [
    makeMarker("Endothelin 3", "EDN3", "Low", "Homo sapiens, Gallus gallus, Mus musculus, Danio rerio, Rattus norvegicus", "Informational â€” no immediate clinical action required. Monitor during routine check-ups.", "Encodes endothelin-3, a secreted peptide that acts through EDNRB to promote melanocyte and enteric neuron development from neural crest cells. Essential for melanocyte migration and colonization of sk"),
    makeMarker("Endothelin Receptor Type B", "EDNRB", "Low", "Homo sapiens, Equus caballus, Mus musculus, Canis lupus familiaris, Danio rerio, Rattus norvegicus", "Informational â€” no immediate clinical action required. Monitor during routine check-ups.", "Encodes the endothelin B receptor, a GPCR for endothelin-3 that is essential for development of melanocytes and enteric ganglia from neural crest. Regulates melanocyte precursor migration and survival"),
    makeMarker("Myosin VA", "MYO5A", "Low", "Homo sapiens, Mus musculus, Felis catus, Equus caballus, Danio rerio, Rattus norvegicus", "Informational â€” no immediate clinical action required. Monitor during routine check-ups.", "Encodes an unconventional myosin motor protein involved in organelle transport, particularly melanosomes in melanocytes and synaptic vesicles in neurons."),
    makeMarker("Syntaxin 17", "STX17", "Low", "Equus caballus, Homo sapiens, Mus musculus, Danio rerio, Rattus norvegicus", "Informational â€” no immediate clinical action required. Monitor during routine check-ups.", "Encodes a SNARE protein involved in autophagosome-lysosome fusion and intracellular membrane trafficking. Also associated with melanocyte biology and hair graying."),
    makeMarker("Melanocortin 1 Receptor", "MC1R", "Low", "Homo sapiens, Mus musculus, Coereba flaveola (Bananaquit), Anser caerulescens (Snow Goose), Rattus norvegicus, Xenopus tropicalis, Xenopus laevis, Danio rerio", "Informational â€” no immediate clinical action required. Monitor during routine check-ups.", "G protein-coupled receptor on melanocytes controlling switch between eumelanin (dark) and pheomelanin (red/yellow) production"),
    makeMarker("Agouti Signaling Protein", "ASIP", "Low", "Mus musculus, Peromyscus polionotus (Oldfield Mouse), Homo sapiens, Xenopus laevis, Danio rerio, Xenopus tropicalis, Rattus norvegicus", "Informational â€” no immediate clinical action required. Monitor during routine check-ups.", "Paracrine signaling molecule antagonizing MC1R; causes switch from eumelanin to pheomelanin production, creating agouti banding pattern"),
    makeMarker("KIT Proto-Oncogene, Receptor Tyrosine Kinase", "KIT", "Low", "Homo sapiens, Mus musculus, Equus caballus (Horse), Rattus norvegicus, Danio rerio, Caenorhabditis elegans, Xenopus laevis, Drosophila melanogaster, Xenopus tropicalis", "Informational â€” no immediate clinical action required. Monitor during routine check-ups.", "Receptor tyrosine kinase for Stem Cell Factor (SCF); essential for melanocyte migration, survival, and proliferation; also critical for hematopoiesis and germ cells"),
    makeMarker("OCA2 Melanosomal Transmembrane Protein", "OCA2", "Low", "Homo sapiens, Mus musculus (p locus), Drosophila melanogaster, Danio rerio, Rattus norvegicus, Saccharomyces cerevisiae, Xenopus laevis, Xenopus tropicalis", "Informational â€” no immediate clinical action required. Monitor during routine check-ups.", "Melanosomal membrane protein regulating pH and melanin synthesis; major determinant of human eye color variation"),
  ]},
  { id: "renal", name: "Renal / Urinary", color: "#0891B2", markers: [
    makeMarker("Collagen Type IV Alpha 5 Chain", "COL4A5", "Medium", "Homo sapiens, Canis lupus familiaris, Mus musculus, Felis catus, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes the alpha-5 chain of type IV collagen, a major structural component of basement membranes in the kidney glomerulus, cochlea, and eye lens capsule."),
    makeMarker("Polycystin 1, Transient Receptor Potential Channel Interacting", "PKD1", "Medium", "Homo sapiens, Felis catus, Mus musculus, Canis lupus familiaris, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes polycystin-1, a large integral membrane protein involved in cell-cell and cell-matrix interactions and mechanosensation in renal tubular epithelium. Forms a complex with polycystin-2 in primar"),
    makeMarker("Polycystin 2, Transient Receptor Potential Cation Channel", "PKD2", "Medium", "Homo sapiens, Mus musculus, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes polycystin-2, a calcium-permeable cation channel that forms a receptor-channel complex with polycystin-1 in primary cilia of renal epithelial cells, sensing fluid flow."),
    makeMarker("Solute Carrier Family 34 Member 1 (NaPi-IIa)", "SLC34A1", "Medium", "Homo sapiens, Mus musculus, Rattus norvegicus, Felis catus, Caenorhabditis elegans, Danio rerio, Drosophila melanogaster", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes the sodium-dependent phosphate cotransporter NaPi-IIa in the renal proximal tubule brush border. Principal transporter for renal phosphate reabsorption, regulated by PTH and FGF23."),
  ]},
  { id: "reproduction", name: "Reproduction", color: "#F43F5E", markers: [
    makeMarker("Androgen Receptor", "AR", "Medium", "Homo sapiens, Canis lupus familiaris, Bos taurus, Mus musculus, Equus caballus, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes the androgen receptor, a nuclear steroid hormone receptor that mediates testosterone and dihydrotestosterone signaling. Essential for male sexual development, spermatogenesis, and secondary se"),
    makeMarker("Chromodomain Helicase DNA Binding Protein 1 (W and Z linked)", "CHD1-W/Z", "Medium", "Gallus gallus, Psittaciformes (parrots), Falconiformes (raptors), Passeriformes (songbirds), Caenorhabditis elegans, Danio rerio, Drosophila melanogaster, Homo sapiens, Mus musculus, Rattus norvegicus, Saccharomyces cerevisiae", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "CHD1 gene copies on the W and Z sex chromosomes in birds. Encodes a chromatin remodeling factor with size differences between W and Z copies, exploited for molecular sex determination in avian species"),
    makeMarker("Cytochrome P450 Family 19 Subfamily A Member 1", "CYP19A1 (Aromatase)", "Medium", "Homo sapiens, Gallus gallus, Equus caballus, Bos taurus, Mus musculus, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes aromatase, the enzyme that catalyzes the conversion of androgens to estrogens. The sole enzyme responsible for estrogen biosynthesis in all vertebrates, expressed in gonads, brain, adipose, an"),
    makeMarker("Estrogen Receptor 1 (ERalpha)", "ESR1", "Medium", "Homo sapiens, Sus scrofa, Bos taurus, Canis lupus familiaris, Felis catus, Mus musculus, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes estrogen receptor alpha, a nuclear hormone receptor that mediates estrogen signaling in reproductive tissues, bone, brain, and cardiovascular system. The primary mediator of estrogen action."),
    makeMarker("Estrogen Receptor 1 (ERalpha, reproductive context)", "ESR1 (ERÎ±)", "Medium", "Homo sapiens, Mus musculus, Bos taurus, Equus caballus, Gallus gallus, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes ERalpha, the principal estrogen receptor mediating reproductive tract development, ovarian cyclicity, and mammary gland biology. Essential for female fertility and estrogen-responsive gene exp"),
    makeMarker("Estrogen Receptor 2", "ESR2 (ERÎ²)", "Medium", "Homo sapiens, Mus musculus, Bos taurus, Gallus gallus, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes estrogen receptor beta, a nuclear receptor that mediates estrogen signaling involved in reproductive physiology, bone maintenance, and neuroprotection."),
    makeMarker("Prolactin", "PRL", "Medium", "Homo sapiens, Gallus gallus, Meleagris gallopavo, Mus musculus, Bos taurus, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes prolactin, a pituitary hormone with diverse functions including lactation, reproduction, immune modulation, and osmoregulation. In birds, prolactin drives broodiness and parental behavior."),
    makeMarker("Vitellogenin", "VTG", "Medium", "Gallus gallus, Danio rerio, Xenopus laevis, Oncorhynchus mykiss, Homo sapiens, Mus musculus, Rattus norvegicus, Xenopus tropicalis", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes vitellogenin, a large phospholipoglycoprotein precursor of egg yolk proteins synthesized in the liver under estrogen stimulation. Transported to the ovary for incorporation into developing ooc"),
    makeMarker("Sex Determining Region Y", "SRY", "Medium", "Homo sapiens, Mus musculus, Xenopus laevis, Rattus norvegicus, Danio rerio, Xenopus tropicalis, Drosophila melanogaster, Caenorhabditis elegans, Saccharomyces cerevisiae", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Transcription factor on Y chromosome; master switch for male sex determination initiating testis development from bipotential gonad"),
    makeMarker("Doublesex And Mab-3 Related Transcription Factor 1", "DMRT1", "Medium", "Gallus gallus (Chicken), Mus musculus, Homo sapiens, Caenorhabditis elegans (mab-3), Danio rerio, Drosophila melanogaster, Rattus norvegicus, Xenopus laevis, Xenopus tropicalis, Saccharomyces cerevisiae", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Transcription factor for sex determination and gonadal differentiation; located on Z chromosome in birds; dosage-dependent sex determination"),
    makeMarker("DEAD-Box Helicase 4 (DDX4/VASA)", "VASA", "Medium", "Drosophila melanogaster, Danio rerio (Zebrafish), Homo sapiens, Mus musculus, Caenorhabditis elegans, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "RNA helicase specifically expressed in germ cells; essential for germline specification, maintenance, and gametogenesis across metazoans"),
    makeMarker("Stimulated By Retinoic Acid 8", "STRA8", "Medium", "Mus musculus, Homo sapiens, Rattus norvegicus, Xenopus laevis, Xenopus tropicalis, Danio rerio", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Retinoic acid-responsive gene required for initiation of meiosis; gatekeeper for the mitosis-to-meiosis transition in germ cells"),
  ]},
  { id: "sensory", name: "Sensory", color: "#0EA5E9", markers: [
    makeMarker("ADAM Metallopeptidase with Thrombospondin Type 1 Motif 10", "ADAMTS10", "Medium", "Homo sapiens, Canis lupus familiaris, Mus musculus, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes a secreted metalloprotease involved in extracellular matrix assembly, particularly microfibril formation. Important in ocular development and lens zonule integrity."),
    makeMarker("Aryl Hydrocarbon Receptor Interacting Protein Like 1", "AIPL1", "Medium", "Homo sapiens, Canis lupus familiaris, Mus musculus, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes a photoreceptor-specific chaperone essential for the biosynthesis and stability of phosphodiesterase PDE6, a key phototransduction enzyme. Required for photoreceptor cell survival."),
    makeMarker("Centrosomal Protein 290", "CEP290", "Medium", "Homo sapiens, Felis catus, Mus musculus, Canis lupus familiaris, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes a centrosomal and ciliary protein essential for ciliogenesis and intraflagellar transport. Mutations cause a spectrum of ciliopathies from isolated retinal degeneration to lethal multi-organ s"),
    makeMarker("Cyclic Nucleotide Gated Channel Subunit Beta 3", "CNGB3", "Medium", "Homo sapiens, Canis lupus familiaris, Mus musculus, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes the beta subunit of the cone photoreceptor cyclic nucleotide-gated channel essential for phototransduction. Required for normal cone cell function and color vision."),
    makeMarker("Cone-Rod Homeobox", "CRX", "Medium", "Homo sapiens, Canis lupus familiaris, Felis catus, Mus musculus, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes a paired-like homeodomain transcription factor essential for photoreceptor differentiation, outer segment morphogenesis, and maintenance of both rod and cone gene expression."),
    makeMarker("Cryptochrome 4", "CRY4", "Medium", "Erithacus rubecula, Gallus gallus, Columba livia, Danio rerio, Homo sapiens, Mus musculus, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes cryptochrome 4, a flavoprotein photoreceptor proposed to function as the magnetoreceptor sensor in migratory birds. Part of the cryptochrome family involved in light-dependent magnetic compass"),
    makeMarker("Congenital Stationary Night Blindness (associated genes)", "CSNB", "Medium", "Homo sapiens, Equus caballus, Canis lupus familiaris, Mus musculus, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "CSNB refers to a group of inherited retinal disorders characterized by impaired night vision from birth due to defective signal transmission from photoreceptors to bipolar cells. Involves multiple gen"),
    makeMarker("Family With Sequence Similarity 174 Member A", "FAM174A", "Medium", "Homo sapiens, Canis lupus familiaris, Mus musculus, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes a transmembrane protein of uncertain function that has been associated with hereditary hearing loss in dogs."),
    makeMarker("G Protein Subunit Alpha Transducin 3", "GNAT3", "Medium", "Homo sapiens, Felis catus, Gallus gallus, Mus musculus, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes gustducin alpha-3, a G protein alpha subunit involved in taste signal transduction for sweet, bitter, and umami taste perception."),
    makeMarker("Olfactory Receptor Family 5 Subfamily A Member 1", "OR5A1", "Medium", "Homo sapiens, Mus musculus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes an olfactory receptor that detects beta-ionone, a key volatile compound in floral and fruit aromas. Part of the large G protein-coupled olfactory receptor gene family."),
    makeMarker("Progressive Rod-Cone Degeneration Protein", "PRCD", "Medium", "Canis lupus familiaris, Homo sapiens, Mus musculus, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes a small protein localized to photoreceptor outer segment discs, essential for photoreceptor survival and maintenance. Its exact molecular function remains under investigation."),
    makeMarker("Retinoid Isomerohydrolase RPE65", "RPE65", "Medium", "Homo sapiens, Canis lupus familiaris, Mus musculus, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes the retinal pigment epithelium isomerohydrolase that converts all-trans-retinyl esters to 11-cis-retinol, a critical step in the visual cycle that regenerates the visual chromophore."),
    makeMarker("Short Wavelength Sensitive Opsin 1 (UV/Violet Opsin)", "SWS1 (UV Opsin)", "Medium", "Gallus gallus, Taeniopygia guttata, Columba livia, Homo sapiens, Mus musculus, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes the short-wavelength-sensitive cone opsin responsible for ultraviolet or violet light detection. In birds and some reptiles, SWS1 detects UV light; in most mammals it is shifted to violet sens"),
    makeMarker("Transient Receptor Potential Cation Channel Subfamily M Member 1 (Melastatin)", "TRPM1", "Medium", "Homo sapiens, Equus caballus, Mus musculus, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes a calcium-permeable cation channel expressed in retinal ON-bipolar cells and melanocytes. Essential for the ON visual pathway that detects light increments."),
    makeMarker("Opsin 1, Long-Wave-Sensitive (Red)", "OPSIN1LW", "Medium", "Homo sapiens, Macaca fascicularis, Callithrix jacchus (Marmoset), Mus musculus, Rattus norvegicus, Danio rerio", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Photopigment in retinal cone cells absorbing long-wavelength (red) light; enables trichromatic color vision"),
    makeMarker("Cryptochrome Circadian Regulator 1", "CRY1", "Medium", "Sylvia borin (Garden Warbler), Erithacus rubecula (European Robin), Homo sapiens, Mus musculus, Rattus norvegicus, Danio rerio, Xenopus laevis, Drosophila melanogaster, Saccharomyces cerevisiae, Xenopus tropicalis", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Flavoprotein proposed to function as a magnetoreceptor in migratory birds; also core component of circadian clock"),
    makeMarker("Transient Receptor Potential Cation Channel Subfamily V Member 1", "TRPV1", "Medium", "Homo sapiens, Mus musculus, Desmodus rotundus (Vampire Bat), Caenorhabditis elegans, Drosophila melanogaster, Rattus norvegicus, Xenopus laevis, Xenopus tropicalis, Danio rerio, Saccharomyces cerevisiae", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Ion channel activated by capsaicin, heat (>43Â°C), and protons; nociceptor for thermal and chemical pain sensation"),
    makeMarker("Prestin (SLC26A5)", "PRESTIN", "Medium", "Homo sapiens, Mus musculus, Rhinolophus ferrumequinum (Horseshoe Bat), Tursiops truncatus (Dolphin), Xenopus tropicalis, Rattus norvegicus, Danio rerio, Caenorhabditis elegans, Xenopus laevis, Drosophila melanogaster", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Motor protein in outer hair cells of the cochlea; electromotile protein enabling mammalian hearing sensitivity and frequency selectivity"),
    makeMarker("Gustatory Receptor / Taste 2 Receptor family", "GR/TAS2R", "Medium", "Felis catus (Cat), Ailuropoda melanoleuca (Giant Panda), Homo sapiens, Mus musculus, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Bitter taste receptors; large gene family with species-specific expansions reflecting dietary adaptations"),
  ]},
  { id: "stress", name: "Stress Response", color: "#EA580C", markers: [
    makeMarker("Arginine Vasopressin Receptor 1B", "AVPR1B", "Medium", "Homo sapiens, Mus musculus, Canis lupus familiaris, Rattus norvegicus, Danio rerio", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes the vasopressin V1b receptor (also called V3), primarily expressed in anterior pituitary corticotrophs where it stimulates ACTH release. Modulates HPA axis activation and stress responses."),
    makeMarker("Corticotropin Releasing Hormone", "CRH", "Medium", "Homo sapiens, Mus musculus, Rattus norvegicus, Canis lupus familiaris, Equus caballus, Danio rerio", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes corticotropin-releasing hormone (CRF), the primary hypothalamic activator of the HPA stress axis. Released from the paraventricular nucleus to stimulate ACTH secretion from the anterior pituit"),
    makeMarker("Corticotropin Releasing Hormone Receptor 1", "CRHR1", "Medium", "Homo sapiens, Mus musculus, Rattus norvegicus, Canis lupus familiaris, Equus caballus, Danio rerio", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes the primary CRH receptor mediating HPA axis activation and anxiety-like behavior. A GPCR expressed in the anterior pituitary, cerebral cortex, cerebellum, and amygdala."),
    makeMarker("Corticotropin Releasing Hormone Receptor 2", "CRHR2", "Medium", "Homo sapiens, Mus musculus, Rattus norvegicus, Danio rerio", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes the type 2 CRH receptor, which mediates stress recovery, anxiolysis, and metabolic regulation. Binds CRH, urocortin II, and urocortin III with high affinity."),
    makeMarker("Dual Specificity Phosphatase 1", "DUSP1", "Medium", "Homo sapiens, Gallus gallus, Mus musculus, Rattus norvegicus, Danio rerio", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes MAP kinase phosphatase 1 (MKP-1), an immediate early gene product that dephosphorylates and inactivates MAP kinases (ERK, JNK, p38). A key negative regulator of stress-activated signaling path"),
    makeMarker("FKBP Prolyl Isomerase 5", "FKBP5", "Medium", "Homo sapiens, Canis lupus familiaris, Mus musculus, Macaca mulatta, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes an immunophilin co-chaperone that modulates glucocorticoid receptor sensitivity and is a key regulator of the stress hormone response system."),
    makeMarker("Glutathione Peroxidase (family)", "GPX", "Medium", "Homo sapiens, Bos taurus, Ovis aries, Equus caballus, Gallus gallus, Mus musculus, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Refers to the glutathione peroxidase enzyme family that catalyzes the reduction of hydroperoxides by glutathione, protecting cells from oxidative damage."),
    makeMarker("Glutathione Peroxidase 1", "GPX1", "Medium", "Homo sapiens, Gallus gallus, Bos taurus, Sus scrofa, Mus musculus, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes the most abundant selenoprotein glutathione peroxidase, providing cytosolic antioxidant defense by reducing hydrogen peroxide and organic hydroperoxides."),
    makeMarker("Heat Shock Protein 70", "HSP70", "Medium", "Homo sapiens, Gallus gallus, Bos taurus, Sus scrofa, Mus musculus, Caenorhabditis elegans, Danio rerio, Drosophila melanogaster, Rattus norvegicus, Saccharomyces cerevisiae", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes a major inducible heat shock protein that functions as a molecular chaperone, protecting cells from stress-induced protein denaturation and apoptosis."),
    makeMarker("Heat Shock Protein 90", "HSP90", "Medium", "Homo sapiens, Gallus gallus, Bos taurus, Mus musculus, Drosophila melanogaster, Caenorhabditis elegans, Danio rerio, Rattus norvegicus, Saccharomyces cerevisiae", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes a molecular chaperone essential for the maturation of signaling proteins including steroid receptors, kinases, and transcription factors under both normal and stress conditions."),
    makeMarker("Heat Shock Protein Family B Member 1", "HSPB1", "Medium", "Homo sapiens, Equus caballus, Gallus gallus, Mus musculus, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes heat shock protein 27 (HSP27), a small heat shock protein with chaperone and anti-apoptotic activity that protects cells under stress conditions."),
    makeMarker("Nuclear Receptor Subfamily 3 Group C Member 1 (Glucocorticoid Receptor)", "NR3C1 (GR)", "Medium", "Homo sapiens, Mus musculus, Rattus norvegicus, Canis lupus familiaris, Danio rerio", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes the glucocorticoid receptor, a ligand-activated transcription factor that mediates the effects of cortisol on gene expression. Central to the hypothalamic-pituitary-adrenal (HPA) axis feedback"),
    makeMarker("Superoxide Dismutase (General)", "SOD", "Medium", "Homo sapiens, Bos taurus, Gallus gallus, Mus musculus, Sus scrofa, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Refers to the superoxide dismutase enzyme family that catalyzes the dismutation of superoxide radicals into oxygen and hydrogen peroxide. First line of enzymatic antioxidant defense across all aerobic"),
    makeMarker("Superoxide Dismutase 1 (Cu/Zn-SOD)", "SOD1", "Medium", "Homo sapiens, Canis lupus familiaris, Mus musculus, Equus caballus, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes copper/zinc superoxide dismutase, a cytoplasmic enzyme that converts superoxide anions to hydrogen peroxide and oxygen. Major antioxidant defense enzyme in virtually all eukaryotic cells."),
    makeMarker("Superoxide Dismutase 2 (Mn-SOD)", "SOD2", "Medium", "Homo sapiens, Mus musculus, Bos taurus, Gallus gallus, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes manganese superoxide dismutase, localized to the mitochondrial matrix. Critical for protecting mitochondria from oxidative damage generated by the electron transport chain."),
    makeMarker("Thioredoxin Reductase 1", "TXNRD1", "Medium", "Homo sapiens, Mus musculus, Bos taurus, Gallus gallus, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes a selenoprotein that reduces thioredoxin using NADPH, maintaining cellular redox homeostasis. Part of the thioredoxin antioxidant system that protects against oxidative damage."),
  ]},
  { id: "structural", name: "Structural / Morphology", color: "#0EA5E9", markers: [
    makeMarker("Collagen Type XI Alpha 2 Chain", "COL11A2", "Medium", "Homo sapiens, Canis lupus familiaris, Mus musculus, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes the alpha-2 chain of type XI collagen, a minor fibrillar collagen important for collagen fibril spacing in cartilage, the vitreous body, and the inner ear."),
    makeMarker("Collagen Type V Alpha 1 Chain", "COL5A1", "Medium", "Homo sapiens, Canis lupus familiaris, Felis catus, Equus caballus, Mus musculus, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes the alpha-1 chain of type V collagen, a regulatory fibrillar collagen that controls the initiation and diameter of type I collagen fibrils. Important for skin, tendon, and corneal structure."),
    makeMarker("Doublesex and Mab-3 Related Transcription Factor 3", "DMRT3", "Medium", "Equus caballus, Homo sapiens, Mus musculus, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes a transcription factor expressed in spinal cord interneurons that coordinate locomotor circuits. Critical for patterning spinal interneurons involved in limb coordination during locomotion."),
    makeMarker("Fibroblast Growth Factor 4", "FGF4", "Medium", "Homo sapiens, Canis lupus familiaris, Mus musculus, Caenorhabditis elegans, Danio rerio, Drosophila melanogaster, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes a growth factor involved in limb development, embryogenesis, and cell proliferation. In dogs, a retrogene insertion causes chondrodysplasia."),
    makeMarker("High Mobility Group AT-Hook 2", "HMGA2", "Medium", "Homo sapiens, Canis lupus familiaris, Equus caballus, Mus musculus, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes a non-histone chromatin protein that modulates transcription by altering chromatin architecture. A major regulator of body size across species."),
    makeMarker("Ligand Dependent Nuclear Receptor Corepressor Like", "LCORL", "Medium", "Homo sapiens, Equus caballus, Bos taurus, Canis lupus familiaris, Mus musculus, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes a transcriptional corepressor strongly associated with body height and stature across multiple species. One of the most significant body size loci in domestic animals."),
    makeMarker("Lamin A/C", "LMNA", "Medium", "Homo sapiens, Canis lupus familiaris, Mus musculus, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes nuclear lamins A and C through alternative splicing, structural proteins of the nuclear lamina essential for nuclear integrity, chromatin organization, and gene regulation."),
    makeMarker("Methionine Sulfoxide Reductase B3", "MSRB3", "Medium", "Homo sapiens, Canis lupus familiaris, Mus musculus, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes an antioxidant enzyme that repairs oxidized methionine residues in proteins. Strongly associated with ear morphology and hearing in dogs."),
    makeMarker("Non-SMC Condensin I Complex Subunit G", "NCAPG", "Medium", "Homo sapiens, Equus caballus, Bos taurus, Canis lupus familiaris, Mus musculus, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes a subunit of the condensin I complex involved in chromosome condensation during mitosis. Strongly associated with body size in domestic animals."),
    makeMarker("Procollagen-Lysine, 2-Oxoglutarate 5-Dioxygenase 1", "PLOD1", "Medium", "Homo sapiens, Mus musculus, Felis catus, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes lysyl hydroxylase 1, which catalyzes the hydroxylation of lysine residues in collagen-like peptides. Essential for collagen crosslinking and connective tissue integrity."),
    makeMarker("Peptidylprolyl Isomerase B (Cyclophilin B)", "PPIB", "Medium", "Homo sapiens, Canis lupus familiaris, Mus musculus, Danio rerio, Rattus norvegicus", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Encodes cyclophilin B, an endoplasmic reticulum-resident peptidyl-prolyl cis-trans isomerase that assists in collagen folding and is part of the collagen prolyl 3-hydroxylation complex."),
    makeMarker("Collagen Type I Alpha 1 Chain", "COL1A1", "Medium", "Homo sapiens, Mus musculus, Bos taurus (Cattle), Danio rerio, Xenopus laevis, Rattus norvegicus, Xenopus tropicalis", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Major structural protein of bone, tendon, skin, and connective tissue; forms triple-helical collagen fibrils"),
    makeMarker("Paired Like Homeodomain 1", "PITX1", "Medium", "Gasterosteus aculeatus (Three-spined Stickleback), Homo sapiens, Mus musculus, Rattus norvegicus, Xenopus laevis, Xenopus tropicalis, Saccharomyces cerevisiae, Caenorhabditis elegans, Danio rerio, Drosophila melanogaster", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Transcription factor regulating hindlimb identity and pituitary development; key gene for limb reduction evolution"),
    makeMarker("RUNX Family Transcription Factor 2", "RUNX2", "Medium", "Homo sapiens, Canis lupus familiaris (Dog), Mus musculus, Drosophila melanogaster, Danio rerio, Xenopus laevis, Caenorhabditis elegans, Rattus norvegicus, Xenopus tropicalis", "Moderate â€” recommend carrier testing for breeding animals. Periodic screening advised.", "Master regulator of osteoblast differentiation; essential for bone formation and skeletal morphogenesis"),
  ]}
];


// Check if a marker's species field matches a given species entry
const markerMatchesSpecies = (marker, speciesId) => {
  const speciesEntry = SPECIES_DATA.find((s) => s.id === speciesId);
  if (!speciesEntry || !speciesEntry.variants) return false;
  const sp = marker.species.toLowerCase();
  return speciesEntry.variants.some((v) => sp.includes(v.toLowerCase()));
};

function MarkersAdmin() {
  const [activeView, setActiveView] = useState("species");
  const [speciesList, setSpeciesList] = useState(SPECIES_DATA.map((s) => ({ ...s })));
  const [editing, setEditing] = useState(null);
  const [saved, setSaved] = useState(false);
  const [categories, setCategories] = useState(MARKER_CATEGORIES.map((c) => ({ ...c, markers: [...c.markers] })));
  const [editingMarker, setEditingMarker] = useState(null);
  const [editMarkerValue, setEditMarkerValue] = useState({ name: "", gene: "", risk: "Low", species: "", significance: SIGNIFICANCE_OPTIONS[0], description: "" });
  const [newMarker, setNewMarker] = useState({ catId: null, name: "", gene: "", risk: "Low", species: "", significance: SIGNIFICANCE_OPTIONS[0], description: "" });
  const [viewingMarker, setViewingMarker] = useState(null);
  const [expandedCats, setExpandedCats] = useState([]);

  // Count markers that match a species across all categories
  const countMarkersForSpecies = (speciesId) => {
    return categories.reduce((sum, cat) => sum + cat.markers.filter((m) => markerMatchesSpecies(m, speciesId)).length, 0);
  };

  // Get the default species name (used to pre-fill "Affected Species" when adding from species-wise view)
  const getDefaultTaxon = (speciesId) => {
    const entry = SPECIES_DATA.find((s) => s.id === speciesId);
    return entry ? entry.name : "";
  };

  // Category-wise editing
  const startMarkerEdit = (catId, idx) => {
    const marker = categories.find((c) => c.id === catId).markers[idx];
    setEditingMarker(`${catId}-${idx}`);
    setEditMarkerValue({ ...marker });
  };
  const saveMarkerEdit = (catId, idx) => {
    setCategories((prev) => prev.map((c) => c.id === catId ? { ...c, markers: c.markers.map((m, i) => i === idx ? { ...editMarkerValue } : m) } : c));
    setEditingMarker(null);
    setEditMarkerValue({ name: "", gene: "", risk: "Low", species: "", significance: SIGNIFICANCE_OPTIONS[0], description: "" });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };
  const deleteMarker = (catId, idx) => {
    setCategories((prev) => prev.map((c) => c.id === catId ? { ...c, markers: c.markers.filter((_, i) => i !== idx) } : c));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };
  const addMarker = (catId) => {
    if (!newMarker.name.trim()) return;
    setCategories((prev) => prev.map((c) => c.id === catId ? { ...c, markers: [...c.markers, makeMarker(newMarker.name.trim(), newMarker.gene.trim(), newMarker.risk, newMarker.species.trim(), newMarker.significance, newMarker.description.trim())] } : c));
    setNewMarker({ catId: null, name: "", gene: "", risk: "Low", species: "", significance: SIGNIFICANCE_OPTIONS[0], description: "" });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
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
        <p className="text-gray-500 mb-6 ml-[52px]">View and edit markers by species or by category.</p>

        {/* Tab switcher */}
        <div className="flex gap-2 mb-6">
          <button onClick={() => setActiveView("species")} className={`px-5 py-2.5 rounded-xl text-sm font-semibold cursor-pointer transition-all ${activeView === "species" ? "text-white shadow-md" : "bg-white text-gray-600 border border-gray-200 hover:border-green-300"}`} style={activeView === "species" ? { background: `linear-gradient(135deg, ${COLORS.gradientStart}, ${COLORS.gradientEnd})` } : {}}>
            <span className="flex items-center gap-2"><Dog size={16} /> Species-wise</span>
          </button>
          <button onClick={() => setActiveView("category")} className={`px-5 py-2.5 rounded-xl text-sm font-semibold cursor-pointer transition-all ${activeView === "category" ? "text-white shadow-md" : "bg-white text-gray-600 border border-gray-200 hover:border-green-300"}`} style={activeView === "category" ? { background: `linear-gradient(135deg, ${COLORS.gradientStart}, ${COLORS.gradientEnd})` } : {}}>
            <span className="flex items-center gap-2"><GitBranch size={16} /> Category-wise</span>
          </button>
        </div>

        {saved && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-2 text-green-700">
            <Check size={18} /> Changes saved successfully.
          </div>
        )}

        {/* â•â•â• SPECIES-WISE VIEW â•â•â• */}
        {activeView === "species" && (
          <div className="space-y-3">
            {speciesList.map((s) => (
              <div key={s.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div
                  onClick={() => setEditing(editing === s.id ? null : s.id)}
                  className="flex items-center gap-4 px-6 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <span className="text-2xl">{s.icon}</span>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">{s.name}</div>
                    <div className="text-xs text-gray-400">{s.description}</div>
                  </div>
                  <span className="bg-green-50 text-green-700 font-bold text-sm px-3 py-1 rounded-full">{countMarkersForSpecies(s.id)} markers</span>
                  <ChevronDown size={18} className={`text-gray-400 transition-transform ${editing === s.id ? "rotate-180" : ""}`} />
                </div>
                {editing === s.id && (
                  <div className="px-6 pb-5 border-t border-gray-100 pt-4">
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {categories.map((cat) => {
                        const filteredMarkers = cat.markers.map((m, idx) => ({ ...m, _origIdx: idx })).filter((m) => markerMatchesSpecies(m, s.id));
                        if (filteredMarkers.length === 0) return null;
                        return (
                        <div key={cat.id} className="rounded-xl border border-gray-100 p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                            <span className="text-xs font-semibold text-gray-700">{cat.name}</span>
                            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full text-white ml-auto" style={{ backgroundColor: cat.color }}>{filteredMarkers.length}</span>
                          </div>
                          <ul className="space-y-1">
                            {filteredMarkers.map((m) => { const idx = m._origIdx; return (
                              <li key={idx} className="text-xs text-gray-500">
                                <div className="flex items-center gap-1.5 group/marker">
                                  {editingMarker === `${s.id}-${cat.id}-${idx}` ? (
                                    <div className="w-full space-y-1 py-1">
                                      <input value={editMarkerValue.name} onChange={(e) => setEditMarkerValue({ ...editMarkerValue, name: e.target.value })} placeholder="Marker Name" className="w-full px-2 py-0.5 rounded border border-green-300 text-xs focus:outline-none" autoFocus />
                                      <input value={editMarkerValue.gene} onChange={(e) => setEditMarkerValue({ ...editMarkerValue, gene: e.target.value })} placeholder="Associated Gene" className="w-full px-2 py-0.5 rounded border border-gray-200 text-xs focus:outline-none" />
                                      <select value={editMarkerValue.risk} onChange={(e) => setEditMarkerValue({ ...editMarkerValue, risk: e.target.value })} className="w-full px-2 py-0.5 rounded border border-gray-200 text-xs focus:outline-none">
                                        {RISK_LEVELS.map((r) => <option key={r} value={r}>{r}</option>)}
                                      </select>
                                      <input value={editMarkerValue.species} onChange={(e) => setEditMarkerValue({ ...editMarkerValue, species: e.target.value })} placeholder="Affected Species" className="w-full px-2 py-0.5 rounded border border-gray-200 text-xs focus:outline-none" />
                                      <select value={editMarkerValue.significance} onChange={(e) => setEditMarkerValue({ ...editMarkerValue, significance: e.target.value })} className="w-full px-2 py-0.5 rounded border border-gray-200 text-xs focus:outline-none">
                                        {SIGNIFICANCE_OPTIONS.map((sig) => <option key={sig} value={sig}>{sig.substring(0, 40)}...</option>)}
                                      </select>
                                      <textarea value={editMarkerValue.description} onChange={(e) => setEditMarkerValue({ ...editMarkerValue, description: e.target.value })} placeholder="Description" rows={2} className="w-full px-2 py-0.5 rounded border border-gray-200 text-xs focus:outline-none resize-none" />
                                      <div className="flex items-center gap-1">
                                        <button onClick={() => saveMarkerEdit(cat.id, idx)} className="text-green-600 cursor-pointer"><Check size={12} /></button>
                                        <button onClick={() => setEditingMarker(null)} className="text-gray-400 cursor-pointer"><X size={12} /></button>
                                      </div>
                                    </div>
                                  ) : (
                                    <>
                                      <div className="w-1.5 h-1.5 rounded-full bg-gray-300 shrink-0" />
                                      <span className="flex-1">{m.name}</span>
                                      <div className="hidden group-hover/marker:flex items-center gap-0.5">
                                        <button onClick={(e) => { e.stopPropagation(); setViewingMarker(viewingMarker === `${s.id}-${cat.id}-${idx}` ? null : `${s.id}-${cat.id}-${idx}`); }} className={`p-0.5 rounded cursor-pointer ${viewingMarker === `${s.id}-${cat.id}-${idx}` ? "text-blue-600" : "text-gray-400 hover:text-blue-500"}`}><Eye size={10} /></button>
                                        <button onClick={(e) => { e.stopPropagation(); setEditingMarker(`${s.id}-${cat.id}-${idx}`); setEditMarkerValue({ ...m }); }} className="p-0.5 rounded text-gray-400 hover:text-green-600 cursor-pointer"><Pencil size={10} /></button>
                                        <button onClick={(e) => { e.stopPropagation(); deleteMarker(cat.id, idx); }} className="p-0.5 rounded text-gray-400 hover:text-red-500 cursor-pointer"><Trash2 size={10} /></button>
                                      </div>
                                    </>
                                  )}
                                </div>
                                {/* Marker detail card */}
                                {viewingMarker === `${s.id}-${cat.id}-${idx}` && (
                                  <div className="mt-1 mb-2 p-3 rounded-lg border border-blue-100 bg-blue-50/50">
                                    <div className="grid grid-cols-2 gap-2">
                                      <div>
                                        <div className="text-[9px] uppercase font-semibold text-gray-400">Marker</div>
                                        <div className="text-[11px] font-bold text-gray-900">{m.name}</div>
                                      </div>
                                      <div>
                                        <div className="text-[9px] uppercase font-semibold text-gray-400">Gene</div>
                                        <div className="text-[11px] text-gray-700 font-mono">{m.gene}</div>
                                      </div>
                                      <div>
                                        <div className="text-[9px] uppercase font-semibold text-gray-400">Risk Level</div>
                                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${m.risk === "Low" ? "bg-green-100 text-green-700" : m.risk === "Medium" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>
                                          {m.risk}
                                        </span>
                                      </div>
                                      <div>
                                        <div className="text-[9px] uppercase font-semibold text-gray-400">Species</div>
                                        <div className="text-[11px] text-gray-700">{m.species}</div>
                                      </div>
                                    </div>
                                    <div className="mt-2 pt-2 border-t border-blue-100">
                                      <div className="text-[9px] uppercase font-semibold text-gray-400">Clinical Significance</div>
                                      <div className="text-[10px] text-gray-600 mt-0.5">{m.significance}</div>
                                    </div>
                                    <div className="mt-2 pt-2 border-t border-blue-100">
                                      <div className="text-[9px] uppercase font-semibold text-gray-400">Description</div>
                                      <div className="text-[10px] text-gray-600 mt-0.5">{m.description}</div>
                                    </div>
                                  </div>
                                )}
                              </li>
                            ); })}
                          </ul>
                          {/* Add marker */}
                          {newMarker.catId === `${s.id}-${cat.id}` ? (
                            <div className="space-y-1 mt-1.5 p-2 rounded-lg border border-green-200 bg-green-50/30">
                              <input value={newMarker.name} onChange={(e) => setNewMarker({ ...newMarker, name: e.target.value })} placeholder="Marker Name *" className="w-full px-2 py-0.5 rounded border border-gray-200 text-xs focus:outline-none focus:border-green-400" autoFocus />
                              <input value={newMarker.gene} onChange={(e) => setNewMarker({ ...newMarker, gene: e.target.value })} placeholder="Associated Gene" className="w-full px-2 py-0.5 rounded border border-gray-200 text-xs focus:outline-none focus:border-green-400" />
                              <select value={newMarker.risk} onChange={(e) => setNewMarker({ ...newMarker, risk: e.target.value })} className="w-full px-2 py-0.5 rounded border border-gray-200 text-xs focus:outline-none">
                                {RISK_LEVELS.map((r) => <option key={r} value={r}>{r}</option>)}
                              </select>
                              <input value={newMarker.species} onChange={(e) => setNewMarker({ ...newMarker, species: e.target.value })} placeholder="Affected Species" className="w-full px-2 py-0.5 rounded border border-gray-200 text-xs focus:outline-none focus:border-green-400" />
                              <select value={newMarker.significance} onChange={(e) => setNewMarker({ ...newMarker, significance: e.target.value })} className="w-full px-2 py-0.5 rounded border border-gray-200 text-xs focus:outline-none">
                                {SIGNIFICANCE_OPTIONS.map((sig) => <option key={sig} value={sig}>{sig.substring(0, 40)}...</option>)}
                              </select>
                              <textarea value={newMarker.description} onChange={(e) => setNewMarker({ ...newMarker, description: e.target.value })} placeholder="Description" rows={2} className="w-full px-2 py-0.5 rounded border border-gray-200 text-xs focus:outline-none resize-none focus:border-green-400" />
                              <div className="flex items-center gap-1">
                                <button onClick={() => addMarker(cat.id)} className="text-green-600 cursor-pointer"><Check size={12} /></button>
                                <button onClick={() => setNewMarker({ catId: null, name: "", gene: "", risk: "Low", species: "", significance: SIGNIFICANCE_OPTIONS[0], description: "" })} className="text-gray-400 cursor-pointer"><X size={12} /></button>
                              </div>
                            </div>
                          ) : (
                            <button onClick={(e) => { e.stopPropagation(); setNewMarker({ catId: `${s.id}-${cat.id}`, name: "", gene: "", risk: "Low", species: getDefaultTaxon(s.id), significance: SIGNIFICANCE_OPTIONS[0], description: "" }); }} className="flex items-center gap-1 mt-1.5 text-[10px] text-green-600 hover:text-green-700 font-medium cursor-pointer">
                              <Plus size={10} /> Add Marker
                            </button>
                          )}
                        </div>
                      ); })}
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-xs text-gray-400">Total markers for {s.name}: <strong className="text-gray-600">{countMarkersForSpecies(s.id)}</strong></span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* â•â•â• CATEGORY-WISE VIEW â•â•â• */}
        {activeView === "category" && (
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
                                {RISK_LEVELS.map((r) => <option key={r} value={r}>{r}</option>)}
                              </select>
                              <input value={editMarkerValue.species} onChange={(e) => setEditMarkerValue({ ...editMarkerValue, species: e.target.value })} placeholder="Affected Species" className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-100" />
                            </div>
                            <select value={editMarkerValue.significance} onChange={(e) => setEditMarkerValue({ ...editMarkerValue, significance: e.target.value })} className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-sm focus:outline-none">
                              {SIGNIFICANCE_OPTIONS.map((sig) => <option key={sig} value={sig}>{sig}</option>)}
                            </select>
                            <textarea value={editMarkerValue.description} onChange={(e) => setEditMarkerValue({ ...editMarkerValue, description: e.target.value })} placeholder="Description" rows={2} className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-sm focus:outline-none resize-none focus:ring-2 focus:ring-green-100" />
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
                            <button onClick={() => setViewingMarker(viewingMarker === `${cat.id}-${idx}` ? null : `${cat.id}-${idx}`)} className={`p-1 rounded-lg cursor-pointer ${viewingMarker === `${cat.id}-${idx}` ? "bg-blue-100 text-blue-600" : "text-gray-400 hover:bg-blue-50 hover:text-blue-500"}`}><Eye size={14} /></button>
                            <button onClick={() => startMarkerEdit(cat.id, idx)} className="p-1 rounded-lg text-gray-400 hover:bg-green-50 hover:text-green-600 cursor-pointer"><Pencil size={14} /></button>
                            <button onClick={() => deleteMarker(cat.id, idx)} className="p-1 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 cursor-pointer"><Trash2 size={14} /></button>
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
                          {RISK_LEVELS.map((r) => <option key={r} value={r}>{r}</option>)}
                        </select>
                        <input value={newMarker.species} onChange={(e) => setNewMarker({ ...newMarker, species: e.target.value })} placeholder="Affected Species" className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100" />
                      </div>
                      <select value={newMarker.significance} onChange={(e) => setNewMarker({ ...newMarker, significance: e.target.value })} className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-sm focus:outline-none">
                        {SIGNIFICANCE_OPTIONS.map((sig) => <option key={sig} value={sig}>{sig}</option>)}
                      </select>
                      <textarea value={newMarker.description} onChange={(e) => setNewMarker({ ...newMarker, description: e.target.value })} placeholder="Description" rows={2} className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-sm focus:outline-none resize-none focus:border-green-400 focus:ring-2 focus:ring-green-100" />
                      <div className="flex items-center gap-2">
                        <button onClick={() => addMarker(cat.id)} className="px-3 py-1 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 cursor-pointer text-xs font-medium flex items-center gap-1"><Check size={14} /> Add</button>
                        <button onClick={() => setNewMarker({ catId: null, name: "", gene: "", risk: "Low", species: "", significance: SIGNIFICANCE_OPTIONS[0], description: "" })} className="px-3 py-1 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 cursor-pointer text-xs font-medium flex items-center gap-1"><X size={14} /> Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => setNewMarker({ catId: cat.id, name: "", gene: "", risk: "Low", species: "", significance: SIGNIFICANCE_OPTIONS[0], description: "" })} className="flex items-center gap-1 mt-2 pt-2 border-t border-gray-100 text-xs text-green-600 hover:text-green-700 font-medium cursor-pointer">
                      <Plus size={14} /> Add Marker
                    </button>
                  )}
                </div>}
              </div>
            ))}
          </div>
        )}

        <p className="text-xs text-gray-400 mt-6 text-center">Changes are saved in the current session. Health marker counts are displayed on species cards and the Order Kit page.</p>
      </div>
    </section>
  );
}

export default function AdminPortalPage() {
  const { user, logout } = useApp();
  const [activeTab, setActiveTab] = useState("upload");

  const tabs = [
    { id: "upload", label: "Upload Report", icon: Upload },
    { id: "tracker", label: "Update Tracker", icon: RefreshCw },
    { id: "markers", label: "Markers Admin", icon: Microscope },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: COLORS.bg, color: COLORS.text }}>
      <Navbar currentPage="admin" user={user} onLogout={logout} />
      <div className="pt-20">
        <div className="sticky top-20 z-10 bg-white border-b border-gray-100 shadow-sm">
          <div className="max-w-5xl mx-auto px-6 flex gap-1 py-2">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setActiveTab(id)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all ${activeTab === id ? "bg-purple-100 text-purple-800" : "text-gray-500 hover:bg-gray-100"}`}>
                <Icon size={16} /> {label}
              </button>
            ))}
          </div>
        </div>
        {activeTab === "upload" && <UploadReport />}
        {activeTab === "tracker" && <UpdateTracker />}
        {activeTab === "markers" && <MarkersAdmin />}
      </div>
      <Footer />
    </div>
  );
}
