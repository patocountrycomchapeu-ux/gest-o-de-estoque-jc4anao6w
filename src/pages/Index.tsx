import { useMemo } from 'react'
import { useAppStore } from '@/store/AppStore'
import { canManageUsers } from '@/lib/permissions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity, Package, DollarSign, TrendingDown, Wrench } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { ConditionChart } from './Dashboard/ConditionChart'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function Index() {
  const { inventory, activities, currentUser, checklists } = useAppStore()

  const totalUsable = inventory.filter((i) => i.condition === 'good').length

  const kpis = useMemo(() => {
    let value = 0
    let maint = 0
    inventory.forEach((i) => {
      value += (i.price || 0) * (i.quantity || 1)
      maint += i.repairCost || 0
    })

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const recentChecklists = checklists.filter((c) => new Date(c.date) >= thirtyDaysAgo)

    let totalDisc = 0
    let totalChecked = 0
    recentChecklists.forEach((c) => {
      totalDisc += c.discrepancies || 0
      totalChecked += c.totalChecked || 0
    })

    const lossRate = totalChecked > 0 ? (totalDisc / totalChecked) * 100 : 0

    return { value, maint, lossRate }
  }, [inventory, checklists])

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total de Instâncias (Uso)"
          value={totalUsable}
          icon={Package}
          trend="Itens em bom estado"
        />
        <StatCard
          title="Valor do Patrimônio"
          value={`R$ ${kpis.value.toFixed(2)}`}
          icon={DollarSign}
          trend="Valor total alocado"
        />
        <StatCard
          title="Taxa de Perda (30d)"
          value={`${kpis.lossRate.toFixed(1)}%`}
          icon={TrendingDown}
          critical={kpis.lossRate > 5}
          trend="Discrepâncias em auditorias"
        />
        <StatCard
          title="Custo de Manutenção"
          value={`R$ ${kpis.maint.toFixed(2)}`}
          icon={Wrench}
          warning={kpis.maint > 0}
          trend="Total gasto em reparos"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-1 lg:col-span-3">
          <CardHeader>
            <CardTitle>Distribuição de Estado</CardTitle>
            <CardDescription>Visão geral das condições do inventário.</CardDescription>
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
                    <Activity className="h-3 w-3" />
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
