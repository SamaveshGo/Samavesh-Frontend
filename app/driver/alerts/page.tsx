"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, AlertTriangle, Clock, Compass, AlertCircle, Construction, CheckCircle2, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/* ── Driver News / Mumbai Traffic Feed Mock ────────────── */
const TRAFFIC_NEWS = [
  {
    id: "a1",
    type: "route-alert",
    title: "Bunching Risk — Route 312",
    description: "Headway collapsing with bus ahead. Hold action of 3 mins recommended at next stop.",
    scope: "My Route",
    severity: "critical",
    icon: AlertTriangle,
    iconBg: "bg-red-50 text-red-700 border-red-100",
    border: "border-red-200 bg-white",
    action: "Action: HOLD for 3 mins at next stop",
    time: "Just now",
  },
  {
    id: "a2",
    type: "reroute",
    title: "Reroute Alert — Worli Sea Face",
    description: "Worli Sea Face closed until July 15 due to high tide & coastal road construction. Divert via Senapati Bapat Marg.",
    scope: "Mumbai West",
    severity: "moderate",
    icon: Compass,
    iconBg: "bg-blue-50 text-blue-700 border-blue-100",
    border: "border-blue-200 bg-white",
    action: "Suggestion: Divert via Senapati Bapat Marg",
    time: "15 min ago",
  },
  {
    id: "a3",
    type: "traffic",
    title: "Heavy Congestion — Western Express Highway",
    description: "Slow traffic near Andheri East flyover due to waterlogging. Delays of 20-30 mins expected.",
    scope: "WEH Traffic",
    severity: "moderate",
    icon: AlertCircle,
    iconBg: "bg-amber-50 text-amber-700 border-amber-100",
    border: "border-amber-200 bg-white",
    action: "Info: Heavy waterlogging near flyover",
    time: "30 min ago",
  },
  {
    id: "a4",
    type: "roadwork",
    title: "Road Repair — Sion Circle East",
    description: "Single lane traffic only due to metro girder placement. Slow speed warning on approach.",
    scope: "Sion Traffic",
    severity: "minor",
    icon: Construction,
    iconBg: "bg-orange-50 text-orange-700 border-orange-100",
    border: "border-orange-200 bg-white",
    action: "Speed limit: max 20 km/h on approach",
    time: "2 hrs ago",
  },
  {
    id: "a5",
    type: "update",
    title: "Accident Cleared — Eastern Expressway",
    description: "Trombay junction accident cleared. Traffic flow returning to normal on northbound lanes.",
    scope: "EEH Update",
    severity: "resolved",
    icon: CheckCircle2,
    iconBg: "bg-emerald-50 text-emerald-700 border-emerald-100",
    border: "border-emerald-200 bg-white",
    action: "Resolved: Traffic normal",
    time: "3 hrs ago",
  },
];

/* ═══════════════════════════════════════════════════════════ */
export default function DriverAlertsPage() {
  const [filter, setFilter] = useState<"all" | "my-route" | "mumbai">("all");

  const filtered = TRAFFIC_NEWS.filter((item) => {
    if (filter === "my-route") return item.scope === "My Route";
    if (filter === "mumbai") return item.scope !== "My Route";
    return true;
  });

  return (
    <div className="px-5 py-6 space-y-5 pb-28 page-enter select-none bg-[#EFE6DE] min-h-screen text-slate-900">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/driver/home" className="p-2.5 rounded-2xl bg-[#F7EFE7] border border-[#DECFC2] hover:border-red-200 transition-colors shadow-sm">
          <ArrowLeft size={18} strokeWidth={2.5} className="text-[#9A0002]" />
        </Link>
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Traffic Alerts</h1>
          <p className="text-xs text-slate-600 font-medium">{TRAFFIC_NEWS.length} active updates across network</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex bg-[#E6DBD0]/60 p-1.5 rounded-2xl border border-[#DECFC2]">
        {(["all", "my-route", "mumbai"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "flex-1 py-2 text-xs font-black rounded-xl transition-all text-center uppercase tracking-wider",
              filter === f
                ? "bg-[#9A0002] text-white shadow-sm"
                : "text-slate-700 hover:text-[#9A0002]"
            )}
          >
            {f === "all" ? "All Updates" : f === "my-route" ? "My Route" : "Mumbai Feed"}
          </button>
        ))}
      </div>

      {/* Alerts Feed */}
      <div className="space-y-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={filter}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-4"
          >
            {filtered.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  className="rounded-2xl border border-[#DECFC2] shadow-sm p-4 flex flex-col gap-3.5 bg-[#F7EFE7] transition-all hover:shadow-md border-l-4 border-l-[#9A0002]"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl shrink-0 mt-0.5 border bg-red-50 text-[#C8102E] border-red-100">
                      <Icon size={16} strokeWidth={2.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="text-[9px] font-black uppercase tracking-wider text-[#C8102E] bg-red-50 px-2 py-0.5 rounded-full border border-red-100">
                          {item.scope}
                        </span>
                        <span className="text-[9px] text-slate-500 font-bold">{item.time}</span>
                      </div>
                      <p className="text-sm font-black text-slate-900 mt-1.5 leading-snug">{item.title}</p>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">{item.description}</p>
                    </div>
                  </div>

                  {/* Recommendation action bottom line */}
                  <div className="bg-red-50/70 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-bold flex items-center justify-between border border-red-100">
                    <span className="truncate mr-2">{item.action}</span>
                    {item.type === "route-alert" && (
                      <Link href="/driver/driving" className="text-[10px] font-black text-[#C8102E] flex items-center gap-0.5 hover:underline shrink-0">
                        View HUD <ChevronRight size={11} strokeWidth={3} />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </motion.div>
        </AnimatePresence>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-slate-500">
            <CheckCircle2 size={32} className="mx-auto mb-2 opacity-30 text-[#C8102E]" />
            <p className="text-sm font-bold">No updates in this feed</p>
          </div>
        )}
      </div>
    </div>
  );
}
