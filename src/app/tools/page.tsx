"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, Search, Info, ExternalLink, Plane, MapPin, Globe, Loader2, Link as LinkIcon } from "lucide-react";
import { getAirlineCodeLookup } from "@/services/amadeus";
import { cn } from "@/lib/utils";

const checkInLinks = [
  { name: "Emirates", url: "https://www.emirates.com/check-in" },
  { name: "Qatar Airways", url: "https://www.qatarairways.com/check-in" },
  { name: "Singapore Airlines", url: "https://www.singaporeair.com/en_UK/check-in/" },
  { name: "United Airlines", url: "https://www.united.com/en/us/check-in" },
  { name: "Lufthansa", url: "https://www.lufthansa.com/check-in" },
];

export default function ToolsPage() {
  const [loading, setLoading] = useState(false);
  const [airlineCode, setAirlineCode] = useState("");
  const [airlineResult, setAirlineResult] = useState<any>(null);

  const handleAirlineLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!airlineCode) return;
    setLoading(true);
    try {
      const data = await getAirlineCodeLookup(airlineCode.toUpperCase());
      setAirlineResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8 pt-24">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-6">
            <Settings size={14} /> Travel Utilities
          </div>
          <h1 className="text-6xl font-black mb-4 bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">Traveler Toolbox</h1>
          <p className="text-slate-400 text-xl max-w-2xl mx-auto">Essential utilities for your journey management and GDS data lookup.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Airline Lookup */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 flex flex-col gap-6 shadow-xl hover:border-blue-500/30 transition-all group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400">
                <Search size={24} />
              </div>
              <h3 className="text-xl font-bold">Airline Lookup</h3>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">Quickly find airline names by their IATA code (e.g., BA, EK, AA).</p>
            <form onSubmit={handleAirlineLookup} className="flex gap-2">
              <input
                type="text"
                maxLength={2}
                placeholder="EK"
                className="flex-1 bg-white/5 border border-white/10 p-3 rounded-xl outline-none focus:border-blue-500/50 transition-all uppercase font-bold text-center tracking-widest"
                value={airlineCode}
                onChange={(e) => setAirlineCode(e.target.value)}
              />
              <button
                type="submit"
                className="bg-white text-slate-950 font-black px-6 py-3 rounded-xl hover:bg-slate-100 transition-all active:scale-95 disabled:opacity-50"
                disabled={loading}
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : "Search"}
              </button>
            </form>
            <AnimatePresence>
              {airlineResult && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl flex items-center gap-3 text-blue-400 overflow-hidden"
                >
                  <Plane size={18} />
                  <span className="font-bold text-xs truncate">
                    {airlineResult.businessName} ({airlineResult.commonName})
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Quick Check-In */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 flex flex-col gap-6 shadow-xl hover:border-indigo-500/30 transition-all">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400">
                <ExternalLink size={24} />
              </div>
              <h3 className="text-xl font-bold">Quick Check-In</h3>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">Direct links to major airline check-in portals globally.</p>
            <div className="flex flex-wrap gap-2">
              {checkInLinks.map((link, i) => (
                <a
                  key={i}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-white/5 border border-white/10 px-4 py-2 rounded-full text-xs font-bold text-slate-400 hover:text-white hover:border-indigo-500/50 transition-all flex items-center gap-2"
                >
                  {link.name} <LinkIcon size={12} />
                </a>
              ))}
            </div>
          </div>

          {/* Reference Data */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 flex flex-col gap-6 shadow-xl hover:border-teal-500/30 transition-all">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-teal-500/10 rounded-xl flex items-center justify-center text-teal-400">
                <Globe size={24} />
              </div>
              <h3 className="text-xl font-bold">Reference Data</h3>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">Access to worldwide airport hub and airline routing data.</p>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 font-bold">AIRLINES</span>
                <span className="font-black">400+</span>
              </div>
              <div className="flex justify-between items-center text-sm border-y border-white/5 py-3">
                <span className="text-slate-500 font-bold">AIRPORTS</span>
                <span className="font-black">2000+</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 font-bold">SYNC STATUS</span>
                <span className="text-teal-400 font-black flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                  LIVE IATA
                </span>
              </div>
            </div>
            <button className="mt-2 w-full border border-white/10 text-white font-bold py-3 rounded-xl hover:bg-white/5 transition-all text-sm uppercase tracking-widest">
              Browse Directory
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
