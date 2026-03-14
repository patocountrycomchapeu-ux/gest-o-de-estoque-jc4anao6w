import { useMemo } from 'react'
import { useAppStore } from '@/store/AppStore'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { FolderTree, ChevronRight } from 'lucide-react'

export function TreeReportTab() {
  const { nodes, inventory } = useAppStore()

  const treeData = useMemo(() => {
    const counts: Record<string, number> = {}

    inventory.forEach((item) => {
      counts[item.treeNodeId] = (counts[item.treeNodeId] || 0) + 1
    })

    const levels = ['marca', 'item', 'categoria', 'secao', 'departamento'] as const
    levels.forEach((level) => {
      const levelNodes = nodes.filter((n) => n.level === level)
      levelNodes.forEach((node) => {
        if (node.parentId) {
          counts[node.parentId] = (counts[node.parentId] || 0) + (counts[node.id] || 0)
        }
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

          return (
            <div key={node.id} className={`${depth > 0 ? 'ml-6' : ''}`}>
              <div className="flex items-center justify-between py-2 px-3 hover:bg-muted/50 rounded-md border border-transparent transition-colors group">
                <div className="flex items-center gap-2">
                  {depth === 0 ? (
                    <FolderTree className="h-4 w-4 text-primary" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
                  )}
                  <span
                    className={`text-sm ${depth === 0 ? 'font-bold' : depth === 1 ? 'font-semibold' : depth === 2 ? 'font-medium' : ''}`}
                  >
                    {node.name}
                  </span>
                  <span className="text-[9px] uppercase tracking-widest text-muted-foreground bg-muted px-1.5 py-0.5 rounded ml-2">
                    {node.level}
                  </span>
                </div>
                <div className="font-mono text-sm bg-primary/10 text-primary px-2.5 py-0.5 rounded-full font-semibold">
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
    <Card className="animate-slide-up">
      <CardHeader className="bg-muted/30 pb-4 border-b">
        <CardTitle className="text-lg">Estrutura de Quantidades</CardTitle>
        <CardDescription>
          Visualize as instâncias agrupadas hierarquicamente (Categoria &gt; Item &gt; Marca).
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        <div className="bg-card border rounded-lg p-2 shadow-sm">{renderNode(null)}</div>
      </CardContent>
    </Card>
  )
}
