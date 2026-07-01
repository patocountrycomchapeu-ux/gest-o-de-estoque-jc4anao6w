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

  const [departamento, setDepartamento] = useState('')
  const [categoria, setCategoria] = useState('')
  const [tipo, setTipo] = useState('')
  const [linha, setLinha] = useState('')
  const [marca, setMarca] = useState('')

  const [qty, setQty] = useState(1)
  const [assets, setAssets] = useState<string[]>([''])
  const [price, setPrice] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)

  const departamentos = useMemo(() => nodes.filter((n) => n.level === 'departamento'), [nodes])
  const categorias = useMemo(
    () => nodes.filter((n) => n.level === 'categoria' && n.parentId === departamento),
    [nodes, departamento],
  )
  const tipos = useMemo(
    () => nodes.filter((n) => n.level === 'tipo' && n.parentId === categoria),
    [nodes, categoria],
  )
  const linhas = useMemo(
    () => nodes.filter((n) => n.level === 'linha' && n.parentId === tipo),
    [nodes, tipo],
  )
  const marcas = useMemo(
    () => nodes.filter((n) => n.level === 'marca' && n.parentId === linha),
    [nodes, linha],
  )

  const selectedMarca = nodes.find((n) => n.id === marca)
  const isGrouped = selectedMarca?.isGrouped

  const resetForm = () => {
    setDepartamento('')
    setCategoria('')
    setTipo('')
    setLinha('')
    setMarca('')
    setQty(1)
    setAssets([''])
    setPrice('')
    setFiles([])
  }

  const handleSave = async () => {
    if (!marca) return alert('Selecione todos os 5 níveis da árvore.')
    if (!isGrouped && assets.some((a) => !a.trim()))
      return alert('Preencha todos os números de patrimônio.')

    setUploading(true)
    const photoUrls: string[] = []
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
    resetForm()
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
              <Label>1. Departamento</Label>
              <Select
                value={departamento}
                onValueChange={(v) => {
                  setDepartamento(v)
                  setCategoria('')
                  setTipo('')
                  setLinha('')
                  setMarca('')
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {departamentos.map((n) => (
                    <SelectItem key={n.id} value={n.id}>
                      {n.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>2. Categoria</Label>
              <Select
                disabled={!departamento}
                value={categoria}
                onValueChange={(v) => {
                  setCategoria(v)
                  setTipo('')
                  setLinha('')
                  setMarca('')
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {categorias.map((n) => (
                    <SelectItem key={n.id} value={n.id}>
                      {n.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>3. Tipo</Label>
              <Select
                disabled={!categoria}
                value={tipo}
                onValueChange={(v) => {
                  setTipo(v)
                  setLinha('')
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
              <Label>4. Linha</Label>
              <Select
                disabled={!tipo}
                value={linha}
                onValueChange={(v) => {
                  setLinha(v)
                  setMarca('')
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {linhas.map((n) => (
                    <SelectItem key={n.id} value={n.id}>
                      {n.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1 sm:col-span-2">
              <Label>5. Marca</Label>
              <Select disabled={!linha} value={marca} onValueChange={setMarca}>
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
                    type="text"
                    inputMode="decimal"
                    value={price}
                    onChange={(e) =>
                      setPrice(e.target.value.replace(/[^0-9.,]/g, '').replace(',', '.'))
                    }
                    placeholder="0.00"
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
