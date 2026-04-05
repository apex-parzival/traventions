"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Clock, Zap, BarChart3, MapPin, Calendar, Plane, Search, AlertTriangle, TrendingUp, Loader2 } from "lucide-react";
import {
  getFlightStatus,
  getAirportOnTimePerformance,
  getTripPurposePrediction,
  getNearestAirports,
  getAirTrafficData,
} from "@/services/amadeus";
import LocationSearch from "@/components/LocationSearch";
import { cn } from "@/lib/utils";

type TabType = "delay" | "ontime" | "price" | "purpose" | "nearby";

export default function IntelligencePage() {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("delay");

  // Delay State
  const [delayParams, setDelayParams] = useState({
    carrierCode: "",
    flightNumber: "",
    departureDate: "",
  });
  const [delayResult, setDelayResult] = useState<any>(null);
  const [hasSearched, setHasSearched] = useState({ delay: false, ontime: false, price: false, purpose: false, nearby: false });

  // On-Time State
  const [ontimeParams, setOntimeParams] = useState({ airport: "", date: "" });
  const [ontimeResult, setOntimeResult] = useState<any>(null);

  // Price Metrics State
  const [priceParams, setPriceParams] = useState({ origin: "", period: "2025-01" });
  const [priceResult, setPriceResult] = useState<any[]>([]);

  // Trip Purpose State
  const [purposeParams, setPurposeParams] = useState({ origin: "", destination: "", departureDate: "", returnDate: "" });
  const [purposeResult, setPurposeResult] = useState<any>(null);

  // Nearby Airports State
  const [nearbyParams, setNearbyParams] = useState({ lat: "", lon: "" });
  const [nearbyResult, setNearbyResult] = useState<any[]>([]);

  const handleDelaySearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setHasSearched((prev) => ({ ...prev, delay: true }));
    try {
      const data = await getFlightStatus(delayParams);
      setDelayResult(data[0] || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOntimeSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setHasSearched((prev) => ({ ...prev, ontime: true }));
    try {
      const data = await getAirportOnTimePerformance(ontimeParams.airport, ontimeParams.date);
      setOntimeResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePriceSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setHasSearched((prev) => ({ ...prev, price: true }));
    try {
      const data = await getAirTrafficData("traveled", priceParams);
      setPriceResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleNearbySearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setHasSearched((prev) => ({ ...prev, nearby: true }));
    try {
      const data = await getNearestAirports(nearbyParams.lat, nearbyParams.lon);
      setNearbyResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8 pt-24">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-teal-500/10 border border-teal-500/20 text-teal-400 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-6">
            <Brain size={14} /> Amadeus AI Engine
          </div>
          <h1 className="text-6xl font-black mb-4 bg-gradient-to-r from-teal-400 to-blue-500 bg-clip-text text-transparent">Travel Intelligence</h1>
          <p className="text-slate-400 text-xl max-w-2xl mx-auto">Advanced predictive analytics and real-time GDS insights for smarter travel operations.</p>
        </motion.div>

        <div className="flex gap-4 mb-12 overflow-x-auto pb-4 scrollbar-hide">
          {[
            { id: "delay", icon: Clock, label: "Flight Status" },
            { id: "ontime", icon: Zap, label: "Performance" },
            { id: "price", icon: BarChart3, label: "Traffic" },
            { id: "purpose", icon: TrendingUp, label: "Trip Purpose" },
            { id: "nearby", icon: MapPin, label: "Nearby" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={cn(
                "flex items-center gap-2.5 px-6 py-3.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap border",
                activeTab === tab.id
                  ? "bg-teal-500 border-teal-500 text-slate-950 shadow-lg shadow-teal-500/20"
                  : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white"
              )}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl min-h-[500px]">
          <AnimatePresence mode="wait">
            {activeTab === "delay" && (
              <motion.div key="delay" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Predict Flight Delays</h2>
                  <div className="text-[0.7rem] bg-white/5 border border-white/10 px-3 py-1 rounded-md text-slate-500 font-bold uppercase tracking-widest">Live GDS Sync</div>
                </div>
                <form onSubmit={handleDelaySearch} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                  <div className="space-y-2">
                    <label className="text-[0.65rem] font-black text-slate-500 uppercase tracking-widest">Carrier Code</label>
                    <input
                      type="text"
                      placeholder="e.g. EK, BA"
                      className="w-full bg-white/5 border border-white/10 p-4 rounded-xl outline-none focus:border-teal-500/50 transition-all uppercase font-bold"
                      value={delayParams.carrierCode}
                      onChange={(e) => setDelayParams({ ...delayParams, carrierCode: e.target.value.toUpperCase() })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[0.65rem] font-black text-slate-500 uppercase tracking-widest">Flight Number</label>
                    <input
                      type="text"
                      placeholder="e.g. 202"
                      className="w-full bg-white/5 border border-white/10 p-4 rounded-xl outline-none focus:border-teal-500/50 transition-all font-bold"
                      value={delayParams.flightNumber}
                      onChange={(e) => setDelayParams({ ...delayParams, flightNumber: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[0.65rem] font-black text-slate-500 uppercase tracking-widest">Dep. Date</label>
                    <input
                      type="date"
                      className="w-full bg-white/5 border border-white/10 p-4 rounded-xl outline-none focus:border-teal-500/50 transition-all font-bold"
                      value={delayParams.departureDate}
                      onChange={(e) => setDelayParams({ ...delayParams, departureDate: e.target.value })}
                      required
                    />
                  </div>
                </form>
                <button
                  onClick={handleDelaySearch}
                  className="w-full bg-white text-slate-950 font-black py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-100 transition-all active:scale-[0.98] shadow-lg disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? <Loader2 className="animate-spin" /> : <Zap size={18} />}
                  {loading ? "Analyzing Historical Data..." : "Run AI Delay Prediction"}
                </button>

                {delayResult && (
                  <div className="mt-12 bg-teal-500/10 border border-teal-500/20 rounded-2xl p-8 grid md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 text-teal-400 font-bold">
                        <Plane size={24} />
                        <h3 className="text-xl">Flight Status Verified</h3>
                      </div>
                      <div className="text-4xl font-black">{delayResult.flightPoints?.[0]?.departure?.timings?.[0]?.qualifier || "SCH"}</div>
                      <p className="text-slate-400 text-sm">Based on current GDS telemetry, this flight is expected to maintain its schedule.</p>
                    </div>
                    <div className="flex items-center justify-around border-l border-white/5">
                      <div className="text-center">
                        <div className="text-[0.65rem] text-slate-500 font-black mb-1">DEPARTURE</div>
                        <div className="text-2xl font-bold">{delayResult.flightPoints?.[0]?.departure?.timings?.[0]?.value?.split("T")[1].substring(0, 5) || "N/A"}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-[0.65rem] text-slate-500 font-black mb-1">ARRIVAL</div>
                        <div className="text-2xl font-bold">{delayResult.flightPoints?.[1]?.arrival?.timings?.[0]?.value?.split("T")[1].substring(0, 5) || "N/A"}</div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === "ontime" && (
              <motion.div key="ontime" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                <h2 className="text-2xl font-bold">Airport Performance</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                  <div className="space-y-2">
                    <label className="text-[0.65rem] font-black text-slate-500 uppercase tracking-widest">Airport Code</label>
                    <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden focus-within:border-teal-500/50">
                      <LocationSearch value={ontimeParams.airport} onChange={(v) => setOntimeParams({ ...ontimeParams, airport: v })} placeholder="e.g. DXB, LHR" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[0.65rem] font-black text-slate-500 uppercase tracking-widest">Date</label>
                    <input
                      type="date"
                      className="w-full bg-white/5 border border-white/10 p-4 rounded-xl outline-none focus:border-teal-500/50 transition-all font-bold"
                      value={ontimeParams.date}
                      onChange={(e) => setOntimeParams({ ...ontimeParams, date: e.target.value })}
                    />
                  </div>
                </div>
                <button onClick={handleOntimeSearch} className="w-full bg-teal-500 text-slate-950 font-black py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-teal-600 transition-all shadow-lg shadow-teal-500/20 disabled:opacity-50" disabled={loading}>
                   {loading ? <Loader2 className="animate-spin" /> : <BarChart3 size={18} />}
                   {loading ? "Fetching Analytics..." : "View Performance Report"}
                </button>

                {ontimeResult && (
                  <div className="grid grid-cols-2 gap-4">
                     <div className="bg-white/5 border border-white/10 p-6 rounded-2xl text-center">
                        <div className="text-[0.65rem] text-slate-500 font-black mb-2">ON-TIME PROBABILITY</div>
                        <div className="text-5xl font-black text-teal-400">{(ontimeResult.probability * 100).toFixed(1)}%</div>
                     </div>
                     <div className="bg-white/5 border border-white/10 p-6 rounded-2xl text-center">
                        <div className="text-[0.65rem] text-slate-500 font-black mb-2">AI CONFIDENCE LEVEL</div>
                        <div className="text-5xl font-black">{ontimeResult.confidence || "High"}</div>
                     </div>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === "purpose" && (
              <motion.div key="purpose" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col items-center justify-center h-[400px] text-center p-12 bg-white/5 border border-white/10 border-dashed rounded-3xl">
                <AlertTriangle size={64} className="text-amber-500 mb-6" />
                <h3 className="text-2xl font-bold mb-2">Enterprise Access Required</h3>
                <p className="text-slate-400 max-w-md">Our Trip Purpose Prediction and Delay Probability APIs have been migrated to the Amadeus Enterprise Tier. Please contact your account manager for API keys.</p>
                <div className="mt-8 flex gap-4">
                  <button className="bg-white/10 px-6 py-3 rounded-xl font-bold text-sm">View Documentation</button>
                  <button className="bg-white text-slate-950 px-6 py-3 rounded-xl font-bold text-sm">Upgrade Plan</button>
                </div>
              </motion.div>
            )}

            {activeTab === "price" && (
              <motion.div key="price" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                 <h2 className="text-2xl font-bold">Global Travel Traffic</h2>
                 <div className="grid md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                      <label className="text-[0.65rem] font-black text-slate-500 uppercase tracking-widest">Origin City</label>
                      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden focus-within:border-teal-500/50 transition-all">
                        <LocationSearch value={priceParams.origin} onChange={(v)=>setPriceParams({...priceParams, origin:v})} placeholder="e.g. NYC, LON" />
                      </div>
                   </div>
                   <div className="space-y-2">
                      <label className="text-[0.65rem] font-black text-slate-500 uppercase tracking-widest">Period (YYYY-MM)</label>
                      <input type="text" placeholder="2025-01" className="w-full bg-white/5 border border-white/10 p-4 rounded-xl outline-none" value={priceParams.period} onChange={(e)=>setPriceParams({...priceParams, period:e.target.value})} />
                   </div>
                 </div>
                 <button onClick={handlePriceSearch} className="w-full bg-teal-500 text-slate-950 font-black py-4 rounded-xl disabled:opacity-50" disabled={loading}>
                    {loading ? "Analyzing Trends..." : "Generate Traffic Insights"}
                 </button>

                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {priceResult.map((dest, idx) => (
                      <div key={idx} className="bg-white/5 border border-white/10 p-6 rounded-2xl group hover:border-teal-500/30 transition-all">
                        <h4 className="font-bold text-xl mb-1 text-teal-400">{dest.destination}</h4>
                        <div className="text-[0.65rem] text-slate-500 font-bold uppercase tracking-tighter mb-4">Popular Destination</div>
                        <div className="flex justify-between items-end">
                           <div className="text-2xl font-black">{dest.analytics?.travelers?.score}</div>
                           <div className="text-[0.6rem] text-slate-500 font-bold">TRAFFIC SCORE</div>
                        </div>
                      </div>
                    ))}
                 </div>
              </motion.div>
            )}

            {activeTab === "nearby" && (
              <motion.div key="nearby" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                 <h2 className="text-2xl font-bold">Dynamic Nearby Airports</h2>
                 <form onSubmit={handleNearbySearch} className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[0.65rem] font-black text-slate-500 uppercase tracking-widest">Latitude</label>
                       <input type="number" step="any" className="w-full bg-white/5 border border-white/10 p-4 rounded-xl outline-none" value={nearbyParams.lat} onChange={(e)=>setNearbyParams({...nearbyParams, lat:e.target.value})} placeholder="40.4168" required />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[0.65rem] font-black text-slate-500 uppercase tracking-widest">Longitude</label>
                       <input type="number" step="any" className="w-full bg-white/5 border border-white/10 p-4 rounded-xl outline-none" value={nearbyParams.lon} onChange={(e)=>setNearbyParams({...nearbyParams, lon:e.target.value})} placeholder="-3.7038" required />
                    </div>
                    <button className="col-span-2 bg-teal-500 text-slate-950 font-black py-4 rounded-xl" disabled={loading}>
                       {loading ? "Geolocating..." : "Find Nearest Air Hubs"}
                    </button>
                 </form>

                 <div className="grid gap-4">
                    {nearbyResult.map((a, i) => (
                      <div key={a.id} className="bg-white/5 border border-white/10 p-6 rounded-2xl flex items-center justify-between">
                         <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white/5 flex items-center justify-center rounded-xl text-teal-400"><Plane size={24}/></div>
                            <div>
                               <h4 className="font-bold text-lg">{a.name}</h4>
                               <p className="text-sm text-slate-400">{a.iataCode} • {a.address?.cityName}</p>
                            </div>
                         </div>
                         <div className="text-right">
                            <div className="text-xl font-black">{(a.distance.value / 1000).toFixed(1)} km</div>
                            <div className="text-[0.6rem] text-slate-500 font-black">DISTANCE</div>
                         </div>
                      </div>
                    ))}
                 </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
