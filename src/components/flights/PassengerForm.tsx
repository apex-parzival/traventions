"use client";

import React from "react";
import { User, Calendar, Globe, Briefcase, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface PassengerFormProps {
  index: number;
  data: any;
  onChange: (data: any) => void;
}

export default function PassengerForm({ index, data, onChange }: PassengerFormProps) {
  const handleChange = (field: string, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="card bg-white p-8 border border-slate-100 shadow-sm mb-6 rounded-3xl group hover:border-indigo-100 transition-all">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center font-black text-sm text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
          {index + 1}
        </div>
        <div>
          <h3 className="text-base font-black text-[#1e2d4f] tracking-tight">Passenger {index + 1} — Adult</h3>
          <p className="text-[0.65rem] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Primary Traveler Details</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-1.5 col-span-1">
          <label className="text-[0.65rem] font-black text-slate-400 uppercase ml-1">Title</label>
          <div className="relative">
            <select 
              className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-indigo-400 focus:bg-white transition-all appearance-none text-slate-900"
              value={data.title || "Mr"}
              onChange={(e) => handleChange("title", e.target.value)}
            >
              <option value="Mr">Mr.</option>
              <option value="Mrs">Mrs.</option>
              <option value="Ms">Ms.</option>
              <option value="Mstr">Master</option>
            </select>
            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>

        <div className="space-y-1.5 col-span-1">
          <label className="text-[0.65rem] font-black text-slate-400 uppercase ml-1">First & Middle Name</label>
          <input 
            type="text" 
            placeholder="e.g. JOHN MICHAEL"
            className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-indigo-400 focus:bg-white transition-all uppercase placeholder:text-slate-300"
            value={data.firstName || ""}
            onChange={(e) => handleChange("firstName", e.target.value)}
          />
        </div>

        <div className="space-y-1.5 col-span-1">
          <label className="text-[0.65rem] font-black text-slate-400 uppercase ml-1">Last Name (Surname)</label>
          <input 
            type="text" 
            placeholder="e.g. DOE"
            className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-indigo-400 focus:bg-white transition-all uppercase placeholder:text-slate-300"
            value={data.lastName || ""}
            onChange={(e) => handleChange("lastName", e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[0.65rem] font-black text-slate-400 uppercase ml-1">Date of Birth</label>
          <div className="relative">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="date" 
              className="w-full pl-11 pr-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-indigo-400 focus:bg-white transition-all text-slate-900" 
              value={data.dob || ""}
              onChange={(e) => handleChange("dob", e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[0.65rem] font-black text-slate-400 uppercase ml-1">Gender</label>
          <div className="flex gap-2">
            {['Male', 'Female'].map(g => (
              <button 
                key={g}
                type="button"
                className={cn(
                  "flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-widest border transition-all shadow-sm",
                  data.gender === g ? "bg-indigo-900 border-indigo-900 text-white shadow-xl shadow-indigo-900/10" : "bg-white border-slate-200 text-slate-400 hover:border-indigo-200"
                )}
                onClick={() => handleChange("gender", g)}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[0.65rem] font-black text-slate-400 uppercase ml-1">Nationality</label>
          <div className="relative">
            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <select 
               className="w-full pl-11 pr-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-bold outline-none appearance-none focus:border-indigo-400 focus:bg-white transition-all text-slate-900"
               value={data.nationality || "US"}
               onChange={(e) => handleChange("nationality", e.target.value)}
            >
              <option value="US">United States</option>
              <option value="AE">United Arab Emirates</option>
              <option value="GB">United Kingdom</option>
              <option value="IN">India</option>
            </select>
            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-slate-50 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1.5">
          <label className="text-[0.65rem] font-black text-slate-400 uppercase ml-1">Passport Number</label>
          <div className="relative">
             <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
             <input 
               type="text" 
               placeholder="Enter passport number"
               className="w-full pl-11 pr-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-indigo-400 focus:bg-white transition-all uppercase placeholder:text-slate-300"
               value={data.passportNumber || ""}
               onChange={(e) => handleChange("passportNumber", e.target.value)}
             />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-[0.65rem] font-black text-slate-400 uppercase ml-1">Passport Expiry</label>
          <div className="relative">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
               type="date" 
               className="w-full pl-11 pr-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-indigo-400 focus:bg-white transition-all text-slate-900" 
               value={data.passportExpiry || ""}
               onChange={(e) => handleChange("passportExpiry", e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
