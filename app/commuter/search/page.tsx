"use client";

import { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  ArrowLeft, Bus, Users, MapPin, Home, Filter,
  Bookmark, BookmarkCheck, Navigation, ChevronRight, X,
  Search, Compass, Zap, Map, ArrowUpRight, Flame, Clock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LiveMap } from "@/components/maps/LiveMap";

/* ── Types ──────────────────────────────────────────────── */
type SearchStep = "results" | "live-map" | "forecast";
type TabId = "rec" | "fast" | "changes";

/* ── Route data ─────────────────────────────────────────── */
interface RouteItem {
  id: string;
  name: string;
  route: string;
  eta: number;
  etaStr: string;
  crowding: "Low" | "Moderate" | "High";
  time: string;
  crowdingScore: number; // 1=Low 2=Moderate 3=High
  _rawItinerary?: any;
}

/* ── Mumbai Master GTFS Bus Stops with Coordinates ─────────────── */
const MUMBAI_MASTER_STOPS = [
  { id: "s1", name: "Dadar TT Depot", lat: 19.0176, lon: 72.8562, routes: ["312", "54", "101"], operator: "BEST" },
  { id: "s2", name: "Sion Circle", lat: 19.0420, lon: 72.8430, routes: ["312", "103AS", "C-40"], operator: "BEST" },
  { id: "s3", name: "Kurla Railway Station East", lat: 19.0536, lon: 72.8484, routes: ["312", "332", "54"], operator: "BEST" },
  { id: "s4", name: "Andheri Station Bus Deck", lat: 19.0760, lon: 72.8777, routes: ["312", "1-1", "102-1"], operator: "BEST" },
  { id: "s5", name: "CSMT World Trade Terminal", lat: 18.9411, lon: 72.8347, routes: ["C-40", "101", "103AS"], operator: "BEST" },
  { id: "s6", name: "Bandra Station West", lat: 19.0596, lon: 72.8295, routes: ["54", "10", "312"], operator: "BEST" },
  { id: "s7", name: "Byculla Station East", lat: 18.9730, lon: 72.8340, routes: ["3", "101", "312"], operator: "BEST" },
  { id: "s8", name: "Ghatkopar Bus Depot", lat: 19.0860, lon: 72.9081, routes: ["130", "332", "378"], operator: "BEST" },
  { id: "s9", name: "Worli Naka", lat: 18.9784, lon: 72.8265, routes: ["10", "3", "101"], operator: "BEST" },
  { id: "s10", name: "Colaba Bus Station", lat: 18.9121, lon: 72.8219, routes: ["3", "103AS", "C-40"], operator: "BEST" },
];

/* Distance helper function in Km */
function calculateKmDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0.5;
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function CommuterSearchContent() {
  const router = useRouter();
  const [step, setStep] = useState<SearchStep>("results");
  const [activeTab, setActiveTab] = useState<TabId>("rec");
  const [selectedRoute, setSelectedRoute] = useState<RouteItem | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  const [routes, setRoutes] = useState<RouteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [routeDetails, setRouteDetails] = useState<any>(null);

  // ── GPS Tracking & Live Nearby Stops State ──
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [gpsStatus, setGpsStatus] = useState<"locating" | "active" | "denied">("locating");
  const [allStops, setAllStops] = useState<any[]>(MUMBAI_MASTER_STOPS);

  const searchParams = useSearchParams();
  const fromParam = searchParams?.get("from") || "";
  const toParam = searchParams?.get("to") || "";
  const modeParam = searchParams?.get("mode") || "";
  const tabParam = searchParams?.get("tab") || "";

  const hasSpecificJourney = Boolean(fromParam && toParam);

  const [fromInput, setFromInput] = useState(fromParam);
  const [toInput, setToInput] = useState(toParam);

  // Switch tab mode automatically
  const [explorerTab, setExplorerTab] = useState<"routes" | "stops" | "map">(
    tabParam === "map" ? "map" : (tabParam === "stops" ? "stops" : "routes")
  );

  // Fetch stops from Mumbai Map dataset
  useEffect(() => {
    try {
      fetch("/mumbai_stops.json")
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) {
            const formatted = data.map((s: any, idx: number) => ({
              id: s.stop_id || `stop_${idx}`,
              name: s.name,
              lat: parseFloat(s.lat || 19.0176),
              lon: parseFloat(s.lon || 72.8562),
              routes: ["312", "C-40", "101"],
              operator: s.operator || "BEST"
            }));
            setAllStops(formatted);
          }
        })
        .catch(() => {
          fetch("http://localhost:8000/stops")
            .then((res) => res.json())
            .then((data) => {
              if (Array.isArray(data) && data.length > 0) {
                const formatted = data.map((s: any, idx: number) => ({
                  id: s.stop_id || `stop_${idx}`,
                  name: s.name,
                  lat: parseFloat(s.lat || 19.0176),
                  lon: parseFloat(s.lon || 72.8562),
                  routes: ["312", "C-40", "101"],
                  operator: "BEST"
                }));
                setAllStops(formatted);
              }
            })
            .catch(() => {});
        });
    } catch (e) {}
  }, []);

  // Request & watch real-time browser GPS location
  const refreshGpsLocation = () => {
    setGpsStatus("locating");
    if (typeof window !== "undefined" && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude });
          setGpsStatus("active");
        },
        () => {
          setUserLocation({ lat: 19.0178, lon: 72.8478 });
          setGpsStatus("denied");
        },
        { timeout: 8000, enableHighAccuracy: true }
      );
    } else {
      setUserLocation({ lat: 19.0178, lon: 72.8478 });
      setGpsStatus("denied");
    }
  };

  useEffect(() => {
    refreshGpsLocation();
  }, []);

  // Compute live distance from user GPS position & sort nearest first!
  const currentPos = userLocation || { lat: 19.0178, lon: 72.8478 };

  const nearbyStopsWithDistance = allStops
    .map((s) => {
      const distKm = calculateKmDistance(currentPos.lat, currentPos.lon, s.lat, s.lon);
      const distMeters = Math.round(distKm * 1000);
      const distanceStr = distKm < 1 ? `${distMeters}m away` : `${distKm.toFixed(1)} km away`;
      return {
        ...s,
        distKm,
        distMeters,
        distanceStr
      };
    })
    .sort((a, b) => a.distKm - b.distKm);

  const closestStop = nearbyStopsWithDistance[0];

  useEffect(() => {
    setFromInput(fromParam);
    setToInput(toParam);
  }, [fromParam, toParam]);

  const handleNewSearch = () => {
    router.push(`/commuter/search?from=${encodeURIComponent(fromInput)}&to=${encodeURIComponent(toInput)}&mode=${modeParam}`);
  };

  /* Load saved routes */
  useEffect(() => {
    try {
      const stored = localStorage.getItem("samavesh_saved_routes");
      if (stored) setSavedIds(new Set(JSON.parse(stored)));
    } catch {/* ignore */ }
  }, []);

  /* Fetch routes dynamically */
  useEffect(() => {
    const fetchRoutes = async () => {
      setLoading(true);
      setError(null);
      try {
        const queryStr = fromParam || toParam
          ? `?from=${encodeURIComponent(fromParam)}&to=${encodeURIComponent(toParam)}`
          : "";
        const res = await fetch(`/api/routes${queryStr}`);
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          const mapped: RouteItem[] = json.data.map((iti: any, index: number) => {
            const isDirect = iti.type === 'direct';
            const eta = iti.totalStops * 2;
            const crowding = iti.totalStops > 15 ? "High" : iti.totalStops > 8 ? "Moderate" : "Low";

            let id = "";
            let name = "";
            let routeDesc = "";

            if (isDirect) {
              const leg = iti.legs[0];
              id = leg._id;
              name = `${leg.operator} ${leg.route_number}`;
              routeDesc = `${leg.stops[0]} → ${leg.stops[leg.stops.length - 1]}`;
            } else {
              id = iti.legs.map((l: any) => l._id).join(",");
              name = `Transfer: ${iti.legs[0].route_number} + ${iti.legs[1].route_number}`;
              routeDesc = `${iti.from} → ${iti.transferStops[0]} → ${iti.to}`;
            }

            return {
              id,
              name,
              route: routeDesc,
              eta,
              etaStr: `${eta} min`,
              crowding,
              time: `${eta + 5} min total`,
              crowdingScore: crowding === "High" ? 3 : crowding === "Moderate" ? 2 : 1,
              _rawItinerary: iti
            };
          });

          setRoutes(mapped);
        } else {
          setRoutes([]);
        }
      } catch (err: any) {
        setError("Failed to load routes from backend server.");
      } finally {
        setLoading(false);
      }
    };

    fetchRoutes();
  }, [fromParam, toParam]);

  /* Open live tracking */
  const openRoute = (routeItem: RouteItem) => {
    if (routeItem._rawItinerary) {
      setRouteDetails(routeItem._rawItinerary);
    }
    setSelectedRoute(routeItem);
    router.push(`/commuter/track/${routeItem.id}`);
  };

  const getSortedRoutes = (tab: TabId) => {
    const list = [...routes];
    if (tab === "fast") return list.sort((a, b) => a.eta - b.eta);
    if (tab === "changes") return list.sort((a, b) => a.crowdingScore - b.crowdingScore);
    return list;
  };

  return (
    <div className="select-none bg-[#FAF6F0] min-h-screen text-slate-900 pb-36 font-sans">
      <AnimatePresence mode="wait">

        {/* ══ MAIN SEARCH & EXPLORER SCREEN ════════════════ */}
        {step === "results" && (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="px-5 pt-6 space-y-4"
          >
            {/* Header bar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Link href="/commuter" className="p-2 rounded-full bg-[#F7EFE7] border border-[#DECFC2] shadow-sm text-slate-700 hover:bg-[#E6DBD0] transition-colors">
                  <ArrowLeft size={18} />
                </Link>
                <div>
                  <h1 className="text-xl font-black text-slate-900 tracking-tight">
                    {hasSpecificJourney ? "Journey Results" : "My Bus & Route Explorer"}
                  </h1>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {hasSpecificJourney ? `${fromParam} to ${toParam}` : "Browse all Mumbai BEST routes and stops"}
                  </p>
                </div>
              </div>
            </div>

            {/* Route Planner Inputs */}
            <div className="bg-[#F7EFE7] rounded-3xl border border-[#DECFC2] shadow-md p-4 space-y-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2.5 p-3 bg-[#E6DBD0]/60 rounded-2xl border border-[#DECFC2]">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#9A0002] shrink-0" />
                  <input
                    type="text"
                    value={fromInput}
                    onChange={(e) => setFromInput(e.target.value)}
                    placeholder="Enter starting stop (e.g. Dadar)"
                    className="bg-transparent text-xs font-bold outline-none w-full text-slate-900 placeholder:text-slate-500"
                  />
                </div>

                <div className="flex items-center gap-2.5 p-3 bg-[#E6DBD0]/60 rounded-2xl border border-[#DECFC2]">
                  <MapPin size={14} className="text-[#9A0002] shrink-0" />
                  <input
                    type="text"
                    value={toInput}
                    onChange={(e) => setToInput(e.target.value)}
                    placeholder="Enter destination stop (e.g. Andheri)"
                    className="bg-transparent text-xs font-bold outline-none w-full text-slate-900 placeholder:text-slate-500"
                  />
                </div>
              </div>


              <button
                onClick={handleNewSearch}
                className="w-full py-3 rounded-2xl bg-[#9A0002] text-white font-black text-xs shadow-md hover:bg-[#a80b24] active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Search size={15} strokeWidth={2.5} />
                <span>Search Routes & ETAs</span>
              </button>
            </div>

            {/* ── CASE A: USER SEARCHED SPECIFIC JOURNEY (Show Journey Tabs) ── */}
            {hasSpecificJourney ? (
              <>
                <div className="flex bg-[#E6DBD0]/80 p-1 rounded-2xl">
                  {([
                    { id: "rec" as const, label: "Recommended Direct" },
                    { id: "fast" as const, label: "Fastest" },
                    { id: "changes" as const, label: "1-Transfer" },
                  ] as { id: TabId; label: string }[]).map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        "flex-1 py-2 text-xs font-black rounded-xl transition-all text-center flex items-center justify-center gap-1",
                        activeTab === tab.id
                          ? "bg-[#F7EFE7] text-[#9A0002] shadow-sm"
                          : "text-slate-700 hover:text-slate-900"
                      )}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Route Results List */}
                <div className="space-y-3 pt-1">
                  {loading ? (
                    <div className="flex flex-col items-center justify-center py-12 space-y-3">
                      <div className="w-8 h-8 rounded-full border-2 border-[#9A0002] border-t-transparent animate-spin" />
                      <p className="text-xs text-slate-500 font-bold">Searching routes...</p>
                    </div>
                  ) : error ? (
                    <div className="text-center py-10 px-4 bg-red-50 border border-red-200 rounded-2xl text-[#9A0002] text-xs font-bold">
                      {error}
                    </div>
                  ) : routes.length === 0 ? (
                    <div className="text-center py-10 px-6 bg-[#F7EFE7] border border-[#DECFC2] rounded-3xl shadow-sm">
                      <p className="text-sm font-black text-slate-900">No direct routes found</p>
                      <p className="text-xs text-slate-500 mt-1">
                        Try searching using major stops like "Dadar", "Andheri", "Sion", or "CSMT".
                      </p>
                    </div>
                  ) : (
                    getSortedRoutes(activeTab).map((route) => (
                      <div
                        key={route.id}
                        onClick={() => openRoute(route)}
                        className="bg-[#F7EFE7] rounded-3xl border border-[#DECFC2] shadow-sm hover:shadow-md transition-all p-4 cursor-pointer"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="px-3 py-1 rounded-xl bg-[#9A0002] text-white font-black text-xs">
                            {route.name}
                          </span>
                          <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                            {route.etaStr} ETA
                          </span>
                        </div>
                        <h3 className="text-xs font-bold text-slate-900">{route.route}</h3>
                        <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#DECFC2]/60 text-[10px] text-slate-500 font-semibold">
                          <span>Crowding: <b>{route.crowding}</b></span>
                          <span className="text-[#9A0002] font-bold flex items-center gap-0.5">Track Bus Live <ArrowUpRight size={12} /></span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            ) : (
              /* ── CASE B: EXPLORER MODE (No Destination Selected) ── */
              <div className="space-y-4">
                {/* Explorer Tabs */}
                <div className="flex bg-[#E6DBD0]/80 p-1 rounded-2xl">
                  <button
                    onClick={() => setExplorerTab("routes")}
                    className={cn(
                      "flex-1 py-2.5 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5",
                      explorerTab === "routes" ? "bg-[#F7EFE7] text-[#9A0002] shadow-sm" : "text-slate-700 hover:text-slate-900"
                    )}
                  >
                    <Bus size={14} />
                    <span>All Routes</span>
                  </button>

                  <button
                    onClick={() => setExplorerTab("stops")}
                    className={cn(
                      "flex-1 py-2.5 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5",
                      explorerTab === "stops" ? "bg-[#F7EFE7] text-[#9A0002] shadow-sm" : "text-slate-700 hover:text-slate-900"
                    )}
                  >
                    <MapPin size={14} />
                    <span>Nearby Stops</span>
                  </button>

                  <button
                    onClick={() => setExplorerTab("map")}
                    className={cn(
                      "flex-1 py-2.5 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5",
                      explorerTab === "map" ? "bg-[#F7EFE7] text-[#9A0002] shadow-sm" : "text-slate-700 hover:text-slate-900"
                    )}
                  >
                    <Map size={14} />
                    <span>Live Map</span>
                  </button>
                </div>

                {/* EXPLORER SUB-TAB 1: ALL ROUTES */}
                {explorerTab === "routes" && (
                  <div className="space-y-3">
                    {loading ? (
                      <div className="py-10 text-center text-xs font-bold text-slate-500">Loading routes list…</div>
                    ) : (
                      routes.map((r) => (
                        <div
                          key={r.id}
                          onClick={() => openRoute(r)}
                          className="bg-[#F7EFE7] rounded-3xl border border-[#DECFC2] p-4 shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-2xl bg-[#E6DBD0] text-[#9A0002] font-black text-xs flex items-center justify-center shrink-0">
                              {r.name.replace("BEST ", "")}
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-xs font-bold text-slate-900 truncate">{r.name}</h4>
                              <p className="text-[11px] text-slate-500 truncate">{r.route}</p>
                            </div>
                          </div>
                          <ChevronRight size={18} className="text-slate-400 shrink-0" />
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* EXPLORER SUB-TAB 2: NEARBY STOPS (GPS Tracked) */}
                {explorerTab === "stops" && (
                  <div className="space-y-3">
                    {/* Live GPS Status Bar */}
                    <div className="p-3 rounded-2xl bg-[#F7EFE7] border border-[#DECFC2] shadow-sm flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                        <div>
                          <span className="font-bold text-slate-800 block">
                            {gpsStatus === "active" ? "GPS Live Tracking Active" : "Locating Nearest Bus Stops"}
                          </span>
                          <span className="text-[9px] text-slate-500 font-semibold">
                            Position: {currentPos.lat.toFixed(4)}°N, {currentPos.lon.toFixed(4)}°E
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={refreshGpsLocation}
                        className="text-[10px] font-black text-[#9A0002] bg-red-50 hover:bg-red-100 active:scale-95 px-2.5 py-1 rounded-full border border-red-200 flex items-center gap-1 transition-all"
                      >
                        <Zap size={11} /> Refresh GPS
                      </button>
                    </div>

                    {nearbyStopsWithDistance.map((stop: any, index: number) => {
                      const isClosest = index === 0;
                      return (
                        <div
                          key={stop.id || stop.name}
                          className={cn(
                            "bg-[#F7EFE7] rounded-3xl border p-4 shadow-sm transition-all flex items-center justify-between",
                            isClosest ? "border-[#9A0002] border-2 ring-2 ring-red-100/60 shadow-md" : "border-[#DECFC2]"
                          )}
                        >
                          <div className="flex items-center gap-3.5 min-w-0">
                            <div className={cn(
                              "w-11 h-11 rounded-2xl font-black flex items-center justify-center shrink-0 shadow-sm transition-transform",
                              isClosest ? "bg-[#9A0002] text-white scale-105" : "bg-slate-100 text-slate-700"
                            )}>
                              <MapPin size={20} className={isClosest ? "text-white" : "text-[#9A0002]"} />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="text-xs font-black text-slate-900 truncate">{stop.name}</h4>
                                {isClosest && (
                                  <span className="px-2 py-0.5 rounded-full bg-[#9A0002] text-[8px] font-black uppercase text-white tracking-wider shadow-xs">
                                    Nearest
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 inline-block mt-1">
                                {stop.distanceStr} from your location
                              </span>
                            </div>
                          </div>

                          <div className="text-right shrink-0 space-y-1 ml-2">
                            <div className="flex gap-1 justify-end">
                              {(stop.routes || ["312", "C-40"]).slice(0, 3).map((r: string) => (
                                <span key={r} className="text-[9px] font-black px-1.5 py-0.5 rounded bg-red-50 text-[#9A0002] border border-red-100">
                                  {r}
                                </span>
                              ))}
                            </div>
                            <button
                              onClick={() => {
                                setFromInput(stop.name);
                              }}
                              className="px-3 py-1 rounded-xl bg-[#9A0002] text-white font-black text-[10px] shadow-sm hover:bg-[#9A0002] active:scale-95 transition-all inline-block mt-1"
                            >
                              Set Pickup →
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* EXPLORER SUB-TAB 3: LIVE MAP */}
                {explorerTab === "map" && (
                  <div className="rounded-3xl overflow-hidden border border-slate-200 shadow-md">
                    <LiveMap height="360px" />
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function CommuterSearchPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-xs font-bold text-slate-400">Loading Route Explorer…</div>}>
      <CommuterSearchContent />
    </Suspense>
  );
}
