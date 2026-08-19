import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "localhost:3000",
    "10.216.208.202:3000",
    "10.216.208.202",
    "0.0.0.0",
    "*.trycloudflare.com",
    "*.loca.lt",
  ],
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.BACKEND_API_URL || "http://localhost:5001"}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
