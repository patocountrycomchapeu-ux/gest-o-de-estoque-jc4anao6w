import { useState, useMemo } from 'react'
import { useAppStore } from '@/store/AppStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { canManageUsers } from '@/lib/permissions'
import { Printer, Download, Image as ImageIcon } from 'lucide-react'
import { format } from 'date-fns'
import { PhotoGalleryDialog } from '@/components/PhotoGalleryDialog'

const conditionLabels: Record<string, string> = {
  good: 'Bom estado',
  damaged: 'Danificado',
  repair: 'Em Reparo',
}

export function TeamInventoryTab() {
  const { teams, inventory, getNodePath, currentUser, nodes } = useAppStore()
  const isMasterAdmin = canManageUsers(currentUser)
  const [galleryPhotos, setGalleryPhotos] = useState<string[]>([])
  const [galleryOpen, setGalleryOpen] = useState(false)

  const grouped = useMemo(() => {
    return teams.map((team) => {
      const items = inventory.filter((i) => i.teamId === team.id)
      const totalValue = items.reduce(
        (acc, curr) => acc + (curr.price || 0) * (curr.quantity || 1),
        0,
      )
      return { team, items, totalValue }
    })
  }, [teams, inventory])

  const handleExportCSV = () => {
    const headers = [
      'Equipe',
      'Patrimonio',
      'Item',
      'Marca',
      'Condicao',
      ...(isMasterAdmin ? ['Valor Unitario (R$)'] : []),
    ]
    const rows: string[] = []

    grouped.forEach(({ team, items }) => {
      items.forEach((item) => {
        const isGrouped = nodes.find((n) => n.id === item.treeNodeId)?.isGrouped
        const path = getNodePath(item.treeNodeId)
        const marca = path.find((n) => n.level === 'marca')?.name || '-'
        const itemName = path.find((n) => n.level === 'item')?.name || 'Item'
        const qtyStr = isGrouped
          ? `Lote: ${item.quantity} un.`
          : item.hasAssetNumber
            ? item.assetNumber
            : 'S/N'
        const baseRow = `"${team.name}","${qtyStr}","${itemName}","${marca}","${conditionLabels[item.condition]}"`
        rows.push(isMasterAdmin ? `${baseRow},"${item.price || 0}"` : baseRow)
      })
    })

    const csv = [headers.join(','), ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `inventario_equipes_${format(new Date(), 'yyyyMMdd')}.csv`
    a.click()
  }

  const openGallery = (photos: string[]) => {
    if (photos && photos.length > 0) {
      setGalleryPhotos(photos)
      setGalleryOpen(true)
    }
  }

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex justify-end gap-2 print:hidden mb-4">
        <Button variant="outline" onClick={handleExportCSV}>
          <Download className="w-4 h-4 mr-2" /> Exportar CSV
        </Button>
        <Button variant="default" onClick={() => window.print()}>
          <Printer className="w-4 h-4 mr-2" /> Imprimir Relatório
        </Button>
      </div>

      <div className="hidden print:block mb-6">
        <h2 className="text-2xl font-bold uppercase tracking-tight">
          Inventário Consolidado por Equipe
        </h2>
        <p className="text-sm text-gray-600">Data de Emissão: {format(new Date(), 'dd/MM/yyyy')}</p>
        {isMasterAdmin && (
          <p className="text-xs text-muted-foreground mt-1">
            Este relatório contém informações financeiras confidenciais.
          </p>
        )}
      </div>

      {grouped.map(({ team, items, totalValue }) => (
        <Card key={team.id} className="print:border-none print:shadow-none break-inside-avoid">
          <CardHeader className="bg-muted/30 pb-4 border-b print:border-b-2 print:border-black flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg print:text-xl">{team.name}</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                {items.length} registros alocados
              </p>
            </div>
            {isMasterAdmin && (
              <div className="text-sm font-semibold bg-emerald-100/80 text-emerald-800 px-4 py-2 rounded-md border border-emerald-200 print:bg-transparent print:border-black print:text-black">
                Valor Total (BRL): R$ {totalValue.toFixed(2)}
              </div>
            )}
          </CardHeader>
          <CardContent className="p-0">
            <Table className="print:text-xs">
              <TableHeader>
                <TableRow className="print:bg-gray-100">
                  <TableHead className="w-16 text-center print:w-12">Foto</TableHead>
                  <TableHead>Nº Patrimônio / Lote</TableHead>
                  <TableHead>Item Base</TableHead>
                  <TableHead>Marca</TableHead>
                  <TableHead>Status / Condição</TableHead>
                  {isMasterAdmin && <TableHead className="text-right">Valor Unit. (R$)</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => {
                  const isGrouped = nodes.find((n) => n.id === item.treeNodeId)?.isGrouped
                  const path = getNodePath(item.treeNodeId)
                  const marca = path.find((n) => n.level === 'marca')?.name || '-'
                  const itemName = path.find((n) => n.level === 'item')?.name || 'Item'
                  const photoUrl = item.photos?.[0]

                  return (
                    <TableRow key={item.id} className="print:border-b-gray-300">
                      <TableCell className="text-center p-2 align-middle">
                        {photoUrl ? (
                          <img
                            src={photoUrl}
                            className="w-10 h-10 mx-auto rounded object-cover border cursor-pointer hover:opacity-80 transition-opacity print:cursor-auto"
                            alt="Item"
                            onClick={() => openGallery(item.photos)}
                          />
                        ) : (
                          <div className="w-10 h-10 mx-auto rounded bg-muted flex items-center justify-center border border-dashed">
                            <ImageIcon className="w-4 h-4 text-muted-foreground/30" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-xs font-medium align-middle">
                        {isGrouped ? (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded font-semibold text-[10px] print:bg-transparent print:border print:border-black print:text-black">
                            Lote: {item.quantity} un.
                          </span>
                        ) : item.hasAssetNumber ? (
                          item.assetNumber
                        ) : (
                          <span className="text-muted-foreground italic">S/N</span>
                        )}
                      </TableCell>
                      <TableCell className="font-medium align-middle">{itemName}</TableCell>
                      <TableCell className="text-muted-foreground align-middle">{marca}</TableCell>
                      <TableCell className="align-middle">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider print:border print:bg-transparent ${
                            item.condition === 'good'
                              ? 'bg-emerald-100 text-emerald-800 print:border-emerald-600'
                              : item.condition === 'damaged'
                                ? 'bg-red-100 text-red-800 print:border-red-600'
                                : 'bg-amber-100 text-amber-800 print:border-amber-600'
                          }`}
                        >
                          {conditionLabels[item.condition]}
                        </span>
                      </TableCell>
                      {isMasterAdmin && (
                        <TableCell className="text-right tabular-nums text-muted-foreground align-middle print:text-black">
                          {item.price ? item.price.toFixed(2) : '0.00'}
                        </TableCell>
                      )}
                    </TableRow>
                  )
                })}
                {items.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={isMasterAdmin ? 6 : 5}
                      className="text-center h-20 text-muted-foreground"
                    >
                      Nenhum item alocado nesta equipe.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}

      <PhotoGalleryDialog photos={galleryPhotos} open={galleryOpen} onOpenChange={setGalleryOpen} />
    </div>
  )
}
