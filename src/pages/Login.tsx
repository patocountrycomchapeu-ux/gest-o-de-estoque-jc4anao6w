import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '@/store/AppStore'
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
import { Package, ShieldAlert, Mail, KeyRound } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

export default function Login() {
  const { login, verifyOtp } = useAppStore()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setError('')
    login(email)
    setStep(2)
    toast({ title: 'Código enviado!', description: 'Use o código 123456 para acessar.' })
  }

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const result = verifyOtp(email, otp)
    if (result === 'success') {
      navigate('/')
    } else if (result === 'inactive') {
      setError('Sua conta está inativa. Contate o administrador.')
    } else {
      setError('Código inválido. Tente 123456.')
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
            {step === 1
              ? 'Acesse com seu email de trabalho.'
              : 'Insira o código de verificação recebido.'}
          </CardDescription>
        </CardHeader>
        {step === 1 ? (
          <form onSubmit={handleEmailSubmit}>
            <CardContent className="space-y-4">
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
                    autoComplete="username"
                    autoFocus
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-2">
              <Button type="submit" className="w-full font-medium h-11">
                Receber Código
              </Button>
            </CardFooter>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md flex items-center gap-2 font-medium">
                  <ShieldAlert className="w-4 h-4" /> {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="otp">Código de Acesso</Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="otp"
                    type="text"
                    placeholder="123456"
                    className="pl-9 font-mono text-center tracking-widest text-lg"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-2 flex flex-col gap-2">
              <Button type="submit" className="w-full font-medium h-11">
                Validar Acesso
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full text-sm"
                onClick={() => setStep(1)}
              >
                Voltar
              </Button>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  )
}
