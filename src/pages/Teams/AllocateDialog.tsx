import { useState, useMemo } from 'react'
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
import { useAppStore } from '@/store/AppStore'
import { uploadPhoto } from '@/lib/storage'
import { Camera, X } from 'lucide-react'

export function AllocateDialog({
  teamId,
  open,
  onOpenChange,
}: {
  teamId: string
  open: boolean
  onOpenChange: (o: boolean) => void
}) {
  const { nodes, addInventoryItem } = useAppStore()

  const [tipo, setTipo] = useState('')
  const [funcao, setFuncao] = useState('')
  const [especificacao, setEspec] = useState('')
  const [item, setItem] = useState('')
  const [marca, setMarca] = useState('')

  const [qty, setQty] = useState(1)
  const [assets, setAssets] = useState<string[]>([''])
  const [price, setPrice] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)

  const tipos = useMemo(() => nodes.filter((n) => n.level === 'tipo'), [nodes])
  const funcoes = useMemo(
    () => nodes.filter((n) => n.level === 'funcao' && n.parentId === tipo),
    [nodes, tipo],
  )
  const especificacoes = useMemo(
    () => nodes.filter((n) => n.level === 'especificacao' && n.parentId === funcao),
    [nodes, funcao],
  )
  const items = useMemo(
    () => nodes.filter((n) => n.level === 'item' && n.parentId === especificacao),
    [nodes, especificacao],
  )
  const marcas = useMemo(
    () => nodes.filter((n) => n.level === 'marca' && n.parentId === item),
    [nodes, item],
  )

  const selectedMarca = nodes.find((n) => n.id === marca)
  const isGrouped = selectedMarca?.isGrouped || nodes.find((n) => n.id === item)?.isGrouped

  const handleSave = async () => {
    if (!marca) return alert('Selecione todos os 5 níveis da árvore.')
    if (!isGrouped && assets.some((a) => !a.trim()))
      return alert('Preencha todos os números de patrimônio.')

    setUploading(true)
    const photoUrls = []
    for (const file of files) {
      const url = await uploadPhoto(file)
      if (url) photoUrls.push(url)
    }

    addInventoryItem({
      teamId,
      treeNodeId: marca,
      condition: 'good',
      qty,
      price: parseFloat(price) || 0,
      hasAssetNumber: !isGrouped,
      assets,
      photos: photoUrls,
    })

    setUploading(false)
    setTipo('')
    setFuncao('')
    setEspec('')
    setItem('')
    setMarca('')
    setQty(1)
    setAssets([''])
    setPrice('')
    setFiles([])
    onOpenChange(false)
  }

  const handleQtyChange = (n: number) => {
    setQty(n)
    if (!isGrouped) {
      setAssets(Array.from({ length: n }).map((_, i) => assets[i] || ''))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Alocar Nova Ferramenta</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-muted/20 p-3 rounded border">
            <div className="space-y-1">
              <Label>1. Tipo</Label>
              <Select
                value={tipo}
                onValueChange={(v) => {
                  setTipo(v)
                  setFuncao('')
                  setEspec('')
                  setItem('')
                  setMarca('')
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {tipos.map((n) => (
                    <SelectItem key={n.id} value={n.id}>
                      {n.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>2. Função</Label>
              <Select
                disabled={!tipo}
                value={funcao}
                onValueChange={(v) => {
                  setFuncao(v)
                  setEspec('')
                  setItem('')
                  setMarca('')
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {funcoes.map((n) => (
                    <SelectItem key={n.id} value={n.id}>
                      {n.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>3. Especificação</Label>
              <Select
                disabled={!funcao}
                value={especificacao}
                onValueChange={(v) => {
                  setEspec(v)
                  setItem('')
                  setMarca('')
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {especificacoes.map((n) => (
                    <SelectItem key={n.id} value={n.id}>
                      {n.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>4. Item</Label>
              <Select
                disabled={!especificacao}
                value={item}
                onValueChange={(v) => {
                  setItem(v)
                  setMarca('')
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {items.map((n) => (
                    <SelectItem key={n.id} value={n.id}>
                      {n.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1 sm:col-span-2">
              <Label>5. Marca</Label>
              <Select disabled={!item} value={marca} onValueChange={setMarca}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a marca..." />
                </SelectTrigger>
                <SelectContent>
                  {marcas.map((n) => (
                    <SelectItem key={n.id} value={n.id}>
                      {n.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {marca && (
            <div className="space-y-4 animate-fade-in border-t pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Quantidade</Label>
                  <Input
                    type="number"
                    min={1}
                    value={qty}
                    onChange={(e) => handleQtyChange(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Preço Unitário (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>
              </div>
              {!isGrouped &&
                assets.map((a, i) => (
                  <div key={i} className="space-y-2">
                    <Label>Patrimônio da Unidade {i + 1}</Label>
                    <Input
                      value={a}
                      onChange={(e) => {
                        const na = [...assets]
                        na[i] = e.target.value
                        setAssets(na)
                      }}
                      placeholder="Ex: PAT-12345"
                    />
                  </div>
                ))}

              <div className="space-y-2">
                <Label>Fotos / Evidências</Label>
                <div className="flex flex-wrap gap-2">
                  {files.map((f, i) => (
                    <div key={i} className="relative w-16 h-16 rounded border overflow-hidden">
                      <img
                        src={URL.createObjectURL(f)}
                        className="w-full h-full object-cover"
                        alt="upload"
                      />
                      <button
                        className="absolute top-0 right-0 bg-red-500 text-white rounded-bl p-0.5"
                        onClick={() => setFiles(files.filter((_, idx) => idx !== i))}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
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
                </div>
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={!marca || uploading}>
            {uploading ? 'Salvando...' : 'Registrar Ativo'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
