"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home, CalendarDays, Bell, MoreHorizontal,
  Bus, Zap, Map,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface DriverNavProps {
  variant: "sidebar" | "bottom";
}

const navItems = [
  { href: "/driver/home",   label: "Dashboard", icon: Home },
  { href: "/driver/shifts",  label: "Shifts",    icon: CalendarDays },
  { href: "/driver/alerts",  label: "Alerts",    icon: Bell },
  { href: "/driver/more",    label: "More",      icon: MoreHorizontal },
];

export function DriverNav({ variant }: DriverNavProps) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || (href !== "/driver" && pathname.startsWith(href));

  // ── DESKTOP SIDEBAR ─────────────────────────────────────────────────────
  if (variant === "sidebar") {
    return (
      <aside className="w-64 flex-shrink-0 bg-[#F7EFE7] border-r border-[#DECFC2] flex flex-col h-full shadow-sm">
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-6 border-b border-[#DECFC2]/60">
          <div className="w-10 h-10 rounded-2xl bg-[#9A0002] flex items-center justify-center shadow-md">
            <Bus size={20} className="text-white" />
          </div>
          <div>
            <span className="text-xs font-black text-[#9A0002] uppercase tracking-widest block">
              SAMAVESH
            </span>
            <span className="text-[10px] text-slate-500 font-medium">Driver Portal</span>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex items-center gap-3.5 px-4 py-3 rounded-2xl font-bold text-sm transition-all duration-200 group",
                  active
                    ? "bg-[#9A0002] text-white shadow-lg shadow-red-900/20"
                    : "text-slate-700 hover:bg-[#E6DBD0] hover:text-[#9A0002]"
                )}
              >
                {active && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 rounded-2xl bg-[#9A0002]"
                    style={{ zIndex: -1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <Icon
                  size={18}
                  strokeWidth={active ? 2.5 : 2}
                  className={cn(
                    "transition-colors relative z-10",
                    active ? "text-white" : "text-slate-500 group-hover:text-[#9A0002]"
                  )}
                />
                <span className="relative z-10">{item.label}</span>
                {active && (
                  <span className="ml-auto relative z-10 w-1.5 h-1.5 rounded-full bg-white/60" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom status */}
        <div className="px-6 py-5 border-t border-[#DECFC2]/60">
          <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-[#E6DBD0]/60 border border-[#DECFC2]">
            <span className="w-2 h-2 rounded-full bg-[#9A0002] animate-pulse shrink-0" />
            <div>
              <span className="text-[9px] font-black uppercase tracking-widest text-[#9A0002] block">
                Simulation Live
              </span>
              <span className="text-[9px] text-slate-500 font-medium">Port 8000 · WS Active</span>
            </div>
          </div>
        </div>
      </aside>
    );
  }

  // ── MOBILE BOTTOM NAV ────────────────────────────────────────────────────
  return (
    <div className="fixed bottom-0 left-0 right-0 z-[99999] px-4 pb-4 pt-2 bg-gradient-to-t from-[#EFE6DE] via-[#EFE6DE]/95 to-transparent pointer-events-auto">
      <nav
        className="rounded-2xl flex items-center justify-around py-1 px-2 relative overflow-hidden shadow-2xl border bg-[#F7EFE7] border-[#DECFC2]"
        style={{ boxShadow: "0 12px 32px rgba(154, 0, 2, 0.12)" }}
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-0.5 py-2 px-3 rounded-xl transition-all duration-200 relative z-10"
            >
              {active && (
                <motion.div
                  layoutId="bottomnav-active"
                  className="absolute inset-0 rounded-xl bg-[#9A0002] shadow-md"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              <Icon
                size={18}
                strokeWidth={active ? 2.5 : 2}
                className={cn(
                  "relative z-10 transition-colors",
                  active ? "text-white" : "text-slate-500"
                )}
              />
              <span className={cn(
                "text-[9px] font-extrabold tracking-wide relative z-10",
                active ? "text-white" : "text-slate-500"
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
