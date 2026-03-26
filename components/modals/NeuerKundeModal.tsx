"use client";

import { useState } from "react";
import { Users } from "lucide-react";
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
import type { Kunde } from "@/lib/types";

const BRANCHEN = [
  "Metallverarbeitung",
  "Logistik",
  "Baugewerbe",
  "Elektronik",
  "Chemie",
  "Automobil",
  "Maschinenbau",
  "Handel",
  "Sonstiges",
];

interface Props {
  open: boolean;
  onClose: () => void;
  onAdd: (kunde: Kunde) => void;
}

export function NeuerKundeModal({ open, onClose, onAdd }: Props) {
  const [name1, setName1] = useState("");
  const [name2, setName2] = useState("");
  const [strasse, setStrasse] = useState("");
  const [plz, setPlz] = useState("");
  const [ort, setOrt] = useState("");
  const [telefon, setTelefon] = useState("");
  const [email, setEmail] = useState("");
  const [branche, setBranche] = useState("");
  const [status, setStatus] = useState<"aktiv" | "inaktiv" | "neu">("neu");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name1.trim()) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 400));

    const num = `K-${10000 + Math.floor(Math.random() * 9000)}`;
    const newKunde: Kunde = {
      id: `kunde-${Date.now()}`,
      nummer: num,
      name1,
      name2: name2 || undefined,
      strasse: strasse || undefined,
      plz: plz || undefined,
      ort: ort || undefined,
      telefon: telefon || undefined,
      email: email || undefined,
      branche: branche || undefined,
      status,
      created_at: new Date().toISOString(),
    };

    onAdd(newKunde);
    setSaving(false);
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      setName1(""); setName2(""); setStrasse(""); setPlz("");
      setOrt(""); setTelefon(""); setEmail(""); setBranche("");
      setStatus("neu");
      onClose();
    }, 800);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#E3000F]/10">
              <Users className="w-4 h-4 text-[#E3000F]" />
            </div>
            Neuer Kunde
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5 col-span-2">
              <Label htmlFor="name1">
                Firmenname <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name1"
                value={name1}
                onChange={(e) => setName1(e.target.value)}
                placeholder="z.B. Müller & Söhne GmbH"
                required
                autoFocus
              />
            </div>

            <div className="space-y-1.5 col-span-2">
              <Label htmlFor="name2">Zusatz</Label>
              <Input
                id="name2"
                value={name2}
                onChange={(e) => setName2(e.target.value)}
                placeholder="Abteilung / Zusatz"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="strasse">Straße</Label>
            <Input
              id="strasse"
              value={strasse}
              onChange={(e) => setStrasse(e.target.value)}
              placeholder="Musterstraße 1"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="plz">PLZ</Label>
              <Input
                id="plz"
                value={plz}
                onChange={(e) => setPlz(e.target.value)}
                placeholder="12345"
              />
            </div>
            <div className="space-y-1.5 col-span-2">
              <Label htmlFor="ort">Ort</Label>
              <Input
                id="ort"
                value={ort}
                onChange={(e) => setOrt(e.target.value)}
                placeholder="Stadt"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="telefon">Telefon</Label>
              <Input
                id="telefon"
                type="tel"
                value={telefon}
                onChange={(e) => setTelefon(e.target.value)}
                placeholder="+49 211 ..."
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">E-Mail</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="info@firma.de"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Branche</Label>
              <Select value={branche} onValueChange={setBranche}>
                <SelectTrigger>
                  <SelectValue placeholder="Branche wählen" />
                </SelectTrigger>
                <SelectContent>
                  {BRANCHEN.map((b) => (
                    <SelectItem key={b} value={b}>{b}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as "aktiv" | "inaktiv" | "neu")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="neu">Neu</SelectItem>
                  <SelectItem value="aktiv">Aktiv</SelectItem>
                  <SelectItem value="inaktiv">Inaktiv</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={saving || !name1.trim()} className={success ? "bg-green-600 hover:bg-green-600" : ""}>
              {success ? "✓ Gespeichert!" : saving ? "Speichern..." : "Kunde anlegen"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
