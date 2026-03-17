import { User } from '@/types'

export const canManageUsers = (user: User | null) => user?.role === 'Gestor'

export const canManageTree = (user: User | null) => {
  if (!user) return false
  return ['Gestor', 'Encarregado Gestor'].includes(user.role)
}

export const canViewReports = (user: User | null) => {
  if (!user) return false
  return ['Gestor', 'Encarregado Gestor', 'Encarregado', 'Analista', 'Visualizador'].includes(
    user.role,
  )
}

export const canViewTeam = (user: User | null, teamId: string) => {
  if (!user) return false
  return true // All roles can view teams, management is restricted by canManageTeam
}

export const canManageTeam = (user: User | null, teamId: string) => {
  if (!user) return false
  if (['Gestor', 'Encarregado Gestor'].includes(user.role)) return true
  if (user.role === 'Encarregado' && user.teamId === teamId) return true
  if (user.role === 'Analista' && user.teamId === teamId) return true
  return false
}
