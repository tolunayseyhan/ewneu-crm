"use client";

import { useState } from "react";
import { Phone } from "lucide-react";
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
import type { Anruf } from "@/lib/types";

const MITARBEITER = [
  { id: "1", name: "Thomas Berger" },
  { id: "2", name: "Sandra Koch" },
  { id: "3", name: "Jan Hofmann" },
  { id: "4", name: "Maria Schulz" },
];

interface Props {
  open: boolean;
  onClose: () => void;
  onAdd: (anruf: Anruf) => void;
  defaultKundeId?: string;
}

export function NeuerAnrufModal({ open, onClose, onAdd, defaultKundeId }: Props) {
  const [kundeId, setKundeId] = useState(defaultKundeId || "");
  const [faelligAm, setFaelligAm] = useState("");
  const [mitarbeiter, setMitarbeiter] = useState("Thomas Berger");
  const [notizen, setNotizen] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kundeId) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 400));

    const kunde = mockKunden.find((k) => k.id === kundeId);
    const newAnruf: Anruf = {
      id: `anruf-${Date.now()}`,
      kunde_id: kundeId,
      kunde: kunde || undefined,
      mitarbeiter_name: mitarbeiter,
      faellig_am: faelligAm || undefined,
      notizen: notizen || undefined,
      status: "offen",
      created_at: new Date().toISOString(),
    };

    onAdd(newAnruf);
    setSaving(false);
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      setKundeId(defaultKundeId || "");
      setFaelligAm("");
      setMitarbeiter("Thomas Berger");
      setNotizen("");
      onClose();
    }, 800);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <Phone className="w-4 h-4 text-blue-600" />
            </div>
            Anruf erfassen
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <div className="space-y-1.5">
            <Label>
              Kunde <span className="text-red-500">*</span>
            </Label>
            <Select value={kundeId} onValueChange={setKundeId} required>
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

          {kundeId && (() => {
            const k = mockKunden.find((k) => k.id === kundeId);
            return k?.telefon ? (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                <Phone className="w-3.5 h-3.5 text-blue-500" />
                <a href={`tel:${k.telefon}`} className="text-sm text-blue-600 dark:text-blue-400 font-mono">
                  {k.telefon}
                </a>
              </div>
            ) : null;
          })()}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="faellig">Fällig am</Label>
              <Input
                id="faellig"
                type="date"
                value={faelligAm}
                onChange={(e) => setFaelligAm(e.target.value)}
              />
            </div>

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
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notizen">Notizen</Label>
            <textarea
              id="notizen"
              value={notizen}
              onChange={(e) => setNotizen(e.target.value)}
              placeholder="Gesprächsziel, Thema..."
              className="w-full min-h-[80px] rounded-xl border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={saving || !kundeId} className={success ? "bg-green-600 hover:bg-green-600" : ""}>
              {success ? "✓ Gespeichert!" : saving ? "Speichern..." : "Anruf erfassen"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
