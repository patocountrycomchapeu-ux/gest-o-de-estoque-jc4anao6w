import { supabase } from '@/lib/supabase/client'
import { BaseService } from './BaseService'
import { Database } from '@/lib/supabase/types'

type EstoqueRow = Database['public']['Tables']['estoque']['Row']

export class EstoqueService extends BaseService<EstoqueRow> {
  constructor() {
    super('estoque')
  }

  async getEstoqueByEquipe(equipeId: string): Promise<EstoqueRow[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('equipe_id', equipeId)

    if (error) throw error
    return data as EstoqueRow[]
  }

  subscribeToEstoque(callback: (payload: any) => void) {
    return supabase
      .channel('estoque_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'estoque' }, callback)
      .subscribe()
  }
}

export const estoqueService = new EstoqueService()
