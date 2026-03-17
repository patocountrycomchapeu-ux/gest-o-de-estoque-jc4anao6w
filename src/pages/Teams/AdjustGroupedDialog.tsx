import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAppStore } from '@/store/AppStore'
import { InventoryItem, ToolStatus, Condition } from '@/types'

export function AdjustGroupedDialog({
  item,
  open,
  onOpenChange,
}: {
  item: InventoryItem | null
  open: boolean
  onOpenChange: (o: boolean) => void
}) {
  const { adjustGroupedItem, getNodePath } = useAppStore()
  const [removeQty, setRemoveQty] = useState(1)
  const [reason, setReason] = useState('')
  const [destStatus, setDestStatus] = useState<ToolStatus | 'removed'>('missing')
  const [destCondition, setDestCondition] = useState<Condition>('damaged')

  useEffect(() => {
    if (open && item) {
      setRemoveQty(1)
      setReason('')
      setDestStatus('missing')
      setDestCondition('damaged')
    }
  }, [open, item])

  const handleSave = () => {
    if (item && removeQty > 0 && removeQty <= (item.quantity || 1)) {
      adjustGroupedItem(item.id, removeQty, reason, destStatus, destCondition)
      onOpenChange(false)
    }
  }

  if (!item) return null

  const itemName = getNodePath(item.treeNodeId).find((n) => n.level === 'item')?.name || 'Item'
  const maxQty = item.quantity || 1

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Ajuste Rápido de Lote</DialogTitle>
          <DialogDescription>Remova ou altere o status de unidades deste lote.</DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="p-3 bg-blue-50 border border-blue-100 rounded-md text-sm text-blue-800 dark:bg-blue-950/40 dark:border-blue-900/50 dark:text-blue-300">
            <strong>{itemName}</strong> - {maxQty} unidades disponíveis neste registro.
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Qtd a Ajustar</Label>
              <Input
                type="number"
                min={1}
                max={maxQty}
                value={removeQty}
                onChange={(e) =>
                  setRemoveQty(Math.min(maxQty, Math.max(1, parseInt(e.target.value) || 1)))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Destino</Label>
              <Select value={destStatus} onValueChange={(v: any) => setDestStatus(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="present">Uso na Equipe</SelectItem>
                  <SelectItem value="missing">Extraviado/Perdido</SelectItem>
                  <SelectItem value="defect_stock">Estoque Defeito</SelectItem>
                  <SelectItem value="in_maintenance">Manutenção</SelectItem>
                  <SelectItem value="removed">Baixa Definitiva</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {destStatus !== 'removed' && (
            <div className="space-y-2 animate-fade-in">
              <Label>Nova Condição das Unidades</Label>
              <Select value={destCondition} onValueChange={(v: any) => setDestCondition(v)}>
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
          )}

          <div className="space-y-2">
            <Label>Motivo / Observação</Label>
            <Input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ex: Quebrados durante uso, encontrados no pátio..."
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={!reason.trim() || removeQty < 1}>
            Confirmar Ajuste
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
