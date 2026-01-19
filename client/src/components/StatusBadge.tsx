import { cn } from "@/lib/utils";
import type { DrawResult } from "@shared/schema";

interface StatusBadgeProps {
  type: DrawResult;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function StatusBadge({ type, className, size = "md" }: StatusBadgeProps) {
  const styles = {
    small: "bg-green-500/10 text-green-500 border-green-500/20 shadow-[0_0_10px_-4px_rgba(34,197,94,0.3)]",
    draw: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20 shadow-[0_0_10px_-4px_rgba(234,179,8,0.3)]",
    large: "bg-red-500/10 text-red-500 border-red-500/20 shadow-[0_0_10px_-4px_rgba(239,68,68,0.3)]",
  };

  const labels = {
    small: "SMALL (3-9)",
    draw: "DRAW (10-11)",
    large: "LARGE (12-18)",
  };

  const sizeClasses = {
    sm: "px-2 py-0.5 text-[10px]",
    md: "px-2.5 py-1 text-xs",
    lg: "px-3 py-1.5 text-sm",
  };

  return (
    <span className={cn(
      "font-mono font-bold border rounded-full inline-flex items-center justify-center uppercase tracking-wider",
      styles[type],
      sizeClasses[size],
      className
    )}>
      {labels[type]}
    </span>
  );
}
