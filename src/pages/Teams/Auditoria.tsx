import { useState, useMemo } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAppStore } from '@/store/AppStore'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Plus, CheckCircle2, Camera, Image as ImageIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ToolStatus } from '@/types'

type ExtraItem = { assetNumber: string; notes: string; treeNodeId: string; photo: string }

export default function AuditoriaPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { teams, inventory, nodes, getNodePath, submitChecklist } = useAppStore()

  const team = teams.find((t) => t.id === id)
  const teamInventory = useMemo(() => inventory.filter((i) => i.teamId === id), [inventory, id])

  const leafNodes = useMemo(() => {
    return nodes
      .filter((n) => n.level === 'marca' || n.level === 'item')
      .map((n) => {
        const path = getNodePath(n.id)
        return {
          id: n.id,
          name: path.map((p) => p.name).join(' > '),
        }
      })
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [nodes, getNodePath])

  const [leaderName, setLeaderName] = useState('')
  const [items, setItems] = useState<Record<string, { status: ToolStatus; notes: string }>>(() => {
    const init: Record<string, any> = {}
    teamInventory.forEach((i) => {
      init[i.id] = { status: i.status || 'present', notes: i.borrowedTo || '' }
    })
    return init
  })
  const [extraItems, setExtraItems] = useState<ExtraItem[]>([])

  if (!team) return null

  const handleStatusChange = (invId: string, status: ToolStatus) => {
    setItems((prev) => ({ ...prev, [invId]: { ...prev[invId], status } }))
  }

  const handleNotesChange = (invId: string, notes: string) => {
    setItems((prev) => ({ ...prev, [invId]: { ...prev[invId], notes } }))
  }

  const handlePhotoCapture = (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const n = [...extraItems]
        n[idx].photo = reader.result as string
        setExtraItems(n)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleMockPhoto = (idx: number) => {
    const n = [...extraItems]
    n[idx].photo = `https://img.usecurling.com/p/400/400?q=tools&seed=${Date.now()}`
    setExtraItems(n)
  }

  const handleSubmit = () => {
    if (!leaderName.trim()) return alert('Informe o nome do líder responsável.')

    for (let i = 0; i < extraItems.length; i++) {
      const ex = extraItems[i]
      if (!ex.treeNodeId) return alert(`Selecione a classificação para o Item Sobrando #${i + 1}`)
      if (!ex.photo) return alert(`A foto é obrigatória para o Item Sobrando #${i + 1}`)
    }

    submitChecklist(team.id, leaderName, items, extraItems)
    navigate(`/equipes/${team.id}`)
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild className="rounded-full bg-muted/50">
          <Link to={`/equipes/${team.id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Checklist de Inventário</h2>
          <p className="text-muted-foreground">Auditoria de ferramentas - {team.name}</p>
        </div>
      </div>

      <Card>
        <CardHeader className="bg-muted/30 pb-4">
          <div className="max-w-xs space-y-2">
            <Label>Líder Responsável pela Auditoria</Label>
            <Input
              placeholder="Seu nome..."
              value={leaderName}
              onChange={(e) => setLeaderName(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patrimônio</TableHead>
                <TableHead>Ferramenta</TableHead>
                <TableHead className="w-[200px]">Status Encontrado</TableHead>
                <TableHead>Observações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teamInventory.map((item) => {
                const path = getNodePath(item.treeNodeId)
                const name = `${path.find((n) => n.level === 'item')?.name} (${path.find((n) => n.level === 'marca')?.name})`
                const st = items[item.id]
                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono text-xs">{item.assetNumber}</TableCell>
                    <TableCell className="font-medium">{name}</TableCell>
                    <TableCell>
                      <Select
                        value={st?.status}
                        onValueChange={(v) => handleStatusChange(item.id, v as ToolStatus)}
                      >
                        <SelectTrigger
                          className={`h-8 ${st?.status === 'present' ? 'bg-blue-50' : st?.status === 'missing' ? 'bg-red-50 text-red-700' : 'bg-amber-50'}`}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="present">Presente</SelectItem>
                          <SelectItem value="missing">Faltando</SelectItem>
                          <SelectItem value="borrowed">Emprestado</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      {st?.status === 'borrowed' && (
                        <Input
                          className="h-8 text-xs"
                          placeholder="Com quem está?"
                          value={st.notes}
                          onChange={(e) => handleNotesChange(item.id, e.target.value)}
                        />
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="border-dashed border-2">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex justify-between items-center">
            Itens Sobrando (Não esperados)
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setExtraItems([
                  ...extraItems,
                  { assetNumber: '', notes: '', treeNodeId: '', photo: '' },
                ])
              }
            >
              <Plus className="h-4 w-4 mr-2" /> Adicionar Item
            </Button>
          </CardTitle>
          <CardDescription>
            Registre ferramentas adicionais. Foto e Classificação são obrigatórias e os itens serão
            inseridos no estoque da equipe.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {extraItems.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhum item extra adicionado.
            </p>
          )}
          {extraItems.map((ex, idx) => (
            <div
              key={idx}
              className="flex flex-col gap-4 p-4 border rounded-md relative bg-muted/10"
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setExtraItems(extraItems.filter((_, i) => i !== idx))}
                className="text-destructive absolute top-2 right-2 h-8 w-8"
              >
                ×
              </Button>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pr-10">
                <div className="space-y-1.5">
                  <Label>
                    Classificação (Árvore) <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={ex.treeNodeId}
                    onValueChange={(v) => {
                      const n = [...extraItems]
                      n[idx].treeNodeId = v
                      setExtraItems(n)
                    }}
                  >
                    <SelectTrigger className={!ex.treeNodeId ? 'border-destructive/50' : ''}>
                      <SelectValue placeholder="Selecione a categoria..." />
                    </SelectTrigger>
                    <SelectContent>
                      {leafNodes.map((ln) => (
                        <SelectItem key={ln.id} value={ln.id}>
                          {ln.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label>Nº Patrimônio (Opcional)</Label>
                  <Input
                    value={ex.assetNumber}
                    onChange={(e) => {
                      const n = [...extraItems]
                      n[idx].assetNumber = e.target.value
                      setExtraItems(n)
                    }}
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <Label>Observações / Origem</Label>
                  <Input
                    placeholder="De onde veio? Com quem estava?"
                    value={ex.notes}
                    onChange={(e) => {
                      const n = [...extraItems]
                      n[idx].notes = e.target.value
                      setExtraItems(n)
                    }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>
                  Foto do Item <span className="text-destructive">*</span>
                </Label>
                <div className="flex items-center gap-4">
                  {ex.photo ? (
                    <div className="relative w-24 h-24 border rounded-md overflow-hidden bg-background">
                      <img src={ex.photo} alt="Surplus" className="w-full h-full object-cover" />
                      <Button
                        size="icon"
                        variant="destructive"
                        className="absolute top-1 right-1 h-6 w-6 rounded-full opacity-80"
                        onClick={() => {
                          const n = [...extraItems]
                          n[idx].photo = ''
                          setExtraItems(n)
                        }}
                      >
                        ×
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <label className="flex items-center justify-center cursor-pointer h-24 w-24 border-2 border-dashed rounded-md bg-muted/50 hover:bg-muted text-muted-foreground flex-col gap-1">
                        <Camera className="w-6 h-6" />
                        <span className="text-[10px] font-medium text-center leading-tight">
                          Tirar
                          <br />
                          Foto
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          capture="environment"
                          className="hidden"
                          onChange={(e) => handlePhotoCapture(idx, e)}
                        />
                      </label>
                      <Button
                        type="button"
                        variant="outline"
                        className="h-24 w-24 flex flex-col gap-1 rounded-md"
                        onClick={() => handleMockPhoto(idx)}
                      >
                        <ImageIcon className="w-6 h-6 text-muted-foreground" />
                        <span className="text-[10px] font-medium text-center leading-tight">
                          Foto
                          <br />
                          Teste
                        </span>
                      </Button>
                    </div>
                  )}
                  {!ex.photo && (
                    <span className="text-xs text-destructive font-medium">Foto é obrigatória</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          size="lg"
          onClick={handleSubmit}
          disabled={!leaderName.trim()}
          className="w-full sm:w-auto"
        >
          <CheckCircle2 className="h-5 w-5 mr-2" /> Finalizar Auditoria e Salvar
        </Button>
      </div>
    </div>
  )
}
