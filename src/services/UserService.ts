import { apiFetch } from '@/lib/api'
import { Role } from '@/types'
import { BaseService } from './BaseService'
import { Database } from '@/lib/supabase/types'

type UsuarioRow = Database['public']['Tables']['usuarios']['Row']

export class UserService extends BaseService<UsuarioRow> {
  constructor() {
    super('usuarios')
  }

  async updateUserRole(userId: string, role: Role): Promise<void> {
    const roles: any[] = await apiFetch('/perfil-acesso')
    const roleData = roles.find((r) => r.descricao?.toLowerCase() === role.toLowerCase())

    if (roleData) {
      await apiFetch(`/usuarios/${userId}`, {
        method: 'PUT',
        body: JSON.stringify({ perfil_acesso_id: roleData.id }),
      })
    }
  }

  async toggleUserStatus(userId: string, newStatus: boolean): Promise<void> {
    await apiFetch(`/usuarios/${userId}`, {
      method: 'PUT',
      body: JSON.stringify({ ativo: newStatus }),
    })
  }
}

export const userService = new UserService()
