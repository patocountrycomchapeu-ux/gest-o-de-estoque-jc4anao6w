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
  { id: 'm1', name: 'Makita', level: 'marca', parentId: 'i1' },
  { id: 'm3', name: 'Tramontina', level: 'marca', parentId: 'i2' },
] as const

const initialTeams = [
  { id: 't1', name: 'Equipe Tacha 1', description: 'Manutenção Externa', location: 'Setor Norte' },
  { id: 't2', name: 'Equipe Alpha', description: 'Reparos Rápidos', location: 'Setor Sul' },
] as const

const initialInventory = [
  {
    id: 'inv1',
    assetNumber: 'PAT-10001',
    teamId: 't1',
    treeNodeId: 'm1',
    condition: 'good',
    status: 'present',
    photos: ['https://img.usecurling.com/p/200/200?q=drill'],
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'inv2',
    assetNumber: 'PAT-10002',
    teamId: 't1',
    treeNodeId: 'm3',
    condition: 'damaged',
    status: 'borrowed',
    borrowedTo: 'João (Equipe Beta)',
    photos: ['https://img.usecurling.com/p/200/200?q=screwdriver'],
    lastUpdated: new Date().toISOString(),
  },
] as const

export const initialData: AppState = {
  nodes: [...initialNodes] as any,
  teams: [...initialTeams],
  inventory: [...initialInventory] as any,
  activities: [],
  history: [
    {
      id: 'h1',
      inventoryId: 'inv1',
      date: new Date(Date.now() - 86400000).toISOString(),
      type: 'allocation',
      description: 'Alocado inicialmente para a Equipe Tacha 1.',
      user: 'Sistema',
    },
    {
      id: 'h2',
      inventoryId: 'inv2',
      date: new Date(Date.now() - 3600000).toISOString(),
      type: 'audit',
      description: 'Auditado como Emprestado - João (Equipe Beta)',
      user: 'Carlos Líder',
    },
  ],
  checklists: [
    {
      id: 'chk1',
      teamId: 't1',
      date: new Date(Date.now() - 3600000).toISOString(),
      leaderName: 'Carlos Líder',
      discrepancies: 1,
    },
  ],
}
