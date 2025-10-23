// --- 1. NEW IMPORTS ---
import { useEffect, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { roles } from '@/pages/users/data/data'
import { IconTrendingUp } from '@tabler/icons-react'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import { getProfile } from '@/lib/profile-hooks'
import { usePermissions } from '@/hooks/use-permissions'
import { Badge } from '@/components/ui/badge'
// --- END NEW IMPORTS ---

// --- Original Imports ---
// import { Button } from '@/components/ui/button'
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
  // --- 2. AUTH GUARD LOGIC ---
  const { auth } = useAuthStore()
  const navigate = useNavigate()
  const { isAdmin } = usePermissions()
  const [isCheckingRole, setIsCheckingRole] = useState(true) // Start loading

  useEffect(() => {
    const checkRoleAndFetchProfile = async () => {
      // 1. Check if logged in (token and user ID must exist)
      if (!auth.accessToken || !auth.user?.uid) {
        toast.error('You must be logged in to view this page.')
        navigate({ to: '/sign-in', replace: true })
        return // Stop execution
      }

      let userProfile = auth.user

      // 2. Check if profile is fully loaded (i.e., we don't have the role yet)
      //    We check for `role_id` or `profile.role_id` for safety
      if (!userProfile.role_id && !userProfile.profile?.role_id) {
        try {
          // Profile is not fully loaded, fetch it using the uid
          const fullProfile = await getProfile(auth.user.uid)

          // `getProfile` returns the full user object from the backend
          auth.setUser(fullProfile) // Update the store
          userProfile = fullProfile // Use this new data for the check
        } catch (error) {
          toast.error('Session expired. Please log in again.')
          auth.reset()
          navigate({ to: '/sign-in', replace: true })
          return // Stop execution
        }
      }

      // 3. Perform the role check using role IDs
      const userRole = userProfile.role_id || userProfile.profile?.role_id

      // Get the student role ID
      const studentRoleId = roles.find(
        (r) => r.designation === 'student'
      )?.value
      const facultyRoleId = roles.find(
        (r) => r.designation === 'faculty_member'
      )?.value
      const adminRoleId = roles.find((r) => r.designation === 'admin')?.value

      if (userRole === studentRoleId) {
        toast.error(
          'Access Denied: Only faculty and admin accounts can access the dashboard.'
        )
        auth.reset() // Log them out
        navigate({ to: '/sign-in', replace: true })
      } else if (userRole === facultyRoleId || userRole === adminRoleId) {
        // User is logged in, has a profile, and is either faculty or admin
        setIsCheckingRole(false) // Allow the page to render
      } else {
        toast.error('Access Denied: Invalid role or insufficient permissions.')
        auth.reset() // Log them out
        navigate({ to: '/sign-in', replace: true })
      }
    }

    checkRoleAndFetchProfile()
  }, [auth.user, auth.accessToken, auth.setUser, navigate, auth])

  // Show a loading spinner while we verify the user's role
  if (isCheckingRole) {
    return (
      <div className='flex h-screen w-full items-center justify-center'>
        <Loader2 className='h-12 w-12 animate-spin' />
      </div>
    )
  }
  // --- END AUTH GUARD LOGIC ---

  // --- 3. YOUR ORIGINAL DASHBOARD JSX ---
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
          <div className='flex items-center space-x-2'>
            {/* <Button>Generate Report</Button> */}
          </div>
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
              <CardDescription>Faculty Mentors</CardDescription>
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
                Shows number of registered users over time
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

// --- YOUR UPDATED topNav ---
const getTopNav = (isAdmin: boolean) => [
  {
    title: 'Overview',
    href: 'dashboard/overview',
    isActive: true,
    disabled: false,
  },
  {
    title: 'Students',
    href: '/users/students',
    isActive: false,
    disabled: false,
  },
  {
    title: 'All Users',
    href: '/users',
    isActive: false,
    disabled: !isAdmin, // Only enabled for admin
  },
  {
    title: 'Settings',
    href: '/settings',
    isActive: false,
    disabled: false,
  },
]
