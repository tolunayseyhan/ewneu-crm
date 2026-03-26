# Besuchsbericht Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend the Besuche module with visit reports, file attachments, task creation from visits, exact time slots in Wochenplanung, and a visit history tab on the customer detail page.

**Architecture:** Two entry flows on the Besuche list page ("Besuch planen" for future visits, "Bericht erfassen" for past visits). Past visits navigate directly to a new detail page `/besuche/[id]` (two-column layout: metadata/tasks left, report/attachments right). All state lives in CRM Context; file attachments are Base64 in-memory.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4, shadcn/ui (Dialog, Select, Button, Input, Label), Lucide React icons, `useCRM()` context hook.

**Spec:** `docs/superpowers/specs/2026-03-26-besuchsbericht-design.md`

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `lib/types.ts` | Modify | Add `Anhang` type; extend `Besuch` with `uhrzeit_von`, `uhrzeit_bis`, `bericht`, `anhänge`, `aufgaben_ids` |
| `lib/crm-context.tsx` | Modify | Add `updateBesuch`, `addAnhangToBesuch`, `removeAnhangFromBesuch` |
| `lib/mock-data.ts` | Modify | Enrich 2 mock Besuche with `bericht` + `uhrzeit_von/bis` |
| `components/modals/BerichtErfassenModal.tsx` | Create | Modal for logging a past visit; navigates to detail page on submit |
| `app/(dashboard)/besuche/page.tsx` | Modify | Add "Bericht erfassen" button; make rows clickable → `/besuche/[id]`; add 📝/📎 indicators |
| `app/(dashboard)/besuche/[id]/page.tsx` | Create | Visit detail page — two-column layout |
| `app/(dashboard)/wochenplanung/page.tsx` | Modify | Use `uhrzeit_von` for time slot; use `durchgefuehrt_am` for completed visits |
| `components/kunden/KundenBesucheTab.tsx` | Create | Client component: Besuche tab for customer detail page |
| `app/(dashboard)/kunden/[id]/page.tsx` | Modify | Add "Besuche" tab using `KundenBesucheTab` |

---

## Task 1: Extend Types

**Files:**
- Modify: `lib/types.ts`

- [ ] **Step 1: Add `Anhang` interface and extend `Besuch`**

Open `lib/types.ts`. After the existing `Besuch` interface, add the `Anhang` interface. Then add the new optional fields to `Besuch`:

```typescript
// In the Besuch interface, add these fields after `dauer_minuten?`:
  uhrzeit_von?: string;      // "09:30"
  uhrzeit_bis?: string;      // "11:00"
  bericht?: string;
  anhänge?: Anhang[];
  aufgaben_ids?: string[];
```

```typescript
// New interface — add after the Besuch interface:
export interface Anhang {
  id: string;
  name: string;
  size: number;
  mime: string;
  data_url: string;
  created_at: string;
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd C:\Users\tseyhan\Downloads\PPX\ewneu-crm && npx tsc --noEmit 2>&1
```
Expected: no errors (new fields are all optional, no existing code breaks).

- [ ] **Step 3: Commit**

```bash
git add lib/types.ts
git commit -m "feat: extend Besuch type with uhrzeit, bericht, anhänge, aufgaben_ids; add Anhang type"
```

---

## Task 2: Update CRM Context

**Files:**
- Modify: `lib/crm-context.tsx`

- [ ] **Step 1: Add `Anhang` to imports**

In `lib/crm-context.tsx`, update the type import line:
```typescript
import type { Aufgabe, Anruf, Besuch, Anhang } from "./types";
```

- [ ] **Step 2: Add new methods to `CRMContextType` interface**

```typescript
// Add to CRMContextType interface:
updateBesuch: (id: string, updates: Partial<Besuch>) => void;
addAnhangToBesuch: (besuchId: string, anhang: Anhang) => void;
removeAnhangFromBesuch: (besuchId: string, anhangId: string) => void;
```

- [ ] **Step 3: Implement the three new functions inside `CRMProvider`**

```typescript
const updateBesuch = (id: string, updates: Partial<Besuch>) =>
  setBesuche((prev) =>
    prev.map((b) => (b.id === id ? { ...b, ...updates } : b))
  );

const addAnhangToBesuch = (besuchId: string, anhang: Anhang) =>
  setBesuche((prev) =>
    prev.map((b) =>
      b.id === besuchId
        ? { ...b, anhänge: [...(b.anhänge || []), anhang] }
        : b
    )
  );

const removeAnhangFromBesuch = (besuchId: string, anhangId: string) =>
  setBesuche((prev) =>
    prev.map((b) =>
      b.id === besuchId
        ? { ...b, anhänge: (b.anhänge || []).filter((a) => a.id !== anhangId) }
        : b
    )
  );
```

- [ ] **Step 4: Pass new functions in the Provider's `value` prop**

```typescript
value={{
  aufgaben, anrufe, besuche,
  addAufgabe, addAnruf, addBesuch,
  markAnrufDone, markBesuchDone, markAufgabeDone,
  updateBesuch, addAnhangToBesuch, removeAnhangFromBesuch,
}}
```

- [ ] **Step 5: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1
```
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add lib/crm-context.tsx
git commit -m "feat: add updateBesuch, addAnhangToBesuch, removeAnhangFromBesuch to CRM context"
```

---

## Task 3: Enrich Mock Data

**Files:**
- Modify: `lib/mock-data.ts`

- [ ] **Step 1: Find the mockBesuche array**

Search for `mockBesuche` in `lib/mock-data.ts`. Find the entry with `id: "3"` (the one with `status: "erledigt"`) and the entry with `id: "1"`.

- [ ] **Step 2: Add `uhrzeit_von`, `uhrzeit_bis`, and `bericht` to the completed visit (id "3")**

```typescript
// On the besuch with id: "3", add:
uhrzeit_von: "10:00",
uhrzeit_bis: "11:15",
bericht: "Jahresgespräch verlief positiv. Kunde zeigte starkes Interesse an der neuen Produktlinie. Preisverhandlung für Q2-Rahmenvertrag begonnen. Nächster Schritt: Angebot bis 15.04. einreichen.",
```

- [ ] **Step 3: Add `uhrzeit_von` and `uhrzeit_bis` to one open visit (id "1")**

```typescript
// On the besuch with id: "1", add:
uhrzeit_von: "09:30",
uhrzeit_bis: "11:00",
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1
```
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add lib/mock-data.ts
git commit -m "feat: enrich mock Besuche with uhrzeit and bericht fields"
```

---

## Task 4: Create `BerichtErfassenModal`

**Files:**
- Create: `components/modals/BerichtErfassenModal.tsx`

This modal is opened when the user clicks "Bericht erfassen". It captures the essentials of a visit that already happened, creates the Besuch with `status: "erledigt"`, and navigates to the detail page.

- [ ] **Step 1: Create the file**

```typescript
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText } from "lucide-react";
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
            <Label>Kunde <span className="text-red-500">*</span></Label>
            <Select value={kundeId} onValueChange={setKundeId}>
              <SelectTrigger>
                <SelectValue placeholder="Kunde wählen" />
              </SelectTrigger>
              <SelectContent>
                {mockKunden.map((k) => (
                  <SelectItem key={k.id} value={k.id}>
                    {k.name1}{k.ort ? ` · ${k.ort}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Datum */}
          <div className="space-y-1.5">
            <Label htmlFor="datum">Datum des Besuchs <span className="text-red-500">*</span></Label>
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
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {MITARBEITER.map((m) => (
                  <SelectItem key={m.id} value={m.name}>{m.name}</SelectItem>
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
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
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
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/modals/BerichtErfassenModal.tsx
git commit -m "feat: add BerichtErfassenModal for logging past visits"
```

---

## Task 5: Update Besuche List Page

**Files:**
- Modify: `app/(dashboard)/besuche/page.tsx`

Changes: add "Bericht erfassen" button, make rows clickable, show 📝/📎 indicators.

- [ ] **Step 1: Add imports**

At the top of `app/(dashboard)/besuche/page.tsx`, add:
```typescript
import { useRouter } from "next/navigation";
import { BerichtErfassenModal } from "@/components/modals/BerichtErfassenModal";
import { FileText } from "lucide-react";
```
(Note: `FileText` is already imported via lucide — check and add only what's missing.)

- [ ] **Step 2: Add modal state**

Inside `BesuchePage`, add:
```typescript
const router = useRouter();
const [showBerichtModal, setShowBerichtModal] = useState(false);
```

- [ ] **Step 3: Replace the single button with two buttons**

Find the existing `<Button size="sm" ... onClick={() => setShowModal(true)}>` and replace that section with:
```tsx
<div className="flex items-center gap-2">
  <Button
    size="sm"
    variant="outline"
    className="gap-2 border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-400 dark:hover:bg-emerald-900/20"
    onClick={() => setShowBerichtModal(true)}
  >
    <FileText className="w-3.5 h-3.5" /> Bericht erfassen
  </Button>
  <Button size="sm" className="gap-2" onClick={() => setShowModal(true)}>
    <Plus className="w-3.5 h-3.5" /> Besuch planen
  </Button>
</div>
```

- [ ] **Step 4: Make table rows clickable**

On the `<tr key={besuch.id} ...>` element, add:
```tsx
onClick={() => router.push(`/besuche/${besuch.id}`)}
style={{ cursor: "pointer" }}
```

And update its className to include `cursor-pointer`:
```tsx
className="hover:bg-muted/30 transition-colors group cursor-pointer"
```

- [ ] **Step 5: Add 📝/📎 indicators to the Status cell**

In the `<td>` that contains `<StatusBadge status={besuch.status} />`, add indicators after the badge:
```tsx
<td className="px-4 py-3.5">
  <div className="flex items-center gap-2">
    <StatusBadge status={besuch.status} />
    {besuch.bericht && (
      <span title="Bericht vorhanden" className="text-xs">📝</span>
    )}
    {besuch.anhänge && besuch.anhänge.length > 0 && (
      <span title={`${besuch.anhänge.length} Anhang/Anhänge`} className="text-xs">📎</span>
    )}
  </div>
</td>
```

- [ ] **Step 6: Add `BerichtErfassenModal` to the JSX**

At the bottom of the return, next to the existing `<NeuerBesuchModal ...>`, add:
```tsx
<BerichtErfassenModal open={showBerichtModal} onClose={() => setShowBerichtModal(false)} />
```

- [ ] **Step 7: Verify TypeScript compiles and run build**

```bash
npx tsc --noEmit 2>&1 && npm run build 2>&1 | tail -20
```
Expected: no errors, build succeeds.

- [ ] **Step 8: Commit**

```bash
git add app/\(dashboard\)/besuche/page.tsx
git commit -m "feat: add Bericht erfassen button and clickable rows to Besuche list"
```

---

## Task 6: Create Besuch Detail Page

**Files:**
- Create: `app/(dashboard)/besuche/[id]/page.tsx`

This is the centrepiece. Two-column layout: left = metadata + task creation; right = report textarea + file attachments + follow-up button.

- [ ] **Step 1: Create the directory and file**

```bash
mkdir -p "C:\Users\tseyhan\Downloads\PPX\ewneu-crm\app\(dashboard)\besuche\[id]"
```

- [ ] **Step 2: Write the detail page**

```typescript
"use client";

import { useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
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
  const router = useRouter();
  const { besuche, aufgaben, markBesuchDone, updateBesuch, addAnhangToBesuch, removeAnhangFromBesuch, addAufgabe, addBesuch } = useCRM();

  const besuch = besuche.find((b) => b.id === id);

  // Local editable state
  const [uhrzeitVon, setUhrzeitVon] = useState(besuch?.uhrzeit_von || "");
  const [uhrzeitBis, setUhrzeitBis] = useState(besuch?.uhrzeit_bis || "");
  const [bericht, setBericht] = useState(besuch?.bericht || "");
  const [berichtSaved, setBerichtSaved] = useState(false);

  // Aufgabe form
  const [aufgabeTitel, setAufgabeTitel] = useState(`Nachbereitung: ${besuch?.kunde?.name1 || ""}`);
  const [aufgabePrio, setAufgabePrio] = useState<"hoch" | "mittel" | "niedrig">("mittel");
  const [aufgabeFaellig, setAufgabeFaellig] = useState("");
  const [aufgabeAdded, setAufgabeAdded] = useState(false);

  // Follow-up modal
  const [showFolgeterminModal, setShowFolgeterminModal] = useState(false);

  // File upload
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

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

  // Save Zeitraum
  const saveZeitraum = () => {
    updateBesuch(besuch.id, {
      uhrzeit_von: uhrzeitVon || undefined,
      uhrzeit_bis: uhrzeitBis || undefined,
      dauer_minuten: calcDauer(uhrzeitVon, uhrzeitBis),
    });
  };

  // Save Bericht
  const saveBericht = () => {
    updateBesuch(besuch.id, { bericht });
    setBerichtSaved(true);
    setTimeout(() => setBerichtSaved(false), 2000);
  };

  // File upload handler
  const handleFiles = useCallback((files: FileList | null) => {
    if (!files) return;
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
  }, [besuch.id, addAnhangToBesuch]);

  // Add Aufgabe
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
                style={{ fieldSizing: "content" } as React.CSSProperties}
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
```

> `addBesuch` is already destructured from `useCRM()` at the top of the component (alongside `updateBesuch`, `addAufgabe`, etc.) — pass it directly as `onAdd`.

- [ ] **Step 3: Verify TypeScript compiles and build succeeds**

```bash
npx tsc --noEmit 2>&1 && npm run build 2>&1 | tail -20
```
Expected: no errors, `/besuche/[id]` appears in route output.

- [ ] **Step 4: Commit**

```bash
git add "app/(dashboard)/besuche/[id]/page.tsx"
git commit -m "feat: add Besuch detail page with report, attachments, and task creation"
```

---

## Task 7: Update Wochenplanung

**Files:**
- Modify: `app/(dashboard)/wochenplanung/page.tsx`

Two changes: (1) use `uhrzeit_von` for the event's hour; (2) use `durchgefuehrt_am` for completed visits.

- [ ] **Step 1: Update Besuche event mapping in the `events` useMemo**

Find the `besuche.forEach(...)` block. Replace it with:

```typescript
besuche.forEach((b) => {
  const dateStr = b.status === "erledigt" ? b.durchgefuehrt_am : b.faellig_am;
  if (!dateStr) return;
  const hour = b.uhrzeit_von
    ? parseInt(b.uhrzeit_von.split(":")[0], 10)
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
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add "app/(dashboard)/wochenplanung/page.tsx"
git commit -m "feat: use uhrzeit_von for Wochenplanung time slot; show 📝 when bericht exists"
```

---

## Task 8: Add Besuche Tab to Kundenseite

**Files:**
- Create: `components/kunden/KundenBesucheTab.tsx`
- Modify: `app/(dashboard)/kunden/[id]/page.tsx`

The customer detail page is a **Server Component**. To access `useCRM()` (which requires React Context), we create a separate Client Component for the tab content.

- [ ] **Step 1: Create `KundenBesucheTab.tsx`**

```typescript
"use client";

import { useState } from "react";
import Link from "next/link";
import { MapPin, Plus, FileText, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { NeuerBesuchModal } from "@/components/modals/NeuerBesuchModal";
import { useCRM } from "@/lib/crm-context";
import { formatDate } from "@/lib/utils";

interface Props {
  kundeId: string;
  kundeName: string;
}

export function KundenBesucheTab({ kundeId, kundeName }: Props) {
  const { besuche, addBesuch } = useCRM();
  const [showModal, setShowModal] = useState(false);

  const kundenBesuche = besuche
    .filter((b) => b.kunde_id === kundeId)
    .sort((a, b) => {
      const dateA = a.durchgefuehrt_am || a.faellig_am || a.created_at;
      const dateB = b.durchgefuehrt_am || b.faellig_am || b.created_at;
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {kundenBesuche.length} Besuch{kundenBesuche.length !== 1 ? "e" : ""}
        </p>
        <Button size="sm" variant="outline" className="gap-2" onClick={() => setShowModal(true)}>
          <Plus className="w-3.5 h-3.5" /> Besuch planen
        </Button>
      </div>

      {kundenBesuche.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-8 text-center">
          <MapPin className="w-8 h-8 mx-auto mb-2 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">Noch keine Besuche erfasst</p>
          <Button
            size="sm"
            variant="outline"
            className="mt-3 gap-2"
            onClick={() => setShowModal(true)}
          >
            <Plus className="w-3.5 h-3.5" /> Besuch planen
          </Button>
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Datum</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden sm:table-cell">Zeitraum</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden md:table-cell">Mitarbeiter</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {kundenBesuche.map((besuch) => {
                const displayDate = besuch.status === "erledigt"
                  ? besuch.durchgefuehrt_am
                  : besuch.faellig_am;
                return (
                  <tr key={besuch.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium">
                        {displayDate ? formatDate(displayDate) : "–"}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="text-xs text-muted-foreground">
                        {besuch.uhrzeit_von && besuch.uhrzeit_bis
                          ? `${besuch.uhrzeit_von}–${besuch.uhrzeit_bis}`
                          : besuch.dauer_minuten ? `${besuch.dauer_minuten} Min.` : "–"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <StatusBadge status={besuch.status} />
                        {besuch.bericht && <span className="text-xs" title="Bericht vorhanden">📝</span>}
                        {(besuch.anhänge?.length ?? 0) > 0 && <span className="text-xs" title="Anhänge vorhanden">📎</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-xs text-muted-foreground">{besuch.mitarbeiter_name || "–"}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/besuche/${besuch.id}`}>
                        <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
                          <FileText className="w-3 h-3" /> Bericht
                        </Button>
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <NeuerBesuchModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onAdd={addBesuch}
        defaultKundeId={kundeId}
      />
    </div>
  );
}
```

- [ ] **Step 2: Add the Besuche tab to the customer detail page**

Open `app/(dashboard)/kunden/[id]/page.tsx`. Find the existing tabs section (look for `<Tabs` or the tab navigation pattern). Add a "Besuche" tab entry.

Import the component at the top:
```typescript
import { KundenBesucheTab } from "@/components/kunden/KundenBesucheTab";
```

Locate where tabs are defined (e.g., a `tabs` array or `TabsList`). Add a "Besuche" tab with content:
```tsx
// In the TabsList:
<TabsTrigger value="besuche">
  <MapPin className="w-3.5 h-3.5 mr-1.5" /> Besuche
</TabsTrigger>

// In the TabsContent section:
<TabsContent value="besuche">
  <KundenBesucheTab kundeId={id} kundeName={kunde.name1} />
</TabsContent>
```

> **Important:** The customer detail page is a Server Component (`async function`). `KundenBesucheTab` is a Client Component. This is valid in Next.js — server components can render client components. The `id` variable is already available from `await params`.

- [ ] **Step 3: Verify TypeScript compiles and build succeeds**

```bash
npx tsc --noEmit 2>&1 && npm run build 2>&1 | tail -20
```
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add components/kunden/KundenBesucheTab.tsx "app/(dashboard)/kunden/[id]/page.tsx"
git commit -m "feat: add Besuche history tab to customer detail page"
```

---

## Task 9: Final Build, Push & Deploy

- [ ] **Step 1: Full build check**

```bash
cd C:\Users\tseyhan\Downloads\PPX\ewneu-crm && npm run build 2>&1
```
Expected: all 13+ routes compiled successfully, zero TypeScript errors.

- [ ] **Step 2: Push to GitHub**

```bash
git push origin master
```

- [ ] **Step 3: Deploy to Vercel**

```bash
npx vercel --yes --prod 2>&1
```
Expected: `Aliased: https://ewneu-crm.vercel.app`

- [ ] **Step 4: Smoke test on live URL**

Verify manually:
- `/besuche` — two buttons visible (Bericht erfassen, Besuch planen)
- Click "Bericht erfassen" → modal opens, fills out, submits → lands on `/besuche/[id]`
- Detail page: textarea auto-focused, can save report, upload file, create task
- `/wochenplanung` — besuch events show at correct time slot
- `/kunden/[id]` → Besuche tab shows visit history

---

## Summary

| Task | Files | Effort |
|------|-------|--------|
| 1. Types | `lib/types.ts` | ~5 min |
| 2. Context | `lib/crm-context.tsx` | ~10 min |
| 3. Mock data | `lib/mock-data.ts` | ~5 min |
| 4. BerichtErfassenModal | `components/modals/BerichtErfassenModal.tsx` | ~15 min |
| 5. Besuche list page | `app/(dashboard)/besuche/page.tsx` | ~10 min |
| 6. Besuch detail page | `app/(dashboard)/besuche/[id]/page.tsx` | ~30 min |
| 7. Wochenplanung | `app/(dashboard)/wochenplanung/page.tsx` | ~5 min |
| 8. Kunden Besuche tab | `components/kunden/KundenBesucheTab.tsx` + kunden detail | ~15 min |
| 9. Build + deploy | — | ~5 min |
