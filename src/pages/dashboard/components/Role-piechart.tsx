'use client'

import { useEffect, useState } from 'react'
import { TrendingUp } from 'lucide-react'
import { Pie, PieChart } from 'recharts'
import { getAllProfiles } from '@/lib/profile-hooks'
import { roles } from '@/pages/users/data/data'

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

export const description = 'A pie chart showing dynamic user role distribution'

// --- 1. Define types ---
type UserProfile = {
  id: string
  role_id: string
  role?: string // The backend /profiles/all adds this
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

  // --- THIS IS THE FIX ---
  // We build the labels from the 'roles' data to ensure they are in sync
  const roleLabels = roles.reduce((acc, role) => {
    acc[role.designation] = role.label
    return acc
  }, {} as Record<string, string>) // <-- This explicit type cast fixes the error
  // --- END FIX ---


  useEffect(() => {
    async function fetchRoles() {
      try {
        const response: PaginatedUsersResponse = await getAllProfiles()
        const profiles: UserProfile[] = response.items || []

        const roleCounts: Record<string, number> = {}

        // Use the role designation from the profile (which comes from the backend)
        profiles.forEach((p: UserProfile) => {
          const roleDesignation = p.role || 'Unknown' // 'role' is the designation string
          const readableRole = roleLabels[roleDesignation] || roleDesignation
          
          roleCounts[readableRole] = (roleCounts[readableRole] || 0) + 1
        })

        const data = Object.entries(roleCounts).map(([role, count], i) => ({
          role,
          count,
          fill: `var(--chart-${(i % 5) + 1})`,
        }))

        setChartData(data)

        if(data.length > 0) {
          const top = data.reduce(
            (prev, curr) => (curr.count > prev.count ? curr : prev),
            { role: 'None', count: 0 }
          )
          setTopRole(top.role)
        }

      } catch (error) {
        console.error('Error fetching role data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchRoles()
  }, [roleLabels]) // roleLabels is stable, so this is fine

  const chartConfig: ChartConfig = {
    count: { label: 'Users' },
  }
  
  // Dynamically add role colors to chartConfig
  chartData.forEach((item) => {
    chartConfig[item.role] = {
      label: item.role,
      color: item.fill,
    }
  })

  return (
    <Card className='flex flex-col'>
      <CardHeader className='items-center pb-0'>
        <CardTitle>User Role Distribution</CardTitle>
        <CardDescription>
          {loading
            ? 'Fetching user data...'
            : 'Distribution of users by their assigned roles'}
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
            className='[&_.recharts-pie-label-text]:fill-foreground mx-auto aspect-square max-h-[250px] pb-0'
          >
            <PieChart>
              <ChartTooltip
                content={<ChartTooltipContent nameKey='role' hideLabel />}
              />
              <Pie
                data={chartData}
                dataKey='count'
                nameKey='role'
                label
                isAnimationActive
              />
            </PieChart>
          </ChartContainer>
        )}
      </CardContent>

      <CardFooter className='flex-col gap-2 text-sm'>
        {loading ? (
          <div className='text-muted-foreground leading-none'>
            Analyzing user roles...
          </div>
        ) : (
          <>
            <div className='flex items-center gap-2 leading-none font-medium'>
              Most users are{' '}
              <span className='text-foreground font-semibold capitalize'>
                {topRole || 'N/A'}
              </span>
              {topRole !== 'N/A' && <TrendingUp className='h-4 w-4 text-green-500' />}
            </div>
            <div className='text-muted-foreground leading-none'>
              Showing role distribution across all registered users
            </div>
          </>
        )}
      </CardFooter>
    </Card>
  )
}