'use client'

import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from 'recharts'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'

// Define the exact data shape
interface StudentBloomChartProps {
  data: { [key: string]: number } | undefined
}

const chartConfig = {
  score: {
    label: 'Score',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig

export function StudentBloomChart({ data }: StudentBloomChartProps) {
  // Transform dictionary { "remembering": 80 } to array [{ level: "Remembering", score: 80 }]
  const chartData = data
    ? Object.entries(data).map(([level, score]) => ({
        bloom_level: level.charAt(0).toUpperCase() + level.slice(1), // Capitalize
        score: score,
      }))
    : []

  // Ensure standard order for Radar chart readability
  const order = ['Remembering', 'Understanding', 'Applying', 'Analyzing', 'Evaluating', 'Creating']
  chartData.sort((a, b) => order.indexOf(a.bloom_level) - order.indexOf(b.bloom_level))

  return (
    <Card className='flex flex-col'>
      <CardHeader className='items-center pb-0'>
        <CardTitle>Cognitive Profile</CardTitle>
        <CardDescription>Performance by Bloom's Taxonomy</CardDescription>
      </CardHeader>
      <CardContent className='flex-1 pb-0'>
        {chartData.length > 0 ? (
          <ChartContainer
            config={chartConfig}
            className='mx-auto aspect-square max-h-[300px]'
          >
            <RadarChart data={chartData} outerRadius={90}>
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <PolarGrid />
              <PolarAngleAxis dataKey='bloom_level' />
              <Radar
                dataKey='score'
                fill='var(--color-score)'
                fillOpacity={0.5}
                stroke='var(--color-score)'
                strokeWidth={2}
              />
            </RadarChart>
          </ChartContainer>
        ) : (
          <div className="flex h-[200px] items-center justify-center text-muted-foreground">
            No data available
          </div>
        )}
      </CardContent>
    </Card>
  )
}