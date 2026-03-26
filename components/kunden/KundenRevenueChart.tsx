"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const data = [
  { monat: "Okt", umsatz: 28000 },
  { monat: "Nov", umsatz: 35000 },
  { monat: "Dez", umsatz: 42000 },
  { monat: "Jan", umsatz: 31000 },
  { monat: "Feb", umsatz: 38000 },
  { monat: "Mär", umsatz: 44500 },
];

export function KundenRevenueChart() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Umsatzentwicklung</CardTitle>
        <CardDescription>Letzte 6 Monate</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={160}>
          <LineChart
            data={data}
            margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
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
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
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
              strokeWidth={2}
              dot={{ fill: "#E3000F", strokeWidth: 0, r: 4 }}
              activeDot={{ r: 6, strokeWidth: 0 }}
              name="Umsatz"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
