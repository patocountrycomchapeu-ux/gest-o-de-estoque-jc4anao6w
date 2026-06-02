import { User } from '@/types'

export const canWrite = (user: User | null) => {
  if (!user) return false
  return ['Gestor', 'Encarregado Gestor', 'Encarregado', 'Gerente', 'Supervisor'].includes(
    user.role,
  )
}

export const isGestor = (user: User | null) => ['Gestor', 'Gerente'].includes(user?.role as string)

export const canManageUsers = isGestor

export const canViewTree = (user: User | null) => !!user

export const canManageTree = (user: User | null) => {
  if (!user) return false
  return ['Gestor', 'Gerente'].includes(user.role)
}

export const canViewTeams = (user: User | null) => {
  if (!user) return false
  return [
    'Gestor',
    'Encarregado Gestor',
    'Encarregado',
    'Analista',
    'Gerente',
    'Supervisor',
  ].includes(user.role)
}

export const canViewTeam = (user: User | null, teamId: string) => {
  if (!user) return false
  if (['Gestor', 'Encarregado Gestor', 'Gerente'].includes(user.role)) return true
  return user.teamId === teamId
}

export const canManageTeam = (user: User | null, teamId: string) => {
  if (!user) return false
  if (['Gestor', 'Encarregado Gestor', 'Gerente'].includes(user.role)) return true
  if (['Encarregado', 'Supervisor'].includes(user.role) && user.teamId === teamId) return true
  if (user.role === 'Analista' && user.teamId === teamId) return true
  return false
}

export const canViewRepairs = (user: User | null) => {
  if (!user) return false
  return ['Gestor', 'Encarregado Gestor', 'Encarregado', 'Gerente', 'Supervisor'].includes(
    user.role,
  )
}

export const canManageRepairs = canViewRepairs

export const canViewSuppliers = (user: User | null) => {
  if (!user) return false
  return ['Gestor', 'Encarregado Gestor', 'Encarregado', 'Gerente', 'Supervisor'].includes(
    user.role,
  )
}
export const canManageSuppliers = canViewSuppliers

export const canViewReports = (user: User | null) => {
  if (!user) return false
  return true // All roles can view reports
}
