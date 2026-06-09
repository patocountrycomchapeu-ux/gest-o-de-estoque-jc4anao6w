import { supabase } from '@/lib/supabase/client'
import { BaseService } from './BaseService'
import { Database } from '@/lib/supabase/types'

type MovimentoRow = Database['public']['Tables']['movimento_estoque']['Row']

export class MovimentoEstoqueService extends BaseService<MovimentoRow> {
  constructor() {
    super('movimento_estoque')
  }

  async getMovimentosPorEstoque(estoqueId: string): Promise<MovimentoRow[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('estoque_id', estoqueId)
      .order('data_hora', { ascending: false })

    if (error) throw error
    return data as MovimentoRow[]
  }

  async getTodosMovimentos(): Promise<MovimentoRow[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .order('data_hora', { ascending: false })

    if (error) throw error
    return data as MovimentoRow[]
  }
}

export const movimentoEstoqueService = new MovimentoEstoqueService()
