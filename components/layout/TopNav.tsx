"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell, Search, Moon, Sun, RefreshCw, Wifi } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { APP_NAME } from "@/lib/constants";
import { mockAlerts } from "@/mock/alerts";

interface TopNavProps {
  title?: string;
  subtitle?: string;
}

export function TopNav({ title, subtitle }: TopNavProps) {
  const [darkMode, setDarkMode] = useState(false);
  const [showAlerts, setShowAlerts] = useState(false);
  const activeAlerts = mockAlerts.filter((a) => a.status === "active");
  const criticalCount = activeAlerts.filter((a) => a.severity === "critical").length;

  const now = new Date();
  const timeStr = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
  const dateStr = now.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });

  const toggleDark = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <header className="h-16 flex items-center gap-4 px-6 border-b border-border bg-card/95 backdrop-blur-sm sticky top-0 z-40">
      {/* Left: Title */}
      <div className="flex-1 min-w-0">
        {title && (
          <div>
            <h1 className="font-heading text-xl text-foreground truncate">{title}</h1>
            {subtitle && (
              <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
            )}
          </div>
        )}
      </div>

      {/* Center: Live status */}
      <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
        </span>
        <span className="font-medium">Live</span>
        <span className="text-border">·</span>
        <Wifi size={12} />
        <span>{timeStr}</span>
        <span className="text-border">·</span>
        <span>{dateStr}</span>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Refresh */}
        <button className="p-2 rounded-xl hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
          <RefreshCw size={16} strokeWidth={1.75} />
        </button>

        {/* Dark mode */}
        <button
          onClick={toggleDark}
          className="p-2 rounded-xl hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
        >
          {darkMode ? <Sun size={16} strokeWidth={1.75} /> : <Moon size={16} strokeWidth={1.75} />}
        </button>

        {/* Alerts bell */}
        <div className="relative">
          <button
            onClick={() => setShowAlerts(!showAlerts)}
            className="relative p-2 rounded-xl hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
          >
            <Bell size={16} strokeWidth={1.75} />
            {criticalCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-danger rounded-full alert-pulse" />
            )}
          </button>

          <AnimatePresence>
            {showAlerts && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-80 bg-card border border-border rounded-2xl shadow-xl overflow-hidden z-50"
              >
                <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                  <span className="font-semibold text-sm">Active Alerts</span>
                  <span className="text-xs text-muted-foreground">{activeAlerts.length} active</span>
                </div>
                <div className="max-h-80 overflow-y-auto scrollbar-thin">
                  {activeAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="px-4 py-3 border-b border-border last:border-0 hover:bg-secondary transition-colors"
                    >
                      <div className="flex items-start gap-2">
                        <span
                          className={cn(
                            "mt-0.5 w-1.5 h-1.5 rounded-full shrink-0",
                            alert.severity === "critical" ? "bg-danger" : "bg-warning"
                          )}
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-foreground truncate">
                            {alert.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                            {alert.recommendedAction}
                          </p>
                        </div>
                        <span className="text-[10px] text-muted-foreground shrink-0 ml-auto">
                          CS{alert.caseStudy}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-3 border-t border-border">
                  <Link
                    href="/dashboard"
                    onClick={() => setShowAlerts(false)}
                    className="block text-center text-xs font-semibold text-primary hover:underline"
                  >
                    View all in Command Center →
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
