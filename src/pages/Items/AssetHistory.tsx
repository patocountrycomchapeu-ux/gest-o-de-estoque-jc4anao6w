import { useParams, Link, Navigate } from 'react-router-dom'
import { useAppStore } from '@/store/AppStore'
import { LifeCycleTimeline } from '@/components/LifeCycleTimeline'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { AlertTriangle, ArrowLeft, Wrench, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function AssetHistory() {
  const { id } = useParams()
  const { inventory, history, getNodePath } = useAppStore()

  const item = inventory.find((i) => i.id === id)
  const itemHistory = history
    .filter((h) => h.inventoryId === id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  if (!item) return <Navigate to="/itens" replace />

  const path = getNodePath(item.treeNodeId)
  const itemName = path.find((n) => n.level === 'item' || n.level === 'produto')?.name || 'Item'

  // Cálculos para Gestão Inteligente de Reparos
  const totalRepairCost = item.repairCost || 0
  const newItemValue = item.price || 0
  const roiExceeded = newItemValue > 0 && totalRepairCost > newItemValue * 0.5

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in pb-12">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild className="rounded-full bg-muted/50">
          <Link to="/itens">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Histórico de Ativo</h2>
          <p className="text-muted-foreground">{itemName}</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-500" /> Detalhes do Ativo
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Patrimônio</p>
                <p className="font-mono font-medium">
                  {item.hasAssetNumber ? item.assetNumber : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Status Atual</p>
                <div
                  className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold ${
                    item.condition === 'good'
                      ? 'bg-primary text-primary-foreground border-transparent'
                      : item.condition === 'repair'
                        ? 'bg-secondary text-secondary-foreground border-transparent'
                        : 'bg-destructive text-destructive-foreground border-transparent'
                  }`}
                >
                  {item.condition === 'good'
                    ? 'Em Bom Estado'
                    : item.condition === 'repair'
                      ? 'Em Manutenção'
                      : 'Danificado'}
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Valor do Item Novo</p>
                <p className="font-medium text-emerald-600">
                  {newItemValue > 0 ? `R$ ${newItemValue.toFixed(2)}` : 'Não informado'}
                </p>
              </div>
              {item.photos && item.photos.length > 0 && (
                <div className="sm:col-span-2 mt-2">
                  <p className="text-sm text-muted-foreground mb-2">Imagens do Ativo</p>
                  <div className="flex gap-2 flex-wrap">
                    {item.photos.map((url, idx) => (
                      <img
                        key={idx}
                        src={url}
                        alt={`Foto ${idx + 1}`}
                        className="h-20 w-20 object-cover rounded-md border shadow-sm"
                      />
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Timeline de Vida do Item</CardTitle>
              <CardDescription>Rastreabilidade de todos os eventos deste ativo</CardDescription>
            </CardHeader>
            <CardContent>
              <LifeCycleTimeline events={itemHistory} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-amber-500" /> Gestão de Reparos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Custo Acumulado de Manutenção</p>
                <p className="text-2xl font-bold">R$ {totalRepairCost.toFixed(2)}</p>
              </div>

              {newItemValue > 0 && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-2">
                    Indicador de Substituição (ROI)
                  </p>
                  <div className="w-full bg-secondary h-2 rounded-full overflow-hidden mb-2">
                    <div
                      className={`h-full ${roiExceeded ? 'bg-red-500' : 'bg-emerald-500'}`}
                      style={{ width: `${Math.min(100, (totalRepairCost / newItemValue) * 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Custo de reparo representa{' '}
                    <span className="font-semibold">
                      {((totalRepairCost / newItemValue) * 100).toFixed(1)}%
                    </span>{' '}
                    do valor de um novo.
                  </p>

                  {roiExceeded && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md flex gap-2 text-red-800">
                      <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                      <div className="text-xs font-medium">
                        Atenção: O custo de manutenção ultrapassou 50% do valor do item. Considere a
                        substituição deste ativo.
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
