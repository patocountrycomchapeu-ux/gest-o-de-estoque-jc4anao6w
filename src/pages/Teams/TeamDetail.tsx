import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAppStore } from '@/store/AppStore'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Plus, Settings2, Camera, ClipboardCheck } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
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
  const { teams, inventory, checklists, getNodePath } = useAppStore()
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
  const teamChecklists = checklists
    .filter((c) => c.teamId === id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  const lastChecklist = teamChecklists[0]

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="rounded-full bg-muted/50">
            <Link to="/equipes">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{team.name}</h2>
            <p className="text-muted-foreground">
              {team.description} • {team.location}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setAllocateOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> Alocar
          </Button>
          <Button asChild>
            <Link to={`/equipes/${team.id}/auditoria`}>
              <ClipboardCheck className="h-4 w-4 mr-2" /> Realizar Auditoria
            </Link>
          </Button>
        </div>
      </div>

      {lastChecklist && (
        <Card className="bg-muted/20 border-primary/20">
          <CardContent className="p-4 flex justify-between items-center">
            <div>
              <p className="text-sm font-medium">
                Última Auditoria: {new Date(lastChecklist.date).toLocaleDateString()}
              </p>
              <p className="text-xs text-muted-foreground">
                Realizada por {lastChecklist.leaderName}
              </p>
            </div>
            <Badge
              variant={lastChecklist.discrepancies > 0 ? 'destructive' : 'secondary'}
              className="text-xs"
            >
              {lastChecklist.discrepancies === 0
                ? 'Tudo Certo'
                : `${lastChecklist.discrepancies} Discrepâncias`}
            </Badge>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="w-16 text-center">Fotos</TableHead>
                <TableHead>Patrimônio</TableHead>
                <TableHead>Item (Marca)</TableHead>
                <TableHead>Condição</TableHead>
                <TableHead>Disponibilidade</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teamInventory.map((item) => {
                const path = getNodePath(item.treeNodeId)
                const marcaNode = path.find((n) => n.level === 'marca')
                const itemNode = path.find((n) => n.level === 'item')
                const statusInfo = statusMap[item.condition]
                return (
                  <TableRow key={item.id} className="group">
                    <TableCell className="text-center">
                      <Avatar className="h-10 w-10 mx-auto rounded-md border">
                        <AvatarImage src={item.photos?.[0]} className="object-cover" />
                        <AvatarFallback className="bg-muted">
                          <Camera className="h-4 w-4 text-muted-foreground/50" />
                        </AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell className="font-mono text-xs font-semibold">
                      {item.assetNumber}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {itemNode?.name || 'Item'} ({marcaNode?.name || 'Marca'})
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`text-xs ${item.condition === 'good' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-red-100 text-red-800 border-red-200'}`}
                      >
                        {statusInfo.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {item.status === 'present' ? (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                          Presente
                        </Badge>
                      ) : item.status === 'missing' ? (
                        <Badge variant="destructive">Faltando</Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="bg-amber-100 text-amber-800 border-amber-200"
                          title={item.borrowedTo}
                        >
                          Emprestado
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => setUpdateItem(item)}>
                        <Settings2 className="h-4 w-4 mr-2" /> Perfil
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
              {teamInventory.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
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
    </div>
  )
}
