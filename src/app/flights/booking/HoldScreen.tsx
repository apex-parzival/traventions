import React from "react";
import { Plane, Check, Download, Mail, Eye, Info, Clock, AlertCircle, User } from "lucide-react";
import { cn } from "@/lib/utils";

export const HoldScreen = ({ 
   contactInfo, 
   passengers,
   passengerDetails,
   totalPrice, 
   flightOffer,
   onCompletePayment
}: { 
   contactInfo: any; 
   passengers: any[];
   passengerDetails: Record<number, any>;
   totalPrice: number; 
   flightOffer: any;
   onCompletePayment: () => void;
}) => {
   return (
      <div className="w-full max-w-6xl mx-auto py-8">
         {/* Hold Banner */}
         <div className="bg-emerald-600 text-white p-3 rounded-xl mb-4 text-center font-bold shadow-sm border border-emerald-700 flex justify-center items-center gap-2">
            Hold Expires in: <span className="font-black text-lg">23:45:26</span> <span className="bg-white text-emerald-700 px-2 py-0.5 rounded text-[0.65rem] uppercase tracking-widest ml-2">Pay Now</span>
         </div>

         <div className="flex gap-8 items-start">
            <div className="flex-1 space-y-4">
               {/* Header Card */}
               <div className="bg-white border-2 border-amber-400 rounded-xl p-6 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-bl-[100px] -z-10"></div>
                  <div className="flex items-center gap-3 mb-6">
                     <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center">
                        <Clock size={20} />
                     </div>
                     <div>
                        <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">Booking On Hold <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded text-[0.65rem] uppercase tracking-wide">Action req</span></h2>
                        <p className="text-[0.75rem] text-slate-500 font-medium">Your flight has been reserved. Complete payment to confirm your booking.</p>
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div className="border border-slate-100 rounded-lg p-4 bg-slate-50">
                        <div className="text-[0.65rem] text-slate-400 font-bold uppercase tracking-widest mb-1">Booking Reference</div>
                        <div className="text-xl font-black text-[#1e2d4f] flex items-center gap-2">
                           TRV-24-H0X71
                           <CopyIcon className="w-4 h-4 text-slate-400" />
                        </div>
                     </div>
                     <div className="border border-slate-100 rounded-lg p-4 bg-slate-50">
                        <div className="text-[0.65rem] text-slate-400 font-bold uppercase tracking-widest mb-1">PNR</div>
                        <div className="text-xl font-black text-[#1e2d4f] flex items-center gap-2">
                           ABC 123
                           <CopyIcon className="w-4 h-4 text-slate-400" />
                        </div>
                     </div>
                  </div>
                  <div className="mt-4 flex gap-8 border-t border-slate-100 pt-4">
                     <div>
                        <div className="text-[0.65rem] text-slate-400 font-bold uppercase mb-1">Date Booked</div>
                        <div className="text-[0.75rem] font-bold text-slate-900">Dec 18, 2024 at 14:30 (EST)</div>
                     </div>
                     <div>
                        <div className="text-[0.65rem] text-slate-400 font-bold uppercase mb-1">Hold Expires</div>
                        <div className="text-[0.75rem] font-bold text-red-600">Dec 19, 2024 at 14:30 (EST)</div>
                     </div>
                  </div>
               </div>

               {/* Payment Info Banner */}
               <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start gap-3">
                  <AlertCircle size={16} className="text-amber-600 mt-0.5" />
                  <div>
                     <h3 className="text-sm font-bold text-amber-900">Payment Required</h3>
                     <p className="text-[0.7rem] text-amber-700 font-medium mt-1">Complete payment before the expiration time to ensure your reservation is completely stored.</p>
                  </div>
               </div>

               <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl flex items-start gap-3">
                  <Info size={16} className="text-blue-600 mt-0.5" />
                  <div>
                     <h3 className="text-sm font-bold text-blue-900">Reservation is locked</h3>
                     <p className="text-[0.7rem] text-blue-700 font-medium mt-1">We've secured the current fare and availability for this class.</p>
                  </div>
               </div>

               {/* Flight Summary */}
               <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                  <div className="bg-slate-50 p-4 border-b border-slate-100 flex items-center justify-between">
                     <div className="flex items-center gap-2">
                        <Plane size={14} className="rotate-45 text-slate-400" />
                        <h3 className="text-sm font-bold text-[#1e2d4f]">Flight Summary</h3>
                     </div>
                     <div className="text-[0.65rem] font-medium text-slate-500">Outbound: Dec 28, 2024</div>
                  </div>
                  <div className="p-6 space-y-6">
                     {flightOffer.itineraries.map((itinerary: any, iIdx: number) => (
                        <div key={iIdx} className={cn(iIdx > 0 && "pt-6 border-t border-slate-100")}>
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
                           <div className="flex justify-between items-center text-sm">
                              <div className="flex bg-slate-50 p-3 rounded-xl border border-slate-100 flex-1 justify-between items-center">
                                 <div>
                                    <div className="font-bold text-slate-900">{itinerary.segments[0].departure.iataCode}</div>
                                    <div className="text-[0.65rem] text-slate-500 font-medium mt-0.5">Dep: {itinerary.segments[0].departure.at.split('T')[1].substring(0,5)}</div>
                                 </div>
                                 <div className="px-4 flex-1 max-w-[120px]">
                                    <div className="flex items-center w-full">
                                       <div className="w-1 h-1 rounded-full bg-slate-400"></div>
                                       <div className="flex-1 border-t-2 border-slate-200 border-dashed relative">
                                          <Plane size={12} className="absolute left-1/2 top-[1px] -translate-y-1/2 -translate-x-1/2 rotate-90 text-slate-400" fill="currentColor"/>
                                       </div>
                                       <div className="w-1 h-1 rounded-full bg-slate-400"></div>
                                    </div>
                                    <div className="text-[0.6rem] font-bold text-slate-400 text-center mt-1">{itinerary.duration.substring(2)}</div>
                                 </div>
                                 <div className="text-right">
                                    <div className="font-bold text-slate-900">{itinerary.segments[itinerary.segments.length-1].arrival.iataCode}</div>
                                    <div className="text-[0.65rem] text-slate-500 font-medium mt-0.5">Arr: {itinerary.segments[itinerary.segments.length-1].arrival.at.split('T')[1].substring(0,5)}</div>
                                 </div>
                              </div>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>

               {/* Passengers Summary (Collapsible Style) */}
               <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                  <div className="p-4 border-b border-slate-100 flex items-center justify-between cursor-pointer hover:bg-slate-50">
                     <div className="flex items-center gap-2">
                        <User size={14} className="text-slate-400" />
                        <h3 className="text-sm font-bold text-[#1e2d4f]">Passenger Details</h3>
                     </div>
                     <div className="text-[0.65rem] font-medium text-slate-500 flex items-center gap-2">
                        {passengers.length} Passenger{passengers.length > 1 ? 's' : ''}
                     </div>
                  </div>
                  <div className="px-6 py-2 pb-6 space-y-3">
                     {passengers.map((p, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs border-b border-slate-50 pb-2 last:border-0 last:pb-0">
                           <div className="flex items-center gap-3">
                              <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[0.6rem] font-bold text-slate-500">{idx + 1}</div>
                              <div className="font-bold text-slate-900">
                                 {passengerDetails[idx]?.firstName ? `${passengerDetails[idx].title || ''} ${passengerDetails[idx].firstName} ${passengerDetails[idx].lastName}` : 'Traveler'}
                              </div>
                           </div>
                           <span className="text-[0.6rem] font-bold text-slate-400 uppercase">{p.type}</span>
                        </div>
                     ))}
                  </div>
               </div>

               {/* Automated Reminders */}
               <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm p-6">
                  <h3 className="text-sm font-bold text-[#1e2d4f] mb-4">Automated Reminders</h3>
                  <p className="text-[0.7rem] text-slate-500 font-medium mb-4">We will send reminders to your registered contacts:</p>
                  
                  <div className="space-y-3">
                     <div className="flex items-start gap-3 bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                        <Mail size={16} className="text-blue-500 mt-0.5" />
                        <div>
                           <div className="text-xs font-bold text-slate-900">Email Reminders</div>
                           <div className="text-[0.65rem] text-slate-500 font-medium mb-1">Sent to {contactInfo.primaryEmail || 'contact@company.com'}</div>
                           <ul className="text-[0.65rem] text-slate-400 font-medium list-disc ml-4 space-y-0.5">
                              <li>24 hours before hold expires (Dec 18, 14:30 EST)</li>
                              <li>2 hours before hold expires</li>
                           </ul>
                        </div>
                     </div>
                     
                     <div className="flex items-start gap-3 bg-emerald-50/50 p-3 rounded-lg border border-emerald-100">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500 mt-0.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                        <div>
                           <div className="text-xs font-bold text-slate-900">SMS Reminders</div>
                           <div className="text-[0.65rem] text-slate-500 font-medium mb-1">Sent to {contactInfo.primaryPhone || '+1 (555) 123-4567'}</div>
                           <ul className="text-[0.65rem] text-slate-400 font-medium list-disc ml-4 space-y-0.5">
                              <li>2 hours before hold expires</li>
                           </ul>
                        </div>
                     </div>
                  </div>
               </div>

               {/* What happens next */}
               <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm p-6 mb-8">
                  <h3 className="text-sm font-bold text-[#1e2d4f] mb-4">What Happens Next?</h3>
                  <div className="space-y-4">
                     <div className="flex gap-3 items-start">
                        <div className="w-6 h-6 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center text-xs font-bold shrink-0">1</div>
                        <div>
                           <div className="text-xs font-bold text-slate-900">Complete Payment</div>
                           <div className="text-[0.65rem] text-slate-500 mt-0.5">Pay the amount due before hold expiration to confirm your booking.</div>
                        </div>
                     </div>
                     <div className="flex gap-3 items-start">
                        <div className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-bold shrink-0">2</div>
                        <div>
                           <div className="text-xs font-bold text-slate-900">E-Tickets Issued</div>
                           <div className="text-[0.65rem] text-slate-500 mt-0.5">E-tickets will be generated within 15 minutes after payment.</div>
                        </div>
                     </div>
                  </div>
               </div>
               
               {/* Quick Actions Footer */}
               <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 text-center">
                  <h3 className="text-xs font-bold text-[#1e2d4f] mb-4">Quick Actions</h3>
                  <div className="flex justify-center gap-3 mb-4">
                     <button className="px-6 py-2.5 bg-[#1e2d4f] text-white text-xs font-bold rounded-lg shadow-sm" onClick={onCompletePayment}>Complete Payment</button>
                     <button className="px-6 py-2.5 bg-white border border-slate-300 text-slate-700 text-xs font-bold rounded-lg shadow-sm hover:bg-slate-50">View Full Details</button>
                     <button className="px-6 py-2.5 bg-white border border-slate-300 text-slate-700 text-xs font-bold rounded-lg shadow-sm hover:bg-slate-50 flex items-center gap-2"><Download size={12}/> Download PDF</button>
                     <button className="px-6 py-2.5 bg-white border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold rounded-lg shadow-sm">Cancel Hold</button>
                  </div>
                  <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg flex items-center justify-between text-left inline-flex w-full max-w-lg">
                     <div>
                        <div className="text-[0.65rem] font-bold text-blue-800 mb-0.5">Need Help?</div>
                        <div className="text-[0.65rem] text-blue-600 font-medium">Our support team is available 24/7 to assist with your booking</div>
                     </div>
                     <button className="px-4 py-1.5 bg-blue-600 text-white text-[0.6rem] font-bold rounded hover:bg-blue-700">Contact Support</button>
                  </div>
               </div>
            </div>

            {/* Right Sidebar */}
            <div className="w-[320px] shrink-0 sticky top-6">
               <div className="bg-white border-2 border-amber-400 rounded-xl shadow-lg shadow-amber-900/5 overflow-hidden mb-4">
                  <div className="bg-amber-50 p-4 border-b border-amber-100 flex items-center gap-2">
                     <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-600"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
                     <h3 className="text-xs font-bold text-amber-900 uppercase tracking-widest">Hold Payment</h3>
                  </div>
                  <div className="p-6 text-center">
                     <div className="text-[0.65rem] text-slate-500 font-bold uppercase tracking-widest mb-1">Total Amount</div>
                     <div className="text-3xl font-black text-[#1e2d4f]">${totalPrice.toFixed(2)}</div>
                     <p className="text-[0.65rem] text-slate-400 font-medium mt-1 mb-6">Payment required to secure booking</p>

                     <button className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-black uppercase tracking-widest shadow-md transition-all flex items-center justify-center gap-2" onClick={onCompletePayment}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg> Complete Payment Now
                     </button>
                     <p className="text-[0.6rem] text-slate-400 font-medium mt-3 flex items-center justify-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-lock"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg> Secure payment processed by Stripe
                     </p>
                  </div>
               </div>

               {/* Why hold? info box */}
               <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                  <h4 className="text-xs font-bold text-slate-900 mb-3 flex items-center gap-2">
                     <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#1e2d4f]"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                     Why book on hold?
                  </h4>
                  <ul className="text-[0.65rem] text-slate-600 space-y-2 font-medium">
                     <li className="flex gap-2 items-start"><Check size={12} className="text-emerald-500 shrink-0 mt-0.5" /> Secures current fare prices</li>
                     <li className="flex gap-2 items-start"><Check size={12} className="text-emerald-500 shrink-0 mt-0.5" /> Time to arrange payment or approvals</li>
                     <li className="flex gap-2 items-start"><Check size={12} className="text-emerald-500 shrink-0 mt-0.5" /> Guaranteed cabin availability</li>
                     <li className="flex gap-2 items-start"><Check size={12} className="text-emerald-500 shrink-0 mt-0.5" /> Prevent multiple options from vanishing</li>
                  </ul>
               </div>
            </div>
         </div>
      </div>
   );
};

const CopyIcon = ({ className }: { className?: string }) => (
   <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
);
