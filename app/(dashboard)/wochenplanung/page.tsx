"use client";

import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Phone, MapPin, CheckSquare, Calendar } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { useCRM } from "@/lib/crm-context";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

const HOURS = Array.from({ length: 12 }, (_, i) => i + 7); // 07:00 – 18:00
const DAYS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
const DAY_NAMES = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"];

function getWeekStart(date: Date) {
  const d = new Date(date);
  const day = d.getDay(); // 0=Sun
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function getKW(date: Date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

interface CalEvent {
  id: string;
  type: "anruf" | "besuch" | "aufgabe";
  label: string;
  subLabel?: string;
  date: Date;
  hour: number;
  status: string;
}

export default function WochenplanungPage() {
  const { anrufe, besuche, aufgaben } = useCRM();
  const [currentWeekStart, setCurrentWeekStart] = useState(() => getWeekStart(new Date()));

  const weekDays = useMemo(() =>
    Array.from({ length: 7 }, (_, i) => {
      const d = new Date(currentWeekStart);
      d.setDate(d.getDate() + i);
      return d;
    }),
    [currentWeekStart]
  );

  const events = useMemo<CalEvent[]>(() => {
    const result: CalEvent[] = [];

    anrufe.forEach((a) => {
      if (!a.faellig_am) return;
      result.push({
        id: a.id,
        type: "anruf",
        label: a.kunde?.name1 || "Unbekannt",
        subLabel: a.kunde?.telefon,
        date: new Date(a.faellig_am),
        hour: 9,
        status: a.status,
      });
    });

    besuche.forEach((b) => {
      const dateStr = b.status === "erledigt" ? b.durchgefuehrt_am : b.faellig_am;
      if (!dateStr) return;
      const hour = b.uhrzeit_von
        ? (parseInt(b.uhrzeit_von.split(":")[0], 10) || 10)
        : 10;
      result.push({
        id: b.id,
        type: "besuch",
        label: b.kunde?.name1 || "Unbekannt",
        subLabel: b.uhrzeit_von && b.uhrzeit_bis
          ? `${b.uhrzeit_von}–${b.uhrzeit_bis}${b.bericht ? " 📝" : ""}`
          : b.kunde?.ort,
        date: new Date(dateStr),
        hour,
        status: b.status,
      });
    });

    aufgaben.forEach((a) => {
      if (!a.faellig_am || a.status === "erledigt") return;
      result.push({
        id: a.id,
        type: "aufgabe",
        label: a.titel,
        subLabel: a.kunde?.name1,
        date: new Date(a.faellig_am),
        hour: 14,
        status: a.status,
      });
    });

    return result;
  }, [anrufe, besuche, aufgaben]);

  function getEventsForSlot(day: Date, hour: number) {
    return events.filter((e) => isSameDay(e.date, day) && e.hour === hour);
  }

  const prevWeek = () => {
    const d = new Date(currentWeekStart);
    d.setDate(d.getDate() - 7);
    setCurrentWeekStart(d);
  };

  const nextWeek = () => {
    const d = new Date(currentWeekStart);
    d.setDate(d.getDate() + 7);
    setCurrentWeekStart(d);
  };

  const goToday = () => setCurrentWeekStart(getWeekStart(new Date()));

  const today = new Date();
  const kw = getKW(currentWeekStart);

  // Sidebar items: fällige anrufe & besuche in this week
  const weekEnd = new Date(weekDays[6]);
  weekEnd.setHours(23, 59, 59, 999);
  const faelligeAnrufe = anrufe.filter(
    (a) => a.status === "offen" && a.faellig_am && new Date(a.faellig_am) >= currentWeekStart && new Date(a.faellig_am) <= weekEnd
  );
  const faelligeBesuche = besuche.filter(
    (b) => b.status === "offen" && b.faellig_am && new Date(b.faellig_am) >= currentWeekStart && new Date(b.faellig_am) <= weekEnd
  );
  const faelligeAufgaben = aufgaben.filter(
    (a) => a.status !== "erledigt" && a.faellig_am && new Date(a.faellig_am) >= currentWeekStart && new Date(a.faellig_am) <= weekEnd
  );

  const eventColors = {
    anruf: { bg: "bg-blue-100 dark:bg-blue-900/40", border: "border-blue-400", text: "text-blue-700 dark:text-blue-300", icon: Phone },
    besuch: { bg: "bg-green-100 dark:bg-green-900/40", border: "border-green-400", text: "text-green-700 dark:text-green-300", icon: MapPin },
    aufgabe: { bg: "bg-orange-100 dark:bg-orange-900/40", border: "border-orange-400", text: "text-orange-700 dark:text-orange-300", icon: CheckSquare },
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Header
        title="Wochenplanung"
        subtitle={`KW ${kw} · ${weekDays[0].toLocaleDateString("de-DE", { day: "2-digit", month: "short" })} – ${weekDays[6].toLocaleDateString("de-DE", { day: "2-digit", month: "short", year: "numeric" })}`}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar – Fällige Items */}
        <div className="w-56 shrink-0 border-r border-border bg-muted/20 overflow-y-auto p-4 space-y-5">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Phone className="w-3.5 h-3.5 text-blue-500" />
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Anrufe</span>
              <span className="ml-auto text-xs font-bold text-blue-600 bg-blue-100 dark:bg-blue-900/40 rounded-full px-1.5 py-0.5">{faelligeAnrufe.length}</span>
            </div>
            <div className="space-y-1.5">
              {faelligeAnrufe.length === 0 && <p className="text-xs text-muted-foreground">Keine fälligen Anrufe</p>}
              {faelligeAnrufe.map((a) => (
                <Link key={a.id} href="/anrufe">
                  <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 px-2.5 py-2 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors cursor-pointer">
                    <p className="text-xs font-medium text-blue-800 dark:text-blue-200 leading-tight truncate">{a.kunde?.name1 || "–"}</p>
                    {a.faellig_am && <p className="text-[10px] text-blue-500 mt-0.5">{formatDate(a.faellig_am)}</p>}
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-3.5 h-3.5 text-green-500" />
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Besuche</span>
              <span className="ml-auto text-xs font-bold text-green-600 bg-green-100 dark:bg-green-900/40 rounded-full px-1.5 py-0.5">{faelligeBesuche.length}</span>
            </div>
            <div className="space-y-1.5">
              {faelligeBesuche.length === 0 && <p className="text-xs text-muted-foreground">Keine Besuche</p>}
              {faelligeBesuche.map((b) => (
                <Link key={b.id} href="/besuche">
                  <div className="rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 px-2.5 py-2 hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors cursor-pointer">
                    <p className="text-xs font-medium text-green-800 dark:text-green-200 leading-tight truncate">{b.kunde?.name1 || "–"}</p>
                    {b.faellig_am && <p className="text-[10px] text-green-500 mt-0.5">{formatDate(b.faellig_am)}</p>}
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <CheckSquare className="w-3.5 h-3.5 text-orange-500" />
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Aufgaben</span>
              <span className="ml-auto text-xs font-bold text-orange-600 bg-orange-100 dark:bg-orange-900/40 rounded-full px-1.5 py-0.5">{faelligeAufgaben.length}</span>
            </div>
            <div className="space-y-1.5">
              {faelligeAufgaben.length === 0 && <p className="text-xs text-muted-foreground">Keine Aufgaben</p>}
              {faelligeAufgaben.map((a) => (
                <Link key={a.id} href="/aufgaben">
                  <div className="rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 px-2.5 py-2 hover:bg-orange-100 dark:hover:bg-orange-900/40 transition-colors cursor-pointer">
                    <p className="text-xs font-medium text-orange-800 dark:text-orange-200 leading-tight truncate">{a.titel}</p>
                    {a.faellig_am && <p className="text-[10px] text-orange-500 mt-0.5">{formatDate(a.faellig_am)}</p>}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Calendar Area */}
        <div className="flex-1 overflow-auto">
          {/* Week Navigation + Day Headers */}
          <div className="sticky top-0 z-20 bg-background border-b border-border">
            {/* Navigation row */}
            <div className="flex items-center gap-3 px-4 py-2.5 border-b border-border/50">
              <Button variant="outline" size="sm" onClick={prevWeek} className="h-8 w-8 p-0">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-semibold">KW {kw}</span>
              </div>
              <Button variant="outline" size="sm" onClick={nextWeek} className="h-8 w-8 p-0">
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={goToday} className="h-8 text-xs px-3">
                Heute
              </Button>
            </div>

            {/* Day header row */}
            <div className="grid grid-cols-[4rem_1fr_1fr_1fr_1fr_1fr_1fr_1fr] border-b border-border">
              <div className="px-2 py-2.5" />
              {weekDays.map((day, i) => {
                const isToday = isSameDay(day, today);
                return (
                  <div key={i} className={`px-2 py-2.5 text-center border-l border-border/50 ${isToday ? "bg-[#E3000F]/5" : ""}`}>
                    <p className={`text-xs font-semibold uppercase tracking-wide ${isToday ? "text-[#E3000F]" : "text-muted-foreground"}`}>
                      {DAYS[i]}
                    </p>
                    <p className={`text-lg font-bold leading-tight ${isToday ? "text-[#E3000F]" : "text-foreground"}`}>
                      {day.getDate()}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {day.toLocaleDateString("de-DE", { month: "short" })}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Time Grid */}
          <div>
            {HOURS.map((hour) => (
              <div key={hour} className="grid grid-cols-[4rem_1fr_1fr_1fr_1fr_1fr_1fr_1fr] border-b border-border/30 min-h-[5rem]">
                {/* Time Label */}
                <div className="px-2 py-2 text-right">
                  <span className="text-xs text-muted-foreground font-mono">{String(hour).padStart(2, "0")}:00</span>
                </div>

                {/* Day Cells */}
                {weekDays.map((day, di) => {
                  const isToday = isSameDay(day, today);
                  const slotEvents = getEventsForSlot(day, hour);
                  return (
                    <div
                      key={di}
                      className={`border-l border-border/50 p-1 ${isToday ? "bg-[#E3000F]/[0.02]" : ""} hover:bg-muted/20 transition-colors`}
                    >
                      {slotEvents.map((ev) => {
                        const colors = eventColors[ev.type];
                        const Icon = colors.icon;
                        return (
                          <div
                            key={ev.id}
                            className={`rounded-lg border-l-2 px-2 py-1.5 mb-1 text-left ${colors.bg} ${colors.border} ${ev.status === "erledigt" ? "opacity-50" : ""}`}
                          >
                            <div className={`flex items-center gap-1 ${colors.text}`}>
                              <Icon className="w-3 h-3 shrink-0" />
                              <span className="text-[11px] font-semibold truncate leading-tight">{ev.label}</span>
                            </div>
                            {ev.subLabel && (
                              <p className={`text-[10px] truncate mt-0.5 ${colors.text} opacity-70`}>{ev.subLabel}</p>
                            )}
                            {ev.status === "erledigt" && (
                              <span className="text-[9px] font-medium text-muted-foreground">✓ Erledigt</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
