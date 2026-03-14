import { useAppStore } from '@/store/AppStore'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { MapPin, Package, AlertTriangle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export default function TeamsPage() {
  const { teams, inventory } = useAppStore()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Gestão de Equipes</h2>
          <p className="text-muted-foreground">
            Visualize e gerencie as instâncias de ferramentas de cada equipe.
          </p>
        </div>
        <Button>Nova Equipe</Button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {teams.map((team) => {
          const teamItems = inventory.filter((i) => i.teamId === team.id)
          const totalItems = teamItems.length
          const damagedItems = teamItems.filter((i) => i.condition !== 'good').length

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
                        <Package className="h-4 w-4 mr-1.5 text-blue-500" />
                        <span className="font-medium">{totalItems} Instâncias</span>
                      </div>
                      {damagedItems > 0 && (
                        <div className="flex items-center text-destructive font-medium bg-destructive/10 px-2 py-0.5 rounded-full text-xs">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          {damagedItems} com avaria
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
