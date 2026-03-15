import { User } from '@/types'

export const isAdmin = (user: User | null) => user?.role === 'admin'

export const isLeader = (user: User | null) => user?.role === 'leader'

export const canManageTeam = (user: User | null, teamId: string) => {
  if (!user) return false
  if (user.role === 'admin') return true
  if (user.role === 'leader' && user.teamId === teamId) return true
  return false
}

export const canViewTeam = (user: User | null, teamId: string) => {
  if (!user) return false
  if (user.role === 'admin') return true
  if (user.role === 'leader') return true // Leaders can view other teams to select for transfer
  if (user.role === 'operator' && user.teamId === teamId) return true
  return false
}

export const canViewReports = (user: User | null) => user?.role === 'admin'

export const canManageTree = (user: User | null) => user?.role === 'admin'
