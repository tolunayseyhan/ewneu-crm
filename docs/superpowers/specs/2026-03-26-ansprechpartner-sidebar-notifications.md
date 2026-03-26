# Ansprechpartner, Sidebar Fix & Notifications Design Spec

**Datum:** 2026-03-26
**Projekt:** E.W. NEU GmbH CRM
**Status:** Approved

---

## Überblick

Vier zusammenhängende Änderungen:

1. **Sidebar Dark Mode Fix** — Hardcodierte Farben durch semantische CSS-Variablen ersetzen
2. **Benachrichtigungen löschen** — Statisches Array → React-State mit Lösch-Aktionen
3. **Ansprechpartner-Typ + Besuche-Modals** — Neuer `Ansprechpartner`-Typ, Mitarbeiter-Select in Besuchemodals durch Ansprechpartner ersetzen
4. **Ansprechpartner-Tab auf Kundenseite** — Verwaltung (Liste, Hinzufügen, Bearbeiten, Löschen)

---

## 1. Sidebar Dark Mode Fix

### Problem
`Sidebar.tsx` verwendet hardcodierte Farben (`bg-white`, `border-gray-200`, `text-gray-600`, etc.) mit Tailwind-Dark-Varianten (`dark:bg-[#0f1117]`). Der Rest der App nutzt semantische CSS-Variablen (`bg-background`, `border-border`, `text-foreground`). Beim Toggle-Mechanismus (`.dark`-Klasse auf `html`) aktualisieren sich die CSS-Variablen, aber die hardcodierten Tailwind-Farben reagieren nicht zuverlässig.

### Fix
Alle Farben in `Sidebar.tsx` auf semantische Tokens umstellen:

| Vorher | Nachher |
|--------|---------|
| `bg-white dark:bg-[#0f1117]` | `bg-background` |
| `border-gray-200 dark:border-[#1e2130]` | `border-border` |
| `text-gray-900 dark:text-white` | `text-foreground` |
| `text-gray-400 dark:text-[#94a3b8]` | `text-muted-foreground` |
| `text-gray-600 dark:text-[#94a3b8]` | `text-muted-foreground` |
| `hover:text-gray-900 dark:hover:text-white` | `hover:text-foreground` |
| `hover:bg-gray-100 dark:hover:bg-[#1a1d27]` | `hover:bg-muted` |
| `text-gray-500 dark:text-[#94a3b8]` | `text-muted-foreground` |

Der aktive Nav-Item-Stil (`bg-[#E3000F]/10 text-[#E3000F] border border-[#E3000F]/20`) bleibt unverändert, da er Markenfarben sind.

**Betroffene Datei:** `components/layout/Sidebar.tsx`

---

## 2. Benachrichtigungen löschen

### Problem
`NotificationPanel.tsx` hat ein statisches `const NOTIFICATIONS = [...]`-Array. Kein State, kein Löschen möglich. Der Badge-Zähler im Header ist hardcodiert auf `3`.

### Lösung

**`NotificationPanel.tsx`:**
- `NOTIFICATIONS`-Array → `useState<Notification[]>()` initialisiert mit dem bestehenden Array
- Pro Benachrichtigung: `✕`-Button (erscheint bei Hover), der `setNotifications(prev => prev.filter(n => n.id !== id))` aufruft
- Footer: zwei Buttons
  - **„Alle als gelesen markieren"** → setzt `gelesen: true` auf allen
  - **„Alle löschen"** → leert das Array komplett
- Wenn keine Benachrichtigungen: Leer-Zustand „Keine Benachrichtigungen" mit Bell-Icon

**`Header.tsx`:**
- `notifications`-State und Setter nach oben in den Header heben (oder NotificationPanel gibt Count nach oben)
- Einfacherer Ansatz: Header und NotificationPanel teilen sich den State via Props
  - Header hält `notifications` State
  - Übergibt `count={notifications.filter(n => !n.gelesen).length}` als Prop an den Badge
  - Übergibt `notifications`, `onDelete`, `onMarkAllRead`, `onDeleteAll` an `NotificationPanel`

**Interface:**
```typescript
interface NotificationPanelProps {
  open: boolean;
  onClose: () => void;
  notifications: Notification[];
  onDelete: (id: string) => void;
  onMarkAllRead: () => void;
  onDeleteAll: () => void;
}
```

**`Notification`-Typ** (lokal in `NotificationPanel.tsx` oder `Header.tsx`):
```typescript
interface Notification {
  id: string;
  typ: "aufgabe" | "anruf" | "besuch" | "angebot";
  titel: string;
  text: string;
  zeit: string;
  gelesen: boolean;
}
```

**Betroffene Dateien:** `components/layout/Header.tsx`, `components/layout/NotificationPanel.tsx`

---

## 3. Ansprechpartner-Typ + Besuche-Modals

### 3.1 Neuer Typ `Ansprechpartner` (`lib/types.ts`)

```typescript
export interface Ansprechpartner {
  id: string;
  kunde_id: string;
  name: string;
  position?: string;    // z.B. "Einkaufsleiter", "Geschäftsführer"
  telefon?: string;
  email?: string;
  notiz?: string;
  created_at: string;
}
```

### 3.2 Erweiterung `Besuch` (`lib/types.ts`)

```typescript
// In der Besuch-Schnittstelle, neue optionale Felder:
ansprechpartner_id?: string;
ansprechpartner_name?: string;
```

### 3.3 CRM Context (`lib/crm-context.tsx`)

Neuer State und Methoden:

```typescript
// State
ansprechpartner: Ansprechpartner[];

// Methoden
addAnsprechpartner: (a: Ansprechpartner) => void;
updateAnsprechpartner: (id: string, updates: Partial<Ansprechpartner>) => void;
deleteAnsprechpartner: (id: string) => void;
```

Implementierung:
```typescript
const [ansprechpartner, setAnsprechpartner] = useState<Ansprechpartner[]>(mockAnsprechpartner);

const addAnsprechpartner = (a: Ansprechpartner) =>
  setAnsprechpartner((prev) => [...prev, a]);

const updateAnsprechpartner = (id: string, updates: Partial<Ansprechpartner>) =>
  setAnsprechpartner((prev) =>
    prev.map((a) => (a.id === id ? { ...a, ...updates } : a))
  );

const deleteAnsprechpartner = (id: string) =>
  setAnsprechpartner((prev) => prev.filter((a) => a.id !== id));
```

### 3.4 Mock-Daten (`lib/mock-data.ts`)

Neue `mockAnsprechpartner`-Array mit 2–3 Einträgen für bestehende Mock-Kunden:

```typescript
export const mockAnsprechpartner: Ansprechpartner[] = [
  {
    id: "ap-1",
    kunde_id: "1", // Fischer Elektronik KG
    name: "Klaus Fischer",
    position: "Geschäftsführer",
    telefon: "0711 123456",
    email: "k.fischer@fischer-elektronik.de",
    created_at: "2026-01-10T09:00:00Z",
  },
  {
    id: "ap-2",
    kunde_id: "1", // Fischer Elektronik KG
    name: "Petra Bauer",
    position: "Einkaufsleiterin",
    telefon: "0711 123457",
    email: "p.bauer@fischer-elektronik.de",
    created_at: "2026-01-10T09:05:00Z",
  },
  {
    id: "ap-3",
    kunde_id: "2", // Müller & Söhne GmbH
    name: "Hans Müller",
    position: "Inhaber",
    telefon: "089 987654",
    email: "h.mueller@mueller-soehne.de",
    created_at: "2026-01-15T10:00:00Z",
  },
];
```

### 3.5 Besuche-Modals

**`BerichtErfassenModal.tsx` und `NeuerBesuchModal.tsx`:**

- `const MITARBEITER = [...]` und den zugehörigen `<Select>` entfernen
- Neues Feld „Ansprechpartner" (optional):
  - Wird erst nach Kunden-Auswahl befüllbar (vorher disabled/placeholder „Zuerst Kunde wählen")
  - Filtert `ansprechpartner` aus CRM Context nach `a.kunde_id === kundeId`
  - Wenn keine Ansprechpartner für diesen Kunden: `SelectItem` deaktiviert mit Text „Kein Ansprechpartner hinterlegt"
  - Auswahl speichert `ansprechpartner_id` + `ansprechpartner_name` auf dem Besuch-Objekt

State in den Modals:
```typescript
const [ansprechpartnerId, setAnsprechpartnerId] = useState("");

const kundenAnsprechpartner = ansprechpartner.filter(
  (a) => a.kunde_id === kundeId
);
```

Beim Formular-Reset: `setAnsprechpartnerId("")` mit aufnehmen.

**Betroffene Dateien:**
- `lib/types.ts`
- `lib/crm-context.tsx`
- `lib/mock-data.ts`
- `components/modals/BerichtErfassenModal.tsx`
- `components/modals/NeuerBesuchModal.tsx`

---

## 4. Ansprechpartner-Tab auf der Kundenseite

### 4.1 Neue Client Component `KundenAnsprechpartnerTab.tsx`

**Datei:** `components/kunden/KundenAnsprechpartnerTab.tsx`

**Props:**
```typescript
interface Props {
  kundeId: string;
}
```

**Verhalten:**
- Liest `ansprechpartner`, `addAnsprechpartner`, `updateAnsprechpartner`, `deleteAnsprechpartner` aus `useCRM()`
- Filtert nach `a.kunde_id === kundeId`

**Layout:**

```
┌─────────────────────────────────────────────────────────┐
│ Ansprechpartner           [+ Ansprechpartner hinzufügen] │
├─────────────────────────────────────────────────────────┤
│ ┌──────────────────────────────────────────────────┐    │
│ │ Klaus Fischer          Geschäftsführer        [✎][✕]│
│ │ 📞 0711 123456  ✉ k.fischer@...                    │
│ │ Notiz: —                                           │
│ └──────────────────────────────────────────────────┘    │
│ ┌──────────────────────────────────────────────────┐    │
│ │ Petra Bauer            Einkaufsleiterin       [✎][✕]│
│ │ 📞 0711 123457  ✉ p.bauer@...                      │
│ └──────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

**Hinzufügen:**
- Button „+ Ansprechpartner hinzufügen" öffnet ein **Inline-Formular** unterhalb der Liste (kein Modal)
- Felder: Name (Pflicht), Position, Telefon, E-Mail, Notiz
- Buttons: „Speichern" + „Abbrechen"
- Submit ruft `addAnsprechpartner({ id: \`ap-${Date.now()}\`, kunde_id: kundeId, ...felder, created_at: ... })` auf

**Bearbeiten:**
- Klick auf ✎-Button wechselt die Karte in Edit-Modus (alle Felder werden `<Input>`)
- Buttons: „Speichern" + „Abbrechen"
- Submit ruft `updateAnsprechpartner(id, updates)` auf

**Löschen:**
- Klick auf ✕-Button: Karte zeigt kurze Bestätigungszeile „Wirklich löschen? [Ja] [Nein]"
- Bestätigung ruft `deleteAnsprechpartner(id)` auf

**Leer-Zustand:**
```
👤 Noch kein Ansprechpartner erfasst
[+ Ansprechpartner hinzufügen]
```

### 4.2 Integration in `kunden/[id]/page.tsx`

- Import `KundenAnsprechpartnerTab`
- Neuer `TabsTrigger value="ansprechpartner"`: „Ansprechpartner"
- Neuer `TabsContent value="ansprechpartner"`: `<KundenAnsprechpartnerTab kundeId={id} />`
- Tab erscheint zwischen „Besuche" und „Angebote"

**Betroffene Dateien:**
- `components/kunden/KundenAnsprechpartnerTab.tsx` (NEU)
- `app/(dashboard)/kunden/[id]/page.tsx` (modifiziert)

---

## 5. Betroffene Dateien (Zusammenfassung)

| Datei | Änderung |
|-------|----------|
| `components/layout/Sidebar.tsx` | Hardcodierte Farben → semantische CSS-Variablen |
| `components/layout/Header.tsx` | Notifications-State heben; Badge-Count dynamisch |
| `components/layout/NotificationPanel.tsx` | State statt static array; Delete-Buttons; Leer-Zustand |
| `lib/types.ts` | Neuer `Ansprechpartner`-Typ; `Besuch` um `ansprechpartner_id/name` erweitern |
| `lib/mock-data.ts` | `mockAnsprechpartner`-Array hinzufügen |
| `lib/crm-context.tsx` | `ansprechpartner`-State + 3 CRUD-Methoden |
| `components/modals/BerichtErfassenModal.tsx` | Mitarbeiter → Ansprechpartner-Select |
| `components/modals/NeuerBesuchModal.tsx` | Mitarbeiter → Ansprechpartner-Select |
| `components/kunden/KundenAnsprechpartnerTab.tsx` | NEU: Ansprechpartner-Verwaltung |
| `app/(dashboard)/kunden/[id]/page.tsx` | Neuer Tab „Ansprechpartner" |

---

## 6. Out of Scope

- Backend-Persistenz für Ansprechpartner (Supabase) — spätere Phase
- Ansprechpartner in Anrufe-Modul (nur Besuche jetzt)
- Duplicate-Detection beim Hinzufügen
- Import/Export von Ansprechpartnern
