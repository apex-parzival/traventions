"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  CreditCard,
  User,
  Mail,
  Phone,
  Plane,
  Hotel,
  CheckCircle,
  ShieldCheck,
  ArrowRight,
  Loader2,
  ChevronRight,
  Lock,
} from "lucide-react";
import { createFlightOrder, createHotelBooking } from "@/services/amadeus";
import { cn } from "@/lib/utils";

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = searchParams.get("type");
  const offerId = searchParams.get("offerId") || searchParams.get("id");

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [orderData, setOrderData] = useState<any>(null);

  // In a real app, we'd fetch the offer details by ID here if not in state
  // For this migration, we'll use a placeholder if the object isn't passed via state
  // (Note: Next.js doesn't have a direct equivalent to 'location.state' without a provider)
  const [item, setItem] = useState<any>(null);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    cardNumber: "",
    expiry: "",
    cvc: "",
  });

  useEffect(() => {
    // Attempt to recover item from local storage or session if needed
    // For now, we'll create a dummy item for visual consistency if params exist
    if (offerId) {
      setItem({ id: offerId, type });
    }
  }, [offerId, type]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleBooking = async () => {
    setLoading(true);
    try {
      const travelers = [
        {
          id: "1",
          dateOfBirth: "1990-01-01",
          name: { firstName: formData.firstName, lastName: formData.lastName },
          contact: {
            emailAddress: formData.email,
            phones: [{ deviceType: "MOBILE", countryCallingCode: "1", number: formData.phone }],
          },
        },
      ];

      let result;
      if (type === "flight") {
        // This would require the actual offer object, but for demo we mock
        result = { id: "AMX-" + Math.random().toString(36).substring(7).toUpperCase() };
      } else {
        result = { id: "HTL-" + Math.random().toString(36).substring(7).toUpperCase() };
      }

      setOrderData(result);
      setStep(3);
    } catch (err) {
      console.error("Booking Error:", err);
      alert("Booking failed. Please check your payment details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8 pt-24">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-2 mb-8 text-sm font-bold text-slate-500">
          <span className={cn(step >= 1 ? "text-teal-400" : "")}>Details</span>
          <ChevronRight size={14} />
          <span className={cn(step >= 2 ? "text-teal-400" : "")}>Payment</span>
          <ChevronRight size={14} />
          <span className={cn(step >= 3 ? "text-teal-400" : "")}>Confirmation</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-12 items-start">
          <div className="min-h-[500px]">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-10">
                  <h2 className="text-3xl font-black mb-2 italic">Traveler Details</h2>
                  <p className="text-slate-400 mb-8 border-b border-white/5 pb-4">Enter information exactly as it appears on your passport.</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[0.65rem] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><User size={12}/> First Name</label>
                       <input name="firstName" placeholder="John" className="w-full bg-white/5 border border-white/10 p-4 rounded-xl outline-none focus:border-teal-400/50" onChange={handleFormChange} />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[0.65rem] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><User size={12}/> Last Name</label>
                       <input name="lastName" placeholder="Doe" className="w-full bg-white/5 border border-white/10 p-4 rounded-xl outline-none focus:border-teal-400/50" onChange={handleFormChange} />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                       <label className="text-[0.65rem] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><Mail size={12}/> Email Address</label>
                       <input name="email" type="email" placeholder="john@example.travel" className="w-full bg-white/5 border border-white/10 p-4 rounded-xl outline-none focus:border-teal-400/50" onChange={handleFormChange} />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                       <label className="text-[0.65rem] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><Phone size={12}/> Global Phone Number</label>
                       <input name="phone" placeholder="+1 234 567 8900" className="w-full bg-white/5 border border-white/10 p-4 rounded-xl outline-none focus:border-teal-400/50" onChange={handleFormChange} />
                    </div>
                  </div>
                  <button className="mt-10 w-full bg-teal-500 text-slate-950 font-black py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-teal-600 transition-all shadow-lg shadow-teal-500/20" onClick={() => setStep(2)}>
                    Proceed to Payment <ArrowRight size={18} />
                  </button>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-10">
                   <h2 className="text-3xl font-black mb-2 italic">Payment</h2>
                   <p className="text-slate-400 mb-8 border-b border-white/5 pb-4 text-xs flex items-center gap-2 tracking-widest uppercase font-bold text-teal-400"><Lock size={12}/> Secure 256-bit SSL Encrypted Transaction</p>
                   
                   <div className="bg-gradient-to-br from-teal-500 to-blue-600 p-8 rounded-2xl mb-8 relative overflow-hidden shadow-2xl">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                      <div className="flex justify-between items-start mb-12">
                         <div className="w-12 h-10 bg-amber-400/80 rounded-md"></div>
                         <div className="text-white font-black text-xl italic">VISA</div>
                      </div>
                      <div className="text-2xl font-mono tracking-[0.3em] mb-8 text-white drop-shadow-md">
                        {formData.cardNumber ? formData.cardNumber.replace(/(\d{4})(?=\d)/g, '$1 ') : '**** **** **** ****'}
                      </div>
                      <div className="flex justify-between items-end text-white/80 font-bold uppercase text-[0.65rem]">
                         <div>{formData.firstName || 'CARDHOLDER'} {formData.lastName || ''}</div>
                         <div className="text-right">VALID THRU<br/><span className="text-base text-white">{formData.expiry || 'MM/YY'}</span></div>
                      </div>
                   </div>

                   <div className="space-y-6">
                      <div className="space-y-2">
                         <label className="text-[0.65rem] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><CreditCard size={12}/> Card Number</label>
                         <input name="cardNumber" maxLength={16} placeholder="0000 0000 0000 0000" className="w-full bg-white/5 border border-white/10 p-4 rounded-xl outline-none focus:border-teal-400/50 font-mono tracking-widest" onChange={handleFormChange} />
                      </div>
                      <div className="grid grid-cols-2 gap-6">
                         <div className="space-y-2">
                            <label className="text-[0.65rem] font-black text-slate-500 uppercase tracking-widest">Expiry</label>
                            <input name="expiry" placeholder="MM/YY" className="w-full bg-white/5 border border-white/10 p-4 rounded-xl outline-none focus:border-teal-400/50" onChange={handleFormChange} />
                         </div>
                         <div className="space-y-2">
                            <label className="text-[0.65rem] font-black text-slate-500 uppercase tracking-widest">CVC</label>
                            <input name="cvc" type="password" placeholder="***" className="w-full bg-white/5 border border-white/10 p-4 rounded-xl outline-none focus:border-teal-400/50" onChange={handleFormChange} />
                         </div>
                      </div>
                   </div>
                   
                   <div className="mt-10 flex flex-col gap-4">
                      <button className="w-full bg-white text-slate-950 font-black py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-100 transition-all shadow-lg disabled:opacity-50" onClick={handleBooking} disabled={loading}>
                        {loading ? <Loader2 className="animate-spin" size={20} /> : <ShieldCheck size={20} />}
                        {loading ? "Processing Order..." : "Confirm & Pay Order"}
                      </button>
                      <button className="text-sm font-bold text-slate-500 hover:text-white transition-colors" onClick={() => setStep(1)}>Back to Details</button>
                   </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div key="step3" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-12 text-center flex flex-col items-center">
                  <div className="w-24 h-24 bg-teal-500 rounded-full flex items-center justify-center text-slate-950 mb-8 shadow-2xl shadow-teal-500/20">
                    <CheckCircle size={56} />
                  </div>
                  <h2 className="text-4xl font-black mb-4 italic">Booking Confirmed!</h2>
                  <p className="text-slate-400 max-w-md mx-auto mb-10 text-lg">Your itinerary has been locked in. A confirmation receipt and tickets will be sent to your email shortly.</p>
                  <div className="bg-white/5 rounded-2xl p-6 w-full max-w-md space-y-4 mb-10 border border-white/5">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500 font-bold uppercase tracking-tighter">ORDER REFERENCE</span>
                      <span className="font-black text-teal-400">{orderData?.id || "AMX782910"}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm border-t border-white/5 pt-4">
                      <span className="text-slate-500 font-bold uppercase tracking-tighter">STATUS</span>
                      <span className="bg-teal-500 text-slate-950 px-2 py-0.5 rounded text-[0.6rem] font-black uppercase">Confirmed</span>
                    </div>
                  </div>
                  <button className="bg-white text-slate-950 font-black px-12 py-4 rounded-xl hover:bg-slate-100 transition-all shadow-lg" onClick={() => router.push("/")}>
                    Return to Dashboard
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <aside className="space-y-6 lg:sticky lg:top-24">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-xl">
              <h3 className="text-xl font-bold mb-6 italic">Order Summary</h3>
              <div className="flex items-center gap-4 mb-8 bg-white/5 p-4 rounded-2xl border border-white/5">
                <div className="w-12 h-12 bg-teal-500/10 rounded-xl flex items-center justify-center text-teal-400">
                  {type === "flight" ? <Plane size={24} /> : <Hotel size={24} />}
                </div>
                <div>
                  <h4 className="font-bold text-sm leading-tight">{type === "flight" ? "Flight Booking" : "Hotel Booking"}</h4>
                  <p className="text-[0.7rem] text-slate-500 font-bold uppercase tracking-widest mt-1">GDS OFFER #{offerId?.substring(0, 8)}</p>
                </div>
              </div>
              
              <div className="space-y-4 pt-6 border-t border-white/5">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400 font-medium">Base Fare</span>
                  <span className="font-bold font-mono">$ --.--</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400 font-medium">Global Taxes</span>
                  <span className="font-bold font-mono">$ --.--</span>
                </div>
                <div className="flex justify-between items-center text-xl pt-6 border-t border-white/5 mt-2">
                  <span className="font-black italic">Total Price</span>
                  <span className="text-teal-400 font-black font-mono">USD $--.--</span>
                </div>
              </div>
              
              <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-center gap-2 text-slate-500 text-[0.65rem] font-bold uppercase tracking-widest">
                <ShieldCheck size={14} className="text-teal-500" /> Amadeus Secured Payment
              </div>
            </div>
            
            <div className="bg-teal-500/5 border border-teal-500/10 rounded-2xl p-6">
              <h4 className="text-teal-400 text-xs font-black uppercase mb-2">TMC Advantage</h4>
              <p className="text-slate-400 text-[0.75rem] leading-relaxed italic">"Access to exclusive negotiated rates and 24/7 corporate support for every booking."</p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 text-white flex items-center justify-center"><Loader2 className="animate-spin text-teal-500" size={48} /></div>}>
      <CheckoutContent />
    </Suspense>
  );
}
