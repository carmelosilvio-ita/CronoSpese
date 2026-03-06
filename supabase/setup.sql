-- 1. Tabella Profili (Estensione di auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  cognome TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'CRONOMETRISTA' CHECK (role IN ('ADMIN', 'CRONOMETRISTA')),
  citta_residenza TEXT,
  numero_tessera TEXT,
  targa_auto TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Rimuovo policy esistenti per evitare errori in caso di riesecuzione
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Profili visibili a tutti gli autenticati" ON public.profiles;
    DROP POLICY IF EXISTS "Utenti possono aggiornare il proprio profilo" ON public.profiles;
EXCEPTION
    WHEN undefined_object THEN null;
END $$;

CREATE POLICY "Profili visibili a tutti gli autenticati" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Utenti possono aggiornare il proprio profilo" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- 2. Tabella Registro Servizi
CREATE TABLE IF NOT EXISTS public.servizi (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  numero INTEGER NOT NULL,
  anno INTEGER NOT NULL,
  luogo TEXT NOT NULL,
  data_inizio DATE NOT NULL,
  data_fine DATE NOT NULL,
  manifestazione TEXT NOT NULL,
  organizzatore TEXT NOT NULL,
  sport TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.servizi ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Servizi leggibili da tutti" ON public.servizi;
    DROP POLICY IF EXISTS "Solo admin gestiscono servizi" ON public.servizi;
EXCEPTION
    WHEN undefined_object THEN null;
END $$;

CREATE POLICY "Servizi leggibili da tutti" ON public.servizi FOR SELECT TO authenticated USING (true);
CREATE POLICY "Solo admin gestiscono servizi" ON public.servizi FOR ALL TO authenticated 
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'));

-- 3. Tabella Tariffe Federali
CREATE TABLE IF NOT EXISTS public.tariffe_federali (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  decorrenza DATE NOT NULL,
  diaria_base NUMERIC NOT NULL,
  forfait_4h_base NUMERIC NOT NULL,
  diaria_specialistica NUMERIC NOT NULL,
  forfait_4h_specialistica NUMERIC NOT NULL,
  maggiorazione_festiva_notturna NUMERIC NOT NULL DEFAULT 0.5,
  diaria_partite NUMERIC NOT NULL,
  indennita_trasporto_urbano NUMERIC NOT NULL,
  indennita_mancato_pasto NUMERIC NOT NULL,
  indennita_km NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.tariffe_federali ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Tariffe leggibili da tutti" ON public.tariffe_federali;
    DROP POLICY IF EXISTS "Solo admin gestiscono tariffe" ON public.tariffe_federali;
EXCEPTION
    WHEN undefined_object THEN null;
END $$;

CREATE POLICY "Tariffe leggibili da tutti" ON public.tariffe_federali FOR SELECT TO authenticated USING (true);
CREATE POLICY "Solo admin gestiscono tariffe" ON public.tariffe_federali FOR ALL TO authenticated 
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'));

-- 4. Tabella Note Spese
CREATE TABLE IF NOT EXISTS public.note_spese (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  servizio_id UUID REFERENCES public.servizi(id) ON DELETE CASCADE NOT NULL,
  stato TEXT NOT NULL DEFAULT 'BOZZA' CHECK (stato IN ('BOZZA', 'INVIATA', 'APPROVATA', 'RIFIUTATA')),
  motivazione_rifiuto TEXT,
  viaggi NUMERIC DEFAULT 0,
  km_totali NUMERIC DEFAULT 0,
  autostrada NUMERIC DEFAULT 0,
  vitto_documentato NUMERIC DEFAULT 0,
  alloggio NUMERIC DEFAULT 0,
  altre_spese NUMERIC DEFAULT 0,
  is_sport_di_squadra BOOLEAN DEFAULT FALSE,
  num_partite INTEGER DEFAULT 0,
  applica_trasporto_urbano BOOLEAN DEFAULT FALSE,
  giornate JSONB DEFAULT '[]'::jsonb,
  allegati TEXT[] DEFAULT '{}',
  firma_digitale TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.note_spese ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Cronometristi vedono proprie note" ON public.note_spese;
    DROP POLICY IF EXISTS "Cronometristi creano proprie note" ON public.note_spese;
    DROP POLICY IF EXISTS "Cronometristi aggiornano proprie note in bozza" ON public.note_spese;
EXCEPTION
    WHEN undefined_object THEN null;
END $$;

CREATE POLICY "Cronometristi vedono proprie note" ON public.note_spese FOR SELECT TO authenticated USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'));
CREATE POLICY "Cronometristi creano proprie note" ON public.note_spese FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Cronometristi aggiornano proprie note in bozza" ON public.note_spese FOR UPDATE TO authenticated USING (auth.uid() = user_id AND (stato = 'BOZZA' OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN')));

-- 5. Tabella Associazione
CREATE TABLE IF NOT EXISTS public.associazione (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  citta TEXT NOT NULL,
  codice_fiscale TEXT NOT NULL,
  piva TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.associazione ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Associazione leggibile da tutti" ON public.associazione;
    DROP POLICY IF EXISTS "Solo admin gestiscono associazione" ON public.associazione;
EXCEPTION
    WHEN undefined_object THEN null;
END $$;

CREATE POLICY "Associazione leggibile da tutti" ON public.associazione FOR SELECT TO authenticated USING (true);
CREATE POLICY "Solo admin gestiscono associazione" ON public.associazione FOR ALL TO authenticated 
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'));

-- 6. Trigger per creazione automatica profilo
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, nome, cognome, email, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data ->> 'nome', ''),
    COALESCE(new.raw_user_meta_data ->> 'cognome', ''),
    new.email,
    'CRONOMETRISTA'
  );
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();