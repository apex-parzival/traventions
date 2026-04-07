"use client";

import React from "react";
import { useBookingStore } from "@/store/useBookingStore";
import { cn } from "@/lib/utils";
import { Globe, ChevronDown } from "lucide-react";

const CURRENCIES = ["USD", "EUR", "GBP", "AED", "INR"];

export default function CurrencySwitcher() {
  const { currency, setCurrency } = useBookingStore();
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-slate-700 font-bold text-xs hover:bg-slate-50 transition-all uppercase tracking-widest shadow-sm"
      >
        <Globe size={14} className="text-indigo-600" />
        <span>{currency}</span>
        <ChevronDown size={12} className={cn("transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full right-0 mt-2 w-32 bg-white border border-slate-100 shadow-2xl rounded-2xl p-2 z-30 overflow-hidden animate-in fade-in zoom-in duration-200">
            {CURRENCIES.map((c) => (
              <button
                key={c}
                onClick={() => {
                  setCurrency(c);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full text-left px-4 py-2 text-[0.7rem] font-bold rounded-lg transition-all uppercase tracking-widest",
                  currency === c ? "bg-indigo-50 text-indigo-700" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
