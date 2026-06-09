DO $$
DECLARE
  new_user_id uuid;
  gestor_perfil_id uuid;
BEGIN
  -- Ensure Gestor profile exists
  IF NOT EXISTS (SELECT 1 FROM public.perfil_acesso WHERE descricao ILIKE 'Gestor') THEN
    gestor_perfil_id := gen_random_uuid();
    INSERT INTO public.perfil_acesso (id, descricao) VALUES (gestor_perfil_id, 'Gestor');
  ELSE
    SELECT id INTO gestor_perfil_id FROM public.perfil_acesso WHERE descricao ILIKE 'Gestor' LIMIT 1;
  END IF;

  -- Admin user provisioning
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'gabrielknightdark@outlook.com') THEN
    new_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      new_user_id,
      '00000000-0000-0000-0000-000000000000',
      'gabrielknightdark@outlook.com',
      crypt('1234Ferreira!', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Administrador"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL,
      '', '', ''
    );
    
    INSERT INTO public.usuarios (id, email, nome, perfil_acesso_id, status)
    VALUES (new_user_id, 'gabrielknightdark@outlook.com', 'Administrador', gestor_perfil_id, 'ativo')
    ON CONFLICT (id) DO UPDATE SET perfil_acesso_id = EXCLUDED.perfil_acesso_id;
  END IF;
END $$;

-- RBAC Functions
CREATE OR REPLACE FUNCTION public.is_gestor()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_admin BOOLEAN;
BEGIN
  SELECT (p.descricao ILIKE 'gestor' OR p.descricao ILIKE 'gerente') INTO v_admin
  FROM public.usuarios u
  JOIN public.perfil_acesso p ON u.perfil_acesso_id = p.id
  WHERE u.id = auth.uid();
  RETURN COALESCE(v_admin, false);
END;
$;

CREATE OR REPLACE FUNCTION public.get_user_teams()
RETURNS SETOF uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY SELECT equipe_id FROM public.usuarios_equipes WHERE usuario_id = auth.uid();
END;
$;

CREATE OR REPLACE FUNCTION public.can_write()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN (SELECT p.descricao FROM public.usuarios u JOIN public.perfil_acesso p ON u.perfil_acesso_id = p.id WHERE u.id = auth.uid()) IN ('Gestor', 'Encarregado Gestor', 'Encarregado', 'Gerente', 'Supervisor');
END;
$;

-- Enable RLS for referenced tables
ALTER TABLE public.estoque ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saldo_estoque ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.config_global ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.perfil_acesso ENABLE ROW LEVEL SECURITY;

-- Drop generic policies to apply specific ones safely
DROP POLICY IF EXISTS "allow_all_authenticated" ON public.estoque;
DROP POLICY IF EXISTS "estoque_all" ON public.estoque;
DROP POLICY IF EXISTS "estoque_select" ON public.estoque;
DROP POLICY IF EXISTS "estoque_insert" ON public.estoque;
DROP POLICY IF EXISTS "estoque_update" ON public.estoque;
DROP POLICY IF EXISTS "estoque_delete" ON public.estoque;

CREATE POLICY "estoque_select" ON public.estoque FOR SELECT TO authenticated
USING (is_gestor() OR (equipe_id IN (SELECT get_user_teams())) OR equipe_id IS NULL);

CREATE POLICY "estoque_insert" ON public.estoque FOR INSERT TO authenticated
WITH CHECK (is_gestor() OR (equipe_id IN (SELECT get_user_teams())));

CREATE POLICY "estoque_update" ON public.estoque FOR UPDATE TO authenticated
USING (is_gestor() OR (equipe_id IN (SELECT get_user_teams())))
WITH CHECK (is_gestor() OR (equipe_id IN (SELECT get_user_teams())));

CREATE POLICY "estoque_delete" ON public.estoque FOR DELETE TO authenticated
USING (is_gestor());


DROP POLICY IF EXISTS "allow_all_authenticated" ON public.saldo_estoque;
DROP POLICY IF EXISTS "saldo_estoque_all" ON public.saldo_estoque;
DROP POLICY IF EXISTS "saldo_estoque_select" ON public.saldo_estoque;
DROP POLICY IF EXISTS "saldo_estoque_insert" ON public.saldo_estoque;
DROP POLICY IF EXISTS "saldo_estoque_update" ON public.saldo_estoque;
DROP POLICY IF EXISTS "saldo_estoque_delete" ON public.saldo_estoque;

CREATE POLICY "saldo_estoque_select" ON public.saldo_estoque FOR SELECT TO authenticated
USING (is_gestor() OR (equipe_id IN (SELECT get_user_teams())) OR equipe_id IS NULL);

CREATE POLICY "saldo_estoque_insert" ON public.saldo_estoque FOR INSERT TO authenticated
WITH CHECK (is_gestor() OR (equipe_id IN (SELECT get_user_teams())));

CREATE POLICY "saldo_estoque_update" ON public.saldo_estoque FOR UPDATE TO authenticated
USING (is_gestor() OR (equipe_id IN (SELECT get_user_teams())))
WITH CHECK (is_gestor() OR (equipe_id IN (SELECT get_user_teams())));

CREATE POLICY "saldo_estoque_delete" ON public.saldo_estoque FOR DELETE TO authenticated
USING (is_gestor());


DROP POLICY IF EXISTS "allow_all_authenticated" ON public.config_global;
DROP POLICY IF EXISTS "update_admin" ON public.config_global;
DROP POLICY IF EXISTS "delete_admin" ON public.config_global;
DROP POLICY IF EXISTS "insert_authenticated" ON public.config_global;
DROP POLICY IF EXISTS "select_all_authenticated" ON public.config_global;
DROP POLICY IF EXISTS "config_global_select" ON public.config_global;
DROP POLICY IF EXISTS "config_global_insert" ON public.config_global;
DROP POLICY IF EXISTS "config_global_update" ON public.config_global;
DROP POLICY IF EXISTS "config_global_delete" ON public.config_global;

CREATE POLICY "config_global_select" ON public.config_global FOR SELECT TO authenticated USING (true);
CREATE POLICY "config_global_insert" ON public.config_global FOR INSERT TO authenticated WITH CHECK (is_gestor());
CREATE POLICY "config_global_update" ON public.config_global FOR UPDATE TO authenticated USING (is_gestor()) WITH CHECK (is_gestor());
CREATE POLICY "config_global_delete" ON public.config_global FOR DELETE TO authenticated USING (is_gestor());


DROP POLICY IF EXISTS "allow_all_authenticated" ON public.perfil_acesso;
DROP POLICY IF EXISTS "update_admin" ON public.perfil_acesso;
DROP POLICY IF EXISTS "delete_admin" ON public.perfil_acesso;
DROP POLICY IF EXISTS "insert_authenticated" ON public.perfil_acesso;
DROP POLICY IF EXISTS "select_all_authenticated" ON public.perfil_acesso;
DROP POLICY IF EXISTS "perfil_acesso_select" ON public.perfil_acesso;
DROP POLICY IF EXISTS "perfil_acesso_insert" ON public.perfil_acesso;
DROP POLICY IF EXISTS "perfil_acesso_update" ON public.perfil_acesso;
DROP POLICY IF EXISTS "perfil_acesso_delete" ON public.perfil_acesso;

CREATE POLICY "perfil_acesso_select" ON public.perfil_acesso FOR SELECT TO authenticated USING (true);
CREATE POLICY "perfil_acesso_insert" ON public.perfil_acesso FOR INSERT TO authenticated WITH CHECK (is_gestor());
CREATE POLICY "perfil_acesso_update" ON public.perfil_acesso FOR UPDATE TO authenticated USING (is_gestor()) WITH CHECK (is_gestor());
CREATE POLICY "perfil_acesso_delete" ON public.perfil_acesso FOR DELETE TO authenticated USING (is_gestor());
