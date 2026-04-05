"use client";

import React from "react";
import { motion } from "framer-motion";
import { Plane, Hotel, Car, ArrowRight, Shield, Globe, Clock } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function Home() {
  const features = [
    {
      icon: <Shield className="text-[#38bdf8]" />,
      title: "Secure Booking",
      desc: "Your data is protected with enterprise-grade security.",
    },
    {
      icon: <Globe className="text-[#38bdf8]" />,
      title: "Global Reach",
      desc: "Access thousands of destinations worldwide instantly.",
    },
    {
      icon: <Clock className="text-[#38bdf8]" />,
      title: "24/7 Support",
      desc: "Our travel experts are always here to help you.",
    },
  ];

  return (
    <div className="pb-20">
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center -mt-20 overflow-hidden">
        <div 
          className="absolute inset-0 z-[-1] bg-cover bg-center"
          style={{
            backgroundImage: `linear-gradient(to bottom, rgba(2, 6, 23, 0.4), #020617), url('https://images.unsplash.com/photo-1436491865332-7a61a109c0f?auto=format&fit=crop&w=1920&q=80')`
          }}
        />
        <div className="max-w-[1200px] mx-auto px-8 z-10 w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl"
          >
            <h1 className="text-7xl font-extrabold leading-[1.1] mb-8 bg-gradient-to-br from-white to-[#38bdf8] bg-clip-text text-transparent">
              Explore the World <br />With Traventions
            </h1>
            <p className="text-xl text-[#94a3b8] mb-12">
              Your premium gateway to unforgettable journeys. Discover flights, hotels, and luxury transfers in one seamless experience.
            </p>
            <div className="flex gap-6">
              <Link href="/flights" className="bg-[#38bdf8] text-[#0f172a] px-8 py-4 rounded-xl font-bold flex items-center gap-2 hover:bg-[#0ea5e9] hover:-translate-y-1 transition-all shadow-xl shadow-[#38bdf8]/20">
                Book a Flight <ArrowRight size={18} />
              </Link>
              <button className="bg-white/5 text-white px-8 py-4 rounded-xl font-bold border border-white/10 hover:bg-white/10 transition-all">
                View Packages
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="max-w-[1200px] mx-auto px-8 mt-24">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-white to-[#38bdf8] bg-clip-text text-transparent">Our Services</h2>
          <p className="text-[#94a3b8]">Everything you need for your next adventure</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: "Flights", icon: <Plane size={32} />, path: "/flights", color: "rgba(56, 189, 248, 0.1)" },
            { title: "Hotels", icon: <Hotel size={32} />, path: "/hotels", color: "rgba(168, 85, 247, 0.1)" },
            { title: "Transfers", icon: <Car size={32} />, path: "/cabs", color: "rgba(34, 197, 94, 0.1)" },
          ].map((service, i) => (
            <motion.div
              key={service.title}
              whileHover={{ scale: 1.05 }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Link href={service.path} className="glass-card flex flex-col items-center text-center p-8 group">
                <div 
                  className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6 text-[#38bdf8] transition-all"
                  style={{ backgroundColor: service.color }}
                >
                  {service.icon}
                </div>
                <h3 className="text-2xl font-bold mb-4">{service.title}</h3>
                <p className="text-[#94a3b8] mb-6">Find the best {service.title.toLowerCase()} deals with instant booking.</p>
                <span className="text-[#38bdf8] flex items-center gap-2 font-semibold text-sm group-hover:gap-3 transition-all">
                  Get Started <ArrowRight size={16} />
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features section */}
      <section className="bg-[#1e293b] mt-32 py-24">
        <div className="max-w-[1200px] mx-auto px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            {features.map((f, i) => (
              <div key={i} className="text-center">
                <div className="mb-6 inline-block p-4 bg-white/5 rounded-full border border-white/10">
                  {f.icon}
                </div>
                <h4 className="text-xl font-bold mb-3">{f.title}</h4>
                <p className="text-[#94a3b8] text-[0.95rem]">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
