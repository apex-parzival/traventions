"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Plane, Building2, Loader2, X } from "lucide-react";
import { searchLocations, getNearestAirports, getPopularAirports } from "@/services/amadeus";
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
  const [query, setQuery] = useState("");
  const [displayValue, setDisplayValue] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [nearestAirport, setNearestAirport] = useState<any>(null);
  const [popularAirports] = useState(getPopularAirports());
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Geolocation on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            const nearest = await getNearestAirports(pos.coords.latitude.toString(), pos.coords.longitude.toString());
            if (nearest && nearest.length > 0) setNearestAirport(nearest[0]);
          } catch { /* silent */ }
        },
        () => { /* user declined */ },
        { timeout: 5000 }
      );
    }
  }, []);

  // Sync external value changes
  useEffect(() => {
    if (value && value !== query) {
      // If we have a full "City (IATA)" string from parent, set it
      // Otherwise set just the value
      setDisplayValue(value);
      setQuery(value);
    } else if (!value) {
      setDisplayValue("");
      setQuery("");
    }
  }, [value]); // Only sync when value prop changes externally

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const fetchSuggestions = useCallback(async (keyword: string) => {
    if (!keyword || keyword.length < 2) {
      setSuggestions([]);
      return;
    }
    setLoading(true);
    try {
      const data = await searchLocations(keyword);
      setSuggestions(data);
      setActiveIndex(-1);
    } catch {
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setDisplayValue(val);
    setQuery(val);
    
    // If user clears the input, notify parent immediately
    if (val === "") {
      onChange("");
      setSuggestions([]);
    }

    setShowDropdown(true);
    setActiveIndex(-1);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (val.length >= 2) {
      timeoutRef.current = setTimeout(() => fetchSuggestions(val), 300);
    }
  };

  const handleSelect = (item: any) => {
    const iata = item.iataCode;
    const name = `${item.cityName || item.address?.cityName || item.name} (${iata})`;
    setDisplayValue(name);
    setQuery(iata);
    onChange(iata);
    setShowDropdown(false);
    setActiveIndex(-1);
  };

  const handleFocus = () => {
    setShowDropdown(true);
    if (!displayValue || displayValue.length < 2) setSuggestions([]);
    else if (displayValue.length >= 2) fetchSuggestions(displayValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const list = displayValue.length < 2 ? popularAirports : suggestions;
    if (!showDropdown) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, list.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      handleSelect(list[activeIndex]);
    } else if (e.key === "Escape") {
      setShowDropdown(false);
      setActiveIndex(-1);
    }
  };

  const airports = suggestions.filter((s) => s.subType === "AIRPORT");
  const cities = suggestions.filter((s) => s.subType === "CITY");
  const isEmpty = !displayValue || displayValue.length < 2;

  return (
    <div className="relative w-full" ref={containerRef}>
      <div className="relative">
        <input
          ref={inputRef}
          id={inputId}
          type="text"
          className="w-full border-none outline-none p-3 text-[0.95rem] text-[#1e293b] bg-transparent font-sans placeholder-[#94a3b8]"
          placeholder={placeholder || "City or Airport (e.g., DXB, Dubai)"}
          value={displayValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          autoComplete="off"
        />
        {displayValue && (
          <button 
            type="button" 
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors p-1"
            onClick={() => {
              setDisplayValue("");
              setQuery("");
              onChange("");
              inputRef.current?.focus();
            }}
          >
            <X size={14} />
          </button>
        )}
        {loading && <Loader2 size={15} className={cn("absolute right-3 top-1/2 -translate-y-1/2 text-[#0d9488] animate-spin", displayValue && "right-9")} />}
      </div>

      {nearestAirport && !displayValue && (
        <button
          type="button"
          className="bg-none border-none px-4 py-1 pb-2 text-[0.72rem] text-[#0d9488] cursor-pointer block font-medium hover:underline"
          onClick={() => handleSelect({ iataCode: nearestAirport.iataCode, cityName: nearestAirport.address?.cityName || nearestAirport.name, address: nearestAirport.address })}
        >
          📍 Nearest: {nearestAirport.address?.cityName || nearestAirport.name} ({nearestAirport.iataCode})
        </button>
      )}

      {showDropdown && (
        <div className="absolute top-[calc(100%+4px)] -left-[1px] -right-[1px] bg-white border border-[#e2e8f0] rounded-xl shadow-2xl z-[9999] max-h-80 overflow-y-auto py-2">
          {isEmpty ? (
            <>
              <div className="px-4 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-[#94a3b8]">Popular Airports</div>
              {popularAirports.map((item, i) => (
                <div
                  key={item.iataCode}
                  className={cn(
                    "flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors",
                    activeIndex === i ? "bg-[#f0fdf9]" : "hover:bg-[#f0fdf9]"
                  )}
                  onMouseDown={() => handleSelect(item)}
                  onMouseEnter={() => setActiveIndex(i)}
                >
                  <div className="text-base flex-shrink-0 leading-none">{countryToFlag(item.countryCode)}</div>
                  <div className="w-5 h-5 rounded bg-[#eff6ff] text-[#3b82f6] flex items-center justify-center flex-shrink-0">
                    <Plane size={12} />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col">
                    <span className="text-[0.85rem] font-medium text-[#1e293b] truncate">{item.name}</span>
                    <span className="text-[0.72rem] text-[#94a3b8]">{item.cityName} · {item.countryCode}</span>
                  </div>
                  <span className="text-[0.72rem] font-bold px-2 py-0.5 bg-[#0d9488] text-white rounded-md flex-shrink-0">{item.iataCode}</span>
                </div>
              ))}
            </>
          ) : (
            <>
              {loading && suggestions.length === 0 && (
                <div className="flex items-center gap-2 px-4 py-3 text-[#64748b] text-[0.85rem]">
                  <Loader2 size={14} className="animate-spin" /> Searching airports...
                </div>
              )}
              {!loading && suggestions.length === 0 && (
                <div className="p-4 text-center text-[#94a3b8] text-[0.85rem]">No airports found for "{displayValue}"</div>
              )}
              {airports.length > 0 && (
                <>
                  <div className="px-4 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-[#94a3b8]">Airports</div>
                  {airports.map((item, i) => (
                    <div
                      key={item.id || item.iataCode}
                      className={cn(
                        "flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors",
                        activeIndex === i ? "bg-[#f0fdf9]" : "hover:bg-[#f0fdf9]"
                      )}
                      onMouseDown={() => handleSelect({ ...item, cityName: item.address?.cityName })}
                      onMouseEnter={() => setActiveIndex(i)}
                    >
                      <div className="text-base flex-shrink-0 leading-none">{countryToFlag(item.address?.countryCode)}</div>
                      <div className="w-5 h-5 rounded bg-[#eff6ff] text-[#3b82f6] flex items-center justify-center flex-shrink-0">
                        <Plane size={12} />
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col">
                        <span className="text-[0.85rem] font-medium text-[#1e293b] truncate">{item.name}</span>
                        <span className="text-[0.72rem] text-[#94a3b8]">{item.address?.cityName}, {item.address?.countryName || item.address?.countryCode}</span>
                      </div>
                      <span className="text-[0.72rem] font-bold px-2 py-0.5 bg-[#0d9488] text-white rounded-md flex-shrink-0">{item.iataCode}</span>
                    </div>
                  ))}
                </>
              )}
              {cities.length > 0 && (
                <>
                  <div className="px-4 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-[#94a3b8]">Cities</div>
                  {cities.map((item, i) => (
                    <div
                      key={item.id || item.iataCode}
                      className={cn(
                        "flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors",
                        activeIndex === airports.length + i ? "bg-[#f0fdf9]" : "hover:bg-[#f0fdf9]"
                      )}
                      onMouseDown={() => handleSelect({ ...item, cityName: item.address?.cityName })}
                      onMouseEnter={() => setActiveIndex(airports.length + i)}
                    >
                      <div className="text-base flex-shrink-0 leading-none">{countryToFlag(item.address?.countryCode)}</div>
                      <div className="w-5 h-5 rounded bg-[#f0fdf4] text-[#22c55e] flex items-center justify-center flex-shrink-0">
                        <Building2 size={12} />
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col">
                        <span className="text-[0.85rem] font-medium text-[#1e293b] truncate">{item.address?.cityName || item.name}</span>
                        <span className="text-[0.72rem] text-[#94a3b8]">{item.address?.countryName || item.address?.countryCode}</span>
                      </div>
                      <span className="text-[0.72rem] font-bold px-2 py-0.5 bg-[#6366f1] text-white rounded-md flex-shrink-0">{item.iataCode}</span>
                    </div>
                  ))}
                </>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default LocationSearch;
