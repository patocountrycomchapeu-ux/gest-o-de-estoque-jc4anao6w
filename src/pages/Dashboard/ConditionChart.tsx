import { useMemo } from 'react'
import { PieChart, Pie, Cell } from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart'
import { InventoryItem } from '@/types'

const chartConfig = {
  good: { label: 'Bom estado', color: 'hsl(var(--success))' },
  damaged: { label: 'Danificado', color: 'hsl(var(--destructive))' },
  repair: { label: 'Para Reparo', color: 'hsl(var(--warning))' },
} satisfies ChartConfig

export function ConditionChart({ inventory }: { inventory: InventoryItem[] }) {
  const chartData = useMemo(() => {
    const counts = { good: 0, damaged: 0, repair: 0 }
    inventory.forEach((item) => {
      counts[item.condition] += 1
    })
    return [
      { name: 'good', value: counts.good, fill: 'var(--color-good)' },
      { name: 'damaged', value: counts.damaged, fill: 'var(--color-damaged)' },
      { name: 'repair', value: counts.repair, fill: 'var(--color-repair)' },
    ].filter((d) => d.value > 0)
  }, [inventory])

  if (chartData.length === 0)
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground">
        Sem dados de inventário
      </div>
    )

  return (
    <ChartContainer config={chartConfig} className="mx-auto h-[250px]">
      <PieChart>
        <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
        <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={60} strokeWidth={5}>
          {chartData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={chartConfig[entry.name as keyof typeof chartConfig].color}
            />
          ))}
        </Pie>
        <ChartLegend content={<ChartLegendContent />} className="-translate-y-2 flex-wrap gap-2" />
      </PieChart>
    </ChartContainer>
  )
}
