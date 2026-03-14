import { useAppStore } from '@/store/AppStore'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ShieldAlert, Menu } from 'lucide-react'
import { useSidebar } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'

export function Header() {
  const { users, currentUser, setCurrentUser } = useAppStore()
  const { toggleSidebar, isMobile } = useSidebar()

  return (
    <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b bg-background px-4 shadow-sm animate-fade-in">
      <div className="flex items-center gap-2">
        {isMobile && (
          <Button variant="ghost" size="icon" onClick={toggleSidebar}>
            <Menu className="h-5 w-5" />
          </Button>
        )}
        <h1 className="font-semibold hidden sm:block text-lg tracking-tight">Painel de Gestão</h1>
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center text-xs font-medium text-muted-foreground bg-muted px-2.5 py-1.5 rounded-md border border-border/50">
          <ShieldAlert className="h-3.5 w-3.5 mr-1.5 text-primary" /> Visualizando como:
        </div>
        <Select value={currentUser?.id} onValueChange={setCurrentUser}>
          <SelectTrigger className="w-[200px] h-9 text-xs font-medium border-primary/20 bg-primary/5 focus:ring-primary/30">
            <SelectValue placeholder="Selecione um usuário" />
          </SelectTrigger>
          <SelectContent>
            {users.map((u) => (
              <SelectItem key={u.id} value={u.id} className="text-xs">
                {u.name} <span className="text-muted-foreground ml-1">({u.role})</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </header>
  )
}
