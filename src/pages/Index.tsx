import { useMemo } from 'react'
import { useAppStore } from '@/store/AppStore'
import { canManageUsers } from '@/lib/permissions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity, Package, DollarSign, TrendingDown, Wrench, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { ConditionChart } from './Dashboard/ConditionChart'
import { DepartmentChart } from './Dashboard/DepartmentChart'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function Index() {
  const { inventory, activities, currentUser, checklists, getNodePath, transfers } = useAppStore()

  const kpis = useMemo(() => {
    let value = 0
    let maint = 0
    let itemsInRepair = 0

    inventory.forEach((i) => {
      value += (i.price || 0) * (i.quantity || 1)
      maint += i.repairCost || 0
      if (i.condition === 'repair' || i.status === 'in_maintenance') {
        itemsInRepair += i.quantity || 1
      }
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

    const recentTransfers = transfers.filter((t) => new Date(t.initiatedAt) >= thirtyDaysAgo).length

    return { value, maint, lossRate, itemsInRepair, recentTransfers }
  }, [inventory, checklists, transfers])

  const inventoryByDepartment = useMemo(() => {
    const deptTotals: Record<string, number> = {}

    inventory.forEach((item) => {
      const path = getNodePath(item.treeNodeId)
      const dept = path.find((n: any) => n.level === 'departamento')
      if (dept) {
        deptTotals[dept.name] = (deptTotals[dept.name] || 0) + (item.quantity || 1)
      } else {
        deptTotals['Outros'] = (deptTotals['Outros'] || 0) + (item.quantity || 1)
      }
    })

    return Object.entries(deptTotals)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5)
  }, [inventory, getNodePath])

  // Critical stock alerts (e.g. low quantity items)
  const criticalItems = useMemo(() => {
    return inventory
      .filter((i) => !i.hasAssetNumber && (i.quantity || 0) > 0 && (i.quantity || 0) < 5)
      .slice(0, 5)
  }, [inventory])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Visão geral e indicadores de desempenho do seu inventário.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Valor do Inventário"
          value={`R$ ${kpis.value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={DollarSign}
          trend="Capital alocado em estoque"
        />
        <StatCard
          title="Itens em Manutenção"
          value={kpis.itemsInRepair}
          icon={Wrench}
          trend="Aguardando reparo"
          warning={kpis.itemsInRepair > 0}
        />
        <StatCard
          title="Taxa de Perda (30d)"
          value={`${kpis.lossRate.toFixed(1)}%`}
          icon={TrendingDown}
          critical={kpis.lossRate > 5}
          trend="Discrepâncias em auditorias"
        />
        <StatCard
          title="Rotatividade (30d)"
          value={kpis.recentTransfers}
          icon={Package}
          trend="Transferências realizadas"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-1 lg:col-span-3 flex flex-col">
          <CardHeader>
            <CardTitle>Distribuição de Estado</CardTitle>
            <CardDescription>Visão geral das condições físicas dos itens.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-2">
            <ConditionChart inventory={inventory} />
          </CardContent>
        </Card>

        <Card className="col-span-1 lg:col-span-4 flex flex-col">
          <CardHeader>
            <CardTitle>Ativos por Departamento</CardTitle>
            <CardDescription>Top 5 departamentos com maior volume de itens.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <DepartmentChart data={inventoryByDepartment} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        <Card className="col-span-1 flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <CardTitle>Atividade Recente</CardTitle>
              <CardDescription>Últimas movimentações e alterações.</CardDescription>
            </div>
            {canManageUsers(currentUser) && (
              <div className="space-x-2">
                <Button size="sm" asChild variant="outline">
                  <Link to="/arvore-mercadologica">Nova Ferramenta</Link>
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
                    className={`mt-0.5 rounded-full p-1.5 ${activity.type === 'status_change' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'}`}
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

        <Card className="col-span-1 flex flex-col">
          <CardHeader>
            <CardTitle>Alertas de Estoque Crítico</CardTitle>
            <CardDescription>
              Lotes com quantidade muito baixa (abaixo de 5 unidades).
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="space-y-4 pt-4">
              {criticalItems.map((item) => {
                const path = getNodePath(item.treeNodeId)
                const itemName = path[path.length - 1]?.name || 'Item desconhecido'
                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-4 text-sm group animate-slide-up bg-destructive/5 p-3 rounded-md border border-destructive/10"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-destructive/20 text-destructive p-1.5 rounded-full">
                        <AlertTriangle className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{itemName}</p>
                        <p className="text-xs text-muted-foreground">
                          Nó: {item.treeNodeId.substring(0, 8)}...
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-destructive text-lg">{item.quantity} un</p>
                    </div>
                  </div>
                )
              })}
              {criticalItems.length === 0 && (
                <div className="flex flex-col items-center justify-center h-32 text-center text-muted-foreground space-y-2">
                  <div className="bg-success/10 text-success p-3 rounded-full">
                    <Package className="h-6 w-6" />
                  </div>
                  <p>
                    Estoque estabilizado.
                    <br />
                    Nenhum alerta crítico no momento.
                  </p>
                </div>
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
      className={`overflow-hidden transition-all duration-300 ${critical ? 'border-destructive/50 bg-destructive/5' : warning ? 'border-amber-500/50 bg-amber-500/5 dark:border-amber-500/30 dark:bg-amber-500/10' : ''}`}
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
