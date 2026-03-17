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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAppStore } from '@/store/AppStore'
import { InventoryItem, Condition, ToolStatus } from '@/types'
import { format } from 'date-fns'

const statusLabels: Record<ToolStatus, string> = {
  present: 'Em Uso',
  missing: 'Faltando',
  borrowed: 'Emprestado',
  in_maintenance: 'Em Manutenção',
  defect_stock: 'Estoque de Defeito',
  returned_to_team: 'Devolvido',
}
const conditionCategories = [
  'Itens com marcas de uso',
  'Itens com reparo alto',
  'Danificado chance reparo',
  'Perda total',
]

export function UpdateDialog({
  item,
  open,
  onOpenChange,
}: {
  item: InventoryItem | null
  open: boolean
  onOpenChange: (o: boolean) => void
}) {
  const { updateInventoryItem, suppliers, history } = useAppStore()
  const [condition, setCondition] = useState<Condition>('good')
  const [status, setStatus] = useState<ToolStatus>('present')
  const [reason, setReason] = useState('')
  const [repairCost, setRepairCost] = useState('')
  const [supplierId, setSupplierId] = useState('')
  const [conditionCategory, setConditionCategory] = useState('')
  const [repairSent, setRepairSent] = useState(false)

  useEffect(() => {
    if (item && open) {
      setCondition(item.condition)
      setStatus(item.status || 'present')
      setReason('')
      setRepairCost(item.repairCost?.toString() || '')
      setSupplierId(item.supplierId || '')
      setConditionCategory(item.conditionCategory || '')
      setRepairSent(item.repairSent || false)
    }
  }, [item, open])

  const itemHistory = history
    .filter((h) => h.inventoryId === item?.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const handleSubmit = () => {
    if (!item) return
    const isRepOrDam = condition === 'repair' || condition === 'damaged'
    if (isRepOrDam && !conditionCategory) return alert('Selecione a Categoria da Condição.')

    if (condition === 'repair') {
      if (!supplierId) return alert('Selecione um Fornecedor/Assistência.')
      updateInventoryItem(item.id, {
        condition,
        status,
        reason,
        repairCost: repairCost ? parseFloat(repairCost) : 0,
        supplierId,
        conditionCategory: conditionCategory || undefined,
        repairSent,
      })
    } else {
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
            Gerenciar Ativo: {item.hasAssetNumber ? item.assetNumber : 'Lote'}
          </DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="edit" className="mt-2">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="edit">Atualizar Status</TabsTrigger>
            <TabsTrigger value="history">Ciclo de Vida (Histórico)</TabsTrigger>
          </TabsList>
          <TabsContent value="edit" className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Condição</Label>
                <Select
                  value={condition}
                  onValueChange={(v: Condition) => {
                    setCondition(v)
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
                <Label>Status Atual</Label>
                <Select value={status} onValueChange={(v: ToolStatus) => setStatus(v)}>
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
                <Label>Categoria da Avaria *</Label>
                <Select value={conditionCategory} onValueChange={setConditionCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {conditionCategories.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {condition === 'repair' && (
              <div className="space-y-4 border-t pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Fornecedor / Assistência *</Label>
                    <Select value={supplierId} onValueChange={setSupplierId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        {suppliers.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Custo Reparo (R$)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={repairCost}
                      onChange={(e) => setRepairCost(e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-3 bg-muted/30 p-3 rounded border">
                  <Switch checked={repairSent} onCheckedChange={setRepairSent} />
                  <Label>Ferramenta já enviada fisicamente?</Label>
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label>Motivo / Notas</Label>
              <Input value={reason} onChange={(e) => setReason(e.target.value)} />
            </div>
            <DialogFooter className="pt-4">
              <Button onClick={handleSubmit}>Salvar Alterações</Button>
            </DialogFooter>
          </TabsContent>

          <TabsContent value="history" className="py-4">
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
              {itemHistory.map((h) => (
                <div key={h.id} className="text-sm p-3 border rounded-md bg-muted/10">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-semibold">{h.type}</span>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(h.date), 'dd/MM/yyyy HH:mm')}
                    </span>
                  </div>
                  <p className="text-muted-foreground">{h.description}</p>
                  <p className="text-xs mt-1 font-medium">Por: {h.user}</p>
                </div>
              ))}
              {itemHistory.length === 0 && (
                <p className="text-muted-foreground text-center text-sm py-4">Sem histórico.</p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
