'use client'

import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from 'recharts'
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
import React from 'react'

interface BloomDataPoint {
  bloom_level: string
  score: number
}

interface StudentBloomChartProps {
  data: BloomDataPoint[]
}

// Define colors for the chart
const chartConfig = {
  score: {
    label: 'Score',
  },
  // These colors will be used based on the score
  strength: {
    label: 'Strength',
    color: 'hsl(var(--chart-2))', // Green
  },
  weakness: {
    label: 'Weakness',
    color: 'hsl(var(--chart-5))', // Red
  },
  neutral: {
    label: 'Neutral',
    color: 'hsl(var(--muted-foreground))', // Gray
  },
} satisfies ChartConfig

export function StudentBloomChart({ data }: StudentBloomChartProps) {
  const chartData = React.useMemo(() => {
    return data.map((item) => ({
      ...item,
      // Add a fill color based on score thresholds
      fill:
        item.score >= 80
          ? 'var(--color-strength)'
          : item.score < 70
            ? 'var(--color-weakness)'
            : 'var(--color-neutral)',
    }))
  }, [data])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance by Bloom's Level</CardTitle>
        <CardDescription>
          Average score per Bloom's category.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className='h-[250px] w-full'>
          <ResponsiveContainer width='100%' height='100%'>
            <BarChart
              data={chartData}
              margin={{ top: 0, right: 0, left: -10, bottom: 0 }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey='bloom_level'
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                className='capitalize'
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => `${value}%`}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelFormatter={(label) => (
                      <div className='capitalize'>{label}</div>
                    )}
                    formatter={(value) => [`${value.toFixed(2)}%`, 'Score']}
                    indicator='dot'
                  />
                }
              />
              <Bar dataKey='score' radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}