import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAppStore } from '@/store/AppStore'
import { canManageTeam } from '@/lib/permissions'
import { Button } from '@/components/ui/button'
import {
  ArrowLeft,
  Plus,
  Settings2,
  Camera,
  ClipboardCheck,
  ArrowRightLeft,
  MoreVertical,
  PackageOpen,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { AllocateDialog } from './AllocateDialog'
import { UpdateDialog } from './UpdateDialog'
import { TransferDialog } from './TransferDialog'
import { ReceiveDialog } from './ReceiveDialog'
import { AdjustGroupedDialog } from './AdjustGroupedDialog'
import { PhotoGalleryDialog } from '@/components/PhotoGalleryDialog'
import { InventoryItem, Transfer } from '@/types'

const statusMap = {
  good: { label: 'Bom estado', variant: 'success' },
  damaged: { label: 'Danificado', variant: 'destructive' },
  repair: { label: 'Para Reparo', variant: 'warning' },
}

export default function TeamDetail() {
  const { id } = useParams()
  const { teams, inventory, getNodePath, transfers, currentUser, nodes } = useAppStore()
  const [allocateOpen, setAllocateOpen] = useState(false)
  const [updateItem, setUpdateItem] = useState<InventoryItem | null>(null)
  const [transferItem, setTransferItem] = useState<InventoryItem | null>(null)
  const [receiveTransfer, setReceiveTransfer] = useState<Transfer | null>(null)
  const [adjustItem, setAdjustItem] = useState<InventoryItem | null>(null)

  const [galleryPhotos, setGalleryPhotos] = useState<string[]>([])
  const [galleryOpen, setGalleryOpen] = useState(false)

  const team = teams.find((t) => t.id === id)
  if (!team) return <div className="p-8 text-center">Equipe não encontrada.</div>

  const teamInventory = inventory.filter((i) => i.teamId === id)
  const usableCount = teamInventory
    .filter((i) => i.condition === 'good')
    .reduce((acc, i) => acc + (i.quantity || 1), 0)
  const inRepairCount = teamInventory
    .filter((i) => i.condition === 'repair')
    .reduce((acc, i) => acc + (i.quantity || 1), 0)
  const damagedCount = teamInventory
    .filter((i) => i.condition === 'damaged')
    .reduce((acc, i) => acc + (i.quantity || 1), 0)

  const pendingIncoming = transfers.filter((t) => t.toTeamId === id && t.status === 'pending')
  const pendingOutgoing = transfers.filter((t) => t.fromTeamId === id && t.status === 'pending')
  const canManage = canManageTeam(currentUser, team.id)

  const openGallery = (photos: string[]) => {
    if (photos && photos.length > 0) {
      setGalleryPhotos(photos)
      setGalleryOpen(true)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="rounded-full bg-muted/50 mt-1 sm:mt-0"
          >
            <Link to="/equipes">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{team.name}</h2>
            <div className="flex flex-wrap gap-2 mt-1.5">
              <Badge
                variant="outline"
                className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
              >
                {usableCount} Utilizáveis
              </Badge>
              {inRepairCount > 0 && (
                <Badge
                  variant="outline"
                  className="bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
                >
                  {inRepairCount} Em Reparo
                </Badge>
              )}
              {damagedCount > 0 && (
                <Badge
                  variant="outline"
                  className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                >
                  {damagedCount} Danificados
                </Badge>
              )}
            </div>
          </div>
        </div>
        {canManage && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setAllocateOpen(true)}>
              <Plus className="h-4 w-4 mr-2" /> Alocar
            </Button>
            <Button asChild>
              <Link to={`/equipes/${team.id}/auditoria`}>
                <ClipboardCheck className="h-4 w-4 mr-2" /> Auditoria
              </Link>
            </Button>
          </div>
        )}
      </div>

      {canManage && pendingIncoming.length > 0 && (
        <Card className="border-amber-500/40 bg-amber-500/5 shadow-none animate-slide-down">
          <CardHeader className="py-3">
            <CardTitle className="text-amber-700 text-sm flex items-center gap-2">
              <ArrowRightLeft className="h-4 w-4" /> Ferramentas em Trânsito para Validação (
              {pendingIncoming.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 pb-4">
            {pendingIncoming.map((t) => {
              const item = inventory.find((i) => i.id === t.inventoryId)
              const name = item
                ? getNodePath(item.treeNodeId).find((n) => n.level === 'item')?.name
                : 'Item'
              return (
                <div
                  key={t.id}
                  className="flex items-center justify-between bg-background border rounded-md p-3"
                >
                  <div>
                    <p className="font-medium text-sm">
                      {name}{' '}
                      <span className="text-xs font-mono text-muted-foreground ml-2">
                        {item?.hasAssetNumber ? item.assetNumber : 'S/N'}
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Enviado por: {t.initiatedBy}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => setReceiveTransfer(t)}
                    className="bg-amber-600 hover:bg-amber-700 text-white"
                  >
                    <PackageOpen className="h-4 w-4 mr-2" /> Verificar e Receber
                  </Button>
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="w-16 text-center">Fotos</TableHead>
                <TableHead>Patrimônio / Lote</TableHead>
                <TableHead>Item (Marca)</TableHead>
                <TableHead>Condição / Status</TableHead>
                {canManage && <TableHead className="text-right">Ações</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {teamInventory.map((item) => {
                const path = getNodePath(item.treeNodeId)
                const marcaNode = path.find((n) => n.level === 'marca')
                const itemNode = path.find((n) => n.level === 'item')
                const isOutgoing = pendingOutgoing.some((t) => t.inventoryId === item.id)
                const isGrouped = nodes.find((n) => n.id === item.treeNodeId)?.isGrouped

                return (
                  <TableRow key={item.id}>
                    <TableCell className="text-center">
                      <Avatar
                        className={`h-9 w-9 mx-auto rounded-md border ${item.photos?.length ? 'cursor-pointer hover:opacity-80 ring-2 ring-transparent hover:ring-primary/40 transition-all' : ''}`}
                        onClick={() => openGallery(item.photos)}
                      >
                        <AvatarImage src={item.photos?.[0]} className="object-cover" />
                        <AvatarFallback className="bg-muted">
                          <Camera className="h-3 w-3 text-muted-foreground/50" />
                        </AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell className="font-mono text-xs font-semibold">
                      {isGrouped ? (
                        <Badge
                          variant="secondary"
                          className="bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200 cursor-default"
                        >
                          Lote: {item.quantity} un.
                        </Badge>
                      ) : item.hasAssetNumber ? (
                        item.assetNumber
                      ) : (
                        <span className="text-muted-foreground italic font-normal">
                          Sem Patrimônio
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{itemNode?.name || 'Item'}</div>
                      <div className="text-xs text-muted-foreground">
                        {marcaNode?.name || 'Marca'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1 items-start">
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${item.condition === 'good' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : item.condition === 'repair' ? 'bg-amber-100 text-amber-800 border-amber-200' : 'bg-red-100 text-red-800 border-red-200'}`}
                        >
                          {statusMap[item.condition].label}
                        </Badge>
                        {item.status !== 'present' && (
                          <Badge
                            variant="outline"
                            className="text-[10px] bg-slate-100 text-slate-700 border-slate-200"
                          >
                            {item.status === 'in_maintenance'
                              ? 'Em Manutenção'
                              : item.status === 'defect_stock'
                                ? 'Estoque de Defeito'
                                : item.status === 'missing'
                                  ? 'Extraviado'
                                  : item.status === 'borrowed'
                                    ? 'Emprestado'
                                    : item.status === 'returned_to_team'
                                      ? 'Devolvido'
                                      : item.status}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    {canManage && (
                      <TableCell className="text-right">
                        {isOutgoing ? (
                          <Badge
                            variant="outline"
                            className="bg-amber-100 text-amber-800 border-amber-200 text-[10px]"
                          >
                            Em Transferência
                          </Badge>
                        ) : (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {isGrouped ? (
                                <DropdownMenuItem onClick={() => setAdjustItem(item)}>
                                  <Settings2 className="h-4 w-4 mr-2" /> Ajuste Rápido (Lote)
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem onClick={() => setUpdateItem(item)}>
                                  <Settings2 className="h-4 w-4 mr-2" /> Editar / Reparo / Fotos
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => setTransferItem(item)}>
                                <ArrowRightLeft className="h-4 w-4 mr-2" /> Transferir{' '}
                                {isGrouped ? 'Lote' : 'Instância'}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                )
              })}
              {teamInventory.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={canManage ? 5 : 4}
                    className="h-32 text-center text-muted-foreground"
                  >
                    Nenhuma ferramenta alocada.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AllocateDialog teamId={team.id} open={allocateOpen} onOpenChange={setAllocateOpen} />
      <UpdateDialog
        item={updateItem}
        open={!!updateItem}
        onOpenChange={(o) => !o && setUpdateItem(null)}
      />
      <AdjustGroupedDialog
        item={adjustItem}
        open={!!adjustItem}
        onOpenChange={(o) => !o && setAdjustItem(null)}
      />
      <TransferDialog
        item={transferItem}
        open={!!transferItem}
        onOpenChange={(o) => !o && setTransferItem(null)}
        teamId={team.id}
      />
      <ReceiveDialog
        transfer={receiveTransfer}
        open={!!receiveTransfer}
        onOpenChange={(o) => !o && setReceiveTransfer(null)}
      />
      <PhotoGalleryDialog photos={galleryPhotos} open={galleryOpen} onOpenChange={setGalleryOpen} />
    </div>
  )
}
