import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { ThemeProvider } from 'next-themes'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import Layout from './components/Layout'
import NotFound from './pages/NotFound'
import Login from './pages/Login'
import Index from './pages/Index'
import TreePage from './pages/Tree/Index'
import TeamsPage from './pages/Teams/Index'
import TeamDetail from './pages/Teams/TeamDetail'
import AuditoriaPage from './pages/Teams/Auditoria'
import ReportsPage from './pages/Reports/Index'
import RepairsPage from './pages/Repairs/Index'
import SuppliersPage from './pages/Suppliers/Index'
import ConfigPage from './pages/Config/Index'
import ItemsPage from './pages/Items/Index'
import { AppProvider, useAppStore } from './store/AppStore'
import { AuthProvider, useAuth } from './hooks/use-auth'
import {
  canViewTree,
  canViewTeams,
  canViewRepairs,
  canViewSuppliers,
  canManageUsers,
} from '@/lib/permissions'

function ProtectedRoute() {
  const { user, loading } = useAuth()
  const { currentUser, isStoreLoading } = useAppStore()

  if (loading || isStoreLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user || !currentUser) return <Navigate to="/login" replace />

  return <Outlet />
}

function RoleRoute({ accessCheck }: { accessCheck: (user: any) => boolean }) {
  const { currentUser } = useAppStore()
  if (!accessCheck(currentUser)) return <Navigate to="/" replace />
  return <Outlet />
}

const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<Login />} />
    <Route element={<ProtectedRoute />}>
      <Route element={<Layout />}>
        <Route path="/" element={<Index />} />
        <Route element={<RoleRoute accessCheck={canViewTree} />}>
          <Route path="/arvore-mercadologica" element={<TreePage />} />
          <Route path="/itens" element={<ItemsPage />} />
        </Route>
        <Route element={<RoleRoute accessCheck={canViewTeams} />}>
          <Route path="/equipes" element={<TeamsPage />} />
          <Route path="/equipes/:id" element={<TeamDetail />} />
          <Route path="/equipes/:id/auditoria" element={<AuditoriaPage />} />
        </Route>
        <Route element={<RoleRoute accessCheck={canViewRepairs} />}>
          <Route path="/reparos" element={<RepairsPage />} />
        </Route>
        <Route element={<RoleRoute accessCheck={canViewSuppliers} />}>
          <Route path="/fornecedores" element={<SuppliersPage />} />
        </Route>
        <Route path="/relatorios" element={<ReportsPage />} />
        <Route element={<RoleRoute accessCheck={canManageUsers} />}>
          <Route path="/configuracoes" element={<ConfigPage />} />
        </Route>
      </Route>
    </Route>
    <Route path="*" element={<NotFound />} />
  </Routes>
)

const AppWithAuth = () => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <AppProvider authUser={user}>
      <BrowserRouter future={{ v7_startTransition: false, v7_relativeSplatPath: false }}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AppRoutes />
        </TooltipProvider>
      </BrowserRouter>
    </AppProvider>
  )
}

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
    <AuthProvider>
      <AppWithAuth />
    </AuthProvider>
  </ThemeProvider>
)

export default App
