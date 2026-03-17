CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'Visualizador',
  is_active BOOLEAN NOT NULL DEFAULT true,
  preferred_theme TEXT DEFAULT 'system',
  team_id TEXT
);

CREATE TABLE assets (
  id TEXT PRIMARY KEY,
  departamento TEXT,
  secao TEXT,
  categoria TEXT,
  item TEXT,
  marca TEXT,
  tree_node_id TEXT,
  patrimony_number TEXT,
  is_batch BOOLEAN DEFAULT false,
  current_quantity INTEGER DEFAULT 1,
  team_id TEXT,
  condition TEXT DEFAULT 'good',
  status TEXT DEFAULT 'present',
  photos JSONB DEFAULT '[]'::jsonb,
  price NUMERIC DEFAULT 0,
  damaged_date TIMESTAMPTZ,
  damaged_user TEXT
);

CREATE TABLE repairs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  asset_id TEXT REFERENCES assets(id) ON DELETE CASCADE UNIQUE,
  is_sent BOOLEAN DEFAULT false,
  estimated_completion_date TIMESTAMPTZ,
  condition_status TEXT,
  cost NUMERIC DEFAULT 0,
  location TEXT,
  description TEXT,
  repair_user TEXT,
  repair_date TIMESTAMPTZ
);

CREATE TABLE history (
  id TEXT PRIMARY KEY,
  asset_id TEXT REFERENCES assets(id) ON DELETE CASCADE,
  origin_responsible TEXT,
  destination_responsible TEXT,
  quantity INTEGER DEFAULT 1,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  type TEXT,
  description TEXT,
  user_name TEXT
);

CREATE TABLE nodes (
  id TEXT PRIMARY KEY,
  name TEXT,
  level TEXT,
  parent_id TEXT,
  is_grouped BOOLEAN DEFAULT false
);

CREATE TABLE teams (
  id TEXT PRIMARY KEY,
  name TEXT,
  description TEXT,
  location TEXT
);

CREATE TABLE transfers (
  id TEXT PRIMARY KEY,
  inventory_id TEXT,
  from_team_id TEXT,
  to_team_id TEXT,
  initiated_by TEXT,
  initiated_at TIMESTAMPTZ,
  status TEXT,
  completed_at TIMESTAMPTZ,
  completed_by TEXT
);

CREATE TABLE checklists (
  id TEXT PRIMARY KEY,
  team_id TEXT,
  date TIMESTAMPTZ,
  leader_name TEXT,
  discrepancies INTEGER
);

-- Trigger for User Creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, is_active)
  VALUES (NEW.id, NEW.email, split_part(NEW.email, '@', 1), 'Visualizador', true);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE repairs ENABLE ROW LEVEL SECURITY;
ALTER TABLE history ENABLE ROW LEVEL SECURITY;
ALTER TABLE nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles read" ON profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Profiles update Gestor" ON profiles FOR UPDATE TO authenticated USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'Gestor'
) WITH CHECK (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'Gestor'
);
CREATE POLICY "Profiles update Self" ON profiles FOR UPDATE TO authenticated USING (id = auth.uid());

CREATE OR REPLACE FUNCTION can_write() RETURNS BOOLEAN AS $$
BEGIN
  RETURN (SELECT role FROM profiles WHERE id = auth.uid()) IN ('Gestor', 'Encarregado Gestor', 'Encarregado');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE POLICY "Allow read" ON assets FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow write" ON assets FOR ALL TO authenticated USING (can_write());

CREATE POLICY "Allow read" ON repairs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow write" ON repairs FOR ALL TO authenticated USING (can_write());

CREATE POLICY "Allow read" ON history FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow write" ON history FOR ALL TO authenticated USING (can_write());

CREATE POLICY "Allow read" ON nodes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow write" ON nodes FOR ALL TO authenticated USING (can_write());

CREATE POLICY "Allow read" ON teams FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow write" ON teams FOR ALL TO authenticated USING (can_write());

CREATE POLICY "Allow read" ON transfers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow write" ON transfers FOR ALL TO authenticated USING (can_write());

CREATE POLICY "Allow read" ON checklists FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow write" ON checklists FOR ALL TO authenticated USING (can_write());

-- Seed Data
INSERT INTO teams (id, name, description, location) VALUES 
('t1', 'Equipe Tacha 1', 'Manutenção Externa', 'Setor Norte'),
('t2', 'Equipe Alpha', 'Reparos Rápidos', 'Setor Sul');

INSERT INTO nodes (id, name, level, parent_id, is_grouped) VALUES 
('d1', 'Ferramentas Elétricas', 'departamento', null, false),
('d2', 'Ferramentas Manuais', 'departamento', null, false),
('s1', 'Bateria', 'secao', 'd1', false),
('s2', 'Cabos', 'secao', 'd2', false),
('c1', 'Furadeiras e Parafusadeiras', 'categoria', 's1', false),
('c2', 'Chaves', 'categoria', 's2', false),
('c3', 'Sinalização', 'categoria', 's2', false),
('i1', 'Parafusadeira Impacto 12V', 'item', 'c1', false),
('i2', 'Chave Phillips', 'item', 'c2', false),
('i3', 'Cone de Trânsito', 'item', 'c3', false),
('m1', 'Makita', 'marca', 'i1', false),
('m3', 'Tramontina', 'marca', 'i2', false),
('m4', 'Plastcor', 'marca', 'i3', true);
