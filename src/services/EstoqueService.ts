import { apiFetch } from '@/lib/api'
import { BaseService } from './BaseService'
import { Database } from '@/lib/supabase/types'

type EstoqueRow = Database['public']['Tables']['estoque']['Row']

export class EstoqueService extends BaseService<EstoqueRow> {
  constructor() {
    super('estoque')
  }

  async getEstoqueByEquipe(equipeId: string): Promise<EstoqueRow[]> {
    return apiFetch(`${this.endpoint}?equipeId=${equipeId}`) as Promise<EstoqueRow[]>
  }

  subscribeToEstoque(callback: (payload: any) => void) {
    console.warn('subscribeToEstoque not implemented for external API')
    return { unsubscribe: () => {} }
  }
}

export const estoqueService = new EstoqueService()
