import { Outlet } from 'react-router-dom'
import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from './AppSidebar'
import { Header } from './Header'
import { DataWarningBanner } from './DataWarningBanner'

export default function Layout() {
  return (
    <SidebarProvider>
      <div className="print:hidden h-full">
        <AppSidebar />
      </div>
      <div className="flex min-h-screen w-full flex-col bg-background overflow-hidden print:overflow-visible print:bg-white">
        <Header />
        <DataWarningBanner />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 print:p-0 print:overflow-visible">
          <div className="mx-auto max-w-7xl animate-fade-in print:max-w-none print:w-full print:m-0">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}
