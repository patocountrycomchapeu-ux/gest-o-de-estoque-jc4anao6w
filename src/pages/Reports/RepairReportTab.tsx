import { useAppStore } from '@/store/AppStore'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
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
import { Camera, Download, Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function RepairReportTab() {
  const { inventory, getNodePath, suppliers } = useAppStore()
  const repairItems = inventory.filter((i) => i.condition === 'repair')

  const handleExport = () => {
    const headers = [
      'Patrimonio',
      'Item',
      'Custo Reparo',
      'Fornecedor',
      'Data Envio',
      'Responsavel',
    ]
    const rows = repairItems.map((item) => {
      const path = getNodePath(item.treeNodeId)
      const name = path.find((n) => n.level === 'item')?.name || 'Item'
      const supplier = suppliers.find((s) => s.id === item.supplierId)
      const date = item.repairDate ? format(new Date(item.repairDate), 'dd/MM/yyyy HH:mm') : '-'
      return `"${item.hasAssetNumber ? item.assetNumber : 'S/N'}","${name}","${item.repairCost || 0}","${supplier?.name || '-'}","${date}","${item.repairUser || '-'}"`
    })

    const csv = [headers.join(','), ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `relatorio_reparos_${format(new Date(), 'yyyyMMdd')}.csv`
    a.click()
  }

  return (
    <Card className="animate-slide-up print:border-none print:shadow-none">
      <CardHeader className="bg-muted/30 pb-4 border-b flex justify-end print:hidden flex-row gap-2">
        <Button variant="outline" onClick={handleExport}>
          <Download className="w-4 h-4 mr-2" /> Exportar CSV
        </Button>
        <Button variant="outline" onClick={() => window.print()}>
          <Printer className="w-4 h-4 mr-2" /> Imprimir
        </Button>
      </CardHeader>
      <div className="hidden print:block mb-4 p-4 pb-0">
        <h2 className="text-xl font-bold uppercase tracking-tight">Itens em Processo de Reparo</h2>
        <p className="text-sm text-gray-600">
          Listagem de ferramentas enviadas para assistência técnica com controle de custos.
        </p>
      </div>
      <CardContent className="p-0 print:p-2">
        <Table className="print:text-xs">
          <TableHeader>
            <TableRow className="print:bg-gray-100">
              <TableHead className="w-16 text-center print:w-12">Foto</TableHead>
              <TableHead>Patrimônio</TableHead>
              <TableHead>Item (Marca)</TableHead>
              <TableHead className="text-right">Custo (R$)</TableHead>
              <TableHead>Fornecedor</TableHead>
              <TableHead>Data de Envio</TableHead>
              <TableHead>Responsável</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {repairItems.map((item) => {
              const path = getNodePath(item.treeNodeId)
              const name = path.find((n) => n.level === 'item')?.name || 'Item'
              const marca = path.find((n) => n.level === 'marca')?.name || '-'
              const supplier = suppliers.find((s) => s.id === item.supplierId)
              return (
                <TableRow key={item.id} className="print:border-b-gray-300">
                  <TableCell className="text-center p-2">
                    {item.photos?.[0] ? (
                      <img
                        src={item.photos[0]}
                        alt="Item"
                        className="w-8 h-8 rounded object-cover mx-auto print:border"
                      />
                    ) : (
                      <div className="w-8 h-8 mx-auto bg-muted flex items-center justify-center">
                        <Camera className="w-3 h-3 text-muted-foreground/50" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-xs font-semibold">
                    {item.hasAssetNumber ? item.assetNumber : 'S/N'}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{name}</div>
                    <div className="text-[10px] text-muted-foreground">{marca}</div>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {item.repairCost?.toFixed(2) || '0.00'}
                  </TableCell>
                  <TableCell className="text-sm">{supplier?.name || '-'}</TableCell>
                  <TableCell className="text-xs">
                    {item.repairDate
                      ? format(new Date(item.repairDate), 'dd/MM/yyyy HH:mm', { locale: ptBR })
                      : '-'}
                  </TableCell>
                  <TableCell className="text-xs">{item.repairUser || '-'}</TableCell>
                </TableRow>
              )
            })}
            {repairItems.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  Nenhum item em reparo.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
