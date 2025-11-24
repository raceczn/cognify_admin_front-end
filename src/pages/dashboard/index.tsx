// src/pages/dashboard/index.tsx
import { useEffect, useState } from 'react'
import { IconTrendingUp } from '@tabler/icons-react'
import { usePermissions } from '@/hooks/use-permissions'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardFooter,
} from '@/components/ui/card'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { TopNav } from '@/components/layout/top-nav'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { RolePieChart } from './components/Role-piechart'
import { UserGrowth } from './components/Usergrowth'
import { getAllProfiles } from '@/lib/profile-hooks'

// --- Types ---
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

type DashboardStats = {
  totalUsers: number
  activeStudents: number
  facultyMembers: number
  adminUsers: number
}

export function Dashboard() {
  const { isAdmin } = usePermissions()
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeStudents: 0,
    facultyMembers: 0,
    adminUsers: 0,
  })
  const [loading, setLoading] = useState(true)

  // Fetch and calculate stats
  useEffect(() => {
    async function fetchDashboardStats() {
      try {
        const response: PaginatedUsersResponse = await getAllProfiles()
        const profiles: UserProfile[] = response.items || []

        // Count users by role
        let studentCount = 0
        let facultyCount = 0
        let adminCount = 0

        profiles.forEach((profile) => {
          const roleDesignation = profile.role || ''
          
          // Match against role designations from your roles data
          if (roleDesignation === 'student') {
            studentCount++
          } else if (roleDesignation === 'faculty_member') {
            facultyCount++
          } else if (roleDesignation === 'admin') {
            adminCount++
          }
        })

        setStats({
          totalUsers: profiles.length,
          activeStudents: studentCount,
          facultyMembers: facultyCount,
          adminUsers: adminCount,
        })
      } catch (error) {
        console.error('Error fetching dashboard stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardStats()
  }, [])

  return (
    <>
      {/* ===== Top Heading ===== */}
      <Header>
        <TopNav links={getTopNav()} />
        <div className='ms-auto flex items-center space-x-4'>
          <Search />
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      {/* ===== Main ===== */}
      <Main>
        <div className='mb-2 flex items-center justify-between space-y-2'>
          <h1 className='text-2xl font-bold tracking-tight'>
            {isAdmin ? 'Admin Dashboard' : 'Faculty Dashboard'}
          </h1>
        </div>

        {/* ===== Cards ===== */}
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
          {/* Registered Users */}
          <Card>
            <CardHeader>
              <CardDescription>Total Registered Users</CardDescription>
              <CardTitle className='text-3xl font-semibold'>
                {loading ? (
                  <span className='text-muted-foreground'>...</span>
                ) : (
                  stats.totalUsers
                )}
              </CardTitle>
              <CardAction>
                <Badge variant='outline'>
                  <IconTrendingUp className='size-4' />
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className='text-muted-foreground text-sm'>
              All registered users in the system
            </CardFooter>
          </Card>

          {/* Active Students */}
          <Card>
            <CardHeader>
              <CardDescription>Active Students</CardDescription>
              <CardTitle className='text-3xl font-semibold'>
                {loading ? (
                  <span className='text-muted-foreground'>...</span>
                ) : (
                  stats.activeStudents
                )}
              </CardTitle>
              <CardAction>
                <Badge variant='outline'>
                  <IconTrendingUp className='size-4' />
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className='text-muted-foreground text-sm'>
              Students currently registered
            </CardFooter>
          </Card>

          {/* Faculty Members */}
          <Card>
            <CardHeader>
              <CardDescription>Faculty Members</CardDescription>
              <CardTitle className='text-3xl font-semibold'>
                {loading ? (
                  <span className='text-muted-foreground'>...</span>
                ) : (
                  stats.facultyMembers
                )}
              </CardTitle>
              <CardAction>
                <Badge variant='outline'>
                  <IconTrendingUp className='size-4' />
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className='text-muted-foreground text-sm'>
              Faculty members in the system
            </CardFooter>
          </Card>

          {/* Admin Users */}
          <Card>
            <CardHeader>
              <CardDescription>Admin Users</CardDescription>
              <CardTitle className='text-3xl font-semibold'>
                {loading ? (
                  <span className='text-muted-foreground'>...</span>
                ) : (
                  stats.adminUsers
                )}
              </CardTitle>
              <CardAction>
                <Badge variant='outline'>
                  <IconTrendingUp className='size-4' />
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className='text-muted-foreground text-sm'>
              Administrators with full access
            </CardFooter>
          </Card>
        </div>

        {/* ===== Charts ===== */}
        <div className='mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2'>
          <UserGrowth />
          <RolePieChart />
        </div>
      </Main>
    </>
  )
}

const getTopNav = () => [
  {
    title: 'Overview',
    href: '/',
    isActive: true,
    disabled: false,
  },
  {
    title: 'Users',
    href: '/users',
    isActive: false,
    disabled: false,
  },
  {
    title: 'Analytics',
    href: '/analytics',
    isActive: false,
    disabled: false,
  },
  {
    title: 'Settings',
    href: '/settings',
    isActive: false,
    disabled: false,
  },
]