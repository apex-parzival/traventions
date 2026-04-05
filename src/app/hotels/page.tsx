"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Hotel, Search, Calendar, MapPin, Star, Loader2, Info } from "lucide-react";
import { searchHotels, getHotelRatings } from "@/services/amadeus";
import LocationSearch from "@/components/LocationSearch";
import { cn } from "@/lib/utils";

export default function HotelsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [sentiments, setSentiments] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const [searchParams, setSearchParams] = useState({
    city: "",
    checkIn: "",
    checkOut: "",
    guests: "1",
  });

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (searchParams.city.length !== 3) {
      setError("Please select a city from the dropdown or use a 3-letter IATA code (e.g., PAR, NYC).");
      return;
    }

    setLoading(true);
    setError(null);
    setSearched(false);
    try {
      const data = await searchHotels({
        cityCode: searchParams.city.toUpperCase(),
        checkInDate: searchParams.checkIn,
        checkOutDate: searchParams.checkOut,
        adults: searchParams.guests,
      });
      setResults(data);

      if (data.length > 0) {
        const hotelIds = data
          .slice(0, 10)
          .map((h: any) => h.hotelId)
          .join(",");
        try {
          const sentimentData = await getHotelRatings(hotelIds);
          const sentMap: Record<string, number> = {};
          sentimentData.forEach((s: any) => {
            sentMap[s.hotelId] = s.overallRating;
          });
          setSentiments(sentMap);
        } catch (sErr) {
          console.error("Sentiments failed:", sErr);
        }
      }

      setSearched(true);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Hotel search failed.");
      setResults([]);
      setSearched(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8 pt-24">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center mb-12">
          <h1 className="text-5xl font-black mb-4 bg-gradient-to-r from-teal-400 to-blue-500 bg-clip-text text-transparent">Book Your Stay</h1>
          <p className="text-slate-400 text-lg">Discover the finest hotels at the best rates worldwide.</p>
        </motion.div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 mb-12 shadow-2xl">
          {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6 text-center text-sm">{error}</div>}
          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 items-end">
            <div className="lg:col-span-2 space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <MapPin size={14} /> Destination
              </label>
              <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden focus-within:border-teal-500/50 transition-colors">
                <LocationSearch placeholder="City (e.g., PAR, DXB)" value={searchParams.city} onChange={(iata) => setSearchParams({ ...searchParams, city: iata })} />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Calendar size={14} /> Check-in
              </label>
              <input
                type="date"
                className="w-full bg-white/5 border border-white/10 p-3.5 rounded-xl text-white outline-none focus:border-teal-500/50 transition-colors"
                value={searchParams.checkIn}
                onChange={(e) => setSearchParams({ ...searchParams, checkIn: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Calendar size={14} /> Check-out
              </label>
              <input
                type="date"
                className="w-full bg-white/5 border border-white/10 p-3.5 rounded-xl text-white outline-none focus:border-teal-500/50 transition-colors"
                value={searchParams.checkOut}
                onChange={(e) => setSearchParams({ ...searchParams, checkOut: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Star size={14} /> Guests
              </label>
              <input
                type="number"
                min="1"
                className="w-full bg-white/5 border border-white/10 p-3.5 rounded-xl text-white outline-none focus:border-teal-500/50 transition-colors"
                value={searchParams.guests}
                onChange={(e) => setSearchParams({ ...searchParams, guests: e.target.value })}
              />
            </div>
          </form>
          <div className="mt-8 flex justify-center">
            <button
              onClick={handleSearch}
              className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-4 px-12 rounded-xl flex items-center gap-3 transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 shadow-lg shadow-teal-500/20"
              disabled={loading}
            >
              {loading ? <Loader2 className="animate-spin" /> : <Search size={20} />}
              {loading ? "Searching..." : "Find Best Rates"}
            </button>
          </div>
        </div>

        <div className="space-y-8">
          {loading && (
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-20 text-center flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-white/10 border-t-teal-500 rounded-full animate-spin"></div>
              <p className="text-slate-400 font-medium">Looking for the best stays...</p>
            </div>
          )}

          {!loading && searched && results.length === 0 && (
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-20 text-center flex flex-col items-center gap-4">
              <Hotel size={64} className="text-slate-700" />
              <h3 className="text-2xl font-bold">No Hotels Found</h3>
              <p className="text-slate-400 max-w-md mx-auto">We couldn't find any hotels in the selected city for these dates. Try different dates or check the city code.</p>
            </div>
          )}

          {!loading && results.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {results.map((hotel) => (
                <motion.div
                  key={hotel.hotelId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-all group"
                >
                  <div className="h-48 bg-slate-800 relative bg-[url('https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80')] bg-cover bg-center">
                    <div className="absolute inset-0 bg-slate-950/40 group-hover:bg-slate-950/20 transition-colors"></div>
                    {sentiments[hotel.hotelId] && (
                      <div className="absolute top-4 right-4 bg-teal-500/20 backdrop-blur-md border border-teal-500/30 text-teal-400 text-[0.65rem] font-bold px-2 py-1 rounded-md">
                        {sentiments[hotel.hotelId]}% Positive
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-start gap-4 mb-4">
                      <div>
                        <h3 className="text-xl font-bold line-clamp-1">{hotel.name}</h3>
                        <div className="flex gap-1 mt-1 text-teal-500">
                          {[...Array(hotel.rating || 3)].map((_, i) => (
                            <Star key={i} size={14} fill="currentColor" />
                          ))}
                        </div>
                      </div>
                      <Hotel className="text-slate-600 flex-shrink-0" size={24} />
                    </div>
                    <p className="text-slate-400 text-sm flex items-center gap-1.5 mb-6">
                      <MapPin size={14} /> {hotel.address?.cityName || "City"}
                    </p>
                    <div className="flex justify-between items-center pt-4 border-t border-white/5">
                      {hotel.offers && hotel.offers.length > 0 ? (
                        <>
                          <div className="flex flex-col">
                            <span className="text-2xl font-black">${hotel.offers[0].price.total}</span>
                            <span className="text-[0.7rem] text-slate-500 uppercase font-bold tracking-tighter">per night</span>
                          </div>
                          <button
                            onClick={() => router.push(`/checkout?type=hotel&id=${hotel.hotelId}`)}
                            className="bg-white text-slate-950 font-bold py-2.5 px-6 rounded-lg text-sm hover:bg-slate-100 transition-colors"
                          >
                            View Deal
                          </button>
                        </>
                      ) : (
                        <>
                          <span className="text-slate-500 font-bold">Price on Request</span>
                          <button className="border border-white/10 text-white font-bold py-2.5 px-6 rounded-lg text-sm hover:bg-white/5 transition-colors">
                            Check
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
