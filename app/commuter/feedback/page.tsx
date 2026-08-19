"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Star, ThumbsUp, ThumbsDown, Check, Frown, Meh, Smile, Laugh } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { key: "onTime", label: "On-Time" },
  { key: "crowding", label: "Clean Bus" },
  { key: "driverBehavior", label: "Driver Behavior" },
  { key: "cleanliness", label: "Crowding Info" },
];

export default function FeedbackPage() {
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const toggleCategory = (key: string) => {
    setSelectedCategories(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-8 text-center page-enter">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
        >
          <div className="w-20 h-20 rounded-full bg-success/15 flex items-center justify-center mx-auto mb-4">
            <Check size={36} className="text-success" strokeWidth={2.5} />
          </div>
        </motion.div>
        <h2 className="font-heading text-2xl text-foreground mb-2">Thank you!</h2>
        <p className="text-sm text-muted-foreground mb-6">Your feedback helps improve Mumbai BEST for everyone.</p>
        <Link href="/commuter" className="px-6 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-xl">
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="px-4 py-5 space-y-5 page-enter select-none pb-20">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/commuter" className="p-2 rounded-xl hover:bg-secondary transition-colors">
          <ArrowLeft size={18} strokeWidth={2} />
        </Link>
        <div>
          <h1 className="font-heading text-xl text-foreground font-bold">How was your ride?</h1>
          <p className="text-xs text-muted-foreground mt-0.5">BEST 312 · Today, 9:30 AM</p>
        </div>
      </div>

      {/* Rating scale with Lucide Icons */}
      <div className="samavesh-card p-5 text-center border border-border shadow-sm">
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">Rate your overall experience</p>
        <div className="flex justify-around items-center">
          {[
            { rate: 1, icon: ThumbsDown, label: "Very Bad", color: "text-red-500" },
            { rate: 2, icon: Frown, label: "Bad", color: "text-amber-500" },
            { rate: 3, icon: Meh, label: "Okay", color: "text-yellow-500" },
            { rate: 4, icon: Smile, label: "Good", color: "text-emerald-500" },
            { rate: 5, icon: Laugh, label: "Excellent", color: "text-emerald-600" },
          ].map((item) => {
            const Icon = item.icon;
            const isSelected = rating === item.rate;
            return (
              <button
                key={item.rate}
                onClick={() => setRating(item.rate)}
                type="button"
                className={cn(
                  "flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all",
                  isSelected ? "scale-110 font-bold bg-secondary" : "opacity-60 hover:opacity-100"
                )}
              >
                <Icon size={24} className={cn(isSelected ? item.color : "text-muted-foreground")} />
                <span className={cn("text-[9px] uppercase tracking-wider font-extrabold", isSelected ? "text-primary" : "text-muted-foreground")}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* What went well */}
      <div className="samavesh-card p-4 border border-border">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">What went well?</p>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => toggleCategory(key)}
              type="button"
              className={cn(
                "flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-full border transition-all",
                selectedCategories.includes(key)
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground hover:border-primary/40 hover:bg-secondary/40"
              )}
            >
              {selectedCategories.includes(key) && <Check size={10} strokeWidth={3} />}
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Comment */}
      <div className="samavesh-card p-4 border border-border">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">What can we improve?</p>
        <textarea
          rows={3}
          placeholder="Write your feedback..."
          className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/40 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/40 transition-colors resize-none font-semibold"
        />
      </div>

      {/* Submit */}
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={() => setSubmitted(true)}
        type="button"
        className="w-full py-4 bg-primary text-primary-foreground text-sm font-bold rounded-2xl hover:bg-primary/95 transition-all text-center"
      >
        Submit
      </motion.button>
    </div>
  );
}

function cn_inline(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
