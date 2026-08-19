"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Filter, Route, Bus, Layers, ZoomIn, ZoomOut, Search } from "lucide-react";
import { LiveMap } from "@/components/maps/LiveMap";
import { BusCard } from "@/components/cards/BusCard";
import { AlertCard } from "@/components/cards/AlertCard";
import { mockBuses, getBusesByRoute } from "@/mock/buses";
import { mockRoutes } from "@/mock/routes";
import { mockAlerts, getActiveAlerts } from "@/mock/alerts";
import { ROUTE_COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";

import { useSimulationWS } from "@/lib/hooks/useSimulationWS";

const AGENCIES = [
  { id: "BEST", name: "BEST (Mumbai)" },
  { id: "KDMT", name: "KDMT (Kalyan-Dombivli)" },
  { id: "KHOPOLI", name: "KHOPOLI (Khopoli)" },
  { id: "MBMT", name: "MBMT (Mira-Bhayandar)" },
  { id: "NMMT", name: "NMMT (Navi Mumbai)" },
  { id: "TMT", name: "TMT (Thane)" },
  { id: "UMT", name: "UMT (Ulhasnagar)" },
  { id: "VMMT", name: "VMMT (Vasai)" },
  { id: "VVMT", name: "VVMT (Vasai-Virar)" },
];

const STATUS_FILTERS = ["all", "on_time", "delayed", "bunching_risk", "bunching", "standby"];

export default function LiveMapPage() {
  const [selectedAgency, setSelectedAgency] = useState<string>("BEST");
  const [datasetRoutes, setDatasetRoutes] = useState<any[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedBus, setSelectedBus] = useState<string | null>(null);
  const { buses: liveWSBuses } = useSimulationWS();

  // Fetch routes from dataset backend API when agency changes
  useEffect(() => {
    try {
      fetch(`http://localhost:8000/bus-routes?agency=${selectedAgency}`)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) setDatasetRoutes(data);
        })
        .catch(() => {});
    } catch (e) {}
  }, [selectedAgency]);

  const displayBuses = useMemo(() => {
    if (liveWSBuses && liveWSBuses.length > 0) {
      return liveWSBuses.map((b) => ({
        id: b.id || b.bus_id,
        displayId: b.id || b.bus_id,
        vehicleNumber: b.id || b.bus_id,
        routeId: b.route_id || b.route_number || "312",
        routeNumber: b.route_number || "312",
        driverId: "DRV-001",
        driverName: "Active Driver",
        status: (b.status === "BOARDING" ? "bunching_risk" : (b.delay > 60 ? "delayed" : "on_time")) as any,
        occupancy: b.occupancy || 0,
        capacity: 70,
        currentStop: b.current_stop || "In Transit",
        nextStop: b.next_stop || "Next Stop",
        delayMinutes: Math.round((b.delay || 0) / 60),
        speedKmph: Math.round(b.speed || 0),
        speed: Math.round(b.speed || 0),
        lat: b.lat,
        lng: b.lon,
        headwayMinutes: 5,
        targetHeadwayMinutes: 5,
        bunchingRiskScore: 0.1,
        latlng: [b.lat, b.lon] as [number, number]
      }));
    }
    return mockBuses;
  }, [liveWSBuses]);

  const filteredBuses = displayBuses.filter((b: any) => {
    if (selectedRoute !== "all" && b.routeNumber !== selectedRoute) return false;
    if (selectedStatus !== "all" && b.status !== selectedStatus) return false;
    return true;
  });

  const activeAlerts = getActiveAlerts();

  return (
    <div className="flex h-full overflow-hidden">

      {/* Left panel */}
      <div className="w-80 flex flex-col border-r border-border bg-card overflow-hidden shrink-0">

        {/* Panel header */}
        <div className="px-4 py-4 border-b border-border">
          <h2 className="font-heading text-xl">Live Map</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {filteredBuses.length} buses shown
          </p>
        </div>

        {/* Transit Service Agency Selector */}
        <div className="p-3 border-b border-border bg-slate-50/50">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5 flex items-center justify-between">
            <span>Transit Service Agency</span>
            <span className="text-[9px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-bold font-mono">{selectedAgency}</span>
          </p>
          <div className="flex flex-wrap gap-1">
            {AGENCIES.map((ag) => (
              <button
                key={ag.id}
                onClick={() => {
                  setSelectedAgency(ag.id);
                  setSelectedRoute("all");
                  setSearchQuery("");
                }}
                className={cn(
                  "text-[10px] font-bold px-2 py-0.5 rounded-lg border transition-all",
                  selectedAgency === ag.id
                    ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                )}
              >
                {ag.id}
              </button>
            ))}
          </div>
        </div>

        {/* Search Route */}
        <div className="p-3 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search route (e.g. 130, 312, 54, 103AS)..."
              value={searchQuery}
              onChange={(e) => {
                const val = e.target.value;
                setSearchQuery(val);
                if (val.trim() !== "") {
                  setSelectedRoute(val.trim());
                } else {
                  setSelectedRoute("all");
                }
              }}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-background border border-border rounded-xl focus:outline-none focus:border-primary font-medium"
            />
          </div>
        </div>

        {/* Route filters */}
        <div className="p-4 border-b border-border">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">Filter by Route</p>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => {
                setSelectedRoute("all");
                setSearchQuery("");
              }}
              className={cn(
                "text-[10px] font-bold px-2.5 py-1 rounded-full border transition-colors",
                selectedRoute === "all"
                  ? "bg-foreground text-background border-foreground"
                  : "bg-background text-muted-foreground border-border hover:border-foreground/40"
              )}
            >
              All
            </button>
            {mockRoutes.map((route) => (
              <button
                key={route.number}
                onClick={() => {
                  setSelectedRoute(route.number);
                  setSearchQuery(route.number);
                }}
                className={cn(
                  "text-[10px] font-bold px-2.5 py-1 rounded-full border transition-colors",
                  selectedRoute === route.number
                    ? "text-white border-transparent"
                    : "bg-background text-muted-foreground border-border"
                )}
                style={selectedRoute === route.number ? { backgroundColor: ROUTE_COLORS[route.number] || "#9A0002" } : {}}
              >
                {route.number}
              </button>
            ))}
          </div>
        </div>

        {/* Status filters */}
        <div className="p-4 border-b border-border">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">Filter by Status</p>
          <div className="flex flex-wrap gap-1.5">
            {STATUS_FILTERS.map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={cn(
                  "text-[10px] font-semibold px-2 py-0.5 rounded-full border capitalize transition-colors",
                  selectedStatus === status
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-muted-foreground border-border hover:border-primary/40"
                )}
              >
                {status === "all" ? "All" : status.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>

        {/* Bus list */}
        <div className="flex-1 overflow-y-auto scrollbar-thin p-3 space-y-2">
          {filteredBuses.map((bus, i) => (
            <BusCard
              key={`${bus.id}_${i}`}
              bus={bus as any}
              index={i}
              compact
              selected={selectedBus === bus.id}
              onClick={() => setSelectedBus(selectedBus === bus.id ? null : bus.id)}
            />
          ))}
          {filteredBuses.length === 0 && (
            <div className="text-center py-8 text-sm text-muted-foreground">
              No buses match filters
            </div>
          )}
        </div>
      </div>

      {/* Map area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 p-4 h-full min-h-[500px]">
          <LiveMap height="100%" className="shadow-sm" selectedRoute={selectedRoute} selectedBus={selectedBus || undefined} selectedAgency={selectedAgency} datasetRoutes={datasetRoutes} />
        </div>

        {/* Alert strip at bottom */}
        {activeAlerts.length > 0 && (
          <div className="border-t border-border bg-card px-4 py-3">
            <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground shrink-0">
                Active Alerts
              </span>
              {activeAlerts.map((alert) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={cn(
                    "flex items-center gap-2 shrink-0 px-3 py-1.5 rounded-xl border text-xs font-semibold",
                    alert.severity === "critical"
                      ? "bg-danger/10 text-danger border-danger/20"
                      : "bg-warning/10 text-warning border-warning/20"
                  )}
                >
                  <span>CS{alert.caseStudy}</span>
                  <span>·</span>
                  <span className="font-mono">R{alert.routeNumber}</span>
                  <span>·</span>
                  <span className="max-w-[180px] truncate">{alert.title}</span>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
