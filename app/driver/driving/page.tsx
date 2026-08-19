"use client";
 
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic, MicOff, Siren, Users,
  AlertTriangle, ChevronRight, Navigation, X,
  CheckCircle2, XCircle, ChevronDown, ChevronUp, Clock, Bus
} from "lucide-react";
import { cn } from "@/lib/utils";
 
/* ── Mock shift roster / database ───────────────────────── */
const SHIFT_DB = {
  s1: {
    label: "Morning Shift",
    route: "312",
    from: "Dadar TT",
    to: "Andheri East",
    bus: "MH-01-LA-1234",
    stops: ["Dadar TT", "Matunga Rd", "Sion Circle", "Kurla Station", "Ghatkopar East", "Vikhroli", "Bhandup", "Mulund Check Naka", "Andheri East"]
  },
  s2: {
    label: "Midday Shift",
    route: "312",
    from: "Andheri East",
    to: "Bandra Station",
    bus: "MH-01-LA-1234",
    stops: ["Andheri East", "Vile Parle", "Santacruz", "Bandra Station"]
  },
  s3: {
    label: "Evening Shift",
    route: "378",
    from: "Bandra Station",
    to: "Ghatkopar East",
    bus: "MH-01-LB-5678",
    stops: ["Bandra Station", "Dharavi Depot", "BKC Junction", "Kurla East", "Ghatkopar East"]
  },
  s4: {
    label: "Late Shift",
    route: "332",
    from: "Ghatkopar East",
    to: "Dadar TT",
    bus: "MH-01-LC-9012",
    stops: ["Ghatkopar East", "Kurla Station", "Sion Circle", "Matunga Rd", "Dadar TT"]
  }
};
 
function DrivingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const shiftId = searchParams?.get("shiftId") || "s2";
  const shift = SHIFT_DB[shiftId as keyof typeof SHIFT_DB] || SHIFT_DB.s2;

  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [showSosModal, setShowSosModal] = useState(false);
  const [mockActiveIdx, setMockActiveIdx] = useState(0);

  /* ── Live Simulation Connection States ───────────────────── */
  const [liveBuses, setLiveBuses] = useState<any[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>("332AS_TRIP_0013");
  const [wsConnected, setWsConnected] = useState<boolean>(false);

  useEffect(() => {
    let ws: WebSocket | null = null;
    let pollTimer: any = null;

    const connectWS = () => {
      try {
        ws = new WebSocket("ws://localhost:8000/ws");
        ws.onopen = () => setWsConnected(true);
        ws.onmessage = (evt) => {
          try {
            const data = JSON.parse(evt.data);
            if (data.buses && Array.isArray(data.buses)) {
              setLiveBuses(data.buses);
              setWsConnected(true);
            }
          } catch (e) {}
        };
        ws.onerror = () => setWsConnected(false);
        ws.onclose = () => setWsConnected(false);
      } catch (e) {
        setWsConnected(false);
      }
    };

    const fetchBuses = async () => {
      try {
        const res = await fetch("http://localhost:8000/buses");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setLiveBuses(data);
            setWsConnected(true);
          }
        }
      } catch (e) {}
    };

    const fetchRoutes = async () => {
      try {
        const res = await fetch("http://localhost:8000/routes");
        if (res.ok) {
          const data = await res.json();
          setRoutes(data);
        }
      } catch (e) {}
    };

    connectWS();
    fetchRoutes();
    pollTimer = setInterval(fetchBuses, 1500);

    return () => {
      if (ws) ws.close();
      if (pollTimer) clearInterval(pollTimer);
    };
  }, []);

  // Set default selected vehicle ID once live buses load
  useEffect(() => {
    if (selectedVehicleId === "332AS_TRIP_0013" && liveBuses.length > 0) {
      const firstBus = liveBuses.find(b => b.status !== "FINISHED") || liveBuses[0];
      if (firstBus) {
        setSelectedVehicleId(firstBus.id || firstBus.bus_id);
      }
    }
  }, [liveBuses, selectedVehicleId]);

  // Filter single bus from live stream or fallback
  const currentLiveBus = liveBuses.find((b) => (b.id || b.bus_id) === selectedVehicleId) || liveBuses[0] || null;

  // Compute dynamic headway gaps for the active bus based on simulation fleet positions
  let dynamicGapAhead = 5.2;
  let dynamicGapBehind = 8.4;

  if (currentLiveBus && liveBuses.length > 0) {
    const routeBuses = liveBuses.filter(
      (b) => b.route_id === currentLiveBus.route_id && b.status !== "FINISHED"
    );

    if (routeBuses.length >= 2) {
      const sortedBuses = [...routeBuses].sort((a, b) => {
        if (a.current_stop_index !== b.current_stop_index) {
          return b.current_stop_index - a.current_stop_index;
        }
        return a.distance_to_next_stop - b.distance_to_next_stop;
      });

      const myIdx = sortedBuses.findIndex((b) => (b.bus_id || b.id) === (currentLiveBus.bus_id || currentLiveBus.id));
      if (myIdx !== -1) {
        const aheadBus = sortedBuses[(myIdx - 1 + sortedBuses.length) % sortedBuses.length];
        const behindBus = sortedBuses[(myIdx + 1) % sortedBuses.length];

        const getTimeGapMin = (b1: any, b2: any) => {
          const stopDiff = Math.abs(b1.current_stop_index - b2.current_stop_index);
          const distDiffKm = Math.abs(b1.distance_to_next_stop - b2.distance_to_next_stop) / 1000;
          const speed = Math.max(15, (b1.speed + b2.speed) / 2 || 20);
          const timeMin = (stopDiff * 3.5) + (distDiffKm / speed) * 60;
          return parseFloat(Math.max(1.5, Math.min(25, timeMin)).toFixed(1));
        };

        dynamicGapAhead = getTimeGapMin(currentLiveBus, aheadBus);
        dynamicGapBehind = getTimeGapMin(behindBus, currentLiveBus);
      }
    }
  }

  // Derive route stop sequence from loaded simulation routes
  const matchedRoute = routes.find((r) => r.route_id === currentLiveBus?.route_id);
  const routeStops = matchedRoute?.stops || [];

  const activeIdx = currentLiveBus?.current_stop_index !== undefined 
    ? currentLiveBus.current_stop_index 
    : mockActiveIdx;

  const activeBusId = currentLiveBus?.bus_id || currentLiveBus?.id || selectedVehicleId;
  const activeRouteNum = currentLiveBus?.route_number || shift.route;
  const activeCurrentStop = currentLiveBus?.current_stop || shift.stops[activeIdx] || "Dadar TT";
  const activeNextStop = currentLiveBus?.next_stop || shift.stops[activeIdx + 1] || "End of Route";
  const activeSpeed = currentLiveBus?.speed !== undefined ? Math.round(currentLiveBus.speed) : 28;
  const activeOccupancy = currentLiveBus?.occupancy !== undefined ? currentLiveBus.occupancy : 11;
  const activeCapacity = currentLiveBus?.capacity || 70;
  const activeGapAhead = currentLiveBus?.gap_ahead !== undefined ? currentLiveBus.gap_ahead : dynamicGapAhead;
  const activeGapBehind = currentLiveBus?.gap_behind !== undefined ? currentLiveBus.gap_behind : dynamicGapBehind;
  const activeDelay = currentLiveBus?.delay !== undefined ? `${Math.round(currentLiveBus.delay / 60)} min` : "0s";
  
  const liveStatus = (currentLiveBus?.status || "RUNNING").toUpperCase();
  const rlActionRaw = currentLiveBus?.rl_action || currentLiveBus?.rl_recommendation;
  const isHolding = liveStatus === "HOLDING" || (currentLiveBus?.delay || 0) > 120;
  const holdSecs = currentLiveBus?.hold_time_remaining || (currentLiveBus?.delay ? Math.min(180, Math.max(30, Math.round(currentLiveBus.delay / 2))) : 180);

  const aiCommand = {
    action: isHolding ? "HOLD" : (liveStatus === "BOARDING" ? "DWELL" : "MAINTAIN"),
    title: rlActionRaw
      ? String(rlActionRaw).toUpperCase()
      : (isHolding
          ? `HOLD ${holdSecs} SECONDS AT ${activeNextStop.toUpperCase()}`
          : (liveStatus === "BOARDING"
              ? `PASSENGER BOARDING AT ${activeCurrentStop.toUpperCase()}`
              : `MAINTAIN CRUISE SPEED (${Math.round(currentLiveBus?.speed || 25)} KM/H)`)),
    recommendation: isHolding
      ? `RL Anti-Bunching Policy: Hold ${holdSecs}s at ${activeNextStop} to equalize headway spacing with bus ahead.`
      : `RL Dispatch Agent: Space optimization active for Route ${activeRouteNum}. Headway gap ahead is optimal.`,
    reason: `Live RL Model telemetry stream from simulation backend for bus ${activeBusId}.`,
    hold_sec: holdSecs
  };

  const handleEndJourney = () => {
    try {
      localStorage.setItem(`shift_status_${shiftId}`, "completed");
    } catch (e) {
      console.error(e);
    }
    router.push("/driver/shifts");
  };

  /* ── Alert states ────────────────────────────────────────── */
  const [alertAcknowledged, setAlertAcknowledged] = useState(false);
  const [countdown, setCountdown] = useState(aiCommand.hold_sec || 180);
  const [timerRunning, setTimerRunning] = useState(false);
  const [actionTaken, setActionTaken] = useState<"hold" | "cannot" | null>(null);
  const [cannotReason, setCannotReason] = useState<string | null>(null);
  const [showWhyCard, setShowWhyCard] = useState(false);

  const [alertsList, setAlertsList] = useState<any[]>([]);

  useEffect(() => {
    if (aiCommand.hold_sec && !timerRunning) {
      setCountdown(aiCommand.hold_sec);
    }
  }, [aiCommand.hold_sec]);

  // Trigger simulation shifting stops every 25 seconds (fallback in mock mode)
  useEffect(() => {
    const interval = setInterval(() => {
      setMockActiveIdx((prev) => {
        const stopsCount = routeStops.length > 0 ? routeStops.length : shift.stops.length;
        if (prev >= stopsCount - 1) {
          return 0;
        }
        return prev + 1;
      });
    }, 25000);

    return () => clearInterval(interval);
  }, [shift, routeStops]);

  // Trigger top-right notification popups on stop changes during simulation
  useEffect(() => {
    const alertDatabase = [
      { id: 1, title: aiCommand.title, text: aiCommand.recommendation, icon: aiCommand.action === "HOLD" ? "🔴" : "⚠️", border: "border-red-500" },
      { id: 2, title: "Speed Warning", text: "Maintain speed below 45km/h on this route.", icon: "⚠️", border: "border-amber-500" },
      { id: 3, title: "Hold Advisory", text: `Bunching risk at ${activeNextStop}. Hold for 3 minutes?`, icon: "⏱️", border: "border-orange-500" },
      { id: 4, title: "Ramp Prep", text: "Passenger with wheelchair boarding next stop.", icon: "♿", border: "border-blue-500" }
    ];

    const targetAlert = alertDatabase[activeIdx % alertDatabase.length];
    if (targetAlert) {
      setAlertsList((prev) => [...prev, { ...targetAlert, timestamp: Date.now() }]);
    }
  }, [activeIdx, aiCommand]);

  useEffect(() => {
    if (!timerRunning || countdown <= 0) return;
    const t = setInterval(() => setCountdown((c: number) => c - 1), 1000);
    return () => clearInterval(t);
  }, [timerRunning, countdown]);

  const mins = Math.floor(countdown / 60).toString().padStart(2, "0");
  const secs = (countdown % 60).toString().padStart(2, "0");

  const handleAcknowledge = () => {
    setActionTaken("hold");
    setTimerRunning(true);
    setShowWhyCard(true);
  };

  const simulatedStops = routeStops.length > 0
    ? routeStops.map((stop: any, idx: number) => {
        let status: "past" | "current" | "upcoming" = "upcoming";
        if (idx < activeIdx) {
          status = "past";
        } else if (idx === activeIdx) {
          status = "current";
        }
        const timeDiffMin = (idx - activeIdx) * 3;
        const stopTime = new Date(Date.now() + timeDiffMin * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return {
          name: stop.name,
          status,
          scheduledTime: stopTime
        };
      })
    : shift.stops.map((stop, idx) => {
        let status: "past" | "current" | "upcoming" = "upcoming";
        if (idx < activeIdx) {
          status = "past";
        } else if (idx === activeIdx) {
          status = "current";
        }
        return {
          name: stop,
          status,
          scheduledTime: new Date(Date.now() + (idx - activeIdx) * 8 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
      });

  const nextStop = activeNextStop;
  const etaMinutes = activeIdx === (routeStops.length > 0 ? routeStops.length : shift.stops.length) - 1 ? 0 : 4;

  return (
    <div className="flex flex-col h-screen bg-white text-foreground select-none overflow-hidden max-w-md mx-auto relative border-x border-border">

      {/* Floating Top-Right Alerts Toast List */}
      <div className="absolute top-20 right-3 z-50 space-y-2 w-60 pointer-events-auto">
        <AnimatePresence>
          {alertsList.map((alert) => (
            <motion.div
              key={alert.timestamp}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.9 }}
              className={cn(
                "bg-white border-l-4 rounded-xl p-3 shadow-lg flex flex-col gap-2 border border-border",
                alert.border
              )}
            >
              <div className="flex items-start gap-2">
                <span className="text-sm shrink-0 mt-0.5">{alert.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-black text-foreground leading-tight truncate">{alert.title}</p>
                  <p className="text-[9px] text-muted-foreground mt-0.5 leading-snug">{alert.text}</p>
                </div>
              </div>
              
              <div className="flex justify-end gap-1.5 pt-1.5 border-t border-border/60">
                <button
                  onClick={() => {
                    setAlertsList((prev) => prev.filter((a) => a.timestamp !== alert.timestamp));
                  }}
                  className="p-1 rounded bg-red-50 hover:bg-red-100 text-red-600 transition-colors flex items-center justify-center w-6 h-6 text-xs font-bold"
                  title="Dismiss / Cross"
                >
                  ❌
                </button>
                <button
                  onClick={() => {
                    setAlertsList((prev) => prev.filter((a) => a.timestamp !== alert.timestamp));
                  }}
                  className="p-1 rounded bg-red-50 hover:bg-red-100 text-[#C8102E] transition-colors flex items-center justify-center w-6 h-6 text-xs font-bold"
                  title="Accept / Tick"
                >
                  ✔️
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* ══ LIVE BUS VEHICLE SELECTOR HEADER ══════════════════ */}
      <div className="bg-[#9A0002] text-white px-3 py-2 shrink-0 z-20 border-b border-[#9A0002] flex items-center justify-between gap-2 shadow-md">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-2 h-2 rounded-full bg-white animate-pulse shrink-0" />
          <span className="text-[10px] font-black uppercase tracking-wider text-white/90 shrink-0">Driver App:</span>
          <select
            value={activeBusId}
            onChange={(e) => setSelectedVehicleId(e.target.value)}
            className="bg-white text-[#9A0002] text-xs font-black py-1 px-2 rounded-lg border border-red-200 focus:outline-none truncate max-w-[170px]"
          >
            {liveBuses.filter((b) => b.status !== "FINISHED").length > 0 ? (
              liveBuses.filter((b) => b.status !== "FINISHED").map((b) => (
                <option key={b.id || b.bus_id} value={b.id || b.bus_id}>
                  🚌 {b.id || b.bus_id} (Route {b.route_number || "312"})
                </option>
              ))
            ) : (
              <option value="332AS_TRIP_0013">🚌 332AS_TRIP_0013 (Live)</option>
            )}
          </select>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <span className={cn("text-[9px] font-bold px-2 py-0.5 rounded-md bg-white/20 text-white border border-white/30")}>
            {wsConnected ? "LIVE STREAM" : "OFFLINE"}
          </span>
        </div>
      </div>

      {/* ══ VOICE COMMAND BAR (WHITE & RED THEME) ══════════════════ */}
      <div className={cn(
        "flex items-center justify-between px-4 py-2 border-b shrink-0 z-10 bg-red-50 border-red-200 text-[#9A0002]"
      )}>
        <div className="flex items-center gap-2">
          {voiceEnabled
            ? <Mic size={14} strokeWidth={2.5} className="text-[#C8102E]" />
            : <MicOff size={14} strokeWidth={2.5} className="text-slate-500" />
          }
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#9A0002]">
            Voice Commands: {voiceEnabled ? "Active" : "Disabled"}
          </span>
          {voiceEnabled && <span className="w-1.5 h-1.5 rounded-full bg-[#C8102E] animate-pulse" />}
        </div>

        <button
          onClick={() => setVoiceEnabled((v) => !v)}
          className={cn(
            "px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all",
            voiceEnabled
              ? "bg-[#C8102E] text-white border-[#C8102E] hover:bg-[#9A0002]"
              : "bg-white text-[#C8102E] border border-red-200 hover:bg-red-50"
          )}
        >
          {voiceEnabled ? "Disable" : "Re-enable"}
        </button>
      </div>

      {/* ══ MAP (DYNAMIC SIZING FOR VISIBILITY) ══════════════ */}
      <motion.div
        animate={{ height: alertAcknowledged ? 160 : 200 }}
        transition={{ type: "spring", stiffness: 120, damping: 18 }}
        className="relative overflow-hidden shrink-0 bg-white border-b border-border w-full z-10"
      >
        <svg className="w-full h-full" viewBox="0 0 360 200" fill="none" preserveAspectRatio="none">
          {/* Grid lines */}
          <path d="M-10,60 L370,60 M-10,140 L370,140" stroke="#F1F3F5" strokeWidth="8" />
          <path d="M80,-10 L80,230 M200,-10 L200,230 M310,-10 L310,230" stroke="#F1F3F5" strokeWidth="8" />
          <path d="M-10,105 L200,105" stroke="#E9ECEF" strokeWidth="4" />
          {/* Route path glow */}
          <path d="M 50,160 C 80,120 130,95 168,70 C 198,48 218,35 285,20"
            stroke="#9A0002" strokeWidth="12" strokeLinecap="round" fill="none" opacity="0.1" />
          {/* Route path line */}
          <path d="M 50,160 C 80,120 130,95 168,70 C 198,48 218,35 285,20"
            stroke="#9A0002" strokeWidth="4" strokeLinecap="round" fill="none" />
          {/* Stop dots */}
          {[{ x: 50, y: 160 }, { x: 110, y: 115 }, { x: 168, y: 70 }, { x: 218, y: 38 }, { x: 285, y: 20 }]
            .map((pt, i) => <circle key={i} cx={pt.x} cy={pt.y} r="4" fill="white" stroke="#9A0002" strokeWidth="2" />)}
          {/* Bus B (behind) */}
          <circle cx="98" cy="125" r="11" fill="#F59E0B" stroke="white" strokeWidth="2" />
          <text x="98" y="128.5" textAnchor="middle" fill="white" fontSize="9" fontWeight="900">B</text>
          {/* Bus YOU */}
          <circle cx="168" cy="70" r="15" fill="#9A0002" stroke="white" strokeWidth="3.5" />
          <text x="168" y="73.5" textAnchor="middle" fill="white" fontSize="8" fontWeight="900">YOU</text>
          <circle cx="168" cy="70" r="21" fill="none" stroke="#9A0002" strokeWidth="1" opacity="0.35" className="animate-ping" style={{ transformOrigin: "168px 70px" }} />
          {/* Bus A (ahead) */}
          <circle cx="218" cy="38" r="11" fill="#22c55e" stroke="white" strokeWidth="2" />
          <text x="218" y="41.5" textAnchor="middle" fill="white" fontSize="9" fontWeight="900">A</text>
        </svg>
        <div className="absolute bottom-2 left-4 text-[9px] text-muted-foreground font-semibold flex items-center gap-2">
          <span>Route {activeRouteNum} — Live GPS Map ({activeBusId})</span>
        </div>
      </motion.div>

      {/* ══ SCROLLABLE CONTENT (AI COMMAND BANNER & CARD) ════════ */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 pb-[180px]">

        {/* ── LIVE AI COMMAND BANNER & ADVISORY CARD ─ */}
        <div className={cn(
          "rounded-2xl overflow-hidden border transition-all shadow-sm bg-white",
          alertAcknowledged ? "border-emerald-200" : "border-[#9A0002]/30"
        )}>
          {/* Alert header banner */}
          <div className={cn(
            "flex items-center gap-3 px-4 py-3",
            alertAcknowledged ? "bg-emerald-50 text-emerald-900" : "bg-[#9A0002] text-white"
          )}>
            <div className="p-1.5 bg-white/20 rounded-xl shrink-0">
              {alertAcknowledged
                ? <CheckCircle2 size={16} className="text-emerald-700" strokeWidth={2.5} />
                : <AlertTriangle size={16} className="text-white" strokeWidth={2.5} />
              }
            </div>
            <div className="flex-1 min-w-0">
              <p className={cn("text-sm font-black leading-tight", alertAcknowledged ? "text-emerald-900" : "text-white")}>
                {alertAcknowledged ? "Holding — Headway Restoring" : aiCommand.title}
              </p>
              <p className={cn("text-[9px] mt-0.5", alertAcknowledged ? "text-emerald-700/80" : "text-white/80")}>
                {alertAcknowledged
                  ? `Timer: ${mins}:${secs} remaining · Vehicle ${activeBusId}`
                  : `AI Advisory: ${aiCommand.action} · Bus ${activeBusId} · Gap Behind ${activeGapBehind}m`
                }
              </p>
            </div>
            {!alertAcknowledged && (
              <button
                onClick={() => setAlertAcknowledged(true)}
                className="shrink-0 px-3.5 py-1.5 bg-white text-[#9A0002] hover:bg-white/95 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-sm"
              >
                Ack
              </button>
            )}
          </div>

          {/* Expanded detail — AFTER acknowledge or always viewable */}
          <AnimatePresence>
            {alertAcknowledged && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden bg-white"
              >
                <div className="px-4 py-4 space-y-4 border-t border-border">
                  {/* AI Recommendation block */}
                  <div className="flex items-start gap-3 bg-red-500/5 border border-red-500/10 rounded-xl p-3">
                    <div className="w-7 h-7 rounded-full bg-[#9A0002]/10 flex items-center justify-center shrink-0">
                      <span className="text-[#9A0002] text-xs font-black">▼</span>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">AI Recommended Action ({activeBusId})</p>
                      <p className="text-xs font-bold text-foreground mt-1 leading-relaxed">
                        {aiCommand.recommendation}
                      </p>
                    </div>
                  </div>

                  {/* Countdown Timer */}
                  <div className="flex flex-col items-center py-3 bg-[#EFE6DE]/40 rounded-xl border border-border/40">
                    <div className="relative w-20 h-20 flex items-center justify-center">
                      <svg className="w-full h-full -rotate-90">
                        <circle cx="40" cy="40" r="33" stroke="#E9ECEF" strokeWidth="4.5" fill="none" />
                        <circle
                          cx="40" cy="40" r="33"
                          stroke="#9A0002"
                          strokeWidth="4.5"
                          fill="none"
                          strokeDasharray={2 * Math.PI * 33}
                          strokeDashoffset={2 * Math.PI * 33 * (1 - countdown / (aiCommand.hold_sec || 180))}
                          strokeLinecap="round"
                          className="transition-all duration-1000"
                        />
                      </svg>
                      <div className="absolute text-center">
                        <p className="text-lg font-black tabular-nums text-foreground leading-none">{mins}:{secs}</p>
                        <p className="text-[7px] text-muted-foreground uppercase tracking-wider font-bold mt-0.5">min</p>
                      </div>
                    </div>
                    <p className="text-[9px] text-muted-foreground mt-2.5 font-bold">
                      {countdown > 0 ? "Driver is holding at stop..." : "Hold complete — safe to depart"}
                    </p>
                  </div>

                  {/* Action buttons state */}
                  {!actionTaken ? (
                    <div className="space-y-2">
                      <button
                        onClick={handleAcknowledge}
                        className="w-full py-3 bg-[#9A0002] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 hover:bg-[#9A0002]/90 transition-colors shadow-sm"
                      >
                        <CheckCircle2 size={14} strokeWidth={2.5} />
                        Acknowledge &amp; Hold
                      </button>
                      <div className="grid grid-cols-2 gap-2">
                        {["Heavy Traffic", "Vehicle Issue"].map((reason) => (
                          <button
                            key={reason}
                            onClick={() => { setCannotReason(reason); setActionTaken("cannot"); }}
                            className="py-2 bg-secondary border border-border rounded-xl text-[9px] font-bold text-muted-foreground hover:bg-secondary/80 transition-all"
                          >
                            Cannot: {reason}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : actionTaken === "hold" ? (
                    <div className="py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-bold flex items-center justify-center gap-2">
                      <CheckCircle2 size={13} strokeWidth={2.5} className="text-emerald-600" />
                      Hold acknowledged · Control room notified
                    </div>
                  ) : (
                    <div className="py-2.5 bg-red-50 border border-red-200 rounded-xl text-[10px] text-red-800 font-bold text-center">
                      <XCircle size={12} strokeWidth={2} className="inline mr-1 text-red-600" />
                      Cannot Comply — {cannotReason}
                    </div>
                  )}

                  {/* Why this action card toggle */}
                  <button
                    onClick={() => setShowWhyCard((v) => !v)}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 bg-secondary rounded-xl border border-border text-[10px] text-muted-foreground hover:bg-secondary/70 transition-colors"
                  >
                    <span className="font-bold uppercase tracking-widest">Why this AI action?</span>
                    {showWhyCard ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                  </button>

                  <AnimatePresence>
                    {showWhyCard && (
                      <motion.p
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="text-xs text-muted-foreground leading-relaxed overflow-hidden px-1 font-medium"
                      >
                        {aiCommand.reason}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Journey Timeline stops list ───────── */}
        <div className="bg-white rounded-3xl border border-border p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              Route Stops ({simulatedStops.length})
            </p>
            <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
              Current Stop: {activeCurrentStop}
            </span>
          </div>

          <div className="relative pl-6 space-y-4">
            {/* Vertical line */}
            <div className="absolute left-[9px] top-2 bottom-2 w-[2px] bg-border" />

            {simulatedStops.map((stop: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between text-xs relative">
                {/* Dot indicator */}
                <div className="absolute left-[-22px] flex items-center justify-center">
                  <div className={cn(
                    "w-2.5 h-2.5 rounded-full border-2 bg-white",
                    stop.status === "past" && "bg-emerald-500 border-emerald-500",
                    stop.status === "current" && "bg-[#9A0002] border-[#9A0002] ring-4 ring-[#9A0002]/20",
                    stop.status === "upcoming" && "border-border"
                  )} />
                </div>

                <span className={cn(
                  "font-semibold truncate max-w-[70%]",
                  stop.status === "past" && "text-muted-foreground line-through decoration-muted-foreground/35",
                  stop.status === "current" && "text-primary font-bold",
                  stop.status === "upcoming" && "text-foreground"
                )}>
                  {stop.name}
                </span>

                <span className="text-[10px] font-semibold text-muted-foreground">
                  {stop.status === "current" ? "Arrived" : stop.status === "past" ? "Departed" : stop.scheduledTime}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* End Journey option when route destination is reached */}
      {activeIdx === shift.stops.length - 1 && (
        <div className="fixed bottom-[175px] left-0 right-0 max-w-md mx-auto px-4 z-40">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white border-2 border-emerald-500 rounded-2xl p-4 shadow-xl text-center space-y-3"
          >
            <div>
              <h3 className="text-sm font-black text-emerald-800 flex items-center justify-center gap-1.5">
                <CheckCircle2 size={16} className="text-emerald-600" />
                Destination Reached
              </h3>
              <p className="text-[10px] text-muted-foreground mt-0.5">You have arrived safely at {shift.to}.</p>
            </div>
            <button
              onClick={handleEndJourney}
              className="w-full block py-2.5 bg-emerald-600 hover:bg-[#059669] text-white font-bold text-xs rounded-xl transition-all shadow-md text-center"
            >
              End Journey &amp; Submit Shift
            </button>
          </motion.div>
        </div>
      )}

      {/* ══ FIXED BOTTOM HUD (LIVE SIMULATION METRICS) ═══════════════════ */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto z-40 bg-white border-t border-border shadow-lg">

        {/* Next stop */}
        <div className="flex items-center gap-3 px-4 py-2 border-b border-border">
          <div className="w-9 h-9 rounded-full bg-[#9A0002]/10 flex items-center justify-center shrink-0">
            <Navigation size={14} strokeWidth={2.5} className="text-[#9A0002]" />
          </div>
          <div className="flex-1">
            <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">Next Stop</p>
            <p className="text-sm font-bold text-foreground leading-tight truncate">{nextStop}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-black text-foreground tabular-nums leading-none">{etaMinutes}</p>
            <p className="text-[8px] text-muted-foreground uppercase tracking-wider font-bold">min away</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 border-b border-border">
          {[
            { label: "Speed",      value: `${activeSpeed}`, unit: "km/h", color: "text-foreground" },
            { label: "Gap Ahead",  value: `${activeGapAhead}`, unit: "min",  color: "text-amber-700" },
            { label: "Gap Behind", value: `${activeGapBehind}`, unit: "min",  color: "text-emerald-700" },
            { label: "Delay",      value: `${activeDelay}`, unit: "delay", color: "text-red-700" },
          ].map((item, i) => (
            <div key={item.label} className={cn("text-center py-2.5", i !== 0 && "border-l border-border")}>
              <p className={`text-lg font-black tabular-nums ${item.color}`}>{item.value}</p>
              <p className="text-[7px] text-muted-foreground font-bold uppercase tracking-wide mt-0.5">{item.unit}</p>
              <p className="text-[7px] text-muted-foreground font-bold uppercase tracking-wide">{item.label}</p>
            </div>
          ))}
        </div>

        {/* Passengers + SOS */}
        <div className="flex items-center justify-between px-4 py-2.5">
          <div className="flex items-center gap-2">
            <Users size={13} strokeWidth={2} className="text-muted-foreground" />
            <span className="text-sm font-bold text-foreground">{activeOccupancy}</span>
            <span className="text-xs text-muted-foreground font-medium">/ {activeCapacity} pax</span>
          </div>
          <div className="flex-1 mx-4 h-1.5 bg-[#E9ECEF] rounded-full overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all duration-500",
                (activeOccupancy / activeCapacity) > 0.85 ? "bg-red-600" :
                (activeOccupancy / activeCapacity) > 0.65 ? "bg-amber-500" : "bg-emerald-500"
              )}
              style={{ width: `${Math.min(100, (activeOccupancy / activeCapacity) * 100)}%` }}
            />
          </div>
          <button
            onClick={() => setShowSosModal(true)}
            className="w-14 h-9 rounded-xl bg-red-600 text-white text-xs font-black hover:bg-red-700 transition-colors shadow-sm"
          >
            SOS
          </button>
        </div>
      </div>
 
      {/* ══ SOS Modal (LIGHT MODE) ══════════════════════════ */}
      <AnimatePresence>
        {showSosModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 flex items-end"
            onClick={() => setShowSosModal(false)}
          >
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md mx-auto bg-white rounded-t-3xl border-t border-border p-6 space-y-4 shadow-xl"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Siren size={18} className="text-[#9A0002]" />
                  <h2 className="text-base font-black text-foreground">Emergency SOS</h2>
                </div>
                <button onClick={() => setShowSosModal(false)}>
                  <X size={18} className="text-muted-foreground hover:text-foreground" />
                </button>
              </div>
              <p className="text-xs text-muted-foreground">Select the emergency type. Control room will be notified immediately.</p>
              <div className="space-y-2">
                {["Medical Emergency", "Accident / Collision", "Passenger Dispute", "Mechanical Breakdown", "Security Threat"].map((type) => (
                  <button key={type} className="w-full text-left px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm font-semibold hover:bg-red-100 transition-colors flex items-center justify-between">
                    {type}
                    <ChevronRight size={13} className="text-red-600" />
                  </button>
                ))}
              </div>
              <button onClick={() => setShowSosModal(false)} className="w-full py-3 rounded-xl border border-border text-muted-foreground text-sm font-semibold hover:bg-secondary transition-colors">
                Cancel — No Emergency
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
 
export default function DriverDrivingPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center bg-[#EFE6DE]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-sm text-muted-foreground font-semibold">Initializing journey simulator...</p>
        </div>
      </div>
    }>
      <DrivingContent />
    </Suspense>
  );
}
