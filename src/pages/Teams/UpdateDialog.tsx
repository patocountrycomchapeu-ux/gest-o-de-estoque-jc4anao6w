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
import { InventoryItem, Condition } from '@/types'
import { Camera, Image as ImageIcon } from 'lucide-react'

export function UpdateDialog({
  item,
  open,
  onOpenChange,
}: {
  item: InventoryItem | null
  open: boolean
  onOpenChange: (o: boolean) => void
}) {
  const { updateInventoryCondition } = useAppStore()
  const [condition, setCondition] = useState<Condition>('good')
  const [photoUrl, setPhotoUrl] = useState<string>('')

  useEffect(() => {
    if (item) {
      setCondition(item.condition)
      setPhotoUrl(item.photoUrl || '')
    }
  }, [item])

  const handleSave = () => {
    if (item) {
      updateInventoryCondition(item.id, condition, photoUrl)
    }
    onOpenChange(false)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setPhotoUrl(url)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Atualizar Estado do Item</DialogTitle>
          <DialogDescription>
            Altere a condição ou adicione uma foto de comprovação.
          </DialogDescription>
        </DialogHeader>
        {item && (
          <div className="grid gap-6 py-4">
            <div className="space-y-2">
              <Label>Condição Atual</Label>
              <Select value={condition} onValueChange={(v: Condition) => setCondition(v)}>
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

            <div className="space-y-3 border rounded-md p-4 bg-muted/30">
              <Label className="flex items-center gap-2">
                <Camera className="h-4 w-4" /> Foto de Evidência
              </Label>
              {photoUrl ? (
                <div className="relative aspect-video rounded-md overflow-hidden border">
                  <img src={photoUrl} alt="Evidência" className="w-full h-full object-cover" />
                  <Button
                    variant="secondary"
                    size="sm"
                    className="absolute bottom-2 right-2 opacity-80 hover:opacity-100"
                    onClick={() => setPhotoUrl('')}
                  >
                    Remover
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-center w-full">
                  <label
                    htmlFor="dropzone-file"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-background hover:bg-muted/50 border-muted-foreground/40 transition-colors"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <ImageIcon className="w-8 h-8 mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground font-medium">
                        Clique para enviar
                      </p>
                    </div>
                    <Input
                      id="dropzone-file"
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </label>
                </div>
              )}
            </div>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>Salvar Alterações</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
