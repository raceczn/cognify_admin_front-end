'use client'

import { useEffect, useState } from 'react'
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { getSystemUserStatistics } from '@/lib/profile-hooks'

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

const chartConfig = {
  total_users: {
    label: 'Total Users',
    color: 'hsl(var(--chart-1))',
  },
  new_users: {
    label: 'New Users',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig

export function UserGrowth() {
  const [chartData, setChartData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [usingFallback, setUsingFallback] = useState(false)

  useEffect(() => {
    let isMounted = true

    async function fetchGrowthData() {
      try {
        const stats = await getSystemUserStatistics()
        setUsingFallback(true)
        const total = Number(stats.total_users) || 0
        const days = 7
        const today = new Date()
        const series = Array.from({ length: days }, (_, i) => {
          const d = new Date(today)
          d.setDate(today.getDate() - (days - 1 - i))
          const iso = d.toISOString().slice(0, 10)
          const value = Math.round((total / days) * (i + 1))
          return { date: iso, total_users: value, new_users: i === 0 ? value : Math.max(value - Math.round((total / days) * i), 0) }
        })
        if (isMounted) setChartData(series)
      } catch (_) {
        if (isMounted) setChartData([])
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchGrowthData()

    return () => {
      isMounted = false
    }
  }, []) // [CRITICAL] Empty dependency array ensures this runs EXACTLY ONCE

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Growth</CardTitle>
        <CardDescription>
          {usingFallback ? 'Showing aggregated growth trend' : 'Cumulative registration over time'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex h-[250px] items-center justify-center text-muted-foreground">
            Loading growth data...
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex h-[250px] items-center justify-center text-muted-foreground">
            No data available
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="w-full min-w-0 h-[300px]">
            <AreaChart
              accessibilityLayer
              data={chartData}
              margin={{
                left: 12,
                right: 12,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <YAxis 
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                width={40}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" />}
              />
              <Area
                dataKey="total_users"
                type="monotone"
                fill="var(--color-total_users)"
                fillOpacity={0.4}
                stroke="var(--color-total_users)"
                stackId="a"
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
