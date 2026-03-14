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
import { Camera, Plus, X } from 'lucide-react'

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
  const [photos, setPhotos] = useState<string[]>([])

  useEffect(() => {
    if (item) {
      setCondition(item.condition)
      setPhotos(item.photos || [])
    }
  }, [item])

  const handleSave = () => {
    if (item) {
      updateInventoryCondition(item.id, condition, photos)
    }
    onOpenChange(false)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setPhotos((prev) => [...prev, url])
    }
  }

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Perfil da Instância {item?.id}</DialogTitle>
          <DialogDescription>
            Atualize a condição da unidade e gerencie sua galeria de evidências.
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
                <Camera className="h-4 w-4" /> Galeria de Evidências Visuais
              </Label>
              <div className="grid grid-cols-3 gap-2">
                {photos.map((p, i) => (
                  <div
                    key={i}
                    className="relative aspect-square rounded-md overflow-hidden border group bg-background"
                  >
                    <img
                      src={p}
                      alt={`Evidência ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removePhoto(i)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}

                <label
                  htmlFor="dropzone-file"
                  className="flex flex-col items-center justify-center w-full aspect-square border-2 border-dashed rounded-lg cursor-pointer bg-background hover:bg-muted/50 border-muted-foreground/40 transition-colors"
                >
                  <div className="flex flex-col items-center justify-center">
                    <Plus className="w-6 h-6 text-muted-foreground mb-1" />
                    <span className="text-[10px] text-muted-foreground font-medium">Adicionar</span>
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
