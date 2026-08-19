// ============================================================
// SAMAVESH — Core TypeScript Types
// Mumbai BEST Bus Bunching Detection & Rebalancing System
// ============================================================

export type CaseStudyType = 1 | 2 | 3 | 4;

export type BusStatus = "on_time" | "delayed" | "bunching_risk" | "bunching" | "standby" | "offline";

export type AlertSeverity = "watch" | "critical" | "info" | "resolved";

export type CrowdingLevel = "low" | "moderate" | "high" | "full";

export type WeatherCondition = "clear" | "cloudy" | "rain" | "heavy_rain" | "waterlogging";

export type TrafficLevel = "free" | "moderate" | "heavy" | "standstill";

export type CommandStatus = "pending" | "acknowledged" | "complied" | "cannot_comply" | "expired";

export type DriverComplianceReason = "traffic" | "breakdown" | "passenger_issue" | "other";

// ------------------------------------------------------------
// Route
// ------------------------------------------------------------
export interface Route {
  id: string;
  number: string;
  name: string;
  color: string;
  from: string;
  to: string;
  stops: string[];
  scheduledHeadway: number; // minutes
  currentHeadway: number; // minutes
  activeBuses: number;
  status: "normal" | "at_risk" | "bunching" | "disrupted";
  lastUpdated: string;
}

// ------------------------------------------------------------
// Stop
// ------------------------------------------------------------
export interface Stop {
  id: string;
  name: string;
  shortName: string;
  lat: number;
  lng: number;
  routes: string[];
  bayCount: number;
  baysOccupied: number;
  congestionLevel: "low" | "moderate" | "high";
  nextArrivals: Arrival[];
  liveBoarding: number;
}

export interface Arrival {
  busId: string;
  routeNumber: string;
  eta: number; // minutes
  crowding: CrowdingLevel;
  isBunching?: boolean;
}

// ------------------------------------------------------------
// Bus
// ------------------------------------------------------------
export interface Bus {
  id: string;
  displayId: string;
  routeId: string;
  routeNumber: string;
  driverId: string;
  driverName: string;
  lat: number;
  lng: number;
  speed: number; // kmph
  heading: number; // degrees
  status: BusStatus;
  passengerCount: number;
  capacity: number;
  crowding: CrowdingLevel;
  currentStop: string;
  nextStop: string;
  headwayToBusAhead: number; // minutes
  headwayToBusBehind: number; // minutes
  distanceToBusAhead: number; // km
  distanceToBusBehind: number; // km
  eta: number; // minutes to next stop
  delay: number; // minutes behind schedule (negative = ahead)
  lastUpdated: string;
}

// ------------------------------------------------------------
// Alert
// ------------------------------------------------------------
export interface Alert {
  id: string;
  caseStudy: CaseStudyType;
  severity: AlertSeverity;
  routeId: string;
  routeNumber: string;
  busId: string;
  stopId?: string;
  stopName?: string;
  title: string;
  description: string;
  recommendedAction: string;
  riskScore: number; // 0-100
  timeToEvent: number; // minutes
  createdAt: string;
  expiresAt: string;
  status: "active" | "acknowledged" | "resolved" | "expired";
  commandStatus?: CommandStatus;
  driverResponse?: DriverComplianceReason;
}

// ------------------------------------------------------------
// Headway Data Point
// ------------------------------------------------------------
export interface HeadwayDataPoint {
  time: string;
  scheduled: number;
  actual: number;
  bus1: number;
  bus2: number;
  bus3?: number;
}

// ------------------------------------------------------------
// Forecast
// ------------------------------------------------------------
export interface ForecastPoint {
  time: string;
  riskScore: number;
  confidence: number;
  caseStudy?: CaseStudyType;
  label?: string;
}

export interface ForecastItem {
  routeId: string;
  routeNumber: string;
  stopName: string;
  riskScore: number;
  timeToEvent: number; // minutes
  caseStudy: CaseStudyType;
  confidence: number;
}

// ------------------------------------------------------------
// Weather
// ------------------------------------------------------------
export interface WeatherData {
  condition: WeatherCondition;
  temperature: number; // °C
  humidity: number; // %
  rainfall: number; // mm/hr
  visibility: number; // km
  windSpeed: number; // kmph
  waterloggingZones: WaterloggingZone[];
  alert?: string;
  lastUpdated: string;
}

export interface WaterloggingZone {
  name: string;
  severity: "low" | "moderate" | "severe";
  lat: number;
  lng: number;
  affectedRoutes: string[];
}

// ------------------------------------------------------------
// Traffic
// ------------------------------------------------------------
export interface TrafficData {
  overallLevel: TrafficLevel;
  corridors: TrafficCorridor[];
  incidents: TrafficIncident[];
  lastUpdated: string;
}

export interface TrafficCorridor {
  id: string;
  name: string;
  level: TrafficLevel;
  avgSpeed: number; // kmph
  affectedRoutes: string[];
  from: string;
  to: string;
}

export interface TrafficIncident {
  id: string;
  type: "accident" | "waterlogging" | "vip_movement" | "road_work" | "festival" | "signal_failure";
  location: string;
  severity: "low" | "moderate" | "high";
  description: string;
  estimatedClearance: string;
  affectedRoutes: string[];
  lat: number;
  lng: number;
}

// ------------------------------------------------------------
// Driver
// ------------------------------------------------------------
export interface Driver {
  id: string;
  employeeId: string;
  name: string;
  busId: string;
  routeId: string;
  routeNumber: string;
  shiftStart: string;
  shiftEnd: string;
  currentStatus: "driving" | "at_stop" | "on_hold" | "off_duty";
  alertsReceived: number;
  alertsComplied: number;
  complianceRate: number;
  headwayScore: number; // 0-100
}

// ------------------------------------------------------------
// Simulation
// ------------------------------------------------------------
export interface SimulationScenario {
  id: string;
  name: string;
  description: string;
  caseStudy: CaseStudyType;
  route: string;
  stops: string[];
  duration: number; // minutes
  weatherCondition: WeatherCondition;
  trafficLevel: TrafficLevel;
}

export interface SimulationState {
  isPlaying: boolean;
  currentTime: number; // seconds from start
  totalDuration: number; // seconds
  speed: number; // playback speed multiplier
  scenario: SimulationScenario | null;
  weatherEnabled: boolean;
  trafficEnabled: boolean;
}

// ------------------------------------------------------------
// Analytics
// ------------------------------------------------------------
export interface PerformanceMetric {
  label: string;
  value: number;
  unit: string;
  change: number; // % change
  trend: "up" | "down" | "flat";
  target?: number;
}

export interface RidershipDataPoint {
  time: string;
  route312: number;
  routeA100: number;
  route137: number;
  route378: number;
  route54: number;
}

export interface HeatmapCell {
  stopId: string;
  stopName: string;
  hour: number;
  congestionScore: number; // 0-100
}

// ------------------------------------------------------------
// Commuter
// ------------------------------------------------------------
export interface CommuterProfile {
  id: string;
  name: string;
  savedRoutes: string[];
  savedStops: string[];
  pass: Pass | null;
  feedbackCount: number;
}

export interface Pass {
  type: "best_chain" | "metro_bus" | "daily";
  label: string;
  validUntil: string;
  fare: number;
  qrCode: string;
}

export interface FeedbackSubmission {
  rating: number;
  categories: {
    onTime: boolean;
    crowding: boolean;
    driverBehavior: boolean;
    cleanliness: boolean;
  };
  comment?: string;
  routeNumber: string;
  busId: string;
  stopName: string;
}

// ------------------------------------------------------------
// System Health
// ------------------------------------------------------------
export interface SystemHealthItem {
  service: string;
  status: "operational" | "degraded" | "down";
  uptime: number; // %
  latency: number; // ms
  lastCheck: string;
}

// ------------------------------------------------------------
// KPI Card
// ------------------------------------------------------------
export interface KPIData {
  label: string;
  value: string | number;
  unit?: string;
  change?: number;
  trend?: "up" | "down" | "flat";
  icon?: string;
  color?: string;
}
