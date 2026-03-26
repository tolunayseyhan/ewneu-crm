"use client";

import { useState } from "react";
import { User, Users, Bell, Palette, Save, Camera } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

const teamMembers = [
  { name: "Thomas Berger", email: "t.berger@ewneu.de", rolle: "Vertriebsleiter", initials: "TB", status: "online" },
  { name: "Sandra Koch", email: "s.koch@ewneu.de", rolle: "Außendienst", initials: "SK", status: "online" },
  { name: "Jan Hofmann", email: "j.hofmann@ewneu.de", rolle: "Außendienst", initials: "JH", status: "offline" },
  { name: "Maria Schulz", email: "m.schulz@ewneu.de", rolle: "Innendienst", initials: "MS", status: "online" },
];

export default function EinstellungenPage() {
  const [saved, setSaved] = useState(false);
  const [notifications, setNotifications] = useState({
    aufgaben: true,
    anrufe: true,
    besuche: false,
    angebote: true,
    woechentlich: false,
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div>
      <Header title="Einstellungen" subtitle="Profil, Team und Systemkonfiguration" />

      <div className="p-6">
        <Tabs defaultValue="profil">
          <TabsList className="mb-6">
            <TabsTrigger value="profil" className="gap-2">
              <User className="w-3.5 h-3.5" /> Profil
            </TabsTrigger>
            <TabsTrigger value="team" className="gap-2">
              <Users className="w-3.5 h-3.5" /> Team
            </TabsTrigger>
            <TabsTrigger value="benachrichtigungen" className="gap-2">
              <Bell className="w-3.5 h-3.5" /> Benachrichtigungen
            </TabsTrigger>
            <TabsTrigger value="darstellung" className="gap-2">
              <Palette className="w-3.5 h-3.5" /> Darstellung
            </TabsTrigger>
          </TabsList>

          {/* Profil */}
          <TabsContent value="profil" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Persönliche Daten</CardTitle>
                <CardDescription>
                  Verwalten Sie Ihre persönlichen Informationen
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar */}
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Avatar className="h-20 w-20">
                      <AvatarFallback className="bg-[#E3000F]/10 text-[#E3000F] text-2xl font-bold">
                        TB
                      </AvatarFallback>
                    </Avatar>
                    <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#E3000F] flex items-center justify-center shadow-md hover:bg-[#cc000e] transition-colors">
                      <Camera className="w-3.5 h-3.5 text-white" />
                    </button>
                  </div>
                  <div>
                    <p className="font-semibold">Thomas Berger</p>
                    <p className="text-sm text-muted-foreground">Vertriebsleiter</p>
                    <Button variant="outline" size="sm" className="mt-2 text-xs">
                      Foto ändern
                    </Button>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Vorname</Label>
                    <Input defaultValue="Thomas" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Nachname</Label>
                    <Input defaultValue="Berger" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>E-Mail</Label>
                    <Input defaultValue="t.berger@ewneu.de" type="email" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Telefon</Label>
                    <Input defaultValue="+49 211 123 456" type="tel" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Abteilung</Label>
                    <Input defaultValue="Vertrieb" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Rolle</Label>
                    <Input defaultValue="Vertriebsleiter" disabled className="opacity-60" />
                  </div>
                </div>

                <Separator />

                <div className="space-y-1.5">
                  <Label>Passwort ändern</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input placeholder="Aktuelles Passwort" type="password" />
                    <Input placeholder="Neues Passwort" type="password" />
                  </div>
                </div>

                <Button onClick={handleSave} className="gap-2">
                  <Save className="w-4 h-4" />
                  {saved ? "Gespeichert!" : "Änderungen speichern"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Team */}
          <TabsContent value="team" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Team-Mitglieder</CardTitle>
                    <CardDescription>
                      Verwalten Sie Ihr Vertriebsteam
                    </CardDescription>
                  </div>
                  <Button size="sm" className="gap-2">
                    <Users className="w-3.5 h-3.5" /> Einladen
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {teamMembers.map((member) => (
                    <div
                      key={member.email}
                      className="flex items-center gap-4 px-6 py-4 hover:bg-muted/30 transition-colors"
                    >
                      <div className="relative">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-[#E3000F]/10 text-[#E3000F] font-semibold text-sm">
                            {member.initials}
                          </AvatarFallback>
                        </Avatar>
                        <div
                          className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background ${
                            member.status === "online"
                              ? "bg-green-500"
                              : "bg-gray-400"
                          }`}
                        />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{member.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {member.email}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary" className="text-xs">
                          {member.rolle}
                        </Badge>
                        <Button variant="ghost" size="sm" className="text-xs h-7">
                          Bearbeiten
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Benachrichtigungen */}
          <TabsContent value="benachrichtigungen" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>E-Mail-Benachrichtigungen</CardTitle>
                <CardDescription>
                  Legen Sie fest, wann Sie benachrichtigt werden möchten
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { key: "aufgaben", label: "Neue Aufgaben", desc: "Bei neuen oder fälligen Aufgaben" },
                  { key: "anrufe", label: "Fällige Anrufe", desc: "Erinnerung bei fälligen Anrufen" },
                  { key: "besuche", label: "Besuchserinnerungen", desc: "24h vor geplanten Besuchen" },
                  { key: "angebote", label: "Angebotsänderungen", desc: "Bei Statusänderungen bei Angeboten" },
                  { key: "woechentlich", label: "Wochenbericht", desc: "Wöchentliche Aktivitätsübersicht" },
                ].map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between py-3 border-b border-border last:border-0"
                  >
                    <div>
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                    <button
                      onClick={() =>
                        setNotifications((prev) => ({
                          ...prev,
                          [item.key]: !prev[item.key as keyof typeof prev],
                        }))
                      }
                      className={`relative w-10 h-5.5 rounded-full transition-colors duration-200 ${
                        notifications[item.key as keyof typeof notifications]
                          ? "bg-[#E3000F]"
                          : "bg-muted"
                      }`}
                      style={{ height: "22px" }}
                    >
                      <span
                        className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${
                          notifications[item.key as keyof typeof notifications]
                            ? "translate-x-5"
                            : "translate-x-0.5"
                        }`}
                      />
                    </button>
                  </div>
                ))}
                <Button onClick={handleSave} className="mt-2 gap-2">
                  <Save className="w-4 h-4" />
                  {saved ? "Gespeichert!" : "Einstellungen speichern"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Darstellung */}
          <TabsContent value="darstellung" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Erscheinungsbild</CardTitle>
                <CardDescription>
                  Passen Sie das System an Ihre Vorlieben an
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <p className="text-sm font-medium mb-3">Farbschema</p>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "Hell", desc: "Standard", active: true },
                      { label: "Dunkel", desc: "Dark Mode", active: false },
                      { label: "System", desc: "Automatisch", active: false },
                    ].map((theme) => (
                      <button
                        key={theme.label}
                        className={`p-3 rounded-xl border-2 text-left transition-colors ${
                          theme.active
                            ? "border-[#E3000F] bg-[#E3000F]/5"
                            : "border-border hover:border-muted-foreground"
                        }`}
                      >
                        <p className="text-sm font-medium">{theme.label}</p>
                        <p className="text-xs text-muted-foreground">
                          {theme.desc}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                <Separator />

                <div>
                  <p className="text-sm font-medium mb-1">Primärfarbe</p>
                  <p className="text-xs text-muted-foreground mb-3">
                    Aktuelle Farbe: EWNEU Rot (#E3000F)
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#E3000F] border-2 border-white shadow ring-2 ring-[#E3000F]" />
                    <div className="w-8 h-8 rounded-lg bg-blue-600 border-2 border-white shadow cursor-pointer hover:ring-2 hover:ring-blue-600" />
                    <div className="w-8 h-8 rounded-lg bg-emerald-600 border-2 border-white shadow cursor-pointer hover:ring-2 hover:ring-emerald-600" />
                    <div className="w-8 h-8 rounded-lg bg-violet-600 border-2 border-white shadow cursor-pointer hover:ring-2 hover:ring-violet-600" />
                  </div>
                </div>

                <Separator />

                <div>
                  <p className="text-sm font-medium mb-1">Startseitenansicht</p>
                  <p className="text-xs text-muted-foreground mb-3">
                    Welche Seite wird beim Login zuerst gezeigt?
                  </p>
                  <select className="w-48 h-9 rounded-xl border border-input bg-transparent px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring">
                    <option>Dashboard</option>
                    <option>Kunden</option>
                    <option>Aufgaben</option>
                    <option>Anrufe</option>
                  </select>
                </div>

                <Button onClick={handleSave} className="gap-2">
                  <Save className="w-4 h-4" />
                  {saved ? "Gespeichert!" : "Einstellungen speichern"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
