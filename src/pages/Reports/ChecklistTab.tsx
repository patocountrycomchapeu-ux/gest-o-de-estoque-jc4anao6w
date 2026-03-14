import { useState, useMemo } from 'react'
import { useAppStore } from '@/store/AppStore'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Printer } from 'lucide-react'

export function ChecklistTab() {
  const { teams, inventory, getNodePath } = useAppStore()
  const [selectedTeam, setSelectedTeam] = useState<string>(teams[0]?.id || '')

  const teamInventory = useMemo(() => {
    return inventory.filter((i) => i.teamId === selectedTeam)
  }, [inventory, selectedTeam])

  const teamName = teams.find((t) => t.id === selectedTeam)?.name

  return (
    <Card className="animate-slide-up">
      <CardHeader className="bg-muted/30 pb-4 border-b flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
        <div className="w-full max-w-xs space-y-1.5">
          <label className="text-xs font-medium">Selecione a Equipe para o Checklist</label>
          <Select value={selectedTeam} onValueChange={setSelectedTeam}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {teams.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" onClick={() => window.print()}>
          <Printer className="h-4 w-4 mr-2" /> Imprimir para Auditoria
        </Button>
      </CardHeader>
      <CardContent className="p-0 sm:p-6 print:p-0 print:border-none">
        <div className="mb-6 hidden print:block">
          <h2 className="text-2xl font-bold uppercase tracking-tight">
            Checklist de Auditoria Surpresa
          </h2>
          <div className="flex justify-between mt-2 text-sm">
            <p>
              <strong>Equipe Inspecionada:</strong> {teamName}
            </p>
            <p>
              <strong>Data:</strong> ____/____/______
            </p>
            <p>
              <strong>Visto Gestor:</strong> ___________________
            </p>
          </div>
          <hr className="my-4 border-black" />
        </div>

        <div className="border rounded-md print:border-black print:rounded-none">
          <Table className="print:text-xs">
            <TableHeader>
              <TableRow className="print:border-black print:bg-gray-100">
                <TableHead className="w-[150px] print:text-black">Nº Patrimônio</TableHead>
                <TableHead className="print:text-black">Descrição do Item (Marca)</TableHead>
                <TableHead className="w-[80px] text-center border-l print:border-black print:text-black">
                  Presente
                </TableHead>
                <TableHead className="w-[80px] text-center border-l print:border-black print:text-black">
                  Faltando
                </TableHead>
                <TableHead className="w-[80px] text-center border-l print:border-black print:text-black">
                  Emprest.
                </TableHead>
                <TableHead className="w-[250px] border-l print:border-black print:text-black">
                  Observações de Auditoria
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teamInventory.map((item) => {
                const path = getNodePath(item.treeNodeId)
                const name = `${path.find((n) => n.level === 'item')?.name || 'Item'} (${path.find((n) => n.level === 'marca')?.name || '-'})`

                return (
                  <TableRow key={item.id} className="h-14 print:border-black">
                    <TableCell className="font-mono text-xs font-semibold">
                      {item.hasAssetNumber ? item.assetNumber : 'S/N'}
                    </TableCell>
                    <TableCell className="font-medium text-sm">{name}</TableCell>
                    <TableCell className="border-l print:border-black">
                      <div className="w-5 h-5 border-2 border-muted-foreground/40 print:border-black rounded mx-auto"></div>
                    </TableCell>
                    <TableCell className="border-l print:border-black">
                      <div className="w-5 h-5 border-2 border-muted-foreground/40 print:border-black rounded mx-auto"></div>
                    </TableCell>
                    <TableCell className="border-l print:border-black">
                      <div className="w-5 h-5 border-2 border-muted-foreground/40 print:border-black rounded mx-auto"></div>
                    </TableCell>
                    <TableCell className="border-l print:border-black"></TableCell>
                  </TableRow>
                )
              })}
              {teamInventory.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-24 print:border-black">
                    Nenhuma ferramenta alocada para impressão.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
