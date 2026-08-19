"use client";

import React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

interface RidershipChartProps {
  data: any[];
  title?: string;
}

export const RidershipChart: React.FC<RidershipChartProps> = ({
  data,
  title = "Hourly Ridership",
}) => {
  return (
    <div className="samavesh-card p-5">
      <div className="mb-4">
        <h3 className="font-heading text-xl text-foreground">{title}</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Hourly passenger volume across operating routes
        </p>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="ridershipGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#9A0002" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#9A0002" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
            <XAxis dataKey="hour" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#888" }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#888" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(20, 20, 20, 0.9)",
                borderColor: "#333",
                borderRadius: "12px",
                fontSize: "12px",
                color: "#fff",
              }}
            />
            <Area
              type="monotone"
              dataKey="ridership"
              stroke="#9A0002"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#ridershipGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RidershipChart;
