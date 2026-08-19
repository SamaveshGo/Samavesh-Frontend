// ============================================================
// SAMAVESH — Design System Constants & App Config
// ============================================================

export const APP_NAME = "SAMAVESH";
export const APP_TAGLINE = "Balancing Every Journey";
export const APP_DESCRIPTION =
  "AI-Powered Real-Time Bus Bunching Detection & Rebalancing System for Mumbai BEST";

// ------------------------------------------------------------
// Brand Colors (CSS variable names defined in globals.css)
// ------------------------------------------------------------
export const COLORS = {
  primary: "#9A0002",
  secondary: "#EFE6DE",
  surface: "#FFFFFF",
  text: "#111111",
  muted: "#767676",
  success: "#228B22",
  warning: "#FFB300",
  info: "#2563EB",
  danger: "#9A0002",
} as const;

// Route Colors (distinct per route for map & charts)
export const ROUTE_COLORS: Record<string, string> = {
  "312": "#9A0002",
  "A-100": "#2563EB",
  "137": "#228B22",
  "378": "#FFB300",
  "54": "#7C3AED",
};

// Case study colors
export const CASE_STUDY_COLORS: Record<number, string> = {
  1: "#9A0002",
  2: "#FFB300",
  3: "#2563EB",
  4: "#7C3AED",
};

// Case study icons (lucide icon names)
export const CASE_STUDY_ICONS: Record<number, string> = {
  1: "GitMerge",
  2: "Users",
  3: "AlertTriangle",
  4: "CloudRain",
};

// ------------------------------------------------------------
// Navigation
// ------------------------------------------------------------
export const DASHBOARD_NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", icon: "LayoutDashboard" },
  { href: "/dashboard/map", label: "Live Map", icon: "Map" },
  { href: "/dashboard/analytics", label: "Analytics", icon: "BarChart2" },
  { href: "/dashboard/simulation", label: "Simulation", icon: "Play" },
] as const;

export const DRIVER_NAV_ITEMS = [
  { href: "/driver", label: "Dashboard", icon: "Home" },
  { href: "/driver/stops", label: "Stops", icon: "MapPin" },
  { href: "/driver/alerts", label: "Alerts", icon: "Bell" },
  { href: "/driver/more", label: "More", icon: "MoreHorizontal" },
] as const;

export const COMMUTER_NAV_ITEMS = [
  { href: "/commuter", label: "Home", icon: "Home" },
  { href: "/commuter/search", label: "My Bus", icon: "Bus" },
  { href: "/commuter/tickets", label: "Trips", icon: "Ticket" },
  { href: "/commuter/profile", label: "Profile", icon: "User" },
] as const;

// ------------------------------------------------------------
// Mumbai BEST Route Data
// ------------------------------------------------------------
export const MUMBAI_ROUTES = ["312", "A-100", "137", "378", "54"] as const;

export const MUMBAI_STOPS = [
  "Dadar TT",
  "Kurla Station",
  "Andheri East",
  "Mulund Check Naka",
  "Borivali Station",
  "Sion Circle",
  "Colaba Depot",
  "Matunga (E)",
  "Bandra Kurla Complex",
  "Worli Naka",
  "Thane Station",
  "Ghatkopar Station",
  "Vikhroli",
  "Chunabhatti",
  "King's Circle",
] as const;

// ------------------------------------------------------------
// Map Config (Mumbai center)
// ------------------------------------------------------------
export const MUMBAI_CENTER: [number, number] = [19.076, 72.8777];
export const MUMBAI_ZOOM = 12;

// ------------------------------------------------------------
// Chart Config
// ------------------------------------------------------------
export const HEADWAY_CHART_CONFIG = {
  scheduled: { color: "#767676", label: "Scheduled Headway" },
  actual: { color: "#9A0002", label: "Actual Headway" },
};

export const RIDERSHIP_CHART_CONFIG = {
  "312": { color: "#9A0002" },
  "A-100": { color: "#2563EB" },
  "137": { color: "#228B22" },
  "378": { color: "#FFB300" },
  "54": { color: "#7C3AED" },
};

// ------------------------------------------------------------
// Performance Targets (from PRD)
// ------------------------------------------------------------
export const PERFORMANCE_TARGETS = {
  bunchingReduction: 35, // %
  headwayStdDevReduction: 30, // %
  forecastLeadTime: 8, // minutes
  driverCompliance: 80, // %
  etaAccuracy: 85, // %
  ridershipGrowth: 7, // % (avg of 5-8)
} as const;

// ------------------------------------------------------------
// Simulation Scenarios
// ------------------------------------------------------------
export const SIMULATION_SCENARIOS = [
  {
    id: "cs1-dadar",
    name: "Case Study 1 — Dadar Bunching",
    description: "Route 312 buses converging due to heavy boarding at Dadar TT",
    caseStudy: 1 as const,
    route: "312",
    stops: ["Sion Circle", "Dadar TT", "Worli Naka"],
    duration: 20,
    weatherCondition: "clear" as const,
    trafficLevel: "moderate" as const,
  },
  {
    id: "cs2-andheri",
    name: "Case Study 2 — Andheri Stop Congestion",
    description: "Multi-route convergence saturating Andheri East interchange bays",
    caseStudy: 2 as const,
    route: "A-100",
    stops: ["Andheri East", "Kurla Station"],
    duration: 15,
    weatherCondition: "clear" as const,
    trafficLevel: "heavy" as const,
  },
  {
    id: "cs3-traffic",
    name: "Case Study 3 — Western Express Highway Incident",
    description: "Accident on WEH slowing entire corridor for 12 km",
    caseStudy: 3 as const,
    route: "137",
    stops: ["Borivali Station", "Andheri East", "Bandra Kurla Complex"],
    duration: 25,
    weatherCondition: "cloudy" as const,
    trafficLevel: "standstill" as const,
  },
  {
    id: "cs4-monsoon",
    name: "Case Study 4 — Monsoon Surge",
    description: "Heavy rain + Sion waterlogging spiking ridership & dwell times",
    caseStudy: 4 as const,
    route: "378",
    stops: ["Sion Circle", "Kurla Station", "Ghatkopar Station"],
    duration: 30,
    weatherCondition: "heavy_rain" as const,
    trafficLevel: "heavy" as const,
  },
] as const;

// ------------------------------------------------------------
// System Health Services
// ------------------------------------------------------------
export const SYSTEM_SERVICES = [
  "Telemetry Ingestion",
  "Headway Engine",
  "Case-Study Classifier",
  "Forecast Model",
  "Decision Engine",
  "Notification Service",
  "Commuter ETA Service",
  "Map Tiles",
  "Weather API",
  "Traffic API",
] as const;
