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
  Send,
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
  const { teams, inventory, getNodePath, transfers, currentUser, nodes, sendTransfer } =
    useAppStore()
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
  const pendingIncoming = transfers.filter((t) => t.toTeamId === id && t.status === 'in_transit')
  const pendingOutgoing = transfers.filter((t) => t.fromTeamId === id && t.status === 'pending')
  const inTransitOutgoing = transfers.filter(
    (t) => t.fromTeamId === id && t.status === 'in_transit',
  )
  const canManage = canManageTeam(currentUser, team.id)

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
        <div className="flex items-start sm:items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="rounded-full bg-muted/50">
            <Link to="/equipes">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{team.name}</h2>
            <div className="text-sm text-muted-foreground mt-1">
              {teamInventory.length} instâncias alocadas
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
        <Card className="border-emerald-500/40 bg-emerald-500/5">
          <CardHeader className="py-3">
            <CardTitle className="text-emerald-700 text-sm flex items-center gap-2">
              <PackageOpen className="h-4 w-4" /> Aguardando Recebimento ({pendingIncoming.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 pb-4">
            {pendingIncoming.map((t) => {
              const item = inventory.find((i) => i.id === t.inventoryId)
              const name = item
                ? getNodePath(item.treeNodeId).find((n) => n.level === 'item')?.name
                : 'Item'
              return (
                <div key={t.id} className="flex justify-between bg-background border p-3 rounded">
                  <div>
                    <p className="font-medium text-sm">
                      {name}{' '}
                      <span className="text-xs text-muted-foreground ml-1">
                        {item?.hasAssetNumber ? item.assetNumber : 'S/N'}
                      </span>
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => setReceiveTransfer(t)}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    <PackageOpen className="h-4 w-4 mr-2" /> Validar e Receber
                  </Button>
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}

      {canManage && pendingOutgoing.length > 0 && (
        <Card className="border-amber-500/40 bg-amber-500/5">
          <CardHeader className="py-3">
            <CardTitle className="text-amber-700 text-sm flex items-center gap-2">
              <ArrowRightLeft className="h-4 w-4" /> Transferências Criadas - Aguardando Envio (
              {pendingOutgoing.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 pb-4">
            {pendingOutgoing.map((t) => {
              const item = inventory.find((i) => i.id === t.inventoryId)
              const name = item
                ? getNodePath(item.treeNodeId).find((n) => n.level === 'item')?.name
                : 'Item'
              return (
                <div
                  key={t.id}
                  className="flex justify-between items-center bg-background border p-3 rounded"
                >
                  <div>
                    <p className="font-medium text-sm">
                      {name}{' '}
                      <span className="text-xs text-muted-foreground ml-1">
                        {item?.assetNumber}
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Destino: {teams.find((x) => x.id === t.toTeamId)?.name}
                    </p>
                  </div>
                  <Button size="sm" onClick={() => sendTransfer(t.id)}>
                    <Send className="h-4 w-4 mr-2" /> Enviar Fisicamente
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
                <TableHead className="w-16 text-center">Foto</TableHead>
                <TableHead>Patrimônio</TableHead>
                <TableHead>Item</TableHead>
                <TableHead>Status</TableHead>
                {canManage && <TableHead className="text-right">Ações</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {teamInventory.map((item) => {
                const path = getNodePath(item.treeNodeId)
                const isGrouped = !item.hasAssetNumber
                const isOutgoingTransit = inTransitOutgoing.some((t) => t.inventoryId === item.id)
                return (
                  <TableRow key={item.id}>
                    <TableCell className="text-center">
                      <Avatar
                        className={`h-9 w-9 mx-auto rounded border ${item.photos?.length ? 'cursor-pointer hover:opacity-80 ring-2 hover:ring-primary/40' : ''}`}
                        onClick={() => {
                          if (item.photos?.length) {
                            setGalleryPhotos(item.photos)
                            setGalleryOpen(true)
                          }
                        }}
                      >
                        <AvatarImage src={item.photos?.[0]} className="object-cover" />
                        <AvatarFallback>
                          <Camera className="h-3 w-3 text-muted-foreground/50" />
                        </AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell className="font-mono text-xs font-semibold">
                      {isGrouped ? (
                        <Badge variant="secondary">Lote: {item.quantity}</Badge>
                      ) : (
                        item.assetNumber
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {path.find((n) => n.level === 'item')?.name || 'Item'}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {path.find((n) => n.level === 'marca')?.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px]">
                        {statusMap[item.condition].label}
                      </Badge>
                    </TableCell>
                    {canManage && (
                      <TableCell className="text-right">
                        {isOutgoingTransit ? (
                          <Badge variant="outline" className="bg-blue-100 text-blue-800">
                            Em Trânsito
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
                                  <Settings2 className="h-4 w-4 mr-2" /> Ajuste Lote
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem onClick={() => setUpdateItem(item)}>
                                  <Settings2 className="h-4 w-4 mr-2" /> Gerenciar
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => setTransferItem(item)}>
                                <ArrowRightLeft className="h-4 w-4 mr-2" /> Transferir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                )
              })}
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
