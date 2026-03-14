import { useState } from 'react'
import { ChevronRight, Plus, Folder, FileBox, Tag, Wrench, Layers } from 'lucide-react'
import { TreeNode } from '@/types'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface TreeNodeItemProps {
  node: TreeNode
  allNodes: TreeNode[]
  onAddChild: (parentId: string, currentLevel: string) => void
}

const levelIcons: Record<string, any> = {
  marca: Tag,
  departamento: Layers,
  categoria: Folder,
  subcategoria: FileBox,
  item: Wrench,
}

const nextLevel: Record<string, string> = {
  marca: 'departamento',
  departamento: 'categoria',
  categoria: 'subcategoria',
  subcategoria: 'item',
}

export function TreeNodeItem({ node, allNodes, onAddChild }: TreeNodeItemProps) {
  const [isOpen, setIsOpen] = useState(true)
  const children = allNodes.filter((n) => n.parentId === node.id)
  const hasChildren = children.length > 0
  const canAddChild = !!nextLevel[node.level]
  const Icon = levelIcons[node.level] || Folder

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
          <span className="text-sm font-medium">{node.name}</span>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground/50 border border-border px-1.5 py-0.5 rounded-sm ml-2">
            {node.level}
          </span>
        </div>

        {canAddChild && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.stopPropagation()
              onAddChild(node.id, node.level)
            }}
            title={`Adicionar ${nextLevel[node.level]}`}
          >
            <Plus className="h-3 w-3" />
          </Button>
        )}
      </div>

      {isOpen && hasChildren && (
        <div className="ml-5 mt-1 border-l border-border/50 pl-3 space-y-1 animate-slide-down origin-top">
          {children.map((child) => (
            <TreeNodeItem key={child.id} node={child} allNodes={allNodes} onAddChild={onAddChild} />
          ))}
        </div>
      )}
    </div>
  )
}
