import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const statusConfig: Record<
  string,
  { label: string; variant: "success" | "warning" | "red" | "info" | "secondary" | "outline" }
> = {
  aktiv: { label: "Aktiv", variant: "success" },
  inaktiv: { label: "Inaktiv", variant: "secondary" },
  neu: { label: "Neu", variant: "info" },
  offen: { label: "Offen", variant: "warning" },
  in_bearbeitung: { label: "In Bearbeitung", variant: "info" },
  erledigt: { label: "Erledigt", variant: "success" },
  hoch: { label: "Hoch", variant: "red" },
  mittel: { label: "Mittel", variant: "warning" },
  niedrig: { label: "Niedrig", variant: "secondary" },
  angenommen: { label: "Angenommen", variant: "success" },
  abgelehnt: { label: "Abgelehnt", variant: "red" },
  in_verhandlung: { label: "In Verhandlung", variant: "info" },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] || { label: status, variant: "outline" as const };
  return (
    <Badge
      variant={config.variant}
      className={cn("whitespace-nowrap", className)}
    >
      {config.label}
    </Badge>
  );
}
