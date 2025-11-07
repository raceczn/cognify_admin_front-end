// src/routes/_authenticated/analytics/student.$studentId.tsx
import { createFileRoute, Link } from '@tanstack/react-router'
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
} from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import React from 'react'

// --- 1. FIX: Updated interface to match backend response ---
interface StudentAnalyticsData {
  student_id: string
  summary: {
    total_activities: number
    overall_score: number
    time_spent_sec: number
  }
  // This is an object/dictionary, not an array
  performance_by_bloom: { [key: string]: number }
  prediction: {
    predicted_to_pass?: boolean
    pass_probability?: number
  }
  ai_motivation?: string
  last_updated?: any
}
// --- END FIX ---

// This is the component for the new page
function StudentAnalyticsPage() {
  const { studentId } = Route.useParams()

  const {
    data: analytics,
    isLoading,
    error,
  } = useQuery<StudentAnalyticsData>({
    queryKey: ['studentAnalytics', studentId],
    queryFn: () => getStudentAnalytics(studentId),
  })

  const timeSpent = analytics?.summary.time_spent_sec || 0
  const hours = Math.floor(timeSpent / 3600)
  const minutes = Math.floor((timeSpent % 3600) / 60)

  // --- 2. FIX: Helper to process performance_by_bloom object ---
  const bloomPerformance = React.useMemo(() => {
    if (!analytics?.performance_by_bloom) return []
    // Use Object.entries() to convert the object to an array
    return Object.entries(analytics.performance_by_bloom).map(
      ([level, score]) => ({
        bloom_level: level,
        score: score,
      })
    )
  }, [analytics?.performance_by_bloom])

  const strengths = bloomPerformance
    .filter((p) => p.score >= 80)
    .map((p) => p.bloom_level)
  const weaknesses = bloomPerformance
    .filter((p) => p.score < 70)
    .map((p) => p.bloom_level)
  // --- END FIX ---

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className='space-y-4'>
          {/* Skeletons for summary cards */}
          <div className='grid grid-cols-1 gap-4 md:grid-cols-4'>
            <Skeleton className='h-32' />
            <Skeleton className='h-32' />
            <Skeleton className='h-32' />
            <Skeleton className='h-32' />
          </div>
          {/* Skeleton for tables */}
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

    if (!analytics || analytics.summary.total_activities === 0) {
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
        {/* 1. Summary Cards */}
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
                {analytics.summary.overall_score.toFixed(2)}%
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
                {analytics.summary.total_activities}
              </div>
              <p className='text-xs text-muted-foreground'>
                Total quizzes and modules
              </p>
            </CardContent>
          </Card>
          {/* --- 3. NEW: Add AI Prediction Card --- */}
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
                {analytics.prediction?.pass_probability?.toFixed(2) || '0.00'}%
                Pass Probability
              </p>
            </CardContent>
          </Card>
          {/* --- END NEW --- */}
        </div>

        {/* 2. Strengths & Weaknesses */}
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
                  {/* --- 4. FIX: Use derived strengths --- */}
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
                  {/* --- 5. FIX: Use derived weaknesses --- */}
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

          {/* 3. Performance by Topic (Bloom Level) */}
          <Card>
            <CardHeader>
              {/* --- 6. FIX: Title changed to Bloom --- */}
              <CardTitle>Performance by Bloom's Level</CardTitle>
              <CardDescription>
                Average score per Bloom's category.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Bloom's Level</TableHead>
                    <TableHead className='text-right'>Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* --- 7. FIX: Render from bloomPerformance --- */}
                  {bloomPerformance.length > 0 ? (
                    bloomPerformance.map((item) => (
                      <TableRow key={item.bloom_level}>
                        <TableCell className='font-medium capitalize'>
                          {item.bloom_level}
                        </TableCell>
                        <TableCell className='text-right'>
                          {item.score.toFixed(2)}%
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={2} className='h-24 text-center'>
                        No scores recorded.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
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
      </Main>
    </>
  )
}

export const Route = createFileRoute(
  '/_authenticated/analytics/student/$studentId'
)({
  component: StudentAnalyticsPage,
})