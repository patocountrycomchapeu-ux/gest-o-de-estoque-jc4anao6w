import React, { createContext, useContext, useState, useCallback, useMemo } from 'react'
import { AppState, TreeNode, Condition, ToolStatus, Checklist } from '@/types'
import { initialData } from './mockData'
import { toast } from '@/hooks/use-toast'

interface AddInventoryPayload {
  teamId: string
  treeNodeId: string
  condition: Condition
  hasAssetNumber: boolean
  assets: string[]
  qty: number
}

interface UpdateInventoryPayload {
  condition?: Condition
  hasAssetNumber?: boolean
  assetNumber?: string
  photos?: string[]
}

interface AppContextType extends AppState {
  setCurrentUser: (userId: string) => void
  addNode: (node: Omit<TreeNode, 'id'>) => void
  addInventoryItem: (item: AddInventoryPayload) => void
  updateInventoryItem: (id: string, updates: UpdateInventoryPayload) => void
  submitChecklist: (teamId: string, items: any, extra: any[]) => void
  getNodePath: (nodeId: string) => TreeNode[]
  initiateTransfer: (inventoryId: string, toTeamId: string) => void
  resolveTransfer: (
    trId: string,
    action: 'accept' | 'reject',
    cond?: Condition,
    notes?: string,
  ) => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(initialData)

  const setCurrentUser = useCallback((userId: string) => {
    setState((p) => ({ ...p, currentUser: p.users.find((u) => u.id === userId) || p.currentUser }))
  }, [])

  const addNode = useCallback((n: Omit<TreeNode, 'id'>) => {
    setState((p) => ({ ...p, nodes: [...p.nodes, { ...n, id: `n_${Date.now()}` }] }))
  }, [])

  const addInventoryItem = useCallback((info: AddInventoryPayload) => {
    setState((prev) => {
      const now = new Date().toISOString()
      const total = info.hasAssetNumber ? info.assets.length : info.qty
      const newItems = Array.from({ length: total }).map((_, i) => ({
        id: `inv_${Date.now()}_${i}`,
        hasAssetNumber: info.hasAssetNumber,
        assetNumber: info.hasAssetNumber ? info.assets[i] : undefined,
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
        description: `Alocado ${item.hasAssetNumber ? `com patrimônio ${item.assetNumber}` : 'sem patrimônio'}`,
        user: prev.currentUser.name,
      }))
      return {
        ...prev,
        inventory: [...prev.inventory, ...newItems],
        history: [...newHistory, ...prev.history],
      }
    })
    toast({ title: 'Instâncias Alocadas', description: 'Salvas com sucesso.' })
  }, [])

  const updateInventoryItem = useCallback((id: string, updates: UpdateInventoryPayload) => {
    setState((prev) => {
      const now = new Date().toISOString()
      return {
        ...prev,
        inventory: prev.inventory.map((inv) =>
          inv.id === id ? { ...inv, ...updates, lastUpdated: now } : inv,
        ),
      }
    })
    toast({ title: 'Item Atualizado' })
  }, [])

  const initiateTransfer = useCallback((inventoryId: string, toTeamId: string) => {
    setState((prev) => {
      const item = prev.inventory.find((i) => i.id === inventoryId)
      if (!item) return prev
      const transfer = {
        id: `tr_${Date.now()}`,
        inventoryId,
        fromTeamId: item.teamId,
        toTeamId,
        initiatedBy: prev.currentUser.name,
        initiatedAt: new Date().toISOString(),
        status: 'pending' as const,
      }
      return { ...prev, transfers: [transfer, ...prev.transfers] }
    })
    toast({
      title: 'Transferência Iniciada',
      description: 'Aguardando validação da equipe de destino.',
    })
  }, [])

  const resolveTransfer = useCallback(
    (trId: string, action: 'accept' | 'reject', cond?: Condition, notes?: string) => {
      setState((prev) => {
        const tr = prev.transfers.find((t) => t.id === trId)
        if (!tr) return prev
        const now = new Date().toISOString()
        const isAccept = action === 'accept'
        const desc = isAccept
          ? `Transferência recebida. Estado confirmado: ${cond}`
          : `Transferência rejeitada. Motivo: ${notes}`

        return {
          ...prev,
          transfers: prev.transfers.map((t) =>
            t.id === trId
              ? {
                  ...t,
                  status: isAccept ? 'completed' : 'rejected',
                  completedAt: now,
                  completedBy: prev.currentUser.name,
                }
              : t,
          ),
          inventory: prev.inventory.map((i) =>
            i.id === tr.inventoryId
              ? {
                  ...i,
                  teamId: isAccept ? tr.toTeamId : i.teamId,
                  condition: isAccept && cond ? cond : i.condition,
                  lastUpdated: now,
                }
              : i,
          ),
          history: [
            {
              id: `h_${Date.now()}`,
              inventoryId: tr.inventoryId,
              date: now,
              type: 'transfer' as const,
              description: desc,
              user: prev.currentUser.name,
            },
            ...prev.history,
          ],
        }
      })
      toast({ title: action === 'accept' ? 'Recebimento Confirmado' : 'Transferência Rejeitada' })
    },
    [],
  )

  const submitChecklist = useCallback((teamId: string, items: any, extra: any[]) => {
    setState((prev) => {
      const chk: Checklist = {
        id: `chk_${Date.now()}`,
        teamId,
        date: new Date().toISOString(),
        leaderName: prev.currentUser.name,
        discrepancies: 0,
      }
      return { ...prev, checklists: [chk, ...prev.checklists] }
    })
  }, [])

  const getNodePath = useCallback(
    (nodeId: string) => {
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
      setCurrentUser,
      addNode,
      addInventoryItem,
      updateInventoryItem,
      initiateTransfer,
      resolveTransfer,
      submitChecklist,
      getNodePath,
    }),
    [state],
  )
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export const useAppStore = () => {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useAppStore failed')
  return ctx
}
