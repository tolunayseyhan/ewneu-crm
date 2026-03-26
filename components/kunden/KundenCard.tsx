import Link from "next/link";
import { Phone, Mail, MapPin, Building2, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { HealthScore } from "./HealthScore";
import { formatCurrency } from "@/lib/utils";
import type { Kunde } from "@/lib/types";

interface KundenCardProps {
  kunde: Kunde;
}

export function KundenCard({ kunde }: KundenCardProps) {
  return (
    <Card className="hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 group">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-muted-foreground">
                {kunde.nummer}
              </span>
              <StatusBadge status={kunde.status} />
            </div>
            <h3 className="font-semibold text-foreground truncate text-sm">
              {kunde.name1}
            </h3>
            {kunde.name2 && (
              <p className="text-xs text-muted-foreground truncate">{kunde.name2}</p>
            )}
          </div>
        </div>

        <div className="space-y-1.5 mb-4">
          {kunde.ort && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <MapPin className="w-3 h-3 shrink-0" />
              <span className="truncate">
                {kunde.plz} {kunde.ort}
              </span>
            </div>
          )}
          {kunde.telefon && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Phone className="w-3 h-3 shrink-0" />
              <span className="truncate">{kunde.telefon}</span>
            </div>
          )}
          {kunde.branche && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Building2 className="w-3 h-3 shrink-0" />
              <span className="truncate">{kunde.branche}</span>
            </div>
          )}
        </div>

        {kunde.umsatz !== undefined && kunde.umsatz > 0 && (
          <div className="mb-3 px-3 py-2 bg-muted/50 rounded-xl">
            <p className="text-[10px] text-muted-foreground">Jahresumsatz</p>
            <p className="text-sm font-bold text-foreground">
              {formatCurrency(kunde.umsatz)}
            </p>
          </div>
        )}

        <HealthScore lastVisitDate={kunde.letzte_besuch} size="md" />

        <Link
          href={`/kunden/${kunde.id}`}
          className="flex items-center justify-between mt-4 pt-3 border-t border-border text-xs font-medium text-[#E3000F] hover:text-[#cc000e] transition-colors"
        >
          <span>Details anzeigen</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </CardContent>
    </Card>
  );
}
