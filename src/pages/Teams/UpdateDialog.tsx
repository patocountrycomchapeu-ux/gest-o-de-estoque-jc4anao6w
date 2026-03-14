import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAppStore } from '@/store/AppStore'
import { InventoryItem, Condition } from '@/types'

interface UpdateDialogProps {
  item: InventoryItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UpdateDialog({ item, open, onOpenChange }: UpdateDialogProps) {
  const { updateInventoryItem } = useAppStore()
  const [condition, setCondition] = useState<Condition>('good')
  const [reason, setReason] = useState('')

  useEffect(() => {
    if (item && open) {
      setCondition(item.condition)
      setReason('')
    }
  }, [item, open])

  const handleSubmit = () => {
    if (!item) return
    if ((condition === 'damaged' || condition === 'repair') && !reason.trim()) {
      alert('Motivo/Comentário é obrigatório para este status.')
      return
    }
    updateInventoryItem(item.id, { condition, reason })
    onOpenChange(false)
  }

  if (!item) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Atualizar Instância: {item.hasAssetNumber ? item.assetNumber : 'Sem Patrimônio'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Condição da Ferramenta</Label>
            <Select value={condition} onValueChange={(v) => setCondition(v as Condition)}>
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

          {(condition === 'damaged' || condition === 'repair') && (
            <div className="space-y-2 animate-fade-in">
              <Label className="text-destructive font-bold">
                Motivo / Comentário (Obrigatório)
              </Label>
              <Input
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Descreva o defeito ou motivo da manutenção..."
                className="border-destructive/50 focus-visible:ring-destructive/30"
              />
              <p className="text-[10px] text-muted-foreground">
                Esta informação ficará registrada no histórico do item.
              </p>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={(condition === 'damaged' || condition === 'repair') && !reason.trim()}
          >
            Salvar Alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
