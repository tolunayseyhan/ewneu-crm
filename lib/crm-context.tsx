"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { mockAufgaben, mockAnrufe, mockBesuche } from "./mock-data";
import type { Aufgabe, Anruf, Besuch, Anhang } from "./types";

interface CRMContextType {
  aufgaben: Aufgabe[];
  anrufe: Anruf[];
  besuche: Besuch[];
  addAufgabe: (a: Aufgabe) => void;
  addAnruf: (a: Anruf) => void;
  addBesuch: (b: Besuch) => void;
  markAnrufDone: (id: string) => void;
  markBesuchDone: (id: string) => void;
  markAufgabeDone: (id: string) => void;
  updateBesuch: (id: string, updates: Partial<Besuch>) => void;
  addAnhangToBesuch: (besuchId: string, anhang: Anhang) => void;
  removeAnhangFromBesuch: (besuchId: string, anhangId: string) => void;
}

const CRMContext = createContext<CRMContextType | null>(null);

export function CRMProvider({ children }: { children: ReactNode }) {
  const [aufgaben, setAufgaben] = useState<Aufgabe[]>(mockAufgaben);
  const [anrufe, setAnrufe] = useState<Anruf[]>(mockAnrufe);
  const [besuche, setBesuche] = useState<Besuch[]>(mockBesuche);

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

  return (
    <CRMContext.Provider
      value={{ aufgaben, anrufe, besuche, addAufgabe, addAnruf, addBesuch, markAnrufDone, markBesuchDone, markAufgabeDone, updateBesuch, addAnhangToBesuch, removeAnhangFromBesuch }}
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
