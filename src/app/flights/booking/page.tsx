"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
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
  Menu, 
  Globe, 
  Tag, 
  Briefcase, 
  Mail, 
  Bell, 
  Users, 
  Zap, 
  CreditCard 
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useBookingStore } from "@/store/useBookingStore";
import "@/styles/booking.css";

// --- Modular Components ---
import BookingSteps from "@/components/flights/BookingSteps";
import PassengerForm from "@/components/flights/PassengerForm";
import AncillarySelection from "@/components/flights/AncillarySelection";
import PriceBreakdown from "@/components/flights/PriceBreakdown";

// --- Screen Components ---
import { ProcessingScreen } from "./PostBookingScreens";
import { ConfirmationScreen } from "./ConfirmationScreen";
import { HoldScreen } from "./HoldScreen";
import { BookingDetailsScreen } from "./BookingDetailsScreen";

function BookingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState<'passengers' | 'ancillaries' | 'contact' | 'review'>('passengers');
  const [bookingStatus, setBookingStatus] = useState<'filling' | 'processing' | 'confirmed' | 'held'>('filling');
  
  const {
    selectedFlight,
    currency,
    travelers,
    setTravelers,
    updateTraveler,
    selectedSeats,
    setSelectedSeats,
    baggageSelection,
    setBaggageSelection,
    mealSelection,
    setMealSelection
  } = useBookingStore();

  const [contactInfo, setContactInfo] = useState({ 
    primaryEmail: '', 
    primaryPhone: '', 
    altPhone: '', 
    preferredMethod: 'Both', 
    additionalEmails: '' 
  });
  const [bookingOption, setBookingOption] = useState<'pay_now' | 'hold'>('pay_now');
  const [passengerAddons, setPassengerAddons] = useState<Record<number, any>>({});
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Sync travelers based on search params
  useEffect(() => {
    const adults = parseInt(searchParams.get('adults') || '1');
    const kids = parseInt(searchParams.get('children') || '0');
    const infants = parseInt(searchParams.get('infants') || '0');
    
    if (travelers.length === 0) {
      const initialTravelers = [
        ...Array(adults).fill(null).map((_, i) => ({ id: `A-${i}`, travelerType: 'ADULT' })),
        ...Array(kids).fill(null).map((_, i) => ({ id: `C-${i}`, travelerType: 'CHILD' })),
        ...Array(infants).fill(null).map((_, i) => ({ id: `I-${i}`, travelerType: 'HELD_INFANT' })),
      ];
      setTravelers(initialTravelers as any);
    }
  }, [searchParams, travelers.length, setTravelers]);

  if (bookingStatus === 'processing') return <ProcessingScreen />;
  if (bookingStatus === 'confirmed') return <ConfirmationScreen />;
  if (bookingStatus === 'held') return <HoldScreen />;

  return (
    <div className="h-screen w-screen overflow-hidden flex bg-white font-sans text-slate-800">
      {/* Sidebar Layout matched with Flights Search Page */}
      <aside className={cn(
        "w-[220px] bg-white flex flex-col flex-shrink-0 transition-all duration-300 border-r border-slate-100",
        !sidebarOpen && "w-0 overflow-hidden"
      )}>
        <div className="px-5 pt-6 pb-4 cursor-pointer" onClick={() => router.push("/")}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#1e2d4f] rounded-lg flex items-center justify-center text-white font-black text-base">
              <Plane size={16} className="-rotate-45" />
            </div>
            <div className="font-black text-[#1e2d4f] tracking-tight text-[1rem] uppercase">Traventions</div>
          </div>
        </div>
        <div className="px-4 pb-4">
          <div className="bg-teal-600 text-white text-[0.6rem] font-black px-3 py-1.5 rounded-md tracking-widest uppercase">TMC Booking Agent</div>
        </div>
        <div className="flex-1 overflow-y-auto no-scrollbar py-2">
           {/* Sidebar Links could be placed here if needed */}
           <div className="px-6 py-4">
              <div className="text-[0.6rem] font-bold text-slate-400 uppercase tracking-widest mb-4">Current Operation</div>
              <div className="flex items-center gap-3 text-indigo-600 font-bold text-xs bg-indigo-50 p-3 rounded-xl border border-indigo-100 shadow-sm shadow-indigo-100/10">
                 <Zap size={14} /> Finalizing Booking
              </div>
           </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-h-0 bg-slate-50/20">
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-8 flex-shrink-0 z-20 shadow-sm shadow-slate-100/50">
          <div className="flex items-center gap-4">
            <button className="lg:hidden p-2 text-slate-500 rounded-lg" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest">
               <span className="text-slate-400">Inventory</span>
               <span className="text-slate-300">/</span>
               <Link href="/flights" className="text-slate-500 hover:text-indigo-600 transition-colors">Flights</Link>
               <span className="text-slate-300">/</span>
               <span className="text-slate-900">Checkout</span>
            </div>
          </div>
          <div className="flex items-center gap-6">
             <div className="hidden lg:flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-2xl px-4 py-2 text-[0.7rem] shadow-sm">
               <span className="text-emerald-600 font-black uppercase tracking-tighter shrink-0">Credit line:</span>
               <span className="font-black text-slate-800 shrink-0">$42,850.00</span>
             </div>
             <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
               <div className="w-10 h-10 rounded-2xl bg-indigo-900 text-white flex items-center justify-center font-black text-sm">JD</div>
             </div>
          </div>
        </header>

        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto p-8 lg:p-12 no-scrollbar">
            <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-12">
               
               {/* FORM SIDE */}
               <div className="flex-1 min-w-0">
                  <BookingSteps currentStep={currentStep} />

                  <AnimatePresence mode="wait">
                    {currentStep === 'passengers' && (
                      <motion.div key="passengers" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                        <div className="mb-8">
                           <h1 className="text-3xl font-black text-[#1e2d4f] tracking-tighter">Passenger Information</h1>
                           <p className="text-slate-500 font-medium text-sm mt-1">Enter traveler details as shown on official identity documents.</p>
                        </div>
                        {travelers.map((t, i) => (
                           <PassengerForm 
                             key={i} 
                             index={i} 
                             data={travelers[i]} 
                             onChange={(d) => updateTraveler(i, d)} 
                           />
                        ))}
                        <div className="flex justify-end gap-4 mt-10">
                           <button className="px-12 py-4 bg-indigo-900 text-white rounded-2xl text-sm font-black shadow-xl shadow-indigo-900/10 hover:bg-indigo-950 transition-all uppercase tracking-widest flex items-center gap-2" onClick={() => setCurrentStep('ancillaries')}>
                              Continue to Ancillaries <ArrowRight size={18} />
                           </button>
                        </div>
                      </motion.div>
                    )}

                    {currentStep === 'ancillaries' && (
                      <motion.div key="ancillaries" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                        <div className="mb-8">
                           <h1 className="text-3xl font-black text-[#1e2d4f] tracking-tighter">Enhance Your Journey</h1>
                           <p className="text-slate-500 font-medium text-sm mt-1">Customise your flight with extra baggage, preferred seating and dining.</p>
                        </div>
                        <AncillarySelection 
                           passengers={travelers}
                           selectedSeats={selectedSeats}
                           setSelectedSeats={setSelectedSeats}
                           baggage={baggageSelection}
                           setBaggage={setBaggageSelection}
                           meals={mealSelection}
                           setMeals={setMealSelection}
                           passengerDetails={travelers as any}
                           flightOffer={selectedFlight}
                        />
                        <div className="flex justify-between items-center mt-12 bg-white p-6 rounded-3xl border border-slate-100">
                           <button className="text-xs font-black text-slate-400 hover:text-slate-900 flex items-center gap-2 uppercase tracking-widest pr-4 border-r border-slate-100" onClick={() => setCurrentStep('passengers')}>
                              <ChevronLeft size={18} /> Back to Passengers
                           </button>
                           <button className="px-12 py-4 bg-indigo-900 text-white rounded-2xl text-sm font-black shadow-xl shadow-indigo-900/10 hover:bg-indigo-950 transition-all uppercase tracking-widest flex items-center gap-2" onClick={() => setCurrentStep('contact')}>
                              Continue to Contact <ArrowRight size={18} />
                           </button>
                        </div>
                      </motion.div>
                    )}

                    {currentStep === 'contact' && (
                      <motion.div key="contact" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                         <BookingDetailsScreen 
                            contactInfo={contactInfo} 
                            setContactInfo={setContactInfo} 
                            bookingOption={bookingOption} 
                            setBookingOption={setBookingOption} 
                            onBack={() => setCurrentStep('ancillaries')} 
                            onContinue={() => setCurrentStep('review')} 
                         />
                      </motion.div>
                    )}

                    {currentStep === 'review' && (
                      <motion.div key="review" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                         {/* Here we could use a dedicated ReviewStep or reuse existing screens */}
                         <div className="flex justify-between items-center mb-8">
                            <h1 className="text-3xl font-black text-[#1e2d4f] tracking-tighter">Final Review</h1>
                            <button className="flex items-center gap-2 text-indigo-600 font-bold text-xs" onClick={() => setCurrentStep('contact')}>
                               <ChevronLeft size={16} /> Edit Details
                            </button>
                         </div>
                         <div className="space-y-6">
                            <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-6 flex gap-4">
                               <ShieldCheck className="text-emerald-600 shrink-0" size={24} />
                               <div>
                                  <div className="text-sm font-black text-emerald-900 uppercase tracking-tight">Fare Guarantee</div>
                                  <div className="text-xs text-emerald-700 font-medium leading-relaxed mt-1">This price is locked for the next 15 minutes. Complete payment to secure your seat.</div>
                               </div>
                            </div>
                            {/* Existing Review Screens or integrated components */}
                            <div className="flex justify-center pt-8">
                               <button 
                                 className="px-20 py-5 bg-emerald-600 text-white rounded-2xl text-base font-black shadow-2xl shadow-emerald-900/20 hover:bg-emerald-700 active:scale-95 transition-all uppercase tracking-widest flex items-center gap-3"
                                 onClick={() => {
                                    setBookingStatus('processing');
                                    setTimeout(() => {
                                       setBookingStatus(bookingOption === 'pay_now' ? 'confirmed' : 'held');
                                    }, 3000);
                                 }}
                               >
                                  {bookingOption === 'pay_now' ? 'Complete Booking & Pay' : 'Confirm Hold Selection'}
                                  <ArrowRight size={22} strokeWidth={3} />
                               </button>
                            </div>
                         </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
               </div>

               {/* SIDEBAR SUMMARY */}
               <div className="w-full lg:w-[380px] shrink-0">
                  <PriceBreakdown 
                     flightOffer={selectedFlight || { price: { total: '0' } }}
                     passengers={travelers}
                     selectedSeats={selectedSeats}
                     baggage={baggageSelection}
                     meals={mealSelection}
                     passengerAddons={passengerAddons}
                     currency={currency}
                  />
               </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function BookingPage() {
  return (
     <Suspense fallback={
       <div className="h-screen w-screen flex items-center justify-center bg-slate-50">
          <div className="flex flex-col items-center gap-4">
             <div className="w-12 h-12 border-4 border-indigo-900 border-t-transparent rounded-full animate-spin"></div>
             <div className="text-xs font-black text-[#1e2d4f] uppercase tracking-widest">Initialising Checkout...</div>
          </div>
       </div>
     }>
        <BookingContent />
     </Suspense>
  );
}
