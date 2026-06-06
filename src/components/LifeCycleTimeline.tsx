import { ToolHistoryEvent } from '@/types'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Activity, ArrowRightLeft, CheckSquare, Wrench, Package } from 'lucide-react'

const getIconForType = (type: ToolHistoryEvent['type']) => {
  switch (type) {
    case 'allocation':
      return <Package className="h-4 w-4 text-blue-500" />
    case 'transfer':
      return <ArrowRightLeft className="h-4 w-4 text-purple-500" />
    case 'audit':
      return <CheckSquare className="h-4 w-4 text-green-500" />
    case 'status_change':
      return <Wrench className="h-4 w-4 text-amber-500" />
    default:
      return <Activity className="h-4 w-4 text-slate-500" />
  }
}

export function LifeCycleTimeline({ events }: { events: ToolHistoryEvent[] }) {
  if (!events.length) {
    return <p className="text-sm text-muted-foreground">Nenhum evento registrado.</p>
  }

  return (
    <div className="space-y-4">
      {events.map((ev, i) => (
        <div key={ev.id} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-full border bg-background shadow-sm">
              {getIconForType(ev.type)}
            </div>
            {i !== events.length - 1 && <div className="w-px h-full bg-border my-2" />}
          </div>
          <div className="pb-6 pt-1 flex-1">
            <p className="text-sm font-semibold">{ev.description}</p>
            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
              <span>
                {format(new Date(ev.date), "dd 'de' MMM, yyyy 'às' HH:mm", { locale: ptBR })}
              </span>
              <span>•</span>
              <span className="font-medium">{ev.user}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
