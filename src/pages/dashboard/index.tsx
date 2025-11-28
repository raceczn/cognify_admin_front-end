import { useEffect, useState } from 'react'
import { 
  IconUsers, 
  IconBook, 
  IconFileCertificate, 
  IconClipboardCheck,
  IconAlertCircle,
  IconMailForward
} from '@tabler/icons-react'
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
import { getSystemUserStatistics } from '@/lib/profile-hooks'

type DashboardStats = {
  // User Counts
  totalUsers: number
  activeStudents: number
  facultyMembers: number
  adminUsers: number
  pendingUsers: number
  
  // Whitelist Counts
  whitelistStudents: number
  whitelistFaculty: number
  
  // System Content
  totalSubjects: number
  totalModules: number
  pendingModules: number
  totalAssessments: number
  pendingAssessments: number
  pendingQuestions: number
}

const PulseDotsStyles = () => (
  <style>
    {`
      @keyframes pulse-dots { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; } }
      .animate-pulse-dots { animation: pulse-dots 1.5s ease-in-out infinite; }
    `}
  </style>
)

export function Dashboard() {
  const { isAdmin } = usePermissions()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchDashboardStats() {
      try {
        const data = await getSystemUserStatistics()
        
        setStats({
          // Map backend response
          totalUsers: data.total_users,
          activeStudents: data.by_role?.student || 0,
          facultyMembers: data.by_role?.faculty_member || 0,
          adminUsers: data.by_role?.admin || 0,
          pendingUsers: data.pending_verification || 0,

          // [NEW] Map Whitelist counts
          whitelistStudents: data.whitelist_students || 0,
          whitelistFaculty: data.whitelist_faculty || 0,

          totalSubjects: data.total_subjects || 0,
          totalModules: data.total_modules || 0,
          pendingModules: data.pending_modules || 0,
          totalAssessments: data.total_assessments || 0,
          pendingAssessments: data.pending_assessments || 0,
          pendingQuestions: data.pending_questions || 0
        })
      } catch (error) {
        console.error('Error fetching dashboard stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardStats()
  }, [])

  const Val = ({ val }: { val?: number }) => (
    loading || val === undefined ? <span className='animate-pulse-dots'>...</span> : val
  )

  return (
    <>
      <PulseDotsStyles />
      <Header>
        <TopNav links={getTopNav()} />
        <div className='ms-auto flex items-center space-x-4'>
          <Search />
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-2 flex items-center justify-between space-y-2'>
          <h1 className='text-2xl font-bold tracking-tight'>
            {isAdmin ? 'System Overview' : 'Dashboard'}
          </h1>
        </div>

        {/* ===== SECTION 1: USER METRICS (Grid changed to 3 columns) ===== */}
        <h2 className="text-lg font-semibold mb-3 text-muted-foreground">User Metrics</h2>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8'>
          
          {/* 1. Total Users */}
          <Card>
            <CardHeader>
              <CardDescription>Total Registered</CardDescription>
              <CardTitle className='text-3xl font-semibold'><Val val={stats?.totalUsers} /></CardTitle>
              <CardAction><Badge variant='outline'><IconUsers className='size-4' /></Badge></CardAction>
            </CardHeader>
            <CardFooter className='text-muted-foreground text-xs'>
              Active system accounts
            </CardFooter>
          </Card>

          {/* 2. Students */}
          <Card>
            <CardHeader>
              <CardDescription>Enrolled Students</CardDescription>
              <CardTitle className='text-3xl font-semibold'><Val val={stats?.activeStudents} /></CardTitle>
              <CardAction><Badge variant='outline' className="bg-blue-500/10 text-blue-500">Student</Badge></CardAction>
            </CardHeader>
            <CardFooter className='text-muted-foreground text-xs'>
              Learners with active accounts
            </CardFooter>
          </Card>

           {/* 3. Whitelisted Students (New) */}
           <Card className="bg-blue-500/5 border-blue-200/20">
            <CardHeader>
              <CardDescription>Whitelisted Students</CardDescription>
              <CardTitle className='text-3xl font-semibold'><Val val={stats?.whitelistStudents} /></CardTitle>
              <CardAction><Badge variant='outline'><IconMailForward className='size-4 text-blue-500' /></Badge></CardAction>
            </CardHeader>
            <CardFooter className='text-muted-foreground text-xs'>
              Pre-registered, waiting to sign up
            </CardFooter>
          </Card>

          {/* 4. Admins */}
          <Card>
            <CardHeader>
              <CardDescription>Admins</CardDescription>
              <CardTitle className='text-3xl font-semibold'><Val val={stats?.adminUsers} /></CardTitle>
              <CardAction><Badge variant='outline' className="bg-red-500/10 text-red-500">Admin</Badge></CardAction>
            </CardHeader>
            <CardFooter className='text-muted-foreground text-xs'>
              System administrators
            </CardFooter>
          </Card>

          {/* 5. Faculty */}
          <Card>
            <CardHeader>
              <CardDescription>Active Faculty</CardDescription>
              <CardTitle className='text-3xl font-semibold'><Val val={stats?.facultyMembers} /></CardTitle>
              <CardAction><Badge variant='outline' className="bg-orange-500/10 text-orange-500">Faculty</Badge></CardAction>
            </CardHeader>
            <CardFooter className='text-muted-foreground text-xs'>
              Instructors & academic staff
            </CardFooter>
          </Card>

          {/* 6. Whitelisted Faculty (New) */}
          <Card className="bg-orange-500/5 border-orange-200/20">
            <CardHeader>
              <CardDescription>Whitelisted Faculty</CardDescription>
              <CardTitle className='text-3xl font-semibold'><Val val={stats?.whitelistFaculty} /></CardTitle>
              <CardAction><Badge variant='outline'><IconMailForward className='size-4 text-orange-500' /></Badge></CardAction>
            </CardHeader>
            <CardFooter className='text-muted-foreground text-xs'>
              Pre-registered, waiting to sign up
            </CardFooter>
          </Card>

        </div>

        {/* ===== SECTION 2: CONTENT & SYSTEM HEALTH ===== */}
        {isAdmin && (
          <>
            <h2 className="text-lg font-semibold mb-3 text-muted-foreground">System Content & Verification</h2>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
              {/* (Existing Content Cards ... same as before) */}
              <Card>
                <CardHeader>
                  <CardDescription>Active Subjects</CardDescription>
                  <CardTitle className='text-3xl font-semibold'><Val val={stats?.totalSubjects} /></CardTitle>
                  <CardAction><Badge variant='outline'><IconBook className='size-4' /></Badge></CardAction>
                </CardHeader>
                <CardFooter className='text-muted-foreground text-xs'>Core curriculum subjects</CardFooter>
              </Card>

              <Card className={stats?.pendingModules ? 'border-amber-500/50 bg-amber-500/5' : ''}>
                <CardHeader>
                  <CardDescription>Pending Modules</CardDescription>
                  <CardTitle className='text-3xl font-semibold'><Val val={stats?.pendingModules} /> <span className="text-sm font-normal text-muted-foreground ml-2">/ <Val val={stats?.totalModules} /></span></CardTitle>
                  <CardAction>{stats?.pendingModules ? <Badge className="bg-amber-500 hover:bg-amber-600">Action Needed</Badge> : <Badge variant='outline'><IconClipboardCheck className='size-4 text-green-500' /></Badge>}</CardAction>
                </CardHeader>
                <CardFooter className='text-muted-foreground text-xs'>Modules waiting for approval</CardFooter>
              </Card>

              <Card className={stats?.pendingAssessments ? 'border-amber-500/50 bg-amber-500/5' : ''}>
                <CardHeader>
                  <CardDescription>Pending Assessments</CardDescription>
                  <CardTitle className='text-3xl font-semibold'><Val val={stats?.pendingAssessments} /> <span className="text-sm font-normal text-muted-foreground ml-2">/ <Val val={stats?.totalAssessments} /></span></CardTitle>
                  <CardAction>{stats?.pendingAssessments ? <Badge className="bg-amber-500 hover:bg-amber-600">Action Needed</Badge> : <Badge variant='outline'><IconFileCertificate className='size-4 text-green-500' /></Badge>}</CardAction>
                </CardHeader>
                <CardFooter className='text-muted-foreground text-xs'>Assessments needing review</CardFooter>
              </Card>

               <Card className={stats?.pendingQuestions ? 'border-amber-500/50 bg-amber-500/5' : ''}>
                <CardHeader>
                  <CardDescription>Pending Questions</CardDescription>
                  <CardTitle className='text-3xl font-semibold'><Val val={stats?.pendingQuestions} /></CardTitle>
                   <CardAction>{stats?.pendingQuestions ? <Badge className="bg-amber-500 hover:bg-amber-600">Action Needed</Badge> : <Badge variant='outline'><IconAlertCircle className='size-4 text-green-500' /></Badge>}</CardAction>
                </CardHeader>
                <CardFooter className='text-muted-foreground text-xs'>Questions submitted by faculty</CardFooter>
              </Card>
            </div>
          </>
        )}

        {/* ===== Charts ===== */}
        <div className='mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2'>
          <UserGrowth />
          <RolePieChart />
        </div>
      </Main>
    </>
  )
}

const getTopNav = () => [
  { title: 'Overview', href: '/', isActive: true, disabled: false },
  { title: 'Users', href: '/users', isActive: false, disabled: false },
  { title: 'Content', href: '/content', isActive: false, disabled: false },
  { title: 'Settings', href: '/settings', isActive: false, disabled: false },
]