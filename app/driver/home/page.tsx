"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  MapPin, Bus, ArrowRight, RefreshCw, Radio,
  Volume2, VolumeX, Mic, Navigation, Activity, TrendingUp,
  AlertOctagon, CheckCircle2, Zap, Users, Clock,
  AlertTriangle, CheckCircle, CornerUpLeft, CornerUpRight, ArrowUp,
  Compass, Smartphone, Monitor, Eye, Search, Filter, X
} from "lucide-react";
import { LiveMap } from "@/components/maps/LiveMap";
import { useSimulationWS } from "@/lib/hooks/useSimulationWS";
import { cn } from "@/lib/utils";

const AGENCIES = [
  { id: "ALL", name: "All Services" },
  { id: "BEST", name: "BEST (Mumbai)" },
  { id: "TMT", name: "TMT (Thane)" },
  { id: "NMMT", name: "NMMT (Navi Mumbai)" },
  { id: "KDMT", name: "KDMT (Kalyan-Dombivli)" },
  { id: "VVMT", name: "VVMT (Vasai-Virar)" },
  { id: "MBMT", name: "MBMT (Mira-Bhayandar)" },
  { id: "VMMT", name: "VMMT (Vasai)" },
  { id: "KHOPOLI", name: "KHOPOLI (Khopoli)" },
  { id: "UMT", name: "UMT (Ulhasnagar)" },
];

/* ─────────────────────────────────────────────────────────────────────────────
   SAMAVESH TTS ENGINE — Native Web Speech API
   Priority 2 = AI Alert (preempts Navigation)
   Priority 1 = Navigation
───────────────────────────────────────────────────────────────────────────── */
class SamaveshTTS {
  private unlocked = false;
  private muted = false;
  private speaking = false;
  private queue: { text: string; priority: number }[] = [];
  private currentPriority = 1;
  private dedup = new Map<number, { text: string; at: number }>();
  private DEDUP_MS = 8000;
  onStateChange?: (speaking: boolean, text: string, priority: number) => void;

  unlock() {
    if (this.unlocked || typeof window === "undefined") return;
    const u = new SpeechSynthesisUtterance(" ");
    u.volume = 0; u.rate = 16;
    window.speechSynthesis?.speak(u);
    this.unlocked = true;
  }
  setMuted(m: boolean) {
    this.muted = m;
    if (m) { window.speechSynthesis?.cancel(); this.queue = []; this.speaking = false; }
  }
  isUnlocked() { return this.unlocked; }
  isMuted() { return this.muted; }

  speak(text: string, priority: number) {
    if (!this.unlocked || this.muted || !text.trim()) return;
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const last = this.dedup.get(priority);
    if (last && last.text === text && Date.now() - last.at < this.DEDUP_MS) return;

    if (priority === 2) {
      if (this.speaking && this.currentPriority === 1) {
        window.speechSynthesis.cancel(); this.speaking = false;
      }
      this.queue = this.queue.filter(j => j.priority !== 1);
      this.queue.unshift({ text, priority });
    } else {
      const alertActive = (this.speaking && this.currentPriority === 2) ||
        this.queue.some(j => j.priority === 2);
      if (alertActive) return;
      this.queue = this.queue.filter(j => j.priority !== 1);
      this.queue.push({ text, priority });
    }
    this.process();
  }

  private process() {
    if (this.speaking || !this.queue.length) return;
    const job = this.queue.shift()!;
    this.speaking = true;
    this.currentPriority = job.priority;
    this.dedup.set(job.priority, { text: job.text, at: Date.now() });
    this.onStateChange?.(true, job.text, job.priority);
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find(v => v.name === "Rishi") ||
      voices.find(v => v.lang === "en-IN") ||
      voices.find(v => v.lang.startsWith("en-"));
    const utt = new SpeechSynthesisUtterance(job.text);
    utt.lang = "en-IN"; utt.rate = 1.05; utt.volume = 1.0;
    if (voice) utt.voice = voice;
    utt.onend = utt.onerror = () => {
      this.speaking = false;
      this.onStateChange?.(false, "", 0);
      this.process();
    };
    try { window.speechSynthesis.speak(utt); } catch { this.speaking = false; }
  }
  cancel() { window.speechSynthesis?.cancel(); this.queue = []; this.speaking = false; }
}
const tts = typeof window !== "undefined" ? new SamaveshTTS() : null;

/* ─────────────────────────────────────────────────────────────────────────────
   SoundWave Component
───────────────────────────────────────────────────────────────────────────── */
function SoundWave({ color, size = "sm" }: { color: string; size?: "sm" | "md" }) {
  const h = size === "md" ? 22 : 16;
  return (
    <span className="flex items-center" style={{ gap: 2, height: h }}>
      {[0.4, 0.8, 1, 0.8, 0.4].map((s, i) => (
        <span key={i} style={{
          display: "inline-block", width: size === "md" ? 4 : 3,
          height: s * h, background: color, borderRadius: 2,
          animation: `samWave 0.7s ${i * 0.1}s ease-in-out infinite alternate`,
        }} />
      ))}
      <style>{`@keyframes samWave{from{transform:scaleY(.3)}to{transform:scaleY(1.2)}}`}</style>
    </span>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   ETA Live Countdown
───────────────────────────────────────────────────────────────────────────── */
function ETACountdown({ seconds }: { seconds: number }) {
  const [s, setS] = useState(seconds);
  useEffect(() => { setS(seconds); }, [seconds]);
  useEffect(() => {
    if (s <= 0) return;
    const t = setInterval(() => setS(v => Math.max(0, v - 1)), 1000);
    return () => clearInterval(t);
  }, [seconds]);
  const m = Math.floor(s / 60);
  return <span style={{ fontVariantNumeric: "tabular-nums" }}>{m > 0 ? `${m}m ${s % 60}s` : `${s}s`}</span>;
}

/* ─────────────────────────────────────────────────────────────────────────────
   Fallback buses & turn arrows
───────────────────────────────────────────────────────────────────────────── */
const FALLBACK_BUSES = [
  { id: "BUS-101", bus_id: "BUS-101", route_number: "312", operator: "BEST", current_stop: "Dadar TT Depot", next_stop: "Sion Circle", occupancy: 48, delay: 180, status: "RUNNING" },
  { id: "BUS-102", bus_id: "BUS-102", route_number: "C-40", operator: "BEST", current_stop: "Sion Circle", next_stop: "Kurla Station", occupancy: 32, delay: 60, status: "AT_STOP" },
  { id: "BUS-201", bus_id: "BUS-201", route_number: "9", operator: "BEST", current_stop: "CSMT Terminal", next_stop: "World Trade Center", occupancy: 54, delay: 90, status: "RUNNING" },
  { id: "BUS-301", bus_id: "BUS-301", route_number: "1", operator: "TMT", current_stop: "Thane Station", next_stop: "Vrindavan Society", occupancy: 28, delay: 30, status: "RUNNING" },
];

const TURN_ARROWS: Record<string, string> = {
  straight: "↑", slight_left: "↖", left: "←", sharp_left: "↙",
  slight_right: "↗", right: "→", sharp_right: "↘",
};

/* ─────────────────────────────────────────────────────────────────────────────
   StatCard Component
───────────────────────────────────────────────────────────────────────────── */
function StatCard({
  icon, label, value, sub, color = "#9A0002", bar, barPct, barColor,
}: {
  icon: React.ReactNode; label: string; value: React.ReactNode;
  sub?: string; color?: string; bar?: boolean; barPct?: number; barColor?: string;
}) {
  return (
    <div className="bg-[#F7EFE7] border border-[#DECFC2] border-l-4 rounded-2xl p-3.5 shadow-sm flex flex-col gap-1 min-w-0"
      style={{ borderLeftColor: "#9A0002" }}>
      <div className="w-7 h-7 rounded-xl flex items-center justify-center text-[#9A0002] bg-red-100/60 shrink-0">
        {icon}
      </div>
      <div className="text-lg font-black text-slate-900 truncate" style={{ color: color === "inherit" ? undefined : color }}>
        {value}
      </div>
      <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{label}</div>
      {sub && <div className="text-[10px] text-slate-500 font-medium">{sub}</div>}
      {bar && typeof barPct === "number" && (
        <div className="h-1.5 bg-[#E6DBD0] rounded-full mt-1">
          <div className="h-full rounded-full transition-all" style={{ width: `${barPct}%`, background: barColor || "#9A0002" }} />
        </div>
      )}
    </div>
  );
}

function getBusOperator(b: any): string {
  const routeId = String(b.route_id || b.bus_id || b.id || "").toUpperCase();
  const op = String(b.operator || "").toUpperCase();

  if (routeId.startsWith("NMMT")) return "NMMT";
  if (routeId.startsWith("TMT")) return "TMT";
  if (routeId.startsWith("KDMT")) return "KDMT";
  if (routeId.startsWith("VVMT") || routeId.startsWith("VMMT")) return "VVMT";
  if (routeId.startsWith("MBMT")) return "MBMT";
  if (routeId.startsWith("KHOPOLI")) return "KHOPOLI";
  if (routeId.startsWith("UMT")) return "UMT";
  if (routeId.startsWith("BEST")) return "BEST";
  if (op && op !== "BEST") return op;
  return "BEST";
}

function getCleanRouteNumber(b: any): string {
  const rawRn = String(b.route_number || "").trim();
  if (rawRn && rawRn !== "null" && !rawRn.startsWith("BEST_R") && !rawRn.startsWith("TMT_R") && !rawRn.startsWith("NMMT_")) {
    return rawRn;
  }
  const rid = String(b.route_id || b.bus_id || b.id || "");
  const match = rid.match(/(?:BEST|TMT|NMMT|KDMT|VVMT|MBMT|UMT|KHOPOLI)[_-]?(?:R)?(\d+[A-Z]*)/i);
  if (match && match[1]) {
    const num = match[1].replace(/^0+/, "");
    return num || match[1];
  }
  return rawRn && rawRn !== "null" ? rawRn : "—";
}

/* ─────────────────────────────────────────────────────────────────────────────
   BUS SELECTION SCREEN
───────────────────────────────────────────────────────────────────────────── */
function BusSelectionScreen({
  driverName, activeBuses, connected, onSelect,
}: {
  driverName: string; activeBuses: any[]; connected: boolean; onSelect: (id: string) => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAgency, setSelectedAgency] = useState("ALL");

  const filteredBuses = activeBuses.filter((b: any) => {
    const operator = getBusOperator(b);
    if (selectedAgency !== "ALL") {
      if (selectedAgency === "VMMT" || selectedAgency === "VVMT") {
        if (operator !== "VMMT" && operator !== "VVMT") return false;
      } else if (operator !== selectedAgency) {
        return false;
      }
    }

    if (!searchQuery.trim()) return true;

    const q = searchQuery.toLowerCase().trim();
    const routeNum = getCleanRouteNumber(b).toLowerCase();
    const rawRouteNumber = String(b.route_number || "").toLowerCase();
    const routeId = String(b.route_id || "").toLowerCase();
    const busId = String(b.bus_id || b.id || "").toLowerCase();
    const currStop = String(b.current_stop || "").toLowerCase();
    const nextStop = String(b.next_stop || "").toLowerCase();

    // 1. Explicit Bus ID Search (e.g. user typed "bus_00714" or "00714")
    const isBusIdSearch = q.startsWith("bus") || (q.length >= 4 && /^\d+$/.test(q));
    if (isBusIdSearch && busId.includes(q)) {
      return true;
    }

    // 2. Route Number Match (Exact match or prefix match on route number)
    const matchesRoute =
      routeNum === q ||
      routeNum.startsWith(q) ||
      rawRouteNumber === q ||
      rawRouteNumber.startsWith(q) ||
      routeId.includes(`_${q}_`) ||
      routeId.endsWith(`_${q}`) ||
      routeId.includes(`-${q}-`) ||
      routeId.endsWith(`-${q}`);

    if (matchesRoute) return true;

    // 3. Stop Name / ID Match
    if (currStop.includes(q) || nextStop.includes(q)) return true;

    // 4. Operator Match
    if (operator.toLowerCase().includes(q)) return true;

    return false;
  });

  return (
    <div className="min-h-screen bg-[#EFE6DE] p-4 lg:p-8">
      <div className="max-w-2xl mx-auto space-y-5">
        <div className="text-center pt-4 pb-1 space-y-2">
          <div className="w-16 h-16 rounded-3xl bg-[#F7EFE7] shadow-lg border border-[#DECFC2] mx-auto flex items-center justify-center">
            <img src="/logo.png" alt="SAMAVESH" className="w-12 h-12 object-contain" />
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-slate-900">
              Welcome, {driverName}
            </h1>
            <p className="text-xs lg:text-sm text-slate-500 font-medium mt-0.5">
              Select your assigned bus to start real-time navigation
            </p>
          </div>
        </div>

        {/* Live Simulation Feed Badge */}
        <div className="flex items-center justify-between px-4 py-3 rounded-2xl bg-[#E6DBD0]/60 border border-[#DECFC2]">
          <span className="flex items-center gap-2 text-xs font-black text-slate-800">
            <Radio size={14} className="text-[#9A0002] animate-pulse" /> Live Simulation Feed
          </span>
          <span className={cn(
            "text-[11px] font-black px-3 py-1 rounded-full text-white shadow-sm flex items-center gap-1.5",
            connected ? "bg-[#9A0002]" : "bg-slate-400"
          )}>
            <span className="w-2 h-2 rounded-full bg-white animate-ping" />
            {connected ? `${activeBuses.length} Active Buses` : "Connecting…"}
          </span>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Route (e.g. 58, 9, 312, 103), Bus ID (e.g. BUS_00714)..."
            className="w-full pl-11 pr-10 py-3 text-xs lg:text-sm font-medium bg-[#F7EFE7] border border-[#DECFC2] rounded-2xl focus:outline-none focus:border-[#9A0002] focus:ring-2 focus:ring-red-100 shadow-sm text-slate-900 placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-700"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Transit Service Agency Filter Tabs */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#9A0002] flex items-center gap-1">
              <Filter size={10} /> Transit Service Filter
            </span>
            <span className="text-[10px] font-bold text-slate-500">
              Showing {filteredBuses.length} of {activeBuses.length}
            </span>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
            {AGENCIES.map((ag) => {
              const active = selectedAgency === ag.id;
              return (
                <button
                  key={ag.id}
                  onClick={() => setSelectedAgency(ag.id)}
                  className={cn(
                    "text-[10px] font-bold px-3 py-1.5 rounded-xl border transition-all shrink-0",
                    active
                      ? "bg-[#9A0002] text-white border-[#9A0002] shadow-sm font-black"
                      : "bg-[#F7EFE7] text-slate-600 border-[#DECFC2] hover:bg-[#E6DBD0]"
                  )}
                >
                  {ag.id === "ALL" ? "All Services" : ag.id}
                </button>
              );
            })}
          </div>
        </div>

        {/* Bus List */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#9A0002]">
              Select Your Assigned Bus ({filteredBuses.length})
            </span>
            <span className="text-[9px] font-bold text-slate-500 flex items-center gap-1">
              <MapPin size={9} /> Nearest First
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredBuses.map((b: any, i: number) => {
              const bc = String(b.bus_id || b.id).replace(/null/gi, "");
              const rn = getCleanRouteNumber(b);
              const op = getBusOperator(b);

              return (
                <button key={bc} onClick={() => onSelect(bc)}
                  className={cn(
                    "w-full text-left p-4 rounded-3xl bg-[#F7EFE7] border shadow-sm hover:shadow-lg active:scale-[0.98] transition-all flex items-center justify-between border-l-4 border-l-[#9A0002] group",
                    i === 0 && !searchQuery && selectedAgency === "ALL" ? "border-[#9A0002] ring-2 ring-red-100" : "border-[#DECFC2]"
                  )}>
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-12 h-12 rounded-2xl bg-[#9A0002] text-white flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform">
                      <Bus size={20} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-sm font-black text-slate-900 truncate">{bc}</span>
                        <span className="px-2 py-0.5 rounded bg-red-100/60 text-[9px] font-bold text-[#9A0002] border border-red-200">
                          Route {rn}
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-slate-200/80 text-[8px] font-bold text-slate-700 uppercase font-mono">
                          {op}
                        </span>
                        {i === 0 && !searchQuery && selectedAgency === "ALL" && (
                          <span className="px-1.5 py-0.5 rounded bg-[#9A0002] text-[8px] font-black text-white uppercase">Nearest</span>
                        )}
                        {b.bunching_alert && (
                          <span className="px-1.5 py-0.5 rounded bg-red-100 text-[8px] font-black text-red-700 flex items-center gap-1">
                            <AlertTriangle size={8} /> Bunching
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-600 font-medium mt-1 truncate">
                        {b.current_stop || "Depot"} → {b.next_stop || "Terminal"}
                      </p>
                      <p className="text-[10px] text-slate-500 font-bold mt-0.5 flex items-center gap-1">
                        <MapPin size={9} className="text-[#9A0002]" /> {b.distanceKm} km away
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <span className="text-sm font-black text-[#9A0002]">{b.occupancy ?? 0}</span>
                    <span className="text-[9px] text-slate-500 block">pass</span>
                    <ArrowRight size={13} className="text-[#9A0002] ml-auto mt-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              );
            })}

            {filteredBuses.length === 0 && (
              <div className="col-span-full text-center py-10 px-4 bg-[#F7EFE7] rounded-3xl border border-[#DECFC2] space-y-2">
                <Bus size={32} className="mx-auto text-slate-400" />
                <h3 className="text-sm font-black text-slate-800">No buses match filter</h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Try clearing your search query or selecting "All Services".
                </p>
                <button
                  onClick={() => { setSearchQuery(""); setSelectedAgency("ALL"); }}
                  className="mt-2 px-4 py-1.5 rounded-xl bg-[#9A0002] text-white text-xs font-black"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function getRealStopName(stopStr: string | null | undefined, stopsMap: Record<string, string>): string {
  if (!stopStr || stopStr === "null" || stopStr === "—") return "Depot";
  let raw = String(stopStr).trim();

  // 1. Direct match in stopsMap
  if (stopsMap[raw]) return stopsMap[raw];

  // 2. Extracted numeric ID match e.g. "37547" or "STOP_37547" or "Stop 37547"
  const digits = raw.replace(/\D/g, "");
  if (digits) {
    if (stopsMap[digits]) return stopsMap[digits];
    if (stopsMap[`BEST_${digits}`]) return stopsMap[`BEST_${digits}`];
    if (stopsMap[`TMT_${digits}`]) return stopsMap[`TMT_${digits}`];
    if (stopsMap[`NMMT_${digits}`]) return stopsMap[`NMMT_${digits}`];
    if (stopsMap[`KDMT_${digits}`]) return stopsMap[`KDMT_${digits}`];
    if (stopsMap[`VVMT_${digits}`]) return stopsMap[`VVMT_${digits}`];
    if (stopsMap[`STOP_${digits}`]) return stopsMap[`STOP_${digits}`];
  }

  // 3. String contains a clean name after dash or colon
  if (raw.includes(" - ")) return raw.split(" - ")[1].trim();
  if (raw.includes(": ")) return raw.split(": ")[1].trim();

  // 4. If string is already a real human name, return it
  if (!/^(?:BEST|TMT|NMMT|KDMT|VVMT|MBMT|UMT|KHOPOLI|STOP)[_\-\d\s]+$/i.test(raw)) {
    return raw;
  }

  return digits ? `Stop #${digits}` : raw;
}

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN DRIVER HOME PAGE
───────────────────────────────────────────────────────────────────────────── */
export default function DriverHomePage() {
  const [driverName, setDriverName] = useState("Rajesh Kamble");
  const [selectedBusId, setSelectedBusId] = useState<string | null>(null);
  const [driverLocation, setDriverLocation] = useState({ lat: 19.0178, lon: 72.8478 });
  const [stopsMap, setStopsMap] = useState<Record<string, string>>({});

  // Fetch full stop dictionary from simulation backend
  useEffect(() => {
    fetch("http://localhost:8000/stops")
      .then(res => res.json())
      .then((stopsList: any[]) => {
        if (Array.isArray(stopsList)) {
          const map: Record<string, string> = {};
          for (const s of stopsList) {
            if (s.stop_id && s.name) {
              map[s.stop_id] = s.name;
              const digits = String(s.stop_id).replace(/\D/g, "");
              if (digits) {
                map[digits] = s.name;
                map[`STOP_${digits}`] = s.name;
              }
            }
          }
          setStopsMap(map);
        }
      })
      .catch(() => {});
  }, []);

  // Explicit View Mode Toggle State ("mobile" | "desktop")
  const [forcedViewMode, setForcedViewMode] = useState<"mobile" | "desktop" | "auto">("auto");

  // TTS state
  const [ttsUnlocked, setTtsUnlocked] = useState(false);
  const [ttsMuted, setTtsMuted] = useState(false);
  const [ttsSpeaking, setTtsSpeaking] = useState(false);
  const [ttsText, setTtsText] = useState("");
  const [ttsPriority, setTtsPriority] = useState(0);

  const lastAlertRef = useRef("");
  const lastNavRef = useRef("");
  const lastStatusRef = useRef("");
  const lastRlSpeechTimeRef = useRef<number>(0);
  const spokenMilestonesRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!tts) return;
    tts.onStateChange = (speaking, text, priority) => {
      setTtsSpeaking(speaking);
      if (speaking) { setTtsText(text); setTtsPriority(priority); }
    };
  }, []);

  const unlockTTS = useCallback(() => {
    if (!tts || ttsUnlocked) return;
    tts.unlock(); setTtsUnlocked(true);
    tts.speak("Samavesh voice guidance activated.", 2);
  }, [ttsUnlocked]);

  const toggleMute = useCallback(() => {
    if (!tts) return;
    const m = !tts.isMuted(); tts.setMuted(m); setTtsMuted(m);
  }, []);

  const testVoice = useCallback(() => {
    if (!tts) return;
    if (!ttsUnlocked) { tts.unlock(); setTtsUnlocked(true); }
    tts.speak("Voice guidance is working. R L model alerts and turn guidance are ready.", 2);
  }, [ttsUnlocked]);

  const { buses, connected } = useSimulationWS();

  useEffect(() => {
    if (typeof window !== "undefined" && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        p => setDriverLocation({ lat: p.coords.latitude, lon: p.coords.longitude }),
        () => {}, { timeout: 5000 }
      );
    }
  }, []);

  useEffect(() => {
    try {
      const u = localStorage.getItem("samavesh_user");
      if (u) { const p = JSON.parse(u); if (p.name) setDriverName(p.name); }
      const sb = localStorage.getItem("samavesh_driver_bus");
      if (sb) setSelectedBusId(sb);
      const vm = localStorage.getItem("samavesh_driver_viewmode");
      if (vm === "mobile" || vm === "desktop") setForcedViewMode(vm);
    } catch {}
  }, []);

  const toggleViewMode = () => {
    const next = forcedViewMode === "mobile" ? "desktop" : "mobile";
    setForcedViewMode(next);
    try { localStorage.setItem("samavesh_driver_viewmode", next); } catch {}
  };

  const distKm = (bLat?: number, bLon?: number) => {
    if (!bLat || !bLon) return 0.8;
    const dLat = ((bLat - driverLocation.lat) * Math.PI) / 180;
    const dLon = ((bLon - driverLocation.lon) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) ** 2 +
      Math.cos(driverLocation.lat * Math.PI / 180) * Math.cos(bLat * Math.PI / 180) *
      Math.sin(dLon / 2) ** 2;
    return parseFloat((6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1));
  };

  const rawBuses = buses.length > 0 ? buses : FALLBACK_BUSES;
  const activeBuses = rawBuses
    .filter((b: any) => b.status !== "FINISHED")
    .map((b: any) => ({ ...b, distanceKm: distKm(b.lat, b.lon) }))
    .sort((a: any, b: any) => a.distanceKm - b.distanceKm);

  const activeBus: any = activeBuses.find((b: any) => (b.bus_id || b.id) === selectedBusId) || null;

  const handleSelectBus = (busId: string) => {
    setSelectedBusId(busId);
    if (tts && !ttsUnlocked) {
      tts.unlock();
      setTtsUnlocked(true);
    }
    lastAlertRef.current = ""; lastNavRef.current = ""; lastStatusRef.current = "";
    lastRlSpeechTimeRef.current = 0; spokenMilestonesRef.current.clear();
    try { localStorage.setItem("samavesh_driver_bus", busId); } catch {}

    const selectedBusObj = activeBuses.find((b: any) => (b.bus_id || b.id) === busId);
    const spd = selectedBusObj ? Math.round(selectedBusObj.speed || 20) : 20;
    setTimeout(() => {
      tts?.speak(`Navigation started. Maintain speed of ${spd || 20} kilometers per hour.`, 2);
    }, 400);
  };

  // Derived telemetry
  const cleanRoute = getCleanRouteNumber(activeBus || {});
  const cleanBus = String(selectedBusId || "—").replace(/null/gi, "");
  const currentSpeed = activeBus ? Math.round(activeBus.speed || 20) : 20;
  const occupancy = activeBus?.occupancy ?? 0;
  const capacity = activeBus?.capacity || 70;
  const occPct = Math.min(100, Math.round((occupancy / capacity) * 100));
  const occColor = occPct > 85 ? "#dc2626" : occPct > 60 ? "#d97706" : "#16a34a";
  const headwayGap = activeBus?.headway_gap ?? 0;
  const headwayStr = `${Math.floor(headwayGap / 60)}m ${headwayGap % 60}s`;
  const headwayColor = headwayGap > 600 ? "#dc2626" : headwayGap > 300 ? "#d97706" : "#16a34a";
  const isBunched = activeBus?.bunching_alert || false;
  const rlAction = activeBus?.rl_action ?? "NONE";
  const rlLabel = activeBus?.rl_action_label ?? "No Intervention";
  const rlReason = activeBus?.rl_action_reason ?? "";
  const isActionRequired = rlAction !== "NONE" || isBunched;
  const currentStop = getRealStopName(activeBus?.current_stop, stopsMap);
  const nextStop = getRealStopName(activeBus?.next_stop, stopsMap);
  const distMeters = Math.round(activeBus?.distance_to_next_stop || 350);
  const etaSec = activeBus?.next_stop_eta ?? Math.round(distMeters / 6.5);
  const etaStr = etaSec >= 60 ? `${Math.ceil(etaSec / 60)} min` : `${etaSec} sec`;
  const distStr = distMeters >= 1000 ? `${(distMeters / 1000).toFixed(1)} km` : `${distMeters}m`;
  const upcomingTurn = activeBus?.upcoming_turn || "straight";
  const turnArrow = TURN_ARROWS[upcomingTurn] ?? "↑";
  const turnInstruction = activeBus?.turn_instruction ||
    (distMeters < 150 ? `Pull into ${nextStop} Bus Bay`
      : distMeters < 350 ? `Turn Left toward ${nextStop}`
        : `Continue straight toward ${nextStop}`);

  let dispatchTitle = `MAINTAIN CRUISE — ${currentSpeed} KM/H`;
  let dispatchDesc = `Headway spacing is optimal. Proceed along Route ${cleanRoute} schedule.`;
  if (rlAction !== "NONE") {
    dispatchTitle = rlLabel.toUpperCase();
    dispatchDesc = rlReason || `RL model decision for ${cleanBus}.`;
  } else if (isBunched) {
    dispatchTitle = "BUNCHING DETECTED — HOLD AT NEXT STOP";
    dispatchDesc = `Another bus on Route ${cleanRoute} is too close. Hold at ${nextStop} to restore spacing.`;
  }

  // Reset spoken distance milestones when nextStop changes
  useEffect(() => {
    spokenMilestonesRef.current.clear();
  }, [nextStop]);

  // Periodic 12-second Voice Announcements (Concise direct alerts & halt timers)
  useEffect(() => {
    if (!tts || !activeBus) return;

    if (!ttsUnlocked) {
      tts.unlock();
      setTtsUnlocked(true);
    }

    const interval = setInterval(() => {
      const now = Date.now();
      if (now - lastRlSpeechTimeRef.current >= 12000) {
        lastRlSpeechTimeRef.current = now;
        let rlMessage = "";

        const holdTime = activeBus?.hold_time_remaining || activeBus?.dwell_time_remaining || 0;
        if (holdTime > 0) {
          rlMessage = `Halt at next stop for ${holdTime} seconds.`;
        } else if (rlAction !== "NONE") {
          const p: Record<string, string> = {
            HOLD_10s: "Halt at next stop for 10 seconds.",
            HOLD_20s: "Halt at next stop for 20 seconds.",
            HOLD_30s: "Halt at next stop for 30 seconds.",
            SPEED_UP_5: "Increase speed by 5 percent.",
            SPEED_UP_10: "Increase speed by 10 percent.",
            SLOW_DOWN_5: "Reduce speed by 5 percent.",
            SLOW_DOWN_10: "Reduce speed by 10 percent.",
          };
          rlMessage = p[rlAction] || `${rlLabel}.`;
        } else if (isBunched) {
          rlMessage = "Bus bunching detected. Halt at next stop.";
        } else {
          const spd = currentSpeed > 0 ? currentSpeed : 20;
          rlMessage = `Maintain speed of ${spd} kilometers per hour.`;
        }

        tts.speak(rlMessage, 2);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activeBus, rlAction, isBunched, currentSpeed, rlLabel, ttsUnlocked, ttsMuted]);

  // Google-Maps-Style Progressive Turn & Distance Announcements (200m, 100m, 50m, arrival)
  useEffect(() => {
    if (!tts || !ttsUnlocked || ttsMuted || !activeBus) return;

    // Dwell / Arrival at Stop Speech
    const statusKey = `${activeBus.status}_${currentStop}`;
    if (statusKey !== lastStatusRef.current && ["AT_STOP", "HOLDING", "BOARDING"].includes(activeBus.status || "")) {
      lastStatusRef.current = statusKey;
      tts.speak(`Now arriving at ${currentStop}.`, 1);
      return;
    }

    const dirMap: Record<string, string> = {
      left: "take a left",
      slight_left: "take a slight left",
      sharp_left: "take a sharp left",
      right: "take a right",
      slight_right: "take a slight right",
      sharp_right: "take a sharp right",
      straight: "continue straight",
    };
    const turnPhrase = dirMap[upcomingTurn] || "continue straight";

    // Progressive announcements: 200m, 100m, 50m, 20m / arrival
    if (distMeters > 170 && distMeters <= 230 && !spokenMilestonesRef.current.has("200m")) {
      spokenMilestonesRef.current.add("200m");
      if (upcomingTurn !== "straight") {
        tts.speak(`In 200 meters, ${turnPhrase} towards ${nextStop}.`, 1);
      } else {
        tts.speak(`In 200 meters, prepare to stop at ${nextStop}.`, 1);
      }
    } else if (distMeters > 80 && distMeters <= 130 && !spokenMilestonesRef.current.has("100m")) {
      spokenMilestonesRef.current.add("100m");
      tts.speak(`In 100 meters, ${turnPhrase}.`, 1);
    } else if (distMeters > 35 && distMeters <= 65 && !spokenMilestonesRef.current.has("50m")) {
      spokenMilestonesRef.current.add("50m");
      tts.speak(`In 50 meters, ${turnPhrase}.`, 1);
    } else if (distMeters <= 20 && !spokenMilestonesRef.current.has("now")) {
      spokenMilestonesRef.current.add("now");
      if (upcomingTurn !== "straight") {
        tts.speak(`${turnPhrase} now, arriving at ${nextStop}.`, 1);
      } else {
        tts.speak(`Arriving at ${nextStop}.`, 1);
      }
    }
  }, [activeBus, distMeters, upcomingTurn, nextStop, currentStop, ttsUnlocked, ttsMuted]);

  useEffect(() => () => { tts?.cancel(); }, []);

  const isAlertTalking = ttsSpeaking && ttsPriority === 2;
  const isNavTalking = ttsSpeaking && ttsPriority === 1;

  if (!selectedBusId) {
    return (
      <BusSelectionScreen
        driverName={driverName}
        activeBuses={activeBuses}
        connected={connected}
        onSelect={handleSelectBus}
      />
    );
  }

  // Determine actual active view mode
  const showMobileView = forcedViewMode === "mobile";
  const showDesktopView = forcedViewMode === "desktop";

  return (
    <div className="bg-[#EFE6DE] min-h-screen lg:h-screen lg:overflow-hidden font-sans flex flex-col">

      {/* ───────────────────────────────────────────────────────────────────────
          MOBILE VIEW (Rendered when mobile OR when user manually toggles "mobile" mode)
         ─────────────────────────────────────────────────────────────────────── */}
      <div className={cn(
        "flex-col flex-1",
        showMobileView ? "flex" : showDesktopView ? "hidden" : "flex lg:hidden"
      )}>
        {/* Mobile Header */}
        <div className="bg-gradient-to-b from-[#7a0001] via-[#8C081D] to-[#9A0002] px-4 pt-8 pb-4 shadow-xl text-white">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white p-1 shadow-md flex items-center justify-center shrink-0">
                <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <span className="text-[9px] font-black uppercase tracking-widest text-white/60 block">Active Duty</span>
                <h2 className="text-xs font-black text-white leading-tight">
                  {cleanBus} · Route {cleanRoute}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* SOS Emergency Button */}
              <button
                onClick={() => {}}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-600 border border-white/50 text-white font-black text-[9px] tracking-wider animate-pulse shadow-md active:scale-95 transition-all"
                title="Emergency SOS Alert"
              >
                <AlertTriangle size={11} className="text-yellow-300" />
                <span>SOS</span>
              </button>

              {/* Toggle to Desktop Web Google Maps View */}
              <button
                onClick={toggleViewMode}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/20 border border-white/40 text-white text-[9px] font-black hover:bg-white/30 transition-all"
                title="Switch to Google Maps Desktop View"
              >
                <Monitor size={11} /> Web Map
              </button>

              <button onClick={testVoice}
                className="px-2 py-1 rounded-full bg-white/15 border border-white/30 text-white text-[9px] font-black">
                <Mic size={11} /> Test
              </button>
              <button onClick={() => { if (!ttsUnlocked) unlockTTS(); toggleMute(); }}
                className="w-7 h-7 rounded-full flex items-center justify-center border bg-white/15 border-white/30 text-white">
                {ttsMuted ? <VolumeX size={13} /> : <Volume2 size={13} />}
              </button>
              <button onClick={() => setSelectedBusId(null)}
                className="w-7 h-7 rounded-full bg-white/15 border border-white/30 flex items-center justify-center text-white">
                <RefreshCw size={12} />
              </button>
            </div>
          </div>

          {/* Mobile Turn Guidance HUD */}
          <div className="bg-white/12 border border-white/25 rounded-2xl p-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white text-[#9A0002] flex items-center justify-center shrink-0 shadow-md text-2xl font-black">
              {turnArrow}
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[8px] font-black uppercase text-white/60 block">Google Maps Guidance</span>
              <h3 className="text-xs font-black text-white truncate">{turnInstruction}</h3>
            </div>
            <div className="text-right shrink-0">
              <span className="text-xs font-black text-white block"><ETACountdown seconds={etaSec} /></span>
              <span className="text-[9px] text-white/70">{distStr}</span>
            </div>
          </div>
        </div>

        {/* Mobile Content Stack */}
        <div className="p-4 space-y-4 pb-28">

          {/* TTS Transcript bar */}
          <div className={cn(
            "flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border text-xs font-medium transition-all",
            isAlertTalking ? "bg-red-50 border-red-200 text-[#9A0002]"
              : isNavTalking ? "bg-blue-50 border-blue-200 text-blue-700"
                : "bg-[#F7EFE7] border-[#DECFC2] text-slate-600"
          )}>
            {ttsSpeaking
              ? <SoundWave color={isAlertTalking ? "#9A0002" : "#2563eb"} />
              : <Volume2 size={13} className="text-slate-400" />}
            <span className="flex-1 truncate italic">
              {ttsSpeaking ? `"${ttsText}"` : ttsUnlocked
                ? "Voice active — announces stops, turns & AI alerts"
                : "Tap 'Activate Voice' to enable audio"}
            </span>
            {!ttsUnlocked && (
              <button onClick={unlockTTS} className="px-2 py-0.5 rounded-lg bg-[#9A0002] text-white font-black text-[9px]">
                Activate
              </button>
            )}
          </div>

          {/* Map Card */}
          <div className="rounded-3xl overflow-hidden border border-[#DECFC2] shadow-md">
            <LiveMap height="240px" selectedBus={selectedBusId || undefined} selectedRoute={cleanRoute} singleBusMode={true} />
          </div>

          {/* AI Decision Card */}
          <div className={cn(
            "rounded-3xl border p-4 shadow-md transition-all",
            isActionRequired
              ? "bg-gradient-to-br from-[#7a0001] to-[#9A0002] border-[#9A0002] text-white"
              : "bg-[#F7EFE7] border-2 border-[#DECFC2] border-l-4 border-l-[#9A0002] text-slate-900"
          )}>
            <div className="flex items-center justify-between mb-2">
              <span className={cn(
                "flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase border",
                isActionRequired ? "bg-white/15 border-white/25 text-white" : "bg-red-100/60 border-red-200 text-[#9A0002]"
              )}>
                <Zap size={10} /> RL Anti-Bunching Decision
              </span>
              {isAlertTalking && <SoundWave color={isActionRequired ? "white" : "#9A0002"} />}
            </div>
            <h3 className="text-sm font-black tracking-tight flex items-center gap-2 mb-1.5">
              {isActionRequired
                ? <><AlertOctagon size={18} className="shrink-0" /> {dispatchTitle}</>
                : <><CheckCircle2 size={18} className="text-[#9A0002] shrink-0" /> <span className="text-[#9A0002]">{dispatchTitle}</span></>
              }
            </h3>
            <p className={cn("text-[11px] leading-relaxed font-medium", isActionRequired ? "text-white/90" : "text-slate-600")}>
              {dispatchDesc}
            </p>
            {isActionRequired && (
              <button onClick={() => { if (!ttsUnlocked) unlockTTS(); tts?.speak(`Hold order acknowledged.`, 2); }}
                className="w-full mt-3 py-2.5 rounded-2xl bg-white text-[#9A0002] font-black text-xs shadow-md">
                <CheckCircle size={14} className="inline mr-1" /> Acknowledge Command
              </button>
            )}
          </div>

          {/* Telemetry Grid */}
          <div className="grid grid-cols-2 gap-3">
            <StatCard icon={<TrendingUp size={15} />} label="Live Speed" value={`${currentSpeed} km/h`} color="inherit" />
            <StatCard icon={<Activity size={15} />} label="Headway Gap" value={headwayStr} color={headwayColor} />
            <StatCard icon={<Users size={15} />} label="Onboard" value={`${occupancy} pass`} color="inherit" bar barPct={occPct} barColor={occColor} sub={`${occPct}% full`} />
            <StatCard icon={<Clock size={15} />} label="ETA to Next" value={<ETACountdown seconds={etaSec} />} color="#9A0002" />
          </div>

          {/* Stop Progress Strip */}
          <div className="bg-[#F7EFE7] border border-[#DECFC2] rounded-3xl p-4 shadow-sm border-l-4 border-l-[#9A0002]">
            <span className="text-[9px] font-black uppercase tracking-widest text-[#9A0002] flex items-center gap-1.5 mb-3">
              <MapPin size={10} /> Stop Progress
            </span>
            <div className="flex items-center gap-3">
              <div className="text-center shrink-0 max-w-[65px]">
                <div className="w-8 h-8 rounded-xl bg-[#9A0002] text-white flex items-center justify-center text-lg font-black mx-auto">•</div>
                <span className="text-[8px] font-bold text-[#9A0002] mt-1 block truncate">{currentStop}</span>
              </div>
              <div className="flex-1 relative h-2 bg-red-100 rounded-full">
                <div className="absolute inset-y-0 left-0 w-1/2 bg-[#9A0002] rounded-full" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-[#9A0002] rounded-full border-2 border-white shadow" />
              </div>
              <div className="text-center shrink-0 max-w-[65px]">
                <div className="w-8 h-8 rounded-xl bg-red-100/60 text-[#9A0002] border border-red-200 flex items-center justify-center text-lg font-black mx-auto">○</div>
                <span className="text-[8px] font-bold text-slate-500 mt-1 block truncate">{nextStop}</span>
              </div>
            </div>
            <div className="flex justify-between mt-2 text-[9px] font-bold text-slate-500">
              <span>Current</span>
              <span className="text-[#9A0002]">{distStr} · {etaStr}</span>
              <span>Next</span>
            </div>
          </div>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────────────────
          DESKTOP WEB GOOGLE MAPS VIEW (Rendered on lg: screens or forced "desktop" mode)
         ─────────────────────────────────────────────────────────────────────── */}
      <div className={cn(
        "flex-1 flex-row overflow-hidden relative",
        showDesktopView ? "flex" : showMobileView ? "hidden" : "hidden lg:flex"
      )}>

        {/* Main Canvas: Expansive Interactive Live Map */}
        <div className="flex-1 flex flex-col relative h-full overflow-hidden bg-slate-900">
          <div className="absolute inset-0 w-full h-full">
            <LiveMap height="100%" selectedBus={selectedBusId || undefined} selectedRoute={cleanRoute} singleBusMode={true} />
          </div>

          {/* Top Floating Badge on Map */}
          <div className="absolute top-5 left-5 z-[400] flex items-center gap-3">
            <div className="flex items-center gap-2 bg-[#F7EFE7]/95 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-[#DECFC2] shadow-lg text-slate-900">
              <div className="w-3 h-3 rounded-full bg-[#9A0002] animate-pulse" />
              <span className="text-xs font-black uppercase tracking-wider text-[#9A0002]">
                Route {cleanRoute}
              </span>
              <span className="text-slate-400 font-bold">|</span>
              <span className="text-xs font-black text-slate-800">{cleanBus}</span>
              <span className="text-[10px] font-bold text-slate-500 ml-1">({activeBus?.operator ?? "BEST"})</span>
            </div>

            {/* Toggle Button on Top Left Badge */}
            <button
              onClick={toggleViewMode}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-2xl bg-[#F7EFE7]/95 backdrop-blur-md border border-[#DECFC2] text-slate-800 font-black text-xs shadow-lg hover:bg-red-50 hover:text-[#9A0002] transition-all"
            >
              <Smartphone size={14} className="text-[#9A0002]" />
              <span>Mobile View</span>
            </button>
          </div>

          {/* Floating Bottom Navigation Overlay Bar */}
          <div className="absolute bottom-5 left-5 right-5 z-[400] max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-[#7a0001] via-[#8C081D] to-[#9A0002] p-4 rounded-3xl shadow-2xl border border-white/20 text-white backdrop-blur-lg">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <div className="w-14 h-14 rounded-2xl bg-white text-[#9A0002] flex items-center justify-center shrink-0 shadow-lg text-3xl font-black">
                    {turnArrow}
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[9px] font-black uppercase tracking-widest text-white/70 flex items-center gap-1.5 mb-0.5">
                      <Navigation size={11} />
                      {isNavTalking ? <><SoundWave color="rgba(255,255,255,0.8)" /> Voice Guidance Active</> : "Google Maps Live Turn Guidance"}
                    </span>
                    <h3 className="text-base font-black text-white leading-snug truncate">
                      {turnInstruction}
                    </h3>
                  </div>
                </div>

                <div className="text-right px-4 border-r border-white/20 shrink-0">
                  <span className="text-xl font-black text-white block"><ETACountdown seconds={etaSec} /></span>
                  <span className="text-xs font-bold text-white/80">{distStr} remaining</span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Desktop SOS Emergency Button */}
                  <button
                    onClick={() => {}}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-600 border border-white/50 text-white text-xs font-black tracking-wider animate-pulse hover:bg-red-700 active:scale-95 transition-all shadow-md"
                    title="Emergency SOS Alert"
                  >
                    <AlertTriangle size={15} className="text-yellow-300" />
                    <span>SOS</span>
                  </button>

                  {ttsSpeaking && (
                    <div className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase",
                      isAlertTalking ? "bg-white/20 border-white/40 text-white" : "bg-white/10 border-white/25 text-white/90"
                    )}>
                      <SoundWave color="white" size="md" />
                      <span>{isAlertTalking ? "AI ALERT" : "NAV"}</span>
                    </div>
                  )}

                  <button onClick={testVoice}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/15 border border-white/30 text-white text-xs font-black hover:bg-white/25 active:scale-95 transition-all shadow-sm">
                    <Mic size={14} /> Test Voice
                  </button>

                  <button onClick={() => { if (!ttsUnlocked) unlockTTS(); toggleMute(); }}
                    className={cn("w-10 h-10 rounded-xl flex items-center justify-center border transition-all active:scale-95 shadow-sm",
                      ttsMuted ? "bg-red-900/60 border-red-400/40 text-red-200" : "bg-white/15 border-white/30 text-white")}>
                    {ttsMuted ? <VolumeX size={17} /> : <Volume2 size={17} />}
                  </button>

                  <button onClick={() => setSelectedBusId(null)}
                    className="w-10 h-10 rounded-xl bg-white/15 border border-white/30 flex items-center justify-center text-white hover:bg-white/25 active:scale-95 transition-all shadow-sm"
                    title="Switch Bus">
                    <RefreshCw size={16} />
                  </button>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-white/15 flex items-center gap-2.5 text-xs text-white/90">
                <Volume2 size={13} className="text-white/70 shrink-0" />
                <span className="flex-1 truncate italic font-medium">
                  {ttsSpeaking ? `"${ttsText}"` : ttsUnlocked
                    ? "Voice guidance active — announcing turns, stop arrivals & RL commands"
                    : "Tap 'Activate Voice' to enable audio output"}
                </span>
                {!ttsUnlocked && (
                  <button onClick={unlockTTS} className="px-3 py-1 rounded-lg bg-white text-[#9A0002] font-black text-[10px] hover:bg-red-50">
                    🔊 Activate Voice
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Fixed Width Right Telemetry Sidebar Panel */}
        <div className="w-full lg:w-[420px] h-full overflow-y-auto bg-[#EFE6DE] border-l border-[#DECFC2] p-4 lg:p-6 space-y-5 shrink-0 shadow-lg">

          <div className="flex items-center justify-between pb-4 border-b border-[#DECFC2]/60">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#9A0002] text-white flex items-center justify-center shadow-md font-black">
                <Bus size={20} />
              </div>
              <div>
                <span className="text-[9px] font-black uppercase tracking-widest text-[#9A0002] block">Vehicle Duty</span>
                <h2 className="text-base font-black text-slate-900">{cleanBus} · Route {cleanRoute}</h2>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {}}
                className="px-3 py-1.5 rounded-xl bg-red-600 text-white font-black text-xs animate-pulse flex items-center gap-1 shadow-sm active:scale-95 transition-all"
                title="Emergency SOS Alert"
              >
                <AlertTriangle size={13} className="text-yellow-300" /> SOS
              </button>
              <button onClick={() => setSelectedBusId(null)} className="text-xs font-bold text-[#9A0002] hover:underline flex items-center gap-1">
                <RefreshCw size={12} /> Switch
              </button>
            </div>
          </div>

          {/* RL Anti-Bunching Card */}
          <div className={cn(
            "rounded-3xl border p-4 lg:p-5 shadow-md transition-all",
            isActionRequired
              ? "bg-gradient-to-br from-[#7a0001] to-[#9A0002] border-[#9A0002] text-white"
              : "bg-[#F7EFE7] border-2 border-[#DECFC2] border-l-4 border-l-[#9A0002] text-slate-900"
          )}>
            <div className="flex items-center justify-between mb-2">
              <span className={cn(
                "flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase border",
                isActionRequired ? "bg-white/15 border-white/25 text-white" : "bg-red-100/60 border-red-200 text-[#9A0002]"
              )}>
                <Zap size={10} /> RL Anti-Bunching Model
              </span>
              {isAlertTalking && <SoundWave color={isActionRequired ? "white" : "#9A0002"} />}
            </div>
            <h3 className="text-sm lg:text-base font-black tracking-tight flex items-center gap-2 my-2">
              {isActionRequired
                ? <><AlertOctagon size={18} className="shrink-0 text-white" /><span className="text-white">{dispatchTitle}</span></>
                : <><CheckCircle2 size={18} className="text-[#9A0002] shrink-0" /><span className="text-[#9A0002]">{dispatchTitle}</span></>
              }
            </h3>
            <p className={cn("text-[11px] leading-relaxed font-medium", isActionRequired ? "text-white/90" : "text-slate-600")}>
              {dispatchDesc}
            </p>
            {isActionRequired && (
              <button onClick={() => { if (!ttsUnlocked) unlockTTS(); tts?.speak(`Hold order acknowledged.`, 2); }}
                className="w-full mt-3 py-2.5 rounded-2xl bg-white text-[#9A0002] font-black text-xs shadow-md hover:bg-red-50">
                <CheckCircle size={14} className="inline mr-1" /> Acknowledge Command
              </button>
            )}
          </div>

          {/* Bunching Alert Banner */}
          {isBunched && (
            <div className="flex items-center gap-3 bg-red-100/60 border-2 border-[#9A0002] rounded-3xl p-4 shadow-md">
              <div className="w-10 h-10 rounded-2xl bg-[#9A0002] text-white flex items-center justify-center shrink-0">
                <AlertTriangle size={18} />
              </div>
              <div>
                <span className="text-xs font-black text-[#9A0002] block">BUNCHING ALERT</span>
                <span className="text-[11px] text-slate-600 font-medium">
                  Another Route {cleanRoute} bus is too close. Maintain holding speed.
                </span>
              </div>
            </div>
          )}

          {/* Live Telemetry Grid */}
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#9A0002] block mb-3">
              Live Telemetry & Metrics
            </span>
            <div className="grid grid-cols-2 gap-3">
              <StatCard icon={<TrendingUp size={15} />} label="Live Speed" value={`${currentSpeed} km/h`} color="inherit" />
              <StatCard icon={<Activity size={15} />} label="Headway Gap" value={headwayStr} color={headwayColor} />
              <StatCard icon={<Users size={15} />} label="Onboard" value={`${occupancy} pass`} color="inherit" bar barPct={occPct} barColor={occColor} sub={`${occPct}% full`} />
              <StatCard icon={<Clock size={15} />} label="ETA to Next" value={<ETACountdown seconds={etaSec} />} color="#9A0002" />
            </div>
          </div>

          {/* Stop Progress Strip */}
          <div className="bg-[#F7EFE7] border border-[#DECFC2] rounded-3xl p-4 shadow-sm border-l-4 border-l-[#9A0002]">
            <span className="text-[9px] font-black uppercase tracking-widest text-[#9A0002] flex items-center gap-1.5 mb-3">
              <MapPin size={10} /> Stop Progress
            </span>
            <div className="flex items-center gap-3">
              <div className="text-center shrink-0 max-w-[70px]">
                <div className="w-8 h-8 rounded-xl bg-[#9A0002] text-white flex items-center justify-center text-lg font-black mx-auto">•</div>
                <span className="text-[8px] font-bold text-[#9A0002] mt-1 block truncate">{currentStop}</span>
              </div>
              <div className="flex-1 relative h-2 bg-red-100 rounded-full">
                <div className="absolute inset-y-0 left-0 w-1/2 bg-[#9A0002] rounded-full" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-[#9A0002] rounded-full border-2 border-white shadow" />
              </div>
              <div className="text-center shrink-0 max-w-[70px]">
                <div className="w-8 h-8 rounded-xl bg-red-100/60 text-[#9A0002] border border-red-200 flex items-center justify-center text-lg font-black mx-auto">○</div>
                <span className="text-[8px] font-bold text-slate-500 mt-1 block truncate">{nextStop}</span>
              </div>
            </div>
            <div className="flex justify-between mt-2 text-[9px] font-bold text-slate-500">
              <span>Current</span>
              <span className="text-[#9A0002]">{distStr} · {etaStr}</span>
              <span>Next</span>
            </div>
          </div>

          {/* Navigation Details Breakdown */}
          <div className="bg-[#F7EFE7] border border-[#DECFC2] rounded-3xl p-4 lg:p-5 shadow-sm border-l-4 border-l-[#9A0002]">
            <span className="text-[9px] font-black uppercase tracking-widest text-[#9A0002] flex items-center gap-1.5 mb-3">
              <Navigation size={10} /> Navigation Details
            </span>
            <div className="space-y-2.5">
              {[
                { label: "Current Stop", value: currentStop, color: "#9A0002" },
                { label: "Next Stop", value: nextStop, color: "slate-900" },
                { label: "Distance Remaining", value: distStr, color: "slate-900" },
                { label: "ETA to Next Stop", value: etaStr, color: "#9A0002" },
                { label: "Upcoming Maneuver", value: `${turnArrow} ${upcomingTurn.replace("_", " ")}`, color: "slate-900" },
                { label: "Route Operator", value: `Route ${cleanRoute} · ${activeBus?.operator ?? "BEST"}`, color: "slate-900" },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex items-center justify-between text-xs border-b border-[#DECFC2]/40 pb-2 last:border-0 last:pb-0">
                  <span className="text-slate-500 font-medium">{label}</span>
                  <span
                    className={cn("font-black truncate ml-4 max-w-[180px]", !color.startsWith("#") && `text-${color}`)}
                    style={color.startsWith("#") ? { color } : undefined}
                  >
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
