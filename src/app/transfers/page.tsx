"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Car, MapPin, Calendar, Clock, Users, ArrowRight, Loader2, ShieldCheck, Search } from "lucide-react";
import { getTransferOffers } from "@/services/amadeus";
import { cn } from "@/lib/utils";

export default function TransfersPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    pickUpLocationCode: "",
    destinationLocationCode: "",
    startDateTime: "",
    passengers: 1,
  });

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const params = {
        startLocationCode: form.pickUpLocationCode,
        endLocationCode: form.destinationLocationCode,
        startDateTime: form.startDateTime,
        passengers: form.passengers,
        transferType: "PRIVATE",
      };
      const data = await getTransferOffers(params);
      setResults(data);
    } catch (err: any) {
      setError("Failed to find transfers. Ensure airport codes are correct (e.g. LHR, JFK).");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8 pt-24">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-16">
          <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-6xl font-black mb-4">
            Luxury <span className="bg-gradient-to-r from-teal-400 to-blue-500 bg-clip-text text-transparent">Transfers</span>
          </motion.h1>
          <p className="text-slate-400 text-xl font-medium">Seamless door-to-door transportation for VIP clients.</p>
        </header>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 mb-12 shadow-2xl">
          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <MapPin size={14} /> Pickup (IATA)
              </label>
              <input
                type="text"
                placeholder="e.g. LHR"
                className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-white font-bold outline-none focus:border-teal-500/50 transition-colors uppercase"
                required
                value={form.pickUpLocationCode}
                onChange={(e) => setForm({ ...form, pickUpLocationCode: e.target.value.toUpperCase() })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <MapPin size={14} /> Drop-off (IATA)
              </label>
              <input
                type="text"
                placeholder="e.g. CDG"
                className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-white font-bold outline-none focus:border-teal-500/50 transition-colors uppercase"
                required
                value={form.destinationLocationCode}
                onChange={(e) => setForm({ ...form, destinationLocationCode: e.target.value.toUpperCase() })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Calendar size={14} /> Date & Time
              </label>
              <input
                type="datetime-local"
                className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-white font-bold outline-none focus:border-teal-500/50 transition-colors"
                required
                value={form.startDateTime}
                onChange={(e) => setForm({ ...form, startDateTime: e.target.value })}
              />
            </div>
            <button
              type="submit"
              className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-4 rounded-xl flex justify-center items-center gap-2 transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-teal-500/20 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? <Loader2 className="animate-spin" /> : <Search size={20} />}
              {loading ? "Searching GDS..." : "Find Transfers"}
            </button>
          </form>
        </div>

        {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-8 text-center text-sm font-medium">{error}</div>}

        <div className="space-y-6">
          <AnimatePresence>
            {results.map((offer, idx) => (
              <motion.div
                key={offer.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 flex flex-col md:grid md:grid-cols-[2fr_1fr_1fr] items-center gap-8 group hover:border-white/20 transition-all"
              >
                <div className="flex items-center gap-6 w-full">
                  <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center text-slate-900 shadow-xl shadow-blue-500/20 flex-shrink-0">
                    <Car size={40} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-1">{offer.vehicle?.description}</h3>
                    <p className="text-slate-400 font-medium">
                      {offer.serviceProvider?.name} • {offer.vehicle?.type}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-3 w-full border-y md:border-y-0 md:border-x border-white/10 py-6 md:py-0 md:px-8">
                  <div className="flex items-center gap-3 text-slate-300 font-bold">
                    <Users size={18} className="text-teal-500" />
                    <span>{offer.vehicle?.capacity} Passengers</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-300 font-bold">
                    <ShieldCheck size={18} className="text-teal-500" />
                    <span>Instant Confirmation</span>
                  </div>
                </div>

                <div className="flex flex-col items-center md:items-end w-full gap-4">
                  <div className="text-center md:text-right">
                    <span className="block text-3xl font-black text-teal-400">
                      {offer.quotation?.monetaryAmount} {offer.quotation?.currencyCode}
                    </span>
                    <span className="text-[0.7rem] text-slate-500 uppercase font-black tracking-widest">Inclusive price</span>
                  </div>
                  <button
                    onClick={() => router.push(`/checkout?type=transfer&id=${offer.id}`)}
                    className="w-full md:w-auto bg-white text-slate-950 font-extrabold py-3 px-8 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-100 transition-colors active:scale-95 shadow-lg"
                  >
                    Book Now <ArrowRight size={18} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
