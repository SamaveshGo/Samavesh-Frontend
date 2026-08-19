"use client";

import { useRouter } from "next/navigation";
import { ChevronRight, LogOut, Settings, HelpCircle, FileText, User, Shield } from "lucide-react";

const MENU = [
  { icon: User,       label: "My Profile",       sub: "Rajesh Kamble — drv-002",   href: "#" },
  { icon: Settings,   label: "Preferences",      sub: "Theme, language, alerts",   href: "#" },
  { icon: FileText,   label: "Trip History",     sub: "All past shifts & routes",  href: "#" },
  { icon: Shield,     label: "Safety Guidelines",sub: "BEST operational norms",    href: "#" },
  { icon: HelpCircle, label: "Help & Support",   sub: "Contact the control room",  href: "#" },
];

import { useState, useEffect } from "react";

export default function DriverMorePage() {
  const router = useRouter();

  const [driver, setDriver] = useState({
    name: "Rajesh Kamble",
    idInfo: "Employee ID: drv-002",
    subInfo: "Route 312 · Dadar Depot"
  });

  useEffect(() => {
    try {
      const stored = localStorage.getItem("samavesh_user");
      if (stored) {
        const user = JSON.parse(stored);
        if (user.name) {
          setDriver({
            name: user.name,
            idInfo: user.phone ? `Phone: +91 ${user.phone}` : user.email ? `Email: ${user.email}` : "Employee ID: drv-002",
            subInfo: "Route 312 · Dadar Depot"
          });
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const menuItems = [
    { icon: User,       label: "My Profile",       sub: `${driver.name} · ${driver.idInfo}`,   href: "#" },
    { icon: Settings,   label: "Preferences",      sub: "Theme, language, alerts",   href: "#" },
    { icon: FileText,   label: "Trip History",     sub: "All past shifts & routes",  href: "#" },
    { icon: Shield,     label: "Safety Guidelines",sub: "BEST operational norms",    href: "#" },
    { icon: HelpCircle, label: "Help & Support",   sub: "Contact the control room",  href: "#" },
  ];

  return (
    <div className="px-5 py-6 space-y-5 pb-28 page-enter select-none bg-white min-h-screen text-slate-900">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">More</h1>
        <p className="text-xs text-slate-600 font-medium mt-0.5">Settings &amp; Account</p>
      </div>

      {/* Profile card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4 shadow-sm border-l-4 border-l-[#C8102E]">
        <div className="w-14 h-14 rounded-full bg-red-50 border-2 border-red-200 flex items-center justify-center shrink-0">
          <User size={24} className="text-[#C8102E]" strokeWidth={2} />
        </div>
        <div>
          <p className="font-black text-slate-900 text-base">{driver.name}</p>
          <p className="text-xs text-slate-600 font-medium">{driver.idInfo}</p>
          <p className="text-xs text-slate-500 font-bold">{driver.subInfo}</p>
        </div>
      </div>

      {/* Menu */}
      <div className="space-y-2">
        {menuItems.map(({ icon: Icon, label, sub, href }) => (
          <button
            key={label}
            className="w-full flex items-center gap-4 bg-white rounded-2xl px-4 py-3.5 border border-slate-200 hover:border-red-200 hover:bg-red-50/50 transition-all text-left shadow-sm"
          >
            <div className="w-9 h-9 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center shrink-0">
              <Icon size={17} strokeWidth={2} className="text-[#C8102E]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-900">{label}</p>
              <p className="text-[10px] text-slate-500 font-medium truncate">{sub}</p>
            </div>
            <ChevronRight size={15} className="text-slate-400 shrink-0" />
          </button>
        ))}
      </div>

      {/* Sign out */}
      <button
        onClick={() => {
          localStorage.removeItem("samavesh_token");
          localStorage.removeItem("samavesh_user");
          router.push("/");
        }}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-red-200 bg-red-50 text-[#C8102E] hover:bg-[#C8102E] hover:text-white transition-all font-black text-xs uppercase tracking-wider shadow-sm"
      >
        <LogOut size={16} />
        Sign Out
      </button>
    </div>
  );
}
