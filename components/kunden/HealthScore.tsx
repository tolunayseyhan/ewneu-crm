import { calculateHealthScore } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface HealthScoreProps {
  lastVisitDate?: string | null;
  showLabel?: boolean;
  size?: "sm" | "md";
}

export function HealthScore({ lastVisitDate, showLabel = true, size = "sm" }: HealthScoreProps) {
  const { score, label, color } = calculateHealthScore(lastVisitDate);

  const dotColor = {
    green: "bg-green-500",
    yellow: "bg-yellow-500",
    red: "bg-red-500",
  }[color];

  const textColor = {
    green: "text-green-600 dark:text-green-400",
    yellow: "text-yellow-600 dark:text-yellow-400",
    red: "text-red-600 dark:text-red-400",
  }[color];

  const bgColor = {
    green: "bg-green-100 dark:bg-green-900/20",
    yellow: "bg-yellow-100 dark:bg-yellow-900/20",
    red: "bg-red-100 dark:bg-red-900/20",
  }[color];

  if (size === "sm") {
    return (
      <div className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full", bgColor)}>
        <div className={cn("w-1.5 h-1.5 rounded-full", dotColor)} />
        {showLabel && (
          <span className={cn("text-xs font-medium", textColor)}>{label}</span>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">Kundenpflege</span>
        <div className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium", bgColor, textColor)}>
          <div className={cn("w-1.5 h-1.5 rounded-full", dotColor)} />
          {label}
        </div>
      </div>
      <div className="w-full bg-muted rounded-full h-1.5">
        <div
          className={cn("h-1.5 rounded-full transition-all duration-500", dotColor)}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}
