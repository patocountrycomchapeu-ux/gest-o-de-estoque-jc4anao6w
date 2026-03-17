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
import { Package, ShieldAlert, Mail, Lock, User, CheckCircle2 } from 'lucide-react'

export default function Login() {
  const { signIn, signUp, user } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [loading, setLoading] = useState(false)

  if (user) return <Navigate to="/" replace />

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccessMsg('')
    setLoading(true)

    if (isLogin) {
      const { error: err } = await signIn(email, password)
      if (err) setError(err.message)
      else navigate('/')
    } else {
      if (!name) {
        setError('Nome é obrigatório')
        setLoading(false)
        return
      }
      const { error: err } = await signUp(email, password, name)
      if (err) setError(err.message)
      else {
        const msg = 'Conta criada com sucesso! Verifique seu e-mail para confirmar o cadastro.'
        setSuccessMsg(msg)
        toast({
          title: 'Conta criada',
          description: msg,
        })
        setIsLogin(true)
        setPassword('')
      }
    }
    setLoading(false)
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
            {isLogin ? 'Acesse sua conta para continuar.' : 'Crie sua conta de acesso.'}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md flex items-center gap-2 font-medium">
                <ShieldAlert className="w-4 h-4" /> {error}
              </div>
            )}
            {successMsg && isLogin && (
              <div className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-sm p-3 rounded-md flex items-start gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" /> {successMsg}
              </div>
            )}
            {!isLogin && (
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
                    required={!isLogin}
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
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
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
          </CardContent>
          <CardFooter className="pt-2 flex flex-col gap-2">
            <Button type="submit" className="w-full font-medium h-11" disabled={loading}>
              {loading ? 'Aguarde...' : isLogin ? 'Entrar' : 'Criar Conta'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full text-sm"
              onClick={() => {
                setIsLogin(!isLogin)
                setError('')
                setSuccessMsg('')
              }}
            >
              {isLogin ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Entrar'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
