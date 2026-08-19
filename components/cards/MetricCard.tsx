"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { KPIData } from "@/types";

interface MetricCardProps {
  data: KPIData;
  index?: number;
  className?: string;
  large?: boolean;
}

export function MetricCard({ data, index = 0, className, large = false }: MetricCardProps) {
  const trendIcon = data.trend === "up"
    ? <TrendingUp size={12} />
    : data.trend === "down"
    ? <TrendingDown size={12} />
    : <Minus size={12} />;

  const trendColor = data.trend === "up"
    ? "text-success bg-success/10"
    : data.trend === "down"
    ? "text-danger bg-danger/10"
    : "text-muted-foreground bg-muted";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className={cn("samavesh-card p-5 flex flex-col gap-3 zebra-hover hover:shadow-md transition-shadow", className)}
    >
      {/* Top row */}
      <div className="flex items-center justify-between">
        <p className={cn("text-xs font-semibold uppercase tracking-widest text-muted-foreground", large && "text-sm")}>
          {data.label}
        </p>
        {data.trend && data.change !== undefined && (
          <span className={cn("flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full", trendColor)}>
            {trendIcon}
            {Math.abs(data.change).toFixed(1)}%
          </span>
        )}
      </div>

      {/* Value */}
      <div className="flex items-end gap-1.5">
        <motion.span
          className={cn(
            "font-heading tabular-nums leading-none",
            large ? "text-5xl" : "text-3xl",
            data.color || "text-foreground"
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: index * 0.05 + 0.1 }}
        >
          {data.value}
        </motion.span>
        {data.unit && (
          <span className="text-base text-muted-foreground pb-0.5">{data.unit}</span>
        )}
      </div>

      {/* Zebra accent bottom bar */}
      <div className="zebra-accent-border opacity-40" />
    </motion.div>
  );
}
