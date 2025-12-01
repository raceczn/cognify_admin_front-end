import React, { useEffect, useState } from 'react'
import { 
  IconUsers, 
  IconBook, 
  IconFileCertificate, 
  IconClipboardCheck,
  IconAlertCircle,
  IconMailForward // Kept the Tabler Icons for consistency with the original file's selection
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

// Keeping the custom pulse animation inline for simple status display
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

  const getRoleBadge = (role: string, icon: React.ElementType, badgeVariant: 'default' | 'secondary' | 'destructive' | 'success' | 'outline' = 'outline') => (
    <Badge variant={badgeVariant} className={`text-xs capitalize`}>
      <span className='mr-1 size-4 flex items-center'>{React.createElement(icon)}</span>
      {role}
    </Badge>
  )

  const getSystemStatusBadge = (count: number, icon: React.ElementType, title: string) => {
    const isCritical = count > 0;
    return (
      <Card className={isCritical ? 'border-amber-500/50 bg-amber-500/5' : ''}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardDescription>{title}</CardDescription>
            <CardAction>
              {isCritical ? 
                <Badge variant="destructive" className="bg-amber-500 hover:bg-amber-600 border-none">Review ({count})</Badge> : 
                <Badge variant='outline'><IconClipboardCheck className='size-4 text-green-500' /></Badge>
              }
            </CardAction>
          </div>
          <CardTitle className='text-3xl font-semibold'>
            <Val val={count} />
          </CardTitle>
        </CardHeader>
        <CardFooter className='text-muted-foreground text-xs'>
          Items waiting for approval
        </CardFooter>
      </Card>
    );
  };
  
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
        <div className='mb-6 flex items-center justify-between space-y-2'>
          <h1 className='text-2xl font-bold tracking-tight'>
            {isAdmin ? 'System Overview' : 'Dashboard'}
          </h1>
        </div>

        {/* ===== SECTION 1: USER METRICS ===== */}
        <h2 className="text-lg font-semibold mb-3 tracking-tight text-muted-foreground">System Users & Access</h2>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8'>
          
          <Card>
            <CardHeader>
              <CardDescription>Total Registered</CardDescription>
              <CardTitle className='text-3xl font-semibold'><Val val={stats?.totalUsers} /></CardTitle>
              <CardAction>
                {getRoleBadge('Users', IconUsers, 'outline')}
              </CardAction>
            </CardHeader>
            <CardFooter className='text-muted-foreground text-xs'>
              Active system accounts
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription>Enrolled Students</CardDescription>
              <CardTitle className='text-3xl font-semibold'><Val val={stats?.activeStudents} /></CardTitle>
              <CardAction>
                {getRoleBadge('Student', IconUsers, 'secondary')}
              </CardAction>
            </CardHeader>
            <CardFooter className='text-muted-foreground text-xs'>
              Learners with active accounts
            </CardFooter>
          </Card>

           <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardDescription>Whitelisted Students</CardDescription>
              <CardTitle className='text-3xl font-semibold'><Val val={stats?.whitelistStudents} /></CardTitle>
              <CardAction>
                <Badge variant='default' className='bg-primary text-primary-foreground'>
                  <IconMailForward className='size-4' /> Pending
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className='text-muted-foreground text-xs'>
              Pre-registered, waiting to sign up
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription>Admins</CardDescription>
              <CardTitle className='text-3xl font-semibold'><Val val={stats?.adminUsers} /></CardTitle>
              <CardAction>
                {getRoleBadge('Admin', IconUsers, 'destructive')}
              </CardAction>
            </CardHeader>
            <CardFooter className='text-muted-foreground text-xs'>
              System administrators
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription>Active Faculty</CardDescription>
              <CardTitle className='text-3xl font-semibold'><Val val={stats?.facultyMembers} /></CardTitle>
              <CardAction>
                {getRoleBadge('Faculty', IconUsers, 'outline')}
              </CardAction>
            </CardHeader>
            <CardFooter className='text-muted-foreground text-xs'>
              Instructors & academic staff
            </CardFooter>
          </Card>

          <Card className="bg-secondary/5 border-secondary/20">
            <CardHeader>
              <CardDescription>Whitelisted Faculty</CardDescription>
              <CardTitle className='text-3xl font-semibold'><Val val={stats?.whitelistFaculty} /></CardTitle>
              <CardAction>
                <Badge variant='secondary'>
                  <IconMailForward className='size-4' /> Pending
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className='text-muted-foreground text-xs'>
              Pre-registered, waiting to sign up
            </CardFooter>
          </Card>

        </div>

        {/* --- */}

        {/* ===== SECTION 2: CONTENT & SYSTEM HEALTH ===== */}
        {isAdmin && (
          <>
            <h2 className="text-lg font-semibold mb-3 tracking-tight text-muted-foreground">Content & Verification Queue</h2>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
              
              <Card>
                <CardHeader>
                  <CardDescription>Total Subjects</CardDescription>
                  <CardTitle className='text-3xl font-semibold'><Val val={stats?.totalSubjects} /></CardTitle>
                  <CardAction><Badge variant='outline'><IconBook className='size-4' /></Badge></CardAction>
                </CardHeader>
                <CardFooter className='text-muted-foreground text-xs'>Core curriculum subjects</CardFooter>
              </Card>

              {getSystemStatusBadge(stats?.pendingModules || 0, IconClipboardCheck, 'Modules Pending')}
              {getSystemStatusBadge(stats?.pendingAssessments || 0, IconFileCertificate, 'Assessments Pending')}
              {getSystemStatusBadge(stats?.pendingQuestions || 0, IconAlertCircle, 'Questions Pending')}
              
            </div>
          </>
        )}

        {/* --- */}

        {/* ===== Charts ===== */}
        <h2 className='text-lg font-semibold mt-8 mb-3 tracking-tight text-muted-foreground'>System Activity</h2>
        <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
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
  { title: 'Content', href: '/modules', isActive: false, disabled: false },
  { title: 'Settings', href: '/settings', isActive: false, disabled: false },
]