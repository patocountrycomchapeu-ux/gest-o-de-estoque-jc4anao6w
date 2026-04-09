import { useState } from 'react'
import { useAppStore } from '@/store/AppStore'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { PackagePlus, UploadCloud, X } from 'lucide-react'
import { canManageTree } from '@/lib/permissions'
import { Navigate } from 'react-router-dom'
import { useToast } from '@/hooks/use-toast'

export default function ItemsPage() {
  const { teams, createFullItemAndAllocate, currentUser } = useAppStore()
  const { toast } = useToast()

  const [tipo, setTipo] = useState('')
  const [funcao, setFuncao] = useState('')
  const [especificacao, setEspecificacao] = useState('')
  const [item, setItem] = useState('')
  const [marca, setMarca] = useState('')

  const [teamId, setTeamId] = useState('')
  const [hasAssetNumber, setHasAssetNumber] = useState(true)
  const [qty, setQty] = useState('1')
  const [price, setPrice] = useState('')
  const [assetsStr, setAssetsStr] = useState('')
  const [photos, setPhotos] = useState<string[]>([])
  const [photoUrl, setPhotoUrl] = useState('')

  if (!canManageTree(currentUser)) return <Navigate to="/" replace />

  const handleAddPhoto = () => {
    if (photoUrl) {
      setPhotos([...photos, photoUrl])
      setPhotoUrl('')
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!tipo || !funcao || !especificacao || !item || !marca) {
      toast({
        title: 'Atenção',
        description: 'Preencha todos os níveis da árvore.',
        variant: 'destructive',
      })
      return
    }

    if (!teamId) {
      toast({
        title: 'Atenção',
        description: 'Selecione uma equipe de destino.',
        variant: 'destructive',
      })
      return
    }

    const nQty = parseInt(qty) || 1
    const nPrice = parseFloat(price.replace(',', '.')) || 0

    let assetList: string[] = []
    if (hasAssetNumber) {
      assetList = assetsStr
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
      if (assetList.length !== nQty) {
        toast({
          title: 'Atenção',
          description: `Informe exatamente ${nQty} números de patrimônio separados por vírgula.`,
          variant: 'destructive',
        })
        return
      }
    }

    createFullItemAndAllocate({
      tipo,
      funcao,
      especificacao,
      item,
      marca,
      teamId,
      qty: nQty,
      price: nPrice,
      hasAssetNumber,
      assets: assetList,
      photos,
      condition: 'good',
    })

    setTipo('')
    setFuncao('')
    setEspecificacao('')
    setItem('')
    setMarca('')
    setTeamId('')
    setQty('1')
    setPrice('')
    setAssetsStr('')
    setPhotos([])
  }

  return (
    <div className="space-y-6 animate-fade-in pb-12 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Cadastro de Itens</h2>
        <p className="text-muted-foreground">
          Cadastre novos produtos e aloque diretamente para as equipes em um único fluxo.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PackagePlus className="w-5 h-5 text-primary" /> Novo Item e Alocação
          </CardTitle>
          <CardDescription>
            Defina a classificação mercadológica e os detalhes do inventário.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                1. Árvore Mercadológica
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Input
                    placeholder="Ex: Ferramenta Elétrica"
                    value={tipo}
                    onChange={(e) => setTipo(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Função</Label>
                  <Input
                    placeholder="Ex: Furar/Parafusar"
                    value={funcao}
                    onChange={(e) => setFuncao(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Especificação</Label>
                  <Input
                    placeholder="Ex: Bateria 20V"
                    value={especificacao}
                    onChange={(e) => setEspecificacao(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Item (Modelo)</Label>
                  <Input
                    placeholder="Ex: Parafusadeira Impacto"
                    value={item}
                    onChange={(e) => setItem(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Marca</Label>
                  <Input
                    placeholder="Ex: DeWalt"
                    value={marca}
                    onChange={(e) => setMarca(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4 border-t pt-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                2. Detalhes da Alocação
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Equipe de Destino</Label>
                  <Select value={teamId} onValueChange={setTeamId} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a equipe..." />
                    </SelectTrigger>
                    <SelectContent>
                      {teams.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Preço Unitário (R$)</Label>
                  <Input
                    placeholder="0,00"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                <div className="flex items-center justify-between p-3 border rounded-md">
                  <div>
                    <Label className="text-sm">Item Único / Controlado</Label>
                    <p className="text-xs text-muted-foreground">
                      Exige número de patrimônio individual.
                    </p>
                  </div>
                  <Switch checked={hasAssetNumber} onCheckedChange={setHasAssetNumber} />
                </div>

                <div className="space-y-2">
                  <Label>Quantidade</Label>
                  <Input
                    type="number"
                    min="1"
                    value={qty}
                    onChange={(e) => setQty(e.target.value)}
                    required
                  />
                </div>
              </div>

              {hasAssetNumber && (
                <div className="space-y-2">
                  <Label>Números de Patrimônio (separados por vírgula)</Label>
                  <Input
                    placeholder="Ex: PAT-001, PAT-002"
                    value={assetsStr}
                    onChange={(e) => setAssetsStr(e.target.value)}
                    required={hasAssetNumber}
                  />
                  <p className="text-xs text-muted-foreground">Informe {qty} número(s).</p>
                </div>
              )}
            </div>

            <div className="space-y-4 border-t pt-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                3. Imagens do Produto
              </h3>
              <div className="flex gap-2">
                <Input
                  placeholder="URL da imagem (ex: https://...)"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                />
                <Button type="button" variant="outline" onClick={handleAddPhoto}>
                  <UploadCloud className="w-4 h-4 mr-2" /> Adicionar
                </Button>
              </div>

              {photos.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {photos.map((p, i) => (
                    <div key={i} className="relative group">
                      <img
                        src={p}
                        alt={`Foto ${i}`}
                        className="w-20 h-20 object-cover rounded-md border"
                      />
                      <button
                        type="button"
                        onClick={() => setPhotos(photos.filter((_, idx) => idx !== i))}
                        className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 border-t flex justify-end">
              <Button type="submit" size="lg" className="w-full sm:w-auto">
                <PackagePlus className="w-4 h-4 mr-2" /> Cadastrar e Alocar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
