import React, { createContext, useContext, useState, useCallback, useMemo } from 'react'
import { AppState, TreeNode, Condition, ToolStatus, Checklist, InventoryItem, Role } from '@/types'
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
  repairCost?: number
  repairLocation?: string
  conditionCategory?: string
  repairSent?: boolean
  expectedReturnDate?: string
}

interface AppContextType extends AppState {
  login: (email: string) => void
  verifyOtp: (email: string, otp: string) => 'success' | 'invalid' | 'inactive'
  logout: () => void
  addNode: (node: Omit<TreeNode, 'id'>) => void
  addInventoryItem: (item: AddInventoryPayload) => void
  updateInventoryItem: (id: string, updates: UpdateInventoryPayload) => void
  adjustGroupedItem: (
    id: string,
    removeQty: number,
    reason: string,
    destStatus: ToolStatus | 'removed',
    destCondition: Condition,
  ) => void
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
  updateUserRole: (id: string, role: Role) => void
  toggleUserStatus: (id: string) => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(() => {
    const savedUserId = localStorage.getItem('auth_user')
    const initUser = initialData.users.find((u) => u.id === savedUserId) || null
    return { ...initialData, currentUser: initUser }
  })

  const login = useCallback((email: string) => {
    // Simulated magic link / OTP sending
  }, [])

  const verifyOtp = useCallback(
    (email: string, otp: string): 'success' | 'invalid' | 'inactive' => {
      if (otp !== '123456') return 'invalid'

      let result: 'success' | 'inactive' = 'success'

      setState((prev) => {
        let user = prev.users.find((u) => u.email === email)
        if (!user) {
          user = {
            id: `u_${Date.now()}`,
            name: email.split('@')[0],
            email,
            role: 'Visualizador',
            active: true,
          }
          localStorage.setItem('auth_user', user.id)
          return { ...prev, currentUser: user, users: [...prev.users, user] }
        }

        if (!user.active) {
          result = 'inactive'
          return prev
        }

        localStorage.setItem('auth_user', user.id)
        return { ...prev, currentUser: user }
      })

      if (result === 'success') {
        toast({ title: 'Acesso validado com sucesso' })
      }
      return result
    },
    [],
  )

  const logout = useCallback(() => {
    localStorage.removeItem('auth_user')
    setState((p) => ({ ...p, currentUser: null }))
  }, [])

  const updateUserRole = useCallback((id: string, role: Role) => {
    setState((prev) => ({
      ...prev,
      users: prev.users.map((u) => (u.id === id ? { ...u, role } : u)),
    }))
    toast({ title: 'Papel atualizado com sucesso' })
  }, [])

  const toggleUserStatus = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      users: prev.users.map((u) => (u.id === id ? { ...u, active: !u.active } : u)),
    }))
    toast({ title: 'Status do usuário atualizado' })
  }, [])

  const addNode = useCallback((n: Omit<TreeNode, 'id'>) => {
    setState((p) => ({ ...p, nodes: [...p.nodes, { ...n, id: `n_${Date.now()}` }] }))
  }, [])

  const addInventoryItem = useCallback((info: AddInventoryPayload) => {
    setState((prev) => {
      const now = new Date().toISOString()
      const node = prev.nodes.find((n) => n.id === info.treeNodeId)
      const isGrouped = node?.isGrouped

      if (isGrouped) {
        const existingIdx = prev.inventory.findIndex(
          (i) =>
            i.teamId === info.teamId &&
            i.treeNodeId === info.treeNodeId &&
            i.condition === info.condition &&
            i.status === 'present',
        )

        const newHistory = [...prev.history]
        const newInventory = [...prev.inventory]

        if (existingIdx >= 0) {
          const ex = newInventory[existingIdx]
          newInventory[existingIdx] = {
            ...ex,
            quantity: (ex.quantity || 1) + info.qty,
            lastUpdated: now,
          }
          newHistory.unshift({
            id: `h_${Date.now()}`,
            inventoryId: ex.id,
            date: now,
            type: 'allocation',
            description: `Adicionado ${info.qty} unidades ao lote.`,
            user: prev.currentUser?.name || 'Sistema',
          })
        } else {
          const newId = `inv_${Date.now()}_0`
          newInventory.push({
            id: newId,
            hasAssetNumber: false,
            teamId: info.teamId,
            treeNodeId: info.treeNodeId,
            condition: info.condition,
            status: 'present',
            photos: [],
            lastUpdated: now,
            price: info.price || 0,
            quantity: info.qty,
          })
          newHistory.unshift({
            id: `h_${Date.now()}`,
            inventoryId: newId,
            date: now,
            type: 'allocation',
            description: `Alocado lote com ${info.qty} unidades.`,
            user: prev.currentUser?.name || 'Sistema',
          })
        }

        return { ...prev, inventory: newInventory, history: newHistory }
      }

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
        quantity: 1,
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
      if (!item) return prev

      const newHistory = []
      let extraItemUpdates: Partial<InventoryItem> = {}

      if (updates.repairCost !== undefined) extraItemUpdates.repairCost = updates.repairCost
      if (updates.repairLocation !== undefined)
        extraItemUpdates.repairLocation = updates.repairLocation
      if (updates.conditionCategory !== undefined)
        extraItemUpdates.conditionCategory = updates.conditionCategory
      if (updates.repairSent !== undefined) extraItemUpdates.repairSent = updates.repairSent
      if (updates.expectedReturnDate !== undefined)
        extraItemUpdates.expectedReturnDate = updates.expectedReturnDate

      if (updates.condition && updates.condition !== item.condition) {
        const isToRepair = updates.condition === 'repair'
        const isToDamaged = updates.condition === 'damaged'

        let desc = `Condição alterada de ${item.condition} para ${updates.condition}.`
        if (updates.reason) desc += ` Motivo: ${updates.reason}.`
        if (updates.conditionCategory) desc += ` Categoria: ${updates.conditionCategory}.`

        if (isToRepair) {
          extraItemUpdates.repairDescription = updates.reason
          extraItemUpdates.repairUser = prev.currentUser?.name || 'Sistema'
          extraItemUpdates.repairDate = now
          if (updates.repairLocation) desc += ` Local: ${updates.repairLocation}.`
          if (updates.repairCost !== undefined) desc += ` Custo: R$${updates.repairCost}.`
        } else if (item.condition === 'repair') {
          extraItemUpdates.repairCost = undefined
          extraItemUpdates.repairLocation = undefined
          extraItemUpdates.repairDescription = undefined
          extraItemUpdates.repairUser = undefined
          extraItemUpdates.repairDate = undefined
          extraItemUpdates.repairSent = undefined
          extraItemUpdates.expectedReturnDate = undefined
        }

        if (isToDamaged) {
          extraItemUpdates.damagedDate = now
          extraItemUpdates.damagedUser = prev.currentUser?.name || 'Sistema'
        } else if (item.condition === 'damaged') {
          extraItemUpdates.damagedDate = undefined
          extraItemUpdates.damagedUser = undefined
        }

        newHistory.push({
          id: `h_${Date.now()}_cond`,
          inventoryId: id,
          date: now,
          type: 'status_change' as const,
          description: desc,
          user: prev.currentUser?.name || 'Sistema',
        })
      }

      if (!updates.condition || updates.condition === item.condition) {
        if (
          item.condition === 'repair' &&
          (updates.repairCost !== undefined ||
            updates.repairLocation !== undefined ||
            updates.repairSent !== undefined ||
            updates.expectedReturnDate !== undefined ||
            updates.conditionCategory !== undefined)
        ) {
          let updatedFields = []
          if (updates.repairCost !== undefined && updates.repairCost !== item.repairCost)
            updatedFields.push(`Custo para R$${updates.repairCost}`)
          if (
            updates.repairLocation !== undefined &&
            updates.repairLocation !== item.repairLocation
          )
            updatedFields.push(`Local para ${updates.repairLocation}`)
          if (updates.repairSent !== undefined && updates.repairSent !== item.repairSent)
            updatedFields.push(`Envio alterado: ${updates.repairSent ? 'Enviado' : 'Pendente'}`)
          if (
            updates.expectedReturnDate !== undefined &&
            updates.expectedReturnDate !== item.expectedReturnDate
          )
            updatedFields.push(`Retorno para ${updates.expectedReturnDate}`)
          if (
            updates.conditionCategory !== undefined &&
            updates.conditionCategory !== item.conditionCategory
          )
            updatedFields.push(`Categoria para ${updates.conditionCategory}`)

          if (updatedFields.length > 0) {
            newHistory.push({
              id: `h_${Date.now()}_repair_upd`,
              inventoryId: id,
              date: now,
              type: 'status_change' as const,
              description: `Atualização de Reparo: ${updatedFields.join(', ')}.${updates.reason ? ` Obs: ${updates.reason}` : ''}`,
              user: prev.currentUser?.name || 'Sistema',
            })
          }
        } else if (
          item.condition === 'damaged' &&
          updates.conditionCategory !== undefined &&
          updates.conditionCategory !== item.conditionCategory
        ) {
          newHistory.push({
            id: `h_${Date.now()}_dmg_upd`,
            inventoryId: id,
            date: now,
            type: 'status_change' as const,
            description: `Categoria de Dano atualizada para ${updates.conditionCategory}.${updates.reason ? ` Obs: ${updates.reason}` : ''}`,
            user: prev.currentUser?.name || 'Sistema',
          })
        }
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

      return {
        ...prev,
        inventory: prev.inventory.map((inv) =>
          inv.id === id ? { ...inv, ...updates, ...extraItemUpdates, lastUpdated: now } : inv,
        ),
        history: [...newHistory, ...prev.history],
      }
    })
    toast({ title: 'Item Atualizado e Registrado no Histórico' })
  }, [])

  const adjustGroupedItem = useCallback(
    (
      id: string,
      removeQty: number,
      reason: string,
      destStatus: ToolStatus | 'removed',
      destCondition: Condition,
    ) => {
      setState((prev) => {
        const item = prev.inventory.find((i) => i.id === id)
        if (!item || (item.quantity || 1) < removeQty) return prev

        const now = new Date().toISOString()
        const newHistory = [...prev.history]
        const newInventory = [...prev.inventory]

        const itemIndex = newInventory.findIndex((i) => i.id === id)
        const newQty = (item.quantity || 1) - removeQty

        if (newQty === 0 && destStatus === 'removed') {
          newInventory.splice(itemIndex, 1)
        } else {
          newInventory[itemIndex] = { ...item, quantity: newQty, lastUpdated: now }
        }

        newHistory.unshift({
          id: `h_${Date.now()}_adj1`,
          inventoryId: id,
          date: now,
          type: 'status_change',
          description: `Ajuste de Lote: Removidas ${removeQty} un. Destino: ${destStatus === 'removed' ? 'Baixa' : destStatus}. Motivo: ${reason}`,
          user: prev.currentUser?.name || 'Sistema',
        })

        if (destStatus !== 'removed') {
          const existingDestIdx = newInventory.findIndex(
            (i) =>
              i.teamId === item.teamId &&
              i.treeNodeId === item.treeNodeId &&
              i.condition === destCondition &&
              i.status === destStatus &&
              i.hasAssetNumber === false,
          )

          if (existingDestIdx >= 0) {
            const ex = newInventory[existingDestIdx]
            newInventory[existingDestIdx] = {
              ...ex,
              quantity: (ex.quantity || 1) + removeQty,
              lastUpdated: now,
            }
            newHistory.unshift({
              id: `h_${Date.now()}_adj2`,
              inventoryId: ex.id,
              date: now,
              type: 'status_change',
              description: `Recebido ${removeQty} un. do ajuste. Motivo: ${reason}`,
              user: prev.currentUser?.name || 'Sistema',
            })
          } else {
            const newId = `inv_dest_${Date.now()}`
            newInventory.push({
              ...item,
              id: newId,
              condition: destCondition,
              status: destStatus as ToolStatus,
              quantity: removeQty,
              lastUpdated: now,
              photos: [],
            })
            newHistory.unshift({
              id: `h_${Date.now()}_adj3`,
              inventoryId: newId,
              date: now,
              type: 'allocation',
              description: `Lote criado por ajuste (${removeQty} un). Motivo: ${reason}`,
              user: prev.currentUser?.name || 'Sistema',
            })
          }
        }

        return { ...prev, inventory: newInventory, history: newHistory }
      })
      toast({ title: 'Ajuste Realizado', description: 'Quantidades atualizadas com sucesso.' })
    },
    [],
  )

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
            quantity: 1,
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
      verifyOtp,
      logout,
      addNode,
      addInventoryItem,
      updateInventoryItem,
      adjustGroupedItem,
      initiateTransfer,
      resolveTransfer,
      submitChecklist,
      getNodePath,
      updateUserRole,
      toggleUserStatus,
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
