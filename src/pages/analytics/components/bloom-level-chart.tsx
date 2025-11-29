'use client'

import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer } from 'recharts'
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

// [FIX] Accept flexible dictionary input
interface BloomLevelChartProps {
  data?: Record<string, number> // e.g., { "remembering": 75, "applying": 60 }
}

const chartConfig = {
  score: {
    label: 'Mastery (%)',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig

export function BloomLevelChart({ data }: BloomLevelChartProps) {
  // [FIX] Robust transformation logic
  const chartData = data
    ? Object.entries(data).map(([level, score]) => ({
        // Capitalize first letter: 'remembering' -> 'Remembering'
        subject: level.charAt(0).toUpperCase() + level.slice(1),
        score: score,
        fullMark: 100
      }))
    : []

  // Ensure logical sort order for the radar shape
  const order = ['Remembering', 'Understanding', 'Applying', 'Analyzing', 'Evaluating', 'Creating']
  chartData.sort((a, b) => order.indexOf(a.subject) - order.indexOf(b.subject))

  return (
    <Card className='flex flex-col h-full'>
      <CardHeader className='items-center pb-0'>
        <CardTitle>Cognitive Profile</CardTitle>
        <CardDescription>Mastery by Bloom's Taxonomy Level</CardDescription>
      </CardHeader>
      <CardContent className='flex-1 pb-0 min-h-[250px]'>
        {chartData.length > 0 ? (
          <ChartContainer
            config={chartConfig}
            className='mx-auto aspect-square max-h-[250px] w-full'
          >
            {/* [FIX] Wrapped in ResponsiveContainer for better layout safety */}
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={chartData} outerRadius={80}>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent />}
                />
                <PolarGrid gridType="polygon" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
                <Radar
                  name="Mastery"
                  dataKey="score"
                  fill="var(--color-score)"
                  fillOpacity={0.4}
                  stroke="var(--color-score)"
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </ChartContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
            Not enough data to generate profile.
          </div>
        )}
      </CardContent>
    </Card>
  )
}