"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Compass, MapPin, Search, Star, Clock, DollarSign, Loader2, ArrowRight } from "lucide-react";
import { getToursAndActivities, searchLocations } from "@/services/amadeus";
import { cn } from "@/lib/utils";

export default function ToursPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleLocationSearch = async (val: string) => {
    setQuery(val);
    if (val.length > 2) {
      try {
        const locations = await searchLocations(val);
        setSuggestions(locations);
      } catch (err) {
        console.error(err);
      }
    } else {
      setSuggestions([]);
    }
  };

  const handleSearch = async (location: any) => {
    setLoading(true);
    setError(null);
    setSuggestions([]);
    setQuery(location.name);
    try {
      const data = await getToursAndActivities(location.geoCode.latitude, location.geoCode.longitude);
      setResults(data);
    } catch (err) {
      setError("Failed to fetch tours. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8 pt-24">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <h1 className="text-7xl font-black mb-4 italic tracking-tighter">
            Discover <span className="bg-gradient-to-r from-orange-400 to-rose-500 bg-clip-text text-transparent underline decoration-orange-500/30">Experiences</span>
          </h1>
          <p className="text-slate-400 text-xl font-medium">Uncover the world's best tours, hidden activities, and local secrets.</p>
        </motion.div>

        <div className="max-w-2xl mx-auto mb-20 relative">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-2 flex items-center shadow-2xl focus-within:border-orange-500/50 transition-all">
            <div className="px-4 text-orange-400">
              <MapPin size={24} />
            </div>
            <input
              type="text"
              placeholder="Enter a city to explore (e.g. Madrid, Paris, Tokyo)"
              className="flex-1 bg-transparent border-none p-4 text-lg font-bold outline-none placeholder:text-slate-600"
              value={query}
              onChange={(e) => handleLocationSearch(e.target.value)}
            />
            <button className="bg-orange-500 hover:bg-orange-600 text-white p-4 rounded-xl transition-all active:scale-95">
              <Search size={24} />
            </button>
          </div>

          <AnimatePresence>
            {suggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute top-full left-0 right-0 mt-3 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden"
              >
                {suggestions.map((loc) => (
                  <button
                    key={loc.id}
                    className="w-full text-left p-4 hover:bg-white/5 transition-colors border-b border-white/5 last:border-none flex items-center gap-3 group"
                    onClick={() => handleSearch(loc)}
                  >
                    <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center text-slate-500 group-hover:text-orange-400 transition-colors">
                      <MapPin size={16} />
                    </div>
                    <div>
                      <div className="font-bold">{loc.name}</div>
                      <div className="text-xs text-slate-500 font-bold uppercase tracking-widest">{loc.address.countryName}</div>
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-12 text-center text-sm font-bold">{error}</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            <div className="col-span-full py-32 text-center flex flex-col items-center gap-6">
              <div className="w-16 h-16 border-4 border-white/10 border-t-orange-500 rounded-full animate-spin"></div>
              <p className="text-slate-400 text-xl font-black italic uppercase tracking-widest animate-pulse">Scouting the best local experiences...</p>
            </div>
          ) : results.length > 0 ? (
            results.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden hover:border-orange-500/30 transition-all group flex flex-col h-full shadow-lg"
              >
                <div
                  className="h-60 bg-cover bg-center relative"
                  style={{ backgroundImage: `linear-gradient(to bottom, transparent, rgba(15,23,42,0.8)), url(${item.pictures?.[0] || "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80"})` }}
                >
                  <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full flex items-center gap-2 text-yellow-400 text-xs font-black">
                    <Star size={14} fill="currentColor" /> {item.rating?.substring(0, 3) || "4.8"}
                  </div>
                </div>
                <div className="p-8 flex flex-col flex-1">
                  <h3 className="text-2xl font-black mb-3 line-clamp-2 italic leading-tight group-hover:text-orange-400 transition-colors">{item.name}</h3>
                  <p className="text-slate-400 text-sm line-clamp-3 mb-8 leading-relaxed">{item.shortDescription}</p>
                  <div className="mt-auto flex items-center justify-between py-6 border-t border-white/5">
                    <div className="flex flex-col">
                       <span className="text-[0.6rem] text-slate-500 font-black uppercase tracking-tighter">Investment</span>
                       <span className="text-2xl font-black text-orange-400">{item.price?.amount} {item.price?.currencyCode}</span>
                    </div>
                    <div className="flex flex-col items-end">
                       <span className="text-[0.6rem] text-slate-500 font-black uppercase tracking-tighter text-right">Duration</span>
                       <span className="text-sm font-bold flex items-center gap-1.5"><Clock size={14} /> {item.duration?.substring(2) || "3H"}</span>
                    </div>
                  </div>
                  <button
                    className="w-full bg-white text-slate-950 font-black py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-orange-500 hover:text-white transition-all transform group-hover:scale-[1.02] shadow-xl"
                    onClick={() => router.push(`/checkout?type=activity&id=${item.id}`)}
                  >
                    Reserve Now <ArrowRight size={18} />
                  </button>
                </div>
              </motion.div>
            ))
          ) : !query && (
            <div className="col-span-full py-40 text-center flex flex-col items-center border border-white/5 border-dashed rounded-3xl opacity-40">
               <Compass size={80} className="text-slate-700 mb-6" />
               <h3 className="text-3xl font-black italic">Start Your Discovery</h3>
               <p className="text-slate-500 max-w-sm mt-2">Enter a destination above to see curated local experiences and tours powered by Amadeus.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
