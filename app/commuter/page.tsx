"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeftRight, MapPin, Bus, Navigation, Bell,
  Search, Ticket, Clock, ShieldCheck, Zap, ChevronRight,
  Sparkles, AlertCircle, ArrowUpRight, Compass, Flame
} from "lucide-react";
import { LiveMap } from "@/components/maps/LiveMap";
import { useSimulationWS } from "@/lib/hooks/useSimulationWS";
import { cn } from "@/lib/utils";

/* ── Commuter Transit Agencies ────────────────────────────── */
const COMMUTER_AGENCIES = [
  { id: "ALL", name: "All Services" },
  { id: "BEST", name: "BEST" },
  { id: "TMT", name: "TMT" },
  { id: "NMMT", name: "NMMT" },
  { id: "KDMT", name: "KDMT" },
  { id: "VVMT", name: "VVMT" },
  { id: "MBMT", name: "MBMT" },
  { id: "VMMT", name: "VMMT" },
  { id: "KHOPOLI", name: "Khopoli" },
  { id: "UMT", name: "UMT" },
];

/* ── Popular Mumbai Routes ───────────────────────────────── */
const POPULAR_ROUTES = [
  { id: "312", number: "312", from: "Dadar TT", to: "Andheri East", eta: "3 min", crowding: "Low", crowdingColor: "bg-emerald-500 text-emerald-700 bg-emerald-50 border-emerald-200" },
  { id: "C-40", number: "C-40", from: "CSMT Station", to: "World Trade Center", eta: "2 min", crowding: "Moderate", crowdingColor: "bg-amber-500 text-amber-700 bg-amber-50 border-amber-200" },
  { id: "101", number: "101", from: "Colaba Depot", to: "Worli Naka", eta: "5 min", crowding: "Low", crowdingColor: "bg-emerald-500 text-emerald-700 bg-emerald-50 border-emerald-200" },
  { id: "A-100", number: "A-100", from: "Churchgate", to: "Nariman Point", eta: "2 min", crowding: "High", crowdingColor: "bg-red-500 text-red-700 bg-red-50 border-red-200" },
];

/* ── Live Transit Alerts ─────────────────────────────────── */
const NEWS_ITEMS = [
  {
    id: 1,
    category: "Traffic",
    headline: "Western Express Highway congestion at Andheri",
    detail: "Delays of 15–20 min expected. Consider Route 332.",
    time: "10 min ago",
    chipCls: "bg-red-100 text-[#9A0002] border-red-200",
  },
  {
    id: 2,
    category: "Service Alert",
    headline: "Route 312 signal delay at Dadar TT cleared",
    detail: "Normal 5-min headway service resumed.",
    time: "20 min ago",
    chipCls: "bg-emerald-100 text-emerald-800 border-emerald-200",
  },
  {
    id: 3,
    category: "Update",
    headline: "Eastern Expressway accidents cleared — traffic free",
    detail: "Routes 110, 185 running on time.",
    time: "45 min ago",
    chipCls: "bg-blue-100 text-blue-800 border-blue-200",
  },
];

export default function CommuterHomePage() {
  const router = useRouter();
  const [from, setFrom] = useState("Dadar TT");
  const [to, setTo] = useState("Andheri East");
  const [fromSuggestions, setFromSuggestions] = useState<{stop_name: string; occurrence: number}[]>([]);
  const [toSuggestions, setToSuggestions] = useState<{stop_name: string; occurrence: number}[]>([]);
  const [activeInput, setActiveInput] = useState<"from" | "to" | null>(null);

  // Live Simulation Map & Search Filter State
  const { buses: liveWSBuses } = useSimulationWS();
  const [mapSearchQuery, setMapSearchQuery] = useState("");
  const [mapAgency, setMapAgency] = useState("ALL");
  const [selectedMapRoute, setSelectedMapRoute] = useState<string | null>(null);
  const [selectedMapBus, setSelectedMapBus] = useState<string | null>(null);

  const filteredBuses = useMemo(() => {
    if (!liveWSBuses || liveWSBuses.length === 0) return [];
    return liveWSBuses.filter((b: any) => {
      // 1. Agency filter
      if (mapAgency !== "ALL") {
        const busOp = String(b.operator || "").toUpperCase();
        const bId = String(b.id || b.bus_id || "").toUpperCase();
        if (mapAgency === "BEST" && !busOp.includes("BEST") && !bId.startsWith("BUS_")) return false;
        if (mapAgency === "TMT" && !busOp.includes("TMT") && !bId.includes("TMT")) return false;
        if (mapAgency === "NMMT" && !busOp.includes("NMMT") && !bId.includes("NMMT")) return false;
        if (mapAgency === "KDMT" && !busOp.includes("KDMT") && !bId.includes("KDMT")) return false;
        if (mapAgency === "VVMT" && !busOp.includes("VVMT") && !busOp.includes("VMMT") && !bId.includes("VVMT")) return false;
        if (mapAgency === "MBMT" && !busOp.includes("MBMT") && !bId.includes("MBMT")) return false;
      }
      // 2. Search query filter
      if (mapSearchQuery.trim()) {
        const q = mapSearchQuery.trim().toLowerCase();
        const rNum = String(b.route_number || "").toLowerCase();
        const bId = String(b.bus_id || b.id || "").toLowerCase();
        const cStop = String(b.current_stop || "").toLowerCase();
        const nStop = String(b.next_stop || "").toLowerCase();

        const isNumeric = /^\d+$/.test(q);
        if (isNumeric) {
          const cleanRoute = rNum.replace(/\D/g, "");
          if (rNum !== q && cleanRoute !== q) return false;
        } else {
          if (!rNum.includes(q) && !bId.includes(q) && !cStop.includes(q) && !nStop.includes(q)) return false;
        }
      }
      return true;
    });
  }, [liveWSBuses, mapAgency, mapSearchQuery]);

  const fetchSuggestions = async (val: string, type: "from" | "to") => {
    if (!val || val.trim().length < 2) {
      if (type === "from") setFromSuggestions([]);
      else setToSuggestions([]);
      return;
    }
    try {
      const res = await fetch(`/api/routes/stops/search?query=${encodeURIComponent(val)}`);
      const result = await res.json();
      if (result.success && Array.isArray(result.data)) {
        if (type === "from") setFromSuggestions(result.data);
        else setToSuggestions(result.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSwap = () => {
    setFrom(to);
    setTo(from);
  };

  const handleSearch = () => {
    router.push(`/commuter/search?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`);
  };

  return (
    <div className="select-none bg-[#FAF6F0] min-h-screen text-slate-900 pb-32 font-sans">

      {/* ── RED HERO HEADER WITH TAILWIND GLASS & GRADIENT ─────── */}
      <div className="bg-gradient-to-b from-[#9E0D25] via-[#8C081D] to-[#750415] text-white px-5 pt-8 pb-14 rounded-b-[2.5rem] shadow-2xl relative overflow-hidden">
        {/* Background ambient lighting glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/20 rounded-full blur-2xl pointer-events-none" />

        {/* Top bar */}
        <div className="flex items-center justify-between relative z-10 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white p-1.5 shadow-md flex items-center justify-center shrink-0">
              <img src="/logo.png" alt="SAMAVESH Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <span className="text-xs font-black tracking-wider text-white uppercase block">SAMAVESH</span>
              <span className="text-[11px] font-bold flex items-center gap-1.5 text-white/90">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>683 Routes Live</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/commuter/tickets"
              className="px-3.5 py-2 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-md text-xs font-bold border border-white/25 flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
            >
              <Ticket size={14} /> My Passes
            </Link>
            <button className="p-2.5 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-md text-white transition-all relative shadow-md active:scale-95">
              <Bell size={18} />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-amber-400 rounded-full ring-2 ring-[#9A0002]" />
            </button>
          </div>
        </div>

        {/* Title */}
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-[10px] font-bold text-white mb-2">
            <Sparkles size={12} className="text-yellow-300" /> AI-Powered Transit Assistant
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
            Where are you travelling today?
          </h1>
        </div>
      </div>

      {/* ── FLOATING RED & CREAM ROUTE SEARCH CARD ───────── */}
      <div className="px-5 -mt-8 relative z-20">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#F7EFE7] rounded-3xl border border-[#DECFC2] shadow-xl p-5"
        >
          <div className="flex items-center gap-2.5">
            {/* INPUTS COLUMN */}
            <div className="flex-1 space-y-2.5 min-w-0">
              
              {/* FROM INPUT */}
              <div className="relative">
                <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-[#E6DBD0]/60 border border-[#DECFC2] focus-within:border-[#9A0002] focus-within:bg-[#F7EFE7] focus-within:ring-4 focus-within:ring-[#9A0002]/10 transition-all">
                  <div className="w-8 h-8 rounded-xl bg-red-100 text-[#9A0002] flex items-center justify-center shrink-0 shadow-inner font-bold">
                    <MapPin size={16} strokeWidth={2.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <label className="text-[8px] font-black uppercase tracking-widest text-slate-500 block">From (Pickup)</label>
                    <input
                      type="text"
                      value={from}
                      onChange={(e) => {
                        setFrom(e.target.value);
                        setActiveInput("from");
                        fetchSuggestions(e.target.value, "from");
                      }}
                      onFocus={() => setActiveInput("from")}
                      placeholder="Enter pickup stop..."
                      className="w-full bg-transparent font-extrabold text-xs text-slate-900 outline-none placeholder:text-slate-500"
                    />
                  </div>
                </div>

                {/* Suggestions Dropdown */}
                {activeInput === "from" && fromSuggestions.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1.5 bg-[#F7EFE7] border border-[#DECFC2] rounded-2xl shadow-2xl z-30 max-h-48 overflow-y-auto py-1">
                    {fromSuggestions.map((s, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setFrom(s.stop_name);
                          setFromSuggestions([]);
                          setActiveInput(null);
                        }}
                        className="w-full text-left px-4 py-2.5 hover:bg-red-50 text-xs font-bold text-slate-800 flex items-center justify-between border-b border-[#DECFC2]/50 last:border-0"
                      >
                        <span>{s.stop_name}</span>
                        <span className="text-[9px] text-slate-500 bg-[#E6DBD0] px-2 py-0.5 rounded-full">{s.occurrence} routes</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* TO INPUT */}
              <div className="relative">
                <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-[#E6DBD0]/60 border border-[#DECFC2] focus-within:border-[#9A0002] focus-within:bg-[#F7EFE7] focus-within:ring-4 focus-within:ring-[#9A0002]/10 transition-all">
                  <div className="w-8 h-8 rounded-xl bg-[#E6DBD0] text-slate-700 flex items-center justify-center shrink-0 shadow-inner font-bold">
                    <Navigation size={16} strokeWidth={2.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <label className="text-[8px] font-black uppercase tracking-widest text-slate-500 block">To (Destination)</label>
                    <input
                      type="text"
                      value={to}
                      onChange={(e) => {
                        setTo(e.target.value);
                        setActiveInput("to");
                        fetchSuggestions(e.target.value, "to");
                      }}
                      onFocus={() => setActiveInput("to")}
                      placeholder="Enter destination stop..."
                      className="w-full bg-transparent font-extrabold text-xs text-slate-900 outline-none placeholder:text-slate-500"
                    />
                  </div>
                </div>

                {/* Suggestions Dropdown */}
                {activeInput === "to" && toSuggestions.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1.5 bg-[#F7EFE7] border border-[#DECFC2] rounded-2xl shadow-2xl z-30 max-h-48 overflow-y-auto py-1">
                    {toSuggestions.map((s, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setTo(s.stop_name);
                          setToSuggestions([]);
                          setActiveInput(null);
                        }}
                        className="w-full text-left px-4 py-2.5 hover:bg-red-50 text-xs font-bold text-slate-800 flex items-center justify-between border-b border-[#DECFC2]/50 last:border-0"
                      >
                        <span>{s.stop_name}</span>
                        <span className="text-[9px] text-slate-500 bg-[#E6DBD0] px-2 py-0.5 rounded-full">{s.occurrence} routes</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* SIDE SWAP BUTTON */}
            <div className="shrink-0 flex items-center justify-center">
              <button
                onClick={handleSwap}
                title="Swap From and To"
                className="w-10 h-[104px] rounded-2xl bg-[#E6DBD0]/70 hover:bg-[#E6DBD0] border border-[#DECFC2] text-[#9A0002] shadow-sm flex flex-col items-center justify-center gap-1 active:scale-95 transition-all"
              >
                <ArrowLeftRight size={16} strokeWidth={2.5} className="rotate-90" />
                <span className="text-[8px] font-black uppercase tracking-wider">Swap</span>
              </button>
            </div>
          </div>

          {/* SEARCH BUTTON */}
          <button
            onClick={handleSearch}
            className="w-full mt-4 py-4 rounded-2xl bg-gradient-to-r from-[#9A0002] to-[#A80B24] text-white font-black text-sm shadow-xl shadow-red-600/30 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
          >
            <Search size={18} strokeWidth={2.5} />
            <span>Search Buses & Live ETAs</span>
            <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>
        </motion.div>
      </div>

      {/* ── TAILWIND QUICK ACTIONS ──────────────────────── */}
      <div className="px-5 mt-6">
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "Live Map", href: "/commuter/search?tab=map", icon: Bus, color: "bg-red-50 text-[#9A0002] border-red-100" },
            { label: "Buy Ticket", href: "/commuter/tickets", icon: Ticket, color: "bg-[#9A0002] text-white border-[#9A0002]" },
            { label: "Find Stops", href: "/commuter/search", icon: MapPin, color: "bg-[#E6DBD0] text-slate-800 border-[#DECFC2]" },
            { label: "Passes", href: "/commuter/tickets", icon: ShieldCheck, color: "bg-amber-50 text-amber-800 border-amber-200" },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <Link
                key={i}
                href={item.href}
                className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-[#F7EFE7] border border-[#DECFC2] shadow-sm hover:shadow-md hover:scale-[1.03] active:scale-95 transition-all text-center group"
              >
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center border ${item.color} shadow-sm group-hover:scale-105 transition-transform`}>
                  <Icon size={20} strokeWidth={2.2} />
                </div>
                <span className="text-[11px] font-black text-slate-900">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* ── POPULAR ROUTES SECTION ──────────────────────── */}
      <div className="px-5 mt-7">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-1.5">
              Popular Routes <Flame size={16} className="text-[#9A0002]" />
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">Frequent BEST bus departures</p>
          </div>
          <Link href="/commuter/search" className="text-xs font-black text-[#9A0002] hover:underline flex items-center gap-0.5">
            View All <ChevronRight size={14} />
          </Link>
        </div>

        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 -mx-5 px-5">
          {POPULAR_ROUTES.map((route) => (
            <Link
              key={route.id}
              href={`/commuter/track/${route.id}`}
              className="shrink-0 w-64 p-4 rounded-3xl bg-[#F7EFE7] border border-[#DECFC2] shadow-sm hover:shadow-md hover:border-red-200 transition-all group"
            >
              <div className="flex items-center justify-between mb-2.5">
                <span className="px-3 py-1 rounded-xl bg-[#9A0002] text-white font-black text-xs shadow-sm">
                  Route {route.number}
                </span>
                <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${route.crowdingColor} flex items-center gap-1`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" /> {route.eta} ETA
                </span>
              </div>
              <h4 className="text-xs font-extrabold text-slate-900 truncate group-hover:text-[#9A0002] transition-colors">
                {route.from} → {route.to}
              </h4>
              <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-[#DECFC2]/60 text-[10px] text-slate-500 font-bold">
                <span>Crowding: <b className="text-slate-800">{route.crowding}</b></span>
                <span className="text-[#9A0002] flex items-center gap-0.5">Track Live <ArrowUpRight size={12} /></span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── LIVE FLEET MAP & ROUTE SEARCH (px-5 mt-7) ───────────────── */}
      <div className="px-5 mt-7 space-y-3.5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-1.5">
              Live Fleet Map & Route Tracker <Compass size={16} className="text-[#9A0002]" />
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">Real-time bus coordinates & live routes across Mumbai</p>
          </div>
          <span className="px-3 py-1 rounded-full bg-red-100 text-[#9A0002] text-[10px] font-black flex items-center gap-1 border border-red-200 shadow-sm">
            <Zap size={12} /> {filteredBuses.length > 0 ? `${filteredBuses.length} BUSES LIVE` : "LIVE GTFS"}
          </span>
        </div>

        {/* Search Bar & Service Filter Tabs */}
        <div className="bg-[#F7EFE7] border border-[#DECFC2] rounded-3xl p-3.5 shadow-sm space-y-3">
          {/* Search Input Bar */}
          <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-[#E6DBD0]/60 border border-[#DECFC2] focus-within:border-[#9A0002] focus-within:bg-[#F7EFE7] focus-within:ring-2 focus-within:ring-[#9A0002]/20 transition-all">
            <Search size={16} className="text-[#9A0002] shrink-0" />
            <input
              type="text"
              value={mapSearchQuery}
              onChange={(e) => setMapSearchQuery(e.target.value)}
              placeholder="Search Route No (e.g. 504, 312, 14), Bus ID, or Stop..."
              className="w-full bg-transparent font-extrabold text-xs text-slate-900 outline-none placeholder:text-slate-500"
            />
            {mapSearchQuery && (
              <button onClick={() => setMapSearchQuery("")} className="text-xs font-bold text-slate-400 hover:text-slate-600 px-1">
                ✕
              </button>
            )}
          </div>

          {/* Service Agency Tabs Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide pb-0.5">
            {COMMUTER_AGENCIES.map((agency) => {
              const active = mapAgency === agency.id;
              return (
                <button
                  key={agency.id}
                  onClick={() => {
                    setMapAgency(agency.id);
                    setSelectedMapRoute(null);
                    setSelectedMapBus(null);
                  }}
                  className={cn(
                    "px-3 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all shrink-0 border shadow-2xs",
                    active
                      ? "bg-[#9A0002] text-white border-[#9A0002] shadow-sm"
                      : "bg-[#E6DBD0]/70 hover:bg-[#E6DBD0] text-slate-700 border-[#DECFC2]"
                  )}
                >
                  {agency.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Interactive Live Map */}
        <div className="rounded-3xl overflow-hidden border border-[#DECFC2] shadow-lg relative">
          <LiveMap
            height="260px"
            selectedAgency={mapAgency === "ALL" ? undefined : mapAgency}
            selectedRoute={selectedMapRoute || (mapSearchQuery ? mapSearchQuery.trim() : undefined)}
            selectedBus={selectedMapBus || undefined}
          />
        </div>

        {/* Live Matching Buses & Routes Grid */}
        {filteredBuses.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-slate-500 px-1">
              <span>Matching Live Buses ({filteredBuses.length})</span>
              {selectedMapBus && (
                <button onClick={() => setSelectedMapBus(null)} className="text-[#9A0002] hover:underline">
                  Clear Bus Filter
                </button>
              )}
            </div>
            <div className="flex gap-2.5 overflow-x-auto scrollbar-hide pb-2">
              {filteredBuses.slice(0, 15).map((bus: any) => {
                const cleanR = String(bus.route_number || bus.route_id || "Route").replace(/null/gi, "");
                const busIdStr = String(bus.bus_id || bus.id || "").replace(/null/gi, "");
                const isSelected = selectedMapBus === busIdStr;
                const op = bus.operator || "BEST";
                const speed = Math.round(bus.speed || 0);

                return (
                  <button
                    key={busIdStr}
                    onClick={() => {
                      setSelectedMapBus(isSelected ? null : busIdStr);
                      if (cleanR) setSelectedMapRoute(cleanR);
                    }}
                    className={cn(
                      "shrink-0 w-52 p-3 rounded-2xl border text-left transition-all shadow-xs",
                      isSelected
                        ? "bg-[#9A0002] text-white border-[#9A0002] shadow-md scale-[1.02]"
                        : "bg-[#F7EFE7] hover:bg-[#F0E6DD] border-[#DECFC2] text-slate-900"
                    )}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={cn(
                        "px-2 py-0.5 rounded-lg font-black text-[10px]",
                        isSelected ? "bg-white text-[#9A0002]" : "bg-[#9A0002] text-white"
                      )}>
                        Route {cleanR}
                      </span>
                      <span className={cn(
                        "text-[9px] font-bold px-2 py-0.5 rounded-full border",
                        isSelected ? "bg-white/20 border-white/30 text-white" : "bg-emerald-100 border-emerald-200 text-emerald-800"
                      )}>
                        {op}
                      </span>
                    </div>
                    <div className="text-xs font-black truncate">{busIdStr}</div>
                    <div className={cn("text-[10px] mt-1 font-medium flex items-center justify-between", isSelected ? "text-white/80" : "text-slate-500")}>
                      <span>Next: {bus.next_stop || "Station"}</span>
                      <span className="font-bold">{speed} km/h</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── SERVICE UPDATES ─────────────────────────────── */}
      <div className="px-5 mt-7 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-black text-slate-900 tracking-tight">Service Updates</h3>
          <span className="text-[10px] font-bold text-slate-500">Updated 5m ago</span>
        </div>

        <div className="space-y-2.5">
          {NEWS_ITEMS.map((item) => (
            <div key={item.id} className="p-4 rounded-3xl bg-[#F7EFE7] border border-[#DECFC2] shadow-sm flex items-start gap-3.5 hover:shadow-md transition-shadow">
              <div className="w-3 h-3 rounded-full bg-[#9A0002] shrink-0 mt-1 shadow-sm" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${item.chipCls}`}>
                    {item.category}
                  </span>
                  <span className="text-[9px] text-slate-400 font-medium">{item.time}</span>
                </div>
                <h4 className="text-xs font-bold text-slate-900">{item.headline}</h4>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{item.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
