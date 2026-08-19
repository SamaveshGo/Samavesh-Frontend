"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Legend,
} from "recharts";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface HeadwayGraphProps {
  data: Array<{ time: string; scheduled: number; actual: number; bus1?: number; bus2?: number }>;
  title?: string;
  routeNumber?: string;
  className?: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="samavesh-card px-3 py-2.5 text-xs min-w-[160px]">
      <p className="font-semibold text-foreground mb-1.5">{label}</p>
      {payload.map((entry: any) => (
        <div key={entry.dataKey} className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
            <span className="text-muted-foreground">{entry.name}</span>
          </div>
          <span className="font-bold tabular-nums">{entry.value} min</span>
        </div>
      ))}
    </div>
  );
};

export function HeadwayGraph({ data, title = "Headway Over Time", routeNumber, className }: HeadwayGraphProps) {
  const criticalData = data.filter(d => d.actual < 4);
  const isCritical = criticalData.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn("samavesh-card p-5", className)}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-heading text-lg text-foreground">{title}</h3>
          {routeNumber && (
            <p className="text-xs text-muted-foreground mt-0.5">Route {routeNumber} · Last 2 hours</p>
          )}
        </div>
        {isCritical && (
          <span className="text-[10px] font-bold px-2.5 py-1 bg-danger/10 text-danger border border-danger/20 rounded-full">
            BUNCHING DETECTED
          </span>
        )}
      </div>

      {/* Zebra divider */}
      <div className="zebra-divider mb-4 opacity-40" />

      {/* Chart */}
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid
              strokeDasharray="4 4"
              stroke="var(--border)"
              strokeOpacity={0.8}
            />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 10, fill: "var(--muted-foreground)", fontFamily: "Plus Jakarta Sans" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "var(--muted-foreground)", fontFamily: "Plus Jakarta Sans" }}
              axisLine={false}
              tickLine={false}
              unit=" m"
            />
            <Tooltip content={<CustomTooltip />} />

            {/* Scheduled headway reference line */}
            <ReferenceLine
              y={data[0]?.scheduled || 10}
              stroke="var(--muted-foreground)"
              strokeDasharray="6 3"
              strokeWidth={1.5}
              label={{ value: "Scheduled", position: "insideTopRight", fontSize: 9, fill: "var(--muted-foreground)" }}
            />

            {/* Danger zone: bunching threshold */}
            <ReferenceLine
              y={4}
              stroke="#9A0002"
              strokeDasharray="3 3"
              strokeWidth={1}
              label={{ value: "Bunching Threshold", position: "insideTopLeft", fontSize: 9, fill: "#9A0002" }}
            />

            <Line
              type="monotone"
              dataKey="actual"
              stroke="#9A0002"
              strokeWidth={2.5}
              dot={{ r: 3, fill: "#9A0002", strokeWidth: 0 }}
              activeDot={{ r: 5, fill: "#9A0002" }}
              name="Actual Headway"
            />
            {data[0]?.bus1 && (
              <Line
                type="monotone"
                dataKey="bus1"
                stroke="#2563EB"
                strokeWidth={1.5}
                strokeDasharray="4 2"
                dot={false}
                name="Bus 1 Gap"
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
