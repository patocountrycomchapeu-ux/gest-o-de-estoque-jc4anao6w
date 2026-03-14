export type Condition = 'good' | 'damaged' | 'repair'
export type TreeLevel = 'departamento' | 'secao' | 'categoria' | 'item' | 'marca'

export interface TreeNode {
  id: string
  name: string
  level: TreeLevel
  parentId: string | null
}

export interface InventoryItem {
  id: string
  teamId: string
  treeNodeId: string // References a TreeNode of level 'marca'
  condition: Condition
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

export interface AppState {
  nodes: TreeNode[]
  teams: Team[]
  inventory: InventoryItem[]
  activities: Activity[]
}
