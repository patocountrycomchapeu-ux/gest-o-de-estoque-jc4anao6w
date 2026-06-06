import { useState, useMemo, useEffect, useRef, memo } from 'react'
import { ChevronRight, Plus, Folder, FileBox, Tag, Wrench, Layers } from 'lucide-react'
import { TreeNode } from '@/types'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store/AppStore'
import { useNavigate, useSearchParams } from 'react-router-dom'

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
  categoria: 'tipo',
  tipo: 'linha',
  linha: 'marca',
  marca: 'produto',
}

export const TreeNodeItem = memo(function TreeNodeItem({
  node,
  allNodes,
  onAddChild,
  searchActive,
}: any) {
  const [searchParams] = useSearchParams()
  const urlNodeId = searchParams.get('node')

  const [isOpen, setIsOpen] = useState(false)
  const { inventory } = useAppStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (searchActive || urlNodeId === node.id) {
      setIsOpen(true)
    }
  }, [searchActive, urlNodeId, node.id])

  const children = useMemo(
    () => allNodes.filter((n: any) => n.parentId === node.id),
    [allNodes, node.id],
  )
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

  // Lazy loading using native IntersectionObserver
  const [isVisible, setIsVisible] = useState(false)
  const nodeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: '200px' },
    )
    if (nodeRef.current) observer.observe(nodeRef.current)
    return () => observer.disconnect()
  }, [])

  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsOpen(!isOpen)
    const newParams = new URLSearchParams(searchParams)
    newParams.set('node', node.id)
    navigate(`?${newParams.toString()}`, { replace: true })
  }

  if (!isVisible) {
    return <div ref={nodeRef} className="h-10 w-full animate-pulse bg-muted/10 rounded-md my-1" />
  }

  const isSelected = urlNodeId === node.id

  return (
    <div ref={nodeRef} className="flex flex-col select-none">
      <div
        className={cn(
          'group flex items-center justify-between rounded-md py-2 px-2 hover:bg-muted/50 transition-colors',
          !isOpen && 'opacity-90',
          isSelected && 'bg-primary/5 border border-primary/20',
        )}
      >
        <div className="flex items-center gap-2 cursor-pointer flex-1" onClick={handleSelect}>
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
          <Icon
            className={cn('h-4 w-4', isSelected ? 'text-primary' : 'text-muted-foreground/70')}
          />
          <span
            className={cn(
              'text-sm font-medium',
              isSelected ? 'text-primary font-semibold' : 'text-foreground',
            )}
          >
            {node.name}
          </span>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground/50 border border-border px-1.5 py-0.5 rounded-sm ml-2">
            {node.level}
          </span>
          {node.isGrouped && (
            <span className="ml-2 bg-blue-100/50 text-blue-700 text-[9px] uppercase tracking-widest px-1.5 py-0.5 rounded-sm border border-blue-200">
              Lote
            </span>
          )}
          {quantity > 0 && (
            <span
              className={cn(
                'ml-2 text-[10px] px-2 py-0.5 rounded-full font-mono font-semibold',
                isSelected ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary',
              )}
            >
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
            <TreeNodeItem
              key={child.id}
              node={child}
              allNodes={allNodes}
              onAddChild={onAddChild}
              searchActive={searchActive}
            />
          ))}
        </div>
      )}
    </div>
  )
})
