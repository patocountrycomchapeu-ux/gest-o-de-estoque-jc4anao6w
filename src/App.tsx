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
import AssetHistory from './pages/Items/AssetHistory'
import UpdatePassword from './pages/UpdatePassword'
import UserProfile from './pages/UserProfile'
import { AppProvider, useAppStore } from './store/AppStore'
import { AuthProvider, useAuth } from './hooks/use-auth'
import { Skeleton } from '@/components/ui/skeleton'
import {
  canViewTree,
  canViewTeams,
  canViewRepairs,
  canViewSuppliers,
  canManageUsers,
} from '@/lib/permissions'

function AuthSkeleton() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-sm space-y-6 flex flex-col items-center animate-pulse">
        <Skeleton className="h-16 w-16 rounded-full" />
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-[300px] w-full rounded-xl" />
      </div>
    </div>
  )
}

function AppSkeleton() {
  return (
    <div className="flex h-screen w-full flex-col bg-background">
      <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b bg-background px-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="hidden sm:block h-7 w-24" />
          <Skeleton className="h-9 w-9 rounded-full" />
        </div>
      </header>
      <div className="flex flex-1 overflow-hidden">
        <aside className="hidden w-64 flex-col border-r bg-muted/20 p-4 sm:flex">
          <Skeleton className="h-10 w-full mb-6" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-8 w-5/6" />
            <Skeleton className="h-8 w-full" />
          </div>
        </aside>
        <main className="flex-1 p-6 space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
          </div>
          <Skeleton className="h-64 w-full rounded-xl" />
        </main>
      </div>
    </div>
  )
}

function ProtectedRoute() {
  const { user, loading } = useAuth()
  const { currentUser, isStoreLoading } = useAppStore()

  if (loading || isStoreLoading) {
    return <AppSkeleton />
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
    <Route path="/update-password" element={<UpdatePassword />} />
    <Route element={<ProtectedRoute />}>
      <Route element={<Layout />}>
        <Route path="/" element={<Index />} />
        <Route element={<RoleRoute accessCheck={canViewTree} />}>
          <Route path="/arvore-mercadologica" element={<TreePage />} />
          <Route path="/itens" element={<ItemsPage />} />
          <Route path="/itens/:id/historico" element={<AssetHistory />} />
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
        <Route path="/perfil" element={<UserProfile />} />
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
    const isAuthRoute =
      window.location.pathname === '/login' || window.location.pathname === '/update-password'
    return isAuthRoute ? <AuthSkeleton /> : <AppSkeleton />
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
