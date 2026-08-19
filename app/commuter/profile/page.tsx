"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Settings, CreditCard, Bell, HelpCircle, LogOut, ChevronRight, Star, MapPin } from "lucide-react";

const MENU_ITEMS = [
  { icon: CreditCard, label: "My Passes & Tickets", href: "/commuter/tickets",        color: "text-emerald-500" },
  { icon: Bell,       label: "Notifications",        href: "#",                         color: "text-amber-500" },
  { icon: MapPin,     label: "Saved Routes",          href: "/commuter/profile/saved",  color: "text-blue-500" },
  { icon: Star,       label: "Feedback History",      href: "/commuter/feedback",        color: "text-yellow-500" },
  { icon: Settings,   label: "Settings",              href: "#",                         color: "text-muted-foreground" },
  { icon: HelpCircle, label: "Help & Support",        href: "#",                         color: "text-muted-foreground" },
];

export default function CommuterProfilePage() {
  const router = useRouter();
  const [savedCount, setSavedCount] = useState(0);
  const [commuter, setCommuter] = useState({
    name: "Priya Sharma",
    email: "priya.sharma@example.com"
  });

  useEffect(() => {
    try {
      const stored = localStorage.getItem("samavesh_saved_routes");
      if (stored) setSavedCount(JSON.parse(stored).length);
    } catch {/* ignore */}

    try {
      const storedUser = localStorage.getItem("samavesh_user");
      if (storedUser) {
        const user = JSON.parse(storedUser);
        if (user.name) {
          setCommuter({
            name: user.name,
            email: user.email || user.phone || "No contact info"
          });
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  return (
    <div className="px-4 py-6 space-y-6 page-enter select-none pb-24">
      {/* Avatar + Name */}
      <div className="flex flex-col items-center gap-3 pt-2">
        <div className="w-20 h-20 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center shadow-lg">
          <User size={36} className="text-primary" />
        </div>
        <div className="text-center">
          <p className="text-xl font-bold text-foreground">{commuter.name}</p>
          <p className="text-sm text-muted-foreground">{commuter.email}</p>
        </div>
        {/* Stats row */}
        <div className="flex gap-6 mt-1">
          {[
            { label: "Trips",  value: "142" },
            { label: "Saved",  value: "₹640" },
            { label: "Points", value: "890" },
          ].map(({ label, value }) => (
            <div key={label} className="text-center">
              <p className="font-bold text-foreground text-lg">{value}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Menu items */}
      <div className="space-y-2">
        {MENU_ITEMS.map(({ icon: Icon, label, href, color }) => (
          <Link
            key={label}
            href={href}
            className="flex items-center gap-4 bg-card rounded-2xl px-4 py-3.5 border border-border hover:border-primary/30 hover:bg-primary/5 transition-all group"
          >
            <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center shrink-0">
              <Icon size={18} className={color} />
            </div>
            <span className="flex-1 font-medium text-sm text-foreground">{label}</span>
            {label === "Saved Routes" && savedCount > 0 && (
              <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">
                {savedCount}
              </span>
            )}
            <ChevronRight size={16} className="text-muted-foreground group-hover:text-primary transition-colors" />
          </Link>
        ))}
      </div>

      {/* Sign out */}
      <button 
        onClick={() => {
          localStorage.removeItem("samavesh_token");
          localStorage.removeItem("samavesh_user");
          router.push("/");
        }}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-red-200 text-red-500 hover:bg-red-50 transition-colors font-semibold text-sm"
      >
        <LogOut size={16} />
        Sign Out
      </button>
    </div>
  );
}
