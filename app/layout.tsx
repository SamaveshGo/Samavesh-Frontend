import type { Metadata } from "next";
import { DM_Serif_Display, Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const dmSerifDisplay = DM_Serif_Display({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-heading",
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s | SAMAVESH",
    default: "SAMAVESH — AI-Powered Bus Bunching Detection for Mumbai BEST",
  },
  description:
    "SAMAVESH predicts bus bunching 10 minutes before it occurs, helps drivers rebalance routes, and gives commuters reliable live ETAs — built for Mumbai BEST.",
  keywords: ["BEST", "Mumbai", "bus bunching", "real-time", "transit intelligence", "SAMAVESH"],
  openGraph: {
    title: "SAMAVESH — Balancing Every Journey",
    description: "AI-Powered Real-Time Bus Bunching Detection & Rebalancing System for Mumbai BEST",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${dmSerifDisplay.variable} ${plusJakartaSans.variable} font-body antialiased`}
        suppressHydrationWarning
      >
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
