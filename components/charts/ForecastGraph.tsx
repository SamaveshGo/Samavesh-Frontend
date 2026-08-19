"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from "recharts";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { ForecastPoint } from "@/types";

interface ForecastGraphProps {
  data: ForecastPoint[];
  title?: string;
  className?: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload as ForecastPoint;
  return (
    <div className="samavesh-card px-3 py-2.5 text-xs min-w-[160px]">
      <p className="font-semibold text-foreground mb-1">{label}</p>
      <div className="flex items-center justify-between gap-3">
        <span className="text-muted-foreground">Risk Score</span>
        <span className={cn("font-bold tabular-nums", d.riskScore >= 70 ? "text-danger" : d.riskScore >= 50 ? "text-warning" : "text-success")}>
          {d.riskScore}%
        </span>
      </div>
      <div className="flex items-center justify-between gap-3">
        <span className="text-muted-foreground">Confidence</span>
        <span className="font-bold tabular-nums text-info">{d.confidence}%</span>
      </div>
      {d.label && (
        <div className="mt-1.5 text-primary font-semibold">{d.label}</div>
      )}
    </div>
  );
};

// Color gradient based on risk
function getRiskGradient(score: number): string {
  if (score >= 80) return "#9A0002";
  if (score >= 60) return "#FFB300";
  if (score >= 40) return "#FF8C00";
  return "#228B22";
}

export function ForecastGraph({ data, title = "10-Min Bunching Risk Forecast", className }: ForecastGraphProps) {
  const maxRisk = Math.max(...data.map(d => d.riskScore));
  const isCritical = maxRisk >= 80;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className={cn("samavesh-card p-5", className)}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-heading text-lg text-foreground">{title}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">AI forecast · 10-minute horizon</p>
        </div>
        <div className="text-right">
          <p className={cn("text-2xl font-heading font-bold tabular-nums", isCritical ? "text-danger" : "text-warning")}>
            {maxRisk}%
          </p>
          <p className="text-[10px] text-muted-foreground">peak risk</p>
        </div>
      </div>

      {/* Zebra divider */}
      <div className="zebra-divider mb-4 opacity-40" />

      {/* Chart */}
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#9A0002" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#9A0002" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="4 4" stroke="var(--border)" strokeOpacity={0.8} />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 10, fill: "var(--muted-foreground)", fontFamily: "Plus Jakarta Sans" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 10, fill: "var(--muted-foreground)", fontFamily: "Plus Jakarta Sans" }}
              axisLine={false}
              tickLine={false}
              unit="%"
            />
            <Tooltip content={<CustomTooltip />} />

            {/* Alert threshold */}
            <ReferenceLine
              y={60}
              stroke="#FFB300"
              strokeDasharray="5 3"
              strokeWidth={1.5}
              label={{ value: "Alert", position: "insideTopRight", fontSize: 9, fill: "#FFB300" }}
            />
            <ReferenceLine
              y={80}
              stroke="#9A0002"
              strokeDasharray="5 3"
              strokeWidth={1.5}
              label={{ value: "Critical", position: "insideTopRight", fontSize: 9, fill: "#9A0002" }}
            />

            {/* Label annotations */}
            {data.map((point, i) =>
              point.label ? (
                <ReferenceLine
                  key={i}
                  x={point.time}
                  stroke="var(--muted-foreground)"
                  strokeDasharray="3 3"
                  strokeWidth={1}
                />
              ) : null
            )}

            <Area
              type="monotone"
              dataKey="riskScore"
              stroke="#9A0002"
              strokeWidth={2.5}
              fill="url(#riskGradient)"
              dot={{ r: 3, fill: "#9A0002", strokeWidth: 0 }}
              activeDot={{ r: 5 }}
              name="Risk Score"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Label legend */}
      <div className="mt-3 flex flex-wrap gap-2">
        {data.filter(d => d.label).map((d) => (
          <span key={d.label} className="text-[10px] text-muted-foreground border border-border px-2 py-0.5 rounded-full">
            {d.time} — {d.label}
          </span>
        ))}
      </div>
    </motion.div>
  );
}
