"use client";

import React from "react";
import { Check, User, Globe, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  { id: 'passengers', label: 'Passengers', icon: User },
  { id: 'ancillaries', label: 'Ancillaries', icon: Globe },
  { id: 'contact', label: 'Contact', icon: Globe },
  { id: 'review', label: 'Review', icon: CreditCard },
];

export default function BookingSteps({ currentStep }: { currentStep: string }) {
  const currentIndex = STEPS.findIndex(s => s.id === currentStep);

  return (
    <div className="flex items-center gap-1.5 mb-10 overflow-x-auto no-scrollbar pb-2">
      {STEPS.map((step, idx) => {
        const Icon = step.icon;
        const isCompleted = idx < currentIndex;
        const isActive = idx === currentIndex;

        return (
          <React.Fragment key={step.id}>
            <div className={cn(
              "flex items-center gap-2.5 px-4 py-2.5 rounded-2xl transition-all whitespace-nowrap",
              isActive ? "bg-indigo-900 text-white shadow-xl shadow-indigo-900/10 scale-105" : 
              isCompleted ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : 
              "bg-white border border-slate-100 text-slate-400"
            )}>
              <div className={cn(
                "w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black",
                isActive ? "bg-white/20" : isCompleted ? "bg-emerald-100" : "bg-slate-50"
              )}>
                {isCompleted ? <Check size={14} strokeWidth={3} /> : idx + 1}
              </div>
              <span className="text-[0.7rem] font-black uppercase tracking-widest">{step.label}</span>
            </div>
            {idx < STEPS.length - 1 && (
              <div className={cn(
                "w-4 h-px border-t-2 border-dashed",
                idx < currentIndex ? "border-emerald-200" : "border-slate-100"
              )} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
