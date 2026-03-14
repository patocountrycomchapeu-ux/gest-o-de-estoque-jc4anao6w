import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { HistoryTab } from './HistoryTab'
import { TeamInventoryTab } from './TeamInventoryTab'
import { ChecklistTab } from './ChecklistTab'
import { TreeReportTab } from './TreeReportTab'

export default function ReportsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Relatórios Gerenciais</h2>
        <p className="text-muted-foreground">
          Acompanhe o histórico, inventários de equipes, gere auditorias e visualize a árvore
          mercadológica.
        </p>
      </div>

      <Tabs defaultValue="history" className="space-y-4">
        <TabsList className="bg-muted/50 border overflow-x-auto max-w-full justify-start">
          <TabsTrigger value="history">Histórico Detalhado</TabsTrigger>
          <TabsTrigger value="team-inventory">Inventário por Equipe</TabsTrigger>
          <TabsTrigger value="checklist">Checklist Surpresa</TabsTrigger>
          <TabsTrigger value="tree">Árvore Mercadológica</TabsTrigger>
        </TabsList>

        <TabsContent value="history">
          <HistoryTab />
        </TabsContent>
        <TabsContent value="team-inventory">
          <TeamInventoryTab />
        </TabsContent>
        <TabsContent value="checklist">
          <ChecklistTab />
        </TabsContent>
        <TabsContent value="tree">
          <TreeReportTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
