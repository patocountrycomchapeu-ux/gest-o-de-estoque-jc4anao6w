import { Link, useLocation } from 'react-router-dom'
import { useAppStore } from '@/store/AppStore'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
} from '@/components/ui/sidebar'
import {
  Activity,
  FolderTree,
  Users,
  Wrench,
  FileText,
  Settings,
  Truck,
  Package,
} from 'lucide-react'
import {
  canViewTree,
  canViewTeams,
  canViewRepairs,
  canViewSuppliers,
  canViewReports,
  canManageUsers,
} from '@/lib/permissions'

export function AppSidebar() {
  const location = useLocation()
  const { currentUser } = useAppStore()

  return (
    <Sidebar>
      <SidebarHeader className="h-16 flex items-center px-4 border-b">
        <div className="flex items-center gap-2 font-bold text-lg text-primary">
          <Package className="w-6 h-6" />
          Estoque.Pro
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={location.pathname === '/'}>
                <Link to="/">
                  <Activity /> Dashboard
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            {canViewTree(currentUser) && (
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location.pathname.startsWith('/arvore')}>
                  <Link to="/arvore">
                    <FolderTree /> Árvore Mercadológica
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}

            {canViewTeams(currentUser) && (
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location.pathname.startsWith('/equipes')}>
                  <Link to="/equipes">
                    <Users /> Equipes & Ativos
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}

            {canViewRepairs(currentUser) && (
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location.pathname.startsWith('/reparos')}>
                  <Link to="/reparos">
                    <Wrench /> Reparos
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}

            {canViewSuppliers(currentUser) && (
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location.pathname.startsWith('/fornecedores')}>
                  <Link to="/fornecedores">
                    <Truck /> Fornecedores
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}

            {canViewReports(currentUser) && (
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location.pathname.startsWith('/relatorios')}>
                  <Link to="/relatorios">
                    <FileText /> Relatórios
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}

            {canManageUsers(currentUser) && (
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={location.pathname.startsWith('/configuracoes')}
                >
                  <Link to="/configuracoes">
                    <Settings /> Configurações
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
