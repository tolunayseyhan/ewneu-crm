"use client";

import Link from "next/link";
import { ArrowRight, Phone, Mail } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { HealthScore } from "./HealthScore";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Kunde } from "@/lib/types";

interface KundenTableProps {
  kunden: Kunde[];
}

export function KundenTable({ kunden }: KundenTableProps) {
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Nummer
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Name
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden md:table-cell">
                Branche
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden lg:table-cell">
                Kontakt
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Status
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden xl:table-cell">
                Umsatz
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden lg:table-cell">
                Kundenpflege
              </th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {kunden.map((kunde) => (
              <tr
                key={kunde.id}
                className="hover:bg-muted/30 transition-colors group"
              >
                <td className="px-4 py-3.5 font-mono text-xs text-muted-foreground">
                  {kunde.nummer}
                </td>
                <td className="px-4 py-3.5">
                  <div>
                    <p className="font-medium text-foreground">{kunde.name1}</p>
                    {kunde.ort && (
                      <p className="text-xs text-muted-foreground">
                        {kunde.plz} {kunde.ort}
                      </p>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3.5 hidden md:table-cell">
                  <span className="text-xs text-muted-foreground">
                    {kunde.branche || "–"}
                  </span>
                </td>
                <td className="px-4 py-3.5 hidden lg:table-cell">
                  <div className="space-y-0.5">
                    {kunde.telefon && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Phone className="w-3 h-3" />
                        {kunde.telefon}
                      </div>
                    )}
                    {kunde.email && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Mail className="w-3 h-3" />
                        {kunde.email}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3.5">
                  <StatusBadge status={kunde.status} />
                </td>
                <td className="px-4 py-3.5 hidden xl:table-cell">
                  <span className="font-medium text-foreground text-xs">
                    {kunde.umsatz ? formatCurrency(kunde.umsatz) : "–"}
                  </span>
                </td>
                <td className="px-4 py-3.5 hidden lg:table-cell">
                  <div className="w-28">
                    <HealthScore lastVisitDate={kunde.letzte_besuch} size="sm" />
                  </div>
                </td>
                <td className="px-4 py-3.5">
                  <Link
                    href={`/kunden/${kunde.id}`}
                    className="opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center gap-1 text-xs text-[#E3000F] font-medium"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
