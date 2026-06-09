import { apiFetch } from '@/lib/api'
import { BaseService } from './BaseService'
import { Database } from '@/lib/supabase/types'

type MovimentoRow = Database['public']['Tables']['movimento_estoque']['Row']

export class MovimentoEstoqueService extends BaseService<MovimentoRow> {
  constructor() {
    super('movimento_estoque')
  }

  async getMovimentosPorEstoque(estoqueId: string): Promise<MovimentoRow[]> {
    return apiFetch(`${this.endpoint}?estoqueId=${estoqueId}`) as Promise<MovimentoRow[]>
  }

  async getTodosMovimentos(): Promise<MovimentoRow[]> {
    return this.getAll()
  }
}

export const movimentoEstoqueService = new MovimentoEstoqueService()
