"use client";

import React from "react";
import { Filter, DollarSign, Plane, Clock, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface FlightFilterSidebarProps {
  maxPrice: number;
  setMaxPrice: (price: number) => void;
  selectedStops: string[];
  setSelectedStops: (stops: string[]) => void;
  selectedAirlines: string[];
  setSelectedAirlines: (airlines: string[]) => void;
  airlines: { code: string; name: string }[];
  onClearAll: () => void;
}

export default function FlightFilterSidebar({ 
  maxPrice, 
  setMaxPrice, 
  selectedStops, 
  setSelectedStops, 
  selectedAirlines, 
  setSelectedAirlines,
  airlines,
  onClearAll
}: FlightFilterSidebarProps) {
  
  const toggleStop = (stop: string) => {
    if (selectedStops.includes(stop)) {
      setSelectedStops(selectedStops.filter(s => s !== stop));
    } else {
      setSelectedStops([...selectedStops, stop]);
    }
  };

  const toggleAirline = (code: string) => {
    if (selectedAirlines.includes(code)) {
      setSelectedAirlines(selectedAirlines.filter(a => a !== code));
    } else {
      setSelectedAirlines([...selectedAirlines, code]);
    }
  };

  return (
    <aside className="w-[320px] h-full flex-shrink-0 overflow-y-auto no-scrollbar border-r border-slate-100 bg-white/40 p-6">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
         <div className="flex items-center gap-2">
            <Filter size={16} className="text-indigo-600" />
            <h4 className="font-black text-[#1e2d4f] text-lg tracking-tight">Filters</h4>
         </div>
         <button 
           className="text-[0.65rem] font-black text-indigo-600 uppercase tracking-widest hover:text-indigo-800 transition-colors"
           onClick={onClearAll}
         >
           Clear All
         </button>
      </div>

      {/* Price Section */}
      <div className="mb-10 p-6 bg-white rounded-3xl border border-slate-100 shadow-sm shadow-slate-100/50">
         <div className="flex items-center gap-2 mb-6">
            <DollarSign size={16} className="text-emerald-500" />
            <div className="text-[0.7rem] font-black text-slate-900 uppercase tracking-wider">Price Budget</div>
         </div>
         <div className="px-1">
            <div className="flex justify-between items-center mb-4">
               <span className="text-[0.65rem] font-bold text-slate-400 tracking-tight">$0</span>
               <span className="text-[0.65rem] font-black text-indigo-600 tracking-tight">${maxPrice}</span>
            </div>
            <input 
              type="range" 
              min="0"
              max="5000"
              step="50"
              value={maxPrice}
              onChange={(e) => setMaxPrice(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600 mb-6" 
            />
            <div className="flex items-center gap-3">
               <div className="flex-1">
                  <input 
                    type="text" 
                    value="0" 
                    disabled
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-[0.75rem] font-bold text-slate-400 outline-none" 
                  />
               </div>
               <div className="text-slate-300">-</div>
               <div className="flex-1">
                  <input 
                    type="text" 
                    value={maxPrice} 
                    onChange={(e) => setMaxPrice(parseInt(e.target.value) || 0)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-[0.75rem] font-bold text-slate-900 focus:border-indigo-400 outline-none transition-colors shadow-sm" 
                  />
               </div>
            </div>
         </div>
      </div>

      {/* Stops Section */}
      <div className="mb-10">
         <div className="flex items-center gap-2 mb-6 ml-2">
            <Clock size={16} className="text-amber-500" />
            <div className="text-[0.7rem] font-black text-slate-900 uppercase tracking-wider">Flight Stops</div>
         </div>
         <div className="space-y-3">
            {["Non-stop", "1 Stop", "2+ Stops"].map(stop => (
               <label key={stop} className="flex items-center justify-between p-3.5 bg-white border border-slate-100 rounded-2xl cursor-pointer hover:border-indigo-200 transition-all group">
                  <span className="text-[0.75rem] font-bold text-slate-600 group-hover:text-slate-900">{stop}</span>
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 rounded border-slate-300 accent-indigo-600 cursor-pointer" 
                    checked={selectedStops.includes(stop)}
                    onChange={() => toggleStop(stop)}
                  />
               </label>
            ))}
         </div>
      </div>

      {/* Airlines Section */}
      <div className="mb-10">
         <div className="flex items-center gap-2 mb-6 ml-2">
            <Plane size={16} className="text-blue-500" />
            <div className="text-[0.7rem] font-black text-slate-900 uppercase tracking-wider">Preferred Airlines</div>
         </div>
         <div className="space-y-3 min-h-[100px] max-h-[300px] overflow-y-auto no-scrollbar px-1">
            {airlines.length > 0 ? airlines.map(airline => (
               <label key={airline.code} className="flex items-center justify-between p-3.5 bg-white border border-slate-100 rounded-2xl cursor-pointer hover:border-indigo-200 transition-all group">
                  <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100 overflow-hidden group-hover:scale-105 transition-transform">
                        <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${airline.code}`} alt={airline.code} className="w-6 h-6 opacity-60" />
                     </div>
                     <span className="text-[0.75rem] font-bold text-slate-600 group-hover:text-slate-900">{airline.name}</span>
                  </div>
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 rounded border-slate-300 accent-indigo-600 cursor-pointer" 
                    checked={selectedAirlines.includes(airline.code)}
                    onChange={() => toggleAirline(airline.code)}
                  />
               </label>
            )) : (
              <div className="text-center py-8 text-slate-400 text-[0.7rem] font-medium italic bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                Airlines will appear after search
              </div>
            )}
         </div>
      </div>

      <div className="bg-indigo-900 rounded-2xl p-5 text-white shadow-xl shadow-indigo-900/10">
        <div className="text-[0.65rem] font-bold uppercase tracking-widest text-indigo-300 mb-2">Need Help?</div>
        <div className="text-xs font-bold mb-4">Our travel experts are available 24/7.</div>
        <button className="w-full py-2 bg-white text-indigo-900 rounded-lg text-[0.65rem] font-black uppercase tracking-widest flex items-center justify-center gap-2">
           <Search size={14} /> Agent Support
        </button>
      </div>
    </aside>
  );
}
