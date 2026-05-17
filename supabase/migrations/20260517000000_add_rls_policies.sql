-- Enable RLS on all tables
ALTER TABLE public.auditoria ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categoria ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.config_global ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.danificado ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departamento ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estoque ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fornecedor ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historico_config_global ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.imagem_produto ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.linha ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logs_acesso ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marca ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movimento_estoque ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.perfil_acesso ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.produto ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reparo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saldo_estoque ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saldo_fornecedor ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tipo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tipo_reparo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuarios_equipes ENABLE ROW LEVEL SECURITY;

-- Helper Function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_gestor() RETURNS BOOLEAN AS $$
DECLARE
  v_admin BOOLEAN;
BEGIN
  SELECT (p.descricao ILIKE 'gestor') INTO v_admin
  FROM public.usuarios u
  JOIN public.perfil_acesso p ON u.perfil_acesso_id = p.id
  WHERE u.id = auth.uid();
  RETURN COALESCE(v_admin, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper Function to get user's teams
CREATE OR REPLACE FUNCTION public.get_user_teams() RETURNS SETOF uuid AS $$
BEGIN
  RETURN QUERY SELECT equipe_id FROM public.usuarios_equipes WHERE usuario_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Policies for EQUIPES
DROP POLICY IF EXISTS "equipes_select" ON public.equipes;
CREATE POLICY "equipes_select" ON public.equipes
  FOR SELECT TO authenticated
  USING (public.is_gestor() OR id IN (SELECT public.get_user_teams()));

DROP POLICY IF EXISTS "equipes_insert" ON public.equipes;
CREATE POLICY "equipes_insert" ON public.equipes
  FOR INSERT TO authenticated
  WITH CHECK (public.is_gestor());

DROP POLICY IF EXISTS "equipes_update" ON public.equipes;
CREATE POLICY "equipes_update" ON public.equipes
  FOR UPDATE TO authenticated
  USING (public.is_gestor())
  WITH CHECK (public.is_gestor());

DROP POLICY IF EXISTS "equipes_delete" ON public.equipes;
CREATE POLICY "equipes_delete" ON public.equipes
  FOR DELETE TO authenticated
  USING (public.is_gestor());

-- Policies for USUARIOS
DROP POLICY IF EXISTS "usuarios_select" ON public.usuarios;
CREATE POLICY "usuarios_select" ON public.usuarios
  FOR SELECT TO authenticated
  USING (true); -- Everyone can see users for assignment

DROP POLICY IF EXISTS "usuarios_update" ON public.usuarios;
CREATE POLICY "usuarios_update" ON public.usuarios
  FOR UPDATE TO authenticated
  USING (public.is_gestor() OR id = auth.uid());

-- Policies for ESTOQUE
DROP POLICY IF EXISTS "estoque_select" ON public.estoque;
CREATE POLICY "estoque_select" ON public.estoque
  FOR SELECT TO authenticated
  USING (public.is_gestor() OR equipe_id IN (SELECT public.get_user_teams()) OR equipe_id IS NULL);

DROP POLICY IF EXISTS "estoque_all" ON public.estoque;
CREATE POLICY "estoque_all" ON public.estoque
  FOR ALL TO authenticated
  USING (public.is_gestor() OR equipe_id IN (SELECT public.get_user_teams()))
  WITH CHECK (public.is_gestor() OR equipe_id IN (SELECT public.get_user_teams()));

-- Policies for SALDO_ESTOQUE
DROP POLICY IF EXISTS "saldo_estoque_select" ON public.saldo_estoque;
CREATE POLICY "saldo_estoque_select" ON public.saldo_estoque
  FOR SELECT TO authenticated
  USING (public.is_gestor() OR equipe_id IN (SELECT public.get_user_teams()) OR equipe_id IS NULL);

DROP POLICY IF EXISTS "saldo_estoque_all" ON public.saldo_estoque;
CREATE POLICY "saldo_estoque_all" ON public.saldo_estoque
  FOR ALL TO authenticated
  USING (public.is_gestor() OR equipe_id IN (SELECT public.get_user_teams()))
  WITH CHECK (public.is_gestor() OR equipe_id IN (SELECT public.get_user_teams()));

-- Policies for MOVIMENTO_ESTOQUE
DROP POLICY IF EXISTS "movimento_estoque_select" ON public.movimento_estoque;
CREATE POLICY "movimento_estoque_select" ON public.movimento_estoque
  FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "movimento_estoque_insert" ON public.movimento_estoque;
CREATE POLICY "movimento_estoque_insert" ON public.movimento_estoque
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- Allow reading tree nodes for everyone
DROP POLICY IF EXISTS "tree_select_departamento" ON public.departamento;
CREATE POLICY "tree_select_departamento" ON public.departamento FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "tree_all_departamento" ON public.departamento;
CREATE POLICY "tree_all_departamento" ON public.departamento FOR ALL TO authenticated USING (public.is_gestor()) WITH CHECK (public.is_gestor());

DROP POLICY IF EXISTS "tree_select_categoria" ON public.categoria;
CREATE POLICY "tree_select_categoria" ON public.categoria FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "tree_all_categoria" ON public.categoria;
CREATE POLICY "tree_all_categoria" ON public.categoria FOR ALL TO authenticated USING (public.is_gestor()) WITH CHECK (public.is_gestor());

DROP POLICY IF EXISTS "tree_select_tipo" ON public.tipo;
CREATE POLICY "tree_select_tipo" ON public.tipo FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "tree_all_tipo" ON public.tipo;
CREATE POLICY "tree_all_tipo" ON public.tipo FOR ALL TO authenticated USING (public.is_gestor()) WITH CHECK (public.is_gestor());

DROP POLICY IF EXISTS "tree_select_linha" ON public.linha;
CREATE POLICY "tree_select_linha" ON public.linha FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "tree_all_linha" ON public.linha;
CREATE POLICY "tree_all_linha" ON public.linha FOR ALL TO authenticated USING (public.is_gestor()) WITH CHECK (public.is_gestor());

DROP POLICY IF EXISTS "tree_select_marca" ON public.marca;
CREATE POLICY "tree_select_marca" ON public.marca FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "tree_all_marca" ON public.marca;
CREATE POLICY "tree_all_marca" ON public.marca FOR ALL TO authenticated USING (public.is_gestor()) WITH CHECK (public.is_gestor());

DROP POLICY IF EXISTS "tree_select_produto" ON public.produto;
CREATE POLICY "tree_select_produto" ON public.produto FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "tree_all_produto" ON public.produto;
CREATE POLICY "tree_all_produto" ON public.produto FOR ALL TO authenticated USING (public.is_gestor()) WITH CHECK (public.is_gestor());

-- USUARIOS_EQUIPES
DROP POLICY IF EXISTS "usuarios_equipes_select" ON public.usuarios_equipes;
CREATE POLICY "usuarios_equipes_select" ON public.usuarios_equipes
  FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "usuarios_equipes_all" ON public.usuarios_equipes;
CREATE POLICY "usuarios_equipes_all" ON public.usuarios_equipes
  FOR ALL TO authenticated
  USING (public.is_gestor())
  WITH CHECK (public.is_gestor());
