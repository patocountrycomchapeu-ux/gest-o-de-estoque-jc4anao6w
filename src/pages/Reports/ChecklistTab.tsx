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
import { Printer, Camera } from 'lucide-react'

export function ChecklistTab() {
  const { teams, inventory, getNodePath } = useAppStore()
  const [selectedTeam, setSelectedTeam] = useState<string>(teams[0]?.id || '')

  const teamInventory = useMemo(() => {
    return inventory.filter((i) => i.teamId === selectedTeam)
  }, [inventory, selectedTeam])

  const teamName = teams.find((t) => t.id === selectedTeam)?.name

  return (
    <Card className="animate-slide-up print:border-none print:shadow-none">
      <CardHeader className="bg-muted/30 pb-4 border-b flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 print:hidden">
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
        <Button variant="default" onClick={() => window.print()}>
          <Printer className="h-4 w-4 mr-2" /> Imprimir para Auditoria
        </Button>
      </CardHeader>
      <CardContent className="p-0 sm:p-6 print:p-0 print:border-none">
        <div className="mb-6 hidden print:block">
          <h2 className="text-2xl font-bold uppercase tracking-tight">
            Checklist de Auditoria Visual
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
          <hr className="my-4 border-black border-2" />
        </div>

        <div className="border rounded-md print:border-black print:rounded-none">
          <Table className="print:text-xs">
            <TableHeader>
              <TableRow className="print:border-black print:bg-gray-100">
                <TableHead className="w-16 text-center print:text-black">Foto</TableHead>
                <TableHead className="w-[150px] print:text-black">Nº Patrimônio</TableHead>
                <TableHead className="print:text-black">Descrição do Item (Marca)</TableHead>
                <TableHead className="w-[70px] text-center border-l print:border-black print:text-black leading-tight p-1">
                  Presente
                </TableHead>
                <TableHead className="w-[70px] text-center border-l print:border-black print:text-black leading-tight p-1">
                  Faltando
                </TableHead>
                <TableHead className="w-[70px] text-center border-l print:border-black print:text-black leading-tight p-1">
                  Emprest.
                </TableHead>
                <TableHead className="w-[200px] border-l print:border-black print:text-black">
                  Observações
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teamInventory.map((item) => {
                const path = getNodePath(item.treeNodeId)
                const name = `${path.find((n) => n.level === 'item')?.name || 'Item'} (${path.find((n) => n.level === 'marca')?.name || '-'})`
                const photoUrl = item.photos?.[0]

                return (
                  <TableRow key={item.id} className="h-16 print:border-black">
                    <TableCell className="p-1 align-middle text-center">
                      {photoUrl ? (
                        <img
                          src={photoUrl}
                          className="w-12 h-12 mx-auto rounded object-cover border border-black/20 print:border-black"
                          alt="Item"
                        />
                      ) : (
                        <div className="w-12 h-12 mx-auto border border-dashed flex items-center justify-center print:border-black">
                          <Camera className="w-4 h-4 text-muted-foreground/40 print:text-black/50" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-xs font-bold align-middle">
                      {item.hasAssetNumber ? item.assetNumber : 'S/N'}
                    </TableCell>
                    <TableCell className="font-medium text-sm align-middle">{name}</TableCell>
                    <TableCell className="border-l print:border-black align-middle">
                      <div className="w-5 h-5 border-2 border-muted-foreground/40 print:border-black rounded-sm mx-auto"></div>
                    </TableCell>
                    <TableCell className="border-l print:border-black align-middle">
                      <div className="w-5 h-5 border-2 border-muted-foreground/40 print:border-black rounded-sm mx-auto"></div>
                    </TableCell>
                    <TableCell className="border-l print:border-black align-middle">
                      <div className="w-5 h-5 border-2 border-muted-foreground/40 print:border-black rounded-sm mx-auto"></div>
                    </TableCell>
                    <TableCell className="border-l print:border-black"></TableCell>
                  </TableRow>
                )
              })}
              {teamInventory.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center h-24 print:border-black">
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
