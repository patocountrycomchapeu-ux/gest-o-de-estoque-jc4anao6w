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
import { Switch } from '@/components/ui/switch'
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

const conditionCategories = [
  'Itens com marcas de uso',
  'Itens com reparo alto',
  'Danificado com chance de reparo',
  'Danificado perda',
]

export function UpdateDialog({ item, open, onOpenChange }: UpdateDialogProps) {
  const { updateInventoryItem } = useAppStore()
  const [condition, setCondition] = useState<Condition>('good')
  const [status, setStatus] = useState<ToolStatus>('present')
  const [reason, setReason] = useState('')
  const [repairCost, setRepairCost] = useState('')
  const [repairLocation, setRepairLocation] = useState('')
  const [conditionCategory, setConditionCategory] = useState('')
  const [repairSent, setRepairSent] = useState(false)
  const [expectedReturnDate, setExpectedReturnDate] = useState('')

  useEffect(() => {
    if (item && open) {
      setCondition(item.condition)
      setStatus(item.status || 'present')
      setReason('')
      setRepairCost(item.repairCost?.toString() || '')
      setRepairLocation(item.repairLocation || '')
      setConditionCategory(item.conditionCategory || '')
      setRepairSent(item.repairSent || false)
      setExpectedReturnDate(item.expectedReturnDate ? item.expectedReturnDate.split('T')[0] : '')
    }
  }, [item, open])

  const handleSubmit = () => {
    if (!item) return
    const isRepOrDam = condition === 'repair' || condition === 'damaged'
    if (isRepOrDam && !conditionCategory) return alert('Selecione a Categoria da Condição.')

    if (condition === 'repair') {
      if (!repairLocation.trim()) return alert('Local / Assistência do reparo é obrigatório.')
      if (!reason.trim())
        return alert('Descrição do motivo/reparo é obrigatória para evitar extravios.')
      if (repairSent && !expectedReturnDate)
        return alert('A data de conclusão prevista é obrigatória quando o item já foi enviado.')
      updateInventoryItem(item.id, {
        condition,
        status,
        reason,
        repairCost: repairCost ? parseFloat(repairCost) : 0,
        repairLocation,
        conditionCategory: conditionCategory || undefined,
        repairSent,
        expectedReturnDate: expectedReturnDate
          ? new Date(`${expectedReturnDate}T12:00:00`).toISOString()
          : undefined,
      })
    } else {
      if ((condition === 'damaged' || status !== 'present') && !reason.trim()) {
        return alert('Motivo / Destino ou Comentário é obrigatório para esta alteração.')
      }
      updateInventoryItem(item.id, {
        condition,
        status,
        reason,
        conditionCategory: condition === 'damaged' ? conditionCategory : undefined,
      })
    }
    onOpenChange(false)
  }

  if (!item) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>
            Atualizar: {item.hasAssetNumber ? item.assetNumber : 'Sem Patrimônio'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Condição</Label>
              <Select
                value={condition}
                onValueChange={(v) => {
                  setCondition(v as Condition)
                  if (v === 'good') setConditionCategory('')
                }}
              >
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
              <Label>Status</Label>
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
          {(condition === 'repair' || condition === 'damaged') && (
            <div className="space-y-2">
              <Label>
                Categoria da Condição <span className="text-destructive">*</span>
              </Label>
              <Select value={conditionCategory} onValueChange={setConditionCategory}>
                <SelectTrigger className={!conditionCategory ? 'border-destructive/50' : ''}>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {conditionCategories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          {condition === 'repair' && (
            <div className="space-y-4 pt-2 border-t">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Custo (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={repairCost}
                    onChange={(e) => setRepairCost(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>
                    Local <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    value={repairLocation}
                    onChange={(e) => setRepairLocation(e.target.value)}
                    className={!repairLocation ? 'border-destructive/30' : ''}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-3 bg-muted/30 p-3 rounded border">
                <Switch checked={repairSent} onCheckedChange={setRepairSent} />
                <div>
                  <Label>Já foi enviado para reparo?</Label>
                </div>
              </div>
              {repairSent && (
                <div className="space-y-2 animate-slide-up">
                  <Label>
                    Data de Conclusão (Previsão) <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    type="date"
                    value={expectedReturnDate}
                    onChange={(e) => setExpectedReturnDate(e.target.value)}
                    className={
                      !expectedReturnDate
                        ? 'border-destructive/30 w-full sm:w-1/2'
                        : 'w-full sm:w-1/2'
                    }
                  />
                </div>
              )}
            </div>
          )}
          <div className="space-y-2">
            <Label>
              Motivo / Observação{' '}
              {(condition === 'damaged' || condition === 'repair' || status !== 'present') && '*'}
            </Label>
            <Input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className={
                (condition === 'damaged' || condition === 'repair' || status !== 'present') &&
                !reason
                  ? 'border-destructive/50'
                  : ''
              }
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
