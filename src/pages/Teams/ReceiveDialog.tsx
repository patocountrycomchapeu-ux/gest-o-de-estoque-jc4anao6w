import { useState, useEffect } from 'react'
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
import { Transfer, Condition } from '@/types'
import { AlertTriangle, CheckCircle2, XCircle } from 'lucide-react'

export function ReceiveDialog({
  transfer,
  open,
  onOpenChange,
}: {
  transfer: Transfer | null
  open: boolean
  onOpenChange: (o: boolean) => void
}) {
  const { inventory, resolveTransfer } = useAppStore()
  const [condition, setCondition] = useState<Condition>('good')
  const [notes, setNotes] = useState('')

  const item = inventory.find((i) => i.id === transfer?.inventoryId)

  useEffect(() => {
    if (item) setCondition(item.condition)
  }, [item])

  const handleAccept = () => {
    if (transfer) resolveTransfer(transfer.id, 'accept', condition, notes)
    onOpenChange(false)
    setNotes('')
  }

  const handleReject = () => {
    if (transfer) resolveTransfer(transfer.id, 'reject', undefined, notes)
    onOpenChange(false)
    setNotes('')
  }

  if (!item) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Validação de Recebimento</DialogTitle>
          <DialogDescription>
            Inspecione a ferramenta fisicamente e confronte com as evidências do remetente.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-5">
          <div className="p-3 bg-muted/40 rounded-md text-sm border space-y-1">
            <p>
              <span className="font-medium text-muted-foreground w-20 inline-block">Item:</span>{' '}
              {item.hasAssetNumber ? item.assetNumber : 'Sem Patrimônio (S/N)'}
            </p>
            <p>
              <span className="font-medium text-muted-foreground w-20 inline-block">
                Enviado por:
              </span>{' '}
              {transfer?.initiatedBy}
            </p>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">Evidências do Remetente</Label>
            {item.photos && item.photos.length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {item.photos.map((p, i) => (
                  <img
                    key={i}
                    src={p}
                    alt="Evidência"
                    className="rounded-md w-full aspect-square object-cover border"
                  />
                ))}
              </div>
            ) : (
              <div className="p-4 border border-dashed rounded-md text-center text-muted-foreground text-sm flex items-center justify-center bg-muted/20">
                <AlertTriangle className="h-4 w-4 mr-2 text-amber-500" /> Nenhuma foto fornecida
                pelo remetente.
              </div>
            )}
          </div>

          <div className="space-y-3 pt-2 border-t">
            <div className="space-y-2">
              <Label>Estado de Conservação Verificado (Obrigatório)</Label>
              <Select value={condition} onValueChange={(v: Condition) => setCondition(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="good">Confirmar: Bom Estado</SelectItem>
                  <SelectItem value="damaged">Confirmar: Danificado</SelectItem>
                  <SelectItem value="repair">Confirmar: Para Reparo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Observações ou Motivo de Rejeição</Label>
              <Input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Descreva qualquer inconsistência..."
              />
            </div>
          </div>
        </div>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            className="text-destructive border-destructive/30 hover:bg-destructive/10 sm:w-1/2"
            onClick={handleReject}
            disabled={!notes.trim()}
          >
            <XCircle className="h-4 w-4 mr-2" /> Rejeitar Transferência
          </Button>
          <Button
            onClick={handleAccept}
            className="bg-emerald-600 hover:bg-emerald-700 text-white sm:w-1/2"
          >
            <CheckCircle2 className="h-4 w-4 mr-2" /> Receber e Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
