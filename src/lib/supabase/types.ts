// AVOID UPDATING THIS FILE DIRECTLY. It is automatically generated.
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '14.4'
  }
  public: {
    Tables: {
      auditoria: {
        Row: {
          dados_antigos: Json | null
          dados_novos: Json | null
          data_hora: string | null
          id: string
          operacao: string
          registro_id: string
          tabela: string
          usuario_id: string | null
        }
        Insert: {
          dados_antigos?: Json | null
          dados_novos?: Json | null
          data_hora?: string | null
          id?: string
          operacao: string
          registro_id: string
          tabela: string
          usuario_id?: string | null
        }
        Update: {
          dados_antigos?: Json | null
          dados_novos?: Json | null
          data_hora?: string | null
          id?: string
          operacao?: string
          registro_id?: string
          tabela?: string
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'auditoria_usuario_id_fkey'
            columns: ['usuario_id']
            isOneToOne: false
            referencedRelation: 'usuarios'
            referencedColumns: ['id']
          },
        ]
      }
      categoria: {
        Row: {
          ativo: boolean | null
          created_at: string
          departamento_id: string | null
          descricao: string
          id: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string
          departamento_id?: string | null
          descricao: string
          id?: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean | null
          created_at?: string
          departamento_id?: string | null
          descricao?: string
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'categoria_departamento_id_fkey'
            columns: ['departamento_id']
            isOneToOne: false
            referencedRelation: 'departamento'
            referencedColumns: ['id']
          },
        ]
      }
      config_global: {
        Row: {
          chave: string
          created_at: string
          descricao: string | null
          id: string
          updated_at: string
          valor: string
        }
        Insert: {
          chave: string
          created_at?: string
          descricao?: string | null
          id?: string
          updated_at?: string
          valor: string
        }
        Update: {
          chave?: string
          created_at?: string
          descricao?: string | null
          id?: string
          updated_at?: string
          valor?: string
        }
        Relationships: []
      }
      danificado: {
        Row: {
          created_at: string
          custo_reparo: number | null
          data_danificacao: string | null
          equipe_id: string | null
          estoque_id: string | null
          id: string
          imagem_url: string | null
          motivo: string | null
          observacao: string | null
          produto_id: string | null
          usuario_id: string | null
        }
        Insert: {
          created_at?: string
          custo_reparo?: number | null
          data_danificacao?: string | null
          equipe_id?: string | null
          estoque_id?: string | null
          id?: string
          imagem_url?: string | null
          motivo?: string | null
          observacao?: string | null
          produto_id?: string | null
          usuario_id?: string | null
        }
        Update: {
          created_at?: string
          custo_reparo?: number | null
          data_danificacao?: string | null
          equipe_id?: string | null
          estoque_id?: string | null
          id?: string
          imagem_url?: string | null
          motivo?: string | null
          observacao?: string | null
          produto_id?: string | null
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'danificado_equipe_id_fkey'
            columns: ['equipe_id']
            isOneToOne: false
            referencedRelation: 'equipes'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'danificado_estoque_id_fkey'
            columns: ['estoque_id']
            isOneToOne: false
            referencedRelation: 'estoque'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'danificado_produto_id_fkey'
            columns: ['produto_id']
            isOneToOne: false
            referencedRelation: 'produto'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'danificado_usuario_id_fkey'
            columns: ['usuario_id']
            isOneToOne: false
            referencedRelation: 'usuarios'
            referencedColumns: ['id']
          },
        ]
      }
      departamento: {
        Row: {
          ativo: boolean | null
          created_at: string
          descricao: string
          id: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string
          descricao: string
          id?: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean | null
          created_at?: string
          descricao?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      equipes: {
        Row: {
          ativa: boolean | null
          created_at: string
          created_by: string | null
          descricao: string | null
          id: string
          nome: string
          status: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          ativa?: boolean | null
          created_at?: string
          created_by?: string | null
          descricao?: string | null
          id?: string
          nome: string
          status?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          ativa?: boolean | null
          created_at?: string
          created_by?: string | null
          descricao?: string | null
          id?: string
          nome?: string
          status?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'equipes_created_by_fkey'
            columns: ['created_by']
            isOneToOne: false
            referencedRelation: 'usuarios'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'equipes_updated_by_fkey'
            columns: ['updated_by']
            isOneToOne: false
            referencedRelation: 'usuarios'
            referencedColumns: ['id']
          },
        ]
      }
      estoque: {
        Row: {
          condicao: string | null
          created_at: string
          equipe_id: string | null
          id: string
          numero_patrimonio: string | null
          produto_id: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          condicao?: string | null
          created_at?: string
          equipe_id?: string | null
          id?: string
          numero_patrimonio?: string | null
          produto_id?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          condicao?: string | null
          created_at?: string
          equipe_id?: string | null
          id?: string
          numero_patrimonio?: string | null
          produto_id?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'estoque_equipe_id_fkey'
            columns: ['equipe_id']
            isOneToOne: false
            referencedRelation: 'equipes'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'estoque_produto_id_fkey'
            columns: ['produto_id']
            isOneToOne: false
            referencedRelation: 'produto'
            referencedColumns: ['id']
          },
        ]
      }
      fornecedor: {
        Row: {
          ativo: boolean | null
          created_at: string
          descricao: string
          email: string | null
          id: string
          telefone: string | null
          updated_at: string
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string
          descricao: string
          email?: string | null
          id?: string
          telefone?: string | null
          updated_at?: string
        }
        Update: {
          ativo?: boolean | null
          created_at?: string
          descricao?: string
          email?: string | null
          id?: string
          telefone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      historico_config_global: {
        Row: {
          chave: string
          data_alteracao: string | null
          id: string
          usuario_id: string | null
          valor_antigo: Json | null
          valor_novo: Json | null
        }
        Insert: {
          chave: string
          data_alteracao?: string | null
          id?: string
          usuario_id?: string | null
          valor_antigo?: Json | null
          valor_novo?: Json | null
        }
        Update: {
          chave?: string
          data_alteracao?: string | null
          id?: string
          usuario_id?: string | null
          valor_antigo?: Json | null
          valor_novo?: Json | null
        }
        Relationships: []
      }
      imagem_produto: {
        Row: {
          created_at: string
          id: string
          ordem: number | null
          produto_id: string | null
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          ordem?: number | null
          produto_id?: string | null
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          ordem?: number | null
          produto_id?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: 'imagem_produto_produto_id_fkey'
            columns: ['produto_id']
            isOneToOne: false
            referencedRelation: 'produto'
            referencedColumns: ['id']
          },
        ]
      }
      linha: {
        Row: {
          ativo: boolean | null
          categoria_id: string | null
          created_at: string
          departamento_id: string | null
          descricao: string
          id: string
          tipo_id: string | null
          updated_at: string
        }
        Insert: {
          ativo?: boolean | null
          categoria_id?: string | null
          created_at?: string
          departamento_id?: string | null
          descricao: string
          id?: string
          tipo_id?: string | null
          updated_at?: string
        }
        Update: {
          ativo?: boolean | null
          categoria_id?: string | null
          created_at?: string
          departamento_id?: string | null
          descricao?: string
          id?: string
          tipo_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'linha_categoria_id_fkey'
            columns: ['categoria_id']
            isOneToOne: false
            referencedRelation: 'categoria'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'linha_departamento_id_fkey'
            columns: ['departamento_id']
            isOneToOne: false
            referencedRelation: 'departamento'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'linha_tipo_id_fkey'
            columns: ['tipo_id']
            isOneToOne: false
            referencedRelation: 'tipo'
            referencedColumns: ['id']
          },
        ]
      }
      logs_acesso: {
        Row: {
          acao: string
          data_hora: string | null
          detalhes: Json | null
          endereco_ip: string | null
          id: string
          user_agent: string | null
          usuario_id: string | null
        }
        Insert: {
          acao: string
          data_hora?: string | null
          detalhes?: Json | null
          endereco_ip?: string | null
          id?: string
          user_agent?: string | null
          usuario_id?: string | null
        }
        Update: {
          acao?: string
          data_hora?: string | null
          detalhes?: Json | null
          endereco_ip?: string | null
          id?: string
          user_agent?: string | null
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'logs_acesso_usuario_id_fkey'
            columns: ['usuario_id']
            isOneToOne: false
            referencedRelation: 'usuarios'
            referencedColumns: ['id']
          },
        ]
      }
      marca: {
        Row: {
          ativo: boolean | null
          categoria_id: string | null
          created_at: string
          departamento_id: string | null
          descricao: string
          id: string
          linha_id: string | null
          tipo_id: string | null
          updated_at: string
        }
        Insert: {
          ativo?: boolean | null
          categoria_id?: string | null
          created_at?: string
          departamento_id?: string | null
          descricao: string
          id?: string
          linha_id?: string | null
          tipo_id?: string | null
          updated_at?: string
        }
        Update: {
          ativo?: boolean | null
          categoria_id?: string | null
          created_at?: string
          departamento_id?: string | null
          descricao?: string
          id?: string
          linha_id?: string | null
          tipo_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'marca_categoria_id_fkey'
            columns: ['categoria_id']
            isOneToOne: false
            referencedRelation: 'categoria'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'marca_departamento_id_fkey'
            columns: ['departamento_id']
            isOneToOne: false
            referencedRelation: 'departamento'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'marca_linha_id_fkey'
            columns: ['linha_id']
            isOneToOne: false
            referencedRelation: 'linha'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'marca_tipo_id_fkey'
            columns: ['tipo_id']
            isOneToOne: false
            referencedRelation: 'tipo'
            referencedColumns: ['id']
          },
        ]
      }
      movimento_estoque: {
        Row: {
          created_at: string
          created_by: string | null
          data_hora: string | null
          descricao: string | null
          estoque_id: string | null
          id: string
          quantidade: number
          saldo_estoque_id: string | null
          tipo_movimento: string | null
          updated_by: string | null
          usuario_id: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          data_hora?: string | null
          descricao?: string | null
          estoque_id?: string | null
          id?: string
          quantidade: number
          saldo_estoque_id?: string | null
          tipo_movimento?: string | null
          updated_by?: string | null
          usuario_id?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          data_hora?: string | null
          descricao?: string | null
          estoque_id?: string | null
          id?: string
          quantidade?: number
          saldo_estoque_id?: string | null
          tipo_movimento?: string | null
          updated_by?: string | null
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'movimento_estoque_created_by_fkey'
            columns: ['created_by']
            isOneToOne: false
            referencedRelation: 'usuarios'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'movimento_estoque_estoque_id_fkey'
            columns: ['estoque_id']
            isOneToOne: false
            referencedRelation: 'estoque'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'movimento_estoque_saldo_estoque_id_fkey'
            columns: ['saldo_estoque_id']
            isOneToOne: false
            referencedRelation: 'saldo_estoque'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'movimento_estoque_updated_by_fkey'
            columns: ['updated_by']
            isOneToOne: false
            referencedRelation: 'usuarios'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'movimento_estoque_usuario_id_fkey'
            columns: ['usuario_id']
            isOneToOne: false
            referencedRelation: 'usuarios'
            referencedColumns: ['id']
          },
        ]
      }
      perfil_acesso: {
        Row: {
          created_at: string
          descricao: string
          id: string
          permissoes: Json | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          descricao: string
          id?: string
          permissoes?: Json | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          descricao?: string
          id?: string
          permissoes?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      produto: {
        Row: {
          ativo: boolean | null
          categoria_id: string | null
          created_at: string
          created_by: string | null
          departamento_id: string | null
          descricao: string | null
          id: string
          linha_id: string | null
          marca_id: string | null
          nome: string
          preco_unitario: number | null
          sku: string | null
          status: string | null
          tipo_id: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          ativo?: boolean | null
          categoria_id?: string | null
          created_at?: string
          created_by?: string | null
          departamento_id?: string | null
          descricao?: string | null
          id?: string
          linha_id?: string | null
          marca_id?: string | null
          nome: string
          preco_unitario?: number | null
          sku?: string | null
          status?: string | null
          tipo_id?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          ativo?: boolean | null
          categoria_id?: string | null
          created_at?: string
          created_by?: string | null
          departamento_id?: string | null
          descricao?: string | null
          id?: string
          linha_id?: string | null
          marca_id?: string | null
          nome?: string
          preco_unitario?: number | null
          sku?: string | null
          status?: string | null
          tipo_id?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'produto_categoria_id_fkey'
            columns: ['categoria_id']
            isOneToOne: false
            referencedRelation: 'categoria'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'produto_created_by_fkey'
            columns: ['created_by']
            isOneToOne: false
            referencedRelation: 'usuarios'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'produto_departamento_id_fkey'
            columns: ['departamento_id']
            isOneToOne: false
            referencedRelation: 'departamento'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'produto_linha_id_fkey'
            columns: ['linha_id']
            isOneToOne: false
            referencedRelation: 'linha'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'produto_marca_id_fkey'
            columns: ['marca_id']
            isOneToOne: false
            referencedRelation: 'marca'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'produto_tipo_id_fkey'
            columns: ['tipo_id']
            isOneToOne: false
            referencedRelation: 'tipo'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'produto_updated_by_fkey'
            columns: ['updated_by']
            isOneToOne: false
            referencedRelation: 'usuarios'
            referencedColumns: ['id']
          },
        ]
      }
      reparo: {
        Row: {
          created_at: string
          descricao: string | null
          estoque_id: string | null
          fornecedor_id: string | null
          id: string
          previsao_finalizacao: string | null
          status: string | null
          tipo_reparo_id: string | null
          updated_at: string
          usuario_id: string | null
          valor_orcamento: number | null
          valor_servico: number | null
        }
        Insert: {
          created_at?: string
          descricao?: string | null
          estoque_id?: string | null
          fornecedor_id?: string | null
          id?: string
          previsao_finalizacao?: string | null
          status?: string | null
          tipo_reparo_id?: string | null
          updated_at?: string
          usuario_id?: string | null
          valor_orcamento?: number | null
          valor_servico?: number | null
        }
        Update: {
          created_at?: string
          descricao?: string | null
          estoque_id?: string | null
          fornecedor_id?: string | null
          id?: string
          previsao_finalizacao?: string | null
          status?: string | null
          tipo_reparo_id?: string | null
          updated_at?: string
          usuario_id?: string | null
          valor_orcamento?: number | null
          valor_servico?: number | null
        }
        Relationships: [
          {
            foreignKeyName: 'reparo_estoque_id_fkey'
            columns: ['estoque_id']
            isOneToOne: false
            referencedRelation: 'estoque'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'reparo_fornecedor_id_fkey'
            columns: ['fornecedor_id']
            isOneToOne: false
            referencedRelation: 'fornecedor'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'reparo_tipo_reparo_id_fkey'
            columns: ['tipo_reparo_id']
            isOneToOne: false
            referencedRelation: 'tipo_reparo'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'reparo_usuario_id_fkey'
            columns: ['usuario_id']
            isOneToOne: false
            referencedRelation: 'usuarios'
            referencedColumns: ['id']
          },
        ]
      }
      saldo_estoque: {
        Row: {
          created_at: string
          equipe_id: string | null
          id: string
          produto_id: string | null
          quantidade: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          equipe_id?: string | null
          id?: string
          produto_id?: string | null
          quantidade?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          equipe_id?: string | null
          id?: string
          produto_id?: string | null
          quantidade?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'saldo_estoque_equipe_id_fkey'
            columns: ['equipe_id']
            isOneToOne: false
            referencedRelation: 'equipes'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'saldo_estoque_produto_id_fkey'
            columns: ['produto_id']
            isOneToOne: false
            referencedRelation: 'produto'
            referencedColumns: ['id']
          },
        ]
      }
      saldo_fornecedor: {
        Row: {
          created_at: string
          fornecedor_id: string | null
          id: string
          saldo: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          fornecedor_id?: string | null
          id?: string
          saldo?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          fornecedor_id?: string | null
          id?: string
          saldo?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'saldo_fornecedor_fornecedor_id_fkey'
            columns: ['fornecedor_id']
            isOneToOne: false
            referencedRelation: 'fornecedor'
            referencedColumns: ['id']
          },
        ]
      }
      tipo: {
        Row: {
          ativo: boolean | null
          categoria_id: string | null
          created_at: string
          departamento_id: string | null
          descricao: string
          id: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean | null
          categoria_id?: string | null
          created_at?: string
          departamento_id?: string | null
          descricao: string
          id?: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean | null
          categoria_id?: string | null
          created_at?: string
          departamento_id?: string | null
          descricao?: string
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'tipo_categoria_id_fkey'
            columns: ['categoria_id']
            isOneToOne: false
            referencedRelation: 'categoria'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'tipo_departamento_id_fkey'
            columns: ['departamento_id']
            isOneToOne: false
            referencedRelation: 'departamento'
            referencedColumns: ['id']
          },
        ]
      }
      tipo_reparo: {
        Row: {
          ativo: boolean | null
          created_at: string
          descricao: string
          id: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string
          descricao: string
          id?: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean | null
          created_at?: string
          descricao?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      usuarios: {
        Row: {
          ativo: boolean | null
          created_at: string
          created_by: string | null
          email: string
          id: string
          nome: string
          perfil_acesso_id: string | null
          senha: string | null
          status: string | null
          tema: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string
          created_by?: string | null
          email: string
          id: string
          nome: string
          perfil_acesso_id?: string | null
          senha?: string | null
          status?: string | null
          tema?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          ativo?: boolean | null
          created_at?: string
          created_by?: string | null
          email?: string
          id?: string
          nome?: string
          perfil_acesso_id?: string | null
          senha?: string | null
          status?: string | null
          tema?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'usuarios_created_by_fkey'
            columns: ['created_by']
            isOneToOne: false
            referencedRelation: 'usuarios'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'usuarios_perfil_acesso_id_fkey'
            columns: ['perfil_acesso_id']
            isOneToOne: false
            referencedRelation: 'perfil_acesso'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'usuarios_updated_by_fkey'
            columns: ['updated_by']
            isOneToOne: false
            referencedRelation: 'usuarios'
            referencedColumns: ['id']
          },
        ]
      }
      usuarios_equipes: {
        Row: {
          created_at: string
          equipe_id: string | null
          id: string
          usuario_id: string | null
        }
        Insert: {
          created_at?: string
          equipe_id?: string | null
          id?: string
          usuario_id?: string | null
        }
        Update: {
          created_at?: string
          equipe_id?: string | null
          id?: string
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'usuarios_equipes_equipe_id_fkey'
            columns: ['equipe_id']
            isOneToOne: false
            referencedRelation: 'equipes'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'usuarios_equipes_usuario_id_fkey'
            columns: ['usuario_id']
            isOneToOne: false
            referencedRelation: 'usuarios'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_write: { Args: never; Returns: boolean }
      get_user_teams: { Args: never; Returns: string[] }
      is_admin: { Args: never; Returns: boolean }
      is_gestor: { Args: never; Returns: boolean }
      user_teams: { Args: never; Returns: string[] }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

// ====== DATABASE EXTENDED CONTEXT (auto-generated) ======
// This section contains actual PostgreSQL column types, constraints, RLS policies,
// functions, triggers, indexes and materialized views not present in the type definitions above.
// IMPORTANT: The TypeScript types above map UUID, TEXT, VARCHAR all to "string".
// Use the COLUMN TYPES section below to know the real PostgreSQL type for each column.
// Always use the correct PostgreSQL type when writing SQL migrations.

// --- COLUMN TYPES (actual PostgreSQL types) ---
// Use this to know the real database type when writing migrations.
// "string" in TypeScript types above may be uuid, text, varchar, timestamptz, etc.
// Table: auditoria
//   id: uuid (not null, default: gen_random_uuid())
//   tabela: text (not null)
//   operacao: character varying (not null)
//   registro_id: text (not null)
//   usuario_id: uuid (nullable)
//   dados_antigos: jsonb (nullable)
//   dados_novos: jsonb (nullable)
//   data_hora: timestamp with time zone (nullable, default: now())
// Table: categoria
//   id: uuid (not null, default: gen_random_uuid())
//   descricao: text (not null)
//   departamento_id: uuid (nullable)
//   ativo: boolean (nullable, default: true)
//   created_at: timestamp with time zone (not null, default: now())
//   updated_at: timestamp with time zone (not null, default: now())
// Table: config_global
//   id: uuid (not null, default: gen_random_uuid())
//   chave: text (not null)
//   valor: text (not null)
//   descricao: text (nullable)
//   created_at: timestamp with time zone (not null, default: now())
//   updated_at: timestamp with time zone (not null, default: now())
// Table: danificado
//   id: uuid (not null, default: gen_random_uuid())
//   produto_id: uuid (nullable)
//   estoque_id: uuid (nullable)
//   imagem_url: text (nullable)
//   data_danificacao: date (nullable)
//   observacao: text (nullable)
//   motivo: text (nullable)
//   equipe_id: uuid (nullable)
//   custo_reparo: numeric (nullable, default: 0)
//   usuario_id: uuid (nullable)
//   created_at: timestamp with time zone (not null, default: now())
// Table: departamento
//   id: uuid (not null, default: gen_random_uuid())
//   descricao: text (not null)
//   ativo: boolean (nullable, default: true)
//   created_at: timestamp with time zone (not null, default: now())
//   updated_at: timestamp with time zone (not null, default: now())
// Table: equipes
//   id: uuid (not null, default: gen_random_uuid())
//   nome: text (not null)
//   descricao: text (nullable)
//   ativa: boolean (nullable, default: true)
//   created_at: timestamp with time zone (not null, default: now())
//   updated_at: timestamp with time zone (not null, default: now())
//   created_by: uuid (nullable)
//   updated_by: uuid (nullable)
//   status: character varying (nullable, default: 'ativo'::character varying)
// Table: estoque
//   id: uuid (not null, default: gen_random_uuid())
//   numero_patrimonio: text (nullable)
//   status: text (nullable, default: 'disponivel'::text)
//   equipe_id: uuid (nullable)
//   produto_id: uuid (nullable)
//   condicao: text (nullable, default: 'bom'::text)
//   created_at: timestamp with time zone (not null, default: now())
//   updated_at: timestamp with time zone (not null, default: now())
// Table: fornecedor
//   id: uuid (not null, default: gen_random_uuid())
//   descricao: text (not null)
//   email: text (nullable)
//   telefone: text (nullable)
//   ativo: boolean (nullable, default: true)
//   created_at: timestamp with time zone (not null, default: now())
//   updated_at: timestamp with time zone (not null, default: now())
// Table: historico_config_global
//   id: uuid (not null, default: gen_random_uuid())
//   chave: text (not null)
//   valor_antigo: jsonb (nullable)
//   valor_novo: jsonb (nullable)
//   data_alteracao: timestamp with time zone (nullable, default: now())
//   usuario_id: uuid (nullable)
// Table: imagem_produto
//   id: uuid (not null, default: gen_random_uuid())
//   produto_id: uuid (nullable)
//   url: text (not null)
//   ordem: integer (nullable, default: 0)
//   created_at: timestamp with time zone (not null, default: now())
// Table: linha
//   id: uuid (not null, default: gen_random_uuid())
//   descricao: text (not null)
//   departamento_id: uuid (nullable)
//   categoria_id: uuid (nullable)
//   tipo_id: uuid (nullable)
//   ativo: boolean (nullable, default: true)
//   created_at: timestamp with time zone (not null, default: now())
//   updated_at: timestamp with time zone (not null, default: now())
// Table: logs_acesso
//   id: uuid (not null, default: gen_random_uuid())
//   usuario_id: uuid (nullable)
//   acao: text (not null)
//   endereco_ip: text (nullable)
//   user_agent: text (nullable)
//   data_hora: timestamp with time zone (nullable, default: now())
//   detalhes: jsonb (nullable)
// Table: marca
//   id: uuid (not null, default: gen_random_uuid())
//   descricao: text (not null)
//   departamento_id: uuid (nullable)
//   categoria_id: uuid (nullable)
//   tipo_id: uuid (nullable)
//   linha_id: uuid (nullable)
//   ativo: boolean (nullable, default: true)
//   created_at: timestamp with time zone (not null, default: now())
//   updated_at: timestamp with time zone (not null, default: now())
// Table: movimento_estoque
//   id: uuid (not null, default: gen_random_uuid())
//   estoque_id: uuid (nullable)
//   saldo_estoque_id: uuid (nullable)
//   tipo_movimento: text (nullable)
//   quantidade: integer (not null)
//   usuario_id: uuid (nullable)
//   descricao: text (nullable)
//   data_hora: timestamp with time zone (nullable, default: now())
//   created_at: timestamp with time zone (not null, default: now())
//   created_by: uuid (nullable)
//   updated_by: uuid (nullable)
// Table: perfil_acesso
//   id: uuid (not null, default: gen_random_uuid())
//   descricao: text (not null)
//   permissoes: jsonb (nullable, default: '{}'::jsonb)
//   created_at: timestamp with time zone (not null, default: now())
//   updated_at: timestamp with time zone (not null, default: now())
// Table: produto
//   id: uuid (not null, default: gen_random_uuid())
//   nome: text (not null)
//   descricao: text (nullable)
//   departamento_id: uuid (nullable)
//   categoria_id: uuid (nullable)
//   tipo_id: uuid (nullable)
//   linha_id: uuid (nullable)
//   marca_id: uuid (nullable)
//   sku: text (nullable)
//   preco_unitario: numeric (nullable, default: 0)
//   ativo: boolean (nullable, default: true)
//   created_at: timestamp with time zone (not null, default: now())
//   updated_at: timestamp with time zone (not null, default: now())
//   created_by: uuid (nullable)
//   updated_by: uuid (nullable)
//   status: character varying (nullable, default: 'ativo'::character varying)
// Table: reparo
//   id: uuid (not null, default: gen_random_uuid())
//   estoque_id: uuid (nullable)
//   fornecedor_id: uuid (nullable)
//   tipo_reparo_id: uuid (nullable)
//   status: text (nullable, default: 'pendente'::text)
//   descricao: text (nullable)
//   usuario_id: uuid (nullable)
//   valor_orcamento: numeric (nullable, default: 0)
//   valor_servico: numeric (nullable, default: 0)
//   previsao_finalizacao: date (nullable)
//   created_at: timestamp with time zone (not null, default: now())
//   updated_at: timestamp with time zone (not null, default: now())
// Table: saldo_estoque
//   id: uuid (not null, default: gen_random_uuid())
//   produto_id: uuid (nullable)
//   equipe_id: uuid (nullable)
//   quantidade: integer (nullable, default: 0)
//   created_at: timestamp with time zone (not null, default: now())
//   updated_at: timestamp with time zone (not null, default: now())
// Table: saldo_fornecedor
//   id: uuid (not null, default: gen_random_uuid())
//   fornecedor_id: uuid (nullable)
//   saldo: numeric (nullable, default: 0)
//   created_at: timestamp with time zone (not null, default: now())
//   updated_at: timestamp with time zone (not null, default: now())
// Table: tipo
//   id: uuid (not null, default: gen_random_uuid())
//   descricao: text (not null)
//   departamento_id: uuid (nullable)
//   categoria_id: uuid (nullable)
//   ativo: boolean (nullable, default: true)
//   created_at: timestamp with time zone (not null, default: now())
//   updated_at: timestamp with time zone (not null, default: now())
// Table: tipo_reparo
//   id: uuid (not null, default: gen_random_uuid())
//   descricao: text (not null)
//   ativo: boolean (nullable, default: true)
//   created_at: timestamp with time zone (not null, default: now())
//   updated_at: timestamp with time zone (not null, default: now())
// Table: usuarios
//   id: uuid (not null)
//   nome: text (not null)
//   email: text (not null)
//   senha: text (nullable)
//   perfil_acesso_id: uuid (nullable)
//   tema: text (nullable, default: 'claro'::text)
//   ativo: boolean (nullable, default: true)
//   created_at: timestamp with time zone (not null, default: now())
//   updated_at: timestamp with time zone (not null, default: now())
//   created_by: uuid (nullable)
//   updated_by: uuid (nullable)
//   status: character varying (nullable, default: 'ativo'::character varying)
// Table: usuarios_equipes
//   id: uuid (not null, default: gen_random_uuid())
//   usuario_id: uuid (nullable)
//   equipe_id: uuid (nullable)
//   created_at: timestamp with time zone (not null, default: now())

// --- CONSTRAINTS ---
// Table: auditoria
//   CHECK auditoria_operacao_check: CHECK (((operacao)::text = ANY ((ARRAY['INSERT'::character varying, 'UPDATE'::character varying, 'DELETE'::character varying])::text[])))
//   PRIMARY KEY auditoria_pkey: PRIMARY KEY (id)
//   FOREIGN KEY auditoria_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
// Table: categoria
//   FOREIGN KEY categoria_departamento_id_fkey: FOREIGN KEY (departamento_id) REFERENCES departamento(id) ON DELETE CASCADE
//   PRIMARY KEY categoria_pkey: PRIMARY KEY (id)
// Table: config_global
//   UNIQUE config_global_chave_key: UNIQUE (chave)
//   PRIMARY KEY config_global_pkey: PRIMARY KEY (id)
// Table: danificado
//   FOREIGN KEY danificado_equipe_id_fkey: FOREIGN KEY (equipe_id) REFERENCES equipes(id)
//   FOREIGN KEY danificado_estoque_id_fkey: FOREIGN KEY (estoque_id) REFERENCES estoque(id)
//   PRIMARY KEY danificado_pkey: PRIMARY KEY (id)
//   FOREIGN KEY danificado_produto_id_fkey: FOREIGN KEY (produto_id) REFERENCES produto(id)
//   FOREIGN KEY danificado_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
// Table: departamento
//   PRIMARY KEY departamento_pkey: PRIMARY KEY (id)
// Table: equipes
//   CHECK chk_equipes_status: CHECK (((status)::text = ANY ((ARRAY['ativo'::character varying, 'inativo'::character varying])::text[])))
//   FOREIGN KEY equipes_created_by_fkey: FOREIGN KEY (created_by) REFERENCES usuarios(id)
//   PRIMARY KEY equipes_pkey: PRIMARY KEY (id)
//   FOREIGN KEY equipes_updated_by_fkey: FOREIGN KEY (updated_by) REFERENCES usuarios(id)
// Table: estoque
//   FOREIGN KEY estoque_equipe_id_fkey: FOREIGN KEY (equipe_id) REFERENCES equipes(id)
//   UNIQUE estoque_numero_patrimonio_key: UNIQUE (numero_patrimonio)
//   PRIMARY KEY estoque_pkey: PRIMARY KEY (id)
//   FOREIGN KEY estoque_produto_id_fkey: FOREIGN KEY (produto_id) REFERENCES produto(id)
// Table: fornecedor
//   PRIMARY KEY fornecedor_pkey: PRIMARY KEY (id)
// Table: historico_config_global
//   PRIMARY KEY historico_config_global_pkey: PRIMARY KEY (id)
// Table: imagem_produto
//   PRIMARY KEY imagem_produto_pkey: PRIMARY KEY (id)
//   FOREIGN KEY imagem_produto_produto_id_fkey: FOREIGN KEY (produto_id) REFERENCES produto(id) ON DELETE CASCADE
// Table: linha
//   FOREIGN KEY linha_categoria_id_fkey: FOREIGN KEY (categoria_id) REFERENCES categoria(id) ON DELETE CASCADE
//   FOREIGN KEY linha_departamento_id_fkey: FOREIGN KEY (departamento_id) REFERENCES departamento(id) ON DELETE CASCADE
//   PRIMARY KEY linha_pkey: PRIMARY KEY (id)
//   FOREIGN KEY linha_tipo_id_fkey: FOREIGN KEY (tipo_id) REFERENCES tipo(id) ON DELETE CASCADE
// Table: logs_acesso
//   PRIMARY KEY logs_acesso_pkey: PRIMARY KEY (id)
//   FOREIGN KEY logs_acesso_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
// Table: marca
//   FOREIGN KEY marca_categoria_id_fkey: FOREIGN KEY (categoria_id) REFERENCES categoria(id) ON DELETE CASCADE
//   FOREIGN KEY marca_departamento_id_fkey: FOREIGN KEY (departamento_id) REFERENCES departamento(id) ON DELETE CASCADE
//   FOREIGN KEY marca_linha_id_fkey: FOREIGN KEY (linha_id) REFERENCES linha(id) ON DELETE CASCADE
//   PRIMARY KEY marca_pkey: PRIMARY KEY (id)
//   FOREIGN KEY marca_tipo_id_fkey: FOREIGN KEY (tipo_id) REFERENCES tipo(id) ON DELETE CASCADE
// Table: movimento_estoque
//   CHECK chk_movimento_tipo: CHECK ((tipo_movimento = ANY (ARRAY['entrada'::text, 'saida'::text, 'transferencia'::text, 'ajuste'::text])))
//   FOREIGN KEY movimento_estoque_created_by_fkey: FOREIGN KEY (created_by) REFERENCES usuarios(id)
//   FOREIGN KEY movimento_estoque_estoque_id_fkey: FOREIGN KEY (estoque_id) REFERENCES estoque(id)
//   PRIMARY KEY movimento_estoque_pkey: PRIMARY KEY (id)
//   FOREIGN KEY movimento_estoque_saldo_estoque_id_fkey: FOREIGN KEY (saldo_estoque_id) REFERENCES saldo_estoque(id)
//   FOREIGN KEY movimento_estoque_updated_by_fkey: FOREIGN KEY (updated_by) REFERENCES usuarios(id)
//   FOREIGN KEY movimento_estoque_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
// Table: perfil_acesso
//   PRIMARY KEY perfil_acesso_pkey: PRIMARY KEY (id)
// Table: produto
//   CHECK chk_produto_status: CHECK (((status)::text = ANY ((ARRAY['ativo'::character varying, 'inativo'::character varying])::text[])))
//   FOREIGN KEY produto_categoria_id_fkey: FOREIGN KEY (categoria_id) REFERENCES categoria(id)
//   FOREIGN KEY produto_created_by_fkey: FOREIGN KEY (created_by) REFERENCES usuarios(id)
//   FOREIGN KEY produto_departamento_id_fkey: FOREIGN KEY (departamento_id) REFERENCES departamento(id)
//   FOREIGN KEY produto_linha_id_fkey: FOREIGN KEY (linha_id) REFERENCES linha(id)
//   FOREIGN KEY produto_marca_id_fkey: FOREIGN KEY (marca_id) REFERENCES marca(id)
//   PRIMARY KEY produto_pkey: PRIMARY KEY (id)
//   UNIQUE produto_sku_key: UNIQUE (sku)
//   FOREIGN KEY produto_tipo_id_fkey: FOREIGN KEY (tipo_id) REFERENCES tipo(id)
//   FOREIGN KEY produto_updated_by_fkey: FOREIGN KEY (updated_by) REFERENCES usuarios(id)
// Table: reparo
//   FOREIGN KEY reparo_estoque_id_fkey: FOREIGN KEY (estoque_id) REFERENCES estoque(id)
//   FOREIGN KEY reparo_fornecedor_id_fkey: FOREIGN KEY (fornecedor_id) REFERENCES fornecedor(id)
//   PRIMARY KEY reparo_pkey: PRIMARY KEY (id)
//   FOREIGN KEY reparo_tipo_reparo_id_fkey: FOREIGN KEY (tipo_reparo_id) REFERENCES tipo_reparo(id)
//   FOREIGN KEY reparo_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
// Table: saldo_estoque
//   FOREIGN KEY saldo_estoque_equipe_id_fkey: FOREIGN KEY (equipe_id) REFERENCES equipes(id)
//   PRIMARY KEY saldo_estoque_pkey: PRIMARY KEY (id)
//   FOREIGN KEY saldo_estoque_produto_id_fkey: FOREIGN KEY (produto_id) REFERENCES produto(id)
// Table: saldo_fornecedor
//   FOREIGN KEY saldo_fornecedor_fornecedor_id_fkey: FOREIGN KEY (fornecedor_id) REFERENCES fornecedor(id) ON DELETE CASCADE
//   PRIMARY KEY saldo_fornecedor_pkey: PRIMARY KEY (id)
// Table: tipo
//   FOREIGN KEY tipo_categoria_id_fkey: FOREIGN KEY (categoria_id) REFERENCES categoria(id) ON DELETE CASCADE
//   FOREIGN KEY tipo_departamento_id_fkey: FOREIGN KEY (departamento_id) REFERENCES departamento(id) ON DELETE CASCADE
//   PRIMARY KEY tipo_pkey: PRIMARY KEY (id)
// Table: tipo_reparo
//   PRIMARY KEY tipo_reparo_pkey: PRIMARY KEY (id)
// Table: usuarios
//   CHECK chk_usuarios_status: CHECK (((status)::text = ANY ((ARRAY['ativo'::character varying, 'inativo'::character varying])::text[])))
//   FOREIGN KEY usuarios_created_by_fkey: FOREIGN KEY (created_by) REFERENCES usuarios(id)
//   UNIQUE usuarios_email_key: UNIQUE (email)
//   FOREIGN KEY usuarios_id_fkey: FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
//   FOREIGN KEY usuarios_perfil_acesso_id_fkey: FOREIGN KEY (perfil_acesso_id) REFERENCES perfil_acesso(id) ON DELETE CASCADE
//   PRIMARY KEY usuarios_pkey: PRIMARY KEY (id)
//   FOREIGN KEY usuarios_updated_by_fkey: FOREIGN KEY (updated_by) REFERENCES usuarios(id)
// Table: usuarios_equipes
//   UNIQUE uk_usuarios_equipes: UNIQUE (usuario_id, equipe_id)
//   FOREIGN KEY usuarios_equipes_equipe_id_fkey: FOREIGN KEY (equipe_id) REFERENCES equipes(id) ON DELETE CASCADE
//   PRIMARY KEY usuarios_equipes_pkey: PRIMARY KEY (id)
//   FOREIGN KEY usuarios_equipes_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE

// --- ROW LEVEL SECURITY POLICIES ---
// Table: auditoria
//   Policy "allow_all_authenticated" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: categoria
//   Policy "allow_all_authenticated" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
//   Policy "delete_admin" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (is_admin() OR true)
//   Policy "insert_authenticated" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "select_all_authenticated" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "tree_all_categoria" (ALL, PERMISSIVE) roles={authenticated}
//     USING: is_gestor()
//     WITH CHECK: is_gestor()
//   Policy "tree_select_categoria" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "update_admin" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (is_admin() OR true)
//     WITH CHECK: (is_admin() OR true)
// Table: config_global
//   Policy "allow_all_authenticated" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
//   Policy "delete_admin" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (is_admin() OR true)
//   Policy "insert_authenticated" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "select_all_authenticated" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "update_admin" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (is_admin() OR true)
//     WITH CHECK: (is_admin() OR true)
// Table: danificado
//   Policy "allow_all_authenticated" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
//   Policy "danificado_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "danificado_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "danificado_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "danificado_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: departamento
//   Policy "allow_all_authenticated" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
//   Policy "delete_admin" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (is_admin() OR true)
//   Policy "insert_authenticated" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "select_all_authenticated" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "tree_all_departamento" (ALL, PERMISSIVE) roles={authenticated}
//     USING: is_gestor()
//     WITH CHECK: is_gestor()
//   Policy "tree_select_departamento" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "update_admin" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (is_admin() OR true)
//     WITH CHECK: (is_admin() OR true)
// Table: equipes
//   Policy "allow_all_authenticated" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
//   Policy "equipes_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: is_gestor()
//   Policy "equipes_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: is_gestor()
//   Policy "equipes_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (is_gestor() OR (id IN ( SELECT get_user_teams() AS get_user_teams)))
//   Policy "equipes_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: is_gestor()
//     WITH CHECK: is_gestor()
// Table: estoque
//   Policy "allow_all_authenticated" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
//   Policy "estoque_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (is_gestor() OR (equipe_id IN ( SELECT get_user_teams() AS get_user_teams)))
//     WITH CHECK: (is_gestor() OR (equipe_id IN ( SELECT get_user_teams() AS get_user_teams)))
//   Policy "estoque_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (is_admin() OR true)
//   Policy "estoque_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "estoque_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (is_gestor() OR (equipe_id IN ( SELECT get_user_teams() AS get_user_teams)) OR (equipe_id IS NULL))
//   Policy "estoque_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (is_admin() OR true)
//     WITH CHECK: (is_admin() OR true)
// Table: fornecedor
//   Policy "allow_all_authenticated" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
//   Policy "delete_admin" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (is_admin() OR true)
//   Policy "insert_authenticated" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "select_all_authenticated" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "update_admin" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (is_admin() OR true)
//     WITH CHECK: (is_admin() OR true)
// Table: historico_config_global
//   Policy "allow_all_authenticated" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: imagem_produto
//   Policy "allow_all_authenticated" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
//   Policy "delete_admin" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (is_admin() OR true)
//   Policy "insert_authenticated" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "select_all_authenticated" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "update_admin" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (is_admin() OR true)
//     WITH CHECK: (is_admin() OR true)
// Table: linha
//   Policy "allow_all_authenticated" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
//   Policy "delete_admin" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (is_admin() OR true)
//   Policy "insert_authenticated" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "select_all_authenticated" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "tree_all_linha" (ALL, PERMISSIVE) roles={authenticated}
//     USING: is_gestor()
//     WITH CHECK: is_gestor()
//   Policy "tree_select_linha" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "update_admin" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (is_admin() OR true)
//     WITH CHECK: (is_admin() OR true)
// Table: logs_acesso
//   Policy "allow_all_authenticated" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: marca
//   Policy "allow_all_authenticated" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
//   Policy "delete_admin" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (is_admin() OR true)
//   Policy "insert_authenticated" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "select_all_authenticated" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "tree_all_marca" (ALL, PERMISSIVE) roles={authenticated}
//     USING: is_gestor()
//     WITH CHECK: is_gestor()
//   Policy "tree_select_marca" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "update_admin" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (is_admin() OR true)
//     WITH CHECK: (is_admin() OR true)
// Table: movimento_estoque
//   Policy "allow_all_authenticated" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
//   Policy "movimento_estoque_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "movimento_estoque_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
// Table: perfil_acesso
//   Policy "allow_all_authenticated" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
//   Policy "delete_admin" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (is_admin() OR true)
//   Policy "insert_authenticated" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "select_all_authenticated" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "update_admin" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (is_admin() OR true)
//     WITH CHECK: (is_admin() OR true)
// Table: produto
//   Policy "allow_all_authenticated" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
//   Policy "delete_admin" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (is_admin() OR true)
//   Policy "insert_authenticated" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "select_all_authenticated" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "tree_all_produto" (ALL, PERMISSIVE) roles={authenticated}
//     USING: is_gestor()
//     WITH CHECK: is_gestor()
//   Policy "tree_select_produto" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "update_admin" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (is_admin() OR true)
//     WITH CHECK: (is_admin() OR true)
// Table: reparo
//   Policy "allow_all_authenticated" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
//   Policy "reparo_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "reparo_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "reparo_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "reparo_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: saldo_estoque
//   Policy "allow_all_authenticated" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
//   Policy "saldo_estoque_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (is_gestor() OR (equipe_id IN ( SELECT get_user_teams() AS get_user_teams)))
//     WITH CHECK: (is_gestor() OR (equipe_id IN ( SELECT get_user_teams() AS get_user_teams)))
//   Policy "saldo_estoque_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "saldo_estoque_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "saldo_estoque_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (is_gestor() OR (equipe_id IN ( SELECT get_user_teams() AS get_user_teams)) OR (equipe_id IS NULL))
//   Policy "saldo_estoque_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: saldo_fornecedor
//   Policy "allow_all_authenticated" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
//   Policy "delete_admin" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (is_admin() OR true)
//   Policy "insert_authenticated" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "select_all_authenticated" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "update_admin" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (is_admin() OR true)
//     WITH CHECK: (is_admin() OR true)
// Table: tipo
//   Policy "allow_all_authenticated" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
//   Policy "delete_admin" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (is_admin() OR true)
//   Policy "insert_authenticated" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "select_all_authenticated" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "tree_all_tipo" (ALL, PERMISSIVE) roles={authenticated}
//     USING: is_gestor()
//     WITH CHECK: is_gestor()
//   Policy "tree_select_tipo" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "update_admin" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (is_admin() OR true)
//     WITH CHECK: (is_admin() OR true)
// Table: tipo_reparo
//   Policy "allow_all_authenticated" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
//   Policy "delete_admin" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (is_admin() OR true)
//   Policy "insert_authenticated" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "select_all_authenticated" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "update_admin" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (is_admin() OR true)
//     WITH CHECK: (is_admin() OR true)
// Table: usuarios
//   Policy "allow_all_authenticated" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
//   Policy "delete_admin" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (is_admin() OR true)
//   Policy "insert_authenticated" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "select_all_authenticated" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "update_admin" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (is_admin() OR true)
//     WITH CHECK: (is_admin() OR true)
//   Policy "usuarios_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "usuarios_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (is_gestor() OR (id = auth.uid()))
// Table: usuarios_equipes
//   Policy "allow_all_authenticated" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
//   Policy "usuarios_equipes_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: is_gestor()
//     WITH CHECK: is_gestor()
//   Policy "usuarios_equipes_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "usuarios_equipes_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "usuarios_equipes_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true

// --- DATABASE FUNCTIONS ---
// FUNCTION can_write()
//   CREATE OR REPLACE FUNCTION public.can_write()
//    RETURNS boolean
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   BEGIN
//     RETURN (SELECT p.descricao FROM public.usuarios u JOIN public.perfil_acesso p ON u.perfil_acesso_id = p.id WHERE u.id = auth.uid()) IN ('Gestor', 'Encarregado Gestor', 'Encarregado', 'Gerente', 'Supervisor');
//   END;
//   $function$
//
// FUNCTION get_user_teams()
//   CREATE OR REPLACE FUNCTION public.get_user_teams()
//    RETURNS SETOF uuid
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   BEGIN
//     RETURN QUERY SELECT equipe_id FROM public.usuarios_equipes WHERE usuario_id = auth.uid();
//   END;
//   $function$
//
// FUNCTION handle_new_user()
//   CREATE OR REPLACE FUNCTION public.handle_new_user()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   DECLARE
//     v_perfil_padrao_id UUID;
//   BEGIN
//     SELECT id INTO v_perfil_padrao_id FROM public.perfil_acesso WHERE descricao ILIKE 'Membro Comum' LIMIT 1;
//     IF v_perfil_padrao_id IS NULL THEN
//       SELECT id INTO v_perfil_padrao_id FROM public.perfil_acesso WHERE descricao ILIKE 'visualizador' LIMIT 1;
//     END IF;
//
//     INSERT INTO public.usuarios (id, email, nome, perfil_acesso_id, status)
//     VALUES (
//       NEW.id,
//       NEW.email,
//       COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
//       v_perfil_padrao_id,
//       'ativo'
//     )
//     ON CONFLICT (id) DO NOTHING;
//     RETURN NEW;
//   END;
//   $function$
//
// FUNCTION is_admin()
//   CREATE OR REPLACE FUNCTION public.is_admin()
//    RETURNS boolean
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   DECLARE
//     v_admin BOOLEAN;
//   BEGIN
//     SELECT (p.descricao ILIKE 'gestor' OR p.descricao ILIKE 'gerente') INTO v_admin
//     FROM public.usuarios u
//     JOIN public.perfil_acesso p ON u.perfil_acesso_id = p.id
//     WHERE u.id = auth.uid();
//     RETURN COALESCE(v_admin, false);
//   END;
//   $function$
//
// FUNCTION is_gestor()
//   CREATE OR REPLACE FUNCTION public.is_gestor()
//    RETURNS boolean
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   DECLARE
//     v_admin BOOLEAN;
//   BEGIN
//     SELECT (p.descricao ILIKE 'gestor' OR p.descricao ILIKE 'gerente') INTO v_admin
//     FROM public.usuarios u
//     JOIN public.perfil_acesso p ON u.perfil_acesso_id = p.id
//     WHERE u.id = auth.uid();
//     RETURN COALESCE(v_admin, false);
//   END;
//   $function$
//
// FUNCTION sync_node_camel_case()
//   CREATE OR REPLACE FUNCTION public.sync_node_camel_case()
//    RETURNS trigger
//    LANGUAGE plpgsql
//   AS $function$
//   BEGIN
//     -- Sync parent_id and parentId bidirectionally
//     IF NEW."parentId" IS NOT NULL AND (NEW.parent_id IS NULL OR NEW.parent_id != NEW."parentId") THEN
//       NEW.parent_id := NEW."parentId";
//     ELSIF NEW.parent_id IS NOT NULL AND (NEW."parentId" IS NULL OR NEW."parentId" != NEW.parent_id) THEN
//       NEW."parentId" := NEW.parent_id;
//     END IF;
//
//     -- Sync is_grouped and isGrouped bidirectionally
//     IF NEW."isGrouped" IS NOT NULL AND (NEW.is_grouped IS NULL OR NEW.is_grouped != NEW."isGrouped") THEN
//       NEW.is_grouped := NEW."isGrouped";
//     ELSIF NEW.is_grouped IS NOT NULL AND (NEW."isGrouped" IS NULL OR NEW."isGrouped" != NEW.is_grouped) THEN
//       NEW."isGrouped" := NEW.is_grouped;
//     END IF;
//
//     RETURN NEW;
//   END;
//   $function$
//
// FUNCTION trigger_audit_log()
//   CREATE OR REPLACE FUNCTION public.trigger_audit_log()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   DECLARE
//     v_old jsonb;
//     v_new jsonb;
//     v_operacao varchar(10);
//     v_registro_id text;
//   BEGIN
//     v_operacao := TG_OP;
//
//     IF v_operacao = 'INSERT' THEN
//       v_new := to_jsonb(NEW);
//       v_registro_id := NEW.id::text;
//       INSERT INTO public.auditoria (tabela, operacao, registro_id, dados_novos, usuario_id)
//       VALUES (TG_TABLE_NAME, v_operacao, v_registro_id, v_new, auth.uid());
//       RETURN NEW;
//     ELSIF v_operacao = 'UPDATE' THEN
//       v_old := to_jsonb(OLD);
//       v_new := to_jsonb(NEW);
//       v_registro_id := NEW.id::text;
//       INSERT INTO public.auditoria (tabela, operacao, registro_id, dados_antigos, dados_novos, usuario_id)
//       VALUES (TG_TABLE_NAME, v_operacao, v_registro_id, v_old, v_new, auth.uid());
//       RETURN NEW;
//     ELSIF v_operacao = 'DELETE' THEN
//       v_old := to_jsonb(OLD);
//       v_registro_id := OLD.id::text;
//       INSERT INTO public.auditoria (tabela, operacao, registro_id, dados_antigos, usuario_id)
//       VALUES (TG_TABLE_NAME, v_operacao, v_registro_id, v_old, auth.uid());
//       RETURN OLD;
//     END IF;
//     RETURN NULL;
//   END;
//   $function$
//
// FUNCTION trigger_set_updated_at()
//   CREATE OR REPLACE FUNCTION public.trigger_set_updated_at()
//    RETURNS trigger
//    LANGUAGE plpgsql
//   AS $function$
//   BEGIN
//     NEW.updated_at = now();
//     RETURN NEW;
//   END;
//   $function$
//
// FUNCTION user_teams()
//   CREATE OR REPLACE FUNCTION public.user_teams()
//    RETURNS SETOF uuid
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   BEGIN
//     RETURN QUERY SELECT equipe_id FROM public.usuarios_equipes WHERE usuario_id = auth.uid();
//   END;
//   $function$
//

// --- TRIGGERS ---
// Table: equipes
//   trg_audit_equipes: CREATE TRIGGER trg_audit_equipes AFTER INSERT OR DELETE OR UPDATE ON public.equipes FOR EACH ROW EXECUTE FUNCTION trigger_audit_log()
//   trg_set_equipes_updated_at: CREATE TRIGGER trg_set_equipes_updated_at BEFORE UPDATE ON public.equipes FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at()
// Table: estoque
//   trg_audit_estoque: CREATE TRIGGER trg_audit_estoque AFTER INSERT OR DELETE OR UPDATE ON public.estoque FOR EACH ROW EXECUTE FUNCTION trigger_audit_log()
//   trg_set_estoque_updated_at: CREATE TRIGGER trg_set_estoque_updated_at BEFORE UPDATE ON public.estoque FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at()
// Table: movimento_estoque
//   trg_audit_movimento_estoque: CREATE TRIGGER trg_audit_movimento_estoque AFTER INSERT OR DELETE OR UPDATE ON public.movimento_estoque FOR EACH ROW EXECUTE FUNCTION trigger_audit_log()
//   trg_set_movimento_updated_at: CREATE TRIGGER trg_set_movimento_updated_at BEFORE UPDATE ON public.movimento_estoque FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at()
// Table: produto
//   trg_audit_produto: CREATE TRIGGER trg_audit_produto AFTER INSERT OR DELETE OR UPDATE ON public.produto FOR EACH ROW EXECUTE FUNCTION trigger_audit_log()
//   trg_set_produto_updated_at: CREATE TRIGGER trg_set_produto_updated_at BEFORE UPDATE ON public.produto FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at()
// Table: usuarios
//   trg_set_usuarios_updated_at: CREATE TRIGGER trg_set_usuarios_updated_at BEFORE UPDATE ON public.usuarios FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at()

// --- INDEXES ---
// Table: config_global
//   CREATE UNIQUE INDEX config_global_chave_key ON public.config_global USING btree (chave)
// Table: danificado
//   CREATE INDEX idx_danificado_equipe_id ON public.danificado USING btree (equipe_id)
// Table: estoque
//   CREATE UNIQUE INDEX estoque_numero_patrimonio_key ON public.estoque USING btree (numero_patrimonio)
//   CREATE INDEX idx_estoque_equipe_id ON public.estoque USING btree (equipe_id)
//   CREATE INDEX idx_estoque_produto_id ON public.estoque USING btree (produto_id)
//   CREATE INDEX idx_estoque_status ON public.estoque USING btree (status)
// Table: movimento_estoque
//   CREATE INDEX idx_movimento_estoque_data ON public.movimento_estoque USING btree (data_hora DESC)
//   CREATE INDEX idx_movimento_estoque_usuario_id ON public.movimento_estoque USING btree (usuario_id)
// Table: produto
//   CREATE INDEX idx_produto_nome ON public.produto USING btree (nome)
//   CREATE INDEX idx_produto_status ON public.produto USING btree (status) WHERE ((status)::text = 'ativo'::text)
//   CREATE UNIQUE INDEX produto_sku_key ON public.produto USING btree (sku)
// Table: reparo
//   CREATE INDEX idx_reparo_status ON public.reparo USING btree (status)
// Table: usuarios
//   CREATE INDEX idx_usuarios_email ON public.usuarios USING btree (email)
//   CREATE UNIQUE INDEX usuarios_email_key ON public.usuarios USING btree (email)
// Table: usuarios_equipes
//   CREATE INDEX idx_usuarios_equipes_equipe_id ON public.usuarios_equipes USING btree (equipe_id)
//   CREATE INDEX idx_usuarios_equipes_usuario_id ON public.usuarios_equipes USING btree (usuario_id)
//   CREATE UNIQUE INDEX uk_usuarios_equipes ON public.usuarios_equipes USING btree (usuario_id, equipe_id)
