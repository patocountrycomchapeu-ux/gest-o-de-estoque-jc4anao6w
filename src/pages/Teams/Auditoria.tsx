import { useState, useMemo } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAppStore } from '@/store/AppStore'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Plus, CheckCircle2 } from 'lucide-react'
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

export default function AuditoriaPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { teams, inventory, getNodePath, submitChecklist } = useAppStore()

  const team = teams.find((t) => t.id === id)
  const teamInventory = useMemo(() => inventory.filter((i) => i.teamId === id), [inventory, id])

  const [leaderName, setLeaderName] = useState('')
  const [items, setItems] = useState<Record<string, { status: ToolStatus; notes: string }>>(() => {
    const init: Record<string, any> = {}
    teamInventory.forEach((i) => {
      init[i.id] = { status: i.status || 'present', notes: i.borrowedTo || '' }
    })
    return init
  })
  const [extraItems, setExtraItems] = useState<{ assetNumber: string; notes: string }[]>([])

  if (!team) return null

  const handleStatusChange = (invId: string, status: ToolStatus) => {
    setItems((prev) => ({ ...prev, [invId]: { ...prev[invId], status } }))
  }

  const handleNotesChange = (invId: string, notes: string) => {
    setItems((prev) => ({ ...prev, [invId]: { ...prev[invId], notes } }))
  }

  const handleSubmit = () => {
    if (!leaderName.trim()) return alert('Informe o nome do líder responsável.')
    submitChecklist(
      team.id,
      leaderName,
      items,
      extraItems.filter((e) => e.assetNumber.trim()),
    )
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
                <TableHead>Ferramenta (Marca)</TableHead>
                <TableHead className="w-[200px]">Status Encontrado</TableHead>
                <TableHead>Observações (P/ Emprestados)</TableHead>
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
                          className={`h-8 ${st?.status === 'present' ? 'bg-blue-50' : st?.status === 'missing' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-amber-50'}`}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="present">Presente</SelectItem>
                          <SelectItem value="missing">Faltando (Não Localizado)</SelectItem>
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
              onClick={() => setExtraItems([...extraItems, { assetNumber: '', notes: '' }])}
            >
              <Plus className="h-4 w-4 mr-2" /> Adicionar Item
            </Button>
          </CardTitle>
          <CardDescription>
            Registre ferramentas de outras equipes que estão com vocês atualmente.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {extraItems.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhum item extra adicionado.
            </p>
          )}
          {extraItems.map((ex, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <Input
                placeholder="Nº Patrimônio (PAT-XXX)"
                className="w-[200px]"
                value={ex.assetNumber}
                onChange={(e) => {
                  const n = [...extraItems]
                  n[idx].assetNumber = e.target.value
                  setExtraItems(n)
                }}
              />
              <Input
                placeholder="Observações (De onde veio?)"
                className="flex-1"
                value={ex.notes}
                onChange={(e) => {
                  const n = [...extraItems]
                  n[idx].notes = e.target.value
                  setExtraItems(n)
                }}
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setExtraItems(extraItems.filter((_, i) => i !== idx))}
                className="text-destructive"
              >
                ×
              </Button>
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
