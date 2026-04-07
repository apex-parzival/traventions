"use client";

import React, { useState, useMemo } from "react";
import { 
  Plane, 
  Calendar, 
  Users, 
  Search as SearchIcon, 
  ArrowRightLeft, 
  ChevronDown, 
  Filter, 
  Plus, 
  Minus, 
  Shield 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import LocationSearch from "@/components/LocationSearch";
import { cn } from "@/lib/utils";
import { SearchParams, CabinClass } from "@/types/flights";

const CABIN_CLASSES = [
  { id: "ECONOMY", label: "Economy" },
  { id: "PREMIUM_ECONOMY", label: "Premium" },
  { id: "BUSINESS", label: "Business" },
  { id: "FIRST", label: "First" },
];

interface FlightSearchFormProps {
  onSearch: (params: SearchParams) => void;
  isSearching: boolean;
  initialParams?: any;
  onOpenFlexibleDate?: () => void;
}

export default function FlightSearchForm({ onSearch, isSearching, onOpenFlexibleDate }: FlightSearchFormProps) {
  const [activeTab, setActiveTab] = useState<'oneWay' | 'roundTrip' | 'multiCity'>("oneWay");
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [pax, setPax] = useState({ adults: 1, children: 0, infants: 0 });
  const [cabinClass, setCabinClass] = useState<CabinClass>("ECONOMY");
  const [showPaxDropdown, setShowPaxDropdown] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [legs, setLegs] = useState([{ origin: "", destination: "", date: "" }]);

  const updatePax = (type: keyof typeof pax, delta: number) => {
    setPax((prev) => ({
      ...prev,
      [type]: Math.max(type === "adults" ? 1 : 0, prev[type] + delta),
    }));
  };

  const travelerLabel = useMemo(() => {
    const parts = [];
    if (pax.adults > 0) parts.push(`${pax.adults} Adult${pax.adults > 1 ? 's' : ''}`);
    if (pax.children > 0) parts.push(`${pax.children} Child${pax.children > 1 ? 'ren' : ''}`);
    if (pax.infants > 0) parts.push(`${pax.infants} Infant${pax.infants > 1 ? 's' : ''}`);
    return parts.length > 0 ? parts.join(', ') : "Select Travelers";
  }, [pax]);

  const handleSubmit = () => {
    onSearch({
        type: activeTab,
        origin: origin.toUpperCase(),
        destination: destination.toUpperCase(),
        departureDate,
        returnDate: activeTab === "roundTrip" ? returnDate : undefined,
        adults: pax.adults,
        children: pax.children,
        infants: pax.infants,
        cabinClass,
        legs: activeTab === "multiCity" ? legs : undefined,
    });
  };

  const swapRoute = () => {
    setOrigin(destination);
    setDestination(origin);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden mb-12">
      <div className="p-8">
        {/* Trip Types */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex bg-slate-100 p-1 rounded-xl">
            {["oneWay", "roundTrip", "multiCity"].map((t) => (
              <button 
                key={t}
                className={cn(
                  "px-6 py-2 text-xs font-bold rounded-lg transition-all",
                  activeTab === t ? "bg-white text-indigo-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                )}
                onClick={() => setActiveTab(t as any)}
              >
                {t === "oneWay" ? "One Way" : t === "roundTrip" ? "Round Trip" : "Multi-City"}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-teal-50 rounded-lg border border-teal-100">
            <Shield size={14} className="text-teal-600" />
            <span className="text-[0.7rem] font-bold text-teal-700 uppercase tracking-wider">Global GDS Inventory</span>
          </div>
        </div>

        {/* Route Logic */}
        {activeTab !== "multiCity" ? (
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-end mb-6">
            <div className="space-y-2">
              <label className="text-[0.65rem] font-black text-slate-400 uppercase tracking-widest ml-1">Departure From</label>
              <LocationSearch value={origin} onChange={setOrigin} placeholder="City or Airport (e.g. DXB)" />
            </div>
            <div className="pb-2">
              <button className="p-3 bg-slate-50 border border-slate-200 rounded-full text-slate-400 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm" onClick={swapRoute}>
                <ArrowRightLeft size={18} />
              </button>
            </div>
            <div className="space-y-2">
              <label className="text-[0.65rem] font-black text-slate-400 uppercase tracking-widest ml-1">Destination To</label>
              <LocationSearch value={destination} onChange={setDestination} placeholder="City or Airport (e.g. LHR)" />
            </div>
          </div>
        ) : (
          <div className="space-y-4 mb-6">
            {legs.map((leg, i) => (
              <div key={i} className="grid grid-cols-[1fr_1fr_180px_auto] gap-3 items-end">
                <div className="space-y-1">
                  <label className="text-[0.6rem] font-bold text-slate-400 uppercase ml-1">Leg {i+1} From</label>
                  <LocationSearch value={leg.origin} onChange={(v) => { const n = [...legs]; n[i].origin = v; setLegs(n); }} />
                </div>
                <div className="space-y-1">
                  <label className="text-[0.6rem] font-bold text-slate-400 uppercase ml-1">Leg {i+1} To</label>
                  <LocationSearch 
                    value={leg.destination} 
                    onChange={(v) => { 
                      const n = [...legs]; 
                      n[i].destination = v; 
                      if (n[i+1]) n[i+1].origin = v;
                      setLegs(n); 
                    }} 
                    placeholder="To"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[0.6rem] font-bold text-slate-400 uppercase ml-1">Departure Date</label>
                  <input 
                    type="date" 
                    className="w-full p-3 bg-slate-50/50 border-none rounded-xl text-sm outline-none focus:bg-slate-100/80 transition-all font-medium text-slate-700" 
                    value={leg.date} 
                    onChange={(e) => { const n = [...legs]; n[i].date = e.target.value; setLegs(n); }} 
                  />
                </div>
                {legs.length > 1 && (
                  <button className="p-3 text-red-400 hover:bg-red-50 rounded-xl" onClick={() => setLegs(legs.filter((_, idx) => idx !== i))}>
                    <Minus size={20} />
                  </button>
                )}
              </div>
            ))}
            <button 
              className="text-indigo-600 text-xs font-bold flex items-center gap-1.5 px-2 mt-4 hover:underline" 
              onClick={() => {
                const lastDest = legs[legs.length - 1].destination;
                setLegs([...legs, { origin: lastDest, destination: '', date: '' }]);
              }}
            >
              <Plus size={16} /> Add Another Leg
            </button>
          </div>
        )}

        {/* Dates & Pax */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {activeTab !== "multiCity" && (
            <>
              <div className="space-y-1.5">
                <label className="text-[0.6rem] font-bold text-slate-400 uppercase tracking-widest ml-1">Departure Date</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input type="date" className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm outline-none focus:border-indigo-400 transition-all font-bold text-slate-900" value={departureDate} onChange={(e) => setDepartureDate(e.target.value)} />
                </div>
              </div>
              {activeTab === "roundTrip" && (
                <div className="space-y-1.5">
                  <label className="text-[0.6rem] font-bold text-slate-400 uppercase tracking-widest ml-1">Return Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input type="date" className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm outline-none focus:border-indigo-400 transition-all font-bold text-slate-900" value={returnDate} onChange={(e) => setReturnDate(e.target.value)} />
                  </div>
                </div>
              )}
            </>
          )}
          <div className="space-y-1.5 relative">
            <label className="text-[0.6rem] font-bold text-slate-400 uppercase tracking-widest ml-1">Travelers</label>
            <button className="w-full flex items-center justify-between pl-4 pr-3 py-2.5 bg-white border border-slate-300 rounded-xl text-sm hover:border-indigo-300 transition-all" onClick={() => setShowPaxDropdown(!showPaxDropdown)}>
              <div className="flex items-center gap-2 text-slate-900 font-bold">
                <Users size={16} className="text-slate-400" />
                {travelerLabel}
              </div>
              <ChevronDown size={14} className="text-slate-400" />
            </button>
            <AnimatePresence>
              {showPaxDropdown && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 shadow-2xl rounded-2xl p-6 z-20 space-y-4">
                  {["adults", "children", "infants"].map((type) => (
                    <div key={type} className="flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-slate-800 capitalize">{type}</div>
                        <div className="text-[0.65rem] text-slate-400">{type==='adults'?'12+ yrs':type==='children'?'2-12 yrs':'<2 yrs'}</div>
                      </div>
                      <div className="flex items-center gap-4">
                        <button 
                          className="w-8 h-8 rounded-full border border-indigo-200 bg-indigo-50 flex items-center justify-center text-indigo-700 hover:bg-indigo-100 disabled:opacity-30 transition-colors" 
                          onClick={() => updatePax(type as any, -1)} 
                          disabled={pax[type as keyof typeof pax] <= (type === "adults" ? 1 : 0)}
                        >
                          <Minus size={14}/>
                        </button>
                        <span className="w-4 text-center font-black text-sm text-indigo-900">{pax[type as keyof typeof pax]}</span>
                        <button 
                          className="w-8 h-8 rounded-full border border-indigo-200 bg-indigo-50 flex items-center justify-center text-indigo-700 hover:bg-indigo-100 transition-colors" 
                          onClick={() => updatePax(type as any, 1)}
                        >
                          <Plus size={14}/>
                        </button>
                      </div>
                    </div>
                  ))}
                  <button className="w-full py-2.5 bg-indigo-900 text-white rounded-xl text-xs font-bold mt-2 shadow-lg shadow-indigo-900/10" onClick={() => setShowPaxDropdown(false)}>Apply Selection</button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Cabin Selection */}
        <div className="mb-8">
          <label className="text-[0.65rem] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Service Class</label>
          <div className="flex gap-2 p-1 bg-slate-50 rounded-xl border border-slate-200 w-fit">
            {CABIN_CLASSES.map((c) => (
              <button 
                key={c.id} 
                className={cn(
                  "px-5 py-2 text-[0.7rem] font-bold rounded-lg transition-all",
                  cabinClass === c.id ? "bg-white text-indigo-900 shadow-sm border border-slate-100" : "text-slate-500 hover:text-slate-700"
                )}
                onClick={() => setCabinClass(c.id as CabinClass)}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Advanced Toggle */}
        <div className="border-t border-slate-50 pt-6 px-2 mb-8">
          <button className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition-colors" onClick={() => setShowAdvanced(!showAdvanced)}>
            <Filter size={14} className={showAdvanced ? "text-indigo-600" : ""} />
            <span className="text-[0.7rem] font-bold uppercase tracking-widest">Advanced Filters</span>
            <ChevronDown size={14} className={cn("transition-transform", showAdvanced && "rotate-180")} />
          </button>
          <AnimatePresence>
            {showAdvanced && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4">
                  {[
                    "Direct Flights Only",
                    "Refundable Fares",
                    "Include Nearby Airports",
                    "Show Corporate Rates"
                  ].map((opt) => (
                    <label key={opt} className="flex items-center gap-3 cursor-pointer group">
                      <input type="checkbox" className="w-4 h-4 rounded border-slate-300 accent-teal-600 cursor-pointer" />
                      <span className="text-xs font-medium text-slate-500 group-hover:text-slate-700">{opt}</span>
                    </label>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-stretch gap-4">
          <button 
            className="flex-1 py-5 bg-[#1e2d4f] text-white rounded-2xl font-black text-base flex items-center justify-center gap-3 hover:bg-[#2a3d66] transition-all disabled:opacity-50 shadow-xl shadow-indigo-900/10 active:scale-[0.98]" 
            onClick={handleSubmit} 
            disabled={isSearching || (activeTab === "multiCity" ? legs.some(l => !l.origin || !l.destination || !l.date) : (!origin || !destination || !departureDate))}
          >
            {isSearching ? <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" /> : <SearchIcon size={20} />}
            {isSearching ? "Analysing Inventory..." : "Check Availability"}
          </button>
          {activeTab !== "multiCity" && onOpenFlexibleDate && (
            <button 
              className="px-8 border-2 border-indigo-100 text-indigo-700 rounded-2xl font-bold flex items-center gap-2 hover:bg-indigo-50/50 transition-all"
              onClick={onOpenFlexibleDate}
            >
              <Calendar size={18} />
              <span className="text-sm">Flexible Dates</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
