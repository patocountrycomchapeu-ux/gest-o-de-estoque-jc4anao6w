import { useState, useMemo } from 'react'
import { useAppStore } from '@/store/AppStore'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Download } from 'lucide-react'

const conditionLabels: Record<string, string> = {
  good: 'Bom estado',
  damaged: 'Danificado',
  repair: 'Em Reparo',
}

export default function ReportsPage() {
  const { inventory, teams, nodes, getNodePath } = useAppStore()

  const [teamFilter, setTeamFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [brandFilter, setBrandFilter] = useState<string>('all')
  const [levelFilter, setLevelFilter] = useState<string>('all')

  const uniqueBrands = useMemo(() => {
    return Array.from(new Set(nodes.filter((n) => n.level === 'marca').map((n) => n.name)))
  }, [nodes])

  const topLevels = useMemo(() => {
    return nodes.filter((n) => n.level === 'departamento')
  }, [nodes])

  const filteredInventory = useMemo(() => {
    return inventory.filter((item) => {
      if (teamFilter !== 'all' && item.teamId !== teamFilter) return false
      if (statusFilter !== 'all' && item.condition !== statusFilter) return false

      const path = getNodePath(item.treeNodeId)
      const marcaNode = path.find((n) => n.level === 'marca')
      if (brandFilter !== 'all' && marcaNode?.name !== brandFilter) return false

      if (levelFilter !== 'all' && !path.some((n) => n.id === levelFilter)) return false

      return true
    })
  }, [inventory, teamFilter, statusFilter, brandFilter, levelFilter, getNodePath])

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Relatórios Customizados</h2>
        <p className="text-muted-foreground">
          Filtre as instâncias de estoque em todos os níveis hierárquicos e exporte os dados.
        </p>
      </div>

      <Card>
        <CardHeader className="bg-muted/30 pb-4 border-b">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Equipe (Tacha)</label>
              <Select value={teamFilter} onValueChange={setTeamFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Equipes</SelectItem>
                  {teams.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Condição</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="good">Bom Estado</SelectItem>
                  <SelectItem value="damaged">Danificado</SelectItem>
                  <SelectItem value="repair">Para Reparo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Marca (Atributo)</label>
              <Select value={brandFilter} onValueChange={setBrandFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Marcas</SelectItem>
                  {uniqueBrands.map((b) => (
                    <SelectItem key={b} value={b}>
                      {b}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Departamento (Nível Topo)</label>
              <Select value={levelFilter} onValueChange={setLevelFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {topLevels.map((n) => (
                    <SelectItem key={n.id} value={n.id}>
                      {n.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="p-4 flex justify-between items-center border-b">
            <span className="text-sm font-medium">
              {filteredInventory.length} instâncias encontradas
            </span>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" /> Exportar CSV
            </Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID / Instância</TableHead>
                <TableHead>Equipe</TableHead>
                <TableHead>Item Base</TableHead>
                <TableHead>Marca</TableHead>
                <TableHead>Departamento</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInventory.slice(0, 100).map((item) => {
                const path = getNodePath(item.treeNodeId)
                const team = teams.find((t) => t.id === item.teamId)
                const marca = path.find((n) => n.level === 'marca')?.name
                const itemName = path.find((n) => n.level === 'item')?.name
                const dept = path.find((n) => n.level === 'departamento')?.name

                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono text-xs">{item.id}</TableCell>
                    <TableCell>{team?.name}</TableCell>
                    <TableCell className="font-medium">{itemName}</TableCell>
                    <TableCell>{marca}</TableCell>
                    <TableCell className="text-muted-foreground">{dept}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                          item.condition === 'good'
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.condition === 'damaged'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {conditionLabels[item.condition]}
                      </span>
                    </TableCell>
                  </TableRow>
                )
              })}
              {filteredInventory.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    Nenhum registro corresponde aos filtros.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
