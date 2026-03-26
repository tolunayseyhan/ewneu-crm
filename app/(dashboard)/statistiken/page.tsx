"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from "recharts";
import { Download, TrendingUp, Phone, MapPin, FileText } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  mockUmsatzChart,
  mockMitarbeiterStats,
  mockAngebote,
} from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";

export default function StatistikenPage() {
  const [zeitraum, setZeitraum] = useState("12");

  const umsatzData =
    zeitraum === "6"
      ? mockUmsatzChart.slice(-6)
      : zeitraum === "3"
        ? mockUmsatzChart.slice(-3)
        : mockUmsatzChart;

  const gesamtumsatz = umsatzData.reduce((s, d) => s + d.umsatz, 0);
  const avgMonthly = gesamtumsatz / umsatzData.length;

  const exportCSV = () => {
    const rows = [
      ["Monat", "Umsatz"],
      ...umsatzData.map((d) => [d.monat, d.umsatz.toString()]),
    ];
    const csv = rows.map((r) => r.join(";")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "umsatz-export.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <Header title="Statistiken" subtitle="Auswertungen & Kennzahlen" />

      <div className="p-6 space-y-6">
        {/* KPI Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-[#E3000F]" />
              <span className="text-xs font-medium text-muted-foreground">
                Gesamtumsatz
              </span>
            </div>
            <p className="text-2xl font-bold">{formatCurrency(gesamtumsatz)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Ø {formatCurrency(avgMonthly)} / Monat
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 mb-2">
              <Phone className="w-4 h-4 text-blue-500" />
              <span className="text-xs font-medium text-muted-foreground">
                Anrufe gesamt
              </span>
            </div>
            <p className="text-2xl font-bold">
              {mockMitarbeiterStats.reduce((s, m) => s + m.anrufe, 0)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Ø{" "}
              {(
                mockMitarbeiterStats.reduce((s, m) => s + m.anrufe, 0) /
                mockMitarbeiterStats.length
              ).toFixed(0)}{" "}
              / Mitarbeiter
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4 text-green-500" />
              <span className="text-xs font-medium text-muted-foreground">
                Besuche gesamt
              </span>
            </div>
            <p className="text-2xl font-bold">
              {mockMitarbeiterStats.reduce((s, m) => s + m.besuche, 0)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Ø{" "}
              {(
                mockMitarbeiterStats.reduce((s, m) => s + m.besuche, 0) /
                mockMitarbeiterStats.length
              ).toFixed(0)}{" "}
              / Mitarbeiter
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-purple-500" />
              <span className="text-xs font-medium text-muted-foreground">
                Angebotsvolumen
              </span>
            </div>
            <p className="text-2xl font-bold">
              {formatCurrency(
                mockAngebote.reduce((s, a) => s + (a.gesamtpreis || 0), 0)
              )}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {mockAngebote.filter((a) => a.status === "angenommen").length}{" "}
              angenommen
            </p>
          </div>
        </div>

        {/* Umsatz Chart */}
        <Card>
          <CardHeader className="flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base">Umsatzentwicklung</CardTitle>
              <CardDescription>Monatlicher Umsatz im Überblick</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select value={zeitraum} onValueChange={setZeitraum}>
                <SelectTrigger className="w-32 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 Monate</SelectItem>
                  <SelectItem value="6">6 Monate</SelectItem>
                  <SelectItem value="12">12 Monate</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={exportCSV}
                className="h-8 gap-2"
              >
                <Download className="w-3.5 h-3.5" /> CSV
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart
                data={umsatzData}
                margin={{ top: 5, right: 5, left: -10, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                  vertical={false}
                />
                <XAxis
                  dataKey="monat"
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k€`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "12px",
                    fontSize: "12px",
                  }}
                  formatter={(value) =>
                    new Intl.NumberFormat("de-DE", {
                      style: "currency",
                      currency: "EUR",
                    }).format(Number(value))
                  }
                />
                <Line
                  type="monotone"
                  dataKey="umsatz"
                  stroke="#E3000F"
                  strokeWidth={2.5}
                  dot={{ fill: "#E3000F", strokeWidth: 0, r: 4 }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                  name="Umsatz"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Mitarbeiter Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Aktivitäten pro Mitarbeiter</CardTitle>
            <CardDescription>Anrufe und Besuche im Vergleich</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart
                data={mockMitarbeiterStats}
                margin={{ top: 5, right: 5, left: -15, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "12px",
                    fontSize: "12px",
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: "12px" }}
                />
                <Bar
                  dataKey="anrufe"
                  name="Anrufe"
                  fill="#E3000F"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="besuche"
                  name="Besuche"
                  fill="#0ea5e9"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Mitarbeiter Table */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Detailansicht Mitarbeiter</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Mitarbeiter
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Anrufe
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Besuche
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Gesamt
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Aktivitätsrate
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {mockMitarbeiterStats.map((m) => {
                    const total = m.anrufe + m.besuche;
                    const maxTotal = Math.max(
                      ...mockMitarbeiterStats.map((s) => s.anrufe + s.besuche)
                    );
                    const rate = Math.round((total / maxTotal) * 100);
                    return (
                      <tr
                        key={m.name}
                        className="hover:bg-muted/30 transition-colors"
                      >
                        <td className="px-4 py-3.5 font-medium">{m.name}</td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2">
                            <Phone className="w-3.5 h-3.5 text-[#E3000F]" />
                            {m.anrufe}
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-blue-500" />
                            {m.besuche}
                          </div>
                        </td>
                        <td className="px-4 py-3.5 font-semibold">{total}</td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-muted rounded-full max-w-24">
                              <div
                                className="h-2 bg-[#E3000F] rounded-full transition-all"
                                style={{ width: `${rate}%` }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {rate}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
