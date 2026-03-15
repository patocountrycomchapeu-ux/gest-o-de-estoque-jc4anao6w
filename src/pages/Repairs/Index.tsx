import { useState } from 'react'
import { useAppStore } from '@/store/AppStore'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Settings2, Camera, Wrench } from 'lucide-react'
import { UpdateDialog } from '@/pages/Teams/UpdateDialog'
import { InventoryItem } from '@/types'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function RepairsPage() {
  const { inventory, getNodePath } = useAppStore()
  const [updateItem, setUpdateItem] = useState<InventoryItem | null>(null)

  const repairItems = inventory.filter((i) => i.condition === 'repair')
  const totalCost = repairItems.reduce((acc, curr) => acc + (curr.repairCost || 0), 0)

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Gestão de Reparos</h2>
        <p className="text-muted-foreground">
          Acompanhe e gerencie as ferramentas que estão em processo de manutenção ativa.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="bg-amber-500/5 border-amber-200">
          <CardContent className="p-6">
            <div className="text-sm font-medium text-amber-800">Total de Instâncias em Reparo</div>
            <div className="text-3xl font-bold mt-2 text-amber-900">{repairItems.length}</div>
          </CardContent>
        </Card>
        <Card className="bg-slate-50 border-slate-200">
          <CardContent className="p-6">
            <div className="text-sm font-medium text-slate-600">Custo Total Estimado (R$)</div>
            <div className="text-3xl font-bold mt-2 tabular-nums">R$ {totalCost.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="w-5 h-5 text-amber-600" /> Ferramentas em Manutenção
          </CardTitle>
          <CardDescription>
            Lista de itens atualmente registrados com status de reparo, localização física e custos
            envolvidos.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="w-16 text-center">Foto</TableHead>
                <TableHead>Patrimônio</TableHead>
                <TableHead>Item (Marca)</TableHead>
                <TableHead>Local / Assistência</TableHead>
                <TableHead>Custo</TableHead>
                <TableHead>Data de Envio</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {repairItems.map((item) => {
                const path = getNodePath(item.treeNodeId)
                const name = path.find((n) => n.level === 'item')?.name || 'Item'
                const marca = path.find((n) => n.level === 'marca')?.name || '-'

                return (
                  <TableRow key={item.id} className="group">
                    <TableCell className="text-center">
                      <Avatar className="h-9 w-9 mx-auto rounded-md border">
                        <AvatarImage src={item.photos?.[0]} className="object-cover" />
                        <AvatarFallback>
                          <Camera className="h-3 w-3 text-muted-foreground/50" />
                        </AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell className="font-mono text-xs font-medium">
                      {item.hasAssetNumber ? item.assetNumber : 'S/N'}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-sm">{name}</div>
                      <div className="text-xs text-muted-foreground">{marca}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{item.repairLocation || '-'}</div>
                      {item.repairDescription && (
                        <div
                          className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5"
                          title={item.repairDescription}
                        >
                          {item.repairDescription}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="tabular-nums text-sm font-medium text-slate-700">
                      R$ {item.repairCost?.toFixed(2) || '0.00'}
                    </TableCell>
                    <TableCell className="text-xs">
                      {item.repairDate
                        ? format(new Date(item.repairDate), 'dd/MM/yyyy', { locale: ptBR })
                        : '-'}
                      <div className="text-[9px] text-muted-foreground mt-0.5">
                        por {item.repairUser || '-'}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setUpdateItem(item)}
                        className="h-8"
                      >
                        <Settings2 className="w-4 h-4 sm:mr-2" />{' '}
                        <span className="hidden sm:inline">Gerenciar</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
              {repairItems.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                    Nenhum item em reparo no momento.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <UpdateDialog
        item={updateItem}
        open={!!updateItem}
        onOpenChange={(o) => !o && setUpdateItem(null)}
      />
    </div>
  )
}
