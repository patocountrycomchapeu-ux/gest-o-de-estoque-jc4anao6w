import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from '@/components/ui/chart'

const chartConfig = {
  value: { label: 'Quantidade', color: 'hsl(var(--primary))' },
} satisfies ChartConfig

export function DepartmentChart({ data }: { data: { name: string; value: number }[] }) {
  if (data.length === 0)
    return (
      <div className="h-full min-h-[250px] flex items-center justify-center text-muted-foreground">
        Sem dados por departamento
      </div>
    )

  return (
    <ChartContainer config={chartConfig} className="w-full h-[250px]">
      <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} vertical={true} opacity={0.3} />
        <XAxis type="number" hide />
        <YAxis
          dataKey="name"
          type="category"
          width={120}
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
        />
        <ChartTooltip cursor={{ fill: 'var(--muted)' }} content={<ChartTooltipContent />} />
        <Bar dataKey="value" fill="var(--color-value)" radius={[0, 4, 4, 0]} maxBarSize={40} />
      </BarChart>
    </ChartContainer>
  )
}
