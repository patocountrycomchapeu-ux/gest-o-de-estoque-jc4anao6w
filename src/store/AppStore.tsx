import React, { createContext, useContext, useState, useMemo, useEffect } from 'react'
import { AppState, Role, TreeNode, Condition, ToolStatus } from '@/types'
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
    suppliers: [],
  })
  const { signOut } = useAuth()

  useEffect(() => {
    if (!authUser) return setState((s) => ({ ...s, currentUser: null }))
    Promise.all(
      [
        'profiles',
        'assets',
        'repairs',
        'history',
        'teams',
        'nodes',
        'transfers',
        'checklists',
        'repair_suppliers',
      ].map((t) => supabase.from(t).select('*')),
    ).then((res) => {
      const [profs, asts, reps, hist, tms, nds, trs, chks, supps] = res.map((r) => r.data || [])
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
        suppliers: supps.map((s) => ({
          id: s.id,
          name: s.name,
          cnpj: s.cnpj,
          currentBalance: Number(s.current_balance || 0),
        })),
        transfers: trs.map((t) => ({
          id: t.id,
          inventoryId: t.inventory_id,
          fromTeamId: t.from_team_id,
          toTeamId: t.to_team_id,
          initiatedBy: t.initiated_by,
          initiatedAt: t.initiated_at,
          completedAt: t.completed_at,
          completedBy: t.completed_by,
          status: t.status,
        })),
        checklists: chks.map((c) => ({
          id: c.id,
          teamId: c.team_id,
          leaderName: c.leader_name,
          date: c.date,
          discrepancies: c.discrepancies,
          totalChecked: c.total_checked,
        })),
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
            supplierId: r?.supplier_id,
            repairDescription: r?.description,
            repairUser: r?.repair_user,
            repairDate: r?.repair_date,
            conditionCategory: r?.condition_status,
            repairSent: r?.is_sent,
            expectedReturnDate: r?.estimated_completion_date,
          }
        }),
        activities: hist
          .slice(0, 50)
          .map((h) => ({
            id: h.id,
            date: h.timestamp,
            description: h.description,
            type: h.type as any,
          })),
      }))
      if (curr.preferred_theme && curr.preferred_theme !== 'system') {
        document.documentElement.classList.remove('light', 'dark')
        document.documentElement.classList.add(curr.preferred_theme)
      }
    })
  }, [authUser])

  const logHist = (asset_id: string, type: string, desc: string, qty: number = 1) => {
    const h = {
      id: `h_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
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

  const addNode = (n: any) => {
    const id = `n_${Date.now()}`
    sync('nodes', { ...n, parent_id: n.parentId, is_grouped: n.isGrouped, id })
    setState((p) => ({ ...p, nodes: [...p.nodes, { ...n, id }] }))
  }

  const addInventoryItem = (info: any) => {
    setState((p) => {
      const now = new Date().toISOString()
      const isG = !info.hasAssetNumber
      const inv = [...p.inventory]
      const hist = [...p.history]
      if (isG) {
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
          photos: info.photos || [],
        })
        inv.push({
          id,
          hasAssetNumber: false,
          teamId: info.teamId,
          treeNodeId: info.treeNodeId,
          condition: info.condition,
          status: 'present',
          photos: info.photos || [],
          quantity: info.qty,
          price: info.price || 0,
          lastUpdated: now,
        })
        hist.unshift(logHist(id, 'allocation', `Alocado lote com ${info.qty} un.`, info.qty) as any)
      } else {
        Array.from({ length: info.qty }).forEach((_, i) => {
          const id = `inv_${Date.now()}_${i}`
          const asset = info.assets[i]
          sync('assets', {
            id,
            team_id: info.teamId,
            tree_node_id: info.treeNodeId,
            condition: info.condition,
            status: 'present',
            current_quantity: 1,
            price: info.price || 0,
            is_batch: false,
            patrimony_number: asset,
            photos: info.photos || [],
          })
          inv.push({
            id,
            hasAssetNumber: true,
            assetNumber: asset,
            teamId: info.teamId,
            treeNodeId: info.treeNodeId,
            condition: info.condition,
            status: 'present',
            photos: info.photos || [],
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
      let nSuppliers = p.suppliers
      if (updates.condition === 'repair' || it.condition === 'repair') {
        sync('repairs', {
          asset_id: id,
          is_sent: updates.repairSent,
          estimated_completion_date: updates.expectedReturnDate,
          condition_status: updates.conditionCategory,
          cost: updates.repairCost,
          location: updates.repairLocation,
          supplier_id: updates.supplierId,
          description: updates.reason,
          repair_user: p.currentUser?.name,
          repair_date: new Date().toISOString(),
        })
        if (updates.repairCost > 0 && updates.supplierId) {
          const supp = p.suppliers.find((s) => s.id === updates.supplierId)
          if (supp) {
            const newBal = supp.currentBalance - updates.repairCost
            sync('repair_suppliers', { id: supp.id, current_balance: newBal })
            nSuppliers = p.suppliers.map((s) =>
              s.id === supp.id ? { ...s, currentBalance: newBal } : s,
            )
          }
        }
      }
      return {
        ...p,
        inventory: nInv,
        suppliers: nSuppliers,
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
            initiatedBy: p.currentUser?.name || '',
            initiatedAt: new Date().toISOString(),
            status: 'pending',
          },
          ...p.transfers,
        ],
        history: [
          logHist(tId, 'transfer', `Transferência iniciada (Pendente)`) as any,
          ...p.history,
        ],
      }
    })
    toast({ title: 'Transferência iniciada' })
  }

  const sendTransfer = (trId: string) => {
    setState((p) => {
      sync('transfers', { id: trId, status: 'in_transit' })
      const tr = p.transfers.find((x) => x.id === trId)
      let nHist = p.history
      if (tr)
        nHist = [logHist(tr.inventoryId, 'transfer', 'Enviado (Em Trânsito)') as any, ...nHist]
      return {
        ...p,
        transfers: p.transfers.map((t) => (t.id === trId ? { ...t, status: 'in_transit' } : t)),
        history: nHist,
      }
    })
    toast({ title: 'Transferência enviada' })
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
            action === 'accept' ? 'Recebido e Aceito' : `Rejeitado: ${notes || ''}`,
          ) as any,
          ...p.history,
        ],
      }
    })
    toast({ title: 'Ação confirmada' })
  }

  const addSupplier = (s: any) => {
    const id = `supp_${Date.now()}`
    sync('repair_suppliers', { id, name: s.name, cnpj: s.cnpj, current_balance: 0 })
    setState((p) => ({
      ...p,
      suppliers: [...p.suppliers, { id, name: s.name, cnpj: s.cnpj, currentBalance: 0 }],
    }))
    toast({ title: 'Fornecedor criado' })
  }

  const adjustSupplierBalance = (id: string, amount: number) => {
    setState((p) => {
      const s = p.suppliers.find((x) => x.id === id)
      if (!s) return p
      const newBal = s.currentBalance + amount
      sync('repair_suppliers', { id, current_balance: newBal })
      return {
        ...p,
        suppliers: p.suppliers.map((x) => (x.id === id ? { ...x, currentBalance: newBal } : x)),
      }
    })
    toast({ title: 'Saldo atualizado' })
  }

  const submitChecklist = (
    teamId: string,
    leaderName: string,
    items: any,
    discrepancies: number,
    totalChecked: number,
  ) => {
    const id = `chk_${Date.now()}`
    sync('checklists', {
      id,
      team_id: teamId,
      leader_name: leaderName,
      date: new Date().toISOString(),
      discrepancies,
      total_checked: totalChecked,
    })
    setState((p) => ({
      ...p,
      checklists: [
        ...p.checklists,
        { id, teamId, leaderName, date: new Date().toISOString(), discrepancies, totalChecked },
      ],
    }))
    toast({ title: 'Auditoria Salva' })
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
  const logout = () => signOut()

  const val = useMemo(
    () => ({
      ...state,
      addNode,
      addInventoryItem,
      updateInventoryItem,
      initiateTransfer,
      sendTransfer,
      resolveTransfer,
      updateUserRole,
      toggleUserStatus,
      getNodePath,
      addSupplier,
      adjustSupplierBalance,
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
