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

export const description = 'A radar chart'

const chartData = [
  { bloom_level: 'Remembering', Students: 186 },
  { bloom_level: 'Applying', Students: 305 },
  { bloom_level: 'Understanding', Students: 237 },
  { bloom_level: 'Analyzing', Students: 209 },
]

const chartConfig = {
  Students: {
    label: 'Students',
    color: 'var(--chart-1)',
  },
} satisfies ChartConfig

export function BloomLevelChart() {
  return (
    <Card>
      <CardHeader className='items-center pb-0'>
        <CardTitle>Bloom Levels</CardTitle>
        <CardDescription>Students' knowledge by Bloom level.</CardDescription>
      </CardHeader>
      <CardContent className='pb-0'>
        <ChartContainer
          config={chartConfig}
          className='mx-auto aspect-square max-h-[250px]'
        >
          <RadarChart data={chartData} outerRadius={100}>
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <PolarGrid />
            <PolarAngleAxis
              dataKey='bloom_level'
              tick={(props) => {
                const { x, y, payload } = props
                return (
                  <text
                    x={x}
                    y={y}
                    textAnchor='middle'
                    fontSize={12}
                    fill='#666'
                    dy={4} // adjust vertical position if needed
                  >
                    {payload.value}
                  </text>
                )
              }}
            />

            <Radar
              dataKey='Students'
              fill='var(--color-Students)'
              fillOpacity={0.6}
            />
          </RadarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
