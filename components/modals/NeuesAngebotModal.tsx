"use client";

import { useState } from "react";
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
import { formatCurrency } from "@/lib/utils";
import type { Angebot } from "@/lib/types";

interface Props {
  open: boolean;
  onClose: () => void;
  onAdd: (angebot: Angebot) => void;
  defaultKundeId?: string;
}

export function NeuesAngebotModal({ open, onClose, onAdd, defaultKundeId }: Props) {
  const [kundeId, setKundeId] = useState(defaultKundeId || "");
  const [artikel, setArtikel] = useState("");
  const [menge, setMenge] = useState("1");
  const [einzelpreis, setEinzelpreis] = useState("");
  const [status, setStatus] = useState<"offen" | "in_verhandlung">("offen");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const gesamtpreis = parseFloat(menge || "0") * parseFloat(einzelpreis || "0");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kundeId || !artikel.trim()) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 400));

    const kunde = mockKunden.find((k) => k.id === kundeId);
    const num = `ANG-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`;

    const newAngebot: Angebot = {
      id: `angebot-${Date.now()}`,
      nummer: num,
      kunde_id: kundeId,
      kunde: kunde || undefined,
      artikel,
      menge: parseFloat(menge) || 1,
      einzelpreis: parseFloat(einzelpreis) || 0,
      gesamtpreis: gesamtpreis || 0,
      status,
      erstellt_am: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };

    onAdd(newAngebot);
    setSaving(false);
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      setKundeId(defaultKundeId || "");
      setArtikel("");
      setMenge("1");
      setEinzelpreis("");
      setStatus("offen");
      onClose();
    }, 800);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30">
              <FileText className="w-4 h-4 text-purple-600" />
            </div>
            Neues Angebot
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
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
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="artikel">
              Artikel / Beschreibung <span className="text-red-500">*</span>
            </Label>
            <Input
              id="artikel"
              value={artikel}
              onChange={(e) => setArtikel(e.target.value)}
              placeholder="z.B. Fräsmaschine XL-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="menge">Menge</Label>
              <Input
                id="menge"
                type="number"
                min="1"
                value={menge}
                onChange={(e) => setMenge(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="einzelpreis">Einzelpreis (€)</Label>
              <Input
                id="einzelpreis"
                type="number"
                min="0"
                step="0.01"
                value={einzelpreis}
                onChange={(e) => setEinzelpreis(e.target.value)}
                placeholder="0,00"
              />
            </div>
          </div>

          {gesamtpreis > 0 && (
            <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-muted/60 border border-border">
              <span className="text-sm text-muted-foreground">Gesamtpreis</span>
              <span className="text-lg font-bold text-foreground">{formatCurrency(gesamtpreis)}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as "offen" | "in_verhandlung")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="offen">Offen</SelectItem>
                <SelectItem value="in_verhandlung">In Verhandlung</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={saving || !kundeId || !artikel.trim()} className={success ? "bg-green-600 hover:bg-green-600" : ""}>
              {success ? "✓ Gespeichert!" : saving ? "Speichern..." : "Angebot erstellen"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
