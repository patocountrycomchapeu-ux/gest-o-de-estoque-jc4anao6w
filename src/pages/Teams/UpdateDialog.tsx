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
import { InventoryItem, Condition, ToolStatus } from '@/types'

interface UpdateDialogProps {
  item: InventoryItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const statusLabels: Record<ToolStatus, string> = {
  present: 'Em Uso na Equipe',
  missing: 'Faltando / Extraviado',
  borrowed: 'Emprestado',
  in_maintenance: 'Em Manutenção',
  defect_stock: 'Estoque de Defeito',
  returned_to_team: 'Devolvido para a Equipe',
}

export function UpdateDialog({ item, open, onOpenChange }: UpdateDialogProps) {
  const { updateInventoryItem } = useAppStore()
  const [condition, setCondition] = useState<Condition>('good')
  const [status, setStatus] = useState<ToolStatus>('present')
  const [reason, setReason] = useState('')

  useEffect(() => {
    if (item && open) {
      setCondition(item.condition)
      setStatus(item.status || 'present')
      setReason('')
    }
  }, [item, open])

  const handleSubmit = () => {
    if (!item) return
    const requiresReason =
      condition === 'damaged' ||
      condition === 'repair' ||
      status === 'in_maintenance' ||
      status === 'defect_stock' ||
      status === 'missing'

    if (requiresReason && !reason.trim()) {
      alert('Motivo / Destino ou Comentário é obrigatório para esta alteração.')
      return
    }
    updateInventoryItem(item.id, { condition, status, reason })
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
          <div className="grid grid-cols-2 gap-4">
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
            <div className="space-y-2">
              <Label>Destino / Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as ToolStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(statusLabels).map(([k, v]) => (
                    <SelectItem key={k} value={k}>
                      {v}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2 animate-fade-in">
            <Label
              className={`${condition === 'damaged' || condition === 'repair' || status !== 'present' ? 'text-destructive font-bold' : ''}`}
            >
              Motivo / Observação{' '}
              {(condition === 'damaged' ||
                condition === 'repair' ||
                status === 'defect_stock' ||
                status === 'in_maintenance' ||
                status === 'missing') &&
                '(Obrigatório)'}
            </Label>
            <Input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Descreva o motivo da alteração de estoque/condição..."
              className={
                condition === 'damaged' || condition === 'repair' || status !== 'present'
                  ? 'border-destructive/50 focus-visible:ring-destructive/30'
                  : ''
              }
            />
            <p className="text-[10px] text-muted-foreground">
              Esta informação ficará registrada de forma imutável no histórico do item, permitindo
              total rastreabilidade.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              (condition === 'damaged' ||
                condition === 'repair' ||
                status === 'defect_stock' ||
                status === 'in_maintenance' ||
                status === 'missing') &&
              !reason.trim()
            }
          >
            Salvar Alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
