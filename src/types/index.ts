export type Condition = 'good' | 'damaged' | 'repair'
export type TreeLevel = 'marca' | 'departamento' | 'categoria' | 'subcategoria' | 'item'

export interface TreeNode {
  id: string
  name: string
  level: TreeLevel
  parentId: string | null
}

export interface InventoryItem {
  id: string
  teamId: string
  treeNodeId: string // References a TreeNode of level 'item'
  condition: Condition
  quantity: number
  photoUrl?: string
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

export interface AppState {
  nodes: TreeNode[]
  teams: Team[]
  inventory: InventoryItem[]
  activities: Activity[]
}
