import { Search, User } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useLocation } from 'react-router-dom'

const routeNames: Record<string, string> = {
  '/': 'Dashboard',
  '/arvore': 'Árvore Mercadológica',
  '/equipes': 'Gestão de Equipes',
}

export function Header() {
  const location = useLocation()
  const title =
    routeNames[location.pathname] ||
    (location.pathname.startsWith('/equipes/') ? 'Detalhes da Equipe' : 'Sistema')

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <h1 className="text-lg font-semibold text-foreground hidden sm:block">{title}</h1>
      </div>

      <div className="flex flex-1 items-center justify-end gap-4 sm:flex-none">
        <div className="relative hidden max-w-sm flex-1 sm:block">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar ferramentas..."
            className="pl-8 bg-muted/50 focus-visible:bg-background transition-colors"
          />
        </div>
        <Avatar className="h-9 w-9 border border-border">
          <AvatarImage src="https://img.usecurling.com/ppl/thumbnail?gender=female" alt="User" />
          <AvatarFallback>
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}
