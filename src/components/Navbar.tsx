"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Plane, Hotel, Car, Home, Phone, Brain, Compass, Settings, Menu, X, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "Flights", path: "/flights", icon: Plane },
  { name: "Hotels", path: "/hotels", icon: Hotel },
  { name: "Cabs", path: "/cabs", icon: Car },
  { name: "Tours", path: "/tours", icon: Compass },
  { name: "Transfers", path: "/transfers", icon: Car },
  { name: "Intelligence", path: "/intelligence", icon: Brain },
  { name: "Tools", path: "/tools", icon: Settings },
];

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-[1000] transition-all duration-500 py-6",
        scrolled ? "bg-slate-950/80 backdrop-blur-xl border-b border-white/10 py-4" : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto px-8 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center text-slate-950 font-black text-xl shadow-lg shadow-teal-500/20 group-hover:scale-110 transition-transform">
            T
          </div>
          <span className="text-2xl font-black tracking-tighter text-white italic">Traventions</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-1 bg-white/5 border border-white/10 p-1.5 rounded-full backdrop-blur-md">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.name}
                href={item.path}
                className={cn(
                  "flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all relative",
                  isActive ? "text-slate-950" : "text-slate-400 hover:text-white"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute inset-0 bg-white rounded-full"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <item.icon size={18} className="relative z-10" />
                <span className="relative z-10">{item.name}</span>
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-4">
          <button className="hidden sm:flex items-center gap-2 bg-white text-slate-950 px-6 py-3 rounded-xl font-black text-sm hover:bg-teal-500 hover:text-white transition-all shadow-lg active:scale-95">
            <Phone size={18} />
            Contact Specialist
          </button>
          
          <button 
            className="lg:hidden text-white p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-slate-900 border-b border-white/10 overflow-hidden"
          >
            <div className="p-8 flex flex-col gap-4">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-xl text-lg font-bold transition-all",
                    pathname === item.path ? "bg-teal-500 text-slate-950" : "text-slate-400 hover:bg-white/5"
                  )}
                >
                  <item.icon size={24} />
                  {item.name}
                </Link>
              ))}
              <div className="pt-4 border-t border-white/5 mt-4">
                <button className="w-full bg-white text-slate-950 py-4 rounded-xl font-black">
                  Call Now
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
