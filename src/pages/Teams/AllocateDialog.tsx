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
import { ScrollArea } from '@/components/ui/scroll-area'

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
  const [assets, setAssets] = useState<string[]>([''])
  const [condition, setCondition] = useState<Condition>('good')

  const leafItems = useMemo(() => nodes.filter((n) => n.level === 'marca'), [nodes])

  const handleQtyChange = (newQty: number) => {
    const validQty = Math.max(1, newQty)
    setQty(validQty)
    setAssets((prev) => Array.from({ length: validQty }, (_, i) => prev[i] || ''))
  }

  const handleAssetChange = (index: number, val: string) => {
    setAssets((prev) => {
      const copy = [...prev]
      copy[index] = val
      return copy
    })
  }

  const handleSave = () => {
    if (!selectedMarcaId || assets.some((a) => !a.trim())) return
    addInventoryItem({ teamId, treeNodeId: selectedMarcaId, condition, assets })
    onOpenChange(false)
    setSelectedMarcaId('')
    setQty(1)
    setAssets([''])
    setCondition('good')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Alocar Ferramentas</DialogTitle>
          <DialogDescription>
            Adicione ferramentas e informe o Número de Patrimônio único de cada uma.
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
                onChange={(e) => handleQtyChange(Number(e.target.value))}
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
          <div className="space-y-2">
            <Label>Números de Patrimônio (Obrigatório)</Label>
            <ScrollArea className="h-[120px] rounded-md border p-2 bg-muted/30">
              <div className="space-y-2 pr-4">
                {assets.map((asset, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-6 text-right">{idx + 1}.</span>
                    <Input
                      placeholder="Ex: PAT-12345"
                      value={asset}
                      onChange={(e) => handleAssetChange(idx, e.target.value)}
                      className="h-8"
                    />
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={!selectedMarcaId || assets.some((a) => !a.trim())}>
            Salvar Instâncias
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
