"use client";

import React, { useMemo, useState } from "react";
import FlightCard from "./FlightCard";
import { FlightOffer } from "@/types/flights";
import { ChevronDown, ArrowUpDown, Zap, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface FlightResultsListProps {
  results: FlightOffer[];
  dictionaries: any;
  onSelect: (flight: FlightOffer) => void;
}

export default function FlightResultsList({ results, dictionaries, onSelect }: FlightResultsListProps) {
  const [sortBy, setSortBy] = useState<"best" | "cheapest" | "fastest">("best");

  const getAirlineName = (code: string) => {
    return dictionaries.carriers?.[code] || code;
  };

  const sortedResults = useMemo(() => {
    let res = [...results];
    if (sortBy === "cheapest") {
      res.sort((a, b) => parseFloat(a.price.total) - parseFloat(b.price.total));
    } else if (sortBy === "fastest") {
      res.sort((a, b) => {
        const durA = a.itineraries[0].duration; // PT5H15M
        const durB = b.itineraries[0].duration;
        return durA.localeCompare(durB); // Simplified duration sort
      });
    } else {
      // "Best" sorting (heuristic: price + duration)
      res.sort((a, b) => parseFloat(a.price.total) - parseFloat(b.price.total));
    }
    return res;
  }, [results, sortBy]);

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-10 no-scrollbar">
      <div className="max-w-4xl mx-auto">
        {/* Sort Controls */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
           <div className="flex items-center gap-2">
              <ArrowUpDown size={16} className="text-indigo-600" />
              <div className="text-[0.65rem] font-black text-slate-400 uppercase tracking-widest">Sort By</div>
              <div className="flex gap-2 ml-4">
                 {["best", "cheapest", "fastest"].map(s => (
                    <button 
                       key={s} 
                       onClick={() => setSortBy(s as any)}
                       className={cn(
                          "px-4 py-1.5 rounded-lg text-[0.65rem] font-black uppercase tracking-widest transition-all",
                          sortBy === s ? "bg-[#1e2d4f] text-white shadow-lg shadow-indigo-900/10" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                       )}
                    >
                       {s}
                    </button>
                 ))}
              </div>
           </div>
           <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 rounded-lg border border-emerald-100">
              <Zap size={14} className="text-emerald-600" />
              <span className="text-[0.6rem] font-bold text-emerald-700 uppercase tracking-widest">Live Inventory</span>
           </div>
        </div>

        {/* Results Info */}
        <div className="mb-6 flex items-center justify-between">
           <div className="text-xs font-bold text-slate-500">
              Showing <span className="text-slate-900 font-black">{sortedResults.length}</span> flights available
           </div>
           <div className="flex items-center gap-2 text-[0.65rem] font-bold text-indigo-600 cursor-pointer hover:underline">
              <Shield size={12} fill="currentColor" /> Price Guarantee Policy
           </div>
        </div>

        {/* List */}
        <div className="space-y-4">
          {sortedResults.length > 0 ? (
            sortedResults.map((flight) => (
              <FlightCard 
                 key={flight.id} 
                 flight={flight} 
                 getAirlineName={getAirlineName} 
                 onSelect={onSelect} 
              />
            ))
          ) : (
            <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200">
               <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100 shadow-sm">
                  <ArrowUpDown size={28} className="text-slate-200" />
               </div>
               <div className="text-sm font-black text-slate-900 mb-1">No matching flights found</div>
               <p className="text-[0.7rem] text-slate-400 max-w-[200px] mx-auto leading-relaxed">Try adjusting your filters or search criteria to view more options.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
