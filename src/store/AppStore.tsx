import React, { createContext, useContext, useState, useCallback, useMemo } from 'react'
import { AppState, TreeNode, Team, InventoryItem, Activity, Condition } from '@/types'
import { initialData } from './mockData'
import { toast } from '@/hooks/use-toast'

interface AppContextType extends AppState {
  addNode: (node: Omit<TreeNode, 'id'>) => void
  addInventoryItem: (item: Omit<InventoryItem, 'id' | 'lastUpdated'>) => void
  updateInventoryCondition: (id: string, condition: Condition, photoUrl?: string) => void
  getNodePath: (nodeId: string) => TreeNode[]
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(initialData)

  const addNode = useCallback((nodeInfo: Omit<TreeNode, 'id'>) => {
    const newNode: TreeNode = { ...nodeInfo, id: `n_${Date.now()}` }
    setState((prev) => ({ ...prev, nodes: [...prev.nodes, newNode] }))
    toast({ title: 'Nó adicionado', description: `${nodeInfo.name} foi criado com sucesso.` })
  }, [])

  const addInventoryItem = useCallback((itemInfo: Omit<InventoryItem, 'id' | 'lastUpdated'>) => {
    const newItem: InventoryItem = {
      ...itemInfo,
      id: `inv_${Date.now()}`,
      lastUpdated: new Date().toISOString(),
    }
    setState((prev) => {
      const node = prev.nodes.find((n) => n.id === itemInfo.treeNodeId)
      const team = prev.teams.find((t) => t.id === itemInfo.teamId)
      const activity: Activity = {
        id: `act_${Date.now()}`,
        date: new Date().toISOString(),
        description: `${itemInfo.quantity}x '${node?.name}' alocado(s) para ${team?.name}.`,
        type: 'allocation',
      }
      return {
        ...prev,
        inventory: [...prev.inventory, newItem],
        activities: [activity, ...prev.activities],
      }
    })
    toast({ title: 'Item Alocado', description: 'O item foi vinculado à equipe.' })
  }, [])

  const updateInventoryCondition = useCallback(
    (id: string, condition: Condition, photoUrl?: string) => {
      setState((prev) => {
        const currentItem = prev.inventory.find((i) => i.id === id)
        if (!currentItem) return prev

        const updatedInventory = prev.inventory.map((item) =>
          item.id === id
            ? {
                ...item,
                condition,
                photoUrl: photoUrl || item.photoUrl,
                lastUpdated: new Date().toISOString(),
              }
            : item,
        )

        const node = prev.nodes.find((n) => n.id === currentItem.treeNodeId)
        const team = prev.teams.find((t) => t.id === currentItem.teamId)
        const condMap = { good: 'Bom', damaged: 'Danificado', repair: 'Para Reparo' }

        const activity: Activity = {
          id: `act_${Date.now()}`,
          date: new Date().toISOString(),
          description: `${team?.name} atualizou '${node?.name}' para ${condMap[condition]}.`,
          type: 'status_change',
        }

        return { ...prev, inventory: updatedInventory, activities: [activity, ...prev.activities] }
      })
      toast({ title: 'Status Atualizado', description: 'A condição do item foi salva.' })
    },
    [],
  )

  const getNodePath = useCallback(
    (nodeId: string): TreeNode[] => {
      const path: TreeNode[] = []
      let currentId: string | null = nodeId
      while (currentId) {
        const node = state.nodes.find((n) => n.id === currentId)
        if (node) {
          path.unshift(node)
          currentId = node.parentId
        } else {
          break
        }
      }
      return path
    },
    [state.nodes],
  )

  const value = useMemo(
    () => ({
      ...state,
      addNode,
      addInventoryItem,
      updateInventoryCondition,
      getNodePath,
    }),
    [state, addNode, addInventoryItem, updateInventoryCondition, getNodePath],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useAppStore() {
  const context = useContext(AppContext)
  if (!context) throw new Error('useAppStore must be used within AppProvider')
  return context
}
