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
  const [assetNumber, setAssetNumber] = useState('')
  const [photos, setPhotos] = useState<string[]>([])

  useEffect(() => {
    if (item) {
      setCondition(item.condition)
      setAssetNumber(item.assetNumber)
      setPhotos(item.photos || [])
    }
  }, [item])

  const handleSave = () => {
    if (item) updateInventoryItem(item.id, { condition, assetNumber, photos })
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
          <DialogTitle>Perfil da Ferramenta</DialogTitle>
          <DialogDescription>
            Gerencie as informações e visualize a linha do tempo desta instância.
          </DialogDescription>
        </DialogHeader>
        {item && (
          <Tabs defaultValue="details" className="mt-2">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="details">Detalhes e Fotos</TabsTrigger>
              <TabsTrigger value="history">Histórico</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nº Patrimônio</Label>
                  <Input value={assetNumber} onChange={(e) => setAssetNumber(e.target.value)} />
                </div>
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
              </div>
              <div className="space-y-3 border rounded-md p-4 bg-muted/30">
                <Label className="flex items-center gap-2">
                  <Camera className="h-4 w-4" /> Evidências Visuais
                </Label>
                <div className="grid grid-cols-4 gap-2">
                  {photos.map((p, i) => (
                    <div
                      key={i}
                      className="relative aspect-square rounded-md overflow-hidden border group bg-background"
                    >
                      <img src={p} alt={`Evidência ${i}`} className="w-full h-full object-cover" />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
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
                <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                  {itemHistory.length === 0 ? (
                    <p className="text-sm text-center text-muted-foreground pt-4">
                      Nenhum evento registrado.
                    </p>
                  ) : (
                    itemHistory.map((evt) => (
                      <div
                        key={evt.id}
                        className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
                      >
                        <div className="flex items-center justify-center w-5 h-5 rounded-full border-2 border-background bg-primary shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 ml-0.5 md:ml-0" />
                        <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] p-3 rounded-lg border bg-card shadow-sm text-left">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-sm text-foreground">{evt.user}</span>
                            <time className="text-xs text-muted-foreground">
                              {new Date(evt.date).toLocaleDateString()}
                            </time>
                          </div>
                          <p className="text-xs text-muted-foreground">{evt.description}</p>
                        </div>
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
