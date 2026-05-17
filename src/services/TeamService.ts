import { supabase } from '@/lib/supabase/client'
import { Team } from '@/types'

export class TeamService {
  async createTeam(name: string, description: string, managerId?: string): Promise<Team> {
    const { data: teamData, error } = await supabase
      .from('equipes')
      .insert({ nome: name, descricao: description, ativa: true, status: 'ativo' })
      .select()
      .single()

    if (error) throw error

    if (managerId) {
      await supabase.from('usuarios_equipes').insert({
        equipe_id: teamData.id,
        usuario_id: managerId,
      })
    }

    return {
      id: teamData.id,
      name: teamData.nome,
      description: teamData.descricao || '',
      location: '',
      managerId,
    }
  }

  async updateTeam(
    id: string,
    name: string,
    description: string,
    managerId?: string,
  ): Promise<void> {
    const { error } = await supabase
      .from('equipes')
      .update({ nome: name, descricao: description })
      .eq('id', id)

    if (error) throw error

    await supabase.from('usuarios_equipes').delete().eq('equipe_id', id)
    if (managerId) {
      await supabase.from('usuarios_equipes').insert({
        equipe_id: id,
        usuario_id: managerId,
      })
    }
  }

  async deleteTeam(id: string): Promise<void> {
    const { error } = await supabase
      .from('equipes')
      .update({ ativa: false, status: 'inativo' })
      .eq('id', id)

    if (error) throw error
  }
}

export const teamService = new TeamService()
