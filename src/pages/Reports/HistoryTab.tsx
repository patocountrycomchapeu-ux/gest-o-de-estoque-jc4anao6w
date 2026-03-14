import { useState, useMemo } from 'react'
import { useAppStore } from '@/store/AppStore'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
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
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function HistoryTab() {
  const { history, inventory, teams } = useAppStore()
  const [teamFilter, setTeamFilter] = useState<string>('all')

  const filteredHistory = useMemo(() => {
    return history
      .filter((h) => {
        if (teamFilter !== 'all') {
          const item = inventory.find((i) => i.id === h.inventoryId)
          if (item?.teamId !== teamFilter) return false
        }
        return true
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [history, teamFilter, inventory])

  return (
    <Card className="animate-slide-up">
      <CardHeader className="bg-muted/30 pb-4 border-b">
        <div className="w-full max-w-xs space-y-1.5">
          <label className="text-xs font-medium">Filtrar por Equipe</label>
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
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Item (Patrimônio)</TableHead>
              <TableHead>Equipe Atual</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Descrição / Motivo</TableHead>
              <TableHead>Responsável</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredHistory.map((h) => {
              const item = inventory.find((i) => i.id === h.inventoryId)
              const team = teams.find((t) => t.id === item?.teamId)

              return (
                <TableRow key={h.id}>
                  <TableCell className="text-xs whitespace-nowrap">
                    {format(new Date(h.date), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                  </TableCell>
                  <TableCell className="font-mono text-xs font-semibold">
                    {item?.hasAssetNumber ? item.assetNumber : h.inventoryId}
                  </TableCell>
                  <TableCell className="text-sm">{team?.name || '-'}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        h.type === 'status_change'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {h.type}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm">{h.description}</TableCell>
                  <TableCell className="text-xs">{h.user}</TableCell>
                </TableRow>
              )
            })}
            {filteredHistory.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  Nenhum registro histórico encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
