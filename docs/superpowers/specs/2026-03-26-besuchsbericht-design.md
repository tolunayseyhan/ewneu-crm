# Besuchsbericht Feature — Design Spec

**Datum:** 2026-03-26
**Projekt:** E.W. NEU GmbH CRM
**Status:** Approved

---

## Überblick

Erweiterung des bestehenden Besuche-Moduls um:
- Einen **Bericht-erfassen-Flow** für Besuche, die bereits stattgefunden haben
- Eine **Besuch-Detailseite** mit Besuchsbericht, Dateianhängen und Aufgaben-Erstellung
- Aktualisierung der **Wochenplanung** für genaue Zeitslot-Platzierung
- **Besuchshistorie** auf der Kundenseite

---

## Kernlogik der Zwei Workflows

Es gibt genau zwei Einstiegspunkte auf der Besuche-Listenseite:

| Button | Zweck | Status nach Anlage |
|--------|-------|--------------------|
| **📅 Besuch planen** | Zukünftiger Termin, der noch aussteht | `offen` |
| **📝 Bericht erfassen** | Besuch hat bereits stattgefunden; Bericht wird nachträglich angelegt | `erledigt` |

Ein „ungeplanter Besuch" als eigener Typ existiert nicht. Der Unterschied ergibt sich aus dem Datum und dem Status — liegt das Datum in der Vergangenheit und hat der Eintrag einen Bericht, war es entweder ein spontaner oder der abgeschlossene geplante Termin.

---

## 1. Datenmodell

### Erweiterte `Besuch`-Schnittstelle (`lib/types.ts`)

```typescript
export interface Besuch {
  id: string;
  kunde_id: string;
  kunde?: Kunde;
  mitarbeiter_id?: string;
  mitarbeiter_name?: string;
  faellig_am?: string;           // Geplante Besuche: Zieldatum
  durchgefuehrt_am?: string;     // Abgeschlossene Besuche: tatsächliches Datum
  uhrzeit_von?: string;          // NEU: "09:30"
  uhrzeit_bis?: string;          // NEU: "11:00"
  notizen?: string;              // Kurze interne Notizen (bereits vorhanden)
  bericht?: string;              // NEU: ausführlicher Besuchsbericht (Freitext)
  anhänge?: Anhang[];            // NEU: Dateianhänge (Base64 im React-State)
  aufgaben_ids?: string[];       // NEU: IDs verlinkter Aufgaben aus diesem Besuch
  dauer_minuten?: number;        // bereits vorhanden, bleibt erhalten
  status: "offen" | "erledigt";
  created_at: string;
}
```

### Neuer Typ `Anhang` (`lib/types.ts`)

```typescript
export interface Anhang {
  id: string;
  name: string;         // Dateiname z.B. "Protokoll.pdf"
  size: number;         // Bytes
  mime: string;         // MIME-Type z.B. "application/pdf"
  data_url: string;     // Base64-kodierter Inhalt (in-memory, kein Backend)
  created_at: string;
}
```

> **Datei-Speicherung:** Da kein aktives Backend vorhanden ist, werden Anhänge als Base64-Data-URL im React-Context-State gehalten. Sie überleben keine Seitenneuladen — das ist für den Prototyp-Stand akzeptiert.

---

## 2. CRM-Context (`lib/crm-context.tsx`)

### Neue Methoden

```typescript
// Felder eines Besuchs aktualisieren (Bericht, Uhrzeit, etc.)
updateBesuch: (id: string, updates: Partial<Besuch>) => void;

// Anhang zu einem Besuch hinzufügen
addAnhangToBesuch: (besuchId: string, anhang: Anhang) => void;

// Anhang von einem Besuch entfernen
removeAnhangFromBesuch: (besuchId: string, anhangId: string) => void;
```

### Bestehende Methoden bleiben erhalten
- `addBesuch`, `markBesuchDone`, `besuche` State

---

## 3. Besuche-Listenseite (`app/(dashboard)/besuche/page.tsx`)

### Header-Bereich — zwei Buttons

```
[Filter: Mitarbeiter ▼]          [📝 Bericht erfassen]  [📅 Besuch planen]
```

- **„Besuch planen"** (primär, rot): öffnet bestehenden `NeuerBesuchModal`, unverändert
- **„Bericht erfassen"** (sekundär, grün): öffnet neuen `BerichtErfassenModal`

### Tabellen-Zeilen-Verhalten
- Gesamte Zeile ist klickbar → navigiert zu `/besuche/[id]`
- Kleine Status-Indikatoren in der Aufgaben-Spalte:
  - 📝 wenn `bericht` vorhanden und nicht leer
  - 📎 wenn `anhänge?.length > 0`

---

## 4. Neues Modal: `BerichtErfassenModal` (`components/modals/BerichtErfassenModal.tsx`)

Schlankes Modal für die Pflichtinfos eines bereits stattgefundenen Besuchs.

### Felder

| Feld | Typ | Pflicht | Hinweis |
|------|-----|---------|---------|
| Kunde | Select | ✅ | aus mockKunden |
| Datum | Date | ✅ | max = heute (Vergangenheit) |
| Uhrzeit von | Time | — | "09:30" |
| Uhrzeit bis | Time | — | "11:00" |
| Mitarbeiter | Select | — | |
| Kurze Notizen | Textarea | — | optional |

### Verhalten nach Submit
1. Erstellt `Besuch`-Objekt mit `status: "erledigt"`, `durchgefuehrt_am` = gewähltes Datum
2. Ruft `addBesuch(newBesuch)` auf
3. Navigiert via `router.push(`/besuche/${newBesuch.id}`)` zur Detailseite
4. Detailseite öffnet sich direkt im Bericht-Schreibmodus

---

## 5. Neue Detailseite: `/besuche/[id]` (`app/(dashboard)/besuche/[id]/page.tsx`)

### Layout: Zwei Spalten (Desktop), Stack (Mobile)

```
┌─────────────────────────────────────────────────────────────┐
│ ← Besuche   Fischer Elektronik KG   [📅 Geplant / Erledigt] │
├────────────────────────┬────────────────────────────────────┤
│  LINKE SPALTE          │  RECHTE SPALTE                     │
│                        │                                    │
│  Metadaten-Card        │  Besuchsbericht                    │
│  ─ Datum               │  [Textarea — Freitext]             │
│  ─ Zeitraum editierbar │  [Speichern]                       │
│  ─ Dauer (auto)        │                                    │
│  ─ Mitarbeiter         │  Dateianhänge                      │
│  ─ Status + Btn        │  [Drag & Drop / Datei wählen]      │
│                        │  Liste: name · size · [🗑]         │
│  Aufgabe erstellen     │                                    │
│  ─ Titel (vorbefüllt)  │  Folgetermin planen                │
│  ─ Priorität           │  [+ Besuch beim gleichen Kunden]   │
│  ─ Fällig am           │                                    │
│  [+ Aufgabe anlegen]   │                                    │
│                        │                                    │
│  Verknüpfte Aufgaben   │                                    │
│  (Liste, falls vorhan) │                                    │
└────────────────────────┴────────────────────────────────────┘
```

### Linke Spalte — Metadaten-Card
- **Datum**: `durchgefuehrt_am` (erledigt) oder `faellig_am` (offen), anzeige-formatiert
- **Zeitraum**: `uhrzeit_von` – `uhrzeit_bis`, inline editierbar; Dauer in Minuten wird automatisch berechnet und als `dauer_minuten` gespeichert
- **Mitarbeiter**: angezeigt, nicht editierbar (Einfachheit)
- **Status-Badge** + Button „Als erledigt markieren" (nur wenn `status === "offen"`)

### Linke Spalte — Aufgabe erstellen
- Nur sichtbar wenn Status `erledigt`
- Titel vorbefüllt: `Nachbereitung: [Kundenname]`
- Felder: Titel (editierbar), Priorität (Select), Fällig am
- Submit: ruft `addAufgabe(...)` auf, speichert `aufgaben_ids` auf dem Besuch via `updateBesuch`
- Unterhalb: Liste der verknüpften Aufgaben (falls `aufgaben_ids.length > 0`), mit Link zu `/aufgaben`

### Rechte Spalte — Besuchsbericht
- `<textarea>` mit aktuellem `bericht`-Wert
- Auto-Resize (wächst mit Inhalt)
- „Speichern"-Button → `updateBesuch(id, { bericht })`
- Placeholder: „Besuchsbericht verfassen — Gesprächsinhalt, Ergebnisse, nächste Schritte…"

### Rechte Spalte — Dateianhänge
- Upload-Area: Drag & Drop oder `<input type="file">` (alle Typen)
- Dateiliste: Icon nach MIME-Typ, Name, Größe (KB/MB), Löschen-Button
- `FileReader.readAsDataURL()` → Base64 → `addAnhangToBesuch()`
- Keine Größenbeschränkung im Prototyp (Browser-Memory-Limit gilt)

### Rechte Spalte — Folgetermin planen
- Link-Button: „+ Folgetermin beim gleichen Kunden planen"
- Öffnet `NeuerBesuchModal` mit vorausgefülltem Kunden

---

## 6. Wochenplanung (`app/(dashboard)/wochenplanung/page.tsx`)

### Zeitslot-Berechnung für Besuche
```typescript
// Bisher: fester Fallback 10:00
// Neu: uhrzeit_von parsen
const hour = besuch.uhrzeit_von
  ? parseInt(besuch.uhrzeit_von.split(":")[0], 10)
  : 10;
```

### Datum-Quelle
- `status === "erledigt"` → `durchgefuehrt_am`
- `status === "offen"` → `faellig_am`

### Kalender-Event Anzeige
- Zusätzlich: kleines 📝-Icon im Event wenn `bericht` vorhanden

---

## 7. Kundenseite (`app/(dashboard)/kunden/[id]/page.tsx`)

### Neuer Tab „Besuche"
- Neben bestehenden Tabs (Übersicht, Angebote etc.) wird ein Tab „Besuche" ergänzt
- Listet alle `besuche.filter(b => b.kunde_id === kunde.id)` chronologisch absteigend
- Spalten: Datum, Zeitraum, Status-Badge, 📝/📎-Indikatoren, Link zur Detailseite
- Leer-Zustand: „Noch keine Besuche erfasst" + „Besuch planen"-Button

---

## 8. Betroffene Dateien (Zusammenfassung)

| Datei | Änderung |
|-------|----------|
| `lib/types.ts` | `Besuch` + neuer `Anhang`-Typ |
| `lib/crm-context.tsx` | `updateBesuch`, `addAnhangToBesuch`, `removeAnhangFromBesuch` |
| `lib/mock-data.ts` | 1–2 Mock-Besuche mit `bericht` + `uhrzeit_von/bis` ergänzen |
| `app/(dashboard)/besuche/page.tsx` | Zweiter Button, Row-Klick → Navigation |
| `app/(dashboard)/besuche/[id]/page.tsx` | NEU: Detailseite |
| `components/modals/BerichtErfassenModal.tsx` | NEU: Modal für nachträglichen Bericht |
| `app/(dashboard)/wochenplanung/page.tsx` | `uhrzeit_von`-Stunde nutzen |
| `app/(dashboard)/kunden/[id]/page.tsx` | Neuer Besuche-Tab |

---

## 9. Out of Scope

- Backend-Persistenz für Anhänge (Supabase Storage) — spätere Phase
- PDF-Export des Besuchsberichts — spätere Phase
- E-Mail-Versand des Berichts — spätere Phase
- Digitale Unterschrift — spätere Phase
