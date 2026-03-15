import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
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
import { AppProvider, useAppStore } from './store/AppStore'

function ProtectedRoute() {
  const currentUser = useAppStore((s) => s.currentUser)
  if (!currentUser) return <Navigate to="/login" replace />
  return <Outlet />
}

const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<Login />} />
    <Route element={<ProtectedRoute />}>
      <Route element={<Layout />}>
        <Route path="/" element={<Index />} />
        <Route path="/arvore" element={<TreePage />} />
        <Route path="/equipes" element={<TeamsPage />} />
        <Route path="/equipes/:id" element={<TeamDetail />} />
        <Route path="/equipes/:id/auditoria" element={<AuditoriaPage />} />
        <Route path="/reparos" element={<RepairsPage />} />
        <Route path="/relatorios" element={<ReportsPage />} />
      </Route>
    </Route>
    <Route path="*" element={<NotFound />} />
  </Routes>
)

const App = () => (
  <AppProvider>
    <BrowserRouter future={{ v7_startTransition: false, v7_relativeSplatPath: false }}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AppRoutes />
      </TooltipProvider>
    </BrowserRouter>
  </AppProvider>
)

export default App
