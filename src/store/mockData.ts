import { AppState, User } from '@/types'

const initialUsers: User[] = [
  { id: 'u1', name: 'Administrador Master', role: 'admin' },
  { id: 'u2', name: 'Carlos (Líder Tacha 1)', role: 'leader', teamId: 't1' },
  { id: 'u3', name: 'João (Operador Tacha 1)', role: 'operator', teamId: 't1' },
  { id: 'u4', name: 'Ana (Líder Alpha)', role: 'leader', teamId: 't2' },
]

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
    hasAssetNumber: true,
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
    hasAssetNumber: true,
    assetNumber: 'PAT-10002',
    teamId: 't1',
    treeNodeId: 'm3',
    condition: 'damaged',
    status: 'borrowed',
    borrowedTo: 'Equipe Beta',
    photos: ['https://img.usecurling.com/p/200/200?q=screwdriver'],
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'inv3',
    hasAssetNumber: false,
    teamId: 't2',
    treeNodeId: 'm1',
    condition: 'good',
    status: 'present',
    photos: [],
    lastUpdated: new Date().toISOString(),
  },
] as const

export const initialData: AppState = {
  users: initialUsers,
  currentUser: initialUsers[0],
  nodes: [...initialNodes] as any,
  teams: [...initialTeams],
  inventory: [...initialInventory] as any,
  transfers: [
    {
      id: 'tr1',
      inventoryId: 'inv3',
      fromTeamId: 't2',
      toTeamId: 't1',
      initiatedBy: 'Ana (Líder Alpha)',
      initiatedAt: new Date().toISOString(),
      status: 'pending',
    },
  ],
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
  ],
  checklists: [],
}
