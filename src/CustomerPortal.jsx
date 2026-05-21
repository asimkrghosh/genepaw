import { useState } from "react";
import { useNavigate, useParams, useSearchParams, useLocation } from "react-router";
import { Search, ChevronDown, ChevronUp, Plus, X, Check, ArrowLeft, ArrowRight, Truck, FlaskConical, BarChart3, Download, Heart, Shield, Dna, Brain, Apple, Users, Microscope, Activity, AlertTriangle, Zap, TreePine, PackageCheck, TestTube, GitBranch, Share2, ShieldCheck, ChevronUp as ChUp } from "lucide-react";
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, Tooltip, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from "recharts";
import { COLORS, formatINR, Button, SectionTitle, Badge, Navbar, Footer } from "./shared.jsx";
import { useApp } from "./AppContext.jsx";
import { generateVetReportPDF } from "./reportPdf.js";
import { apiFetch } from "./api.js";
import { useQuery } from "@tanstack/react-query";

// ─── Exported constants used by AdminPortal ───
export const SPECIES_DATA = [
  { id: "human", name: "Human", icon: "🧑", description: "Primary reference genome for comparative genomics", healthMarkers: 358, popular: true, variants: ["Homo sapiens", "Homo sapiens (HLA-B)"], category: "research" },
  { id: "rat", name: "Rat", icon: "🐀", description: "Mouse & Rat — key mammalian models for pharmacology and physiology", healthMarkers: 358, popular: true, variants: ["Mus musculus", "Mus musculus (H-2)", "Mus musculus (p locus)", "Rattus norvegicus"], category: "research" },
  { id: "fish", name: "Fish", icon: "🐟", description: "Zebrafish, salmon, trout, stickleback — aquatic vertebrate models for development and evolution", healthMarkers: 347, popular: true, variants: ["Danio rerio", "Danio rerio (Zebrafish)", "Salmo salar", "Salmo salar (Atlantic Salmon)", "Oncorhynchus mykiss", "Gasterosteus aculeatus (Three-spined Stickleback)"], category: "customer" },
  { id: "dog", name: "Dog", icon: "🐕", description: "Companion animal genetics, breed health and behavior", healthMarkers: 159, popular: true, variants: ["Canis lupus", "Canis lupus familiaris", "Canis lupus familiaris (Dog)"], category: "customer" },
  { id: "bird", name: "Bird", icon: "🐦", description: "Chicken, songbirds, pigeon, turkey, duck, goose, quail, parrot, raptor — avian genomics and behavior", healthMarkers: 96, popular: true, variants: ["Gallus gallus", "Gallus gallus (Chicken)", "Taeniopygia guttata", "Taeniopygia guttata (Zebra Finch)", "Serinus canaria", "Columba livia", "Columba livia (Rock Pigeon)", "Meleagris gallopavo", "Anas platyrhynchos", "Coturnix japonica", "Psittaciformes (parrots)", "Falconiformes (raptors)"], category: "customer" },
  { id: "cat", name: "Cat", icon: "🐈", description: "Feline genetics and comparative medicine", healthMarkers: 88, popular: true, variants: ["Felis catus", "Felis catus (Cat)"], category: "customer" },
  { id: "cattle", name: "Cattle", icon: "🐄", description: "Livestock genomics and production traits", healthMarkers: 74, popular: true, variants: ["Bos taurus", "Bos taurus (Cattle)"], category: "customer" },
  { id: "roundworm", name: "Roundworm", icon: "🪱", description: "C. elegans — model for aging, neuroscience and development", healthMarkers: 63, popular: true, variants: ["Caenorhabditis elegans", "Caenorhabditis elegans (mab-3)", "Caenorhabditis elegans (sir-2.1)"], category: "research" },
  { id: "fruit_fly", name: "Fruit Fly", icon: "🪰", description: "Drosophila — foundational genetic model organism", healthMarkers: 60, popular: true, variants: ["Drosophila melanogaster", "Drosophila melanogaster (Toll)", "Drosophila melanogaster (dClock)"], category: "research" },
  { id: "frog", name: "Frog", icon: "🐸", description: "Xenopus frogs — amphibian models for embryology and development", healthMarkers: 58, popular: true, variants: ["Xenopus tropicalis", "Xenopus laevis"], category: "research" },
  { id: "horse", name: "Horse", icon: "🐴", description: "Equine genetics, performance traits and health", healthMarkers: 53, popular: true, variants: ["Equus caballus", "Equus caballus (Horse)"], category: "customer" },
  { id: "pig", name: "Pig", icon: "🐖", description: "Biomedical model and livestock genomics", healthMarkers: 35, popular: false, variants: ["Sus scrofa"], category: "customer" },
  { id: "yeast", name: "Yeast", icon: "🍞", description: "Baker's yeast — eukaryotic cell biology model", healthMarkers: 30, popular: false, variants: ["Saccharomyces cerevisiae", "Saccharomyces cerevisiae (Sir2)"], category: "research" },
  { id: "sheep", name: "Sheep", icon: "🐑", description: "Livestock genetics and wool traits", healthMarkers: 13, popular: false, variants: ["Ovis aries", "Ovis aries (Sheep)"], category: "customer" },
  { id: "primate", name: "Primate", icon: "🐒", description: "Macaques, chimpanzee and marmoset — biomedical and neuroscience models", healthMarkers: 3, popular: false, variants: ["Macaca mulatta", "Macaca mulatta (Rhesus Macaque)", "Macaca fascicularis", "Pan troglodytes", "Callithrix jacchus (Marmoset)"], category: "customer" },
  { id: "vole", name: "Vole", icon: "🐁", description: "Prairie vole & oldfield mouse — social bonding and coat color adaptation", healthMarkers: 1, popular: false, variants: ["Microtus ochrogaster", "Peromyscus polionotus (Oldfield Mouse)"], category: "research" },
  { id: "panda", name: "Panda", icon: "🐼", description: "Giant panda — conservation genomics", healthMarkers: 1, popular: false, variants: ["Ailuropoda melanoleuca (Giant Panda)"], category: "customer" },
  { id: "mole_rat", name: "Mole-Rat", icon: "🐀", description: "Naked mole-rat — extreme longevity and cancer resistance", healthMarkers: 1, popular: false, variants: ["Heterocephalus glaber (Naked Mole-Rat)"], category: "research" },
  { id: "dolphin", name: "Dolphin", icon: "🐬", description: "Marine mammal cognition and echolocation", healthMarkers: 1, popular: false, variants: ["Tursiops truncatus (Dolphin)"], category: "customer" },
  { id: "bat", name: "Bat", icon: "🦇", description: "Vampire bat and horseshoe bat — adaptation and viral immunity", healthMarkers: 1, popular: false, variants: ["Desmodus rotundus (Vampire Bat)", "Rhinolophus ferrumequinum (Horseshoe Bat)"], category: "customer" },
  { id: "python", name: "Python", icon: "🐍", description: "Burmese python — extreme metabolic adaptation", healthMarkers: 1, popular: false, variants: ["Python molurus (Burmese Python)"], category: "customer" },
  { id: "sea_slug", name: "Sea Slug", icon: "🐚", description: "Sea hare and limpet — synaptic plasticity and genome evolution", healthMarkers: 1, popular: false, variants: ["Aplysia californica", "Lottia gigantea (Owl Limpet)"], category: "research" },
  { id: "snail", name: "Snail", icon: "🐌", description: "Pond snail — molluscan neuroscience", healthMarkers: 1, popular: false, variants: ["Lymnaea stagnalis (Pond Snail)"], category: "research" },
  { id: "mosquito", name: "Mosquito", icon: "🦟", description: "Malaria mosquito — vector biology and immunity", healthMarkers: 1, popular: false, variants: ["Anopheles gambiae (Malaria Mosquito)"], category: "research" },
  { id: "bacteria", name: "Bacteria", icon: "🦠", description: "E. coli and Streptococcus — microbial models and CRISPR origins", healthMarkers: 1, popular: false, variants: ["Escherichia coli", "Streptococcus pyogenes", "Streptococcus thermophilus"], category: "research" },
];

export const STEP_TEMPLATES = [
  { id: 1, label: "Kit Ordered", icon: PackageCheck },
  { id: 2, label: "Kit Shipped", icon: Truck },
  { id: 3, label: "Sample Received", icon: FlaskConical },
  { id: 4, label: "Sequencing", icon: Dna },
  { id: 5, label: "Analysis", icon: Microscope },
  { id: 6, label: "Results Ready", icon: BarChart3 },
];

const STEP_ICON_MAP = { 1: PackageCheck, 2: Truck, 3: FlaskConical, 4: Dna, 5: Microscope, 6: BarChart3 };

const BREED_COLORS = ["#1B6B4A", "#F59E0B", "#3B82F6", "#EF4444", "#8B5CF6", "#EC4899", "#14B8A6", "#F97316"];

const TRACKING_STAGES = [
  { status: "pending", label: "Order Placed", icon: PackageCheck },
  { status: "kit_dispatched", label: "Kit Dispatched", icon: Truck },
  { status: "sample_received", label: "Sample Received", icon: FlaskConical },
  { status: "processing", label: "Processing", icon: Microscope },
  { status: "results_ready", label: "Results Ready", icon: BarChart3 },
];

const FAQS = [
  { q: "How do I collect the DNA sample?", a: "Each kit includes species-specific collection tools. For most pets, it's a simple cheek swab that takes 30 seconds. For birds, we include feather collection envelopes. For fish and reptiles, we provide water/skin swab kits. Detailed instructions are included with every kit." },
  { q: "How long does the analysis take?", a: "From the time we receive your sample, results are typically ready within 2-3 weeks. Sequencing takes about 5-7 days, and our bioinformatics analysis pipeline requires another 7-10 days to ensure accuracy." },
  { q: "What species do you support?", a: "We currently support dogs, cats, birds, fish, horses, cattle, pigs, sheep, primates, dolphins, bats, pythons, and pandas. We're constantly expanding our reference databases. If your species isn't listed, contact us — we may be able to accommodate custom requests." },
  { q: "How accurate are the breed results?", a: "Our breed identification is 95-99% accurate for well-represented breeds. We use a reference panel of over 100,000 verified samples across all supported species. For rarer breeds, we clearly indicate confidence levels." },
  { q: "Can I share results with my vet?", a: "Absolutely! Our Health + Breed and Complete Genome plans include a downloadable Vet Report PDF specifically formatted for veterinary professionals, including actionable health insights and recommended screenings." },
  { q: "Is my pet's data secure?", a: "Yes. All genetic data is encrypted at rest and in transit. We never sell individual data. Aggregated, anonymized data may be used for research to improve animal health, but you can opt out at any time." },
];

// ─── Hero ───
function Hero() {
  const navigate = useNavigate();
  const stats = [
    { value: "500K+", label: "Animals Tested" },
    { value: "1,500+", label: "Breeds Covered" },
    { value: "99.1%", label: "Accuracy Rate" },
    { value: "📍", label: "Bangalore, India" },
  ];

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden" style={{ background: `linear-gradient(135deg, ${COLORS.gradientStart} 0%, ${COLORS.primaryLight} 50%, #1a8a5e 100%)` }}>
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-white/5 rounded-full"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-white/5 rounded-full"></div>
        {[...Array(20)].map((_, i) => (
          <div key={i} className="absolute w-2 h-2 bg-white/10 rounded-full" style={{ top: `${10 + (i * 4.1) % 80}%`, left: `${5 + (i * 4.7) % 90}%` }} />
        ))}
      </div>

      <div className="relative max-w-7xl mx-auto px-6 pt-32 pb-20 grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
            <span className="text-amber-400 text-sm">🇮🇳</span>
            <span className="text-green-100 text-sm font-medium">India's Multi-Species Genomics Platform</span>
          </div>
          <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
            Decode Your Pet's <span className="text-amber-400">DNA Story</span>
          </h1>
          <p className="text-xl text-green-100 mb-8 leading-relaxed">
            From breed ancestry to health markers, behavioral traits to nutrition — unlock the complete genetic blueprint of any animal with GenePaw's advanced genomic sequencing.
          </p>
          <div className="flex flex-wrap gap-4 mb-12">
            <Button size="lg" variant="accent" onClick={() => navigate("/order-kit")}>
              Order Your Kit <ArrowRight size={20} />
            </Button>
            <Button size="lg" variant="secondary" onClick={() => navigate("/results")}>
              View Sample Results
            </Button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {stats.map((s) => (
              <div key={s.label}>
                <div className="text-2xl font-bold text-white">{s.value}</div>
                <div className="text-green-200 text-sm">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="hidden lg:block relative">
          <div className="relative w-full aspect-square max-w-md mx-auto">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-64 h-64">
                <div className="absolute inset-0 rounded-full border-2 border-white/20 animate-spin" style={{ animationDuration: "20s" }}></div>
                <div className="absolute inset-4 rounded-full border-2 border-amber-400/30 animate-spin" style={{ animationDuration: "15s", animationDirection: "reverse" }}></div>
                <div className="absolute inset-8 rounded-full border-2 border-white/10 animate-spin" style={{ animationDuration: "25s" }}></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <Dna size={64} className="text-white mx-auto mb-2" />
                    <div className="text-white text-lg font-bold">GenePaw</div>
                    <div className="text-green-200 text-sm">Genomics Lab</div>
                  </div>
                </div>
              </div>
            </div>
            {["🐕", "🐈", "🦜", "🐴", "🦁", "🐇"].map((emoji, i) => (
              <div key={i} className="absolute w-14 h-14 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center text-2xl shadow-lg" style={{ top: `${15 + Math.sin(i * 1.1) * 35}%`, left: `${15 + Math.cos(i * 1.1) * 35}%`, transform: `rotate(${i * 15}deg)` }}>
                {emoji}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none"><path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="#F8FAF9" /></svg>
      </div>
    </section>
  );
}

// ─── Species Section ───
function SpeciesSection() {
  const navigate = useNavigate();
  const { user } = useApp();
  const isAdmin = user?.role === "staff";
  const [species, setSpecies] = useState(SPECIES_DATA.filter((s) => s.category === "customer"));
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSpecies, setNewSpecies] = useState({ name: "", icon: "", description: "", healthMarkers: "" });

  const addSpecies = () => {
    if (newSpecies.name && newSpecies.description) {
      setSpecies([...species, {
        id: newSpecies.name.toLowerCase().replace(/\s+/g, "-"),
        name: newSpecies.name,
        icon: newSpecies.icon,
        description: newSpecies.description,
        healthMarkers: newSpecies.healthMarkers ? parseInt(newSpecies.healthMarkers) : 0,
        popular: false,
        custom: true,
        variants: [newSpecies.name],
      }]);
      setNewSpecies({ name: "", icon: "", description: "", healthMarkers: "" });
      setShowAddForm(false);
    }
  };

  return (
    <section id="species" className="py-24" style={{ backgroundColor: COLORS.bg }}>
      <div className="max-w-7xl mx-auto px-6">
        <SectionTitle subtitle="Supported Species" title="Genomics for Every Animal" description="We serve pet owners, breeders, and veterinarians with species-specific genomic panels." />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {species.map((s) => (
            <div key={s.id} onClick={() => !isAdmin && navigate("/order-kit", { state: { species: s } })} className={`group bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-green-200 hover:-translate-y-1 relative overflow-hidden ${!isAdmin ? "cursor-pointer" : ""}`}>
              {s.popular && <div className="absolute top-3 right-3"><Badge color={COLORS.accent}>Popular</Badge></div>}
              {s.custom && <div className="absolute top-3 right-3"><Badge color="#8B5CF6">Custom</Badge></div>}
              {s.pending && <div className="absolute top-3 right-3"><Badge color={COLORS.info}>Pending</Badge></div>}
              <div className="text-5xl mb-4">{s.icon}</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{s.name}</h3>
              <p className="text-sm text-gray-500 mb-4">{s.description}</p>
              <div className="flex gap-4 text-xs text-gray-400">
                <span><strong className="text-gray-600">{s.healthMarkers}</strong> markers</span>
              </div>
              {!isAdmin && (
                <div className="mt-4 flex items-center gap-1 text-green-600 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  Order Kit <ArrowRight size={14} />
                </div>
              )}
            </div>
          ))}

          {isAdmin && (
            !showAddForm ? (
              <div onClick={() => setShowAddForm(true)} className="bg-white rounded-2xl p-6 shadow-sm border-2 border-dashed border-purple-300 hover:border-purple-500 cursor-pointer flex flex-col items-center justify-center text-center transition-all hover:-translate-y-1">
                <div className="w-16 h-16 rounded-full bg-purple-50 flex items-center justify-center mb-4">
                  <Plus size={28} className="text-purple-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-700 mb-1">Add New Species</h3>
                <p className="text-sm text-gray-400">Admin: directly add to the platform</p>
                <Badge color="#8B5CF6">Admin Only</Badge>
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-purple-300">
                <div className="flex items-center gap-2 mb-4">
                  <ShieldCheck size={18} className="text-purple-600" />
                  <h3 className="text-lg font-bold text-gray-900">Add New Species</h3>
                </div>
                <div className="space-y-3">
                  <input value={newSpecies.name} onChange={(e) => setNewSpecies({ ...newSpecies, name: e.target.value })} placeholder="Species name" className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-purple-400" />
                  <input value={newSpecies.icon} onChange={(e) => setNewSpecies({ ...newSpecies, icon: e.target.value })} placeholder="Emoji icon (e.g. 🦅)" className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-purple-400" />
                  <textarea value={newSpecies.description} onChange={(e) => setNewSpecies({ ...newSpecies, description: e.target.value })} placeholder="Species description..." rows={2} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-purple-400 resize-none" />
                  <input value={newSpecies.healthMarkers} onChange={(e) => setNewSpecies({ ...newSpecies, healthMarkers: e.target.value })} placeholder="# Markers" className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-purple-400" />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={addSpecies}><Plus size={14} /> Add Species</Button>
                    <Button size="sm" variant="ghost" onClick={() => setShowAddForm(false)}>Cancel</Button>
                  </div>
                </div>
              </div>
            )
          )}

          {!isAdmin && (
            <div
              onClick={() => navigate("/order-kit", { state: { species: { id: "other", name: "Other Species", icon: "❓", isCustom: true, variants: [] } } })}
              className="bg-white rounded-2xl p-6 shadow-sm border-2 border-dashed border-gray-200 hover:border-amber-400 cursor-pointer flex flex-col items-center justify-center text-center transition-all hover:-translate-y-1"
            >
              <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center mb-4">
                <PackageCheck size={28} className="text-amber-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-700 mb-1">Species Not Listed?</h3>
              <p className="text-sm text-gray-400">Order a kit for any unlisted species</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// ─── How It Works ───
function HowItWorks() {
  const steps = [
    { num: 1, icon: PackageCheck, title: "Order Your Kit", desc: "Choose your species and plan. We'll ship a collection kit with species-specific tools to your door within 2-3 days.", color: COLORS.info },
    { num: 2, icon: TestTube, title: "Collect Sample", desc: "Follow the simple included instructions. Cheek swabs for mammals, feather envelopes for birds, water swabs for aquatic species.", color: COLORS.accent },
    { num: 3, icon: Truck, title: "Ship It Back", desc: "Use the prepaid return label to send your sample to our CLIA-certified genomics laboratory.", color: "#8B5CF6" },
    { num: 4, icon: Dna, title: "We Sequence", desc: "Our next-generation sequencing pipeline processes your sample, analyzing millions of genetic markers.", color: COLORS.primary },
    { num: 5, icon: Microscope, title: "Analysis", desc: "Our bioinformatics engine aligns sequences against our reference database of 100K+ verified genomes.", color: COLORS.danger },
    { num: 6, icon: BarChart3, title: "Get Results", desc: "Access your comprehensive report: breed composition, health markers, behavior, nutrition, and more.", color: COLORS.primaryLight },
  ];

  return (
    <section id="how" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <SectionTitle subtitle="The Process" title="How GenePaw Works" description="From ordering to results in as little as 2-3 weeks. Our streamlined process makes animal genomics accessible to everyone." />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {steps.map((s) => (
            <div key={s.num} className="relative group">
              <div className="bg-gray-50 rounded-2xl p-8 hover:bg-white hover:shadow-xl transition-all duration-300 border border-transparent hover:border-gray-100 h-full">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: s.color }}>
                    <s.icon size={22} />
                  </div>
                  <span className="text-5xl font-bold text-gray-100 group-hover:text-gray-200 transition-colors">{s.num}</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{s.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Kit Tracking ───
function KitTracking({ prefilledId } = {}) {
  const { kits } = useApp();
  const [trackingId, setTrackingId] = useState(prefilledId || "");
  const [inputId, setInputId] = useState(prefilledId || "");
  const [searched, setSearched] = useState(!!prefilledId);
  const [showResults, setShowResults] = useState(false);
  const [activeTab, setActiveTab] = useState("breed");
  const [notFound, setNotFound] = useState(prefilledId ? !kits[prefilledId] : false);

  const kit = kits[trackingId];

  const handleTrack = () => {
    const id = inputId.trim();
    if (!id) return;
    setTrackingId(id);
    setSearched(true);
    setShowResults(false);
    setActiveTab("breed");
    setNotFound(!kits[id]);
  };

  const statusColors = { clear: "#22C55E", carrier: "#F59E0B", at_risk: "#EF4444" };
  const statusLabels = { clear: "Clear", carrier: "Carrier", at_risk: "At Risk" };

  const tabs = [
    { id: "breed", label: "Breed Ancestry", icon: GitBranch },
    { id: "health", label: "Health Markers", icon: Heart },
    { id: "behavior", label: "Behavior", icon: Brain },
    { id: "nutrition", label: "Nutrition", icon: Apple },
    { id: "relatives", label: "Relatives", icon: Users },
  ];

  return (
    <section id="tracking" className="py-24 bg-white">
      <div className="max-w-5xl mx-auto px-6">
        <SectionTitle subtitle="Track Your Kit" title="Sample Tracking Dashboard" description="Enter your kit ID to see real-time status updates and view your results when ready." />

        <div className="flex gap-3 max-w-lg mx-auto mb-4">
          <input value={inputId} onChange={(e) => setInputId(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleTrack()} placeholder="Enter Kit ID (e.g., GP-2026-XXXXXXX)" className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100" />
          <Button onClick={handleTrack}><Search size={18} /> Track</Button>
        </div>

        <div className="max-w-lg mx-auto mb-12">
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-gray-400">
            <span>Try:</span>
            <button onClick={() => setInputId("GP-2026-0847291")} className="px-2 py-1 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-600 cursor-pointer transition-all font-mono">GP-2026-0847291</button>
            <span className="text-gray-300">(in progress)</span>
            <button onClick={() => setInputId("GP-2026-0612483")} className="px-2 py-1 rounded-md bg-green-50 hover:bg-green-100 text-green-700 cursor-pointer transition-all font-mono">GP-2026-0612483</button>
            <span className="text-gray-300">(results ready)</span>
          </div>
        </div>

        {searched && notFound && (
          <div className="max-w-lg mx-auto p-6 bg-red-50 rounded-2xl text-center">
            <AlertTriangle size={32} className="text-red-400 mx-auto mb-3" />
            <h3 className="font-bold text-gray-900 mb-1">Kit Not Found</h3>
            <p className="text-sm text-gray-500">No kit found with ID <span className="font-mono font-bold">{trackingId}</span>. Please check your ID and try again.</p>
          </div>
        )}

        {kit && (
          <div className="bg-gray-50 rounded-3xl p-8">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center text-2xl">{kit.icon}</div>
                <div>
                  <div className="font-bold text-gray-900 text-lg">{kit.petName}'s Kit — <span className="font-mono text-sm text-gray-500">{trackingId}</span></div>
                  <div className="text-sm text-gray-400">Ordered {kit.orderDate} • {kit.plan} Plan • {kit.species}</div>
                </div>
              </div>
              {kit.status === "completed" && <Badge color="#22C55E">Results Ready</Badge>}
              {kit.status === "in_progress" && <Badge color={COLORS.accent}>In Progress</Badge>}
            </div>

            {/* Timeline — Desktop */}
            <div className="hidden sm:block relative mb-6">
              <div className="absolute top-6 left-0 right-0 h-1 bg-gray-200 rounded-full">
                <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${kit.progress}%`, background: kit.status === "completed" ? `linear-gradient(90deg, ${COLORS.gradientStart}, #22C55E)` : `linear-gradient(90deg, ${COLORS.gradientStart}, ${COLORS.gradientEnd})` }} />
              </div>
              <div className="relative grid grid-cols-6 gap-4">
                {kit.steps.map((s) => {
                  const StepIcon = s.icon || STEP_ICON_MAP[s.id] || PackageCheck;
                  return (
                    <div key={s.id} className="flex flex-col items-center text-center">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center z-10 transition-all ${s.done ? "text-white shadow-lg" : s.active ? "text-white animate-pulse shadow-xl" : "bg-gray-200 text-gray-400"}`} style={s.done || s.active ? { background: `linear-gradient(135deg, ${COLORS.gradientStart}, ${COLORS.gradientEnd})` } : {}}>
                        <StepIcon size={20} />
                      </div>
                      <div className={`mt-3 text-xs font-semibold ${s.done || s.active ? "text-green-700" : "text-gray-400"}`}>{s.label}</div>
                      <div className={`text-xs mt-1 ${s.active ? "text-amber-600 font-bold" : "text-gray-400"}`}>{s.date}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Timeline — Mobile */}
            <div className="sm:hidden space-y-4 mb-6">
              {kit.steps.map((s, i) => {
                const StepIcon = s.icon || STEP_ICON_MAP[s.id] || PackageCheck;
                return (
                  <div key={s.id} className="flex items-start gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${s.done ? "text-white" : s.active ? "text-white animate-pulse" : "bg-gray-200 text-gray-400"}`} style={s.done || s.active ? { background: `linear-gradient(135deg, ${COLORS.gradientStart}, ${COLORS.gradientEnd})` } : {}}>
                        <StepIcon size={18} />
                      </div>
                      {i < kit.steps.length - 1 && <div className={`w-0.5 h-8 mt-1 ${s.done ? "bg-green-400" : "bg-gray-200"}`} />}
                    </div>
                    <div>
                      <div className={`text-sm font-semibold ${s.done || s.active ? "text-green-700" : "text-gray-400"}`}>{s.label}</div>
                      <div className={`text-xs ${s.active ? "text-amber-600 font-bold" : "text-gray-400"}`}>{s.date}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {kit.status === "in_progress" && kit.statusMessage && (
              <div className="p-4 bg-white rounded-xl flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                  <Microscope size={16} className="text-amber-600" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">{kit.statusMessage.title}</div>
                  <div className="text-xs text-gray-400">{kit.statusMessage.detail}</div>
                </div>
              </div>
            )}

            {kit.status === "completed" && !showResults && (
              <div className="mt-2 p-6 bg-white rounded-2xl border-2 border-green-200 text-center">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <Check size={32} className="text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{kit.petName}'s Results Are Ready!</h3>
                <p className="text-gray-500 text-sm mb-6">Your genomic analysis is complete. View the full report including breed ancestry, health markers, behavior traits, nutrition plan, and genetic relatives.</p>
                <div className="flex flex-wrap justify-center gap-3">
                  <Button onClick={() => setShowResults(true)}><BarChart3 size={18} /> View Full Report</Button>
                  <Button variant="secondary" onClick={() => generateVetReportPDF(kit.petName, trackingId, kit.results)}><Download size={18} /> Download Vet PDF</Button>
                </div>
              </div>
            )}

            {kit.status === "completed" && showResults && kit.results && (
              <div className="mt-4 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-5 sm:p-6 flex flex-wrap items-center justify-between gap-4" style={{ background: `linear-gradient(135deg, ${COLORS.gradientStart}, ${COLORS.gradientEnd})` }}>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-2xl">{kit.icon}</div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{kit.petName}'s Genomic Report</h3>
                      <p className="text-green-200 text-sm">Kit: {trackingId} • {kit.plan} Plan</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="secondary" onClick={() => generateVetReportPDF(kit.petName, trackingId, kit.results)}><Download size={16} /> Vet PDF</Button>
                    <Button size="sm" variant="secondary"><Share2 size={16} /> Share</Button>
                  </div>
                </div>

                <div className="border-b border-gray-100 px-5 sm:px-6 overflow-x-auto">
                  <div className="flex gap-1 min-w-max">
                    {tabs.map((t) => (
                      <button key={t.id} onClick={() => setActiveTab(t.id)} className={`flex items-center gap-2 px-4 py-4 text-sm font-medium border-b-2 transition-all cursor-pointer whitespace-nowrap ${activeTab === t.id ? "border-green-600 text-green-700" : "border-transparent text-gray-400 hover:text-gray-600"}`}>
                        <t.icon size={16} /> {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-5 sm:p-6">
                  {activeTab === "breed" && (
                    <div className="grid lg:grid-cols-2 gap-8">
                      <div>
                        <h4 className="text-lg font-bold text-gray-900 mb-4">Breed Composition</h4>
                        <div className="h-72">
                          <ResponsiveContainer width="100%" height="100%">
                            <RechartsPie>
                              <Pie data={kit.results.breedComposition} cx="50%" cy="50%" outerRadius={100} innerRadius={50} dataKey="value" label={({ name, value }) => `${name} ${value}%`} labelLine={true}>
                                {kit.results.breedComposition.map((_, i) => (
                                  <Cell key={i} fill={BREED_COLORS[i]} />
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
                          {kit.results.breedComposition.map((b, i) => (
                            <div key={b.name}>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="font-medium text-gray-700">{b.name}</span>
                                <span className="font-bold" style={{ color: BREED_COLORS[i] }}>{b.value}%</span>
                              </div>
                              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${b.value}%`, backgroundColor: BREED_COLORS[i] }} />
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="mt-6 p-4 bg-green-50 rounded-xl">
                          <p className="text-sm text-green-800"><strong>Confidence:</strong> 97.3% — Based on alignment against 45,000+ verified genomes.</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "health" && (
                    <div>
                      <h4 className="text-lg font-bold text-gray-900 mb-6">Health Marker Screening — {kit.results.healthMarkers.length} of 220+ markers shown</h4>
                      <div className="grid gap-3">
                        {kit.results.healthMarkers.map((m) => (
                          <div key={m.gene} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-gray-200 transition-all">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: statusColors[m.status] + "15" }}>
                                {m.status === "clear" ? <Check size={18} style={{ color: statusColors[m.status] }} /> : m.status === "carrier" ? <AlertTriangle size={18} style={{ color: statusColors[m.status] }} /> : <Shield size={18} style={{ color: statusColors[m.status] }} />}
                              </div>
                              <div>
                                <div className="font-semibold text-gray-900">{m.condition}</div>
                                <div className="text-sm text-gray-400">Gene: {m.gene}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Badge color={statusColors[m.status]}>{statusLabels[m.status]}</Badge>
                              <span className={`text-xs font-medium px-2 py-1 rounded ${m.risk === "low" ? "bg-green-50 text-green-600" : m.risk === "medium" ? "bg-amber-50 text-amber-600" : "bg-red-50 text-red-600"}`}>
                                {m.risk.toUpperCase()} RISK
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-6 p-4 bg-amber-50 rounded-xl flex items-start gap-3">
                        <AlertTriangle size={20} className="text-amber-500 mt-0.5 shrink-0" />
                        <p className="text-sm text-amber-800"><strong>Important:</strong> {kit.petName} is a carrier for MDR1 (Drug Sensitivity) and at risk for vWD Type 1. We recommend discussing these findings with your veterinarian.</p>
                      </div>
                    </div>
                  )}

                  {activeTab === "behavior" && (
                    <div className="grid lg:grid-cols-2 gap-8">
                      <div>
                        <h4 className="text-lg font-bold text-gray-900 mb-4">Behavioral Trait Predictions</h4>
                        <div className="h-80">
                          <ResponsiveContainer width="100%" height="100%">
                            <RadarChart data={kit.results.behaviorTraits}>
                              <PolarGrid stroke="#E5E7EB" />
                              <PolarAngleAxis dataKey="trait" tick={{ fontSize: 12, fill: "#6B7280" }} />
                              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                              <Radar name={kit.petName} dataKey="score" stroke={COLORS.primary} fill={COLORS.primary} fillOpacity={0.3} />
                              <Radar name="Breed Average" dataKey="avg" stroke={COLORS.accent} fill={COLORS.accent} fillOpacity={0.1} />
                              <Legend />
                              <Tooltip />
                            </RadarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-gray-900 mb-4">Trait Details</h4>
                        <div className="space-y-4">
                          {kit.results.behaviorTraits.map((t) => (
                            <div key={t.trait}>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="font-medium text-gray-700">{t.trait}</span>
                                <span className="text-gray-500">{t.score}/100 <span className="text-xs text-gray-400">(avg: {t.avg})</span></span>
                              </div>
                              <div className="h-2 bg-gray-100 rounded-full overflow-hidden relative">
                                <div className="absolute h-full rounded-full" style={{ width: `${t.avg}%`, backgroundColor: COLORS.accent + "40" }} />
                                <div className="absolute h-full rounded-full" style={{ width: `${t.score}%`, backgroundColor: COLORS.primary }} />
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="mt-6 p-4 bg-blue-50 rounded-xl">
                          <p className="text-sm text-blue-800"><strong>Insight:</strong> {kit.petName} has exceptionally high trainability and sociability scores. Low aggression score makes this pet ideal for families.</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "nutrition" && (
                    <div className="grid lg:grid-cols-3 gap-8">
                      <div className="lg:col-span-2">
                        <h4 className="text-lg font-bold text-gray-900 mb-4">Personalized Nutrition Plan</h4>
                        <div className="grid sm:grid-cols-2 gap-4 mb-6">
                          {[
                            { label: "Daily Calories", value: kit.results.nutritionProfile.calories, icon: Zap, color: COLORS.accent },
                            { label: "Protein", value: kit.results.nutritionProfile.protein, icon: Activity, color: COLORS.primary },
                            { label: "Fat", value: kit.results.nutritionProfile.fat, icon: Heart, color: COLORS.danger },
                            { label: "Fiber", value: kit.results.nutritionProfile.fiber, icon: TreePine, color: COLORS.info },
                          ].map((n) => (
                            <div key={n.label} className="p-4 rounded-xl border border-gray-100 flex items-center gap-4">
                              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: n.color + "15" }}>
                                <n.icon size={20} style={{ color: n.color }} />
                              </div>
                              <div>
                                <div className="text-xs text-gray-400">{n.label}</div>
                                <div className="font-bold text-gray-900">{n.value}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="space-y-4">
                          <div className="p-4 rounded-xl bg-green-50">
                            <h5 className="font-semibold text-green-800 mb-2">Recommended Supplements</h5>
                            <div className="flex flex-wrap gap-2">
                              {kit.results.nutritionProfile.supplements.map((s) => <Badge key={s} color={COLORS.primary}>{s}</Badge>)}
                            </div>
                          </div>
                          <div className="p-4 rounded-xl bg-red-50">
                            <h5 className="font-semibold text-red-800 mb-2">Foods to Avoid</h5>
                            <div className="flex flex-wrap gap-2">
                              {kit.results.nutritionProfile.avoid.map((a) => <Badge key={a} color={COLORS.danger}>{a}</Badge>)}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-gray-900 mb-4">Sensitivities</h4>
                        <div className="space-y-3">
                          {kit.results.nutritionProfile.sensitivities.map((s, i) => (
                            <div key={i} className="p-3 rounded-lg bg-amber-50 text-sm text-amber-800 flex items-start gap-2">
                              <AlertTriangle size={16} className="mt-0.5 shrink-0" /> {s}
                            </div>
                          ))}
                        </div>
                        <div className="mt-6 p-4 border border-gray-100 rounded-xl">
                          <h5 className="font-semibold text-gray-900 mb-2">Ideal Diet Type</h5>
                          <p className="text-sm text-gray-500">Based on {kit.petName}'s genetics, a grain-free, high-protein diet with fish-based omega-3 sources is recommended.</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "relatives" && (
                    <div>
                      <h4 className="text-lg font-bold text-gray-900 mb-2">Genetic Relatives Found</h4>
                      <p className="text-gray-500 mb-6">We've found {kit.results.relatives.length} genetic relatives for {kit.petName} in the GenePaw database.</p>
                      <div className="grid sm:grid-cols-3 gap-6">
                        {kit.results.relatives.map((r) => (
                          <div key={r.name} className="border border-gray-100 rounded-2xl p-6 hover:shadow-lg transition-all hover:-translate-y-1">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-xl">{kit.icon}</div>
                              <div>
                                <div className="font-bold text-gray-900">{r.name}</div>
                                <div className="text-sm text-gray-400">Owner: {r.owner}</div>
                              </div>
                            </div>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between"><span className="text-gray-500">Relation</span><Badge color={COLORS.primary}>{r.relation}</Badge></div>
                              <div className="flex justify-between"><span className="text-gray-500">DNA Match</span><span className="font-bold text-green-600">{r.match}%</span></div>
                              <div className="flex justify-between"><span className="text-gray-500">Location</span><span className="text-gray-700">{r.location}</span></div>
                            </div>
                            <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-full rounded-full" style={{ width: `${r.match}%`, backgroundColor: COLORS.primary }} />
                            </div>
                            <Button size="sm" variant="ghost" className="w-full mt-4">Connect</Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="px-6 pb-4">
                  <button onClick={() => setShowResults(false)} className="w-full text-center text-sm text-gray-400 hover:text-gray-600 py-2 cursor-pointer">
                    <ChUp size={16} className="inline mr-1" /> Collapse Report
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {!searched && (
          <div className="text-center p-12 bg-gray-50 rounded-3xl">
            <Search size={48} className="text-gray-300 mx-auto mb-4" />
            <h3 className="font-bold text-gray-700 text-lg mb-2">Enter Your Kit ID to Get Started</h3>
            <p className="text-gray-400 text-sm">Your kit ID was emailed to you when you placed your order. It starts with "GP-" followed by the year and a unique number.</p>
          </div>
        )}
      </div>
    </section>
  );
}

// ─── Pricing ───
function PricingSection() {
  const navigate = useNavigate();
  const { user, pricing, updatePrice } = useApp();
  const isAdmin = user?.role === "staff";
  const [editingPlan, setEditingPlan] = useState(null);
  const [editPrice, setEditPrice] = useState("");
  const [saved, setSaved] = useState(null);

  const handleSave = (planName) => {
    const newPrice = parseInt(editPrice);
    if (!isNaN(newPrice) && newPrice > 0) {
      updatePrice(planName, newPrice);
      setSaved(planName);
      setTimeout(() => setSaved(null), 2000);
    }
    setEditingPlan(null);
    setEditPrice("");
  };

  return (
    <section id="pricing" className="py-24 relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${COLORS.gradientStart}, ${COLORS.primaryLight})` }}>
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-20 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl"></div>
      </div>
      <div className="relative max-w-7xl mx-auto px-6">
        <SectionTitle light subtitle="Pricing" title="Choose Your Plan" description="Every plan includes free shipping, prepaid return labels, and a secure online dashboard. Results in 2-3 weeks." />

        {isAdmin && (
          <div className="mb-8 p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 flex items-center gap-3">
            <ShieldCheck size={20} className="text-purple-300" />
            <p className="text-green-100 text-sm">Admin Mode — Click any price to edit it. Changes apply instantly across the platform.</p>
          </div>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {pricing.map((p) => (
            <div key={p.name} className={`relative bg-white rounded-2xl p-6 shadow-xl hover:-translate-y-2 transition-all duration-300 ${p.popular ? "ring-2 ring-amber-400" : ""}`}>
              {p.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-amber-400 text-amber-900 text-xs font-bold px-4 py-1 rounded-full shadow-lg">MOST POPULAR</span>
                </div>
              )}
              {saved === p.name && (
                <div className="absolute -top-3 right-3">
                  <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1"><Check size={12} /> Saved</span>
                </div>
              )}
              <div className="w-10 h-10 rounded-lg mb-4" style={{ backgroundColor: p.color + "15" }}>
                <div className="w-full h-full rounded-lg flex items-center justify-center">
                  <Dna size={20} style={{ color: p.color }} />
                </div>
              </div>
              <h3 className="text-lg font-bold text-gray-900">{p.name}</h3>

              {isAdmin && editingPlan === p.name ? (
                <div className="my-3">
                  <label className="text-xs text-gray-400 block mb-1">New Price (₹)</label>
                  <div className="flex gap-2">
                    <input type="number" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} placeholder={p.price.toString()} className="w-full px-3 py-2 rounded-lg border-2 border-purple-300 text-lg font-bold focus:outline-none focus:border-purple-500" autoFocus onKeyDown={(e) => e.key === "Enter" && handleSave(p.name)} />
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button onClick={() => handleSave(p.name)} className="px-3 py-1 rounded-lg bg-purple-600 text-white text-xs font-bold cursor-pointer hover:bg-purple-700 transition-all">Save</button>
                    <button onClick={() => { setEditingPlan(null); setEditPrice(""); }} className="px-3 py-1 rounded-lg bg-gray-100 text-gray-600 text-xs font-bold cursor-pointer hover:bg-gray-200 transition-all">Cancel</button>
                  </div>
                </div>
              ) : (
                <div className={`flex items-baseline gap-1 my-3 ${isAdmin ? "cursor-pointer group/price" : ""}`} onClick={() => { if (isAdmin) { setEditingPlan(p.name); setEditPrice(p.price.toString()); } }}>
                  <span className="text-3xl font-bold text-gray-900">{formatINR(p.price)}</span>
                  <span className="text-gray-400 text-sm">/kit</span>
                  {isAdmin && (
                    <span className="ml-2 opacity-0 group-hover/price:opacity-100 transition-opacity text-xs text-purple-500 font-medium flex items-center gap-1">
                      ✏️ Edit
                    </span>
                  )}
                </div>
              )}

              <ul className="space-y-3 mb-6">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                    <Check size={16} className="text-green-500 mt-0.5 shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <Button className="w-full" variant={p.popular ? "primary" : "secondary"} onClick={() => navigate("/order-kit")}>
                Get Started
              </Button>
            </div>
          ))}
        </div>
        <p className="text-center text-green-200 text-sm mt-8">All prices include shipping and handling. Volume discounts available for breeders and veterinary clinics.</p>
      </div>
    </section>
  );
}

// ─── FAQ ───
function FAQSection() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section id="faq" className="py-24 bg-white">
      <div className="max-w-3xl mx-auto px-6">
        <SectionTitle subtitle="FAQ" title="Frequently Asked Questions" />
        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <div key={i} className="border border-gray-100 rounded-2xl overflow-hidden hover:border-green-200 transition-colors">
              <button onClick={() => setOpenIndex(openIndex === i ? -1 : i)} className="w-full text-left px-6 py-5 flex items-center justify-between cursor-pointer">
                <span className="font-semibold text-gray-900 pr-4">{faq.q}</span>
                {openIndex === i ? <ChevronUp size={20} className="text-green-600 shrink-0" /> : <ChevronDown size={20} className="text-gray-400 shrink-0" />}
              </button>
              {openIndex === i && (
                <div className="px-6 pb-5">
                  <p className="text-gray-500 leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Live Tracking ───
function LiveTracking() {
  const { orderId } = useParams();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();
  const [formOrderId, setFormOrderId] = useState("");
  const [formToken, setFormToken] = useState("");

  const { data: order, isError, isLoading } = useQuery({
    queryKey: ["order", orderId, token],
    queryFn: () => apiFetch(`/api/v1/orders/${orderId}${token ? `?token=${encodeURIComponent(token)}` : ""}`),
    staleTime: 5 * 60 * 1000,
    enabled: !!orderId,
    retry: false,
  });

  const statusIndex = TRACKING_STAGES.findIndex((s) => s.status === order?.status);

  if (!orderId) {
    return (
      <section className="py-24" style={{ backgroundColor: COLORS.bg }}>
        <div className="max-w-lg mx-auto px-6">
          <SectionTitle subtitle="Track Your Kit" title="Order Status" description="Enter your order reference to check the status of your sample." />
          <div className="bg-white rounded-2xl p-8 shadow-sm space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Order ID <span className="text-red-500">*</span></label>
              <input
                value={formOrderId}
                onChange={(e) => setFormOrderId(e.target.value)}
                placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 font-mono text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Guest Token <span className="text-red-500">*</span></label>
              <input
                value={formToken}
                onChange={(e) => setFormToken(e.target.value)}
                placeholder="Guest token from your order confirmation"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 font-mono text-sm"
              />
            </div>
            <Button
              disabled={!formOrderId.trim() || !formToken.trim()}
              onClick={() => navigate(`/track/${formOrderId.trim()}?token=${encodeURIComponent(formToken.trim())}`)}
              className="w-full"
            >
              <Search size={18} /> Track Order
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24" style={{ backgroundColor: COLORS.bg }}>
      <div className="max-w-3xl mx-auto px-6">
        <button onClick={() => navigate("/track")} className="flex items-center gap-2 text-gray-500 hover:text-green-600 mb-8 cursor-pointer">
          <ArrowLeft size={18} /> Track Another Order
        </button>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Status</h1>
        <p className="text-sm text-gray-500 mb-8 font-mono">{orderId}</p>

        {isLoading && (
          <div className="bg-white rounded-2xl p-8 shadow-sm text-center text-gray-400">
            Loading order status…
          </div>
        )}

        {isError && (
          <div className="bg-red-50 rounded-2xl p-8 text-center">
            <AlertTriangle size={32} className="text-red-400 mx-auto mb-3" />
            <h3 className="font-bold text-gray-900 mb-1">Order Not Found</h3>
            <p className="text-sm text-gray-500">Order not found. Please check your order reference.</p>
            <button onClick={() => navigate("/track")} className="mt-4 text-sm text-green-600 hover:underline cursor-pointer">
              Try a different order
            </button>
          </div>
        )}

        {order && (
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            {/* Desktop stepper — horizontal */}
            <div className="hidden sm:block relative mb-8">
              <div className="absolute top-6 left-0 right-0 h-1 bg-gray-200 rounded-full">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: statusIndex >= 0 ? `${((statusIndex + 1) / TRACKING_STAGES.length) * 100}%` : "0%",
                    background: `linear-gradient(90deg, ${COLORS.gradientStart}, ${COLORS.gradientEnd})`,
                  }}
                />
              </div>
              <div className="relative flex justify-between">
                {TRACKING_STAGES.map((stage, i) => {
                  const isDone = i < statusIndex;
                  const isActive = i === statusIndex;
                  const StageIcon = stage.icon;
                  return (
                    <div key={stage.status} className="flex flex-col items-center text-center" style={{ width: "20%" }}>
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center z-10 transition-all ${isDone || isActive ? "text-white shadow-lg" : "bg-gray-200 text-gray-400"} ${isActive ? "ring-4 ring-green-200" : ""}`}
                        style={isDone || isActive ? { background: `linear-gradient(135deg, ${COLORS.gradientStart}, ${COLORS.gradientEnd})` } : {}}
                      >
                        {isDone ? <Check size={20} /> : <StageIcon size={20} />}
                      </div>
                      <div className={`mt-3 text-xs font-semibold ${isDone || isActive ? "text-green-700" : "text-gray-400"}`}>{stage.label}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Mobile stepper — vertical */}
            <div className="sm:hidden space-y-4 mb-8">
              {TRACKING_STAGES.map((stage, i) => {
                const isDone = i < statusIndex;
                const isActive = i === statusIndex;
                const StageIcon = stage.icon;
                return (
                  <div key={stage.status} className="flex items-center gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isDone || isActive ? "text-white shadow-lg" : "bg-gray-200 text-gray-400"} ${isActive ? "ring-4 ring-green-200" : ""}`}
                        style={isDone || isActive ? { background: `linear-gradient(135deg, ${COLORS.gradientStart}, ${COLORS.gradientEnd})` } : {}}
                      >
                        {isDone ? <Check size={18} /> : <StageIcon size={18} />}
                      </div>
                      {i < TRACKING_STAGES.length - 1 && (
                        <div className={`w-0.5 h-8 mt-1 ${isDone ? "bg-green-400" : "bg-gray-200"}`} />
                      )}
                    </div>
                    <div>
                      <div className={`text-sm font-semibold ${isDone || isActive ? "text-green-700" : "text-gray-400"}`}>{stage.label}</div>
                      {isActive && <div className="text-xs text-amber-600 font-medium">Current stage</div>}
                    </div>
                  </div>
                );
              })}
            </div>

            {order.status === "results_ready" && (
              <div className="mt-4 p-6 bg-green-50 border border-green-200 rounded-2xl text-center">
                <Check size={32} className="text-green-500 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-gray-900 mb-2">Your Results Are Ready!</h3>
                <p className="text-sm text-gray-500 mb-4">Your genomic analysis is complete. View your full report now.</p>
                <Button
                  variant="primary"
                  onClick={() => navigate(`/results/${orderId}${token ? `?token=${encodeURIComponent(token)}` : ""}`)}
                >
                  View Your Results <ArrowRight size={18} />
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

// ─── Page ───
export default function CustomerPortalPage() {
  const location = useLocation();
  const { user, logout } = useApp();
  const isTrackPage = location.pathname.startsWith("/track");

  return (
    <div className="min-h-screen" style={{ backgroundColor: COLORS.bg, color: COLORS.text }}>
      <Navbar currentPage={isTrackPage ? "track" : "home"} user={user} onLogout={logout} />
      {isTrackPage ? (
        <div className="pt-20">
          <LiveTracking />
        </div>
      ) : (
        <>
          <Hero />
          <SpeciesSection />
          <HowItWorks />
          <KitTracking />
          <PricingSection />
          <FAQSection />
        </>
      )}
      <Footer />
    </div>
  );
}
