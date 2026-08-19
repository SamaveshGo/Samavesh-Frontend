"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, ChevronRight, Filter, Bus, TrendingDown, TrendingUp } from "lucide-react";
import { mockBuses } from "@/mock/buses";
import { cn, formatHeadway } from "@/lib/utils";

const DRIVER_BUS = mockBuses.find((b) => b.id === "bus-312-2")!;
const BUS_AHEAD = mockBuses.find((b) => b.id === "bus-312-1")!;
const BUS_BEHIND = mockBuses.find((b) => b.id === "bus-312-3")!;

export default function HeadwayPage() {
  const headwayAhead = DRIVER_BUS.headwayToBusAhead;
  const headwayBehind = DRIVER_BUS.headwayToBusBehind;
  const isStable = headwayAhead >= 6 && headwayBehind >= 6;

  return (
    <div className="px-5 py-6 space-y-4 page-enter select-none bg-[#EFE6DE] min-h-screen text-slate-900">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/driver/home" className="p-2.5 rounded-2xl bg-[#F7EFE7] border border-[#DECFC2] hover:border-red-200 transition-colors shadow-sm">
            <ArrowLeft size={18} strokeWidth={2.5} className="text-[#9A0002]" />
          </Link>
          <h1 className="text-2xl font-black text-slate-900">Live Headway</h1>
        </div>
        <button className="p-2.5 rounded-2xl bg-[#F7EFE7] border border-[#DECFC2] text-slate-600 hover:text-[#9A0002] transition-colors shadow-sm">
          <Filter size={16} strokeWidth={2.5} />
        </button>
      </div>

      {/* Route Info */}
      <div className="px-1">
        <p className="text-2xl font-black text-slate-900">Route 312</p>
        <p className="text-xs text-slate-600 font-bold mt-0.5">Dadar TT → Mulund Depot</p>
      </div>

      {/* Spacing diagram card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#F7EFE7] rounded-3xl border border-[#DECFC2] p-6 relative min-h-[300px] flex flex-col justify-between shadow-sm border-l-4 border-l-[#9A0002]"
      >
        {/* Core Vertical Timeline Line */}
        <div className="absolute left-10 top-10 bottom-10 w-[3px] bg-slate-200 rounded-full" />
        
        {/* Active colored line segments */}
        <div className="absolute left-10 top-10 h-[50%] w-[3px] bg-[#C8102E] rounded-full" />
        <div className="absolute left-10 top-[50%] bottom-10 w-[3px] bg-[#C8102E] rounded-full" />

        {/* Node 1: Bus Ahead */}
        <div className="flex items-center gap-4 relative z-10">
          {/* Node dot */}
          <div className="w-5 h-5 rounded-full bg-[#C8102E] border-4 border-white shrink-0 ml-1.5 shadow-sm" />
          
          <div className="flex-1 flex items-center justify-between">
            <div>
              <p className="text-xs font-black text-slate-900">Bus Ahead</p>
              <p className="text-[10px] text-slate-500 font-medium mt-0.5">MH-01-LA-6678</p>
              <p className="text-[9px] text-slate-500 font-bold">2.3 km ahead</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-xs font-black text-[#C8102E]">Gap</p>
              <p className="text-lg font-black text-[#C8102E] leading-tight">10 min</p>
            </div>
          </div>
        </div>

        {/* Node 2: YOU (Middle) */}
        <div className="flex items-center gap-4 relative z-10 py-6">
          {/* Node dot (white with red border) */}
          <div className="w-6 h-6 rounded-full bg-white border-[5px] border-[#C8102E] shrink-0 ml-1 shadow-md" />

          <div className="flex-1">
            <p className="text-xs font-black text-slate-900">You</p>
            <p className="text-[10px] text-slate-500 font-medium mt-0.5">MH-01-LA-1234</p>
            <p className="text-[9px] text-[#C8102E] font-black uppercase tracking-wider">Current Location</p>
          </div>
        </div>

        {/* Node 3: Bus Behind */}
        <div className="flex items-center gap-4 relative z-10">
          {/* Node dot (red) */}
          <div className="w-5 h-5 rounded-full bg-[#C8102E] border-4 border-white shrink-0 ml-1.5 shadow-sm" />

          <div className="flex-1 flex items-center justify-between">
            <div>
              <p className="text-xs font-black text-slate-900">Bus Behind</p>
              <p className="text-[10px] text-slate-500 font-medium mt-0.5">MH-01-LA-9101</p>
              <p className="text-[9px] text-slate-500 font-bold">1.8 km behind</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-xs font-black text-[#C8102E]">Gap</p>
              <p className="text-lg font-black text-[#C8102E] leading-tight">9 min</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stable indicator */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex items-center gap-2 px-4 py-3.5 bg-red-50 border border-red-200 rounded-2xl text-[#C8102E]"
      >
        <span className="text-xs font-black">✓ Headway is stable</span>
      </motion.div>
    </div>
  );
}
