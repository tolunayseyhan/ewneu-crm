"use client";

import { useState } from "react";
import Link from "next/link";
import { MapPin, Plus, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { NeuerBesuchModal } from "@/components/modals/NeuerBesuchModal";
import { useCRM } from "@/lib/crm-context";
import { formatDate } from "@/lib/utils";

interface Props {
  kundeId: string;
  kundeName: string;
}

export function KundenBesucheTab({ kundeId, kundeName }: Props) {
  const { besuche, addBesuch } = useCRM();
  const [showModal, setShowModal] = useState(false);

  const kundenBesuche = besuche
    .filter((b) => b.kunde_id === kundeId)
    .sort((a, b) => {
      const dateA = a.durchgefuehrt_am || a.faellig_am || a.created_at;
      const dateB = b.durchgefuehrt_am || b.faellig_am || b.created_at;
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {kundenBesuche.length} Besuch{kundenBesuche.length !== 1 ? "e" : ""}
        </p>
        <Button size="sm" variant="outline" className="gap-2" onClick={() => setShowModal(true)}>
          <Plus className="w-3.5 h-3.5" /> Besuch planen
        </Button>
      </div>

      {kundenBesuche.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-8 text-center">
          <MapPin className="w-8 h-8 mx-auto mb-2 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">Noch keine Besuche erfasst</p>
          <Button
            size="sm"
            variant="outline"
            className="mt-3 gap-2"
            onClick={() => setShowModal(true)}
          >
            <Plus className="w-3.5 h-3.5" /> Besuch planen
          </Button>
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Datum</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden sm:table-cell">Zeitraum</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden md:table-cell">Mitarbeiter</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {kundenBesuche.map((besuch) => {
                const displayDate = besuch.status === "erledigt"
                  ? besuch.durchgefuehrt_am
                  : besuch.faellig_am;
                return (
                  <tr key={besuch.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium">
                        {displayDate ? formatDate(displayDate) : "–"}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="text-xs text-muted-foreground">
                        {besuch.uhrzeit_von && besuch.uhrzeit_bis
                          ? `${besuch.uhrzeit_von}–${besuch.uhrzeit_bis}`
                          : besuch.dauer_minuten ? `${besuch.dauer_minuten} Min.` : "–"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <StatusBadge status={besuch.status} />
                        {besuch.bericht && <span className="text-xs" title="Bericht vorhanden">📝</span>}
                        {(besuch.anhänge?.length ?? 0) > 0 && <span className="text-xs" title="Anhänge vorhanden">📎</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-xs text-muted-foreground">{besuch.mitarbeiter_name || "–"}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/besuche/${besuch.id}`}>
                        <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
                          <FileText className="w-3 h-3" /> Bericht
                        </Button>
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <NeuerBesuchModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onAdd={addBesuch}
        defaultKundeId={kundeId}
      />
    </div>
  );
}
