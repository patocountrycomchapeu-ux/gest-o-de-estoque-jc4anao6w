export type Condition = 'good' | 'damaged' | 'repair'
export type ToolStatus =
  | 'present'
  | 'missing'
  | 'borrowed'
  | 'in_maintenance'
  | 'defect_stock'
  | 'returned_to_team'
export type TreeLevel = 'departamento' | 'secao' | 'categoria' | 'item' | 'marca'
export type Role = 'admin' | 'leader' | 'operator'

export interface User {
  id: string
  name: string
  email: string
  password?: string
  role: Role
  teamId?: string
}

export interface TreeNode {
  id: string
  name: string
  level: TreeLevel
  parentId: string | null
  isGrouped?: boolean
}

export interface InventoryItem {
  id: string
  hasAssetNumber: boolean
  assetNumber?: string
  teamId: string
  treeNodeId: string
  condition: Condition
  status: ToolStatus
  borrowedTo?: string
  photos: string[]
  lastUpdated: string
  price?: number
  repairCost?: number
  repairLocation?: string
  repairDescription?: string
  repairUser?: string
  repairDate?: string
  damagedDate?: string
  damagedUser?: string
  quantity?: number
}

export interface Team {
  id: string
  name: string
  description: string
  location: string
}

export interface Activity {
  id: string
  date: string
  description: string
  type: 'allocation' | 'status_change' | 'system'
}

export interface ToolHistoryEvent {
  id: string
  inventoryId: string
  date: string
  type: 'allocation' | 'status_change' | 'audit' | 'system' | 'transfer'
  description: string
  user: string
}

export interface Checklist {
  id: string
  teamId: string
  date: string
  leaderName: string
  discrepancies: number
}

export interface Transfer {
  id: string
  inventoryId: string
  fromTeamId: string
  toTeamId: string
  initiatedBy: string
  initiatedAt: string
  status: 'pending' | 'completed' | 'rejected'
  completedAt?: string
  completedBy?: string
}

export interface AppState {
  users: User[]
  currentUser: User | null
  nodes: TreeNode[]
  teams: Team[]
  inventory: InventoryItem[]
  activities: Activity[]
  history: ToolHistoryEvent[]
  checklists: Checklist[]
  transfers: Transfer[]
}
