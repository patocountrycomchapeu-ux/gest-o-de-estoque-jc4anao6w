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

const sync = async (t: string, d: any) => {
  try {
    await supabase.from(t).upsert(d)
  } catch (e) {
    console.error(e)
  }
}

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
      setState({
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
      setIsStoreLoading(false)
      return
    }

    setIsStoreLoading(true)

    const loadData = async () => {
      try {
        // Data Hydration Phase 1: High priority data to free the UI instantly
        const [usrRes, perfisRes, depRes, catRes, eqpRes, usrEqpRes] = await Promise.all([
          supabase.from('usuarios').select('*'),
          supabase.from('perfil_acesso').select('*'),
          supabase.from('departamento').select('*'),
          supabase.from('categoria').select('*'),
          supabase.from('equipes').select('*'),
          supabase.from('usuarios_equipes').select('*'),
        ])

        const usrData = usrRes.data || []
        const perfisData = perfisRes.data || []
        const depData = depRes.data || []
        const catData = catRes.data || []
        const eqpData = eqpRes.data || []
        const usrEqpData = usrEqpRes.data || []

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

        const initialNodes: TreeNode[] = [
          ...depData.map((d) => ({
            id: d.id,
            name: d.descricao,
            level: 'departamento' as const,
            parentId: null,
          })),
          ...catData.map((c) => ({
            id: c.id,
            name: c.descricao,
            level: 'categoria' as const,
            parentId: c.departamento_id!,
          })),
        ]

        setState((p) => ({
          ...p,
          currentUser: curr,
          users: profs,
          nodes: initialNodes,
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
        }))

        if (curr.theme && curr.theme !== 'system') {
          document.documentElement.classList.remove('light', 'dark')
          document.documentElement.classList.add(curr.theme)
        }

        setIsStoreLoading(false) // UI is liberated with top nodes

        // Data Hydration Phase 2: Lower level nodes and full inventory
        const [
          tipRes,
          linRes,
          marRes,
          prodRes,
          estRes,
          sdoRes,
          movRes,
          repRes,
          fornRes,
          imgRes,
          sdoFornRes,
        ] = await Promise.all([
          supabase.from('tipo').select('*'),
          supabase.from('linha').select('*'),
          supabase.from('marca').select('*'),
          supabase.from('produto').select('*'),
          supabase.from('estoque').select('*'),
          supabase.from('saldo_estoque').select('*'),
          supabase.from('movimento_estoque').select('*'),
          supabase.from('reparo').select('*'),
          supabase.from('fornecedor').select('*'),
          supabase.from('imagem_produto').select('*'),
          supabase.from('saldo_fornecedor').select('*'),
        ])

        const tipData = tipRes.data || []
        const linData = linRes.data || []
        const marData = marRes.data || []
        const prodData = prodRes.data || []
        const estData = estRes.data || []
        const sdoData = sdoRes.data || []
        const movData = movRes.data || []
        const repData = repRes.data || []
        const fornData = fornRes.data || []
        const imgData = imgRes.data || []
        const sdoFornData = sdoFornRes.data || []

        const lowerNodes: TreeNode[] = [
          ...tipData.map((t) => ({
            id: t.id,
            name: t.descricao,
            level: 'tipo' as const,
            parentId: t.categoria_id!,
          })),
          ...linData.map((l) => ({
            id: l.id,
            name: l.descricao,
            level: 'linha' as const,
            parentId: l.tipo_id!,
          })),
          ...marData.map((m) => ({
            id: m.id,
            name: m.descricao,
            level: 'marca' as const,
            parentId: m.linha_id!,
          })),
        ]

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
          nodes: [...p.nodes, ...lowerNodes],
          suppliers: fornData.map((f) => {
            const saldo = sdoFornData.find((s) => s.fornecedor_id === f.id)?.saldo || 0
            return {
              id: f.id,
              name: f.descricao,
              cnpj: f.email || '',
              currentBalance: saldo,
            }
          }),
          transfers: movData
            .filter((m) => m.tipo_movimento === 'transferencia')
            .map((m) => ({
              id: m.id,
              inventoryId: m.estoque_id || m.saldo_estoque_id,
              fromTeamId: '',
              toTeamId: '',
              initiatedBy: m.usuario_id,
              initiatedAt: m.data_hora,
              status: m.descricao?.includes('pendente')
                ? 'pending'
                : m.descricao?.includes('trânsito')
                  ? 'in_transit'
                  : m.descricao?.includes('rejeitada')
                    ? 'rejected'
                    : 'completed',
            })),
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
      } catch (err) {
        console.error('Error loading data', err)
        setIsStoreLoading(false)
      }
    }

    loadData()
  }, [authUser, signOut])

  const kpis = useMemo(() => {
    return {
      totalAssets: state.inventory.reduce((acc, it) => acc + (it.quantity || 1), 0),
      totalValue: state.inventory.reduce(
        (acc, it) => acc + (it.price || 0) * (it.quantity || 1),
        0,
      ),
      totalRepairCost: state.inventory.reduce((acc, it) => acc + (it.repairCost || 0), 0),
      damagedItems: state.inventory.filter(
        (it) => it.condition === 'damaged' || it.condition === 'repair',
      ).length,
    }
  }, [state.inventory])

  const logHist = (
    asset_id: string,
    isAsset: boolean,
    type: string,
    desc: string,
    qty: number = 1,
  ) => {
    const h = {
      id: crypto.randomUUID(),
      estoque_id: isAsset ? asset_id : null,
      saldo_estoque_id: isAsset ? null : asset_id,
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
    const id = crypto.randomUUID()
    const parentIds: Record<string, string> = {}
    let currentId: string | null = n.parentId

    while (currentId) {
      const node = state.nodes.find((x) => x.id === currentId)
      if (node) {
        parentIds[`${node.level}_id`] = node.id
        currentId = node.parentId
      } else {
        break
      }
    }

    const dbObj: any = { id, descricao: n.name, ativo: true, ...parentIds }
    sync(n.level, dbObj)
    setState((p) => ({ ...p, nodes: [...p.nodes, { ...n, id } as TreeNode] }))
  }

  const addInventoryItem = (info: AddInventoryPayload) => {
    setState((p) => {
      const now = new Date().toISOString()
      const isG = !info.hasAssetNumber
      const inv = [...p.inventory]
      const hist = [...p.history]

      if (isG) {
        const id = crypto.randomUUID()
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
        hist.unshift(
          logHist(id, false, 'allocation', `Alocado lote com ${info.qty} un.`, info.qty) as any,
        )
      } else {
        Array.from({ length: info.qty }).forEach((_, i) => {
          const id = crypto.randomUUID()
          const asset = info.assets ? info.assets[i] : undefined
          sync('estoque', {
            id,
            equipe_id: info.teamId,
            produto_id: info.treeNodeId,
            condicao: info.condition,
            numero_patrimonio: asset,
            status: 'disponivel',
          })
          if (i === 0 && info.photos?.length) {
            sync('imagem_produto', {
              id: crypto.randomUUID(),
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
          hist.unshift(logHist(id, true, 'allocation', `Alocado`, 1) as any)
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
      } else if (updates.quantity !== undefined) {
        sync('saldo_estoque', { id, quantidade: updates.quantity })
      }

      let nSuppliers = p.suppliers
      if (it.hasAssetNumber && (updates.condition === 'repair' || it.condition === 'repair')) {
        sync('reparo', {
          id: crypto.randomUUID(),
          estoque_id: id,
          previsao_finalizacao: updates.expectedReturnDate,
          valor_servico: updates.repairCost,
          fornecedor_id: updates.supplierId,
          descricao: updates.reason,
          usuario_id: p.currentUser?.id,
        })
        if (updates.repairCost && updates.repairCost > 0 && updates.supplierId) {
          const supp = p.suppliers.find((s) => s.id === updates.supplierId)
          if (supp) {
            const newBal = supp.currentBalance - updates.repairCost
            sync('saldo_fornecedor', {
              id: crypto.randomUUID(),
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
          logHist(
            id,
            it.hasAssetNumber,
            'status_change',
            `Atualizado. ${updates.reason || ''}`,
          ) as any,
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
        sync('saldo_estoque', { id, quantidade: it.quantity - qty })
        tId = crypto.randomUUID()
        sync('saldo_estoque', {
          id: tId,
          quantidade: qty,
          equipe_id: it.teamId,
          produto_id: it.treeNodeId,
        })
        nInv.push({ ...it, id: tId, quantity: qty })
      }

      const trId = crypto.randomUUID()
      sync('movimento_estoque', {
        id: trId,
        estoque_id: it.hasAssetNumber ? tId : null,
        saldo_estoque_id: it.hasAssetNumber ? null : tId,
        tipo_movimento: 'transferencia',
        quantidade: qty || 1,
        usuario_id: p.currentUser?.id,
        descricao: `Transferência iniciada de ${it.teamId} para ${toTeamId} (pendente)`,
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
          logHist(tId, it.hasAssetNumber, 'transfer', `Transferência iniciada (Pendente)`) as any,
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
      if (tr) {
        const invIt = p.inventory.find((i) => i.id === tr.inventoryId)
        nHist = [
          logHist(
            tr.inventoryId,
            !!invIt?.hasAssetNumber,
            'transfer',
            'Enviado (Em Trânsito)',
          ) as any,
          ...nHist,
        ]
      }
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
      const invIt = nInv.find((i) => i.id === tr.inventoryId)
      if (action === 'accept' && invIt) {
        if (invIt.hasAssetNumber) {
          sync('estoque', { id: tr.inventoryId, equipe_id: tr.toTeamId, condicao: cond || 'good' })
        } else {
          sync('saldo_estoque', { id: tr.inventoryId, equipe_id: tr.toTeamId })
        }
      }

      return {
        ...p,
        inventory: nInv,
        transfers: p.transfers.map((t) =>
          t.id === trId ? { ...t, status: action === 'accept' ? 'completed' : 'rejected' } : t,
        ),
        history: [
          logHist(
            tr.inventoryId,
            !!invIt?.hasAssetNumber,
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
    const id = crypto.randomUUID()
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
      sync('saldo_fornecedor', {
        id: crypto.randomUUID(),
        fornecedor_id: id,
        saldo: newBal,
      })
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
    items: Record<string, any>,
    discrepancies: number,
    totalChecked: number,
  ) => {
    const id = crypto.randomUUID()

    // Save to auditoria
    sync('auditoria', {
      id,
      tabela: 'estoque',
      operacao: 'UPDATE',
      registro_id: teamId,
      dados_novos: { discrepancies, totalChecked, leaderName },
    })

    // Create history logs and update inventory condition based on checklist
    setState((p) => {
      let nInv = [...p.inventory]
      let nHist = [...p.history]

      Object.entries(items).forEach(([invId, st]) => {
        const invIt = nInv.find((i) => i.id === invId)
        if (invIt && st.status !== 'present') {
          // Update condition
          if (st.status === 'damaged') {
            nInv = nInv.map((i) => {
              if (i.id === invId) {
                const newPhotos = st.photoUrl ? [...(i.photos || []), st.photoUrl] : i.photos || []
                return {
                  ...i,
                  condition: 'damaged',
                  conditionCategory: st.notes,
                  photos: newPhotos,
                }
              }
              return i
            })
            if (invIt.hasAssetNumber) {
              sync('estoque', { id: invId, condicao: 'damaged' })
            }
            if (st.photoUrl && invIt.treeNodeId) {
              sync('imagem_produto', {
                id: crypto.randomUUID(),
                produto_id: invIt.treeNodeId,
                url: st.photoUrl,
              })
            }
          } else if (st.status === 'missing') {
            nInv = nInv.map((i) => (i.id === invId ? { ...i, status: 'missing' } : i))
            if (invIt.hasAssetNumber) {
              sync('estoque', { id: invId, status: 'missing' })
            }
          }

          // Log history
          nHist = [
            logHist(
              invId,
              invIt.hasAssetNumber,
              'audit',
              `Auditoria: Item marcado como ${st.status === 'damaged' ? 'Danificado' : 'Extraviado'}. ${st.notes || ''}`,
            ) as any,
            ...nHist,
          ]
        } else if (invIt) {
          nHist = [
            logHist(
              invId,
              invIt.hasAssetNumber,
              'audit',
              `Auditoria: Confirmado presente por ${leaderName}`,
            ) as any,
            ...nHist,
          ]
        }
      })

      return {
        ...p,
        inventory: nInv,
        history: nHist,
        checklists: [
          ...p.checklists,
          { id, teamId, leaderName, date: new Date().toISOString(), discrepancies, totalChecked },
        ],
      }
    })
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
    const parentIds: Record<string, string> = {}

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
        parentIds[`${levels[i]}_id`] = existing.id
      } else {
        const newNodeId = crypto.randomUUID()
        const isGrouped = !data.hasAssetNumber && (levels[i] === 'linha' || levels[i] === 'marca')
        const newNode = {
          id: newNodeId,
          name: val,
          level: levels[i] as any,
          parentId: currentParentId,
          isGrouped,
        }

        const dbObj: any = { id: newNodeId, descricao: val, ativo: true, ...parentIds }
        sync(levels[i], dbObj)

        newNodes.push(newNode)
        currentNodes.push(newNode)

        currentParentId = newNodeId
        lastNodeId = newNodeId
        parentIds[`${levels[i]}_id`] = newNodeId
      }
    }

    const prodId = crypto.randomUUID()
    sync('produto', {
      id: prodId,
      nome: data.item || 'Item',
      ...parentIds,
      preco_unitario: data.price || 0,
      ativo: true,
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

  const updateProfile = async (updates: { name?: string; theme?: string }) => {
    if (!state.currentUser) return
    try {
      await supabase
        .from('usuarios')
        .update({
          nome: updates.name || state.currentUser.name,
          tema: updates.theme || state.currentUser.theme,
        })
        .eq('id', state.currentUser.id)

      setState((p) => {
        const nUser = p.currentUser
          ? {
              ...p.currentUser,
              name: updates.name || p.currentUser.name,
              theme: updates.theme || p.currentUser.theme,
            }
          : null

        if (updates.theme && updates.theme !== 'system') {
          document.documentElement.classList.remove('light', 'dark')
          document.documentElement.classList.add(updates.theme)
        } else if (updates.theme === 'system') {
          document.documentElement.classList.remove('light', 'dark')
          const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
          if (isDark) document.documentElement.classList.add('dark')
        }

        return {
          ...p,
          currentUser: nUser,
          users: p.users.map((u) =>
            u.id === state.currentUser?.id
              ? { ...u, name: updates.name || u.name, theme: updates.theme || u.theme }
              : u,
          ),
        }
      })
      toast({ title: 'Perfil atualizado com sucesso' })
    } catch (e) {
      console.error(e)
      toast({ title: 'Erro ao atualizar perfil', variant: 'destructive' })
    }
  }

  const logout = async () => {
    setState({
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

    await signOut()

    const theme = localStorage.getItem('theme') || localStorage.getItem('vite-ui-theme')
    localStorage.clear()
    sessionStorage.clear()
    if (theme) {
      localStorage.setItem('vite-ui-theme', theme)
      localStorage.setItem('theme', theme)
    }
  }

  const val = useMemo(
    () => ({
      ...state,
      kpis,
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
      updateProfile,
      logout,
    }),
    [state, kpis, isStoreLoading],
  )
  return <AppContext.Provider value={val}>{children}</AppContext.Provider>
}

export const useAppStore = () => {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useAppStore failed')
  return ctx
}
