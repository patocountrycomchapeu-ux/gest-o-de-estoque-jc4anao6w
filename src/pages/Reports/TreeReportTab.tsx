import { useMemo } from 'react'
import { useAppStore } from '@/store/AppStore'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { FolderTree, ChevronRight, Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function TreeReportTab() {
  const { nodes, inventory } = useAppStore()

  const treeData = useMemo(() => {
    const counts: Record<string, number> = {}
    inventory.forEach((item) => {
      counts[item.treeNodeId] = (counts[item.treeNodeId] || 0) + (item.quantity || 1)
    })

    const levels = ['marca', 'linha', 'tipo', 'categoria', 'departamento'] as const
    levels.forEach((level) => {
      const levelNodes = nodes.filter((n) => n.level === level)
      levelNodes.forEach((node) => {
        if (node.parentId)
          counts[node.parentId] = (counts[node.parentId] || 0) + (counts[node.id] || 0)
      })
    })
    return counts
  }, [nodes, inventory])

  const renderNode = (parentId: string | null, depth = 0) => {
    const children = nodes.filter((n) => n.parentId === parentId)
    if (children.length === 0) return null

    return (
      <div className="space-y-1">
        {children.map((node) => {
          const count = treeData[node.id] || 0
          if (count === 0 && depth > 0) return null
          let imageSrc = undefined
          if (node.level === 'marca' || node.level === 'linha') {
            const sample = inventory.find(
              (i) =>
                (i.treeNodeId === node.id ||
                  nodes.find((n) => n.id === i.treeNodeId && n.parentId === node.id)) &&
                i.photos?.length > 0,
            )
            imageSrc = sample?.photos?.[0]
          }

          return (
            <div key={node.id} className={`${depth > 0 ? 'ml-4 sm:ml-6' : ''}`}>
              <div className="flex items-center justify-between py-2 px-3 hover:bg-muted/50 rounded-md border border-transparent transition-colors group print:border-b print:border-gray-200 print:rounded-none">
                <div className="flex items-center gap-3">
                  {imageSrc ? (
                    <img
                      src={imageSrc}
                      className="w-6 h-6 rounded-sm object-cover border shadow-sm"
                      alt="Node visual"
                    />
                  ) : depth === 0 ? (
                    <FolderTree className="h-5 w-5 text-primary print:text-black" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground/50 print:text-black" />
                  )}
                  <span
                    className={`text-sm ${depth === 0 ? 'font-bold text-base' : depth === 1 ? 'font-semibold' : depth === 2 ? 'font-medium' : ''}`}
                  >
                    {node.name}
                  </span>
                  <span className="text-[9px] uppercase tracking-widest text-muted-foreground bg-muted print:bg-transparent print:border print:border-gray-300 px-1.5 py-0.5 rounded ml-1">
                    {node.level}
                  </span>
                  {node.isGrouped && (
                    <span className="text-[9px] uppercase tracking-widest text-blue-700 bg-blue-100/50 print:bg-transparent print:border print:border-blue-300 px-1.5 py-0.5 rounded ml-1">
                      Lote
                    </span>
                  )}
                </div>
                <div className="font-mono text-sm bg-primary/10 text-primary px-2.5 py-0.5 rounded-full font-semibold print:bg-transparent print:text-black print:border print:border-black">
                  {count}
                </div>
              </div>
              {renderNode(node.id, depth + 1)}
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <Card className="animate-slide-up print:border-none print:shadow-none break-inside-avoid">
      <CardHeader className="bg-muted/30 pb-4 border-b flex flex-row items-start justify-between print:hidden">
        <div>
          <CardTitle className="text-lg">Estrutura de Quantidades</CardTitle>
          <CardDescription>
            Visualize as instâncias agrupadas hierarquicamente nos 5 níveis obrigatórios.
          </CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={() => window.print()}>
          <Printer className="w-4 h-4 mr-2" /> Imprimir (PDF)
        </Button>
      </CardHeader>
      <div className="hidden print:block mb-6 pt-4">
        <h2 className="text-2xl font-bold uppercase tracking-tight">
          Mapa da Árvore Mercadológica
        </h2>
        <p className="text-sm text-gray-600">
          Representação visual e quantitativa do inventário atual.
        </p>
        <hr className="my-4 border-black" />
      </div>
      <CardContent className="p-2 sm:p-6 print:p-0">
        <div className="bg-card border rounded-lg p-2 shadow-sm print:border-none print:shadow-none print:p-0">
          {renderNode(null)}
        </div>
      </CardContent>
    </Card>
  )
}
