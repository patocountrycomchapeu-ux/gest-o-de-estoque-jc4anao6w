import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
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

type Repair = {
  id: string
  cost: number | null
  repair_date: string | null
  description: string | null
  assets: {
    item: string | null
    patrimony_number: string | null
    photos: any
  } | null
}

type SupplierWithRepairs = {
  id: string
  name: string
  cnpj: string | null
  current_balance: number | null
  repairs: Repair[]
}

export function SupplierCostsTab() {
  const [suppliers, setSuppliers] = useState<SupplierWithRepairs[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('repair_suppliers')
        .select(`
          id,
          name,
          cnpj,
          current_balance,
          repairs (
            id,
            cost,
            repair_date,
            description,
            assets (
              item,
              patrimony_number,
              photos
            )
          )
        `)
        .order('name')

      if (error) throw error

      const formattedData = (data as any[]).map((supplier) => ({
        ...supplier,
        repairs: (supplier.repairs || []).sort((a: any, b: any) => {
          const dateA = a.repair_date ? new Date(a.repair_date).getTime() : 0
          const dateB = b.repair_date ? new Date(b.repair_date).getTime() : 0
          return dateB - dateA
        }),
      }))

      setSuppliers(formattedData)
    } catch (error) {
      console.error('Error fetching supplier costs:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const getPhotoUrl = (photos: any) => {
    if (Array.isArray(photos) && photos.length > 0 && typeof photos[0] === 'string') {
      return photos[0]
    }
    return null
  }

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
              if (!repair.cost || !repair.repair_date) return acc
              const month = format(new Date(repair.repair_date), 'MMMM yyyy', { locale: ptBR })
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
                          (supplier.current_balance || 0) > 0
                            ? 'text-green-600 font-semibold text-base'
                            : 'font-semibold text-base'
                        }
                      >
                        {formatCurrency(supplier.current_balance || 0)}
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
                        supplier.repairs.map((repair) => {
                          const photoUrl = getPhotoUrl(repair.assets?.photos)
                          return (
                            <TableRow key={repair.id}>
                              <TableCell>
                                {photoUrl ? (
                                  <img
                                    src={photoUrl}
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
                                  {repair.assets?.item || 'Item Removido'}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  Patrimônio: {repair.assets?.patrimony_number || 'N/A'}
                                </div>
                              </TableCell>
                              <TableCell>
                                {repair.repair_date
                                  ? format(new Date(repair.repair_date), 'dd/MM/yyyy', {
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
                          )
                        })
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
