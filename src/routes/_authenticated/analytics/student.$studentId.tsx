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
  Clock,
  Target,
  Check,
  X,
  AlertTriangle,
} from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import React from 'react'
import { AppErrorBoundary } from '@/components/error-boundary'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { StudentBloomChart } from '@/pages/analytics/components/student-bloom-chart'

const routeApi = getRouteApi('/_authenticated/analytics/student/$studentId')

interface StudentAnalyticsData {
  student_id: string
  summary: {
    total_activities: number
    overall_score: number
    time_spent_sec: number
  }
  performance_by_bloom: { [key: string]: number }
  prediction: {
    predicted_to_pass?: boolean
    pass_probability?: number
  }
  ai_motivation?: string
  last_updated?: any
}

function StudentAnalyticsErrorFallback() {
  return (
    <div className='p-4'>
      <Alert variant='destructive'>
        <AlertTriangle className='h-4 w-4' />
        <AlertTitle>Error Loading Student Report</AlertTitle>
        <AlertDescription>
          There was an error loading this student's analytics. The data
          might be incomplete or a system error occurred.
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

  // Safe access for time calculation
  const timeSpent = analytics?.summary?.time_spent_sec || 0
  const hours = Math.floor(timeSpent / 3600)
  const minutes = Math.floor((timeSpent % 3600) / 60)

  const bloomPerformance = React.useMemo(() => {
    if (!analytics?.performance_by_bloom) return []
    return Object.entries(analytics.performance_by_bloom)
      .map(([level, score]) => ({
        bloom_level: level,
        score: score,
      }))
      .sort((a, b) => a.bloom_level.localeCompare(b.bloom_level))
  }, [analytics?.performance_by_bloom])

  const strengths = bloomPerformance
    .filter((p) => p.score >= 80)
    .map((p) => p.bloom_level)
  const weaknesses = bloomPerformance
    .filter((p) => p.score < 70)
    .map((p) => p.bloom_level)

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className='space-y-4'>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-4'>
            <Skeleton className='h-32' />
            <Skeleton className='h-32' />
            <Skeleton className='h-32' />
            <Skeleton className='h-32' />
          </div>
          <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
            <Skeleton className='h-64' />
            <Skeleton className='h-64' />
          </div>
        </div>
      )
    }

    if (error) {
      return (
        <Card className='flex min-h-64 items-center justify-center'>
          <p className='text-destructive'>
            No data analytics found for this student.
          </p>
        </Card>
      )
    }

    // Check for minimal required data structure
    if (!analytics || !analytics.summary) {
      return (
        <Card className='flex min-h-64 items-center justify-center'>
          <p className='text-muted-foreground'>
            No analytics recorded for this student yet.
          </p>
        </Card>
      )
    }

    return (
      <div className='space-y-4'>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
          <Card>
            <CardHeader className='flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Overall Score
              </CardTitle>
              <Target className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {/* FIX: Safe access and fallback before calling toFixed */}
                {(analytics.summary.overall_score ?? 0).toFixed(2)}%
              </div>
              <p className='text-xs text-muted-foreground'>
                Average of all activities
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Time Spent (HH:MM)
              </CardTitle>
              <Clock className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {String(hours).padStart(2, '0')}:
                {String(minutes).padStart(2, '0')}
              </div>
              <p className='text-xs text-muted-foreground'>
                Total duration in modules
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Activities Logged
              </CardTitle>
              <BarChart className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {analytics.summary.total_activities ?? 0}
              </div>
              <p className='text-xs text-muted-foreground'>
                Total quizzes and modules
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                AI Prediction
              </CardTitle>
              {analytics.prediction?.predicted_to_pass ? (
                <Check className='h-4 w-4 text-green-500' />
              ) : (
                <X className='h-4 w-4 text-red-500' />
              )}
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${
                  analytics.prediction?.predicted_to_pass
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}
              >
                {analytics.prediction?.predicted_to_pass ? 'Pass' : 'At-Risk'}
              </div>
              <p className='text-xs text-muted-foreground'>
                {/* FIX: Safe access and fallback for probability */}
                {(analytics.prediction?.pass_probability ?? 0).toFixed(2)}%
                Pass Probability
              </p>
            </CardContent>
          </Card>
        </div>

        <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Brain className='h-5 w-5' />
                Strengths & Weaknesses
              </CardTitle>
              <CardDescription>
                Based on Bloom's Taxonomy performance
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div>
                <h4 className='font-semibold'>Strengths (Score {'>='} 80%)</h4>
                <Separator className='my-2' />
                <div className='flex flex-wrap gap-2'>
                  {strengths.length > 0 ? (
                    strengths.map((strength) => (
                      <Badge
                        key={strength}
                        variant='success'
                        className='capitalize'
                      >
                        {strength}
                      </Badge>
                    ))
                  ) : (
                    <p className='text-sm text-muted-foreground'>
                      No significant strengths identified yet.
                    </p>
                  )}
                </div>
              </div>
              <div>
                <h4 className='font-semibold'>Weaknesses (Score {'<'} 70%)</h4>
                <Separator className='my-2' />
                <div className='flex flex-wrap gap-2'>
                  {weaknesses.length > 0 ? (
                    weaknesses.map((weakness) => (
                      <Badge
                        key={weakness}
                        variant='destructive'
                        className='capitalize'
                      >
                        {weakness}
                      </Badge>
                    ))
                  ) : (
                    <p className='text-sm text-muted-foreground'>
                      No significant weaknesses identified.
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <StudentBloomChart data={analytics.performance_by_bloom} />
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
            Student Analytics Report
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
          <div className='mb-4'>
            <h2 className='text-xl font-bold tracking-tight'>
              Student ID: {studentId}
            </h2>
            <p className='text-muted-foreground'>
              Detailed performance and progress report.
            </p>
          </div>
          <Separator className='my-4' />
          <ScrollArea className='h-[calc(100vh-14rem)]'>
            <div className='pr-4'>{renderContent()}</div>
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