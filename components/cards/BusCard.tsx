"use client";

import React from "react";
import { motion } from "framer-motion";
import { Bus as BusIcon, AlertTriangle, Clock, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Bus } from "@/types";

interface BusCardProps {
  bus: Bus;
  index?: number;
  compact?: boolean;
  selected?: boolean;
  onClick?: () => void;
}

export const BusCard: React.FC<BusCardProps> = ({
  bus,
  index = 0,
  compact = false,
  selected = false,
  onClick,
}) => {
  const isBunching = bus.status === "bunching" || bus.status === "bunching_risk";
  const isDelayed = bus.status === "delayed";

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      onClick={onClick}
      className={cn(
        "p-3 rounded-xl border transition-all cursor-pointer select-none",
        selected
          ? "bg-primary/10 border-primary shadow-sm"
          : "bg-card hover:bg-accent/40 border-border",
        compact ? "py-2.5 px-3" : "p-4"
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0",
              isBunching
                ? "bg-danger/15 text-danger"
                : isDelayed
                ? "bg-warning/15 text-warning"
                : "bg-success/15 text-success"
            )}
          >
            {bus.routeNumber}
          </div>

          <div>
            <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
              {bus.displayId}
              {isBunching && (
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[9px] font-bold rounded bg-danger/20 text-danger uppercase">
                  <AlertTriangle className="w-2.5 h-2.5" /> Risk
                </span>
              )}
            </h4>
            <p className="text-[10px] text-muted-foreground truncate max-w-[140px]">
              Next: {bus.nextStop}
            </p>
          </div>
        </div>

        <div className="text-right shrink-0">
          <span className="text-[10px] font-semibold text-muted-foreground block flex items-center justify-end gap-1">
            <Users className="w-3 h-3 inline" /> {bus.passengerCount}/{bus.capacity}
          </span>
          <span
            className={cn(
              "text-[10px] font-bold block mt-0.5",
              bus.delay > 0 ? "text-warning" : "text-success"
            )}
          >
            {bus.delay > 0 ? `+${bus.delay}m delay` : "On Time"}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default BusCard;
