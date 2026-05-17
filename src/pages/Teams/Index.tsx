import { useState } from 'react'
import { useAppStore } from '@/store/AppStore'
import { canViewTeam, canManageUsers } from '@/lib/permissions'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import {
  MapPin,
  Package,
  AlertTriangle,
  ArrowRightLeft,
  Edit,
  Trash2,
  User as UserIcon,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { teamService } from '@/services/TeamService'
import { toast } from 'sonner'
import { Team } from '@/types'

export default function TeamsPage() {
  const appStore = useAppStore() as any
  const { teams, inventory, transfers, currentUser, users } = appStore
  const filteredTeams = teams.filter((t: any) => canViewTeam(currentUser, t.id))

  const [isAddingTeam, setIsAddingTeam] = useState(false)
  const [editingTeam, setEditingTeam] = useState<Team | null>(null)
  const [teamForm, setTeamForm] = useState({
    name: '',
    description: '',
    location: '',
    managerId: 'none',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const potentialManagers = users.filter(
    (u: any) => ['Gestor', 'Encarregado Gestor', 'Encarregado'].includes(u.role) && u.active,
  )

  const openAddModal = () => {
    setTeamForm({ name: '', description: '', location: '', managerId: 'none' })
    setEditingTeam(null)
    setIsAddingTeam(true)
  }

  const openEditModal = (team: Team) => {
    setTeamForm({
      name: team.name,
      description: team.description || '',
      location: team.location || '',
      managerId: team.managerId || 'none',
    })
    setEditingTeam(team)
    setIsAddingTeam(true)
  }

  const handleDelete = async (teamId: string) => {
    if (!confirm('Deseja inativar esta equipe?')) return
    try {
      await teamService.deleteTeam(teamId)
      toast.success('Equipe inativada com sucesso!')
      window.location.reload()
    } catch (e: any) {
      toast.error('Erro: ' + e.message)
    }
  }

  const handleSubmit = async () => {
    if (!teamForm.name.trim()) {
      toast.error('O nome da equipe é obrigatório')
      return
    }

    setIsSubmitting(true)
    try {
      const managerIdToSave = teamForm.managerId === 'none' ? undefined : teamForm.managerId

      if (editingTeam) {
        await teamService.updateTeam(
          editingTeam.id,
          teamForm.name.trim(),
          teamForm.description.trim(),
          managerIdToSave,
        )
        toast.success('Equipe atualizada com sucesso!')
      } else {
        await teamService.createTeam(
          teamForm.name.trim(),
          teamForm.description.trim(),
          managerIdToSave,
        )
        toast.success('Equipe criada com sucesso!')
      }

      setIsAddingTeam(false)
      setTimeout(() => window.location.reload(), 500)
    } catch (error: any) {
      console.error('Error saving team:', error)
      toast.error('Erro ao salvar equipe: ' + error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Gestão de Equipes</h2>
          <p className="text-muted-foreground">
            Visualize e gerencie as equipes e instâncias de ferramentas.
          </p>
        </div>
        {canManageUsers(currentUser) && <Button onClick={openAddModal}>Nova Equipe</Button>}
      </div>

      <Dialog open={isAddingTeam} onOpenChange={setIsAddingTeam}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTeam ? 'Editar Equipe' : 'Nova Equipe'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Equipe *</Label>
              <Input
                id="name"
                value={teamForm.name}
                onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })}
                placeholder="Ex: Equipe Alpha"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="manager">Gestor / Encarregado</Label>
              <Select
                value={teamForm.managerId}
                onValueChange={(v) => setTeamForm({ ...teamForm, managerId: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um responsável" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum responsável</SelectItem>
                  {potentialManagers.map((m: any) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name} ({m.role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Localização / Base</Label>
              <Input
                id="location"
                value={teamForm.location}
                onChange={(e) => setTeamForm({ ...teamForm, location: e.target.value })}
                placeholder="Ex: Base Sul"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descrição (Opcional)</Label>
              <Textarea
                id="description"
                value={teamForm.description}
                onChange={(e) => setTeamForm({ ...teamForm, description: e.target.value })}
                placeholder="Detalhes sobre a equipe..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddingTeam(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Salvando...' : 'Salvar Equipe'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredTeams.map((team: Team) => {
          const teamItems = inventory.filter((i: any) => i.teamId === team.id)
          const usableItemsCount = teamItems
            .filter((i: any) => i.condition === 'good')
            .reduce((sum: number, i: any) => sum + (i.quantity || 1), 0)
          const damagedItemsCount = teamItems
            .filter((i: any) => i.condition === 'damaged')
            .reduce((sum: number, i: any) => sum + (i.quantity || 1), 0)
          const pendingIncoming = transfers.filter(
            (t: any) => t.toTeamId === team.id && t.status === 'pending',
          ).length

          return (
            <Card
              key={team.id}
              className="h-full flex flex-col transition-all duration-200 hover:shadow-elevation hover:border-primary/30 group relative"
            >
              <Link to={`/equipes/${team.id}`} className="absolute inset-0 z-0" />
              <CardHeader className="pb-2">
                <CardTitle className="group-hover:text-primary transition-colors flex justify-between items-start">
                  <span className="truncate pr-2">{team.name}</span>
                </CardTitle>
                <CardDescription className="line-clamp-2 h-10">{team.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 space-y-3 pb-2">
                <div className="flex flex-col gap-1">
                  {team.location && (
                    <div className="flex items-center text-sm text-muted-foreground z-10">
                      <MapPin className="h-4 w-4 mr-2" /> {team.location}
                    </div>
                  )}
                  {team.managerName && (
                    <div className="flex items-center text-sm text-muted-foreground z-10">
                      <UserIcon className="h-4 w-4 mr-2" /> Gestor: {team.managerName}
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between text-sm pt-3 border-t">
                  <div className="flex items-center">
                    <Package className="h-4 w-4 mr-1.5 text-emerald-600 dark:text-emerald-500" />
                    <span className="font-medium text-emerald-700 dark:text-emerald-400">
                      {usableItemsCount} Utilizáveis
                    </span>
                  </div>
                  {damagedItemsCount > 0 && (
                    <div className="flex items-center text-destructive font-medium bg-destructive/10 px-2 py-0.5 rounded-full text-xs dark:bg-destructive/20 dark:text-red-400">
                      <AlertTriangle className="h-3 w-3 mr-1" /> {damagedItemsCount} avaria
                    </div>
                  )}
                </div>
                {pendingIncoming > 0 && (
                  <div className="flex items-center text-amber-700 font-medium bg-amber-100/50 px-2 py-1 rounded text-xs border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/50">
                    <ArrowRightLeft className="h-3.5 w-3.5 mr-1.5" />
                    {pendingIncoming} Transferência{pendingIncoming > 1 ? 's' : ''} Pendente
                  </div>
                )}
              </CardContent>
              {canManageUsers(currentUser) && (
                <CardFooter className="pt-0 flex justify-end gap-2 z-10 pb-4 pr-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-primary"
                    onClick={(e) => {
                      e.preventDefault()
                      openEditModal(team)
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={(e) => {
                      e.preventDefault()
                      handleDelete(team.id)
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardFooter>
              )}
            </Card>
          )
        })}
        {filteredTeams.length === 0 && (
          <p className="text-muted-foreground col-span-full">
            Nenhuma equipe disponível para o seu perfil.
          </p>
        )}
      </div>
    </div>
  )
}
