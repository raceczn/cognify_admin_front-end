import { createFileRoute, Link, getRouteApi } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { getStudentAnalytics } from '@/lib/analytics-hooks'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  ArrowLeft,
  BarChart,
  Brain,
  Target,
  Check,
  BookOpen, // New Icon
  AlertTriangle,
} from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { AppErrorBoundary } from '@/components/error-boundary'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

const routeApi = getRouteApi('/_authenticated/analytics/student/$studentId')

// Updated Interface
interface StudentAnalyticsData {
  student_profile: {
    name: string
    email: string
    id: string
  }
  overall_performance: {
    average_score: number
    total_assessments: number
    passing_probability: number
    risk_level: string
    recommendation: string
  }
  subject_performance: Array<{
    subject_id: string
    subject_title: string
    average_score: number
    assessments_taken: number
    status: string
  }>
  weaknesses: Array<{
    competency_id: string
    mastery: number
    attempts: number
  }>
  // Keep legacy fields optional if needed for compatibility
  summary?: any 
  performance_by_bloom?: any
}

function StudentAnalyticsErrorFallback() {
  return (
    <div className='p-4'>
      <Alert variant='destructive'>
        <AlertTriangle className='h-4 w-4' />
        <AlertTitle>Error Loading Student Report</AlertTitle>
        <AlertDescription>
          There was an error loading this student's analytics.
          <br />
          <Button
            variant='destructive'
            className='mt-4'
            onClick={() => window.location.reload()}
          >
            Refresh Page
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  )
}

function StudentAnalyticsPage() {
  const { studentId } = routeApi.useParams()

  const {
    data: analytics,
    isLoading,
    error,
  } = useQuery<StudentAnalyticsData>({
    queryKey: ['studentAnalytics', studentId],
    queryFn: () => getStudentAnalytics(studentId),
  })

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className='space-y-4'>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-4'>
            <Skeleton className='h-32' /><Skeleton className='h-32' />
            <Skeleton className='h-32' /><Skeleton className='h-32' />
          </div>
          <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
            <Skeleton className='h-64' /><Skeleton className='h-64' />
          </div>
        </div>
      )
    }

    if (error || !analytics) {
      return (
        <Card className='flex min-h-64 items-center justify-center'>
          <p className='text-destructive'>No data found for this student.</p>
        </Card>
      )
    }

    const { overall_performance, subject_performance } = analytics
    const isPassing = overall_performance.passing_probability >= 75

    return (
      <div className='space-y-6'>
        {/* 1. Summary Cards */}
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
          <Card>
            <CardHeader className='flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Overall Average</CardTitle>
              <Target className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {overall_performance.average_score.toFixed(1)}%
              </div>
              <p className='text-xs text-muted-foreground'>
                Across {overall_performance.total_assessments} assessments
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Passing Probability</CardTitle>
              <BarChart className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${isPassing ? 'text-green-600' : 'text-orange-600'}`}>
                {overall_performance.passing_probability.toFixed(1)}%
              </div>
              <p className='text-xs text-muted-foreground'>
                Risk Level: {overall_performance.risk_level}
              </p>
            </CardContent>
          </Card>

          <Card className="col-span-2 bg-muted/20">
             <CardHeader className='flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>AI Recommendation</CardTitle>
              <Brain className='h-4 w-4 text-primary' />
            </CardHeader>
            <CardContent>
              <p className='text-sm font-medium'>
                "{overall_performance.recommendation}"
              </p>
            </CardContent>
          </Card>
        </div>

        <div className='grid grid-cols-1 gap-4 lg:grid-cols-3'>
          {/* 2. Subject Performance (The Requested Feature) */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <BookOpen className='h-5 w-5' />
                Subject Performance
              </CardTitle>
              <CardDescription>
                Breakdown of performance by core subjects.
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-6'>
              {subject_performance && subject_performance.length > 0 ? (
                subject_performance.map((subject) => (
                  <div key={subject.subject_id} className="space-y-2">
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                            <span className="font-semibold">{subject.subject_title}</span>
                            <span className="text-xs text-muted-foreground">{subject.assessments_taken} assessments taken</span>
                        </div>
                        <div className="text-right">
                            <span className="font-bold">{subject.average_score}%</span>
                            {subject.average_score < 75 && (
                                <Badge variant="destructive" className="ml-2 text-[10px] h-5">Review Needed</Badge>
                            )}
                        </div>
                    </div>
                    {/* Progress Bar with dynamic color */}
                    <div className={`w-full h-2 rounded ${subject.average_score >= 75 ? 'bg-green-100' : 'bg-red-100'}`}>
                      <div
                        className={subject.average_score >= 75 ? 'h-2 rounded bg-green-500' : 'h-2 rounded bg-red-500'}
                        style={{ width: `${subject.average_score}%` }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                    No subject data available yet.
                </div>
              )}
            </CardContent>
          </Card>

          {/* 3. Strengths & Weaknesses (Competencies) */}
          <Card>
            <CardHeader>
              <CardTitle>Focus Areas</CardTitle>
              <CardDescription>Specific competencies to improve</CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
               {analytics.weaknesses && analytics.weaknesses.length > 0 ? (
                   <div className="space-y-3">
                       {analytics.weaknesses.map((w, idx) => (
                           <div key={idx} className="flex items-center justify-between border-b pb-2 last:border-0">
                               <div className="text-sm">
                                   <span className="font-medium text-muted-foreground">Competency ID:</span>
                                   <br/>
                                   <span className="font-mono text-xs">{w.competency_id.split('-').pop()}</span>
                               </div>
                               <Badge variant="outline" className="text-red-500 border-red-200 bg-red-50">
                                   {w.mastery}% Mastery
                               </Badge>
                           </div>
                       ))}
                   </div>
               ) : (
                   <div className="flex flex-col items-center justify-center h-40 text-center space-y-2">
                       <Check className="h-8 w-8 text-green-500" />
                       <p className="text-sm text-muted-foreground">No critical weaknesses found!</p>
                   </div>
               )}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <>
      <Header>
        <div className='flex items-center gap-2'>
          <Button asChild variant='ghost' size='icon'>
            <Link to='/analytics'>
              <ArrowLeft className='h-4 w-4' />
            </Link>
          </Button>
          <h1 className='text-lg font-bold tracking-tight'>
            Student Report
          </h1>
        </div>
        <div className='ms-auto flex items-center gap-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <AppErrorBoundary fallback={<StudentAnalyticsErrorFallback />}>
          <div className='mb-6'>
            <h2 className='text-2xl font-bold tracking-tight flex items-center gap-2'>
               {/* Display Name if available, else ID */}
               {analytics?.student_profile?.name || `Student ${studentId}`}
            </h2>
            <p className='text-muted-foreground'>
              {analytics?.student_profile?.email}
            </p>
          </div>
          
          <ScrollArea className='h-[calc(100vh-12rem)]'>
            <div className='pr-4 pb-10'>{renderContent()}</div>
          </ScrollArea>
        </AppErrorBoundary>
      </Main>
    </>
  )
}

export const Route = createFileRoute(
  '/_authenticated/analytics/student/$studentId'
)({
  component: StudentAnalyticsPage,
})