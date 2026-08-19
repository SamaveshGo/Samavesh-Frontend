"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Bus, Users, Clock, Star, Camera, ChevronRight } from "lucide-react";
import { mockStops } from "@/mock/stops";
import { cn, getCrowdingBg } from "@/lib/utils";

const STOP = mockStops.find((s) => s.id === "stop-matunga")!;

export default function StopDetailsPage() {
  return (
    <div className="px-5 py-6 space-y-4 page-enter select-none bg-[#EFE6DE] min-h-screen text-slate-900">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/driver/home" className="p-2.5 rounded-2xl bg-[#F7EFE7] border border-[#DECFC2] hover:border-red-200 transition-colors shadow-sm">
            <ArrowLeft size={18} strokeWidth={2.5} className="text-[#9A0002]" />
          </Link>
          <h1 className="text-2xl font-black text-slate-900">Stop Details</h1>
        </div>
        <button className="p-2.5 rounded-2xl bg-[#F7EFE7] border border-[#DECFC2] text-slate-600 hover:text-[#9A0002] transition-colors shadow-sm">
          <Star size={16} strokeWidth={2.5} />
        </button>
      </div>

      {/* Stop Info */}
      <div className="px-1">
        <p className="text-2xl font-black text-slate-900">Matunga (E)</p>
        <p className="text-xs text-slate-600 font-bold mt-0.5">Stop ID: 10234</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border border-[#DECFC2] rounded-2xl overflow-hidden bg-[#E6DBD0]/60 p-1">
        {["Overview", "Live Feed"].map((tab, i) => (
          <button
            key={tab}
            className={cn(
              "flex-1 py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all duration-150",
              i === 0
                ? "bg-[#9A0002] text-white shadow-sm"
                : "text-slate-700 hover:text-[#9A0002]"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Live stats list stacked vertically */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-3"
      >
        {/* Live Boarding Card */}
        <div className="bg-[#F7EFE7] border border-[#DECFC2] rounded-3xl p-4 flex items-center justify-between gap-4 shadow-sm border-l-4 border-l-[#9A0002]">
          <div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Live Boarding</p>
            <p className="text-lg font-black text-[#9A0002] mt-1">High</p>
            <p className="text-[10px] text-slate-500 font-bold mt-0.5">45+ boarding</p>
          </div>
          <div className="p-3 bg-red-100/60 border border-red-200 rounded-2xl text-[#9A0002] shrink-0">
            <Users size={22} strokeWidth={2.5} />
          </div>
        </div>

        {/* Bay Occupancy Card */}
        <div className="bg-[#F7EFE7] border border-[#DECFC2] rounded-3xl p-4 flex items-center justify-between gap-4 shadow-sm border-l-4 border-l-[#9A0002]">
          <div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Bay Occupancy</p>
            <p className="text-lg font-black text-slate-900 mt-1">3 / 4</p>
            <p className="text-[10px] text-slate-500 font-bold mt-0.5">Bays Occupied</p>
          </div>
          <div className="p-3 bg-red-100/60 border border-red-200 rounded-2xl text-[#9A0002] shrink-0">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
          </div>
        </div>

        {/* Routes at Stop Card */}
        <div className="bg-[#F7EFE7] border border-[#DECFC2] rounded-3xl p-4 flex items-center justify-between gap-4 shadow-sm border-l-4 border-l-[#9A0002]">
          <div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Routes at Stop</p>
            <p className="text-lg font-black text-slate-900 mt-1">8</p>
            <p className="text-[10px] text-slate-500 font-bold mt-0.5">Routes arriving in next 5 min</p>
          </div>
          <div className="p-3 bg-red-100/60 border border-red-200 rounded-2xl text-[#9A0002] shrink-0">
            <Bus size={22} strokeWidth={2.5} />
          </div>
        </div>
      </motion.div>

      {/* View camera button */}
      <motion.button
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="w-full flex items-center justify-between px-5 py-4 rounded-2xl border border-red-200 bg-red-50 hover:bg-[#C8102E] hover:text-white transition-all font-black text-xs uppercase tracking-wider text-[#C8102E] shadow-sm"
      >
        <span>View Stop Camera</span>
        <Camera size={18} strokeWidth={2.5} />
      </motion.button>
    </div>
  );
}
