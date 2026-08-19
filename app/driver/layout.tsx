import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { DriverNav } from "@/components/layout/DriverNav";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Driver App — SAMAVESH",
  description: "In-cab assistant for Mumbai BEST bus drivers",
};

export default function DriverLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style>{`
        .driver-app,
        .driver-app h1, .driver-app h2, .driver-app h3,
        .driver-app h4, .driver-app h5, .driver-app h6,
        .driver-app button, .driver-app input {
          font-family: var(--font-sans), 'Plus Jakarta Sans', system-ui, sans-serif !important;
          letter-spacing: -0.02em;
        }
        /* Hide scrollbar but keep scroll */
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <div className="driver-app bg-[#EFE6DE] text-slate-900 min-h-screen">

        {/* Desktop: sidebar left + content right */}
        <div className="hidden lg:flex h-screen overflow-hidden">
          {/* Desktop Sidebar Nav */}
          <DriverNav variant="sidebar" />
          {/* Main content scrollable */}
          <main className="flex-1 overflow-y-auto scrollbar-hide bg-[#EFE6DE]">
            {children}
          </main>
        </div>

        {/* Mobile: stacked + bottom nav */}
        <div className="lg:hidden flex flex-col min-h-screen">
          <main className="flex-1 overflow-y-auto scrollbar-hide pb-24 bg-[#EFE6DE]">
            {children}
          </main>
          <DriverNav variant="bottom" />
        </div>

      </div>
    </>
  );
}
