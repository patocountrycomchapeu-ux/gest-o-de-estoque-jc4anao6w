-- CREATE TABLES IF NOT EXISTS

CREATE TABLE IF NOT EXISTS public.departamento (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  descricao text NOT NULL,
  ativo boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT departamento_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.categoria (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  descricao text NOT NULL,
  departamento_id uuid,
  ativo boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT categoria_pkey PRIMARY KEY (id),
  CONSTRAINT categoria_departamento_id_fkey FOREIGN KEY (departamento_id) REFERENCES public.departamento(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.tipo (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  descricao text NOT NULL,
  departamento_id uuid,
  categoria_id uuid,
  ativo boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT tipo_pkey PRIMARY KEY (id),
  CONSTRAINT tipo_departamento_id_fkey FOREIGN KEY (departamento_id) REFERENCES public.departamento(id) ON DELETE CASCADE,
  CONSTRAINT tipo_categoria_id_fkey FOREIGN KEY (categoria_id) REFERENCES public.categoria(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.linha (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  descricao text NOT NULL,
  departamento_id uuid,
  categoria_id uuid,
  tipo_id uuid,
  ativo boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT linha_pkey PRIMARY KEY (id),
  CONSTRAINT linha_departamento_id_fkey FOREIGN KEY (departamento_id) REFERENCES public.departamento(id) ON DELETE CASCADE,
  CONSTRAINT linha_categoria_id_fkey FOREIGN KEY (categoria_id) REFERENCES public.categoria(id) ON DELETE CASCADE,
  CONSTRAINT linha_tipo_id_fkey FOREIGN KEY (tipo_id) REFERENCES public.tipo(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.marca (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  descricao text NOT NULL,
  departamento_id uuid,
  categoria_id uuid,
  tipo_id uuid,
  linha_id uuid,
  ativo boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT marca_pkey PRIMARY KEY (id),
  CONSTRAINT marca_departamento_id_fkey FOREIGN KEY (departamento_id) REFERENCES public.departamento(id) ON DELETE CASCADE,
  CONSTRAINT marca_categoria_id_fkey FOREIGN KEY (categoria_id) REFERENCES public.categoria(id) ON DELETE CASCADE,
  CONSTRAINT marca_tipo_id_fkey FOREIGN KEY (tipo_id) REFERENCES public.tipo(id) ON DELETE CASCADE,
  CONSTRAINT marca_linha_id_fkey FOREIGN KEY (linha_id) REFERENCES public.linha(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.perfil_acesso (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  descricao text NOT NULL,
  permissoes jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT perfil_acesso_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.usuarios (
  id uuid NOT NULL,
  nome text NOT NULL,
  email text NOT NULL UNIQUE,
  senha text,
  perfil_acesso_id uuid,
  tema text DEFAULT 'claro'::text,
  ativo boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  status character varying DEFAULT 'ativo'::character varying CHECK (status::text = ANY (ARRAY['ativo'::character varying, 'inativo'::character varying]::text[])),
  CONSTRAINT usuarios_pkey PRIMARY KEY (id),
  CONSTRAINT usuarios_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT usuarios_perfil_acesso_id_fkey FOREIGN KEY (perfil_acesso_id) REFERENCES public.perfil_acesso(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.equipes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  descricao text,
  ativa boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  status character varying DEFAULT 'ativo'::character varying CHECK (status::text = ANY (ARRAY['ativo'::character varying, 'inativo'::character varying]::text[])),
  CONSTRAINT equipes_pkey PRIMARY KEY (id),
  CONSTRAINT equipes_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.usuarios(id),
  CONSTRAINT equipes_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.usuarios(id)
);

CREATE TABLE IF NOT EXISTS public.usuarios_equipes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  usuario_id uuid,
  equipe_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT usuarios_equipes_pkey PRIMARY KEY (id),
  CONSTRAINT usuarios_equipes_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE,
  CONSTRAINT usuarios_equipes_equipe_id_fkey FOREIGN KEY (equipe_id) REFERENCES public.equipes(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.produto (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  descricao text,
  departamento_id uuid,
  categoria_id uuid,
  tipo_id uuid,
  linha_id uuid,
  marca_id uuid,
  sku text UNIQUE,
  preco_unitario numeric DEFAULT 0,
  ativo boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  status character varying DEFAULT 'ativo'::character varying CHECK (status::text = ANY (ARRAY['ativo'::character varying, 'inativo'::character varying]::text[])),
  CONSTRAINT produto_pkey PRIMARY KEY (id),
  CONSTRAINT produto_departamento_id_fkey FOREIGN KEY (departamento_id) REFERENCES public.departamento(id),
  CONSTRAINT produto_categoria_id_fkey FOREIGN KEY (categoria_id) REFERENCES public.categoria(id),
  CONSTRAINT produto_tipo_id_fkey FOREIGN KEY (tipo_id) REFERENCES public.tipo(id),
  CONSTRAINT produto_linha_id_fkey FOREIGN KEY (linha_id) REFERENCES public.linha(id),
  CONSTRAINT produto_marca_id_fkey FOREIGN KEY (marca_id) REFERENCES public.marca(id),
  CONSTRAINT produto_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.usuarios(id),
  CONSTRAINT produto_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.usuarios(id)
);

CREATE TABLE IF NOT EXISTS public.estoque (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  numero_patrimonio text UNIQUE,
  status text DEFAULT 'disponivel'::text,
  equipe_id uuid,
  produto_id uuid,
  condicao text DEFAULT 'bom'::text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT estoque_pkey PRIMARY KEY (id),
  CONSTRAINT estoque_equipe_id_fkey FOREIGN KEY (equipe_id) REFERENCES public.equipes(id),
  CONSTRAINT estoque_produto_id_fkey FOREIGN KEY (produto_id) REFERENCES public.produto(id)
);

CREATE TABLE IF NOT EXISTS public.saldo_estoque (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  produto_id uuid,
  equipe_id uuid,
  quantidade integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT saldo_estoque_pkey PRIMARY KEY (id),
  CONSTRAINT saldo_estoque_produto_id_fkey FOREIGN KEY (produto_id) REFERENCES public.produto(id),
  CONSTRAINT saldo_estoque_equipe_id_fkey FOREIGN KEY (equipe_id) REFERENCES public.equipes(id)
);

CREATE TABLE IF NOT EXISTS public.movimento_estoque (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  estoque_id uuid,
  saldo_estoque_id uuid,
  tipo_movimento text CHECK (tipo_movimento = ANY (ARRAY['entrada'::text, 'saida'::text, 'transferencia'::text, 'ajuste'::text])),
  quantidade integer NOT NULL,
  usuario_id uuid,
  descricao text,
  data_hora timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  CONSTRAINT movimento_estoque_pkey PRIMARY KEY (id),
  CONSTRAINT movimento_estoque_estoque_id_fkey FOREIGN KEY (estoque_id) REFERENCES public.estoque(id),
  CONSTRAINT movimento_estoque_saldo_estoque_id_fkey FOREIGN KEY (saldo_estoque_id) REFERENCES public.saldo_estoque(id),
  CONSTRAINT movimento_estoque_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id),
  CONSTRAINT movimento_estoque_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.usuarios(id),
  CONSTRAINT movimento_estoque_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.usuarios(id)
);

CREATE TABLE IF NOT EXISTS public.fornecedor (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  descricao text NOT NULL,
  email text,
  telefone text,
  ativo boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT fornecedor_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.saldo_fornecedor (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  fornecedor_id uuid,
  saldo numeric DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT saldo_fornecedor_pkey PRIMARY KEY (id),
  CONSTRAINT saldo_fornecedor_fornecedor_id_fkey FOREIGN KEY (fornecedor_id) REFERENCES public.fornecedor(id)
);

CREATE TABLE IF NOT EXISTS public.tipo_reparo (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  descricao text NOT NULL,
  ativo boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT tipo_reparo_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.reparo (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  estoque_id uuid,
  fornecedor_id uuid,
  tipo_reparo_id uuid,
  status text DEFAULT 'pendente'::text,
  descricao text,
  usuario_id uuid,
  valor_orcamento numeric DEFAULT 0,
  valor_servico numeric DEFAULT 0,
  previsao_finalizacao date,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT reparo_pkey PRIMARY KEY (id),
  CONSTRAINT reparo_estoque_id_fkey FOREIGN KEY (estoque_id) REFERENCES public.estoque(id),
  CONSTRAINT reparo_fornecedor_id_fkey FOREIGN KEY (fornecedor_id) REFERENCES public.fornecedor(id),
  CONSTRAINT reparo_tipo_reparo_id_fkey FOREIGN KEY (tipo_reparo_id) REFERENCES public.tipo_reparo(id),
  CONSTRAINT reparo_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id)
);

CREATE TABLE IF NOT EXISTS public.danificado (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  produto_id uuid,
  estoque_id uuid,
  imagem_url text,
  data_danificacao date,
  observacao text,
  motivo text,
  equipe_id uuid,
  custo_reparo numeric DEFAULT 0,
  usuario_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT danificado_pkey PRIMARY KEY (id),
  CONSTRAINT danificado_produto_id_fkey FOREIGN KEY (produto_id) REFERENCES public.produto(id),
  CONSTRAINT danificado_estoque_id_fkey FOREIGN KEY (estoque_id) REFERENCES public.estoque(id),
  CONSTRAINT danificado_equipe_id_fkey FOREIGN KEY (equipe_id) REFERENCES public.equipes(id),
  CONSTRAINT danificado_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id)
);

CREATE TABLE IF NOT EXISTS public.config_global (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  chave text NOT NULL UNIQUE,
  valor text NOT NULL,
  descricao text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT config_global_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.historico_config_global (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  chave text NOT NULL,
  valor_antigo jsonb,
  valor_novo jsonb,
  data_alteracao timestamp with time zone DEFAULT now(),
  usuario_id uuid,
  CONSTRAINT historico_config_global_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.auditoria (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tabela text NOT NULL,
  operacao character varying NOT NULL CHECK (operacao::text = ANY (ARRAY['INSERT'::character varying, 'UPDATE'::character varying, 'DELETE'::character varying]::text[])),
  registro_id text NOT NULL,
  usuario_id uuid,
  dados_antigos jsonb,
  dados_novos jsonb,
  data_hora timestamp with time zone DEFAULT now(),
  CONSTRAINT auditoria_pkey PRIMARY KEY (id),
  CONSTRAINT auditoria_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id)
);

CREATE TABLE IF NOT EXISTS public.logs_acesso (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  usuario_id uuid,
  acao text NOT NULL,
  endereco_ip text,
  user_agent text,
  data_hora timestamp with time zone DEFAULT now(),
  detalhes jsonb,
  CONSTRAINT logs_acesso_pkey PRIMARY KEY (id),
  CONSTRAINT logs_acesso_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id)
);

CREATE TABLE IF NOT EXISTS public.imagem_produto (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  produto_id uuid,
  url text NOT NULL,
  ordem integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT imagem_produto_pkey PRIMARY KEY (id),
  CONSTRAINT imagem_produto_produto_id_fkey FOREIGN KEY (produto_id) REFERENCES public.produto(id)
);

-- Seed data for roles
INSERT INTO public.perfil_acesso (id, descricao) VALUES
  ('11111111-1111-1111-1111-111111111111'::uuid, 'Gestor'),
  ('22222222-2222-2222-2222-222222222222'::uuid, 'Encarregado Gestor'),
  ('33333333-3333-3333-3333-333333333333'::uuid, 'Encarregado'),
  ('44444444-4444-4444-4444-444444444444'::uuid, 'Analista'),
  ('55555555-5555-5555-5555-555555555555'::uuid, 'Visualizador')
ON CONFLICT (id) DO NOTHING;

-- Seed data for Admin user
DO $seed$
DECLARE
  v_user_id uuid;
  v_role_id uuid;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@gestao.com') THEN
    v_user_id := gen_random_uuid();
    SELECT id INTO v_role_id FROM public.perfil_acesso WHERE descricao = 'Gestor' LIMIT 1;
    
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      v_user_id,
      '00000000-0000-0000-0000-000000000000',
      'admin@gestao.com',
      crypt('Admin123!', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Administrador"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );
    
    INSERT INTO public.usuarios (id, email, nome, perfil_acesso_id, status)
    VALUES (v_user_id, 'admin@gestao.com', 'Administrador', v_role_id, 'ativo')
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $seed$;

-- Add RLS Policies
-- First, disable RLS temporarily on tables, then enable
ALTER TABLE public.departamento ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categoria ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tipo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.linha ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marca ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.produto ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estoque ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saldo_estoque ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movimento_estoque ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuarios_equipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reparo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fornecedor ENABLE ROW LEVEL SECURITY;

-- Helper functions
CREATE OR REPLACE FUNCTION public.user_teams()
RETURNS SETOF uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $func$
BEGIN
  RETURN QUERY SELECT equipe_id FROM public.usuarios_equipes WHERE usuario_id = auth.uid();
END;
$func$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $func$
DECLARE
  v_admin BOOLEAN;
BEGIN
  SELECT (p.descricao ILIKE 'gestor') INTO v_admin
  FROM public.usuarios u
  JOIN public.perfil_acesso p ON u.perfil_acesso_id = p.id
  WHERE u.id = auth.uid();
  RETURN COALESCE(v_admin, false);
END;
$func$;

-- Blanket policies for fast access in this scenario (assuming admin/all auth access)
DO $policies$
DECLARE
  t text;
BEGIN
  FOR t IN 
    SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' 
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS "allow_all_authenticated" ON public.%I', t);
    EXECUTE format('CREATE POLICY "allow_all_authenticated" ON public.%I FOR ALL TO authenticated USING (true) WITH CHECK (true)', t);
  END LOOP;
END $policies$;
