// src/pages/dashboard/index.tsx

// --- 1. REMOVED ALL UNUSED AUTH-RELATED IMPORTS ---
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
  CardContent,
} from '@/components/ui/card'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { TopNav } from '@/components/layout/top-nav'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Overview } from './components/overview'
import { RecentSales } from './components/recent-sales'

export function Dashboard() {
  // --- 2. GET PERMISSIONS (This is fine) ---
  const { isAdmin } = usePermissions()

  // --- 3. REMOVED THE REDUNDANT `useEffect` AUTH GUARD ---
  // Your `src/routes/__root.tsx` file already handles this!

  // --- 4. YOUR ORIGINAL DASHBOARD JSX ---
  // This will only render if the user is NOT a student
  return (
    <>
      {/* ===== Top Heading ===== */}
      <Header>
        <TopNav links={getTopNav(isAdmin)} />
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
              <CardTitle className='text-3xl font-semibold'>1,245</CardTitle>
              <CardAction>
                <Badge variant='outline'>
                  <IconTrendingUp className='size-4' /> +12%
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className='text-muted-foreground text-sm'>
              This month’s total users
            </CardFooter>
          </Card>

          {/* Active Students */}
          <Card>
            <CardHeader>
              <CardDescription>Active Students</CardDescription>
              <CardTitle className='text-3xl font-semibold'>980</CardTitle>
              <CardAction>
                <Badge variant='outline'>
                  <IconTrendingUp className='size-4' /> +8%
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className='text-muted-foreground text-sm'>
              Students currently reviewing
            </CardFooter>
          </Card>

          {/* Faculty Mentors */}
          <Card>
            <CardHeader>
              <CardDescription>Faculty Members</CardDescription>
              <CardTitle className='text-3xl font-semibold'>45</CardTitle>
              <CardAction>
                <Badge variant='outline'>
                  <IconTrendingUp className='size-4' /> +3%
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className='text-muted-foreground text-sm'>
              Mentors currently active
            </CardFooter>
          </Card>

          {/* Review Materials */}
          <Card>
            <CardHeader>
              <CardDescription>Review Materials</CardDescription>
              <CardTitle className='text-3xl font-semibold'>312</CardTitle>
              <CardAction>
                <Badge variant='outline'>
                  <IconTrendingUp className='size-4' /> +15%
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className='text-muted-foreground text-sm'>
              Uploaded this month
            </CardFooter>
          </Card>
        </div>

        {/* ===== Charts ===== */}
        <div className='mt-4 grid grid-cols-1 gap-4 lg:grid-cols-7'>
          <Card className='col-span-1 lg:col-span-4'>
            <CardHeader>
              <CardTitle>Overview</CardTitle>
              <CardDescription>
                Total registered users over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Overview />
            </CardContent>
          </Card>

          <Card className='col-span-1 lg:col-span-3'>
            <CardHeader>
              <CardTitle>Recent Enrollments</CardTitle>
              <CardDescription>Latest student sign-ups</CardDescription>
            </CardHeader>
            <CardContent>
              <RecentSales />
            </CardContent>
          </Card>
        </div>
      </Main>
    </>
  )
}

// --- 5. YOUR UPDATED topNav ---
const getTopNav = (isAdmin: boolean) => [
  {
    title: 'Overview',
    href: '/', // Changed from 'dashboard/overview' to '/'
    isActive: true,
    disabled: false,
  },
  {
    title: 'Users', // 'Students' and 'All Users' are confusing. Just 'Users'
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

