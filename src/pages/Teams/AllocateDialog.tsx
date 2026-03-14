import { useState, useMemo } from 'react'
import { useAppStore } from '@/store/AppStore'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Condition } from '@/types'

export function AllocateDialog({
  teamId,
  open,
  onOpenChange,
}: {
  teamId: string
  open: boolean
  onOpenChange: (o: boolean) => void
}) {
  const { nodes, addInventoryItem, getNodePath } = useAppStore()
  const [selectedItemId, setSelectedItemId] = useState<string>('')
  const [qty, setQty] = useState(1)
  const [condition, setCondition] = useState<Condition>('good')

  const baseItems = useMemo(() => nodes.filter((n) => n.level === 'item'), [nodes])

  const handleSave = () => {
    if (!selectedItemId || qty < 1) return
    addInventoryItem({
      teamId,
      treeNodeId: selectedItemId,
      quantity: qty,
      condition,
    })
    onOpenChange(false)
    setSelectedItemId('')
    setQty(1)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Alocar Nova Ferramenta</DialogTitle>
          <DialogDescription>
            Associe um item base da árvore mercadológica a esta equipe.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>Item Base (Ferramenta)</Label>
            <Select value={selectedItemId} onValueChange={setSelectedItemId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                {baseItems.map((item) => {
                  const path = getNodePath(item.id)
                    .map((n) => n.name)
                    .join(' > ')
                  return (
                    <SelectItem key={item.id} value={item.id}>
                      {path}
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Quantidade</Label>
              <Input
                type="number"
                min={1}
                value={qty}
                onChange={(e) => setQty(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label>Condição Inicial</Label>
              <Select value={condition} onValueChange={(v: Condition) => setCondition(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="good">Bom Estado</SelectItem>
                  <SelectItem value="damaged">Danificado</SelectItem>
                  <SelectItem value="repair">Para Reparo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={!selectedItemId}>
            Alocar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
