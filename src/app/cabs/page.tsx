"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Car, Search, MapPin, Clock, Users, ArrowRight, Loader2, Info } from "lucide-react";
import { searchTransfers } from "@/services/amadeus";
import LocationSearch from "@/components/LocationSearch";
import { cn } from "@/lib/utils";

export default function CabsPage() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const [searchParams, setSearchParams] = useState({
    pickup: "",
    destination: "",
    date: "",
    time: "",
  });

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = await searchTransfers(searchParams);
      setResults(data);
      setSearched(true);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to find transfers. Check your locations.");
      // Fallback for demo/dev
      setResults([
        { id: 1, type: "Economy Sedan", price: "45", time: "25 mins", capacity: 4, baggage: 2 },
        { id: 2, type: "Premium SUV", price: "85", time: "20 mins", capacity: 6, baggage: 5 },
        { id: 3, type: "Luxury Van", price: "120", time: "30 mins", capacity: 8, baggage: 8 },
      ]);
      setSearched(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8 pt-24">
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-12">
          <h1 className="text-5xl font-black mb-4 bg-gradient-to-r from-teal-400 to-blue-500 bg-clip-text text-transparent">Private Transfers</h1>
          <p className="text-slate-400 text-lg">Reliable and comfortable rides. Type any airport, city, or specific address.</p>
        </motion.div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 mb-12 shadow-2xl">
          {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6 text-center text-sm">{error}</div>}
          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 items-end">
            <div className="lg:col-span-1.5 space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <MapPin size={14} /> Pickup
              </label>
              <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden focus-within:border-teal-500/50 transition-colors">
                <LocationSearch
                  placeholder="Airport or Hotel"
                  value={searchParams.pickup}
                  onChange={(location) => setSearchParams({ ...searchParams, pickup: location })}
                />
              </div>
            </div>
            <div className="lg:col-span-1.5 space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <MapPin size={14} /> Drop-off
              </label>
              <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden focus-within:border-teal-500/50 transition-colors">
                 <LocationSearch
                  placeholder="Destination address"
                  value={searchParams.destination}
                  onChange={(location) => setSearchParams({ ...searchParams, destination: location })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Clock size={14} /> Date
              </label>
              <input
                type="date"
                className="w-full bg-white/5 border border-white/10 p-3.5 rounded-xl text-white outline-none focus:border-teal-500/50 transition-colors"
                value={searchParams.date}
                onChange={(e) => setSearchParams({ ...searchParams, date: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Clock size={14} /> Time
              </label>
              <input
                type="time"
                className="w-full bg-white/5 border border-white/10 p-3.5 rounded-xl text-white outline-none focus:border-teal-500/50 transition-colors"
                value={searchParams.time}
                onChange={(e) => setSearchParams({ ...searchParams, time: e.target.value })}
                required
              />
            </div>
          </form>
          <div className="mt-8 flex justify-center">
            <button
              onClick={handleSearch}
              className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-4 px-12 rounded-xl flex items-center gap-3 transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 shadow-lg shadow-teal-500/20"
              disabled={loading}
            >
              {loading ? <Loader2 className="animate-spin" /> : <Search size={20} />}
              {loading ? "Finding available cars..." : "Search Transfers"}
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {loading && (
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-20 text-center flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-white/10 border-t-teal-500 rounded-full animate-spin"></div>
              <p className="text-slate-400 font-medium">Searching for reliable rides...</p>
            </div>
          )}

          {!loading && searched && results.length === 0 && (
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-20 text-center flex flex-col items-center gap-4">
              <Search size={64} className="text-slate-700" />
              <h3 className="text-2xl font-bold">No Rides Found</h3>
              <p className="text-slate-400 max-w-md mx-auto">We couldn't find any transfers for this route. Try searching for different locations or check the availability.</p>
            </div>
          )}

          {!loading && results.length > 0 && (
            <div className="flex flex-col gap-4">
              {results.map((cab) => (
                <motion.div
                  key={cab.id}
                  whileHover={{ y: -4, borderColor: "rgba(255,255,255,0.2)" }}
                  className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 transition-all"
                >
                  <div className="flex items-center gap-6 flex-1">
                    <div className="w-16 h-16 bg-teal-500 rounded-2xl flex items-center justify-center text-slate-900 shadow-lg shadow-teal-500/20">
                      <Car size={32} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{cab.type}</h3>
                      <div className="flex gap-6 mt-1 text-slate-400 text-sm">
                        <span className="flex items-center gap-1.5"><Users size={14} className="text-teal-500" /> {cab.capacity} Passengers</span>
                        <span className="flex items-center gap-1.5"><Clock size={14} className="text-teal-500" /> {cab.time} est.</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-8 w-full md:w-auto border-t md:border-t-0 md:border-l border-white/10 pt-6 md:pt-0 md:pl-8">
                    <div className="text-right flex-1 md:flex-none">
                      <span className="block text-3xl font-black">${cab.price}</span>
                      <span className="text-[0.65rem] text-slate-500 uppercase font-bold tracking-widest">fixed price</span>
                    </div>
                    <button className="bg-white text-slate-950 font-bold py-3 px-8 rounded-xl flex items-center gap-2 hover:bg-slate-100 transition-colors shadow-lg active:scale-95">
                      Book Now <ArrowRight size={16} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
