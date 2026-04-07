"use client";

import React from "react";
import { 
  Tag, 
  Info, 
  ChevronRight, 
  ShieldCheck, 
  Zap, 
  Plane,
  Users,
  Briefcase,
  Globe
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PriceBreakdownProps {
  flightOffer: any;
  passengers: any[];
  selectedSeats: Record<number, string>;
  baggage: Record<number, string>;
  meals: Record<number, string>;
  passengerAddons: Record<number, any>;
  currency: string;
}

export default function PriceBreakdown({
  flightOffer,
  passengers,
  selectedSeats,
  baggage,
  meals,
  passengerAddons,
  currency
}: PriceBreakdownProps) {
  
  const basePrice = parseFloat(flightOffer.price.total);
  const taxes = basePrice * 0.12; // Simulated taxes
  
  // Ancillary calculations
  const seatTotal = Object.values(selectedSeats).length * 15; // Simulated $15 per seat
  const baggageTotal = Object.values(baggage).reduce((acc, val) => acc + (parseFloat(val) || 0), 0);
  const addonsTotal = Object.values(passengerAddons).reduce((acc: any, val: any) => {
     let sum = 0;
     if (val.insurance) sum += 25;
     if (val.priorityBoarding) sum += 12;
     if (val.loungeAccess) sum += 35;
     return acc + sum;
  }, 0);

  const grandTotal = basePrice + seatTotal + baggageTotal + addonsTotal;

  const Row = ({ label, value, isBold = false, icon: Icon }: any) => (
    <div className={cn("flex justify-between items-center text-[0.7rem] mb-2.5", isBold ? "font-black text-slate-900" : "font-medium text-slate-500")}>
      <div className="flex items-center gap-2">
         {Icon && <Icon size={12} className="text-slate-400" />}
         {label}
      </div>
      <span>{currency === 'USD' ? '$' : currency} {value.toFixed(2)}</span>
    </div>
  );

  return (
    <div className="sticky top-6">
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
        {/* Header */}
        <div className="bg-[#1e2d4f] p-6 text-white relative overflow-hidden">
          <Zap size={80} className="absolute -right-6 -bottom-6 opacity-10 rotate-12" />
          <div className="relative z-10">
            <div className="text-[0.6rem] font-bold uppercase tracking-widest text-indigo-200 mb-1">Booking Summary</div>
            <div className="text-2xl font-black tracking-tighter leading-none flex items-baseline gap-1.5">
               {currency === 'USD' ? '$' : currency} {grandTotal.toFixed(2)}
            </div>
            <div className="text-[0.6rem] font-bold text-indigo-300 mt-2 flex items-center gap-1.5 uppercase">
               <ShieldCheck size={12} /> Guaranteed GDS price
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-6">
             <div className="text-[0.65rem] font-black text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Plane size={14} className="text-indigo-600" /> Flight Fare
             </div>
             <Row label={`${passengers.length} Passenger(s)`} value={basePrice} />
             <Row label="Taxes & Surcharges" value={taxes} />
          </div>

          {(seatTotal > 0 || baggageTotal > 0 || Object.keys(meals).length > 0) && (
             <div className="mb-6 pt-6 border-t border-slate-50">
                <div className="text-[0.65rem] font-black text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                   <Tag size={14} className="text-amber-500" /> Ancillaries
                </div>
                {seatTotal > 0 && <Row label="Seat Selection" value={seatTotal} icon={Globe} />}
                {baggageTotal > 0 && <Row label="Extra Baggage" value={baggageTotal} icon={Briefcase} />}
                {addonsTotal > 0 && <Row label="Premium Add-ons" value={addonsTotal} icon={Zap} />}
             </div>
          )}

          {/* Promo Code Mockup */}
          <div className="bg-slate-50 rounded-2xl p-4 mb-6 border border-slate-100 group transition-all hover:border-indigo-200">
             <div className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-2">
                   <Tag size={14} className="text-indigo-600" />
                   <span className="text-[0.65rem] font-black text-slate-900 uppercase tracking-widest">Apply Promo Code</span>
                </div>
                <ChevronRight size={14} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
             </div>
          </div>

          <div className="pt-6 border-t-2 border-slate-100 border-dashed">
             <div className="flex justify-between items-center text-sm font-black text-slate-900 mb-1">
                <span className="uppercase tracking-widest text-[0.7rem]">Total Amount</span>
                <span>{currency === 'USD' ? '$' : currency} {grandTotal.toFixed(2)}</span>
             </div>
             <div className="text-[0.6rem] text-slate-400 font-medium text-right italic">Excluding local check-in fees if applicable</div>
          </div>
        </div>

        {/* Footer info */}
        <div className="bg-emerald-50/50 p-5 flex items-center gap-3">
           <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
              <ShieldCheck size={18} />
           </div>
           <div className="text-[0.65rem] text-emerald-800 font-medium leading-relaxed">
              Your booking is protected by **Traventions Shield**. Free cancellation within 24 hours on most routes.
           </div>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-3 px-2">
         <Info size={16} className="text-slate-300" />
         <p className="text-[0.65rem] text-slate-400 font-medium leading-relaxed">
            By continuing, you agree to the **Conditions of Carriage** and **Privacy Policy**.
         </p>
      </div>
    </div>
  );
}
