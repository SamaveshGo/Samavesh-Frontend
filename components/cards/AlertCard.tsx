"use client";

import React from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Info, Bell, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AlertCardProps {
  alert: {
    id: string;
    title: string;
    description?: string;
    severity?: "info" | "warning" | "critical" | "success";
    time?: string;
  };
  index?: number;
  onClick?: () => void;
}

export const AlertCard: React.FC<AlertCardProps> = ({
  alert,
  index = 0,
  onClick,
}) => {
  const getIcon = () => {
    switch (alert.severity) {
      case "critical":
        return <AlertTriangle className="w-4 h-4 text-danger" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-warning" />;
      case "success":
        return <CheckCircle2 className="w-4 h-4 text-success" />;
      default:
        return <Info className="w-4 h-4 text-info" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      onClick={onClick}
      className={cn(
        "p-3 rounded-xl border bg-card hover:bg-accent/40 transition-all cursor-pointer flex items-start gap-3 border-border"
      )}
    >
      <div className="shrink-0 mt-0.5">{getIcon()}</div>
      <div className="flex-1 min-w-0">
        <h4 className="text-xs font-bold text-foreground truncate">{alert.title}</h4>
        {alert.description && (
          <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">
            {alert.description}
          </p>
        )}
        {alert.time && (
          <span className="text-[9px] font-semibold text-muted-foreground/80 mt-1 block">
            {alert.time}
          </span>
        )}
      </div>
    </motion.div>
  );
};

export default AlertCard;
