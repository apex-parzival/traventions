"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plane,
  Calendar,
  Users,
  Search,
  ArrowRightLeft,
  ChevronDown,
  Filter,
  ArrowUpDown,
  Info,
  Clock,
  ShieldCheck,
  Zap,
  MapPin,
  TrendingUp,
  LayoutGrid,
  Settings,
  HelpCircle,
  Bell,
  LogOut,
  Menu,
  ChevronRight,
  CreditCard,
  History,
  Loader2,
  Briefcase,
  Plus,
  Minus,
  Sparkles,
  Lightbulb,
  CheckCircle2,
  ArrowRight,
  Shield,
  Search as SearchIcon,
  DollarSign,
  Navigation,
  Globe,
  Activity,
  History as HistoryIcon,
  LayoutList,
  Grid,
  GitBranch,
  Hourglass,
  Tag,
} from "lucide-react";
import LocationSearch from "@/components/LocationSearch";
import SeatMap from "@/components/SeatMap";
import FlexibleDateSearch from "@/components/FlexibleDateSearch";
import { searchFlightsAdvanced, getFlightChoicePrediction } from "@/services/amadeus";
import { cn } from "@/lib/utils";

// ─── Constants ───────────────────────────────────────────────────────────────
const CABIN_CLASSES = [
  { id: "ECONOMY", label: "Economy" },
  { id: "PREMIUM_ECONOMY", label: "Premium" },
  { id: "BUSINESS", label: "Business" },
  { id: "FIRST", label: "First" },
];

const SidebarItem = ({ icon: Icon, label, active = false, badge = null, onClick }: any) => (
  <div
    className={cn(
      "flex items-center gap-3 mx-3 px-3 py-2.5 text-[0.82rem] font-semibold rounded-lg transition-all cursor-pointer group",
      active
        ? "bg-[#1e2d4f] text-white shadow-sm"
        : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
    )}
    onClick={onClick}
  >
    <Icon size={17} className={cn(active ? "text-white" : "text-slate-400 group-hover:text-slate-600")} />
    <span>{label}</span>
    {badge && <span className="ml-auto bg-teal-500 text-white text-[0.55rem] px-1.5 py-0.5 rounded-full font-bold tracking-wide">{badge}</span>}
  </div>
);

export default function FlightsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("oneWay"); // oneWay | roundTrip | multiCity
  const [isFlexibleMode, setIsFlexibleMode] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [pax, setPax] = useState({ adults: 1, children: 0, infants: 0 });
  const [cabinClass, setCabinClass] = useState("ECONOMY");
  const [showPaxDropdown, setShowPaxDropdown] = useState(false);

  // Multi-city legs
  const [legs, setLegs] = useState([{ origin: "", destination: "", date: "" }]);

  // UI State
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showSeatMap, setShowSeatMap] = useState<any>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [recentSearches, setRecentSearches] = useState<any[]>([]);
  const [view, setView] = useState<"search" | "results">("search");

  // Filter States
  const [maxPrice, setMaxPrice] = useState<number>(5000);
  const [selectedStops, setSelectedStops] = useState<string[]>([]);
  const [selectedAirlines, setSelectedAirlines] = useState<string[]>([]);
  const [selectedTimes, setSelectedTimes] = useState<string[]>([]);
  const [selectedFareOptions, setSelectedFareOptions] = useState<string[]>(["net", "ndc", "consolidator", "corporate"]);
  const [dictionaries, setDictionaries] = useState<any>({});
  const [sortBy, setSortBy] = useState<"best" | "cheapest">("best");

  const getAirlineName = (code: string) => {
    return dictionaries.carriers?.[code] || code;
  };

  // Load recent searches on mount
  useEffect(() => {
    const saved = localStorage.getItem("recentSearches");
    if (saved) setRecentSearches(JSON.parse(saved));
  }, []);

  const handleSearch = async (flexParams: any = null) => {
    setIsSearching(true);
    setError(null);
    try {
      const validLegs = legs.filter(l => l.origin && l.destination && l.date);
      const searchParams = flexParams || {
        type: activeTab,
        origin: origin.toUpperCase(),
        destination: destination.toUpperCase(),
        departureDate,
        returnDate: activeTab === "roundTrip" ? returnDate : undefined,
        adults: pax.adults,
        children: pax.children,
        infants: pax.infants,
        cabinClass,
        legs: activeTab === "multiCity" ? validLegs : undefined,
      };

      if (activeTab === "multiCity" && (!validLegs || validLegs.length === 0)) {
         throw new Error("Please fill out at least one valid flight leg for multi-city search.");
      }

      // Auto-fill form if coming from Flexible Date Search
      if (flexParams) {
        setIsFlexibleMode(false);
        if (flexParams.origin) setOrigin(flexParams.origin);
        if (flexParams.destination) setDestination(flexParams.destination);
        if (flexParams.departureDate) setDepartureDate(flexParams.departureDate);
        if (flexParams.returnDate) setReturnDate(flexParams.returnDate);
        if (flexParams.type) setActiveTab(flexParams.type);
      }

      // Save to recent searches
      if (!flexParams) {
        const newSearch = { ...searchParams, id: Date.now() };
        const updated = [newSearch, ...recentSearches.filter(s => 
          !(s.origin === newSearch.origin && s.destination === newSearch.destination && s.departureDate === newSearch.departureDate)
        )].slice(0, 5);
        setRecentSearches(updated);
        localStorage.setItem("recentSearches", JSON.stringify(updated));
      }

      const response = await searchFlightsAdvanced(searchParams);
      const data = response.data.map((flight: any, i: number) => {
        const types = ['net', 'ndc', 'commissionable', 'corporate'];
        return { ...flight, fareType: types[i % types.length] };
      });
      setResults(data);
      setDictionaries(response.dictionaries || {});

      if (data && data.length > 0) {
        setView("results");
        try {
          await getFlightChoicePrediction(data.slice(0, 10));
        } catch (e) { /* silent */ }
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong during search.");
    } finally {
      setIsSearching(false);
      setIsFlexibleMode(false);
    }
  };

  // Automated Filter Logic
  const filteredResults = useMemo(() => {
    let res = results.filter(flight => {
      const price = parseFloat(flight.price.total);
      if (price > maxPrice) return false;

      const stops = flight.itineraries[0].segments.length - 1;
      if (selectedStops.length > 0) {
        const stopLabel = stops === 0 ? "Non-stop" : stops === 1 ? "1 Stop" : "2+ Stops";
        if (!selectedStops.includes(stopLabel)) return false;
      }

      const carrier = flight.itineraries[0].segments[0].carrierCode;
      if (selectedAirlines.length > 0 && !selectedAirlines.includes(carrier)) return false;

      // Fare Type Filter
      if (selectedFareOptions.length > 0) {
        if (!selectedFareOptions.includes(flight.fareType)) return false;
      }

      return true;
    });

    if (sortBy === "cheapest") {
      res.sort((a, b) => parseFloat(a.price.total) - parseFloat(b.price.total));
    } else {
      // "Best" sorting (heuristic: price + duration)
      res.sort((a, b) => {
        const scoreA = parseFloat(a.price.total);
        const scoreB = parseFloat(b.price.total);
        return scoreA - scoreB;
      });
    }

    return res;
  }, [results, maxPrice, selectedStops, selectedAirlines, selectedFareOptions, sortBy]);

  const swapRoute = () => {
    setOrigin(destination);
    setDestination(origin);
  };

  const updatePax = (type: keyof typeof pax, delta: number) => {
    setPax((prev) => ({
      ...prev,
      [type]: Math.max(type === "adults" ? 1 : 0, prev[type] + delta),
    }));
  };

  const totalPax = pax.adults + pax.children + pax.infants;
  const travelerLabel = useMemo(() => {
    const parts = [];
    if (pax.adults > 0) parts.push(`${pax.adults} Adult${pax.adults > 1 ? 's' : ''}`);
    if (pax.children > 0) parts.push(`${pax.children} Child${pax.children > 1 ? 'ren' : ''}`);
    if (pax.infants > 0) parts.push(`${pax.infants} Infant${pax.infants > 1 ? 's' : ''}`);
    return parts.length > 0 ? parts.join(', ') : "Select Travelers";
  }, [pax]);

  if (isFlexibleMode) {
    return (
      <FlexibleDateSearch
        searchParams={{ origin, destination, departureDate, returnDate, adults: pax.adults, cabinClass, type: activeTab }}
        onSearch={handleSearch}
        onClose={() => setIsFlexibleMode(false)}
      />
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden flex bg-white">
      {/* Primary Sidebar — Light Theme */}
      <aside className={cn(
        "w-[220px] bg-white flex flex-col flex-shrink-0 transition-all duration-300 border-r border-slate-100",
        !sidebarOpen && "w-0 overflow-hidden"
      )}>
        {/* Logo */}
        <div className="px-5 pt-6 pb-4 cursor-pointer" onClick={() => router.push("/")}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#1e2d4f] rounded-lg flex items-center justify-center text-white font-black text-base shadow">
              <Plane size={16} className="-rotate-45" />
            </div>
            <div className="font-black text-[#1e2d4f] tracking-tight text-[1rem] uppercase">Traventions</div>
          </div>
        </div>

        {/* Agency Badge */}
        <div className="px-4 pb-4">
          <div className="bg-teal-600 text-white text-[0.6rem] font-black px-3 py-1.5 rounded-md tracking-widest uppercase">TMC Booking Agent</div>
          <div className="text-[0.65rem] text-slate-400 font-medium mt-1 px-1">ABC Travel Solutions</div>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar py-2">
          {/* Section: Book Travel */}
          <div className="mb-1">
            <div className="text-[0.6rem] font-black text-slate-400 uppercase px-6 mb-2 tracking-[0.18em]">Book Travel</div>
            <SidebarItem icon={LayoutGrid} label="Dashboard" />
            <SidebarItem icon={Plane} label="Search Flights" active />
            <SidebarItem icon={LayoutGrid} label="Search Hotels" />
            <SidebarItem icon={Briefcase} label="Search Cabs / Transfers" />
          </div>

          <div className="h-px bg-slate-100 my-3 mx-4" />

          {/* Section: My Bookings */}
          <div className="mb-1">
            <div className="text-[0.6rem] font-black text-slate-400 uppercase px-6 mb-2 tracking-[0.18em]">My Bookings</div>
            <SidebarItem icon={History} label="All Bookings" />
            <SidebarItem icon={Calendar} label="Upcoming Trips" />
          </div>

          <div className="h-px bg-slate-100 my-3 mx-4" />

          {/* Intelligence */}
          <SidebarItem icon={TrendingUp} label="Intelligence" badge="AI" />
        </div>

        {/* Bottom: User Profile */}
        <div className="border-t border-slate-100 p-3">
          <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-slate-50 transition-all cursor-pointer group">
            <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center font-bold text-teal-700 text-xs border-2 border-white shadow-sm overflow-hidden">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=John" alt="SA" className="w-full h-full" />
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="text-[0.75rem] font-bold text-slate-800 truncate leading-tight">John Doe</div>
              <div className="text-[0.6rem] text-slate-400 font-medium">TMC Booking Agent</div>
            </div>
            <LogOut size={14} className="text-slate-300 group-hover:text-red-400 transition-colors shrink-0" />
          </div>
          <div className="mt-2">
            <SidebarItem icon={Users} label="My Profile" />
            <SidebarItem icon={Settings} label="Settings" />
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-0 overflow-hidden bg-slate-50/30">
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-8 flex-shrink-0 z-10 shadow-sm">
          <div className="flex items-center gap-4">
            <button className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-all" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest overflow-hidden truncate max-w-[200px] sm:max-w-none">
              <span className="text-slate-400">Hub</span>
              <span className="text-slate-300">/</span>
              <span className="text-indigo-600">Inventory</span>
              <span className="text-slate-300">/</span>
              <span className="text-slate-900">Flights</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-2xl px-4 py-2 text-[0.7rem] shadow-sm">
              <span className="text-emerald-600 font-black uppercase tracking-tighter shrink-0">Credit line:</span>
              <span className="font-black text-slate-800 shrink-0">$42,850.00</span>
              <Plus size={14} className="text-emerald-700 cursor-pointer bg-white rounded-full p-0.5 border border-emerald-100 shadow-sm" />
            </div>
            <div className="relative cursor-pointer text-slate-500 hover:text-indigo-600 transition-colors bg-slate-50 border border-slate-100 p-2.5 rounded-2xl">
              <Bell size={20} />
              <span className="absolute top-0 right-0 bg-red-500 text-white text-[0.6rem] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-white ring-2 ring-red-100/50 -translate-y-1 translate-x-1">3</span>
            </div>
            <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
              <div className="hidden md:block text-right">
                <div className="text-[0.75rem] font-black text-slate-900 leading-none">John Doe</div>
                <div className="text-[0.6rem] text-slate-400 uppercase mt-1 tracking-widest font-black">Senior Consultant</div>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-indigo-900 text-white flex items-center justify-center font-bold text-sm shadow-xl shadow-indigo-900/20 ring-4 ring-indigo-50">JD</div>
            </div>
          </div>
        </header>

        {/* Dynamic Content Pane (Fixed Height) */}
        <div className="flex-1 flex flex-col min-h-0 min-w-0 bg-slate-50/50">
          {view === "search" ? (
            <div className="flex-1 overflow-y-auto p-8 lg:p-12 no-scrollbar">
              <div className="max-w-5xl mx-auto">
              <div className="mb-8">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Book a Flight</h1>
                <p className="text-slate-500 font-medium">Access over 400+ airlines, GDS inventory and private NDC fares.</p>
              </div>

              {/* Search Panel */}
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
                          onClick={() => setActiveTab(t)}
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
                                  // Auto-fill next leg's origin
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
                           onClick={() => setCabinClass(c.id)}
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
                      onClick={() => handleSearch()} 
                      disabled={isSearching || (activeTab === "multiCity" ? legs.some(l => !l.origin || !l.destination || !l.date) : (!origin || !destination || !departureDate))}
                    >
                      {isSearching ? <Loader2 className="animate-spin" size={20} /> : <SearchIcon size={20} />}
                      {isSearching ? "Analysing Inventory..." : "Check Availability"}
                    </button>
                    
                    {activeTab !== "multiCity" && (
                      <button 
                        className="px-8 border-2 border-indigo-100 text-indigo-700 rounded-2xl font-bold flex items-center gap-2 hover:bg-indigo-50/50 transition-all"
                        onClick={() => { if (!origin || !destination || !departureDate) return; setIsFlexibleMode(true); }}
                      >
                        <Calendar size={18} />
                        <span className="text-sm">Flexible Dates</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* RECENT SEARCHES */}
              <div className="mb-12">
                 <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                       <HistoryIcon className="text-indigo-900" size={22} />
                       <h2 className="text-xl font-black text-slate-800 tracking-tight">Recent Searches</h2>
                    </div>
                    <button className="text-xs font-bold text-red-500 hover:underline" onClick={() => { setRecentSearches([]); localStorage.removeItem("recentSearches"); }}>
                       Clear History
                    </button>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {recentSearches.length > 0 ? recentSearches.map((s) => (
                      <div 
                        key={s.id} 
                        className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-xl transition-all cursor-pointer group"
                        onClick={() => {
                          setOrigin(s.origin); setDestination(s.destination);
                          setDepartureDate(s.departureDate); if (s.returnDate) { setReturnDate(s.returnDate); setActiveTab("roundTrip"); } else { setActiveTab("oneWay"); }
                          setCabinClass(s.cabinClass);
                        }}
                      >
                        <div className="flex items-center justify-between mb-4">
                           <div className="flex items-center gap-2 font-black text-slate-800">
                             <span>{s.origin}</span>
                             <ArrowRight size={14} className="text-slate-400" />
                             <span>{s.destination}</span>
                           </div>
                           <span className="text-[0.6rem] font-black bg-slate-100 px-2 py-1 rounded-full text-slate-500 uppercase tracking-widest">{s.type === 'roundTrip' ? 'RT' : 'OW'}</span>
                        </div>
                        <div className="space-y-2 mb-6">
                           <div className="flex items-center gap-2 text-[0.7rem] text-slate-500 font-medium">
                              <Calendar size={12} /> {new Date(s.departureDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                              {s.returnDate && ` - ${new Date(s.returnDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`}
                           </div>
                           <div className="flex items-center gap-2 text-[0.7rem] text-slate-500 font-medium lowercase">
                              <Users size={12} /> {s.adults} adult, {s.cabinClass}
                           </div>
                        </div>
                        <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                           <span className="text-[0.6rem] font-bold text-slate-400">Search again</span>
                           <div className="w-8 h-8 rounded-full bg-slate-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
                              <ArrowRight size={14} />
                           </div>
                        </div>
                      </div>
                    )) : (
                      <div className="col-span-3 py-16 bg-white rounded-2xl border border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400">
                         <History size={32} className="mb-2 opacity-20" />
                         <p className="text-sm font-medium italic">Your recent searches will appear here.</p>
                      </div>
                    )}
                 </div>
              </div>

              {/* Pro Tips */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                 <div className="bg-indigo-900 rounded-3xl p-8 text-white relative overflow-hidden group">
                    <Lightbulb className="absolute -bottom-6 -right-6 text-white/5 w-40 h-40 group-hover:rotate-12 transition-transform duration-700" />
                    <div className="relative z-10">
                       <h3 className="text-xl font-black mb-4 flex items-center gap-2">
                          <Sparkles size={24} className="text-amber-400" /> Professional Insight
                       </h3>
                       <div className="space-y-4">
                          {[
                            "Direct flights from DXB are peaking in demand.",
                            "Use NDC pipes for lower fees on Emirates routes.",
                            "Consultant override available for VIP itineraries."
                          ].map(txt => (
                            <div key={txt} className="flex gap-3 text-indigo-100 font-medium text-sm">
                               <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
                               <span>{txt}</span>
                            </div>
                          ))}
                       </div>
                    </div>
                 </div>

                 <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm">
                    <h3 className="text-xl font-black text-slate-800 mb-4 tracking-tight">System Status</h3>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                          <div className="text-[0.6rem] font-bold text-emerald-600 uppercase mb-1">Amadeus GDS</div>
                          <div className="text-sm font-black text-slate-800">Operational</div>
                       </div>
                       <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                          <div className="text-[0.6rem] font-bold text-emerald-600 uppercase mb-1">NDC Pipes</div>
                          <div className="text-sm font-black text-slate-800">100% Signal</div>
                       </div>
                    </div>
                    <div className="mt-6 flex items-center gap-3 p-4 bg-slate-50 rounded-2xl">
                       <Zap size={20} className="text-amber-500" />
                       <div className="text-xs font-medium text-slate-600">Pricing data is refreshed every 30 seconds for maximum accuracy.</div>
                    </div>
                 </div>
              </div>

              <footer className="pt-10 border-t border-slate-100 pb-20 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="text-[0.8rem] text-slate-400 font-medium">© 2024 TRANVENTIONS LTD. POWERED BY AI GDS.</div>
                <div className="flex items-center gap-8">
                  <Link href="#" className="text-[0.78rem] font-bold text-slate-500 hover:text-indigo-600 transition-colors uppercase tracking-widest">Pricing</Link>
                  <Link href="#" className="text-[0.78rem] font-bold text-slate-500 hover:text-indigo-600 transition-colors uppercase tracking-widest">Compliance</Link>
                  <Link href="#" className="text-[0.78rem] font-bold text-slate-500 hover:text-indigo-600 transition-colors uppercase tracking-widest">Network</Link>
                  <button className="bg-white border border-slate-200 text-slate-700 px-6 py-2.5 rounded-full text-[0.75rem] font-black flex items-center gap-2 shadow-sm hover:bg-slate-50 transition-all">
                    <HistoryIcon size={14} /> Full Log
                  </button>
                </div>
              </footer>
            </div>
          </div>
        ) : (
            <div className="flex-1 flex flex-col min-h-0 bg-slate-50/30 overflow-hidden">
               {/* STICKY RESULTS HEADER */}
               <div className="flex-shrink-0 bg-white/80 backdrop-blur-xl p-5 border-b border-slate-100 flex items-center justify-between z-10">
                  <div className="flex items-center gap-8 pl-4">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-900 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-900/10">
                           <Plane size={24} />
                        </div>
                        <div>
                           <div className="text-xl font-black text-slate-900 tracking-tight leading-none">{origin} <span className="text-slate-300">→</span> {destination}</div>
                           <div className="text-[0.65rem] font-black text-indigo-500 uppercase tracking-widest mt-2 flex items-center gap-2">
                             <Calendar size={12} /> {departureDate} <span className="w-1 h-1 bg-slate-300 rounded-full"></span> <Users size={12} /> {totalPax} Traveler{totalPax>1?'s':''}
                           </div>
                        </div>
                     </div>
                  </div>
                  <div className="flex gap-3">
                    <button className="flex items-center gap-2 bg-white border border-slate-200 px-6 py-3 rounded-2xl text-slate-700 font-bold text-xs hover:bg-slate-50 transition-all uppercase tracking-widest shadow-sm" onClick={() => setView("search")}>
                       <SearchIcon size={14} /> Modify
                    </button>
                    <button className="p-3 bg-indigo-900 text-white rounded-2xl shadow-xl shadow-indigo-900/10 hover:bg-indigo-950 transition-all">
                      <Plus size={20} />
                    </button>
                  </div>
               </div>

               {/* MAIN SCROLLABLE DUAL AREA */}
               <div className="flex-1 flex overflow-hidden min-h-0">
                  {/* INDEPENDENT FILTER SIDEBAR */}
                  <aside className="w-[320px] h-full flex-shrink-0 overflow-y-auto no-scrollbar border-r border-slate-100 bg-white/40 p-6">
                        <div className="flex items-center justify-between mb-6">
                           <div className="flex items-center gap-2">
                              <Filter size={16} className="text-indigo-600" />
                              <h4 className="font-black text-[#1e2d4f] text-lg tracking-tight">Filters</h4>
                           </div>
                           <button 
                             className="text-[0.65rem] font-black text-indigo-600 uppercase tracking-widest hover:text-indigo-800 transition-colors"
                             onClick={() => {
                               setMaxPrice(5000);
                               setSelectedStops([]);
                               setSelectedAirlines([]);
                               setSelectedTimes([]);
                             }}
                           >
                             Clear All
                           </button>
                        </div>

                        {/* Price Section */}
                        <div className="mb-8 group">
                           <div className="flex items-center gap-2 mb-4">
                              <span className="text-slate-400"><DollarSign size={14} /></span>
                              <div className="text-[0.65rem] font-black text-slate-900 uppercase tracking-wider">Price (per person)</div>
                           </div>
                           <div className="px-1">
                              <div className="flex justify-between items-center mb-2">
                                 <span className="text-[0.65rem] font-bold text-slate-400 tracking-tight">$0</span>
                                 <span className="text-[0.65rem] font-bold text-slate-400 tracking-tight">${maxPrice}</span>
                              </div>
                              <input 
                                type="range" 
                                min="0"
                                max="5000"
                                step="50"
                                value={maxPrice}
                                onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                                className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-red-600 mb-5" 
                              />
                              <div className="flex items-center gap-3">
                                 <div className="flex-1">
                                    <input 
                                      type="text" 
                                      value="0" 
                                      disabled
                                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-[0.75rem] font-bold text-slate-400 outline-none" 
                                    />
                                 </div>
                                 <div className="text-slate-300">-</div>
                                 <div className="flex-1">
                                    <input 
                                      type="text" 
                                      value={maxPrice} 
                                      onChange={(e) => setMaxPrice(parseInt(e.target.value) || 0)}
                                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-[0.75rem] font-bold text-slate-900 focus:border-red-400 outline-none transition-colors" 
                                    />
                                 </div>
                              </div>
                           </div>
                        </div>

                        <div className="h-px bg-slate-50 mb-8"></div>

                        {/* Stops Section */}
                        <div className="mb-8">
                           <div className="flex items-center gap-2 mb-4">
                              <GitBranch size={14} className="text-slate-400" />
                              <div className="text-[0.65rem] font-black text-slate-900 uppercase tracking-wider">Stops</div>
                           </div>
                           <div className="space-y-3">
                               {Array.from(new Set(results.map(f => f.itineraries[0].segments.length === 1 ? "Non-stop" : f.itineraries[0].segments.length === 2 ? "1 Stop" : "2+ Stops"))).map(label => {
                                 // Faceted count: Apply all filters EXCEPT 'stops'
                                 const count = results.filter(f => {
                                    const price = parseFloat(f.price.total);
                                    if (price > maxPrice) return false;
                                    const carrier = f.itineraries[0].segments[0].carrierCode;
                                    if (selectedAirlines.length > 0 && !selectedAirlines.includes(carrier)) return false;
                                    
                                    const stops = f.itineraries[0].segments.length - 1;
                                    const sLabel = stops === 0 ? "Non-stop" : stops === 1 ? "1 Stop" : "2+ Stops";
                                    return sLabel === label;
                                 }).length;

                                 const color = label === "Non-stop" ? "bg-emerald-50 text-emerald-600" : label === "1 Stop" ? "bg-orange-50 text-orange-400" : "bg-rose-50 text-rose-400";
                                 
                                 return (
                                   <label key={label} className="flex items-center justify-between group cursor-pointer">
                                      <div className="flex items-center gap-3">
                                         <input 
                                           type="checkbox" 
                                           className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer" 
                                           checked={selectedStops.includes(label)}
                                           onChange={(e) => {
                                              if (e.target.checked) setSelectedStops([...selectedStops, label]);
                                              else setSelectedStops(selectedStops.filter(id => id !== label));
                                           }}
                                         />
                                         <span className="text-[0.75rem] font-bold text-slate-600 group-hover:text-slate-900 transition-colors uppercase tracking-tight">{label}</span>
                                      </div>
                                      <span className={`px-2 py-0.5 rounded-full text-[0.7rem] font-black min-w-[28px] text-center ${color}`}>{count}</span>
                                   </label>
                                 );
                               })}
                           </div>
                        </div>

                        <div className="h-px bg-slate-50 mb-8"></div>

                        {/* Airlines Section */}
                        <div className="mb-8">
                           <div className="flex items-center gap-2 mb-4">
                              <Plane size={14} className="text-slate-400" />
                              <div className="text-[0.65rem] font-black text-slate-900 uppercase tracking-wider">Airlines</div>
                           </div>
                           <div className="space-y-3">
                               {Array.from(new Set(results.map(f => f.itineraries[0].segments[0].carrierCode))).slice(0, 8).map(carrier => {
                                 // Faceted count: Apply all filters EXCEPT 'airlines'
                                 const count = results.filter(f => {
                                    const price = parseFloat(f.price.total);
                                    if (price > maxPrice) return false;
                                    
                                    const stops = f.itineraries[0].segments.length - 1;
                                    if (selectedStops.length > 0) {
                                       const sLabel = stops === 0 ? "Non-stop" : stops === 1 ? "1 Stop" : "2+ Stops";
                                       if (!selectedStops.includes(sLabel)) return false;
                                    }
                                    
                                    return f.itineraries[0].segments[0].carrierCode === carrier;
                                 }).length;

                                 return (
                                   <label key={carrier} className="flex items-center justify-between group cursor-pointer">
                                      <div className="flex items-center gap-3">
                                         <input 
                                           type="checkbox" 
                                           className="w-4 h-4 rounded border-slate-300 text-indigo-600 cursor-pointer" 
                                           checked={selectedAirlines.includes(carrier)}
                                           onChange={(e) => {
                                              if (e.target.checked) setSelectedAirlines([...selectedAirlines, carrier]);
                                              else setSelectedAirlines(selectedAirlines.filter(id => id !== carrier));
                                           }}
                                         />
                                         <div className="flex items-center gap-2">
                                             <div className="p-1 bg-slate-50 rounded-md"><Plane size={10} className="text-slate-400" /></div>
                                             <span className="text-[0.75rem] font-bold text-slate-600 group-hover:text-slate-900 transition-colors tracking-tight">{getAirlineName(carrier)}</span>
                                         </div>
                                      </div>
                                      <span className="text-[0.7rem] font-bold text-slate-400">{count}</span>
                                   </label>
                                 );
                               })}
                               <button className="text-[0.7rem] font-black text-indigo-600 tracking-wide mt-2 block hover:underline">Show all airlines</button>
                           </div>
                        </div>

                        <div className="h-px bg-slate-50 mb-8"></div>

                        {/* Time Grid Section */}
                        {["Departure Time", "Arrival Time"].map(title => (
                          <div key={title} className="mb-8">
                             <div className="flex items-center gap-2 mb-4">
                                <Clock size={14} className="text-slate-400" />
                                <div className="text-[0.65rem] font-black text-slate-900 uppercase tracking-wider">{title}</div>
                             </div>
                             <div className="grid grid-cols-2 gap-2">
                                {[
                                  {label: "Morning", range: "06:00-12:00"},
                                  {label: "Afternoon", range: "12:00-18:00"},
                                  {label: "Evening", range: "18:00-24:00"},
                                  {label: "Night", range: "00:00-06:00"}
                                ].map(time => (
                                  <button key={time.label} className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/10 transition-all text-center group">
                                     <span className="text-[0.7rem] font-black text-slate-700 group-hover:text-indigo-900">{time.label}</span>
                                     <span className="text-[0.55rem] font-bold text-slate-400 mt-1">{time.range}</span>
                                  </button>
                                ))}
                             </div>
                          </div>
                        ))}

                        <div className="h-px bg-slate-50 mb-8"></div>

                        {/* Duration Section */}
                        <div className="mb-8">
                           <div className="flex items-center gap-2 mb-4">
                              <Hourglass size={14} className="text-slate-400" />
                              <div className="text-[0.65rem] font-black text-slate-900 uppercase tracking-wider">Duration</div>
                           </div>
                           <div className="px-1">
                              <div className="flex justify-between items-center mb-2">
                                 <span className="text-[0.65rem] font-bold text-slate-400 tracking-tight">5h 30m</span>
                                 <span className="text-[0.65rem] font-bold text-slate-400 tracking-tight">24h 15m</span>
                              </div>
                              <input type="range" className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-red-600" />
                           </div>
                        </div>

                        <div className="h-px bg-slate-50 mb-8"></div>

                        {/* Layover Airport */}
                        <div className="mb-8">
                           <div className="flex items-center gap-2 mb-4">
                              <MapPin size={14} className="text-slate-400" />
                              <div className="text-[0.65rem] font-black text-slate-900 uppercase tracking-wider">Layover Airport</div>
                           </div>
                           <div className="space-y-3">
                              {["Istanbul (IST)", "Doha (DOH)", "Abu Dhabi (AUH)"].map(airport => (
                                <label key={airport} className="flex items-center justify-between group cursor-pointer">
                                   <div className="flex items-center gap-3">
                                      <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-indigo-600 cursor-pointer" />
                                      <span className="text-[0.75rem] font-bold text-slate-600 group-hover:text-slate-900 transition-colors tracking-tight uppercase">{airport}</span>
                                   </div>
                                   <span className="text-[0.7rem] font-bold text-slate-400">48</span>
                                </label>
                              ))}
                           </div>
                        </div>

                        <div className="h-px bg-slate-50 mb-8"></div>

                        {/* Fare Type Section */}
                        <div className="mb-8">
                           <div className="flex items-center gap-2 mb-4">
                              <Tag size={14} className="text-slate-400" />
                              <div className="flex items-center gap-2">
                                 <div className="text-[0.65rem] font-black text-slate-900 uppercase tracking-wider">Fare Type</div>
                                 <span className="text-[0.55rem] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded uppercase tracking-wider">Agent Only</span>
                              </div>
                           </div>
                           <div className="space-y-3">
                              {[
                                 { id: 'net', label: 'Net Fare (No Commission)' },
                                 { id: 'ndc', label: 'NDC Fares' },
                                 { id: 'commissionable', label: 'Commissionable' },
                                 { id: 'corporate', label: 'Corporate Fare' }
                              ].map(fare => (
                                <label key={fare.id} className="flex items-center gap-3 group cursor-pointer">
                                   <input 
                                     type="checkbox" 
                                     className="w-4 h-4 rounded border-slate-300 text-indigo-600 cursor-pointer" 
                                     checked={selectedFareOptions.includes(fare.id)}
                                     onChange={(e) => {
                                        if (e.target.checked) setSelectedFareOptions([...selectedFareOptions, fare.id]);
                                        else setSelectedFareOptions(selectedFareOptions.filter(id => id !== fare.id));
                                     }}
                                   />
                                   <span className="text-[0.75rem] font-bold text-slate-600 group-hover:text-slate-900 transition-colors tracking-tight uppercase">{fare.label}</span>
                                </label>
                              ))}
                           </div>
                        </div>

                        <div className="h-px bg-slate-50 mb-8"></div>

                        {/* Alliance */}
                        <div className="mb-4">
                           <div className="flex items-center gap-2 mb-4">
                              <Users size={14} className="text-slate-400" />
                              <div className="text-[0.65rem] font-black text-slate-900 uppercase tracking-wider">Alliance</div>
                           </div>
                           <div className="space-y-3">
                              {["Star Alliance", "Oneworld", "SkyTeam"].map(alliance => (
                                <label key={alliance} className="flex items-center gap-3 group cursor-pointer">
                                   <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-indigo-600 cursor-pointer" />
                                   <span className="text-[0.75rem] font-bold text-slate-600 group-hover:text-slate-900 transition-colors tracking-tight uppercase">{alliance}</span>
                                </label>
                              ))}
                           </div>
                        </div>
                  </aside>

                  {/* INDEPENDENT RESULTS LIST */}
                  <div className="flex-1 h-full overflow-y-auto no-scrollbar p-6 space-y-8 bg-slate-50/50">
                     <div className="max-w-4xl mx-auto">
                        <div className="flex items-center justify-between mb-6">
                           <div className="flex items-center gap-2 bg-white px-5 py-2.5 rounded-2xl border border-slate-200/60 shadow-sm">
                              <Sparkles className="text-amber-500" size={16} />
                              <span className="text-[0.7rem] font-black text-slate-800 uppercase tracking-widest">{filteredResults.length} Matched Options</span>
                           </div>
                           <div className="flex items-center gap-3">
                              <span className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest">Sort:</span>
                              <div className="flex bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
                                <button 
                                  className={cn(
                                    "px-4 py-1.5 rounded-lg text-[0.65rem] font-black uppercase tracking-tight transition-all",
                                    sortBy === "best" ? "bg-indigo-900 text-white shadow-sm" : "text-slate-500 hover:bg-slate-50"
                                  )}
                                  onClick={() => setSortBy("best")}
                                >
                                  Best
                                </button>
                                <button 
                                  className={cn(
                                    "px-4 py-1.5 rounded-lg text-[0.65rem] font-black uppercase tracking-tight transition-all",
                                    sortBy === "cheapest" ? "bg-indigo-900 text-white shadow-sm" : "text-slate-500 hover:bg-slate-50"
                                  )}
                                  onClick={() => setSortBy("cheapest")}
                                >
                                  Cheapest
                                </button>
                              </div>
                           </div>
                        </div>

                     {filteredResults.map((flight, idx) => (
                        <div key={idx} className="bg-white border border-slate-100 rounded-[2rem] shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden group mb-8">
                           <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px]">
                              {/* Journey Info Area */}
                              <div className="p-6 border-r border-slate-50">
                                 <div className="flex items-center gap-3 mb-6">
                                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border border-slate-100 shadow-sm group-hover:scale-110 transition-transform p-2 overflow-hidden">
                                       <img 
                                          src={`https://pics.avs.io/60/60/${flight.itineraries[0].segments[0].carrierCode}.png`} 
                                          alt={flight.itineraries[0].segments[0].carrierCode}
                                          className="w-full h-full object-contain"
                                          onError={(e) => { (e.target as HTMLImageElement).src = 'https://pics.avs.io/60/60/AI.png'; }} // Fallback
                                       />
                                    </div>
                                    <div>
                                       <div className="text-[0.6rem] font-black text-slate-400 uppercase tracking-widest mb-1 group-hover:text-indigo-400 transition-colors">Carrier</div>
                                       <div className="text-sm font-black text-slate-900 group-hover:text-indigo-900 transition-colors">{getAirlineName(flight.itineraries[0].segments[0].carrierCode)}</div>
                                       <div className="text-[0.6rem] font-black text-indigo-600 tracking-widest uppercase mt-1">Airbus A380 • {flight.itineraries?.[0]?.segments?.[0]?.cabin || 'Economy'}</div>
                                    </div>
                                    {idx === 0 && (
                                      <div className="ml-auto flex items-center gap-1.5 bg-amber-50 text-amber-700 text-[0.6rem] font-black tracking-widest px-3 py-1.5 rounded-full uppercase shadow-sm border border-amber-100">
                                         <Sparkles size={12} className="fill-amber-600/10 animate-pulse" /> RECOMMENDED
                                      </div>
                                    )}
                                 </div>

                                 {flight.itineraries.map((itinerary: any, iIdx: number) => (
                                     <div key={iIdx} className={cn("flex items-center justify-between relative px-2 mb-8", iIdx > 0 && "pt-8 border-t border-slate-50")}>
                                        {/* Leg Indicator for Multi-City */}
                                        {flight.itineraries.length > 1 && (
                                          <div className="absolute -top-1 left-2 text-[0.5rem] font-black text-slate-400 uppercase tracking-[0.2em] bg-white px-2 py-0.5 rounded-full border border-slate-100 shadow-sm z-10">Leg {iIdx+1}</div>
                                        )}
                                        
                                        <div className="text-center w-24">
                                           <div className="text-xl font-black text-slate-900 mb-0.5">{itinerary.segments?.[0]?.departure?.at?.split('T')[1]?.substring(0,5)}</div>
                                           <div className="text-[0.65rem] font-black text-slate-400 uppercase tracking-widest">{itinerary.segments?.[0]?.departure?.iataCode}</div>
                                        </div>
                                        
                                        <div className="flex-1 px-8 flex flex-col items-center relative">
                                           <span className="text-[0.6rem] font-black text-indigo-400 bg-indigo-50 px-2 py-0.5 rounded-full mb-3 tracking-tighter uppercase">{itinerary.duration?.substring(2)}</span>
                                           <div className="w-full flex items-center gap-2">
                                              <div className="h-px flex-1 bg-slate-100"></div>
                                              <div className="text-slate-300 transform group-hover:translate-x-2 transition-transform duration-700">
                                                 <Plane size={16} className="-rotate-45" />
                                              </div>
                                              <div className="h-px flex-1 bg-slate-100"></div>
                                           </div>
                                           <span className="text-[0.6rem] font-bold text-emerald-600 mt-3 flex items-center gap-1 uppercase tracking-widest">
                                              <Globe size={12} /> {itinerary.segments.length > 1 ? `${itinerary.segments.length - 1} Stop` : "Direct"}
                                           </span>
                                        </div>

                                        <div className="text-center w-24">
                                           <div className="text-xl font-black text-slate-900 mb-0.5">{itinerary.segments?.[itinerary.segments.length-1]?.arrival?.at?.split('T')[1]?.substring(0,5)}</div>
                                           <div className="text-[0.65rem] font-black text-slate-400 uppercase tracking-widest">{itinerary.segments?.[itinerary.segments.length-1]?.arrival?.iataCode}</div>
                                        </div>
                                     </div>
                                  ))}

                                 <div className="flex items-center gap-6 pt-4 border-t border-slate-50 text-[0.7rem] font-black text-slate-500 overflow-x-auto no-scrollbar">
                                    <div className="flex items-center gap-2 shrink-0 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100/50"><Briefcase size={14} className="text-slate-400"/> 7kg Cabin Luggage</div>
                                    <div className="flex items-center gap-2 shrink-0 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100/50"><Briefcase size={14} className="text-slate-400"/> 23kg Check-in</div>
                                    <div className="flex items-center gap-2 shrink-0 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100 text-emerald-700"><CheckCircle2 size={14}/> Seat selection included</div>
                                 </div>
                              </div>

                              {/* Action & Fare Area */}
                              <div className="bg-slate-50/50 p-5 flex flex-col justify-center border-l border-slate-50">
                                 <div className="mb-5">
                                    <div className="flex items-center justify-between mb-3">
                                       <div className="text-[0.55rem] font-black text-slate-400 uppercase tracking-widest">Fare Type</div>
                                       {(() => {
                                          const fareTypes: Record<string, { label: string; color: string }> = {
                                             net: { label: "Net Fare", color: "text-slate-600 bg-slate-100" },
                                             ndc: { label: "NDC Fare", color: "text-emerald-500 bg-emerald-50" },
                                             commissionable: { label: "Commissionable", color: "text-indigo-500 bg-indigo-50" },
                                             corporate: { label: "Corporate", color: "text-blue-600 bg-blue-50" }
                                          };
                                          const fare = fareTypes[flight.fareType] || fareTypes.commissionable;
                                          return (
                                             <span className={cn("text-[0.55rem] font-black px-2 py-0.5 rounded tracking-tighter uppercase", fare.color)}>
                                                {fare.label}
                                             </span>
                                          );
                                       })()}
                                    </div>
                                    <div className="grid grid-cols-1 gap-1.5 border-b border-slate-100 pb-4 mb-4">
                                       <div className="flex justify-between items-center text-[0.6rem] font-bold">
                                          <span className="text-slate-400 uppercase">
                                             {flight.fareType === 'net' ? 'Net Fare' : flight.fareType === 'ndc' ? 'Direct Fare' : flight.fareType === 'corporate' ? 'Agreed Rate' : 'Buy Price'}:
                                          </span>
                                          <span className="text-slate-800">${(parseFloat(flight.price.total) * (flight.fareType === 'net' ? 1.0 : 0.92)).toFixed(2)}</span>
                                       </div>
                                       {flight.fareType !== 'net' && (
                                         <div className="flex justify-between items-center text-[0.6rem] font-black text-teal-600">
                                            <span className="uppercase">
                                               {flight.fareType === 'ndc' ? "NDC Markup" : flight.fareType === 'corporate' ? "Corp Discount" : "Commission (8%)"}
                                            </span>
                                            <span>
                                               {flight.fareType === 'corporate' ? "- " : "+ "}${(parseFloat(flight.price.total) * 0.08).toFixed(2)}
                                            </span>
                                         </div>
                                       )}
                                       {flight.fareType === 'net' && (
                                         <div className="flex justify-between items-center text-[0.6rem] font-black text-slate-400 italic">
                                            <span className="uppercase">No Commission</span>
                                            <span>$0.00</span>
                                         </div>
                                       )}
                                    </div>
                                    <div className="flex justify-between items-end">
                                       <div>
                                          <div className="text-[0.5rem] font-black text-slate-400 uppercase tracking-widest mb-0.5">Total per person</div>
                                          <div className="text-xl font-black text-[#1e2d4f] tracking-tighter leading-none">
                                             <span className="text-[0.7rem] align-top mr-0.5">$</span>{flight.price.total}
                                          </div>
                                       </div>
                                       <div className="text-right">
                                          <span className="text-[0.6rem] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full inline-flex items-center gap-1 border border-emerald-100 ring-4 ring-emerald-50/50 uppercase tracking-tighter">
                                             <ShieldCheck size={10} /> Refundable
                                          </span>
                                       </div>
                                    </div>
                                 </div>
                                 
                                 <div className="grid grid-cols-2 gap-2">
                                    <button 
                                      className="flex-1 py-2.5 bg-white text-indigo-900 border border-indigo-100 rounded-lg font-black text-[0.65rem] hover:bg-slate-50 transition-all uppercase tracking-widest shadow-sm"
                                    >
                                       Details
                                    </button>
                                    <button 
                                      className="flex-1 py-2.5 bg-[#1e2d4f] text-white rounded-lg font-black text-[0.65rem] shadow-lg shadow-indigo-900/10 hover:bg-indigo-950 transition-all uppercase tracking-[0.05em]"
                                      onClick={() => router.push(`/flights/booking?offerId=${flight.id}&adults=${pax.adults}&children=${pax.children}&infants=${pax.infants}`)}
                                    >
                                       Select
                                    </button>
                                 </div>
                              </div>
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
             </div>
          </div>
        )}

        {/* Loading Overlay */}
        <AnimatePresence>
          {isSearching && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[100] flex flex-col items-center justify-center p-8"
            >
              <div className="bg-white rounded-[3rem] p-12 shadow-2xl flex flex-col items-center max-w-sm w-full text-center">
                 <div className="relative mb-8">
                    <div className="absolute inset-0 bg-indigo-100 rounded-full animate-ping opacity-25"></div>
                    <div className="w-20 h-20 bg-indigo-900 rounded-full flex items-center justify-center text-white relative z-10">
                       <Plane size={36} className="animate-bounce" />
                    </div>
                 </div>
                 <h3 className="text-2xl font-black text-slate-800 mb-2 tracking-tight">Syncing GDS...</h3>
                 <p className="text-slate-500 font-medium leading-relaxed">We are matching your request with real-time inventory from 400+ GDS pipes.</p>
                 <div className="mt-8 w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 4, repeat: Infinity }} className="h-full bg-indigo-600 rounded-full"></motion.div>
                 </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Message */}
        {error && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-sm">
            <div className="max-w-2xl w-full bg-white border border-red-200 rounded-3xl p-6 flex flex-col items-center gap-4 text-center shadow-2xl">
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
                 <Info size={24} />
              </div>
              <div>
                <h4 className="font-black text-red-800 text-lg">Search Failed</h4>
                <p className="text-sm font-medium text-red-600/80 mt-1">{error}</p>
              </div>
              <button className="px-6 py-2 bg-white border border-red-200 text-red-600 rounded-xl text-xs font-bold hover:bg-red-50" onClick={() => setError(null)}>Acknowledge</button>
            </div>
          </div>
        )}

        {/* Seat Map Modal */}
        <AnimatePresence>
          {showSeatMap && (
            <SeatMap
              flightOffer={showSeatMap}
              onSelect={(seatId: string) => {
                console.log("Selected seat:", seatId);
                setShowSeatMap(null);
              }}
              onClose={() => setShowSeatMap(null)}
            />
          )}
        </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
