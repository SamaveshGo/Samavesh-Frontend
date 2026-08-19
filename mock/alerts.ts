import type { Alert } from "@/types";

const now = new Date();
const addMin = (min: number) => new Date(now.getTime() + min * 60000).toISOString();
const subMin = (min: number) => new Date(now.getTime() - min * 60000).toISOString();

export const mockAlerts: Alert[] = [
  // CS1: Same-route bunching — Route 312
  {
    id: "alert-001",
    caseStudy: 1,
    severity: "critical",
    routeId: "route-312",
    routeNumber: "312",
    busId: "bus-312-1",
    stopId: "stop-dadar",
    stopName: "Dadar TT",
    title: "Bunching Risk — Route 312",
    description:
      "MH-01-LA-6678 is 1.8 km behind MH-01-LA-1234, with headway collapsed from 10 min to 2.3 min. Bus ahead is slowed by heavy boarding at Dadar TT.",
    recommendedAction: "HOLD at Dadar TT for 3 min at next stop to restore safe headway",
    riskScore: 92,
    timeToEvent: 5,
    createdAt: subMin(2),
    expiresAt: addMin(8),
    status: "active",
    commandStatus: "pending",
  },

  // CS2: Stop congestion — Andheri East
  {
    id: "alert-002",
    caseStudy: 2,
    severity: "watch",
    routeId: "route-a100",
    routeNumber: "A-100",
    busId: "bus-a100-2",
    stopId: "stop-andheri",
    stopName: "Andheri East",
    title: "Stop Congestion — Andheri East",
    description:
      "7 of 10 bays occupied at Andheri East. Routes 312, A-100, and 137 converging within 3-min window — bay saturation predicted in 8 min.",
    recommendedAction: "Use Bay 3 / alternate queue position. Route A-100 to proceed to Bay 4.",
    riskScore: 71,
    timeToEvent: 8,
    createdAt: subMin(5),
    expiresAt: addMin(10),
    status: "active",
    commandStatus: "acknowledged",
  },

  // CS3: Traffic incident — Western Express Highway
  {
    id: "alert-003",
    caseStudy: 3,
    severity: "critical",
    routeId: "route-137",
    routeNumber: "137",
    busId: "bus-137-2",
    stopName: "Western Express Highway, Malad",
    title: "Traffic Incident — WEH Slowdown",
    description:
      "Multi-vehicle accident near Malad on Western Express Highway. Corridor speed dropped from 42 kmph to 8 kmph. Routes 137, A-100 affected.",
    recommendedAction: "Reroute via SV Road — saves ~6 min. Reduce speed, maintain formation.",
    riskScore: 85,
    timeToEvent: 10,
    createdAt: subMin(8),
    expiresAt: addMin(15),
    status: "active",
    commandStatus: "pending",
  },

  // CS4: Weather — Monsoon
  {
    id: "alert-004",
    caseStudy: 4,
    severity: "watch",
    routeId: "route-378",
    routeNumber: "378",
    busId: "bus-378-1",
    stopName: "Sion Circle",
    title: "Monsoon Impact — Sion Waterlogging",
    description:
      "Heavy rainfall (38 mm/hr) at Sion causing waterlogging. Ridership surge +28% across corridor. Dwell times extended city-wide. Standby bus dispatched.",
    recommendedAction: "Expect extended dwell times — corridor headway auto-widened. Standby MH-01-LA-7777 deployed.",
    riskScore: 63,
    timeToEvent: 15,
    createdAt: subMin(12),
    expiresAt: addMin(20),
    status: "active",
    commandStatus: "complied",
  },

  // Resolved alert
  {
    id: "alert-005",
    caseStudy: 1,
    severity: "resolved",
    routeId: "route-54",
    routeNumber: "54",
    busId: "bus-54-1",
    stopName: "Matunga (E)",
    title: "Bunching Resolved — Route 54",
    description:
      "Hold action at Matunga (E) successfully restored headway from 2.1 min to 7.8 min. Driver complied within 45 seconds.",
    recommendedAction: "Resume normal service. Monitor headway.",
    riskScore: 12,
    timeToEvent: 0,
    createdAt: subMin(25),
    expiresAt: subMin(5),
    status: "resolved",
    commandStatus: "complied",
  },

  // CS2: BKC congestion
  {
    id: "alert-006",
    caseStudy: 2,
    severity: "watch",
    routeId: "route-312",
    routeNumber: "312",
    busId: "bus-312-3",
    stopId: "stop-bkc",
    stopName: "Bandra Kurla Complex",
    title: "Stop Queue Building — BKC",
    description:
      "Office rush at BKC causing queuing on carriageway. Bay 2 occupied. ETA impact +3 min for trailing buses.",
    recommendedAction: "Proceed to Bay 1. Accept partial boarding if bay occupied.",
    riskScore: 55,
    timeToEvent: 12,
    createdAt: subMin(3),
    expiresAt: addMin(12),
    status: "active",
    commandStatus: "pending",
  },
];

export const getActiveAlerts = () => mockAlerts.filter((a) => a.status === "active");
export const getCriticalAlerts = () => mockAlerts.filter((a) => a.severity === "critical" && a.status === "active");
export const getAlertsByRoute = (routeNumber: string) => mockAlerts.filter((a) => a.routeNumber === routeNumber);
export const getAlertsByCaseStudy = (cs: number) => mockAlerts.filter((a) => a.caseStudy === cs);
