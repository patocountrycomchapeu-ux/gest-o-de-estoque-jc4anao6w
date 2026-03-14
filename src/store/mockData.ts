import { AppState } from '@/types'

const initialNodes = [
  { id: 'd1', name: 'Ferramentas Elétricas', level: 'departamento', parentId: null },
  { id: 'd2', name: 'Ferramentas Manuais', level: 'departamento', parentId: null },
  { id: 's1', name: 'Bateria', level: 'secao', parentId: 'd1' },
  { id: 's2', name: 'Cabos', level: 'secao', parentId: 'd2' },
  { id: 'c1', name: 'Furadeiras e Parafusadeiras', level: 'categoria', parentId: 's1' },
  { id: 'c2', name: 'Chaves', level: 'categoria', parentId: 's2' },
  { id: 'i1', name: 'Parafusadeira Impacto 12V', level: 'item', parentId: 'c1' },
  { id: 'i2', name: 'Chave Phillips', level: 'item', parentId: 'c2' },
  { id: 'i3', name: 'Chave de Fenda', level: 'item', parentId: 'c2' },
  { id: 'i4', name: 'Picareta', level: 'item', parentId: 'c2' },
  { id: 'm1', name: 'Makita', level: 'marca', parentId: 'i1' },
  { id: 'm2', name: 'Bosch', level: 'marca', parentId: 'i1' },
  { id: 'm3', name: 'Tramontina', level: 'marca', parentId: 'i2' },
  { id: 'm4', name: 'Gerdau', level: 'marca', parentId: 'i3' },
  { id: 'm5', name: 'Minas', level: 'marca', parentId: 'i4' },
] as const

const initialTeams = [
  { id: 't1', name: 'Equipe Tacha 1', description: 'Manutenção Externa', location: 'Setor Norte' },
  { id: 't2', name: 'Equipe Alpha', description: 'Reparos Rápidos', location: 'Setor Sul' },
] as const

const initialInventory = [
  {
    id: 'inv1',
    teamId: 't1',
    treeNodeId: 'm1',
    condition: 'good',
    photos: ['https://img.usecurling.com/p/200/200?q=drill'],
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'inv2',
    teamId: 't1',
    treeNodeId: 'm3',
    condition: 'damaged',
    photos: ['https://img.usecurling.com/p/200/200?q=screwdriver'],
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'inv3',
    teamId: 't2',
    treeNodeId: 'm2',
    condition: 'repair',
    photos: ['https://img.usecurling.com/p/200/200?q=tools'],
    lastUpdated: new Date().toISOString(),
  },
] as const

export const initialData: AppState = {
  nodes: [...initialNodes] as any,
  teams: [...initialTeams],
  inventory: [...initialInventory] as any,
  activities: [
    {
      id: 'a1',
      date: new Date(Date.now() - 3600000).toISOString(),
      description: "Equipe Tacha 1 reportou 'Chave Phillips (Tramontina)' como Danificado.",
      type: 'status_change',
    },
    {
      id: 'a2',
      date: new Date(Date.now() - 86400000).toISOString(),
      description: "1x 'Parafusadeira Impacto 12V (Makita)' alocada para Equipe Tacha 1.",
      type: 'allocation',
    },
  ],
}
