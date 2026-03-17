import { useAppStore } from '@/store/AppStore'
import { ShieldCheck, Menu, LogOut, User as UserIcon } from 'lucide-react'
import { useSidebar } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

export function Header() {
  const { currentUser, logout } = useAppStore()
  const { toggleSidebar, isMobile } = useSidebar()

  if (!currentUser) return null

  return (
    <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b bg-background px-4 shadow-sm animate-fade-in print:hidden">
      <div className="flex items-center gap-2">
        {isMobile && (
          <Button variant="ghost" size="icon" onClick={toggleSidebar}>
            <Menu className="h-5 w-5" />
          </Button>
        )}
        <h1 className="font-semibold hidden sm:block text-lg tracking-tight text-foreground/90">
          Painel de Gestão
        </h1>
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center text-xs font-medium text-muted-foreground bg-muted px-2.5 py-1.5 rounded-md border border-border/50">
          <ShieldCheck className="h-3.5 w-3.5 mr-1.5 text-emerald-600" /> Papel: {currentUser.role}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative h-9 rounded-full px-2 gap-2 hover:bg-muted/60"
            >
              <span className="hidden md:inline-block text-sm font-medium">{currentUser.name}</span>
              <Avatar className="h-7 w-7 border border-primary/20">
                <AvatarFallback className="bg-primary/10 text-primary text-xs uppercase">
                  {currentUser.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{currentUser.name}</p>
                <p className="text-xs leading-none text-muted-foreground">{currentUser.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <UserIcon className="mr-2 h-4 w-4 text-muted-foreground" /> Perfil
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="text-destructive focus:bg-destructive/10">
              <LogOut className="mr-2 h-4 w-4" /> Sair do Sistema
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
