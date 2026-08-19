import type { Metadata } from "next";
import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { TopNav } from "@/components/layout/TopNav";

export const metadata: Metadata = {
  title: "Controller Dashboard",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <DashboardSidebar alertCount={4} />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopNav />
        <main className="flex-1 overflow-y-auto scrollbar-thin">
          {children}
        </main>
      </div>
    </div>
  );
}
