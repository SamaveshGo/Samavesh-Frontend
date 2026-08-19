import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { BusStatus, CrowdingLevel, AlertSeverity, CaseStudyType, TrafficLevel } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatETA(minutes: number): string {
  if (minutes <= 0) return "Due";
  if (minutes < 60) return `${Math.round(minutes)} min`;
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function formatHeadway(minutes: number): string {
  if (minutes < 1) return "<1 min";
  return `${Math.round(minutes)} min`;
}

export function formatDelay(minutes: number): string {
  if (Math.abs(minutes) < 0.5) return "On time";
  if (minutes > 0) return `+${Math.round(minutes)} min late`;
  return `${Math.round(Math.abs(minutes))} min early`;
}

export function formatTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatTimeShort(isoString: string): string {
  return new Date(isoString).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

export function getBusStatusColor(status: BusStatus): string {
  const map: Record<BusStatus, string> = {
    on_time: "text-success",
    delayed: "text-warning",
    bunching_risk: "text-warning",
    bunching: "text-danger",
    standby: "text-info",
    offline: "text-muted-foreground",
  };
  return map[status];
}

export function getBusStatusBg(status: BusStatus): string {
  const map: Record<BusStatus, string> = {
    on_time: "bg-success/10 text-success border-success/20",
    delayed: "bg-warning/10 text-warning border-warning/20",
    bunching_risk: "bg-warning/10 text-warning border-warning/20",
    bunching: "bg-danger/10 text-danger border-danger/20",
    standby: "bg-info/10 text-info border-info/20",
    offline: "bg-muted/10 text-muted-foreground border-muted/20",
  };
  return map[status];
}

export function getCrowdingColor(level: CrowdingLevel): string {
  const map: Record<CrowdingLevel, string> = {
    low: "text-success",
    moderate: "text-warning",
    high: "text-orange-500",
    full: "text-danger",
  };
  return map[level];
}

export function getCrowdingBg(level: CrowdingLevel): string {
  const map: Record<CrowdingLevel, string> = {
    low: "bg-success/10 text-success border-success/20",
    moderate: "bg-warning/10 text-warning border-warning/20",
    high: "bg-orange-500/10 text-orange-600 border-orange-500/20",
    full: "bg-danger/10 text-danger border-danger/20",
  };
  return map[level];
}

export function getCrowdingLabel(level: CrowdingLevel): string {
  return level.charAt(0).toUpperCase() + level.slice(1);
}

export function getAlertSeverityColor(severity: AlertSeverity): string {
  const map: Record<AlertSeverity, string> = {
    watch: "text-warning",
    critical: "text-danger",
    info: "text-info",
    resolved: "text-success",
  };
  return map[severity];
}

export function getAlertSeverityBg(severity: AlertSeverity): string {
  const map: Record<AlertSeverity, string> = {
    watch: "bg-warning/10 border-warning/30",
    critical: "bg-danger/10 border-danger/30",
    info: "bg-info/10 border-info/30",
    resolved: "bg-success/10 border-success/30",
  };
  return map[severity];
}

export function getCaseStudyLabel(cs: CaseStudyType): string {
  const map: Record<CaseStudyType, string> = {
    1: "Same-Route Bunching",
    2: "Stop Congestion",
    3: "Traffic Incident",
    4: "Weather Impact",
  };
  return map[cs];
}

export function getCaseStudyDescription(cs: CaseStudyType): string {
  const map: Record<CaseStudyType, string> = {
    1: "Consecutive same-route buses closing gap due to dwell-time spikes",
    2: "Multiple routes converging at interchange, saturating bus bays",
    3: "Road incidents slowing entire corridor — accident, waterlogging, or VIP movement",
    4: "Monsoon rain spiking dwell times and ridership simultaneously city-wide",
  };
  return map[cs];
}

export function getTrafficColor(level: TrafficLevel): string {
  const map: Record<TrafficLevel, string> = {
    free: "text-success",
    moderate: "text-warning",
    heavy: "text-orange-500",
    standstill: "text-danger",
  };
  return map[level];
}

export function getRiskScoreColor(score: number): string {
  if (score >= 80) return "text-danger";
  if (score >= 60) return "text-warning";
  if (score >= 40) return "text-orange-500";
  return "text-success";
}

export function getRiskScoreBg(score: number): string {
  if (score >= 80) return "bg-danger";
  if (score >= 60) return "bg-warning";
  if (score >= 40) return "bg-orange-500";
  return "bg-success";
}

export function interpolateColor(value: number, min = 0, max = 100): string {
  const ratio = Math.max(0, Math.min(1, (value - min) / (max - min)));
  if (ratio < 0.5) {
    return `rgba(34, 139, 34, ${0.3 + ratio * 1.4})`;
  }
  return `rgba(154, 0, 2, ${0.3 + (ratio - 0.5) * 1.4})`;
}

export function timeAgo(isoString: string): string {
  const seconds = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  return `${Math.floor(seconds / 3600)}h ago`;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
