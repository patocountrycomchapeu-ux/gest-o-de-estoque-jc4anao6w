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
import { uploadPhoto } from '@/lib/storage'
import { Camera, X } from 'lucide-react'

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
  const { updateInventoryItem, suppliers, history, currentUser } = useAppStore()
  const [condition, setCondition] = useState<Condition>('good')
  const [status, setStatus] = useState<ToolStatus>('present')
  const [reason, setReason] = useState('')
  const [repairCost, setRepairCost] = useState('')
  const [supplierId, setSupplierId] = useState('')
  const [conditionCategory, setConditionCategory] = useState('')
  const [repairSent, setRepairSent] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (item && open) {
      setCondition(item.condition)
      setStatus(item.status || 'present')
      setReason('')
      setRepairCost(item.repairCost?.toString() || '')
      setSupplierId(item.supplierId || '')
      setConditionCategory(item.conditionCategory || '')
      setRepairSent(item.repairSent || false)
      setFiles([])
    }
  }, [item, open])

  const itemHistory = history
    .filter((h) => h.inventoryId === item?.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const isRepair = item?.condition === 'repair'
  const canEditRepair = ['Gestor', 'Encarregado Gestor', 'Encarregado'].includes(
    currentUser?.role || '',
  )
  const readOnly = isRepair && !canEditRepair

  const handleSubmit = async () => {
    if (readOnly) return alert('Sem permissão para retirar ferramenta de reparo.')
    if (!item) return
    const isRepOrDam = condition === 'repair' || condition === 'damaged'
    if (isRepOrDam && !conditionCategory) return alert('Selecione a Categoria da Condição.')

    setUploading(true)
    const photoUrls = [...(item.photos || [])]
    for (const file of files) {
      const url = await uploadPhoto(file)
      if (url) photoUrls.push(url)
    }

    const payload: Partial<InventoryItem> = {
      condition,
      status,
      reason,
      photos: photoUrls,
      conditionCategory: isRepOrDam ? conditionCategory : undefined,
    }

    if (condition === 'repair') {
      if (!supplierId) {
        setUploading(false)
        return alert('Selecione um Fornecedor/Assistência.')
      }
      payload.repairCost = repairCost ? parseFloat(repairCost) : 0
      payload.supplierId = supplierId
      payload.repairSent = repairSent
    }

    await updateInventoryItem(item.id, payload)
    setUploading(false)
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
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Condição Geral da Ferramenta</Label>
                <Select
                  disabled={readOnly}
                  value={condition}
                  onValueChange={(v: Condition) => {
                    setCondition(v)
                    if (v === 'good') {
                      setConditionCategory('')
                      setStatus('present')
                    } else if (v === 'repair') {
                      setStatus('in_maintenance')
                    } else if (v === 'damaged') {
                      setStatus('defect_stock')
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="good">Bom Estado (Em Uso / Disponível)</SelectItem>
                    <SelectItem value="damaged">Danificado (Estoque de Defeito)</SelectItem>
                    <SelectItem value="repair">Para Reparo (Manutenção)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {condition === 'good' && (
                <div className="space-y-2 animate-fade-in">
                  <Label>Status de Uso</Label>
                  <Select
                    disabled={readOnly}
                    value={status}
                    onValueChange={(v: ToolStatus) => setStatus(v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="present">Em Uso</SelectItem>
                      <SelectItem value="missing">Faltando</SelectItem>
                      <SelectItem value="borrowed">Emprestado</SelectItem>
                      <SelectItem value="returned_to_team">Devolvido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {(condition === 'repair' || condition === 'damaged') && (
                <div className="space-y-2 animate-fade-in border-t pt-4">
                  <Label>Qual o problema? (Categoria) *</Label>
                  <Select
                    disabled={readOnly}
                    value={conditionCategory}
                    onValueChange={setConditionCategory}
                  >
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
                <div className="space-y-4 animate-fade-in border-t pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Fornecedor / Assistência *</Label>
                      <Select disabled={readOnly} value={supplierId} onValueChange={setSupplierId}>
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
                        disabled={readOnly}
                        type="number"
                        step="0.01"
                        value={repairCost}
                        onChange={(e) => setRepairCost(e.target.value)}
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 bg-muted/30 p-3 rounded border">
                    <Switch
                      disabled={readOnly}
                      checked={repairSent}
                      onCheckedChange={setRepairSent}
                    />
                    <Label>Ferramenta já enviada fisicamente?</Label>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Motivo / Notas</Label>
              <Input
                disabled={readOnly}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>

            <div className="space-y-2 pt-2 border-t">
              <Label>Adicionar Fotos</Label>
              <div className="flex flex-wrap gap-2">
                {item.photos?.map((url, i) => (
                  <div key={i} className="relative w-16 h-16 rounded border overflow-hidden">
                    <img src={url} className="w-full h-full object-cover" alt="foto" />
                  </div>
                ))}
                {files.map((f, i) => (
                  <div
                    key={`new-${i}`}
                    className="relative w-16 h-16 rounded border overflow-hidden"
                  >
                    <img
                      src={URL.createObjectURL(f)}
                      className="w-full h-full object-cover"
                      alt="upload"
                    />
                    <button
                      className="absolute top-0 right-0 bg-red-500 text-white rounded-bl p-0.5"
                      onClick={() => setFiles(files.filter((_, idx) => idx !== i))}
                      disabled={readOnly}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {!readOnly && (
                  <label className="w-16 h-16 flex flex-col items-center justify-center border-2 border-dashed rounded cursor-pointer hover:bg-muted/50">
                    <Camera className="w-5 h-5 text-muted-foreground" />
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files) setFiles([...files, ...Array.from(e.target.files)])
                      }}
                    />
                  </label>
                )}
              </div>
            </div>

            <DialogFooter className="pt-4">
              {readOnly && (
                <p className="text-sm text-destructive mr-auto flex items-center">
                  Apenas encarregados/gestores podem editar itens em reparo.
                </p>
              )}
              <Button onClick={handleSubmit} disabled={readOnly || uploading}>
                {uploading ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
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
