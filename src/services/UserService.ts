import { supabase } from '@/lib/supabase/client'
import { Role } from '@/types'
import { BaseService } from './BaseService'
import { Database } from '@/lib/supabase/types'

type UsuarioRow = Database['public']['Tables']['usuarios']['Row']

export class UserService extends BaseService<UsuarioRow> {
  constructor() {
    super('usuarios')
  }

  async updateUserRole(userId: string, role: Role): Promise<void> {
    const { data } = await supabase
      .from('perfil_acesso')
      .select('id')
      .ilike('descricao', role)
      .single()

    if (data) {
      await supabase.from('usuarios').update({ perfil_acesso_id: data.id }).eq('id', userId)
    }
  }

  async toggleUserStatus(userId: string, newStatus: boolean): Promise<void> {
    await supabase.from('usuarios').update({ ativo: newStatus }).eq('id', userId)
  }
}

export const userService = new UserService()
