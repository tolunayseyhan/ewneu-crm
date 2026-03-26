"use client";

import { useState } from "react";
import { Phone, Check, Plus, Clock } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { NeuerAnrufModal } from "@/components/modals/NeuerAnrufModal";
import { mockAnrufe } from "@/lib/mock-data";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import type { Anruf } from "@/lib/types";

export default function AnrufePage() {
  const [anrufe, setAnrufe] = useState<Anruf[]>(mockAnrufe);
  const [showModal, setShowModal] = useState(false);

  const markAsDone = (id: string) => {
    setAnrufe((prev) =>
      prev.map((a) =>
        a.id === id
          ? { ...a, status: "erledigt" as const, durchgefuehrt_am: new Date().toISOString() }
          : a
      )
    );
  };

  const handleAdd = (anruf: Anruf) => {
    setAnrufe((prev) => [anruf, ...prev]);
  };

  const offene = anrufe.filter((a) => a.status === "offen");
  const erledigte = anrufe.filter((a) => a.status === "erledigt");

  return (
    <div>
      <Header title="Anrufe" subtitle={`${offene.length} fällige Anrufe`} />

      <div className="p-6 space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-orange-500" />
              <span className="text-xs font-medium text-muted-foreground">Fällig</span>
            </div>
            <p className="text-2xl font-bold">{offene.length}</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 mb-1">
              <Check className="w-4 h-4 text-green-500" />
              <span className="text-xs font-medium text-muted-foreground">Erledigt</span>
            </div>
            <p className="text-2xl font-bold">{erledigte.length}</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4 hidden sm:block">
            <div className="flex items-center gap-2 mb-1">
              <Phone className="w-4 h-4 text-blue-500" />
              <span className="text-xs font-medium text-muted-foreground">Gesamt</span>
            </div>
            <p className="text-2xl font-bold">{anrufe.length}</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Anrufliste</h2>
          <Button size="sm" className="gap-2" onClick={() => setShowModal(true)}>
            <Plus className="w-3.5 h-3.5" /> Anruf hinzufügen
          </Button>
        </div>

        {/* Table */}
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Fällig am</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Kunde</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden md:table-cell">Telefon</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden lg:table-cell">Mitarbeiter</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden xl:table-cell">Notizen</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {anrufe.map((anruf) => {
                const isOverdue =
                  anruf.faellig_am &&
                  new Date(anruf.faellig_am) < new Date() &&
                  anruf.status === "offen";
                return (
                  <tr key={anruf.id} className="hover:bg-muted/30 transition-colors group">
                    <td className="px-4 py-3.5">
                      {anruf.faellig_am ? (
                        <span className={`text-sm font-medium ${isOverdue ? "text-red-500" : "text-foreground"}`}>
                          {formatDate(anruf.faellig_am)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">–</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      {anruf.kunde ? (
                        <Link href={`/kunden/${anruf.kunde_id}`} className="hover:text-[#E3000F] transition-colors">
                          <p className="font-medium text-foreground">{anruf.kunde.name1}</p>
                          <p className="text-xs text-muted-foreground">{anruf.kunde.ort}</p>
                        </Link>
                      ) : (
                        <span className="text-muted-foreground">–</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell">
                      {anruf.kunde?.telefon ? (
                        <a href={`tel:${anruf.kunde.telefon}`} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-[#E3000F] transition-colors">
                          <Phone className="w-3.5 h-3.5" />
                          {anruf.kunde.telefon}
                        </a>
                      ) : (
                        <span className="text-muted-foreground">–</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 hidden lg:table-cell">
                      <span className="text-xs text-muted-foreground">{anruf.mitarbeiter_name || "–"}</span>
                    </td>
                    <td className="px-4 py-3.5 hidden xl:table-cell">
                      <span className="text-xs text-muted-foreground line-clamp-1 max-w-48">{anruf.notizen || "–"}</span>
                    </td>
                    <td className="px-4 py-3.5"><StatusBadge status={anruf.status} /></td>
                    <td className="px-4 py-3.5">
                      {anruf.status === "offen" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsDone(anruf.id)}
                          className="h-7 text-xs gap-1.5 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Check className="w-3.5 h-3.5" /> Erledigt
                        </Button>
                      )}
                      {anruf.status === "erledigt" && anruf.durchgefuehrt_am && (
                        <span className="text-xs text-muted-foreground">{formatDate(anruf.durchgefuehrt_am)}</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <NeuerAnrufModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onAdd={handleAdd}
      />
    </div>
  );
}
