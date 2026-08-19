"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin, Clock, Bus, ChevronRight, CheckCircle2, Circle, Navigation } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

/* ── Stop data per shift ────────────────────────────────── */
interface Stop {
  name: string;
  scheduledTime: string;
  status: "past" | "current" | "upcoming";
  passengers?: number;
  delay?: number; // minutes +/- 0
}

interface ShiftDetail {
  label: string;
  route: string;
  from: string;
  to: string;
  bus: string;
  startTime: string;
  endTime: string;
  trips: number;
  stops: Stop[];
}

const SHIFT_DB: Record<string, ShiftDetail> = {
  s1: {
    label: "Morning Shift",
    route: "312",
    from: "Dadar TT",
    to: "Andheri East",
    bus: "MH-01-LA-1234",
    startTime: "06:00 AM",
    endTime: "10:00 AM",
    trips: 4,
    stops: [
      { name: "Dadar TT",          scheduledTime: "06:00 AM", status: "past",    passengers: 34, delay:  0 },
      { name: "Matunga Rd",         scheduledTime: "06:08 AM", status: "past",    passengers: 41, delay:  1 },
      { name: "Sion Circle",        scheduledTime: "06:15 AM", status: "past",    passengers: 55, delay:  2 },
      { name: "Kurla Station",      scheduledTime: "06:25 AM", status: "current", passengers: 68, delay:  3 },
      { name: "Ghatkopar East",     scheduledTime: "06:35 AM", status: "upcoming" },
      { name: "Vikhroli",           scheduledTime: "06:43 AM", status: "upcoming" },
      { name: "Bhandup",            scheduledTime: "06:50 AM", status: "upcoming" },
      { name: "Mulund Check Naka",  scheduledTime: "06:57 AM", status: "upcoming" },
      { name: "Andheri East",       scheduledTime: "07:10 AM", status: "upcoming" },
    ],
  },
  s2: {
    label: "Midday Shift",
    route: "312",
    from: "Andheri East",
    to: "Bandra Station",
    bus: "MH-01-LA-1234",
    startTime: "11:00 AM",
    endTime: "03:00 PM",
    trips: 5,
    stops: [
      { name: "Andheri East",       scheduledTime: "11:00 AM", status: "upcoming" },
      { name: "Vile Parle",         scheduledTime: "11:15 AM", status: "upcoming" },
      { name: "Santacruz",          scheduledTime: "11:30 AM", status: "upcoming" },
      { name: "Bandra Station",     scheduledTime: "11:45 AM", status: "upcoming" },
    ],
  },
  s3: {
    label: "Evening Shift",
    route: "378",
    from: "Bandra Station",
    to: "Ghatkopar East",
    bus: "MH-01-LB-5678",
    startTime: "04:00 PM",
    endTime: "08:00 PM",
    trips: 5,
    stops: [
      { name: "Bandra Station",     scheduledTime: "04:00 PM", status: "upcoming" },
      { name: "Dharavi Depot",      scheduledTime: "04:12 PM", status: "upcoming" },
      { name: "BKC Junction",       scheduledTime: "04:22 PM", status: "upcoming" },
      { name: "Kurla East",         scheduledTime: "04:33 PM", status: "upcoming" },
      { name: "Ghatkopar East",     scheduledTime: "04:48 PM", status: "upcoming" },
    ],
  },
  s4: {
    label: "Late Shift",
    route: "332",
    from: "Ghatkopar East",
    to: "Dadar TT",
    bus: "MH-01-LC-9012",
    startTime: "09:00 PM",
    endTime: "01:00 AM",
    trips: 6,
    stops: [
      { name: "Ghatkopar East",     scheduledTime: "09:00 PM", status: "upcoming" },
      { name: "Kurla Station",      scheduledTime: "09:15 PM", status: "upcoming" },
      { name: "Sion Circle",        scheduledTime: "09:30 PM", status: "upcoming" },
      { name: "Matunga Rd",         scheduledTime: "09:45 PM", status: "upcoming" },
      { name: "Dadar TT",          scheduledTime: "10:00 PM", status: "upcoming" },
    ],
  },
};

/* ═══════════════════════════════════════════════════════════ */
export default function ShiftDetailPage() {
  const { shiftId } = useParams<{ shiftId: string }>();
  const router = useRouter();
  const shift = SHIFT_DB[shiftId] ?? SHIFT_DB["s2"];

  const [activeIdx, setActiveIdx] = useState(() => {
    const idx = shift.stops.findIndex((s) => s.status === "current");
    return idx !== -1 ? idx : 0;
  });

  useEffect(() => {
    const idx = shift.stops.findIndex((s) => s.status === "current");
    setActiveIdx(idx !== -1 ? idx : 0);
  }, [shift]);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIdx((prev) => {
        if (prev >= shift.stops.length - 1) {
          return 0;
        }
        return prev + 1;
      });
    }, 25000); // 25 seconds simulation interval

    return () => clearInterval(interval);
  }, [shift]);

  const simulatedStops = shift.stops.map((stop, idx) => {
    let status: "past" | "current" | "upcoming" = "upcoming";
    if (idx < activeIdx) {
      status = "past";
    } else if (idx === activeIdx) {
      status = "current";
    }
    return {
      ...stop,
      status
    };
  });

  const completedCount = activeIdx;
  const progress = shift.stops.length > 1 ? activeIdx / (shift.stops.length - 1) : 0;

  return (
    <div className="flex flex-col min-h-screen bg-white text-slate-900 select-none">

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="px-4 py-4 bg-white flex items-center gap-3 border-b border-slate-200 shrink-0">
        <button onClick={() => router.back()} className="p-2 rounded-2xl bg-white border border-slate-200 hover:border-red-200 transition-colors shadow-sm">
          <ArrowLeft size={18} strokeWidth={2.5} className="text-[#C8102E]" />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-black text-slate-900">{shift.label} — Route {shift.route}</h1>
          <p className="text-[10px] text-slate-600 font-medium">{shift.from} → {shift.to}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Progress</p>
          <p className="text-sm font-black text-[#C8102E]">{completedCount} / {shift.stops.length}</p>
        </div>
      </div>

      {/* ── Shift info bar ──────────────────────────────────── */}
      <div className="px-4 py-3 bg-red-50/60 border-b border-red-100 shrink-0">
        <div className="flex items-center gap-5 text-xs">
          <div className="flex items-center gap-1.5 text-slate-600">
            <Clock size={12} strokeWidth={2.5} className="text-[#C8102E]" />
            <span className="font-bold text-slate-800">{shift.startTime} — {shift.endTime}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-600">
            <Bus size={12} strokeWidth={2.5} className="text-[#C8102E]" />
            <span className="font-bold text-slate-800">{shift.bus}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-600">
            <Navigation size={12} strokeWidth={2.5} className="text-[#C8102E]" />
            <span className="font-bold text-slate-800">{shift.trips} trips</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-2 h-1.5 bg-red-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress * 100}%` }}
            transition={{ duration: 0.5 }}
            className="h-full bg-[#C8102E] rounded-full"
          />
        </div>
      </div>

      {/* ── Stop List ───────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-4">
        <p className="text-[10px] font-black text-[#C8102E] uppercase tracking-widest mb-3">
          Route Stops ({shift.stops.length})
        </p>

        <div className="relative">
          {/* Vertical timeline line */}
          <div className="absolute left-[19px] top-4 bottom-4 w-[2px] bg-slate-200 z-0" />

          <div className="space-y-0">
            {simulatedStops.map((stop, idx) => {
              const isLast = idx === shift.stops.length - 1;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className="flex items-start gap-4 py-3 relative z-10"
                >
                  {/* Timeline dot */}
                  <div className="shrink-0 mt-0.5">
                    {stop.status === "past" ? (
                      <div className="w-10 h-10 rounded-full bg-white border-2 border-slate-300 flex items-center justify-center">
                        <CheckCircle2 size={16} strokeWidth={2} className="text-slate-400" />
                      </div>
                    ) : stop.status === "current" ? (
                      <div className="w-10 h-10 rounded-full bg-[#C8102E] border-2 border-[#C8102E] flex items-center justify-center ring-4 ring-[#C8102E]/20 shadow-md">
                        <Bus size={16} strokeWidth={2.5} className="text-white" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-white border-2 border-red-200 flex items-center justify-center">
                        <Circle size={14} strokeWidth={2.5} className="text-[#C8102E]" />
                      </div>
                    )}
                  </div>

                  {/* Stop info */}
                  <div className="flex-1 min-w-0 py-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className={cn(
                        "text-sm font-black",
                        stop.status === "past" ? "text-slate-400" : "text-slate-900"
                      )}>
                        {stop.name}
                      </p>
                      {stop.status === "current" && (
                        <span className="text-[9px] font-black bg-[#C8102E] text-white px-2 py-0.5 rounded-full shadow-sm uppercase tracking-wider">
                          BUS HERE
                        </span>
                      )}
                      {(stop.delay ?? 0) > 0 && (
                        <span className="text-[9px] font-black bg-red-50 text-[#C8102E] border border-red-200 px-1.5 py-0.5 rounded-full">
                          +{stop.delay}m delay
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <p className="text-[10px] font-bold flex items-center gap-1 text-slate-500">
                        <Clock size={9} strokeWidth={2.5} className="text-[#C8102E]" />
                        {stop.scheduledTime}
                      </p>
                      {stop.passengers !== undefined && (
                        <p className="text-[10px] text-slate-500 font-bold">
                          {stop.passengers} pax
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Begin Journey CTA ────────────────────────────────── */}
      <div className="px-4 py-4 border-t border-slate-200 bg-white shrink-0">
        <Link
          href={`/driver/driving?shiftId=${shiftId}`}
          className="w-full flex items-center justify-center gap-2 py-4 bg-[#C8102E] text-white font-black uppercase tracking-wider rounded-2xl text-xs hover:bg-[#9A0002] transition-colors shadow-lg"
        >
          <Navigation size={16} strokeWidth={2.5} />
          Begin Journey
          <ChevronRight size={16} strokeWidth={2.5} />
        </Link>
        <p className="text-center text-[10px] text-slate-500 font-bold mt-2">
          Voice commands will activate automatically once the journey begins
        </p>
      </div>
    </div>
  );
}
