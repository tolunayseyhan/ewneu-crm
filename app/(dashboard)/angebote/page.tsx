"use client";

import { useState } from "react";
import { Plus, Filter, LayoutGrid, List } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { mockAngebote } from "@/lib/mock-data";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";

type ViewMode = "list" | "pipeline";

export default function AngebotePage() {
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [statusFilter, setStatusFilter] = useState("alle");

  const filtered =
    statusFilter === "alle"
      ? mockAngebote
      : mockAngebote.filter((a) => a.status === statusFilter);

  const totalValue = filtered.reduce((sum, a) => sum + (a.gesamtpreis || 0), 0);
  const openValue = filtered
    .filter((a) => a.status === "offen" || a.status === "in_verhandlung")
    .reduce((sum, a) => sum + (a.gesamtpreis || 0), 0);

  // Group by customer for pipeline view
  const byCustomer = mockAngebote.reduce(
    (acc, angebot) => {
      const name = angebot.kunde?.name1 || "Unbekannt";
      if (!acc[name]) acc[name] = [];
      acc[name].push(angebot);
      return acc;
    },
    {} as Record<string, typeof mockAngebote>
  );

  return (
    <div>
      <Header
        title="Angebote"
        subtitle={`${mockAngebote.length} Angebote`}
      />

      <div className="p-6 space-y-6">
        {/* Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            {
              label: "Gesamt",
              count: mockAngebote.length,
              value: mockAngebote.reduce((s, a) => s + (a.gesamtpreis || 0), 0),
              color: "text-foreground",
            },
            {
              label: "Offen",
              count: mockAngebote.filter((a) => a.status === "offen").length,
              value: mockAngebote.filter((a) => a.status === "offen").reduce((s, a) => s + (a.gesamtpreis || 0), 0),
              color: "text-orange-500",
            },
            {
              label: "In Verhandlung",
              count: mockAngebote.filter((a) => a.status === "in_verhandlung").length,
              value: mockAngebote.filter((a) => a.status === "in_verhandlung").reduce((s, a) => s + (a.gesamtpreis || 0), 0),
              color: "text-blue-500",
            },
            {
              label: "Angenommen",
              count: mockAngebote.filter((a) => a.status === "angenommen").length,
              value: mockAngebote.filter((a) => a.status === "angenommen").reduce((s, a) => s + (a.gesamtpreis || 0), 0),
              color: "text-green-500",
            },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-border bg-card p-4"
            >
              <p className="text-xs font-medium text-muted-foreground mb-1">
                {item.label}
              </p>
              <p className={`text-xl font-bold ${item.color}`}>
                {item.count}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {formatCurrency(item.value)}
              </p>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between gap-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <Filter className="w-3.5 h-3.5 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="alle">Alle Status</SelectItem>
              <SelectItem value="offen">Offen</SelectItem>
              <SelectItem value="in_verhandlung">In Verhandlung</SelectItem>
              <SelectItem value="angenommen">Angenommen</SelectItem>
              <SelectItem value="abgelehnt">Abgelehnt</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 rounded-xl border border-border bg-muted/40 p-1">
              <button
                onClick={() => setViewMode("list")}
                className={`flex items-center justify-center w-8 h-7 rounded-lg transition-colors ${viewMode === "list" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`}
              >
                <List className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode("pipeline")}
                className={`flex items-center justify-center w-8 h-7 rounded-lg transition-colors ${viewMode === "pipeline" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
            </div>
            <Button size="sm" className="gap-2">
              <Plus className="w-3.5 h-3.5" /> Neues Angebot
            </Button>
          </div>
        </div>

        {viewMode === "list" ? (
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Nummer
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Kunde
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden md:table-cell">
                    Artikel
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden lg:table-cell">
                    Menge
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Gesamt
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Status
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden md:table-cell">
                    Erstellt
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((angebot) => (
                  <tr
                    key={angebot.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3.5">
                      <span className="font-mono text-xs text-muted-foreground">
                        {angebot.nummer}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      {angebot.kunde ? (
                        <Link
                          href={`/kunden/${angebot.kunde_id}`}
                          className="font-medium text-foreground hover:text-[#E3000F] transition-colors"
                        >
                          {angebot.kunde.name1}
                        </Link>
                      ) : (
                        "–"
                      )}
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell">
                      <span className="text-xs text-muted-foreground">
                        {angebot.artikel}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 hidden lg:table-cell">
                      <span className="text-xs text-muted-foreground">
                        {angebot.menge} Stk.
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="font-semibold text-foreground">
                        {formatCurrency(angebot.gesamtpreis || 0)}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={angebot.status} />
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell">
                      <span className="text-xs text-muted-foreground">
                        {angebot.erstellt_am && formatDate(angebot.erstellt_am)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* Pipeline / Grouped by Customer */
          <div className="space-y-4">
            {Object.entries(byCustomer).map(([kundenName, angebote]) => (
              <Card key={kundenName}>
                <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                  <div>
                    <h3 className="font-semibold text-foreground">{kundenName}</h3>
                    <p className="text-xs text-muted-foreground">
                      {angebote.length} Angebote ·{" "}
                      {formatCurrency(
                        angebote.reduce((s, a) => s + (a.gesamtpreis || 0), 0)
                      )}
                    </p>
                  </div>
                </div>
                <CardContent className="p-0">
                  <div className="divide-y divide-border">
                    {angebote.map((angebot) => (
                      <div
                        key={angebot.id}
                        className="flex items-center gap-4 px-6 py-3.5 hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="font-mono text-xs text-muted-foreground">
                              {angebot.nummer}
                            </span>
                            <StatusBadge status={angebot.status} />
                          </div>
                          <p className="text-sm text-foreground">
                            {angebot.artikel}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-foreground">
                            {formatCurrency(angebot.gesamtpreis || 0)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {angebot.erstellt_am && formatDate(angebot.erstellt_am)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
