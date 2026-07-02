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
import { Checkbox } from '@/components/ui/checkbox'
import { InventoryItem } from '@/types'
import { ArrowRightLeft, ShieldAlert, AlertTriangle } from 'lucide-react'

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
  const [confirmRepair, setConfirmRepair] = useState(false)

  const isGrouped = !item?.hasAssetNumber
  const isDamaged = item?.condition === 'damaged'
  const isRepair = item?.condition === 'repair'

  useEffect(() => {
    if (open && item) {
      setQuantity(item.quantity || 1)
      setToTeamId('')
      setConfirmRepair(false)
    }
  }, [open, item])

  const handleSave = () => {
    if (item && toTeamId) {
      if (isGrouped) initiateTransfer(item.id, toTeamId, quantity)
      else initiateTransfer(item.id, toTeamId)
      onOpenChange(false)
      setToTeamId('')
    }
  }

  const otherTeams = teams.filter((t) => t.id !== teamId)
  const isInvalidQuantity = isGrouped && (quantity < 1 || quantity > (item?.quantity || 1))

  if (item && isDamaged) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <ShieldAlert className="h-5 w-5" /> Transferência Bloqueada
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 text-sm text-muted-foreground">
            Ativos marcados como "Danificado" não podem ser transferidos. Eles devem retornar ao
            status "Bom Estado" antes de serem movimentados para outra equipe.
          </div>
          <DialogFooter>
            <Button onClick={() => onOpenChange(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5" /> Transferir Ferramenta
          </DialogTitle>
          <DialogDescription>
            Inicie uma transferência de ativo. O status ficará como Pendente até o envio físico.
          </DialogDescription>
        </DialogHeader>
        <div className="py-6 space-y-4">
          <div className="p-3 bg-muted/40 rounded border text-sm space-y-1">
            <p>
              <span className="text-muted-foreground">Instância:</span>{' '}
              {item?.hasAssetNumber ? item.assetNumber : 'Lote (S/N)'}
            </p>
            {isGrouped && (
              <p>
                <span className="text-muted-foreground">Saldo Disponível:</span>{' '}
                <span className="font-semibold">{item?.quantity || 1} unidades</span>
              </p>
            )}
          </div>

          {isRepair && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-md space-y-3 dark:bg-amber-950/30 dark:border-amber-800/50">
              <div className="flex items-start gap-2 text-amber-800 dark:text-amber-400">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <div className="text-xs font-medium">
                  Este item está em reparo. A transferência só é permitida com confirmação
                  explícita.
                  {item?.expectedReturnDate && (
                    <span className="block mt-1">
                      Previsão de retorno:{' '}
                      {new Date(item.expectedReturnDate).toLocaleDateString('pt-BR')}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="confirm-repair"
                  checked={confirmRepair}
                  onCheckedChange={(c) => setConfirmRepair(c as boolean)}
                />
                <Label htmlFor="confirm-repair" className="text-xs cursor-pointer">
                  Confirmo que este item em reparo pode ser transferido
                </Label>
              </div>
            </div>
          )}

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
            <div className="space-y-2">
              <Label>Quantidade a Transferir</Label>
              <Input
                type="number"
                min={1}
                max={item?.quantity || 1}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className={isInvalidQuantity ? 'border-destructive' : ''}
              />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={!toTeamId || isInvalidQuantity || (isRepair && !confirmRepair)}
          >
            Iniciar Transferência
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
