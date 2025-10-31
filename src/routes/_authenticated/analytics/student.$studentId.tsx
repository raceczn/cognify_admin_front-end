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
import { ArrowLeft, BarChart, Brain, Clock, Target } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'

// Define the types for the student analytics data
interface PerformanceTopic {
  topic: string
  score: number
}
interface PerformanceBloom {
  bloom_level: string
  score: number
}
interface StudentAnalyticsData {
  summary: {
    total_activities: number
    overall_score: number
    time_spent_sec: number
  }
  strengths: string[]
  weaknesses: string[]
  performance_by_bloom: PerformanceBloom[]
  performance_by_topic: PerformanceTopic[]
}

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

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className='space-y-4'>
          {/* Skeletons for summary cards */}
          <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
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
            {/* Error loading analytics: {(error as Error).message} */}
          </p>
        </Card>
      )
    }

    if (!analytics || analytics.summary.total_activities === 0) {
      return (
        <Card className='flex min-h-64 items-center justify-center'>
          <p className='text-muted-foreground'>
            No analytics found for this student.
          </p>
        </Card>
      )
    }

    return (
      <div className='space-y-4'>
        {/* 1. Summary Cards */}
        <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
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
                  {analytics.strengths.length > 0 ? (
                    analytics.strengths.map((strength) => (
                      <Badge key={strength} variant='success'>
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
                  {analytics.weaknesses.length > 0 ? (
                    analytics.weaknesses.map((weakness) => (
                      <Badge key={weakness} variant='destructive'>
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

          {/* 3. Performance by Topic */}
          <Card>
            <CardHeader>
              <CardTitle>Performance by Topic</CardTitle>
              <CardDescription>
                Average score per quiz topic.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Topic</TableHead>
                    <TableHead className='text-right'>Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analytics.performance_by_topic.length > 0 ? (
                    analytics.performance_by_topic.map((topic) => (
                      <TableRow key={topic.topic}>
                        <TableCell className='font-medium'>
                          {topic.topic}
                        </TableCell>
                        <TableCell className='text-right'>
                          {topic.score.toFixed(2)}%
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={2}
                        className='h-24 text-center'
                      >
                        No topic scores recorded.
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
        {/* Use a ScrollArea for just the content part */}
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

