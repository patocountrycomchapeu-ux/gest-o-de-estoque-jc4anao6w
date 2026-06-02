import { useState, useMemo } from 'react'
import { ChevronRight, Plus, Folder, FileBox, Tag, Wrench, Layers } from 'lucide-react'
import { TreeNode } from '@/types'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store/AppStore'

const levelIcons: Record<string, any> = {
  departamento: Layers,
  categoria: Folder,
  linha: FileBox,
  tipo: Wrench,
  marca: Tag,
  produto: FileBox,
}

const nextLevel: Record<string, string> = {
  departamento: 'categoria',
  categoria: 'linha',
  linha: 'tipo',
  tipo: 'marca',
  marca: 'produto',
}

export function TreeNodeItem({ node, allNodes, onAddChild }: any) {
  const [isOpen, setIsOpen] = useState(false)
  const { inventory } = useAppStore()

  const children = allNodes.filter((n: any) => n.parentId === node.id)
  const hasChildren = children.length > 0
  const canAddChild = !!nextLevel[node.level]
  const Icon = levelIcons[node.level] || Folder

  const quantity = useMemo(() => {
    const getQty = (nId: string): number => {
      const directItems = inventory.filter((i: any) => i.treeNodeId === nId)
      const direct = directItems.reduce((sum: number, i: any) => sum + (i.quantity || 1), 0)
      const childNodes = allNodes.filter((n: any) => n.parentId === nId)
      return direct + childNodes.reduce((sum: number, child: any) => sum + getQty(child.id), 0)
    }
    return getQty(node.id)
  }, [node.id, inventory, allNodes])

  return (
    <div className="flex flex-col select-none">
      <div
        className={cn(
          'group flex items-center justify-between rounded-md py-2 px-2 hover:bg-muted/50 transition-colors',
          !isOpen && 'opacity-90',
        )}
      >
        <div
          className="flex items-center gap-2 cursor-pointer flex-1"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="w-5 flex justify-center">
            {hasChildren ? (
              <ChevronRight
                className={cn(
                  'h-4 w-4 text-muted-foreground transition-transform duration-200',
                  isOpen && 'rotate-90',
                )}
              />
            ) : (
              <div className="w-4 h-4" />
            )}
          </div>
          <Icon className="h-4 w-4 text-muted-foreground/70" />
          <span className="text-sm font-medium text-foreground">{node.name}</span>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground/50 border border-border px-1.5 py-0.5 rounded-sm ml-2">
            {node.level}
          </span>
          {node.isGrouped && (
            <span className="ml-2 bg-blue-100/50 text-blue-700 text-[9px] uppercase tracking-widest px-1.5 py-0.5 rounded-sm border border-blue-200">
              Lote
            </span>
          )}
          {quantity > 0 && (
            <span className="ml-2 bg-primary/10 text-primary text-[10px] px-2 py-0.5 rounded-full font-mono font-semibold">
              {quantity}
            </span>
          )}
        </div>
        {canAddChild && onAddChild && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.stopPropagation()
              onAddChild(node.id, node.level)
            }}
          >
            <Plus className="h-3 w-3" />
          </Button>
        )}
      </div>
      {isOpen && hasChildren && (
        <div className="ml-5 mt-1 border-l border-border/50 pl-3 space-y-1 animate-slide-down origin-top">
          {children.map((child: any) => (
            <TreeNodeItem key={child.id} node={child} allNodes={allNodes} onAddChild={onAddChild} />
          ))}
        </div>
      )}
    </div>
  )
}
