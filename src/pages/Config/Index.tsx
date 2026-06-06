import { useState, useEffect } from 'react'
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
import { supabase } from '@/lib/supabase/client'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { format } from 'date-fns'

export default function ConfigPage() {
  const { users, currentUser, toggleUserStatus, updateUserRole } = useAppStore()
  const { theme, setTheme } = useTheme()
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteName, setInviteName] = useState('')
  const [inviteRole, setInviteRole] = useState<string>('Visualizador')
  const [isInviting, setIsInviting] = useState(false)

  const [logs, setLogs] = useState<any[]>([])
  const [isLoadingLogs, setIsLoadingLogs] = useState(false)

  const fetchLogs = async () => {
    setIsLoadingLogs(true)
    const { data } = await supabase
      .from('logs_acesso')
      .select('*, usuarios(nome, email)')
      .order('data_hora', { ascending: false })
      .limit(100)
    if (data) setLogs(data)
    setIsLoadingLogs(false)
  }

  useEffect(() => {
    if (canManageUsers(currentUser)) {
      fetchLogs()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!canManageUsers(currentUser)) return <Navigate to="/" replace />

  const handleThemeChange = async (c: boolean) => {
    const t = c ? 'dark' : 'light'
    setTheme(t)
    if (currentUser) {
      await supabase.from('usuarios').update({ tema: t }).eq('id', currentUser.id)
    }
  }

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteEmail || !inviteName) return toast.error('Preencha os campos obrigatórios')

    setIsInviting(true)
    try {
      const { error } = await supabase.functions.invoke('invite-user', {
        body: { email: inviteEmail, name: inviteName, role: inviteRole },
      })
      if (error) throw error
      toast.success('Convite enviado com sucesso!')
      setInviteEmail('')
      setInviteName('')
    } catch (err: any) {
      console.error(err)
      toast.error('Erro ao enviar convite: ' + err.message)
    } finally {
      setIsInviting(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Painel de Configuração</h2>
        <p className="text-muted-foreground">
          Gerencie acessos de usuários, auditoria e preferências do sistema.
        </p>
      </div>

      <Tabs defaultValue="usuarios" className="w-full">
        <TabsList className="mb-4 flex flex-wrap h-auto gap-1">
          <TabsTrigger value="usuarios">Gestão de Usuários</TabsTrigger>
          <TabsTrigger value="convites">Convites</TabsTrigger>
          <TabsTrigger value="logs">Logs de Acesso</TabsTrigger>
          <TabsTrigger value="preferencias">Preferências</TabsTrigger>
        </TabsList>

        <TabsContent value="usuarios" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gestão de Usuários</CardTitle>
              <CardDescription>
                Ative, inative ou altere o papel de cada usuário no sistema.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow>
                    <TableHead>Nome / Email</TableHead>
                    <TableHead>Papel (Role)</TableHead>
                    <TableHead className="w-[150px]">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u: any) => (
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
                            <SelectItem value="Gerente">Gerente</SelectItem>
                            <SelectItem value="Supervisor">Supervisor</SelectItem>
                            <SelectItem value="Encarregado Gestor">Encarregado Gestor</SelectItem>
                            <SelectItem value="Encarregado">Encarregado</SelectItem>
                            <SelectItem value="Analista">Analista</SelectItem>
                            <SelectItem value="Membro Comum">Membro Comum</SelectItem>
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
        </TabsContent>

        <TabsContent value="convites">
          <Card>
            <CardHeader>
              <CardTitle>Convidar Usuário</CardTitle>
              <CardDescription>
                Envie um e-mail de convite para que novos membros acessem o sistema.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleInvite} className="space-y-4 max-w-sm">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nome Completo</label>
                  <Input
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                    placeholder="João Silva"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">E-mail</label>
                  <Input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="joao@empresa.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Perfil de Acesso</label>
                  <Select value={inviteRole} onValueChange={setInviteRole}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Gestor">Gestor</SelectItem>
                      <SelectItem value="Gerente">Gerente</SelectItem>
                      <SelectItem value="Supervisor">Supervisor</SelectItem>
                      <SelectItem value="Encarregado Gestor">Encarregado Gestor</SelectItem>
                      <SelectItem value="Encarregado">Encarregado</SelectItem>
                      <SelectItem value="Analista">Analista</SelectItem>
                      <SelectItem value="Membro Comum">Membro Comum</SelectItem>
                      <SelectItem value="Visualizador">Visualizador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" disabled={isInviting} className="w-full">
                  {isInviting ? 'Enviando...' : 'Enviar Convite'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Logs de Acesso</CardTitle>
                <CardDescription>Auditoria de segurança e acessos ao sistema.</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={fetchLogs} disabled={isLoadingLogs}>
                Atualizar
              </Button>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow>
                    <TableHead>Data/Hora</TableHead>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Ação</TableHead>
                    <TableHead>Dispositivo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                        Nenhum log encontrado.
                      </TableCell>
                    </TableRow>
                  ) : (
                    logs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="text-xs whitespace-nowrap">
                          {log.data_hora
                            ? format(new Date(log.data_hora), 'dd/MM/yyyy HH:mm')
                            : '-'}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-sm">
                            {log.usuarios?.nome || 'Desconhecido'}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {log.usuarios?.email || 'N/A'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                            {log.acao}
                          </span>
                        </TableCell>
                        <TableCell
                          className="text-xs text-muted-foreground max-w-[200px] truncate"
                          title={log.user_agent}
                        >
                          <span className="opacity-70">
                            {log.user_agent?.substring(0, 45) || 'N/A'}...
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferencias">
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
                <Switch checked={theme === 'dark'} onCheckedChange={handleThemeChange} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
