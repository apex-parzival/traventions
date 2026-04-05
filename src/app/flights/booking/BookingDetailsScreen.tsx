import React from "react";
import { Plane, Check, Download, Mail, Eye, Info, Clock, AlertCircle, FileText, XCircle, FileInput, MapPin, Search, User } from "lucide-react";
import { cn } from "@/lib/utils";

export const BookingDetailsScreen = ({ 
   contactInfo, 
   passengers,
   passengerDetails,
   totalPrice, 
   flightOffer,
   selectedSeats,
   baggage,
   meals,
   passengerAddons,
   ancillariesCost,
   commission,
   onCompletePayment
}: { 
   contactInfo: any; 
   passengers: any[];
   passengerDetails: Record<number, any>;
   totalPrice: number; 
   flightOffer: any;
   selectedSeats?: any;
   baggage?: any;
   meals?: any;
   passengerAddons?: any;
   ancillariesCost?: number;
   commission?: number;
   onCompletePayment: () => void;
}) => {
   return (
      <div className="w-full max-w-6xl mx-auto py-8">
         {/* Warning Banner */}
         <div className="bg-amber-500 text-white p-3 rounded-xl mb-4 text-center font-bold shadow-sm flex justify-center items-center gap-2">
            <AlertCircle size={18} /> Booking On Hold - Payment Required
            <span className="text-xs font-medium ml-2">This booking will be cancelled if payment is not completed in 23h 45m</span>
         </div>

         <div className="flex gap-8 items-start">
            <div className="flex-1 space-y-4">
               {/* Simple Header */}
               <div className="flex justify-between items-end mb-6 border-b border-slate-200 pb-4">
                  <div>
                     <h1 className="text-2xl font-black text-[#1e2d4f] flex items-center gap-3">
                        TRV-2024-PL-2XU37 <CopyIcon className="w-5 h-5 text-slate-400 cursor-pointer hover:text-indigo-600" />
                     </h1>
                     <p className="text-[0.75rem] text-slate-500 font-medium">Booked on Dec 18, 2024 by Sarah Mitchell</p>
                  </div>
                  <div className="text-right flex gap-8">
                     <div>
                        <div className="text-[0.65rem] text-slate-400 font-bold uppercase tracking-widest mb-1">Total Amount</div>
                        <div className="text-xl font-black text-[#1e2d4f]">${totalPrice.toFixed(2)}</div>
                     </div>
                     <div>
                        <div className="text-[0.65rem] text-slate-400 font-bold uppercase tracking-widest mb-1">Status</div>
                        <div className="bg-amber-100 text-amber-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">Pending Payment</div>
                     </div>
                  </div>
               </div>

               {/* Flight Details block */}
               <AccordionItem title="Flight Details" icon={<Plane size={14} className="rotate-45" />} defaultOpen>
                  <div className="space-y-8">
                     {flightOffer.itineraries.map((itinerary: any, iIdx: number) => (
                        <div key={iIdx} className={cn(iIdx > 0 && "pt-8 border-t border-slate-100")}>
                           <div className="flex items-center gap-3 mb-4 text-sm font-black text-slate-900 border-b border-slate-50 pb-3">
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
                           <div className="flex justify-between items-center text-sm px-2">
                              <div>
                                 <div className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest mb-1">Departure</div>
                                 <div className="text-xl font-black text-[#1e2d4f] leading-none mb-1">
                                    {itinerary.segments[0].departure.at.split('T')[1].substring(0,5)}
                                 </div>
                                 <div className="text-[0.75rem] font-bold text-slate-900">{itinerary.segments[0].departure.iataCode}</div>
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
                                 <div className="text-[0.75rem] font-bold text-slate-900">{itinerary.segments[itinerary.segments.length-1].arrival.iataCode}</div>
                               </div>
                           </div>
                        </div>
                     ))}
                  </div>
               </AccordionItem>

               {/* Passengers Details */}
               <AccordionItem title={`Passenger Details (${passengers.length} Passengers)`} icon={<User size={14} />} defaultOpen>
                  {passengers.map((passenger, idx) => (
                     <div key={idx} className={cn("px-4 py-4 flex items-center justify-between text-sm", idx < passengers.length - 1 ? "border-b border-slate-100" : "")}>
                        <div className="flex items-start gap-4 w-full">
                           <span className="w-6 h-6 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center text-[0.65rem] font-bold shrink-0">{idx + 1}</span>
                           <div className="grid grid-cols-4 w-full gap-4">
                              <div>
                                 <div className="font-bold text-slate-900 mb-0.5">{passengerDetails[idx]?.firstName ? `${passengerDetails[idx].title || ''} ${passengerDetails[idx].firstName} ${passengerDetails[idx].lastName}` : 'Traveler'}</div>
                                 <div className="text-[0.65rem] text-slate-500 font-medium">{passenger.type}</div>
                              </div>
                              <div>
                                 <div className="text-[0.6rem] text-slate-400 font-bold uppercase mb-0.5">Ticket #</div>
                                 <div className="text-xs font-bold text-amber-500">Pending</div>
                              </div>
                              <div>
                                 <div className="text-[0.6rem] text-slate-400 font-bold uppercase mb-0.5">Seat</div>
                                 <div className="text-xs font-bold text-[#1e2d4f]">{selectedSeats?.[idx] || 'Pending'}</div>
                              </div>
                              <div className="text-right px-2">
                                 {idx === 0 && <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full text-[0.6rem] font-bold uppercase tracking-widest">Lead</span>}
                              </div>
                           </div>
                        </div>
                     </div>
                  ))}
               </AccordionItem>

               {/* Payment & Price Details */}
               <AccordionItem title="Payment & Price Details" icon={<Info size={14} />} defaultOpen>
                  <div className="flex justify-between items-start pt-2">
                     <div>
                        <div className="text-[0.65rem] text-slate-400 font-bold uppercase tracking-widest mb-1">Total Paid</div>
                        <div className="text-2xl font-black text-amber-500">$0.00</div>
                        <div className="text-[0.65rem] text-amber-500 font-medium mt-1">Payment is pending</div>
                     </div>
                     <div className="text-right">
                        <div className="text-[0.65rem] text-slate-400 font-bold uppercase tracking-widest mb-1">Payment Method</div>
                        <div className="text-sm font-bold text-slate-900">None selected</div>
                     </div>
                  </div>
                  <div className="border-t border-slate-100 mt-4 pt-4 text-right">
                     <button className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors">Show Breakdown +</button>
                  </div>
               </AccordionItem>
               
               {/* Contact Information */}
               <AccordionItem title="Contact Information" icon={<Info size={14} />} defaultOpen>
                  <div className="grid grid-cols-2 gap-6 text-sm">
                     <div>
                        <div className="text-[0.65rem] text-slate-400 font-bold uppercase mb-1">Primary Email</div>
                        <div className="font-bold text-slate-900">{contactInfo.primaryEmail || 'contact@company.com'}</div>
                     </div>
                     <div>
                        <div className="text-[0.65rem] text-slate-400 font-bold uppercase mb-1">Primary Phone</div>
                        <div className="font-bold text-slate-900">{contactInfo.primaryPhone || '+1 (555) 123-4567'}</div>
                     </div>
                  </div>
               </AccordionItem>

               {/* Documents */}
               <div className="card bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm mt-4">
                  <div className="bg-slate-50 p-4 border-b border-slate-100 flex items-center justify-between">
                     <div className="flex items-center gap-2">
                        <FileText size={16} className="text-slate-400" />
                        <h3 className="text-sm font-bold text-[#1e2d4f]">Documents</h3>
                     </div>
                     <button className="bg-[#1e2d4f] text-white px-3 py-1.5 rounded text-[0.65rem] font-bold">Download All</button>
                  </div>
                  <div className="p-6 grid grid-cols-3 gap-6">
                     <div className="border border-slate-200 rounded-xl p-6 text-center hover:border-[#1e2d4f] transition-all cursor-pointer group">
                        <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-3">
                           <FileText size={24} />
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 mb-1">E-Ticket</h4>
                        <div className="text-[0.65rem] text-amber-500 font-medium mb-3">Pending Payment</div>
                        <button className="text-[0.65rem] font-bold text-slate-400 group-hover:text-[#1e2d4f]" disabled>Download</button>
                     </div>
                     <div className="border border-slate-200 rounded-xl p-6 text-center hover:border-[#1e2d4f] transition-all cursor-pointer group">
                        <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                           <FileText size={24} />
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 mb-1">Invoice</h4>
                        <div className="text-[0.65rem] text-slate-500 font-medium mb-3">Created Dec 18</div>
                        <button className="text-[0.65rem] font-bold text-blue-600 group-hover:underline">Download</button>
                     </div>
                     <div className="border border-slate-200 rounded-xl p-6 text-center hover:border-[#1e2d4f] transition-all cursor-pointer group bg-emerald-50/30">
                        <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                           <Check size={24} strokeWidth={3} />
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 mb-1">Booking Confirmation</h4>
                        <div className="text-[0.65rem] text-emerald-600 font-medium mb-3">Ready</div>
                        <button className="text-[0.65rem] font-bold bg-[#1e2d4f] text-white px-3 py-1 rounded">Download</button>
                     </div>
                  </div>
               </div>

            </div>

            {/* Right Sidebar - Quick Actions */}
            <div className="w-[320px] shrink-0 sticky top-6">
               <div className="bg-white border-2 border-slate-100 rounded-xl shadow-lg shadow-slate-200/50 overflow-hidden mb-4 p-5">
                  <h3 className="text-xs font-bold text-[#1e2d4f] uppercase tracking-widest mb-4 flex items-center gap-2">
                     <Plane size={14} className="rotate-45" /> Quick Actions
                  </h3>
                  
                  <div className="space-y-3 mb-6">
                     <button className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold shadow-sm transition-all" onClick={onCompletePayment}>
                        Complete Payment
                     </button>
                     <button className="w-full py-3 bg-[#1e2d4f] hover:bg-indigo-950 text-white rounded-lg text-xs font-bold shadow-sm transition-all text-center">
                        Modify Booking
                     </button>
                     <button className="w-full py-3 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg text-xs font-bold shadow-sm transition-all">
                        Cancel Booking
                     </button>
                  </div>

                  <div className="space-y-3 pt-6 border-t border-slate-100">
                     <button className="w-full py-2 hover:bg-slate-50 text-slate-600 text-[0.7rem] font-bold rounded flex items-center gap-2">
                        <Mail size={14} className="text-slate-400" /> Email E-Ticket to Client
                     </button>
                     <button className="w-full py-2 hover:bg-slate-50 text-slate-600 text-[0.7rem] font-bold rounded flex items-center gap-2">
                        <Download size={14} className="text-slate-400" /> Download Agent Receipt
                     </button>
                  </div>
               </div>
               
               <div className="space-y-3 pl-4 border-l-2 border-slate-100 relative max-w-[260px] ml-4">
                  <div className="absolute -left-1.5 top-0 w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-white"></div>
                  <div className="pb-4">
                     <div className="text-[0.7rem] font-bold text-slate-900">Booking Created</div>
                     <div className="text-[0.6rem] text-slate-500">Dec 18, 2024 at 14:30 (EST)</div>
                     <div className="text-[0.6rem] text-slate-400 italic">By Sarah Mitchell (Agent)</div>
                  </div>

                  <div className="absolute -left-1.5 top-[60px] w-3 h-3 rounded-full bg-amber-500 ring-4 ring-white"></div>
                  <div className="pb-4 pt-1">
                     <div className="text-[0.7rem] font-bold text-amber-700">Payment Pending</div>
                     <div className="text-[0.6rem] text-amber-600">Pending payment processing</div>
                     <div className="text-[0.6rem] text-amber-600 font-bold mt-1">Expires Dec 19, 14:30 EST</div>
                  </div>

                  <div className="absolute -left-1.5 top-[135px] w-3 h-3 rounded-full bg-slate-200 ring-4 ring-white"></div>
                  <div className="pt-2 opacity-50">
                     <div className="text-[0.7rem] font-bold text-slate-900 line-through">E-Ticket Issued</div>
                     <div className="text-[0.6rem] text-slate-500">Awaiting payment to issue ticket</div>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
};

const AccordionItem = ({ title, icon, children, defaultOpen = false }: { title: string; icon: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean }) => {
   const [open, setOpen] = React.useState(defaultOpen);
   return (
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
         <div className="bg-slate-50 p-4 border-b border-slate-100 flex items-center justify-between cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => setOpen(!open)}>
            <div className="flex items-center gap-2">
               <span className="text-slate-400">{icon}</span>
               <h3 className="text-sm font-bold text-[#1e2d4f]">{title}</h3>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cn("text-slate-400 transition-transform duration-200", open ? "rotate-180" : "")}><path d="m6 9 6 6 6-6"/></svg>
         </div>
         {open && (
            <div className="p-6">
               {children}
            </div>
         )}
      </div>
   );
}

const CopyIcon = ({ className }: { className?: string }) => (
   <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
);
