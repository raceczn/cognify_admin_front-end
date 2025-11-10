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
              <CardTitle className='text-3xl font-semibold'>0</CardTitle>
              <CardAction>
                <Badge variant='outline'>
                  <IconTrendingUp className='size-4' /> 
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
              <CardTitle className='text-3xl font-semibold'>0</CardTitle>
              <CardAction>
                <Badge variant='outline'>
                  <IconTrendingUp className='size-4' /> 
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
              <CardTitle className='text-3xl font-semibold'>0</CardTitle>
              <CardAction>
                <Badge variant='outline'>
                  <IconTrendingUp className='size-4' /> 
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
              <CardTitle className='text-3xl font-semibold'>0</CardTitle>
              <CardAction>
                <Badge variant='outline'>
                  <IconTrendingUp className='size-4' /> 
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className='text-muted-foreground text-sm'>
              Uploaded this month
            </CardFooter>
          </Card>
        </div>

        {/* ===== Charts ===== */}
        <div className='mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2'>
          {/* Overview (left, 50%) */}

          <UserGrowth />
          <RolePieChart/>
        </div>
      </Main>
    </>
  )
}

// --- 5. YOUR UPDATED topNav ---
const getTopNav = () => [
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

