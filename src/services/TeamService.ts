import { apiFetch } from '@/lib/api'
import { Team } from '@/types'

export class TeamService {
  async createTeam(name: string, description: string, managerId?: string): Promise<Team> {
    const teamData = await apiFetch('/equipes', {
      method: 'POST',
      body: JSON.stringify({ nome: name, descricao: description, ativa: true, status: 'ativo' }),
    })

    if (managerId) {
      await apiFetch('/usuarios-equipes', {
        method: 'POST',
        body: JSON.stringify({
          equipe_id: teamData.id,
          usuario_id: managerId,
        }),
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
    await apiFetch(`/equipes/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ nome: name, descricao: description }),
    })

    if (managerId) {
      await apiFetch(`/equipes/${id}/manager`, {
        method: 'PUT',
        body: JSON.stringify({ usuario_id: managerId }),
      }).catch(async () => {
        await apiFetch('/usuarios-equipes', {
          method: 'POST',
          body: JSON.stringify({
            equipe_id: id,
            usuario_id: managerId,
          }),
        })
      })
    }
  }

  async deleteTeam(id: string): Promise<void> {
    await apiFetch(`/equipes/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ ativa: false, status: 'inativo' }),
    })
  }
}

export const teamService = new TeamService()
