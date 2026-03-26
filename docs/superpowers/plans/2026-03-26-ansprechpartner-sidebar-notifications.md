# Ansprechpartner, Sidebar Fix & Notifications Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the dark mode sidebar bug, make notifications deletable, replace Mitarbeiter with Ansprechpartner in Besuche modals, and add Ansprechpartner management to the customer detail page.

**Architecture:** Independent fixes (sidebar, notifications) first, then layered Ansprechpartner work: types → mock data → CRM context → modals → UI tab. All state is in-memory React Context; no backend.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4, shadcn/ui, Lucide React, `useCRM()` context hook.

**Spec:** `docs/superpowers/specs/2026-03-26-ansprechpartner-sidebar-notifications.md`

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `components/layout/Sidebar.tsx` | Modify | Replace hardcoded colors with semantic CSS variables |
| `components/layout/Header.tsx` | Modify | Hold notifications state; dynamic badge count |
| `components/layout/NotificationPanel.tsx` | Modify | Accept notifications as props; delete buttons; empty state |
| `lib/types.ts` | Modify | Add `Ansprechpartner` type; extend `Besuch` |
| `lib/mock-data.ts` | Modify | Add `mockAnsprechpartner` array |
| `lib/crm-context.tsx` | Modify | Add `ansprechpartner` state + 3 CRUD methods |
| `components/modals/BerichtErfassenModal.tsx` | Modify | Mitarbeiter → Ansprechpartner Select |
| `components/modals/NeuerBesuchModal.tsx` | Modify | Mitarbeiter → Ansprechpartner Select; add `useCRM()` |
| `components/kunden/KundenAnsprechpartnerTab.tsx` | Create | Ansprechpartner list + inline add/edit/delete |
| `app/(dashboard)/kunden/[id]/page.tsx` | Modify | Add Ansprechpartner tab |

---

## Task 1: Fix Sidebar Dark Mode

**Files:**
- Modify: `components/layout/Sidebar.tsx`

The sidebar uses hardcoded Tailwind color classes (`bg-white dark:bg-[#0f1117]`, etc.) instead of the semantic CSS variable tokens the rest of the app uses (`bg-background`, `border-border`, etc.). When dark mode is toggled by adding `.dark` to `<html>`, the CSS variables update but the hardcoded dark-variant classes don't always trigger reliably. Solution: replace all hardcoded colors with semantic tokens.

- [ ] **Step 1: Replace the `<aside>` root element className**

In `components/layout/Sidebar.tsx` line 68, find:
```
bg-white dark:bg-[#0f1117] border-r border-gray-200 dark:border-[#1e2130] shadow-sm dark:shadow-none
```
Replace with:
```
bg-background border-r border-border shadow-sm dark:shadow-none
```

- [ ] **Step 2: Replace the Logo section border**

Line 70, find:
```
border-b border-gray-200 dark:border-[#1e2130]
```
Replace with:
```
border-b border-border
```

- [ ] **Step 3: Replace the logo text colors**

Line 81, find:
```
text-gray-900 dark:text-white
```
Replace with:
```
text-foreground
```

Line 84, find:
```
text-gray-400 dark:text-[#94a3b8]
```
Replace with:
```
text-muted-foreground
```

- [ ] **Step 4: Replace the "Navigation" section label**

Line 93, find:
```
text-gray-400 dark:text-[#94a3b8]/60
```
Replace with:
```
text-muted-foreground/60
```

- [ ] **Step 5: Replace inactive nav link classes**

There are two identical inactive link class strings (one for main nav, one for Einstellungen link). Find both occurrences of:
```
text-gray-600 dark:text-[#94a3b8] hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#1a1d27]
```
Replace both with:
```
text-muted-foreground hover:text-foreground hover:bg-muted
```

- [ ] **Step 6: Replace inactive nav icon classes**

There are two identical icon class strings. Find both occurrences of:
```
text-gray-400 dark:text-[#64748b] group-hover:text-gray-700 dark:group-hover:text-white
```
Replace both with:
```
text-muted-foreground group-hover:text-foreground
```

- [ ] **Step 7: Replace the "Konfiguration" section label**

Line 133, find:
```
text-gray-400 dark:text-[#94a3b8]/60
```
Replace with:
```
text-muted-foreground/60
```

- [ ] **Step 8: Replace the user profile section border and hover**

Line 163, find:
```
border-t border-gray-200 dark:border-[#1e2130]
```
Replace with:
```
border-t border-border
```

Line 164, find:
```
hover:bg-gray-100 dark:hover:bg-[#1a1d27]
```
Replace with:
```
hover:bg-muted
```

- [ ] **Step 9: Replace user name and role text colors**

Line 171, find:
```
text-gray-900 dark:text-white
```
Replace with:
```
text-foreground
```

Line 174, find:
```
text-gray-500 dark:text-[#94a3b8]
```
Replace with:
```
text-muted-foreground
```

- [ ] **Step 10: Verify TypeScript and commit**

```bash
cd "C:\Users\tseyhan\Downloads\PPX\ewneu-crm" && npx tsc --noEmit 2>&1
```
Expected: no errors.

```bash
git add components/layout/Sidebar.tsx
git commit -m "fix: replace hardcoded sidebar colors with semantic CSS variable tokens"
```

---

## Task 2: Fix Notifications (Deletable + Dynamic Badge)

**Files:**
- Modify: `components/layout/Header.tsx`
- Modify: `components/layout/NotificationPanel.tsx`

Currently `NotificationPanel.tsx` holds a static `const NOTIFICATIONS` array (no state), and `Header.tsx` has a hardcoded `3` badge. We lift the state to `Header.tsx`, pass it down as props, and add delete/clear actions.

- [ ] **Step 1: Update `Header.tsx` — add Notification type and state**

Open `components/layout/Header.tsx`. After the existing imports, add the `Notification` interface and seed data, then update the component:

Replace the entire file content with:

```typescript
"use client";

import { useState } from "react";
import { Bell, Search, Sun, Moon, Command } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CommandPalette } from "./CommandPalette";
import { NotificationPanel } from "./NotificationPanel";

export interface Notification {
  id: string;
  typ: "aufgabe" | "anruf" | "besuch" | "angebot";
  titel: string;
  text: string;
  zeit: string;
  gelesen: boolean;
}

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    typ: "aufgabe",
    titel: "Aufgabe fällig",
    text: "Angebot nachfassen – Müller & Söhne GmbH",
    zeit: "vor 10 Min.",
    gelesen: false,
  },
  {
    id: "2",
    typ: "anruf",
    titel: "Anruf überfällig",
    text: "Fischer Elektronik KG – seit 2 Tagen offen",
    zeit: "vor 2 Std.",
    gelesen: false,
  },
  {
    id: "3",
    typ: "angebot",
    titel: "Neues Angebot",
    text: "Schneider Logistik AG – ANG-2026-0042",
    zeit: "gestern",
    gelesen: false,
  },
  {
    id: "4",
    typ: "besuch",
    titel: "Besuch morgen",
    text: "Weber Bau GmbH – 10:00 Uhr geplant",
    zeit: "gestern",
    gelesen: true,
  },
  {
    id: "5",
    typ: "aufgabe",
    titel: "Aufgabe erledigt",
    text: "Preisliste aktualisieren – Sandra Koch",
    zeit: "vor 2 Tagen",
    gelesen: true,
  },
];

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const [showCommand, setShowCommand] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);

  const toggleDark = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle("dark");
  };

  const handleDeleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, gelesen: true })));
  };

  const handleDeleteAll = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter((n) => !n.gelesen).length;

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-6 bg-background/95 backdrop-blur border-b border-border">
        <div>
          <h1 className="text-lg font-semibold text-foreground leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Search trigger */}
          <button
            onClick={() => setShowCommand(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border bg-muted/50 text-muted-foreground text-sm hover:bg-muted transition-colors cursor-pointer"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Suchen...</span>
            <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-background border border-border">
              <Command className="w-2.5 h-2.5" />K
            </kbd>
          </button>

          {/* Dark mode toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleDark}
            className="hover:bg-muted transition-colors"
            title={isDark ? "Light Mode" : "Dark Mode"}
          >
            {isDark ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </Button>

          {/* Notifications */}
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="relative hover:bg-muted transition-colors"
              onClick={() => setShowNotifications((v) => !v)}
              title="Benachrichtigungen"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <Badge
                  variant="default"
                  className="absolute -top-0.5 -right-0.5 h-4 w-4 p-0 text-[9px] flex items-center justify-center rounded-full bg-[#E3000F] text-white border-0 pointer-events-none"
                >
                  {unreadCount}
                </Badge>
              )}
            </Button>

            <NotificationPanel
              open={showNotifications}
              onClose={() => setShowNotifications(false)}
              notifications={notifications}
              onDelete={handleDeleteNotification}
              onMarkAllRead={handleMarkAllRead}
              onDeleteAll={handleDeleteAll}
            />
          </div>
        </div>
      </header>

      <CommandPalette open={showCommand} onOpenChange={setShowCommand} />
    </>
  );
}
```

- [ ] **Step 2: Update `NotificationPanel.tsx` — props-based, with delete buttons**

Replace the entire file content with:

```typescript
"use client";

import { CheckSquare, Phone, MapPin, FileText, X, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Notification } from "./Header";

const ICONS = {
  aufgabe: { icon: CheckSquare, bg: "bg-orange-100 dark:bg-orange-900/30", color: "text-orange-600" },
  anruf: { icon: Phone, bg: "bg-blue-100 dark:bg-blue-900/30", color: "text-blue-600" },
  besuch: { icon: MapPin, bg: "bg-green-100 dark:bg-green-900/30", color: "text-green-600" },
  angebot: { icon: FileText, bg: "bg-purple-100 dark:bg-purple-900/30", color: "text-purple-600" },
};

interface Props {
  open: boolean;
  onClose: () => void;
  notifications: Notification[];
  onDelete: (id: string) => void;
  onMarkAllRead: () => void;
  onDeleteAll: () => void;
}

export function NotificationPanel({ open, onClose, notifications, onDelete, onMarkAllRead, onDeleteAll }: Props) {
  if (!open) return null;

  const ungelesen = notifications.filter((n) => !n.gelesen).length;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Panel */}
      <div className="absolute right-0 top-full mt-2 z-50 w-80 rounded-2xl border border-border bg-background shadow-2xl shadow-black/10 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-foreground" />
            <span className="text-sm font-semibold">Benachrichtigungen</span>
            {ungelesen > 0 && (
              <Badge className="h-4 px-1.5 text-[10px] bg-[#E3000F] text-white border-0">
                {ungelesen}
              </Badge>
            )}
          </div>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
            <X className="w-3.5 h-3.5" />
          </Button>
        </div>

        {/* Notifications list or empty state */}
        <div className="divide-y divide-border max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 gap-2">
              <Bell className="w-8 h-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">Keine Benachrichtigungen</p>
            </div>
          ) : (
            notifications.map((notif) => {
              const meta = ICONS[notif.typ];
              const Icon = meta.icon;
              return (
                <div
                  key={notif.id}
                  className={cn(
                    "group flex items-start gap-3 px-4 py-3 hover:bg-muted/40 transition-colors",
                    !notif.gelesen && "bg-[#E3000F]/3"
                  )}
                >
                  <div className={cn("flex items-center justify-center w-8 h-8 rounded-lg shrink-0 mt-0.5", meta.bg)}>
                    <Icon className={cn("w-3.5 h-3.5", meta.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className={cn("text-xs font-semibold", !notif.gelesen ? "text-foreground" : "text-muted-foreground")}>
                        {notif.titel}
                      </p>
                      {!notif.gelesen && (
                        <div className="w-1.5 h-1.5 rounded-full bg-[#E3000F] shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{notif.text}</p>
                    <p className="text-[10px] text-muted-foreground/60 mt-1">{notif.zeit}</p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); onDelete(notif.id); }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-0.5 p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                    title="Löschen"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer — only show when there are notifications */}
        {notifications.length > 0 && (
          <div className="px-4 py-2.5 border-t border-border bg-muted/30 flex items-center justify-between gap-2">
            <button
              onClick={onMarkAllRead}
              className="text-xs text-[#E3000F] hover:text-[#cc000e] font-medium transition-colors"
            >
              Alle gelesen
            </button>
            <button
              onClick={onDeleteAll}
              className="text-xs text-muted-foreground hover:text-foreground font-medium transition-colors"
            >
              Alle löschen
            </button>
          </div>
        )}
      </div>
    </>
  );
}
```

- [ ] **Step 3: Verify TypeScript and commit**

```bash
cd "C:\Users\tseyhan\Downloads\PPX\ewneu-crm" && npx tsc --noEmit 2>&1
```
Expected: no errors.

```bash
git add components/layout/Header.tsx components/layout/NotificationPanel.tsx
git commit -m "feat: make notifications deletable with dynamic badge count"
```

---

## Task 3: Add Ansprechpartner Type + Mock Data

**Files:**
- Modify: `lib/types.ts`
- Modify: `lib/mock-data.ts`

- [ ] **Step 1: Add `Ansprechpartner` interface to `lib/types.ts`**

Open `lib/types.ts`. After the `Mitarbeiter` interface at the end of the file, append:

```typescript
export interface Ansprechpartner {
  id: string;
  kunde_id: string;
  name: string;
  position?: string;
  telefon?: string;
  email?: string;
  notiz?: string;
  created_at: string;
}
```

- [ ] **Step 2: Extend `Besuch` interface with Ansprechpartner fields**

In `lib/types.ts`, find the `Besuch` interface. After `aufgaben_ids?: string[];`, add:

```typescript
  ansprechpartner_id?: string;
  ansprechpartner_name?: string;
```

The complete `Besuch` interface should now end with:
```typescript
  bericht?: string;
  anhänge?: Anhang[];
  aufgaben_ids?: string[];
  ansprechpartner_id?: string;
  ansprechpartner_name?: string;
  status: "offen" | "erledigt";
  created_at: string;
```

- [ ] **Step 3: Add `mockAnsprechpartner` to `lib/mock-data.ts`**

Open `lib/mock-data.ts`. Add this import at the top (update the existing import line):

```typescript
import type { Kunde, Aufgabe, Anruf, Besuch, Angebot, Aktivitaet, Ansprechpartner } from "./types";
```

Then append this array at the end of the file (after `mockMitarbeiterStats`):

```typescript
export const mockAnsprechpartner: Ansprechpartner[] = [
  {
    id: "ap-1",
    kunde_id: "1", // Müller & Söhne GmbH
    name: "Hans Müller",
    position: "Geschäftsführer",
    telefon: "+49 211 884 201",
    email: "h.mueller@mueller-soehne.de",
    created_at: "2026-01-10T09:00:00Z",
  },
  {
    id: "ap-2",
    kunde_id: "1", // Müller & Söhne GmbH
    name: "Petra Bauer",
    position: "Einkaufsleiterin",
    telefon: "+49 211 884 202",
    email: "p.bauer@mueller-soehne.de",
    created_at: "2026-01-10T09:05:00Z",
  },
  {
    id: "ap-3",
    kunde_id: "4", // Fischer Elektronik KG
    name: "Klaus Fischer",
    position: "Inhaber",
    telefon: "+49 231 995 101",
    email: "k.fischer@fischer-elektronik.de",
    created_at: "2026-01-15T10:00:00Z",
  },
  {
    id: "ap-4",
    kunde_id: "4", // Fischer Elektronik KG
    name: "Sabine Krause",
    position: "Technische Leiterin",
    telefon: "+49 231 995 102",
    email: "s.krause@fischer-elektronik.de",
    created_at: "2026-01-15T10:10:00Z",
  },
];
```

- [ ] **Step 4: Verify TypeScript and commit**

```bash
cd "C:\Users\tseyhan\Downloads\PPX\ewneu-crm" && npx tsc --noEmit 2>&1
```
Expected: no errors.

```bash
git add lib/types.ts lib/mock-data.ts
git commit -m "feat: add Ansprechpartner type, extend Besuch, add mock data"
```

---

## Task 4: Add Ansprechpartner to CRM Context

**Files:**
- Modify: `lib/crm-context.tsx`

- [ ] **Step 1: Replace entire `lib/crm-context.tsx`**

```typescript
"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { mockAufgaben, mockAnrufe, mockBesuche, mockAnsprechpartner } from "./mock-data";
import type { Aufgabe, Anruf, Besuch, Anhang, Ansprechpartner } from "./types";

interface CRMContextType {
  aufgaben: Aufgabe[];
  anrufe: Anruf[];
  besuche: Besuch[];
  ansprechpartner: Ansprechpartner[];
  addAufgabe: (a: Aufgabe) => void;
  addAnruf: (a: Anruf) => void;
  addBesuch: (b: Besuch) => void;
  markAnrufDone: (id: string) => void;
  markBesuchDone: (id: string) => void;
  markAufgabeDone: (id: string) => void;
  updateBesuch: (id: string, updates: Partial<Besuch>) => void;
  addAnhangToBesuch: (besuchId: string, anhang: Anhang) => void;
  removeAnhangFromBesuch: (besuchId: string, anhangId: string) => void;
  addAnsprechpartner: (a: Ansprechpartner) => void;
  updateAnsprechpartner: (id: string, updates: Partial<Ansprechpartner>) => void;
  deleteAnsprechpartner: (id: string) => void;
}

const CRMContext = createContext<CRMContextType | null>(null);

export function CRMProvider({ children }: { children: ReactNode }) {
  const [aufgaben, setAufgaben] = useState<Aufgabe[]>(mockAufgaben);
  const [anrufe, setAnrufe] = useState<Anruf[]>(mockAnrufe);
  const [besuche, setBesuche] = useState<Besuch[]>(mockBesuche);
  const [ansprechpartner, setAnsprechpartner] = useState<Ansprechpartner[]>(mockAnsprechpartner);

  const addAufgabe = (a: Aufgabe) => setAufgaben((prev) => [a, ...prev]);
  const addAnruf = (a: Anruf) => setAnrufe((prev) => [a, ...prev]);
  const addBesuch = (b: Besuch) => setBesuche((prev) => [b, ...prev]);

  const markAnrufDone = (id: string) =>
    setAnrufe((prev) =>
      prev.map((a) =>
        a.id === id
          ? { ...a, status: "erledigt" as const, durchgefuehrt_am: new Date().toISOString() }
          : a
      )
    );

  const markBesuchDone = (id: string) =>
    setBesuche((prev) =>
      prev.map((b) =>
        b.id === id
          ? { ...b, status: "erledigt" as const, durchgefuehrt_am: new Date().toISOString() }
          : b
      )
    );

  const markAufgabeDone = (id: string) =>
    setAufgaben((prev) =>
      prev.map((a) =>
        a.id === id
          ? { ...a, status: "erledigt" as const, erledigt_am: new Date().toISOString() }
          : a
      )
    );

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

  const addAnsprechpartner = (a: Ansprechpartner) =>
    setAnsprechpartner((prev) => [...prev, a]);

  const updateAnsprechpartner = (id: string, updates: Partial<Ansprechpartner>) =>
    setAnsprechpartner((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updates } : a))
    );

  const deleteAnsprechpartner = (id: string) =>
    setAnsprechpartner((prev) => prev.filter((a) => a.id !== id));

  return (
    <CRMContext.Provider
      value={{
        aufgaben, anrufe, besuche, ansprechpartner,
        addAufgabe, addAnruf, addBesuch,
        markAnrufDone, markBesuchDone, markAufgabeDone,
        updateBesuch, addAnhangToBesuch, removeAnhangFromBesuch,
        addAnsprechpartner, updateAnsprechpartner, deleteAnsprechpartner,
      }}
    >
      {children}
    </CRMContext.Provider>
  );
}

export function useCRM() {
  const ctx = useContext(CRMContext);
  if (!ctx) throw new Error("useCRM must be used within CRMProvider");
  return ctx;
}
```

- [ ] **Step 2: Verify TypeScript and commit**

```bash
cd "C:\Users\tseyhan\Downloads\PPX\ewneu-crm" && npx tsc --noEmit 2>&1
```
Expected: no errors.

```bash
git add lib/crm-context.tsx
git commit -m "feat: add Ansprechpartner state and CRUD methods to CRM context"
```

---

## Task 5: Replace Mitarbeiter with Ansprechpartner in Besuche Modals

**Files:**
- Modify: `components/modals/BerichtErfassenModal.tsx`
- Modify: `components/modals/NeuerBesuchModal.tsx`

- [ ] **Step 1: Replace `BerichtErfassenModal.tsx`**

Replace the entire file:

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

interface Props {
  open: boolean;
  onClose: () => void;
}

export function BerichtErfassenModal({ open, onClose }: Props) {
  const router = useRouter();
  const { addBesuch, ansprechpartner } = useCRM();

  const today = new Date().toISOString().split("T")[0];

  const [kundeId, setKundeId] = useState("");
  const [datum, setDatum] = useState(today);
  const [uhrzeitVon, setUhrzeitVon] = useState("");
  const [uhrzeitBis, setUhrzeitBis] = useState("");
  const [ansprechpartnerId, setAnsprechpartnerId] = useState("");
  const [notizen, setNotizen] = useState("");
  const [saving, setSaving] = useState(false);

  const kundenAnsprechpartner = ansprechpartner.filter((a) => a.kunde_id === kundeId);

  const calcDauer = () => {
    if (!uhrzeitVon || !uhrzeitBis) return undefined;
    const [h1, m1] = uhrzeitVon.split(":").map(Number);
    const [h2, m2] = uhrzeitBis.split(":").map(Number);
    const diff = (h2 * 60 + m2) - (h1 * 60 + m1);
    return diff > 0 ? diff : undefined;
  };

  const resetForm = () => {
    setKundeId("");
    setDatum(today);
    setUhrzeitVon("");
    setUhrzeitBis("");
    setAnsprechpartnerId("");
    setNotizen("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kundeId || !datum) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 400));

    const kunde = mockKunden.find((k) => k.id === kundeId);
    const selectedAP = kundenAnsprechpartner.find((a) => a.id === ansprechpartnerId);
    const id = `besuch-${Date.now()}`;
    const dauer = calcDauer();
    const newBesuch: Besuch = {
      id,
      kunde_id: kundeId,
      kunde: kunde || undefined,
      durchgefuehrt_am: datum,
      uhrzeit_von: uhrzeitVon || undefined,
      uhrzeit_bis: uhrzeitBis || undefined,
      dauer_minuten: dauer,
      ansprechpartner_id: ansprechpartnerId || undefined,
      ansprechpartner_name: selectedAP?.name || undefined,
      notizen: notizen || undefined,
      status: "erledigt",
      created_at: new Date().toISOString(),
    };

    addBesuch(newBesuch);
    setSaving(false);
    resetForm();
    onClose();
    router.push(`/besuche/${id}`);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) { resetForm(); onClose(); } }}>
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
              <Input id="von" type="time" value={uhrzeitVon} onChange={(e) => setUhrzeitVon(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bis">Uhrzeit bis</Label>
              <Input id="bis" type="time" value={uhrzeitBis} onChange={(e) => setUhrzeitBis(e.target.value)} />
            </div>
          </div>

          {/* Dauer preview */}
          {(() => {
            const dauer = calcDauer();
            return dauer && (
              <p className="text-xs text-muted-foreground -mt-1">Dauer: {dauer} Minuten</p>
            );
          })()}

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

          {/* Notizen */}
          <div className="space-y-1.5">
            <Label htmlFor="notizen">Kurze Notizen (optional)</Label>
            <textarea
              id="notizen"
              value={notizen}
              onChange={(e) => setNotizen(e.target.value)}
              placeholder="Gesprächsthemen..."
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

- [ ] **Step 2: Replace `NeuerBesuchModal.tsx`**

Replace the entire file:

```typescript
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
```

- [ ] **Step 3: Verify TypeScript and commit**

```bash
cd "C:\Users\tseyhan\Downloads\PPX\ewneu-crm" && npx tsc --noEmit 2>&1
```
Expected: no errors.

```bash
git add components/modals/BerichtErfassenModal.tsx components/modals/NeuerBesuchModal.tsx
git commit -m "feat: replace Mitarbeiter with Ansprechpartner in Besuche modals"
```

---

## Task 6: Add Ansprechpartner Tab to Kundenseite

**Files:**
- Create: `components/kunden/KundenAnsprechpartnerTab.tsx`
- Modify: `app/(dashboard)/kunden/[id]/page.tsx`

- [ ] **Step 1: Create `KundenAnsprechpartnerTab.tsx`**

Create `components/kunden/KundenAnsprechpartnerTab.tsx` with this content:

```typescript
"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, X, Check, Phone, Mail, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCRM } from "@/lib/crm-context";
import type { Ansprechpartner } from "@/lib/types";

interface Props {
  kundeId: string;
}

interface FormState {
  name: string;
  position: string;
  telefon: string;
  email: string;
  notiz: string;
}

const EMPTY_FORM: FormState = { name: "", position: "", telefon: "", email: "", notiz: "" };

export function KundenAnsprechpartnerTab({ kundeId }: Props) {
  const { ansprechpartner, addAnsprechpartner, updateAnsprechpartner, deleteAnsprechpartner } = useCRM();

  const list = ansprechpartner.filter((a) => a.kunde_id === kundeId);

  // Add form
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState<FormState>(EMPTY_FORM);

  // Edit state: which id is being edited
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<FormState>(EMPTY_FORM);

  // Delete confirmation
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleAdd = () => {
    if (!addForm.name.trim()) return;
    addAnsprechpartner({
      id: `ap-${Date.now()}`,
      kunde_id: kundeId,
      name: addForm.name.trim(),
      position: addForm.position.trim() || undefined,
      telefon: addForm.telefon.trim() || undefined,
      email: addForm.email.trim() || undefined,
      notiz: addForm.notiz.trim() || undefined,
      created_at: new Date().toISOString(),
    });
    setAddForm(EMPTY_FORM);
    setShowAddForm(false);
  };

  const startEdit = (ap: Ansprechpartner) => {
    setEditingId(ap.id);
    setEditForm({
      name: ap.name,
      position: ap.position || "",
      telefon: ap.telefon || "",
      email: ap.email || "",
      notiz: ap.notiz || "",
    });
    setConfirmDeleteId(null);
  };

  const handleSaveEdit = () => {
    if (!editingId || !editForm.name.trim()) return;
    updateAnsprechpartner(editingId, {
      name: editForm.name.trim(),
      position: editForm.position.trim() || undefined,
      telefon: editForm.telefon.trim() || undefined,
      email: editForm.email.trim() || undefined,
      notiz: editForm.notiz.trim() || undefined,
    });
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    deleteAnsprechpartner(id);
    setConfirmDeleteId(null);
  };

  return (
    <div className="space-y-4 py-2">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {list.length === 0 ? "Noch kein Ansprechpartner erfasst" : `${list.length} Ansprechpartner`}
        </p>
        {!showAddForm && (
          <Button size="sm" variant="outline" className="gap-2" onClick={() => setShowAddForm(true)}>
            <Plus className="w-3.5 h-3.5" /> Ansprechpartner hinzufügen
          </Button>
        )}
      </div>

      {/* Inline add form */}
      {showAddForm && (
        <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-4 space-y-3">
          <p className="text-sm font-semibold text-foreground">Neuer Ansprechpartner</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Name <span className="text-red-500">*</span></Label>
              <Input
                autoFocus
                value={addForm.name}
                onChange={(e) => setAddForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Max Mustermann"
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Position / Abteilung</Label>
              <Input
                value={addForm.position}
                onChange={(e) => setAddForm((f) => ({ ...f, position: e.target.value }))}
                placeholder="Einkaufsleiter"
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Telefon</Label>
              <Input
                value={addForm.telefon}
                onChange={(e) => setAddForm((f) => ({ ...f, telefon: e.target.value }))}
                placeholder="+49 211 000 000"
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">E-Mail</Label>
              <Input
                value={addForm.email}
                onChange={(e) => setAddForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="max@firma.de"
                className="h-8 text-sm"
                type="email"
              />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <Label className="text-xs">Notiz</Label>
              <Input
                value={addForm.notiz}
                onChange={(e) => setAddForm((f) => ({ ...f, notiz: e.target.value }))}
                placeholder="Bevorzugt nachmittags kontaktieren..."
                className="h-8 text-sm"
              />
            </div>
          </div>
          <div className="flex items-center gap-2 justify-end">
            <Button size="sm" variant="outline" onClick={() => { setShowAddForm(false); setAddForm(EMPTY_FORM); }}>
              Abbrechen
            </Button>
            <Button size="sm" disabled={!addForm.name.trim()} onClick={handleAdd}>
              Speichern
            </Button>
          </div>
        </div>
      )}

      {/* Empty state */}
      {list.length === 0 && !showAddForm && (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-muted">
            <User className="w-5 h-5 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">Noch kein Ansprechpartner erfasst</p>
          <Button size="sm" variant="outline" className="gap-2" onClick={() => setShowAddForm(true)}>
            <Plus className="w-3.5 h-3.5" /> Ansprechpartner hinzufügen
          </Button>
        </div>
      )}

      {/* Ansprechpartner list */}
      <div className="space-y-3">
        {list.map((ap) => {
          const isEditing = editingId === ap.id;
          const isConfirmingDelete = confirmDeleteId === ap.id;

          if (isEditing) {
            return (
              <div key={ap.id} className="rounded-2xl border border-border bg-card p-4 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Name <span className="text-red-500">*</span></Label>
                    <Input
                      autoFocus
                      value={editForm.name}
                      onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Position / Abteilung</Label>
                    <Input
                      value={editForm.position}
                      onChange={(e) => setEditForm((f) => ({ ...f, position: e.target.value }))}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Telefon</Label>
                    <Input
                      value={editForm.telefon}
                      onChange={(e) => setEditForm((f) => ({ ...f, telefon: e.target.value }))}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">E-Mail</Label>
                    <Input
                      value={editForm.email}
                      onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
                      className="h-8 text-sm"
                      type="email"
                    />
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <Label className="text-xs">Notiz</Label>
                    <Input
                      value={editForm.notiz}
                      onChange={(e) => setEditForm((f) => ({ ...f, notiz: e.target.value }))}
                      className="h-8 text-sm"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2 justify-end">
                  <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                    <X className="w-3.5 h-3.5 mr-1" /> Abbrechen
                  </Button>
                  <Button size="sm" disabled={!editForm.name.trim()} onClick={handleSaveEdit}>
                    <Check className="w-3.5 h-3.5 mr-1" /> Speichern
                  </Button>
                </div>
              </div>
            );
          }

          return (
            <div key={ap.id} className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-foreground">{ap.name}</p>
                    {ap.position && (
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                        {ap.position}
                      </span>
                    )}
                  </div>
                  <div className="mt-2 space-y-1">
                    {ap.telefon && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Phone className="w-3 h-3 shrink-0" />
                        <a href={`tel:${ap.telefon}`} className="hover:text-[#E3000F] transition-colors">
                          {ap.telefon}
                        </a>
                      </div>
                    )}
                    {ap.email && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Mail className="w-3 h-3 shrink-0" />
                        <a href={`mailto:${ap.email}`} className="hover:text-[#E3000F] transition-colors truncate">
                          {ap.email}
                        </a>
                      </div>
                    )}
                    {ap.notiz && (
                      <p className="text-xs text-muted-foreground/70 mt-1 italic">{ap.notiz}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                    onClick={() => startEdit(ap)}
                    title="Bearbeiten"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={() => setConfirmDeleteId(ap.id)}
                    title="Löschen"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>

              {/* Inline delete confirmation */}
              {isConfirmingDelete && (
                <div className="mt-3 pt-3 border-t border-border flex items-center justify-between gap-2">
                  <p className="text-xs text-muted-foreground">Wirklich löschen?</p>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setConfirmDeleteId(null)}>
                      Nein
                    </Button>
                    <Button size="sm" variant="destructive" className="h-7 text-xs" onClick={() => handleDelete(ap.id)}>
                      Ja, löschen
                    </Button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Add Ansprechpartner tab to `kunden/[id]/page.tsx`**

In `app/(dashboard)/kunden/[id]/page.tsx`:

**2a.** Add `Users` to the Lucide import line (line 4):
```typescript
import {
  ArrowLeft, Phone, Mail, MapPin, Building2, Hash,
  Calendar, Plus, CheckSquare, FileText, Users,
} from "lucide-react";
```

**2b.** Add the import for `KundenAnsprechpartnerTab` after the `KundenBesucheTab` import (line 21):
```typescript
import { KundenAnsprechpartnerTab } from "@/components/kunden/KundenAnsprechpartnerTab";
```

**2c.** In the `<TabsList>` block (starting line 219), insert the new trigger between `besuche` and `angebote`:
```tsx
<TabsTrigger value="ansprechpartner">
  <Users className="w-3.5 h-3.5 mr-1.5" /> Ansprechpartner
</TabsTrigger>
```

**2d.** After the closing `</TabsContent>` of the `besuche` tab (after line 233), insert:
```tsx
<TabsContent value="ansprechpartner">
  <KundenAnsprechpartnerTab kundeId={id} />
</TabsContent>
```

- [ ] **Step 3: Verify TypeScript and commit**

```bash
cd "C:\Users\tseyhan\Downloads\PPX\ewneu-crm" && npx tsc --noEmit 2>&1
```
Expected: no errors.

```bash
git add components/kunden/KundenAnsprechpartnerTab.tsx app/(dashboard)/kunden/[id]/page.tsx
git commit -m "feat: add Ansprechpartner tab to customer detail page with inline add/edit/delete"
```

---

## Task 7: Final Build + Push + Deploy

**Files:** None (verification only)

- [ ] **Step 1: Run full production build**

```bash
cd "C:\Users\tseyhan\Downloads\PPX\ewneu-crm" && npm run build 2>&1
```

Expected output includes all routes:
```
Route (app)
├ ○ /
├ ○ /besuche
├ ƒ /besuche/[id]
├ ○ /kunden
├ ƒ /kunden/[id]
├ ○ /wochenplanung
...
✓ Generating static pages
```

- [ ] **Step 2: Push to GitHub**

```bash
cd "C:\Users\tseyhan\Downloads\PPX\ewneu-crm" && git push origin master 2>&1
```

- [ ] **Step 3: Deploy to Vercel**

```bash
cd "C:\Users\tseyhan\Downloads\PPX\ewneu-crm" && npx vercel --yes --prod 2>&1
```

Expected: deployment URL logged, `"status": "ok"`.

- [ ] **Step 4: Smoke test checklist**

After deploy, open the production URL and verify:
- [ ] Toggle dark/light mode → sidebar changes color correctly
- [ ] Bell icon → notifications panel opens; ✕ per notification deletes it; "Alle löschen" clears list; badge count updates
- [ ] `/besuche` → click "Bericht erfassen" → select a Kunde → Ansprechpartner dropdown shows that kunde's contacts
- [ ] `/besuche` → click "Besuch planen" → same Ansprechpartner behavior
- [ ] `/kunden/1` → "Ansprechpartner" tab shows Hans Müller + Petra Bauer; add/edit/delete works
- [ ] `/kunden/4` → "Ansprechpartner" tab shows Klaus Fischer + Sabine Krause
