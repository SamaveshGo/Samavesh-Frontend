"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play, Pause, SkipBack, SkipForward, RotateCcw,
  CloudRain, AlertTriangle, Sliders, ChevronDown,
  GitMerge, Users, Clock, Zap
} from "lucide-react";
import { SIMULATION_SCENARIOS } from "@/lib/constants";
import { HeadwayGraph } from "@/components/charts/HeadwayGraph";
import { ForecastGraph } from "@/components/charts/ForecastGraph";
import { LiveMap } from "@/components/maps/LiveMap";
import { headwayByRoute, forecastData } from "@/mock/analytics";
import { cn } from "@/lib/utils";
import type { SimulationScenario } from "@/types";

const SPEED_OPTIONS = [0.5, 1, 2, 4];

export default function SimulationPage() {
  const [selectedScenario, setSelectedScenario] = useState<SimulationScenario>(SIMULATION_SCENARIOS[0] as any);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [weatherEnabled, setWeatherEnabled] = useState(false);
  const [trafficEnabled, setTrafficEnabled] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const totalDuration = (selectedScenario?.duration || 20) * 60;

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentTime((t) => {
          if (t >= totalDuration) {
            setIsPlaying(false);
            return totalDuration;
          }
          return t + speed;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isPlaying, speed, totalDuration]);

  const progress = totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0;
  const elapsed = Math.floor(currentTime / 60);
  const remaining = Math.floor((totalDuration - currentTime) / 60);

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleScenarioChange = (scenario: SimulationScenario) => {
    handleReset();
    setSelectedScenario(scenario);
    setWeatherEnabled(scenario.weatherCondition !== "clear");
    setTrafficEnabled(scenario.trafficLevel === "heavy" || scenario.trafficLevel === "standstill");
  };

  const CS_ICONS: Record<number, React.ElementType> = {
    1: GitMerge,
    2: Users,
    3: AlertTriangle,
    4: CloudRain,
  };

  return (
    <div className="p-6 space-y-5 page-enter">
      {/* Header */}
      <div>
        <h1 className="font-heading text-3xl text-foreground">Simulation</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Replay historical scenarios or run synthetic case studies to test detection thresholds
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">

        {/* LEFT: Controls */}
        <div className="flex flex-col gap-4">

          {/* Scenario selector */}
          <div className="samavesh-card p-4">
            <h2 className="font-heading text-lg mb-3">Case Study Scenarios</h2>
            <div className="space-y-2">
              {SIMULATION_SCENARIOS.map((scenario) => {
                const Icon = CS_ICONS[scenario.caseStudy];
                const isSelected = selectedScenario.id === scenario.id;
                return (
                  <motion.button
                    key={scenario.id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleScenarioChange(scenario as any)}
                    className={cn(
                      "w-full text-left p-3 rounded-xl border transition-all text-xs",
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/30 hover:bg-secondary/50"
                    )}
                  >
                    <div className="flex items-start gap-2">
                      <Icon
                        size={14}
                        strokeWidth={2}
                        className={isSelected ? "text-primary mt-0.5 shrink-0" : "text-muted-foreground mt-0.5 shrink-0"}
                      />
                      <div>
                        <p className={cn("font-semibold", isSelected ? "text-primary" : "text-foreground")}>
                          {scenario.name}
                        </p>
                        <p className="text-muted-foreground mt-0.5 leading-relaxed">{scenario.description}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="font-mono text-[10px] text-muted-foreground">R{scenario.route}</span>
                          <span className="text-border">·</span>
                          <Clock size={9} className="text-muted-foreground" />
                          <span className="text-[10px] text-muted-foreground">{scenario.duration} min</span>
                        </div>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Overlay toggles */}
          <div className="samavesh-card p-4">
            <h2 className="font-heading text-lg mb-3">Overlays</h2>
            <div className="space-y-3">
              {[
                { key: "weather", label: "Weather Overlay", icon: CloudRain, enabled: weatherEnabled, toggle: () => setWeatherEnabled(!weatherEnabled) },
                { key: "traffic", label: "Traffic Overlay", icon: AlertTriangle, enabled: trafficEnabled, toggle: () => setTrafficEnabled(!trafficEnabled) },
              ].map((toggle) => {
                const Icon = toggle.icon;
                return (
                  <div key={toggle.key} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon size={14} className="text-muted-foreground" strokeWidth={1.75} />
                      <span className="text-sm font-medium">{toggle.label}</span>
                    </div>
                    <button
                      onClick={toggle.toggle}
                      className={cn(
                        "relative w-10 h-6 rounded-full transition-colors",
                        toggle.enabled ? "bg-primary" : "bg-muted"
                      )}
                    >
                      <span
                        className={cn(
                          "absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform",
                          toggle.enabled ? "translate-x-4" : "translate-x-0"
                        )}
                      />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Playback controls */}
          <div className="samavesh-card p-4">
            <h2 className="font-heading text-lg mb-3">Playback</h2>

            {/* Progress bar */}
            <div className="mb-3">
              <div className="h-2 bg-muted rounded-full overflow-hidden cursor-pointer" onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const ratio = (e.clientX - rect.left) / rect.width;
                setCurrentTime(Math.floor(ratio * totalDuration));
              }}>
                <motion.div
                  className="h-full bg-primary rounded-full"
                  style={{ width: `${progress}%` }}
                  transition={{ duration: 0 }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                <span>{elapsed} min</span>
                <span>{selectedScenario.duration} min total</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between gap-2">
              <button onClick={handleReset} className="p-2 rounded-xl hover:bg-secondary transition-colors text-muted-foreground">
                <RotateCcw size={16} strokeWidth={1.75} />
              </button>
              <button
                onClick={() => setCurrentTime(Math.max(0, currentTime - 30))}
                className="p-2 rounded-xl hover:bg-secondary transition-colors text-muted-foreground"
              >
                <SkipBack size={16} strokeWidth={1.75} />
              </button>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors"
              >
                {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                {isPlaying ? "Pause" : "Play"}
              </button>
              <button
                onClick={() => setCurrentTime(Math.min(totalDuration, currentTime + 30))}
                className="p-2 rounded-xl hover:bg-secondary transition-colors text-muted-foreground"
              >
                <SkipForward size={16} strokeWidth={1.75} />
              </button>

              {/* Speed */}
              <div className="flex items-center gap-1">
                {SPEED_OPTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSpeed(s)}
                    className={cn(
                      "text-[10px] font-bold px-1.5 py-0.5 rounded transition-colors",
                      speed === s ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {s}×
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* CENTER + RIGHT: Map + Charts */}
        <div className="lg:col-span-2 flex flex-col gap-4">

          {/* Selected scenario info */}
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedScenario.id}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="samavesh-card p-4"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-xl shrink-0">
                  {(() => {
                    const Icon = CS_ICONS[selectedScenario.caseStudy];
                    return <Icon size={18} className="text-primary" strokeWidth={1.75} />;
                  })()}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{selectedScenario.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{selectedScenario.description}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="text-[10px] px-2 py-0.5 bg-primary/10 text-primary rounded-full font-semibold">
                      CS{selectedScenario.caseStudy}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 bg-secondary rounded-full text-muted-foreground">
                      Route {selectedScenario.route}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 bg-secondary rounded-full text-muted-foreground capitalize">
                      Weather: {selectedScenario.weatherCondition.replace("_", " ")}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 bg-secondary rounded-full text-muted-foreground capitalize">
                      Traffic: {selectedScenario.trafficLevel}
                    </span>
                  </div>
                </div>
                {isPlaying && (
                  <div className="ml-auto flex items-center gap-1.5 shrink-0">
                    <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                    <span className="text-xs font-semibold text-success">Simulating</span>
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Map */}
          <div className="samavesh-card overflow-hidden h-[300px]">
            <LiveMap height="300px" />
          </div>

          {/* Charts */}
          <div className="grid md:grid-cols-2 gap-4">
            <HeadwayGraph
              data={headwayByRoute[selectedScenario.route] || headwayByRoute["312"]}
              title="Simulated Headway"
              routeNumber={selectedScenario.route}
            />
            <ForecastGraph data={forecastData} title="Risk Forecast" />
          </div>
        </div>
      </div>
    </div>
  );
}
