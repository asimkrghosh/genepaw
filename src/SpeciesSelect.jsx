import { useState, useRef, useEffect } from "react";
import { ChevronDown, ChevronRight, Search, X, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "./api.js";

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function SpeciesSelect({ value, onChange, className }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [collapsed, setCollapsed] = useState(new Set());
  const ref = useRef(null);

  const selected = value ? value.split(",").map((s) => s.trim()).filter(Boolean) : [];

  useEffect(() => {
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const debouncedSearch = useDebounce(search, 300);
  const enabled = debouncedSearch.length >= 2;

  const { data, isFetching } = useQuery({
    queryKey: ["species-search", debouncedSearch],
    queryFn: () => apiFetch(`/api/v1/species?search=${encodeURIComponent(debouncedSearch)}&limit=50`),
    enabled,
    staleTime: 60_000,
  });

  // Expand all genera whenever results change
  useEffect(() => { setCollapsed(new Set()); }, [data]);

  const results = data?.items ?? [];

  const grouped = Object.entries(
    results.reduce((acc, s) => {
      const g = s.genus || "Other";
      (acc[g] ??= []).push(s);
      return acc;
    }, {})
  ).sort(([a], [b]) => a.localeCompare(b));

  const toggleGenus = (genus) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      next.has(genus) ? next.delete(genus) : next.add(genus);
      return next;
    });
  };

  const toggle = (name) => {
    const next = selected.includes(name)
      ? selected.filter((v) => v !== name)
      : [...selected, name];
    onChange(next.join(", "));
  };

  // Species epithet = everything after the genus prefix for display
  const epithet = (speciesName, genus) => {
    const prefix = genus + " ";
    return speciesName.startsWith(prefix) ? speciesName.slice(prefix.length) : speciesName;
  };

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
                placeholder="Type to search species…"
                className="flex-1 text-xs bg-transparent outline-none text-gray-700 placeholder-gray-400"
              />
              {search && (
                <button type="button" onClick={() => setSearch("")}><X size={11} className="text-gray-400 hover:text-gray-600 cursor-pointer" /></button>
              )}
            </div>
          </div>

          <div className="overflow-y-auto flex-1">
            {isFetching && (
              <div className="flex items-center justify-center py-6 gap-2 text-xs text-gray-400">
                <Loader2 size={14} className="animate-spin" /> Searching…
              </div>
            )}
            {!isFetching && !enabled && (
              <div className="px-4 py-6 text-xs text-gray-400 text-center">
                Type at least 2 characters to search
              </div>
            )}
            {!isFetching && enabled && grouped.length === 0 && (
              <div className="px-4 py-6 text-xs text-gray-400 text-center">
                No species match "{debouncedSearch}"
              </div>
            )}
            {!isFetching && grouped.map(([genus, items]) => {
              const isCollapsed = collapsed.has(genus);
              return (
                <div key={genus}>
                  <button
                    type="button"
                    onClick={() => toggleGenus(genus)}
                    className="w-full flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border-b border-gray-100 hover:bg-gray-100 transition-colors text-left"
                  >
                    {isCollapsed
                      ? <ChevronRight size={11} className="text-gray-400 shrink-0" />
                      : <ChevronDown size={11} className="text-gray-400 shrink-0" />
                    }
                    <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">{genus}</span>
                    <span className="ml-auto text-[10px] text-gray-400">{items.length}</span>
                  </button>

                  {!isCollapsed && items.map((s) => (
                    <label key={s.id} className="flex items-center gap-2.5 pl-7 pr-4 py-1.5 hover:bg-green-50 cursor-pointer border-b border-gray-50">
                      <input
                        type="checkbox"
                        checked={selected.includes(s.name)}
                        onChange={() => toggle(s.name)}
                        className="accent-green-600 w-3.5 h-3.5 shrink-0"
                      />
                      <span className="text-xs text-gray-700 italic">{epithet(s.name, genus)}</span>
                    </label>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
