"use client";

import React, { useState, useEffect, useLayoutEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { Plane, Building2, Loader2, X } from "lucide-react";
import { searchLocations, getPopularAirports } from "@/services/duffel";
import { cn } from "@/lib/utils";

interface LocationSearchProps {
  placeholder?: string;
  value?: string;
  onChange: (value: string) => void;
  label?: string;
  icon?: React.ReactNode;
  inputId?: string;
}

const countryToFlag = (code: string) => {
  if (!code || code.length !== 2) return "🌍";
  return String.fromCodePoint(...code.toUpperCase().split("").map(c => 127397 + c.charCodeAt(0)));
};

const LocationSearch = ({ placeholder, value, onChange, label, icon, inputId }: LocationSearchProps) => {
  const [displayValue, setDisplayValue] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [rect, setRect] = useState<{ top: number; left: number; width: number } | null>(null);
  const [popularAirports] = useState(getPopularAirports());
  const inputRef = useRef<HTMLInputElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const acceptedRef = useRef(false); // true once a proper IATA was committed

  // ── Sync external clear ──────────────────────────────────────────────────
  useEffect(() => {
    if (!value) { setDisplayValue(""); acceptedRef.current = false; }
  }, [value]);

  // ── Keep dropdown rect in sync with scroll / resize ──────────────────────
  useLayoutEffect(() => {
    if (!open) return;
    const compute = () => {
      if (inputRef.current) {
        const r = inputRef.current.getBoundingClientRect();
        setRect({ top: r.bottom + 4, left: r.left, width: r.width });
      }
    };
    compute();
    window.addEventListener("scroll", compute, true);
    window.addEventListener("resize", compute);
    return () => {
      window.removeEventListener("scroll", compute, true);
      window.removeEventListener("resize", compute);
    };
  }, [open]);

  // ── Close on outside click ───────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const portal = document.getElementById("ls-portal");
      if (
        inputRef.current?.contains(e.target as Node) ||
        portal?.contains(e.target as Node)
      ) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const fetchSuggestions = useCallback(async (keyword: string) => {
    if (!keyword || keyword.length < 2) { setSuggestions([]); return; }
    setLoading(true);
    try {
      const data = await searchLocations(keyword);
      setSuggestions(data);
      setActiveIndex(-1);
    } catch { setSuggestions([]); }
    finally { setLoading(false); }
  }, []);

  const commit = (iata: string, city: string, display: string) => {
    setDisplayValue(display);
    acceptedRef.current = true;
    onChange(iata);
    setOpen(false);
    setActiveIndex(-1);
    setSuggestions([]);
  };

  const handleSelect = (item: any) => {
    const iata = item.iataCode;
    const city = item.cityName || item.address?.cityName || item.name || iata;
    commit(iata, city, `${city} (${iata})`);
  };

  // Resolve whatever the user typed to the best possible IATA code
  const resolveRaw = useCallback(() => {
    if (acceptedRef.current) return;
    const raw = displayValue.trim();
    if (!raw) return;
    const upper = raw.toUpperCase();

    // Already in "City (XXX)" format
    const parenMatch = raw.match(/\(([A-Z]{3})\)/i);
    if (parenMatch) { onChange(parenMatch[1].toUpperCase()); acceptedRef.current = true; return; }

    // Exact 3-letter IATA
    if (/^[A-Z]{3}$/i.test(upper)) {
      const p = popularAirports.find((a: any) => a.iataCode === upper);
      if (p) { handleSelect(p); return; }
      const s = suggestions.find((a: any) => a.iataCode === upper);
      if (s) { handleSelect(s); return; }
      commit(upper, upper, `${upper} (${upper})`);
      return;
    }

    // Match city name in API suggestions
    const bySugg = suggestions.find((a: any) =>
      (a.address?.cityName || a.name || "").toUpperCase().startsWith(upper.substring(0, 3))
    );
    if (bySugg) { handleSelect({ ...bySugg, cityName: bySugg.address?.cityName || bySugg.name }); return; }

    // Match city name in popular airports
    const byPop = popularAirports.find((a: any) =>
      (a.cityName || a.name || "").toUpperCase().startsWith(upper.substring(0, 3))
    );
    if (byPop) { handleSelect(byPop); return; }

    // Last resort: first 3 alpha chars
    const iata = upper.replace(/[^A-Z]/g, "").substring(0, 3);
    if (iata.length === 3) { commit(iata, raw, `${raw} (${iata})`); }
  }, [displayValue, suggestions, popularAirports, onChange]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setDisplayValue(val);
    acceptedRef.current = false;

    if (val === "") { onChange(""); setSuggestions([]); setOpen(true); return; }

    const upper = val.trim().toUpperCase();
    // Immediately accept valid 3-letter IATA
    if (/^[A-Z]{3}$/.test(upper)) onChange(upper);

    setOpen(true);
    setActiveIndex(-1);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (val.length >= 2) timeoutRef.current = setTimeout(() => fetchSuggestions(val), 300);
    else setSuggestions([]);
  };

  const handleFocus = () => {
    setOpen(true);
    if (displayValue.length >= 2) fetchSuggestions(displayValue);
  };

  const handleBlur = () => {
    // Short timeout so mousedown → click on dropdown items fires first
    setTimeout(() => { resolveRaw(); setOpen(false); }, 100);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const list = displayValue.length < 2 ? popularAirports : suggestions;
    if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && open) handleSelect(list[activeIndex]);
      else { resolveRaw(); setOpen(false); }
      return;
    }
    if (!open) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setActiveIndex(i => Math.min(i + 1, list.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActiveIndex(i => Math.max(i - 1, 0)); }
    else if (e.key === "Escape") { setOpen(false); setActiveIndex(-1); }
  };

  const airports = suggestions.filter(s => s.subType === "AIRPORT");
  const cities = suggestions.filter(s => s.subType === "CITY");
  const isEmpty = displayValue.length < 2;

  const dropdown = open && rect ? (
    <div
      id="ls-portal"
      style={{ position: "fixed", top: rect.top, left: rect.left, width: rect.width, zIndex: 99999 }}
      className="bg-white border border-slate-200 rounded-xl shadow-2xl max-h-72 overflow-y-auto py-2"
    >
      {isEmpty ? (
        <>
          <div className="px-4 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-slate-400">Popular Airports</div>
          {popularAirports.map((item: any, i: number) => (
            <div
              key={item.iataCode}
              className={cn("flex items-center gap-3 px-4 py-2.5 cursor-pointer", activeIndex === i ? "bg-teal-50" : "hover:bg-teal-50")}
              onMouseDown={(e) => { e.preventDefault(); handleSelect(item); }}
              onMouseEnter={() => setActiveIndex(i)}
            >
              <span className="text-base">{countryToFlag(item.countryCode)}</span>
              <div className="w-5 h-5 rounded bg-blue-50 text-blue-500 flex items-center justify-center flex-shrink-0"><Plane size={12} /></div>
              <div className="flex-1 min-w-0">
                <div className="text-[0.85rem] font-medium text-slate-800 truncate">{item.name}</div>
                <div className="text-[0.72rem] text-slate-400">{item.cityName} · {item.countryCode}</div>
              </div>
              <span className="text-[0.72rem] font-bold px-2 py-0.5 bg-teal-600 text-white rounded-md">{item.iataCode}</span>
            </div>
          ))}
        </>
      ) : (
        <>
          {loading && suggestions.length === 0 && (
            <div className="flex items-center gap-2 px-4 py-3 text-slate-500 text-sm">
              <Loader2 size={14} className="animate-spin" /> Searching airports…
            </div>
          )}
          {!loading && suggestions.length === 0 && (
            <div className="px-4 py-3 text-center text-slate-400 text-sm">No results for "{displayValue}"</div>
          )}
          {airports.length > 0 && (
            <>
              <div className="px-4 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-slate-400">Airports</div>
              {airports.map((item: any, i: number) => (
                <div
                  key={item.iataCode}
                  className={cn("flex items-center gap-3 px-4 py-2.5 cursor-pointer", activeIndex === i ? "bg-teal-50" : "hover:bg-teal-50")}
                  onMouseDown={(e) => { e.preventDefault(); handleSelect({ ...item, cityName: item.address?.cityName }); }}
                  onMouseEnter={() => setActiveIndex(i)}
                >
                  <span className="text-base">{countryToFlag(item.address?.countryCode)}</span>
                  <div className="w-5 h-5 rounded bg-blue-50 text-blue-500 flex items-center justify-center flex-shrink-0"><Plane size={12} /></div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[0.85rem] font-medium text-slate-800 truncate">{item.name}</div>
                    <div className="text-[0.72rem] text-slate-400">{item.address?.cityName}, {item.address?.countryName || item.address?.countryCode}</div>
                  </div>
                  <span className="text-[0.72rem] font-bold px-2 py-0.5 bg-teal-600 text-white rounded-md">{item.iataCode}</span>
                </div>
              ))}
            </>
          )}
          {cities.length > 0 && (
            <>
              <div className="px-4 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-slate-400">Cities</div>
              {cities.map((item: any, i: number) => (
                <div
                  key={item.iataCode}
                  className={cn("flex items-center gap-3 px-4 py-2.5 cursor-pointer", activeIndex === airports.length + i ? "bg-teal-50" : "hover:bg-teal-50")}
                  onMouseDown={(e) => { e.preventDefault(); handleSelect({ ...item, cityName: item.address?.cityName }); }}
                  onMouseEnter={() => setActiveIndex(airports.length + i)}
                >
                  <span className="text-base">{countryToFlag(item.address?.countryCode)}</span>
                  <div className="w-5 h-5 rounded bg-green-50 text-green-500 flex items-center justify-center flex-shrink-0"><Building2 size={12} /></div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[0.85rem] font-medium text-slate-800 truncate">{item.address?.cityName || item.name}</div>
                    <div className="text-[0.72rem] text-slate-400">{item.address?.countryName || item.address?.countryCode}</div>
                  </div>
                  <span className="text-[0.72rem] font-bold px-2 py-0.5 bg-indigo-500 text-white rounded-md">{item.iataCode}</span>
                </div>
              ))}
            </>
          )}
        </>
      )}
    </div>
  ) : null;

  return (
    <div className="relative w-full">
      <div className="relative">
        <input
          ref={inputRef}
          id={inputId}
          type="text"
          className="w-full border-none outline-none p-3 text-[0.95rem] text-slate-800 bg-transparent font-sans placeholder-slate-400"
          placeholder={placeholder || "City or Airport (e.g. DXB, Dubai)"}
          value={displayValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          autoComplete="off"
        />
        {displayValue && (
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 p-1"
            onMouseDown={(e) => {
              e.preventDefault();
              setDisplayValue(""); onChange(""); setSuggestions([]);
              acceptedRef.current = false;
              inputRef.current?.focus();
            }}
          >
            <X size={14} />
          </button>
        )}
        {loading && (
          <Loader2 size={15} className={cn("absolute top-1/2 -translate-y-1/2 text-teal-600 animate-spin", displayValue ? "right-9" : "right-3")} />
        )}
      </div>

      {typeof window !== "undefined" && createPortal(dropdown, document.body)}
    </div>
  );
};

export default LocationSearch;
