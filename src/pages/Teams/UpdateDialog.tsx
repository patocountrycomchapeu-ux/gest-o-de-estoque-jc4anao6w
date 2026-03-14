import { useState, useEffect } from 'react'
import { useAppStore } from '@/store/AppStore'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { ScrollArea } from '@/components/ui/scroll-area'
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
  const { updateInventoryItem, history } = useAppStore()
  const [condition, setCondition] = useState<Condition>('good')
  const [hasAsset, setHasAsset] = useState(true)
  const [assetNumber, setAssetNumber] = useState('')
  const [photos, setPhotos] = useState<string[]>([])

  useEffect(() => {
    if (item) {
      setCondition(item.condition)
      setHasAsset(item.hasAssetNumber ?? true)
      setAssetNumber(item.assetNumber || '')
      setPhotos(item.photos || [])
    }
  }, [item])

  const handleSave = () => {
    if (item)
      updateInventoryItem(item.id, {
        condition,
        hasAssetNumber: hasAsset,
        assetNumber: hasAsset ? assetNumber : undefined,
        photos,
      })
    onOpenChange(false)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) setPhotos((prev) => [...prev, URL.createObjectURL(file)])
  }

  const itemHistory = history
    .filter((h) => h.inventoryId === item?.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Perfil da Instância</DialogTitle>
          <DialogDescription>
            Gerencie dados e insira fotos para controle de estado.
          </DialogDescription>
        </DialogHeader>
        {item && (
          <Tabs defaultValue="details" className="mt-2">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="details">Detalhes</TabsTrigger>
              <TabsTrigger value="history">Linha do Tempo</TabsTrigger>
            </TabsList>
            <TabsContent value="details" className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Condição</Label>
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
                <div className="flex flex-col justify-center space-y-2 border rounded-md px-3 py-1">
                  <Label className="text-xs">Possui Patrimônio?</Label>
                  <Switch checked={hasAsset} onCheckedChange={setHasAsset} />
                </div>
              </div>
              {hasAsset && (
                <div className="space-y-2 animate-in fade-in">
                  <Label>Nº Patrimônio</Label>
                  <Input value={assetNumber} onChange={(e) => setAssetNumber(e.target.value)} />
                </div>
              )}
              <div className="space-y-3 border rounded-md p-4 bg-muted/30">
                <Label className="flex items-center gap-2">
                  <Camera className="h-4 w-4" /> Fotos / Evidências
                </Label>
                <div className="grid grid-cols-4 gap-2">
                  {photos.map((p, i) => (
                    <div
                      key={i}
                      className="relative aspect-square rounded-md overflow-hidden border group bg-background"
                    >
                      <img src={p} alt="Foto" className="w-full h-full object-cover" />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 h-5 w-5 opacity-0 group-hover:opacity-100"
                        onClick={() => setPhotos((prev) => prev.filter((_, idx) => idx !== i))}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  <label className="flex flex-col items-center justify-center w-full aspect-square border-2 border-dashed rounded-lg cursor-pointer bg-background hover:bg-muted/50 transition-colors">
                    <Plus className="w-5 h-5 text-muted-foreground" />
                    <Input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </label>
                </div>
              </div>
              <Button className="w-full" onClick={handleSave}>
                Salvar Alterações
              </Button>
            </TabsContent>
            <TabsContent value="history" className="py-4">
              <ScrollArea className="h-[280px] pr-4">
                <div className="space-y-4 border-l-2 ml-3 border-muted pl-4 relative">
                  {itemHistory.length === 0 ? (
                    <p className="text-sm text-muted-foreground pt-4">Sem eventos.</p>
                  ) : (
                    itemHistory.map((evt) => (
                      <div key={evt.id} className="relative">
                        <div className="absolute -left-[23px] top-1 h-3 w-3 rounded-full bg-primary ring-4 ring-background" />
                        <div className="text-xs text-muted-foreground mb-1 flex justify-between">
                          <span>{new Date(evt.date).toLocaleDateString()}</span>
                          <span className="font-medium text-foreground">{evt.user}</span>
                        </div>
                        <p className="text-sm border rounded-md p-2 bg-muted/20">
                          {evt.description}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  )
}
