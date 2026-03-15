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

export function DamagedTab() {
  const { inventory, getNodePath } = useAppStore()
  const damagedItems = inventory.filter((i) => i.condition === 'damaged')

  const handleExport = () => {
    const headers = ['Patrimonio', 'Item', 'Marca', 'Data do Registro', 'Responsavel']
    const rows = damagedItems.map((item) => {
      const path = getNodePath(item.treeNodeId)
      const name = path.find((n) => n.level === 'item')?.name || 'Item'
      const marca = path.find((n) => n.level === 'marca')?.name || '-'
      const date = item.damagedDate ? format(new Date(item.damagedDate), 'dd/MM/yyyy') : '-'
      return `"${item.hasAssetNumber ? item.assetNumber : 'S/N'}","${name}","${marca}","${date}","${item.damagedUser || '-'}"`
    })

    const csv = [headers.join(','), ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `relatorio_danificados_${format(new Date(), 'yyyyMMdd')}.csv`
    a.click()
  }

  return (
    <Card className="animate-slide-up print:border-none print:shadow-none">
      <CardHeader className="bg-muted/30 pb-4 border-b flex justify-end print:hidden flex-row gap-2">
        <Button variant="outline" onClick={handleExport}>
          <Download className="w-4 h-4 mr-2" /> Exportar CSV
        </Button>
        <Button variant="outline" onClick={() => window.print()}>
          <Printer className="w-4 h-4 mr-2" /> Imprimir (PDF)
        </Button>
      </CardHeader>

      <div className="hidden print:block mb-4 p-4 pb-0">
        <h2 className="text-xl font-bold uppercase tracking-tight">
          Relatório de Itens Danificados
        </h2>
        <p className="text-sm text-gray-600">
          Equipamentos e ferramentas marcados como avariados que demandam atenção.
        </p>
      </div>

      <CardContent className="p-0 print:p-2">
        <Table className="print:text-xs">
          <TableHeader>
            <TableRow className="print:bg-gray-100">
              <TableHead className="w-16 text-center print:w-12">Foto</TableHead>
              <TableHead>Patrimônio</TableHead>
              <TableHead>Item (Marca)</TableHead>
              <TableHead>Data do Registro</TableHead>
              <TableHead>Responsável</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {damagedItems.map((item) => {
              const path = getNodePath(item.treeNodeId)
              const name = path.find((n) => n.level === 'item')?.name || 'Item'
              const marca = path.find((n) => n.level === 'marca')?.name || '-'
              return (
                <TableRow key={item.id} className="print:border-b-gray-300">
                  <TableCell className="text-center p-2 align-middle">
                    {item.photos?.[0] ? (
                      <img
                        src={item.photos[0]}
                        alt="Item"
                        className="w-8 h-8 rounded object-cover mx-auto print:border"
                      />
                    ) : (
                      <div className="w-8 h-8 mx-auto bg-muted rounded flex items-center justify-center print:border print:bg-transparent">
                        <Camera className="w-3 h-3 text-muted-foreground/50" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-xs font-semibold align-middle">
                    {item.hasAssetNumber ? item.assetNumber : 'S/N'}
                  </TableCell>
                  <TableCell className="align-middle">
                    <div className="font-medium">{name}</div>
                    <div className="text-[10px] text-muted-foreground">{marca}</div>
                  </TableCell>
                  <TableCell className="text-sm align-middle">
                    {item.damagedDate
                      ? format(new Date(item.damagedDate), 'dd/MM/yyyy HH:mm', { locale: ptBR })
                      : '-'}
                  </TableCell>
                  <TableCell className="text-xs align-middle">{item.damagedUser || '-'}</TableCell>
                </TableRow>
              )
            })}
            {damagedItems.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  Nenhum item marcado como danificado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
