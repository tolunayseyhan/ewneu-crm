import { Calendar, User, Tag } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatDate } from "@/lib/utils";
import type { Aufgabe } from "@/lib/types";
import { cn } from "@/lib/utils";

interface TaskCardProps {
  aufgabe: Aufgabe;
}

const priorityColor = {
  hoch: "border-l-[#E3000F]",
  mittel: "border-l-orange-400",
  niedrig: "border-l-gray-300",
};

export function TaskCard({ aufgabe }: TaskCardProps) {
  const isOverdue =
    aufgabe.faellig_am &&
    new Date(aufgabe.faellig_am) < new Date() &&
    aufgabe.status !== "erledigt";

  return (
    <Card
      className={cn(
        "border-l-4 hover:shadow-md transition-all duration-200",
        priorityColor[aufgabe.prioritaet] || "border-l-gray-300"
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h4 className="text-sm font-semibold text-foreground leading-snug">
            {aufgabe.titel}
          </h4>
          <StatusBadge status={aufgabe.prioritaet} />
        </div>

        {aufgabe.beschreibung && (
          <p className="text-xs text-muted-foreground mb-3 leading-relaxed line-clamp-2">
            {aufgabe.beschreibung}
          </p>
        )}

        <div className="space-y-1.5">
          {aufgabe.kunde && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Tag className="w-3 h-3 shrink-0" />
              <span className="truncate">{aufgabe.kunde.name1}</span>
            </div>
          )}
          {aufgabe.zugewiesener_name && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <User className="w-3 h-3 shrink-0" />
              <span>{aufgabe.zugewiesener_name}</span>
            </div>
          )}
          {aufgabe.faellig_am && (
            <div
              className={cn(
                "flex items-center gap-1.5 text-xs",
                isOverdue ? "text-red-500 font-medium" : "text-muted-foreground"
              )}
            >
              <Calendar className="w-3 h-3 shrink-0" />
              <span>
                {isOverdue ? "Überfällig: " : "Fällig: "}
                {formatDate(aufgabe.faellig_am)}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
