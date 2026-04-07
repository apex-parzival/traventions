"use client";

import React from "react";
import { Plane, Clock, ShieldCheck, Zap, Leaf } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { FlightOffer } from "@/types/flights";
import { useBookingStore } from "@/store/useBookingStore";

interface FlightCardProps {
  flight: FlightOffer;
  getAirlineName: (code: string) => string;
  onSelect: (flight: FlightOffer) => void;
}

export default function FlightCard({ flight, getAirlineName, onSelect }: FlightCardProps) {
  const { currency, exchangeRates } = useBookingStore();
  
  const segments = flight.itineraries[0].segments;
  const carrierCode = segments[0].carrierCode;
  const airlineName = getAirlineName(carrierCode);
  const stops = segments.length - 1;
  
  const departureDate = new Date(segments[0].departure.at);
  const arrivalDate = new Date(segments[segments.length - 1].arrival.at);
  
  const duration = flight.itineraries[0].duration; // PT5H15M format
  const formattedDuration = duration.replace('PT', '').replace('H', 'h ').replace('M', 'm');

  // Eco-Priority Heuristic
  const isEcoFriendly = stops === 0 && (segments[0].aircraft?.code === '788' || segments[0].aircraft?.code === '789' || segments[0].aircraft?.code === '359' || segments[0].aircraft?.code === '351');

  // Currency Conversion
  const basePrice = parseFloat(flight.price.total);
  const convertedPrice = (basePrice * (exchangeRates[currency] || 1)).toLocaleString(undefined, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
  });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group bg-white rounded-3xl border border-slate-100 p-6 mb-4 hover:shadow-2xl hover:shadow-indigo-900/5 transition-all relative overflow-hidden"
    >
      {/* Fare Type Badge */}
      <div className="absolute top-0 right-10 bg-indigo-50 px-4 py-1.5 rounded-b-xl border-x border-b border-indigo-100 flex items-center gap-1.5">
         <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></div>
         <span className="text-[0.6rem] font-bold text-indigo-700 uppercase tracking-widest">{flight.fareType} Fare</span>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center gap-8">
        {/* Airline Info */}
        <div className="flex items-center gap-4 min-w-[200px]">
          <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 overflow-hidden shadow-sm group-hover:scale-110 transition-transform">
             <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${carrierCode}`} alt={carrierCode} className="w-8 h-8 opacity-70" />
          </div>
          <div>
            <div className="text-sm font-black text-slate-900 leading-tight mb-1">{airlineName}</div>
            <div className="flex items-center gap-2">
              <span className="text-[0.6rem] font-bold text-slate-400 uppercase tracking-tighter">Flight {carrierCode} {segments[0].number}</span>
              {isEcoFriendly && (
                <div className="flex items-center gap-1 bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded text-[0.55rem] font-black uppercase tracking-tighter shadow-sm border border-emerald-100">
                  <Leaf size={10} fill="currentColor" /> Eco-Priority
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Schedule */}
        <div className="flex-1 flex items-center justify-between gap-4">
          <div className="text-center lg:text-left min-w-[80px]">
            <div className="text-xl font-black text-slate-900 leading-none mb-1">{departureDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}</div>
            <div className="text-[0.65rem] font-black text-slate-400 uppercase tracking-widest">{segments[0].departure.iataCode}</div>
          </div>

          <div className="flex-1 max-w-[240px] flex flex-col items-center">
            <div className="text-[0.6rem] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
               <Clock size={12} /> {formattedDuration}
            </div>
            <div className="w-full relative flex items-center gap-2 group-hover:px-1 transition-all">
              <div className="w-2 h-2 rounded-full border-2 border-slate-200 bg-white"></div>
              <div className="flex-1 h-px bg-slate-200 relative border-t border-dashed border-slate-300">
                <Plane size={16} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-300 group-hover:text-indigo-600 group-hover:scale-125 transition-all rotate-90" fill="currentColor" />
              </div>
              <div className="w-2 h-2 rounded-full border-2 border-slate-200 bg-white"></div>
            </div>
            <div className="mt-1.5 text-[0.6rem] font-black tracking-tighter uppercase whitespace-nowrap">
              {stops === 0 ? (
                <span className="text-emerald-600">Non-stop flight</span>
              ) : (
                <span className="text-amber-500">{stops} {stops === 1 ? 'Stop' : 'Stops'} • {segments.map(s => s.departure.iataCode).slice(1).join(', ')}</span>
              )}
            </div>
          </div>

          <div className="text-center lg:text-right min-w-[80px]">
            <div className="text-xl font-black text-slate-900 leading-none mb-1">{arrivalDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}</div>
            <div className="text-[0.65rem] font-black text-slate-400 uppercase tracking-widest">{segments[segments.length - 1].arrival.iataCode}</div>
          </div>
        </div>

        {/* Pricing & CTA */}
        <div className="lg:border-l border-slate-100 lg:pl-10 flex flex-row lg:flex-col items-center justify-between lg:justify-center min-w-[150px] gap-4">
          <div className="text-left lg:text-center">
            <div className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-tighter mb-0.5">Total Price</div>
            <div className="text-2xl font-black text-slate-900 tracking-tighter leading-none">{convertedPrice}</div>
            <div className="text-[0.55rem] text-teal-600 font-black tracking-widest uppercase mt-1 flex items-center justify-center gap-1 group-hover:scale-105 transition-transform origin-center">
              <ShieldCheck size={10} /> Instant Check-in
            </div>
          </div>
          <button 
            onClick={() => onSelect(flight)}
            className="px-6 py-3 bg-indigo-900 text-white rounded-xl text-xs font-black shadow-xl shadow-indigo-900/10 hover:bg-indigo-950 hover:shadow-indigo-900/20 active:scale-[0.97] transition-all uppercase tracking-widest group-hover:px-8"
          >
            Select
          </button>
        </div>
      </div>

      {/* Tags Row */}
      <div className="mt-6 pt-5 border-t border-slate-50 flex items-center gap-4 overflow-x-auto no-scrollbar">
         <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 rounded text-[0.6rem] font-bold text-slate-500 whitespace-nowrap">
            <Zap size={12} className="text-amber-500" /> High Demand Route
         </div>
         <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 rounded text-[0.6rem] font-bold text-slate-500 whitespace-nowrap">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Free Meal Included
         </div>
         <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 rounded text-[0.6rem] font-bold text-slate-500 whitespace-nowrap">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div> Standard Seat Selection
         </div>
         <div className="ml-auto text-[0.6rem] font-bold text-indigo-400 hover:text-indigo-600 cursor-pointer transition-colors uppercase tracking-widest">Flight Details +</div>
      </div>
    </motion.div>
  );
}
