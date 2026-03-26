"use client";

import { useState } from "react";
import { MapPin } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { mockKunden } from "@/lib/mock-data";
import { useCRM } from "@/lib/crm-context";
import type { Besuch } from "@/lib/types";

interface Props {
  open: boolean;
  onClose: () => void;
  onAdd: (besuch: Besuch) => void;
  defaultKundeId?: string;
}

export function NeuerBesuchModal({ open, onClose, onAdd, defaultKundeId }: Props) {
  const { ansprechpartner } = useCRM();

  const [kundeId, setKundeId] = useState(defaultKundeId || "");
  const [faelligAm, setFaelligAm] = useState("");
  const [dauer, setDauer] = useState("60");
  const [ansprechpartnerId, setAnsprechpartnerId] = useState("");
  const [notizen, setNotizen] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const kundenAnsprechpartner = ansprechpartner.filter((a) => a.kunde_id === kundeId);
  const selectedKunde = mockKunden.find((k) => k.id === kundeId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kundeId) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 400));

    const kunde = mockKunden.find((k) => k.id === kundeId);
    const selectedAP = kundenAnsprechpartner.find((a) => a.id === ansprechpartnerId);
    const newBesuch: Besuch = {
      id: `besuch-${Date.now()}`,
      kunde_id: kundeId,
      kunde: kunde || undefined,
      faellig_am: faelligAm || undefined,
      notizen: notizen || undefined,
      dauer_minuten: dauer ? parseInt(dauer) : undefined,
      ansprechpartner_id: ansprechpartnerId || undefined,
      ansprechpartner_name: selectedAP?.name || undefined,
      status: "offen",
      created_at: new Date().toISOString(),
    };

    onAdd(newBesuch);
    setSaving(false);
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      setKundeId(defaultKundeId || "");
      setFaelligAm("");
      setDauer("60");
      setAnsprechpartnerId("");
      setNotizen("");
      onClose();
    }, 800);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30">
              <MapPin className="w-4 h-4 text-green-600" />
            </div>
            Besuch planen
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <div className="space-y-1.5">
            <Label>Kunde <span className="text-red-500">*</span></Label>
            <Select value={kundeId} onValueChange={(v) => { setKundeId(v); setAnsprechpartnerId(""); }}>
              <SelectTrigger><SelectValue placeholder="Kunde wählen" /></SelectTrigger>
              <SelectContent>
                {mockKunden.map((k) => (
                  <SelectItem key={k.id} value={k.id}>
                    {k.name1}{k.ort ? ` · ${k.ort}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedKunde?.strasse && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
              <MapPin className="w-3.5 h-3.5 text-green-500 shrink-0" />
              <span className="text-sm text-green-700 dark:text-green-400">
                {selectedKunde.strasse}, {selectedKunde.plz} {selectedKunde.ort}
              </span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="faellig">Datum</Label>
              <Input
                id="faellig"
                type="date"
                value={faelligAm}
                onChange={(e) => setFaelligAm(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dauer">Dauer (Min.)</Label>
              <Input
                id="dauer"
                type="number"
                min="15"
                step="15"
                value={dauer}
                onChange={(e) => setDauer(e.target.value)}
                placeholder="60"
              />
            </div>
          </div>

          {/* Ansprechpartner */}
          <div className="space-y-1.5">
            <Label>Ansprechpartner</Label>
            <Select
              value={ansprechpartnerId}
              onValueChange={setAnsprechpartnerId}
              disabled={!kundeId}
            >
              <SelectTrigger>
                <SelectValue placeholder={!kundeId ? "Zuerst Kunde wählen" : "Ansprechpartner wählen"} />
              </SelectTrigger>
              <SelectContent>
                {kundenAnsprechpartner.length === 0 ? (
                  <SelectItem value="__none__" disabled>
                    Kein Ansprechpartner hinterlegt
                  </SelectItem>
                ) : (
                  kundenAnsprechpartner.map((ap) => (
                    <SelectItem key={ap.id} value={ap.id}>
                      {ap.name}{ap.position ? ` · ${ap.position}` : ""}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notizen">Notizen / Agenda</Label>
            <textarea
              id="notizen"
              value={notizen}
              onChange={(e) => setNotizen(e.target.value)}
              placeholder="Besuchsziel, Themen..."
              className="w-full min-h-[80px] rounded-xl border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={saving || !kundeId} className={success ? "bg-green-600 hover:bg-green-600" : ""}>
              {success ? "✓ Gespeichert!" : saving ? "Speichern..." : "Besuch planen"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
