import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Download, FileText, FileSpreadsheet } from 'lucide-react'
import { useAppStore } from '@/store/AppStore'
import { HistoryTab } from './HistoryTab'
import { AssetHistoryTab } from './AssetHistoryTab'
import { TeamInventoryTab } from './TeamInventoryTab'
import { ChecklistTab } from './ChecklistTab'
import { TreeReportTab } from './TreeReportTab'
import { DamagedTab } from './DamagedTab'
import { RepairReportTab } from './RepairReportTab'
import { SupplierCostsTab } from './SupplierCostsTab'

export default function ReportsPage() {
  const { inventory, nodes, teams, suppliers } = useAppStore()

  const generateExportData = () => {
    return inventory.map((item) => {
      let currentId = item.treeNodeId
      const path = []
      while (currentId) {
        const node = nodes.find((n) => n.id === currentId)
        if (node) {
          path.unshift(node)
          currentId = node.parentId || ''
        } else {
          break
        }
      }
      const tipo = path.find((n) => n.level === 'tipo')?.name || '-'
      const funcao = path.find((n) => n.level === 'funcao')?.name || '-'
      const especificacao = path.find((n) => n.level === 'especificacao')?.name || '-'
      const itemName = path.find((n) => n.level === 'item')?.name || '-'
      const marca = path.find((n) => n.level === 'marca')?.name || '-'
      const team = teams.find((t) => t.id === item.teamId)?.name || 'Sem Equipe'
      const supplier = suppliers.find((s) => s.id === item.supplierId)?.name || '-'

      return {
        Patrimônio: item.hasAssetNumber ? item.assetNumber : `Lote (${item.quantity})`,
        Tipo: tipo,
        Função: funcao,
        Especificação: especificacao,
        Item: itemName,
        Marca: marca,
        Equipe: team,
        Condição: item.condition,
        Status: item.status || '-',
        Preço: item.price || 0,
        'Categoria Avaria': item.conditionCategory || '-',
        'Custo Reparo': item.repairCost || 0,
        'Fornecedor Reparo': supplier,
        Imagem: item.photos?.[0] || 'Sem imagem',
      }
    })
  }

  const exportCSV = () => {
    const data = generateExportData()
    if (data.length === 0) return
    const headers = Object.keys(data[0])
    const csvRows = [
      headers.join(','),
      ...data.map((row) =>
        headers
          .map((fieldName) => JSON.stringify(row[fieldName as keyof typeof row] || ''))
          .join(','),
      ),
    ]
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `inventario_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  const exportXLSX = () => {
    const data = generateExportData()
    if (data.length === 0) return
    const headers = Object.keys(data[0])

    const tableHtml = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head><meta charset="UTF-8"></head>
      <body>
        <table border="1">
          <thead><tr>${headers.map((h) => `<th style="background-color: #f3f4f6;">${h}</th>`).join('')}</tr></thead>
          <tbody>
            ${data
              .map(
                (row) =>
                  `<tr>${headers
                    .map((h) => {
                      const val = row[h as keyof typeof row] || ''
                      if (h === 'Imagem' && val !== 'Sem imagem') {
                        return `<td><img src="${val}" width="60" height="60" /></td>`
                      }
                      return `<td>${val}</td>`
                    })
                    .join('')}</tr>`,
              )
              .join('')}
          </tbody>
        </table>
      </body>
      </html>
    `
    const blob = new Blob([tableHtml], { type: 'application/vnd.ms-excel' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `inventario_${new Date().toISOString().split('T')[0]}.xls`
    link.click()
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="print:hidden flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Relatórios Gerenciais</h2>
          <p className="text-muted-foreground">
            Acompanhe o histórico geral, individual, inventários de equipes e gere auditorias.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={exportCSV}>
            <FileText className="w-4 h-4 mr-2" /> CSV
          </Button>
          <Button variant="outline" size="sm" onClick={exportXLSX}>
            <FileSpreadsheet className="w-4 h-4 mr-2" /> Excel
          </Button>
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Download className="w-4 h-4 mr-2" /> PDF
          </Button>
        </div>
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
          <TabsTrigger value="supplier-costs">Gastos em Fornecedores</TabsTrigger>
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
        <TabsContent
          value="supplier-costs"
          className="print:m-0 print:block data-[state=inactive]:print:hidden"
        >
          <SupplierCostsTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
