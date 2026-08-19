"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { useSimulationWS } from "@/lib/hooks/useSimulationWS";

interface LiveMapProps {
  className?: string;
  height?: number | string;
  selectedRoute?: string;
  selectedBus?: string;
  selectedAgency?: string;
  datasetRoutes?: any[];
  singleBusMode?: boolean;
}

const MUMBAI_ROUTES = [
  {
    id: "3",
    name: "BEST 3 — Jijamata Udyan (Byculla) to Navy Nagar (Colaba)",
    traffic: "moderate" as const,
    color: "#2563eb",
    path: [
      [18.8942, 72.8123], // Navy Nagar (Colaba)
      [18.9067, 72.8147], // Colaba Depot
      [18.9255, 72.8242], // Regal Cinema / Museum
      [18.9330, 72.8340], // CSMT
      [18.9470, 72.8350], // Crawford Market
      [18.9600, 72.8330], // JJ Hospital
      [18.9700, 72.8360], // Mazgaon
      [18.9790, 72.8335], // Jijamata Udyan (Byculla)
    ],
    stops: [
      { name: "Navy Nagar (Colaba)", latlng: [18.8942, 72.8123] },
      { name: "Colaba Post Office", latlng: [18.9067, 72.8147] },
      { name: "Regal Cinema Colaba", latlng: [18.9220, 72.8300] },
      { name: "CSMT / GPO", latlng: [18.9330, 72.8340] },
      { name: "Crawford Market", latlng: [18.9470, 72.8350] },
      { name: "JJ Hospital", latlng: [18.9600, 72.8330] },
      { name: "Byculla Station (E)", latlng: [18.9730, 72.8340] },
      { name: "Jijamata Udyan (Byculla)", latlng: [18.9790, 72.8335] },
    ],
    buses: [
      { latlng: [18.9255, 72.8242], nextStop: "CSMT", eta: "4 min" }
    ]
  },
  {
    id: "312",
    name: "BEST 312 — Dadar to Andheri",
    traffic: "heavy" as const,
    color: "#ef4444",
    path: [
      [19.0176, 72.8562], // Dadar TT
      [19.0285, 72.8500],
      [19.0420, 72.8430],
      [19.0536, 72.8484],
      [19.0760, 72.8777], // Andheri East
    ],
    stops: [
      { name: "Dadar TT", latlng: [19.0176, 72.8562] },
      { name: "Sion Circle", latlng: [19.0420, 72.8430] },
      { name: "Kurla Station", latlng: [19.0536, 72.8484] },
      { name: "Andheri East", latlng: [19.0760, 72.8777] },
    ],
    buses: [
      { latlng: [19.0285, 72.8500], nextStop: "Sion Circle", eta: "3 min" },
      { latlng: [19.0490, 72.8460], nextStop: "Kurla Station", eta: "6 min" },
    ],
  },
  {
    id: "54",
    name: "BEST 54 — Bandra to CST",
    traffic: "moderate" as const,
    color: "#f59e0b",
    path: [
      [19.0596, 72.8295], // Bandra Station
      [19.0176, 72.8397], // Mahim
      [18.9975, 72.8311], // Dadar
      [18.9696, 72.8353], // Parel
      [18.9388, 72.8354], // CST
    ],
    stops: [
      { name: "Bandra Station", latlng: [19.0596, 72.8295] },
      { name: "Mahim", latlng: [19.0176, 72.8397] },
      { name: "Dadar West", latlng: [18.9975, 72.8311] },
      { name: "CST", latlng: [18.9388, 72.8354] },
    ],
    buses: [
      { latlng: [19.0280, 72.8350], nextStop: "Dadar West", eta: "5 min" },
    ],
  },
  {
    id: "10",
    name: "BEST 10 — Colaba to Bandra",
    traffic: "free" as const,
    color: "#22c55e",
    path: [
      [18.9067, 72.8147], // Colaba
      [18.9255, 72.8242], // Churchgate
      [18.9388, 72.8354], // CST
      [18.9784, 72.8265], // Worli
      [19.0596, 72.8295], // Bandra
    ],
    stops: [
      { name: "Colaba", latlng: [18.9067, 72.8147] },
      { name: "Churchgate", latlng: [18.9255, 72.8242] },
      { name: "Worli", latlng: [18.9784, 72.8265] },
      { name: "Bandra", latlng: [19.0596, 72.8295] },
    ],
    buses: [
      { latlng: [18.9520, 72.8260], nextStop: "Worli", eta: "4 min" },
      { latlng: [19.0200, 72.8280], nextStop: "Bandra", eta: "8 min" },
    ],
  },
  {
    id: "221",
    name: "BEST 221 — Andheri to Borivali",
    traffic: "free" as const,
    color: "#22c55e",
    path: [
      [19.0760, 72.8777], // Andheri
      [19.1100, 72.8500],
      [19.1300, 72.8420],
      [19.2083, 72.8672], // Borivali
    ],
    stops: [
      { name: "Andheri", latlng: [19.0760, 72.8777] },
      { name: "Malad", latlng: [19.1300, 72.8420] },
      { name: "Borivali", latlng: [19.2083, 72.8672] },
    ],
    buses: [
      { latlng: [19.1150, 72.8450], nextStop: "Malad", eta: "2 min" },
    ],
  },
  {
    id: "130",
    name: "BEST 130 — Ghatkopar to Vikhroli",
    traffic: "heavy" as const,
    color: "#ef4444",
    path: [
      [19.0860, 72.9081], // Ghatkopar
      [19.1000, 72.9250],
      [19.1050, 72.9420], // Vikhroli
    ],
    stops: [
      { name: "Ghatkopar", latlng: [19.0860, 72.9081] },
      { name: "Vikhroli", latlng: [19.1050, 72.9420] },
    ],
    buses: [
      { latlng: [19.0950, 72.9200], nextStop: "Vikhroli", eta: "7 min" },
    ],
  },
];

const TRAFFIC_LABELS: Record<string, string> = {
  heavy: "Heavy Traffic",
  moderate: "Moderate Traffic",
  free: "Free Flow",
};

export function LiveMap({ className = "", height = 240, selectedRoute = "all", selectedBus, selectedAgency = "BEST", datasetRoutes = [], singleBusMode = false }: LiveMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<unknown>(null);
  const liveBusLayerRef = useRef<any>(null);
  const gtfsStopsLayerRef = useRef<any>(null);
  const routePolylineLayerRef = useRef<any>(null);
  const busMarkersRef = useRef<Map<string, any>>(new Map());
  const lastFittedRouteRef = useRef<string | null>(null);
  const lastCenteredBusRef = useRef<string | null>(null);
  
  const [showBuses, setShowBuses] = useState(true);
  const [showStops, setShowStops] = useState(true);
  const [gtfsStopsData, setGtfsStopsData] = useState<any[]>([]);
  const [fetchedRoutes, setFetchedRoutes] = useState<any[]>([]);
  const [tooltip, setTooltip] = useState<{ name: string; traffic: string; eta?: string } | null>(null);
  const [notFoundMsg, setNotFoundMsg] = useState<string | null>(null);
  const [isRouteLoading, setIsRouteLoading] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const { buses: wsBuses } = useSimulationWS();

  // Auto-start backend simulation if stopped and fetch dataset routes
  useEffect(() => {
    try {
      fetch("http://localhost:8000/control", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "start" })
      }).catch(() => {});
    } catch (e) {}

    try {
      fetch("http://localhost:8000/routes")
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) {
            setFetchedRoutes(data);
          }
        })
        .catch(() => {});
    } catch (e) {}
  }, []);

  const activeRoutesData = (datasetRoutes && datasetRoutes.length > 0) ? datasetRoutes : fetchedRoutes;

// In-memory cache for OSRM snapped routes to prevent rate limits
const osrmCache = new Map<string, [number, number][]>();

// Helper function to fetch OSRM road geometry using chunking and rate-limit throttling
async function fetchRoadSnappedCoordinates(waypoints: [number, number][]): Promise<[number, number][]> {
  if (waypoints.length < 2) return waypoints;

  const cacheKey = waypoints.map(([lat, lon]) => `${lat.toFixed(4)},${lon.toFixed(4)}`).join("|");
  if (osrmCache.has(cacheKey)) {
    return osrmCache.get(cacheKey)!;
  }

  try {
    const CHUNK_SIZE = 15;
    const allSnapped: [number, number][] = [];

    for (let i = 0; i < waypoints.length - 1; i += CHUNK_SIZE - 1) {
      const chunk = waypoints.slice(i, i + CHUNK_SIZE);
      if (chunk.length < 2) break;

      const coordStr = chunk.map(([lat, lon]) => `${lon},${lat}`).join(";");
      const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${coordStr}?overview=full&geometries=geojson`);

      if (res.ok) {
        const data = await res.json();
        if (data.code === "Ok" && data.routes?.[0]?.geometry?.coordinates) {
          const snappedChunk = data.routes[0].geometry.coordinates.map(([lon, lat]: [number, number]) => [lat, lon] as [number, number]);
          if (allSnapped.length > 0) {
            allSnapped.push(...snappedChunk.slice(1));
          } else {
            allSnapped.push(...snappedChunk);
          }
        } else {
          allSnapped.push(...chunk);
        }
      } else {
        allSnapped.push(...chunk);
      }

      // Throttle delay (250ms) between chunk requests to bypass OSRM HTTP 429 rate limit safely
      if (i + CHUNK_SIZE - 1 < waypoints.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 250));
      }
    }

    if (allSnapped.length >= 2) {
      osrmCache.set(cacheKey, allSnapped);
      return allSnapped;
    }
  } catch (e) {
    // Fallback to original waypoints if offline or network error
  }
  return waypoints;
}

  // Reactive effect for plotting searched/selected Route Polyline on demand (snapped to real roads)
  useEffect(() => {
    if (!mapInstanceRef.current || !routePolylineLayerRef.current) return;
    const L = (window as any).L;
    if (!L) return;

    let isMounted = true;

    // Clear previous route polyline
    routePolylineLayerRef.current.clearLayers();

    // If no route selected or "all", check if singleBusMode is active
    if (!selectedRoute || selectedRoute === "all") {
      if (!singleBusMode && !selectedBus) {
        setNotFoundMsg(null);
        return;
      }
    }

    const map = mapInstanceRef.current as any;
    const rawTarget = String(selectedRoute || "").trim().toUpperCase();
    const cleanTarget = rawTarget.replace(/^(BEST|MBMT|NMMT|TMT|KDMT|VVMT|KHOPOLI|UMT|VMMT)[_-]?/i, "").replace(/null/gi, "").trim();
    const targetRoute = cleanTarget || rawTarget;

    // 1. Search matching routes in activeRoutesData (from backend API or props)
    let matchingDatasetRoutes: any[] = [];
    if (activeRoutesData && activeRoutesData.length > 0 && targetRoute) {
      // Strict Exact Match ONLY: route_number or route_id must equal the search query, matching selected agency
      matchingDatasetRoutes = activeRoutesData.filter((r: any) => {
        const rAgency = String(r.agency || r.operator || "").toUpperCase().trim();
        if (selectedAgency && selectedAgency.toUpperCase() !== "ALL") {
          const sel = selectedAgency.toUpperCase();
          if (sel === "VMMT" || sel === "VVMT") {
            if (rAgency !== "VMMT" && rAgency !== "VVMT") return false;
          } else if (rAgency !== sel) {
            return false;
          }
        }
        const rNum = String(r.route_number || "").toUpperCase().trim();
        const rId = String(r.route_id || "").toUpperCase().trim();
        return rNum === rawTarget || rId === rawTarget || rNum === cleanTarget || rId === cleanTarget;
      });
    }

    // 2. Fallback: Hardcoded mock route match ONLY for BEST agency if no dataset route matched
    let mumbaiMatch: any = null;
    if ((!selectedAgency || selectedAgency.toUpperCase() === "BEST") && matchingDatasetRoutes.length === 0) {
      const exactMumbaiMatch = MUMBAI_ROUTES.find(
        (r) => r.id.toUpperCase() === cleanTarget || r.id.toUpperCase() === rawTarget
      );
      mumbaiMatch = exactMumbaiMatch || MUMBAI_ROUTES.find(
        (r) => {
          const tokens = r.name.toUpperCase().split(/[\s—\-]+/);
          return tokens.includes(cleanTarget) || tokens.includes(rawTarget);
        }
      );
    }

    const ROUTE_LINE_COLORS = ["#2563eb", "#9333ea", "#d97706", "#059669", "#dc2626", "#2563eb"];
    const allBounds = L.latLngBounds([]);

    if (matchingDatasetRoutes.length > 0) {
      setNotFoundMsg(null);
      matchingDatasetRoutes.forEach((datasetMatch: any, rIdx: number) => {
        const color = ROUTE_LINE_COLORS[rIdx % ROUTE_LINE_COLORS.length];
        const routeName = `${datasetMatch.agency || selectedAgency} ${datasetMatch.route_number || cleanTarget} — ${datasetMatch.route_description || datasetMatch.description || "Mumbai Route"}`;
        
        const validStops = (datasetMatch.stops || []).filter((s: any) => s && s.lat !== undefined && s.lon !== undefined && !isNaN(parseFloat(s.lat)) && !isNaN(parseFloat(s.lon)));
        if (validStops.length >= 2) {
          const rawWaypoints: [number, number][] = validStops.map((s: any) => [parseFloat(s.lat), parseFloat(s.lon)] as [number, number]);
          rawWaypoints.forEach((wp) => allBounds.extend(wp));

          // Isolated sub-layer group for this specific route variant
          const variantLayerGroup = L.layerGroup().addTo(routePolylineLayerRef.current);

          const renderPolyline = (coords: [number, number][]) => {
            if (!isMounted || !routePolylineLayerRef.current) return;
            variantLayerGroup.clearLayers();

            const polyline = L.polyline(coords, {
              color: color,
              weight: 6,
              opacity: 0.9,
              lineCap: "round",
              lineJoin: "round",
            }).addTo(variantLayerGroup);

            L.polyline(coords, {
              color: "white",
              weight: 2,
              opacity: 0.7,
              dashArray: "6 10",
              lineCap: "round",
            }).addTo(variantLayerGroup);

            polyline.on("mouseover", () => {
              setTooltip({ name: routeName, traffic: `Route ${datasetMatch.route_number}` });
            });
            polyline.on("mouseout", () => setTooltip(null));

            // Render stop dots for this variant
            const totalStops = validStops.length;
            validStops.forEach((st: any, idx: number) => {
              const isStart = idx === 0;
              const isEnd = idx === totalStops - 1;
              const isTerminal = isStart || isEnd;

              const radius = isTerminal ? 7 : 4;
              const strokeColor = isTerminal ? "#0f172a" : color;
              const fillColor = isTerminal ? "#0f172a" : "#ffffff";
              const weight = isTerminal ? 3 : 2;

              const stopCircle = L.circleMarker([parseFloat(st.lat), parseFloat(st.lon)], {
                radius,
                color: strokeColor,
                fillColor,
                fillOpacity: 1,
                weight,
              }).addTo(variantLayerGroup);

              const sName = st.name || `Stop ${st.stop_id}`;
              stopCircle.on("mouseover", () => {
                setTooltip({
                  name: `${isStart ? "🚩" : (isEnd ? "🏁" : "🚏")} ${sName}`,
                  traffic: `${datasetMatch.agency || selectedAgency} Route ${datasetMatch.route_number}`,
                });
              });
              stopCircle.on("mouseout", () => setTooltip(null));

              stopCircle.bindPopup(`
                <div style="font-family:system-ui,-apple-system,sans-serif;padding:2px;min-width:180px;">
                  <div style="font-weight:800;font-size:13px;color:#0f172a;margin-bottom:2px;">
                    ${isStart ? "🚩" : (isEnd ? "🏁" : "🚏")} ${sName}
                  </div>
                  <div style="font-size:11px;color:#2563eb;font-weight:700;">
                    ${datasetMatch.agency || selectedAgency} Route ${datasetMatch.route_number} (${datasetMatch.route_description || ""})
                  </div>
                </div>
              `);
            });
          };

          renderPolyline(rawWaypoints);

          setIsRouteLoading(true);
          fetchRoadSnappedCoordinates(rawWaypoints).then((snappedCoords) => {
            if (isMounted) {
              setIsRouteLoading(false);
              if (snappedCoords && snappedCoords.length >= 2) {
                renderPolyline(snappedCoords);
              }
            }
          }).catch(() => {
            if (isMounted) setIsRouteLoading(false);
          });
        }
      });

      if (allBounds.isValid() && lastFittedRouteRef.current !== targetRoute) {
        lastFittedRouteRef.current = targetRoute;
        try {
          map.fitBounds(allBounds, { padding: [50, 50], maxZoom: 15 });
        } catch (e) {}
      }
    } else if (mumbaiMatch) {
      setNotFoundMsg(null);
      const rawWaypoints = mumbaiMatch.path as [number, number][];
      const color = mumbaiMatch.color;
      const name = mumbaiMatch.name;

      const renderPolyline = (coords: [number, number][]) => {
        if (!isMounted || !routePolylineLayerRef.current) return;
        const polyline = L.polyline(coords, { color, weight: 6, opacity: 0.9 }).addTo(routePolylineLayerRef.current);
        L.polyline(coords, { color: "white", weight: 2, opacity: 0.7, dashArray: "6 10" }).addTo(routePolylineLayerRef.current);
        polyline.on("mouseover", () => setTooltip({ name, traffic: "Mock Route" }));
        polyline.on("mouseout", () => setTooltip(null));
      };
      renderPolyline(rawWaypoints);
      const bounds = L.latLngBounds(rawWaypoints);
      if (bounds.isValid()) map.fitBounds(bounds, { padding: [50, 50] });
    } else {
      setNotFoundMsg(`Route ${targetRoute} not found for ${selectedAgency}`);
    }

    return () => {
      isMounted = false;
    };
  }, [selectedRoute, activeRoutesData, selectedBus, singleBusMode, gtfsStopsData, mapReady]);

  // Fetch full 3,029 Bus Stops from Mumbai Map dataset
  useEffect(() => {
    try {
      fetch("/mumbai_stops.json")
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) {
            setGtfsStopsData(data);
          } else {
            fetch("http://localhost:8000/stops")
              .then((res) => res.json())
              .then((data) => {
                if (Array.isArray(data)) setGtfsStopsData(data);
              })
              .catch(() => {});
          }
        })
        .catch(() => {
          fetch("http://localhost:8000/stops")
            .then((res) => res.json())
            .then((data) => {
              if (Array.isArray(data)) setGtfsStopsData(data);
            })
            .catch(() => {});
        });
    } catch (e) {}
  }, []);

  // Client-side animated ticker for fallback buses when WS is blocked/empty (e.g. HTTPS Tunnel)
  const [animProgress, setAnimProgress] = useState(0);

  useEffect(() => {
    if (wsBuses && wsBuses.length > 0) return;
    const timer = setInterval(() => {
      setAnimProgress((p) => (p + 0.015) % 1.0);
    }, 1000);
    return () => clearInterval(timer);
  }, [wsBuses]);

  // Determine active buses to display (live WS or animated schedule-dispatched buses)
  const displayBuses = useMemo(() => {
    if (wsBuses && wsBuses.length > 0) {
      return wsBuses;
    }
    const animated: any[] = [];

    // If a specific dataset route is selected, dispatch buses along its exact path at 15-min scheduled intervals!
    if (selectedRoute && selectedRoute !== "all" && datasetRoutes && datasetRoutes.length > 0) {
      const target = selectedRoute.trim().toUpperCase();
      const rMatch = datasetRoutes.find((r: any) => String(r.route_number).toUpperCase() === target || String(r.route_id).toUpperCase() === target);
      if (rMatch && rMatch.stops) {
        const path = rMatch.stops.filter((s: any) => s.lat !== undefined && s.lon !== undefined).map((s: any) => [s.lat, s.lon] as [number, number]);
        if (path.length >= 2) {
          const totalSegs = path.length - 1;
          // Spawn 3 buses dispatched sequentially from Start Terminal at 15-min headway intervals
          [0, 1, 2].forEach((bIdx) => {
            const headwayOffset = bIdx * 0.30; // 30% route spacing (15-min scheduled dispatch interval)
            const t = (animProgress + headwayOffset) % 1.0;
            const scaledT = t * totalSegs;
            const segIdx = Math.min(totalSegs - 1, Math.floor(scaledT));
            const segFrac = scaledT - segIdx;

            const p1 = path[segIdx];
            const p2 = path[segIdx + 1];

            const lat = p1[0] + segFrac * (p2[0] - p1[0]);
            const lon = p1[1] + segFrac * (p2[1] - p1[1]);

            animated.push({
              id: `${rMatch.agency}_${rMatch.route_number}_BUS_${bIdx + 1}`,
              bus_id: `${rMatch.agency}_${rMatch.route_number}_BUS_${bIdx + 1}`,
              route_number: rMatch.route_number,
              lat: parseFloat(lat.toFixed(6)),
              lon: parseFloat(lon.toFixed(6)),
              status: segFrac < 0.1 ? "BOARDING" : (bIdx === 1 ? "BOARDING" : "RUNNING"),
              delay: bIdx * 90,
              occupancy: 25 + bIdx * 15
            });
          });
          return animated;
        }
      }
    }

    // Default fallback dispatches along hardcoded MUMBAI_ROUTES
    MUMBAI_ROUTES.forEach((r) => {
      r.buses.forEach((b, idx) => {
        const path = r.path;
        if (path.length < 2) return;
        
        const totalSegs = path.length - 1;
        const initialOffset = idx * 0.30;
        const t = (animProgress + initialOffset) % 1.0;
        
        const scaledT = t * totalSegs;
        const segIdx = Math.min(totalSegs - 1, Math.floor(scaledT));
        const segFrac = scaledT - segIdx;
        
        const p1 = path[segIdx];
        const p2 = path[segIdx + 1];
        
        const lat = p1[0] + segFrac * (p2[0] - p1[0]);
        const lon = p1[1] + segFrac * (p2[1] - p1[1]);
        
        animated.push({
          id: `${r.id}_BUS_${idx + 1}`,
          bus_id: `${r.id}_BUS_${idx + 1}`,
          route_number: r.id,
          lat: parseFloat(lat.toFixed(6)),
          lon: parseFloat(lon.toFixed(6)),
          status: segFrac < 0.15 ? "BOARDING" : "RUNNING",
          delay: idx * 45,
          occupancy: 20 + Math.floor(segFrac * 30)
        });
      });
    });
    return animated;
  }, [wsBuses, animProgress, selectedRoute, datasetRoutes]);

  // Filter buses based on selectedBus or selectedRoute (when in singleBusMode or a bus is selected, hide all other buses!)
  const routeFilteredBuses = useMemo(() => {
    let list = displayBuses;

    if (selectedBus || singleBusMode) {
      if (selectedBus) {
        const sBusLower = String(selectedBus).trim().toLowerCase();
        const matched = list.filter((bus) => {
          const bId = String(bus.id || bus.bus_id || bus.vehicle_id || "").trim().toLowerCase();
          return bId === sBusLower || bId.includes(sBusLower) || sBusLower.includes(bId);
        });
        if (matched.length > 0) return matched;
      }
      if (list.length > 0) return [list[0]];
    }

    if (!selectedRoute || selectedRoute === "all") return list;
    const target = selectedRoute.trim().toUpperCase();
    const cleanTarget = target.replace(/^(BEST|MBMT|NMMT|TMT|KDMT|VVMT|UMT|VMMT)[_-]?/i, "").trim();

    return list.filter((bus) => {
      const bAgency = String(bus.operator || bus.agency || "").trim().toUpperCase();
      if (selectedAgency && selectedAgency.toUpperCase() !== "ALL") {
        const sel = selectedAgency.toUpperCase();
        if (sel === "VMMT" || sel === "VVMT") {
          if (bAgency && bAgency !== "VMMT" && bAgency !== "VVMT") return false;
        } else if (bAgency && bAgency !== sel) {
          return false;
        }
      }
      const rNum = String(bus.route_number || bus.routeId || bus.route_id || "").trim().toUpperCase();
      const cleanRNum = rNum.replace(/^(BEST|MBMT|NMMT|TMT|KDMT|VVMT|UMT|VMMT)[_-]?/i, "").split('_')[0].trim();
      return rNum === target || cleanRNum === cleanTarget || rNum.includes(cleanTarget);
    });
  }, [displayBuses, selectedRoute, selectedAgency, selectedBus, singleBusMode]);

  // Reactive effect for Live Buses layer
  useEffect(() => {
    if (!mapInstanceRef.current || !liveBusLayerRef.current) return;
    const L = (window as any).L;
    if (!L) return;

    if (!showBuses) {
      liveBusLayerRef.current.clearLayers();
      busMarkersRef.current.clear();
      return;
    }

    const currentBusIds = new Set<string>();

    routeFilteredBuses.forEach((bus) => {
      const busId = bus.id || bus.bus_id || bus.vehicle_id;
      if (!busId || bus.lat === undefined || bus.lon === undefined) return;
      currentBusIds.add(busId);

      const color = bus.status === "BOARDING" ? "#ef4444" : (bus.delay > 60 ? "#f59e0b" : "#2563eb");
      const rawRoute = String(bus.route_number || bus.routeNumber || bus.route_id || bus.routeId || "").trim();
      const routeLabel = rawRoute.replace(/^(BEST|MBMT|NMMT|TMT|KDMT|VVMT|UMT|VMMT)[_-]?/i, "").split('_')[0] || "BUS";
      const fontSize = routeLabel.length > 3 ? "8px" : (routeLabel.length > 2 ? "9px" : "10px");
      
      const iconHtml = `<div style="width:28px;height:28px;border-radius:50%;background:${color};border:2px solid white;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.35);font-size:${fontSize};font-weight:900;color:white;font-family:system-ui,-apple-system,sans-serif;letter-spacing:-0.3px;transition: all 0.9s linear;">${routeLabel}</div>`;
      
      const existingMarker = busMarkersRef.current.get(busId);

      if (existingMarker) {
        existingMarker.setLatLng([bus.lat, bus.lon]);
        // Update marker icon if route or status changed
        const newIcon = L.divIcon({
          html: iconHtml,
          className: "smooth-marker-icon",
          iconSize: [28, 28],
          iconAnchor: [14, 14]
        });
        existingMarker.setIcon(newIcon);
      } else {
        const icon = L.divIcon({
          html: iconHtml,
          className: "smooth-marker-icon",
          iconSize: [28, 28],
          iconAnchor: [14, 14]
        });

        const marker = L.marker([bus.lat, bus.lon], { icon }).addTo(liveBusLayerRef.current);
        marker.on("mouseover", () => {
          setTooltip({
            name: `Bus ${busId} (Route ${routeLabel})`,
            traffic: bus.status || 'RUNNING',
            eta: `Delay: ${bus.delay || 0}s | ${bus.occupancy || 0} pax`
          });
        });
        marker.on("mouseout", () => setTooltip(null));

        busMarkersRef.current.set(busId, marker);
      }
    });

    // Remove markers for buses that left active stream
    busMarkersRef.current.forEach((marker, id) => {
      if (!currentBusIds.has(id)) {
        marker.remove();
        busMarkersRef.current.delete(id);
      }
    });

    // Center map on selected bus ONCE when selectedBus changes (allows smooth marker movement without camera jitter)
    if ((selectedBus || singleBusMode) && routeFilteredBuses.length > 0 && routeFilteredBuses[0].lat && routeFilteredBuses[0].lon) {
      const targetBus = routeFilteredBuses[0];
      const busKey = `${targetBus.id || targetBus.bus_id}`;
      if (lastCenteredBusRef.current !== busKey) {
        lastCenteredBusRef.current = busKey;
        try {
          (mapInstanceRef.current as any).setView([targetBus.lat, targetBus.lon], 15);
        } catch (e) {}
      }
    }
  }, [routeFilteredBuses, showBuses, mapReady]);

  // Reactive effect for Bus Stops layer
  useEffect(() => {
    if (!mapInstanceRef.current || !gtfsStopsLayerRef.current) return;
    const L = (window as any).L;
    if (!L) return;

    // 1. Clear all stops first
    gtfsStopsLayerRef.current.clearLayers();

    // 2. Return if hidden OR if a specific route is searched/selected
    if (!showStops || (selectedRoute && selectedRoute !== "all")) return;

    // 3. Render default route stops
    MUMBAI_ROUTES.forEach((route) => {
      route.stops.forEach((stop) => {
        const circle = L.circleMarker(stop.latlng as [number, number], {
          radius: 3.5,
          color: route.color,
          fillColor: "#ffffff",
          fillOpacity: 1,
          weight: 2,
        }).addTo(gtfsStopsLayerRef.current);

        circle.on("mouseover", () => {
          setTooltip({ name: `🚏 ${stop.name}`, traffic: TRAFFIC_LABELS[route.traffic] });
        });
        circle.on("mouseout", () => setTooltip(null));

        circle.bindPopup(`
          <div style="font-family:system-ui,-apple-system,BlinkMacSystemFont,sans-serif;padding:2px;min-width:160px;">
            <div style="display:flex;align-items:center;gap:6px;font-weight:800;font-size:13px;color:#0f172a;margin-bottom:4px;">
              <span style="font-size:14px;">🚏</span> ${stop.name}
            </div>
            <div style="font-size:11px;font-weight:700;color:#334155;margin-bottom:6px;">
              Halting BEST Route:
            </div>
            <div>
              <span style="background:#eff6ff;color:#1d4ed8;border:1px solid #bfdbfe;font-size:10px;font-weight:700;padding:2px 8px;border-radius:12px;display:inline-block;">BEST ${route.id}</span>
            </div>
          </div>
        `);
      });
    });

    // 4. Render full GTFS backend stops
    gtfsStopsData.forEach((st) => {
      if (st.lat === undefined || st.lon === undefined) return;
      const stopCircle = L.circleMarker([st.lat, st.lon], {
        radius: 3,
        color: "#2563eb",
        fillColor: "#ffffff",
        fillOpacity: 0.95,
        weight: 1.5
      }).addTo(gtfsStopsLayerRef.current);

      const routes = Array.isArray(st.routes) ? st.routes : [];
      const routeListStr = routes.length > 0 ? ` | Routes: ${routes.slice(0, 4).join(", ")}` : "";

      stopCircle.on("mouseover", () => {
        setTooltip({
          name: `🚏 ${st.name || "Bus Stop"}`,
          traffic: `Stop ID: ${st.stop_id || "GTFS"}${routeListStr}`
        });
      });
      stopCircle.on("mouseout", () => setTooltip(null));

      const routeBadgesHtml = routes.length > 0
        ? routes.map((r: string) => `<span style="background:#eff6ff;color:#1d4ed8;border:1px solid #bfdbfe;font-size:10px;font-weight:700;padding:2px 6px;border-radius:12px;display:inline-block;">${r}</span>`).join(" ")
        : `<span style="color:#64748b;font-size:11px;">Standard BEST Route Stop</span>`;

      const popupHtml = `
        <div style="font-family:system-ui,-apple-system,BlinkMacSystemFont,sans-serif;padding:2px;min-width:180px;max-width:240px;">
          <div style="display:flex;align-items:center;gap:6px;font-weight:800;font-size:13px;color:#0f172a;margin-bottom:2px;">
            <span style="font-size:14px;">🚏</span> ${st.name || "Bus Stop"}
          </div>
          <div style="font-size:10px;color:#64748b;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;">
            Stop ID: ${st.stop_id}
          </div>
          <div style="font-size:11px;font-weight:700;color:#334155;margin-bottom:6px;">
            Halting BEST Routes (${routes.length}):
          </div>
          <div style="display:flex;flex-wrap:wrap;gap:4px;max-height:100px;overflow-y:auto;padding-right:2px;">
            ${routeBadgesHtml}
          </div>
        </div>
      `;

      stopCircle.bindPopup(popupHtml, {
        closeButton: true,
        className: "custom-stop-popup"
      });
    });
  }, [gtfsStopsData, showStops, selectedRoute, mapReady]);

  // Leaflet Map instance initialization
  useEffect(() => {
    if (!mapRef.current) return;

    const container = mapRef.current as HTMLDivElement & { _leaflet_id?: number };
    if (container._leaflet_id) {
      if (mapInstanceRef.current) {
        (mapInstanceRef.current as { remove: () => void }).remove();
        mapInstanceRef.current = null;
      }
      delete container._leaflet_id;
    }

    if (mapInstanceRef.current) return;

    import("leaflet").then((L) => {
      if (!mapRef.current || mapInstanceRef.current) return;
      const el = mapRef.current as HTMLDivElement & { _leaflet_id?: number };
      if (el._leaflet_id) return;

      // @ts-expect-error leaflet icon hack
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map = L.map(mapRef.current!, {
        center: [19.0176, 72.8562],
        zoom: 12,
        zoomControl: false,
        scrollWheelZoom: false,
        dragging: true,
        attributionControl: false,
      });

      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
        {
          subdomains: "abcd",
          maxZoom: 19,
          attribution: "© OpenStreetMap © CARTO",
        }
      ).addTo(map);

      // Dedicated layer groups
      gtfsStopsLayerRef.current = L.layerGroup().addTo(map);
      liveBusLayerRef.current = L.layerGroup().addTo(map);
      routePolylineLayerRef.current = L.layerGroup().addTo(map);

      L.control.attribution({ position: "bottomright", prefix: false })
        .addAttribution("© <a href='https://carto.com/'>CARTO</a>")
        .addTo(map);

      mapInstanceRef.current = map;
      setMapReady(true);
    });

    return () => {
      if (mapInstanceRef.current) {
        (mapInstanceRef.current as { remove: () => void }).remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div className={`relative rounded-2xl overflow-hidden border border-border shadow-sm ${className}`} style={{ height }}>
      {/* Leaflet CSS */}
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        crossOrigin=""
      />

      {/* Map container */}
      <div ref={mapRef} className="w-full h-full" />

      {/* Loading skeleton */}
      {!mapReady && (
        <div className="absolute inset-0 bg-[#f5f5f0] flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            <p className="text-xs text-muted-foreground font-medium">Loading map…</p>
          </div>
        </div>
      )}

      {/* Hover tooltip */}
      {tooltip && (
        <div className="absolute top-3 left-3 z-[1000] bg-white/95 backdrop-blur-sm rounded-xl px-3 py-2 shadow-lg border border-border pointer-events-none">
          <p className="font-semibold text-xs text-foreground">{tooltip.name}</p>
          <p className="text-[10px] text-muted-foreground">{tooltip.traffic}</p>
          {tooltip.eta && <p className="text-[10px] text-primary font-medium mt-0.5">{tooltip.eta}</p>}
        </div>
      )}

      {/* Map Layer Controls (Show/Hide Buses & Stops) */}
      <div className="absolute top-3 right-20 z-[1000] flex items-center gap-1.5 bg-white/95 backdrop-blur-sm rounded-full p-1 shadow-md border border-border">
        <button
          onClick={() => setShowBuses((prev) => !prev)}
          className={`flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full transition-all ${
            showBuses
              ? "bg-blue-600 text-white shadow-sm"
              : "bg-slate-100 text-slate-500 hover:bg-slate-200"
          }`}
        >
          <span>🚌</span>
          <span>{showBuses ? "Hide Buses" : "Show Buses"}</span>
        </button>

        <button
          onClick={() => setShowStops((prev) => !prev)}
          className={`flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full transition-all ${
            showStops
              ? "bg-emerald-600 text-white shadow-sm"
              : "bg-slate-100 text-slate-500 hover:bg-slate-200"
          }`}
        >
          <span>🚏</span>
          <span>{showStops ? "Hide Stops" : "Show Stops"}</span>
        </button>
      </div>

      {/* Route Loading Indicator Banner */}
      {isRouteLoading && !notFoundMsg && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] bg-blue-900/95 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg border border-blue-700/80 backdrop-blur-md flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <span className="w-3 h-3 rounded-full border-2 border-white border-t-transparent animate-spin" />
          <span>Aligning route to physical road network...</span>
        </div>
      )}

      {/* Route Not Available Banner */}
      {notFoundMsg && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] bg-slate-900/95 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg border border-slate-700/80 backdrop-blur-md flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
          <span>{notFoundMsg}</span>
        </div>
      )}

      {/* LIVE badge */}
      <div className="absolute top-3 right-3 z-[1000] flex items-center gap-1.5 bg-white/95 backdrop-blur-sm rounded-full px-2.5 py-1 shadow-md border border-border">
        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
        <span className="text-foreground text-[10px] font-bold tracking-wide">LIVE</span>
      </div>

      {/* Zoom controls */}
      <div className="absolute bottom-12 right-3 z-[1000] flex flex-col gap-1">
        {["+", "−"].map((btn) => (
          <button
            key={btn}
            onClick={() => {
              if (mapInstanceRef.current) {
                const m = mapInstanceRef.current as { zoomIn: () => void; zoomOut: () => void };
                btn === "+" ? m.zoomIn() : m.zoomOut();
              }
            }}
            className="w-8 h-8 bg-white/95 backdrop-blur-sm rounded-lg shadow-md border border-border text-foreground font-bold text-sm flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
          >
            {btn}
          </button>
        ))}
      </div>
    </div>
  );
}
