import { useAppStore } from '@/store/AppStore'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { useTheme } from 'next-themes'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Role } from '@/types'
import { canManageUsers } from '@/lib/permissions'
import { Navigate } from 'react-router-dom'

export default function ConfigPage() {
  const { users, currentUser, toggleUserStatus, updateUserRole } = useAppStore()
  const { theme, setTheme } = useTheme()

  if (!canManageUsers(currentUser)) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Painel de Configuração</h2>
        <p className="text-muted-foreground">
          Gerencie acessos de usuários e preferências do sistema.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Preferências do Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 border rounded-md bg-muted/20">
            <div>
              <div className="font-medium text-sm">Modo Escuro Global</div>
              <div className="text-xs text-muted-foreground">
                Alterne a aparência do sistema entre tema claro e escuro.
              </div>
            </div>
            <Switch
              checked={theme === 'dark'}
              onCheckedChange={(c) => setTheme(c ? 'dark' : 'light')}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Gestão de Usuários</CardTitle>
          <CardDescription>
            Ative, inative ou altere o papel de cada usuário no sistema.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead>Nome / Email</TableHead>
                <TableHead>Papel (Role)</TableHead>
                <TableHead className="w-[150px]">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>
                    <div className="font-medium text-sm">{u.name}</div>
                    <div className="text-xs text-muted-foreground">{u.email}</div>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={u.role}
                      onValueChange={(v) => updateUserRole(u.id, v as Role)}
                      disabled={u.id === currentUser?.id}
                    >
                      <SelectTrigger className="w-[180px] h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Gestor">Gestor</SelectItem>
                        <SelectItem value="Encarregado Gestor">Encarregado Gestor</SelectItem>
                        <SelectItem value="Encarregado">Encarregado</SelectItem>
                        <SelectItem value="Analista">Analista</SelectItem>
                        <SelectItem value="Visualizador">Visualizador</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={u.active}
                        onCheckedChange={() => toggleUserStatus(u.id)}
                        disabled={u.id === currentUser?.id}
                      />
                      <span
                        className={`text-xs font-medium ${u.active ? 'text-emerald-600' : 'text-muted-foreground'}`}
                      >
                        {u.active ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
