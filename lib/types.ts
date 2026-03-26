export interface Kunde {
  id: string;
  nummer: string;
  name1: string;
  name2?: string;
  strasse?: string;
  plz?: string;
  ort?: string;
  telefon?: string;
  email?: string;
  branche?: string;
  betreuer_id?: string;
  status: "aktiv" | "inaktiv" | "neu";
  letzte_aktivitaet?: string;
  created_at: string;
  letzte_besuch?: string;
  umsatz?: number;
}

export interface Aufgabe {
  id: string;
  titel: string;
  beschreibung?: string;
  kunde_id?: string;
  kunde?: Kunde;
  zugewiesen_an?: string;
  zugewiesener_name?: string;
  erstellt_von?: string;
  status: "offen" | "in_bearbeitung" | "erledigt";
  prioritaet: "hoch" | "mittel" | "niedrig";
  faellig_am?: string;
  erledigt_am?: string;
  ereignis?: string;
  created_at: string;
}

export interface Anruf {
  id: string;
  kunde_id: string;
  kunde?: Kunde;
  mitarbeiter_id?: string;
  mitarbeiter_name?: string;
  faellig_am?: string;
  durchgefuehrt_am?: string;
  notizen?: string;
  status: "offen" | "erledigt";
  created_at: string;
}

export interface Besuch {
  id: string;
  kunde_id: string;
  kunde?: Kunde;
  mitarbeiter_id?: string;
  mitarbeiter_name?: string;
  faellig_am?: string;
  durchgefuehrt_am?: string;
  notizen?: string;
  uhrzeit_von?: string;      // "09:30"
  uhrzeit_bis?: string;      // "11:00"
  dauer_minuten?: number;    // auto-calculated from uhrzeit_von/bis or manual
  bericht?: string;
  anhänge?: Anhang[];
  aufgaben_ids?: string[];
  ansprechpartner_id?: string;
  ansprechpartner_name?: string;
  status: "offen" | "erledigt";
  created_at: string;
}

export interface Anhang {
  id: string;
  name: string;         // Dateiname z.B. "Protokoll.pdf"
  size: number;         // Bytes
  mime: string;         // MIME-Type z.B. "application/pdf"
  data_url: string;     // Base64-kodierter Inhalt (in-memory, kein Backend)
  created_at: string;
}

export interface Angebot {
  id: string;
  nummer?: string;
  kunde_id: string;
  kunde?: Kunde;
  artikel?: string;
  menge?: number;
  einzelpreis?: number;
  gesamtpreis?: number;
  status: "offen" | "angenommen" | "abgelehnt" | "in_verhandlung";
  erstellt_am?: string;
  created_at: string;
}

export interface Aktivitaet {
  id: string;
  kunde_id: string;
  typ: "anruf" | "besuch" | "aufgabe" | "angebot" | "notiz";
  beschreibung?: string;
  mitarbeiter_id?: string;
  mitarbeiter_name?: string;
  created_at: string;
}

export interface Mitarbeiter {
  id: string;
  name: string;
  email: string;
  rolle: string;
  avatar?: string;
}

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
