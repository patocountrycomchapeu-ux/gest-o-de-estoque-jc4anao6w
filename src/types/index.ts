export type Condition = 'good' | 'damaged' | 'repair'
export type ToolStatus = 'present' | 'missing' | 'borrowed'
export type TreeLevel = 'departamento' | 'secao' | 'categoria' | 'item' | 'marca'

export interface TreeNode {
  id: string
  name: string
  level: TreeLevel
  parentId: string | null
}

export interface InventoryItem {
  id: string
  assetNumber: string
  teamId: string
  treeNodeId: string // References a TreeNode of level 'marca'
  condition: Condition
  status: ToolStatus
  borrowedTo?: string
  photos: string[]
  lastUpdated: string
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
  type: 'allocation' | 'status_change' | 'audit' | 'system'
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

export interface AppState {
  nodes: TreeNode[]
  teams: Team[]
  inventory: InventoryItem[]
  activities: Activity[]
  history: ToolHistoryEvent[]
  checklists: Checklist[]
}
