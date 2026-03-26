import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: number;
  trendLabel?: string;
  color?: "red" | "blue" | "green" | "orange";
  subtitle?: string;
}

const colorMap = {
  red: "bg-[#E3000F]/10 text-[#E3000F]",
  blue: "bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
  green: "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400",
  orange: "bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400",
};

export function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  trendLabel,
  color = "blue",
  subtitle,
}: StatCardProps) {
  const isPositive = trend !== undefined && trend >= 0;

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
            )}
            {trend !== undefined && (
              <div className="flex items-center gap-1 mt-2">
                {isPositive ? (
                  <TrendingUp className="w-3.5 h-3.5 text-green-500" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5 text-red-500" />
                )}
                <span
                  className={cn(
                    "text-xs font-medium",
                    isPositive ? "text-green-600" : "text-red-600"
                  )}
                >
                  {isPositive ? "+" : ""}
                  {trend}%
                </span>
                {trendLabel && (
                  <span className="text-xs text-muted-foreground">
                    {trendLabel}
                  </span>
                )}
              </div>
            )}
          </div>
          <div
            className={cn(
              "flex items-center justify-center w-11 h-11 rounded-2xl shrink-0",
              colorMap[color]
            )}
          >
            <Icon className="w-5 h-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
