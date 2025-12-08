import { createFileRoute, Link, getRouteApi } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { getStudentAnalytics } from '@/lib/analytics-hooks'
import { getAllSubjects } from '@/lib/subjects-hooks'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  ArrowLeft,
  BarChart,
  Brain,
  Target,
  BookOpen,
  AlertTriangle,
  Lightbulb,
  Clock,
  Activity,
  Zap
} from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { AppErrorBoundary } from '@/components/error-boundary'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { StudentBloomChart } from '@/pages/analytics/components/student-bloom-chart'

const routeApi = getRouteApi('/_authenticated/analytics/student/$studentId')

function StudentAnalyticsErrorFallback() {
  return (
    <div className='p-4'>
      <Alert variant='destructive'>
        <AlertTriangle className='h-4 w-4' />
        <AlertTitle>Error Loading Student Report</AlertTitle>
        <AlertDescription>
          We couldn't load the data. The student ID might be invalid or the server is busy.
          <br />
          <Button
            variant='destructive'
            className='mt-4'
            onClick={() => window.location.reload()}
          >
            Retry
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
  } = useQuery({
    queryKey: ['studentAnalytics', studentId],
    queryFn: () => getStudentAnalytics(studentId),
    retry: 1
  })

  const { data: subjectsData } = useQuery({
    queryKey: ['subjects'],
    queryFn: getAllSubjects
  })

  // Helper for status colors
  const getStatusColor = (status: string) => {
    switch(status?.toLowerCase()) {
      case 'mastery': return 'bg-green-100 text-green-700 border-green-200';
      case 'proficient': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'developing': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'critical': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-secondary text-secondary-foreground';
    }
  }

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className='space-y-4'>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-4'>
            {[...Array(4)].map((_, i) => <Skeleton key={i} className='h-32' />)}
          </div>
          <Skeleton className='h-64' />
        </div>
      )
    }

    if (error || !analytics) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-center">
           <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
           <h3 className="text-lg font-semibold">Student Not Found</h3>
           <p className="text-muted-foreground">Unable to retrieve data for ID: {studentId}</p>
        </div>
      )
    }

    const { overall_performance, subject_performance, weaknesses, behavioral_traits, performance_by_bloom } = analytics
    const isPassing = overall_performance.passing_probability >= 75
    const hasBloomData = !!performance_by_bloom && Object.keys(performance_by_bloom).length > 0
    const hasWeaknessData = Array.isArray(weaknesses) && weaknesses.length > 0
    const subjectItems = subjectsData?.items ?? []

    return (
      <div className='space-y-6'>
        
        {/* TABS IMPLEMENTATION */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="academics">Academics</TabsTrigger>
            <TabsTrigger value="cognitive">Cognitive Profile</TabsTrigger>
          </TabsList>

          {/* 1. OVERVIEW TAB */}
          <TabsContent value="overview" className="space-y-6 mt-4">
            {/* Key Metrics */}
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
                <Card>
                    <CardHeader className='flex-row items-center justify-between space-y-0 pb-2'>
                    <CardTitle className='text-sm font-medium'>Current Average</CardTitle>
                    <Target className='h-4 w-4 text-muted-foreground' />
                    </CardHeader>
                    <CardContent>
                    <div className='text-2xl font-bold'>
                        {overall_performance.average_score.toFixed(1)}%
                    </div>
                    {/* <p className='text-xs text-muted-foreground'>
                        Based on {overall_performance.total_assessments} assessments
                    </p> */}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className='flex-row items-center justify-between space-y-0 pb-2'>
                    <CardTitle className='text-sm font-medium'>Success Probability</CardTitle>
                    <BarChart className='h-4 w-4 text-muted-foreground' />
                    </CardHeader>
                    <CardContent>
                    <div className={`text-2xl font-bold ${isPassing ? 'text-green-600' : 'text-orange-600'}`}>
                        {overall_performance.passing_probability.toFixed(0)}%
                    </div>
                    <Badge variant={isPassing ? 'default' : 'destructive'} className="mt-1">
                        {overall_performance.risk_level}
                    </Badge>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className='flex-row items-center justify-between space-y-0 pb-2'>
                    <CardTitle className='text-sm font-medium'>Avg. Session</CardTitle>
                    <Clock className='h-4 w-4 text-muted-foreground' />
                    </CardHeader>
                    <CardContent>
                    <div className='text-2xl font-bold'>
                        {Math.round(behavioral_traits?.average_session_length || 0)} min
                    </div>
                    <p className='text-xs text-muted-foreground capitalize'>
                        {behavioral_traits?.interruption_frequency || 'Low'} interruptions
                    </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className='flex-row items-center justify-between space-y-0 pb-2'>
                    <CardTitle className='text-sm font-medium'>Learning Pace</CardTitle>
                    <Activity className='h-4 w-4 text-muted-foreground' />
                    </CardHeader>
                    <CardContent>
                    <div className='text-2xl font-bold capitalize'>
                        {behavioral_traits?.learning_pace || 'Standard'}
                    </div>
                    <p className='text-xs text-muted-foreground'>
                        Timeliness: {behavioral_traits?.timeliness_score || 0}/100
                    </p>
                    </CardContent>
                </Card>
            </div>

            {/* AI Insight */}
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-primary/20">
                <CardContent className="p-4 flex items-start gap-4">
                    <div className="bg-white dark:bg-background p-2 rounded-full shadow-sm mt-1">
                        <Brain className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-primary">AI Learning Recommendation</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                            "{overall_performance.recommendation}"
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Habits / Behavior */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Zap className="h-4 w-4 text-yellow-500" />
                        Detailed Behavioral Profile
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex justify-between items-center border-b pb-2">
                            <span className="text-sm text-muted-foreground">Preferred Study Time</span>
                            <Badge variant="secondary">{behavioral_traits?.preferred_study_time}</Badge>
                        </div>
                        <div className="flex justify-between items-center border-b pb-2">
                            <span className="text-sm text-muted-foreground">Personal Readiness Level</span>
                            <span className="text-sm font-medium">{behavioral_traits?.personal_readiness || 'N/A'}</span>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <span className="text-sm text-muted-foreground">Confident Subjects</span>
                        <div className="flex flex-wrap gap-1">
                            {behavioral_traits?.confident_subjects?.length > 0 ? (
                                behavioral_traits.confident_subjects.map((s, i) => (
                                    <Badge key={i} variant="outline" className="text-xs">{s}</Badge>
                                ))
                            ) : (
                                <span className="text-xs italic text-muted-foreground">No confident subjects listed.</span>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
          </TabsContent>

          {/* 2. ACADEMICS TAB */}
          <TabsContent value="academics" className="mt-4">
            <Card>
                <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                    <BookOpen className='h-5 w-5 text-blue-500' />
                    Subject Progress & Performance
                </CardTitle>
                <CardDescription>
                    Detailed breakdown of module completion vs assessment scores.
                </CardDescription>
                </CardHeader>
                <CardContent className='space-y-6'>
                {(subjectItems.length) > 0 ? (
                  subjectItems.map((s) => {
                    const perf = subject_performance?.find((p) => p.subject_id === s.id)
                    const avg = perf?.average_score ?? 0
                    const assessments = perf?.assessments_taken ?? 0
                    // const modulesComp = perf?.modules_completeness ?? 0
                    // const overallComp = perf?.overall_completeness ?? 0
                    const needsReview = perf?.status === 'Needs Review'
                    return (
                      <div key={s.id} className="space-y-3 p-4 border rounded-lg bg-card/50">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <span className="font-semibold text-base">{s.title}</span>
                            <div className="flex gap-2 mt-1">
                              <Badge variant="outline" className="text-xs font-normal">
                                {assessments} Assessments
                              </Badge>
                              {needsReview && (
                                <Badge variant="destructive" className="text-xs">Needs Review</Badge>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-sm text-muted-foreground">Performance</span>
                            <div className={`text-xl font-bold ${avg < 75 ? 'text-red-500' : 'text-green-600'}`}>
                              {avg}%
                            </div>
                          </div>
                        </div>
                        {/* <div className="space-y-2">
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Module Completion</span>
                            <span>{modulesComp}%</span>
                          </div>
                          <Progress value={modulesComp} className="h-1.5 bg-secondary" />
                          <div className="flex justify-between text-xs text-muted-foreground mt-2">
                            <span>Overall Subject Completeness</span>
                            <span>{overallComp}%</span>
                          </div>
                          <Progress value={overallComp} className="h-1.5 bg-secondary" />
                        </div> */}
                      </div>
                    )
                  })
                ) : (
                  subject_performance?.length > 0 ? (
                    subject_performance.map((subject) => (
                      <div key={subject.subject_id} className="space-y-3 p-4 border rounded-lg bg-card/50">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <span className="font-semibold text-base">{subject.subject_title}</span>
                            <div className="flex gap-2 mt-1">
                              <Badge variant="outline" className="text-xs font-normal">
                                {subject.assessments_taken} Assessments
                              </Badge>
                              {subject.status === 'Needs Review' && (
                                <Badge variant="destructive" className="text-xs">Needs Review</Badge>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-sm text-muted-foreground">Performance</span>
                            <div className={`text-xl font-bold ${subject.average_score < 75 ? 'text-red-500' : 'text-green-600'}`}>
                              {subject.average_score}%
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Module Completion</span>
                            <span>{subject.modules_completeness}%</span>
                          </div>
                          <Progress value={subject.modules_completeness} className="h-1.5 bg-secondary" />
                          <div className="flex justify-between text-xs text-muted-foreground mt-2">
                            <span>Overall Subject Completeness</span>
                            <span>{subject.overall_completeness}%</span>
                          </div>
                          <Progress value={subject.overall_completeness} className="h-1.5 bg-secondary" />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">No subjects available.</div>
                  )
                )}
                </CardContent>
            </Card>
          </TabsContent>

          {/* 3. COGNITIVE PROFILE TAB */}
          <TabsContent value="cognitive" className="mt-4">
            {(!hasBloomData && !hasWeaknessData) ? (
              <div className="text-center py-12 text-muted-foreground">No data available.</div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="lg:col-span-1">
                  {hasBloomData ? (
                    <StudentBloomChart data={performance_by_bloom} />
                  ) : (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Cognitive Profile</CardTitle>
                        <CardDescription>No data available</CardDescription>
                      </CardHeader>
                    </Card>
                  )}
                </div>

                <Card className="lg:col-span-1">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Lightbulb className="h-4 w-4 text-orange-500" />
                      Focus Areas (Weakest Competencies)
                    </CardTitle>
                    <CardDescription>Targeted areas for improvement</CardDescription>
                  </CardHeader>
                  <CardContent className='space-y-0'>
                    {hasWeaknessData ? (
                      <div className="space-y-4">
                        {weaknesses.map((w, idx) => (
                          <div key={idx} className="flex flex-col gap-1 border-b pb-3 last:border-0 last:pb-0">
                            <div className="flex justify-between items-start">
                              <span className="font-medium text-sm max-w-[70%] leading-tight">{w.competency_name}</span>
                              <Badge variant="outline" className={`${getStatusColor(w.status)} text-[10px]`}>{w.status}</Badge>
                            </div>
                            <span className="text-xs text-muted-foreground">{w.mastery}% Mastery • {w.attempts} Attempts</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-32 text-center space-y-2">
                        <p className="text-xs text-muted-foreground">No data available</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
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
             <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl uppercase">
                    {analytics?.student_profile?.name?.charAt(0) || 'S'}
                </div>
                <div>
                    <h2 className='text-2xl font-bold tracking-tight'>
                    {analytics?.student_profile?.name || 'Loading Profile...'}
                    </h2>
                    <p className='text-muted-foreground text-sm'>
                    {analytics?.student_profile?.email || 'Student ID: ' + studentId}
                    </p>
                </div>
             </div>
          </div>
          <Separator className="mb-6" />
          <ScrollArea className='h-[calc(100vh-14rem)]'>
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
