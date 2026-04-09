-- Creation of the new normalized schema requested
-- This migration prepares the database for the new relational structure

CREATE TABLE IF NOT EXISTS perfil_acesso (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL UNIQUE,
    descricao TEXT
);

CREATE TABLE IF NOT EXISTS equipe (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    descricao TEXT,
    localizacao TEXT
);

CREATE TABLE IF NOT EXISTS usuario (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    nome_completo TEXT NOT NULL,
    perfil_id UUID REFERENCES perfil_acesso(id),
    ativo BOOLEAN DEFAULT true,
    tema_preferido TEXT DEFAULT 'system'
);

CREATE TABLE IF NOT EXISTS usuario_equipe (
    usuario_id UUID REFERENCES usuario(id) ON DELETE CASCADE,
    equipe_id UUID REFERENCES equipe(id) ON DELETE CASCADE,
    PRIMARY KEY (usuario_id, equipe_id)
);

CREATE TABLE IF NOT EXISTS departamento (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS secao (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    departamento_id UUID REFERENCES departamento(id) ON DELETE CASCADE,
    nome TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS categoria (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    secao_id UUID REFERENCES secao(id) ON DELETE CASCADE,
    nome TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS item_mercadologico (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    categoria_id UUID REFERENCES categoria(id) ON DELETE CASCADE,
    nome TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS marca (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS produto (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID REFERENCES item_mercadologico(id),
    marca_id UUID REFERENCES marca(id),
    modelo TEXT,
    descricao TEXT,
    preco_base NUMERIC DEFAULT 0,
    is_lote BOOLEAN DEFAULT false
);

CREATE TABLE IF NOT EXISTS produto_imagem (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    produto_id UUID REFERENCES produto(id) ON DELETE CASCADE,
    url TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS estoque (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    produto_id UUID REFERENCES produto(id),
    equipe_id UUID REFERENCES equipe(id),
    numero_patrimonio TEXT UNIQUE,
    condicao TEXT DEFAULT 'good',
    status TEXT DEFAULT 'present'
);

CREATE TABLE IF NOT EXISTS saldo_estoque (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    produto_id UUID REFERENCES produto(id),
    equipe_id UUID REFERENCES equipe(id),
    quantidade INTEGER DEFAULT 0,
    UNIQUE(produto_id, equipe_id)
);

CREATE TABLE IF NOT EXISTS movimentacao_estoque (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    produto_id UUID REFERENCES produto(id),
    equipe_origem_id UUID REFERENCES equipe(id),
    equipe_destino_id UUID REFERENCES equipe(id),
    quantidade INTEGER NOT NULL,
    tipo TEXT NOT NULL,
    usuario_id UUID REFERENCES usuario(id),
    data_movimentacao TIMESTAMPTZ DEFAULT now(),
    observacao TEXT
);

CREATE TABLE IF NOT EXISTS transferencia (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    equipe_origem_id UUID REFERENCES equipe(id),
    equipe_destino_id UUID REFERENCES equipe(id),
    iniciada_por UUID REFERENCES usuario(id),
    data_inicio TIMESTAMPTZ DEFAULT now(),
    status TEXT DEFAULT 'pending',
    concluida_por UUID REFERENCES usuario(id),
    data_conclusao TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS transferencia_item (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transferencia_id UUID REFERENCES transferencia(id) ON DELETE CASCADE,
    estoque_id UUID REFERENCES estoque(id),
    quantidade INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS fornecedor (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    cnpj TEXT UNIQUE
);

CREATE TABLE IF NOT EXISTS saldo_fornecedor (
    fornecedor_id UUID PRIMARY KEY REFERENCES fornecedor(id) ON DELETE CASCADE,
    saldo_atual NUMERIC DEFAULT 0
);

CREATE TABLE IF NOT EXISTS historico_saldo_fornecedor (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fornecedor_id UUID REFERENCES fornecedor(id) ON DELETE CASCADE,
    valor NUMERIC NOT NULL,
    tipo TEXT NOT NULL,
    data_registro TIMESTAMPTZ DEFAULT now(),
    usuario_id UUID REFERENCES usuario(id)
);

CREATE TABLE IF NOT EXISTS tipo_reparo (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS reparo_item (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    estoque_id UUID REFERENCES estoque(id) ON DELETE CASCADE,
    fornecedor_id UUID REFERENCES fornecedor(id),
    tipo_reparo_id UUID REFERENCES tipo_reparo(id),
    data_envio TIMESTAMPTZ DEFAULT now(),
    previsao_retorno TIMESTAMPTZ,
    custo_estimado NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'enviado',
    descricao TEXT,
    usuario_id UUID REFERENCES usuario(id)
);

CREATE TABLE IF NOT EXISTS config_global (
    chave TEXT PRIMARY KEY,
    valor JSONB NOT NULL
);

CREATE TABLE IF NOT EXISTS historico_config_global (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chave TEXT NOT NULL,
    valor_antigo JSONB,
    valor_novo JSONB,
    data_alteracao TIMESTAMPTZ DEFAULT now(),
    usuario_id UUID REFERENCES usuario(id)
);

-- RLS Policies
-- To make it safe, enable RLS and add basic policies for all new tables

DO $$
DECLARE
    t text;
BEGIN
    FOR t IN 
        SELECT table_name FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN (
            'perfil_acesso', 'equipe', 'usuario', 'usuario_equipe', 'departamento', 'secao', 
            'categoria', 'item_mercadologico', 'marca', 'produto', 'produto_imagem', 'estoque', 
            'saldo_estoque', 'movimentacao_estoque', 'transferencia', 'transferencia_item', 
            'fornecedor', 'saldo_fornecedor', 'historico_saldo_fornecedor', 'tipo_reparo', 
            'reparo_item', 'config_global', 'historico_config_global'
        )
    LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', t);
        
        -- Drop if exists
        EXECUTE format('DROP POLICY IF EXISTS "allow_all_authenticated" ON public.%I;', t);
        
        -- Create policy
        EXECUTE format('CREATE POLICY "allow_all_authenticated" ON public.%I FOR ALL TO authenticated USING (true) WITH CHECK (true);', t);
    END LOOP;
END $$;
