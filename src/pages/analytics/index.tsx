'use client'

import { Users, UserCheck, UserX, Percent, AlertTriangle, LayoutDashboard, GraduationCap, BookOpen } from 'lucide-react'
import { useGlobalPredictions } from '@/lib/analytics-hooks'
import { usePermissions } from '@/hooks/use-permissions'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardDescription,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ConfigDrawer } from '@/components/config-drawer'
import { AppErrorBoundary } from '@/components/error-boundary'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { BloomLevelChart } from './components/bloom-level-chart'
import CoreSubjectsPage from './components/core-subject'
import { PredictionsTable } from './components/predictions-table'
import { StudentStatus } from './components/students-status'

function AnalyticsErrorFallback() {
  return (
    <div className='p-4'>
      <Alert variant='destructive'>
        <AlertTriangle className='h-4 w-4' />
        <AlertTitle>Error Loading Analytics</AlertTitle>
        <AlertDescription>
          There was an error loading the dashboard data.
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

export function Apps() {
  const { isAdmin } = usePermissions()

  const {
    data: predictionData,
    isLoading: isLoadingPredictions,
    error,
  } = useGlobalPredictions()

  const summary = predictionData?.summary

  return (
    <>
      <Header>
        <Search />
        <div className='ms-auto flex items-center gap-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <AppErrorBoundary fallback={<AnalyticsErrorFallback />}>
          <div className='pr-6 pb-10'>
            <div>
              <h1 className='text-2xl font-bold tracking-tight'>
                {isAdmin ? 'System Analytics' : 'Faculty Dashboard'}
              </h1>
              <p className='text-muted-foreground'>
                AI-driven insights on student performance and cognitive development.
              </p>
            </div>
            
            <div className='my-6'>
              {/* TABS IMPLEMENTATION */}
              <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="overview" className="flex items-center gap-2">
                    <LayoutDashboard className="h-4 w-4" />
                    Overview
                  </TabsTrigger>
                  <TabsTrigger value="students" className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4" />
                    Student Predictions
                  </TabsTrigger>
                  <TabsTrigger value="subjects" className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    Subject Analysis
                  </TabsTrigger>
                </TabsList>

                {/* TAB 1: OVERVIEW */}
                <TabsContent value="overview" className="space-y-4">
                  {isLoadingPredictions ? (
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
                      <Skeleton className='h-32' /><Skeleton className='h-32' />
                      <Skeleton className='h-32' /><Skeleton className='h-32' />
                    </div>
                  ) : summary ? (
                    <>
                      {/* Summary Cards */}
                      <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
                        <Card>
                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-center">
                                <CardDescription>Total Students</CardDescription>
                                <Users className='text-muted-foreground size-4' />
                            </div>
                            <CardTitle className='text-3xl font-semibold'>
                              {summary.total_students_predicted}
                            </CardTitle>
                          </CardHeader>
                          <CardFooter className='text-muted-foreground text-xs pt-0'>
                            Active in current semester
                          </CardFooter>
                        </Card>
                        <Card>
                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-center">
                                <CardDescription>Predicted Passing</CardDescription>
                                <Percent className='text-muted-foreground size-4' />
                            </div>
                            <CardTitle className='text-3xl font-semibold'>
                              {(summary.predicted_pass_rate || 0).toFixed(1)}%
                            </CardTitle>
                          </CardHeader>
                          <CardFooter className='text-muted-foreground text-xs pt-0'>
                            Based on current trajectory
                          </CardFooter>
                        </Card>
                        <Card>
                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-center">
                                <CardDescription>Low Risk</CardDescription>
                                <UserCheck className='text-green-500 size-4' />
                            </div>
                            <CardTitle className='text-3xl font-semibold'>
                              {summary.count_predicted_to_pass}
                            </CardTitle>
                          </CardHeader>
                          <CardFooter className='text-muted-foreground text-xs pt-0'>
                            Students on track
                          </CardFooter>
                        </Card>
                        <Card>
                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-center">
                                <CardDescription>At Risk</CardDescription>
                                <UserX className='text-red-500 size-4' />
                            </div>
                            <CardTitle className='text-3xl font-semibold'>
                              {summary.count_predicted_to_fail}
                            </CardTitle>
                          </CardHeader>
                          <CardFooter className='text-muted-foreground text-xs pt-0'>
                            Need intervention
                          </CardFooter>
                        </Card>
                      </div>

                      {/* Charts Grid */}
                      <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
                        <StudentStatus summary={summary} />
                        <BloomLevelChart data={predictionData?.performance_by_bloom} />
                      </div>
                    </>
                  ) : (
                    <Card>
                      <CardContent className='pt-6 h-40 flex items-center justify-center'>
                        <p className='text-muted-foreground'>No analytics data available.</p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                {/* TAB 2: STUDENTS */}
                <TabsContent value="students">
                  <PredictionsTable
                    data={predictionData}
                    isLoading={isLoadingPredictions}
                    error={error as Error | null}
                  />
                </TabsContent>

                {/* TAB 3: SUBJECTS */}
                <TabsContent value="subjects">
                  <CoreSubjectsPage data={predictionData?.subjects} />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </AppErrorBoundary>
      </Main>
    </>
  )
}