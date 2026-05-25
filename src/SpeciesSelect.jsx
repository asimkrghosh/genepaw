import { useState, useRef, useEffect } from "react";
import { ChevronDown, Search, X } from "lucide-react";
import { SPECIES_DATA } from "./CustomerPortal.jsx";

export default function SpeciesSelect({ value, onChange, className }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef(null);

  const selected = value ? value.split(",").map((s) => s.trim()).filter(Boolean) : [];

  useEffect(() => {
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const toggle = (variant) => {
    const next = selected.includes(variant)
      ? selected.filter((v) => v !== variant)
      : [...selected, variant];
    onChange(next.join(", "));
  };

  const grouped = SPECIES_DATA
    .map((s) => ({
      ...s,
      filteredVariants: s.variants.filter(
        (v) => !search || v.toLowerCase().includes(search.toLowerCase()) || s.name.toLowerCase().includes(search.toLowerCase())
      ),
    }))
    .filter((s) => s.filteredVariants.length > 0);

  return (
    <div ref={ref} className={`relative ${className ?? ""}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 flex items-center justify-between bg-white text-left"
      >
        <span className={selected.length ? "text-gray-800" : "text-gray-400"}>
          {selected.length === 0 ? "Select species…" : `${selected.length} species selected`}
        </span>
        <ChevronDown size={15} className={`text-gray-400 transition-transform shrink-0 ml-2 ${open ? "rotate-180" : ""}`} />
      </button>

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1.5">
          {selected.map((v) => (
            <span key={v} className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">
              {v}
              <button type="button" onClick={() => toggle(v)} className="hover:text-red-500 cursor-pointer"><X size={10} /></button>
            </span>
          ))}
        </div>
      )}

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-xl max-h-72 overflow-hidden flex flex-col">
          <div className="p-2 border-b border-gray-100">
            <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-gray-50">
              <Search size={13} className="text-gray-400 shrink-0" />
              <input
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search species…"
                className="flex-1 text-xs bg-transparent outline-none text-gray-700 placeholder-gray-400"
              />
              {search && (
                <button type="button" onClick={() => setSearch("")}><X size={11} className="text-gray-400 hover:text-gray-600 cursor-pointer" /></button>
              )}
            </div>
          </div>
          <div className="overflow-y-auto flex-1">
            {grouped.map((s) => (
              <div key={s.id}>
                <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-gray-400 tracking-wider flex items-center gap-1.5 bg-gray-50 border-b border-gray-100">
                  <span>{s.icon}</span> {s.name}
                </div>
                {s.filteredVariants.map((v) => (
                  <label key={v} className="flex items-center gap-2.5 px-4 py-1.5 hover:bg-green-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selected.includes(v)}
                      onChange={() => toggle(v)}
                      className="accent-green-600 w-3.5 h-3.5 shrink-0"
                    />
                    <span className="text-xs text-gray-700">{v}</span>
                  </label>
                ))}
              </div>
            ))}
            {grouped.length === 0 && (
              <div className="px-4 py-6 text-xs text-gray-400 text-center">No species match "{search}"</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
