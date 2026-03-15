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
import { Package, ShieldAlert } from 'lucide-react'

export default function Login() {
  const { login } = useAppStore()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const success = login(email, password)
    if (success) {
      navigate('/')
    } else {
      setError('Credenciais inválidas. Tente novamente.')
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
          <CardDescription>Insira suas credenciais para acessar o sistema.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md flex items-center gap-2 font-medium">
                <ShieldAlert className="w-4 h-4" /> {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Usuário</Label>
              <Input
                id="email"
                type="text"
                placeholder="admin"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="username"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
          </CardContent>
          <CardFooter className="pt-2">
            <Button type="submit" className="w-full font-medium h-11">
              Acessar Sistema
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
