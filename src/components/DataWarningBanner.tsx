import { useState, useEffect } from 'react'
import { AlertTriangle, X } from 'lucide-react'

export function DataWarningBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const dismissed = localStorage.getItem('data_warning_dismissed')
    if (!dismissed) setVisible(true)
  }, [])

  const handleDismiss = () => {
    localStorage.setItem('data_warning_dismissed', 'true')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 flex items-center justify-between gap-2 print:hidden animate-fade-in">
      <div className="flex items-center gap-2 text-xs text-amber-700 dark:text-amber-400">
        <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
        <span>
          <strong>Modo de demonstração:</strong> Os dados são temporários até a conexão com o banco
          de dados (Supabase ou Skip Cloud).
        </span>
      </div>
      <button
        onClick={handleDismiss}
        className="text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-200 transition-colors"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}
