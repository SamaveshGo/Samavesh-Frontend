"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ChevronRight,
  Info,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Search,
  ExternalLink,
  Sliders,
  Settings,
  Layers,
  MapPin,
  Bus,
  Activity,
  Clock,
  User,
  Star
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MetricCard } from "@/components/cards/MetricCard";
import { ForecastCard } from "@/components/cards/ForecastCard";
import { RouteCard } from "@/components/cards/RouteCard";
import { mockBuses } from "@/mock/buses";
import { mockRoutes } from "@/mock/routes";

export default function DesignSystemPage() {
  const [activeTab, setActiveTab] = useState("typography");

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row">
      {/* Sidebar navigation */}
      <div className="w-full md:w-64 bg-card border-r border-border shrink-0 p-6 flex flex-col gap-6">
        <div>
          <Link href="/" className="flex items-center gap-2 text-primary font-semibold hover:underline text-xs mb-4">
            <ArrowLeft size={12} /> Back to Landing
          </Link>
          <div className="flex items-center gap-3">
            {/* Zebra logo mark */}
            <img src="/logo.png" alt="SAMAVESH Logo" className="w-8 h-8 object-contain shrink-0" />
            <h1 className="font-heading text-xl">SAMAVESH</h1>
          </div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-2 font-bold">
            Design System V1.0
          </p>
        </div>

        <nav className="flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-x-visible pb-3 md:pb-0 scrollbar-hide">
          {[
            { id: "typography", label: "Typography & Colors" },
            { id: "motif", label: "Zebra Motif" },
            { id: "buttons", label: "Buttons & Inputs" },
            { id: "badges", label: "Badges & Chips" },
            { id: "cards", label: "Domain Cards" },
            { id: "skeletons", label: "Skeletons & Feedbacks" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-3 py-2.5 rounded-xl text-left text-xs font-semibold whitespace-nowrap transition-all",
                activeTab === tab.id
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              )}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content Area */}
      <div className="flex-1 p-6 md:p-10 max-w-5xl overflow-y-auto scrollbar-thin">
        {activeTab === "typography" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div>
              <h2 className="font-heading text-3xl mb-2">Typography & Color System</h2>
              <p className="text-sm text-muted-foreground">The foundational hierarchy, scaling, and color definitions of the Samavesh experience.</p>
            </div>

            {/* Colors Section */}
            <div className="space-y-4">
              <h3 className="font-heading text-xl">Color Palette</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {[
                  { name: "Primary Crimson", hex: "#9A0002", description: "Deep BEST Crimson, representing authority, urgency, and the identity of Mumbai transit.", variable: "var(--primary)", light: false },
                  { name: "Secondary Background", hex: "#EFE6DE", description: "Warm Off-White surface tone, used as secondary elements or subtle cards.", variable: "var(--secondary)", light: true },
                  { name: "Ink Black", hex: "#111111", description: "Default body text color, high contrast readability.", variable: "var(--foreground)", light: false },
                  { name: "Steel Gray", hex: "#767676", description: "Muted text, metadata labels, and helper guidance.", variable: "var(--muted-foreground)", light: false },
                  { name: "Success Green", hex: "#228B22", description: "Normal spacing, on-time arrivals, positive feedback compliance.", variable: "var(--success)", light: false },
                  { name: "Warning Amber", hex: "#FFB300", description: "Rising bunching risk, route delay, or temporary warning events.", variable: "var(--warning)", light: true },
                  { name: "Info Blue", hex: "#2563EB", description: "System information logs, telemetry updates, network checks.", variable: "var(--info)", light: false },
                ].map((color) => (
                  <div key={color.name} className="samavesh-card overflow-hidden">
                    <div
                      className="h-24 w-full flex items-end p-3"
                      style={{ backgroundColor: color.hex }}
                    >
                      <span className={cn("text-[10px] font-mono font-bold tracking-wider", color.light ? "text-black" : "text-white")}>
                        {color.hex}
                      </span>
                    </div>
                    <div className="p-3">
                      <p className="text-xs font-semibold">{color.name}</p>
                      <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">{color.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Typography Section */}
            <div className="space-y-4">
              <h3 className="font-heading text-xl">Typography Hierarchy</h3>
              <div className="samavesh-card p-6 space-y-6">
                <div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Heading H1 (Safira / DM Serif Display)</span>
                  <h1 className="font-heading text-4xl lg:text-5xl text-foreground mt-1">Balancing Every Journey</h1>
                </div>
                <div className="zebra-divider opacity-30" />
                <div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Heading H2</span>
                  <h2 className="font-heading text-2xl lg:text-3xl text-foreground mt-1">AI Powered Bus Bunching</h2>
                </div>
                <div className="zebra-divider opacity-30" />
                <div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Heading H3</span>
                  <h3 className="font-heading text-xl text-foreground mt-1">Mumbai BEST Intelligence</h3>
                </div>
                <div className="zebra-divider opacity-30" />
                <div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Body Large (Plus Jakarta Sans)</span>
                  <p className="text-base text-foreground mt-1 font-sans">
                    The platform computes real-time headway using telematics from GPS devices.
                  </p>
                </div>
                <div className="zebra-divider opacity-30" />
                <div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Body Medium</span>
                  <p className="text-sm text-foreground mt-1 font-sans leading-relaxed">
                    Commuters can search route numbers or select stops to see a crowding meter, revised live ETA, and boarding confidence levels.
                  </p>
                </div>
                <div className="zebra-divider opacity-30" />
                <div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Caption / Muted</span>
                  <p className="text-xs text-muted-foreground mt-1 font-sans">
                    Last updated 5 seconds ago · Mumbai Traffic Police Live API
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "motif" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div>
              <h2 className="font-heading text-3xl mb-2">The Zebra Core Motif</h2>
              <p className="text-sm text-muted-foreground font-sans">
                Samavesh integrates the visual essence of city crosswalks, lanes, and parallel markings as abstract UI accents. We never use literal zebra drawings.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Divider Stripes */}
              <div className="samavesh-card p-6 space-y-4">
                <div>
                  <h4 className="font-heading text-lg">Striped Divider</h4>
                  <p className="text-xs text-muted-foreground">Used as subtle thematic horizontal separators between card blocks.</p>
                </div>
                <div className="zebra-divider" />
                <div className="py-2 text-xs text-muted-foreground">
                  Class: <code className="bg-muted px-1.5 py-0.5 rounded text-[10px]">zebra-divider</code>
                </div>
              </div>

              {/* Vertical Lane Divider */}
              <div className="samavesh-card p-6 space-y-4">
                <div>
                  <h4 className="font-heading text-lg">Lane Divider (Vertical)</h4>
                  <p className="text-xs text-muted-foreground">Used to denote physical spacing or sequences in timeline views.</p>
                </div>
                <div className="h-16 flex items-center justify-center border border-border/50 rounded-xl">
                  <div className="zebra-divider-v h-12" />
                </div>
                <div className="text-xs text-muted-foreground">
                  Class: <code className="bg-muted px-1.5 py-0.5 rounded text-[10px]">zebra-divider-v</code>
                </div>
              </div>

              {/* Zebra Row Stripe */}
              <div className="samavesh-card p-6 space-y-4 col-span-1 md:col-span-2">
                <div>
                  <h4 className="font-heading text-lg">Zebra Row Striping</h4>
                  <p className="text-xs text-muted-foreground">Alternating row shades for high density tables, keeping information clean and legible.</p>
                </div>
                <div className="border border-border rounded-xl overflow-hidden text-xs">
                  {[
                    { stop: "Dadar TT Interchange", route: "Route 312", status: "Bunched" },
                    { stop: "Kurla West Depot", route: "Route 54", status: "On Time" },
                    { stop: "Sion Circle Junction", route: "Route A-100", status: "At Risk" },
                    { stop: "Andheri Subway East", route: "Route 137", status: "On Time" },
                  ].map((row, i) => (
                    <div
                      key={i}
                      className={cn(
                        "flex items-center justify-between p-3 border-b border-border last:border-0",
                        i % 2 === 0 ? "bg-muted" : "bg-card"
                      )}
                    >
                      <span className="font-semibold">{row.stop}</span>
                      <span className="text-muted-foreground">{row.route}</span>
                      <span className="text-primary font-bold">{row.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "buttons" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div>
              <h2 className="font-heading text-3xl mb-2">Buttons & Inputs</h2>
              <p className="text-sm text-muted-foreground">Clean, high-reachability interactive components with tactile states.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Button states */}
              <div className="samavesh-card p-6 space-y-4">
                <h4 className="font-heading text-lg">Button Variants</h4>
                <div className="flex flex-col gap-3">
                  <button className="px-5 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/95 active:scale-[0.98] transition-all text-xs text-center">
                    Primary Button (Crimson)
                  </button>
                  <button className="px-5 py-3 bg-secondary text-foreground border border-border font-semibold rounded-xl hover:bg-secondary/80 active:scale-[0.98] transition-all text-xs text-center">
                    Secondary Button
                  </button>
                  <button className="px-5 py-3 text-muted-foreground hover:text-foreground font-semibold rounded-xl hover:bg-secondary active:scale-[0.98] transition-all text-xs text-center">
                    Tertiary Button
                  </button>
                </div>
              </div>

              {/* Input forms */}
              <div className="samavesh-card p-6 space-y-4">
                <h4 className="font-heading text-lg">Inputs & Search Group</h4>
                <div className="space-y-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Input Field</label>
                    <input
                      type="text"
                      placeholder="Enter Employee ID..."
                      className="px-4 py-3 rounded-xl border border-border bg-card text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-all"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Search bar (Glassmorphic)</label>
                    <div className="glass rounded-xl flex items-center gap-3 px-3 py-2.5">
                      <Search size={14} className="text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Search route or interchange..."
                        className="bg-transparent border-none text-xs text-foreground placeholder:text-muted-foreground focus:outline-none w-full"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "badges" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div>
              <h2 className="font-heading text-3xl mb-2">Badges, Status Chips, & Indicators</h2>
              <p className="text-sm text-muted-foreground">Visual markers used to classify routes, crowding density, and alert severity.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Crowding density chips */}
              <div className="samavesh-card p-6 space-y-4">
                <h4 className="font-heading text-lg">Crowding density</h4>
                <div className="flex flex-wrap gap-2">
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-success/10 text-success border border-success/20">
                    Low Crowd
                  </span>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-warning/10 text-warning border border-warning/20">
                    Moderate Crowd
                  </span>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-orange-500/10 text-orange-600 border border-orange-500/20">
                    High Crowd
                  </span>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-danger/10 text-danger border border-danger/20">
                    Full
                  </span>
                </div>
              </div>

              {/* Alert Severity & Status */}
              <div className="samavesh-card p-6 space-y-4">
                <h4 className="font-heading text-lg">Alert Severity & Status</h4>
                <div className="flex flex-wrap gap-2">
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-danger text-white">
                    Critical Alert
                  </span>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-warning/15 text-warning border border-warning/30">
                    Watch List
                  </span>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-info/10 text-info border border-info/30">
                    Info Log
                  </span>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-success text-white">
                    Resolved ✓
                  </span>
                </div>
              </div>

              {/* Status Dot Indicators */}
              <div className="samavesh-card p-6 space-y-4 col-span-1 md:col-span-2">
                <h4 className="font-heading text-lg">Live Status Lights</h4>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <span className="status-dot status-dot-operational" />
                    <span className="text-xs text-muted-foreground">Operational</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="status-dot status-dot-degraded animate-pulse" />
                    <span className="text-xs text-muted-foreground">Degraded / Slow</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="status-dot status-dot-down" />
                    <span className="text-xs text-muted-foreground">Down / Offline</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "cards" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div>
              <h2 className="font-heading text-3xl mb-2">Domain Specific Cards</h2>
              <p className="text-sm text-muted-foreground">Production quality cards built to handle dense, real-time BEST route and bus telematics.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Alert placeholder */}
              <div className="space-y-3">
                <h4 className="font-heading text-lg">Alert Card</h4>
                <div className="samavesh-card p-4 flex items-start gap-3 border-l-4 border-danger">
                  <AlertTriangle size={18} className="text-danger mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-sm">Bunching Detected — Route 312</p>
                    <p className="text-xs text-muted-foreground mt-0.5">3 buses within 400m at Dadar TT. Suggested: hold Bus #B204 for 4 min.</p>
                    <p className="text-[10px] text-muted-foreground mt-1">2 min ago · High priority</p>
                  </div>
                </div>
              </div>

              {/* Bus card placeholder */}
              <div className="space-y-3">
                <h4 className="font-heading text-lg">Bus Card</h4>
                <div className="samavesh-card p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Bus size={18} className="text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{mockBuses[0]?.displayId ?? "MH-01-LA-6678"}</p>
                      <p className="text-xs text-muted-foreground">Route 312 · On time</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-success bg-success/10 px-2 py-1 rounded-full">Active</span>
                </div>
              </div>

              {/* Forecast card */}
              <div className="space-y-3">
                <h4 className="font-heading text-lg">ForecastCard Component</h4>
                <ForecastCard
                  item={{
                    routeId: "route-312",
                    routeNumber: "312",
                    stopName: "Dadar TT Interchange",
                    riskScore: 82,
                    timeToEvent: 5,
                    caseStudy: 1,
                    confidence: 90
                  }}
                  index={0}
                />
              </div>

              {/* Route status card */}
              <div className="space-y-3">
                <h4 className="font-heading text-lg">RouteCard Component</h4>
                <RouteCard route={mockRoutes[0]} index={0} />
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "skeletons" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div>
              <h2 className="font-heading text-3xl mb-2">Loading Skeletons & Feedbacks</h2>
              <p className="text-sm text-muted-foreground font-sans">
                Tactile feedback notifications and custom zebra loading shimmers representing live data state changes.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Zebra loading shimmer */}
              <div className="samavesh-card p-6 space-y-4">
                <div>
                  <h4 className="font-heading text-lg">Zebra Shimmer Loading</h4>
                  <p className="text-xs text-muted-foreground">Used as loaders in tables and list metrics during data fetch cycles.</p>
                </div>
                <div className="w-full h-10 zebra-skeleton rounded-xl" />
                <div className="w-3/4 h-6 zebra-skeleton rounded-xl" />
              </div>

              {/* Action response logs */}
              <div className="samavesh-card p-6 space-y-4">
                <h4 className="font-heading text-lg">Feedback States</h4>
                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-success/5 border border-success/20 rounded-xl text-success font-medium flex items-center gap-2">
                    <CheckCircle size={14} />
                    Action submitted successfully — driver route updated
                  </div>
                  <div className="p-3 bg-danger/5 border border-danger/20 rounded-xl text-danger font-medium flex items-center gap-2">
                    <XCircle size={14} />
                    Operation failed — unable to reach vehicle GPS unit
                  </div>
                  <div className="p-3 bg-info/5 border border-info/20 rounded-xl text-info font-medium flex items-center gap-2">
                    <Info size={14} />
                    Standby bus deployment triggered for Route 312
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
