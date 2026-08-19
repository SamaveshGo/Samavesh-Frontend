"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { CalendarDays, Clock, Bus, MapPin, ChevronRight, CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

/* ── Mock shift roster for today ───────────────────────── */
const TODAY_SHIFTS = [
  {
    id: "s1",
    label: "Morning Shift",
    startTime: "06:00 AM",
    endTime: "10:00 AM",
    route: "312",
    from: "Dadar TT",
    to: "Andheri East",
    bus: "MH-01-LA-1234",
    depot: "Dadar Depot",
    trips: 4,
    status: "completed" as const, // completed | active | upcoming
  },
  {
    id: "s2",
    label: "Midday Shift",
    startTime: "11:00 AM",
    endTime: "03:00 PM",
    route: "312",
    from: "Andheri East",
    to: "Bandra Station",
    bus: "MH-01-LA-1234",
    depot: "Andheri Depot",
    trips: 5,
    status: "active" as const,
  },
  {
    id: "s3",
    label: "Evening Shift",
    startTime: "04:00 PM",
    endTime: "08:00 PM",
    route: "378",
    from: "Bandra Station",
    to: "Ghatkopar East",
    bus: "MH-01-LB-5678",
    depot: "Bandra Depot",
    trips: 5,
    status: "upcoming" as const,
  },
  {
    id: "s4",
    label: "Late Shift",
    startTime: "09:00 PM",
    endTime: "01:00 AM",
    route: "332",
    from: "Ghatkopar East",
    to: "Dadar TT",
    bus: "MH-01-LC-9012",
    depot: "Ghatkopar Depot",
    trips: 6,
    status: "upcoming" as const,
  },
];

const STATUS_CONFIG = {
  completed: {
    chip: "bg-slate-100 text-slate-700 border-slate-200",
    label: "Completed",
    dot: "bg-slate-400",
    cardBorder: "border-slate-200",
    dimmed: true,
  },
  active: {
    chip: "bg-[#C8102E] text-white border-[#C8102E]",
    label: "Active",
    dot: "bg-white animate-pulse",
    cardBorder: "border-[#C8102E] ring-1 ring-[#C8102E]/20 shadow-md",
    dimmed: false,
  },
  upcoming: {
    chip: "bg-red-50 text-[#C8102E] border-red-200",
    label: "Upcoming",
    dot: "bg-[#C8102E]",
    cardBorder: "border-slate-200",
    dimmed: false,
  },
};

/* ═══════════════════════════════════════════════════════════ */
export default function DriverShiftsPage() {
  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
 
  const [shifts, setShifts] = useState(TODAY_SHIFTS);
 
  useEffect(() => {
    try {
      const updated = TODAY_SHIFTS.map((s) => {
        const storedStatus = localStorage.getItem(`shift_status_${s.id}`);
        if (storedStatus) {
          return { ...s, status: storedStatus as any };
        }
        return s;
      });
      setShifts(updated);
    } catch (e) {
      console.error(e);
    }
  }, []);

  return (
    <div className="pb-28 page-enter select-none bg-[#EFE6DE] min-h-screen text-slate-900">

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="px-5 pt-6 pb-4 bg-[#F7EFE7] border-b border-[#DECFC2] mb-4">
        <div className="flex items-center gap-2 mb-0.5">
          <CalendarDays size={18} strokeWidth={2.5} className="text-[#9A0002]" />
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Today&apos;s Roster</h1>
        </div>
        <p className="text-xs text-slate-600 font-medium">{today} · 4 shifts scheduled</p>
      </div>

      {/* ── Summary row ─────────────────────────────────────── */}
      <div className="px-5 mb-4">
        <div className="flex items-center gap-3 bg-[#F7EFE7] rounded-2xl border border-[#DECFC2] px-4 py-3 shadow-sm">
          {[
            { label: "Completed", count: shifts.filter(s => s.status === 'completed').length, color: "text-slate-600" },
            { label: "Active", count: shifts.filter(s => s.status === 'active').length, color: "text-[#9A0002]" },
            { label: "Upcoming", count: shifts.filter(s => s.status === 'upcoming').length, color: "text-[#9A0002]" },
          ].map((item, i) => (
            <div key={item.label} className={cn("flex-1 text-center", i !== 0 && "border-l border-[#DECFC2]")}>
              <p className={`text-lg font-black ${item.color}`}>{item.count}</p>
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">{item.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Shift Cards ─────────────────────────────────────── */}
      <div className="px-5 space-y-3">
        {shifts.map((shift, i) => {
          const cfg = STATUS_CONFIG[shift.status];
          return (
            <motion.div
              key={shift.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className={cn(
                "bg-[#F7EFE7] rounded-2xl border border-[#DECFC2] shadow-sm overflow-hidden",
                cfg.dimmed && "opacity-75"
              )}
            >
              {/* Status accent bar */}
              <div
                className={cn(
                  "h-1.5",
                  shift.status === "active" ? "bg-[#C8102E]" : shift.status === "completed" ? "bg-slate-300" : "bg-red-200"
                )}
              />

              <div className="p-4">
                {/* Top row: shift name + status chip */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {shift.status === "completed"
                      ? <CheckCircle2 size={16} strokeWidth={2} className="text-slate-400" />
                      : <Circle size={14} strokeWidth={2.5} className={cn(shift.status === "active" ? "text-[#C8102E]" : "text-red-400")} />
                    }
                    <h3 className="text-base font-black text-slate-900">{shift.label}</h3>
                  </div>
                  <span className={cn("text-[9px] font-extrabold px-2.5 py-0.5 rounded-full border", cfg.chip)}>
                    <span className={cn("inline-block w-1.5 h-1.5 rounded-full mr-1 align-middle", cfg.dot)} />
                    {cfg.label}
                  </span>
                </div>

                {/* Info grid */}
                <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <Clock size={11} strokeWidth={2.5} className="text-[#C8102E]" />
                    <span className="font-bold text-slate-800">{shift.startTime} — {shift.endTime}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <Bus size={11} strokeWidth={2.5} className="text-[#C8102E]" />
                    <span className="font-bold text-slate-800">{shift.bus}</span>
                  </div>
                  <div className="col-span-2 flex items-center gap-1.5 text-slate-600">
                    <MapPin size={11} strokeWidth={2.5} className="text-[#C8102E]" />
                    <span className="font-bold text-slate-800">
                      Route {shift.route}: {shift.from} → {shift.to}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <CalendarDays size={11} strokeWidth={2.5} className="text-[#C8102E]" />
                    <span className="font-bold text-slate-800">{shift.trips} trips scheduled</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <MapPin size={11} strokeWidth={2.5} className="text-[#C8102E]" />
                    <span className="font-medium">{shift.depot}</span>
                  </div>
                </div>

                {/* Action button */}
                {shift.status !== "completed" && (
                  <Link
                    href={`/driver/shifts/${shift.id}`}
                    className={cn(
                      "w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-sm",
                      shift.status === "active"
                        ? "bg-[#C8102E] text-white hover:bg-[#9A0002]"
                        : "bg-red-50 border border-red-200 text-[#C8102E] hover:bg-red-100"
                    )}
                  >
                    {shift.status === "active" ? "Continue Shift" : "Start Shift"}
                    <ChevronRight size={15} strokeWidth={2.5} />
                  </Link>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
