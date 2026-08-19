"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Map,
  BarChart2,
  Play,
  Bus,
  Bell,
  ChevronLeft,
  ChevronRight,
  Activity,
  Settings,
  HelpCircle,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { APP_NAME } from "@/lib/constants";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  badge?: number;
}

const mainNavItems: NavItem[] = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/map", label: "Live Map", icon: Map },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart2 },
];

const secondaryNavItems: NavItem[] = [
  { href: "/driver", label: "Driver App", icon: Bus },
  { href: "/commuter", label: "Commuter App", icon: Activity },
  { href: "/design-system", label: "Design System", icon: Layers },
];

const bottomNavItems: NavItem[] = [
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
  { href: "/dashboard/help", label: "Help", icon: HelpCircle },
];

export function DashboardSidebar({ alertCount = 0 }: { alertCount?: number }) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      className="relative flex flex-col h-full overflow-hidden shrink-0 select-none"
      style={{
        background: "linear-gradient(160deg, rgba(255,255,255,0.72) 0%, rgba(240,240,245,0.60) 60%, rgba(220,222,230,0.55) 100%)",
        backdropFilter: "blur(24px) saturate(1.8)",
        WebkitBackdropFilter: "blur(24px) saturate(1.8)",
        borderRight: "1px solid rgba(255,255,255,0.55)",
        boxShadow: "inset 1px 0 0 rgba(255,255,255,0.9), 4px 0 24px rgba(0,0,0,0.06)",
      }}
    >
      {/* Subtle top highlight streak */}
      <div className="absolute top-0 left-0 right-0 h-px pointer-events-none z-20"
        style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.8) 40%, rgba(255,255,255,0.8) 60%, transparent)" }}
      />
      {/* Logo */}
      <div className="h-16 flex items-center px-4 shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.4)" }}>
        <Link href="/" className="flex items-center gap-3 min-w-0">
          {/* Zebra Logo Mark */}
          <img src="/logo.png" alt="SAMAVESH Logo" className="w-8 h-8 object-contain shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.15 }}
                className="overflow-hidden"
              >
                <span className="font-heading text-lg text-foreground">{APP_NAME}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </Link>
      </div>

      {/* Navigation list */}
      <div className="flex-1 py-4 flex flex-col gap-6 overflow-y-auto scrollbar-hide">
        {/* Main controllers */}
        <div className="px-3 flex flex-col gap-1">
          {mainNavItems.map((item) => (
            <SidebarLink
              key={item.href}
              item={{
                ...item,
                badge: item.href === "/dashboard/map" ? alertCount : undefined,
              }}
              isActive={pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))}
              collapsed={collapsed}
            />
          ))}
        </div>

        {/* Secondary nav */}
        <div className="px-3 mb-1">
          {!collapsed && (
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-2 mb-2">
              App Views
            </p>
          )}
          {secondaryNavItems.map((item) => (
            <SidebarLink
              key={item.href}
              item={item}
              isActive={pathname.startsWith(item.href)}
              collapsed={collapsed}
            />
          ))}
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-border px-3 py-3 flex flex-col gap-1">
        {bottomNavItems.map((item) => (
          <SidebarLink
            key={item.href}
            item={item}
            isActive={pathname === item.href}
            collapsed={collapsed}
          />
        ))}
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute top-[68px] -right-3 w-6 h-6 bg-card border border-border rounded-full flex items-center justify-center hover:bg-secondary transition-colors shadow-sm z-10"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? (
          <ChevronRight size={12} className="text-muted-foreground" />
        ) : (
          <ChevronLeft size={12} className="text-muted-foreground" />
        )}
      </button>
    </motion.aside>
  );
}

function SidebarLink({
  item,
  isActive,
  collapsed,
}: {
  item: NavItem;
  isActive: boolean;
  collapsed: boolean;
}) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      className={cn(
        "relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 group",
        isActive ? "text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary"
      )}
    >
      {/* Active indicator */}
      {isActive && (
        <motion.div
          layoutId="sidebar-active"
          className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-primary rounded-r-full"
        />
      )}

      <Icon
        size={18}
        strokeWidth={1.75}
        className={cn(
          "shrink-0 transition-colors",
          isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
        )}
      />

      <AnimatePresence>
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -6 }}
            transition={{ duration: 0.12 }}
            className="truncate"
          >
            {item.label}
          </motion.span>
        )}
      </AnimatePresence>

      {item.badge && item.badge > 0 && (
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="ml-auto bg-danger text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center"
            >
              {item.badge}
            </motion.span>
          )}
        </AnimatePresence>
      )}
    </Link>
  );
}
