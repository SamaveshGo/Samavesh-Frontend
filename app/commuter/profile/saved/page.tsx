"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Bookmark, Navigation, Bus, BookmarkX } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const CROWDING_STYLE: Record<string, string> = {
  Low: "text-green-800 bg-green-100 border-green-300",
  Moderate: "text-amber-800 bg-amber-100 border-amber-300",
  High: "text-red-800 bg-red-100 border-red-300",
};

const ROUTE_INFO: Record<string, { name: string; route: string; eta: string; crowding: "Low" | "Moderate" | "High"; time: string }> = {
  "312": { name: "BEST 312", route: "Dadar TT → Andheri East", eta: "10 min",  crowding: "Moderate", time: "9:45 AM" },
  "378": { name: "BEST 378", route: "Dadar TT → Andheri East", eta: "15 min",  crowding: "High",     time: "9:55 AM" },
  "332": { name: "BEST 332", route: "Dadar TT → Andheri East", eta: "18 min",  crowding: "Low",      time: "9:53 AM" },
};

export default function SavedRoutesPage() {
  const router = useRouter();
  const [savedIds, setSavedIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("samavesh_saved_routes");
      if (stored) setSavedIds(JSON.parse(stored));
    } catch {/* ignore */}
  }, []);

  const removeSave = (id: string) => {
    setSavedIds((prev) => {
      const next = prev.filter((x) => x !== id);
      localStorage.setItem("samavesh_saved_routes", JSON.stringify(next));
      return next;
    });
  };

  return (
    <div className="px-4 py-5 space-y-4 page-enter select-none pb-24">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-xl hover:bg-secondary transition-colors"
        >
          <ArrowLeft size={18} strokeWidth={2} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-foreground">Saved Routes</h1>
          <p className="text-[10px] text-muted-foreground">{savedIds.length} route{savedIds.length !== 1 ? "s" : ""} saved</p>
        </div>
      </div>

      {/* Empty state */}
      {savedIds.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
            <Bookmark size={28} strokeWidth={1.5} className="text-muted-foreground" />
          </div>
          <div className="text-center">
            <p className="text-base font-semibold text-foreground">No saved routes yet</p>
            <p className="text-xs text-muted-foreground mt-1">Save routes from the My Bus tab to see them here</p>
          </div>
          <Link
            href="/commuter/search"
            className="px-5 py-2.5 bg-primary text-white font-bold rounded-xl text-sm hover:bg-primary/90 transition-colors"
          >
            Browse Routes
          </Link>
        </div>
      )}

      {/* Saved routes list */}
      <AnimatePresence>
        {savedIds.map((id, idx) => {
          const info = ROUTE_INFO[id];
          if (!info) return null;
          return (
            <motion.div
              key={id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ delay: idx * 0.06 }}
              className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden"
            >
              {/* Route info */}
              <div className="flex items-center gap-4 p-4">
                <div className="w-12 h-12 rounded-full border-2 border-primary flex items-center justify-center font-bold text-sm text-primary shrink-0">
                  {id}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold text-foreground">{info.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{info.route}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[10px] text-muted-foreground font-semibold">Crowding</span>
                    <span className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded-full border",
                      CROWDING_STYLE[info.crowding]
                    )}>
                      {info.crowding}
                    </span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-success">{info.eta}</p>
                  <p className="text-[9px] text-muted-foreground mt-0.5 font-mono">Next: {info.time}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 px-4 pb-3 border-t border-border pt-2.5">
                <Link
                  href={`/commuter/track/${id}`}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-primary/8 border border-primary/20 text-primary text-xs font-bold rounded-xl hover:bg-primary hover:text-white transition-all"
                >
                  <Navigation size={13} strokeWidth={2.5} />
                  Track Route
                </Link>
                <button
                  onClick={() => removeSave(id)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-red-50 border border-red-200 text-red-600 text-xs font-bold rounded-xl hover:bg-red-100 transition-all"
                >
                  <BookmarkX size={13} strokeWidth={2.5} />
                  Remove
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
