import { Link, useLocation } from 'react-router-dom'
import { Home, Users, FolderTree, Package, BarChart3 } from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from '@/components/ui/sidebar'

const navItems = [
  { title: 'Dashboard', icon: Home, url: '/' },
  { title: 'Árvore Mercadológica', icon: FolderTree, url: '/arvore' },
  { title: 'Gestão de Equipes', icon: Users, url: '/equipes' },
  { title: 'Relatórios', icon: BarChart3, url: '/relatorios' },
]

export function AppSidebar() {
  const location = useLocation()

  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarHeader className="flex h-16 items-center justify-center border-b border-sidebar-border/50">
        <div className="flex items-center gap-2 font-bold tracking-tight text-sidebar-primary-foreground">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-accent-foreground shadow-sm">
            <Package className="h-5 w-5" />
          </div>
          <span className="group-data-[collapsible=icon]:hidden text-lg">Estoque.Pro</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent className="pt-4">
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={
                      location.pathname === item.url ||
                      (item.url !== '/' && location.pathname.startsWith(item.url))
                    }
                  >
                    <Link to={item.url} className="font-medium">
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
