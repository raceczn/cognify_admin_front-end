'use client'

import { useEffect, useState } from 'react'
import { roles } from '@/pages/users/data/data'
import { TrendingUp } from 'lucide-react'
import { Pie, PieChart } from 'recharts'
import { getAllProfiles } from '@/lib/profile-hooks'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'

export const description = 'A simple pie chart with dynamic role data'

// --- 1. Define types ---
type UserProfile = {
  id: string
  role_id: string
  [key: string]: any
}

type PaginatedUsersResponse = {
  items: UserProfile[]
  last_doc_id: string | null
}


export function ChartPieSimple() {
  const [chartData, setChartData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [topRole, setTopRole] = useState<string>('')

  const roleLabels: Record<string, string> = {
    faculty_member: 'Faculty Member',
    admin: 'Admin',
    student: 'Student',
  }

  useEffect(() => {
    async function fetchRoles() {
      try {
        // --- 2. Get the full response object ---
        const response: PaginatedUsersResponse = await getAllProfiles()

        // --- 3. Use response.items ---
        const profiles: UserProfile[] = response.items || []

        const roleCounts: Record<string, number> = {}

        profiles.forEach((p: any) => {
          const matchedRole =
            roles.find((r) => r.value === p.role_id)?.designation || 'Unknown'

          const readableRole = roleLabels[matchedRole] || matchedRole

          roleCounts[readableRole] = (roleCounts[readableRole] || 0) + 1
        })

        const data = Object.entries(roleCounts).map(([role, count], i) => ({
          role,
          count,
          fill: `var(--chart-${(i % 5) + 1})`,
        }))

        setChartData(data)

        const top = data.reduce(
          (prev, curr) => (curr.count > prev.count ? curr : prev),
          { role: 'None', count: 0 }
        )
        setTopRole(top.role)
      } catch (error) {
        console.error('Error fetching role data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchRoles()
  }, [])

  const chartConfig: ChartConfig = {
    count: { label: 'Users' },
  }
  
  // ... (rest of the file is unchanged) ...

  return (
    <Card className='flex flex-col'>
      <CardHeader className='items-center pb-0'>
        <CardTitle>User Role Distribution</CardTitle>
        <CardDescription>
          {loading
            ? 'Fetching user data...'
            : 'Shows the number of users by role.'}
        </CardDescription>
      </CardHeader>

      <CardContent className='flex-1 pb-0'>
        {loading ? (
          <div className='text-muted-foreground flex h-[250px] items-center justify-center'>
            Loading...
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className='mx-auto aspect-square max-h-[250px]'
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Pie data={chartData} dataKey='count' nameKey='role' />
            </PieChart>
          </ChartContainer>
        )}
      </CardContent>

      <CardFooter className='text-muted-foreground flex items-center justify-center border-t pt-3 text-sm'>
        {loading ? (
          <span>Analyzing user roles...</span>
        ) : (
          <div className='flex items-center gap-2 font-medium'>
            <TrendingUp className='h-4 w-4 text-green-500' />
            <span>
              Most users are{' '}
              <span className='text-foreground font-semibold capitalize'>
                {topRole || 'Unknown'}
              </span>
            </span>
          </div>
        )}
      </CardFooter>
    </Card>
  )
}