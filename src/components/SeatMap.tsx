"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, AlertCircle, CheckCircle2, Info } from "lucide-react";
import { priceFlightOffer, getSeatMap } from "@/services/amadeus";
import { cn } from "@/lib/utils";

interface SeatMapProps {
  flightOffer: any;
  onSelect: (seatId: string) => void;
  onClose: () => void;
}

const SEAT_LABELS: Record<string, string> = {
  "1A": "Window",
  "1B": "Middle",
  "1C": "Aisle",
  "1D": "No Seat (Galley)",
  "1E": "Extra Legroom",
  "1F": "Exit Row",
  "1G": "Quiet Zone",
  "1H": "Bulkhead",
  "1I": "Lavatory adjacent",
  CH: "Chargeable",
  A: "Aisle",
  B: "Middle",
  W: "Window",
};

const SEAT_COLORS: Record<string, string> = {
  BUSINESS: "#7c3aed",
  PREMIUM_ECONOMY: "#0d9488",
  ECONOMY: "#64748b",
  FIRST: "#d97706",
};

const buildMockSeatMap = (flight: any) => {
  const seg = flight?.itineraries?.[0]?.segments?.[0];
  const rows = [];
  for (let r = 1; r <= 30; r++) {
    const cabin = r <= 4 ? "BUSINESS" : r <= 8 ? "PREMIUM_ECONOMY" : "ECONOMY";
    const cols = cabin === "BUSINESS" ? ["A", "C", "D", "F"] : ["A", "B", "C", "D", "E", "F"];
    
    // Each row has a different occupancy "profile" to look more realistic
    // Some rows are mostly empty, others mostly full
    const rowFullness = Math.random(); 
    const occupancyThreshold = rowFullness > 0.8 ? 0.2 : rowFullness < 0.2 ? 0.9 : 0.5;

    rows.push({
      number: r,
      cabin,
      seats: cols.map((col) => ({
        id: `${r}${col}`,
        col,
        // Randomized availability based on row profile
        available: Math.random() > occupancyThreshold,
        price: cabin === "BUSINESS" ? 75 : cabin === "PREMIUM_ECONOMY" ? 30 : 15,
        type: col === "A" || col === "F" ? "W" : col === "C" || col === "D" ? "A" : "B",
      })),
    });
  }
  return [{ id: "mock", segment: seg, decks: [{ rows }], isMock: true }];
};

const parseAmadeusSeatMap = (seatMaps: any[]) => {
  return seatMaps.map((sm) => {
    const decks = sm.decks || [];
    return {
      id: sm.id,
      segment: sm.segment,
      isMock: false,
      decks: decks.map((deck: any) => {
        const rowMap: Record<number, any> = {};
        (deck.seats || []).forEach((seat: any) => {
          const rowNum = parseInt(seat.number?.replace(/\D/g, "") || "0");
          const col = seat.number?.replace(/\d/g, "") || "?";
          if (!rowMap[rowNum]) rowMap[rowNum] = { number: rowNum, cabin: seat.cabin || "ECONOMY", seats: [] };
          rowMap[rowNum].seats.push({
            id: seat.number,
            col,
            available: seat.availabilityStatus === "AVAILABLE",
            price: seat.pricing?.total ? parseFloat(seat.pricing.total) : 0,
            type: seat.characteristicsCodes?.[0] || "B",
            characteristics: seat.characteristicsCodes || [],
          });
        });
        const rows = Object.values(rowMap).sort((a, b) => a.number - b.number);
        return { rows };
      }),
    };
  });
};

const SeatMap = ({ flightOffer, onSelect, onClose }: SeatMapProps) => {
  const [phase, setPhase] = useState<"loading" | "ready" | "error">("loading");
  const [seatMaps, setSeatMaps] = useState<any[]>([]);
  const [activeSegIdx, setActiveSegIdx] = useState(0);
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [isMock, setIsMock] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setPhase("loading");
        const priced = await priceFlightOffer(flightOffer);
        if (cancelled) return;
        const raw = await getSeatMap(priced);
        if (cancelled) return;
        const parsed = parseAmadeusSeatMap(raw);
        setSeatMaps(parsed.length > 0 ? parsed : buildMockSeatMap(flightOffer));
        setIsMock(parsed.length === 0);
        setPhase("ready");
      } catch (err: any) {
        if (cancelled) return;
        console.warn("Seat map API failed, using mock:", err.message);
        setSeatMaps(buildMockSeatMap(flightOffer));
        setIsMock(true);
        setPhase("ready");
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [flightOffer]);

  const activeSM = seatMaps[activeSegIdx];
  const allRows = activeSM?.decks?.flatMap((d: any) => d.rows) || [];

  const cabinGroups = allRows.reduce((acc: any, row: any) => {
    const c = row.cabin || "ECONOMY";
    if (!acc[c]) acc[c] = [];
    acc[c].push(row);
    return acc;
  }, {});

  const getSeatClassName = (seat: any, rowCabin: string) => {
    const base = "w-[30px] h-[28px] rounded-t-lg border border-transparent text-[0.62rem] font-bold cursor-pointer flex items-center justify-center transition-all";
    if (!seat.available) return cn(base, "bg-[#f1f5f9] border-[#e2e8f0] text-[#cbd5e1] cursor-not-allowed");
    if (selectedSeat === seat.id) return cn(base, "bg-[#0d9488] border-[#0d9488] text-white shadow-[0_0_0_3px_rgba(13,148,136,0.25)]");
    
    if (rowCabin === "BUSINESS") return cn(base, "bg-[#ede9fe] border-[#7c3aed] text-[#7c3aed] hover:bg-[#7c3aed] hover:text-white");
    if (rowCabin === "PREMIUM_ECONOMY") return cn(base, "bg-[#f0fdfa] border-[#0891b2] text-[#0891b2] hover:bg-[#0891b2] hover:text-white");
    return cn(base, "bg-[#e0fdf4] border-[#0d9488] text-[#0d9488] hover:bg-[#0d9488] hover:text-white");
  };

  const handleConfirm = () => {
    if (selectedSeat) {
      onSelect(selectedSeat);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[2000] flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="bg-white rounded-2xl w-full max-w-[620px] max-height-[90vh] flex flex-col shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-bottom border-[#f1f5f9]">
          <div>
            <div className="text-base font-bold text-[#1e293b]">Select Your Seat</div>
            {activeSM && (
              <div className="text-[0.78rem] text-[#64748b] mt-0.5">
                {flightOffer?.itineraries?.[0]?.segments?.[activeSegIdx]?.departure?.iataCode}
                {" → "}
                {flightOffer?.itineraries?.[0]?.segments?.[activeSegIdx]?.arrival?.iataCode}
              </div>
            )}
          </div>
          <button type="button" className="bg-none border-none text-[#64748b] cursor-pointer p-1 hover:bg-[#f1f5f9] hover:text-[#1e293b] rounded-md transition-colors" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Segment tabs */}
        {seatMaps.length > 1 && (
          <div className="flex border-b border-[#f1f5f9] overflow-x-auto whitespace-nowrap">
            {flightOffer?.itineraries?.[0]?.segments?.map((seg: any, i: number) => (
              <button
                key={i}
                type="button"
                className={cn(
                  "px-4 py-2.5 bg-none border-b-2 border-transparent text-[0.78rem] text-[#64748b] cursor-pointer transition-all",
                  activeSegIdx === i ? "text-[#0d9488] border-[#0d9488] font-semibold" : "hover:text-[#1e293b]"
                )}
                onClick={() => {
                  setActiveSegIdx(i);
                  setSelectedSeat(null);
                }}
              >
                Segment {i + 1}: {seg.departure?.iataCode} → {seg.arrival?.iataCode}
              </button>
            ))}
          </div>
        )}

        {/* Mock notice */}
        {isMock && phase === "ready" && (
          <div className="flex items-start gap-2 bg-[#eff6ff] border-b border-[#bfdbfe] px-6 py-2.5 text-[0.73rem] text-[#1d4ed8]">
            <Info size={13} className="mt-0.5" />
            <span>Showing illustrative seat layout — live seat data requires a booked itinerary on the production Amadeus environment.</span>
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 px-6 min-h-[300px]">
          {phase === "loading" && (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <Loader2 size={32} className="text-[#0d9488] animate-spin" />
              <p className="text-[#1e293b] font-medium text-[0.9rem]">Fetching seat availability from Amadeus…</p>
              <span className="text-[#94a3b8] text-[0.78rem]">This prices the offer first, then loads the aircraft layout</span>
            </div>
          )}
          {phase === "error" && (
            <div className="flex flex-col items-center gap-2 py-12 text-center text-[#dc2626]">
              <AlertCircle size={28} />
              <p>{errorMsg}</p>
            </div>
          )}
          {phase === "ready" && (
            <div className="flex flex-col gap-4">
              {Object.entries(cabinGroups).map(([cabin, rows]: [string, any]) => (
                <div key={cabin} className="flex flex-col gap-1.5">
                  <div
                    className="text-[0.62rem] font-extrabold text-white tracking-widest text-center px-2 py-0.5 rounded-md self-center mb-1 uppercase"
                    style={{ background: SEAT_COLORS[cabin] }}
                  >
                    {cabin.replace("_", " ")}
                  </div>
                  {rows.map((row: any) => {
                    const leftSeats = row.seats.filter((s: any) => ["A", "B", "C"].includes(s.col));
                    const rightSeats = row.seats.filter((s: any) => ["D", "E", "F"].includes(s.col));
                    return (
                      <div key={row.number} className="flex items-center gap-1.5 justify-center">
                        <span className="text-[0.65rem] text-[#94a3b8] w-[18px] text-center flex-shrink-0">{row.number}</span>
                        <div className="flex gap-1">
                          {leftSeats.map((seat: any) => (
                            <button
                              key={seat.id}
                              type="button"
                              disabled={!seat.available}
                              className={getSeatClassName(seat, row.cabin)}
                              title={`${seat.id} — ${SEAT_LABELS[seat.type] || seat.type}${seat.price > 0 ? ` — $${seat.price}` : ""}`}
                              onClick={() => setSelectedSeat(seat.id)}
                            >
                              {seat.col}
                            </button>
                          ))}
                        </div>
                        <div className="w-5 flex-shrink-0" />
                        <div className="flex gap-1">
                          {rightSeats.map((seat: any) => (
                            <button
                              key={seat.id}
                              type="button"
                              disabled={!seat.available}
                              className={getSeatClassName(seat, row.cabin)}
                              title={`${seat.id} — ${SEAT_LABELS[seat.type] || seat.type}${seat.price > 0 ? ` — $${seat.price}` : ""}`}
                              onClick={() => setSelectedSeat(seat.id)}
                            >
                              {seat.col}
                            </button>
                          ))}
                        </div>
                        <span className="text-[0.65rem] text-[#94a3b8] w-[18px] text-center flex-shrink-0">{row.number}</span>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {phase === "ready" && (
          <div className="p-4 px-6 border-t border-[#f1f5f9] flex items-center justify-between gap-4 flex-wrap bg-white">
            <div className="flex items-center gap-3 flex-wrap">
              {[
                { cls: "bg-[#ede9fe] border-[#7c3aed]", label: "Business" },
                { cls: "bg-[#f0fdfa] border-[#0891b2]", label: "Premium Eco" },
                { cls: "bg-[#e0fdf4] border-[#0d9488]", label: "Economy" },
                { cls: "bg-[#f1f5f9] border-[#e2e8f0]", label: "Occupied" },
                { cls: "bg-[#0d9488] border-[#0d9488]", label: "Selected" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-1.5 text-[0.68rem] text-[#64748b]">
                  <div className={cn("w-3 h-3 rounded-sm border", item.cls)} />
                  {item.label}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-3">
              {selectedSeat ? (
                <div className="flex items-center gap-1.5 text-[0.8rem] text-[#059669]">
                  <CheckCircle2 size={14} />
                  Seat <strong>{selectedSeat}</strong> selected
                </div>
              ) : (
                <div className="text-[0.8rem] text-[#94a3b8]">Select a seat above</div>
              )}
              <button
                type="button"
                className="px-[18px] py-2 bg-[#1e2d4f] text-white rounded-lg text-[0.82rem] font-semibold cursor-pointer hover:bg-[#263c68] disabled:opacity-45 disabled:cursor-not-allowed transition-all"
                disabled={!selectedSeat}
                onClick={handleConfirm}
              >
                Confirm Seat
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default SeatMap;
