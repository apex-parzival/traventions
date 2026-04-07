"use client";

import React, { useState } from "react";
import { 
  ChevronDown, 
  Globe, 
  Plane, 
  Briefcase, 
  Plus, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  Tag, 
  History,
  Check
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface AncillarySelectionProps {
  passengers: any[];
  selectedSeats: Record<number, string>;
  setSelectedSeats: (seats: Record<number, string>) => void;
  baggage: Record<number, string>;
  setBaggage: (baggage: Record<number, string>) => void;
  meals: Record<number, string>;
  setMeals: (meals: Record<number, string>) => void;
  passengerDetails: Record<number, any>;
  flightOffer: any;
}

export default function AncillarySelection({
  passengers,
  selectedSeats,
  setSelectedSeats,
  baggage,
  setBaggage,
  meals,
  setMeals,
  passengerDetails,
  flightOffer
}: AncillarySelectionProps) {
  const [expandedIndex, setExpandedIndex] = useState(0);

  return (
    <div className="space-y-4">
      {passengers.map((p, i) => (
        <div key={i} className="card bg-white border border-slate-100 shadow-sm overflow-hidden rounded-3xl group transition-all hover:border-indigo-100">
          <div 
            className="p-6 flex items-center justify-between cursor-pointer" 
            onClick={() => setExpandedIndex(expandedIndex === i ? -1 : i)}
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center font-black text-sm text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all shadow-sm">
                 {i + 1}
              </div>
              <div>
                <div className="text-sm font-black text-slate-900 tracking-tight leading-none mb-1">
                   {passengerDetails[i]?.firstName ? `${passengerDetails[i].title || ''} ${passengerDetails[i].firstName} ${passengerDetails[i].lastName}` : `Traveler ${i + 1}`}
                </div>
                <div className="text-[0.65rem] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2">
                   {p.type} <span className="w-1 h-1 bg-slate-200 rounded-full"></span> Economy
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
               <div className="flex gap-1.5">
                  {selectedSeats[i] && <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[0.6rem] font-black">{selectedSeats[i]}</div>}
                  {baggage[i] && <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-[0.6rem] font-black"><Briefcase size={10} /></div>}
                  {meals[i] && meals[i] !== 'none' && <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-[0.6rem] font-black"><Sparkles size={10} /></div>}
               </div>
               <ChevronDown size={18} className={cn("text-slate-400 transition-transform duration-300", expandedIndex === i && "rotate-180")} />
            </div>
          </div>

          <AnimatePresence>
            {expandedIndex === i && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }} 
                animate={{ height: "auto", opacity: 1 }} 
                exit={{ height: 0, opacity: 0 }} 
                className="overflow-hidden border-t border-slate-50"
              >
                <div className="p-8 space-y-12">
                   {/* Seat Selection */}
                   <section>
                      <div className="flex items-center justify-between mb-8">
                         <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl"><Globe size={18} /></div>
                            <div>
                               <h4 className="text-sm font-black text-[#1e2d4f] uppercase tracking-widest">Seat Selection</h4>
                               <p className="text-[0.65rem] text-slate-400 font-medium">Standard and Premium seating options</p>
                            </div>
                         </div>
                         <label className="flex items-center gap-2 text-[0.7rem] font-black text-slate-400 cursor-pointer hover:text-slate-600 transition-colors uppercase tracking-tighter">
                            <input type="checkbox" className="rounded border-slate-300 accent-indigo-600" /> Skip Selection
                         </label>
                      </div>

                      <div className="flex flex-col items-center gap-3 bg-slate-50/50 p-10 rounded-[2.5rem] border border-dashed border-slate-200">
                         <div className="flex items-center gap-2 mb-6 text-[0.6rem] font-black text-slate-400 uppercase tracking-widest bg-white px-4 py-1.5 rounded-full shadow-sm border border-slate-100">
                            <Plane size={12} className="rotate-0 text-slate-300" /> Front of Aircraft
                         </div>
                         {[1, 2, 3, 4, 5].map(row => (
                            <div key={row} className="flex gap-4">
                               <div className="flex gap-2">
                                  {['A', 'B'].map(col => {
                                    const seatId = `${row}${col}`;
                                    const isSelected = selectedSeats[i] === seatId;
                                    return (
                                      <button 
                                        key={col} 
                                        className={cn(
                                          "w-10 h-10 rounded-xl border-2 font-black text-[0.75rem] transition-all duration-300 active:scale-90",
                                          isSelected ? "bg-indigo-900 border-indigo-900 text-white shadow-xl shadow-indigo-900/20" : "bg-white border-slate-100 text-slate-300 hover:border-indigo-400 hover:text-indigo-400"
                                        )}
                                        onClick={() => setSelectedSeats({...selectedSeats, [i]: seatId})}
                                      >
                                        {seatId}
                                      </button>
                                    );
                                  })}
                               </div>
                               <div className="w-10 flex items-center justify-center text-[0.65rem] font-black text-slate-200">{row}</div>
                               <div className="flex gap-2">
                                  {['E', 'F'].map(col => {
                                    const seatId = `${row}${col}`;
                                    const isSelected = selectedSeats[i] === seatId;
                                    return (
                                      <button 
                                        key={col}
                                        className={cn(
                                          "w-10 h-10 rounded-xl border-2 font-black text-[0.75rem] transition-all duration-300 active:scale-90",
                                          isSelected ? "bg-indigo-900 border-indigo-900 text-white shadow-xl shadow-indigo-900/20" : "bg-white border-slate-100 text-slate-300 hover:border-indigo-400 hover:text-indigo-400"
                                        )}
                                        onClick={() => setSelectedSeats({...selectedSeats, [i]: seatId})}
                                      >
                                        {seatId}
                                      </button>
                                    );
                                  })}
                               </div>
                            </div>
                         ))}
                      </div>
                   </section>

                   {/* Baggage & Meal */}
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      {/* Baggage */}
                      <section>
                         <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                               <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl"><Briefcase size={18} /></div>
                               <div className="text-[0.7rem] font-black text-slate-900 uppercase tracking-widest">Checked Baggage</div>
                            </div>
                            <span className="text-[0.55rem] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-tighter shadow-sm">Per traveler</span>
                         </div>
                         
                         <div className="space-y-3">
                            <button 
                               className={cn(
                                  "w-full group relative flex items-center gap-4 p-5 rounded-2xl border-2 transition-all duration-300",
                                  (!baggage[i] || baggage[i] === "") 
                                     ? "border-emerald-600 bg-emerald-50/50 shadow-md scale-[1.02]" 
                                     : "border-slate-100 bg-white hover:border-emerald-200"
                               )}
                               onClick={() => setBaggage({...baggage, [i]: ""})}
                            >
                               <div className="w-12 h-12 rounded-xl bg-white border border-slate-100 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                  <Briefcase size={22} className={(!baggage[i] || baggage[i] === "") ? "text-emerald-600" : "text-slate-300"} />
                               </div>
                               <div className="text-left">
                                  <div className="text-[0.75rem] font-black text-slate-900 uppercase tracking-tight leading-none mb-1">Standard Allowance</div>
                                  <div className="text-[0.65rem] text-slate-500 font-medium">1x 23kg Checked-in Bag included</div>
                               </div>
                               {(!baggage[i] || baggage[i] === "") && <div className="ml-auto flex items-center justify-center w-6 h-6 rounded-full bg-emerald-600 text-white"><Check size={14} strokeWidth={3} /></div>}
                            </button>

                            {flightOffer?.baggageAllowance?.extraOptionsAvailable && flightOffer.baggageAllowance.extraOptions.map((opt: any, bIdx: number) => {
                               const isSelected = baggage[i] === String(opt.price);
                               return (
                                  <button 
                                     key={bIdx}
                                     className={cn(
                                        "w-full group relative flex items-center gap-4 p-5 rounded-2xl border-2 transition-all duration-300",
                                        isSelected ? "border-emerald-600 bg-emerald-50/50 shadow-md scale-[1.02]" : "border-slate-100 bg-white hover:border-emerald-200"
                                     )}
                                     onClick={() => setBaggage({...baggage, [i]: String(opt.price)})}
                                  >
                                     <div className="w-12 h-12 rounded-xl bg-white border border-slate-100 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                        <Plus size={22} className={isSelected ? "text-emerald-600" : "text-slate-300"} />
                                     </div>
                                     <div className="text-left">
                                        <div className="text-[0.75rem] font-black text-slate-900 uppercase tracking-tight leading-none mb-1">Additional {opt.quantity}</div>
                                        <div className="text-[0.65rem] text-slate-500 font-medium">Extra baggage up to 23kg</div>
                                     </div>
                                     <div className="ml-auto text-right">
                                        {isSelected ? (
                                           <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center"><Check size={14} strokeWidth={3} /></div>
                                        ) : (
                                           <div className="text-[0.8rem] font-black text-emerald-600">+${opt.price}</div>
                                        )}
                                     </div>
                                  </button>
                               )
                            })}
                         </div>
                      </section>

                      {/* Meal */}
                      <section>
                         <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                               <div className="p-2 bg-amber-50 text-amber-600 rounded-xl"><Sparkles size={18} /></div>
                               <div className="text-[0.7rem] font-black text-slate-900 uppercase tracking-widest">In-flight Dining</div>
                            </div>
                            <span className="text-[0.55rem] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full uppercase tracking-tighter shadow-sm">Dietary focus</span>
                         </div>
                         
                         <div className="grid grid-cols-2 gap-3">
                            {[
                               {id: "none", label: "No Preference", icon: <Check size={14}/>, desc: "Standard menu"},
                               {id: "vegetarian", label: "Vegetarian", icon: <div className="text-emerald-600 font-black">V</div>, desc: "Plant-based"},
                               {id: "halal", label: "Halal", icon: <div className="text-amber-900 font-bold">☾</div>, desc: "Certified"},
                               {id: "gluten_free", label: "Gluten Free", icon: <div className="text-amber-600 font-bold">GF</div>, desc: "No wheat"}
                            ].map(meal => {
                               const isSelected = (meals[i] || "none") === meal.id;
                               return (
                                  <button 
                                     key={meal.id}
                                     className={cn(
                                        "flex flex-col gap-2 p-4 rounded-2xl border-2 transition-all duration-300 text-left relative overflow-hidden",
                                        isSelected ? "border-amber-600 bg-amber-50/50 shadow-md scale-[1.02]" : "border-slate-100 bg-white hover:border-amber-100"
                                     )}
                                     onClick={() => setMeals({...meals, [i]: meal.id})}
                                  >
                                     <div className="flex items-center justify-between">
                                        <div className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center shadow-sm">
                                           {meal.icon}
                                        </div>
                                        {isSelected && <CheckCircle2 size={14} className="text-amber-600" fill="currentColor" />}
                                     </div>
                                     <div>
                                        <div className="text-[0.7rem] font-black text-slate-800 uppercase tracking-tighter leading-none mb-0.5">{meal.label}</div>
                                        <div className="text-[0.55rem] text-slate-500 font-medium leading-none">{meal.desc}</div>
                                     </div>
                                  </button>
                               )
                            })}
                         </div>
                      </section>
                   </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}
