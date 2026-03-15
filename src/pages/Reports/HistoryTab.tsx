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
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Printer, Download, Image as ImageIcon } from 'lucide-react'

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

  const handleExportCSV = () => {
    const headers = ['Data', 'Patrimonio', 'Equipe', 'Tipo', 'Descricao', 'Responsavel']
    const rows = filteredHistory.map((h) => {
      const item = inventory.find((i) => i.id === h.inventoryId)
      const team = teams.find((t) => t.id === item?.teamId)
      return `"${h.date}","${item?.hasAssetNumber ? item.assetNumber : h.inventoryId}","${team?.name || '-'}","${h.type}","${h.description.replace(/"/g, '""')}","${h.user}"`
    })
    const csv = [headers.join(','), ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `historico_export_${format(new Date(), 'yyyyMMdd')}.csv`
    a.click()
  }

  return (
    <Card className="animate-slide-up print:border-none print:shadow-none">
      <CardHeader className="bg-muted/30 pb-4 border-b flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 print:hidden">
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
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" onClick={handleExportCSV} className="flex-1 sm:flex-none">
            <Download className="w-4 h-4 mr-2" /> Excel (CSV)
          </Button>
          <Button variant="outline" onClick={() => window.print()} className="flex-1 sm:flex-none">
            <Printer className="w-4 h-4 mr-2" /> Imprimir (PDF)
          </Button>
        </div>
      </CardHeader>

      <div className="hidden print:block mb-4 p-4 pb-0">
        <h2 className="text-xl font-bold uppercase tracking-tight">Histórico de Movimentações</h2>
        <p className="text-sm text-gray-600">
          Filtrado por:{' '}
          {teamFilter === 'all' ? 'Todas as Equipes' : teams.find((t) => t.id === teamFilter)?.name}
        </p>
      </div>

      <CardContent className="p-0 print:p-2">
        <Table className="print:text-xs">
          <TableHeader>
            <TableRow className="print:bg-gray-100">
              <TableHead className="w-16 text-center print:w-12">Foto</TableHead>
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
              const photoUrl = item?.photos?.[0]

              return (
                <TableRow key={h.id} className="print:border-b-gray-300">
                  <TableCell className="text-center p-2 align-middle">
                    {photoUrl ? (
                      <img
                        src={photoUrl}
                        className="w-8 h-8 md:w-10 md:h-10 mx-auto rounded object-cover border"
                        alt="Item"
                      />
                    ) : (
                      <div className="w-8 h-8 md:w-10 md:h-10 mx-auto rounded bg-muted flex items-center justify-center border border-dashed">
                        <ImageIcon className="w-3 h-3 text-muted-foreground/30" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-[11px] whitespace-nowrap align-middle">
                    {format(new Date(h.date), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                  </TableCell>
                  <TableCell className="font-mono text-xs font-semibold align-middle">
                    {item?.hasAssetNumber ? item.assetNumber : h.inventoryId}
                  </TableCell>
                  <TableCell className="text-sm align-middle">{team?.name || '-'}</TableCell>
                  <TableCell className="align-middle">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium print:border print:bg-transparent ${
                        h.type === 'status_change'
                          ? 'bg-amber-100 text-amber-800 print:border-amber-500'
                          : 'bg-blue-100 text-blue-800 print:border-blue-500'
                      }`}
                    >
                      {h.type}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm align-middle">{h.description}</TableCell>
                  <TableCell className="text-xs align-middle">{h.user}</TableCell>
                </TableRow>
              )
            })}
            {filteredHistory.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
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
