import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { HistoryTab } from './HistoryTab'
import { TeamInventoryTab } from './TeamInventoryTab'
import { ChecklistTab } from './ChecklistTab'
import { TreeReportTab } from './TreeReportTab'

export default function ReportsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="print:hidden">
        <h2 className="text-2xl font-bold tracking-tight">Relatórios Gerenciais</h2>
        <p className="text-muted-foreground">
          Acompanhe o histórico, inventários de equipes, gere auditorias e visualize a árvore
          mercadológica.
        </p>
      </div>

      <Tabs defaultValue="history" className="space-y-4">
        <TabsList className="bg-muted/50 border overflow-x-auto max-w-full justify-start print:hidden">
          <TabsTrigger value="history">Histórico Detalhado</TabsTrigger>
          <TabsTrigger value="team-inventory">Inventário por Equipe</TabsTrigger>
          <TabsTrigger value="checklist">Checklist Surpresa</TabsTrigger>
          <TabsTrigger value="tree">Árvore Mercadológica</TabsTrigger>
        </TabsList>

        <TabsContent
          value="history"
          className="print:m-0 print:block data-[state=inactive]:print:hidden"
        >
          <HistoryTab />
        </TabsContent>
        <TabsContent
          value="team-inventory"
          className="print:m-0 print:block data-[state=inactive]:print:hidden"
        >
          <TeamInventoryTab />
        </TabsContent>
        <TabsContent
          value="checklist"
          className="print:m-0 print:block data-[state=inactive]:print:hidden"
        >
          <ChecklistTab />
        </TabsContent>
        <TabsContent
          value="tree"
          className="print:m-0 print:block data-[state=inactive]:print:hidden"
        >
          <TreeReportTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
