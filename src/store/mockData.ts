import { AppState } from '@/types'

const initialNodes = [
  { id: 'm1', name: 'Makita', level: 'marca', parentId: null },
  { id: 'm2', name: 'Bosch', level: 'marca', parentId: null },
  { id: 'd1', name: 'Ferramentas Elétricas', level: 'departamento', parentId: 'm1' },
  { id: 'd2', name: 'Ferramentas Manuais', level: 'departamento', parentId: 'm2' },
  { id: 'c1', name: 'Furadeiras', level: 'categoria', parentId: 'd1' },
  { id: 'c2', name: 'Chaves', level: 'categoria', parentId: 'd2' },
  { id: 's1', name: 'Bateria 12V', level: 'subcategoria', parentId: 'c1' },
  { id: 's2', name: 'Phillips', level: 'subcategoria', parentId: 'c2' },
  { id: 'i1', name: 'Parafusadeira Impacto 12V', level: 'item', parentId: 's1' },
  { id: 'i2', name: 'Chave Phillips 6mm', level: 'item', parentId: 's2' },
] as const

const initialTeams = [
  { id: 't1', name: 'Equipe Tacha 1', description: 'Manutenção Externa', location: 'Setor Norte' },
  { id: 't2', name: 'Equipe Alpha', description: 'Reparos Rápidos', location: 'Setor Sul' },
] as const

const initialInventory = [
  {
    id: 'inv1',
    teamId: 't1',
    treeNodeId: 'i1',
    condition: 'good',
    quantity: 2,
    photoUrl: 'https://img.usecurling.com/p/200/200?q=drill',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'inv2',
    teamId: 't1',
    treeNodeId: 'i2',
    condition: 'damaged',
    quantity: 1,
    photoUrl: 'https://img.usecurling.com/p/200/200?q=screwdriver',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'inv3',
    teamId: 't2',
    treeNodeId: 'i1',
    condition: 'repair',
    quantity: 1,
    photoUrl: 'https://img.usecurling.com/p/200/200?q=tools',
    lastUpdated: new Date().toISOString(),
  },
] as const

export const initialData: AppState = {
  nodes: [...initialNodes],
  teams: [...initialTeams],
  inventory: [...initialInventory] as any,
  activities: [
    {
      id: 'a1',
      date: new Date(Date.now() - 3600000).toISOString(),
      description: "Equipe Tacha 1 reportou 'Chave Phillips 6mm' como Danificado.",
      type: 'status_change',
    },
    {
      id: 'a2',
      date: new Date(Date.now() - 86400000).toISOString(),
      description: "2x 'Parafusadeira Impacto 12V' alocadas para Equipe Tacha 1.",
      type: 'allocation',
    },
  ],
}
