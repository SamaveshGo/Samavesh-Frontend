"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { HeadwayGraph } from "@/components/charts/HeadwayGraph";
import { ForecastGraph } from "@/components/charts/ForecastGraph";
import { RidershipChart } from "@/components/charts/RidershipChart";
import { MetricCard } from "@/components/cards/MetricCard";
import { headwayByRoute, forecastData, ridershipData, heatmapData, performanceMetrics } from "@/mock/analytics";
import { ROUTE_COLORS } from "@/lib/constants";
import { cn, interpolateColor } from "@/lib/utils";
import type { KPIData } from "@/types";

const HOURS = Array.from({ length: 18 }, (_, i) => i + 6);
const STOPS_ORDER = ["Borivali Station", "Dadar TT", "Andheri East", "Kurla Station", "Sion Circle"];

export default function AnalyticsPage() {
  const [selectedRoute, setSelectedRoute] = useState("312");

  const headwayDataForRoute = headwayByRoute[selectedRoute] || headwayByRoute["312"];

  const performanceKPIs: KPIData[] = performanceMetrics.map((m) => ({
    label: m.label,
    value: m.value,
    unit: m.unit,
    change: m.change,
    trend: m.trend,
    color: m.value >= (m.target || 0) ? "text-success" : "text-warning",
  }));

  return (
    <div className="p-6 space-y-6 page-enter">
      {/* Header */}
      <div>
        <h1 className="font-heading text-3xl text-foreground">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">Performance metrics, headway trends, and ridership data</p>
      </div>

      {/* KPI metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {performanceKPIs.map((kpi, i) => (
          <MetricCard key={kpi.label} data={kpi} index={i} />
        ))}
      </div>

      {/* Route selector */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-muted-foreground">Route:</span>
        {Object.keys(ROUTE_COLORS).map((route) => (
          <button
            key={route}
            onClick={() => setSelectedRoute(route)}
            className={cn(
              "px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors",
              selectedRoute === route
                ? "text-white border-transparent"
                : "bg-card text-muted-foreground border-border hover:border-primary/30"
            )}
            style={selectedRoute === route ? { backgroundColor: ROUTE_COLORS[route] } : {}}
          >
            {route}
          </button>
        ))}
      </div>

      {/* Charts grid */}
      <div className="grid lg:grid-cols-2 gap-5">
        <HeadwayGraph
          data={headwayDataForRoute}
          title={`Route ${selectedRoute} — Headway Trend`}
          routeNumber={selectedRoute}
        />
        <ForecastGraph data={forecastData} title="AI Bunching Risk Forecast" />
      </div>

      {/* Ridership */}
      <RidershipChart data={ridershipData} title="Today's Ridership by Route (Hourly)" />

      {/* Stop Congestion Heatmap */}
      <div className="samavesh-card p-5">
        <div className="mb-4">
          <h3 className="font-heading text-xl">Stop Congestion Heatmap</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Congestion intensity by stop and hour</p>
        </div>
        <div className="zebra-divider mb-4 opacity-40" />

        <div className="overflow-x-auto scrollbar-thin">
          <div className="min-w-[600px]">
            {/* Header row */}
            <div className="flex gap-1 mb-1">
              <div className="w-36 shrink-0" />
              {HOURS.map((h) => (
                <div key={h} className="flex-1 text-center text-[10px] text-muted-foreground font-medium">
                  {h}:00
                </div>
              ))}
            </div>

            {/* Data rows */}
            {STOPS_ORDER.map((stopName) => {
              const stopData = heatmapData.filter((d) => d.stopName === stopName);
              return (
                <div key={stopName} className="flex gap-1 mb-1">
                  <div className="w-36 shrink-0 text-[10px] text-muted-foreground flex items-center pr-2 truncate">
                    {stopName}
                  </div>
                  {HOURS.map((h) => {
                    const cell = stopData.find((d) => d.hour === h);
                    const score = cell?.congestionScore ?? 0;
                    return (
                      <motion.div
                        key={h}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: (STOPS_ORDER.indexOf(stopName) * HOURS.length + h - 6) * 0.005 }}
                        title={`${stopName} @ ${h}:00 — ${score}%`}
                        className="flex-1 h-7 rounded cursor-pointer hover:opacity-80 transition-opacity relative group"
                        style={{ backgroundColor: interpolateColor(score) }}
                      >
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-[9px] font-bold text-white drop-shadow">{score}</span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              );
            })}

            {/* Legend */}
            <div className="mt-3 flex items-center gap-3 text-[10px] text-muted-foreground">
              <span>Low</span>
              <div className="flex gap-0.5">
                {[0, 20, 40, 60, 80, 100].map((v) => (
                  <div
                    key={v}
                    className="w-6 h-3 rounded-sm"
                    style={{ backgroundColor: interpolateColor(v) }}
                  />
                ))}
              </div>
              <span>High</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
