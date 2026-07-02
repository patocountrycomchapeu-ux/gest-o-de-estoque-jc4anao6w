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
import { Settings2, Camera, Wrench, Send, History } from 'lucide-react'
import { UpdateDialog } from '@/pages/Teams/UpdateDialog'
import { InventoryItem } from '@/types'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { canViewRepairs, canManageRepairs } from '@/lib/permissions'
import { Navigate, Link } from 'react-router-dom'

export default function RepairsPage() {
  const { inventory, getNodePath, suppliers, currentUser } = useAppStore()
  const [updateItem, setUpdateItem] = useState<InventoryItem | null>(null)

  if (!canViewRepairs(currentUser)) return <Navigate to="/" replace />
  const canManage = canManageRepairs(currentUser)

  const repairItems = inventory.filter((i) => i.condition === 'repair')
  const totalCost = repairItems.reduce((acc, curr) => acc + (curr.repairCost || 0), 0)

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Gestão de Reparos</h2>
        <p className="text-muted-foreground">
          Acompanhe as ferramentas em manutenção e fornecedores vinculados.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="bg-amber-500/5 border-amber-200">
          <CardContent className="p-6">
            <div className="text-sm font-medium text-amber-800">Instâncias em Reparo</div>
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
            Controle detalhado de envio, assistência técnica e custos associados.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="w-16 text-center">Foto</TableHead>
                <TableHead>Patrimônio / Item</TableHead>
                <TableHead>Fornecedor & Envio</TableHead>
                <TableHead>Diagnóstico</TableHead>
                <TableHead>Custo</TableHead>
                {canManage && <TableHead className="text-right">Ações</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {repairItems.map((item) => {
                const path = getNodePath(item.treeNodeId)
                const name = path.find((n) => n.level === 'linha')?.name || 'Item'
                const marca = path.find((n) => n.level === 'marca')?.name || '-'
                const supplier = suppliers.find((s) => s.id === item.supplierId)

                return (
                  <TableRow key={item.id}>
                    <TableCell className="text-center">
                      <Avatar className="h-9 w-9 mx-auto rounded border">
                        <AvatarImage src={item.photos?.[0]} className="object-cover" />
                        <AvatarFallback>
                          <Camera className="h-3 w-3 text-muted-foreground/50" />
                        </AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell>
                      <div className="font-mono text-xs font-semibold">
                        {item.hasAssetNumber ? item.assetNumber : 'S/N'}
                      </div>
                      <div className="font-medium text-sm mt-0.5">{name}</div>
                      <div className="text-[10px] text-muted-foreground">{marca}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">{supplier?.name || '-'}</div>
                      <div className="flex items-center gap-1.5 mt-1">
                        {item.repairSent ? (
                          <span className="inline-flex items-center text-[10px] font-semibold bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                            <Send className="w-3 h-3 mr-1" /> Enviado
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-[10px] font-semibold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">
                            Pendente Envio
                          </span>
                        )}
                      </div>
                      {item.expectedReturnDate && (
                        <div className="text-[10px] text-muted-foreground mt-1">
                          Retorno prev.:{' '}
                          {new Date(item.expectedReturnDate).toLocaleDateString('pt-BR')}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-xs bg-muted px-2 py-1 rounded inline-block mb-1 border border-border/50">
                        {item.conditionCategory || 'Não categorizado'}
                      </div>
                      {item.repairDescription && (
                        <div
                          className="text-[10px] text-muted-foreground line-clamp-2 mt-0.5"
                          title={item.repairDescription}
                        >
                          {item.repairDescription}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="tabular-nums text-sm font-medium pt-5">
                      R$ {item.repairCost?.toFixed(2) || '0.00'}
                    </TableCell>
                    {canManage && (
                      <TableCell className="text-right pt-3">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                            className="h-8 w-8 p-0"
                            title="Ver Histórico"
                          >
                            <Link to={`/itens/${item.id}/historico`}>
                              <History className="w-4 h-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setUpdateItem(item)}
                            className="h-8"
                          >
                            <Settings2 className="w-4 h-4 sm:mr-2" />
                            <span className="hidden sm:inline">Gerenciar</span>
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                )
              })}
              {repairItems.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={canManage ? 6 : 5}
                    className="h-32 text-center text-muted-foreground"
                  >
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
