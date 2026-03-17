import { useState } from 'react'
import { useAppStore } from '@/store/AppStore'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Plus, Wallet } from 'lucide-react'
import { canViewSuppliers, canManageSuppliers } from '@/lib/permissions'
import { Navigate } from 'react-router-dom'

export default function SuppliersPage() {
  const { suppliers, addSupplier, adjustSupplierBalance, currentUser } = useAppStore()
  const [addOpen, setAddOpen] = useState(false)
  const [balanceOpen, setBalanceOpen] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [cnpj, setCnpj] = useState('')
  const [amount, setAmount] = useState('')

  if (!canViewSuppliers(currentUser)) return <Navigate to="/" replace />
  const canManage = canManageSuppliers(currentUser)

  const handleAdd = () => {
    if (!name.trim()) return alert('Nome é obrigatório')
    addSupplier({ name, cnpj })
    setAddOpen(false)
    setName('')
    setCnpj('')
  }

  const handleBalance = () => {
    if (!balanceOpen || !amount) return
    adjustSupplierBalance(balanceOpen, parseFloat(amount))
    setBalanceOpen(null)
    setAmount('')
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Fornecedores e Assistências</h2>
          <p className="text-muted-foreground">
            Gerencie o saldo e os prestadores de serviço de reparo.
          </p>
        </div>
        {canManage && (
          <Button onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> Novo Fornecedor
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead>Nome da Assistência</TableHead>
                <TableHead>CNPJ</TableHead>
                <TableHead className="text-right">Saldo Atual (R$)</TableHead>
                {canManage && <TableHead className="text-right w-[150px]">Ações</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {suppliers.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell className="text-muted-foreground text-xs">{s.cnpj || '-'}</TableCell>
                  <TableCell className="text-right tabular-nums font-semibold text-emerald-700 dark:text-emerald-400">
                    R$ {s.currentBalance.toFixed(2)}
                  </TableCell>
                  {canManage && (
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => setBalanceOpen(s.id)}>
                        <Wallet className="h-4 w-4 mr-2" /> Crédito
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
              {suppliers.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={canManage ? 4 : 3}
                    className="h-24 text-center text-muted-foreground"
                  >
                    Nenhum fornecedor cadastrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={addOpen} onOpenChange={(o) => !o && setAddOpen(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cadastrar Fornecedor</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>CNPJ (Opcional)</Label>
              <Input value={cnpj} onChange={(e) => setCnpj(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAdd}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!balanceOpen} onOpenChange={(o) => !o && setBalanceOpen(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Saldo / Crédito</DialogTitle>
            <DialogDescription>
              Insira o valor em R$ para adicionar ao saldo do fornecedor.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Valor (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBalanceOpen(null)}>
              Cancelar
            </Button>
            <Button onClick={handleBalance}>Adicionar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
