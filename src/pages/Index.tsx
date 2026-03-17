import { useAppStore } from '@/store/AppStore'
import { canManageUsers } from '@/lib/permissions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity, Package, Users, AlertTriangle, Wrench } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { ConditionChart } from './Dashboard/ConditionChart'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function Index() {
  const { inventory, teams, activities, currentUser } = useAppStore()

  const totalUsable = inventory.filter((i) => i.condition === 'good').length
  const damagedItems = inventory.filter((i) => i.condition === 'damaged').length
  const repairItems = inventory.filter((i) => i.condition === 'repair').length

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total de Instâncias (Em Uso)"
          value={totalUsable}
          icon={Package}
          trend="Itens em bom estado"
        />
        <StatCard title="Equipes Ativas" value={teams.length} icon={Users} />
        <StatCard
          title="Instâncias Danificadas"
          value={damagedItems}
          icon={AlertTriangle}
          critical={damagedItems > 0}
        />
        <StatCard title="Em Reparo" value={repairItems} icon={Wrench} warning={repairItems > 0} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-1 lg:col-span-3">
          <CardHeader>
            <CardTitle>Distribuição de Estado</CardTitle>
            <CardDescription>Visão geral das condições de todo o inventário.</CardDescription>
          </CardHeader>
          <CardContent>
            <ConditionChart inventory={inventory} />
          </CardContent>
        </Card>

        <Card className="col-span-1 lg:col-span-4 flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <CardTitle>Atividade Recente</CardTitle>
              <CardDescription>Últimas movimentações e alterações de status.</CardDescription>
            </div>
            {canManageUsers(currentUser) && (
              <div className="space-x-2">
                <Button size="sm" asChild variant="outline">
                  <Link to="/arvore">Nova Ferramenta</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link to="/equipes">Gerenciar Equipes</Link>
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent className="flex-1">
            <div className="space-y-4 pt-4">
              {activities.slice(0, 5).map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-4 text-sm group animate-slide-up"
                >
                  <div
                    className={`mt-0.5 rounded-full p-1.5 ${activity.type === 'status_change' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}
                  >
                    {activity.type === 'status_change' ? (
                      <AlertTriangle className="h-3 w-3" />
                    ) : (
                      <Activity className="h-3 w-3" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-foreground leading-snug font-medium">
                      {activity.description}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {formatDistanceToNow(new Date(activity.date), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </p>
                  </div>
                </div>
              ))}
              {activities.length === 0 && (
                <p className="text-sm text-muted-foreground">Nenhuma atividade recente.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon: Icon, trend, critical, warning }: any) {
  return (
    <Card
      className={`overflow-hidden ${critical ? 'border-destructive/50 bg-destructive/5' : warning ? 'border-amber-500/50 bg-amber-500/5' : ''}`}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon
          className={`h-4 w-4 ${critical ? 'text-destructive' : warning ? 'text-amber-500' : 'text-muted-foreground'}`}
        />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend && <p className="text-xs text-muted-foreground mt-1">{trend}</p>}
      </CardContent>
    </Card>
  )
}
