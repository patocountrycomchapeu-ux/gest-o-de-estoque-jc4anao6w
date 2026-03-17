CREATE TABLE public.repair_suppliers (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  cnpj TEXT,
  current_balance NUMERIC DEFAULT 0
);

ALTER TABLE public.repair_suppliers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read" ON public.repair_suppliers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow write" ON public.repair_suppliers FOR ALL TO authenticated USING (can_write());

ALTER TABLE public.repairs ADD COLUMN supplier_id TEXT REFERENCES public.repair_suppliers(id);
ALTER TABLE public.checklists ADD COLUMN total_checked INTEGER DEFAULT 0;

-- Update nodes levels to strictly 5 steps
UPDATE public.nodes SET level = 'tipo' WHERE level = 'departamento';
UPDATE public.nodes SET level = 'funcao' WHERE level = 'secao';
UPDATE public.nodes SET level = 'especificacao' WHERE level = 'categoria';

-- Storage setup for evidence-based documentation
INSERT INTO storage.buckets (id, name, public) VALUES ('asset-photos', 'asset-photos', true) ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Allow public read" ON storage.objects FOR SELECT TO public USING (bucket_id = 'asset-photos');
CREATE POLICY "Allow authenticated upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'asset-photos');
CREATE POLICY "Allow authenticated update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'asset-photos');
CREATE POLICY "Allow authenticated delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'asset-photos');

