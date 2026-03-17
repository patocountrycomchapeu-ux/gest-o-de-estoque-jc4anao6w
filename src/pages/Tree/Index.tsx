import { useState, useMemo } from 'react'
import { useAppStore } from '@/store/AppStore'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Plus } from 'lucide-react'
import { TreeNodeItem } from './TreeNodeItem'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { canManageTree } from '@/lib/permissions'

const nextLevelMap: Record<string, import('@/types').TreeLevel> = {
  root: 'tipo',
  tipo: 'funcao',
  funcao: 'especificacao',
  especificacao: 'item',
  item: 'marca',
}

export default function TreePage() {
  const { nodes, addNode, currentUser } = useAppStore()
  const [search, setSearch] = useState('')
  const [addingTo, setAddingTo] = useState<{ parentId: string | null; level: string } | null>(null)
  const [newNodeName, setNewNodeName] = useState('')
  const [isGrouped, setIsGrouped] = useState(false)

  const canManage = canManageTree(currentUser)
  const rootNodes = useMemo(() => nodes.filter((n) => n.parentId === null), [nodes])

  const handleAddSubmit = () => {
    if (!newNodeName.trim() || !addingTo) return
    const levelToCreate = nextLevelMap[addingTo.level]
    if (levelToCreate) {
      addNode({
        name: newNodeName,
        level: levelToCreate,
        parentId: addingTo.parentId,
        isGrouped: levelToCreate === 'item' || levelToCreate === 'marca' ? isGrouped : undefined,
      })
    }
    setAddingTo(null)
    setNewNodeName('')
    setIsGrouped(false)
  }

  const levelToCreate = addingTo ? nextLevelMap[addingTo.level] : null
  const showGroupedToggle = levelToCreate === 'item' || levelToCreate === 'marca'

  return (
    <div className="space-y-6 h-[calc(100vh-100px)] flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Árvore Mercadológica</h2>
          <p className="text-muted-foreground">
            Gerencie a hierarquia de 5 níveis (Tipo &gt; Função &gt; Especificação &gt; Item &gt;
            Marca).
          </p>
        </div>
        {canManage && (
          <Button onClick={() => setAddingTo({ parentId: null, level: 'root' })}>
            <Plus className="h-4 w-4 mr-2" /> Adicionar Tipo
          </Button>
        )}
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden shadow-subtle border-border/60">
        <CardHeader className="py-4 bg-muted/20 border-b">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar níveis..."
              className="pl-8 bg-background"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-auto p-4 sm:p-6 bg-card">
          <div className="space-y-2">
            {rootNodes.map((node) => (
              <TreeNodeItem
                key={node.id}
                node={node}
                allNodes={nodes}
                onAddChild={
                  canManage
                    ? (parentId: string, level: string) => {
                        setAddingTo({ parentId, level })
                        setIsGrouped(false)
                      }
                    : undefined
                }
              />
            ))}
            {rootNodes.length === 0 && (
              <p className="text-muted-foreground text-center py-8">Nenhum Tipo cadastrado.</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!addingTo} onOpenChange={(open) => !open && setAddingTo(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar {levelToCreate}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={newNodeName}
                onChange={(e) => setNewNodeName(e.target.value)}
                placeholder="Nome do novo nível..."
                autoFocus
              />
            </div>
            {showGroupedToggle && (
              <div className="flex items-center justify-between border rounded-md p-3 bg-muted/20">
                <div className="space-y-0.5 pr-4">
                  <Label>Tratar como Lote / Agrupado</Label>
                  <p className="text-[10px] text-muted-foreground leading-tight">
                    Marque se este item deve ser tratado em massa.
                  </p>
                </div>
                <Switch checked={isGrouped} onCheckedChange={setIsGrouped} />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddingTo(null)}>
              Cancelar
            </Button>
            <Button onClick={handleAddSubmit}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
