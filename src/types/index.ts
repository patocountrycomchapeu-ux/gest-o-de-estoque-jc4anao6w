export type Condition = 'good' | 'damaged' | 'repair'
export type ToolStatus =
  | 'present'
  | 'missing'
  | 'borrowed'
  | 'in_maintenance'
  | 'defect_stock'
  | 'returned_to_team'
export type TreeLevel = 'departamento' | 'categoria' | 'linha' | 'tipo' | 'marca' | 'produto'
export type Role =
  | 'Gestor'
  | 'Gerente'
  | 'Supervisor'
  | 'Membro Comum'
  | 'Encarregado Gestor'
  | 'Encarregado'
  | 'Analista'
  | 'Visualizador'

export interface User {
  id: string
  name: string
  email: string
  role: Role
  teamId?: string
  active: boolean
  theme?: string
}
export type TreeNode =
  | { id: string; name: string; level: 'departamento'; parentId: null; isGrouped?: boolean }
  | { id: string; name: string; level: 'categoria'; parentId: string; isGrouped?: boolean }
  | { id: string; name: string; level: 'linha'; parentId: string; isGrouped?: boolean }
  | { id: string; name: string; level: 'tipo'; parentId: string; isGrouped?: boolean }
  | { id: string; name: string; level: 'marca'; parentId: string; isGrouped?: boolean }
  | { id: string; name: string; level: 'produto'; parentId: string; isGrouped?: boolean }

export interface RepairSupplier {
  id: string
  name: string
  cnpj: string
  currentBalance: number
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
  supplierId?: string
  repairLocation?: string
  repairDescription?: string
  repairUser?: string
  repairDate?: string
  damagedDate?: string
  damagedUser?: string
  quantity?: number
  conditionCategory?: string
  repairSent?: boolean
  expectedReturnDate?: string
  responsibleId?: string
}

export interface Team {
  id: string
  name: string
  description: string
  location: string
  managerId?: string
  managerName?: string
}

export interface AddNodePayload {
  name: string
  level: TreeLevel
  parentId: string | null
  isGrouped?: boolean
}

export interface AddInventoryPayload {
  teamId: string
  treeNodeId: string
  condition: Condition
  qty: number
  price?: number
  hasAssetNumber: boolean
  assets?: string[]
  photos?: string[]
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
  totalChecked?: number
}
export interface Transfer {
  id: string
  inventoryId: string
  fromTeamId: string
  toTeamId: string
  initiatedBy: string
  initiatedAt: string
  status: 'pending' | 'in_transit' | 'completed' | 'rejected'
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
  suppliers: RepairSupplier[]
}
