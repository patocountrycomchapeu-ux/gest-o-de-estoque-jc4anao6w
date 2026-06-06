import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Package, ShieldAlert, Mail, Lock, User, CheckCircle2, ArrowLeft } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

type ViewMode = 'login' | 'register' | 'forgot-password'

export default function Login() {
  const { signIn, signUp, resetPassword, resendConfirmationEmail, user } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [view, setView] = useState<ViewMode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [rememberMe, setRememberMe] = useState(true)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [loading, setLoading] = useState(false)

  if (user) return <Navigate to="/" replace />

  const isEmailNotConfirmed =
    error.toLowerCase().includes('email not confirmed') ||
    error.toLowerCase().includes('e-mail não confirmado') ||
    error.toLowerCase().includes('not verified')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccessMsg('')

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      setError('Por favor, informe um email válido.')
      return
    }

    setLoading(true)

    if (view === 'login') {
      if (!password) {
        setError('Por favor, informe sua senha.')
        setLoading(false)
        return
      }
      const { error: err } = await signIn(email, password)
      if (err) {
        setError(
          err.message === 'Email not confirmed'
            ? 'Seu e-mail ainda não foi confirmado.'
            : err.message,
        )
      } else {
        localStorage.setItem('estoque_pro_remember', rememberMe.toString())
        navigate('/')
      }
    } else if (view === 'register') {
      if (!password) {
        setError('Por favor, informe sua senha.')
        setLoading(false)
        return
      }
      if (!name) {
        setError('Nome é obrigatório')
        setLoading(false)
        return
      }
      const { error: err } = await signUp(email, password, name)
      if (err) {
        setError(err.message)
      } else {
        const msg = 'Conta criada com sucesso! Verifique seu e-mail para confirmar o cadastro.'
        setSuccessMsg(msg)
        toast({ title: 'Conta criada', description: msg })
        setView('login')
        setPassword('')
      }
    } else if (view === 'forgot-password') {
      const { error: err } = await resetPassword(email)
      if (err) {
        setError(err.message)
      } else {
        setSuccessMsg('Link de recuperação enviado para o seu e-mail.')
        toast({
          title: 'Recuperação de Senha',
          description: 'Link de recuperação enviado para o seu e-mail.',
        })
        setView('login')
      }
    }
    setLoading(false)
  }

  const handleResendConfirmation = async () => {
    setLoading(true)
    setError('')
    const { error: err } = await resendConfirmationEmail(email)
    setLoading(false)
    if (err) {
      setError(err.message)
    } else {
      setSuccessMsg('E-mail de confirmação reenviado com sucesso!')
      toast({ title: 'E-mail reenviado', description: 'Verifique sua caixa de entrada.' })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-sm shadow-elevation border-primary/10 animate-slide-up">
        <CardHeader className="space-y-3 text-center pb-6">
          <div className="mx-auto bg-primary/10 w-16 h-16 flex items-center justify-center rounded-full mb-2">
            <Package className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Estoque.Pro</CardTitle>
          <CardDescription>
            {view === 'login' && 'Acesse sua conta para continuar.'}
            {view === 'register' && 'Crie sua conta de acesso.'}
            {view === 'forgot-password' && 'Recupere o acesso à sua conta.'}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md flex flex-col gap-2 font-medium">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
                {isEmailNotConfirmed && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleResendConfirmation}
                    disabled={loading}
                    className="w-full mt-1 border-destructive/30 hover:bg-destructive/10 text-destructive"
                  >
                    Reenviar e-mail de confirmação
                  </Button>
                )}
              </div>
            )}
            {successMsg && view === 'login' && (
              <div className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-sm p-3 rounded-md flex items-start gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" /> {successMsg}
              </div>
            )}

            {view === 'register' && (
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Seu nome completo"
                    className="pl-9"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="usuario@estoque.pro"
                  className="pl-9"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {view !== 'forgot-password' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Senha</Label>
                  {view === 'login' && (
                    <Button
                      type="button"
                      variant="link"
                      className="px-0 py-0 h-auto text-xs font-normal text-muted-foreground hover:text-primary"
                      onClick={() => {
                        setView('forgot-password')
                        setError('')
                        setSuccessMsg('')
                      }}
                    >
                      Esqueci minha senha
                    </Button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-9"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            {view === 'login' && (
              <div className="flex items-center space-x-2 pt-1">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(c) => setRememberMe(c as boolean)}
                />
                <Label
                  htmlFor="remember"
                  className="text-sm font-normal text-muted-foreground cursor-pointer"
                >
                  Manter conectado
                </Label>
              </div>
            )}
          </CardContent>
          <CardFooter className="pt-2 flex flex-col gap-2">
            <Button type="submit" className="w-full font-medium h-11" disabled={loading}>
              {loading ? (
                <Skeleton className="h-5 w-24 bg-primary-foreground/20" />
              ) : view === 'login' ? (
                'Entrar'
              ) : view === 'register' ? (
                'Criar Conta'
              ) : (
                'Enviar Link'
              )}
            </Button>

            {view === 'forgot-password' ? (
              <Button
                type="button"
                variant="ghost"
                className="w-full text-sm"
                onClick={() => {
                  setView('login')
                  setError('')
                  setSuccessMsg('')
                }}
              >
                <ArrowLeft className="w-4 h-4 mr-2" /> Voltar para o Login
              </Button>
            ) : (
              <Button
                type="button"
                variant="ghost"
                className="w-full text-sm"
                onClick={() => {
                  setView(view === 'login' ? 'register' : 'login')
                  setError('')
                  setSuccessMsg('')
                }}
              >
                {view === 'login' ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Entrar'}
              </Button>
            )}
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
