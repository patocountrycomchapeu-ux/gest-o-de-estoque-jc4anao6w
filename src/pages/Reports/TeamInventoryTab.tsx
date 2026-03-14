import { useMemo } from 'react'
import { useAppStore } from '@/store/AppStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { isAdmin } from '@/lib/permissions'

const conditionLabels: Record<string, string> = {
  good: 'Bom estado',
  damaged: 'Danificado',
  repair: 'Em Reparo',
}

export function TeamInventoryTab() {
  const { teams, inventory, getNodePath, currentUser } = useAppStore()
  const isMasterAdmin = isAdmin(currentUser)

  const grouped = useMemo(() => {
    return teams.map((team) => {
      const items = inventory.filter((i) => i.teamId === team.id)
      const totalValue = items.reduce((acc, curr) => acc + (curr.price || 0), 0)
      return { team, items, totalValue }
    })
  }, [teams, inventory])

  return (
    <div className="space-y-6 animate-slide-up">
      {grouped.map(({ team, items, totalValue }) => (
        <Card key={team.id}>
          <CardHeader className="bg-muted/30 pb-4 border-b flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg">{team.name}</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                {items.length} instâncias alocadas
              </p>
            </div>
            {isMasterAdmin && (
              <div className="text-sm font-semibold bg-emerald-100/80 text-emerald-800 px-4 py-2 rounded-md border border-emerald-200">
                Valor Total (BRL): R$ {totalValue.toFixed(2)}
              </div>
            )}
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nº Patrimônio</TableHead>
                  <TableHead>Item Base</TableHead>
                  <TableHead>Marca</TableHead>
                  <TableHead>Status / Condição</TableHead>
                  {isMasterAdmin && <TableHead className="text-right">Valor Unit. (R$)</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => {
                  const path = getNodePath(item.treeNodeId)
                  const marca = path.find((n) => n.level === 'marca')?.name || '-'
                  const itemName = path.find((n) => n.level === 'item')?.name || 'Item'

                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-mono text-xs font-medium">
                        {item.hasAssetNumber ? (
                          item.assetNumber
                        ) : (
                          <span className="text-muted-foreground italic">Sem Patrimônio</span>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{itemName}</TableCell>
                      <TableCell className="text-muted-foreground">{marca}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider ${
                            item.condition === 'good'
                              ? 'bg-emerald-100 text-emerald-800'
                              : item.condition === 'damaged'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {conditionLabels[item.condition]}
                        </span>
                      </TableCell>
                      {isMasterAdmin && (
                        <TableCell className="text-right tabular-nums text-muted-foreground">
                          {item.price ? item.price.toFixed(2) : '0.00'}
                        </TableCell>
                      )}
                    </TableRow>
                  )
                })}
                {items.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={isMasterAdmin ? 5 : 4}
                      className="text-center h-20 text-muted-foreground"
                    >
                      Nenhum item alocado nesta equipe.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
