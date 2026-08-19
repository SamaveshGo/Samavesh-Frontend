"use client";

import { motion } from "framer-motion";
import { AlertTriangle, GitMerge, Users, CloudRain, Clock, TrendingUp } from "lucide-react";
import { cn, getRiskScoreColor } from "@/lib/utils";
import { CASE_STUDY_COLORS } from "@/lib/constants";
import type { ForecastItem, CaseStudyType } from "@/types";

interface ForecastCardProps {
  item: ForecastItem;
  index?: number;
  className?: string;
}

const CS_ICONS: Record<CaseStudyType, React.ElementType> = {
  1: GitMerge,
  2: Users,
  3: AlertTriangle,
  4: CloudRain,
};

const CS_LABELS: Record<CaseStudyType, string> = {
  1: "Same-Route",
  2: "Stop Congestion",
  3: "Traffic",
  4: "Weather",
};

export function ForecastCard({ item, index = 0, className }: ForecastCardProps) {
  const Icon = CS_ICONS[item.caseStudy];
  const color = CASE_STUDY_COLORS[item.caseStudy];
  const riskPct = item.riskScore;

  return (
    <motion.div
      initial={{ opacity: 0, x: 8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.07 }}
      className={cn("samavesh-card p-4 zebra-hover hover:shadow-md transition-shadow", className)}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div
          className="p-2 rounded-xl shrink-0"
          style={{ backgroundColor: `${color}15` }}
        >
          <Icon size={14} style={{ color }} strokeWidth={2} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-xs font-bold text-foreground">Route {item.routeNumber}</p>
              <p className="text-[10px] text-muted-foreground truncate">{item.stopName}</p>
            </div>
            <div className="text-right shrink-0">
              <p className={cn("text-lg font-heading font-bold tabular-nums", getRiskScoreColor(riskPct))}>
                {riskPct}%
              </p>
              <p className="text-[10px] text-muted-foreground">risk</p>
            </div>
          </div>

          {/* Risk bar */}
          <div className="mt-2.5 h-1.5 rounded-full bg-muted overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${riskPct}%` }}
              transition={{ delay: index * 0.07 + 0.2, duration: 0.5, ease: "easeOut" }}
              className="h-full rounded-full"
              style={{ backgroundColor: color }}
            />
          </div>

          {/* Footer */}
          <div className="mt-2 flex items-center justify-between text-[10px]">
            <span
              className="px-1.5 py-0.5 rounded font-semibold"
              style={{ backgroundColor: `${color}15`, color }}
            >
              CS{item.caseStudy} · {CS_LABELS[item.caseStudy]}
            </span>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock size={9} />
              <span className="font-semibold tabular-nums">{item.timeToEvent} min</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
