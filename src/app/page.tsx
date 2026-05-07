"use client";

import React from "react";
import { Plane, Hotel, Car, ArrowRight, Shield, Globe, Clock } from "lucide-react";
import Link from "next/link";

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

  const services = [
    { title: "Flights", icon: <Plane size={32} />, path: "/flights", color: "rgba(56, 189, 248, 0.1)" },
    { title: "Hotels", icon: <Hotel size={32} />, path: "/hotels", color: "rgba(168, 85, 247, 0.1)" },
    { title: "Transfers", icon: <Car size={32} />, path: "/cabs", color: "rgba(34, 197, 94, 0.1)" },
  ];

  return (
    <div className="pb-20">
      {/* Hero Section */}
      <section
        className="relative h-[90vh] flex items-center overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(2, 6, 23, 0.5), #020617), url('https://images.unsplash.com/photo-1436491865332-7a61a109c0f?auto=format&fit=crop&w=1920&q=80')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="max-w-[1200px] mx-auto px-8 w-full relative z-10">
          <div className="max-w-2xl" style={{ animation: "fadeUp 0.8s ease forwards" }}>
            <h1
              className="text-7xl font-extrabold leading-[1.1] mb-8"
              style={{
                background: "linear-gradient(135deg, #ffffff 0%, #38bdf8 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Explore the World <br />With Traventions
            </h1>
            <p className="text-xl mb-12" style={{ color: "#94a3b8" }}>
              Your premium gateway to unforgettable journeys. Discover flights, hotels, and luxury transfers in one seamless experience.
            </p>
            <div className="flex gap-6 flex-wrap">
              <Link
                href="/flights"
                className="flex items-center gap-2 px-8 py-4 rounded-xl font-bold transition-all"
                style={{ background: "#38bdf8", color: "#0f172a" }}
              >
                Book a Flight <ArrowRight size={18} />
              </Link>
              <button
                className="px-8 py-4 rounded-xl font-bold transition-all"
                style={{ background: "rgba(255,255,255,0.05)", color: "#fff", border: "1px solid rgba(255,255,255,0.1)" }}
              >
                View Packages
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="max-w-[1200px] mx-auto px-8 mt-24">
        <div className="text-center mb-16">
          <h2
            className="text-5xl font-bold mb-4"
            style={{
              background: "linear-gradient(90deg, #ffffff, #38bdf8)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Our Services
          </h2>
          <p style={{ color: "#94a3b8" }}>Everything you need for your next adventure</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service) => (
            <Link
              key={service.title}
              href={service.path}
              className="glass-card flex flex-col items-center text-center p-8 group hover:scale-105 transition-transform"
            >
              <div
                className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6 transition-all"
                style={{ backgroundColor: service.color, color: "#38bdf8" }}
              >
                {service.icon}
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">{service.title}</h3>
              <p className="mb-6" style={{ color: "#94a3b8" }}>
                Find the best {service.title.toLowerCase()} deals with instant booking.
              </p>
              <span className="flex items-center gap-2 font-semibold text-sm" style={{ color: "#38bdf8" }}>
                Get Started <ArrowRight size={16} />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Features section */}
      <section className="mt-32 py-24" style={{ background: "#1e293b" }}>
        <div className="max-w-[1200px] mx-auto px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            {features.map((f, i) => (
              <div key={i} className="text-center">
                <div
                  className="mb-6 inline-block p-4 rounded-full"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                >
                  {f.icon}
                </div>
                <h4 className="text-xl font-bold mb-3 text-white">{f.title}</h4>
                <p style={{ color: "#94a3b8", fontSize: "0.95rem" }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
