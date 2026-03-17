import { useState, useMemo } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAppStore } from '@/store/AppStore'
import { Button } from '@/components/ui/button'
import { ArrowLeft, CheckCircle2, Camera } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { uploadPhoto } from '@/lib/storage'

export default function AuditoriaPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { teams, inventory, getNodePath, submitChecklist } = useAppStore()

  const team = teams.find((t) => t.id === id)
  const teamInventory = useMemo(() => inventory.filter((i) => i.teamId === id), [inventory, id])

  const [leaderName, setLeaderName] = useState('')
  const [items, setItems] = useState<
    Record<string, { status: ToolStatus; notes: string; photoFile?: File }>
  >(() => {
    const init: Record<string, any> = {}
    teamInventory.forEach((i) => {
      init[i.id] = { status: i.status || 'present', notes: '' }
    })
    return init
  })
  const [submitting, setSubmitting] = useState(false)

  if (!team) return null

  const handleSubmit = async () => {
    if (!leaderName.trim()) return alert('Informe o nome do líder responsável.')

    let discrepanciesCount = 0

    for (const inv of teamInventory) {
      const st = items[inv.id]
      if (st.status !== 'present') {
        discrepanciesCount++
        if (!st.photoFile && st.status === 'missing')
          return alert(`Foto obrigatória para item extraviado (${inv.assetNumber || 'S/N'}).`)
      }
    }

    setSubmitting(true)
    for (const inv of teamInventory) {
      const st = items[inv.id]
      if (st.photoFile) await uploadPhoto(st.photoFile) // Just uploading for evidence in bucket for now
    }

    submitChecklist(team.id, leaderName, items, discrepanciesCount, teamInventory.length)
    setSubmitting(false)
    navigate(`/equipes/${team.id}`)
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in pb-12">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild className="rounded-full bg-muted/50">
          <Link to={`/equipes/${team.id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Checklist de Auditoria</h2>
          <p className="text-muted-foreground">{team.name}</p>
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
                <TableHead>Patrimônio/Lote</TableHead>
                <TableHead>Ferramenta</TableHead>
                <TableHead className="w-[180px]">Status Físico</TableHead>
                <TableHead>Evidência (Foto)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teamInventory.map((item) => {
                const path = getNodePath(item.treeNodeId)
                const name = `${path.find((n) => n.level === 'item')?.name}`
                const st = items[item.id]
                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono text-xs">
                      {item.hasAssetNumber ? item.assetNumber : `Lote: ${item.quantity} un`}
                    </TableCell>
                    <TableCell className="font-medium text-sm">{name}</TableCell>
                    <TableCell>
                      <Select
                        value={st?.status}
                        onValueChange={(v) =>
                          setItems((p) => ({
                            ...p,
                            [item.id]: { ...p[item.id], status: v as ToolStatus },
                          }))
                        }
                      >
                        <SelectTrigger
                          className={`h-8 ${st?.status !== 'present' ? 'bg-red-50 text-red-700' : 'bg-blue-50'}`}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="present">Presente</SelectItem>
                          <SelectItem value="missing">Faltando/Extravio</SelectItem>
                          <SelectItem value="damaged">Danificado/Quebrado</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      {st?.status !== 'present' && (
                        <div className="flex items-center gap-2">
                          <label className="flex items-center justify-center w-8 h-8 rounded border border-dashed cursor-pointer hover:bg-muted">
                            <Camera className="w-4 h-4 text-muted-foreground" />
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                if (e.target.files?.[0])
                                  setItems((p) => ({
                                    ...p,
                                    [item.id]: { ...p[item.id], photoFile: e.target.files![0] },
                                  }))
                              }}
                            />
                          </label>
                          {st.photoFile && (
                            <span className="text-[10px] text-emerald-600 font-medium">
                              Foto anexada
                            </span>
                          )}
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          size="lg"
          onClick={handleSubmit}
          disabled={!leaderName.trim() || submitting}
          className="w-full sm:w-auto"
        >
          <CheckCircle2 className="h-5 w-5 mr-2" />{' '}
          {submitting ? 'Salvando...' : 'Finalizar Auditoria'}
        </Button>
      </div>
    </div>
  )
}
