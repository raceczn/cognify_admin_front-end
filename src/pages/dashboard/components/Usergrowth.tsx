"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import { getAllProfiles } from "@/lib/profile-hooks"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type UserProfile = {
  id: string
  created_at?: string
  [key: string]: any
}

type PaginatedUsersResponse = {
  items: UserProfile[]
  last_doc_id: string | null
}

type ChartPoint = {
  date: string
  users: number
}

const chartConfig = {
  users: {
    label: "Users",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

export function UserGrowth() {
  const [chartData, setChartData] = React.useState<ChartPoint[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [timeRange, setTimeRange] = React.useState("90d")

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const response: PaginatedUsersResponse = await getAllProfiles()
        const profiles: UserProfile[] = response.items || []

        const validProfiles = profiles.filter(
          (p) => p.created_at && !isNaN(Date.parse(p.created_at))
        )

        const grouped = validProfiles.reduce<Record<string, number>>((acc, p) => {
          const date = new Date(p.created_at as string)
            .toISOString()
            .split("T")[0]
          acc[date] = (acc[date] || 0) + 1
          return acc
        }, {})

        const formatted = Object.entries(grouped)
          .map(([date, count]) => ({
            date,
            users: Number(count),
          }))
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

        setChartData(formatted)
      } catch (err) {
        console.error("Failed to load chart data:", err)
        setError("Failed to load user data.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const filteredData = React.useMemo(() => {
    if (!chartData.length) return []

    const daysToSubtract = parseInt(timeRange)
    if (isNaN(daysToSubtract)) return chartData

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - daysToSubtract)

    return chartData.filter((item) => new Date(item.date) >= startDate)
  }, [chartData, timeRange])

  return (
    <Card className="pt-0">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle>User Growth Overview</CardTitle>
          <CardDescription>
            Shows number of registered users over time
          </CardDescription>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger
            className="hidden w-[160px] rounded-lg sm:ml-auto sm:flex"
            aria-label="Select a value"
          >
            <SelectValue placeholder="Last 3 months" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="90">Last 3 months</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="7">Last 7 days</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>

      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {error ? (
          <div className="text-center text-red-500 py-6">{error}</div>
        ) : loading ? (
          <div className="text-center text-sm text-muted-foreground py-6">
            Loading user data...
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[250px] w-full"
          >
            <AreaChart data={filteredData}>
              <defs>
                <linearGradient id="fillusers" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-users)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-users)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>

              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value) =>
                  new Date(value).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })
                }
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) =>
                      new Date(value).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })
                    }
                    indicator="dot"
                  />
                }
              />
              <Area
                dataKey="users"
                type="natural"
                fill="url(#fillusers)"
                stroke="var(--color-users)"
              />
              <ChartLegend content={<ChartLegendContent />} />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
