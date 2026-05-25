import { createContext, useContext, useState, useEffect } from "react";
import { DEFAULT_PRICING } from "./shared.jsx";
import { MARKER_ARTICLES } from "./markerArticles.js";
import { MARKER_CATEGORIES } from "./markerData.js";

const SAMPLE_RESULTS = {
  breedComposition: [
    { name: "Golden Retriever", value: 42 },
    { name: "Labrador", value: 28 },
    { name: "Poodle", value: 15 },
    { name: "German Shepherd", value: 10 },
    { name: "Unknown / Mixed", value: 5 },
  ],
  healthMarkers: [
    { gene: "MDR1", condition: "Drug Sensitivity", status: "carrier", risk: "medium" },
    { gene: "PRA-prcd", condition: "Progressive Retinal Atrophy", status: "clear", risk: "low" },
    { gene: "DM (SOD1)", condition: "Degenerative Myelopathy", status: "clear", risk: "low" },
    { gene: "vWD Type 1", condition: "Von Willebrand Disease", status: "at_risk", risk: "high" },
    { gene: "EIC", condition: "Exercise-Induced Collapse", status: "carrier", risk: "medium" },
    { gene: "HUU", condition: "Hyperuricosuria", status: "clear", risk: "low" },
  ],
  behaviorTraits: [
    { trait: "Trainability", score: 92, avg: 70 },
    { trait: "Energy Level", score: 85, avg: 65 },
    { trait: "Sociability", score: 88, avg: 60 },
    { trait: "Prey Drive", score: 45, avg: 55 },
    { trait: "Anxiety Tendency", score: 30, avg: 50 },
    { trait: "Aggression", score: 15, avg: 40 },
  ],
  nutritionProfile: {
    calories: "1200-1500 kcal/day",
    protein: "25-30%",
    fat: "12-15%",
    fiber: "3-5%",
    supplements: ["Omega-3 Fatty Acids", "Glucosamine", "Vitamin E"],
    avoid: ["Grapes", "Onions", "Xylitol"],
    sensitivities: ["Moderate grain sensitivity detected", "Possible dairy intolerance"],
  },
  relatives: [
    { name: "Buddy", relation: "Likely Sibling", match: 87, location: "Austin, TX", owner: "Sarah M." },
    { name: "Luna", relation: "Parent/Offspring", match: 92, location: "Denver, CO", owner: "James K." },
    { name: "Max", relation: "Half-Sibling", match: 64, location: "Portland, OR", owner: "Emily R." },
  ],
};

const INITIAL_KITS = {
  "GP-2026-0847291": {
    id: "GP-2026-0847291", petName: "Bella", icon: "🐕", species: "Dog", breed: "Labrador Mix",
    ownerName: "Priya Sharma", ownerEmail: "priya@example.com",
    plan: "Health + Breed", orderDate: "Mar 15, 2026",
    status: "in_progress", progress: 70,
    statusMessage: {
      title: "Currently: Bioinformatics Analysis",
      detail: "Our AI pipeline is analyzing Bella's 2.8 million genetic markers. Estimated completion: April 2, 2026.",
    },
    steps: [
      { id: 1, label: "Kit Ordered", date: "Mar 15, 2026", done: true },
      { id: 2, label: "Kit Shipped", date: "Mar 16, 2026", done: true },
      { id: 3, label: "Sample Received", date: "Mar 22, 2026", done: true },
      { id: 4, label: "Sequencing", date: "Mar 25, 2026", done: true },
      { id: 5, label: "Analysis", date: "In Progress", done: false, active: true },
      { id: 6, label: "Results Ready", date: "Est. Apr 2", done: false },
    ],
  },
  "GP-2026-0612483": {
    id: "GP-2026-0612483", petName: "Max", icon: "🐱", species: "Cat", breed: "Persian Mix",
    ownerName: "Rahul Verma", ownerEmail: "rahul@example.com",
    plan: "Complete Genome", orderDate: "Feb 28, 2026",
    status: "completed", progress: 100,
    steps: [
      { id: 1, label: "Kit Ordered", date: "Feb 28, 2026", done: true },
      { id: 2, label: "Kit Shipped", date: "Mar 1, 2026", done: true },
      { id: 3, label: "Sample Received", date: "Mar 7, 2026", done: true },
      { id: 4, label: "Sequencing", date: "Mar 10, 2026", done: true },
      { id: 5, label: "Analysis", date: "Mar 18, 2026", done: true },
      { id: 6, label: "Results Ready", date: "Mar 20, 2026", done: true },
    ],
    results: SAMPLE_RESULTS,
  },
};

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [pricing, setPricing] = useState(DEFAULT_PRICING);
  const [kits, setKits] = useState(INITIAL_KITS);
  const [articles, setArticles] = useState(() => {
    try {
      const stored = localStorage.getItem("genepaw_articles");
      return stored ? JSON.parse(stored) : MARKER_ARTICLES;
    } catch { return MARKER_ARTICLES; }
  });
  const [categories, setCategories] = useState(() => {
    try {
      const stored = localStorage.getItem("genepaw_categories");
      return stored ? JSON.parse(stored) : MARKER_CATEGORIES.map(c => ({ ...c, markers: [...c.markers] }));
    } catch { return MARKER_CATEGORIES.map(c => ({ ...c, markers: [...c.markers] })); }
  });

  useEffect(() => {
    try { localStorage.setItem("genepaw_articles", JSON.stringify(articles)); } catch {}
  }, [articles]);

  useEffect(() => {
    try { localStorage.setItem("genepaw_categories", JSON.stringify(categories)); } catch {}
  }, [categories]);

  useEffect(() => {
    const token = localStorage.getItem("genepaw_token");
    if (!token) return;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      if (payload.role === "staff" && (!payload.exp || payload.exp * 1000 > Date.now())) {
        setUser({ id: payload.sub, role: payload.role, avatar: "S" });
      } else {
        localStorage.removeItem("genepaw_token");
      }
    } catch {
      localStorage.removeItem("genepaw_token");
    }
  }, []);

  const login = (userData) => setUser(userData);

  const logout = () => {
    localStorage.removeItem("genepaw_token");
    setUser(null);
  };

  const updatePrice = (planName, newPrice) => {
    setPricing(prev => prev.map(p => p.name === planName ? { ...p, price: newPrice } : p));
  };

  const uploadReport = (kitId, data) => {
    setKits(prev => ({ ...prev, [kitId]: { id: kitId, ...prev[kitId], ...data } }));
  };

  const updateKit = (kitId, data) => {
    setKits(prev => ({ ...prev, [kitId]: { id: kitId, ...prev[kitId], ...data } }));
  };

  const updateArticle = (gene, data) => {
    setArticles(prev => ({ ...prev, [gene]: { ...(prev[gene] ?? {}), ...data } }));
  };

  const updateMarker = (catId, idx, data) => {
    setCategories(prev => prev.map(c => c.id === catId
      ? { ...c, markers: c.markers.map((m, i) => i === idx ? { ...m, ...data } : m) }
      : c));
  };

  const addMarker = (catId, markerData) => {
    setCategories(prev => prev.map(c => c.id === catId
      ? { ...c, markers: [...c.markers, markerData] }
      : c));
  };

  const deleteMarker = (catId, idx) => {
    setCategories(prev => prev.map(c => c.id === catId
      ? { ...c, markers: c.markers.filter((_, i) => i !== idx) }
      : c));
  };

  return (
    <AppContext.Provider value={{ user, pricing, kits, articles, categories, setCategories, login, logout, updatePrice, uploadReport, updateKit, updateArticle, updateMarker, addMarker, deleteMarker }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}
