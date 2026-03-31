import { useState } from 'react'
import { useAppStore } from '@/store/AppStore'
import { canViewTeam, canManageUsers } from '@/lib/permissions'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { MapPin, Package, AlertTriangle, ArrowRightLeft } from 'lucide-react'
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
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'

export default function TeamsPage() {
  const appStore = useAppStore() as any
  const { teams, inventory, transfers, currentUser, addTeam } = appStore
  const filteredTeams = teams.filter((t: any) => canViewTeam(currentUser, t.id))

  const [isAddingTeam, setIsAddingTeam] = useState(false)
  const [newTeam, setNewTeam] = useState({ name: '', description: '', location: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleAddTeam = async () => {
    if (!newTeam.name.trim()) {
      toast.error('O nome da equipe é obrigatório')
      return
    }

    setIsSubmitting(true)
    try {
      const teamId = crypto.randomUUID()
      const teamData = {
        id: teamId,
        name: newTeam.name.trim(),
        description: newTeam.description.trim(),
        location: newTeam.location.trim(),
      }

      const { error } = await supabase.from('teams').insert(teamData)

      if (error) throw error

      if (typeof addTeam === 'function') {
        addTeam(teamData)
      } else {
        window.location.reload()
      }

      toast.success('Equipe criada com sucesso!')
      setIsAddingTeam(false)
      setNewTeam({ name: '', description: '', location: '' })
    } catch (error: any) {
      console.error('Error adding team:', error)
      toast.error('Erro ao criar equipe: ' + error.message)
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
            Visualize e gerencie as instâncias de ferramentas de cada equipe.
          </p>
        </div>
        {canManageUsers(currentUser) && (
          <Button onClick={() => setIsAddingTeam(true)}>Nova Equipe</Button>
        )}
      </div>

      <Dialog open={isAddingTeam} onOpenChange={setIsAddingTeam}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Equipe</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Equipe</Label>
              <Input
                id="name"
                value={newTeam.name}
                onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                placeholder="Ex: Equipe Alpha"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Localização / Base</Label>
              <Input
                id="location"
                value={newTeam.location}
                onChange={(e) => setNewTeam({ ...newTeam, location: e.target.value })}
                placeholder="Ex: Base Sul"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descrição (Opcional)</Label>
              <Textarea
                id="description"
                value={newTeam.description}
                onChange={(e) => setNewTeam({ ...newTeam, description: e.target.value })}
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
            <Button onClick={handleAddTeam} disabled={isSubmitting}>
              {isSubmitting ? 'Salvando...' : 'Salvar Equipe'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredTeams.map((team) => {
          const teamItems = inventory.filter((i) => i.teamId === team.id)
          const usableItemsCount = teamItems
            .filter((i) => i.condition === 'good')
            .reduce((sum, i) => sum + (i.quantity || 1), 0)
          const damagedItemsCount = teamItems
            .filter((i) => i.condition === 'damaged')
            .reduce((sum, i) => sum + (i.quantity || 1), 0)
          const pendingIncoming = transfers.filter(
            (t) => t.toTeamId === team.id && t.status === 'pending',
          ).length

          return (
            <Link key={team.id} to={`/equipes/${team.id}`} className="block group">
              <Card className="h-full transition-all duration-200 hover:shadow-elevation hover:-translate-y-1 hover:border-primary/30">
                <CardHeader>
                  <CardTitle className="group-hover:text-primary transition-colors">
                    {team.name}
                  </CardTitle>
                  <CardDescription className="line-clamp-2">{team.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-2" /> {team.location}
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
                        {pendingIncoming > 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
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
