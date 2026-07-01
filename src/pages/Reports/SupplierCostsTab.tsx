import { useEffect, useState } from 'react'
import { apiFetch } from '@/lib/api'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ImageOff } from 'lucide-react'

interface RepairData {
  id: string
  cost: number
  repairDate: string | null
  description: string | null
  itemName: string | null
  patrimonyNumber: string | null
  photoUrl: string | null
}

interface SupplierData {
  id: string
  name: string
  cnpj: string | null
  currentBalance: number
  repairs: RepairData[]
}

export function SupplierCostsTab() {
  const [suppliers, setSuppliers] = useState<SupplierData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [fornData, sdoFornData, repData, estData, prodData, imgData] = await Promise.all([
        apiFetch('/fornecedor').catch(() => []),
        apiFetch('/saldo-fornecedor').catch(() => []),
        apiFetch('/reparo').catch(() => []),
        apiFetch('/estoque').catch(() => []),
        apiFetch('/produto').catch(() => []),
        apiFetch('/imagem-produto').catch(() => []),
      ])

      const formatted: SupplierData[] = (fornData as any[]).map((f) => {
        const balance = (sdoFornData as any[]).find((s) => s.fornecedor_id === f.id)?.saldo || 0
        const repairs: RepairData[] = (repData as any[])
          .filter((r) => r.fornecedor_id === f.id)
          .map((r) => {
            const est = (estData as any[]).find((e) => e.id === r.estoque_id)
            const prod = (prodData as any[]).find((p) => p.id === est?.produto_id)
            const img = (imgData as any[]).find((i) => i.produto_id === prod?.id)
            return {
              id: r.id,
              cost: r.valor_servico || 0,
              repairDate: r.created_at || null,
              description: r.descricao || null,
              itemName: prod?.nome || null,
              patrimonyNumber: est?.numero_patrimonio || null,
              photoUrl: img?.url || null,
            }
          })
          .sort((a, b) => {
            const dA = a.repairDate ? new Date(a.repairDate).getTime() : 0
            const dB = b.repairDate ? new Date(b.repairDate).getTime() : 0
            return dB - dA
          })
        return {
          id: f.id,
          name: f.descricao,
          cnpj: f.email || null,
          currentBalance: balance,
          repairs,
        }
      })
      setSuppliers(formatted)
    } catch (error) {
      console.error('Error fetching supplier costs:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4 animate-fade-in-up">
      <Accordion type="multiple" className="space-y-4">
        {suppliers.map((supplier) => {
          const totalSpent = supplier.repairs.reduce((acc, r) => acc + (r.cost || 0), 0)
          const monthlyCosts = supplier.repairs.reduce(
            (acc, repair) => {
              if (!repair.cost || !repair.repairDate) return acc
              const month = format(new Date(repair.repairDate), 'MMMM yyyy', { locale: ptBR })
              acc[month] = (acc[month] || 0) + repair.cost
              return acc
            },
            {} as Record<string, number>,
          )
          return (
            <AccordionItem
              value={supplier.id}
              key={supplier.id}
              className="border rounded-lg bg-card px-4 shadow-sm"
            >
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full pr-4 gap-4 text-left">
                  <div className="flex flex-col items-start">
                    <span className="font-semibold text-lg">{supplier.name}</span>
                    <span className="text-sm text-muted-foreground">
                      CNPJ: {supplier.cnpj || 'Não informado'}
                    </span>
                  </div>
                  <div className="flex gap-6 items-center text-sm">
                    <div className="flex flex-col items-end">
                      <span className="text-muted-foreground">Saldo Atual</span>
                      <span
                        className={
                          supplier.currentBalance > 0
                            ? 'text-green-600 font-semibold text-base'
                            : 'font-semibold text-base'
                        }
                      >
                        {formatCurrency(supplier.currentBalance)}
                      </span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-muted-foreground">Gasto Total</span>
                      <span className="font-semibold text-base text-destructive">
                        {formatCurrency(totalSpent)}
                      </span>
                    </div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-2 pb-6 border-t">
                {Object.entries(monthlyCosts).length > 0 && (
                  <div className="mb-6 mt-4">
                    <h4 className="text-sm font-medium mb-3 text-muted-foreground">
                      Resumo Mensal de Gastos
                    </h4>
                    <div className="flex gap-2 flex-wrap">
                      {Object.entries(monthlyCosts).map(([month, cost]) => (
                        <Badge
                          key={month}
                          variant="secondary"
                          className="text-sm px-3 py-1.5 flex items-center gap-2 bg-muted/50"
                        >
                          <span className="capitalize text-muted-foreground">{month}:</span>
                          <span className="font-bold text-destructive">{formatCurrency(cost)}</span>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead className="w-[80px]">Foto</TableHead>
                        <TableHead>Equipamento</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Descrição</TableHead>
                        <TableHead className="text-right">Custo</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {supplier.repairs.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                            Nenhum reparo registrado para este fornecedor.
                          </TableCell>
                        </TableRow>
                      ) : (
                        supplier.repairs.map((repair) => (
                          <TableRow key={repair.id}>
                            <TableCell>
                              {repair.photoUrl ? (
                                <img
                                  src={repair.photoUrl}
                                  alt="Item"
                                  className="w-12 h-12 object-cover rounded-md border"
                                />
                              ) : (
                                <div className="w-12 h-12 bg-muted rounded-md border flex items-center justify-center">
                                  <ImageOff className="h-5 w-5 text-muted-foreground/50" />
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">
                                {repair.itemName || 'Item Removido'}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Patrimônio: {repair.patrimonyNumber || 'N/A'}
                              </div>
                            </TableCell>
                            <TableCell>
                              {repair.repairDate
                                ? format(new Date(repair.repairDate), 'dd/MM/yyyy', {
                                    locale: ptBR,
                                  })
                                : '-'}
                            </TableCell>
                            <TableCell
                              className="max-w-[200px] truncate"
                              title={repair.description || ''}
                            >
                              {repair.description || '-'}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {formatCurrency(repair.cost || 0)}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </AccordionContent>
            </AccordionItem>
          )
        })}
        {suppliers.length === 0 && !loading && (
          <div className="text-center py-12 border rounded-lg bg-card text-muted-foreground">
            Nenhum fornecedor cadastrado.
          </div>
        )}
      </Accordion>
    </div>
  )
}
