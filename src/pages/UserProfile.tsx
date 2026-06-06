import { useState, useEffect } from 'react'
import { useAppStore } from '@/store/AppStore'
import { useAuth } from '@/hooks/use-auth'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ShieldCheck, User as UserIcon, Mail, Monitor, Moon, Sun } from 'lucide-react'

export default function UserProfile() {
  const { currentUser, updateProfile } = useAppStore()
  const { user } = useAuth()

  const [name, setName] = useState('')
  const [theme, setTheme] = useState('system')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || '')
      setTheme(currentUser.theme || 'system')
    }
  }, [currentUser])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await updateProfile({ name, theme })
    setLoading(false)
  }

  if (!currentUser || !user) return null

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="bg-primary/10 p-3 rounded-full">
          <UserIcon className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Meu Perfil</h1>
          <p className="text-muted-foreground">
            Gerencie suas informações pessoais e preferências do sistema.
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        <Card className="shadow-elevation border-primary/10">
          <form onSubmit={handleSave}>
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
              <CardDescription>
                Atualize seu nome e como o sistema é exibido para você.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={currentUser.email || user.email}
                    disabled
                    className="pl-9 bg-muted"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  O e-mail não pode ser alterado por aqui.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Seu nome"
                    className="pl-9"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="theme">Tema da Interface</Label>
                <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger id="theme">
                    <SelectValue placeholder="Selecione o tema" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">
                      <div className="flex items-center gap-2">
                        <Sun className="w-4 h-4" /> Claro
                      </div>
                    </SelectItem>
                    <SelectItem value="dark">
                      <div className="flex items-center gap-2">
                        <Moon className="w-4 h-4" /> Escuro
                      </div>
                    </SelectItem>
                    <SelectItem value="system">
                      <div className="flex items-center gap-2">
                        <Monitor className="w-4 h-4" /> Sistema
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter className="pt-2">
              <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                {loading ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </CardFooter>
          </form>
        </Card>

        <Card className="shadow-elevation border-primary/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" />
              Nível de Acesso (RBAC)
            </CardTitle>
            <CardDescription>
              Seu perfil determina quais funcionalidades estão disponíveis para você no sistema.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-primary/5 p-4 rounded-lg border border-primary/10 flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-muted-foreground">Perfil Atual</span>
                <span className="font-bold text-primary">{currentUser.role}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-muted-foreground">Status da Conta</span>
                <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                  {currentUser.active ? 'Ativo' : 'Inativo'}
                </span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              Caso precise de mais permissões para executar suas atividades, solicite ao
              administrador do sistema.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
