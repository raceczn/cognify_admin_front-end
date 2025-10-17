// import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardAction, CardFooter, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { IconTrendingUp } from '@tabler/icons-react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { TopNav } from '@/components/layout/top-nav'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { Overview } from './components/overview'
import { RecentSales } from './components/recent-sales'

export function Dashboard() {
  return (
    <>
      {/* ===== Top Heading ===== */}
      <Header>
        <TopNav links={topNav} />
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
          <h1 className='text-2xl font-bold tracking-tight'>Admin Dashboard</h1>
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
            <CardFooter className='text-sm text-muted-foreground'>
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
            <CardFooter className='text-sm text-muted-foreground'>
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
            <CardFooter className='text-sm text-muted-foreground'>
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
            <CardFooter className='text-sm text-muted-foreground'>
              Uploaded this month
            </CardFooter>
          </Card>
        </div>

        {/* ===== Charts ===== */}
        <div className='grid grid-cols-1 gap-4 lg:grid-cols-7 mt-4'>
          <Card className='col-span-1 lg:col-span-4'>
            <CardHeader>
              <CardTitle>Overview</CardTitle>
            </CardHeader>
            <CardContent className='ps-2'>
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

const topNav = [
  { title: 'Overview', href: 'dashboard/overview', isActive: true, disabled: false },
  { title: 'Users', href: 'dashboard/users', isActive: false, disabled: true },
  { title: 'Materials', href: 'dashboard/materials', isActive: false, disabled: true },
  { title: 'Settings', href: 'dashboard/settings', isActive: false, disabled: true },
]
