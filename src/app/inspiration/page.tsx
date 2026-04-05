"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Compass, Sparkles, Map, TrendingUp, Search, Calendar, DollarSign, ArrowRight, Loader2 } from "lucide-react";
import { getFlightInspiration, getFlightCheapestDates } from "@/services/amadeus";
import LocationSearch from "@/components/LocationSearch";
import { cn } from "@/lib/utils";

export default function InspirationPage() {
  const [loading, setLoading] = useState(false);
  const [origin, setOrigin] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"inspiration" | "cheapest">("inspiration");

  const handleInspirationSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!origin) return;
    setLoading(true);
    try {
      const data = await getFlightInspiration({ origin });
      setResults(data);
      setActiveTab("inspiration");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCheapestDates = async () => {
    if (!origin) return;
    setLoading(true);
    try {
      const data = await getFlightCheapestDates({ origin, destination: "PAR" }); // Example destination
      setResults(data);
      setActiveTab("cheapest");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8 pt-24">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 text-purple-400 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-6">
            <Sparkles size={14} /> Travel Inspiration
          </div>
          <h1 className="text-6xl font-black mb-4 bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">Where to next?</h1>
          <p className="text-slate-400 text-xl max-w-2xl mx-auto">Discover amazing destinations and the best times to visit based on live global flight data.</p>
        </motion.div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 mb-12 shadow-2xl">
          <form onSubmit={handleInspirationSearch} className="flex flex-col md:flex-row items-end gap-6">
            <div className="flex-1 space-y-2 w-full">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Compass size={14} /> Flying From
              </label>
              <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden focus-within:border-purple-500/50 transition-all">
                <LocationSearch value={origin} onChange={setOrigin} placeholder="e.g. LON, NYC, DXB" />
              </div>
            </div>
            <div className="flex gap-4 w-full md:w-auto">
              <button
                type="submit"
                className="flex-1 md:flex-none bg-purple-500 hover:bg-purple-600 text-white font-black py-4 px-8 rounded-xl flex items-center justify-center gap-2 transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 shadow-lg shadow-purple-500/20"
                disabled={loading || !origin}
              >
                {loading && activeTab === "inspiration" ? <Loader2 className="animate-spin" /> : <Search size={18} />}
                {loading && activeTab === "inspiration" ? "Finding..." : "Discover destinations"}
              </button>
              <button
                type="button"
                onClick={handleCheapestDates}
                className="flex-1 md:flex-none bg-white/5 border border-white/10 hover:bg-white/10 text-white font-black py-4 px-8 rounded-xl flex items-center justify-center gap-2 transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50"
                disabled={loading || !origin}
              >
                {loading && activeTab === "cheapest" ? <Loader2 className="animate-spin" /> : <Calendar size={18} />}
                Best Dates
              </button>
            </div>
          </form>
        </div>

        <div className="space-y-8">
          {loading ? (
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-20 text-center flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-white/10 border-t-purple-500 rounded-full animate-spin"></div>
              <p className="text-slate-400 font-medium">Scanning the globe for your next adventure...</p>
            </div>
          ) : results.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {results.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden hover:border-purple-500/30 transition-all group"
                >
                  <div className="h-40 bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center text-purple-400">
                    <Map size={48} className="group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <div className="p-6">
                    <h3 className="text-2xl font-bold mb-4">{item.destination}</h3>
                    <div className="flex gap-4 mb-6">
                      <div className="flex items-center gap-1.5 text-purple-400 font-bold bg-purple-500/10 px-2.5 py-1 rounded-md text-sm">
                        <DollarSign size={14} /> {item.price?.total || item.price}
                      </div>
                      {item.departureDate && (
                        <div className="flex items-center gap-1.5 text-slate-400 font-bold bg-white/5 px-2.5 py-1 rounded-md text-sm">
                          <Calendar size={14} /> {item.departureDate}
                        </div>
                      )}
                    </div>
                    <button className="w-full bg-white text-slate-950 font-black py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-100 transition-all group-hover:shadow-lg">
                      Explore Flights <ArrowRight size={18} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-20 text-center flex flex-col items-center gap-6 border-dashed">
              <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center text-slate-700">
                 <Compass size={48} />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">Your next adventure starts here</h3>
                <p className="text-slate-400 max-w-sm mx-auto">Enter your origin city to find the best flight deals and hidden gems across the world.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
