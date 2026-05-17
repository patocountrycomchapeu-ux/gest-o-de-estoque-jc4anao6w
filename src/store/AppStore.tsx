import React, { createContext, useContext, useState, useMemo, useEffect } from 'react'
import {
  AppState,
  Role,
  TreeNode,
  Condition,
  ToolStatus,
  AddNodePayload,
  AddInventoryPayload,
  InventoryItem,
} from '@/types'
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
  const [isStoreLoading, setIsStoreLoading] = useState(true)
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
    if (!authUser) {
      setState((s) => ({ ...s, currentUser: null }))
      setIsStoreLoading(false)
      return
    }
    setIsStoreLoading(true)
    Promise.all(
      [
        'usuarios',
        'perfil_acesso',
        'departamento',
        'categoria',
        'tipo',
        'linha',
        'marca',
        'produto',
        'estoque',
        'saldo_estoque',
        'movimento_estoque',
        'equipes',
        'reparo',
        'fornecedor',
        'imagem_produto',
        'usuarios_equipes',
      ].map((t) => supabase.from(t).select('*')),
    )
      .then((res) => {
        const [
          usrData,
          perfisData,
          depData,
          catData,
          tipData,
          linData,
          marData,
          prodData,
          estData,
          sdoData,
          movData,
          eqpData,
          repData,
          fornData,
          imgData,
          usrEqpData,
        ] = res.map((r) => r.data || [])

        const profs = usrData.map((u) => {
          const p = perfisData.find((p) => p.id === u.perfil_acesso_id)
          const eqp = usrEqpData.find((ue) => ue.usuario_id === u.id)
          return {
            id: u.id,
            name: u.nome,
            email: u.email,
            role: p?.descricao || 'Visualizador',
            active: u.ativo,
            teamId: eqp?.equipe_id,
            theme: u.tema,
          }
        })

        const curr = profs.find((p) => p.id === authUser.id)
        if (!curr?.active) {
          signOut()
          toast({ title: 'Acesso negado', description: 'Conta inativa.' })
          setIsStoreLoading(false)
          return
        }

        const nodes: TreeNode[] = [
          ...depData.map((d) => ({
            id: d.id,
            name: d.descricao,
            level: 'departamento',
            parentId: null,
          })),
          ...catData.map((c) => ({
            id: c.id,
            name: c.descricao,
            level: 'categoria',
            parentId: c.departamento_id,
          })),
          ...tipData.map((t) => ({
            id: t.id,
            name: t.descricao,
            level: 'tipo',
            parentId: t.categoria_id,
          })),
          ...linData.map((l) => ({
            id: l.id,
            name: l.descricao,
            level: 'linha',
            parentId: l.tipo_id,
          })),
          ...marData.map((m) => ({
            id: m.id,
            name: m.descricao,
            level: 'marca',
            parentId: m.linha_id,
          })),
        ] as any[]

        const inventory = [
          ...estData.map((e) => {
            const p = prodData.find((p) => p.id === e.produto_id)
            const rep = repData.find((r) => r.estoque_id === e.id)
            const imgs = imgData.filter((i) => i.produto_id === p?.id).map((i) => i.url)
            return {
              id: e.id,
              hasAssetNumber: true,
              assetNumber: e.numero_patrimonio,
              teamId: e.equipe_id,
              treeNodeId:
                p?.marca_id || p?.linha_id || p?.tipo_id || p?.categoria_id || p?.departamento_id,
              condition: e.condicao,
              status: e.status,
              photos: imgs,
              price: p?.preco_unitario,
              quantity: 1,
              repairCost: rep?.valor_servico,
              supplierId: rep?.fornecedor_id,
              repairDescription: rep?.descricao,
              repairDate: rep?.created_at,
              expectedReturnDate: rep?.previsao_finalizacao,
              lastUpdated: e.updated_at,
            }
          }),
          ...sdoData.map((s) => {
            const p = prodData.find((p) => p.id === s.produto_id)
            const imgs = imgData.filter((i) => i.produto_id === p?.id).map((i) => i.url)
            return {
              id: s.id,
              hasAssetNumber: false,
              teamId: s.equipe_id,
              treeNodeId:
                p?.marca_id || p?.linha_id || p?.tipo_id || p?.categoria_id || p?.departamento_id,
              condition: 'good',
              status: 'present',
              photos: imgs,
              price: p?.preco_unitario,
              quantity: s.quantidade,
              lastUpdated: s.updated_at,
            }
          }),
        ]

        setState((p) => ({
          ...p,
          currentUser: curr,
          users: profs,
          nodes,
          teams: eqpData
            .filter((e) => e.ativa !== false)
            .map((e) => {
              const rel = usrEqpData.find((ue) => ue.equipe_id === e.id)
              const mgr = usrData.find((u) => u.id === rel?.usuario_id)
              return {
                id: e.id,
                name: e.nome,
                description: e.descricao || '',
                location: '',
                managerId: mgr?.id,
                managerName: mgr?.nome,
              }
            }),
          suppliers: fornData.map((f) => ({
            id: f.id,
            name: f.descricao,
            cnpj: '',
            currentBalance: 0,
          })),
          transfers: movData
            .filter((m) => m.tipo_movimento === 'transferencia')
            .map((m) => ({
              id: m.id,
              inventoryId: m.estoque_id || m.saldo_estoque_id,
              fromTeamId: '',
              toTeamId: '',
              initiatedBy: m.usuario_id,
              initiatedAt: m.data_hora,
              status: 'completed',
            })),
          checklists: [],
          history: movData.map((m) => ({
            id: m.id,
            inventoryId: m.estoque_id || m.saldo_estoque_id,
            date: m.data_hora,
            type: m.tipo_movimento,
            description: m.descricao,
            user: usrData.find((u) => u.id === m.usuario_id)?.nome || '',
            quantity: m.quantidade,
          })),
          inventory,
          activities: movData.slice(0, 50).map((m) => ({
            id: m.id,
            date: m.data_hora,
            description: m.descricao,
            type: m.tipo_movimento === 'transferencia' ? 'allocation' : 'status_change',
          })),
        }))
        if (curr.theme && curr.theme !== 'system') {
          document.documentElement.classList.remove('light', 'dark')
          document.documentElement.classList.add(curr.theme)
        }
        setIsStoreLoading(false)
      })
      .catch((err) => {
        console.error('Error loading data', err)
        setIsStoreLoading(false)
      })
  }, [authUser])

  const logHist = (asset_id: string, type: string, desc: string, qty: number = 1) => {
    const h = {
      id: `h_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      estoque_id: asset_id.startsWith('inv') ? null : asset_id,
      saldo_estoque_id: asset_id.startsWith('inv') ? asset_id : null,
      data_hora: new Date().toISOString(),
      tipo_movimento: type,
      descricao: desc,
      usuario_id: state.currentUser?.id,
      quantidade: qty,
    }
    sync('movimento_estoque', h)
    return {
      id: h.id,
      inventoryId: asset_id,
      date: h.data_hora,
      type: h.tipo_movimento as any,
      description: h.descricao,
      user: state.currentUser?.name || '',
      quantity: h.quantidade,
    }
  }

  const addNode = (n: AddNodePayload) => {
    const id = `n_${Date.now()}`
    sync('nodes', { ...n, parent_id: n.parentId, is_grouped: n.isGrouped, id })
    setState((p) => ({ ...p, nodes: [...p.nodes, { ...n, id }] }))
  }

  const addInventoryItem = (info: AddInventoryPayload) => {
    setState((p) => {
      const now = new Date().toISOString()
      const isG = !info.hasAssetNumber
      const inv = [...p.inventory]
      const hist = [...p.history]
      if (isG) {
        const id = `inv_${Date.now()}`
        sync('saldo_estoque', {
          id,
          equipe_id: info.teamId,
          produto_id: info.treeNodeId,
          quantidade: info.qty,
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
          sync('estoque', {
            id,
            equipe_id: info.teamId,
            produto_id: info.treeNodeId,
            condicao: info.condition,
            numero_patrimonio: asset,
            status: 'disponivel',
          })
          if (info.photos?.length) {
            sync('imagem_produto', {
              id: `img_${Date.now()}_${i}`,
              produto_id: info.treeNodeId,
              url: info.photos[0],
            })
          }
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

  const updateInventoryItem = (
    id: string,
    updates: Partial<InventoryItem> & { reason?: string },
  ) => {
    setState((p) => {
      const it = p.inventory.find((i) => i.id === id)
      if (!it) return p
      const nInv = p.inventory.map((i) => (i.id === id ? { ...i, ...updates } : i))
      if (it.hasAssetNumber) {
        sync('estoque', {
          id,
          condicao: updates.condition || it.condition,
          status: updates.status || it.status,
        })
      }
      let nSuppliers = p.suppliers
      if (updates.condition === 'repair' || it.condition === 'repair') {
        sync('reparo', {
          id: `rep_${Date.now()}`,
          estoque_id: id,
          previsao_finalizacao: updates.expectedReturnDate,
          valor_servico: updates.repairCost,
          fornecedor_id: updates.supplierId,
          descricao: updates.reason,
          usuario_id: p.currentUser?.id,
        })
        if (updates.repairCost > 0 && updates.supplierId) {
          const supp = p.suppliers.find((s) => s.id === updates.supplierId)
          if (supp) {
            const newBal = supp.currentBalance - updates.repairCost
            sync('saldo_fornecedor', {
              id: `sf_${Date.now()}`,
              fornecedor_id: supp.id,
              saldo: newBal,
            })
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
      sync('movimento_estoque', {
        id: trId,
        estoque_id: tId,
        tipo_movimento: 'transferencia',
        quantidade: qty || 1,
        usuario_id: p.currentUser?.id,
        descricao: `Transferência iniciada de ${it.teamId} para ${toTeamId}`,
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
      sync('movimento_estoque', { id: trId, descricao: 'Transferência em trânsito' })
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
      sync('movimento_estoque', {
        id: trId,
        descricao: action === 'accept' ? 'Transferência concluída' : 'Transferência rejeitada',
        updated_by: p.currentUser?.id,
      })
      if (action === 'accept')
        sync('estoque', { id: tr.inventoryId, equipe_id: tr.toTeamId, condicao: cond || 'good' })
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
    sync('fornecedor', { id, descricao: s.name, email: s.cnpj })
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
      sync('saldo_fornecedor', { id: `sf_${Date.now()}`, fornecedor_id: id, saldo: newBal })
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
    items: any[],
    discrepancies: number,
    totalChecked: number,
  ) => {
    const id = `chk_${Date.now()}`
    sync('auditoria', {
      id,
      tabela: 'estoque',
      operacao: 'UPDATE',
      registro_id: teamId,
      dados_novos: { discrepancies, totalChecked, leaderName },
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

  const updateUserRole = async (id: string, role: Role) => {
    setState((p) => ({ ...p, users: p.users.map((u) => (u.id === id ? { ...u, role } : u)) }))
    try {
      const { userService } = await import('@/services/UserService')
      await userService.updateUserRole(id, role)
      toast({ title: 'Atualizado' })
    } catch (e) {
      console.error(e)
    }
  }
  const toggleUserStatus = async (id: string) => {
    let act = true
    setState((p) => {
      act = !p.users.find((u) => u.id === id)?.active
      return { ...p, users: p.users.map((u) => (u.id === id ? { ...u, active: act } : u)) }
    })
    try {
      const { userService } = await import('@/services/UserService')
      await userService.toggleUserStatus(id, act)
      toast({ title: 'Atualizado' })
    } catch (e) {
      console.error(e)
    }
  }
  const createFullItemAndAllocate = async (data: {
    tipo: string
    funcao?: string
    especificacao?: string
    item: string
    marca: string
    hasAssetNumber: boolean
    qty: number
    price?: number
    teamId: string
    condition?: Condition
    assets?: string[]
    photos?: string[]
  }) => {
    let currentParentId: string | null = null
    let lastNodeId = ''
    const levels = ['departamento', 'categoria', 'tipo', 'linha', 'marca']
    const pathValues = [data.tipo, data.funcao, data.especificacao, data.item, data.marca]
    let newNodes: any[] = []

    let currentNodes = [...state.nodes]
    const prodIds: Record<string, string> = {}

    for (let i = 0; i < levels.length; i++) {
      const val = pathValues[i]
      if (!val) break

      const existing = currentNodes.find(
        (n) =>
          n.name.toLowerCase() === val.toLowerCase() &&
          n.level === levels[i] &&
          n.parentId === currentParentId,
      )

      if (existing) {
        currentParentId = existing.id
        lastNodeId = existing.id
        prodIds[`${levels[i]}_id`] = existing.id
      } else {
        const newNodeId = `n_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 9)}`
        const isGrouped = !data.hasAssetNumber && (levels[i] === 'linha' || levels[i] === 'marca')
        const newNode = {
          id: newNodeId,
          name: val,
          level: levels[i] as any,
          parentId: currentParentId,
          isGrouped,
        }

        const parentCol = i === 0 ? null : `${levels[i - 1]}_id`
        const dbObj: any = { id: newNodeId, descricao: val }
        if (parentCol && currentParentId) dbObj[parentCol] = currentParentId
        sync(levels[i], dbObj)

        newNodes.push(newNode)
        currentNodes.push(newNode)

        currentParentId = newNodeId
        lastNodeId = newNodeId
        prodIds[`${levels[i]}_id`] = newNodeId
      }
    }

    const prodId = `prod_${Date.now()}`
    sync('produto', {
      id: prodId,
      nome: data.item || 'Item',
      ...prodIds,
      preco_unitario: data.price || 0,
    })

    lastNodeId = prodId

    if (newNodes.length > 0) {
      setState((p) => ({ ...p, nodes: [...p.nodes, ...newNodes] }))
    }

    addInventoryItem({
      teamId: data.teamId,
      treeNodeId: lastNodeId,
      condition: data.condition || 'good',
      qty: data.qty,
      price: data.price,
      hasAssetNumber: data.hasAssetNumber,
      assets: data.assets,
      photos: data.photos,
    })
  }

  const logout = () => signOut()

  const val = useMemo(
    () => ({
      ...state,
      isStoreLoading,
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
      createFullItemAndAllocate,
      logout,
    }),
    [state, isStoreLoading],
  )
  return <AppContext.Provider value={val}>{children}</AppContext.Provider>
}

export const useAppStore = () => {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useAppStore failed')
  return ctx
}
