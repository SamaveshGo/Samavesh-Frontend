import type {
  HeadwayDataPoint,
  ForecastPoint,
  ForecastItem,
  PerformanceMetric,
  RidershipDataPoint,
  HeatmapCell,
  SystemHealthItem,
} from "@/types";

// ------------------------------------------------------------
// Headway Time-Distance Data (last 2 hours, Route 312)
// ------------------------------------------------------------
export const headwayData: HeadwayDataPoint[] = [
  { time: "11:00", scheduled: 10, actual: 10.2, bus1: 10.2, bus2: 9.8 },
  { time: "11:10", scheduled: 10, actual: 9.8, bus1: 9.8, bus2: 10.2 },
  { time: "11:20", scheduled: 10, actual: 10.5, bus1: 10.5, bus2: 9.5 },
  { time: "11:30", scheduled: 10, actual: 9.2, bus1: 9.2, bus2: 10.8 },
  { time: "11:40", scheduled: 10, actual: 8.5, bus1: 8.5, bus2: 11.5 },
  { time: "11:50", scheduled: 10, actual: 7.1, bus1: 7.1, bus2: 12.9 },
  { time: "12:00", scheduled: 10, actual: 5.8, bus1: 5.8, bus2: 14.2 },
  { time: "12:10", scheduled: 10, actual: 4.2, bus1: 4.2, bus2: 15.8 },
  { time: "12:20", scheduled: 10, actual: 2.9, bus1: 2.9, bus2: 17.1 },
  { time: "12:30", scheduled: 10, actual: 2.3, bus1: 2.3, bus2: 17.7 },
  { time: "12:40", scheduled: 10, actual: 1.8, bus1: 1.8, bus2: 18.2 },
  { time: "12:50", scheduled: 10, actual: 2.1, bus1: 2.1, bus2: 17.9 },
];

// Headway data for all routes
export const headwayByRoute: Record<string, HeadwayDataPoint[]> = {
  "312": headwayData,
  "A-100": [
    { time: "11:00", scheduled: 12, actual: 11.8, bus1: 11.8, bus2: 12.2 },
    { time: "11:10", scheduled: 12, actual: 12.1, bus1: 12.1, bus2: 11.9 },
    { time: "11:20", scheduled: 12, actual: 10.5, bus1: 10.5, bus2: 13.5 },
    { time: "11:30", scheduled: 12, actual: 8.2, bus1: 8.2, bus2: 15.8 },
    { time: "11:40", scheduled: 12, actual: 5.5, bus1: 5.5, bus2: 18.5 },
    { time: "11:50", scheduled: 12, actual: 3.8, bus1: 3.8, bus2: 20.2 },
    { time: "12:00", scheduled: 12, actual: 2.1, bus1: 2.1, bus2: 21.9 },
    { time: "12:10", scheduled: 12, actual: 1.8, bus1: 1.8, bus2: 22.2 },
    { time: "12:20", scheduled: 12, actual: 1.5, bus1: 1.5, bus2: 22.5 },
    { time: "12:30", scheduled: 12, actual: 1.8, bus1: 1.8, bus2: 22.2 },
    { time: "12:40", scheduled: 12, actual: 2.2, bus1: 2.2, bus2: 21.8 },
    { time: "12:50", scheduled: 12, actual: 2.8, bus1: 2.8, bus2: 21.2 },
  ],
  "137": [
    { time: "11:00", scheduled: 10, actual: 9.5, bus1: 9.5, bus2: 10.5 },
    { time: "11:10", scheduled: 10, actual: 10.2, bus1: 10.2, bus2: 9.8 },
    { time: "11:20", scheduled: 10, actual: 9.8, bus1: 9.8, bus2: 10.2 },
    { time: "11:30", scheduled: 10, actual: 8.5, bus1: 8.5, bus2: 11.5 },
    { time: "11:40", scheduled: 10, actual: 7.2, bus1: 7.2, bus2: 12.8 },
    { time: "11:50", scheduled: 10, actual: 6.5, bus1: 6.5, bus2: 13.5 },
    { time: "12:00", scheduled: 10, actual: 5.8, bus1: 5.8, bus2: 14.2 },
    { time: "12:10", scheduled: 10, actual: 5.2, bus1: 5.2, bus2: 14.8 },
    { time: "12:20", scheduled: 10, actual: 4.8, bus1: 4.8, bus2: 15.2 },
    { time: "12:30", scheduled: 10, actual: 3.2, bus1: 3.2, bus2: 16.8 },
    { time: "12:40", scheduled: 10, actual: 3.2, bus1: 3.2, bus2: 16.8 },
    { time: "12:50", scheduled: 10, actual: 3.5, bus1: 3.5, bus2: 16.5 },
  ],
};

// ------------------------------------------------------------
// 10-Minute Bunching Forecast
// ------------------------------------------------------------
export const forecastData: ForecastPoint[] = [
  { time: "12:45", riskScore: 15, confidence: 92 },
  { time: "12:50", riskScore: 28, confidence: 90 },
  { time: "12:55", riskScore: 42, confidence: 88 },
  { time: "13:00", riskScore: 58, confidence: 85, label: "Alert Triggered" },
  { time: "13:05", riskScore: 74, confidence: 82, caseStudy: 1 },
  { time: "13:10", riskScore: 88, confidence: 80, caseStudy: 1, label: "Peak Risk" },
  { time: "13:15", riskScore: 92, confidence: 78, caseStudy: 1 },
  { time: "13:20", riskScore: 85, confidence: 76 },
  { time: "13:25", riskScore: 72, confidence: 74 },
  { time: "13:30", riskScore: 55, confidence: 72, label: "Hold Action" },
  { time: "13:35", riskScore: 35, confidence: 78 },
  { time: "13:40", riskScore: 18, confidence: 84 },
  { time: "13:45", riskScore: 10, confidence: 90, label: "Resolved" },
];

// Ranked forecast risk list
export const forecastItems: ForecastItem[] = [
  {
    routeId: "route-312",
    routeNumber: "312",
    stopName: "Dadar TT",
    riskScore: 92,
    timeToEvent: 5,
    caseStudy: 1,
    confidence: 88,
  },
  {
    routeId: "route-a100",
    routeNumber: "A-100",
    stopName: "Sion Circle",
    riskScore: 85,
    timeToEvent: 7,
    caseStudy: 1,
    confidence: 82,
  },
  {
    routeId: "route-137",
    routeNumber: "137",
    stopName: "WEH, Malad",
    riskScore: 78,
    timeToEvent: 10,
    caseStudy: 3,
    confidence: 79,
  },
  {
    routeId: "route-a100",
    routeNumber: "A-100",
    stopName: "Andheri East",
    riskScore: 71,
    timeToEvent: 8,
    caseStudy: 2,
    confidence: 75,
  },
  {
    routeId: "route-378",
    routeNumber: "378",
    stopName: "Sion Circle",
    riskScore: 63,
    timeToEvent: 15,
    caseStudy: 4,
    confidence: 70,
  },
  {
    routeId: "route-312",
    routeNumber: "312",
    stopName: "BKC",
    riskScore: 55,
    timeToEvent: 12,
    caseStudy: 2,
    confidence: 68,
  },
];

// ------------------------------------------------------------
// Performance Metrics (KPIs vs PRD targets)
// ------------------------------------------------------------
export const performanceMetrics: PerformanceMetric[] = [
  {
    label: "Bunching Reduction",
    value: 31,
    unit: "%",
    change: 4.2,
    trend: "up",
    target: 35,
  },
  {
    label: "Headway Std Dev Reduction",
    value: 26,
    unit: "%",
    change: 2.8,
    trend: "up",
    target: 30,
  },
  {
    label: "Forecast Lead Time",
    value: 8.4,
    unit: "min",
    change: 0.6,
    trend: "up",
    target: 8,
  },
  {
    label: "Driver Compliance",
    value: 76,
    unit: "%",
    change: -2.1,
    trend: "down",
    target: 80,
  },
  {
    label: "ETA Accuracy (±2 min)",
    value: 83,
    unit: "%",
    change: 1.5,
    trend: "up",
    target: 85,
  },
  {
    label: "Ridership Growth (MoM)",
    value: 5.8,
    unit: "%",
    change: 0.9,
    trend: "up",
    target: 7,
  },
];

// ------------------------------------------------------------
// Ridership Over Day
// ------------------------------------------------------------
export const ridershipData: RidershipDataPoint[] = [
  { time: "06:00", route312: 420, routeA100: 380, route137: 290, route378: 180, route54: 210 },
  { time: "07:00", route312: 890, routeA100: 820, route137: 650, route378: 410, route54: 520 },
  { time: "08:00", route312: 1240, routeA100: 1150, route137: 980, route378: 620, route54: 780 },
  { time: "09:00", route312: 980, routeA100: 920, route137: 840, route378: 510, route54: 640 },
  { time: "10:00", route312: 680, routeA100: 620, route137: 540, route378: 340, route54: 420 },
  { time: "11:00", route312: 580, routeA100: 540, route137: 480, route378: 290, route54: 360 },
  { time: "12:00", route312: 720, routeA100: 680, route137: 590, route378: 380, route54: 460 },
  { time: "13:00", route312: 840, routeA100: 780, route137: 680, route378: 440, route54: 540 },
  { time: "14:00", route312: 760, routeA100: 710, route137: 610, route378: 390, route54: 480 },
  { time: "15:00", route312: 680, routeA100: 630, route137: 550, route378: 340, route54: 420 },
  { time: "16:00", route312: 920, routeA100: 860, route137: 740, route378: 480, route54: 580 },
  { time: "17:00", route312: 1380, routeA100: 1280, route137: 1080, route378: 680, route54: 840 },
  { time: "18:00", route312: 1520, routeA100: 1420, route137: 1180, route378: 740, route54: 920 },
  { time: "19:00", route312: 1180, routeA100: 1080, route137: 940, route378: 590, route54: 720 },
  { time: "20:00", route312: 820, routeA100: 760, route137: 660, route378: 420, route54: 510 },
  { time: "21:00", route312: 490, routeA100: 450, route137: 390, route378: 240, route54: 300 },
  { time: "22:00", route312: 280, routeA100: 260, route137: 220, route378: 140, route54: 170 },
];

// ------------------------------------------------------------
// Stop-level Congestion Heatmap Data (hour x stop)
// ------------------------------------------------------------
export const heatmapData: HeatmapCell[] = [
  // Dadar TT
  ...Array.from({ length: 18 }, (_, i) => ({
    stopId: "stop-dadar",
    stopName: "Dadar TT",
    hour: 6 + i,
    congestionScore: [20, 55, 85, 70, 45, 40, 55, 65, 58, 50, 70, 92, 88, 72, 60, 42, 28, 15][i] ?? 30,
  })),
  // Andheri East
  ...Array.from({ length: 18 }, (_, i) => ({
    stopId: "stop-andheri",
    stopName: "Andheri East",
    hour: 6 + i,
    congestionScore: [18, 50, 80, 65, 40, 35, 50, 60, 55, 45, 65, 88, 82, 68, 55, 38, 24, 12][i] ?? 25,
  })),
  // Kurla Station
  ...Array.from({ length: 18 }, (_, i) => ({
    stopId: "stop-kurla",
    stopName: "Kurla Station",
    hour: 6 + i,
    congestionScore: [15, 42, 72, 58, 36, 30, 45, 55, 48, 42, 58, 78, 74, 62, 50, 35, 20, 10][i] ?? 20,
  })),
  // Sion Circle
  ...Array.from({ length: 18 }, (_, i) => ({
    stopId: "stop-sion",
    stopName: "Sion Circle",
    hour: 6 + i,
    congestionScore: [12, 35, 60, 48, 30, 25, 38, 46, 40, 35, 50, 68, 65, 54, 44, 30, 18, 8][i] ?? 18,
  })),
  // Borivali
  ...Array.from({ length: 18 }, (_, i) => ({
    stopId: "stop-borivali",
    stopName: "Borivali Station",
    hour: 6 + i,
    congestionScore: [25, 62, 88, 72, 50, 44, 58, 68, 62, 55, 72, 90, 86, 74, 62, 45, 30, 18][i] ?? 30,
  })),
];

// ------------------------------------------------------------
// System Health
// ------------------------------------------------------------
export const systemHealth: SystemHealthItem[] = [
  { service: "Telemetry Ingestion", status: "operational", uptime: 99.8, latency: 45, lastCheck: new Date(Date.now() - 30000).toISOString() },
  { service: "Headway Engine", status: "operational", uptime: 99.5, latency: 120, lastCheck: new Date(Date.now() - 30000).toISOString() },
  { service: "Case-Study Classifier", status: "operational", uptime: 99.2, latency: 280, lastCheck: new Date(Date.now() - 30000).toISOString() },
  { service: "Forecast Model", status: "operational", uptime: 99.1, latency: 350, lastCheck: new Date(Date.now() - 30000).toISOString() },
  { service: "Decision Engine", status: "operational", uptime: 99.6, latency: 95, lastCheck: new Date(Date.now() - 30000).toISOString() },
  { service: "Notification Service", status: "degraded", uptime: 97.2, latency: 580, lastCheck: new Date(Date.now() - 30000).toISOString() },
  { service: "Commuter ETA Service", status: "operational", uptime: 99.4, latency: 160, lastCheck: new Date(Date.now() - 30000).toISOString() },
  { service: "Map Tiles", status: "operational", uptime: 100, latency: 85, lastCheck: new Date(Date.now() - 30000).toISOString() },
  { service: "Weather API", status: "operational", uptime: 98.8, latency: 420, lastCheck: new Date(Date.now() - 30000).toISOString() },
  { service: "Traffic API", status: "operational", uptime: 99.0, latency: 380, lastCheck: new Date(Date.now() - 30000).toISOString() },
];

// Dashboard summary KPIs
export const dashboardKPIs = {
  activeBuses: 14,
  activeRoutes: 5,
  activeAlerts: 4,
  criticalAlerts: 2,
  bunchingEvents: 2,
  avgHeadwayDeviation: 3.8,
  forecastAccuracy: 88,
  driverCompliance: 76,
  totalPassengersToday: 48240,
  onTimePerformance: 71,
};
