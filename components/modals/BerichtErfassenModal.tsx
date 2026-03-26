"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { mockKunden } from "@/lib/mock-data";
import { useCRM } from "@/lib/crm-context";
import type { Besuch } from "@/lib/types";

const MITARBEITER = [
  { id: "1", name: "Thomas Berger" },
  { id: "2", name: "Sandra Koch" },
  { id: "3", name: "Jan Hofmann" },
  { id: "4", name: "Maria Schulz" },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export function BerichtErfassenModal({ open, onClose }: Props) {
  const router = useRouter();
  const { addBesuch } = useCRM();

  const today = new Date().toISOString().split("T")[0];

  const [kundeId, setKundeId] = useState("");
  const [datum, setDatum] = useState(today);
  const [uhrzeitVon, setUhrzeitVon] = useState("");
  const [uhrzeitBis, setUhrzeitBis] = useState("");
  const [mitarbeiter, setMitarbeiter] = useState("Thomas Berger");
  const [notizen, setNotizen] = useState("");
  const [saving, setSaving] = useState(false);

  // Auto-calculate duration in minutes
  const calcDauer = () => {
    if (!uhrzeitVon || !uhrzeitBis) return undefined;
    const [h1, m1] = uhrzeitVon.split(":").map(Number);
    const [h2, m2] = uhrzeitBis.split(":").map(Number);
    const diff = (h2 * 60 + m2) - (h1 * 60 + m1);
    return diff > 0 ? diff : undefined;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kundeId || !datum) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 400));

    const kunde = mockKunden.find((k) => k.id === kundeId);
    const id = `besuch-${Date.now()}`;
    const newBesuch: Besuch = {
      id,
      kunde_id: kundeId,
      kunde: kunde || undefined,
      mitarbeiter_name: mitarbeiter,
      durchgefuehrt_am: datum,
      uhrzeit_von: uhrzeitVon || undefined,
      uhrzeit_bis: uhrzeitBis || undefined,
      dauer_minuten: calcDauer(),
      notizen: notizen || undefined,
      status: "erledigt",
      created_at: new Date().toISOString(),
    };

    addBesuch(newBesuch);
    setSaving(false);

    // Reset form
    setKundeId("");
    setDatum(today);
    setUhrzeitVon("");
    setUhrzeitBis("");
    setMitarbeiter("Thomas Berger");
    setNotizen("");

    onClose();
    router.push(`/besuche/${id}`);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
              <FileText className="w-4 h-4 text-emerald-600" />
            </div>
            Bericht erfassen
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {/* Kunde */}
          <div className="space-y-1.5">
            <Label>
              Kunde <span className="text-red-500">*</span>
            </Label>
            <Select value={kundeId} onValueChange={setKundeId}>
              <SelectTrigger>
                <SelectValue placeholder="Kunde wählen" />
              </SelectTrigger>
              <SelectContent>
                {mockKunden.map((k) => (
                  <SelectItem key={k.id} value={k.id}>
                    {k.name1}
                    {k.ort ? ` · ${k.ort}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Datum */}
          <div className="space-y-1.5">
            <Label htmlFor="datum">
              Datum des Besuchs <span className="text-red-500">*</span>
            </Label>
            <Input
              id="datum"
              type="date"
              value={datum}
              max={today}
              onChange={(e) => setDatum(e.target.value)}
            />
          </div>

          {/* Uhrzeit von / bis */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="von">Uhrzeit von</Label>
              <Input
                id="von"
                type="time"
                value={uhrzeitVon}
                onChange={(e) => setUhrzeitVon(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bis">Uhrzeit bis</Label>
              <Input
                id="bis"
                type="time"
                value={uhrzeitBis}
                onChange={(e) => setUhrzeitBis(e.target.value)}
              />
            </div>
          </div>

          {/* Dauer preview */}
          {calcDauer() && (
            <p className="text-xs text-muted-foreground -mt-1">
              Dauer: {calcDauer()} Minuten
            </p>
          )}

          {/* Mitarbeiter */}
          <div className="space-y-1.5">
            <Label>Mitarbeiter</Label>
            <Select value={mitarbeiter} onValueChange={setMitarbeiter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MITARBEITER.map((m) => (
                  <SelectItem key={m.id} value={m.name}>
                    {m.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Notizen */}
          <div className="space-y-1.5">
            <Label htmlFor="notizen">Kurze Notizen (optional)</Label>
            <textarea
              id="notizen"
              value={notizen}
              onChange={(e) => setNotizen(e.target.value)}
              placeholder="Gesprächspartner, Themen..."
              className="w-full min-h-[70px] rounded-xl border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={saving}
            >
              Abbrechen
            </Button>
            <Button
              type="submit"
              disabled={saving || !kundeId || !datum}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {saving ? "Wird gespeichert..." : "Bericht anlegen →"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
