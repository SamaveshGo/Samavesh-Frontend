"use client";

import { useState, useEffect, Fragment } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Bus, MapPin, Clock, Navigation, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

/* ── Mock route database ───────────────────────────────── */
const CROWDING_STYLE: Record<string, string> = {
  Low: "text-green-800 bg-green-100 border-green-300",
  Moderate: "text-amber-800 bg-amber-100 border-amber-300",
  High: "text-red-800 bg-red-100 border-red-300",
};

interface Stop {
  name: string;
  eta: string;
  isPast: boolean;
  isBus: boolean; // bus is currently at/near this stop
}

interface RouteDetail {
  name: string;
  from: string;
  to: string;
  busMinAway: number;
  nextStop: string;
  etaDest: string;
  crowding: "Low" | "Moderate" | "High";
  stops: Stop[];
}

const ROUTE_DB: Record<string, RouteDetail> = {
  "312": {
    name: "BEST 312",
    from: "Dadar TT",
    to: "Andheri East",
    busMinAway: 10,
    nextStop: "Matunga Rd",
    etaDest: "9:58 AM",
    crowding: "Moderate",
    stops: [
      { name: "Dadar TT",          eta: "Departed 3 min ago", isPast: true,  isBus: false },
      { name: "Matunga Rd",         eta: "2 min",              isPast: false, isBus: true  },
      { name: "Sion Circle",        eta: "6 min",              isPast: false, isBus: false },
      { name: "Kurla Station",      eta: "12 min",             isPast: false, isBus: false },
      { name: "Ghatkopar East",     eta: "19 min",             isPast: false, isBus: false },
      { name: "Vikhroli",           eta: "25 min",             isPast: false, isBus: false },
      { name: "Bhandup",            eta: "31 min",             isPast: false, isBus: false },
      { name: "Mulund Check Naka",  eta: "37 min",             isPast: false, isBus: false },
      { name: "Andheri East",       eta: "45 min",             isPast: false, isBus: false },
    ],
  },
  "378": {
    name: "BEST 378",
    from: "Dadar TT",
    to: "Andheri East",
    busMinAway: 15,
    nextStop: "Sion Station",
    etaDest: "10:03 AM",
    crowding: "High",
    stops: [
      { name: "Dadar TT",           eta: "Departed 5 min ago", isPast: true,  isBus: false },
      { name: "Matunga (E)",        eta: "Departed 2 min ago", isPast: true,  isBus: false },
      { name: "Sion Station",       eta: "3 min",              isPast: false, isBus: true  },
      { name: "Kurla East",         eta: "9 min",              isPast: false, isBus: false },
      { name: "Ghatkopar",          eta: "17 min",             isPast: false, isBus: false },
      { name: "Powai",              eta: "24 min",             isPast: false, isBus: false },
      { name: "Andheri East",       eta: "35 min",             isPast: false, isBus: false },
    ],
  },
  "332": {
    name: "BEST 332",
    from: "Dadar TT",
    to: "Andheri East",
    busMinAway: 18,
    nextStop: "Dharavi Depot",
    etaDest: "10:08 AM",
    crowding: "Low",
    stops: [
      { name: "Dadar TT",           eta: "Departed 4 min ago", isPast: true,  isBus: false },
      { name: "Dharavi Depot",      eta: "4 min",              isPast: false, isBus: true  },
      { name: "BKC Junction",       eta: "10 min",             isPast: false, isBus: false },
      { name: "Santacruz (E)",      eta: "18 min",             isPast: false, isBus: false },
      { name: "Vile Parle (E)",     eta: "26 min",             isPast: false, isBus: false },
      { name: "Andheri East",       eta: "35 min",             isPast: false, isBus: false },
    ],
  },
};

/* ═══════════════════════════════════════════════════════════ */
export default function TrackBusPage() {
  const params = useParams();
  const router = useRouter();
  const routeIdRaw = (params?.routeId as string) ?? "312";
  const routeId = decodeURIComponent(routeIdRaw);

  const [route, setRoute] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeStopIdx, setActiveStopIdx] = useState(0);

  useEffect(() => {
    const fetchRoute = async () => {
      setLoading(true);
      setError(null);
      try {
        const routeIds = routeId.includes(",") ? routeId.split(",") : [routeId];
        const responses = await Promise.all(
          routeIds.map(id => fetch(`/api/routes/${id}`).then(res => res.json()))
        );

        if (responses.every(json => json.success && json.data)) {
          const legsData = responses.map(json => json.data);
          
          if (legsData.length === 1) {
            // Direct Route
            const apiRoute = legsData[0];
            const stopsCount = apiRoute.stops?.length || 0;
            const stopsData = apiRoute.stops.map((stop: any) => ({
              name: stop.name,
              legLabel: `${apiRoute.operator} ${apiRoute.route_number}`
            }));

            setRoute({
              name: `${apiRoute.operator} ${apiRoute.route_number}`,
              stops: stopsData,
              crowding: stopsCount % 3 === 0 ? "Low" : stopsCount % 3 === 1 ? "Moderate" : "High"
            });
          } else {
            // Multi-leg transfer route
            const combinedStops: any[] = [];
            
            legsData.forEach((apiRoute) => {
              apiRoute.stops.forEach((stop: any) => {
                combinedStops.push({
                  name: stop.name,
                  legLabel: `${apiRoute.operator} ${apiRoute.route_number}`
                });
              });
            });

            setRoute({
              name: legsData.map(l => `${l.operator} ${l.route_number}`).join(" ➔ "),
              stops: combinedStops,
              crowding: "Moderate"
            });
          }
        } else {
          setError("Failed to load details for some route legs.");
        }
      } catch (err: any) {
        setError("Could not connect to the backend server. Make sure port 5001 is active.");
      } finally {
        setLoading(false);
      }
    };

    fetchRoute();
  }, [routeId]);

  // Handle bus movement simulation
  useEffect(() => {
    if (!route || !route.stops || route.stops.length <= 1) return;

    const interval = setInterval(() => {
      setActiveStopIdx((prev) => {
        if (prev >= route.stops.length - 1) {
          return 0; // Wrap back to starting stop
        }
        return prev + 1;
      });
    }, 4000); // Shift stop every 4 seconds

    return () => clearInterval(interval);
  }, [route]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-sm text-muted-foreground font-semibold">Loading track info...</p>
        </div>
      </div>
    );
  }

  if (error || !route) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-background p-6 text-center">
        <p className="text-sm font-bold text-red-600 mb-2">Error Loading Track</p>
        <p className="text-xs text-muted-foreground mb-4">{error || "Route not found"}</p>
        <button onClick={() => router.back()} className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary/95 transition-colors">
          Go Back
        </button>
      </div>
    );
  }

  // Derive all dynamic simulation states
  const simulatedStops = route.stops.map((stop: any, idx: number) => {
    const isPast = idx < activeStopIdx;
    const isBus = idx === activeStopIdx;
    
    let eta = "";
    if (isPast) {
      eta = `Passed`;
    } else if (isBus) {
      eta = "Arrived";
    } else {
      eta = `${(idx - activeStopIdx) * 3} min`;
    }

    return {
      name: stop.name,
      legLabel: stop.legLabel,
      eta,
      isPast,
      isBus
    };
  });

  const fromStopName = route.stops[0]?.name || "Origin";
  const toStopName = route.stops[route.stops.length - 1]?.name || "Destination";
  const busMinAway = activeStopIdx === route.stops.length - 1 ? 0 : 2;
  const nextStopName = route.stops[activeStopIdx + 1]?.name || route.stops[activeStopIdx]?.name || "Next Stop";
  
  const remainingStops = route.stops.length - 1 - activeStopIdx;
  const etaDestTime = new Date(Date.now() + remainingStops * 3 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Normalise 0→1 position along the SVG route path
  const busProgress = route.stops.length > 1 ? activeStopIdx / (route.stops.length - 1) : 0;

  // Map marker coordinates interpolated along the SVG route curve
  const mapPoints = [
    { x: 60,  y: 260 },
    { x: 100, y: 215 },
    { x: 140, y: 175 },
    { x: 170, y: 145 },
    { x: 200, y: 115 },
    { x: 230, y: 95 },
    { x: 260, y: 70 },
    { x: 280, y: 50  },
  ];
  const ptIdx = Math.min(Math.round(busProgress * (mapPoints.length - 1)), mapPoints.length - 1);
  const busMarker = mapPoints[ptIdx];

  return (
    <div className="flex flex-col h-screen bg-background select-none">

      {/* ── Header ─────────────────────────────────────── */}
      <div className="px-4 py-4 bg-background flex items-center justify-between border-b border-border shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-xl hover:bg-secondary transition-colors"
          >
            <ArrowLeft size={18} strokeWidth={2} />
          </button>
          <div className="min-w-0">
            <h1 className="text-lg font-bold text-foreground truncate">{route.name}</h1>
            <p className="text-[10px] text-muted-foreground truncate">{fromStopName} → {toStopName}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span className="text-[10px] font-bold text-success uppercase tracking-wider">Live</span>
        </div>
      </div>

      {/* ── Map Area ─────────────────────────────────────── */}
      <div className="h-[38vh] bg-[#f4f3f0] relative overflow-hidden shrink-0">
        <svg className="w-full h-full" viewBox="0 0 360 300" fill="none">
          {/* Parks */}
          <path d="M-10,200 C40,180 80,170 110,200 C140,230 130,260 90,270 C50,280 -10,260 -10,240 Z" fill="#e2ede2" opacity="0.6" />
          <path d="M240,10 C280,0 320,10 340,40 C360,70 340,110 300,120 C260,130 230,80 240,40 Z" fill="#e2ede2" opacity="0.6" />
          {/* Roads grid */}
          <path d="M-10,70 L370,70 M-10,190 L370,190" stroke="#e4e4e7" strokeWidth="5" strokeLinecap="round" />
          <path d="M80,-10 L80,310 M200,-10 L200,310 M300,-10 L300,310" stroke="#e4e4e7" strokeWidth="5" strokeLinecap="round" />
          <path d="M-10,130 L200,130 M130,150 L370,240" stroke="#f4f4f5" strokeWidth="3" />
          {/* Route line */}
          <path
            d="M 60,260 C 80,200 130,180 170,145 C 200,115 220,80 280,50"
            stroke="#2563EB"
            strokeWidth="5"
            strokeLinecap="round"
            fill="none"
          />
          {/* Stop markers along route */}
          {[
            { x: 60,  y: 260 },
            { x: 120, y: 185 },
            { x: 190, y: 130 },
            { x: 280, y: 50  },
          ].map((pt, i) => (
            <circle key={i} cx={pt.x} cy={pt.y} r="4" fill="white" stroke="#2563EB" strokeWidth="2" />
          ))}
          {/* Live bus marker with smooth sliding motion */}
          <g>
            <motion.circle
              cx={busMarker.x}
              cy={busMarker.y}
              animate={{ cx: busMarker.x, cy: busMarker.y }}
              transition={{ type: "tween", duration: 1.2, ease: "easeInOut" }}
              r={14}
              fill="#9A0002"
              fillOpacity="0.15"
              className="animate-pulse"
            />
            <motion.circle
              cx={busMarker.x}
              cy={busMarker.y}
              animate={{ cx: busMarker.x, cy: busMarker.y }}
              transition={{ type: "tween", duration: 1.2, ease: "easeInOut" }}
              r={9}
              fill="#9A0002"
              stroke="white"
              strokeWidth="2.5"
            />
            <motion.text
              x={busMarker.x}
              y={busMarker.y + 3}
              animate={{ x: busMarker.x, y: busMarker.y + 3 }}
              transition={{ type: "tween", duration: 1.2, ease: "easeInOut" }}
              textAnchor="middle"
              fill="white"
              fontSize="7"
              fontWeight="900"
            >
              BUS
            </motion.text>
          </g>
          {/* Labels */}
          <text x="55" y="278" textAnchor="middle" fill="#6b7280" fontSize="7" fontWeight="600">{fromStopName}</text>
          <text x="280" y="42"  textAnchor="middle" fill="#6b7280" fontSize="7" fontWeight="600">{toStopName}</text>
        </svg>
      </div>

      {/* ── Bus Info Card ─────────────────────────────────── */}
      <div className="px-4 pt-3 shrink-0">
        <div className="bg-card rounded-2xl border border-border p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-success/15 flex items-center justify-center text-success shrink-0">
                <Bus size={18} strokeWidth={2} />
              </div>
              <div>
                <p className="text-sm font-bold text-success">
                  {activeStopIdx === route.stops.length - 1 ? "Arrived at Destination" : `Bus is ${busMinAway} stop away`}
                </p>
                <p className="text-[10px] text-muted-foreground">{fromStopName} Stop</p>
              </div>
            </div>
            <span className={cn(
              "text-[10px] font-bold px-2 py-0.5 rounded-full border",
              CROWDING_STYLE[route.crowding]
            )}>
              {route.crowding}
            </span>
          </div>

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-border text-xs">
            <div>
              <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wide">Next Stop</p>
              <p className="font-semibold text-foreground mt-0.5">{nextStopName}</p>
            </div>
            <div className="text-right">
              <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wide">ETA Destination</p>
              <p className="font-semibold text-foreground mt-0.5">{etaDestTime}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stops List ───────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 pt-3 pb-6">
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">All Stops</p>

        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          {simulatedStops.map((stop: any, idx: number) => {
            const isLast = idx === simulatedStops.length - 1;
            const showLegHeader = idx === 0 || stop.legLabel !== simulatedStops[idx - 1]?.legLabel;
            return (
              <Fragment key={idx}>
                {showLegHeader && stop.legLabel && (
                  <div className="bg-secondary/40 px-4 py-2 text-[10px] font-bold text-primary uppercase tracking-wider flex items-center gap-1.5 border-b border-border">
                    <Bus size={10} /> Leg: {stop.legLabel}
                  </div>
                )}
                <motion.div
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className={cn(
                    "flex items-center gap-4 px-4 py-3.5 relative",
                    !isLast && "border-b border-border",
                    stop.isBus && "bg-primary/5"
                  )}
                >
                  {/* Timeline dot */}
                  <div className="relative flex flex-col items-center shrink-0">
                    <div className={cn(
                      "w-3 h-3 rounded-full border-2 z-10",
                      stop.isPast
                        ? "bg-border border-border"
                        : stop.isBus
                        ? "bg-primary border-primary ring-4 ring-primary/20"
                        : "bg-background border-border"
                    )} />
                  </div>
 
                  {/* Stop info */}
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "text-sm font-semibold",
                      stop.isPast ? "text-muted-foreground" : "text-foreground"
                    )}>
                      {stop.name}
                    </p>
                    {stop.isBus && (
                      <p className="text-[10px] font-bold text-primary mt-0.5">Bus is here</p>
                    )}
                  </div>
 
                  {/* ETA */}
                  <div className="text-right shrink-0">
                    <p className={cn(
                      "text-xs font-semibold",
                      stop.isPast ? "text-muted-foreground" : stop.isBus ? "text-primary" : "text-foreground"
                    )}>
                      {stop.eta}
                    </p>
                  </div>
 
                  {/* Bus marker row highlight */}
                  {stop.isBus && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full" />
                  )}
                </motion.div>
              </Fragment>
            );
          })}
        </div>

        {/* Book Tickets CTA */}
        <div className="mt-4">
          <Link
            href={`/commuter/tickets?route=${encodeURIComponent(route.name)}&from=${encodeURIComponent(fromStopName)}&to=${encodeURIComponent(toStopName)}&stops=${encodeURIComponent(route.stops.map((s: any) => s.name).join(","))}`}
            className="w-full block py-3.5 bg-primary text-white font-bold text-sm rounded-2xl text-center hover:bg-primary/90 transition-colors"
          >
            Book Tickets for This Route
          </Link>
        </div>
      </div>
    </div>
  );
}
