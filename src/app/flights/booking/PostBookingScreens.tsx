import React, { useState, useEffect } from 'react';
import { Plane, Check, Download, Mail, Eye, Calendar, Printer, Home, Car, Hotel, Copy, History, CreditCard, User, Briefcase, FileText } from 'lucide-react';
import { cn } from "@/lib/utils";

export const ProcessingScreen = ({ onFinish }: { onFinish: () => void }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  const steps = [
    { title: "Payment Initiated", desc: "Transaction started successfully" },
    { title: "Verifying Payment", desc: "Confirming with payment gateway" },
    { title: "Confirming with Airline", desc: "Creating PNR and seat assignments" },
    { title: "Generating Booking", desc: "Finalizing tickets and confirmation" }
  ];

  useEffect(() => {
    const timer = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const timing = [1500, 3000, 5000, 6500];
    timing.forEach((time, index) => {
      setTimeout(() => {
         setCurrentStep(index + 1);
         if (index === timing.length - 1) {
            setTimeout(onFinish, 1500);
         }
      }, time);
    });
  }, [onFinish]);

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center py-12">
      <div className="relative w-32 h-32 mb-8">
        <svg className="w-full h-full animate-spin text-indigo-600" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="#e2e8f0" strokeWidth="8" />
          <path d="M50 5 a45 45 0 0 1 45 45" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
           <Plane size={24} className="text-indigo-600 rotate-45 animate-pulse" />
        </div>
      </div>
      
      <h2 className="text-3xl font-black text-slate-900 mb-2">Processing Your Payment...</h2>
      <p className="text-slate-500 mb-12 font-medium">Please wait while we securely process your transaction</p>
      
      <div className="w-full max-w-lg bg-white border border-slate-100 rounded-2xl shadow-sm p-8">
        <div className="space-y-6">
          {steps.map((step, idx) => {
            const isCompleted = currentStep > idx;
            const isCurrent = currentStep === idx;
            return (
              <div key={idx} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all duration-500",
                    isCompleted ? "bg-emerald-50 text-emerald-500 border border-emerald-200" : 
                    isCurrent ? "bg-indigo-50 text-indigo-600 border border-indigo-200" : "bg-slate-50 text-slate-400 border border-slate-200"
                  )}>
                    {isCompleted ? <Check size={14} strokeWidth={3} /> : idx + 1}
                  </div>
                  {idx < steps.length - 1 && (
                    <div className={cn("w-0.5 h-full my-1", isCompleted ? "bg-emerald-200" : "bg-slate-100")} />
                  )}
                </div>
                <div className={cn("pb-6 transition-all duration-500", isCurrent || isCompleted ? "opacity-100" : "opacity-40")}>
                  <div className="text-sm font-bold text-slate-900">{step.title}</div>
                  <div className="text-[0.7rem] text-slate-500 font-medium mt-0.5">{step.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-12 text-sm text-slate-400 font-bold">Elapsed: <span className="text-slate-900">{elapsed}s</span></div>
    </div>
  );
};
