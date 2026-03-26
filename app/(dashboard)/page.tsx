import {
  CheckSquare,
  Phone,
  MapPin,
  TrendingUp,
  Plus,
  ArrowRight,
  Flame,
  Users,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { StatCard } from "@/components/dashboard/StatCard";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { WeeklyChart } from "@/components/dashboard/WeeklyChart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { mockAufgaben, mockAnrufe, mockBesuche, mockAngebote, mockKunden } from "@/lib/mock-data";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function DashboardPage() {
  const offeneAufgaben = mockAufgaben.filter((a) => a.status !== "erledigt").length;
  const faelligeAnrufe = mockAnrufe.filter((a) => a.status === "offen").length;
  const faelligeBesuche = mockBesuche.filter((b) => b.status === "offen").length;
  const gesamtumsatz = mockKunden.reduce((sum, k) => sum + (k.umsatz || 0), 0);

  const upcomingTasks = mockAufgaben
    .filter((a) => a.status !== "erledigt" && a.faellig_am)
    .sort((a, b) => new Date(a.faellig_am!).getTime() - new Date(b.faellig_am!).getTime())
    .slice(0, 4);

  const recentOffers = mockAngebote
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 3);

  // Streak: count customers contacted this week
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
  const wochenKontakte = mockKunden.filter(
    (k) => k.letzte_aktivitaet && new Date(k.letzte_aktivitaet) >= weekStart
  ).length;

  return (
    <div>
      <Header
        title="Dashboard"
        subtitle="Willkommen zurück, Thomas. Hier ist Ihre Übersicht."
      />

      <div className="p-6 space-y-6">
        {/* Streak Banner */}
        <div className="flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-[#E3000F]/10 to-orange-500/10 border border-[#E3000F]/20">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-[#E3000F]/15">
            <Flame className="w-5 h-5 text-[#E3000F]" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">
              Du hast diese Woche{" "}
              <span className="text-[#E3000F]">{wochenKontakte} Kunden</span>{" "}
              kontaktiert
            </p>
            <p className="text-xs text-muted-foreground">
              Weiter so – bleib am Ball!
            </p>
          </div>
          <Link href="/kunden">
            <Button variant="outline" size="sm" className="text-xs">
              Kunden ansehen <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </Link>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Offene Aufgaben"
            value={offeneAufgaben}
            icon={CheckSquare}
            trend={-12}
            trendLabel="vs. letzte Woche"
            color="orange"
          />
          <StatCard
            title="Fällige Anrufe"
            value={faelligeAnrufe}
            icon={Phone}
            trend={5}
            trendLabel="vs. gestern"
            color="blue"
          />
          <StatCard
            title="Fällige Besuche"
            value={faelligeBesuche}
            icon={MapPin}
            trend={-8}
            trendLabel="vs. letzte Woche"
            color="green"
          />
          <StatCard
            title="Gesamtumsatz"
            value={formatCurrency(gesamtumsatz)}
            icon={TrendingUp}
            trend={14}
            trendLabel="vs. Vorjahr"
            color="red"
          />
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2">
          <span className="text-sm font-medium text-muted-foreground self-center mr-2">
            Schnellzugriff:
          </span>
          <Link href="/aufgaben">
            <Button variant="outline" size="sm" className="gap-2">
              <Plus className="w-3.5 h-3.5" /> Aufgabe
            </Button>
          </Link>
          <Link href="/anrufe">
            <Button variant="outline" size="sm" className="gap-2">
              <Phone className="w-3.5 h-3.5" /> Anruf erfassen
            </Button>
          </Link>
          <Link href="/besuche">
            <Button variant="outline" size="sm" className="gap-2">
              <MapPin className="w-3.5 h-3.5" /> Besuch planen
            </Button>
          </Link>
          <Link href="/kunden">
            <Button variant="outline" size="sm" className="gap-2">
              <Users className="w-3.5 h-3.5" /> Kunden
            </Button>
          </Link>
          <Link href="/angebote">
            <Button variant="outline" size="sm" className="gap-2">
              <FileText className="w-3.5 h-3.5" /> Angebote
            </Button>
          </Link>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Activity + Weekly Chart */}
          <div className="lg:col-span-2 space-y-6">
            <ActivityFeed />
            <WeeklyChart />
          </div>

          {/* Right: Tasks + Offers */}
          <div className="space-y-6">
            {/* Upcoming Tasks */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Anstehende Aufgaben</CardTitle>
                  <Link href="/aufgaben">
                    <Button variant="ghost" size="sm" className="text-xs h-7">
                      Alle <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {upcomingTasks.map((task) => {
                    const isOverdue =
                      task.faellig_am &&
                      new Date(task.faellig_am) < new Date();
                    return (
                      <div
                        key={task.id}
                        className="px-6 py-3 hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium text-foreground leading-snug">
                            {task.titel}
                          </p>
                          <StatusBadge status={task.prioritaet} />
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-muted-foreground">
                            {task.kunde?.name1}
                          </span>
                          {task.faellig_am && (
                            <span
                              className={`text-xs ${isOverdue ? "text-red-500 font-medium" : "text-muted-foreground"}`}
                            >
                              {formatDate(task.faellig_am)}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Recent Offers */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Aktuelle Angebote</CardTitle>
                  <Link href="/angebote">
                    <Button variant="ghost" size="sm" className="text-xs h-7">
                      Alle <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {recentOffers.map((offer) => (
                    <div
                      key={offer.id}
                      className="px-6 py-3 hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-mono text-muted-foreground">
                            {offer.nummer}
                          </p>
                          <p className="text-sm font-medium text-foreground truncate">
                            {offer.kunde?.name1}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {offer.artikel}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-bold text-foreground">
                            {formatCurrency(offer.gesamtpreis || 0)}
                          </p>
                          <StatusBadge status={offer.status} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
