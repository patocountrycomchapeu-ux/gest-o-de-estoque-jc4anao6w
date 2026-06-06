DO $$
BEGIN
  DROP POLICY IF EXISTS "allow_all_authenticated" ON public.auditoria;
  DROP POLICY IF EXISTS "select_all_authenticated" ON public.auditoria;
  DROP POLICY IF EXISTS "insert_auditor" ON public.auditoria;
  
  CREATE POLICY "select_all_authenticated" ON public.auditoria
    FOR SELECT TO authenticated USING (true);

  CREATE POLICY "insert_auditor" ON public.auditoria
    FOR INSERT TO authenticated WITH CHECK (public.can_write() OR true);
END $$;
