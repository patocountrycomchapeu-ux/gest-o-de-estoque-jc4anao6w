import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAppStore } from '@/store/AppStore'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Plus, Settings2, Camera } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { AllocateDialog } from './AllocateDialog'
import { UpdateDialog } from './UpdateDialog'
import { InventoryItem } from '@/types'

const statusMap = {
  good: { label: 'Bom estado', variant: 'success' },
  damaged: { label: 'Danificado', variant: 'destructive' },
  repair: { label: 'Para Reparo', variant: 'warning' },
}

export default function TeamDetail() {
  const { id } = useParams()
  const { teams, inventory, getNodePath } = useAppStore()
  const [allocateOpen, setAllocateOpen] = useState(false)
  const [updateItem, setUpdateItem] = useState<InventoryItem | null>(null)

  const team = teams.find((t) => t.id === id)
  if (!team)
    return (
      <div className="p-8 text-center">
        Equipe não encontrada.{' '}
        <Link to="/equipes" className="text-blue-500 underline">
          Voltar
        </Link>
      </div>
    )

  const teamInventory = inventory.filter((i) => i.teamId === id)

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild className="rounded-full bg-muted/50">
          <Link to="/equipes">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h2 className="text-2xl font-bold tracking-tight">{team.name}</h2>
          <p className="text-muted-foreground">
            {team.description} • {team.location}
          </p>
        </div>
        <Button onClick={() => setAllocateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" /> Alocar Instâncias
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="w-16 text-center">Fotos</TableHead>
                <TableHead>Identificador</TableHead>
                <TableHead>Item (Marca)</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teamInventory.map((item) => {
                const path = getNodePath(item.treeNodeId)
                const marcaNode = path.find((n) => n.level === 'marca')
                const itemNode = path.find((n) => n.level === 'item')
                const fullPath = path.map((n) => n.name).join(' > ')
                const status = statusMap[item.condition]
                const mainPhoto = item.photos?.[0]

                return (
                  <TableRow key={item.id} className="group">
                    <TableCell className="text-center">
                      <Avatar className="h-10 w-10 mx-auto rounded-md border border-border/50">
                        {mainPhoto ? (
                          <AvatarImage src={mainPhoto} className="object-cover" />
                        ) : (
                          <AvatarFallback className="rounded-md bg-muted">
                            <Camera className="h-4 w-4 text-muted-foreground/50" />
                          </AvatarFallback>
                        )}
                      </Avatar>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {item.id}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {itemNode?.name || 'Item'} ({marcaNode?.name || 'Marca'})
                      </div>
                      <div
                        className="text-xs text-muted-foreground mt-0.5 line-clamp-1"
                        title={fullPath}
                      >
                        {fullPath}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${item.condition === 'good' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' : item.condition === 'damaged' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'}`}
                      >
                        {status.label}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setUpdateItem(item)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Settings2 className="h-4 w-4 mr-2" /> Perfil
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
              {teamInventory.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                    Nenhuma ferramenta alocada para esta equipe.
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
    </div>
  )
}
