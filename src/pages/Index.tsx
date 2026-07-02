import { useMemo } from 'react'
import { useAppStore } from '@/store/AppStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Package, DollarSign, Wrench, AlertTriangle, TrendingUp } from 'lucide-react'
import { ConditionChart } from './Dashboard/ConditionChart'
import { DepartmentChart } from './Dashboard/DepartmentChart'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Link } from 'react-router-dom'

export default function Index() {
  const { kpis, inventory, activities, currentUser, nodes, teams } = useAppStore()

  const deptData = useMemo(() => {
    const deptNodes = nodes.filter((n) => n.level === 'departamento')
    return deptNodes
      .map((d) => {
        const count = inventory
          .filter((item) => {
            let cid: string | null = item.treeNodeId
            while (cid) {
              const node = nodes.find((n) => n.id === cid)
              if (!node) return false
              if (node.id === d.id) return true
              cid = node.parentId
            }
            return false
          })
          .reduce((sum, i) => sum + (i.quantity || 1), 0)
        return { name: d.name, value: count }
      })
      .filter((d) => d.value > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, 8)
  }, [nodes, inventory])

  const recentActivities = activities.slice(0, 8)

  const fmtBRL = (v: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

  const kpiCards = [
    {
      label: 'Total de Ativos',
      value: kpis.totalAssets.toString(),
      icon: Package,
      color: 'text-blue-600',
      bg: 'bg-blue-500/10',
    },
    {
      label: 'Valor Patrimonial',
      value: fmtBRL(kpis.totalValue),
      icon: DollarSign,
      color: 'text-emerald-600',
      bg: 'bg-emerald-500/10',
    },
    {
      label: 'Custo de Reparos',
      value: fmtBRL(kpis.totalRepairCost),
      icon: Wrench,
      color: 'text-amber-600',
      bg: 'bg-amber-500/10',
    },
    {
      label: 'Itens Danificados',
      value: kpis.damagedItems.toString(),
      icon: AlertTriangle,
      color: 'text-red-600',
      bg: 'bg-red-500/10',
    },
  ]

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Bem-vindo, {currentUser?.name}. Visão geral do inventário e operações.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((kpi) => (
          <Card key={kpi.label} className="overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">{kpi.label}</p>
                  <p className="text-2xl font-bold mt-1 tabular-nums">{kpi.value}</p>
                </div>
                <div className={`p-2.5 rounded-lg ${kpi.bg}`}>
                  <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Distribuição por Condição</CardTitle>
          </CardHeader>
          <CardContent>
            <ConditionChart inventory={inventory} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Itens por Departamento</CardTitle>
          </CardHeader>
          <CardContent>
            <DepartmentChart data={deptData} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" /> Atividades Recentes
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {recentActivities.length === 0 ? (
              <p className="text-sm text-muted-foreground p-4 text-center">
                Nenhuma atividade recente.
              </p>
            ) : (
              recentActivities.map((act) => (
                <div key={act.id} className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex h-2 w-2 rounded-full ${
                        act.type === 'allocation'
                          ? 'bg-blue-500'
                          : act.type === 'status_change'
                            ? 'bg-amber-500'
                            : 'bg-slate-400'
                      }`}
                    />
                    <span className="text-sm">{act.description}</span>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                    {act.date
                      ? format(new Date(act.date), 'dd/MM/yyyy HH:mm', { locale: ptBR })
                      : '-'}
                  </span>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {teams.slice(0, 3).map((team) => {
          const teamItems = inventory.filter((i) => i.teamId === team.id)
          const teamValue = teamItems.reduce(
            (acc, i) => acc + (i.price || 0) * (i.quantity || 1),
            0,
          )
          return (
            <Card key={team.id} className="hover:shadow-elevation transition-shadow">
              <CardContent className="p-5">
                <Link to={`/equipes/${team.id}`} className="block">
                  <p className="font-semibold text-sm group-hover:text-primary">{team.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{team.description}</p>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t">
                    <span className="text-xs text-muted-foreground">
                      {teamItems.length} instâncias
                    </span>
                    <span className="text-sm font-bold text-emerald-600 tabular-nums">
                      {fmtBRL(teamValue)}
                    </span>
                  </div>
                </Link>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
