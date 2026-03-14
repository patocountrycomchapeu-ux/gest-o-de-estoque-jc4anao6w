import React, { createContext, useContext, useState, useCallback, useMemo } from 'react'
import { AppState, TreeNode, InventoryItem, Condition, ToolStatus, Checklist } from '@/types'
import { initialData } from './mockData'
import { toast } from '@/hooks/use-toast'

interface AddInventoryPayload {
  teamId: string
  treeNodeId: string
  condition: Condition
  assets: string[]
}
interface UpdateInventoryPayload {
  condition?: Condition
  assetNumber?: string
  photos?: string[]
}
interface AuditItems {
  [id: string]: { status: ToolStatus; notes: string }
}
interface ExtraItem {
  assetNumber: string
  notes: string
}

interface AppContextType extends AppState {
  addNode: (node: Omit<TreeNode, 'id'>) => void
  addInventoryItem: (item: AddInventoryPayload) => void
  updateInventoryItem: (id: string, updates: UpdateInventoryPayload) => void
  submitChecklist: (teamId: string, leader: string, items: AuditItems, extra: ExtraItem[]) => void
  getNodePath: (nodeId: string) => TreeNode[]
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(initialData)

  const addNode = useCallback((n: Omit<TreeNode, 'id'>) => {
    const newNode = { ...n, id: `n_${Date.now()}_${Math.floor(Math.random() * 1000)}` }
    setState((p) => ({ ...p, nodes: [...p.nodes, newNode] }))
    toast({ title: 'Nó adicionado', description: `${n.name} criado com sucesso.` })
  }, [])

  const addInventoryItem = useCallback((info: AddInventoryPayload) => {
    setState((prev) => {
      const now = new Date().toISOString()
      const newItems = info.assets.map((asset, i) => ({
        id: `inv_${Date.now()}_${i}`,
        assetNumber: asset,
        teamId: info.teamId,
        treeNodeId: info.treeNodeId,
        condition: info.condition,
        status: 'present' as ToolStatus,
        photos: [],
        lastUpdated: now,
      }))
      const newHistory = newItems.map((item) => ({
        id: `h_${Date.now()}_${item.id}`,
        inventoryId: item.id,
        date: now,
        type: 'allocation' as const,
        description: `Alocado com patrimônio ${item.assetNumber}`,
        user: 'Sistema',
      }))
      return {
        ...prev,
        inventory: [...prev.inventory, ...newItems],
        history: [...newHistory, ...prev.history],
      }
    })
    toast({
      title: 'Instâncias Alocadas',
      description: `${info.assets.length} unidade(s) salva(s).`,
    })
  }, [])

  const updateInventoryItem = useCallback((id: string, updates: UpdateInventoryPayload) => {
    setState((prev) => {
      const item = prev.inventory.find((i) => i.id === id)
      if (!item) return prev
      const now = new Date().toISOString()
      const newHistory = []
      if (updates.condition && updates.condition !== item.condition) {
        newHistory.push({
          id: `h_${Date.now()}_1`,
          inventoryId: id,
          date: now,
          type: 'status_change' as const,
          description: `Condição alterada para ${updates.condition}`,
          user: 'Sistema',
        })
      }
      if (updates.assetNumber && updates.assetNumber !== item.assetNumber) {
        newHistory.push({
          id: `h_${Date.now()}_2`,
          inventoryId: id,
          date: now,
          type: 'system' as const,
          description: `Patrimônio alterado de ${item.assetNumber} para ${updates.assetNumber}`,
          user: 'Sistema',
        })
      }
      const updated = prev.inventory.map((inv) =>
        inv.id === id ? { ...inv, ...updates, lastUpdated: now } : inv,
      )
      return { ...prev, inventory: updated, history: [...newHistory, ...prev.history] }
    })
    toast({ title: 'Item Atualizado', description: 'As alterações foram salvas e registradas.' })
  }, [])

  const submitChecklist = useCallback(
    (teamId: string, leader: string, items: AuditItems, extra: ExtraItem[]) => {
      setState((prev) => {
        const now = new Date().toISOString()
        const newHistory = []
        const updatedInv = prev.inventory.map((inv) => {
          if (inv.teamId === teamId && items[inv.id]) {
            const { status, notes } = items[inv.id]
            if (inv.status !== status || notes) {
              const desc = `Auditado: ${status === 'present' ? 'Presente' : status === 'missing' ? 'Faltando' : 'Emprestado'}${notes ? ` - ${notes}` : ''}`
              newHistory.push({
                id: `h_${Date.now()}_${inv.id}`,
                inventoryId: inv.id,
                date: now,
                type: 'audit' as const,
                description: desc,
                user: leader,
              })
            }
            return {
              ...inv,
              status,
              borrowedTo: status === 'borrowed' ? notes : undefined,
              lastUpdated: now,
            }
          }
          return inv
        })
        extra.forEach((ex, i) => {
          const existing = prev.inventory.find((inv) => inv.assetNumber === ex.assetNumber)
          if (existing)
            newHistory.push({
              id: `hex_${Date.now()}_${i}`,
              inventoryId: existing.id,
              date: now,
              type: 'audit' as const,
              description: `Encontrado sobrando na equipe - ${ex.notes}`,
              user: leader,
            })
        })
        const discrepancies =
          Object.values(items).filter((i) => i.status !== 'present').length + extra.length
        const checklist: Checklist = {
          id: `chk_${Date.now()}`,
          teamId,
          date: now,
          leaderName: leader,
          discrepancies,
        }
        return {
          ...prev,
          inventory: updatedInv,
          history: [...newHistory, ...prev.history],
          checklists: [checklist, ...prev.checklists],
        }
      })
      toast({ title: 'Auditoria Concluída', description: 'O checklist foi salvo no histórico.' })
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
        } else break
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
      updateInventoryItem,
      submitChecklist,
      getNodePath,
    }),
    [state, addNode, addInventoryItem, updateInventoryItem, submitChecklist, getNodePath],
  )
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export const useAppStore = () => {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useAppStore failed')
  return ctx
}
