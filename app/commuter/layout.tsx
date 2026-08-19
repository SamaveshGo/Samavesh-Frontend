import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { MobileNav } from "@/components/layout/MobileNav";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Commuter App — SAMAVESH",
  description: "Mumbai BEST Commuter Assistant powered by SAMAVESH",
};

export default function CommuterLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Scope unified Plus Jakarta Sans typography for all commuter pages */}
      <style>{`
        .commuter-app,
        .commuter-app h1,
        .commuter-app h2,
        .commuter-app h3,
        .commuter-app h4,
        .commuter-app h5,
        .commuter-app h6,
        .commuter-app button,
        .commuter-app input,
        .commuter-app .font-heading {
          font-family: var(--font-sans), 'Plus Jakarta Sans', system-ui, sans-serif !important;
          letter-spacing: -0.02em;
        }
        /* Hide scrollbar but keep scroll */
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* Outer wrapper spanning full viewport with login page background & diagonal stripes */}
      <div className="min-h-screen w-full bg-[#EFE6DE] dark:bg-[#0E0E0E] flex items-center justify-center p-0 sm:p-4 md:p-6 relative overflow-hidden transition-colors duration-300">
        
        {/* Background abstract zebra pattern matching login page & reference image */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.04] dark:opacity-[0.02]">
          {Array.from({ length: 25 }).map((_, i) => (
            <div
              key={i}
              className="absolute bg-foreground"
              style={{
                left: `${(i - 5) * 6}%`,
                width: "3.5%",
                height: "250%",
                top: "-75%",
                transform: "rotate(-35deg)",
              }}
            />
          ))}
        </div>

        {/* Mobile Device Frame - Classic phone ratio (420px width x 95vh length, tall & slim aspect) */}
        <div
          className={`commuter-app flex flex-col w-full sm:w-[420px] sm:max-w-[420px] h-[100dvh] sm:h-[95vh] sm:min-h-[780px] sm:max-h-[920px] bg-background sm:rounded-[44px] sm:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.4)] sm:border-[8px] sm:border-slate-900 relative overflow-hidden z-10 ${inter.className}`}
        >
          {/* Subtle phone speaker notch accent on desktop view */}
          <div className="hidden sm:block absolute top-2.5 left-1/2 -translate-x-1/2 w-28 h-4 bg-slate-900 rounded-full z-50 pointer-events-none opacity-90" />

          {/* Page content - scrollable area */}
          <main className="flex-1 overflow-y-auto pb-28 scrollbar-hide relative z-10">
            {children}
          </main>

          {/* Permanently Sticky Bottom Navigation Bar */}
          <div className="sticky bottom-0 left-0 right-0 z-[999] w-full shrink-0 pointer-events-auto">
            <MobileNav variant="commuter" />
          </div>
        </div>
      </div>
    </>
  );
}
