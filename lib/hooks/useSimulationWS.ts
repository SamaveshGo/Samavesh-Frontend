"use client";

import { useEffect, useState, useRef, useCallback } from "react";

export interface BusTelemetry {
  id: string;
  bus_id: string;
  route_id: string;
  route_number: string;
  operator: string;
  lat: number;
  lon: number;
  status: "RUNNING" | "BOARDING" | "AT_STOP" | "HOLDING" | "FINISHED";
  current_stop?: string;
  next_stop?: string;
  current_stop_index: number;
  total_stops?: number;
  occupancy: number;
  capacity?: number;
  delay: number;
  speed?: number;
  // RL Agent fields
  rl_action?: string;
  rl_action_label?: string;
  rl_action_reason?: string;
  rl_recommendation?: string;
  // Navigation fields
  upcoming_turn?: string;
  turn_instruction?: string;
  distance_to_next_stop?: number;
  next_stop_eta?: number;
  turn_in_meters?: number;
  // Bunching fields
  bunching_alert?: boolean;
  headway_gap?: number;
  hold_time_remaining?: number;
}

export interface SimulationMetrics {
  average_waiting_time_sec?: number;
  average_travel_time_sec?: number;
  passengers_waiting?: number;
  passengers_onboard?: number;
  active_buses_count?: number;
  total_bunching_events?: number;
  average_delay_sec?: number;
}

export interface SimulationPayload {
  status: "connected" | "running" | "paused" | "stopped" | "completed";
  time: string;
  speed?: number;
  buses: BusTelemetry[];
  metrics: SimulationMetrics;
}

// Known local Mac IP fallback for phones on the same Wi-Fi network
const MAC_LAN_IP = "172.30.6.92";

export function useSimulationWS() {
  const [connected, setConnected] = useState<boolean>(false);
  const [payload, setPayload] = useState<SimulationPayload | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<any>(null);
  const urlIndexRef = useRef<number>(0);

  const getCandidateUrls = () => {
    const host = typeof window !== "undefined" ? window.location.hostname : "localhost";
    const isTunnel = host.includes("trycloudflare.com") || host.includes("loca.lt") || host.includes("ngrok");

    const urls = [];
    urls.push(`ws://localhost:8000/ws`);
    urls.push(`ws://127.0.0.1:8000/ws`);
    if (!isTunnel && host !== "localhost" && host !== "127.0.0.1") {
      urls.push(`ws://${host}:8000/ws`);
    }
    urls.push(`ws://${MAC_LAN_IP}:8000/ws`);
    return urls;
  };

  const connect = useCallback(() => {
    if (reconnectRef.current) clearTimeout(reconnectRef.current);

    try {
      const candidateUrls = getCandidateUrls();
      const currentUrl = candidateUrls[urlIndexRef.current % candidateUrls.length];
      
      const ws = new WebSocket(currentUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setPayload(data);
        } catch (e) {
          // parse error fallback
        }
      };

      ws.onerror = () => {
        setConnected(false);
      };

      ws.onclose = () => {
        setConnected(false);
        // Try next candidate URL on failure
        urlIndexRef.current += 1;
        reconnectRef.current = setTimeout(() => {
          connect();
        }, 2000);
      };
    } catch (err) {
      setConnected(false);
      urlIndexRef.current += 1;
      reconnectRef.current = setTimeout(() => {
        connect();
      }, 2000);
    }
  }, []);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
      if (wsRef.current) wsRef.current.close();
    };
  }, [connect]);

  return {
    connected,
    payload,
    buses: payload?.buses || [],
    time: payload?.time || "08:00:00",
    metrics: payload?.metrics || {},
    status: payload?.status || "stopped"
  };
}
