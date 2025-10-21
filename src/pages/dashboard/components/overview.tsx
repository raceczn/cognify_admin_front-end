'use client'

import * as React from 'react'
import {
  CartesianGrid,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { getAllProfiles } from '@/lib/profile-hooks'
import { Card, CardContent } from '@/components/ui/card'

export const description = 'Overview line chart showing total registered users'

type UserProfile = {
  id: string
  created_at?: string
  [key: string]: any
}

type ChartPoint = {
  date: string
  users: number
}

export function Overview() {
  const [chartData, setChartData] = React.useState<ChartPoint[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    const fetchUserData = async () => {
      try {
        const profiles: UserProfile[] = await getAllProfiles()
        console.log('✅ Profiles fetched:', profiles) // 👈 ADD THIS LINE

        // ✅ Filter out records without valid dates
        const validProfiles = profiles.filter(
          (p) => p.created_at && !isNaN(Date.parse(p.created_at))
        )

        // ✅ Group users by date (YYYY-MM-DD)
        const grouped = validProfiles.reduce<Record<string, number>>(
          (acc, user) => {
            const date = new Date(user.created_at as string)
              .toISOString()
              .split('T')[0]
            acc[date] = (acc[date] || 0) + 1
            return acc
          },
          {}
        )

        // ✅ Convert grouped data to chart format
        const formatted: ChartPoint[] = Object.entries(grouped)
          .map(([date, users]) => ({
            date,
            users: Number(users),
          }))
          .sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
          )

        setChartData(formatted)
      } catch (err) {
        console.error('Failed to fetch user overview:', err)
        setError('Failed to load user overview.')
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [])

  if (loading) {
    return (
      <Card className='text-muted-foreground py-6 text-center text-sm'>
        Loading user overview...
      </Card>
    )
  }

  if (error) {
    return <Card className='py-6 text-center text-red-500'>{error}</Card>
  }

  return (
    <Card className='py-4 sm:py-0'>
      <CardContent className='px-2 sm:p-6'>
        <div className='h-[250px] w-full'>
          <ResponsiveContainer width='100%' height='100%'>
            <LineChart data={chartData} margin={{ left: 12, right: 12 }}>
              <CartesianGrid strokeDasharray='3 3' vertical={false} />
              <XAxis
                dataKey='date'
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value: string) => {
                  const date = new Date(value)
                  return date.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })
                }}
              />
              <YAxis />
              <Tooltip
                formatter={(value: number) => [`${value} users`, 'Total Users']}
                labelFormatter={(value: string) =>
                  new Date(value).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })
                }
              />
              <Legend />
              <Line
                type='monotone'
                dataKey='users'
                name='User Growth'
                stroke='#2563eb'
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
