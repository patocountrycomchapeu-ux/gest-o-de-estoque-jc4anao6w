import { useState, useMemo } from 'react'
import { useAppStore } from '@/store/AppStore'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
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
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Printer, Download, FilterX } from 'lucide-react'
import { Label } from '@/components/ui/label'

export function AssetHistoryTab() {
  const { history, inventory, nodes, teams, getNodePath } = useAppStore()

  const [assetNumber, setAssetNumber] = useState('')
  const [nameFilter, setNameFilter] = useState('')
  const [nodeId, setNodeId] = useState('all')
  const [responsible, setResponsible] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const leafNodes = useMemo(() => {
    return nodes
      .filter((n) => n.level === 'marca' || n.level === 'linha')
      .map((n) => {
        const path = getNodePath(n.id)
        return {
          id: n.id,
          name: path.map((p) => p.name).join(' > '),
        }
      })
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [nodes, getNodePath])

  const filteredHistory = useMemo(() => {
    return history
      .filter((h) => {
        const item = inventory.find((i) => i.id === h.inventoryId)
        if (!item) return false

        if (
          assetNumber &&
          (!item.hasAssetNumber ||
            !item.assetNumber?.toLowerCase().includes(assetNumber.toLowerCase()))
        )
          return false

        const path = getNodePath(item.treeNodeId)
        const itemName = path.find((n) => n.level === 'linha')?.name || ''
        const marcaName = path.find((n) => n.level === 'marca')?.name || ''
        if (
          nameFilter &&
          !itemName.toLowerCase().includes(nameFilter.toLowerCase()) &&
          !marcaName.toLowerCase().includes(nameFilter.toLowerCase())
        )
          return false

        if (nodeId !== 'all' && item.treeNodeId !== nodeId) return false

        if (responsible && !h.user.toLowerCase().includes(responsible.toLowerCase())) return false

        const hDate = new Date(h.date).getTime()
        if (dateFrom && hDate < new Date(`${dateFrom}T00:00:00`).getTime()) return false
        if (dateTo && hDate > new Date(`${dateTo}T23:59:59`).getTime()) return false

        return true
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [
    history,
    inventory,
    nodes,
    assetNumber,
    nameFilter,
    nodeId,
    responsible,
    dateFrom,
    dateTo,
    getNodePath,
  ])

  const handleClearFilters = () => {
    setAssetNumber('')
    setNameFilter('')
    setNodeId('all')
    setResponsible('')
    setDateFrom('')
    setDateTo('')
  }

  const handleExportCSV = () => {
    const headers = ['Data', 'Patrimonio', 'Item', 'Tipo', 'Descricao', 'Responsavel']
    const rows = filteredHistory.map((h) => {
      const item = inventory.find((i) => i.id === h.inventoryId)
      const path = getNodePath(item?.treeNodeId || '')
      const name = path.find((n) => n.level === 'linha')?.name || 'Item'
      return `"${h.date}","${item?.hasAssetNumber ? item.assetNumber : 'S/N'}","${name}","${h.type}","${h.description.replace(/"/g, '""')}","${h.user}"`
    })
    const csv = [headers.join(','), ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `historico_ativo_${format(new Date(), 'yyyyMMdd')}.csv`
    a.click()
  }

  return (
    <Card className="animate-slide-up print:border-none print:shadow-none">
      <CardHeader className="bg-muted/30 pb-4 border-b gap-4 print:hidden">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Patrimônio</Label>
            <Input
              className="h-8 text-xs"
              placeholder="Ex: PAT-123"
              value={assetNumber}
              onChange={(e) => setAssetNumber(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Nome do Item</Label>
            <Input
              className="h-8 text-xs"
              placeholder="Ex: Furadeira"
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Árvore / Categoria</Label>
            <Select value={nodeId} onValueChange={setNodeId}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Categorias</SelectItem>
                {leafNodes.map((n) => (
                  <SelectItem key={n.id} value={n.id}>
                    {n.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Responsável</Label>
            <Input
              className="h-8 text-xs"
              placeholder="Ex: João"
              value={responsible}
              onChange={(e) => setResponsible(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Data Inicial</Label>
            <Input
              type="date"
              className="h-8 text-xs"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Data Final</Label>
            <Input
              type="date"
              className="h-8 text-xs"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-between items-center mt-2">
          <Button variant="ghost" size="sm" onClick={handleClearFilters} className="text-xs h-8">
            <FilterX className="w-3.5 h-3.5 mr-1.5" /> Limpar Filtros
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExportCSV} className="h-8">
              <Download className="w-3.5 h-3.5 mr-2" /> Excel
            </Button>
            <Button variant="outline" size="sm" onClick={() => window.print()} className="h-8">
              <Printer className="w-3.5 h-3.5 mr-2" /> Imprimir
            </Button>
          </div>
        </div>
      </CardHeader>

      <div className="hidden print:block mb-4 p-4 pb-0">
        <h2 className="text-xl font-bold uppercase tracking-tight">
          Histórico de Ativo Específico
        </h2>
        <p className="text-sm text-gray-600">Relatório de movimentações filtrado.</p>
      </div>

      <CardContent className="p-0 print:p-2">
        <Table className="print:text-xs">
          <TableHeader>
            <TableRow className="print:bg-gray-100">
              <TableHead>Data</TableHead>
              <TableHead>Item (Patrimônio)</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Descrição / Motivo</TableHead>
              <TableHead>Responsável</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredHistory.map((h) => {
              const item = inventory.find((i) => i.id === h.inventoryId)
              const path = getNodePath(item?.treeNodeId || '')
              const itemName = path.find((n) => n.level === 'linha')?.name || 'Item'

              return (
                <TableRow key={h.id} className="print:border-b-gray-300">
                  <TableCell className="text-[11px] whitespace-nowrap align-middle">
                    {format(new Date(h.date), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                  </TableCell>
                  <TableCell className="align-middle">
                    <div className="font-medium text-sm">{itemName}</div>
                    <div className="font-mono text-xs text-muted-foreground">
                      {item?.hasAssetNumber ? item.assetNumber : 'S/N'}
                    </div>
                  </TableCell>
                  <TableCell className="align-middle">
                    <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium bg-muted">
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
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  Nenhum registro encontrado com os filtros atuais.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
