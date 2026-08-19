"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Bus, Ticket, User, CalendarDays, Bell, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface MobileNavProps {
  variant: "driver" | "commuter";
}

const driverNavItems = [
  { href: "/driver/home", label: "Dashboard", icon: Home },
  { href: "/driver/shifts", label: "Shifts", icon: CalendarDays },
  { href: "/driver/alerts", label: "Alerts", icon: Bell },
  { href: "/driver/more", label: "More", icon: MoreHorizontal },
];

const commuterNavItems = [
  { href: "/commuter", label: "Home", icon: Home },
  { href: "/commuter/search", label: "My Bus", icon: Bus },
  { href: "/commuter/tickets", label: "Trips", icon: Ticket },
  { href: "/commuter/profile", label: "Profile", icon: User },
];

export function MobileNav({ variant }: MobileNavProps) {
  const pathname = usePathname();
  const items = variant === "driver" ? driverNavItems : commuterNavItems;

  return (
    <div className="w-full max-w-[420px] mx-auto px-3.5 pb-3.5 pt-2 bg-gradient-to-t from-[#FAF6F0] via-[#FAF6F0]/95 to-transparent select-none pointer-events-auto">
      <nav
        className={cn(
          "rounded-2xl flex items-center justify-around py-1.5 px-2 relative overflow-hidden shadow-2xl border",
          variant === "commuter"
            ? "bg-[#9A0002] border-white/20"
            : "bg-white border-red-200 text-slate-800"
        )}
        style={{
          boxShadow: variant === "commuter" ? "0 12px 32px rgba(154, 0, 2, 0.45)" : "0 12px 32px rgba(154, 0, 2, 0.15)"
        }}
      >
        {items.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/driver" &&
              item.href !== "/commuter" &&
              pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-0.5 py-2 px-4 rounded-xl transition-all duration-200 relative z-10"
            >
              {/* Active pill background */}
              {isActive && (
                <motion.div
                  layoutId={`nav-active-${variant}`}
                  className={cn(
                    "absolute inset-0 rounded-xl shadow-md z-0",
                    variant === "commuter" ? "bg-white" : "bg-[#9A0002]"
                  )}
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}

              <Icon
                size={19}
                strokeWidth={isActive ? 2.5 : 2}
                className={cn(
                  "transition-all relative z-10",
                  variant === "commuter"
                    ? isActive ? "text-[#9A0002]" : "text-white/70 hover:text-white"
                    : isActive ? "text-white" : "text-slate-600 hover:text-[#9A0002]"
                )}
              />
              <span
                className={cn(
                  "text-[10px] font-extrabold tracking-wide transition-colors relative z-10",
                  variant === "commuter"
                    ? isActive ? "text-[#9A0002]" : "text-white/70"
                    : isActive ? "text-white" : "text-slate-600"
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
