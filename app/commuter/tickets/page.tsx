"use client";

import { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft, Ticket, Plus, Minus, Check, Bus, Search,
  QrCode, Clock, ShieldCheck, Download, History, Sparkles,
  ChevronRight, RefreshCw, AlertCircle, ArrowUpRight, Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ── Initial Mock Tickets / Trips History (RailOne / Challo style) ── */
const INITIAL_ACTIVE_TICKETS = [
  {
    id: "TKT-BEST-98231",
    routeNumber: "312",
    operator: "BEST AC Express",
    from: "Dadar TT",
    to: "Andheri East",
    passengerCount: 1,
    type: "Single Ticket (AC)",
    fare: 25,
    issuedAt: "Today, 08:30 AM",
    validUntil: "Today, 11:59 PM",
    qrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=TKT-BEST-98231",
    status: "ACTIVE"
  }
];

const PAST_TRIPS = [
  {
    id: "TKT-BEST-77120",
    routeNumber: "C-40",
    operator: "BEST AC Direct",
    from: "CSMT Station",
    to: "World Trade Center",
    fare: 15,
    date: "Yesterday, 06:15 PM",
    status: "COMPLETED"
  },
  {
    id: "TKT-BEST-65490",
    routeNumber: "101",
    operator: "BEST Non-AC",
    from: "Colaba Depot",
    to: "Worli Naka",
    fare: 10,
    date: "22 July 2026",
    status: "COMPLETED"
  },
  {
    id: "TKT-BEST-51204",
    routeNumber: "A-100",
    operator: "BEST AC Express",
    from: "Churchgate",
    to: "Nariman Point",
    fare: 20,
    date: "20 July 2026",
    status: "COMPLETED"
  }
];

function TicketsContent() {
  const searchParams = useSearchParams();
  const routeParam = searchParams?.get("route") || "";
  const fromParam = searchParams?.get("from") || "";
  const toParam = searchParams?.get("to") || "";

  // 3 Primary Tabs: "active" | "history" | "book"
  const [activeTab, setActiveTab] = useState<"active" | "history" | "book">(
    routeParam || fromParam || toParam ? "book" : "active"
  );

  const [activeTickets, setActiveTickets] = useState(INITIAL_ACTIVE_TICKETS);
  const [showQRModal, setShowQRModal] = useState<any>(null);

  // Booking Form State
  const [route, setRoute] = useState("");
  const [fromStop, setFromStop] = useState("");
  const [toStop, setToStop] = useState("");
  const [isAC, setIsAC] = useState(true);
  const [passType, setPassType] = useState<"single" | "daily" | "monthly">("single");
  const [quantity, setQuantity] = useState(1);
  const [bookedTicket, setBookedTicket] = useState<any>(null);

  const [availableRoutes, setAvailableRoutes] = useState<any[]>([]);
  const [selectedRouteObj, setSelectedRouteObj] = useState<any>(null);
  const [loadingRoutes, setLoadingRoutes] = useState(true);

  // Fetch routes list for booking
  useEffect(() => {
    const fetchAllRoutes = async () => {
      setLoadingRoutes(true);
      try {
        const res = await fetch("/api/routes");
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setAvailableRoutes(json.data);
          
          const match = json.data.find((r: any) => {
            const name = r.legs?.[0] ? `${r.legs[0].operator} ${r.legs[0].route_number}` : "";
            return name.toLowerCase().includes(routeParam.toLowerCase()) || routeParam.toLowerCase().includes(name.toLowerCase());
          });

          if (match) {
            setSelectedRouteObj(match);
            const name = match.legs?.[0] ? `${match.legs[0].operator} ${match.legs[0].route_number}` : "Bus";
            setRoute(name);
          } else if (json.data.length > 0) {
            setSelectedRouteObj(json.data[0]);
            const name = json.data[0].legs?.[0] ? `${json.data[0].legs[0].operator} ${json.data[0].legs[0].route_number}` : "Bus";
            setRoute(name);
          }
        }
      } catch (e) {
        console.error("Failed to load routes", e);
      } finally {
        setLoadingRoutes(false);
      }
    };
    fetchAllRoutes();
  }, [routeParam]);

  const stopsList = selectedRouteObj?.legs?.[0]?.stops || ["Dadar TT", "Sion Circle", "Kurla Station", "Andheri East"];

  useEffect(() => {
    if (stopsList.length > 0) {
      const fromMatch = stopsList.find((s: string) => s.toLowerCase().includes(fromParam.toLowerCase()));
      const toMatch = stopsList.find((s: string) => s.toLowerCase().includes(toParam.toLowerCase()));

      setFromStop(fromMatch || stopsList[0]);
      setToStop(toMatch || stopsList[stopsList.length - 1]);
    }
  }, [selectedRouteObj, fromParam, toParam, stopsList]);

  // Fare Calculation
  const fromIndex = stopsList.indexOf(fromStop);
  const toIndex = stopsList.indexOf(toStop);
  const numStops = Math.max(1, Math.abs(toIndex - fromIndex));
  const baseRate = isAC ? 6 : 4;
  const singleFare = passType === "daily" ? 50 : passType === "monthly" ? 600 : Math.max(10, numStops * baseRate);
  const totalFare = singleFare * quantity;

  const handleBookTicket = () => {
    const newTkt = {
      id: `TKT-BEST-${Math.floor(10000 + Math.random() * 90000)}`,
      routeNumber: route.replace("BEST ", "") || "312",
      operator: isAC ? "BEST AC Express" : "BEST Ordinary",
      from: fromStop,
      to: toStop,
      passengerCount: quantity,
      type: passType === "daily" ? "Daily Unlimited Pass" : passType === "monthly" ? "Monthly Unlimited Pass" : isAC ? "Single Ticket (AC)" : "Single Ticket (Non-AC)",
      fare: totalFare,
      issuedAt: "Just now",
      validUntil: "Today, 11:59 PM",
      qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=TKT-BEST-${Math.floor(10000 + Math.random() * 90000)}`,
      status: "ACTIVE"
    };

    setBookedTicket(newTkt);
    setActiveTickets(prev => [newTkt, ...prev]);
    setActiveTab("active");
  };

  return (
    <div className="select-none bg-[#FAF6F0] min-h-screen text-slate-900 pb-36 font-sans">
      
      {/* ── RED HERO HEADER ───────────────────────────────── */}
      <div className="bg-gradient-to-b from-[#9E0D25] via-[#8C081D] to-[#750415] text-white px-5 pt-8 pb-10 rounded-b-[2.5rem] shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-between relative z-10 mb-4">
          <Link href="/commuter" className="p-2 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-md text-white transition-all">
            <ArrowLeft size={18} />
          </Link>
          <span className="text-xs font-black tracking-widest uppercase text-white/80">BEST Digital Transit Wallet</span>
          <div className="w-8" />
        </div>

        <div className="relative z-10 text-center">
          <h1 className="text-2xl font-black tracking-tight">My Trips & Passes</h1>
          <p className="text-xs text-white/80 mt-1">Manage active tickets, daily passes & trip history</p>
        </div>

        {/* ── TAB SWITCHER ─────────────────────────────────── */}
        <div className="flex bg-black/20 backdrop-blur-md p-1 rounded-2xl mt-6 relative z-10 border border-white/15">
          <button
            onClick={() => setActiveTab("active")}
            className={cn(
              "flex-1 py-2.5 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5",
              activeTab === "active" ? "bg-white text-[#9A0002] shadow-md" : "text-white/80 hover:text-white"
            )}
          >
            <Ticket size={14} />
            <span>Active ({activeTickets.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("history")}
            className={cn(
              "flex-1 py-2.5 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5",
              activeTab === "history" ? "bg-white text-[#9A0002] shadow-md" : "text-white/80 hover:text-white"
            )}
          >
            <History size={14} />
            <span>History</span>
          </button>

          <button
            onClick={() => setActiveTab("book")}
            className={cn(
              "flex-1 py-2.5 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5",
              activeTab === "book" ? "bg-white text-[#9A0002] shadow-md" : "text-white/80 hover:text-white"
            )}
          >
            <Plus size={14} />
            <span>Book New</span>
          </button>
        </div>
      </div>

      <div className="px-5 mt-6">

        {/* ═══════════════════════════════════════════════════════
            TAB 1: ACTIVE TICKETS & PASSES (RailOne / Challo Style)
           ═══════════════════════════════════════════════════════ */}
        {activeTab === "active" && (
          <div className="space-y-4">
            {activeTickets.length > 0 ? (
              activeTickets.map((tkt) => (
                <motion.div
                  key={tkt.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-[#F7EFE7] rounded-3xl border border-[#DECFC2] shadow-xl overflow-hidden"
                >
                  {/* Ticket Header Bar */}
                  <div className="bg-gradient-to-r from-[#9A0002] to-[#A80B24] text-white p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                      <span className="text-[10px] font-black uppercase tracking-widest">VALID TODAY</span>
                    </div>
                    <span className="text-[10px] font-bold bg-white/20 px-2.5 py-0.5 rounded-full backdrop-blur-md">
                      {tkt.id}
                    </span>
                  </div>

                  {/* Ticket Body */}
                  <div className="p-5 space-y-4">
                    <div className="flex items-center justify-between border-b border-[#DECFC2]/60 pb-3">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#9A0002]">{tkt.operator}</span>
                        <h3 className="text-base font-black text-slate-900">Route {tkt.routeNumber}</h3>
                      </div>
                      <div className="text-right">
                        <span className="text-xl font-black text-slate-900">₹{tkt.fare}</span>
                        <span className="text-[10px] text-slate-500 block font-semibold">{tkt.type}</span>
                      </div>
                    </div>

                    {/* Route Stops */}
                    <div className="flex items-center justify-between gap-2 bg-[#E6DBD0]/60 p-3.5 rounded-2xl border border-[#DECFC2]">
                      <div className="min-w-0">
                        <span className="text-[9px] font-black uppercase text-slate-500 block">Boarding</span>
                        <h4 className="text-xs font-black text-slate-900 truncate">{tkt.from}</h4>
                      </div>
                      <ChevronRight size={16} className="text-slate-400 shrink-0" />
                      <div className="min-w-0 text-right">
                        <span className="text-[9px] font-black uppercase text-slate-500 block">Destination</span>
                        <h4 className="text-xs font-black text-slate-900 truncate">{tkt.to}</h4>
                      </div>
                    </div>

                    {/* QR Code Container */}
                    <div className="flex items-center gap-4 bg-red-50/60 p-4 rounded-2xl border border-red-100">
                      <div className="w-20 h-20 bg-white p-1 rounded-xl shadow-md border border-[#DECFC2] shrink-0">
                        <img src={tkt.qrCodeUrl} alt="QR Ticket Code" className="w-full h-full object-contain" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-bold text-[#9A0002] flex items-center gap-1">
                          <QrCode size={13} /> Conductor Scan Code
                        </span>
                        <p className="text-[11px] text-slate-600 mt-1 font-medium leading-tight">
                          Show this QR code to the BEST conductor during inspection.
                        </p>
                        <button
                          onClick={() => setShowQRModal(tkt)}
                          className="mt-2 text-[10px] font-black text-[#9A0002] underline flex items-center gap-0.5"
                        >
                          View Fullscreen QR →
                        </button>
                      </div>
                    </div>

                    {/* Actions Footer */}
                    <div className="flex items-center gap-2 pt-1">
                      <Link
                        href={`/commuter/track/${tkt.routeNumber}`}
                        className="flex-1 py-3 rounded-2xl bg-[#9A0002] text-white font-black text-xs shadow-md flex items-center justify-center gap-1.5 hover:bg-[#a80b24] transition-all"
                      >
                        <Bus size={14} /> Track Bus Live
                      </Link>
                      <button
                        onClick={() => alert(`Receipt saved for ${tkt.id}`)}
                        className="px-4 py-3 rounded-2xl bg-[#E6DBD0] hover:bg-[#D9C8B9] text-slate-800 font-bold text-xs flex items-center gap-1 transition-all"
                      >
                        <Download size={14} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="bg-[#F7EFE7] rounded-3xl border border-[#DECFC2] p-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-[#E6DBD0] text-slate-500 flex items-center justify-center mx-auto">
                  <Ticket size={24} />
                </div>
                <h3 className="text-sm font-black text-slate-900">No Active Tickets</h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">You don't have any active bus tickets or passes for today.</p>
                <button
                  onClick={() => setActiveTab("book")}
                  className="px-5 py-2.5 rounded-2xl bg-[#9A0002] text-white text-xs font-black shadow-md inline-block mt-2"
                >
                  Book New Ticket Now
                </button>
              </div>
            )}

            {/* Quick Buy Banner */}
            <div className="p-4 rounded-3xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase text-amber-800 tracking-wider block">UNLIMITED DAY PASS</span>
                <h4 className="text-xs font-black text-slate-900">Mumbai All-Route Daily Pass (₹50)</h4>
              </div>
              <button
                onClick={() => {
                  setPassType("daily");
                  setActiveTab("book");
                }}
                className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs shadow-sm shrink-0"
              >
                Buy Pass
              </button>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════
            TAB 2: PAST TRIPS HISTORY
           ═══════════════════════════════════════════════════════ */}
        {activeTab === "history" && (
          <div className="space-y-3">
            {PAST_TRIPS.map((trip) => (
              <div key={trip.id} className="bg-[#F7EFE7] rounded-2xl border border-[#DECFC2] p-4 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-100 text-[#9A0002] flex items-center justify-center font-black text-xs shrink-0">
                    {trip.routeNumber}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{trip.from} → {trip.to}</h4>
                    <span className="text-[10px] text-slate-400 font-medium block mt-0.5">{trip.date} · {trip.id}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-slate-900">₹{trip.fare}</span>
                  <button
                    onClick={() => {
                      setRoute(`BEST ${trip.routeNumber}`);
                      setFromStop(trip.from);
                      setToStop(trip.to);
                      setActiveTab("book");
                    }}
                    className="text-[10px] font-black text-[#9A0002] block mt-0.5 hover:underline"
                  >
                    Rebook
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════
            TAB 3: BOOK NEW TICKET / PASS
           ═══════════════════════════════════════════════════════ */}
        {activeTab === "book" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#F7EFE7] rounded-3xl border border-[#DECFC2] shadow-xl p-5 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-[#DECFC2]/60 pb-3">
              <h3 className="text-base font-black text-slate-900">Book Bus Ticket</h3>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Instant QR Issue
              </span>
            </div>

            {/* Ticket / Pass Type Selector */}
            <div>
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 block mb-2">Select Booking Type</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "single", label: "Single Ride" },
                  { id: "daily", label: "Daily Pass (₹50)" },
                  { id: "monthly", label: "Monthly Pass" },
                ].map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setPassType(type.id as any)}
                    className={cn(
                      "py-2.5 px-2 rounded-xl border text-xs font-black transition-all text-center",
                      passType === type.id
                        ? "bg-[#9A0002] text-white border-[#9A0002] shadow-md"
                        : "bg-[#E6DBD0]/60 text-slate-700 border-[#DECFC2] hover:border-slate-400"
                    )}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* AC / Non-AC Toggle */}
            <div className="flex items-center justify-between bg-[#E6DBD0]/60 p-3 rounded-2xl border border-[#DECFC2]">
              <span className="text-xs font-bold text-slate-800">Bus Category</span>
              <div className="flex bg-[#E6DBD0] p-1 rounded-xl">
                <button
                  onClick={() => setIsAC(true)}
                  className={cn(
                    "px-3 py-1 text-xs font-black rounded-lg transition-all",
                    isAC ? "bg-[#9A0002] text-white shadow-sm" : "text-slate-700"
                  )}
                >
                  AC Express
                </button>
                <button
                  onClick={() => setIsAC(false)}
                  className={cn(
                    "px-3 py-1 text-xs font-black rounded-lg transition-all",
                    !isAC ? "bg-[#9A0002] text-white shadow-sm" : "text-slate-700"
                  )}
                >
                  Ordinary
                </button>
              </div>
            </div>

            {/* Route Selection */}
            {passType === "single" && (
              <>
                <div>
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 block mb-1">Route</label>
                  <select
                    value={route}
                    onChange={(e) => {
                      setRoute(e.target.value);
                      const match = availableRoutes.find(r => {
                        const name = r.legs?.[0] ? `${r.legs[0].operator} ${r.legs[0].route_number}` : "";
                        return name === e.target.value;
                      });
                      if (match) setSelectedRouteObj(match);
                    }}
                    className="w-full p-3 rounded-2xl bg-[#E6DBD0]/60 border border-[#DECFC2] text-xs font-bold text-slate-900 outline-none focus:border-[#9A0002]"
                  >
                    {availableRoutes.map((r, i) => {
                      const name = r.legs?.[0] ? `${r.legs[0].operator} ${r.legs[0].route_number}` : `Route ${i+1}`;
                      return (
                        <option key={i} value={name}>
                          {name} ({r.totalStops} stops)
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 block mb-1">From Stop</label>
                    <select
                      value={fromStop}
                      onChange={(e) => setFromStop(e.target.value)}
                      className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 outline-none"
                    >
                      {stopsList.map((s: string, i: number) => (
                        <option key={i} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1">To Stop</label>
                    <select
                      value={toStop}
                      onChange={(e) => setToStop(e.target.value)}
                      className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 outline-none"
                    >
                      {stopsList.map((s: string, i: number) => (
                        <option key={i} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </>
            )}

            {/* Passenger Quantity Counter */}
            <div className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-200">
              <div>
                <span className="text-xs font-bold text-slate-900 block">Passenger Count</span>
                <span className="text-[10px] text-slate-500 font-medium">Adult (Above 12 yrs)</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 rounded-xl bg-white border border-slate-200 text-slate-800 font-bold flex items-center justify-center hover:bg-slate-100 shadow-sm"
                >
                  <Minus size={14} />
                </button>
                <span className="text-sm font-black text-slate-900 w-4 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-8 h-8 rounded-xl bg-white border border-slate-200 text-slate-800 font-bold flex items-center justify-center hover:bg-slate-100 shadow-sm"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            {/* Total Fare & Pay Button */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Total Fare</span>
                <span className="text-2xl font-black text-slate-900">₹{totalFare}</span>
              </div>

              <button
                onClick={handleBookTicket}
                className="px-6 py-4 rounded-2xl bg-gradient-to-r from-[#9A0002] to-[#A80B24] text-white font-black text-sm shadow-xl shadow-red-600/30 hover:brightness-110 active:scale-95 transition-all flex items-center gap-2"
              >
                <span>Pay & Issue QR Ticket</span>
                <ArrowUpRight size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* ── FULLSCREEN QR CODE MODAL ────────────────────── */}
      <AnimatePresence>
        {showQRModal && (
          <div className="fixed inset-0 z-[100000] bg-black/80 backdrop-blur-md flex items-center justify-center p-5">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-6 w-full max-w-sm text-center shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-[#9A0002] uppercase tracking-wider">{showQRModal.operator}</span>
                <button onClick={() => setShowQRModal(null)} className="p-1 rounded-full hover:bg-slate-100">
                  ✕
                </button>
              </div>

              <h3 className="text-base font-black text-slate-900">{showQRModal.from} → {showQRModal.to}</h3>

              <div className="w-48 h-48 bg-white p-2 border-2 border-slate-900 rounded-2xl mx-auto shadow-inner">
                <img src={showQRModal.qrCodeUrl} alt="QR Code" className="w-full h-full object-contain" />
              </div>

              <p className="text-xs font-bold text-slate-600">Ticket ID: {showQRModal.id}</p>

              <button
                onClick={() => setShowQRModal(null)}
                className="w-full py-3 rounded-2xl bg-[#9A0002] text-white font-black text-xs shadow-md"
              >
                Close Ticket View
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

export default function TicketsPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-xs font-bold text-slate-400">Loading BEST Digital Wallet…</div>}>
      <TicketsContent />
    </Suspense>
  );
}
