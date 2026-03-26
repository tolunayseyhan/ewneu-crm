"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Check, Plus, Clock, Calendar, FileText } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { NeuerBesuchModal } from "@/components/modals/NeuerBesuchModal";
import { BerichtErfassenModal } from "@/components/modals/BerichtErfassenModal";
import { useCRM } from "@/lib/crm-context";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

export default function BesuchePage() {
  const { besuche, addBesuch, markBesuchDone } = useCRM();
  const [mitarbeiterFilter, setMitarbeiterFilter] = useState("alle");
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [showBerichtModal, setShowBerichtModal] = useState(false);

  const mitarbeiter = ["alle", ...Array.from(new Set(besuche.map((b) => b.mitarbeiter_name).filter(Boolean)))];
  const filtered = mitarbeiterFilter === "alle" ? besuche : besuche.filter((b) => b.mitarbeiter_name === mitarbeiterFilter);
  const offene = filtered.filter((b) => b.status === "offen");
  const erledigte = filtered.filter((b) => b.status === "erledigt");

  return (
    <div>
      <Header title="Besuche" subtitle={`${offene.length} geplante Besuche`} />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 mb-1"><Clock className="w-4 h-4 text-blue-500" /><span className="text-xs font-medium text-muted-foreground">Geplant</span></div>
            <p className="text-2xl font-bold">{offene.length}</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 mb-1"><Check className="w-4 h-4 text-green-500" /><span className="text-xs font-medium text-muted-foreground">Durchgeführt</span></div>
            <p className="text-2xl font-bold">{erledigte.length}</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4 hidden sm:block">
            <div className="flex items-center gap-2 mb-1"><Calendar className="w-4 h-4 text-purple-500" /><span className="text-xs font-medium text-muted-foreground">Gesamt</span></div>
            <p className="text-2xl font-bold">{filtered.length}</p>
          </div>
        </div>
        <div className="flex items-center justify-between gap-3">
          <Select value={mitarbeiterFilter} onValueChange={setMitarbeiterFilter}>
            <SelectTrigger className="w-48"><SelectValue placeholder="Mitarbeiter" /></SelectTrigger>
            <SelectContent>
              {mitarbeiter.map((m) => (<SelectItem key={m} value={m || "alle"}>{m === "alle" ? "Alle Mitarbeiter" : m}</SelectItem>))}
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="gap-2 border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-400 dark:hover:bg-emerald-900/20"
              onClick={() => setShowBerichtModal(true)}
            >
              <FileText className="w-3.5 h-3.5" /> Bericht erfassen
            </Button>
            <Button size="sm" className="gap-2" onClick={() => setShowModal(true)}>
              <Plus className="w-3.5 h-3.5" /> Besuch planen
            </Button>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Fällig am</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Kunde</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden md:table-cell">Mitarbeiter</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden xl:table-cell">Notizen</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden lg:table-cell">Dauer</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((besuch) => {
                const isOverdue = besuch.faellig_am && new Date(besuch.faellig_am) < new Date() && besuch.status === "offen";
                return (
                  <tr
                    key={besuch.id}
                    className="hover:bg-muted/30 transition-colors group cursor-pointer"
                    onClick={() => router.push(`/besuche/${besuch.id}`)}
                  >
                    <td className="px-4 py-3.5">
                      {besuch.faellig_am ? <span className={`text-sm font-medium ${isOverdue ? "text-red-500" : "text-foreground"}`}>{formatDate(besuch.faellig_am)}</span> : <span className="text-muted-foreground">–</span>}
                    </td>
                    <td className="px-4 py-3.5">
                      {besuch.kunde ? (
                        <Link href={`/kunden/${besuch.kunde_id}`} className="hover:text-[#E3000F] transition-colors">
                          <p className="font-medium text-foreground">{besuch.kunde.name1}</p>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5"><MapPin className="w-3 h-3" />{besuch.kunde.ort}</div>
                        </Link>
                      ) : <span className="text-muted-foreground">–</span>}
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell"><span className="text-xs text-muted-foreground">{besuch.mitarbeiter_name || "–"}</span></td>
                    <td className="px-4 py-3.5 hidden xl:table-cell"><span className="text-xs text-muted-foreground line-clamp-1 max-w-48">{besuch.notizen || "–"}</span></td>
                    <td className="px-4 py-3.5 hidden lg:table-cell"><span className="text-xs text-muted-foreground">{besuch.dauer_minuten ? `${besuch.dauer_minuten} Min.` : "–"}</span></td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={besuch.status} />
                        {besuch.bericht && (
                          <span title="Bericht vorhanden" className="text-xs">📝</span>
                        )}
                        {besuch.anhänge && besuch.anhänge.length > 0 && (
                          <span title={`${besuch.anhänge.length} Anhang/Anhänge`} className="text-xs">📎</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      {besuch.status === "offen" && (
                        <Button variant="ghost" size="sm" onClick={() => markBesuchDone(besuch.id)}
                          className="h-7 text-xs gap-1.5 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Check className="w-3.5 h-3.5" /> Erledigt
                        </Button>
                      )}
                      {besuch.status === "erledigt" && besuch.durchgefuehrt_am && (
                        <span className="text-xs text-muted-foreground">{formatDate(besuch.durchgefuehrt_am)}</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <NeuerBesuchModal open={showModal} onClose={() => setShowModal(false)} onAdd={addBesuch} />
      <BerichtErfassenModal open={showBerichtModal} onClose={() => setShowBerichtModal(false)} />
    </div>
  );
}
