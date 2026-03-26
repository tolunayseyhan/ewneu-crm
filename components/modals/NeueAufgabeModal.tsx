"use client";

import { useState } from "react";
import { CheckSquare } from "lucide-react";
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
import type { Aufgabe } from "@/lib/types";

const MITARBEITER = [
  { id: "1", name: "Thomas Berger" },
  { id: "2", name: "Sandra Koch" },
  { id: "3", name: "Jan Hofmann" },
  { id: "4", name: "Maria Schulz" },
];

interface Props {
  open: boolean;
  onClose: () => void;
  onAdd: (aufgabe: Aufgabe) => void;
  defaultKundeId?: string;
}

export function NeueAufgabeModal({ open, onClose, onAdd, defaultKundeId }: Props) {
  const [titel, setTitel] = useState("");
  const [beschreibung, setBeschreibung] = useState("");
  const [kundeId, setKundeId] = useState(defaultKundeId || "");
  const [mitarbeiter, setMitarbeiter] = useState("Thomas Berger");
  const [prioritaet, setPrioraet] = useState<"hoch" | "mittel" | "niedrig">("mittel");
  const [faelligAm, setFaelligAm] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titel.trim()) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 400));

    const kunde = mockKunden.find((k) => k.id === kundeId);
    const newAufgabe: Aufgabe = {
      id: `aufgabe-${Date.now()}`,
      titel,
      beschreibung: beschreibung || undefined,
      kunde_id: kundeId || undefined,
      kunde: kunde || undefined,
      zugewiesener_name: mitarbeiter,
      status: "offen",
      prioritaet,
      faellig_am: faelligAm || undefined,
      created_at: new Date().toISOString(),
    };

    onAdd(newAufgabe);
    setSaving(false);
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      setTitel("");
      setBeschreibung("");
      setKundeId(defaultKundeId || "");
      setMitarbeiter("Thomas Berger");
      setPrioraet("mittel");
      setFaelligAm("");
      onClose();
    }, 800);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/30">
              <CheckSquare className="w-4 h-4 text-orange-600" />
            </div>
            Neue Aufgabe
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <div className="space-y-1.5">
            <Label htmlFor="titel">
              Titel <span className="text-red-500">*</span>
            </Label>
            <Input
              id="titel"
              value={titel}
              onChange={(e) => setTitel(e.target.value)}
              placeholder="z.B. Angebot nachfassen"
              required
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="beschreibung">Beschreibung</Label>
            <textarea
              id="beschreibung"
              value={beschreibung}
              onChange={(e) => setBeschreibung(e.target.value)}
              placeholder="Weitere Details..."
              className="w-full min-h-[80px] rounded-xl border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Kunde</Label>
              <Select value={kundeId} onValueChange={setKundeId}>
                <SelectTrigger>
                  <SelectValue placeholder="Kunde wählen" />
                </SelectTrigger>
                <SelectContent>
                  {mockKunden.map((k) => (
                    <SelectItem key={k.id} value={k.id}>
                      {k.name1}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Zugewiesen an</Label>
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
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Priorität</Label>
              <Select value={prioritaet} onValueChange={(v) => setPrioraet(v as "hoch" | "mittel" | "niedrig")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hoch">🔴 Hoch</SelectItem>
                  <SelectItem value="mittel">🟡 Mittel</SelectItem>
                  <SelectItem value="niedrig">🟢 Niedrig</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="faellig">Fällig am</Label>
              <Input
                id="faellig"
                type="date"
                value={faelligAm}
                onChange={(e) => setFaelligAm(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={saving || !titel.trim()} className={success ? "bg-green-600 hover:bg-green-600" : ""}>
              {success ? "✓ Gespeichert!" : saving ? "Speichern..." : "Aufgabe erstellen"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
