import React from "react";
import Link from 'next/link';
import { Plane, Check, Download, Mail, Eye, Printer, User, Clock, Building, Car, Plus, ExternalLink, CalendarDays, Home, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export const ConfirmationScreen = ({ 
   contactInfo, 
   passengers,
   passengerDetails,
   totalPrice, 
   flightOffer,
   onViewDetails
}: { 
   contactInfo: any; 
   passengers: any[];
   passengerDetails: Record<number, any>;
   totalPrice: number; 
   flightOffer: any;
   onViewDetails: () => void;
}) => {
   return (
      <div className="w-full max-w-4xl mx-auto py-8">
         {/* Success Header */}
         <div className="flex flex-col items-center mb-8 text-center border-b border-slate-100 pb-8">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mb-4 shadow-sm border-4 border-white ring-1 ring-slate-100">
               <Check size={32} strokeWidth={3} />
            </div>
            <h1 className="text-3xl font-black text-[#1e2d4f] mb-2 tracking-tight">Booking Confirmed!</h1>
            <p className="text-sm font-medium text-slate-500">Your flight has been successfully booked</p>
         </div>

         {/* Reference Blocks */}
         <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white border-2 border-emerald-500 rounded-xl p-5 relative overflow-hidden shadow-sm">
               <div className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest text-center mb-2">PNR Number</div>
               <div className="flex items-center justify-center gap-2">
                  <div className="text-2xl font-black text-emerald-600 tracking-widest">ABC123XY</div>
                  <CopyIcon className="w-4 h-4 text-slate-400 cursor-pointer hover:text-emerald-500" />
               </div>
               <div className="text-[0.65rem] text-slate-500 text-center font-medium mt-2">Use this for check-in and modifications</div>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm text-center flex flex-col justify-center">
               <div className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest mb-2">Booking ID</div>
               <div className="flex items-center justify-center gap-2">
                  <div className="text-lg font-black text-[#1e2d4f]">TRV-2024-UA2045</div>
                  <CopyIcon className="w-3 h-3 text-slate-400 cursor-pointer hover:text-[#1e2d4f]" />
               </div>
               <div className="text-[0.65rem] text-slate-500 font-medium mt-1">Internal reference number</div>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm text-center flex flex-col justify-center">
               <div className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest mb-1">Commission Earned</div>
               <div className="text-2xl font-black text-emerald-600">${(totalPrice * 0.07).toFixed(2)}</div>
               <div className="text-[0.65rem] text-slate-500 font-medium mt-1">8% on base fare</div>
            </div>
         </div>

         {/* Email Sent Banner */}
         <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 mb-6 flex items-start gap-4 shadow-sm">
            <div className="bg-blue-100 text-blue-600 p-2 rounded-lg shrink-0 mt-1">
               <Mail size={16} />
            </div>
            <div>
               <h3 className="text-sm font-bold text-slate-900 mb-1">E-Ticket Sent Successfully</h3>
               <p className="text-[0.7rem] text-slate-600 mb-3 font-medium">Your e-ticket and booking confirmation have been sent to:</p>
               <div className="flex gap-2 flex-wrap mb-2">
                  <span className="bg-white border border-blue-100 px-3 py-1 rounded-full text-[0.65rem] font-bold text-blue-700 shadow-sm flex items-center gap-1.5"><Mail size={10}/> {contactInfo.primaryEmail || 'contact@company.com'}</span>
                  {contactInfo.additionalEmails && contactInfo.additionalEmails.split(',').map((email: string, i: number) => email.trim() && (
                     <span key={i} className="bg-white border border-blue-100 px-3 py-1 rounded-full text-[0.65rem] font-bold text-blue-700 shadow-sm flex items-center gap-1.5"><Mail size={10}/> {email.trim()}</span>
                  ))}
               </div>
               <p className="text-[0.65rem] text-slate-500 font-medium italic">Please check your inbox and span folder. If you haven't received the email within 15 minutes, use the buttons below to resend.</p>
            </div>
         </div>

         {/* Flight Summary Strip */}
         <div className="bg-white border border-slate-200 rounded-xl overflow-hidden mb-4 shadow-sm">
            <div className="bg-slate-50 p-3 border-b border-slate-100 flex items-center gap-2">
               <Plane size={14} className="rotate-45 text-slate-400" />
               <h3 className="text-xs font-bold text-[#1e2d4f] uppercase tracking-widest">Flight Summary</h3>
            </div>
            <div className="p-5 space-y-8">
               {flightOffer.itineraries.map((itinerary: any, iIdx: number) => (
                  <div key={iIdx} className={cn(iIdx > 0 && "pt-8 border-t border-slate-100")}>
                     <div className="flex items-center gap-3 mb-4 text-sm font-black text-slate-900">
                        <div className="w-8 h-8 p-1 bg-white border border-slate-100 rounded-lg flex items-center justify-center overflow-hidden shrink-0">
                           <img 
                              src={`https://pics.avs.io/40/40/${itinerary.segments[0].carrierCode}.png`} 
                              alt={itinerary.segments[0].carrierCode}
                              className="w-full h-full object-contain"
                           />
                        </div>
                        {itinerary.segments[0].carrierCode} {itinerary.segments[0].number}
                        <span className="text-slate-400 text-[0.65rem] font-bold ml-1">Leg {iIdx + 1}</span>
                        <span className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded text-[0.6rem] uppercase tracking-wide ml-auto">
                           {itinerary.segments.length > 1 ? `${itinerary.segments.length - 1} Stop` : "Non-stop"}
                        </span>
                     </div>
                     <div className="flex justify-between items-center mb-6">
                        <div>
                           <div className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest mb-1">Departure</div>
                           <div className="text-xl font-black text-[#1e2d4f] leading-none mb-1">
                              {itinerary.segments[0].departure.at.split('T')[1].substring(0,5)}
                           </div>
                           <div className="text-xs font-bold text-slate-900">{itinerary.segments[0].departure.iataCode}</div>
                        </div>
                        <div className="flex-1 px-8">
                           <div className="text-[0.65rem] text-slate-400 font-medium text-center mb-1">Duration</div>
                           <div className="flex items-center w-full">
                              <div className="w-1.5 h-1.5 rounded-full bg-[#1e2d4f]"></div>
                              <div className="flex-1 border-t-2 border-slate-200 relative">
                                 <Plane size={14} className="absolute left-1/2 top-[1px] -translate-y-1/2 -translate-x-1/2 rotate-90 text-[#1e2d4f]" fill="currentColor"/>
                              </div>
                              <div className="w-1.5 h-1.5 rounded-full bg-[#1e2d4f]"></div>
                           </div>
                           <div className="text-[0.65rem] font-bold text-slate-900 text-center mt-1">{itinerary.duration.substring(2)}</div>
                        </div>
                        <div className="text-right">
                           <div className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest mb-1">Arrival</div>
                           <div className="text-xl font-black text-[#1e2d4f] leading-none mb-1">
                              {itinerary.segments[itinerary.segments.length-1].arrival.at.split('T')[1].substring(0,5)}
                           </div>
                           <div className="text-xs font-bold text-slate-900">{itinerary.segments[itinerary.segments.length-1].arrival.iataCode}</div>
                        </div>
                     </div>
                  </div>
               ))}
               <div className="flex gap-4 items-center pt-4 border-t border-slate-100 text-[0.7rem] text-slate-600">
                  <div className="flex items-center gap-1.5 font-bold"><CalendarDays size={14} className="text-slate-400" /> First Leg: <span className="text-slate-900">{new Date(flightOffer.itineraries[0].segments[0].departure.at).toLocaleDateString()}</span></div>
                  <div className="bg-slate-300 w-1 h-1 rounded-full"></div>
                  <div className="flex items-center gap-1.5 font-bold"><User size={14} className="text-slate-400" /> Cabin: <span className="text-slate-900">Economy</span></div>
                  <div className="bg-slate-300 w-1 h-1 rounded-full"></div>
                  <div className="flex items-center gap-1.5 font-bold"><User size={14} className="text-slate-400" /> Passengers: <span className="text-slate-900">{passengers.length} ({[...new Set(passengers.map(p => p.type))].join(', ')})</span></div>
               </div>
            </div>
         </div>

         {/* Passengers Strip */}
         <div className="bg-white border border-slate-200 rounded-xl overflow-hidden mb-6 shadow-sm">
            <div className="bg-slate-50 p-3 border-b border-slate-100 flex items-center gap-2">
               <User size={14} className="text-slate-400" />
               <h3 className="text-xs font-bold text-[#1e2d4f] uppercase tracking-widest">Passengers</h3>
            </div>
            <div>
               {passengers.map((passenger, idx) => (
                  <div key={idx} className={cn("px-5 py-3 flex items-center justify-between text-sm", idx < passengers.length - 1 ? "border-b border-slate-100" : "")}>
                     <div className="flex items-center gap-4">
                        <span className="text-[0.65rem] font-bold text-slate-400 w-4">{idx + 1}</span>
                        <span className="font-bold text-slate-900">{passengerDetails[idx]?.firstName ? `${passengerDetails[idx].title || ''} ${passengerDetails[idx].firstName} ${passengerDetails[idx].lastName}` : 'Traveler'}</span>
                        <span className="text-[0.65rem] bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-medium">{passenger.type}</span>
                     </div>
                  </div>
               ))}
            </div>
         </div>

         {/* Quick Actions */}
         <div className="grid grid-cols-3 gap-3 mb-3">
            <button className="flex items-center justify-center gap-2 bg-[#1e2d4f] hover:bg-slate-800 text-white py-3 rounded-lg text-xs font-bold transition-colors">
               <Download size={14} /> Download E-ticket
            </button>
            <button className="flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-lg text-xs font-bold transition-colors">
               <Mail size={14} /> Email E-ticket
            </button>
            <button className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg text-xs font-bold transition-colors shadow-sm" onClick={onViewDetails}>
               <Eye size={14} /> View Booking Details
            </button>
         </div>
         <div className="grid grid-cols-3 gap-3 mb-8">
            <button 
               className="flex items-center justify-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 py-3 rounded-lg text-xs font-bold transition-colors"
               onClick={() => window.print()}
            >
               <Printer size={14} /> Print
            </button>
            <Link href="/flights" className="flex items-center justify-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 py-3 rounded-lg text-xs font-bold transition-colors">
               <Plane size={14} className="rotate-45" /> Book Another Flight
            </Link>
            <Link href="/" className="flex items-center justify-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 py-3 rounded-lg text-xs font-bold transition-colors">
               <Home size={14} /> Go to Dashboard
            </Link>
         </div>

         {/* What's Next Timeline */}
         <div className="bg-white border border-slate-200 rounded-xl overflow-hidden mb-6 shadow-sm">
            <div className="bg-slate-50 p-4 border-b border-slate-100 flex items-center gap-2">
               <Clock size={16} className="text-slate-400" />
               <h3 className="text-sm font-bold text-[#1e2d4f]">What's Next?</h3>
            </div>
            <div className="p-6 space-y-6">
               <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0">
                     <Check size={14} strokeWidth={3} />
                  </div>
                  <div>
                     <div className="text-sm font-bold text-slate-900">Check Your Email</div>
                     <div className="text-[0.7rem] text-slate-500 font-medium">Your e-ticket and booking confirmation have been sent to all recipients.</div>
                  </div>
               </div>
               <div className="flex gap-4 relative before:absolute before:left-4 before:-top-5 before:-bottom-1 before:w-[1.5px] before:bg-slate-100 before:-z-10 z-10">
                  <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-500 flex items-center justify-center text-xs font-bold shrink-0">
                     2
                  </div>
                  <div>
                     <div className="text-sm font-bold text-slate-900">Web Check-in Opens 24 Hours Before Departure</div>
                     <div className="text-[0.7rem] text-slate-500 font-medium">Use your PNR number to check in online and select your preferred seats.</div>
                  </div>
               </div>
               <div className="flex gap-4 relative before:absolute before:left-4 before:-top-5 before:bottom-6 before:w-[1.5px] before:bg-slate-100 before:-z-10 z-10">
                  <div className="w-8 h-8 rounded-full bg-amber-50 border border-amber-100 text-amber-500 flex items-center justify-center text-xs font-bold shrink-0">
                     3
                  </div>
                  <div>
                     <div className="text-sm font-bold text-slate-900">Arrive at Airport 2-3 Hours Before Departure</div>
                     <div className="text-[0.7rem] text-slate-500 font-medium">Ensure you have all travel documents including passport and visa (if required).</div>
                  </div>
               </div>
            </div>
         </div>

         {/* Add to Calendar */}
         <div className="bg-white border border-slate-200 rounded-xl overflow-hidden mb-8 shadow-sm">
            <div className="bg-slate-50 p-4 border-b border-slate-100 flex items-center gap-2">
               <CalendarDays size={16} className="text-blue-500" />
               <h3 className="text-sm font-bold text-[#1e2d4f]">Add to Calendar</h3>
            </div>
            <div className="p-4 flex items-center justify-between">
               <span className="text-[0.75rem] font-medium text-slate-500">Never miss your flight - add this booking to your calendar</span>
               <div className="flex gap-3">
                  <button className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 hover:bg-slate-50 rounded-md text-[0.65rem] font-bold text-slate-700">
                     <span className="text-blue-500 font-black">G</span> Add to Google Calendar
                  </button>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 hover:bg-slate-50 rounded-md text-[0.65rem] font-bold text-slate-700">
                     <span className="text-blue-600 font-black">#</span> Add to Outlook
                  </button>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 hover:bg-slate-50 rounded-md text-[0.65rem] font-bold text-slate-700">
                     <Download size={10} /> Download .ics
                  </button>
               </div>
            </div>
         </div>

         {/* Complete Your Trip */}
         <h2 className="text-lg font-black text-[#1e2d4f] mb-4">Complete Your Trip</h2>
         <div className="grid grid-cols-2 gap-6">
            <div className="border border-slate-200 rounded-xl overflow-hidden group hover:border-[#1e2d4f] transition-all cursor-pointer">
               <div className="bg-[#1e2d4f] p-8 flex justify-center text-white/50 group-hover:text-white transition-colors">
                  <Building size={48} strokeWidth={1.5} />
               </div>
               <div className="p-5 bg-white">
                  <h3 className="text-sm font-bold text-slate-900 mb-1">Book Your Hotel in Los Angeles</h3>
                  <p className="text-[0.7rem] text-slate-500 mb-4 line-clamp-2">Find the perfect accommodation for your stay. Special rates available for flight passengers.</p>
                  <button className="w-full py-2 bg-[#1e2d4f] text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2">
                     <Search size={14} /> Search Hotels in Los Angeles
                  </button>
               </div>
            </div>
            <div className="border border-slate-200 rounded-xl overflow-hidden group hover:border-emerald-600 transition-all cursor-pointer">
               <div className="bg-emerald-600 p-8 flex justify-center text-white/50 group-hover:text-white transition-colors">
                  <Car size={48} strokeWidth={1.5} />
               </div>
               <div className="p-5 bg-white">
                  <h3 className="text-sm font-bold text-slate-900 mb-1">Book Airport Transfer</h3>
                  <p className="text-[0.7rem] text-slate-500 mb-4 line-clamp-2">Pre-book your airport pickup and enjoy hassle-free arrival at your destination.</p>
                  <button className="w-full py-2 bg-teal-600 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2">
                     <Search size={14} /> Search Transfers in Los Angeles
                  </button>
               </div>
            </div>
         </div>
      </div>
   );
};

const CopyIcon = ({ className }: { className?: string }) => (
   <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
);
