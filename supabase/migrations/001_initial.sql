-- EWNEU CRM - Initial Schema
-- Run this migration in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Customers (Kunden)
CREATE TABLE IF NOT EXISTS kunden (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nummer VARCHAR(20) UNIQUE,
  name1 VARCHAR(255) NOT NULL,
  name2 VARCHAR(255),
  strasse VARCHAR(255),
  plz VARCHAR(10),
  ort VARCHAR(100),
  telefon VARCHAR(50),
  email VARCHAR(255),
  branche VARCHAR(100),
  betreuer_id UUID REFERENCES auth.users(id),
  status VARCHAR(20) DEFAULT 'aktiv' CHECK (status IN ('aktiv', 'inaktiv', 'neu')),
  letzte_aktivitaet TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tasks (Aufgaben)
CREATE TABLE IF NOT EXISTS aufgaben (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titel TEXT NOT NULL,
  beschreibung TEXT,
  kunde_id UUID REFERENCES kunden(id) ON DELETE SET NULL,
  zugewiesen_an UUID REFERENCES auth.users(id),
  erstellt_von UUID REFERENCES auth.users(id),
  status VARCHAR(20) DEFAULT 'offen' CHECK (status IN ('offen', 'in_bearbeitung', 'erledigt')),
  prioritaet VARCHAR(10) DEFAULT 'mittel' CHECK (prioritaet IN ('hoch', 'mittel', 'niedrig')),
  faellig_am DATE,
  erledigt_am TIMESTAMP WITH TIME ZONE,
  ereignis VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Calls (Anrufe)
CREATE TABLE IF NOT EXISTS anrufe (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kunde_id UUID REFERENCES kunden(id) ON DELETE CASCADE,
  mitarbeiter_id UUID REFERENCES auth.users(id),
  faellig_am DATE,
  durchgefuehrt_am TIMESTAMP WITH TIME ZONE,
  notizen TEXT,
  status VARCHAR(20) DEFAULT 'offen' CHECK (status IN ('offen', 'erledigt')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Visits (Besuche)
CREATE TABLE IF NOT EXISTS besuche (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kunde_id UUID REFERENCES kunden(id) ON DELETE CASCADE,
  mitarbeiter_id UUID REFERENCES auth.users(id),
  faellig_am DATE,
  durchgefuehrt_am TIMESTAMP WITH TIME ZONE,
  notizen TEXT,
  dauer_minuten INTEGER,
  status VARCHAR(20) DEFAULT 'offen' CHECK (status IN ('offen', 'erledigt')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Offers (Angebote)
CREATE TABLE IF NOT EXISTS angebote (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nummer VARCHAR(50) UNIQUE,
  kunde_id UUID REFERENCES kunden(id) ON DELETE CASCADE,
  artikel TEXT,
  menge DECIMAL(10, 2),
  einzelpreis DECIMAL(10, 2),
  gesamtpreis DECIMAL(10, 2),
  status VARCHAR(30) DEFAULT 'offen' CHECK (status IN ('offen', 'angenommen', 'abgelehnt', 'in_verhandlung')),
  erstellt_am DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Activity log (Aktivitäten)
CREATE TABLE IF NOT EXISTS aktivitaeten (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kunde_id UUID REFERENCES kunden(id) ON DELETE CASCADE,
  typ VARCHAR(30) CHECK (typ IN ('anruf', 'besuch', 'aufgabe', 'angebot', 'notiz')),
  beschreibung TEXT,
  mitarbeiter_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Row Level Security
ALTER TABLE kunden ENABLE ROW LEVEL SECURITY;
ALTER TABLE aufgaben ENABLE ROW LEVEL SECURITY;
ALTER TABLE anrufe ENABLE ROW LEVEL SECURITY;
ALTER TABLE besuche ENABLE ROW LEVEL SECURITY;
ALTER TABLE angebote ENABLE ROW LEVEL SECURITY;
ALTER TABLE aktivitaeten ENABLE ROW LEVEL SECURITY;

-- Policies: authenticated users can read all, write their own
CREATE POLICY "Authenticated users can view kunden" ON kunden FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert kunden" ON kunden FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update kunden" ON kunden FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can view aufgaben" ON aufgaben FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert aufgaben" ON aufgaben FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update aufgaben" ON aufgaben FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can view anrufe" ON anrufe FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert anrufe" ON anrufe FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update anrufe" ON anrufe FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can view besuche" ON besuche FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert besuche" ON besuche FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update besuche" ON besuche FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can view angebote" ON angebote FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert angebote" ON angebote FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update angebote" ON angebote FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can view aktivitaeten" ON aktivitaeten FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert aktivitaeten" ON aktivitaeten FOR INSERT TO authenticated WITH CHECK (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_kunden_status ON kunden(status);
CREATE INDEX IF NOT EXISTS idx_kunden_betreuer ON kunden(betreuer_id);
CREATE INDEX IF NOT EXISTS idx_aufgaben_status ON aufgaben(status);
CREATE INDEX IF NOT EXISTS idx_aufgaben_kunde ON aufgaben(kunde_id);
CREATE INDEX IF NOT EXISTS idx_aufgaben_zugewiesen ON aufgaben(zugewiesen_an);
CREATE INDEX IF NOT EXISTS idx_aufgaben_faellig ON aufgaben(faellig_am);
CREATE INDEX IF NOT EXISTS idx_anrufe_kunde ON anrufe(kunde_id);
CREATE INDEX IF NOT EXISTS idx_anrufe_faellig ON anrufe(faellig_am);
CREATE INDEX IF NOT EXISTS idx_besuche_kunde ON besuche(kunde_id);
CREATE INDEX IF NOT EXISTS idx_besuche_faellig ON besuche(faellig_am);
CREATE INDEX IF NOT EXISTS idx_angebote_kunde ON angebote(kunde_id);
CREATE INDEX IF NOT EXISTS idx_aktivitaeten_kunde ON aktivitaeten(kunde_id);
