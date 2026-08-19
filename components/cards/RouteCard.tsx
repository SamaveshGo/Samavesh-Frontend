"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ROUTE_COLORS } from "@/lib/constants";
import type { Route } from "@/types";
import { Bus, TrendingDown, TrendingUp, AlertCircle } from "lucide-react";

interface RouteCardProps {
  route: Route;
  index?: number;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
}

const STATUS_CONFIG = {
  normal: { label: "Normal", bg: "bg-success/10 text-success border-success/20" },
  at_risk: { label: "At Risk", bg: "bg-warning/10 text-warning border-warning/20" },
  bunching: { label: "Bunching", bg: "bg-danger/10 text-danger border-danger/20" },
  disrupted: { label: "Disrupted", bg: "bg-orange-500/10 text-orange-600 border-orange-500/20" },
};

export function RouteCard({ route, index = 0, selected = false, onClick, className }: RouteCardProps) {
  const color = ROUTE_COLORS[route.number] || "#9A0002";
  const statusConfig = STATUS_CONFIG[route.status];
  const headwayRatio = route.currentHeadway / route.scheduledHeadway;
  const headwayHealthy = headwayRatio >= 0.7;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={onClick}
      className={cn(
        "samavesh-card p-4 cursor-pointer transition-all duration-200 hover:shadow-md zebra-hover",
        selected && "ring-2",
        className
      )}
      style={selected ? { boxShadow: `0 0 0 2px ${color}` } : undefined}
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center font-heading font-bold text-sm text-white shrink-0"
          style={{ backgroundColor: color }}
        >
          {route.number}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-foreground truncate">{route.name}</p>
          <div className="flex items-center gap-1 mt-0.5">
            <Bus size={10} className="text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground">{route.activeBuses} active buses</span>
          </div>
        </div>
        <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0", statusConfig.bg)}>
          {statusConfig.label}
        </span>
      </div>

      {/* Headway comparison */}
      <div className="mt-3 p-2.5 rounded-xl bg-muted/50">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-muted-foreground">Current Headway</span>
          <div className="flex items-center gap-1">
            {headwayHealthy ? (
              <TrendingUp size={10} className="text-success" />
            ) : (
              <TrendingDown size={10} className="text-danger" />
            )}
            <span className={cn("font-bold tabular-nums", headwayHealthy ? "text-success" : "text-danger")}>
              {route.currentHeadway} min
            </span>
            <span className="text-muted-foreground">/ {route.scheduledHeadway} min sched.</span>
          </div>
        </div>
        {/* Headway ratio bar */}
        <div className="h-1.5 rounded-full bg-background overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, headwayRatio * 100)}%` }}
            transition={{ delay: index * 0.05 + 0.1, duration: 0.5 }}
            className="h-full rounded-full"
            style={{ backgroundColor: headwayHealthy ? "#228B22" : "#9A0002" }}
          />
        </div>
      </div>

      {/* Alert indicator */}
      {(route.status === "bunching" || route.status === "at_risk") && (
        <div className="mt-2 flex items-center gap-1.5 text-[10px] text-danger">
          <AlertCircle size={10} strokeWidth={2.5} />
          <span className="font-medium">
            {route.status === "bunching" ? "Active bunching detected" : "Bunching risk rising"}
          </span>
        </div>
      )}
    </motion.div>
  );
}
