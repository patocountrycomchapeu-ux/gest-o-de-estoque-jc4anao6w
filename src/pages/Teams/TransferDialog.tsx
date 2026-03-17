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
import { InventoryItem } from '@/types'
import { ArrowRightLeft } from 'lucide-react'

export function TransferDialog({
  item,
  open,
  onOpenChange,
  teamId,
}: {
  item: InventoryItem | null
  open: boolean
  onOpenChange: (o: boolean) => void
  teamId: string
}) {
  const { teams, initiateTransfer } = useAppStore()
  const [toTeamId, setToTeamId] = useState('')
  const [quantity, setQuantity] = useState(1)

  const isGrouped = !item?.hasAssetNumber

  useEffect(() => {
    if (open && item) {
      setQuantity(item.quantity || 1)
      setToTeamId('')
    }
  }, [open, item])

  const handleSave = () => {
    if (item && toTeamId) {
      if (isGrouped) {
        initiateTransfer(item.id, toTeamId, quantity)
      } else {
        initiateTransfer(item.id, toTeamId)
      }
      onOpenChange(false)
      setToTeamId('')
    }
  }

  const otherTeams = teams.filter((t) => t.id !== teamId)
  const isInvalidQuantity = isGrouped && (quantity < 1 || quantity > (item?.quantity || 1))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5" /> Transferir Ferramenta
          </DialogTitle>
          <DialogDescription>
            Inicie uma transferência de ativo. O responsável da equipe de destino deverá validar
            visualmente o item antes do aceite final.
          </DialogDescription>
        </DialogHeader>
        <div className="py-6 space-y-4">
          <div className="p-3 bg-muted/40 rounded border text-sm space-y-1 dark:border-border/50">
            <p>
              <span className="text-muted-foreground">Instância:</span>{' '}
              {item?.hasAssetNumber ? item.assetNumber : 'Lote (S/N)'}
            </p>
            <p>
              <span className="text-muted-foreground">Status Atual:</span> Disponível para envio
            </p>
            {isGrouped && (
              <p>
                <span className="text-muted-foreground">Saldo Disponível:</span>{' '}
                <span className="font-semibold">{item?.quantity || 1} unidades</span>
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Equipe de Destino</Label>
            <Select value={toTeamId} onValueChange={setToTeamId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a equipe recebedora..." />
              </SelectTrigger>
              <SelectContent>
                {otherTeams.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
                {otherTeams.length === 0 && (
                  <SelectItem value="none" disabled>
                    Nenhuma outra equipe cadastrada.
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          {isGrouped && (
            <div className="space-y-2 animate-fade-in">
              <Label>Quantidade a Transferir</Label>
              <Input
                type="number"
                min={1}
                max={item?.quantity || 1}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className={
                  isInvalidQuantity ? 'border-destructive focus-visible:ring-destructive' : ''
                }
              />
              {isInvalidQuantity && (
                <p className="text-xs text-destructive">
                  A quantidade deve ser entre 1 e {item?.quantity || 1}.
                </p>
              )}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={!toTeamId || isInvalidQuantity}>
            Iniciar Transferência
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
