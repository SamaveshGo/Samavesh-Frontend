import type { WeatherData } from "@/types";

export const mockWeather: WeatherData = {
  condition: "rain",
  temperature: 28,
  humidity: 88,
  rainfall: 22,
  visibility: 4.2,
  windSpeed: 18,
  alert: "IMD Orange Alert: Moderate to heavy rainfall expected across Mumbai until 18:00 IST",
  lastUpdated: new Date(Date.now() - 300000).toISOString(),
  waterloggingZones: [
    {
      name: "Sion Underpass",
      severity: "moderate",
      lat: 19.0407,
      lng: 72.8616,
      affectedRoutes: ["312", "A-100", "54"],
    },
    {
      name: "Andheri Subway",
      severity: "low",
      lat: 19.1136,
      lng: 72.8497,
      affectedRoutes: ["A-100", "137"],
    },
    {
      name: "Dadar TT Junction",
      severity: "low",
      lat: 19.0176,
      lng: 72.8462,
      affectedRoutes: ["312", "54"],
    },
    {
      name: "Kurla West Nala",
      severity: "moderate",
      lat: 19.0728,
      lng: 72.8726,
      affectedRoutes: ["378", "54"],
    },
  ],
};

// Hourly weather forecast (next 6 hours)
export const weatherForecast = [
  { hour: "Now", rainfall: 22, temperature: 28, condition: "rain" as const },
  { hour: "14:00", rainfall: 35, temperature: 27, condition: "heavy_rain" as const },
  { hour: "15:00", rainfall: 48, temperature: 26, condition: "heavy_rain" as const },
  { hour: "16:00", rainfall: 38, temperature: 27, condition: "rain" as const },
  { hour: "17:00", rainfall: 18, temperature: 28, condition: "rain" as const },
  { hour: "18:00", rainfall: 8, temperature: 29, condition: "cloudy" as const },
];
