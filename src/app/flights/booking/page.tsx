"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ProcessingScreen } from "./PostBookingScreens";
import { ConfirmationScreen } from "./ConfirmationScreen";
import { HoldScreen } from "./HoldScreen";
import { BookingDetailsScreen } from "./BookingDetailsScreen";
import {
  ChevronRight,
  ChevronDown,
  Check,
  User,
  Info,
  Plane,
  Clock,
  ShieldCheck,
  Search,
  Plus,
  ArrowRight,
  ChevronLeft,
  MessageSquare,
  Globe,
  Tag,
  CreditCard,
  History,
  Briefcase,
  Mail,
  Bell,
  Users,
  Zap,
  Wallet,
  Landmark,
  CalendarClock,
  Sparkles,
  CheckCircle2
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import "@/styles/booking.css";

// --- Components ---

interface Passenger {
  type: string;
  baseFare: number;
}

const AncillariesStep = ({ 
  passengers, 
  selectedSeats, 
  setSelectedSeats, 
  baggage, 
  setBaggage, 
  meals, 
  setMeals, 
  passengerDetails,
  passengerAddons,
  setPassengerAddons,
  flightOffer,
  onBack,
  onContinue
}: {
  passengers: Passenger[];
  selectedSeats: Record<number, string>;
  setSelectedSeats: (seats: Record<number, string>) => void;
  baggage: Record<number, string>;
  setBaggage: (baggage: Record<number, string>) => void;
  meals: Record<number, string>;
  setMeals: (meals: Record<number, string>) => void;
  passengerDetails: Record<number, any>;
  passengerAddons: Record<number, any>;
  setPassengerAddons: (addons: Record<number, any>) => void;
  flightOffer: any;
  onBack: () => void;
  onContinue: () => void;
}) => {
  const [expandedIndex, setExpandedIndex] = useState(0);

  return (
    <div className="booking-main">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-2xl font-black text-[#1e2d4f] tracking-tighter">Add Ancillary Services</h1>
          <p className="text-[0.75rem] text-slate-500 font-medium mt-1">Enhance your journey with optional services for each passenger</p>
        </div>
        <button className="flex items-center gap-1.5 text-indigo-600 text-xs font-bold hover:underline" onClick={onBack}>
          <ChevronLeft size={16} /> Back to Passengers
        </button>
      </div>

      {passengers.map((p: Passenger, i: number) => (
        <div key={i} className="card bg-white mb-4 border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-5 flex items-center justify-between cursor-pointer" onClick={() => setExpandedIndex(expandedIndex === i ? -1 : i)}>
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-500">{i + 1}</div>
              <div>
                <div className="text-sm font-bold text-slate-900">Passenger {i + 1} — {passengerDetails[i]?.firstName ? `${passengerDetails[i].title || ''} ${passengerDetails[i].firstName} ${passengerDetails[i].lastName}` : 'Traveler'}</div>
                <div className="text-[0.7rem] text-slate-400 font-medium">{p.type} • Economy</div>
              </div>
            </div>
            <ChevronDown size={18} className={cn("text-slate-400 transition-transform", expandedIndex === i && "rotate-180")} />
          </div>

          <AnimatePresence>
            {expandedIndex === i && (
              <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden border-t border-slate-50">
                <div className="p-6">
                  {/* Seat Selection Mockup */}
                  <div className="mb-8">
                     <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                           <Globe size={16} className="text-indigo-600" />
                           <span className="text-[0.75rem] font-black text-[#1e2d4f] uppercase tracking-widest">Seat Selection</span>
                        </div>
                        <label className="flex items-center gap-2 text-xs font-medium text-slate-500 cursor-pointer">
                           <input type="checkbox" className="rounded" /> Skip seat selection — Let airline assign
                        </label>
                     </div>
                     
                     <div className="flex flex-wrap gap-4 mb-8">
                        {[
                           `Middle (Free)`, 
                           `Aisle (+$15)`, 
                           `Window (+$25)`
                        ].map((type, idx) => (
                           <div key={idx} className="flex items-center gap-2">
                              <div className={cn("w-4 h-4 rounded-sm border", idx === 0 ? "bg-slate-50 border-slate-200" : idx === 1 ? "bg-blue-100 border-blue-200" : "bg-orange-100 border-orange-200")}></div>
                              <span className="text-[0.6rem] font-bold text-slate-500">{type}</span>
                           </div>
                        ))}
                     </div>

                     {/* Grid of Seats */}
                     <div className="flex flex-col items-center gap-2 bg-slate-50/50 p-8 rounded-3xl border border-dashed border-slate-200">
                        <div className="flex items-center gap-2 mb-4 text-[0.6rem] font-black text-slate-400 uppercase tracking-widest bg-white px-3 py-1 rounded-full shadow-sm">
                           <Plane size={12} className="rotate-0" /> Front of Aircraft
                        </div>
                        {[1, 2, 3, 4].map(row => (
                           <div key={row} className="flex gap-4">
                              <div className="flex gap-1.5">
                                 {['A', 'B'].map(col => {
                                   const seatId = `${row}${col}`;
                                   const isSelected = selectedSeats[i] === seatId;
                                   const seatType = ['A','F'].includes(col) ? 'Window' : ['C','D'].includes(col) ? 'Aisle' : 'Middle';
                                   const seatPrice = ['A','F'].includes(col) ? 25 : ['C','D'].includes(col) ? 15 : 0;
                                   return (
                                     <button 
                                       key={col} 
                                       title={`${seatType} Seat - ${seatPrice === 0 ? 'Free' : '+$' + seatPrice}`}
                                       className={cn(
                                         "w-8 h-8 rounded-lg border font-black text-[0.65rem] transition-all",
                                         isSelected ? "bg-indigo-900 border-indigo-900 text-white shadow-lg" : "bg-white border-slate-200 text-slate-400 hover:border-indigo-400"
                                       )}
                                       onClick={() => setSelectedSeats({...selectedSeats, [i]: seatId})}
                                     >
                                       {seatId}
                                     </button>
                                   );
                                 })}
                              </div>
                              <div className="w-8 flex items-center justify-center text-[0.6rem] font-bold text-slate-300">{row}</div>
                              <div className="flex gap-1.5">
                                 {['C', 'D'].map(col => (
                                     <button key={col} className="w-8 h-8 rounded-lg border border-slate-100 bg-slate-50 text-slate-300 font-black text-[0.65rem] cursor-not-allowed">{row}{col}</button>
                                 ))}
                              </div>
                              <div className="w-8"></div>
                              <div className="flex gap-1.5">
                                 {['E', 'F'].map(col => {
                                   const seatId = `${row}${col}`;
                                   const isSelected = selectedSeats[i] === seatId;
                                   const seatType = ['A','F'].includes(col) ? 'Window' : ['C','D'].includes(col) ? 'Aisle' : 'Middle';
                                   const seatPrice = ['A','F'].includes(col) ? 25 : ['C','D'].includes(col) ? 15 : 0;
                                   return (
                                     <button 
                                       key={col}
                                       title={`${seatType} Seat - ${seatPrice === 0 ? 'Free' : '+$' + seatPrice}`}
                                       className={cn(
                                         "w-8 h-8 rounded-lg border font-black text-[0.65rem] transition-all",
                                         isSelected ? "bg-indigo-900 border-indigo-900 text-white shadow-lg" : "bg-white border-slate-200 text-slate-400 hover:border-indigo-400"
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
                  </div>

                   {/* Baggage & Meal */}
                   <div className="border-t border-slate-100 pt-8 mt-6">
                      <h3 className="text-sm font-black text-[#1e2d4f] mb-6 flex items-center gap-2">
                         <Sparkles size={16} className="text-amber-500" />
                         Premium Personalization
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                         {/* Baggage Section */}
                         <div className="space-y-4">
                            <div className="flex items-center justify-between mb-2">
                               <div className="flex items-center gap-2">
                                  <Briefcase size={16} className="text-indigo-600" />
                                  <span className="text-xs font-black text-slate-800 uppercase tracking-widest">Checked Baggage</span>
                               </div>
                               <span className="text-[0.6rem] font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full uppercase">Per traveler</span>
                            </div>
                            
                            <div className="grid grid-cols-1 gap-3">
                               <button 
                                  className={cn(
                                     "group relative flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-300 overflow-hidden",
                                     (!baggage[i] || baggage[i] === "") 
                                        ? "border-indigo-600 bg-indigo-50/50 shadow-md" 
                                        : "border-slate-100 bg-white hover:border-indigo-200"
                                  )}
                                  onClick={() => setBaggage({...baggage, [i]: ""})}
                               >
                                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center shadow-sm">
                                     <Briefcase size={20} className={(!baggage[i] || baggage[i] === "") ? "text-indigo-600" : "text-slate-300"} />
                                  </div>
                                  <div className="text-left">
                                     <div className="text-[0.7rem] font-black text-slate-900 uppercase tracking-tight">Standard Allowance</div>
                                     <div className="text-[0.65rem] text-slate-500 font-medium">1x 23kg Checked-in Bag included</div>
                                  </div>
                                  {(!baggage[i] || baggage[i] === "") && <div className="ml-auto"><CheckCircle2 size={16} className="text-indigo-600" /></div>}
                               </button>

                               {flightOffer.baggageAllowance.extraOptionsAvailable && flightOffer.baggageAllowance.extraOptions.map((opt: any, bIdx: number) => {
                                  const isSelected = baggage[i] === String(opt.price);
                                  return (
                                     <button 
                                        key={bIdx}
                                        className={cn(
                                           "group relative flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-300",
                                           isSelected ? "border-indigo-600 bg-indigo-50/50 shadow-md" : "border-slate-100 bg-white hover:border-indigo-200"
                                        )}
                                        onClick={() => setBaggage({...baggage, [i]: String(opt.price)})}
                                     >
                                        <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center shadow-sm">
                                           <Plus size={20} className={isSelected ? "text-indigo-600" : "text-slate-300"} />
                                        </div>
                                        <div className="text-left">
                                           <div className="text-[0.7rem] font-black text-slate-900 uppercase tracking-tight">Additional {opt.quantity}</div>
                                           <div className="text-[0.65rem] text-slate-500 font-medium">Extra baggage up to 23kg</div>
                                        </div>
                                        <div className="ml-auto text-right">
                                           <div className="text-[0.7rem] font-black text-indigo-600">+${opt.price}</div>
                                           {isSelected && <CheckCircle2 size={16} className="text-indigo-600 inline-block mt-1" />}
                                        </div>
                                     </button>
                                  )
                               })}
                            </div>
                         </div>

                         {/* Meal Section */}
                         <div className="space-y-4">
                            <div className="flex items-center justify-between mb-2">
                               <div className="flex items-center gap-2">
                                  <Plus size={16} className="text-emerald-600" />
                                  <span className="text-xs font-black text-slate-800 uppercase tracking-widest">In-flight Dining</span>
                               </div>
                               <span className="text-[0.6rem] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-tighter">Dietary focus</span>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3">
                               {[
                                  {id: "none", label: "No Preference", icon: <Check size={14}/>, desc: "Standard menu"},
                                  {id: "standard", label: "Chef's Choice", icon: <Sparkles size={14} className="text-amber-500"/>, desc: "Premium standard"},
                                  {id: "vegetarian", label: "Vegetarian", icon: <div className="text-emerald-600 font-black">V</div>, desc: "Plant-based (VGML)"},
                                  {id: "vegan", label: "Strict Vegan", icon: <div className="text-emerald-600 font-black">VG</div>, desc: "No animal products"},
                                  {id: "halal", label: "Halal", icon: <div className="text-emerald-900 font-bold">☪</div>, desc: "Certified (MOML)"},
                                  {id: "kosher", label: "Kosher", icon: <div className="text-blue-900 font-bold">✡</div>, desc: "Certified (KSML)"},
                                  {id: "gluten_free", label: "Gluten Free", icon: <div className="text-amber-600 font-bold">GF</div>, desc: "No wheat/gluten"},
                                  {id: "child", label: "Kids Fun Meal", icon: <div className="text-pink-500 text-lg">☺</div>, desc: "Child friendly"}
                               ].map(meal => {
                                  const isSelected = (meals[i] || "none") === meal.id;
                                  return (
                                     <button 
                                        key={meal.id}
                                        className={cn(
                                           "flex flex-col gap-2 p-3 rounded-2xl border-2 transition-all duration-300 text-left relative overflow-hidden",
                                           isSelected ? "border-emerald-600 bg-emerald-50/50 shadow-sm" : "border-slate-100 bg-white hover:border-emerald-100"
                                        )}
                                        onClick={() => setMeals({...meals, [i]: meal.id})}
                                     >
                                        <div className="flex items-center justify-between">
                                           <div className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center shadow-sm">
                                              {meal.icon}
                                           </div>
                                           {isSelected && <CheckCircle2 size={12} className="text-emerald-600" />}
                                        </div>
                                        <div>
                                           <div className="text-[0.65rem] font-black text-slate-800 uppercase tracking-tighter">{meal.label}</div>
                                           <div className="text-[0.55rem] text-slate-500 font-medium leading-none mt-0.5">{meal.desc}</div>
                                        </div>
                                     </button>
                                  )
                               })}
                            </div>
                         </div>
                      </div>
                   </div>

                  {/* Premium Add-ons */}
                  <div className="border-t border-slate-100 pt-8 mt-6">
                     <h3 className="text-sm font-black text-[#1e2d4f] mb-6">Premium Add-ons</h3>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <label className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:border-indigo-300 transition-colors">
                           <div className="flex items-center gap-3">
                              <ShieldCheck size={18} className="text-indigo-600" />
                              <div>
                                 <div className="text-xs font-bold text-slate-900">Travel Insurance</div>
                                 <div className="text-[0.6rem] text-slate-500 mt-0.5">Comprehensive coverage</div>
                              </div>
                           </div>
                           <div className="flex items-center gap-2">
                              <span className="text-xs font-black text-indigo-600">+$25</span>
                              <input type="checkbox" className="rounded" checked={passengerAddons[i]?.insurance || false} onChange={(e) => setPassengerAddons({...passengerAddons, [i]: {...(passengerAddons[i] || {}), insurance: e.target.checked}})} />
                           </div>
                        </label>
                        <label className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:border-indigo-300 transition-colors">
                           <div className="flex items-center gap-3">
                              <Tag size={18} className="text-amber-600" />
                              <div>
                                 <div className="text-xs font-bold text-slate-900">Priority Boarding</div>
                                 <div className="text-[0.6rem] text-slate-500 mt-0.5">Board before general</div>
                              </div>
                           </div>
                           <div className="flex items-center gap-2">
                              <span className="text-xs font-black text-indigo-600">+$12</span>
                              <input type="checkbox" className="rounded" checked={passengerAddons[i]?.priorityBoarding || false} onChange={(e) => setPassengerAddons({...passengerAddons, [i]: {...(passengerAddons[i] || {}), priorityBoarding: e.target.checked}})} />
                           </div>
                        </label>
                        <label className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:border-indigo-300 transition-colors">
                           <div className="flex items-center gap-3">
                              <History size={18} className="text-blue-600" />
                              <div>
                                 <div className="text-xs font-bold text-slate-900">Lounge Access</div>
                                 <div className="text-[0.6rem] text-slate-500 mt-0.5">Relax before flight</div>
                              </div>
                           </div>
                           <div className="flex items-center gap-2">
                              <span className="text-xs font-black text-indigo-600">+$35</span>
                              <input type="checkbox" className="rounded" checked={passengerAddons[i]?.loungeAccess || false} onChange={(e) => setPassengerAddons({...passengerAddons, [i]: {...(passengerAddons[i] || {}), loungeAccess: e.target.checked}})} />
                           </div>
                        </label>
                     </div>
                  </div>
                 </div>
               </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
      {/* Removed Global Add-ons */}

      <div className="flex justify-between items-center mt-6">
         <button className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-2" onClick={onBack}>
            <ChevronLeft size={16} /> Back to Passengers
         </button>
         <button className="flex items-center gap-2 px-10 py-4 bg-[#1e2d4f] text-white rounded-xl text-sm font-black shadow-xl shadow-indigo-900/10 hover:bg-indigo-950 transition-all uppercase tracking-widest" onClick={onContinue}>
            Continue to Contact Info <ArrowRight size={18} />
         </button>
      </div>
     </div>
  );
};

const ContactStep = ({ 
  contactInfo,
  setContactInfo,
  bookingOption,
  setBookingOption,
  onBack, 
  onContinue 
}: { 
  contactInfo: any;
  setContactInfo: (info: any) => void;
  bookingOption: string;
  setBookingOption: (option: string) => void;
  onBack: () => void; 
  onContinue: () => void; 
}) => {
  const [emailError, setEmailError] = useState("");

  const handleContinue = () => {
    if (!contactInfo.primaryEmail.includes('@')) {
      setEmailError("Please enter a valid email address containing '@'");
      return;
    }
    setEmailError("");
    onContinue();
  };

  return (
    <div className="booking-main">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-2xl font-black text-[#1e2d4f] tracking-tighter">Contact Information</h1>
          <p className="text-[0.75rem] text-slate-500 font-medium mt-1">Provide contact details for ticket delivery and booking updates</p>
        </div>
        <button className="flex items-center gap-1.5 text-indigo-600 text-xs font-bold hover:underline" onClick={onBack}>
          <ChevronLeft size={16} /> Back to Ancillaries
        </button>
      </div>

      {/* Primary Contact Details */}
      <div className="card bg-white p-6 border border-slate-100 shadow-sm mb-4">
         <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100">
            <div className="text-indigo-600">
               <Mail size={18} />
            </div>
            <div>
               <h3 className="text-sm font-bold text-slate-900">Primary Contact Details</h3>
               <p className="text-[0.7rem] text-slate-400 font-medium">E-ticket and booking confirmations will be sent here</p>
            </div>
         </div>

         <div className="space-y-6">
            <div className="form-group flex flex-col">
               <label className="text-xs font-bold text-slate-900 mb-1.5">Primary Contact Email <span className="text-red-500">*</span></label>
               <input 
                 type="email" 
                 className={cn("px-4 py-3 border bg-white rounded-xl text-sm font-medium outline-none focus:border-indigo-400 text-slate-900 placeholder:text-slate-400", emailError ? "border-red-500" : "border-indigo-200")}
                 placeholder="contact@company.com" 
                 value={contactInfo.primaryEmail}
                 onChange={(e) => setContactInfo({ ...contactInfo, primaryEmail: e.target.value })}
               />
               {emailError ? (
                  <p className="text-[0.65rem] text-red-500 mt-1.5 font-bold">{emailError}</p>
               ) : (
                  <p className="text-[0.65rem] text-slate-400 mt-1.5 font-medium">E-ticket and booking confirmation will be sent to this email</p>
               )}
            </div>

            <div className="form-group flex flex-col">
               <label className="text-xs font-bold text-slate-900 mb-1.5">Primary Contact Phone <span className="text-red-500">*</span></label>
               <div className="flex gap-2">
                  <div className="w-24 relative">
                     <select className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-bold outline-none appearance-none bg-white focus:border-indigo-400">
                        <option>US +1</option>
                        <option>UK +44</option>
                     </select>
                     <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                  <input 
                     type="tel" 
                     className="flex-1 px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-400" 
                     placeholder="Enter phone number" 
                     value={contactInfo.primaryPhone}
                     onChange={(e) => setContactInfo({ ...contactInfo, primaryPhone: e.target.value })}
                  />
               </div>
               <p className="text-[0.65rem] text-slate-400 mt-1.5 font-medium">For urgent booking updates and flight changes</p>
            </div>

            <div className="form-group flex flex-col">
               <label className="text-xs font-bold text-slate-900 mb-1.5">Alternate Contact Phone <span className="text-slate-400 font-medium">(Optional)</span></label>
               <div className="flex gap-2">
                  <div className="w-24 relative">
                     <select className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-bold outline-none appearance-none bg-white focus:border-indigo-400">
                        <option>US +1</option>
                        <option>UK +44</option>
                     </select>
                     <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                  <input 
                     type="tel" 
                     className="flex-1 px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-400" 
                     placeholder="Enter alternate phone number" 
                     value={contactInfo.altPhone}
                     onChange={(e) => setContactInfo({ ...contactInfo, altPhone: e.target.value })}
                  />
               </div>
               <p className="text-[0.65rem] text-slate-400 mt-1.5 font-medium">Backup contact number for emergencies</p>
            </div>
         </div>
      </div>

      {/* Contact Preferences */}
      <div className="card bg-white p-6 border border-slate-100 shadow-sm mb-4">
         <div className="flex items-center gap-3 mb-6">
            <div className="text-teal-600">
               <Bell size={18} />
            </div>
            <div>
               <h3 className="text-sm font-bold text-slate-900">Contact Preferences</h3>
               <p className="text-[0.7rem] text-slate-400 font-medium">How should we reach you for booking updates?</p>
            </div>
         </div>

         <div className="form-group flex flex-col">
            <label className="text-xs font-bold text-slate-900 mb-2">Preferred Contact Method</label>
            <div className="flex items-center gap-3">
               {['Email', 'SMS', 'Both'].map(method => (
                  <label key={method} className={cn(
                     "flex items-center justify-center min-w-[80px] py-1.5 px-4 rounded-lg border text-sm font-bold cursor-pointer transition-all",
                     contactInfo.preferredMethod === method ? "border-[#1e2d4f] text-[#1e2d4f] bg-slate-50 shadow-sm" : "border-slate-200 text-slate-500 hover:bg-slate-50"
                  )}>
                     <input 
                        type="radio" 
                        className="hidden" 
                        checked={contactInfo.preferredMethod === method}
                        onChange={() => setContactInfo({ ...contactInfo, preferredMethod: method })}
                     />
                     <div className="flex items-center gap-2">
                        <div className={cn("w-3.5 h-3.5 rounded-full flex items-center justify-center", contactInfo.preferredMethod === method ? "border-2 border-red-500" : "border border-slate-300")}>
                           {contactInfo.preferredMethod === method && <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>}
                        </div>
                        {method}
                     </div>
                  </label>
               ))}
            </div>
         </div>
      </div>

      {/* Send E-ticket to Additional Emails */}
      <div className="card bg-white p-6 border border-slate-100 shadow-sm mb-4">
         <div className="flex items-center gap-3 mb-6">
            <div className="text-blue-600">
               <Users size={18} />
            </div>
            <div>
               <h3 className="text-sm font-bold text-slate-900">Send E-ticket to Additional Emails</h3>
               <p className="text-[0.7rem] text-slate-400 font-medium">Share booking confirmation with colleagues or clients</p>
            </div>
         </div>

         <div className="form-group flex flex-col">
            <label className="text-xs font-bold text-slate-900 mb-1.5">Additional Email Recipients <span className="text-slate-400 font-medium">(Optional)</span></label>
            <input 
               type="text" 
               className="px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-400 placeholder:text-slate-400" 
               placeholder="Type email and press Enter or comma" 
               value={contactInfo.additionalEmails}
               onChange={(e) => setContactInfo({ ...contactInfo, additionalEmails: e.target.value })}
            />
            <p className="text-[0.65rem] text-slate-400 mt-1.5 font-medium">Add up to 5 additional email addresses. Press Enter or comma to add.</p>
         </div>
      </div>

      {/* Booking Options */}
      <div className="card bg-white p-6 border border-slate-100 shadow-sm">
         <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100">
            <div className="text-[#1e2d4f]">
               <CreditCard size={18} />
            </div>
            <div>
               <h3 className="text-sm font-bold text-slate-900">Booking Options</h3>
               <p className="text-[0.7rem] text-slate-400 font-medium">Choose how to proceed with this booking</p>
            </div>
         </div>

         <div className="grid grid-cols-2 gap-4">
            <div 
               className={cn(
                  "p-5 rounded-xl border-2 cursor-pointer transition-all relative overflow-hidden",
                  bookingOption === 'pay_now' ? "border-emerald-500 bg-emerald-50/50" : "border-slate-100 bg-white hover:border-slate-200"
               )}
               onClick={() => setBookingOption('pay_now')}
            >
               <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-3">
                     <div className={cn("w-7 h-7 rounded-full flex items-center justify-center text-xs", bookingOption === 'pay_now' ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-500")}>
                        <Zap size={14} fill="currentColor" />
                     </div>
                     <div>
                        <div className="text-sm font-bold text-slate-900">Pay Now</div>
                        <div className="text-[0.65rem] text-slate-400 font-medium">Confirm immediately</div>
                     </div>
                  </div>
                  <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center", bookingOption === 'pay_now' ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-200")}>
                     {bookingOption === 'pay_now' && <Check size={12} strokeWidth={3} />}
                  </div>
               </div>
               <p className="text-xs text-emerald-800 font-medium leading-relaxed mt-4">Complete payment on next step. Seat reserved instantly.</p>
            </div>

            <div 
               className={cn(
                  "p-5 rounded-xl border-2 cursor-pointer transition-all relative overflow-hidden",
                  bookingOption === 'hold' ? "border-amber-500 bg-amber-50/50" : "border-slate-100 bg-white hover:border-slate-200"
               )}
               onClick={() => setBookingOption('hold')}
            >
               <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-3">
                     <div className={cn("w-7 h-7 rounded-full flex items-center justify-center text-xs", bookingOption === 'hold' ? "bg-amber-100 text-amber-600" : "bg-slate-100 text-slate-500")}>
                        <Clock size={14} fill="currentColor"/>
                     </div>
                     <div>
                        <div className="text-sm font-bold text-slate-900">Hold Booking</div>
                        <div className="text-[0.65rem] text-slate-400 font-medium">Reserve without paying now</div>
                     </div>
                  </div>
                  <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center", bookingOption === 'hold' ? "border-amber-500 bg-amber-500 text-white" : "border-slate-200")}>
                     {bookingOption === 'hold' && <Check size={12} strokeWidth={3} />}
                  </div>
               </div>
               <p className="text-xs text-slate-600 font-medium leading-relaxed mt-4">Reserve this fare temporarily. Pay before hold expires.</p>
            </div>
         </div>
      </div>

      <div className="flex justify-between items-center mt-6">
         <button className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-2 px-4 py-2 hover:bg-slate-100 rounded-lg transition-colors" onClick={onBack}>
            <ChevronLeft size={16} /> Back to Ancillaries
         </button>
         <button className="flex items-center gap-2 px-10 py-4 bg-[#1e2d4f] text-white rounded-xl text-sm font-bold shadow-xl shadow-indigo-900/10 hover:bg-indigo-950 transition-all" onClick={handleContinue}>
            Continue to Review & Payment <ArrowRight size={18} />
         </button>
      </div>
    </div>
  );
};

const ReviewStep = ({ 
  onBack, 
  onComplete, 
  totalPrice,
  passengers,
  selectedSeats,
  meals,
  baggage,
  contactInfo,
  bookingOption
}: { 
  onBack: () => void; 
  onComplete: () => void; 
  totalPrice: number;
  passengers: any[];
  selectedSeats: any;
  meals: any;
  baggage: any;
  contactInfo: any;
  bookingOption: string;
}) => {
   return (
      <div className="booking-main">
         <div className="flex items-center justify-between mb-2">
            <div>
               <h1 className="text-2xl font-black text-[#1e2d4f] tracking-tighter">Review & Payment</h1>
               <p className="text-[0.75rem] text-slate-500 font-medium mt-1">Verify all details before completing your booking</p>
            </div>
            <button className="flex items-center gap-1.5 text-indigo-600 text-xs font-bold hover:underline" onClick={onBack}>
               <ChevronLeft size={16} /> Back to Contact
            </button>
         </div>

         {/* Flight Details */}
         <div className="card bg-white border border-slate-100 shadow-sm mb-4 overflow-hidden rounded-2xl">
            <div className="bg-slate-50 p-4 border-b border-slate-100 flex justify-between items-center">
               <div className="flex items-center gap-2 text-[#1e2d4f] font-black text-sm">
                  <Plane size={16} className="rotate-45" /> Flight Details
               </div>
               <div className="text-[0.65rem] text-slate-500 font-medium">Booking Reference: <span className="font-bold text-slate-900">TRV-2024-UA2045</span></div>
            </div>
            <div className="p-6">
               {/* Outbound date header */}
               <div className="flex items-center gap-3 mb-6">
                  <span className="bg-slate-100 text-[#1e2d4f] px-3 py-1 rounded-full text-[0.65rem] font-bold uppercase tracking-widest">Outbound</span>
                  <span className="text-sm font-black text-slate-900">Dec 28, 2024</span>
               </div>
               
               <div className="flex items-start gap-4 mb-6">
                  <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                     <Plane size={20} className="rotate-45" />
                  </div>
                  <div className="flex-1">
                     <div className="flex items-center gap-3 mb-4">
                        <span className="font-black text-slate-900 text-sm">United Airlines</span>
                        <span className="text-slate-500 text-xs font-medium">UA 2045</span>
                        <span className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded text-[0.65rem] font-bold uppercase tracking-tighter">Non-stop</span>
                     </div>

                     <div className="flex items-center justify-between">
                        <div>
                           <div className="text-[0.65rem] text-slate-400 font-bold uppercase tracking-widest mb-1">Departure</div>
                           <div className="text-2xl font-black text-slate-900 leading-none mb-1">08:30</div>
                           <div className="text-xs font-bold text-slate-900">JFK - New York</div>
                           <div className="text-[0.65rem] text-slate-400">John F. Kennedy Intl<br/>Terminal 7</div>
                        </div>

                        <div className="flex-1 px-8 flex flex-col items-center">
                           <div className="text-[0.65rem] text-slate-400 font-medium mb-2">Duration</div>
                           <div className="w-full flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-[#1e2d4f]"></div>
                              <div className="flex-1 border-t-2 border-slate-200 relative">
                                 <Plane size={14} className="absolute top-[1px] left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#1e2d4f] rotate-90" fill="currentColor"/>
                              </div>
                              <div className="w-1.5 h-1.5 rounded-full bg-[#1e2d4f]"></div>
                           </div>
                           <div className="text-[0.75rem] font-bold text-slate-900 mt-2">5h 15m</div>
                        </div>

                        <div className="text-right">
                           <div className="text-[0.65rem] text-slate-400 font-bold uppercase tracking-widest mb-1">Arrival</div>
                           <div className="text-2xl font-black text-slate-900 leading-none mb-1">11:45</div>
                           <div className="text-xs font-bold text-slate-900">LAX - Los Angeles</div>
                           <div className="text-[0.65rem] text-slate-400">Los Angeles Intl<br/>Terminal 7</div>
                        </div>
                     </div>
                  </div>
               </div>

               <div className="flex items-center gap-6 pt-4 border-t border-slate-100 text-[0.75rem]">
                  <div className="flex items-center gap-1.5"><User size={14} className="text-slate-400"/> <span className="text-slate-500">Cabin:</span> <span className="font-bold text-slate-900">Economy</span></div>
                  <div className="flex items-center gap-1.5"><Plane size={14} className="text-slate-400"/> <span className="text-slate-500">Aircraft:</span> <span className="font-bold text-slate-900">Boeing 737-800</span></div>
                  <div className="flex items-center gap-1.5"><Briefcase size={14} className="text-slate-400"/> <span className="text-slate-500">Baggage:</span> <span className="font-bold text-slate-900">1 x 23kg</span></div>
               </div>
            </div>
         </div>

         {/* Passenger Details */}
         <div className="card bg-white border border-slate-100 shadow-sm mb-4 overflow-hidden rounded-2xl">
            <div className="bg-slate-50 p-4 border-b border-slate-100 flex justify-between items-center">
               <div className="flex items-center gap-2 text-teal-600 font-black text-sm">
                  <Users size={16} /> Passenger Details
               </div>
               <div className="text-[0.65rem] text-slate-500 font-medium">3 Passengers</div>
            </div>
            <div className="p-6 space-y-4">
               {passengers.map((passenger, idx) => (
                  <div key={idx} className={cn("border rounded-xl p-5 relative overflow-hidden", idx === 0 ? "border-emerald-100 bg-[#f4fbf7]" : "border-slate-100 bg-white")}>
                     <div className="flex items-center gap-3 mb-4">
                        <div className={cn("w-8 h-8 rounded-full border flex items-center justify-center text-sm font-black shadow-sm", idx === 0 ? "bg-white border-emerald-100 text-slate-600" : "bg-slate-50 border-slate-100 text-slate-600")}>{idx + 1}</div>
                        <div>
                           <div className="text-sm font-black text-[#1e2d4f]">{idx === 0 ? 'Mr. John Michael Doe' : idx === 1 ? 'Mrs. Jane Elizabeth Doe' : 'Master Tommy Doe'}</div>
                           <div className="text-[0.65rem] text-slate-500 font-medium">{passenger.type}</div>
                        </div>
                        {idx === 0 && <span className="ml-auto bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-[0.6rem] font-bold uppercase tracking-widest">Lead Passenger</span>}
                     </div>
                     <div className="grid grid-cols-3 gap-y-4 text-xs">
                        <div><div className="text-slate-400 mb-1 font-medium text-[0.65rem]">Date of Birth</div><div className="font-bold text-[#1e2d4f]">{idx === 0 ? 'Jan 15, 1985' : idx === 1 ? 'Mar 22, 1987' : 'Aug 10, 2019'}</div></div>
                        <div><div className="text-slate-400 mb-1 font-medium text-[0.65rem]">Nationality</div><div className="font-bold text-[#1e2d4f]">United States</div></div>
                        <div><div className="text-slate-400 mb-1 font-medium text-[0.65rem]">Document</div><div className="font-bold text-[#1e2d4f]">{idx === 0 ? 'P••••••5678' : idx === 1 ? 'P••••••8901' : 'P••••••2345'}</div></div>
                        <div><div className="text-slate-400 mb-1 font-medium text-[0.65rem]">Seat</div><div className="font-bold text-[#1e2d4f]">{selectedSeats[idx] || "Not selected"}</div></div>
                        <div><div className="text-slate-400 mb-1 font-medium text-[0.65rem]">Meal</div><div className="font-bold text-[#1e2d4f]">{meals[idx] || "No preference"}</div></div>
                        <div><div className="text-slate-400 mb-1 font-medium text-[0.65rem]">Baggage</div><div className="font-bold text-[#1e2d4f]">{baggage[idx] !== undefined && baggage[idx] !== '' ? 'Added (+)' : '1 x 23kg (Included)'}</div></div>
                     </div>
                  </div>
               ))}
            </div>
         </div>

         {/* Contact Information */}
         <div className="card bg-white border border-slate-100 shadow-sm mb-4 overflow-hidden rounded-2xl">
            <div className="bg-slate-50 p-4 border-b border-slate-100 flex items-center gap-2 text-blue-600 font-black text-sm">
               <Mail size={16} fill="currentColor"/> Contact Information
            </div>
            <div className="p-6">
               <div className="grid grid-cols-2 gap-6 mb-6">
                  <div><div className="text-[0.65rem] text-slate-400 mb-1 font-medium">Primary Email</div><div className="text-sm font-black text-[#1e2d4f]">{contactInfo.primaryEmail || 'No email provided'}</div></div>
                  <div><div className="text-[0.65rem] text-slate-400 mb-1 font-medium">Primary Phone</div><div className="text-sm font-black text-[#1e2d4f]">{contactInfo.primaryPhone || 'No phone provided'}</div></div>
                  <div><div className="text-[0.65rem] text-slate-400 mb-1 font-medium">Alternate Phone</div><div className="text-sm font-black text-[#1e2d4f]">{contactInfo.altPhone || 'N/A'}</div></div>
                  <div><div className="text-[0.65rem] text-slate-400 mb-1 font-medium">Preferred Contact Method</div><div className="text-sm font-black text-[#1e2d4f]">{contactInfo.preferredMethod}</div></div>
               </div>
               {contactInfo.additionalEmails && (
                  <div>
                     <div className="text-[0.65rem] text-slate-400 mb-2 font-medium">Additional Recipients</div>
                     <div className="flex gap-2 flex-wrap">
                        {contactInfo.additionalEmails.split(',').map((email: string, i: number) => email.trim() && (
                           <span key={i} className="bg-blue-50 text-blue-600 border border-blue-100 px-3 py-1 rounded-full text-[0.65rem] font-bold">{email.trim()}</span>
                        ))}
                     </div>
                  </div>
               )}
            </div>
         </div>

         {/* Payment Method */}
         <div className="card bg-white border border-slate-100 shadow-sm overflow-hidden mb-6 rounded-2xl">
            <div className="bg-slate-50 p-4 border-b border-slate-100 flex items-center gap-2 text-[#1e2d4f] font-black text-sm">
               <CreditCard size={16} fill="currentColor"/> Payment Method
            </div>
            <div className="p-6">
               <div className="flex border-b border-slate-100 mb-6 font-black text-xs text-slate-400 uppercase tracking-widest overflow-x-auto hide-scrollbar">
                  <div className="px-6 py-3 border-b-2 border-[#1e2d4f] text-[#1e2d4f] min-w-32 flex items-center justify-center gap-2 cursor-pointer shrink-0"><Wallet size={14} fill="currentColor"/> Wallet</div>
                  <div className="px-6 py-3 border-b-2 border-transparent hover:text-slate-900 min-w-32 flex items-center justify-center gap-2 cursor-pointer shrink-0"><CreditCard size={14}/> Card</div>
                  <div className="px-6 py-3 border-b-2 border-transparent hover:text-slate-900 min-w-32 flex items-center justify-center gap-2 cursor-pointer shrink-0"><Landmark size={14}/> Net Banking</div>
                  <div className="px-6 py-3 border-b-2 border-transparent hover:text-slate-900 min-w-32 flex items-center justify-center gap-2 cursor-pointer shrink-0"><CalendarClock size={14}/> Postpaid</div>
               </div>

               <div className="bg-[#2B4B8C] text-white rounded-2xl p-6 relative overflow-hidden">
                  <Wallet size={120} className="absolute right-[-20px] bottom-[-30px] opacity-[0.08]" fill="currentColor"/>
                  <div className="text-indigo-200 text-[0.65rem] font-bold uppercase tracking-widest mb-1">Available Balance</div>
                  <div className="text-4xl font-black mb-8">$5,240.00</div>
                  <div className="flex justify-between items-end relative z-10">
                     <div className="text-indigo-200 text-xs font-medium">Wallet ID: WLT-ABC-2024</div>
                     <button className="bg-white text-[#2B4B8C] px-4 py-2 rounded-lg text-xs font-black shadow-sm flex items-center gap-1 hover:bg-slate-50 transition-colors">
                        <Plus size={14} strokeWidth={3}/> Recharge
                     </button>
                  </div>
               </div>
            </div>
         </div>

         <div className="flex justify-between items-center mt-6">
            <button className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-2 px-4 py-2 hover:bg-slate-100 rounded-lg transition-colors" onClick={onBack}>
               <ChevronLeft size={16} /> Back to Contact
            </button>
            <button className="flex items-center gap-2 px-10 py-4 bg-[#1e2d4f] text-white rounded-xl text-sm font-black shadow-xl shadow-indigo-900/10 hover:bg-indigo-950 transition-all uppercase tracking-widest" onClick={onComplete}>
               {bookingOption === 'hold' ? `Place on Hold $${totalPrice.toFixed(2)}` : `Confirm & Pay $${totalPrice.toFixed(2)}`} <ArrowRight size={18} />
            </button>
         </div>
      </div>
   );
};

const StepIndicator = ({ currentStep }: { currentStep: number }) => {
  const steps = [
    { id: 1, label: "Passengers" },
    { id: 2, label: "Ancillaries" },
    { id: 3, label: "Contact" },
    { id: 4, label: "Review & Pay" },
  ];

  return (
    <div className="step-indicator">
      {steps.map((step, idx) => (
        <React.Fragment key={step.id}>
          <div className={cn("step", currentStep === step.id && "active", currentStep > step.id && "completed")}>
            <div className="step-number">
              {currentStep > step.id ? <Check size={14} /> : step.id}
            </div>
            <span>{step.label}</span>
          </div>
          {idx < steps.length - 1 && <div className="step-line" />}
        </React.Fragment>
      ))}
    </div>
  );
};

const PassengerForm = ({ 
  index, 
  type, 
  expanded, 
  onToggle, 
  onComplete,
  completed,
  details,
  onChange
}: { 
  index: number; 
  type: string; 
  expanded: boolean;
  onToggle: () => void;
  onComplete: () => void;
  completed: boolean;
  details?: any;
  onChange?: (field: string, value: any) => void;
}) => {
  const [expiryError, setExpiryError] = useState("");
  const [expiryWarning, setExpiryWarning] = useState("");

  const handleDateValidation = (d?: string, m?: string, y?: string) => {
    if (!d || !m || !y) return;
    
    const selectedDate = new Date(`${y}-${m}-${d}`);
    const now = new Date();
    const diffTime = selectedDate.getTime() - now.getTime();
    const diffDays = diffTime / (1000 * 3600 * 24);

    if (diffDays < 7) {
      setExpiryError("Booking disabled: Passport expires in less than 1 week.");
      setExpiryWarning("");
    } else if (diffDays < 90) {
      setExpiryWarning("Warning: Passport expires in less than 3 months.");
      setExpiryError("");
    } else {
      setExpiryError("");
      setExpiryWarning("");
    }
  };

  return (
    <div className={cn("passenger-section", completed && "border-emerald-200")}>
      <div className={cn("passenger-header", completed && "bg-emerald-50")} onClick={onToggle}>
        <div className="flex items-center gap-4">
          <div className={cn("w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs", completed ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500")}>
            {completed ? <Check size={16} /> : index + 1}
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900">
              Passenger {index + 1} - {type}
              {completed && <span className="ml-2 text-emerald-600 inline-flex items-center gap-1 font-bold"><Check size={12}/> Completed</span>}
            </div>
            {!completed && <div className="text-[0.7rem] text-slate-400 font-medium">Enter passenger details</div>}
            {completed && <div className="text-[0.7rem] text-slate-500 font-medium">{details?.title || 'Mr.'} {details?.firstName || 'John'} {details?.lastName || 'Doe'}</div>}
          </div>
        </div>
        <ChevronDown size={18} className={cn("text-slate-400 transition-transform", expanded && "rotate-180")} />
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }} 
            animate={{ height: "auto", opacity: 1 }} 
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden bg-slate-50/50"
          >
            <div className="p-6 pt-0">
               {/* Search Existing Traveler */}
               <div className="mb-6">
                 <div className="flex items-center gap-2 mb-3">
                   <Search size={14} className="text-indigo-600" />
                   <span className="text-[0.7rem] font-black text-slate-900 uppercase tracking-widest">Search Existing Traveler</span>
                 </div>
                 <div className="flex gap-2">
                   <input 
                     type="text" 
                     placeholder="Type name, email, or passport number..." 
                     className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-indigo-400"
                   />
                   <button className="px-4 py-2 bg-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-300">Clear</button>
                 </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                 <div className="form-group">
                   <label className="form-label">Title *</label>
                   <select className="form-input" value={details?.title || ''} onChange={(e) => onChange?.('title', e.target.value)}>
                     <option value="">Select title</option>
                     <option value="Mr.">Mr.</option>
                     <option value="Ms.">Ms.</option>
                     <option value="Mrs.">Mrs.</option>
                   </select>
                 </div>
                 <div className="form-group">
                   <label className="form-label">First Name *</label>
                   <input type="text" className="form-input" placeholder="Enter first name" value={details?.firstName || ''} onChange={(e) => onChange?.('firstName', e.target.value)} />
                 </div>
                 <div className="form-group">
                   <label className="form-label">Middle Name</label>
                   <input type="text" className="form-input" placeholder="Enter middle name" value={details?.middleName || ''} onChange={(e) => onChange?.('middleName', e.target.value)} />
                 </div>
                 <div className="form-group">
                   <label className="form-label">Last Name *</label>
                   <input type="text" className="form-input" placeholder="Enter last name" value={details?.lastName || ''} onChange={(e) => onChange?.('lastName', e.target.value)} />
                 </div>
                 <div className="form-group md:col-span-1">
                    <label className="form-label">Date of Birth *</label>
                    <div className="grid grid-cols-3 gap-2">
                      <select className="form-input px-2" value={details?.dobDay || ''} onChange={(e) => onChange?.('dobDay', e.target.value)}>
                        <option value="">DD</option>
                        {Array.from({length: 31}, (_, i) => i + 1).map(d => <option key={d} value={d < 10 ? `0${d}` : d}>{d}</option>)}
                      </select>
                      <select className="form-input px-2" value={details?.dobMonth || ''} onChange={(e) => onChange?.('dobMonth', e.target.value)}>
                        <option value="">MM</option>
                        {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map((m, i) => <option key={m} value={(i+1) < 10 ? `0${i+1}` : i+1}>{m}</option>)}
                      </select>
                      <select className="form-input px-2" value={details?.dobYear || ''} onChange={(e) => onChange?.('dobYear', e.target.value)}>
                        <option value="">YYYY</option>
                        {Array.from({length: 100}, (_, i) => new Date().getFullYear() - i).map(y => <option key={y} value={y}>{y}</option>)}
                      </select>
                    </div>
                  </div>
                 <div className="form-group">
                   <label className="form-label">Gender *</label>
                   <div className="flex items-center gap-4 py-2">
                     <label className="flex items-center gap-2 text-sm text-slate-600"><input type="radio" name={`gender-${index}`} /> Male</label>
                     <label className="flex items-center gap-2 text-sm text-slate-600"><input type="radio" name={`gender-${index}`} /> Female</label>
                     <label className="flex items-center gap-2 text-sm text-slate-600"><input type="radio" name={`gender-${index}`} /> Other</label>
                   </div>
                 </div>
                 <div className="form-group">
                   <label className="form-label">Nationality *</label>
                   <select className="form-input">
                     <option>Select country</option>
                     <option>United States</option>
                     <option>United Kingdom</option>
                     <option>India</option>
                   </select>
                 </div>
                 <div className="form-group">
                   <label className="form-label">Passport Number *</label>
                   <input type="text" className="form-input" placeholder="e.g. A12345678" />
                 </div>
                 <div className="form-group md:col-span-1">
                    <label className="form-label">Passport Expiry *</label>
                    <div className="grid grid-cols-3 gap-2">
                      <select className="form-input px-2" value={details?.expiryDay || ''} onChange={(e) => { onChange?.('expiryDay', e.target.value); handleDateValidation(e.target.value, details?.expiryMonth, details?.expiryYear); }}>
                        <option value="">DD</option>
                        {Array.from({length: 31}, (_, i) => i + 1).map(d => <option key={d} value={d < 10 ? `0${d}` : d}>{d}</option>)}
                      </select>
                      <select className="form-input px-2" value={details?.expiryMonth || ''} onChange={(e) => { onChange?.('expiryMonth', e.target.value); handleDateValidation(details?.expiryDay, e.target.value, details?.expiryYear); }}>
                        <option value="">MM</option>
                        {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map((m, i) => <option key={m} value={(i+1) < 10 ? `0${i+1}` : i+1}>{m}</option>)}
                      </select>
                      <select className="form-input px-2" value={details?.expiryYear || ''} onChange={(e) => { onChange?.('expiryYear', e.target.value); handleDateValidation(details?.expiryDay, details?.expiryMonth, e.target.value); }}>
                        <option value="">YYYY</option>
                        {Array.from({length: 15}, (_, i) => new Date().getFullYear() + i).map(y => <option key={y} value={y}>{y}</option>)}
                      </select>
                    </div>
                    {expiryError && <p className="text-[0.6rem] text-red-500 font-bold mt-1 pr-2 uppercase leading-relaxed">{expiryError}</p>}
                    {expiryWarning && <p className="text-[0.6rem] text-amber-500 font-black mt-1 uppercase leading-relaxed">{expiryWarning}</p>}
                  </div>
               </div>
               
               <div className="flex justify-between items-center pt-6 border-t border-slate-100">
                 <label className="flex items-center gap-2 text-xs font-medium text-slate-500 cursor-pointer">
                   <input type="checkbox" className="rounded" /> Save to Passenger Database (persist after booking)
                 </label>
                 <button 
                   className="px-6 py-2 bg-indigo-900 text-white rounded-xl text-xs font-black shadow-lg shadow-indigo-900/10 hover:bg-indigo-950 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                   onClick={(e) => { e.stopPropagation(); onComplete(); }}
                   disabled={!!expiryError}
                 >
                   Save Passenger Details
                 </button>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

function BookingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const adults = parseInt(searchParams.get("adults") || "1");
  const children = parseInt(searchParams.get("children") || "0");
  const infants = parseInt(searchParams.get("infants") || "0");
  const offerId = searchParams.get("offerId");

  const [step, setStep] = useState(1);
  const [expandedIndex, setExpandedIndex] = useState(0);
  const [completedPassengers, setCompletedPassengers] = useState<number[]>([]);
  const [holdBooking, setHoldBooking] = useState(false);
  
  // Ancillaries State
  const [passengerDetails, setPassengerDetails] = useState<Record<number, any>>({});
  const [selectedSeats, setSelectedSeats] = useState<Record<number, string>>({});
  const [baggage, setBaggage] = useState<Record<number, string>>({});
  const [meals, setMeals] = useState<Record<number, string>>({});
  const [passengerAddons, setPassengerAddons] = useState<Record<number, any>>({});

  const totalPassengers = adults + children + infants;
  const passengers: Passenger[] = [];
  for (let i = 0; i < adults; i++) passengers.push({ type: "Adult", baseFare: 600 });
  for (let i = 0; i < children; i++) passengers.push({ type: "Child (Age 5)", baseFare: 540 });
  for (let i = 0; i < infants; i++) passengers.push({ type: "Infant", baseFare: 0 });

  const taxes = 285; // Fixed per booking or per person? Let's assume total fixed for now as per screenshot
  const baseTotal = passengers.reduce((sum, p) => sum + p.baseFare, 0);
  const subtotal = baseTotal + taxes;

  // Mock Amadeus Flight Offer Data
  const [flightOffer, setFlightOffer] = useState<any>({
    airline: "United Airlines",
    itineraries: [
      {
        duration: "PT5H15M",
        segments: [
          {
            carrierCode: "UA",
            number: "2045",
            departure: { iataCode: "JFK", at: "2024-12-28T08:30:00" },
            arrival: { iataCode: "LAX", at: "2024-12-28T11:45:00" },
            aircraft: { code: "738" },
            cabin: "ECONOMY"
          }
        ]
      }
    ],
    seats: {
      standard: { price: 0, type: "Free" },
      preferred: { price: 15, type: "Paid" },
      exitRow: { price: 35, type: "Paid" },
      extraLegroom: { price: 45, type: "Paid" },
    },
    baggageAllowance: {
      included: "1x 23kg",
      extraOptionsAvailable: true,
      extraOptions: [
        { quantity: "1x 23kg", price: 45 },
        { quantity: "2x 23kg", price: 85 }
      ]
    }
  });

  const [contactInfo, setContactInfo] = useState({
    primaryEmail: '',
    primaryPhone: '',
    altPhone: '',
    preferredMethod: 'Email',
    additionalEmails: ''
  });

  const [bookingOption, setBookingOption] = useState("pay_now");
  const [bookingStatus, setBookingStatus] = useState<'draft' | 'processing' | 'confirmed' | 'hold' | 'details'>('draft');
  
  // Ancillary costs
  const ancillaryCosts = {
    priorityBoarding: Object.values(passengerAddons).filter((a: any) => a.priorityBoarding).length * 12,
    loungeAccess: Object.values(passengerAddons).filter((a: any) => a.loungeAccess).length * 35,
    insurance: Object.values(passengerAddons).filter((a: any) => a.insurance).length * 25,
    seats: Object.values(selectedSeats).reduce((sum, seat) => sum + (seat.includes('A') || seat.includes('F') ? 25 : seat.includes('C') || seat.includes('D') ? 15 : 0), 0),
    baggage: Object.values(baggage).reduce((sum, priceStr) => sum + (parseFloat(priceStr) || 0), 0)
  };
  
  const ancillariesSubtotal = ancillaryCosts.priorityBoarding + ancillaryCosts.loungeAccess + ancillaryCosts.seats + ancillaryCosts.baggage + ancillaryCosts.insurance;
                             
  const totalPrice = subtotal + ancillariesSubtotal;
  const commission = totalPrice * 0.07;

  const handleComplete = (index: number) => {
    if (!completedPassengers.includes(index)) {
      setCompletedPassengers([...completedPassengers, index]);
    }
    if (index < totalPassengers - 1) {
      setExpandedIndex(index + 1);
    } else {
      setExpandedIndex(-1);
    }
  };

  return (
    <div className="booking-container bg-slate-50/50">
      <header className="booking-header">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#1e2d4f] rounded-lg flex items-center justify-center text-white font-black text-lg">T</div>
          <div className="font-bold text-[#1e2d4f] tracking-tight text-lg uppercase">Traventions</div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <div className="text-[0.7rem] font-black text-slate-800">Sarah Mitchell</div>
            <div className="text-[0.6rem] text-slate-400 font-bold uppercase tracking-widest">Booking Agent</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold border-2 border-white shadow-sm overflow-hidden">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah" alt="Agent" />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-4">
          <Link href="/flights" className="flex items-center gap-1 text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors">
            <ChevronLeft size={14} /> Back to Search Results
          </Link>
        </div>

        {bookingStatus === 'draft' && <StepIndicator currentStep={step} />}

        {bookingStatus === 'processing' ? (
          <ProcessingScreen onFinish={() => setBookingStatus('confirmed')} />
        ) : bookingStatus === 'confirmed' ? (
          <ConfirmationScreen contactInfo={contactInfo} passengers={passengers} passengerDetails={passengerDetails} flightOffer={flightOffer} totalPrice={totalPrice} onViewDetails={() => setBookingStatus('details')} />
        ) : bookingStatus === 'hold' ? (
          <HoldScreen contactInfo={contactInfo} passengers={passengers} passengerDetails={passengerDetails} flightOffer={flightOffer} totalPrice={totalPrice} onCompletePayment={() => setBookingStatus('details')} />
        ) : bookingStatus === 'details' ? (
          <BookingDetailsScreen contactInfo={contactInfo} passengers={passengers} passengerDetails={passengerDetails} flightOffer={flightOffer} totalPrice={totalPrice} onCompletePayment={() => setBookingStatus('processing')} selectedSeats={selectedSeats} baggage={baggage} meals={meals} passengerAddons={passengerAddons} ancillariesCost={ancillariesSubtotal} commission={commission} />
        ) : (
          <div className="booking-layout">
            {step === 1 ? (
          <div className="booking-main">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h1 className="text-2xl font-black text-[#1e2d4f] tracking-tighter">Passenger Details</h1>
                <p className="text-[0.75rem] text-slate-500 font-medium mt-1">Enter traveler information for all passengers</p>
              </div>
              <button className="flex items-center gap-1.5 text-indigo-600 text-xs font-bold hover:underline">
                <ChevronLeft size={16} /> Back to Results
              </button>
            </div>

            {/* Hold Booking Card */}
            <div className="card bg-white p-6 border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center">
                    <Clock size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Hold This Booking</h3>
                    <p className="text-[0.7rem] text-slate-400 font-medium">Reserve this fare without immediate payment. TTL countdown starts when enabled.</p>
                  </div>
                </div>
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    className="toggle-input" 
                    checked={holdBooking} 
                    onChange={() => setHoldBooking(!holdBooking)} 
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>

            {/* Passenger Forms */}
            <div className="card bg-white overflow-hidden border border-slate-100 shadow-sm">
              <div className="p-1">
                {passengers.map((p, i) => (
                  <PassengerForm 
                    key={i} 
                    index={i} 
                    type={p.type} 
                    expanded={expandedIndex === i} 
                    onToggle={() => setExpandedIndex(expandedIndex === i ? -1 : i)}
                    onComplete={() => handleComplete(i)}
                    completed={completedPassengers.includes(i)}
                    details={passengerDetails[i]}
                    onChange={(field, value) => setPassengerDetails({...passengerDetails, [i]: {...(passengerDetails[i] || {}), [field]: value}})}
                  />
                ))}
              </div>
            </div>

            {/* Quick Tip */}
            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 flex gap-4">
               <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center shrink-0">
                  <Info size={16} />
               </div>
               <div>
                  <h4 className="text-xs font-black text-indigo-900 uppercase tracking-widest mb-1">Quick Tip</h4>
                  <p className="text-[0.7rem] text-indigo-700/80 leading-relaxed font-medium">Use the typeahead search to quickly fill passenger details from your database. Enable "Hold Booking" to reserve without immediate payment.</p>
               </div>
            </div>

            <div className="flex justify-between items-center mt-6">
               <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-xl text-slate-600 text-xs font-bold hover:bg-slate-50 shadow-sm">
                  <History size={16} /> Save & Continue Later
               </button>
               <button 
                 className="flex items-center gap-2 px-10 py-4 bg-[#1e2d4f] text-white rounded-xl text-sm font-black shadow-xl shadow-indigo-900/10 hover:bg-indigo-950 transition-all uppercase tracking-widest disabled:opacity-50"
                 disabled={completedPassengers.length < totalPassengers}
                 onClick={() => setStep(2)}
               >
                  Continue to Ancillaries <ArrowRight size={18} />
               </button>
            </div>
          </div>
          ) : step === 2 ? (
            <AncillariesStep 
              passengers={passengers} 
              passengerDetails={passengerDetails}
              selectedSeats={selectedSeats}
              setSelectedSeats={setSelectedSeats}
              baggage={baggage}
              setBaggage={setBaggage}
              meals={meals}
              setMeals={setMeals}
              passengerAddons={passengerAddons}
              setPassengerAddons={setPassengerAddons}
              flightOffer={flightOffer}
              onBack={() => setStep(1)}
              onContinue={() => setStep(3)}
            />
          ) : step === 3 ? (
            <ContactStep 
               contactInfo={contactInfo}
               setContactInfo={setContactInfo}
               bookingOption={bookingOption}
               setBookingOption={setBookingOption}
               onBack={() => setStep(2)}
               onContinue={() => setStep(4)}
            />
          ) : step === 4 ? (
            <ReviewStep 
               onBack={() => setStep(3)}
               onComplete={() => {
                 if (bookingOption === 'hold') {
                   setBookingStatus('hold');
                 } else {
                   setBookingStatus('processing');
                 }
               }}
               totalPrice={totalPrice}
               passengers={passengers}
               selectedSeats={selectedSeats}
               meals={meals}
               baggage={baggage}
               contactInfo={contactInfo}
               bookingOption={bookingOption}
            />
          ) : (
            <div className="booking-main flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-slate-200 text-slate-400">
               <ShieldCheck size={48} className="mb-4 opacity-20" />
               <p className="font-bold">Next steps coming soon...</p>
               <button className="mt-4 text-indigo-600 font-bold" onClick={() => setStep(3)}>Go Back</button>
            </div>
          )}

          <aside className="fare-summary">
            <div className="summary-card">
              <div className="flex items-center gap-2 mb-6">
                <History size={18} className="text-[#1e2d4f]" />
                <h3 className="text-lg font-black text-[#1e2d4f] tracking-tighter">Price Breakdown</h3>
              </div>

              {flightOffer.itineraries.map((itinerary: any, iIdx: number) => (
                <div key={iIdx} className={cn(iIdx > 0 && "mt-6 pt-6 border-t border-slate-100")}>
                  <div className="flight-mini-card">
                    <div className="airline-logo">
                       <div className="w-8 h-8 bg-indigo-900 rounded-lg flex items-center justify-center text-white text-[0.6rem] font-bold">
                          {itinerary.segments[0].carrierCode}
                       </div>
                    </div>
                    <div>
                      <div className="text-sm font-black text-slate-900">{itinerary.segments[0].carrierCode} {itinerary.segments[0].number}</div>
                      <div className="text-[0.6rem] text-slate-400 font-bold uppercase tracking-widest">{itinerary.segments[0].aircraft?.code || 'Airbus'} • {itinerary.segments[0].cabin || 'Economy'}</div>
                    </div>
                  </div>

                  <div className="flex justify-between items-start mb-6">
                     <div>
                        <div className="text-lg font-black text-slate-900">{itinerary.segments[0].departure.iataCode} → {itinerary.segments[itinerary.segments.length-1].arrival.iataCode}</div>
                        <div className="text-[0.6rem] font-bold text-slate-400 uppercase tracking-widest mt-1">Leg {iIdx + 1}</div>
                     </div>
                     <div className="text-right">
                        <span className="text-[0.6rem] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full uppercase tracking-tighter">
                          {itinerary.segments.length > 1 ? `${itinerary.segments.length - 1} Stop` : "Non-stop"}
                        </span>
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-2">
                     <div>
                        <div className="text-[0.6rem] font-bold text-slate-400 uppercase tracking-widest mb-1">Departure</div>
                        <div className="text-[0.8rem] font-black text-slate-900">
                          {new Date(itinerary.segments[0].departure.at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </div>
                     </div>
                     <div className="text-right">
                        <div className="text-[0.6rem] font-bold text-slate-400 uppercase tracking-widest mb-1">Arrival</div>
                        <div className="text-[0.8rem] font-black text-slate-900">
                          {new Date(itinerary.segments[itinerary.segments.length-1].arrival.at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </div>
                     </div>
                  </div>
                </div>
              ))}

              <div className="grid grid-cols-1 gap-2 mb-8 bg-slate-50 p-4 rounded-xl">
                 <div className="flex justify-between text-[0.7rem] font-bold">
                    <span className="text-slate-400 uppercase">Fare Type</span>
                    <span className="text-indigo-600 uppercase">Commissionable</span>
                 </div>
                 <div className="flex justify-between text-[0.7rem] font-bold">
                    <span className="text-slate-400 uppercase">Refundable</span>
                    <span className="text-slate-900 flex items-center gap-1 uppercase"><Check size={12} className="text-emerald-500" /> Yes</span>
                 </div>
              </div>

              <div className="space-y-3 mb-8">
                 <h4 className="text-[0.65rem] font-black text-slate-400 uppercase tracking-widest mb-2">Price Breakdown</h4>
                 <div className="flex justify-between text-sm font-bold">
                    <span className="text-slate-600">Adult x {adults}</span>
                    <span className="text-slate-900">${(adults * 600).toFixed(2)}</span>
                 </div>
                 {children > 0 && (
                   <div className="flex justify-between text-sm font-bold">
                      <span className="text-slate-600">Child x {children}</span>
                      <span className="text-slate-900">${(children * 540).toFixed(2)}</span>
                   </div>
                 )}
                 <div className="flex justify-between text-sm font-bold pb-4 border-b border-slate-50">
                    <span className="text-slate-600">Taxes & Fees</span>
                    <span className="text-slate-900">${taxes.toFixed(2)}</span>
                 </div>
              </div>

              {step >= 2 && (
                <div className="space-y-3 mb-8 pt-4 border-t border-slate-100">
                  <h4 className="text-[0.65rem] font-black text-slate-400 uppercase tracking-widest mb-2">Ancillaries</h4>
                  
                  {step === 2 && Object.keys(selectedSeats).length > 0 && Object.entries(selectedSeats).map(([idx, seat]) => (
                    <div key={idx} className="space-y-1">
                      <div className="text-[0.65rem] font-bold text-slate-400">Passenger {parseInt(idx) + 1} — {passengerDetails[parseInt(idx)]?.firstName ? `${passengerDetails[parseInt(idx)].title || ''} ${passengerDetails[parseInt(idx)].firstName} ${passengerDetails[parseInt(idx)].lastName}` : 'Traveler'}</div>
                      <div className="flex justify-between text-[0.75rem] font-bold">
                        <span className="text-slate-500">Seat {seat}</span>
                        <span className="text-slate-900">${(seat.includes('A') || seat.includes('F') ? 25 : seat.includes('C') || seat.includes('D') ? 15 : 0).toFixed(2)}</span>
                      </div>
                    </div>
                  ))}

                  {step === 4 ? (
                     <div className="space-y-2 mt-4 text-[0.7rem] font-medium text-slate-600">
                        <div className="flex justify-between">
                           <span>Seat Selection</span>
                           <span className="font-bold text-slate-900">${ancillaryCosts.seats.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                           <span>Extra Baggage</span>
                           <span className="font-bold text-slate-900">${ancillaryCosts.baggage.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                           <span>Travel Insurance</span>
                           <span className="font-bold text-slate-900">${(ancillaryCosts.insurance).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between pb-4 border-b border-slate-50">
                           <span>Premium Services</span>
                           <span className="font-bold text-slate-900">${(ancillaryCosts.priorityBoarding + ancillaryCosts.loungeAccess).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between pt-2">
                           <span>Processing Fee</span>
                           <span className="font-bold text-slate-900">$0.00</span>
                        </div>
                        <div className="text-[0.6rem] text-slate-400 mt-1">Varies by payment method</div>
                     </div>
                  ) : (step >= 3 || (step === 2 && Object.keys(selectedSeats).length === 0)) ? (
                     <>
                        <div className="flex justify-between text-[0.7rem] font-medium text-slate-600">
                           <span>Seats & Baggage</span>
                           <span className="font-bold text-slate-900">${(ancillaryCosts.seats + ancillaryCosts.baggage).toFixed(2) || '0.00'}</span>
                        </div>
                        <div className="flex justify-between text-[0.7rem] font-medium text-slate-600">
                           <span>Travel Insurance</span>
                           <span className="font-bold text-slate-900">${ancillaryCosts.insurance.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-[0.7rem] font-medium text-slate-600">
                           <span>Premium Services</span>
                           <span className="font-bold text-slate-900">${(ancillaryCosts.priorityBoarding + ancillaryCosts.loungeAccess).toFixed(2)}</span>
                        </div>
                     </>
                  ) : null}

                  {(step >= 2 && step <= 3) && (
                     <div className="flex justify-between text-sm font-bold pt-2 border-t border-slate-50 text-indigo-600 mt-2">
                        <span>{step >= 3 ? '' : 'Ancillaries '}Subtotal</span>
                        <span>${ancillariesSubtotal.toFixed(2)}</span>
                     </div>
                  )}
                </div>
              )}

              <div className="bg-slate-50 rounded-2xl p-4 mb-6 border border-slate-100">
                 <div className="flex justify-between items-center mb-1">
                    <span className="text-[0.65rem] font-black text-slate-400 uppercase tracking-widest">Your Commission</span>
                    <span className="text-lg font-black text-slate-900">${commission.toFixed(2)}</span>
                 </div>
                 <div className="text-[0.6rem] text-teal-600 font-bold uppercase tracking-widest italic">7% commission rate applied</div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-between items-end">
                 <div>
                    <div className="text-[0.6rem] font-black text-slate-400 uppercase tracking-widest mb-1">Total Price</div>
                    <div className="text-3xl font-black text-[#1e2d4f] tracking-tighter leading-none">${totalPrice.toFixed(2)}</div>
                 </div>
                 <button className="flex items-center gap-1.5 text-indigo-600 text-xs font-black uppercase tracking-widest hover:underline">
                    <History size={14} /> Change Fare
                 </button>
              </div>
            </div>

            {step >= 3 ? (
               <div className="w-full py-3.5 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-3 text-emerald-700 font-bold text-sm shadow-sm px-6">
                 <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                    <Check size={12} strokeWidth={3} />
                 </div>
                 Ready to proceed
               </div>
            ) : (
               <button className="w-full py-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-center gap-2 text-[#1e2d4f] font-black text-sm shadow-sm hover:bg-slate-50 transition-all uppercase tracking-widest">
                  <MessageSquare size={18} /> Support Chat
               </button>
            )}
          </aside>
        </div>
        )}
      </main>
      
      <footer className="max-w-7xl mx-auto px-6 py-10 border-t border-slate-100 mt-20 flex justify-between items-center">
         <div className="text-[0.7rem] font-bold text-slate-400 uppercase tracking-widest">© 2024 Traventions Inc. All rights reserved.</div>
         <div className="flex gap-8 text-[0.7rem] font-bold text-slate-400 uppercase tracking-widest">
            <Link href="#" className="hover:text-indigo-600">Privacy Policy</Link>
            <Link href="#" className="hover:text-indigo-600">Terms of Service</Link>
         </div>
      </footer>
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-indigo-900 font-black">Loading Booking Engine...</div>}>
      <BookingContent />
    </Suspense>
  );
}
