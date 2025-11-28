'use client'

import { useEffect, useState } from 'react'
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { getUserGrowthStats } from '@/lib/profile-hooks' // [FIX] Use new lightweight hook

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

  useEffect(() => {
    let isMounted = true

    async function fetchGrowthData() {
      try {
        // [FIX] Call the optimized backend endpoint
        // This prevents fetching 1000s of profiles and avoids the infinite loop
        const data = await getUserGrowthStats()
        
        if (isMounted) {
          setChartData(data)
        }
      } catch (error) {
        console.error('Failed to load growth data:', error)
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
          Cumulative registration over time
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex h-[250px] items-center justify-center text-muted-foreground">
            Loading growth data...
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="max-h-[300px] w-full">
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