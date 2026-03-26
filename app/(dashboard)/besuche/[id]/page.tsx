"use client";

import { useState, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import {
  ArrowLeft, Clock, User, MapPin, CheckCircle2, Plus,
  Paperclip, Trash2, FileText, Calendar, ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/shared/StatusBadge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useCRM } from "@/lib/crm-context";
import { formatDate } from "@/lib/utils";
import type { Aufgabe, Anhang } from "@/lib/types";
import { NeuerBesuchModal } from "@/components/modals/NeuerBesuchModal";

const MIME_ICONS: Record<string, string> = {
  "application/pdf": "📄",
  "image/": "🖼️",
  "application/msword": "📝",
  "application/vnd.openxmlformats": "📝",
  "text/": "📃",
};
function getMimeIcon(mime: string) {
  for (const [key, icon] of Object.entries(MIME_ICONS)) {
    if (mime.startsWith(key)) return icon;
  }
  return "📎";
}
function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
function calcDauer(von?: string, bis?: string): number | undefined {
  if (!von || !bis) return undefined;
  const [h1, m1] = von.split(":").map(Number);
  const [h2, m2] = bis.split(":").map(Number);
  const diff = (h2 * 60 + m2) - (h1 * 60 + m1);
  return diff > 0 ? diff : undefined;
}

export default function BesuchDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { besuche, aufgaben, markBesuchDone, updateBesuch, addAnhangToBesuch, removeAnhangFromBesuch, addAufgabe, addBesuch } = useCRM();

  const besuch = besuche.find((b) => b.id === id);

  const [uhrzeitVon, setUhrzeitVon] = useState(besuch?.uhrzeit_von || "");
  const [uhrzeitBis, setUhrzeitBis] = useState(besuch?.uhrzeit_bis || "");
  const [bericht, setBericht] = useState(besuch?.bericht || "");
  const [berichtSaved, setBerichtSaved] = useState(false);

  const [aufgabeTitel, setAufgabeTitel] = useState(`Nachbereitung: ${besuch?.kunde?.name1 || ""}`);
  const [aufgabePrio, setAufgabePrio] = useState<"hoch" | "mittel" | "niedrig">("mittel");
  const [aufgabeFaellig, setAufgabeFaellig] = useState("");
  const [aufgabeAdded, setAufgabeAdded] = useState(false);

  const [showFolgeterminModal, setShowFolgeterminModal] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files || !besuch) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const anhang: Anhang = {
          id: `anhang-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          name: file.name,
          size: file.size,
          mime: file.type,
          data_url: e.target?.result as string,
          created_at: new Date().toISOString(),
        };
        addAnhangToBesuch(besuch.id, anhang);
      };
      reader.readAsDataURL(file);
    });
  }, [besuch, addAnhangToBesuch]);

  if (!besuch) {
    return (
      <div className="p-6">
        <Link href="/besuche">
          <Button variant="ghost" size="sm" className="gap-2 mb-4">
            <ArrowLeft className="w-4 h-4" /> Zurück zu Besuche
          </Button>
        </Link>
        <p className="text-muted-foreground">Besuch nicht gefunden.</p>
      </div>
    );
  }

  const displayDate = besuch.status === "erledigt"
    ? besuch.durchgefuehrt_am
    : besuch.faellig_am;

  const dauer = calcDauer(uhrzeitVon, uhrzeitBis) ?? besuch.dauer_minuten;

  const saveZeitraum = () => {
    updateBesuch(besuch.id, {
      uhrzeit_von: uhrzeitVon || undefined,
      uhrzeit_bis: uhrzeitBis || undefined,
      dauer_minuten: calcDauer(uhrzeitVon, uhrzeitBis),
    });
  };

  const saveBericht = () => {
    updateBesuch(besuch.id, { bericht });
    setBerichtSaved(true);
    setTimeout(() => setBerichtSaved(false), 2000);
  };

  const handleAddAufgabe = () => {
    if (!aufgabeTitel.trim()) return;
    const newAufgabe: Aufgabe = {
      id: `aufgabe-${Date.now()}`,
      titel: aufgabeTitel,
      kunde_id: besuch.kunde_id,
      kunde: besuch.kunde,
      prioritaet: aufgabePrio,
      faellig_am: aufgabeFaellig || undefined,
      status: "offen",
      created_at: new Date().toISOString(),
    };
    addAufgabe(newAufgabe);
    updateBesuch(besuch.id, {
      aufgaben_ids: [...(besuch.aufgaben_ids || []), newAufgabe.id],
    });
    setAufgabeAdded(true);
    setAufgabeTitel(`Nachbereitung: ${besuch.kunde?.name1 || ""}`);
    setAufgabePrio("mittel");
    setAufgabeFaellig("");
    setTimeout(() => setAufgabeAdded(false), 2000);
  };

  const linkedAufgaben = aufgaben.filter((a) => besuch.aufgaben_ids?.includes(a.id));

  return (
    <div>
      <Header
        title={besuch.kunde?.name1 || "Besuch"}
        subtitle={displayDate ? formatDate(displayDate) : "Kein Datum"}
      />

      <div className="p-6 space-y-5">
        {/* Back + Status */}
        <div className="flex items-center justify-between">
          <Link href="/besuche">
            <Button variant="ghost" size="sm" className="gap-2 -ml-2">
              <ArrowLeft className="w-4 h-4" /> Besuche
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <StatusBadge status={besuch.status} />
            {besuch.status === "offen" && (
              <Button
                size="sm"
                variant="outline"
                className="gap-2 text-green-600 border-green-300 hover:bg-green-50 dark:hover:bg-green-900/20"
                onClick={() => markBesuchDone(besuch.id)}
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Als erledigt markieren
              </Button>
            )}
          </div>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* LEFT COLUMN (2/5) */}
          <div className="lg:col-span-2 space-y-4">

            {/* Metadaten Card */}
            <div className="rounded-2xl border border-border bg-card p-4 space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Besuchsdetails</h3>

              {/* Datum */}
              <div className="flex items-start gap-3">
                <Calendar className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Datum</p>
                  <p className="text-sm font-medium">{displayDate ? formatDate(displayDate) : "–"}</p>
                </div>
              </div>

              {/* Zeitraum */}
              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground mb-1.5">Zeitraum</p>
                  <div className="flex items-center gap-2">
                    <Input
                      type="time"
                      value={uhrzeitVon}
                      onChange={(e) => setUhrzeitVon(e.target.value)}
                      onBlur={saveZeitraum}
                      className="h-8 text-sm w-28"
                    />
                    <span className="text-muted-foreground text-sm">–</span>
                    <Input
                      type="time"
                      value={uhrzeitBis}
                      onChange={(e) => setUhrzeitBis(e.target.value)}
                      onBlur={saveZeitraum}
                      className="h-8 text-sm w-28"
                    />
                  </div>
                  {dauer && (
                    <p className="text-xs text-muted-foreground mt-1">{dauer} Minuten</p>
                  )}
                </div>
              </div>

              {/* Mitarbeiter */}
              <div className="flex items-start gap-3">
                <User className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Mitarbeiter</p>
                  <p className="text-sm font-medium">{besuch.mitarbeiter_name || "–"}</p>
                </div>
              </div>

              {/* Kunde Adresse */}
              {besuch.kunde?.strasse && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Adresse</p>
                    <p className="text-sm">{besuch.kunde.strasse}</p>
                    <p className="text-sm">{besuch.kunde.plz} {besuch.kunde.ort}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Aufgabe erstellen — only when erledigt */}
            {besuch.status === "erledigt" && (
              <div className="rounded-2xl border border-orange-200 dark:border-orange-800 bg-orange-50/50 dark:bg-orange-900/10 p-4 space-y-3">
                <h3 className="text-sm font-semibold text-orange-700 dark:text-orange-400 flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Aufgabe erstellen
                </h3>
                <div className="space-y-2">
                  <Input
                    value={aufgabeTitel}
                    onChange={(e) => setAufgabeTitel(e.target.value)}
                    placeholder="Aufgabentitel"
                    className="text-sm h-8"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Select value={aufgabePrio} onValueChange={(v) => setAufgabePrio(v as "hoch" | "mittel" | "niedrig")}>
                      <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hoch">🔴 Hoch</SelectItem>
                        <SelectItem value="mittel">🟡 Mittel</SelectItem>
                        <SelectItem value="niedrig">🟢 Niedrig</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      type="date"
                      value={aufgabeFaellig}
                      onChange={(e) => setAufgabeFaellig(e.target.value)}
                      className="h-8 text-sm"
                    />
                  </div>
                  <Button
                    size="sm"
                    className="w-full gap-2 bg-orange-600 hover:bg-orange-700 text-white"
                    onClick={handleAddAufgabe}
                    disabled={!aufgabeTitel.trim()}
                  >
                    {aufgabeAdded ? "✓ Aufgabe angelegt!" : "+ Aufgabe anlegen"}
                  </Button>
                </div>

                {/* Linked tasks */}
                {linkedAufgaben.length > 0 && (
                  <div className="pt-2 border-t border-orange-200 dark:border-orange-800 space-y-1.5">
                    <p className="text-xs font-semibold text-muted-foreground">Verknüpfte Aufgaben</p>
                    {linkedAufgaben.map((a) => (
                      <Link key={a.id} href="/aufgaben">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
                          <ExternalLink className="w-3 h-3 shrink-0" />
                          <span className="truncate">{a.titel}</span>
                          <StatusBadge status={a.prioritaet} />
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN (3/5) */}
          <div className="lg:col-span-3 space-y-4">

            {/* Besuchsbericht */}
            <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <FileText className="w-4 h-4" /> Besuchsbericht
              </h3>
              <textarea
                autoFocus
                value={bericht}
                onChange={(e) => setBericht(e.target.value)}
                placeholder="Besuchsbericht verfassen — Gesprächsinhalt, Ergebnisse, nächste Schritte…"
                className="w-full min-h-[160px] rounded-xl border border-input bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
              />
              <div className="flex justify-end">
                <Button
                  size="sm"
                  onClick={saveBericht}
                  className={berichtSaved ? "bg-green-600 hover:bg-green-600" : ""}
                >
                  {berichtSaved ? "✓ Gespeichert!" : "Speichern"}
                </Button>
              </div>
            </div>

            {/* Dateianhänge */}
            <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Paperclip className="w-4 h-4" /> Dateianhänge
              </h3>

              {/* Drop zone */}
              <div
                className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-colors ${
                  dragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/30"
                }`}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
              >
                <Paperclip className="w-5 h-5 mx-auto mb-1.5 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Datei hierher ziehen oder <span className="text-primary font-medium">auswählen</span>
                </p>
                <p className="text-xs text-muted-foreground/60 mt-0.5">Alle Dateitypen erlaubt</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
              />

              {/* File list */}
              {(besuch.anhänge || []).length > 0 && (
                <div className="space-y-1.5">
                  {(besuch.anhänge || []).map((anhang) => (
                    <div key={anhang.id} className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-3 py-2">
                      <span className="text-lg shrink-0">{getMimeIcon(anhang.mime)}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{anhang.name}</p>
                        <p className="text-xs text-muted-foreground">{formatBytes(anhang.size)}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-red-500"
                        onClick={() => removeAnhangFromBesuch(besuch.id, anhang.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Folgetermin */}
            <div className="rounded-2xl border border-border bg-card p-4">
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4" /> Folgetermin
              </h3>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => setShowFolgeterminModal(true)}
              >
                <Plus className="w-3.5 h-3.5" />
                Folgetermin bei {besuch.kunde?.name1 || "diesem Kunden"} planen
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Follow-up modal */}
      <NeuerBesuchModal
        open={showFolgeterminModal}
        onClose={() => setShowFolgeterminModal(false)}
        onAdd={addBesuch}
        defaultKundeId={besuch.kunde_id}
      />
    </div>
  );
}
