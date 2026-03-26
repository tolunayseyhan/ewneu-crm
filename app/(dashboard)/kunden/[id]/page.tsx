import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Building2,
  Hash,
  Calendar,
  Plus,
  CheckSquare,
  FileText,
  Users,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { HealthScore } from "@/components/kunden/HealthScore";
import { KundenRevenueChart } from "@/components/kunden/KundenRevenueChart";
import { KundenBesucheTab } from "@/components/kunden/KundenBesucheTab";
import { KundenAnsprechpartnerTab } from "@/components/kunden/KundenAnsprechpartnerTab";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  mockKunden,
  mockAufgaben,
  mockAnrufe,
  mockBesuche,
  mockAngebote,
  mockAktivitaeten,
} from "@/lib/mock-data";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";

export default async function KundenDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const kunde = mockKunden.find((k) => k.id === id);
  if (!kunde) notFound();

  const aufgaben = mockAufgaben.filter((a) => a.kunde_id === id).slice(0, 5);
  const anrufe = mockAnrufe.filter((a) => a.kunde_id === id).slice(0, 5);
  const besuche = mockBesuche.filter((b) => b.kunde_id === id).slice(0, 5);
  const angebote = mockAngebote.filter((a) => a.kunde_id === id).slice(0, 5);
  const aktivitaeten = mockAktivitaeten
    .filter((a) => a.kunde_id === id)
    .sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

  return (
    <div>
      <Header title={kunde.name1} subtitle={`${kunde.nummer} · ${kunde.ort}`} />

      <div className="p-6 space-y-6">
        {/* Back + Action Bar */}
        <div className="flex items-center justify-between">
          <Link href="/kunden">
            <Button variant="ghost" size="sm" className="gap-2 -ml-2">
              <ArrowLeft className="w-4 h-4" /> Zurück
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Phone className="w-3.5 h-3.5" /> Anruf erfassen
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <MapPin className="w-3.5 h-3.5" /> Besuch planen
            </Button>
            <Button size="sm" className="gap-2">
              <Plus className="w-3.5 h-3.5" /> Aufgabe
            </Button>
          </div>
        </div>

        {/* Profile + Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4 mb-5">
                  <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-[#E3000F]/10 text-[#E3000F] font-bold text-xl shrink-0">
                    {kunde.name1.charAt(0)}
                  </div>
                  <div>
                    <h2 className="font-bold text-lg text-foreground leading-tight">
                      {kunde.name1}
                    </h2>
                    {kunde.name2 && (
                      <p className="text-sm text-muted-foreground">
                        {kunde.name2}
                      </p>
                    )}
                    <StatusBadge status={kunde.status} className="mt-1" />
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2.5 text-muted-foreground">
                    <Hash className="w-4 h-4 shrink-0" />
                    <span className="font-mono">{kunde.nummer}</span>
                  </div>
                  {kunde.strasse && (
                    <div className="flex items-start gap-2.5 text-muted-foreground">
                      <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>
                        {kunde.strasse}
                        <br />
                        {kunde.plz} {kunde.ort}
                      </span>
                    </div>
                  )}
                  {kunde.telefon && (
                    <div className="flex items-center gap-2.5 text-muted-foreground">
                      <Phone className="w-4 h-4 shrink-0" />
                      <a
                        href={`tel:${kunde.telefon}`}
                        className="hover:text-[#E3000F] transition-colors"
                      >
                        {kunde.telefon}
                      </a>
                    </div>
                  )}
                  {kunde.email && (
                    <div className="flex items-center gap-2.5 text-muted-foreground">
                      <Mail className="w-4 h-4 shrink-0" />
                      <a
                        href={`mailto:${kunde.email}`}
                        className="hover:text-[#E3000F] transition-colors truncate"
                      >
                        {kunde.email}
                      </a>
                    </div>
                  )}
                  {kunde.branche && (
                    <div className="flex items-center gap-2.5 text-muted-foreground">
                      <Building2 className="w-4 h-4 shrink-0" />
                      <span>{kunde.branche}</span>
                    </div>
                  )}
                  {kunde.letzte_aktivitaet && (
                    <div className="flex items-center gap-2.5 text-muted-foreground">
                      <Calendar className="w-4 h-4 shrink-0" />
                      <span>
                        Letzte Aktivität: {formatDate(kunde.letzte_aktivitaet)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-5 pt-5 border-t border-border">
                  <HealthScore lastVisitDate={kunde.letzte_besuch} size="md" />
                </div>

                {kunde.umsatz !== undefined && kunde.umsatz > 0 && (
                  <div className="mt-4 p-3 bg-muted/40 rounded-xl">
                    <p className="text-xs text-muted-foreground mb-0.5">
                      Jahresumsatz
                    </p>
                    <p className="text-xl font-bold text-foreground">
                      {formatCurrency(kunde.umsatz)}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Revenue Chart */}
            <KundenRevenueChart />

            {/* Activity Timeline */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Aktivitätsverlauf</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {aktivitaeten.length === 0 ? (
                  <p className="text-sm text-muted-foreground px-6 py-4">
                    Keine Aktivitäten vorhanden.
                  </p>
                ) : (
                  <div className="relative">
                    <div className="absolute left-9 top-0 bottom-0 w-px bg-border" />
                    <div className="space-y-0 divide-y divide-border">
                      {aktivitaeten.map((akt) => (
                        <div
                          key={akt.id}
                          className="flex gap-4 px-6 py-4 relative hover:bg-muted/20 transition-colors"
                        >
                          <div className="w-6 h-6 rounded-full bg-[#E3000F]/10 border-2 border-[#E3000F]/30 flex items-center justify-center shrink-0 z-10">
                            <div className="w-2 h-2 rounded-full bg-[#E3000F]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-foreground">
                              {akt.beschreibung}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {akt.mitarbeiter_name} ·{" "}
                              {formatDateTime(akt.created_at)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tabs: Besuche, Angebote, Aufgaben */}
        <Tabs defaultValue="besuche">
          <TabsList>
            <TabsTrigger value="besuche">
              <MapPin className="w-3.5 h-3.5 mr-1.5" /> Besuche
            </TabsTrigger>
            <TabsTrigger value="ansprechpartner">
              <Users className="w-3.5 h-3.5 mr-1.5" /> Ansprechpartner
            </TabsTrigger>
            <TabsTrigger value="angebote">
              <FileText className="w-3.5 h-3.5 mr-1.5" /> Angebote
            </TabsTrigger>
            <TabsTrigger value="aufgaben">
              <CheckSquare className="w-3.5 h-3.5 mr-1.5" /> Aufgaben
            </TabsTrigger>
          </TabsList>

          <TabsContent value="besuche">
            <KundenBesucheTab kundeId={id} kundeName={kunde.name1} />
          </TabsContent>

          <TabsContent value="ansprechpartner">
            <KundenAnsprechpartnerTab kundeId={id} />
          </TabsContent>

          <TabsContent value="angebote">
            {angebote.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">Keine Angebote vorhanden.</p>
            ) : (
              <Card>
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
                          <p className="text-sm font-medium">{angebot.artikel}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold">
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
            )}
          </TabsContent>

          <TabsContent value="aufgaben">
            {aufgaben.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">Keine Aufgaben vorhanden.</p>
            ) : (
              <Card>
                <CardContent className="p-0">
                  <div className="divide-y divide-border">
                    {aufgaben.map((aufgabe) => (
                      <div
                        key={aufgabe.id}
                        className="flex items-center gap-4 px-6 py-3.5 hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex-1">
                          <p className="text-sm font-medium">{aufgabe.titel}</p>
                          <p className="text-xs text-muted-foreground">
                            {aufgabe.zugewiesener_name}
                            {aufgabe.faellig_am &&
                              ` · Fällig: ${formatDate(aufgabe.faellig_am)}`}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <StatusBadge status={aufgabe.prioritaet} />
                          <StatusBadge status={aufgabe.status} />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
