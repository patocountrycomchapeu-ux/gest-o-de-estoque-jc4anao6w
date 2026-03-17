import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { HistoryTab } from './HistoryTab'
import { AssetHistoryTab } from './AssetHistoryTab'
import { TeamInventoryTab } from './TeamInventoryTab'
import { ChecklistTab } from './ChecklistTab'
import { TreeReportTab } from './TreeReportTab'
import { DamagedTab } from './DamagedTab'
import { RepairReportTab } from './RepairReportTab'

export default function ReportsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="print:hidden">
        <h2 className="text-2xl font-bold tracking-tight">Relatórios Gerenciais</h2>
        <p className="text-muted-foreground">
          Acompanhe o histórico geral, individual, inventários de equipes e gere auditorias.
        </p>
      </div>

      <Tabs defaultValue="history" className="space-y-4">
        <TabsList className="bg-muted/50 border overflow-x-auto max-w-full justify-start print:hidden">
          <TabsTrigger value="history">Histórico Geral</TabsTrigger>
          <TabsTrigger value="asset-history">Histórico Individual</TabsTrigger>
          <TabsTrigger value="team-inventory">Inventário por Equipe</TabsTrigger>
          <TabsTrigger value="checklist">Checklist Surpresa</TabsTrigger>
          <TabsTrigger value="tree">Árvore Mercadológica</TabsTrigger>
          <TabsTrigger value="damaged">Danificados</TabsTrigger>
          <TabsTrigger value="repair">Em Reparo</TabsTrigger>
        </TabsList>

        <TabsContent
          value="history"
          className="print:m-0 print:block data-[state=inactive]:print:hidden"
        >
          <HistoryTab />
        </TabsContent>
        <TabsContent
          value="asset-history"
          className="print:m-0 print:block data-[state=inactive]:print:hidden"
        >
          <AssetHistoryTab />
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
        <TabsContent
          value="damaged"
          className="print:m-0 print:block data-[state=inactive]:print:hidden"
        >
          <DamagedTab />
        </TabsContent>
        <TabsContent
          value="repair"
          className="print:m-0 print:block data-[state=inactive]:print:hidden"
        >
          <RepairReportTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
