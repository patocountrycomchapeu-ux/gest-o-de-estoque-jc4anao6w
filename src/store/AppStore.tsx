import React, { createContext, useContext, useState, useMemo, useEffect } from 'react'
import { AppState, InventoryItem, Role, TreeNode, Condition, ToolStatus } from '@/types'
import { supabase } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import { toast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'

export const AppContext = createContext<any>(undefined)
const sync = (t: string, d: any) => supabase.from(t).upsert(d).then()

export function AppProvider({
  children,
  authUser,
}: {
  children: React.ReactNode
  authUser: User | null
}) {
  const [state, setState] = useState<AppState>({
    users: [],
    currentUser: null,
    nodes: [],
    teams: [],
    inventory: [],
    activities: [],
    history: [],
    checklists: [],
    transfers: [],
  })
  const { signOut } = useAuth()

  useEffect(() => {
    if (!authUser) return setState((s) => ({ ...s, currentUser: null }))
    Promise.all(
      ['profiles', 'assets', 'repairs', 'history', 'teams', 'nodes', 'transfers', 'checklists'].map(
        (t) => supabase.from(t).select('*'),
      ),
    ).then((res) => {
      const [profs, asts, reps, hist, tms, nds, trs, chks] = res.map((r) => r.data || [])
      const curr = profs.find((p) => p.id === authUser.id)
      if (!curr?.is_active) {
        signOut()
        return toast({ title: 'Acesso negado', description: 'Conta inativa.' })
      }
      setState((p) => ({
        ...p,
        currentUser: {
          id: curr.id,
          name: curr.full_name,
          email: curr.email,
          role: curr.role,
          active: curr.is_active,
          teamId: curr.team_id,
        },
        users: profs.map((p) => ({
          id: p.id,
          name: p.full_name,
          email: p.email,
          role: p.role,
          active: p.is_active,
          teamId: p.team_id,
        })),
        nodes: nds,
        teams: tms,
        transfers: trs.map((t) => ({
          ...t,
          inventoryId: t.inventory_id,
          fromTeamId: t.from_team_id,
          toTeamId: t.to_team_id,
          initiatedBy: t.initiated_by,
          initiatedAt: t.initiated_at,
          completedAt: t.completed_at,
          completedBy: t.completed_by,
        })),
        checklists: chks.map((c) => ({ ...c, teamId: c.team_id, leaderName: c.leader_name })),
        history: hist.map((h) => ({
          id: h.id,
          inventoryId: h.asset_id,
          date: h.timestamp,
          type: h.type,
          description: h.description,
          user: h.user_name,
          quantity: h.quantity,
        })),
        inventory: asts.map((a) => {
          const r = reps.find((x) => x.asset_id === a.id)
          return {
            id: a.id,
            hasAssetNumber: !a.is_batch,
            assetNumber: a.patrimony_number,
            teamId: a.team_id,
            treeNodeId: a.tree_node_id,
            condition: a.condition,
            status: a.status,
            photos: a.photos,
            price: a.price,
            quantity: a.current_quantity,
            damagedDate: a.damaged_date,
            damagedUser: a.damaged_user,
            repairCost: r?.cost,
            repairLocation: r?.location,
            repairDescription: r?.description,
            repairUser: r?.repair_user,
            repairDate: r?.repair_date,
            conditionCategory: r?.condition_status,
            repairSent: r?.is_sent,
            expectedReturnDate: r?.estimated_completion_date,
          }
        }),
      }))
      if (curr.preferred_theme && curr.preferred_theme !== 'system') {
        document.documentElement.classList.remove('light', 'dark')
        document.documentElement.classList.add(curr.preferred_theme)
      }
    })
  }, [authUser])

  const logHist = (asset_id: string, type: string, desc: string, qty: number = 1) => {
    const h = {
      id: `h_${Date.now()}_${Math.random()}`,
      asset_id,
      timestamp: new Date().toISOString(),
      type,
      description: desc,
      user_name: state.currentUser?.name,
      quantity: qty,
    }
    sync('history', h)
    return h
  }

  const addNode = (n: Omit<TreeNode, 'id'>) => {
    const id = `n_${Date.now()}`
    sync('nodes', { ...n, parent_id: n.parentId, is_grouped: n.isGrouped, id })
    setState((p) => ({ ...p, nodes: [...p.nodes, { ...n, id }] }))
  }

  const addInventoryItem = (info: any) => {
    setState((p) => {
      const now = new Date().toISOString()
      const isG = p.nodes.find((n) => n.id === info.treeNodeId)?.isGrouped
      const inv = [...p.inventory]
      const hist = [...p.history]
      if (isG) {
        const ex = inv.find(
          (i) =>
            i.teamId === info.teamId &&
            i.treeNodeId === info.treeNodeId &&
            i.condition === info.condition &&
            i.status === 'present',
        )
        if (ex) {
          ex.quantity = (ex.quantity || 1) + info.qty
          sync('assets', { id: ex.id, current_quantity: ex.quantity })
        } else {
          const id = `inv_${Date.now()}`
          sync('assets', {
            id,
            team_id: info.teamId,
            tree_node_id: info.treeNodeId,
            condition: info.condition,
            status: 'present',
            current_quantity: info.qty,
            price: info.price || 0,
            is_batch: true,
          })
          inv.push({
            id,
            hasAssetNumber: false,
            teamId: info.teamId,
            treeNodeId: info.treeNodeId,
            condition: info.condition,
            status: 'present',
            photos: [],
            quantity: info.qty,
            price: info.price || 0,
            lastUpdated: now,
          })
          hist.unshift(
            logHist(id, 'allocation', `Alocado lote com ${info.qty} un.`, info.qty) as any,
          )
        }
      } else {
        const total = info.hasAssetNumber ? info.assets.length : info.qty
        Array.from({ length: total }).forEach((_, i) => {
          const id = `inv_${Date.now()}_${i}`
          const asset = info.hasAssetNumber ? info.assets[i] : null
          sync('assets', {
            id,
            team_id: info.teamId,
            tree_node_id: info.treeNodeId,
            condition: info.condition,
            status: 'present',
            current_quantity: 1,
            price: info.price || 0,
            is_batch: !info.hasAssetNumber,
            patrimony_number: asset,
          })
          inv.push({
            id,
            hasAssetNumber: info.hasAssetNumber,
            assetNumber: asset,
            teamId: info.teamId,
            treeNodeId: info.treeNodeId,
            condition: info.condition,
            status: 'present',
            photos: [],
            quantity: 1,
            price: info.price || 0,
            lastUpdated: now,
          })
          hist.unshift(logHist(id, 'allocation', `Alocado`, 1) as any)
        })
      }
      return { ...p, inventory: inv, history: hist }
    })
    toast({ title: 'Salvo' })
  }

  const updateInventoryItem = (id: string, updates: any) => {
    setState((p) => {
      const it = p.inventory.find((i) => i.id === id)
      if (!it) return p
      const nInv = p.inventory.map((i) => (i.id === id ? { ...i, ...updates } : i))
      sync('assets', {
        id,
        condition: updates.condition || it.condition,
        status: updates.status || it.status,
      })
      if (updates.condition === 'repair' || it.condition === 'repair') {
        sync('repairs', {
          asset_id: id,
          is_sent: updates.repairSent,
          estimated_completion_date: updates.expectedReturnDate,
          condition_status: updates.conditionCategory,
          cost: updates.repairCost,
          location: updates.repairLocation,
          description: updates.reason,
          repair_user: p.currentUser?.name,
          repair_date: new Date().toISOString(),
        })
      }
      return {
        ...p,
        inventory: nInv,
        history: [
          logHist(id, 'status_change', `Atualizado. ${updates.reason || ''}`) as any,
          ...p.history,
        ],
      }
    })
    toast({ title: 'Atualizado' })
  }

  const initiateTransfer = (id: string, toTeamId: string, qty?: number) => {
    setState((p) => {
      const it = p.inventory.find((i) => i.id === id)
      if (!it) return p
      let tId = id
      const nInv = [...p.inventory]
      if (qty && it.quantity && qty < it.quantity) {
        nInv.find((i) => i.id === id)!.quantity -= qty
        sync('assets', { id, current_quantity: it.quantity - qty })
        tId = `inv_${Date.now()}_split`
        sync('assets', {
          id: tId,
          is_batch: true,
          current_quantity: qty,
          team_id: it.teamId,
          tree_node_id: it.treeNodeId,
          condition: it.condition,
          status: it.status,
        })
        nInv.push({ ...it, id: tId, quantity: qty })
      }
      const trId = `tr_${Date.now()}`
      sync('transfers', {
        id: trId,
        inventory_id: tId,
        from_team_id: it.teamId,
        to_team_id: toTeamId,
        initiated_by: p.currentUser?.name,
        initiated_at: new Date().toISOString(),
        status: 'pending',
      })
      return {
        ...p,
        inventory: nInv,
        transfers: [
          {
            id: trId,
            inventoryId: tId,
            fromTeamId: it.teamId,
            toTeamId,
            initiatedBy: p.currentUser?.name,
            initiatedAt: new Date().toISOString(),
            status: 'pending',
          },
          ...p.transfers,
        ],
        history: [
          logHist(tId, 'transfer', `Transferência de ${qty || 1} un`, qty || 1) as any,
          ...p.history,
        ],
      }
    })
    toast({ title: 'Transferência iniciada' })
  }

  const resolveTransfer = (
    trId: string,
    action: 'accept' | 'reject',
    cond?: Condition,
    notes?: string,
  ) => {
    setState((p) => {
      const tr = p.transfers.find((t) => t.id === trId)
      if (!tr) return p
      const nInv = p.inventory.map((i) =>
        i.id === tr.inventoryId
          ? {
              ...i,
              teamId: action === 'accept' ? tr.toTeamId : i.teamId,
              condition: action === 'accept' && cond ? cond : i.condition,
            }
          : i,
      )
      sync('transfers', {
        id: trId,
        status: action === 'accept' ? 'completed' : 'rejected',
        completed_at: new Date().toISOString(),
        completed_by: p.currentUser?.name,
      })
      if (action === 'accept')
        sync('assets', { id: tr.inventoryId, team_id: tr.toTeamId, condition: cond || 'good' })
      return {
        ...p,
        inventory: nInv,
        transfers: p.transfers.map((t) =>
          t.id === trId ? { ...t, status: action === 'accept' ? 'completed' : 'rejected' } : t,
        ),
        history: [
          logHist(
            tr.inventoryId,
            'transfer',
            action === 'accept' ? 'Recebido' : 'Rejeitado',
          ) as any,
          ...p.history,
        ],
      }
    })
    toast({ title: 'Ação confirmada' })
  }

  const updateUserRole = (id: string, role: Role) => {
    setState((p) => ({ ...p, users: p.users.map((u) => (u.id === id ? { ...u, role } : u)) }))
    sync('profiles', { id, role })
    toast({ title: 'Atualizado' })
  }
  const toggleUserStatus = (id: string) => {
    setState((p) => {
      const act = !p.users.find((u) => u.id === id)?.active
      sync('profiles', { id, is_active: act })
      return { ...p, users: p.users.map((u) => (u.id === id ? { ...u, active: act } : u)) }
    })
    toast({ title: 'Atualizado' })
  }

  const getNodePath = (nodeId: string) => {
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
  }

  const adjustGroupedItem = () => {}
  const submitChecklist = () => {}
  const logout = () => signOut()

  const val = useMemo(
    () => ({
      ...state,
      addNode,
      addInventoryItem,
      updateInventoryItem,
      initiateTransfer,
      resolveTransfer,
      updateUserRole,
      toggleUserStatus,
      getNodePath,
      adjustGroupedItem,
      submitChecklist,
      logout,
    }),
    [state],
  )
  return <AppContext.Provider value={val}>{children}</AppContext.Provider>
}

export const useAppStore = () => {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useAppStore failed')
  return ctx
}
