"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Plane,
  Calendar,
  Users,
  Search as SearchIcon,
  Filter,
  TrendingUp,
  LayoutGrid,
  Settings,
  Bell,
  LogOut,
  Menu,
  Plus,
  History as HistoryIcon,
  Briefcase,
  ChevronRight,
  Sparkles,
  Lightbulb,
  CheckCircle2,
  ArrowRight,
  Shield,
  Zap,
} from "lucide-react";
import { useBookingStore } from "@/store/useBookingStore";
import { searchFlightsAdvanced, getFlightChoicePrediction } from "@/services/amadeus";
import { cn } from "@/lib/utils";
import FlightSearchForm from "@/components/flights/FlightSearchForm";
import FlightResultsList from "@/components/flights/FlightResultsList";
import FlightFilterSidebar from "@/components/flights/FlightFilterSidebar";
import CurrencySwitcher from "@/components/flights/CurrencySwitcher";
import FlexibleDateSearch from "@/components/FlexibleDateSearch";

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
  const { 
    setSearchParams, 
    results, 
    setResults, 
    isSearching, 
    setIsSearching,
    setSelectedFlight
  } = useBookingStore();

  const [view, setView] = useState<"search" | "results">("search");
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isFlexibleMode, setIsFlexibleMode] = useState(false);
  const [recentSearches, setRecentSearches] = useState<any[]>([]);
  const [dictionaries, setDictionaries] = useState<any>({});
  
  // Filter States
  const [maxPrice, setMaxPrice] = useState<number>(5000);
  const [selectedStops, setSelectedStops] = useState<string[]>([]);
  const [selectedAirlines, setSelectedAirlines] = useState<string[]>([]);
  
  const currentSearchParams = useBookingStore(s => s.searchParams);

  // Load recent searches on mount
  useEffect(() => {
    const saved = localStorage.getItem("recentSearches");
    if (saved) setRecentSearches(JSON.parse(saved));
  }, []);

  const handleSearch = async (params: any) => {
    setIsSearching(true);
    setError(null);
    try {
      setSearchParams(params);

      // Save to recent searches
      const newSearch = { ...params, id: Date.now() };
      const updated = [newSearch, ...recentSearches.filter(s => 
        !(s.origin === newSearch.origin && s.destination === newSearch.destination && s.departureDate === newSearch.departureDate)
      )].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem("recentSearches", JSON.stringify(updated));

      const response = await searchFlightsAdvanced(params);
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

  const filteredResults = useMemo(() => {
    return results.filter(flight => {
      const price = parseFloat(flight.price.total);
      if (price > maxPrice) return false;

      const stops = flight.itineraries[0].segments.length - 1;
      if (selectedStops.length > 0) {
        const stopLabel = stops === 0 ? "Non-stop" : stops === 1 ? "1 Stop" : "2+ Stops";
        if (!selectedStops.includes(stopLabel)) return false;
      }

      const carrier = flight.itineraries[0].segments[0].carrierCode;
      if (selectedAirlines.length > 0 && !selectedAirlines.includes(carrier)) return false;

      return true;
    });
  }, [results, maxPrice, selectedStops, selectedAirlines]);

  const airlineOptions = useMemo(() => {
     if (!dictionaries.carriers) return [];
     return Object.entries(dictionaries.carriers).map(([code, name]: any) => ({ code, name }));
  }, [dictionaries]);

  const handleSelectFlight = (flight: any) => {
     setSelectedFlight(flight);
     const params = new URLSearchParams({
        id: flight.id,
        price: flight.price.total,
        currency: flight.price.currency
     });
     router.push(`/flights/booking?${params.toString()}`);
  };

  if (isFlexibleMode && currentSearchParams) {
    return (
      <FlexibleDateSearch
        searchParams={currentSearchParams as any}
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
            <SidebarItem icon={HistoryIcon} label="All Bookings" />
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

                <FlightSearchForm 
                   onSearch={handleSearch} 
                   isSearching={isSearching} 
                   onOpenFlexibleDate={() => setIsFlexibleMode(true)} 
                />

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
                          onClick={() => handleSearch(s)}
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
                           <HistoryIcon size={32} className="mb-2 opacity-20" />
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
                           <div className="text-xl font-black text-slate-900 tracking-tight leading-none">
                              {currentSearchParams?.origin} <span className="text-slate-300">→</span> {currentSearchParams?.destination}
                           </div>
                           <div className="text-[0.65rem] font-black text-indigo-500 uppercase tracking-widest mt-2 flex items-center gap-2">
                             <Calendar size={12} /> {currentSearchParams?.departureDate} <span className="w-1 h-1 bg-slate-300 rounded-full"></span> <Users size={12} /> {currentSearchParams?.adults} Traveler(s)
                           </div>
                        </div>
                     </div>
                  </div>
                  <div className="flex gap-3">
                    <CurrencySwitcher />
                    <button className="flex items-center gap-2 bg-white border border-slate-200 px-6 py-3 rounded-2xl text-slate-700 font-bold text-xs hover:bg-slate-50 transition-all uppercase tracking-widest shadow-sm" onClick={() => setView("search")}>
                       <SearchIcon size={14} /> Modify
                    </button>
                    <button className="p-3 bg-indigo-900 text-white rounded-2xl shadow-xl shadow-indigo-900/10 hover:bg-indigo-950 transition-all">
                      <Plus size={20} />
                    </button>
                  </div>
               </div>

               {/* MAIN AREA */}
               <div className="flex-1 flex overflow-hidden min-h-0">
                  <FlightFilterSidebar 
                    maxPrice={maxPrice} 
                    setMaxPrice={setMaxPrice}
                    selectedStops={selectedStops}
                    setSelectedStops={setSelectedStops}
                    selectedAirlines={selectedAirlines}
                    setSelectedAirlines={setSelectedAirlines}
                    airlines={airlineOptions}
                    onClearAll={() => {
                        setMaxPrice(5000);
                        setSelectedStops([]);
                        setSelectedAirlines([]);
                    }}
                  />
                  <FlightResultsList 
                    results={filteredResults} 
                    dictionaries={dictionaries}
                    onSelect={handleSelectFlight}
                  />
               </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
