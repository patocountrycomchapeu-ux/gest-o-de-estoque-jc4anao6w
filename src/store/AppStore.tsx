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
  price?: number
}

interface UpdateInventoryPayload {
  condition?: Condition
  status?: ToolStatus
  hasAssetNumber?: boolean
  assetNumber?: string
  photos?: string[]
  reason?: string
}

interface AppContextType extends AppState {
  login: (email: string, pass: string) => boolean
  logout: () => void
  addNode: (node: Omit<TreeNode, 'id'>) => void
  addInventoryItem: (item: AddInventoryPayload) => void
  updateInventoryItem: (id: string, updates: UpdateInventoryPayload) => void
  submitChecklist: (
    teamId: string,
    leaderName: string,
    items: Record<string, { status: ToolStatus; notes: string }>,
    extra: { assetNumber: string; notes: string; treeNodeId: string; photo: string }[],
  ) => void
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
  const [state, setState] = useState<AppState>(() => {
    const savedUserId = localStorage.getItem('auth_user')
    const initUser = initialData.users.find((u) => u.id === savedUserId) || null
    return { ...initialData, currentUser: initUser }
  })

  const login = useCallback(
    (email: string, pass: string) => {
      const user = state.users.find((u) => u.email === email && u.password === pass)
      if (user) {
        localStorage.setItem('auth_user', user.id)
        setState((p) => ({ ...p, currentUser: user }))
        toast({ title: 'Login realizado com sucesso' })
        return true
      }
      return false
    },
    [state.users],
  )

  const logout = useCallback(() => {
    localStorage.removeItem('auth_user')
    setState((p) => ({ ...p, currentUser: null }))
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
        price: info.price || 0,
      }))
      const newHistory = newItems.map((item) => ({
        id: `h_${Date.now()}_${item.id}`,
        inventoryId: item.id,
        date: now,
        type: 'allocation' as const,
        description: `Alocado ${item.hasAssetNumber ? `com patrimônio ${item.assetNumber}` : 'sem patrimônio'}`,
        user: prev.currentUser?.name || 'Sistema',
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
      const item = prev.inventory.find((i) => i.id === id)
      const newHistory = []

      if (item) {
        if (updates.condition && updates.condition !== item.condition) {
          newHistory.push({
            id: `h_${Date.now()}_cond`,
            inventoryId: id,
            date: now,
            type: 'status_change' as const,
            description: `Condição alterada para ${updates.condition}${updates.reason ? `. Motivo: ${updates.reason}` : ''}`,
            user: prev.currentUser?.name || 'Sistema',
          })
        }
        if (updates.status && updates.status !== item.status) {
          const statusLabels: Record<string, string> = {
            present: 'Em Uso na Equipe',
            missing: 'Faltando / Extraviado',
            borrowed: 'Emprestado',
            in_maintenance: 'Em Manutenção',
            defect_stock: 'Estoque de Defeito',
            returned_to_team: 'Devolvido para a Equipe',
          }
          newHistory.push({
            id: `h_${Date.now()}_status`,
            inventoryId: id,
            date: now,
            type: 'status_change' as const,
            description: `Destino/Status alterado para ${statusLabels[updates.status] || updates.status}${updates.reason ? `. Motivo/Observação: ${updates.reason}` : ''}`,
            user: prev.currentUser?.name || 'Sistema',
          })
        }
      }

      return {
        ...prev,
        inventory: prev.inventory.map((inv) =>
          inv.id === id ? { ...inv, ...updates, lastUpdated: now } : inv,
        ),
        history: [...newHistory, ...prev.history],
      }
    })
    toast({ title: 'Item Atualizado e Registrado no Histórico' })
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
        initiatedBy: prev.currentUser?.name || 'Sistema',
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
                  completedBy: prev.currentUser?.name || 'Sistema',
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
              user: prev.currentUser?.name || 'Sistema',
            },
            ...prev.history,
          ],
        }
      })
      toast({ title: action === 'accept' ? 'Recebimento Confirmado' : 'Transferência Rejeitada' })
    },
    [],
  )

  const submitChecklist = useCallback(
    (
      teamId: string,
      leaderName: string,
      items: Record<string, { status: ToolStatus; notes: string }>,
      extra: { assetNumber: string; notes: string; treeNodeId: string; photo: string }[],
    ) => {
      setState((prev) => {
        const now = new Date().toISOString()
        const chk: Checklist = {
          id: `chk_${Date.now()}`,
          teamId,
          date: now,
          leaderName: leaderName || prev.currentUser?.name || 'Sistema',
          discrepancies: 0,
        }

        const newInventory = [...prev.inventory]
        const newHistory = [...prev.history]

        extra.forEach((ex, i) => {
          const id = `inv_ex_${Date.now()}_${i}`
          newInventory.push({
            id,
            hasAssetNumber: !!ex.assetNumber,
            assetNumber: ex.assetNumber || undefined,
            teamId,
            treeNodeId: ex.treeNodeId,
            condition: 'good',
            status: 'present',
            photos: [ex.photo],
            lastUpdated: now,
            price: 0,
          })

          newHistory.push({
            id: `h_ex_${Date.now()}_${i}`,
            inventoryId: id,
            date: now,
            type: 'audit',
            description: `Sobra identificada em auditoria (Item Adicional). ${ex.notes ? `Origem/Obs: ${ex.notes}` : ''}`,
            user: leaderName || prev.currentUser?.name || 'Sistema',
          })
        })

        return {
          ...prev,
          checklists: [chk, ...prev.checklists],
          inventory: newInventory,
          history: newHistory.sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
          ),
        }
      })
      toast({ title: 'Auditoria Finalizada', description: 'Inventário e histórico atualizados.' })
    },
    [],
  )

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
      login,
      logout,
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
