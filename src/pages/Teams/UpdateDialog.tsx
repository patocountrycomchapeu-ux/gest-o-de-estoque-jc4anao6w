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
    const requiresReason =
      condition === 'damaged' ||
      condition === 'repair' ||
      status === 'in_maintenance' ||
      status === 'defect_stock' ||
      status === 'missing'

    if (condition === 'repair') {
      if (!repairLocation.trim()) {
        alert('Local / Assistência do reparo é obrigatório.')
        return
      }
      if (!reason.trim()) {
        alert('Descrição do motivo/reparo é obrigatória para evitar extravios.')
        return
      }
      if (repairSent && !expectedReturnDate) {
        alert('A data de conclusão prevista é obrigatória quando o item já foi enviado.')
        return
      }

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
      if (requiresReason && !reason.trim()) {
        alert('Motivo / Destino ou Comentário é obrigatório para esta alteração.')
        return
      }
      updateInventoryItem(item.id, {
        condition,
        status,
        reason,
        conditionCategory:
          condition === 'damaged' && conditionCategory ? conditionCategory : undefined,
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
            Atualizar Instância: {item.hasAssetNumber ? item.assetNumber : 'Sem Patrimônio'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Condição da Ferramenta</Label>
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

          {(condition === 'repair' || condition === 'damaged') && (
            <div className="space-y-2 animate-fade-in pb-1">
              <Label>Categoria da Condição</Label>
              <Select value={conditionCategory} onValueChange={setConditionCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Classifique o estado do item..." />
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
            <div className="space-y-4 animate-fade-in pt-2 border-t border-border/50">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Custo Estimado/Gasto (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={repairCost}
                    onChange={(e) => setRepairCost(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label>
                    Local / Assistência <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    value={repairLocation}
                    onChange={(e) => setRepairLocation(e.target.value)}
                    placeholder="Ex: Oficina Y..."
                    className={!repairLocation ? 'border-destructive/30' : ''}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-3 bg-muted/30 p-3 rounded border">
                <Switch checked={repairSent} onCheckedChange={setRepairSent} />
                <div>
                  <Label className="cursor-pointer" onClick={() => setRepairSent(!repairSent)}>
                    Já foi enviado
                  </Label>
                  <p className="text-[10px] text-muted-foreground leading-tight">
                    Marque se o item já está fisicamente no local de reparo.
                  </p>
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

          <div className="space-y-2 animate-fade-in pt-2">
            <Label
              className={`${condition === 'damaged' || condition === 'repair' || status !== 'present' ? 'text-destructive font-bold' : ''}`}
            >
              {condition === 'repair' ? 'Descrição do Reparo / Problema ' : 'Motivo / Observação '}
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
              placeholder={
                condition === 'repair'
                  ? 'Descreva o problema e detalhes do envio...'
                  : 'Descreva o motivo da alteração de estoque/condição...'
              }
              className={
                condition === 'damaged' || condition === 'repair' || status !== 'present'
                  ? 'border-destructive/50 focus-visible:ring-destructive/30'
                  : ''
              }
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              ((condition === 'damaged' ||
                status === 'defect_stock' ||
                status === 'in_maintenance' ||
                status === 'missing') &&
                !reason.trim()) ||
              (condition === 'repair' &&
                (!reason.trim() || !repairLocation.trim() || (repairSent && !expectedReturnDate)))
            }
          >
            Salvar Alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
