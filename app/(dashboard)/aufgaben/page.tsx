"use client";

import { useState } from "react";
import { Plus, LayoutGrid, List, Filter } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { KanbanBoard } from "@/components/aufgaben/KanbanBoard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { NeueAufgabeModal } from "@/components/modals/NeueAufgabeModal";
import { useCRM } from "@/lib/crm-context";
import { formatDate } from "@/lib/utils";

type ViewMode = "kanban" | "list";

export default function AufgabenPage() {
  const { aufgaben, addAufgabe } = useCRM();
  const [viewMode, setViewMode] = useState<ViewMode>("kanban");
  const [priorityFilter, setPriorityFilter] = useState("alle");
  const [showModal, setShowModal] = useState(false);

  const filtered = priorityFilter === "alle" ? aufgaben : aufgaben.filter((a) => a.prioritaet === priorityFilter);

  return (
    <div>
      <Header title="Aufgaben" subtitle={`${aufgaben.filter((a) => a.status !== "erledigt").length} offene Aufgaben`} />
      <div className="p-6 space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-40">
                <Filter className="w-3.5 h-3.5 mr-2" />
                <SelectValue placeholder="Priorität" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="alle">Alle Prioritäten</SelectItem>
                <SelectItem value="hoch">Hoch</SelectItem>
                <SelectItem value="mittel">Mittel</SelectItem>
                <SelectItem value="niedrig">Niedrig</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 rounded-xl border border-border bg-muted/40 p-1">
              <button onClick={() => setViewMode("kanban")} className={`flex items-center justify-center w-8 h-7 rounded-lg transition-colors ${viewMode === "kanban" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => setViewMode("list")} className={`flex items-center justify-center w-8 h-7 rounded-lg transition-colors ${viewMode === "list" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
            <Button className="gap-2" onClick={() => setShowModal(true)}>
              <Plus className="w-4 h-4" /> Neue Aufgabe
            </Button>
          </div>
        </div>
        {viewMode === "kanban" ? (
          <KanbanBoard aufgaben={filtered} />
        ) : (
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Aufgabe</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden md:table-cell">Kunde</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden lg:table-cell">Zugewiesen</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Priorität</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden md:table-cell">Fällig</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((aufgabe) => {
                  const isOverdue = aufgabe.faellig_am && new Date(aufgabe.faellig_am) < new Date() && aufgabe.status !== "erledigt";
                  return (
                    <tr key={aufgabe.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3.5">
                        <p className="font-medium text-foreground">{aufgabe.titel}</p>
                        {aufgabe.beschreibung && <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{aufgabe.beschreibung}</p>}
                      </td>
                      <td className="px-4 py-3.5 hidden md:table-cell"><span className="text-xs text-muted-foreground">{aufgabe.kunde?.name1 || "–"}</span></td>
                      <td className="px-4 py-3.5 hidden lg:table-cell"><span className="text-xs text-muted-foreground">{aufgabe.zugewiesener_name || "–"}</span></td>
                      <td className="px-4 py-3.5"><StatusBadge status={aufgabe.status} /></td>
                      <td className="px-4 py-3.5"><StatusBadge status={aufgabe.prioritaet} /></td>
                      <td className="px-4 py-3.5 hidden md:table-cell">
                        {aufgabe.faellig_am && <span className={`text-xs ${isOverdue ? "text-red-500 font-medium" : "text-muted-foreground"}`}>{formatDate(aufgabe.faellig_am)}</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <NeueAufgabeModal open={showModal} onClose={() => setShowModal(false)} onAdd={addAufgabe} />
    </div>
  );
}
