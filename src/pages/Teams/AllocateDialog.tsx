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
  const [selectedMarcaId, setSelectedMarcaId] = useState<string>('')
  const [qty, setQty] = useState(1)
  const [condition, setCondition] = useState<Condition>('good')

  const leafItems = useMemo(() => nodes.filter((n) => n.level === 'marca'), [nodes])

  const handleSave = () => {
    if (!selectedMarcaId || qty < 1) return
    addInventoryItem({
      teamId,
      treeNodeId: selectedMarcaId,
      quantity: qty,
      condition,
    })
    onOpenChange(false)
    setSelectedMarcaId('')
    setQty(1)
    setCondition('good')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Alocar Ferramentas (Instâncias)</DialogTitle>
          <DialogDescription>
            Selecione a marca e item. O sistema criará instâncias únicas para cada unidade alocada.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>Item (Marca)</Label>
            <Select value={selectedMarcaId} onValueChange={setSelectedMarcaId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                {leafItems.map((item) => {
                  const path = getNodePath(item.id)
                  const itemName = path.find((n) => n.level === 'item')?.name || '?'
                  return (
                    <SelectItem key={item.id} value={item.id}>
                      {itemName} ({item.name})
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
          <Button onClick={handleSave} disabled={!selectedMarcaId || qty < 1}>
            Alocar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
