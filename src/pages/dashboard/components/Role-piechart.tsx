'use client'

import { useEffect, useState, useMemo } from 'react'
import { TrendingUp } from 'lucide-react'
import { Pie, PieChart, Cell } from 'recharts'
import { getAllProfiles, getSystemUserStatistics } from '@/lib/profile-hooks'
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

// --- 1. Define types ---
type UserProfile = {
  id: string
  role_id: string
  role?: string 
  [key: string]: any
}

type PaginatedUsersResponse = {
  items: UserProfile[]
  last_doc_id: string | null
}


export function RolePieChart() {
  const [chartData, setChartData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [topRole, setTopRole] = useState<string>('')
  const [usingFallback, setUsingFallback] = useState(false)

  // --- BUILD THE ROLE LABELS AND COLOR MAP ---
  const roleLabels: Record<string, string> = useMemo(() => {
    return roles.reduce((acc, role) => {
      acc[role.designation] = role.label
      return acc
    }, {} as Record<string, string>)
  }, []) // Dependency array is empty since 'roles' is assumed static

  const roleColorMap: Record<string, string> = {
    Admin: '#ef4444',
    'Faculty Member': '#22c55e',
    Student: '#8b5cf6',
  }

  useEffect(() => {
    async function fetchRoles() {
      setLoading(true)
      try {
        // --- ATTEMPT 1: Use System Statistics (Preferred for speed/accuracy) ---
        const stats = await getSystemUserStatistics()
        
        // Initialize counts for all known readable roles to ensure they appear even if count is 0
        const initialCounts: Record<string, number> = Object.values(roleLabels).reduce((acc, label) => {
            acc[label] = 0;
            return acc;
        }, {} as Record<string, number>);

        const roleCounts: Record<string, number> = Object.entries(stats.by_role || {}).reduce(
          (acc, [designation, count]) => {
            const readableRole = roleLabels[designation] || designation // Use mapped label
            acc[readableRole] = Number(count) || 0
            return acc
          },
          initialCounts // Start with all known roles at 0
        )

        let data = Object.entries(roleCounts)
          .filter(([, count]) => count > 0) // Only include roles with actual users
          .map(([role, count]) => ({
            role,
            count,
            fill: roleColorMap[role] ?? '#64748b',
          }))

        if (data.length === 0 && Object.keys(stats.by_role || {}).length === 0) {
          // --- ATTEMPT 2: Fallback to Profiles Aggregation (ONLY IF STATS IS EMPTY) ---
          console.warn('System statistics empty, falling back to profiles aggregation.')
          const response: PaginatedUsersResponse = await getAllProfiles()
          
          const profiles: UserProfile[] = response.items || []
          
          const counts: Record<string, number> = Object.values(roleLabels).reduce((acc, label) => {
              acc[label] = 0;
              return acc;
          }, {} as Record<string, number>);

          profiles.filter((p) => p.is_verified === true).forEach((p: UserProfile) => {
            const roleDesignation = p.role || 'Unknown'
            const readableRole = roleLabels[roleDesignation] || roleDesignation
            counts[readableRole] = (counts[readableRole] || 0) + 1
          })
          
          data = Object.entries(counts)
            .filter(([, count]) => count > 0) // Only include roles with actual users
            .map(([role, count]) => ({
              role,
              count,
              fill: roleColorMap[role] ?? '#64748b',
            }))
          
          setUsingFallback(true)
        } else {
          setUsingFallback(false)
        }
        
        setChartData(data)
        // Set top role based on the fetched data
        if (data.length > 0) {
          const top = data.reduce(
            (prev, curr) => (curr.count > prev.count ? curr : prev),
            { role: 'None', count: 0 }
          )
          setTopRole(top.role)
        } else {
          setTopRole('N/A')
        }
      } catch (error) {
        console.error("Error fetching user roles:", error)
        setChartData([])
        setTopRole('N/A')
      } finally {
        setLoading(false)
      }
    }

    fetchRoles()
  }, [roleLabels]) // Only need roleLabels as a dependency here

  // --- FIX: useMemo for chartConfig remains essential ---
  const chartConfig: ChartConfig = useMemo(() => {
    const config: ChartConfig = {
      count: { label: 'Users' },
    }
    // Dynamically add role colors and labels to chartConfig
    chartData.forEach((item) => {
      config[item.role] = {
        label: item.role,
        color: item.fill,
      }
    })
    return config
  }, [chartData])

  // --- Render logic remains the same ---
  return (
    <Card className='flex flex-col'>
      <CardHeader className='items-center pb-0'>
        <CardTitle>User Role Distribution</CardTitle>
        <CardDescription>
          {loading ? 'Fetching user data...' : usingFallback ? 'Showing aggregated role distribution' : 'Distribution of users by their assigned roles'}
        </CardDescription>
      </CardHeader>

      <CardContent className='flex-1 pb-0'>
        {loading ? (
          <div className='text-muted-foreground flex h-[250px] items-center justify-center'>
            Loading...
          </div>
        ) : chartData.length === 0 ? (
          <div className='text-muted-foreground flex h-[250px] items-center justify-center'>
            No data available
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className='w-full min-w-0 h-[250px]'
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent nameKey='role' hideLabel />}
              />
              <Pie
                data={chartData}
                dataKey='count'
                nameKey='role'
                stroke='0'
                isAnimationActive
                innerRadius={0}
                outerRadius={110}
                startAngle={90}
                endAngle={450}
                paddingAngle={0}
              >
                {chartData.map((item, idx) => (
                  <Cell key={`cell-${idx}`} fill={item.fill} />
                ))}
              </Pie>
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
